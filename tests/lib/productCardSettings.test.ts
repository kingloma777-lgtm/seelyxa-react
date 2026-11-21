import { describe, it, expect } from 'vitest';
import {
  readProductCardSettings,
  productCardVars,
  productCardFlags,
  PRODUCT_CARD_DEFAULTS,
} from '../../app/lib/productCardSettings';

/**
 * The card settings are read once and pushed into CSS, so a wrong read is not
 * a visible error — it is a control that does nothing. These pin the three
 * shapes the engine actually sends (scalar, `[{value}]`, number) and the two
 * clamps that keep a saved out-of-range value from breaking the layout.
 */

describe('readProductCardSettings', () => {
  it('returns the reference design when the store has never opened the panel', () => {
    expect(readProductCardSettings(undefined)).toEqual(PRODUCT_CARD_DEFAULTS);
    expect(readProductCardSettings({})).toEqual(PRODUCT_CARD_DEFAULTS);
  });

  it('reads booleans, dropdown items and numbers by their prefixed field id', () => {
    const s = readProductCardSettings({
      product_card_badge: false,
      product_card_rating: true,
      product_card_desc: false,
      product_card_wishlist: false,
      product_card_cart_style: [{ label: 'شريط', value: 'bar', key: 'x' }],
      product_card_radius: 6,
      product_card_bg: '#101010',
      product_card_shadow: 'lift',
      product_card_title_font: 'serif',
      product_card_img_ratio: 'portrait',
    });

    expect(s.badge).toBe(false);
    expect(s.rating).toBe(true);
    expect(s.desc).toBe(false);
    expect(s.wishlist).toBe(false);
    expect(s.cart).toBe('bar');
    expect(s.radius).toBe(6);
    expect(s.bg).toBe('#101010');
    expect(s.shadow).toBe('lift');
    expect(s.font).toBe('serif');
    expect(s.ratio).toBe('portrait');
  });

  it('accepts a dropdown that arrives as a bare string, which is how preview data stores it', () => {
    const s = readProductCardSettings({ product_card_cart_style: 'bar' });
    expect(s.cart).toBe('bar');
  });

  it('defaults the gallery and the empty rating row to on — the design has both', () => {
    const s = readProductCardSettings(undefined);
    expect(s.gallery).toBe(true);
    expect(s.ratingEmpty).toBe(true);
    expect(readProductCardSettings({ product_card_gallery: false }).gallery).toBe(false);
    expect(readProductCardSettings({ product_card_rating_empty: false }).ratingEmpty).toBe(false);
  });

  it('clamps a saved radius and line count instead of trusting the payload', () => {
    expect(readProductCardSettings({ product_card_radius: 400 }).radius).toBe(44);
    expect(readProductCardSettings({ product_card_radius: -20 }).radius).toBe(0);
    expect(readProductCardSettings({ product_card_desc_lines: 0 }).descLines).toBe(1);
    expect(readProductCardSettings({ product_card_desc_lines: 9 }).descLines).toBe(4);
  });

  it('falls back to the default when a dropdown holds a value the theme does not know', () => {
    const s = readProductCardSettings({
      product_card_cart_style: 'diagonal',
      product_card_shadow: 'glow',
      product_card_title_font: 'comic',
      product_card_img_ratio: 'hexagon',
    });

    expect(s.cart).toBe(PRODUCT_CARD_DEFAULTS.cart);
    expect(s.shadow).toBe(PRODUCT_CARD_DEFAULTS.shadow);
    expect(s.font).toBe(PRODUCT_CARD_DEFAULTS.font);
    expect(s.ratio).toBe(PRODUCT_CARD_DEFAULTS.ratio);
  });

  it('keeps the merchant colour and does not read an empty string as "use the default"', () => {
    // an unset colour must not become transparent
    expect(readProductCardSettings({ product_card_bg: '' }).bg).toBe(PRODUCT_CARD_DEFAULTS.bg);
    expect(readProductCardSettings({ product_card_bg: '#123456' }).bg).toBe('#123456');
  });
});

describe('productCardVars', () => {
  it('writes the radius in px and the line clamp as a unitless number', () => {
    const vars = productCardVars(readProductCardSettings({ product_card_radius: 18, product_card_desc_lines: 3 }));
    expect(vars['--pc-radius']).toBe('18px');
    // `-webkit-line-clamp: 3px` is invalid and silently drops the clamp
    expect(vars['--pc-desc-lines']).toBe('3');
  });

  it('leaves the DEFAULT corner and panel on the store’s roles', () => {
    /* The card is the largest surface on the storefront, and it used to be
       pinned to `22px` / `#fdfaf3` no matter what the store settings said — so
       `global_radius` and `global_surface_preset` moved every element on the
       page except the one the customer is looking at. The default is now a
       reference with the designed value as its fallback; anything the merchant
       actually picks in the card panel is still a literal that wins. */
    const vars = productCardVars(readProductCardSettings({}));
    expect(vars['--pc-radius']).toBe('var(--radius-card, 22px)');
    expect(vars['--pc-bg']).toBe('var(--gs-card-surface, #fdfaf3)');

    // a chosen value is written verbatim, so the card setting stays in charge
    const chosen = productCardVars(
      readProductCardSettings({ product_card_radius: 0, product_card_bg: '#101010' })
    );
    expect(chosen['--pc-radius']).toBe('0px');
    expect(chosen['--pc-bg']).toBe('#101010');
  });
});

describe('productCardFlags', () => {
  it('turns every switch into 0/1 and every choice into its own value', () => {
    const flags = productCardFlags(
      readProductCardSettings({
        product_card_badge: false,
      product_card_rating: false,
      product_card_rating_count: false,
      product_card_rating_empty: false,
      product_card_desc: false,
        product_card_wishlist: false,
        product_card_cart_style: 'bar',
        product_card_shadow: 'none',
        product_card_title_font: 'serif',
      })
    );

    expect(flags).toMatchObject({
      'data-pc-badge': '0',
      'data-pc-rating': '0',
      'data-pc-rating-count': '0',
      'data-pc-rating-empty': '0',
      'data-pc-desc': '0',
      'data-pc-wish': '0',
      'data-pc-cart': 'bar',
      'data-pc-shadow': 'none',
      'data-pc-font': 'serif',
    });
  });
});
