import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The colour contract.
 *
 * A colour a merchant cannot pick is a colour they type. The dashboard renders
 * a field as a colour input only when it is declared `type: "string"` with
 * `format: "color"` (docs: `/guide/twilight-json`, "the `format` picks the
 * input"). Declare the same value as `format: "text"` and nothing fails: the
 * editor silently falls back to a text box that accepts `red`, `#fff` or a
 * typo, and the block receives whatever was typed.
 *
 * That is invisible in review, so this test pins the whole set: every field
 * whose job is a colour declares the colour format, carries a hex default the
 * picker can open on, and tells the merchant what it colours. A new colour
 * field added as text fails here instead of in the dashboard.
 *
 * The manifest is the source of truth for the merchant screen; the components
 * read the values. This test reads the file, not the components, on purpose.
 */

const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(readFileSync(path.join(root, 'twilight.json'), 'utf8'));

interface RawField {
  id?: string;
  type?: string;
  format?: string;
  value?: unknown;
  selected?: unknown;
  description?: string | null;
  fields?: RawField[];
}

interface Entry {
  field: RawField;
  owner: string;
  /** A field nested in a collection: its default is a row cell, not a setting. */
  nested: boolean;
}

const entries: Entry[] = [];

function walk(fields: RawField[], owner: string, nested = false) {
  for (const field of fields) {
    entries.push({ field, owner, nested });
    if (Array.isArray(field.fields)) walk(field.fields, owner, true);
  }
}

for (const setting of manifest.settings ?? []) walk([setting], 'settings');
for (const component of manifest.components ?? []) {
  walk(component.fields ?? [], component.path ?? component.key ?? 'component');
}

const isStatic = (f: RawField) => f.type === 'static';
const isColor = (f: RawField) => f.format === 'color';
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function defaultValue(f: RawField): unknown {
  return f.value !== undefined ? f.value : f.selected;
}

/** A default a colour input can open on: hex, or nothing yet (a row cell). */
function hasUsableDefault(f: RawField, nested: boolean): boolean {
  const value = defaultValue(f);
  if (typeof value === 'string' && HEX.test(value)) return true;
  return nested && (value === undefined || value === null || value === '');
}

describe('colour fields in twilight.json', () => {
  const colours = entries.filter(({ field }) => isColor(field));

  it('finds the colour fields (guards against the format being stripped)', () => {
    expect(colours.length).toBeGreaterThanOrEqual(40);
  });

  it('declares every colour as type "string" + format "color"', () => {
    const wrong = colours
      .filter(({ field }) => field.type !== 'string')
      .map(({ field }) => `${field.id} is ${field.type}/${field.format}`);
    expect(wrong).toEqual([]);
  });

  it('gives every colour field a default the picker can open on', () => {
    const bad = colours
      .filter(({ field, nested }) => !hasUsableDefault(field, nested))
      .map(({ field }) => `${field.id}: ${JSON.stringify(defaultValue(field))}`);
    expect(bad).toEqual([]);
  });

  it('never hides a hex value behind a non-colour format', () => {
    const hidden = entries
      .filter(({ field }) => !isStatic(field) && !isColor(field))
      .filter(({ field }) => {
        const value = defaultValue(field);
        return typeof value === 'string' && HEX.test(value);
      })
      .map(({ field }) => `${field.id} (${field.type}/${field.format}) = ${String(defaultValue(field))}`);
    expect(hidden).toEqual([]);
  });

  it('tells the merchant what each colour paints', () => {
    const silent = colours
      .filter(({ field }) => typeof field.description !== 'string' || !field.description.trim())
      .map(({ field }) => String(field.id));
    expect(silent).toEqual([]);
  });
});
