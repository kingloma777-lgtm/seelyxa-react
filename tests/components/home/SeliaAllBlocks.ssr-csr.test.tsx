import React from 'react';
import fs from 'node:fs';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act } from 'react';

/* ==========================================================================
   SSR -> hydration -> CSR for ALL 34 ported Selia blocks.

   `SeliaBlocks.ssr-csr.test.tsx` covers the first eight with hand-picked
   selectors and interactions. This file is the sweep: it walks the generated
   registry, so a 35th block is covered the moment it is published, and a block
   that renders nothing (an empty wrapper over a blank page) fails here rather
   than in a screenshot three days later.

   The seed data comes from twilight.preview.json — the same payload the dev
   server renders — so a renamed field id surfaces as missing merchant copy.
   ========================================================================== */

const preview = JSON.parse(
  fs.readFileSync('twilight.preview.json', 'utf8')
) as { layout: Array<{ path: string; fields: Record<string, unknown> }> };

const seed = (blockPath: string): Record<string, unknown> => {
  const block = preview.layout.find((entry) => entry.path === blockPath);
  if (!block) throw new Error(`no preview seed for ${blockPath}`);
  return block.fields;
};

const FIXTURES = vi.hoisted(() => ({
  ARTICLES: [
    {
      id: 1,
      name: 'كيف تختار القطعة المناسبة',
      description: 'دليل قصير للخامات والألوان.',
      image: '/reference/oryzo-product.jpg',
      url: '/blog/1',
      created_at: '2026-11-04T10:00:00.000Z',
    },
  ],
  PRODUCTS: [
    { id: 101, name: 'كرسي منحوت', price: 1200, url: '/p/101' },
    { id: 102, name: 'مصباح طيني', price: 430, url: '/p/102' },
  ],
}));

vi.mock('@salla.sa/twilight-theme-engine/api/blog', () => ({
  blog: {
    queries: {
      overview: () => ({ queryKey: ['selia-test-overview'] }),
      articles: (options: { category?: string }) => ({ queryKey: ['selia-test-articles', options?.category] }),
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (options: { source?: string; sourceValue?: number[] }) => ({
        queryKey: ['selia-test-products', options?.source, options?.sourceValue],
      }),
      detail: (id: number) => ({ queryKey: ['selia-test-product', id] }),
    },
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey?: unknown[] }) => {
    switch (options?.queryKey?.[0]) {
      case 'selia-test-overview':
        return { data: { articles: FIXTURES.ARTICLES, categories: [] }, isFetching: false };
      case 'selia-test-articles':
        return { data: { data: FIXTURES.ARTICLES }, isFetching: false };
      case 'selia-test-products': {
        /* The product-video grid resolves each row's product by id, so the
           mock answers with exactly the ids the block asked for — a fixture
           with different ids would render an empty grid and pass anyway. */
        const requested = (options?.queryKey?.[2] as number[] | undefined) ?? [];
        const items = requested.length
          ? requested.map((id, index) => ({
              id,
              name: `منتج اختبار ${index + 1}`,
              price: 100 + index * 10,
              url: `/p/${id}`,
              image: { url: '/reference/oryzo-product.jpg' },
            }))
          : FIXTURES.PRODUCTS;
        return { data: { items }, isLoading: false };
      }
      default:
        return { data: undefined, isLoading: false, isFetching: false };
    }
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (amount: number | string) => `${amount} SAR` }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({
    has: () => false,
    toggle: () => undefined,
  }),
}));

vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  /* The real button is a Stencil web component with its own runtime; the
     sweep only needs the card to hand it a product id. */
  SallaAddProductButton: ({
    productId,
    children,
    className,
  }: {
    productId: number | string;
    children: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      'button',
      { type: 'button', className: `fake-add ${className ?? ''}`, 'data-product': String(productId) },
      children
    ),
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

vi.mock('../../../app/components/product/ProductCard', async () => {
  const ReactLib = await import('react');
  return {
    ProductCard: ({ product }: { product: { id: number; name: string } }) =>
      ReactLib.createElement('div', { className: 'product-card-stub' }, product.name),
  };
});

import { SELIA_BLOCKS } from '../../../app/components/home/selia/registry.generated';
import { BrandsMarquee } from '../../../app/components/home/selia/BrandsMarquee';
import type { BlockData } from '../../../app/lib/homeBlock';

const paths = Object.keys(SELIA_BLOCKS);

/* Four banner blocks carry images and links ONLY — the Selia panel exposes no
   text field for them, so an empty strip of text in the SSR HTML is the CORRECT
   render, not a silent blank. These assert artwork instead of words. */
const IMAGE_ONLY = new Set([
  'selia-double-banner',
  'selia-triple-banner',
  'selia-animated-banners',
  'selia-dynamic-banner',
]);

const HYDRATION_NOISE =
  /hydrat|did not match|text content does not match|server-rendered html|expected server html|an error occurred in the <\w+> component/i;

let roots: Root[] = [];

async function hydrate(element: React.ReactElement, html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  const messages: string[] = [];
  const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    messages.push(args.map(String).join(' '));
  });

  let root!: Root;
  await act(async () => {
    root = hydrateRoot(container, element);
  });
  roots.push(root);
  spy.mockRestore();

  return {
    container,
    hydrationErrors: messages.filter((message) => HYDRATION_NOISE.test(message)),
    messages,
  };
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
  vi.restoreAllMocks();
});

describe('All 34 Selia blocks — contract', () => {
  it('the registry, the manifest and the preview agree on 34 paths', () => {
    const manifest = JSON.parse(fs.readFileSync('twilight.json', 'utf8')) as {
      components: Array<{ path: string }>;
    };
    const specs = manifest.components
      .map((component) => component.path)
      .filter((p) => p.startsWith('home.selia-'))
      .map((p) => p.replace(/^home\./, ''))
      .sort();
    const seeded = preview.layout
      .map((block) => block.path)
      .filter((p) => p.startsWith('selia-'))
      .sort();

    expect(paths).toHaveLength(34);
    expect(paths.slice().sort()).toEqual(specs);
    expect(paths.slice().sort()).toEqual([...new Set(seeded)]);
  });

  it.each(paths)('%s has a non-empty merchant field contract', (path) => {
    expect(Object.keys(seed(path)).length).toBeGreaterThan(0);
  });
});

describe('All 34 Selia blocks — SSR', () => {
  it.each(paths)('%s server-renders a real section', (path) => {
    const Component = SELIA_BLOCKS[path];
    const html = renderToString(<Component data={seed(path) as BlockData} />);

    expect(html).toContain('class="selia ');
    expect(html.length).toBeGreaterThan(120);
    /* A block that only emits its shell is a silent blank gap on the page.
       Four banner families are legitimately image-only (their repeater has no
       text columns at all), so a real `<img src>` counts as content there. */
    const hasCopy = html.replace(/<[^>]+>/g, '').trim().length > 0;
    const hasArt = /<img[^>]+src="\/reference\//.test(html);
    expect(hasCopy || hasArt, `${path}: neither copy nor artwork in SSR output`).toBe(true);
  });

  it.each(paths)('%s is deterministic across two server renders', (path) => {
    const Component = SELIA_BLOCKS[path];
    const data = seed(path) as BlockData;
    expect(renderToString(<Component data={data} />)).toBe(renderToString(<Component data={data} />));
  });

  it('none of the 34 blocks touch window/document while rendering on the server', () => {
    const savedWindow = globalThis.window;
    const savedDocument = globalThis.document;
    // @ts-expect-error deliberately removing browser globals
    delete globalThis.window;
    // @ts-expect-error deliberately removing browser globals
    delete globalThis.document;
    try {
      for (const path of paths) {
        const Component = SELIA_BLOCKS[path];
        expect(() => renderToString(<Component data={seed(path) as BlockData} />), path).not.toThrow();
      }
    } finally {
      (globalThis as Record<string, unknown>).window = savedWindow;
      (globalThis as Record<string, unknown>).document = savedDocument;
    }
  });
});

