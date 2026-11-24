/**
 * The product badge — one rule, every card.
 *
 * Before this file the two card surfaces each decided the tag for themselves,
 * and they disagreed in both directions:
 *
 *  - the store card printed the engine's promotion title and **nothing else**,
 *    so a product discounted without a Salla promotion wore no tag at all —
 *    and a sold-out product looked exactly like an available one;
 *  - the mega menu card ignored the merchant's promotion title and computed a
 *    `-60%` pill, so the same product read «خصم 6%» in the grid and «-60%» in
 *    the menu.
 *
 * Both are now the same function, with one priority order — the engine's own
 * first, because the theme REPLACES the engine's tag rather than sitting
 * beside it (the tag now hangs over the card's top edge, which the engine's
 * node, inside the clipped print, can never do):
 *
 *   1. **a pre-order label** — the engine prints `product.preorder.label`
 *      ahead of everything, and it is a promise the customer is shopping for;
 *   2. **out of stock** — a percentage off something nobody can buy is a lie,
 *      so availability outranks every promotion;
 *   3. **the merchant's promotion title** — their own words win over a number
 *      the theme computed from two prices;
 *   4. **a computed discount** — only when the two prices are real numbers and
 *      the sale price is genuinely lower. `is_on_sale` can be true with two
 *      equal prices, and `-0%` is worse than no tag;
 *   5. nothing.
 *
 * No data is invented: if the numbers do not parse, no tag is rendered.
 */

import { saleBadgeText } from './productBadgeStyle';

/** The fields a badge decision needs. Both card surfaces receive a superset. */
export interface ProductBadgeInput {
  /** `'sale' | 'out' | 'out-and-notify' | 'hidden'`. */
  status?: string | null;
  /** A pre-order campaign's own label («متوفر للطلب المسبق»). The engine prints
   *  it in the same slot as the promotion title, and it is the one piece of the
   *  engine's tag the theme does not compute — so it is read here, first, in the
   *  engine's own order. */
  preorder?: { label?: string | null } | null;
  /** What the customer pays — the ORIGINAL price on a discounted list row. */
  price?: string | number | null;
  /** The price before the discount, when the payload carries it. */
  regular_price?: string | number | null;
  /** The discounted price; `null` when the product is not on sale. */
  sale_price?: string | number | null;
  is_on_sale?: boolean | null;
  /** The merchant's own badge text. May be `''`. */
  promotion_title?: string | null;
}

export interface ProductBadge {
  /** What to print. */
  text: string;
  /** Out of stock — the one state that must not wear the sale colour. */
  out: boolean;
}

const OUT_STATUSES = ['out', 'out-and-notify'];

/**
 * The price a discount is measured against — and the one the struck line must
 * print.
 *
 * Two payload shapes reach the cards: a list row whose `price` is already the
 * payable figure (with the gross in `regular_price`), and a row whose `price`
 * IS the gross. `regular_price ?? price` covers both, and it is the only
 * expression that can be right in both — printing `price` alone printed «١٨٨»
 * struck beside a live «١٨٨» on the real store. Both the percentage and the
 * struck line read this one function, so they can never describe two different
 * reductions.
 */
export function originalPrice(product: ProductBadgeInput): number | null {
  const gross = Number(product.regular_price ?? product.price ?? NaN);
  return Number.isFinite(gross) && gross > 0 ? gross : null;
}

/**
 * What the customer actually pays.
 *
 * THE TWO PAYLOADS DISAGREE. A LIST row keeps the gross in `price` and the
 * reduction in `sale_price` (200 / 120). A DETAIL row has already moved the
 * payable figure into `price` and leaves `sale_price` EQUAL to it — the real
 * store sends 188 / 188 beside `regular_price: 199`. A panel that tests
 * `sale_price < price` therefore sees "no sale" on the one surface that has
 * the most room to say otherwise.
 *
 * The lower of the two is right in both shapes, and it can never invent a
 * reduction: a full-price product has nothing lower to take.
 */
export function payablePrice(product: ProductBadgeInput): number {
  const listed = Number(product.price ?? NaN) || 0;
  const discounted = Number(product.sale_price ?? NaN) || 0;
  const gross = originalPrice(product);
  if (gross !== null && discounted > 0 && discounted < gross) return discounted;
  return listed || gross || 0;
}

/** The whole-number discount, or `0` when there is no real discount. */
export function discountPercent(product: ProductBadgeInput): number {
  /* `is_on_sale` is the platform's own answer to "is this discounted", and the
     type says to check it rather than the price fields — a detail response
     sends `sale_price: 0` for a full-price product, and two prices can be equal
     while the flag is still true. Both cards read this one function, so the
     struck price and the `-N%` pill can never disagree. */
  if (!product.is_on_sale) return 0;
  /* `regular_price` is the documented "price before the discount"; list rows
     also carry the original in `price`. Either is a valid gross, and a payload
     with neither is simply not a discount we can prove. */
  const gross = originalPrice(product);
  const net = Number(product.sale_price ?? NaN);
  if (gross == null || !Number.isFinite(net)) return 0;
  if (net <= 0 || net >= gross) return 0;
  return Math.round((1 - net / gross) * 100);
}

export function productBadge(
  product: ProductBadgeInput | undefined,
  outOfStockLabel: string,
  saleTemplate: string = '-{value}%'
): ProductBadge | null {
  if (!product) return null;

  /* The pre-order campaign's label comes first, exactly as the engine orders
     it: a product you can only pre-order is the one fact that changes the
     purchase, and it is not a promotion the theme may outrank. */
  const preorder = (product.preorder?.label ?? '').trim();
  if (preorder) return { text: preorder, out: false };

  if (OUT_STATUSES.includes(product.status ?? '')) {
    return { text: outOfStockLabel, out: true };
  }

  const promo = (product.promotion_title ?? '').trim();
  /* A merchant (or Salla's own promotion) writes «-22%» as often as «خصم ٢٢٪».
     A leading minus is a NEUTRAL character, so an RTL paragraph pushes it to the
     tail and the tag prints «22%-» — the same defect the computed badge had, and
     the same one-line answer: isolate only when the string actually opens with a
     sign or a digit, so an Arabic label is never touched. */
  if (promo) {
    const numeric = /^[-\d]/.test(promo);
    return { text: numeric ? `\u2066${promo}\u2069` : promo, out: false };
  }

  const cut = discountPercent(product);
  /* The figure is the theme's own arithmetic; the WORDING around it is the
     merchant's (`product_card_badge_sale_template`, «خصم {value}%» or the
     platform's «-{value}%»). `saleBadgeText` does the substitution and the
     bidi isolation — see `lib/productBadgeStyle`. */
  if (cut > 0) return { text: saleBadgeText(saleTemplate, cut), out: false };

  return null;
}
