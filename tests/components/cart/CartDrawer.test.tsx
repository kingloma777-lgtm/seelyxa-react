import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartDrawer } from '../../../app/components/cart/CartDrawer';
import { closeCartDrawer, openCartDrawer } from '../../../app/lib/cartDrawer';

const makeCart = () => ({
  id: 5,
  count: 2,
  items: [
    {
      id: 1,
      product_id: 2,
      product_name: 'Product One',
      product_image: '/one.jpg',
      url: '/p2',
      quantity: 1,
      price: 40,
      product_price: 40,
      total: 40,
      is_available: true,
      options: [],
    },
    {
      id: 2,
      product_id: 3,
      product_name: 'Product Two',
      product_image: '/two.jpg',
      url: '/p3',
      quantity: 1,
      price: 60,
      product_price: 60,
      total: 60,
      is_available: true,
      options: [],
    },
  ],
  options: [],
  sub_total: 100,
  total: 100,
  discount: 0,
  tax_amount: 0,
});

let cartData = makeCart();

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (amount: unknown) => `${String(amount)} SAR` }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ children, to }: { children?: unknown; to?: string }) => (
    <a href={to}>{children as never}</a>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/cart', async (importOriginal) => {
  const { cart } =
    await importOriginal<typeof import('@salla.sa/twilight-theme-engine/api/cart')>();
  return {
    cart: {
      ...cart,
      queries: {
        ...cart.queries,
        currentId: () => ({ queryKey: ['cart-id'], queryFn: () => 5 }),
        detail: (id: number) => ({ queryKey: ['cart', id], queryFn: () => cartData }),
      },
    },
  };
});

function renderDrawer() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <CartDrawer />
    </QueryClientProvider>
  );
}

/** Lets the enter transition (two rAFs), the query and its invalidation land
 *  inside `act`, so the run stays free of "not wrapped in act" noise. */
async function settle(ms = 60) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

type Handler = (...args: unknown[]) => void;

