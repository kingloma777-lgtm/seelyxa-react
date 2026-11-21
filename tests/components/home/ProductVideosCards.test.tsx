import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act } from 'react';

/* ==========================================================================
   selia-product-videos — the card contract.

   The block renders the store's real card (name, price, platform
   add-to-cart) with the row's video as the media. What these tests protect:
   one card per row, the row's video on that row's card, the video-less
   fallback, and the «عرض المنتج أسفل الفيديو» switch. The card deliberately
   carries NO badge pill and NO wishlist heart — the merchant asked for both
   to be removed, and they must not creep back in.

   SSR is deliberately SELF-SUFFICIENT: `storeReady` is false on the server,
   so the add button uses its SSR-safe fallback and is already in the first
   paint (no post-mount guest, no layout jump). A row whose product the
   catalogue has not answered still keeps its video card, built from the row's
   own data — the grid never reflows while the list loads.
   ========================================================================== */

const FIXTURES = vi.hoisted(() => ({
  /* the ids the seeded rows ask for; the query mock answers exactly these */
  PRODUCTS: [
    { id: 677709975, name: 'عباية ملكي', price: 297, sale_price: 250, is_on_sale: true, url: '/p/677709975', image: { url: '/reference/oryzo-product.jpg' }, status: 'sale' },
    { id: 1361945446, name: 'طقم شتوي', price: 430, url: '/p/1361945446', image: { url: '/reference/larevoltosa-lens.jpg' }, status: 'sale' },
    /* the LIST shape: `price` already holds what the customer pays, and the
       original sits in `regular_price` */
    { id: 1550011223, name: 'عباية سادة', price: 199, sale_price: 199, regular_price: 450, is_on_sale: true, url: '/p/1550011223', image: { url: '/reference/oryzo-product.jpg' }, status: 'sale' },
  ],
  VIDEO: 'https://example.com/prod-a.mp4',
  VIDEO2: 'https://example.com/prod-b.mp4',
  LOADING: { ids: [73203761], loading: true },
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (options: { source?: string; sourceValue?: number[] }) => ({
        queryKey: ['pvideos-test-products', options?.source, options?.sourceValue],
      }),
      detail: (id: number) => ({ queryKey: ['pvideos-test-product', id] }),
    },
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey?: unknown[] }) => {
    if (options?.queryKey?.[0] !== 'pvideos-test-products') {
      return { data: undefined, isLoading: false, isFetching: false };
    }
    const requested = (options.queryKey[2] as number[] | undefined) ?? [];
    if (requested.join() === FIXTURES.LOADING.ids.join()) {
      return { data: undefined, isLoading: true };
    }
    /* `source: 'selected'` sends the ids and the API answers exactly those, so
       the block's `perPage` slice never drops a requested product. */
    const items = requested.length
      ? FIXTURES.PRODUCTS.filter((p) => requested.map(String).includes(String(p.id)))
      : FIXTURES.PRODUCTS;
    return { data: { items }, isLoading: false };
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    locale: 'ar',
    direction: 'rtl',
    isRTL: true,
    isLTR: false,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (amount: number | string) => `${amount} SAR` }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ has: () => false, toggle: () => undefined }),
}));

vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({
    productId,
    children,
  }: {
    productId: number | string;
    children: React.ReactNode;
  }) =>
    React.createElement(
      'button',
      { type: 'button', className: 'fake-add', 'data-product': String(productId) },
      children
    ),
}));

import { ProductVideos } from '../../../app/components/home/selia/ProductVideos';
import type { BlockData } from '../../../app/lib/homeBlock';

const VIDEO = FIXTURES.VIDEO;
const VIDEO2 = FIXTURES.VIDEO2;

const seed = (rows: Array<Record<string, unknown>>, extra: Record<string, unknown> = {}): BlockData =>
  ({
    pvideos_title: 'صُنعت خصيصا لك',
    pvideos_subtitle: 'إرث سعودي يُرتدى',
    pvideos_layout: 'grid',
    pvideos_ratio: '9-16',
    pvideos_autoplay: true,
    pvideos_show_product: true,
    pvideos_show_all: false,
    pvideos_top_space: true,
    pvideos_display: 'all',
    pvideos_items: rows,
    ...extra,
  }) as BlockData;

const row = (id: number, video: string) => ({
  'pvideos_items.product': [{ value: String(id), key: String(id) }],
  'pvideos_items.video': video,
});

let roots: Root[] = [];

async function hydrate(element: React.ReactElement, html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  let root!: Root;
  await act(async () => {
    root = hydrateRoot(container, element);
  });
  roots.push(root);
  return container;
}

