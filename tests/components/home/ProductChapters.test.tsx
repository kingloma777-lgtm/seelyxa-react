import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ProductChapters,
  chapterCount,
  chapterPosition,
  productChaptersRunClass,
} from '../../../app/components/home/ProductChapters';

/* What these tests protect is the MODEL, not the looks. The whole scene is a
   pure function of one number — the float chapter index — so the two things
   that can actually be wrong are that function and the way the catalogue is
   turned into chapters. Everything else here guards the mistakes that are
   invisible in a screenshot: an empty `selected` source that fetches the whole
   store, a deleted product leaving a blank screen behind, the wrong split rule
   for Arabic, and a chapter that is half-faded but still takes a tap. */

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
  useMoney: () => ({ format: (amount: number) => `${amount} SAR` }),
}));

const listMock = vi.fn();

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

interface FakeProduct {
  id: number;
  name: string;
  url: string;
  price: number;
  sale_price?: number | null;
  starting_price?: number | null;
  is_on_sale?: boolean;
  image?: { url: string };
}

const makeProduct = (id: number, over: Partial<FakeProduct> = {}): FakeProduct => ({
  id,
  name: `Product ${id}`,
  url: `/p${id}`,
  price: 100,
  sale_price: null,
  starting_price: null,
  is_on_sale: false,
  image: { url: `/${id}.jpg` },
  ...over,
});

const row = (id: number, over: Record<string, unknown> = {}) => ({
  'chapters_items.product': [
    { label: `P${id}`, value: `https://store.test/p${id}`, key: String(id) },
  ],
  'chapters_items.word': '',
  'chapters_items.label': '',
  'chapters_items.note': '',
  'chapters_items.color': '',
  ...over,
});

const data = (...rows: Record<string, unknown>[]) => ({ chapters_items: rows });

const withQuery = (node: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
};

beforeEach(() => {
  listMock.mockReset();
  listMock.mockResolvedValue({ items: [] });
  /* jsdom's `matchMedia` answers `matches: true` for everything, which would
     put every one of these tests in the reduced-motion path. */
  vi.stubGlobal('matchMedia', undefined);
});

/* ── the one number ─────────────────────────────────────────────────────── */

