import { createContext, useContext } from 'react';
import { readBoolean, readNumber, readText, type BlockData } from './homeBlock';
import { isCssColor } from './storeSettings';
import {
  BADGE_DEFAULTS,
  badgeAttrs,
  badgeVars,
  readBadgeStyle,
  type BadgeStyle,
} from './productBadgeStyle';

/**
 * The merchant's product-card settings, read once and handed to both the
 * layout (as CSS custom properties on `.app-inner`) and the card itself (for
 * the one decision CSS cannot make: whether a card may borrow the product's
 * description as its short line).
 *
 * Every value here is a **theme setting** (`twilight.json` → `settings[]`,
 * grouped under «إعدادات كارت المنتج»), not a block field — the card is
 * rendered by the engine's `product:card` slot on every list in the store, so
 * a per-placement setting would be meaningless. `readBoolean` / `readNumber` /
 * `readText` are the shared readers, so the "prefixed id wins" rule and the
 * "unset is not zero" rule are the same ones every block obeys.
 */

export type ProductCardCart = 'circle' | 'bar';
export type ProductCardShadow = 'none' | 'soft' | 'lift';
export type ProductCardFont = 'main' | 'serif';
export type ProductCardRatio = 'square' | 'landscape' | 'portrait';
/** How the photo fills its plate. `cover` fills the frame and crops the
 *  overflow; `contain` shows the whole product and leaves the plate visible.
 *  This is the ONE value that used to differ between the store card and the
 *  mega card — the store grid cropped, the menu letterboxed — so the same
 *  product looked like two different photos in two places. */
export type ProductCardFit = 'cover' | 'contain';
/** Which part of the photo survives the crop when `cover` cuts it. */
export type ProductCardImagePosition = 'center' | 'top' | 'bottom';
/** What the card does under the cursor. The two motions are separate on
 *  purpose: the tile rises, the photo grows inside it — a single transform
 *  would scale the text and the badge with the picture. */
export type ProductCardHover = 'both' | 'lift' | 'zoom' | 'none';

/**
 * The image-ratio geometry each choice stands for, as TWO derived values of ONE
 * setting — never two sources of truth:
 *
 * - `pad` is the `padding-bottom` percentage the store card's ratio block uses
 *   (the engine's own `<Image>` wrapper carries an inline `aspect-ratio` that
 *   has to be beaten with `!important`, so the card keeps the padding
 *   technique). `100%` = square, `75%` = landscape, `133.3333%` = portrait.
 * - `num` is the `aspect-ratio` number the mega menu's media plate reads — the
 *   curtain card is theme markup with no engine internals inside it, so it can
 *   take the plain property.
 *
 * A component override re-declares the same two values on its own subtree, so
 * the ratio now inherits by default and overrides per component, exactly like
 * every other `--pc-*` property.
 */
export const RATIO_GEOMETRY: Record<ProductCardRatio, { num: string; pad: string }> = {
  square: { num: '1', pad: '100%' },
  landscape: { num: '1.3333', pad: '75%' },
  portrait: { num: '0.75', pad: '133.3333%' },
};

/**
 * The two motions one hover choice stands for, as the values the stylesheets
 * interpolate — again ONE setting, two derived variables, so the store card and
 * the mega card cannot answer "what happens on hover" differently.
 *
 * `lift` is the tile's rise; `zoom` is the photo's scale inside its plate. They
 * stay separate because they are different layers: folding the zoom into the
 * tile's transform would scale the title, the badge and the price with it.
 */
export const HOVER_GEOMETRY: Record<ProductCardHover, { lift: string; zoom: string }> = {
  both: { lift: '-4px', zoom: '1.045' },
  lift: { lift: '-4px', zoom: '1' },
  zoom: { lift: '0px', zoom: '1.045' },
  none: { lift: '0px', zoom: '1' },
};

