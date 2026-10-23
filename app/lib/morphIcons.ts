/**
 * MorphPill icon registry — ported from the Twig theme's `morph-header.js`
 * `ICONS` table.
 *
 * The old theme painted the glyph inline in Twig (so the header looked right
 * with no JS) and repainted the slot from JS when the merchant picked another
 * value. React renders from the settings directly, so a value that is one of
 * the design's keys paints its own inline SVG and any `sicon-*` value paints
 * the platform icon font; no repaint pass is needed.
 */

export interface MorphGlyph {
  /** Inline SVG body (stroke path elements, no root tag). */
  body: string;
  size: number;
}

const svgGlyph = (body: string, size: number): MorphGlyph => ({ body, size });

export const MORPH_ICONS: Record<string, MorphGlyph> = {
  menu: svgGlyph(
    '<line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line>',
    20
  ),
  search: svgGlyph('<circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line>', 17),
  user: svgGlyph(
    '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    17
  ),
  grid: svgGlyph(
    '<rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="18" rx="1"></rect><rect width="7" height="7" x="3" y="18" rx="1"></rect>',
    17
  ),
  heart: svgGlyph(
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
    17
  ),
  bag: svgGlyph(
    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>',
    19
  ),
  x: svgGlyph('<line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line>', 17),
  globe: svgGlyph(
    '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"></path>',
    17
  ),
};

/**
 * What one icon slot should paint: either the design's own inline SVG, or a
 * platform `sicon-*` font glyph. Unknown values fall back to the design
 * default, so a stale setting never leaves a slot blank.
 *
 * `setting` is what the merchant saved for this slot (it may be a picker
 * value-arrays flat by the engine) — the caller normalises that; `fallback` is
 * the design glyph the old Twig template rendered when the setting was never
 * saved. This is the React twin of the rule "two places hold a default — they
 * must move together" (`twilight.json` `selected` + this default).
 */
export function resolveMorphIcon(
  setting: unknown,
  fallback: string
): { sicon?: string; glyph: MorphGlyph } {
  const key = typeof setting === 'string' && setting ? setting : fallback;
  const glyph = MORPH_ICONS[key] ?? MORPH_ICONS[fallback];
  if (key.indexOf('sicon-') === 0) {
    return { sicon: key.replace(/^sicon-/, ''), glyph };
  }
  return { sicon: undefined, glyph };
}
