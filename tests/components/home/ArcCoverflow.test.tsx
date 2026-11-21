import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import {
  ArcCoverflow,
  arcCoverflowHeight,
  arcCoverflowHeightClass,
} from '../../../app/components/home/ArcCoverflow';

/* The block is one number per card, written every frame. These tests pin what
   would fail silently on a merchant's page: that a vertical wheel is left to
   the page, that the arrows and the keyboard move exactly one card in the
   reading direction, that the row wraps, and that the arc is an arc. */

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    locale: 'ar',
    direction: 'rtl',
    isRTL: true,
    isLTR: false,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const slide = (title: string, url: string | null = null) => ({
  'arc_slides.image': `/${title}.jpg`,
  'arc_slides.title': title,
  'arc_slides.note': `${title} note`,
  'arc_slides.url': url,
});

const base = {
  arc_slides: [
    slide('one', '/product/one'),
    slide('two'),
    slide('three'),
    slide('four'),
    slide('five'),
  ],
  arc_eyebrow: 'المجموعة',
  arc_hint: 'اسحب',
  arc_label: 'SEELYXA',
  arc_note: 'note',
  arc_curve: 70,
  arc_height: 'medium',
  arc_autoplay: false,
};

let reduced = false;

beforeEach(() => {
  reduced = false;
  window.matchMedia = ((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  document.documentElement.dir = 'ltr';
});

afterEach(() => {
  document.documentElement.dir = 'ltr';
  vi.restoreAllMocks();
});

const stageOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.arc-coverflow__stage')!;

const cardsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.arc-coverflow__slide'));

const activeIndex = (container: HTMLElement) => {
  const card = container.querySelector<HTMLElement>('.arc-coverflow__slide[data-active="true"]');
  return card ? Number(card.style.getPropertyValue('--i')) : -1;
};

/** jsdom has no layout, so the stage reports a zero box and every card lands
 *  on the minimum size. Pinning the box is the only way to assert the arc
 *  itself rather than "the component rendered something". */
const sizeStage = (stage: HTMLElement, width: number, height: number) => {
  Object.defineProperty(stage, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(stage, 'clientHeight', { configurable: true, value: height });
  window.dispatchEvent(new Event('resize'));
};

/* The frame loop updates React state outside an event handler, so every wait is
   wrapped — otherwise React warns on a passing test. */
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 360)));

/** Waits until the row rests ON `expected`, then returns the index it landed on.
 *
 * A fixed sleep is the wrong clock: the lerp advances per animation frame, a
 * loaded machine renders fewer of them per second, and the assertion then runs
 * while the row is a slot short — which is exactly how this file failed inside a
 * full-suite run ("five presses landed on the fourth card") and passed on its
 * own. Polling the same number the assertion reads cannot disagree with it.
 *
 * Each `await` is its own `act` on purpose: one long `act(async …)` around the
 * whole poll defers every pending `setActive` until the scope exits, so the DOM
 * attribute this reads would never change and the loop would always time out. */
const restOn = async (container: HTMLElement, expected: number) => {
  for (let i = 0; i < 60; i += 1) {
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    if (activeIndex(container) === expected) return expected;
  }
  return activeIndex(container);
};

const num = (el: HTMLElement, name: string) => parseFloat(el.style.getPropertyValue(name));

