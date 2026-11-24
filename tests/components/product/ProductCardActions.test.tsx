import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductCard } from '../../../app/components/product/ProductCard';
import {
  ProductCardSettingsContext,
  readProductCardSettings,
} from '../../../app/lib/productCardSettings';
import { clearCompare, getCompareItems } from '../../../app/lib/compare';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The four buttons on the card must DO the four things they look like they do.
 * The wishlist hook, the money formatter, the add-to-cart element and the
 * related-products request are all mocked at their boundary — what is asserted
 * is the wiring: which store each click reaches, with which id, and whether
 * the panel that opens is the right one.
 */

const state = vi.hoisted(() => ({
  settings: {} as Record<string, unknown>,
  wishIds: [] as number[],
  toggled: [] as number[],
  listParams: [] as Record<string, unknown>,
}));

vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: ({ product }: { product: { id: number; name: string } }) => (
    <div className="s-product-card s-product-card-vertical" data-testid="engine-card">
      <div className="s-product-card-image">
        <a href={`/p/${product.id}`}>
          <img src="photo.jpg" alt="" />
        </a>
        <button type="button" className="s-product-card-wishlist-btn" aria-label="engine wishlist" />
      </div>
      <div className="s-product-card-content">
        <div className="s-product-card-content-main">
          <h3 className="s-product-card-content-title">{product.name}</h3>
        </div>
        <div className="s-product-card-content-sub" />
        <div className="s-product-card-content-footer">
          <salla-add-product-button fill="outline" />
        </div>
      </div>
    </div>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      detail: (id: string) => ({
        queryKey: ['products', 'detail', id],
        queryFn: () =>
          Promise.resolve({
            id: Number(id),
            name: 'Test product',
            url: `/p/${id}`,
            price: 200,
            sale_price: 120,
            regular_price: 200,
            is_on_sale: true,
            category: { id: 7, name: 'عبايات', url: '/c/7' },
            description: '<p>قطعة أنيقة</p><ul><li>قصة فضفاضة</li></ul>',
            options: [
              {
                id: 7,
                name: 'المقاس',
                type: 'single-option',
                details: [
                  { id: 1, name: 'S' },
                  { id: 2, name: 'M' },
                ],
              },
            ],
            images: [{ url: 'a.jpg' }, { url: 'b.jpg' }],
          }),
      }),
      list: (params: Record<string, unknown>) => {
        state.listParams.push(params);
        return {
          queryKey: ['products', 'list', params],
          queryFn: () =>
            Promise.resolve({
              items: [
                { id: 91, name: 'Related one', url: '/p/91', price: 50, image: { url: 'r1.jpg' } },
                { id: 92, name: 'Related two', url: '/p/92', price: 60, image: { url: 'r2.jpg' } },
              ],
            }),
        };
      },
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    isRTL: true,
    locale: 'ar',
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({
    ids: state.wishIds,
    count: state.wishIds.length,
    has: (id: number) => state.wishIds.includes(id),
    add: async () => true,
    remove: async () => true,
    toggle: async (id: number) => {
      state.toggled.push(id);
    },
    loading: false,
    error: null,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: number) => `SAR ${amount}`,
    parse: (value: string) => Number(value),
    isValid: (value: unknown) => typeof value === 'number',
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={typeof to === 'string' ? to : '#'} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({ productId }: { productId: number }) => (
    <button type="button" data-testid="add-to-cart" data-product-id={productId}>
      add
    </button>
  ),
}));

vi.mock('@salla.sa/twilight-components-react/product-options', () => ({
  SallaProductOptionsCore: ({ productId, options }: { productId: number; options: string }) => (
    <salla-product-options data-product-id={productId} data-options={options}>
      <input type="radio" name="options[7]" value="a" defaultChecked />
      <input type="radio" name="options[7]" value="b" />
    </salla-product-options>
  ),
}));

vi.mock('@salla.sa/twilight-components-react/quantity-input', () => ({
  SallaQuantityInput: ({
    className,
    max,
    value,
  }: {
    className?: string;
    max?: number;
    value?: number;
  }) => (
    <salla-quantity-input className={className} max={max} name="quantity">
      <input type="number" name="quantity" defaultValue={String(value ?? 1)} min="1" />
    </salla-quantity-input>
  ),
}));

const base = {
  id: 42,
  name: 'Test product',
  url: '/p/42',
  price: 200,
  sale_price: 120,
  is_on_sale: true,
  image: { url: 'a.jpg' },
} as unknown as Product;

function renderCard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <ProductCardSettingsContext.Provider value={readProductCardSettings(state.settings)}>
        <ProductCard product={base} />
      </ProductCardSettingsContext.Provider>
    </QueryClientProvider>
  );
}

const railButton = (container: HTMLElement, label: string) =>
  container.querySelector<HTMLButtonElement>(`.pc-actions button[aria-label="${label}"]`);

