import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { ProductVideos } from '../../../app/components/home/selia/ProductVideos';

/* Seeded catalogue keyed to the merchant's four product ids so the cards show
   a name, price and image (the live products API is unreachable in a sandbox).
   Hoisted so the vi.mock factories below can close over it. */
const SEEDED = vi.hoisted(() => {
  const mk = (id: string, name: string, price: string, img: string) => ({
    id: Number(id),
    name,
    url: `/p/${id}`,
    price,
    sale_price: null,
    is_on_sale: false,
    status: 'sale' as const,
    type: 'product' as const,
    image: { url: img },
  });
  return {
    '677709975': mk('677709975', 'عباءة سعودية مطرزة يدويًا', '450', 'https://picsum.photos/seed/selia677/600/800'),
    '1361945446': mk('1361945446', 'ثوب إرث كتان فاخر', '890', 'https://picsum.photos/seed/selia136/600/800'),
    '1303461379': mk('1303461379', 'جاكيت جلد طبيعي', '1250', 'https://picsum.photos/seed/selia130/600/800'),
    '73203761': mk('73203761', 'حقيبة سدو مطرزة', '320', 'https://picsum.photos/seed/selia732/600/800'),
    '524759233': mk('524759233', 'كرسي كلاسك بأرجل خشبية', '640', 'https://picsum.photos/seed/selia524/600/800'),
    '2106933489': mk('2106933489', 'كرسي كلاسك خشبي بقاعدة جلد', '720', 'https://picsum.photos/seed/selia210/600/800'),
    '627583647': mk('627583647', 'طاولة سفرة متعددة الطوابق', '1450', 'https://picsum.photos/seed/selia627/600/800'),
    '1436244360': mk('1436244360', 'كرسي مودرن فخامة بأرجل خشبية', '560', 'https://picsum.photos/seed/selia143/600/800'),
    '1730363092': mk('1730363092', 'كرسي بمسند خشبي أنيق', '480', 'https://picsum.photos/seed/selia173/600/800'),
    '356917195': mk('356917195', 'كمودو أبيض خشبي بأرجل دائرية', '990', 'https://picsum.photos/seed/selia356/600/800'),
  };
});

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (options: { source?: string; sourceValue?: Array<number | string> }) => ({
        queryKey: ['selia-test-products', options?.source, ...(options?.sourceValue ?? [])],
      }),
    },
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey?: unknown[] }) => {
    const key = options?.queryKey ?? [];
    if (key[0] === 'selia-test-products') {
      const ids = key.slice(2).map(String);
      const items = ids.map((id) => (SEEDED as Record<string, unknown>)[id]).filter(Boolean);
      return { data: { items }, isLoading: false, isFetching: false };
    }
    return { data: undefined, isLoading: false, isFetching: false };
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    locale: 'ar',
    direction: 'rtl',
    isRTL: true,
    isLTR: false,
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => (value == null || value === '' ? '' : String(value)) }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ has: () => false, toggle: () => {}, add: () => {}, remove: () => {} }),
}));

vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: () => null,
}));

vi.mock('../../../app/components/product/ProductCard', async () => {
  const R = await import('react');
  return {
    ProductCard: ({ product }: { product: { id: number; name: string } }) =>
      R.createElement('div', { className: 'product-card-stub', 'data-product-id': product.id }, product.name),
  };
});

const preview = JSON.parse(fs.readFileSync('twilight.preview.json', 'utf8')) as {
  layout: Array<{ path: string; fields: Record<string, unknown> }>;
};
const block = preview.layout.find((entry) => entry.path === 'selia-product-videos');
if (!block) throw new Error('no selia-product-videos seed in twilight.preview.json');
const data = block.fields;

describe('selia-product-videos preview render', () => {
  it('renders the block markup with seeded product data', () => {
    const html = renderToString(React.createElement(ProductVideos, { data }));

    const outDir = path.resolve('scripts/preview');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'pvideos.partial.html'), html, 'utf8');

    expect(html).toContain('selia-vproducts');
    expect(html).toContain('selia-vcard');
    expect(html).toContain('صُنعت خصيصا لك');
  });
});
