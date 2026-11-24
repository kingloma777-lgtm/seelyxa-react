import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MorphMenuCard, type MenuCardProduct } from '../../../app/components/product/MorphMenuCard';
import {
  PRODUCT_CARD_DEFAULTS,
  ProductCardSettingsContext,
  type ProductCardSettings,
} from '../../../app/lib/productCardSettings';

const wishlistState = { ids: [] as number[], toggle: vi.fn() };
const addButtonProps: Record<string, unknown>[] = [];

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <a href={String(to)} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => `${String(value ?? '')} ر.س` }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({
    has: (id: number) => wishlistState.ids.includes(id),
    toggle: wishlistState.toggle,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));

vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    addButtonProps.push(props);
    return (
      <div data-testid="add-button" data-product={String(props.productId)}>
        {props.children}
      </div>
    );
  },
}));

const PRODUCT: MenuCardProduct = {
  id: 1303461379,
  name: 'كرسي جلد بقوائم خشبية',
  url: '/ar/p1303461379',
  description: '<p>شكل جميل وبسيط <b>يناسب</b> أي مكان في المنزل.</p>',
  price: 199,
  is_on_sale: false,
  status: 'sale',
  type: 'product',
  image: { url: 'chair.jpg' },
};

beforeEach(() => {
  wishlistState.ids = [];
  wishlistState.toggle = vi.fn();
  addButtonProps.length = 0;
});

