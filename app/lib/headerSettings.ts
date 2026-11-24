/**
 * The header's settings layer — one place where `header_*` becomes decisions.
 *
 * ## Why this file exists
 *
 * The header used to read its settings inline, inside the component, and write
 * every value it found as a custom property on `<header>`. That had two costs
 * that only show up on a store that also uses the store-wide panel:
 *
 *  1. **The design defaults were literals written inline.** `--morph-fg:
 *     #0f172a` and `--morph-glass-color: #ffffff` were emitted on every store,
 *     so the header could never inherit `--ink-1` / `--surface-1` — and the
 *     dark-mode block had to fight the style attribute with `!important` to
 *     paint at night. A merchant who picked a header colour saw it die after
 *     sunset, because the `!important` rule ignored their choice entirely.
 *  2. **A settings payload is not a trusted channel.** The colour fields went
 *     straight into a `style` attribute with no scheme check, while every other
 *     surface in the theme guards its colours through `isCssColor`.
 *
 * ## The precedence chain (docs/GLOBAL-SETTINGS.md §5.2)
 *
 * ```
 * 1. header override   the merchant picked a value ≠ the design default → inline
 * 2. store-wide value  global_* / the Salla palette → the stylesheet default
 * 3. design default    the theme's own value → the stylesheet's var() fallback
 * ```
 *
 * Step 1 is decided here: **only a value that differs from the design default
 * is written inline.** The colour picker cannot express "empty" (the theme's
 * colour contract requires a hex default so the picker opens on something), so
 * "the default value" is the inherit marker — exactly the rule
 * `SeliaAuto.styleFromControls` already follows. Returning to the default
 * therefore restores the store-wide value on the next render, with no extra
 * click and no second control.
 *
 * The stylesheet owns steps 2 and 3 (`04-components/morph-header.scss`):
 *
 * ```scss
 * .morph-header { --morph-fg: var(--ink-1, #0f172a); }
 * ```
 *
 * so the header follows the store palette in BOTH modes and the inline value —
 * when there is one — is the merchant's, in both modes. That is the difference
 * between "the header inherits the store" and "the header has its own theme".
 */
import { isCssColor } from './storeSettings';
import { imgSrc } from './curtainSlots';

/** The values `twilight.json` ships. A saved value equal to one of these is
 *  not a decision, so it is not written inline (see the module header). */
export const HEADER_DEFAULTS = {
  shape: 'wide',
  megaLayout: 'classic',
  sticky: true,
  surface: 'glass',
  glassColor: '#ffffff',
  glassOpacity: 78,
  blur: 18,
  textColor: '#0f172a',
  navSize: 14,
  navWeight: '700',
  navGap: 2,
  radius: 'inherit',
  themeToggle: true,
  logoDark: '',
} as const;

export type HeaderShape = 'wide' | 'pill';
/** The mega menu's composition. `classic` = the store's two plates (categories
 *  beside the merchant slot) with the product row beneath them; `showcase` =
 *  one surface split into a category rail, a product column and a promo column.
 *  Two arrangements of the same content — a merchant decision, not a theme one. */
export type MegaLayout = 'classic' | 'showcase';
export type HeaderSurface = 'glass' | 'solid';

export interface HeaderSettings {
  shape: HeaderShape;
  megaLayout: MegaLayout;
  /** `false` → the bar scrolls away with the page (`position: static`). */
  sticky: boolean;
  /** `solid` = an opaque bar with no blur; `glass` = the frosted capsule. */
  surface: HeaderSurface;
  /** `''` = inherit the store surface. */
  glassColor: string;
  glassOpacity: number;
  blur: number;
  /** `''` = inherit the store ink. */
  textColor: string;
  navSize: number;
  navWeight: string;
  navGap: number;
  /** `'inherit'` = the store's card radius; a number = this many pixels. */
  radius: 'inherit' | number;
  themeToggle: boolean;
  /** A night-only logo. `''` = use the store logo in both modes. */
  logoDark: string;
  icons: {
    menu: unknown;
    search: unknown;
    account: unknown;
    cart: unknown;
    close: unknown;
  };
}

/** Salla can ship any field as the picker shape `[{label, value, key}]`. */
export function scalarSetting(value: unknown): string | undefined {
  let v: unknown = value;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object' && typeof (v as Record<string, unknown>).value === 'string') {
    return (v as Record<string, unknown>).value as string;
  }
  return typeof v === 'string' && v ? v : undefined;
}

