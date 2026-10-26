import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FixedProducts } from '../../../app/components/home/FixedProducts';

const listMock = vi.fn();

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (params: Record<string, unknown>) => ({
        queryKey: ['products', 'list', params],
        queryFn: () => listMock(params),
      }),
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children }: { to: string; children?: unknown }) => (
    <a href={to}>{children as never}</a>
  ),
}));

vi.mock('@salla.sa/twilight-components-react', () => ({
  FixedProductsSkeleton: () => <div data-testid="home-fixed-products-skeleton" />,
}));

/** The merchant settings the block's vertical gate falls back to. */
const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: themeSettings } }),
}));

vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: { id: number; name?: string } }) => (
    <div data-testid={`home-fixed-products-card-${product.id}`}>{product.name}</div>
  ),
}));

const products = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `P${index + 1}` }));

/** The rendered product cards, in order. */
const cards = (container: HTMLElement) =>
  container.querySelectorAll('[data-testid^="home-fixed-products-card-"]');

function renderBlock(data: Record<string, unknown>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <FixedProducts data={{ products: { source: 'latest' }, ...data }} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  listMock.mockReset();
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
});

describe('FixedProducts', () => {
  it('asks for and shows as many products as the block limit, past 4', async () => {
    listMock.mockResolvedValue({ items: products(8) });
    const { container } = renderBlock({ limit: 8 });
    await waitFor(() => expect(cards(container)).toHaveLength(8));
    expect(cards(container)[7].getAttribute('data-testid')).toBe('home-fixed-products-card-8');
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ perPage: 8 }));
  });

  it('never shows more than the limit, even when the API sends more', async () => {
    listMock.mockResolvedValue({ items: products(12) });
    const { container } = renderBlock({ limit: '8' });
    await waitFor(() => expect(cards(container)).toHaveLength(8));
  });

  it('shows what the API returns when the block has no limit', async () => {
    listMock.mockResolvedValue({ items: products(6) });
    const { container } = renderBlock({});
    await waitFor(() => expect(cards(container)).toHaveLength(6));
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ perPage: undefined }));
  });

  /** The 1.0.133 gate, ported: the block's own toggle wins, then theme settings. */
  it('renders horizontal when the block toggles vertical off, vertical when undecided', async () => {
    listMock.mockResolvedValue({ items: products(4) });
    const { container } = renderBlock({ vertical_fixed_products: false });
    await waitFor(() => expect(cards(container)).toHaveLength(4));
    expect(container.querySelector('.s-products-list-horizontal-cards')).toBeTruthy();
    expect(container.querySelector('.s-products-list-vertical-cards')).toBeNull();
  });

  it('stays vertical by default and honours the theme-settings fallback', async () => {
    listMock.mockResolvedValue({ items: products(4) });
    const { container, unmount } = renderBlock({});
    await waitFor(() => expect(cards(container)).toHaveLength(4));
    expect(container.querySelector('.s-products-list-vertical-cards')).toBeTruthy();
    unmount();

    themeSettings.vertical_fixed_products = false;
    const { container: c2 } = renderBlock({});
    await waitFor(() => expect(cards(c2)).toHaveLength(4));
    expect(c2.querySelector('.s-products-list-horizontal-cards')).toBeTruthy();
  });
});
