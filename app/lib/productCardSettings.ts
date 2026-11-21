import { createContext, useContext } from 'react';
import { readBoolean, readNumber, readText, type BlockData } from './homeBlock';

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

export interface ProductCardSettings {
  /** The merchant's promotion badge / pre-order label on the image. */
  badge: boolean;
  /** The star row. */
  rating: boolean;
  /** `(89)` after the stars — meaningless without `rating`. */
  ratingCount: boolean;
  /** What to print in the rating row for a product with no reviews at all.
   *  The engine renders *no row* in that case (`product.rating?.stars && …`),
   *  so a store whose products are unreviewed loses the row from every card
   *  and the merchant reads it as a broken rating. */
  ratingEmpty: boolean;
  /** The short line under the name. */
  desc: boolean;
  /** How many lines that short line may take before it ellipses. */
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
}

const PREFIX = 'product_card';

const oneOf = <T extends string>(raw: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

/** Defaults are the reference design's own numbers, so a store that never
 *  opens the panel still gets the card the merchant asked for. */
export const PRODUCT_CARD_DEFAULTS: ProductCardSettings = {
  badge: true,
  rating: true,
  ratingCount: true,
  ratingEmpty: true,
  desc: true,
  descLines: 2,
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
  };
}

/** The switches that change *which elements exist*, as data attributes — CSS
 *  reads them, so the markup stays the engine's and nothing re-renders. */
export function productCardFlags(s: ProductCardSettings): Record<string, string> {
  return {
    'data-pc-badge': s.badge ? '1' : '0',
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
