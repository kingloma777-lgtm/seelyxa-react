import { readBoolean, readNumber, readText, type BlockData } from './homeBlock';
import { isCssColor } from './storeSettings';

/**
 * THE BADGE SYSTEM — one tag, every card, decided by the merchant.
 *
 * The badge is the only piece of the card that is *about the state* rather than
 * about the product, so it is the one piece a store wants to art-direct: a
 * jewellery shop wants a quiet paper stub, a discounter wants a loud strip, and
 * both want it to look like it belongs to the card rather than dropped on the
 * photo. This file is that decision, as data.
 *
 * Two layers, and the split is deliberate:
 *
 *   1. **The design** (`BadgeStyle`) — placement, silhouette, corner, surface,
 *      border, type, padding, the notch. ONE set, applied to every card surface
 *      (the store grid, the mega menu, every block that renders a card).
 *   2. **The content and the tone** (`outText`, `saleTemplate`, `outTone`,
 *      `saleTone`) — what each state SAYS, and whether it wears the shared face
 *      or one of the three tones. Availability and discount logic stay in
 *      `lib/productBadge`: this file never decides *whether* a tag appears.
 *
 * Everything below is a theme setting (`twilight.json` → «كارت المنتج» →
 * «شارة المنتج»), read once in `ThemeLayout` and written as custom properties +
 * data attributes on `.app-inner`. The card is rendered by the engine on every
 * list in the store, so a per-placement setting would be meaningless — and a
 * per-card copy of these values would be forty copies of one decision.
 *
 * WHY MOST VALUES ARE "WRITE ONLY WHEN DIFFERENT"
 * ------------------------------------------------
 * The stylesheet owns a designed default per placement (a tag on the card's
 * edge is cut in by a 3px ring; a tag inside the frame is not). A merchant who
 * never opens this panel must get that design, not a flattened copy of it — so
 * a value equal to its default is NOT written, and the stylesheet's own
 * fallback stays alive. Move one slider and only that property is pinned.
 */

/** Where the tag sits, as a RELATIONSHIP rather than a coordinate. */
export type BadgePlacement =
  /** Clamped over the card's top edge — half on the page, half on the photo. */
  | 'edge'
  /** Inside the card's top corner, flush with the frame: part of the card. */
  | 'frame'
  /** Hanging off the card's inline edge, square where it meets it. */
  | 'attached'
  /** Independently placed inside the photo, with its own shadow. */
  | 'free';

/** The silhouette. Each one changes the SHAPE, not just the corner radius. */
export type BadgeShape =
  /** A printed rectangle. */
  | 'sharp'
  /** The same rectangle with a soft corner. */
  | 'soft'
  /** A capsule. */
  | 'pill'
  /** A ticket stub: one square corner, three soft ones. */
  | 'ticket';

/** The shared face every tag wears unless its type overrides the tone. */
export type BadgeSurface = 'ink' | 'paper' | 'soft' | 'custom';

/** What one badge TYPE wears: the shared face, or one of the three tones. */
export type BadgeTone = 'inherit' | 'ink' | 'paper' | 'quiet';

export type BadgeBorderStyle = 'none' | 'solid' | 'dashed';

/** Optional decoration inside the tag. */
export type BadgeDetail = 'none' | 'keyline' | 'dot';

export interface BadgeStyle {
  placement: BadgePlacement;
  shape: BadgeShape;
  /** Fine-tune for `sharp` / `soft`. `pill` and `ticket` bring their own. */
  radius: number;
  /** Fill the card's width (a strip) instead of hugging the text. */
  stretch: boolean;
  /** Nudges from the placement's own anchor, in px. */
  offsetX: number;
  offsetY: number;
  /** The paper ring that cuts the tag into the card's edge. 0 = no cut. */
  ring: number;
  surface: BadgeSurface;
  /** Used when `surface` is `custom`. */
  bg: string;
  ink: string;
  borderStyle: BadgeBorderStyle;
  borderWidth: number;
  fontSize: number;
  fontWeight: number;
  padX: number;
  padY: number;
  detail: BadgeDetail;
  /** «نفدت الكمية» — the merchant's wording. `''` = the store's own string. */
  outText: string;
  /** The discount's wording. `{value}` is the computed percentage. */
  saleTemplate: string;
  outTone: BadgeTone;
  saleTone: BadgeTone;
}