export function numberSetting(value: unknown, fallback: number): number {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>).value : value;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function booleanSetting(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  const scalar = scalarSetting(value);
  if (scalar === 'false') return false;
  if (scalar === 'true') return true;
  return Boolean(value);
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** A colour a `style` attribute may carry: the picker's, or nothing. */
function colourSetting(value: unknown): string {
  const scalar = scalarSetting(value);
  if (!scalar) return '';
  return isCssColor(scalar) ? scalar.trim() : '';
}

const NAV_WEIGHTS = ['400', '500', '600', '700', '800'] as const;
const RADIUS_CHOICES = ['inherit', '0', '8', '12', '18', '22'] as const;

/**
 * An image the browser may fetch: an absolute http(s) URL or a site-relative
 * path. A settings payload is merchant input, and `img src` accepts anything —
 * `data:` can carry an SVG document, and a bare `javascript:` string is a URL
 * the browser will refuse but a screen reader may still announce. The picker
 * only ever produces CDN URLs, so anything else is a payload, not a logo.
 */
function imageSetting(value: unknown): string {
  const src = imgSrc(value).trim();
  if (!src) return '';
  if (src.startsWith('/') && !src.startsWith('//')) return src;
  try {
    const { protocol } = new URL(src);
    return protocol === 'https:' || protocol === 'http:' ? src : '';
  } catch {
    return '';
  }
}

export function readHeaderSettings(settings: Record<string, unknown> | undefined): HeaderSettings {
  const s = settings ?? {};
  const radiusChoice = scalarSetting(s.header_radius) ?? HEADER_DEFAULTS.radius;

  return {
    shape: scalarSetting(s.header_shape) === 'pill' ? 'pill' : 'wide',
    megaLayout: scalarSetting(s.header_mega_layout) === 'showcase' ? 'showcase' : 'classic',
    sticky: booleanSetting(s.header_sticky, HEADER_DEFAULTS.sticky),
    surface: scalarSetting(s.header_surface) === 'solid' ? 'solid' : 'glass',
    glassColor: colourSetting(s.header_glass_color),
    glassOpacity: clamp(numberSetting(s.header_glass_opacity, HEADER_DEFAULTS.glassOpacity), 1, 100),
    blur: clamp(numberSetting(s.header_blur, HEADER_DEFAULTS.blur), 0, 40),
    textColor: colourSetting(s.header_text_color),
    navSize: clamp(numberSetting(s.header_nav_font_size, HEADER_DEFAULTS.navSize), 1, 20),
    navWeight: (NAV_WEIGHTS as readonly string[]).includes(scalarSetting(s.header_nav_weight) ?? '')
      ? (scalarSetting(s.header_nav_weight) as string)
      : HEADER_DEFAULTS.navWeight,
    navGap: clamp(numberSetting(s.header_nav_gap, HEADER_DEFAULTS.navGap), 0, 24),
    radius: (RADIUS_CHOICES as readonly string[]).includes(radiusChoice)
      ? radiusChoice === 'inherit'
        ? 'inherit'
        : Number(radiusChoice)
      : 'inherit',
    themeToggle: booleanSetting(s.header_theme_toggle, HEADER_DEFAULTS.themeToggle),
    logoDark: imageSetting(s.header_logo_dark),
    icons: {
      menu: s.header_icon_menu,
      search: s.header_icon_search,
      account: s.header_icon_account,
      cart: s.header_icon_cart,
      close: s.header_icon_close,
    },
  };
}

/**
 * The inline custom properties — **only the merchant's deviations**.
 *
 * Every entry here is an explicit decision, so it out-ranks both the store-wide
 * value and the design default (that is what `style` does). Everything absent
 * is resolved by the stylesheet, which is where the store palette reaches the
 * header and where the night face lives.
 */
export function headerVars(h: HeaderSettings): Record<string, string> {
  const vars: Record<string, string> = {};
  const d = HEADER_DEFAULTS;

  if (h.glassColor && h.glassColor !== d.glassColor) vars['--morph-glass-color'] = h.glassColor;
  if (h.glassOpacity !== d.glassOpacity) vars['--morph-glass-alpha'] = String(h.glassOpacity);
  if (h.blur !== d.blur) vars['--morph-blur'] = `${h.blur}px`;
  if (h.textColor && h.textColor !== d.textColor) vars['--morph-fg'] = h.textColor;
  if (h.navSize !== d.navSize) vars['--morph-nav-size'] = `${h.navSize}px`;
  if (h.navWeight !== d.navWeight) vars['--morph-nav-weight'] = h.navWeight;
  if (h.navGap !== d.navGap) vars['--morph-nav-gap'] = `${h.navGap}px`;
  /* `inherit` writes nothing at all — that is the whole point of the choice:
     the panel radius then reads `--radius-card`, which is the store's. */
  if (h.radius !== 'inherit') vars['--morph-panel-radius'] = `${h.radius}px`;

  return vars;
}
