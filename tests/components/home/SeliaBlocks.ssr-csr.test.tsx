import React from 'react';
import fs from 'node:fs';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act } from 'react';

/* ==========================================================================
   SSR -> hydration -> CSR for the eight ported Selia blocks.

   A screenshot proves a block looks right in a browser with JavaScript on. It
   says nothing about the server render, and nothing about whether React can
   adopt that HTML without throwing it away. Those two failures are silent in
   production: the store ships blank HTML to crawlers and no-JS visitors, or it
   logs a hydration mismatch and re-renders the whole section.

   The strongest version of this test hydrates the ACTUAL server string:
     renderToString(element)  -> container.innerHTML -> hydrateRoot(container, element)
   and spies on console.error for React's mismatch diagnostics. Rendering the
   element a second time from scratch would not catch a server/client
   disagreement, because both renders would be the same (client) render.

   The seed data is read from twilight.preview.json rather than hand-written,
   so a renamed field id shows up here as a missing value instead of being
   papered over by a fixture that still uses the old name.
   ========================================================================== */

/* Vitest runs from the project root. A `new URL(..., import.meta.url)` is a
   Vite http: URL under SSR, which the filesystem bridge refuses to read. */
const preview = JSON.parse(
  fs.readFileSync('twilight.preview.json', 'utf8')
) as { layout: Array<{ path: string; fields: Record<string, unknown> }> };

const seed = (blockPath: string): Record<string, unknown> => {
  const block = preview.layout.find((entry) => entry.path === blockPath);
  if (!block) throw new Error(`no preview seed for ${blockPath}`);
  return block.fields;
};

/* ------------------------------------------------------------------------ *
 * The engine's data hooks are replaced with deterministic query objects.
 * What is under test is the block's markup and its hydration behaviour, not
 * the store's network layer. `queryKey` is the only part the mock `useQuery`
 * looks at, which also means a block that stops passing its query options is
 * visible here as an undefined key.
 * ------------------------------------------------------------------------ */