const sallaState = vi.hoisted(() => ({
  getPrice: null as ReturnType<typeof vi.fn> | null,
  onSubmit: null as ReturnType<typeof vi.fn> | null,
}));

beforeEach(() => {
  cleanup();
  sallaState.getPrice = vi.fn(() => Promise.resolve({ data: { price: 90 } }));
  sallaState.onSubmit = vi.fn();
  (window as unknown as { salla: unknown }).salla = {
    config: { set: vi.fn() },
    onReady: () => Promise.resolve(),
    product: { getPrice: sallaState.getPrice },
    form: { onSubmit: sallaState.onSubmit },
  };
  state.settings = {};
  state.wishIds = [];
  state.toggled = [];
  state.listParams = [];
  clearCompare();
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ProductCardActions — the rail', () => {
  it('puts four controls in one group on the print', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    const rail = container.querySelector('.pc-actions');
    expect(rail?.closest('.s-product-card-image')).toBeTruthy();
    expect(rail?.querySelectorAll('button')).toHaveLength(4);
    expect(rail?.getAttribute('role')).toBe('group');
    expect(railButton(container, 'أضف إلى المفضلة')).toBeTruthy();
    expect(railButton(container, 'نظرة سريعة')).toBeTruthy();
    expect(railButton(container, 'أضف إلى المقارنة')).toBeTruthy();
    expect(railButton(container, 'منتجات مشابهة')).toBeTruthy();
  });

  it('drops the heart when the merchant turns the wishlist off, and keeps the rest', async () => {
    state.settings = { product_card_wishlist: false };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());
    expect(container.querySelectorAll('.pc-actions button')).toHaveLength(3);
    expect(railButton(container, 'أضف إلى المفضلة')).toBeNull();
  });

  it('sends the wishlist click to the engine’s wishlist store', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'أضف إلى المفضلة') as HTMLButtonElement);
    await waitFor(() => expect(state.toggled).toEqual([42]));
  });

  it('shows the saved heart as pressed', async () => {
    state.wishIds = [42];
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());
    const heart = railButton(container, 'إزالة من المفضلة');
    expect(heart?.getAttribute('aria-pressed')).toBe('true');
    expect(heart?.classList.contains('is-active')).toBe(true);
  });
});

describe('ProductCardActions — compare', () => {
  it('adds the product to the comparison and reflects the state', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'أضف إلى المقارنة') as HTMLButtonElement);

    await waitFor(() => expect(getCompareItems()).toHaveLength(1));
    expect(getCompareItems()[0]).toMatchObject({ id: 42, name: 'Test product', price: 120, regularPrice: 200 });
    await waitFor(() => expect(railButton(container, 'إزالة من المقارنة')).toBeTruthy());
    expect(railButton(container, 'إزالة من المقارنة')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('takes it out again on the second click', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'أضف إلى المقارنة') as HTMLButtonElement);
    await waitFor(() => expect(getCompareItems()).toHaveLength(1));

    fireEvent.click(railButton(container, 'إزالة من المقارنة') as HTMLButtonElement);
    await waitFor(() => expect(getCompareItems()).toHaveLength(0));
  });
});