beforeAll(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  if (!('IntersectionObserver' in globalThis)) {
    (globalThis as Record<string, unknown>).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(async () => {
  for (const root of roots) {
    await act(async () => root.unmount());
  }
  roots = [];
  document.body.innerHTML = '';
});

describe('selia-product-videos — cards', () => {
  it('renders one card per row, each with its own video and no badge pill', () => {
    const html = renderToString(
      <ProductVideos data={seed([row(677709975, VIDEO), row(1361945446, VIDEO2)])} />
    );
    expect((html.match(/<video/g) ?? []).length).toBe(2);
    expect(html).toContain(`src="${VIDEO}"`);
    expect(html).toContain(`src="${VIDEO2}"`);
    /* the merchant removed the badge copy: nothing labels the clip */
    expect(html).not.toContain('selia-vcard__pill');
    expect(html).not.toContain('فيديو المنتج');
    /* the product's own card, not a text row */
    expect(html).toContain('عباية ملكي');
    /* On the server `storeReady` is false, so the SSR-safe add-button
       fallback is printed; the platform web component (mocked as `fake-add`)
       is only mounted once the store is available on the client. */
    expect(html).toContain('selia-vcard__add');
    expect(html).toContain('أضف إلى السلة');
  });

  it('a card carries no wishlist heart — the frosted cluster is play + mute only', () => {
    const html = renderToString(<ProductVideos data={seed([row(677709975, VIDEO)])} />);
    expect(html).not.toContain('selia-vcard__wish');
    expect(html).not.toContain('selia-vcard__fav');
    expect(html).not.toContain('sicon-heart');
    expect((html.match(/selia-vcard__ctl/g) ?? []).length).toBe(2);
  });

  it('a row without a video shows the product photo and no transport controls', () => {
    const html = renderToString(<ProductVideos data={seed([row(677709975, '')])} />);
    expect(html).toContain('<img');
    expect(html).not.toContain('selia-vcard__pill');
    expect(html).not.toContain('selia-vcard__ctl');
    expect(html).not.toContain('<video');
  });

  it('«عرض المنتج أسفل الفيديو» off hides the card body but keeps the media', () => {
    const html = renderToString(
      <ProductVideos data={seed([row(677709975, VIDEO)], { pvideos_show_product: false })} />
    );
    expect(html).toContain('selia-vcard__media');
    expect(html).not.toContain('selia-vcard__panel');
    expect(html).not.toContain('selia-vcard__add');
  });

  it('the sale price keeps the crossed-out original beside it', () => {
    const html = renderToString(<ProductVideos data={seed([row(677709975, VIDEO)])} />);
    expect(html).toContain('<s class="selia-vcard__compare">297 SAR</s>');
    expect(html).toContain('250 SAR');
  });

  it('the struck twin reads `regular_price` on a list row', () => {
    /* On a list response `price` is already the amount the customer pays and
       `sale_price` repeats it; comparing those two compared a figure with
       itself, so the discount never printed. */
    const html = renderToString(<ProductVideos data={seed([row(1550011223, VIDEO)])} />);
    expect(html).toContain('199 SAR');
    expect(html).toContain('<s class="selia-vcard__compare">450 SAR</s>');
  });

  it('a product the list did not answer still keeps its video card', () => {
    /* only the fixture ids exist; a row with an unknown product is built from its
       own video so the grid keeps its shape instead of dropping a cell. */
    const html = renderToString(
      <ProductVideos data={seed([row(677709975, VIDEO), row(999999999, VIDEO2)])} />
    );
    expect((html.match(/class="selia-vcard"/g) ?? []).length).toBe(2);
    expect(html).toContain(`src="${VIDEO2}"`);
    expect(html).not.toContain('طقم شتوي');
  });

  it('while the catalogue is loading the row keeps its video card in place', () => {
    const html = renderToString(<ProductVideos data={seed([row(73203761, VIDEO)])} />);
    expect(html).toContain(`src="${VIDEO}"`);
    expect((html.match(/class="selia-vcard"/g) ?? []).length).toBe(1);
    /* the placeholder is only for a row with nothing at all to show */
    expect(html).not.toContain('selia-vproducts__waiting');
  });

  it('hydrates its own server HTML without adding a node', async () => {
    const element = <ProductVideos data={seed([row(677709975, VIDEO)])} />;
    const html = renderToString(element);
    const container = await hydrate(element, html);
    /* the cluster is fully server-rendered: hydration adds no control */
    expect(container.querySelectorAll('.selia-vcard__ctl')).toHaveLength(2);
    expect(container.querySelector('.selia-vcard__wish')).toBeNull();
    expect(container.querySelector('.selia-vcard__video')).not.toBeNull();
  });

  it('«عرض الكل» renders below the grid when the merchant switches it on', () => {
    const html = renderToString(
      <ProductVideos data={seed([row(677709975, VIDEO)], { pvideos_show_all: true })} />
    );
    expect(html).toContain('selia-vproducts__all');
    expect(html).toContain('عرض الكل');
  });

  it('a video card carries its own play and mute controls', () => {
    const html = renderToString(<ProductVideos data={seed([row(677709975, VIDEO)])} />);
    /* the reference's two frosted circles, and no icon font dependence */
    expect((html.match(/selia-vcard__ctl/g) ?? []).length).toBe(2);
    expect(html).toContain('selia-vcard__glyph');
  });

  it('the slider layout shows the arrows and a bar even with a single page', () => {
    const html = renderToString(
      <ProductVideos
        data={seed([row(677709975, VIDEO), row(1361945446, VIDEO2)], { pvideos_layout: 'slider' })}
      />
    );
    /* two rows fit in one page, but the reference always keeps its chrome */
    expect(html).toContain('selia-reels__nav');
    expect((html.match(/class="selia-reels__dot"/g) ?? []).length).toBe(1);
  });

  it('the slider layout adds the head arrows and the pagination bars', () => {
    const rows = Array.from({ length: 5 }, (_, i) => row(677709975 + i, VIDEO));
    const html = renderToString(
      <ProductVideos data={seed(rows, { pvideos_layout: 'slider' })} />
    );
    /* five clips at four per page = two pages, so the arrows and both bars exist */
    expect(html).toContain('selia-reels__nav');
    expect((html.match(/class="selia-reels__dot"/g) ?? []).length).toBe(2);
    /* the stylesheet's hooks: the merchant's dropdowns reach the section */
    expect(html).toContain('data-layout="slider"');
    expect(html).toContain('data-ratio="9-16"');
  });
});