describe('chapterPosition', () => {
  /* The block is split into `count` segments, one per chapter, and each
     segment is a dwell followed by a hand-over. `count` segments (not
     `count − 1`) is what gives the LAST chapter a still moment: with
     `count − 1` it arrives exactly at progress 1, which is the frame the
     sticky stage unpins, so it is never actually seen at rest. */
  it('sits still through the dwell, then ramps to the next chapter', () => {
    /* 4 chapters: segment 0 runs 0 → 0.25, the move starts at 0.55 of it */
    expect(chapterPosition(0, 4)).toBe(0);
    expect(chapterPosition(0.1, 4)).toBe(0); // 0.4 of segment 0 — still dwelling
    expect(chapterPosition(0.1375, 4)).toBe(0); // exactly at DWELL
    expect(chapterPosition(0.194, 4)).toBeCloseTo(0.5, 2); // halfway through the move
    expect(chapterPosition(0.25, 4)).toBe(1); // arrived
  });

  it('reaches the last chapter at the end, with time left to stand on it', () => {
    expect(chapterPosition(1, 4)).toBe(3);
    /* the last chapter is already at rest before the block ends */
    expect(chapterPosition(0.94, 4)).toBe(3);
  });

  it('never runs past the last chapter or below the first', () => {
    expect(chapterPosition(1.6, 4)).toBe(3);
    expect(chapterPosition(-0.4, 4)).toBe(0);
    expect(chapterPosition(Number.NaN, 4)).toBe(0);
  });

  it('is monotone: scrolling down never walks the scene backwards', () => {
    let previous = -1;
    for (let step = 0; step <= 100; step++) {
      const value = chapterPosition(step / 100, 5);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it('handles a single chapter and a fractional count without dividing by zero', () => {
    expect(chapterPosition(0.5, 1)).toBe(0);
    expect(chapterPosition(0.5, 0)).toBe(0);
    expect(Number.isFinite(chapterPosition(0.5, 3.7))).toBe(true);
  });
});

/* ── the merchant's contract ────────────────────────────────────────────── */

describe('chapterCount', () => {
  it('counts only rows that point at a product', () => {
    expect(chapterCount(data(row(1), row(2), row(3)))).toBe(3);
    /* a row the merchant added but has not filled yet is not a chapter */
    expect(chapterCount(data(row(1), row(2), { 'chapters_items.word': 'x' }))).toBe(2);
  });

  it('clamps to the range the manifest allows', () => {
    expect(chapterCount(data(row(1)))).toBe(2);
    expect(chapterCount({})).toBe(2);
    expect(chapterCount(data(...[1, 2, 3, 4, 5, 6, 7, 8].map((id) => row(id))))).toBe(6);
  });
});

describe('productChaptersRunClass', () => {
  it('pairs the pacing tier with the chapter count', () => {
    expect(productChaptersRunClass({ ...data(row(1), row(2), row(3)), chapters_travel: 'short' })).toBe(
      'pc-run--short3'
    );
    expect(productChaptersRunClass(data(row(1), row(2)))).toBe('pc-run--medium2');
    expect(
      productChaptersRunClass({ ...data(row(1), row(2), row(3), row(4)), chapters_travel: 'long' })
    ).toBe('pc-run--long4');
  });

  it('falls back to the medium tier for anything unrecognised', () => {
    expect(productChaptersRunClass({ ...data(row(1), row(2)), chapters_travel: 'gigantic' })).toBe(
      'pc-run--medium2'
    );
    expect(productChaptersRunClass(null)).toBe('pc-run--medium2');
  });

  it('lets the field id beat the short alias', () => {
    expect(
      productChaptersRunClass({
        ...data(row(1), row(2)),
        travel: 'short',
        chapters_travel: 'long',
      })
    ).toBe('pc-run--long2');
  });
});

/* ── the catalogue ──────────────────────────────────────────────────────── */

describe('ProductChapters', () => {
  it('renders one chapter per product row', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2), makeProduct(3)] });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2), row(3))} />);
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__chapter')).toHaveLength(3));
  });

  /* An empty `selected` source is not "nothing": the API answers it with the
     store's whole catalogue, so the request must not be sent at all. */
  it('sends no request when no row has a product', () => {
    withQuery(<ProductChapters data={data({ 'chapters_items.word': 'x' })} />);
    expect(listMock).not.toHaveBeenCalled();
  });

  it('asks for the selected ids only, one request for the whole block', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    withQuery(<ProductChapters data={data(row(1), row(2), row(1))} />);
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));
    expect(listMock.mock.calls[0][0]).toMatchObject({
      source: 'selected',
      sourceValue: [1, 2],
      perPage: 2,
    });
  });

  /* A deleted product must take its chapter with it — a coloured screen with a
     word and no product is worse than a shorter sequence. */
  it('drops the chapter whose product is gone', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(3)] });
    const { container } = withQuery(
      <ProductChapters data={data(row(1), row(2), row(3))} />
    );
    await waitFor(() =>
      expect(container.querySelectorAll('.product-chapters__chapter')).toHaveLength(2)
    );
    expect(
      [...container.querySelectorAll('.product-chapters__cta')].map((a) => a.getAttribute('href'))
    ).toEqual(['/p1', '/p3']);
  });

  it('renders nothing when no product can be shown at all', async () => {
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(container.querySelector('.product-chapters')).toBeNull());
  });
});

/* ── the frame ──────────────────────────────────────────────────────────── */