export const BADGE_DEFAULTS: BadgeStyle = {
  /* The reference: a printed label clamped over the card's top edge. */
  placement: 'edge',
  shape: 'sharp',
  radius: 0,
  stretch: false,
  offsetX: 0,
  offsetY: 0,
  ring: 3,
  surface: 'ink',
  bg: '#2b2519',
  ink: '#fdfaf3',
  /* no colour: the border is drawn in `currentColor`, so it is always the
     text's own colour — a paper tag gets an ink keyline and an ink tag gets a
     paper one, with no second control to keep in sync. */
  borderStyle: 'none',
  borderWidth: 0,
  fontSize: 10,
  fontWeight: 700,
  padX: 10,
  padY: 6,
  detail: 'none',
  outText: '',
  /* The platform's own spelling of a discount, and the one the theme has always
     printed. A merchant who wants words writes «خصم {value}%» here. */
  saleTemplate: '-{value}%',
  /* Availability is an absence, not a promotion: it starts quiet. The discount
     wears the shared face. */
  outTone: 'quiet',
  saleTone: 'inherit',
};

const PREFIX = 'product_card';

const oneOf = <T extends string>(raw: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value)));

/** A colour the browser will accept, or `''` — never a value that silently
 *  kills the declaration it lands in. */
const colour = (raw: string): string => (isCssColor(raw.trim()) ? raw.trim() : '');

export function readBadgeStyle(settings: BlockData | undefined): BadgeStyle {
  const d = BADGE_DEFAULTS;
  const text = (key: string, fallback: string) => readText(settings, key, PREFIX, fallback);
  const num = (key: string, fallback: number, min: number, max: number) =>
    clamp(readNumber(settings, key, PREFIX, fallback), min, max);

  return {
    placement: oneOf(text('badge_placement', d.placement), ['edge', 'frame', 'attached', 'free'] as const, d.placement),
    shape: oneOf(text('badge_shape', d.shape), ['sharp', 'soft', 'pill', 'ticket'] as const, d.shape),
    /* 0..40: past 40 a `sharp` label is a capsule, which is a different preset */
    radius: num('badge_radius', d.radius, 0, 40),
    stretch: readBoolean(settings, 'badge_stretch', PREFIX, d.stretch),
    offsetX: num('badge_offset_x', d.offsetX, -24, 40),
    offsetY: num('badge_offset_y', d.offsetY, -24, 40),
    ring: num('badge_ring', d.ring, 0, 8),
    surface: oneOf(text('badge_surface', d.surface), ['ink', 'paper', 'soft', 'custom'] as const, d.surface),
    bg: colour(text('badge_bg', d.bg)) || d.bg,
    ink: colour(text('badge_ink', d.ink)) || d.ink,
    borderStyle: oneOf(text('badge_border_style', d.borderStyle), ['none', 'solid', 'dashed'] as const, d.borderStyle),
    borderWidth: num('badge_border_width', d.borderWidth, 0, 4),
    fontSize: num('badge_font_size', d.fontSize, 8, 16),
    fontWeight: clamp(
      Number(oneOf(text('badge_font_weight', String(d.fontWeight)), ['500', '600', '700', '800'] as const, String(d.fontWeight))),
      500,
      800
    ),
    padX: num('badge_pad_x', d.padX, 4, 20),
    padY: num('badge_pad_y', d.padY, 2, 14),
    detail: oneOf(text('badge_detail', d.detail), ['none', 'keyline', 'dot'] as const, d.detail),
    outText: text('badge_out_text', d.outText).trim(),
    /* `{value}` is the ONLY thing substituted, so a template can never invent a
       number — and a template without it simply prints no figure. */
    saleTemplate: text('badge_sale_template', d.saleTemplate).trim() || d.saleTemplate,
    outTone: oneOf(text('badge_out_tone', d.outTone), ['inherit', 'ink', 'paper', 'quiet'] as const, d.outTone),
    saleTone: oneOf(text('badge_sale_tone', d.saleTone), ['inherit', 'ink', 'paper', 'quiet'] as const, d.saleTone),
  };
}