describe('MorphMenuCard', () => {
  it('renders the store card’s TWO OBJECTS: a print, then a label', () => {
    const { container } = render(<MorphMenuCard product={PRODUCT} />);
    const media = container.querySelector('.morph-menu-card__media');
    expect(media?.querySelector('img')?.getAttribute('src')).toBe('chair.jpg');
    /* the print carries the tag and the heart, the label carries the reading
       order — the same split the store card makes */
    expect(media?.closest('.morph-menu-card')).toBeTruthy();
    expect(container.querySelector('.morph-menu-card__body')).toBeTruthy();
    expect(container.querySelector('.morph-menu-card__meta')).toBeTruthy();
    expect(container.querySelector('.morph-menu-card__name')?.textContent).toBe(
      'كرسي جلد بقوائم خشبية'
    );
    // markup stripped, whitespace collapsed — the card shows text, not HTML
    expect(container.querySelector('.morph-menu-card__desc')?.textContent).toBe(
      'شكل جميل وبسيط يناسب أي مكان في المنزل.'
    );
    expect(container.querySelector('.morph-menu-card__now')?.textContent).toBe('199 ر.س');
    // no reduction → no struck price and no badge (never invented data)
    expect(container.querySelector('.morph-menu-card__was')).toBeNull();
    expect(container.querySelector('.morph-menu-card__badge')).toBeNull();
  });

  it('keeps the action INSIDE the label, which is what lets the disc straddle the seam', () => {
    /* `__actions` is absolutely positioned at `top: -44px` and the label's top
       edge IS the print's bottom edge — so the disc needs no arithmetic on the
       photo's ratio. Move the node out of `__body` and it measures from
       somewhere else and lands on the price. */
    const { container } = render(<MorphMenuCard product={PRODUCT} />);
    const actions = container.querySelector('.morph-menu-card__actions');
    expect(actions?.parentElement?.classList.contains('morph-menu-card__body')).toBe(true);
    expect(actions?.querySelector('[data-testid="add-button"]')).toBeTruthy();
  });

  it('prints the maker’s mark at the rail’s start, before the score', () => {
    const { container } = render(
      <MorphMenuCard
        product={{ ...PRODUCT, brand: { name: 'دار عود' }, rating: { stars: 4.5, count: 89 } }}
      />
    );
    const rail = container.querySelector('.morph-menu-card__meta');
    expect(rail?.querySelector('.pc-brand')?.textContent).toBe('دار عود');
    /* the maker leads: it is the first element in the rail, so no `order`
       trick is needed on this surface */
    expect(rail?.firstElementChild?.classList.contains('pc-brand')).toBe(true);
    expect(rail?.querySelector('.morph-menu-card__rating')?.textContent).toContain('4.5');
  });

  it('prints no brand span when the list sent none', () => {
    const { container } = render(<MorphMenuCard product={PRODUCT} />);
    expect(container.querySelector('.pc-brand')).toBeNull();
    /* the rail still exists — it is the label's reserved first row, and the
       stylesheet needs a box to place there */
    expect(container.querySelector('.morph-menu-card__meta')).toBeTruthy();
  });

  it('shows the sale price when the product is on sale', () => {
    const { container } = render(
      <MorphMenuCard product={{ ...PRODUCT, is_on_sale: true, sale_price: 149 }} />
    );
    /* the sale card now prints BOTH prices: the new one in `__now`, the old
       one struck through in `__was`. The card used to show only the sale price,
       so a shopper had no way to see there was a reduction at all. */
    expect(container.querySelector('.morph-menu-card__now')?.textContent).toBe('149 ر.س');
    expect(container.querySelector('.morph-menu-card__was')?.textContent).toBe('199 ر.س');
  });

  it('prefers the merchant subtitle over the long description', () => {
    const { container } = render(
      <MorphMenuCard product={{ ...PRODUCT, subtitle: 'مريح وخفيف' }} />
    );
    expect(container.querySelector('.morph-menu-card__desc')?.textContent).toBe('مريح وخفيف');
  });

  it('strips a DOUBLE-escaped description instead of printing its markup', () => {
    // the merchant's editor escapes the paragraph before saving, so the row
    // arrives as `&lt;p class=&quot;ql-direction-rtl&quot;&gt;…` — a stripper
    // that only looks for `<` finds none and the card printed the whole tag
    const { container } = render(
      <MorphMenuCard
        product={{
          ...PRODUCT,
          subtitle: '&lt;p class=&quot;ql-direction-rtl&quot;&gt;مريح وخفيف&lt;/p&gt;',
        }}
      />
    );
    expect(container.querySelector('.morph-menu-card__desc')?.textContent).toBe('مريح وخفيف');
  });

  it('hands the platform the product it must add (and its status/type)', () => {
    render(<MorphMenuCard product={PRODUCT} />);
    expect(addButtonProps).toHaveLength(1);
    expect(addButtonProps[0]).toMatchObject({
      productId: 1303461379,
      productStatus: 'sale',
      productType: 'product',
      fill: 'solid',
    });
  });

  it('the wishlist disc toggles the product and reads as added when it is', () => {
    const { container, rerender } = render(<MorphMenuCard product={PRODUCT} />);
    const heart = container.querySelector('.morph-menu-card__fav') as HTMLElement;
    expect(heart.classList.contains('is-fav')).toBe(false);

    fireEvent.click(heart);
    expect(wishlistState.toggle).toHaveBeenCalledWith(1303461379);

    wishlistState.ids = [1303461379];
    rerender(<MorphMenuCard product={PRODUCT} />);
    expect(container.querySelector('.morph-menu-card__fav')?.classList.contains('is-fav')).toBe(
      true
    );
  });

  it('a product with no picture keeps the disc (and does not print a broken img)', () => {
    const { container } = render(<MorphMenuCard product={{ ...PRODUCT, image: null }} />);
    expect(container.querySelector('.morph-menu-card__media img')).toBeNull();
    expect(container.querySelector('.morph-menu-card__media-empty')).toBeTruthy();
  });

  /* ── the store card's anatomy ─────────────────────────────────────────── */

  it('puts the heart on the picture corner as a SIBLING of the link', () => {
    /* A button nested inside the photo link is invalid HTML and creates two
       interactive targets on top of each other — the store card does not do
       it either. */
    const { container } = render(<MorphMenuCard product={PRODUCT} />);
    const heart = container.querySelector('.morph-menu-card__fav');
    expect(heart?.closest('.morph-menu-card__media')).toBeTruthy();
    expect(heart?.closest('a')).toBeNull();
    expect(container.querySelector('.morph-menu-card__media-link')).toBeTruthy();
  });

  it('prints the store star row only from a rating the list actually sent', () => {
    const { container, rerender } = render(
      <MorphMenuCard product={{ ...PRODUCT, rating: { stars: 4.5, count: 89 } }} />
    );
    const row = container.querySelector('.morph-menu-card__rating');
    expect(row?.textContent).toContain('4.5');
    expect(row?.getAttribute('data-count')).toBe('89');

    rerender(<MorphMenuCard product={PRODUCT} />);
    /* No rating in the row — and no «لا تقييمات» line either, because the
       wording is opt-in now: an absent score simply leaves the rail without a
       second half. No detail request is made here to invent an average. */
    expect(container.querySelector('.morph-menu-card__rating')).toBeNull();
    /* the rail itself stays, so the name below it keeps its baseline */
    expect(container.querySelector('.morph-menu-card__meta')).toBeTruthy();
  });

  const settingsCard = (
    product: MenuCardProduct,
    overrides: Partial<ProductCardSettings> = {}
  ) => (
    <ProductCardSettingsContext.Provider
      value={{ ...PRODUCT_CARD_DEFAULTS, ...overrides }}
    >
      <MorphMenuCard product={product} />
    </ProductCardSettingsContext.Provider>
  );

  it('honours the SAME merchant switches as the store card', () => {
    const onSale = { ...PRODUCT, is_on_sale: true, sale_price: 149 };
    const off = {
      badge: false,
      desc: false,
      rating: false,
      wishlist: false,
    };
    const { container } = render(settingsCard(onSale, off));
    expect(container.querySelector('.morph-menu-card__badge')).toBeNull();
    expect(container.querySelector('.morph-menu-card__desc')).toBeNull();
    expect(container.querySelector('.morph-menu-card__fav')).toBeNull();
    expect(container.querySelector('.morph-menu-card__rating')).toBeNull();
    // the price is not a switch — it stays
    expect(container.querySelector('.morph-menu-card__now')?.textContent).toBe('149 ر.س');
  });

  it('shows the merchant’s no-ratings line instead of inventing an average', () => {
    /* opt-in: the label no longer depends on the row, so the wording is the
       merchant's choice rather than a default every card announces */
    const { container } = render(settingsCard(PRODUCT, { ratingEmpty: true }));
    const row = container.querySelector('.morph-menu-card__rating');
    expect(row?.classList.contains('morph-menu-card__rating--empty')).toBe(true);
    expect(row?.textContent).toContain('لا تقييمات');
    expect(row?.getAttribute('data-count')).toBeNull();
  });

  it('keeps the cart button’s accessible name when the glyph is a CSS mask', () => {
    const { container } = render(<MorphMenuCard product={PRODUCT} />);
    expect(container.querySelector('[data-testid="add-button"]')?.textContent).toBe(
      'أضف لسلة الشراء'
    );
  });
});