describe('ArcCoverflow', () => {
  it('renders one card per row and names the first in the caption', () => {
    const { container } = render(<ArcCoverflow data={base} />);
    expect(cardsOf(container)).toHaveLength(5);
    expect(container.querySelector('.arc-coverflow__title')?.textContent).toBe('one');
    expect(activeIndex(container)).toBe(0);
  });

  it('drops a row with no image instead of rendering an empty card', () => {
    const { container } = render(
      <ArcCoverflow
        data={{ ...base, arc_slides: [slide('one'), { 'arc_slides.title': 'ghost' }, slide('two')] }}
      />
    );
    expect(cardsOf(container)).toHaveLength(2);
  });

  it('renders nothing at all when no row survives', () => {
    const { container } = render(<ArcCoverflow data={{ ...base, arc_slides: [] }} />);
    expect(container.querySelector('.arc-coverflow')).toBeNull();
  });

  /* ── the arc ─────────────────────────────────────────────────────────── */

  it('lifts and enlarges the centre card and sinks its neighbours', async () => {
    const { container } = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(container), 1200, 700);
    await settle();

    const cards = cardsOf(container);
    const centre = cards[0];
    const neighbour = cards[1];

    expect(num(centre, '--s')).toBeCloseTo(1, 2);
    expect(num(neighbour, '--s')).toBeLessThan(0.9);
    /* the centre sits HIGHER on screen (smaller y) and further out the row
       drops — that is the whole shape of the block */
    expect(num(centre, '--y')).toBeLessThan(num(neighbour, '--y'));
    expect(num(neighbour, '--y')).toBeLessThan(num(cards[2], '--y'));
    expect(num(centre, '--z')).toBeGreaterThan(num(neighbour, '--z'));
  });

  it('mirrors the row in RTL without moving the centre card', async () => {
    /* `--x` is the card's LEFT edge, and a mirrored left edge is not the
       negation of the original (the card has width), so the comparison has to
       be made on centres. `--ac-w` is published for exactly this. */
    const centreOf = (card: HTMLElement, root: HTMLElement) => {
      const width = parseFloat(getComputedStyle(root).getPropertyValue('--ac-w'));
      return num(card, '--x') + (width * num(card, '--s')) / 2;
    };

    const ltr = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(ltr.container), 1200, 700);
    await settle();
    const ltrRoot = ltr.container.querySelector<HTMLElement>('.arc-coverflow')!;
    const ltrFirst = centreOf(cardsOf(ltr.container)[1], ltrRoot);
    ltr.unmount();

    document.documentElement.dir = 'rtl';
    const rtl = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(rtl.container), 1200, 700);
    await settle();
    const rtlRoot = rtl.container.querySelector<HTMLElement>('.arc-coverflow')!;
    const rtlFirst = centreOf(cardsOf(rtl.container)[1], rtlRoot);

    expect(ltrFirst).toBeGreaterThan(0);
    expect(rtlFirst).toBeCloseTo(-ltrFirst, 0);
  });

  /* ── the wheel ───────────────────────────────────────────────────────── */

  /* The reference calls preventDefault() on every wheel event inside a 100svh
     section: a visitor scrolling down over it can never get past it. On a
     store that is a trap, so the vertical wheel must stay untouched. */
  it('leaves a vertical wheel to the page', () => {
    const { container } = render(<ArcCoverflow data={base} />);
    const event = new WheelEvent('wheel', {
      deltaX: 0,
      deltaY: 320,
      bubbles: true,
      cancelable: true,
    });
    stageOf(container).dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('takes the horizontal wheel and turns the row', async () => {
    const { container } = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(container), 1200, 700);
    await settle();

    const event = new WheelEvent('wheel', {
      deltaX: 200,
      deltaY: 0,
      bubbles: true,
      cancelable: true,
    });
    stageOf(container).dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);

    await settle();
    expect(activeIndex(container)).toBeGreaterThan(0);
  });

  /* ── buttons, keys, drag ─────────────────────────────────────────────── */

  it('moves exactly one card per arrow press and wraps at the end', async () => {
    const { container } = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(container), 1200, 700);
    await settle();

    const next = container.querySelectorAll<HTMLButtonElement>('.arc-coverflow__nav button')[1];
    fireEvent.click(next);
    expect(await restOn(container, 1)).toBe(1);

    /* four more presses walk 2, 3, 4 and wrap back to the first card */
    for (let step = 2; step <= 5; step += 1) {
      fireEvent.click(next);
      expect(await restOn(container, step % 5)).toBe(step % 5);
    }
  });

  it('maps the arrow keys through the layout direction', async () => {
    document.documentElement.dir = 'rtl';
    const { container } = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(container), 1200, 700);
    await settle();

    /* in RTL "forward" is leftward, so ArrowLeft advances the collection */
    fireEvent.keyDown(container.querySelector('.arc-coverflow')!, { key: 'ArrowLeft' });
    expect(await restOn(container, 1)).toBe(1);

    fireEvent.keyDown(container.querySelector('.arc-coverflow')!, { key: 'ArrowRight' });
    expect(await restOn(container, 0)).toBe(0);
  });

  it('follows a drag and lands the card dead centre', async () => {
    const { container } = render(<ArcCoverflow data={base} />);
    const stage = stageOf(container);
    sizeStage(stage, 1200, 700);
    await settle();

    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 600, clientY: 200, button: 0 });
    for (let x = 580; x >= 460; x -= 20) {
      fireEvent.pointerMove(stage, { pointerId: 1, clientX: x, clientY: 200 });
    }
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 460, clientY: 200 });

    expect(await restOn(container, 1)).toBe(1);
    const centre = cardsOf(container)[1];
    /* snapped: the card's own centre is half its width from the origin */
    expect(num(centre, '--x')).toBeCloseTo(-num(centre, '--s') * 93, 0);
  });

  /* ── links ───────────────────────────────────────────────────────────── */

  it('links only the card at the centre', async () => {
    const { container } = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(container), 1200, 700);
    await settle();

    expect(container.querySelectorAll('.arc-coverflow__link')).toHaveLength(1);
    expect(container.querySelector('.arc-coverflow__link')?.getAttribute('href')).toBe('/product/one');

    fireEvent.click(container.querySelectorAll<HTMLButtonElement>('.arc-coverflow__nav button')[1]);
    await restOn(container, 1);

    /* the new centre has no url, so nothing in the row is a link any more */
    expect(container.querySelectorAll('.arc-coverflow__link')).toHaveLength(0);
  });

  /* ── copy that the merchant cleared ──────────────────────────────────── */

  it('hides an element whose field was cleared', () => {
    const { container } = render(
      <ArcCoverflow data={{ ...base, arc_eyebrow: '', arc_hint: '', arc_label: '', arc_note: '' }} />
    );
    expect(container.querySelector('.arc-coverflow__eyebrow')).toBeNull();
    expect(container.querySelector('.arc-coverflow__hint')).toBeNull();
    expect(container.querySelector('.arc-coverflow__masthead')).toBeNull();
  });

  it('keeps the caption when a card has no note', () => {
    const rows = base.arc_slides.map((row) => ({ ...row, 'arc_slides.note': '' }));
    const { container } = render(<ArcCoverflow data={{ ...base, arc_slides: rows }} />);
    expect(container.querySelector('.arc-coverflow__note')).toBeNull();
    expect(container.querySelector('.arc-coverflow__title')?.textContent).toBe('one');
  });

  /* ── reduced motion ──────────────────────────────────────────────────── */

  it('lands the row in a single frame under reduced motion', async () => {
    reduced = true;
    const { container } = render(<ArcCoverflow data={base} />);
    sizeStage(stageOf(container), 1200, 700);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    fireEvent.click(container.querySelectorAll<HTMLButtonElement>('.arc-coverflow__nav button')[1]);
    await act(() => new Promise((resolve) => setTimeout(resolve, 40)));

    expect(activeIndex(container)).toBe(1);
  });

  it('advances on its own only when the merchant asked for it', async () => {
    const still = render(<ArcCoverflow data={base} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 4400)));
    expect(activeIndex(still.container)).toBe(0);
    still.unmount();

    const auto = render(<ArcCoverflow data={{ ...base, arc_autoplay: true }} />);
    sizeStage(stageOf(auto.container), 1200, 700);
    await act(() => new Promise((resolve) => setTimeout(resolve, 4600)));
    expect(activeIndex(auto.container)).toBeGreaterThan(0);
  }, 20000);

  /* ── the height contract ─────────────────────────────────────────────── */

  it('maps the height tier to the class the router reserves with', () => {
    expect(arcCoverflowHeight({ arc_height: 'compact' })).toBe('compact');
    expect(arcCoverflowHeight({ arc_height: 'tall' })).toBe('tall');
    expect(arcCoverflowHeight({ arc_height: 'nonsense' })).toBe('medium');
    expect(arcCoverflowHeight({})).toBe('medium');
    expect(arcCoverflowHeightClass({ arc_height: 'tall' })).toBe('arc-coverflow-h--tall');
  });
});