/* vi.mock is hoisted above this file's imports, so fixtures referenced from a
   factory must be hoisted too — otherwise the factory hits a TDZ error when
   the component's import graph pulls the mocked module in. */
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
    {
      id: 2,
      name: 'مساحة تهدأ فيها الغرفة',
      description: 'أفكار للترتيب.',
      image: '/reference/oryzo-hero.jpg',
      url: '/blog/2',
      /* The shape the API actually returns — `{ date, timezone_type, timezone }`
         and not an ISO string. It is here on purpose: `new Date(String(value))`
         on this object is an Invalid Date, which is why the old cards reserved a
         line and printed nothing. */
      created_at: { date: '2024-12-31 11:39:22.000000', timezone_type: 3, timezone: 'Asia/Riyadh' },
    },
  ],
  CATEGORIES: [
    { id: 11, name: 'المنزل' },
    { id: 12, name: 'الخامات' },
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
      articles: (options: { category?: string }) => ({
        queryKey: ['selia-test-articles', options?.category],
      }),
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (options: { source?: string }) => ({ queryKey: ['selia-test-products', options?.source] }),
    },
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey?: unknown[] }) => {
    switch (options?.queryKey?.[0]) {
      case 'selia-test-overview':
        return { data: { articles: FIXTURES.ARTICLES, categories: FIXTURES.CATEGORIES }, isFetching: false };
      case 'selia-test-articles':
        return { data: { data: FIXTURES.ARTICLES }, isFetching: false };
      case 'selia-test-products':
        return { data: { items: FIXTURES.PRODUCTS }, isLoading: false };
      default:
        return { data: undefined, isLoading: false, isFetching: false };
    }
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

/* ProductCard pulls in the engine's wishlist hook and a portal; neither is
   relevant to whether the picks section server-renders and hydrates. */
vi.mock('../../../app/components/product/ProductCard', async () => {
  const ReactLib = await import('react');
  return {
    ProductCard: ({ product }: { product: { id: number; name: string } }) =>
      ReactLib.createElement(
        'div',
        { className: 'product-card-stub', 'data-product-id': product.id },
        product.name
      ),
  };
});

import { Statistics } from '../../../app/components/home/selia/Statistics';
import { MapLocation } from '../../../app/components/home/selia/MapLocation';
import { BlogTeaser } from '../../../app/components/home/selia/BlogTeaser';
import { ContactForm } from '../../../app/components/home/selia/ContactForm';
import { TickerBar } from '../../../app/components/home/selia/TickerBar';
import { CategoryHero } from '../../../app/components/home/selia/CategoryHero';
import { Branches } from '../../../app/components/home/selia/Branches';
import { ProductPicks } from '../../../app/components/home/selia/ProductPicks';
import type { BlockData } from '../../../app/lib/homeBlock';

/* ------------------------------------------------------------------------ */

type Case = {
  name: string;
  path: string;
  render: (data: BlockData) => React.ReactElement;
  /** Text the merchant supplied that MUST be in the server HTML. */
  ssrText: string[];
  /** A selector proving the section's own markup, not an empty wrapper. */
  selector: string;
};

const cases: Case[] = [
  {
    name: 'Statistics',
    path: 'selia-statistics',
    render: (data) => <Statistics data={data} />,
    ssrText: ['أرقام تتكلم', '+١٢٠٠'],
    selector: '.selia-stats__item',
  },
  {
    name: 'MapLocation',
    path: 'selia-map-location',
    render: (data) => <MapLocation data={data} />,
    ssrText: ['موقعنا'],
    selector: 'iframe[src^="https://"]',
  },
  {
    name: 'BlogTeaser',
    path: 'selia-blog',
    render: (data) => <BlogTeaser data={data} />,
    ssrText: ['من المدونة', 'كيف تختار القطعة المناسبة'],
    selector: '.selia-blog__feature',
  },
  {
    name: 'ContactForm',
    path: 'selia-contact-form',
    render: (data) => <ContactForm data={data} />,
    ssrText: ['تواصل معنا'],
    selector: '.selia-contact',
  },
  {
    name: 'TickerBar',
    path: 'selia-ticker-bar',
    render: (data) => <TickerBar data={data} />,
    ssrText: ['توصيل مجاني'],
    selector: '.selia-ticker__track',
  },
  {
    name: 'CategoryHero',
    path: 'selia-category-hero',
    render: (data) => <CategoryHero data={data} />,
    ssrText: ['تسوّق حسب التصنيف'],
    selector: '.selia-cathero__tile',
  },
  {
    name: 'Branches',
    path: 'selia-branches',
    render: (data) => <Branches data={data} />,
    ssrText: ['فروعنا', 'الرياض'],
    selector: '.selia-branches__tab',
  },
  {
    name: 'ProductPicks',
    path: 'selia-custom-products',
    render: (data) => <ProductPicks data={data} />,
    ssrText: ['الأكثر مبيعًا', 'كرسي منحوت'],
    selector: '.selia-picks__item',
  },
];

/** React logs hydration problems through console.error, not exceptions. */
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

  const hydrationErrors = messages.filter((message) => HYDRATION_NOISE.test(message));
  return { container, root, hydrationErrors, messages };
}