describe('CartDrawer', () => {
  let originalSalla: unknown;
  let handlers: Map<string, Handler[]>;
  let submit: ReturnType<typeof vi.fn>;
  let deleteItem: ReturnType<typeof vi.fn>;
  let updateItem: ReturnType<typeof vi.fn>;
  let notifyError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cartData = makeCart();
    handlers = new Map();
    submit = vi.fn(() => Promise.resolve());
    deleteItem = vi.fn(() => Promise.resolve());
    updateItem = vi.fn(() => Promise.resolve());
    notifyError = vi.fn();
    originalSalla = (window as { salla?: unknown }).salla;
    (window as { salla?: unknown }).salla = {
      onReady: () => Promise.resolve(),
      cart: { submit, deleteItem, updateItem },
      notify: { error: notifyError },
      event: {
        on: (name: string, handler: Handler) => {
          handlers.set(name, [...(handlers.get(name) ?? []), handler]);
        },
        off: (name: string, handler: Handler) => {
          handlers.set(name, (handlers.get(name) ?? []).filter((h) => h !== handler));
        },
      },
    };
  });

  afterEach(() => {
    // Unmount BEFORE resetting the module store: `closeCartDrawer` notifies
    // every subscriber, and a still-mounted panel would update outside `act`.
    cleanup();
    closeCartDrawer();
    (window as { salla?: unknown }).salla = originalSalla;
  });

  const emit = (name: string, ...args: unknown[]) => {
    (handlers.get(name) ?? []).forEach((handler) => handler(...args));
  };

  /** Open from the store and wait for the panel, its data and its enter
   *  transition — every one of those is a render, and leaving one pending is
   *  what produces "not wrapped in act" noise. */
  async function open() {
    act(() => openCartDrawer());
    await waitFor(() =>
      expect(screen.getByTestId('cart-drawer-root').className).toContain('is-open')
    );
    await waitFor(() => expect(document.querySelector('.cart-drawer__skeleton')).toBeNull());
  }

  it('renders nothing until it is opened', () => {
    renderDrawer();
    expect(screen.queryByTestId('cart-drawer')).toBeNull();
  });

  it('renders the cart lines, the count and the subtotal once opened', async () => {
    renderDrawer();
    await open();

    await waitFor(() => expect(screen.getByText('Product One')).toBeTruthy());
    expect(screen.getByText('Product Two')).toBeTruthy();
    expect(screen.getByTestId('cart-drawer-count').textContent).toBe('2');
    expect(screen.getByText('100 SAR')).toBeTruthy();
  });

  it('shows the empty state instead of a footer when the cart has no lines', async () => {
    cartData = { ...makeCart(), items: [], count: 0, sub_total: 0 };
    renderDrawer();
    await open();

    await waitFor(() => expect(screen.getByTestId('cart-drawer-empty')).toBeTruthy());
    expect(screen.queryByTestId('cart-drawer-checkout')).toBeNull();
  });

  it('closes on Escape', async () => {
    renderDrawer();
    await open();

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    // the exit transition keeps the panel mounted for TRANSITION_MS
    await waitFor(() => expect(screen.queryByTestId('cart-drawer')).toBeNull(), { timeout: 4000 });
  });

  it('submits the cart from the checkout CTA and closes the panel', async () => {
    renderDrawer();
    await open();

    act(() => {
      fireEvent.click(screen.getByTestId('cart-drawer-checkout'));
    });

    await waitFor(() => expect(submit).toHaveBeenCalled(), { timeout: 4000 });
    await waitFor(() => expect(screen.queryByTestId('cart-drawer')).toBeNull(), { timeout: 4000 });
  });

  it('refuses to submit while a row still has a required option missing', async () => {
    renderDrawer();
    await open();

    // jsdom does not implement validation reporting for every control, so pin
    // the row's own answer — this is the same gate the engine's CartSummary runs.
    const row = document.querySelector('.cart-drawer__row') as HTMLFormElement;
    row.reportValidity = () => false;

    await act(async () => {
      fireEvent.click(screen.getByTestId('cart-drawer-checkout'));
      await new Promise((resolve) => setTimeout(resolve, 120));
    });

    expect(submit).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalled();
    expect(screen.getByTestId('cart-drawer')).toBeTruthy();
  });

  it('keeps the panel open and reports it when submit fails', async () => {
    submit.mockImplementationOnce(() => Promise.reject(new Error('network')));
    renderDrawer();
    await open();

    await act(async () => {
      fireEvent.click(screen.getByTestId('cart-drawer-checkout'));
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(notifyError).toHaveBeenCalled();
    expect(screen.getByTestId('cart-drawer')).toBeTruthy();
  });

  it('opens itself when a product is added, and flashes the new line', async () => {
    renderDrawer();
    expect(screen.queryByTestId('cart-drawer')).toBeNull();

    await act(async () => {
      emit('cart::item.added', { data: { cart: { items: [{ id: 2, product_id: 3 }] } } }, 3);
      await new Promise((resolve) => setTimeout(resolve, 80));
    });

    expect(screen.getByTestId('cart-drawer')).toBeTruthy();
    expect(document.querySelector('#cart-drawer-item-2')?.className).toContain('is-new');
    expect(document.querySelector('#cart-drawer-item-1')?.className).not.toContain('is-new');
  });

  it('removes a line through the SDK', async () => {
    renderDrawer();
    await open();

    await act(async () => {
      fireEvent.click(screen.getAllByLabelText('common.elements.remove')[0]);
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    expect(deleteItem).toHaveBeenCalledWith(1);
  });

  it('stays closed after the drawer is dismissed', async () => {
    renderDrawer();
    await open();

    act(() => {
      fireEvent.click(screen.getByTestId('cart-drawer-close'));
    });

    await waitFor(() => expect(screen.queryByTestId('cart-drawer')).toBeNull(), { timeout: 4000 });
  });
});
