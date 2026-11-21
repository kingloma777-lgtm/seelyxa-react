import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  collectColors,
  emptyState,
  normalizeHex,
  parseHexInput,
  toState,
  type PreviewState,
  type RawManifest,
} from '../../app/lib/devColorFields';

/**
 * The dev colour panel's logic layer.
 *
 * The panel exists because the engine's editor has no `color` field kind, so
 * every colour in `twilight.json` is drawn there as a text box. These tests pin
 * the three things the panel cannot get wrong: which fields count as colours,
 * which key a colour lives under (rows arrive in two shapes), and that applying
 * a colour returns a new state instead of mutating the old one — the save sends
 * the whole state, so a shared reference would silently drop edits.
 */

const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(readFileSync(path.join(root, 'twilight.json'), 'utf8')) as RawManifest;

describe('normalizeHex', () => {
  it('accepts the three hex shapes and normalises them to #rrggbb', () => {
    expect(normalizeHex('#AABBCC')).toBe('#aabbcc');
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(normalizeHex('  #FFF  ')).toBe('#ffffff');
  });

  it('drops the alpha channel because a native picker only takes seven characters', () => {
    expect(normalizeHex('#11223344')).toBe('#112233');
  });

  it('refuses anything a picker cannot open on', () => {
    for (const value of ['', 'red', '#12', '#12345', 'rgb(1,2,3)', null, undefined, 42, {}]) {
      expect(normalizeHex(value)).toBe('');
    }
  });
});

describe('parseHexInput', () => {
  it('accepts typed hex with or without the hash', () => {
    expect(parseHexInput('abc')).toBe('#aabbcc');
    expect(parseHexInput('#ABC')).toBe('#aabbcc');
    expect(parseHexInput('AABBCC')).toBe('#aabbcc');
    expect(parseHexInput(' #a1b2c3 ')).toBe('#a1b2c3');
  });

  it('rejects partial or non-hex input instead of guessing', () => {
    for (const value of ['', '#', 'ab', 'abcd', '#1234567', 'gggggg', 'red']) {
      expect(parseHexInput(value)).toBeNull();
    }
  });
});