beforeAll(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  // jsdom has neither observer nor frame scheduler; the blocks must not crash
  // on a server render and must degrade gracefully when they are absent.
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

describe('Selia blocks — SSR', () => {
  it.each(cases)('$name server-renders the merchant\'s content', ({ path, render, ssrText }) => {
    const data = seed(path) as BlockData;
    const html = renderToString(render(data));

    expect(html).toContain('class="selia ');
    for (const text of ssrText) {
      expect(html, `${path}: "${text}" missing from SSR output`).toContain(text);
    }
  });

  it('never touches window/document while rendering on the server', () => {
    // renderToString runs in jsdom here, so remove the globals to emulate an
    // actual Node server. Any render-time access throws immediately.
    const savedWindow = globalThis.window;
    const savedDocument = globalThis.document;
    // @ts-expect-error deliberately removing browser globals
    delete globalThis.window;
    // @ts-expect-error deliberately removing browser globals
    delete globalThis.document;
    try {
      for (const { path, render } of cases) {
        expect(() => renderToString(render(seed(path) as BlockData))).not.toThrow();
      }
    } finally {
      (globalThis as Record<string, unknown>).window = savedWindow;
      (globalThis as Record<string, unknown>).document = savedDocument;
    }
  });
});

describe('Selia blocks — hydration / CSR', () => {
  it.each(cases)('$name hydrates its own server HTML without a mismatch', async ({ path, render, selector }) => {
    const data = seed(path) as BlockData;
    const element = render(data);
    const html = renderToString(element);
    const { container, hydrationErrors, messages } = await hydrate(element, html);

    expect(hydrationErrors, `${path}: ${messages.join(' | ')}`).toEqual([]);
    expect(container.querySelector('.selia')).not.toBeNull();
    expect(
      container.querySelector(selector),
      `${path}: "${selector}" missing after hydration`
    ).not.toBeNull();
    expect(container.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('BlogTeaser leads with a feature and lists the rest', async () => {
    const data = seed('selia-blog') as BlockData;
    const element = <BlogTeaser data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    /* The newest article is the feature, not another equal card: a list with no
       emphasis gives the reader no entry point. */
    const feature = container.querySelector('.selia-blog__feature');
    expect(feature?.getAttribute('href')).toBe('/blog/1');
    expect(feature?.querySelector('.selia-blog__name')?.textContent).toBe(
      'كيف تختار القطعة المناسبة'
    );
    expect(container.querySelectorAll('.selia-blog__row')).toHaveLength(1);
    expect(container.querySelector('.selia-blog__row .selia-blog__name')?.textContent).toBe(
      'مساحة تهدأ فيها الغرفة'
    );
  });

  it('BlogTeaser numbers the list from 02, continuing after the feature', async () => {
    const data = seed('selia-blog') as BlockData;
    const element = <BlogTeaser data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    /* The feature is entry 01, so the first row is 02. Restarting the count at
       01 would make the list read as a separate widget from the feature it
       continues. */
    const ords = [...container.querySelectorAll('.selia-blog__ord')].map((n) => n.textContent);
    expect(ords).toEqual(['02']);
  });

  it('BlogTeaser falls back to a plate when the article has no photo', async () => {
    const data = seed('selia-blog') as BlockData;
    const lead = FIXTURES.ARTICLES[0] as unknown as Record<string, unknown>;
    const saved = lead.image;
    try {
      delete lead.image;
      const element = <BlogTeaser data={data} />;
      const { container } = await hydrate(element, renderToString(element));

      /* The card carries white type in every state. Without a photo it must be
         a dark plate — white on the light `--surface-2` fallback is the one
         unreadable state this block can reach, and it is reachable by simply
         publishing a post with no image. */
      const feature = container.querySelector('.selia-blog__feature');
      expect(feature?.getAttribute('data-plate')).toBe('1');
      expect(feature?.querySelector('img')).toBeNull();
      expect(feature?.querySelector('.selia-blog__veil')).toBeNull();
    } finally {
      lead.image = saved;
    }
  });

  it('BlogTeaser prints the date the API sends as { date, timezone }', async () => {
    const data = seed('selia-blog') as BlockData;
    const element = <BlogTeaser data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    /* The second article's `created_at` is the object shape the API really
       returns. Reading it as a string yields `[object Object]` → Invalid Date →
       an empty <time>, which is exactly how the blank date got shipped. */
    const row = container.querySelector('.selia-blog__row .selia-blog__date');
    expect(row?.textContent?.trim()).toBe('31 ديسمبر 2024');
    expect(row?.getAttribute('datetime')).toMatch(/^2024-12-31/);
  });

  it('BlogTeaser switches category on the client', async () => {
    const data = seed('selia-blog') as BlockData;
    const element = <BlogTeaser data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const chips = [...container.querySelectorAll<HTMLButtonElement>('.selia-blog__chip')];
    expect(chips.length).toBeGreaterThan(1);
    expect(chips[0].getAttribute('aria-selected')).toBe('true');

    await act(async () => chips[1].click());
    expect(container.querySelectorAll('.selia-blog__chip')[1].getAttribute('aria-selected')).toBe('true');
    expect(container.querySelectorAll('.selia-blog__chip')[0].getAttribute('aria-selected')).toBe('false');
  });

  it('Branches switches the selected tab on the client', async () => {
    const data = seed('selia-branches') as BlockData;
    const element = <Branches data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabs.length).toBeGreaterThan(1);
    await act(async () => tabs[1].click());
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('TickerBar renders one bar per row, each with its own direction and style', async () => {
    /* Deliberately not the demo seed: the point is that the attributes are read
       per row, so the fixture has to differ row to row. A seed-tuned assertion
       turns every change to the demo copy into a test failure. */
    const data = {
      ticker_rows: [
        { 'ticker_rows.text': 'الشريط الأول', 'ticker_rows.direction': 'page', 'ticker_rows.style': 'solid' },
        { 'ticker_rows.text': 'الشريط الثاني', 'ticker_rows.direction': 'reverse', 'ticker_rows.style': 'outline' },
        { 'ticker_rows.text': 'الشريط الثالث', 'ticker_rows.direction': 'page', 'ticker_rows.style': 'solid' },
      ],
    } as unknown as BlockData;
    const element = <TickerBar data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const bars = [...container.querySelectorAll<HTMLElement>('.selia-ticker__bar')];
    expect(bars).toHaveLength(3);
    /* Direction and style are per-row attributes, not a block-wide switch —
       two bars running opposite ways is the whole point of «متقاطعة». */
    expect(bars.map((bar) => bar.dataset.dir)).toEqual(['page', 'reverse', 'page']);
    expect(bars.map((bar) => bar.dataset.style)).toEqual(['solid', 'outline', 'solid']);
    expect(bars.every((bar) => !!bar.querySelector('.selia-ticker__track'))).toBe(true);
  });

  it('TickerBar derives duration from the row’s speed, not from a fixed time', async () => {
    /* Same sentence twice, three times the speed. A fixed duration would give
       both bars the same --row-duration and the fast one would not be faster. */
    const data = {
      ticker_rows: [
        { 'ticker_rows.text': 'نص الشريط', 'ticker_rows.speed': '60' },
        { 'ticker_rows.text': 'نص الشريط', 'ticker_rows.speed': '180' },
      ],
    } as unknown as BlockData;
    const element = <TickerBar data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const durations = [...container.querySelectorAll<HTMLElement>('.selia-ticker__bar')].map((bar) =>
      parseFloat(bar.style.getPropertyValue('--row-duration'))
    );
    expect(durations).toHaveLength(2);
    expect(durations[0]).toBeGreaterThan(durations[1]);
    expect(durations[0] / durations[1]).toBeCloseTo(3, 0);
  });

  it('TickerBar alternates the angle when the bars are set to cross', async () => {
    const data = {
      ticker_layout: 'cross',
      ticker_tilt: 5,
      ticker_rows: [
        { 'ticker_rows.text': 'الأول' },
        { 'ticker_rows.text': 'الثاني' },
        { 'ticker_rows.text': 'الثالث' },
      ],
    } as unknown as BlockData;
    const element = <TickerBar data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    expect(
      [...container.querySelectorAll<HTMLElement>('.selia-ticker__bar')].map((bar) =>
        bar.style.getPropertyValue('--row-tilt')
      )
    ).toEqual(['5deg', '-5deg', '5deg']);
  });

  it('TickerBar announces the sentences once, not once per repetition', async () => {
    const data = seed('selia-ticker-bar') as BlockData;
    const element = <TickerBar data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    /* The scrolling copies are aria-hidden; the single announcement carries
       every bar's text in order, separated by an em dash. */
    expect(container.querySelectorAll('.selia-ticker__track[aria-hidden="true"]').length).toBe(3);
    const announcement = container.querySelector('.selia-ticker > .sr-only');
    expect(announcement?.textContent).toContain('توصيل مجاني');
    expect(announcement?.textContent).toContain('شحن خلال يومين');
    /* One element per bar: a single joined string cannot be split back into
       sentences when a bar's own copy already contains the separator. */
    expect(announcement?.children).toHaveLength(3);
  });

  it('ContactForm without a relay key offers a real address instead of a dead form', async () => {
    const data = seed('selia-contact-form') as BlockData;
    const element = <ContactForm data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    // The seed has no access key: a form here would accept the message and
    // silently drop it, so the block must not render one.
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('.selia-contact')?.getAttribute('data-mode')).toBe('direct');
    expect(container.querySelector('a.selia-contact__addr')?.getAttribute('href')).toBe('mailto:hello@example.com');
    /* The phone row is an action, not decoration — a `tel:` link is the only
       thing that makes it tappable on the device where it matters. */
    expect(container.querySelector('.selia-contact__rowvalue[href^="tel:"]')?.getAttribute('href')).toBe(
      'tel:+966551234567'
    );
    expect(container.querySelector('.selia-contact__copy')).not.toBeNull();
  });

  it('ContactForm validates on submit instead of posting an empty message', async () => {
    const data = { ...seed('selia-contact-form'), contact_access_key: 'test-key' } as unknown as BlockData;
    const element = <ContactForm data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    await act(async () => form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));

    expect([...container.querySelectorAll('.selia-field__error')].map((el) => el.textContent)).toEqual([
      'اكتب اسمك من فضلك.',
      'اكتب بريدك الإلكتروني من فضلك.',
      'اكتب رسالتك من فضلك.',
    ]);

    /* An error nobody can associate with its field is an error the screen
       reader never announces, so the pointer has to survive the render. */
    const invalid = [...container.querySelectorAll<HTMLElement>('[aria-invalid="true"]')];
    expect(invalid).toHaveLength(3);
    for (const field of invalid) {
      const target = field.getAttribute('aria-describedby');
      expect(target).toBeTruthy();
      expect(container.querySelector(`#${CSS.escape(target!)}`)).not.toBeNull();
    }
  });

  it('ContactForm counts the message against its ceiling', async () => {
    const data = { ...seed('selia-contact-form'), contact_access_key: 'test-key' } as unknown as BlockData;
    const element = <ContactForm data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const area = container.querySelector('textarea') as HTMLTextAreaElement;
    expect(area.getAttribute('maxlength')).toBe('600');
    expect(container.querySelector('.selia-field__count')?.textContent).toBe('0 / 600');

    await act(async () => {
      // React reads `value` off the node through its own tracker, so a plain
      // assignment is swallowed; the prototype setter is what a paste does.
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(area, 'مرحبا');
      area.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(container.querySelector('.selia-field__count')?.textContent).toBe('5 / 600');
  });

  it('Statistics ends on the merchant\'s exact figure, not a rounded guess', async () => {
    const data = seed('selia-statistics') as BlockData;
    const element = <Statistics data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    // matchMedia matches in jsdom, i.e. reduced motion -> final value at once.
    expect(container.textContent).toContain('+١٢٠٠');
  });

  it('Statistics arms every card as a staggered reveal, in DOM order', async () => {
    const data = seed('selia-statistics') as BlockData;
    const element = <Statistics data={data} />;
    const { container } = await hydrate(element, renderToString(element));

    const items = [...container.querySelectorAll('.selia-stats__item')];
    expect(items.length).toBeGreaterThan(1);
    /* `data-reveal` is what the shared useReveal observes; `--reveal-i` is what
       the stylesheet's per-index delay reads. The second must follow DOM order,
       or a mismatched delay animates the row out of order — which is exactly
       the failure no single settled frame would ever show. */
    expect(items.every((item) => item.hasAttribute('data-reveal'))).toBe(true);
    expect(
      items.map((item) => (item as HTMLElement).style.getPropertyValue('--reveal-i'))
    ).toEqual(items.map((_, index) => String(index)));
  });
});
