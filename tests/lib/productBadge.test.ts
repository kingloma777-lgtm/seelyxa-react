import { describe, it, expect } from 'vitest';
import { discountPercent, payablePrice, productBadge } from '../../app/lib/productBadge';

/**
 * One badge rule, two card surfaces.
 *
 * Before this, the store card printed the engine's promotion title and nothing
 * else — so a discounted product without a Salla promotion wore no tag in the
 * grid, and a sold-out product looked available. The mega menu card computed a
 * `-60%` pill and ignored the merchant's own wording. The same product read
 * differently in two places, which is exactly what a "global card system" is
 * supposed to make impossible.
 *
 * These pin the priority order and the refusal to invent data.
 */

const OUT = 'نفدت الكمية';

/* The computed cut is wrapped in U+2066/U+2069 (LRI/PDI) so an Arabic page does
   not flip «-22%» into «22%-». Spelled out here rather than pasted as invisible
   characters, so the expectation stays readable and a regression shows up as a
   diff instead of a silent glyph. */
const ltr = (value: string) => `\u2066${value}\u2069`;

describe('discountPercent', () => {
  it('computes the whole-number cut from the two real prices', () => {
    expect(
      discountPercent({ is_on_sale: true, regular_price: 436, sale_price: 174 })
    ).toBe(60);
    expect(discountPercent({ is_on_sale: true, price: 200, sale_price: 150 })).toBe(25);
  });

  it('prefers regular_price as the gross, and falls back to price', () => {
    /* a list row can carry both; `regular_price` is the documented "before" */
    expect(
      discountPercent({ is_on_sale: true, regular_price: 100, price: 90, sale_price: 50 })
    ).toBe(50);
  });

  it('refuses a "discount" that is not one', () => {
    expect(discountPercent({ is_on_sale: true, price: 100, sale_price: 100 })).toBe(0);
    expect(discountPercent({ is_on_sale: true, price: 100, sale_price: 120 })).toBe(0);
    /* `-0%` is worse than no tag */
    expect(discountPercent({ is_on_sale: true, price: 100, sale_price: 99.9 })).toBe(0);
  });

  it('trusts is_on_sale over the price fields', () => {
    /* A detail response sends `sale_price: 0` for a full-price product, and
       two prices can differ while the platform says it is not on sale. */
    expect(discountPercent({ is_on_sale: false, price: 200, sale_price: 100 })).toBe(0);
    expect(discountPercent({ price: 200, sale_price: 100 })).toBe(0);
    expect(discountPercent({ is_on_sale: true, price: 200, sale_price: 0 })).toBe(0);
  });

  it('returns 0 rather than NaN for a payload that does not parse', () => {
    expect(discountPercent({ is_on_sale: true })).toBe(0);
    expect(discountPercent({ is_on_sale: true, price: 'abc', sale_price: 10 })).toBe(0);
  });
});

describe('productBadge', () => {
  it('prints nothing for a full-price product with no promotion', () => {
    expect(productBadge({ status: 'sale', price: 100 }, OUT)).toBeNull();
    expect(productBadge(undefined, OUT)).toBeNull();
  });

  it('lets availability outrank a promotion — a discount nobody can buy is a lie', () => {
    expect(
      productBadge(
        { status: 'out', is_on_sale: true, price: 200, sale_price: 100, promotion_title: 'عرض' },
        OUT
      )
    ).toEqual({ text: OUT, out: true });
    expect(productBadge({ status: 'out-and-notify', price: 10 }, OUT)).toEqual({
      text: OUT,
      out: true,
    });
  });

  it('lets the merchant’s own wording outrank a computed percentage', () => {
    expect(
      productBadge(
        { status: 'sale', is_on_sale: true, price: 200, sale_price: 100, promotion_title: 'خصم 6%' },
        OUT
      )
    ).toEqual({ text: 'خصم 6%', out: false });
  });

  it('falls back to the computed cut when there is no promotion title', () => {
    expect(
      productBadge({ status: 'sale', is_on_sale: true, price: 436, sale_price: 174 }, OUT)
    ).toEqual({ text: ltr('-60%'), out: false });
  });

  it('prints a pre-order label before anything else, as the engine does', () => {
    /* The theme REPLACES the engine's tag (it hangs over the card's top edge,
       which the engine's node — inside the clipped print — can never do), so
       every word the engine printed has to survive here. The pre-order label is
       the first thing it printed, and it is the one fact that changes the
       purchase. */
    expect(
      productBadge(
        {
          status: 'sale',
          is_on_sale: true,
          price: 200,
          sale_price: 100,
          promotion_title: 'خصم 6%',
          preorder: { label: 'متوفر للطلب المسبق' },
        },
        OUT
      )
    ).toEqual({ text: 'متوفر للطلب المسبق', out: false });
  });

  it('never lets an empty pre-order label blank the tag', () => {
    expect(
      productBadge(
        {
          status: 'out',
          is_on_sale: false,
          preorder: { label: '   ' },
        },
        OUT
      )
    ).toEqual({ text: OUT, out: true });
  });
});

/**
 * The quick view prints three numbers — payable, struck, saved — and the two
 * API payloads hand them over in different shapes. A panel that reads only one
 * shape shows a full price beside a struck price, or hides the reduction on the
 * surface with the most room to explain it.
 */
describe('payablePrice', () => {
  it('reads a LIST row: the gross in `price`, the reduction in `sale_price`', () => {
    expect(payablePrice({ is_on_sale: true, price: 200, regular_price: 200, sale_price: 120 })).toBe(120);
  });

  it('reads a DETAIL row: `price` is ALREADY the payable figure', () => {
    /* the real store sends 188 / 188 beside `regular_price: 199` */
    expect(payablePrice({ is_on_sale: true, price: 188, regular_price: 199, sale_price: 188 })).toBe(188);
  });

  it('never invents a reduction on a full-price product', () => {
    expect(payablePrice({ is_on_sale: false, price: 199, regular_price: 199, sale_price: 199 })).toBe(199);
    /* `sale_price: 0` is what the detail endpoint sends for "no sale" */
    expect(payablePrice({ is_on_sale: false, price: 199, sale_price: 0 })).toBe(199);
    /* a variant product can carry a gross above its price without being on sale */
    expect(payablePrice({ is_on_sale: false, price: 199, regular_price: 260 })).toBe(199);
  });

  it('falls back to the gross when `price` is missing', () => {
    expect(payablePrice({ regular_price: 450, sale_price: null })).toBe(450);
    expect(payablePrice({})).toBe(0);
  });
});