export interface ProductCardSettings {
  /** The merchant's promotion badge / pre-order label on the image. */
  badge: boolean;
  /** The badge's whole design: placement, silhouette, face, type, wording.
   *  One object because it is one decision — see `lib/productBadgeStyle`. */
  badgeStyle: BadgeStyle;
  /** The star row. */
  rating: boolean;
  /** `(89)` after the stars — meaningless without `rating`. */
  ratingCount: boolean;
  /** What to print in the meta rail for a product with no reviews at all.
   *  The engine renders *no row* in that case (`product.rating?.stars && …`).
   *  It used to be ON by default because the old card needed a row in that
   *  slot or the prices of reviewed and unreviewed products sat at different
   *  heights. The label no longer depends on it — the rail simply is not
   *  there — so the default is OFF and the merchant opts in to the wording. */
  ratingEmpty: boolean;
  /** The short line under the name. */
  desc: boolean;
  /** How many lines that short line may take before it ellipses. The label's
   *  own default is ONE line: the card is a caption, and a second line of
   *  description pushes the price away from the name it belongs to. A merchant
   *  who wants a paragraph raises it to four. */
  descLines: number;
  /** The heart on the image corner. */
  wishlist: boolean;
  /** Show every product image on the card, swipeable, with dots. Costs one
   *  product-detail request per card that scrolls into view. */
  gallery: boolean;
  /** Circle = the reference's compact card; bar = its "Add to Cart" card. */
  cart: ProductCardCart;
  /** Tile corner radius, px. */
  radius: number;
  /** Tile background. */
  bg: string;
  /** The plate the photo sits on. */
  imageBg: string;
  /** Every piece of type inside the tile. */
  ink: string;
  shadow: ProductCardShadow;
  font: ProductCardFont;
  /** Moved here from the product-page group: it is a card decision. */
  ratio: ProductCardRatio;
  /** How the photo fills the plate — shared by every card surface. */
  imgFit: ProductCardFit;
  /** The crop anchor, used when `imgFit` is `cover`. */
  imgPosition: ProductCardImagePosition;
  /** The hover behaviour of the tile and the photo inside it. */
  hover: ProductCardHover;
}

const PREFIX = 'product_card';