describe('collectColors', () => {
  const fixture: RawManifest = {
    settings: [
      {
        id: 'brand_color',
        type: 'string',
        format: 'color',
        value: '#123456',
        label: 'لون العلامة',
        description: 'اللون الأساسي',
      },
      { id: 'headline', type: 'string', format: 'text', value: 'x', label: 'عنوان' },
      { id: 'hidden', type: 'static', label: 'قسم' },
    ],
    components: [
      {
        path: 'home.card',
        title: { ar: 'كارت' },
        fields: [
          { id: 'frame_color', type: 'string', format: 'color', value: '#ffffff', label: 'الإطار' },
          { id: 'label', type: 'string', format: 'text', value: 'a', label: 'نص' },
          {
            id: 'items',
            type: 'collection',
            value: [
              { 'items.accent': '#111111' },
              { 'items.accent': '#222222' },
            ],
            fields: [
              { id: 'items.accent', type: 'string', format: 'color', value: '#000000', label: 'لمسة' },
              { id: 'items.text', type: 'string', format: 'text', value: '', label: 'نص' },
            ],
          },
        ],
      },
    ],
  };

  const withLayout = (layout: PreviewState['layout']): PreviewState => ({
    ...emptyState(),
    layout,
  });

  it('takes only `string` + `color` fields, and only from blocks that exist', () => {
    const groups = collectColors(fixture, withLayout([{ id: 'b1', path: 'card', fields: {} }]));
    const ids = groups.flatMap((group) => group.entries.map((entry) => entry.id));

    expect(ids).toContain('brand_color');
    expect(ids).toContain('frame_color');
    expect(ids).toContain('items.accent');
    expect(ids).not.toContain('headline');
    expect(ids).not.toContain('hidden');
    expect(ids).not.toContain('items.text');

    // No block in the layout → no block group, so no block colours either.
    const themeOnly = collectColors(fixture, withLayout(null));
    expect(themeOnly).toHaveLength(1);
    expect(themeOnly[0].title).toBeNull();
    expect(themeOnly[0].entries.map((entry) => entry.id)).toEqual(['brand_color']);
  });

  it('reads a colour from its own key and from the prefixed row shape', () => {
    const groups = collectColors(
      fixture,
      withLayout([
        {
          id: 'b1',
          path: 'card',
          fields: {
            frame_color: '#abcdef',
            // The store API shape: the manifest's `<collection>.` prefix is kept.
            items: [{ 'items.accent': '#00ff00' }, { accent: '#0000ff' }],
          },
        },
      ])
    );
    const byKey = new Map(groups.flatMap((g) => g.entries).map((entry) => [entry.key, entry]));

    expect(byKey.get('block:0:frame_color')?.value).toBe('#abcdef');
    expect(byKey.get('block:0:items:0:accent')?.value).toBe('#00ff00');
    expect(byKey.get('block:0:items:1:accent')?.value).toBe('#0000ff');
  });

  it('falls back to the manifest default when the preview has no value', () => {
    const groups = collectColors(fixture, withLayout([{ id: 'b1', path: 'card', fields: {} }]));
    const byKey = new Map(groups.flatMap((g) => g.entries).map((entry) => [entry.key, entry]));

    expect(byKey.get('setting:brand_color')?.value).toBe('#123456');
    expect(byKey.get('block:0:frame_color')?.value).toBe('#ffffff');
    // The row has no saved value, so its default comes from the manifest row.
    expect(byKey.get('block:0:items:0:accent')?.value).toBe('#111111');
    expect(byKey.get('block:0:items:0:accent')?.fallback).toBe('#111111');
  });

  it('applies a colour to a copy, leaving the state it was given untouched', () => {
    const before = withLayout([{ id: 'b1', path: 'card', fields: { items: [{ accent: '#000000' }] } }]);
    const snapshot = JSON.stringify(before);
    const entry = collectColors(fixture, before)
      .flatMap((group) => group.entries)
      .find((item) => item.key === 'block:0:items:0:accent');

    expect(entry).toBeDefined();
    const after = entry!.apply(before, '#ff0000');

    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after).not.toBe(before);
    expect(after.layout?.[0].fields.items).toEqual([{ accent: '#ff0000' }]);
  });

  it('writes a theme colour as a sparse override and clears it on empty', () => {
    const state = withLayout(null);
    const entry = collectColors(fixture, state).flatMap((g) => g.entries)[0];

    const set = entry.apply(state, '#aabbcc');
    expect(set.settings).toEqual({ brand_color: '#aabbcc' });
    expect(set.layout).toBeNull();

    const cleared = entry.apply(set, '');
    expect(cleared.settings).toEqual({});
  });

  it('drops the prefixed twin when a row colour is written, so a clear cannot resurface', () => {
    const state = withLayout([{ id: 'b1', path: 'card', fields: { items: [{ 'items.accent': '#00ff00' }] } }]);
    const entry = collectColors(fixture, state)
      .flatMap((group) => group.entries)
      .find((item) => item.key === 'block:0:items:0:accent')!;

    expect(entry.apply(state, '#123123').layout?.[0].fields.items).toEqual([{ accent: '#123123' }]);
    expect(entry.apply(state, '').layout?.[0].fields.items).toEqual([{}]);
  });
});

describe('toState', () => {
  it('keeps a valid state and defaults the missing parts', () => {
    expect(toState({ enabled: true, settings: { a: 1 }, layout: [{ id: 'b', path: 'p', fields: {} }] })).toEqual({
      enabled: true,
      settings: { a: 1 },
      layout: [{ id: 'b', path: 'p', fields: {} }],
    });
    expect(toState(null)).toEqual({ enabled: true, settings: {}, layout: null });
    expect(toState({ settings: 'nope', layout: 'nope' })).toEqual({ enabled: true, settings: {}, layout: null });
  });

  it('drops layout entries without a path instead of rendering a broken block', () => {
    const state = toState({ enabled: true, layout: [{ id: 'x' }, { id: 'y', path: 'ok', fields: {} }] });
    expect(state.layout).toHaveLength(1);
    expect(state.layout?.[0].path).toBe('ok');
  });
});

describe('a colour with no default', () => {
  const fixture: RawManifest = {
    settings: [{ id: 'ghost', type: 'string', format: 'color', value: '', label: 'لون اختياري' }],
  };

  it('reports "no colour" instead of pretending the default is black', () => {
    const [entry] = collectColors(fixture, emptyState())[0].entries;
    expect(entry.value).toBe('');
    expect(entry.fallback).toBe('');
  });

  it('clears the override when set back to empty', () => {
    const [entry] = collectColors(fixture, emptyState())[0].entries;
    const set = entry.apply(emptyState(), '#010203');

    expect(set.settings).toEqual({ ghost: '#010203' });
    expect(entry.apply(set, '').settings).toEqual({});
  });
});

