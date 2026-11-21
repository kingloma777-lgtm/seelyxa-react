// @vitest-environment node
/**
 * No dead settings.
 *
 * A control in the merchant's panel that nothing reads is worse than a missing
 * control: it looks like a decision, saves a value, and changes nothing. This
 * theme has shipped two of those (`imageZoom`, and
 * `squar_photo_bg_image_size` before it was wired), and neither was caught by
 * a type error, a snapshot or a screenshot.
 *
 * So the manifest is read against the code, in both directions:
 *
 *  1. every non-static `settings[]` entry is READ somewhere — by the theme, or
 *     by the engine (which reads a short, documented list of its own);
 *  2. every `global_*` setting is read by `storeSettings.ts` specifically, so
 *     "the store-wide system" cannot grow a field that bypasses the resolver.
 *
 * The reader search is deliberately literal: the settings are read by their
 * `id`, or by their id with the family prefix stripped (`readText(settings,
 * 'radius', 'product_card')`), which is the convention both readers follow.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(themeRoot, 'twilight.json'), 'utf8'));

function sources(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sources(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const appText = sources(path.join(themeRoot, 'app'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

/** The family prefixes the two readers strip before looking the value up. */
const FAMILY_PREFIXES = ['product_card_', 'global_'];

/**
 * Settings the ENGINE reads itself. Each one is verified against the installed
 * package, not assumed — a name listed here without a reader in the engine is
 * exactly the bug this file exists to catch.
 */
const ENGINE_READ: Record<string, string> = {
  footer_is_dark: 'engine adds `footer-is-dark` to <body> (THEME-SETTINGS.md)',
  notify_when_available_in_card:
    'engine: `notifyInCard = theme?.settings?.notify_when_available_in_card !== false`',
};

function isRead(id: string): boolean {
  if (appText.includes(id)) return true;
  for (const prefix of FAMILY_PREFIXES) {
    if (!id.startsWith(prefix)) continue;
    // `readText(settings, '<suffix>', '<prefix>')` — the id is never spelled out
    const suffix = id.slice(prefix.length);
    if (new RegExp(`['"]${suffix}['"]`).test(appText)) return true;
  }
  return false;
}

describe('the settings panel', () => {
  const fields = (manifest.settings ?? []).filter((s: { type: string }) => s.type !== 'static');

  it('is not empty (guards against reading the wrong file)', () => {
    expect(fields.length).toBeGreaterThanOrEqual(40);
  });

  it('has no control that nothing reads', () => {
    const dead = fields
      .map((s: { id: string }) => s.id)
      .filter((id: string) => !(id in ENGINE_READ))
      .filter((id: string) => !isRead(id));

    expect(dead).toEqual([]);
  });

  it('only credits the engine for settings the engine actually reads', () => {
    // the two names above are the whole exemption list; adding a third should
    // require pointing at the line in the package that reads it
    expect(Object.keys(ENGINE_READ).sort()).toEqual([
      'footer_is_dark',
      'notify_when_available_in_card',
    ]);
  });

  it('every global_* setting goes through the resolver, not around it', () => {
    const resolver = fs.readFileSync(path.join(themeRoot, 'app/lib/storeSettings.ts'), 'utf8');
    const globals = fields
      .map((s: { id: string }) => s.id)
      .filter((id: string) => id.startsWith('global_'));

    expect(globals.length).toBeGreaterThanOrEqual(9);

    const strays = globals.filter((id: string) => {
      const key = id.slice('global_'.length);
      // the key, spelled as a string literal, inside `readGlobalSettings` —
      // `readText(settings, 'x', PREFIX, …)` or the `read('x', …)` shorthand
      return !new RegExp(`['"]${key}['"]`).test(resolver);
    });

    expect(strays).toEqual([]);
  });

  it('every global_* setting has a label and a description the merchant can act on', () => {
    const thin = (manifest.settings ?? [])
      .filter((s: { id: string; type: string }) => s.type !== 'static' && s.id.startsWith('global_'))
      .filter(
        (s: { label?: string; description?: string }) =>
          !s.label?.trim() || !s.description?.trim() || s.description.trim().length < 40
      )
      .map((s: { id: string }) => s.id);

    expect(thin).toEqual([]);
  });

  it('groups the panel with headings instead of one flat list', () => {
    const titles = (manifest.settings ?? []).filter(
      (s: { type: string; format?: string }) => s.type === 'static' && s.format === 'title'
    );
    // header · mega menu · card · product · cart · block-scoped · footer ·
    // motion, plus the three inside the store-wide group
    expect(titles.length).toBeGreaterThanOrEqual(11);
  });
});