const oneOf = <T extends string>(raw: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

/** Defaults are the reference design's own numbers, so a store that never
 *  opens the panel still gets the card the merchant asked for. */
export const PRODUCT_CARD_DEFAULTS: ProductCardSettings = {
  badge: true,
  badgeStyle: BADGE_DEFAULTS,
  rating: true,
  ratingCount: true,
  ratingEmpty: false,
  desc: true,
  descLines: 1,
  wishlist: true,
  gallery: true,
  cart: 'circle',
  radius: 22,
  bg: '#fdfaf3',
  imageBg: '#f4ebdc',
  ink: '#2b2519',
  shadow: 'soft',
  font: 'main',
  ratio: 'square',
  /* `cover` because it is what the storefront's card has always painted — a
     new default would re-frame every photo in every grid on upgrade. The
     mega menu's own `contain` was the divergence, not the baseline. */
  imgFit: 'cover',
  imgPosition: 'center',
  hover: 'both',
};

/**
 * The settings travel down from the layout as CONTEXT; the card does not read
 * `useTwilight()` itself.
 *
 * The engine's `useTwilight()` throws when there is no `TwilightProvider`, and
 * a card is a leaf that can legitimately be rendered on its own — a unit test,
 * an editor preview, a block's static HTML. Making the card depend on that
 * provider meant one isolated render took down the whole tree. A context whose
 * initial value is the reference defaults keeps that case a real card, and it
 * also means the merchant's settings are read ONCE (in `ThemeLayout`) instead
 * of once per card in a grid of forty.
 */
export const ProductCardSettingsContext =
  createContext<ProductCardSettings>(PRODUCT_CARD_DEFAULTS);

export function useProductCardSettings(): ProductCardSettings {
  return useContext(ProductCardSettingsContext);
}

export function readProductCardSettings(settings: BlockData | undefined): ProductCardSettings {
  const d = PRODUCT_CARD_DEFAULTS;
  return {
    badge: readBoolean(settings, 'badge', PREFIX, d.badge),
    /* the badge's own group, read by its own reader — it is a system of its own
       and every field in it is namespaced `product_card_badge_*` */
    badgeStyle: readBadgeStyle(settings),
    rating: readBoolean(settings, 'rating', PREFIX, d.rating),
    ratingCount: readBoolean(settings, 'rating_count', PREFIX, d.ratingCount),
    ratingEmpty: readBoolean(settings, 'rating_empty', PREFIX, d.ratingEmpty),
    desc: readBoolean(settings, 'desc', PREFIX, d.desc),
    /* 1..4: one line is a caption, five is a paragraph inside a card. */
    descLines: Math.min(4, Math.max(1, Math.round(readNumber(settings, 'desc_lines', PREFIX, d.descLines)))),
    wishlist: readBoolean(settings, 'wishlist', PREFIX, d.wishlist),
    gallery: readBoolean(settings, 'gallery', PREFIX, d.gallery),
    cart: oneOf(readText(settings, 'cart_style', PREFIX, d.cart), ['circle', 'bar'] as const, d.cart),
    /* 0..44: past ~44 the tile is a pill and the badge clips its own corner. */
    radius: Math.min(44, Math.max(0, Math.round(readNumber(settings, 'radius', PREFIX, d.radius)))),
    bg: readText(settings, 'bg', PREFIX, d.bg),
    imageBg: readText(settings, 'image_bg', PREFIX, d.imageBg),
    ink: readText(settings, 'ink', PREFIX, d.ink),
    shadow: oneOf(readText(settings, 'shadow', PREFIX, d.shadow), ['none', 'soft', 'lift'] as const, d.shadow),
    font: oneOf(readText(settings, 'title_font', PREFIX, d.font), ['main', 'serif'] as const, d.font),
    ratio: oneOf(readText(settings, 'img_ratio', PREFIX, d.ratio), ['square', 'landscape', 'portrait'] as const, d.ratio),
    imgFit: oneOf(readText(settings, 'img_fit', PREFIX, d.imgFit), ['cover', 'contain'] as const, d.imgFit),
    imgPosition: oneOf(readText(settings, 'img_position', PREFIX, d.imgPosition), ['center', 'top', 'bottom'] as const, d.imgPosition),
    hover: oneOf(readText(settings, 'hover', PREFIX, d.hover), ['both', 'lift', 'zoom', 'none'] as const, d.hover),
  };
}

/**
 * The settings as the custom properties the stylesheet reads.
 *
 * Written on `.app-inner` (which already carries `product-card-img--<ratio>`)
 * rather than per card: the card is re-rendered by every list, and a variable
 * that only exists after a component mounts paints one frame of the old
 * design. The layout is server-rendered, so these land with the first byte.
 *
 * Values are plain strings; React writes them verbatim for `--*` keys.
 *
 * WHY TWO OF THEM ARE A REFERENCE AND NOT A NUMBER
 * ------------------------------------------------
 * The card is the largest surface on the storefront, and its corner and panel
 * used to be pinned to `22px` / `#fdfaf3` no matter what the store settings
 * said — so `global_radius` and `global_surface_preset` moved every element on
 * the page except the one the customer is looking at. (A value written inline
 * on `.app-inner` out-ranks the stylesheet, so the card's own `:root` default
 * could never be re-pointed.)
 *
 * The fix keeps the card's own setting authoritative — pick any other corner
 * or colour in the card panel and it is written as a literal, exactly as
 * before — and makes the DEFAULT a reference to the store's role, with the
 * card's designed value as the fallback:
 *
 *   `var(--radius-card, 22px)`  →  22px unless the store radius moved
 *   `var(--gs-card-surface, #fdfaf3)` → ivory unless a surface preset was chosen
 *
 * At night neither matters: `02-generic/dark.scss` paints `.s-product-card`
 * from `--surface-1`, which the night bridge already re-points.
 */
export function productCardVars(s: ProductCardSettings): Record<string, string> {
  const d = PRODUCT_CARD_DEFAULTS;
  return {
    '--pc-radius': s.radius === d.radius ? 'var(--radius-card, 22px)' : `${s.radius}px`,
    '--pc-bg': s.bg === d.bg ? 'var(--gs-card-surface, #fdfaf3)' : s.bg,
    /* The photo well has the same shape of problem and one extra twist: the
       mode has to decide it, and an inline value cannot be mode-aware. So the
       card names `--surface-media`, which the palette bridge resolves per mode
       (`#f4ebdc` by day, the night `s2` after dark). Pick a colour in the card
       panel and it is written as a literal, exactly as before. */
    '--pc-image-bg': s.imageBg === d.imageBg ? 'var(--surface-media, #f4ebdc)' : s.imageBg,
    '--pc-ink': s.ink,
    /* `-webkit-line-clamp` takes a number, and CSS cannot read one out of an
       attribute — the clamp count has to arrive as a property. */
    '--pc-desc-lines': String(s.descLines),
    /* the ratio, as the two derived geometries — see {@link RATIO_GEOMETRY}.
       Written here (inline, on `.app-inner`) so the mega menu's media plate can
       INHERIT the merchant's ratio through the same channel as every other
       card property, instead of hard-coding its own. */
    '--pc-ar-num': RATIO_GEOMETRY[s.ratio].num,
    '--pc-ar-pad': RATIO_GEOMETRY[s.ratio].pad,
    /* how the photo meets its plate — the value that used to be `cover` in the
       grid and `contain` in the menu. Both surfaces now read these two, so one
       setting re-frames the photo everywhere it appears. */
    '--pc-img-fit': s.imgFit,
    '--pc-img-pos': s.imgPosition,
    /* the hover geometry, as the two values the stylesheets interpolate */
    '--pc-hover-lift': HOVER_GEOMETRY[s.hover].lift,
    '--pc-img-zoom': HOVER_GEOMETRY[s.hover].zoom,
    /* the badge's numbers — only the ones the merchant moved, so each placement
       keeps its own designed default */
    ...badgeVars(s.badgeStyle),
  };
}

/** The switches that change *which elements exist*, as data attributes — CSS
 *  reads them, so the markup stays the engine's and nothing re-renders. */
export function productCardFlags(s: ProductCardSettings): Record<string, string> {
  return {
    'data-pc-badge': s.badge ? '1' : '0',
    /* the badge's structural choices (placement, silhouette, face, tone) */
    ...badgeAttrs(s.badgeStyle),
    'data-pc-rating': s.rating ? '1' : '0',
    'data-pc-rating-count': s.ratingCount ? '1' : '0',
    'data-pc-rating-empty': s.ratingEmpty ? '1' : '0',
    'data-pc-desc': s.desc ? '1' : '0',
    'data-pc-desc-lines': String(s.descLines),
    'data-pc-wish': s.wishlist ? '1' : '0',
    'data-pc-gallery': s.gallery ? '1' : '0',
    'data-pc-cart': s.cart,
    'data-pc-shadow': s.shadow,
    'data-pc-font': s.font,
  };
}

/* ==========================================================================
   Component-level overrides — the Global Product Card System's second layer.

   The contract (docs and the merchant panel both state it):

     1. Global Product Card Settings  — the default for every card in the store
     2. Component overrides          — optional, PER PROPERTY, local only
     3. Inheritance                  — a property with no override reads the
                                       global value LIVE, not a copy of it

   The third line is the one that makes this a system rather than a snapshot:
   an override of ONE property never pins the others, and "inherit" is the
   absence of a declaration, not a value copied from the global panel at the
   time the merchant touched the component's. Changing the global radius next
   week still moves every mega-menu card that did not override the radius —
   including ones that overrode the ratio the same day.

   The `'inherit'` sentinel is read here and never reaches the stylesheet as a
   value: {@link productCardOverrideVars} emits ONLY the properties the
   component actually overrode, so the cascade is "nearest declaration wins"
   for the subtree and untouched for everything else — the same rule
   `headerVars()` already follows for the header chrome.

   NOTHING HERE IS MEGA-MENU-SPECIFIC. The prefix is a parameter, so the
   layer is reusable by any component that renders products; the mega menu is
   simply the first surface that ships a panel for it.
   ========================================================================== */

/** A switch the component re-decides: `inherit` = the global switch wins. */
export type ProductCardTriState = 'inherit' | 'on' | 'off';

/** `'inherit'` is the sentinel for every non-colour property. */
export interface ProductCardOverrides {
  /** The panel's master gate. `false` = "Inherit Global" — every saved local
   *  below is ignored, so one switch restores the whole design. */
  customize: boolean;
  ratio: 'inherit' | ProductCardRatio;
  radius: 'inherit' | number;
  shadow: 'inherit' | ProductCardShadow;
  font: 'inherit' | ProductCardFont;
  cart: 'inherit' | ProductCardCart;
  imgFit: 'inherit' | ProductCardFit;
  imgPosition: 'inherit' | ProductCardImagePosition;
  hover: 'inherit' | ProductCardHover;
  /** `''` = inherit. A colour equal to the global default is ALSO inherit —
   *  the picker cannot express "empty", exactly as `headerVars` decides it. */
  bg: string;
  imageBg: string;
  ink: string;
  badge: ProductCardTriState;
  wishlist: ProductCardTriState;
  desc: ProductCardTriState;
  rating: ProductCardTriState;
}

/**
 * The prefix a component's override fields are saved under.
 *
 * It is a PARAMETER, not a constant, because the second layer belongs to the
 * system rather than to the mega menu: a new component that renders products
 * calls `readProductCardOverrides(data, 'featured_card')` and gets the same
 * gate, the same per-property inheritance and the same writers — without a
 * second copy of this file and without re-deciding what a card is.
 *
 * `mega_card` is the shipped instance and stays the default, so every value
 * already saved in a store keeps resolving exactly as before.
 */
export const PRODUCT_CARD_OVERRIDE_PREFIX = 'mega_card';

/** The state a component is in before its panel is ever opened — and the
 *  state the master gate restores, whatever stale values remain saved. */
export const PRODUCT_CARD_OVERRIDES_INHERIT: ProductCardOverrides = {
  customize: false,
  ratio: 'inherit',
  radius: 'inherit',
  shadow: 'inherit',
  font: 'inherit',
  cart: 'inherit',
  imgFit: 'inherit',
  imgPosition: 'inherit',
  hover: 'inherit',
  bg: '',
  imageBg: '',
  ink: '',
  badge: 'inherit',
  wishlist: 'inherit',
  desc: 'inherit',
  rating: 'inherit',
};

/** The radius choices the override panel offers. They are the global panel's
 *  own steps (an integer there, a list here because a list can say `inherit`). */
const RADIUS_CHOICES = ['inherit', '0', '8', '12', '18', '22', '28', '34', '44'] as const;

/** A colour override: only a real CSS colour, and never the global default
 *  (that value is how "back to inherit" looks in a picker that cannot be
 *  empty — the `headerVars` rule). */
function colourOverride(value: string, globalDefault: string): string {
  const colour = value.trim();
  if (!colour || colour === globalDefault) return '';
  return isCssColor(colour) ? colour : '';
}

export function readProductCardOverrides(
  settings: BlockData | undefined,
  prefix: string = PRODUCT_CARD_OVERRIDE_PREFIX
): ProductCardOverrides {
  /* The master gate is read FIRST and short-circuits: a component switched
     back to "Inherit Global" ignores its own saved locals entirely, so the
     gate is a real reset and not a cosmetic one. */
  if (!readBoolean(settings, 'customize', prefix, false)) {
    return PRODUCT_CARD_OVERRIDES_INHERIT;
  }
  const d = PRODUCT_CARD_DEFAULTS;
  const choice = (key: string): string => readText(settings, key, prefix, 'inherit');

  const rawRadius = readText(settings, 'radius', prefix, 'inherit');
  const radius: 'inherit' | number = (RADIUS_CHOICES as readonly string[]).includes(rawRadius)
    ? rawRadius === 'inherit'
      ? 'inherit'
      : Number(rawRadius)
    : 'inherit';

  const tri = (key: string): ProductCardTriState => {
    const raw = choice(key);
    return raw === 'on' || raw === 'off' ? raw : 'inherit';
  };
  const oneOf = <T extends string>(raw: string, allowed: readonly T[], fallback: T): T =>
    (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

  return {
    customize: true,
    ratio: oneOf(choice('ratio'), [
      'inherit',
      'square',
      'landscape',
      'portrait',
    ] as const, 'inherit'),
    radius,
    shadow: oneOf(choice('shadow'), [
      'inherit',
      'none',
      'soft',
      'lift',
    ] as const, 'inherit'),
    font: oneOf(choice('font'), [
      'inherit',
      'main',
      'serif',
    ] as const, 'inherit'),
    cart: oneOf(choice('cart'), [
      'inherit',
      'circle',
      'bar',
    ] as const, 'inherit'),
    imgFit: oneOf(choice('img_fit'), [
      'inherit',
      'cover',
      'contain',
    ] as const, 'inherit'),
    imgPosition: oneOf(choice('img_position'), [
      'inherit',
      'center',
      'top',
      'bottom',
    ] as const, 'inherit'),
    hover: oneOf(choice('hover'), [
      'inherit',
      'both',
      'lift',
      'zoom',
      'none',
    ] as const, 'inherit'),
    bg: colourOverride(readText(settings, 'bg', prefix, ''), d.bg),
    imageBg: colourOverride(readText(settings, 'image_bg', prefix, ''), d.imageBg),
    ink: colourOverride(readText(settings, 'ink', prefix, ''), d.ink),
    badge: tri('badge'),
    wishlist: tri('wishlist'),
    desc: tri('desc'),
    rating: tri('rating'),
  };
}

/**
 * The resolved settings a component's cards actually render with.
 *
 * Per property: the override when there is one, the global value when there is
 * not. Everything the component cannot override (the gallery, the review
 * count, the line count, the cart style) passes the global value through — a
 * mega card has no gallery by design, and the properties with no local
 * rendering in a component are deliberately not overridable there.
 */
export function resolveProductCardSettings(
  global: ProductCardSettings,
  ov: ProductCardOverrides
): ProductCardSettings {
  const from = (local: ProductCardTriState, base: boolean): boolean =>
    local === 'inherit' ? base : local === 'on';
  return {
    ...global,
    badge: from(ov.badge, global.badge),
    wishlist: from(ov.wishlist, global.wishlist),
    desc: from(ov.desc, global.desc),
    rating: from(ov.rating, global.rating),
    ratio: ov.ratio === 'inherit' ? global.ratio : ov.ratio,
    radius: ov.radius === 'inherit' ? global.radius : ov.radius,
    shadow: ov.shadow === 'inherit' ? global.shadow : ov.shadow,
    font: ov.font === 'inherit' ? global.font : ov.font,
    cart: ov.cart === 'inherit' ? global.cart : ov.cart,
    imgFit: ov.imgFit === 'inherit' ? global.imgFit : ov.imgFit,
    imgPosition: ov.imgPosition === 'inherit' ? global.imgPosition : ov.imgPosition,
    hover: ov.hover === 'inherit' ? global.hover : ov.hover,
    bg: ov.bg || global.bg,
    imageBg: ov.imageBg || global.imageBg,
    ink: ov.ink || global.ink,
  };
}

/**
 * The custom properties an override writes on the component's subtree root —
 * **only the overridden ones**. Inheritance is the absence of a declaration,
 * so an untouched property never carries a copy of the global value that
 * could rot. `--bg-card` is re-pointed beside `--pc-bg` because the mega
 * card's panel reads the chain's card level (`--bg-card`), which is computed
 * on `.app-inner`; the night block re-points both ON the card itself, so a
 * colour override stays a day-only decision exactly like the global colours.
 */
export function productCardOverrideVars(ov: ProductCardOverrides): Record<string, string> {
  const vars: Record<string, string> = {};
  if (ov.ratio !== 'inherit') {
    vars['--pc-ar-num'] = RATIO_GEOMETRY[ov.ratio].num;
    vars['--pc-ar-pad'] = RATIO_GEOMETRY[ov.ratio].pad;
  }
  if (ov.radius !== 'inherit') vars['--pc-radius'] = `${ov.radius}px`;
  /* the image presentation and the hover geometry travel as variables, not
     attributes: they are inherited values on the component's subtree, so one
     declaration reaches the card's plate, its photo and its gallery slides
     without a second scoped rule per property. */
  if (ov.imgFit !== 'inherit') vars['--pc-img-fit'] = ov.imgFit;
  if (ov.imgPosition !== 'inherit') vars['--pc-img-pos'] = ov.imgPosition;
  if (ov.hover !== 'inherit') {
    vars['--pc-hover-lift'] = HOVER_GEOMETRY[ov.hover].lift;
    vars['--pc-img-zoom'] = HOVER_GEOMETRY[ov.hover].zoom;
  }
  if (ov.bg) {
    vars['--pc-bg'] = ov.bg;
    vars['--bg-card'] = ov.bg;
  }
  if (ov.imageBg) vars['--pc-image-bg'] = ov.imageBg;
  if (ov.ink) vars['--pc-ink'] = ov.ink;
  return vars;
}

/**
 * The data attributes an override writes on the component's subtree root.
 *
 * Shadow and title font are attribute-driven in the stylesheet (the card's
 * own rules key off `[data-pc-shadow]` / `[data-pc-font]`), and an attribute
 * on a nearer ancestor does not beat a same-specificity rule on a farther
 * one — so the stylesheet carries explicitly scoped rules for the override
 * host. The switches (badge / wishlist / desc / rating) need no attribute:
 * the curtain's cards are React markup reading the resolved context.
 */
export function productCardOverrideAttrs(ov: ProductCardOverrides): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (ov.shadow !== 'inherit') attrs['data-pc-shadow'] = ov.shadow;
  if (ov.font !== 'inherit') attrs['data-pc-font'] = ov.font;
  if (ov.cart !== 'inherit') attrs['data-pc-cart'] = ov.cart;
  return attrs;
}
