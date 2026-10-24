import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MorphMenuCard, type MenuCardProduct } from '../../../app/components/product/MorphMenuCard';

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
  it('renders the reference anatomy: circular picture, name, blurb, price', () => {
    const { container } = render(<MorphMenuCard product={PRODUCT} />);
    const media = container.querySelector('.morph-menu-card__media');
    expect(media?.querySelector('img')?.getAttribute('src')).toBe('chair.jpg');
    expect(container.querySelector('.morph-menu-card__name')?.textContent).toBe(
      'كرسي جلد بقوائم خشبية'
    );
    // markup stripped, whitespace collapsed — the card shows text, not HTML
    expect(container.querySelector('.morph-menu-card__desc')?.textContent).toBe(
      'شكل جميل وبسيط يناسب أي مكان في المنزل.'
    );
    expect(container.querySelector('.morph-menu-card__price')?.textContent).toBe('199 ر.س');
  });

  it('shows the sale price when the product is on sale', () => {
    const { container } = render(
      <MorphMenuCard product={{ ...PRODUCT, is_on_sale: true, sale_price: 149 }} />
    );
    expect(container.querySelector('.morph-menu-card__price')?.textContent).toBe('149 ر.س');
  });

  it('prefers the merchant subtitle over the long description', () => {
    const { container } = render(
      <MorphMenuCard product={{ ...PRODUCT, subtitle: 'مريح وخفيف' }} />
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
});