describe('ProductChapters — the frame', () => {
  it('marks only the first chapter live, and keeps the rest out of the tab order', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__chapter')).toHaveLength(2));
    const chapters = [...container.querySelectorAll('.product-chapters__chapter')];
    expect(chapters[0].classList.contains('is-active')).toBe(true);
    expect(chapters[0].hasAttribute('inert')).toBe(false);
    expect(chapters[1].hasAttribute('inert')).toBe(true);
  });

  it('falls back to the product name for the giant word', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1, { name: 'كرسي موردن' }), makeProduct(2)] });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    /* the INK, not the word element: the decorative slices are copies of the
       same text, so `textContent` on the whole word reads it several times */
    await waitFor(() =>
      expect(container.querySelector('.product-chapters__ink')?.textContent).toBe('كرسي موردن')
    );
  });

  /* Latin is split per CHARACTER, because that cascade is the effect. A joined
     script cannot be: a letter in its own inline-block is shaped in isolation
     and «الكرسي» comes out as disconnected glyphs. It is kept whole and sliced
     by clip-path instead — but the slices need measured columns, and jsdom has
     no layout, so what this asserts is the fallback: whole, with the character
     count still driving the fit. */
  it('splits a Latin word into characters and keeps a joined script whole', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters
        data={data(row(1, { 'chapters_items.word': 'الكرسي' }), row(2, { 'chapters_items.word': 'CHAIR' }))}
      />
    );
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__chapter')).toHaveLength(2));
    const words = [...container.querySelectorAll('.product-chapters__word')] as HTMLElement[];

    /* Arabic: no per-LETTER boxes — one unit for the whole word, six
       characters driving the fit */
    const arabic = words[0].querySelectorAll('.product-chapters__unit');
    expect(arabic).toHaveLength(1);
    expect(arabic[0].textContent).toBe('الكرسي');
    expect(words[0].style.getPropertyValue('--chars')).toBe('6');
    expect(words[0].querySelectorAll('.product-chapters__wordgroup')).toHaveLength(1);

    /* Latin: one box per character */
    expect(words[1].querySelectorAll('.product-chapters__unit')).toHaveLength(5);
    expect(words[1].style.getPropertyValue('--n')).toBe('5');
    expect(words[1].style.getPropertyValue('--chars')).toBe('5');
  });

  /* The two counts are different numbers on purpose: `--chars` drives the fit
     (any word fills the frame) and `--n` drives the stagger (letters that
     actually move). */
  it('counts characters separately from units on a multi-word Arabic line', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters
        data={data(row(1, { 'chapters_items.word': 'ركن القراءة' }), row(2))}
      />
    );
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__chapter')).toHaveLength(2));
    const word = container.querySelector('.product-chapters__word') as HTMLElement;
    expect(word.style.getPropertyValue('--chars')).toBe('10');
    /* words stay grouped so a line break cannot land inside one */
    expect(word.querySelectorAll('.product-chapters__wordgroup')).toHaveLength(2);
  });

  it('paints each chapter with the merchant colour, and the ramp when it is empty', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters
        data={data(row(1, { 'chapters_items.color': '#123456' }), row(2))}
      />
    );
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__chapter')).toHaveLength(2));
    const chapters = [...container.querySelectorAll('.product-chapters__chapter')] as HTMLElement[];
    expect(chapters[0].style.getPropertyValue('--pc-bg')).toBe('#123456');
    /* an empty colour is a missing value, not a design decision */
    expect(chapters[1].style.getPropertyValue('--pc-bg')).toMatch(/^#/);
  });

  it('links the circle to the product and prints its price', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(1, { price: 355 }), makeProduct(2)],
    });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(container.querySelector('.product-chapters__cta')).not.toBeNull());
    const cta = container.querySelector('.product-chapters__cta') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toBe('/p1');
    expect(cta.querySelector('.product-chapters__price')?.textContent).toBe('355 SAR');
  });

  it('prefers the sale price over the list price', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(1, { price: 200, sale_price: 140, is_on_sale: true }), makeProduct(2)],
    });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(container.querySelector('.product-chapters__price')).not.toBeNull());
    expect(container.querySelector('.product-chapters__price')?.textContent).toBe('140 SAR');
  });

  it('drops the price when the merchant turns it off', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters data={{ ...data(row(1), row(2)), chapters_show_price: false }} />
    );
    await waitFor(() => expect(container.querySelector('.product-chapters__cta')).not.toBeNull());
    expect(container.querySelector('.product-chapters__price')).toBeNull();
    /* the circle keeps its label, so it is still a call to action */
    expect(container.querySelector('.product-chapters__cta-label')?.textContent).toBe('Shop');
  });

  it('uses the merchant button label, and lets a cleared one stay empty', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const labelled = withQuery(
      <ProductChapters data={{ ...data(row(1), row(2)), chapters_cta: 'شوف القطعة' }} />
    );
    await waitFor(() =>
      expect(labelled.container.querySelector('.product-chapters__cta-label')?.textContent).toBe(
        'شوف القطعة'
      )
    );
    labelled.unmount();
    const cleared = withQuery(
      <ProductChapters data={{ ...data(row(1), row(2)), chapters_cta: '' }} />
    );
    await waitFor(() => expect(cleared.container.querySelector('.product-chapters__cta')).not.toBeNull());
    expect(cleared.container.querySelector('.product-chapters__cta-label')?.textContent).toBe('');
  });

  it('renders the ribbon and the caption only when the merchant wrote them', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const plain = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(plain.container.querySelector('.product-chapters__chapter')).not.toBeNull());
    expect(plain.container.querySelector('.product-chapters__pill')).toBeNull();
    expect(plain.container.querySelector('.product-chapters__note')).toBeNull();
    plain.unmount();

    const dressed = withQuery(
      <ProductChapters
        data={data(
          row(1, { 'chapters_items.label': 'كرسي · كتان', 'chapters_items.note': 'يُصنع حسب الطلب' }),
          row(2)
        )}
      />
    );
    await waitFor(() =>
      expect(dressed.container.querySelector('.product-chapters__pill')?.textContent).toBe(
        'كرسي · كتان'
      )
    );
    expect(dressed.container.querySelector('.product-chapters__note')?.textContent).toBe(
      'يُصنع حسب الطلب'
    );
  });

  /* The ribbon is positioned with `inset-inline-start`, so its OWN direction
     decides which side it lands on. `dir="auto"` on an Arabic label inside an
     English store resolves to RTL and the ribbon jumps onto the price circle —
     the bug this test exists for. */
  it('leaves the ribbon in the page direction so it cannot land on the price', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters data={data(row(1, { 'chapters_items.label': 'كرسي · كتان' }), row(2))} />
    );
    await waitFor(() => expect(container.querySelector('.product-chapters__pill')).not.toBeNull());
    expect(container.querySelector('.product-chapters__pill')?.getAttribute('dir')).toBeNull();
  });

  it('puts a bare pack on the bare class and a catalogue shot on a card', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const carded = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(carded.container.querySelector('.product-chapters')).not.toBeNull());
    expect(carded.container.querySelector('.product-chapters')?.classList.contains('is-pack-bare')).toBe(false);
    carded.unmount();

    const bare = withQuery(
      <ProductChapters data={{ ...data(row(1), row(2)), chapters_pack_style: 'bare' }} />
    );
    await waitFor(() => expect(bare.container.querySelector('.product-chapters')).not.toBeNull());
    expect(bare.container.querySelector('.product-chapters')?.classList.contains('is-pack-bare')).toBe(true);
  });

  /* The whole point of the cut-out field: a catalogue photo is a rectangle
     with its own background, and no blend mode can remove a studio shadow. A
     chapter that has a transparent PNG uses it instead, and says so on the
     pack so the stylesheet can drop the blend and add a silhouette shadow. */
  it('prefers the chapter cut-out over the catalogue photo, and marks the pack', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters
        data={data(
          row(1, { 'chapters_items.cutout': '/reference/chapters/1.png' }),
          row(2)
        )}
      />
    );
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__pack')).toHaveLength(2));
    const packs = [...container.querySelectorAll('.product-chapters__pack')] as HTMLElement[];

    expect(packs[0].classList.contains('is-cutout')).toBe(true);
    expect(packs[0].querySelector('img')?.getAttribute('src')).toBe('/reference/chapters/1.png');

    /* no cut-out: the catalogue photo, and no cut-out class */
    expect(packs[1].classList.contains('is-cutout')).toBe(false);
    expect(packs[1].querySelector('img')?.getAttribute('src')).toBe('/2.jpg');
  });

  /* The circle is anchored to the pack, not to the frame: on the reference it
     touches the product's edge, and the product's width is the merchant's
     photo. It has to be a SIBLING of the pack, not a child — a child would be
     painted inside the pack's blend mode and tinted by it. */
  it('anchors the circle to the pack it belongs to', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() => expect(container.querySelectorAll('.product-chapters__figure')).toHaveLength(2));
    const figure = container.querySelector('.product-chapters__figure') as HTMLElement;
    const pack = figure.querySelector('.product-chapters__pack');
    const cta = figure.querySelector('.product-chapters__cta');
    expect(pack).not.toBeNull();
    expect(cta).not.toBeNull();
    expect(cta?.parentElement).toBe(figure);
    expect(cta?.closest('.product-chapters__pack')).toBeNull();
  });

  /* The reserved height is a static string in the engine config, so the budget
     arrives as a class — and the block's own height has to read the same
     number, or a deleted product would leave a gap at the foot of the block. */
  it('reserves the same budget the router class does', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2), makeProduct(3)] });
    const placement = data(row(1), row(2), row(3));
    const { container } = withQuery(<ProductChapters data={placement} />);
    await waitFor(() => expect(container.querySelector('.product-chapters')).not.toBeNull());
    const root = container.querySelector('.product-chapters') as HTMLElement;
    expect(productChaptersRunClass(placement)).toBe('pc-run--medium3');
    /* medium = 105svh per chapter */
    expect(root.style.getPropertyValue('--pc-run')).toBe('315svh');
  });

  it('carries the ink colour and the word scale onto the root', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters data={{ ...data(row(1), row(2)), chapters_ink: '#101010', chapters_word_size: 120 }} />
    );
    await waitFor(() => expect(container.querySelector('.product-chapters')).not.toBeNull());
    const root = container.querySelector('.product-chapters') as HTMLElement;
    expect(root.style.getPropertyValue('--pc-ink')).toBe('#101010');
    expect(root.style.getPropertyValue('--pc-word')).toBe('1.2');
  });

  it('clamps the word scale to the slider range', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(
      <ProductChapters data={{ ...data(row(1), row(2)), chapters_word_size: 400 }} />
    );
    await waitFor(() => expect(container.querySelector('.product-chapters')).not.toBeNull());
    expect((container.querySelector('.product-chapters') as HTMLElement).style.getPropertyValue('--pc-word')).toBe('1.4');
  });

  /* Reduced motion gets a composed still: every chapter laid out in turn at
     full opacity, with the scroll budget collapsed by the stylesheet. A
     six-viewport block that never changes is worse than no animation, because
     the visitor scrolls through empty colour looking for something to happen. */
  it('lays every chapter out flat under reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    listMock.mockResolvedValue({ items: [makeProduct(1), makeProduct(2)] });
    const { container } = withQuery(<ProductChapters data={data(row(1), row(2))} />);
    await waitFor(() =>
      expect(container.querySelector('.product-chapters')?.classList.contains('is-flat')).toBe(true)
    );
    const chapters = [...container.querySelectorAll('.product-chapters__chapter')];
    expect(chapters.every((chapter) => chapter.classList.contains('is-active'))).toBe(true);
    expect(chapters.some((chapter) => chapter.hasAttribute('inert'))).toBe(false);
    vi.unstubAllGlobals();
  });
});