/**
 * The badge's numbers, as custom properties.
 *
 * Only what the merchant actually changed is written — see the note at the top
 * of the file. Everything else falls through to the stylesheet's own value for
 * the chosen placement, which is what keeps five presets looking designed
 * instead of averaged.
 */
export function badgeVars(s: BadgeStyle): Record<string, string> {
  const d = BADGE_DEFAULTS;
  const vars: Record<string, string> = {};

  if (s.fontSize !== d.fontSize) vars['--pc-tag-fs'] = `${s.fontSize}px`;
  if (s.fontWeight !== d.fontWeight) vars['--pc-tag-fw'] = String(s.fontWeight);
  if (s.padX !== d.padX) vars['--pc-tag-pad-x'] = `${s.padX}px`;
  if (s.padY !== d.padY) vars['--pc-tag-pad-y'] = `${s.padY}px`;
  if (s.ring !== d.ring) vars['--pc-tag-ring'] = `${s.ring}px`;
  if (s.radius !== d.radius) vars['--pc-tag-radius'] = `${s.radius}px`;
  if (s.offsetX !== 0) vars['--pc-tag-dx'] = `${s.offsetX}px`;
  if (s.offsetY !== 0) vars['--pc-tag-dy'] = `${s.offsetY}px`;
  if (s.borderWidth > 0) vars['--pc-tag-bw'] = `${s.borderWidth}px`;
  if (s.borderStyle !== 'none') vars['--pc-tag-bs'] = s.borderStyle;
  /* only a CUSTOM face carries colours: the three presets are the store's own
     roles, so a palette change reaches them and a preset never goes stale */
  if (s.surface === 'custom') {
    vars['--pc-tag-bg'] = s.bg;
    vars['--pc-tag-ink'] = s.ink;
  }
  return vars;
}

/**
 * The badge's choices, as data attributes — the structural half.
 *
 * Placement, silhouette, face and tone are SELECTORS, not values: each one
 * carries a handful of declarations the stylesheet owns (a placement moves the
 * anchor and decides whether there is a ring at all; a tone repaints one face),
 * and none of that can be expressed as a single custom property.
 */
export function badgeAttrs(s: BadgeStyle): Record<string, string> {
  return {
    'data-pc-badge-place': s.placement,
    'data-pc-badge-shape': s.shape,
    'data-pc-badge-surface': s.surface,
    'data-pc-badge-stretch': s.stretch ? '1' : '0',
    'data-pc-badge-detail': s.detail,
    'data-pc-badge-out': s.outTone,
    'data-pc-badge-sale': s.saleTone,
  };
}

/**
 * The discount's wording, from the merchant's template and the computed cut.
 *
 * `{value}` is replaced with the whole-number percentage. When the result OPENS
 * with a digit or a sign it is wrapped in U+2066 … U+2069 (LRI/PDI): on an
 * Arabic page a leading `-` is a neutral character, so an RTL paragraph pushes
 * it to the tail and «-22%» prints as «22%-». The isolate travels with the
 * string and survives text extraction; a template that opens with a letter is
 * left exactly as written.
 */
export function saleBadgeText(template: string, percent: number): string {
  const text = template.replace(/\{value\}/g, String(percent));
  return /^[-\d]/.test(text) ? `\u2066${text}\u2069` : text;
}