describe('ProductCardActions — quick view', () => {
  it('opens the product panel with the price, the saving and the add button', async () => {
    const { container, findByRole, getByTestId } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'نظرة سريعة') as HTMLButtonElement);

    const dialog = await findByRole('dialog');
    expect(dialog.textContent).toContain('نظرة سريعة');
    await waitFor(() => expect(dialog.textContent).toContain('Test product'));
    /* the sale price is the price, the original is struck through beside it */
    expect(dialog.querySelector('.pc-quick__now')?.textContent).toBe('SAR 120');
    expect(dialog.querySelector('.pc-quick__was')?.textContent).toBe('SAR 200');
    /* the reduction, said twice the way the product page says it */
    expect(dialog.querySelector('.pc-quick__save')?.textContent).toBe('وفر SAR 80');
    expect(dialog.querySelector('.pc-quick__off')?.textContent).toBe('خصم 40%');
    /* the store's own add-to-cart element, with this product's id */
    expect(getByTestId('add-to-cart').getAttribute('data-product-id')).toBe('42');
    /* the detail's photo set, as page dots under the photo */
    await waitFor(() => expect(dialog.querySelectorAll('.pc-quick__dot')).toHaveLength(2));
  });

  it('carries the category chip and the merchant’s opening lines', async () => {
    const { container, findByRole } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'نظرة سريعة') as HTMLButtonElement);
    const dialog = await findByRole('dialog');

    /* the chip is a link to the category, not a label */
    const chip = await waitFor(() => {
      const node = dialog.querySelector('.pc-quick__chip');
      expect(node).toBeTruthy();
      return node as HTMLAnchorElement;
    });
    expect(chip.textContent).toBe('عبايات');
    expect(chip.getAttribute('href')).toBe('/c/7');

    /* the HTML is read as text: tags out, entities decoded, no markup rendered */
    await waitFor(() =>
      expect(dialog.querySelector('.pc-quick__desc')?.textContent).toBe('قطعة أنيقة قصة فضفاضة')
    );
  });

  it('pages the gallery with the arrows', async () => {
    const { container, findByRole } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'نظرة سريعة') as HTMLButtonElement);
    const dialog = await findByRole('dialog');
    await waitFor(() => expect(dialog.querySelector('.pc-quick__photo')).toBeTruthy());

    const photo = () => dialog.querySelector('.pc-quick__photo')?.getAttribute('src');
    expect(photo()).toBe('a.jpg');

    fireEvent.click(dialog.querySelector('.pc-quick__arrow--next') as HTMLButtonElement);
    expect(photo()).toBe('b.jpg');

    /* the second arrow is the first one backwards, and it wraps */
    fireEvent.click(dialog.querySelector('.pc-quick__arrow--prev') as HTMLButtonElement);
    expect(photo()).toBe('a.jpg');
    fireEvent.click(dialog.querySelector('.pc-quick__arrow--prev') as HTMLButtonElement);
    expect(photo()).toBe('b.jpg');
  });

  it('hands the panel’s heart to the same store the rail uses', async () => {
    const { container, findByRole } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'نظرة سريعة') as HTMLButtonElement);
    const dialog = await findByRole('dialog');

    fireEvent.click(dialog.querySelector('.pc-quick__tool') as HTMLButtonElement);
    await waitFor(() => expect(state.toggled).toContain(42));
  });

  async function openBuyForm() {
    const utils = renderCard();
    await waitFor(() => expect(utils.container.querySelector('.pc-actions')).toBeTruthy());
    fireEvent.click(railButton(utils.container, 'نظرة سريعة') as HTMLButtonElement);
    const dialog = await utils.findByRole('dialog');
    const form = await waitFor(() => {
      const node = dialog.querySelector<HTMLFormElement>('.pc-quick__buy-form');
      expect(node).toBeTruthy();
      return node as HTMLFormElement;
    });
    return { ...utils, dialog, form };
  }

  it('puts the real buy form under the description', async () => {
    const { dialog, form, getByTestId } = await openBuyForm();

    /* the description is still above the form */
    expect(dialog.querySelector('.pc-quick__desc')?.compareDocumentPosition(form) &
      Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(new FormData(form).get('id')).toBe('42');
    expect(new FormData(form).get('quantity')).toBe('1');
    expect(dialog.querySelector('.pc-quick__options-box')).toBeTruthy();
    expect(dialog.querySelector('.pc-quick__price-line .pc-quick__price-label')?.textContent).toBe(
      'السعر'
    );
    expect(dialog.querySelector('.pc-quick__buy-was')?.textContent).toBe('SAR 200');
    expect(getByTestId('add-to-cart')).toBeTruthy();
  });

  it('keeps the stepper beside the add button and the product link below', async () => {
    const { dialog } = await openBuyForm();

    expect(dialog.querySelector('.pc-quick__buy-row salla-quantity-input')).toBeTruthy();
    expect(dialog.querySelector('.pc-quick__cta [data-testid="add-to-cart"]')).toBeTruthy();
    expect(dialog.querySelector('.pc-quick__buy .pc-quick__more')?.textContent).toBe('عرض المنتج');
  });

  it('reprices the السعر line when a variant is chosen', async () => {
    const { dialog, form } = await openBuyForm();
    const radios = form.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(radios).toHaveLength(2);

    fireEvent.click(radios[1]);

    await waitFor(() => expect(sallaState.getPrice).toHaveBeenCalled());
    await waitFor(() =>
      expect(dialog.querySelector('.pc-quick__buy-price')?.textContent).toBe('SAR 90')
    );
    expect(sallaState.getPrice).toHaveBeenCalled();
    expect((sallaState.getPrice!.mock.calls[0][0] as FormData).get('id')).toBe('42');
  });

  it('posts the panel form through the same cart.addItem path as the product page', async () => {
    const { form } = await openBuyForm();

    fireEvent.submit(form);

    expect(sallaState.onSubmit).toHaveBeenCalledWith('cart.addItem', expect.anything());
  });

  it('closes on Escape', async () => {
    const { container, findByRole, queryByRole } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'نظرة سريعة') as HTMLButtonElement);
    const dialog = await findByRole('dialog');
    expect(dialog).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(queryByRole('dialog')).toBeNull());
  });
});

describe('ProductCardActions — similar products', () => {
  it('asks the API for the product’s RELATED list and renders it', async () => {
    const { container, findByRole } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-actions')).toBeTruthy());

    fireEvent.click(railButton(container, 'منتجات مشابهة') as HTMLButtonElement);

    const dialog = await findByRole('dialog');
    await waitFor(() => expect(dialog.textContent).toContain('Related one'));
    expect(dialog.textContent).toContain('Related two');
    /* the same source the product page's own "similar products" rail uses */
    expect(state.listParams[0]).toMatchObject({ source: 'related', sourceValue: [42] });
  });
});