describe('the real manifest', () => {
  /* Built from the manifest, not from `twilight.preview.json`: that file is a
     developer's scratchpad (gitignored, edited by the editor), so a test that
     pinned its block list would fail the moment someone adds a block. */
  const state: PreviewState = {
    enabled: true,
    settings: {},
    layout: (manifest.components ?? []).map((component, index) => ({
      id: `b${index}`,
      path: (component.path ?? '').replace(/^home\./, ''),
      fields: {},
    })),
  };

  const declaredColors = (): Set<string> => {
    const declared = new Set<string>();
    const addField = (field: {
      id?: string;
      type?: string;
      format?: string;
      fields?: unknown[];
    }) => {
      if (field.type === 'string' && field.format === 'color' && field.id) declared.add(field.id);
      for (const sub of (field.fields ?? []) as typeof field[]) addField(sub);
    };
    (manifest.settings ?? []).forEach(addField);
    (manifest.components ?? []).forEach((component) => (component.fields ?? []).forEach(addField));
    return declared;
  };

  it('exposes every colour the merchant can set, and invents none', () => {
    const entries = collectColors(manifest, state).flatMap((group) => group.entries);
    const collected = new Set(entries.map((entry) => entry.id));
    const declared = declaredColors();

    /* A collection colour needs a row to live in: `ticker_rows` ships with no
       default rows, so its two colours only become editable once the merchant
       adds a bar. Everything else must be reachable. */
    const rowless = new Set<string>();
    for (const component of manifest.components ?? []) {
      for (const field of component.fields ?? []) {
        if (field.type !== 'collection' || (Array.isArray(field.value) && field.value.length > 0)) {
          continue;
        }
        for (const sub of field.fields ?? []) {
          if (sub.type === 'string' && sub.format === 'color' && sub.id) rowless.add(sub.id);
        }
      }
    }

    // 53 = 52 before «إعدادات المتجر العامة» added `global_accent_color`. The
    // number is pinned on purpose: a colour the panel cannot reach is a colour
    // the merchant cannot change, so adding one must be a deliberate edit here.
    expect(declared.size).toBe(53);
    expect([...rowless]).toEqual(['ticker_rows.background', 'ticker_rows.color']);
    for (const id of declared) expect(collected.has(id)).toBe(!rowless.has(id));
    for (const id of collected) expect(declared.has(id)).toBe(true);
  });

  it('expands a collection colour into one row per item', () => {
    const entries = collectColors(manifest, state).flatMap((group) => group.entries);

    const collectionColors: { id: string; rows: number }[] = [];
    for (const component of manifest.components ?? []) {
      for (const field of component.fields ?? []) {
        if (field.type !== 'collection') continue;
        const rows = Array.isArray(field.value) ? field.value.length : 0;
        for (const sub of field.fields ?? []) {
          if (sub.type === 'string' && sub.format === 'color' && sub.id) {
            collectionColors.push({ id: sub.id, rows });
          }
        }
      }
    }

    expect(collectionColors.length).toBe(11);
    for (const { id, rows } of collectionColors) {
      expect(entries.filter((entry) => entry.id === id)).toHaveLength(rows);
    }
  });

  it('gives every colour a value the swatch can open on', () => {
    const entries = collectColors(manifest, state).flatMap((group) => group.entries);
    expect(entries.length).toBeGreaterThanOrEqual(52);
    for (const entry of entries) {
      expect(entry.value).toMatch(/^#[0-9a-f]{6}$/);
      expect(entry.fallback).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('labels every entry and keeps the keys unique', () => {
    const entries = collectColors(manifest, state).flatMap((group) => group.entries);
    const keys = entries.map((entry) => entry.key);

    expect(new Set(keys).size).toBe(keys.length);
    for (const entry of entries) expect(entry.label.trim().length).toBeGreaterThan(0);
  });

  it('keeps the saved preview layout pointing at components that exist', () => {
    let saved: unknown;
    try {
      saved = JSON.parse(readFileSync(path.join(root, 'twilight.preview.json'), 'utf8'));
    } catch {
      return; // No dev preview yet — nothing to check.
    }
    const paths = new Set(
      (manifest.components ?? []).map((component) => (component.path ?? '').replace(/^home\./, ''))
    );
    for (const block of toState(saved).layout ?? []) {
      expect(paths.has(block.path)).toBe(true);
    }
  });
});