describe('All 34 Selia blocks — hydration / CSR', () => {
  it.each(paths)('%s hydrates its own server HTML without a mismatch', async (path) => {
    const Component = SELIA_BLOCKS[path];
    const element = <Component data={seed(path) as BlockData} />;
    const html = renderToString(element);
    const { container, hydrationErrors, messages } = await hydrate(element, html);

    expect(hydrationErrors, `${path}: ${messages.join(' | ')}`).toEqual([]);
    expect(container.querySelector('.selia')).not.toBeNull();
    const hasCopy = (container.textContent ?? '').trim().length > 0;
    const hasArt = container.querySelector('img[src^="/reference/"]') !== null;
    expect(hasCopy || hasArt, `${path}: blank section after hydration`).toBe(true);
  });
});

describe('Second-batch behaviours', () => {
  it('the brand wall repeats a short collection until one half out-runs the container', () => {
    /* The reference duplicates the list twice and translates by 50%. With ten
       logos that half is ~1270px — narrower than a 1440px container, so the
       seam opens a hole once per cycle. Three logos is the extreme case: the
       half must still hold far more than three tiles. */
    const logos = [
      { image: '/reference/brands/brand-01.png', href: '', title: 'سليا' },
      { image: '/reference/brands/brand-02.png', href: '/brands/2', title: 'أديداس' },
      { image: '/reference/brands/brand-03.png', href: '', title: 'شانيل' },
    ];
    const html = renderToString(<BrandsMarquee items={logos} twoRows={false} />);
    const halves = html.match(/class="selia-bw__half"/g) ?? [];
    const tiles = html.match(/class="selia-bw__item"/g) ?? [];

    expect(halves).toHaveLength(2);
    /* Two halves of `copies × 3` tiles, and `copies` is never 1 here. */
    expect(tiles.length / 2).toBeGreaterThan(logos.length);
    expect(tiles.length % (2 * logos.length)).toBe(0);
  });

  it('names each brand once and keeps the echo copies out of the a11y tree', async () => {
    const logos = [
      { image: '/reference/brands/brand-01.png', href: '', title: 'سليا' },
      { image: '/reference/brands/brand-02.png', href: '/brands/2', title: 'أديداس' },
      /* No name: the tile still needs something to be announced as. */
      { image: '/reference/brands/brand-03.png', href: '/brands/3', title: '' },
    ];
    const element = <BrandsMarquee items={logos} twoRows={false} />;
    const { container, hydrationErrors } = await hydrate(element, renderToString(element));

    expect(hydrationErrors).toEqual([]);
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a.selia-bw__tile')];
    const real = links.filter((link) => link.getAttribute('aria-hidden') !== 'true');

    expect(real).toHaveLength(2);
    expect(real.map((link) => link.getAttribute('aria-label'))).toEqual(['أديداس', 'ماركة']);
    /* Every other copy is unreachable by Tab as well as by a screen reader. */
    expect(links.filter((link) => link.tabIndex === -1)).toHaveLength(links.length - 2);
    expect(container.querySelectorAll('[role="img"][aria-label="سليا"]')).toHaveLength(1);
  });

  it('drops a row with no picture instead of rendering an empty tile', () => {
    const html = renderToString(
      <BrandsMarquee
        items={[
          { image: '', href: '', title: 'بلا صورة' },
          { image: '/reference/brands/brand-01.png', href: '', title: 'سليا' },
        ]}
        twoRows={false}
      />
    );
    expect(html).not.toContain('بلا صورة');
    expect(html).toContain('brand-01.png');
  });

  it('renders the second, opposite row only when «صفّان» is on', () => {
    const logos = [{ image: '/reference/brands/brand-01.png', href: '', title: 'سليا' }];
    const single = renderToString(<BrandsMarquee items={logos} twoRows={false} />);
    const double = renderToString(<BrandsMarquee items={logos} twoRows />);

    expect(single.match(/class="selia-bw__row"/g) ?? []).toHaveLength(1);
    expect(double.match(/class="selia-bw__row"/g) ?? []).toHaveLength(2);
    expect(double).toContain('data-dir="back"');
  });

  it('ProductTabs switches panels on the client', async () => {
    const path = 'selia-product-tabs';
    const Component = SELIA_BLOCKS[path];
    const element = <Component data={seed(path) as BlockData} />;
    const { container } = await hydrate(element, renderToString(element));
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabs.length).toBeGreaterThan(1);
    await act(async () => tabs[1].click());
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
  });

  it('FAQ answers are native details and stay in the server HTML', async () => {
    const path = 'selia-faq';
    const Component = SELIA_BLOCKS[path];
    const element = <Component data={seed(path) as BlockData} />;
    const html = renderToString(element);
    expect(html).toContain('<details');
    const { container } = await hydrate(element, html);
    expect(container.querySelectorAll('details').length).toBeGreaterThan(0);
  });

  it('BeforeAfter starts at a stable 50% split on both renders', () => {
    const path = 'selia-before-after';
    const Component = SELIA_BLOCKS[path];
    const html = renderToString(<Component data={seed(path) as BlockData} />);
    expect(html).toContain('--ba-split:50%');
    expect(html).toContain('type="range"');
  });

  it('the countdown ships a static first paint, never a server/client time mismatch', () => {
    for (const path of ['selia-offers-counter', 'selia-special-offer']) {
      const Component = SELIA_BLOCKS[path];
      const html = renderToString(<Component data={seed(path) as BlockData} />);
      // Four `<span>--</span>` cells: a static, locale-independent first paint.
      expect(html).toContain('role="timer"');
      expect((html.match(/<span class="selia-clock__cell">--<\/span>/g) ?? []).length).toBe(4);
    }
  });

  it('the slider exposes real previous/next controls after hydration', async () => {
    const path = 'selia-advanced-slider';
    const Component = SELIA_BLOCKS[path];
    const element = <Component data={seed(path) as BlockData} />;
    const { container } = await hydrate(element, renderToString(element));
    const arrows = container.querySelectorAll('.selia-hero__arrow');
    expect(arrows).toHaveLength(2);
    expect(() => (arrows[1] as HTMLButtonElement).click()).not.toThrow();
  });

  /* The block's fields promised a fade, pagination dots and a button per slide;
     the shared scroll track rendered none of them. These four assertions pin
     the contract so a future "simplification" cannot quietly drop it again. */
  it('the advanced slider renders the button, the pager and a fade', () => {
    const Slider = SELIA_BLOCKS['selia-advanced-slider'];
    const html = renderToString(<Slider data={seed('selia-advanced-slider') as BlockData} />);
    expect(html).toContain('data-effect="fade"');
    expect(html).toContain('selia-hero__cta');
    expect(html).toContain('selia-hero__dot');
    expect(html).toContain('selia-hero__count');
    expect(html).not.toContain('selia-scroller__track');
  });

  it('only one slide is exposed at a time, so hidden CTAs cannot take focus', () => {
    const Slider = SELIA_BLOCKS['selia-advanced-slider'];
    const html = renderToString(<Slider data={seed('selia-advanced-slider') as BlockData} />);
    /* Scoped to the slide elements themselves: the pager's active segment also
       carries `data-active`, and a bare count would read as two live slides. */
    const slideTags = html.match(/class="selia-hero__slide"[^>]*/g) ?? [];
    expect(slideTags.length).toBeGreaterThan(1);
    expect(slideTags.filter((tag) => tag.includes('data-active="true"'))).toHaveLength(1);
    expect(slideTags.filter((tag) => tag.includes('aria-hidden="true"'))).toHaveLength(slideTags.length - 1);
  });

  it('merchant switches reach the DOM in the shape the stylesheet selects', () => {
    const Slider = SELIA_BLOCKS['selia-advanced-slider'];
    const sliderHtml = renderToString(<Slider data={seed('selia-advanced-slider') as BlockData} />);
    expect(sliderHtml).toContain('data-arrows="1"');
    expect(sliderHtml).toContain('data-top_space="0"');

    const Offer = SELIA_BLOCKS['selia-special-offer'];
    const offerHtml = renderToString(<Offer data={seed('selia-special-offer') as BlockData} />);
    expect(offerHtml).toContain('data-hide_countdown="0"');
    expect(offerHtml).not.toContain('data-full_width="true"');
  });

  it('merchant colours reach the section as consumed custom properties', () => {
    const path = 'selia-special-offer';
    const Component = SELIA_BLOCKS[path];
    const html = renderToString(<Component data={seed(path) as BlockData} />);
    expect(html).toContain('--selia-background_color');
    expect(html).toContain('--selia-bg');
  });
});
