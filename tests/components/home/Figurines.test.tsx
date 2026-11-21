import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { Figurines } from '../../../app/components/home/Figurines';

/* The block owns one full-viewport hero, so what it gets wrong is invisible
   until a merchant reports it: a cleared collection leaving an empty stage, a
   figure with no image printing a broken pane, the ghost word standing in for a
   caption that was never set, autoplay running for a visitor who asked the OS
   for less motion, or the arrows travelling backwards on an Arabic store.
   Each test below pins one of those, not the markup. */

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

/** One figurine row as the merchant's repeater delivers it: short keys first,
 *  `figurines.<name>` only as the fallback the block accepts. */
const figurine = (name: string, extra: Record<string, unknown> = {}) => ({
  image: `/${name}.png`,
  title: name,
  subtitle: `${name} subtitle`,
  color: '#123456',
  url: null,
  ...extra,
});

const base = {
  figurines: [
    figurine('one'),
    figurine('two'),
    figurine('three'),
    figurine('four'),
  ],
  ghost_text: 'SHOWROOM',
  store_label: 'SEELYXA',
  cta_text: 'Shop the look',
  cta_link: '/shop',
};

let reduced = false;

beforeEach(() => {
  reduced = false;
  /* setup.tsx defaults every media query to `matches: true`, which would make
     `prefers-reduced-motion` permanently on and silently disable autoplay in
     every test here. Pin the two queries this block actually asks about. */
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  document.documentElement.dir = 'rtl';
});

afterEach(() => {
  document.documentElement.dir = 'ltr';
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.figurines')!;

const figuresOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.figurines__fig'));

const navButtons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.figurines__nav button'));

const countOf = (container: HTMLElement) =>
  container.querySelector('.figurines__count')?.textContent?.replace(/\s+/g, ' ').trim();

const pad = (n: number) => String(n).padStart(2, '0');

/** The travel lock is a real 650ms `window.setTimeout`; a second press inside
 *  it is dropped on purpose. Tests that press twice must let it expire. */
const unlock = () => act(() => void vi.advanceTimersByTime(700));

describe('Figurines', () => {
  it('stands one figurine per row and names the focused one', () => {
    const { container } = render(<Figurines data={base} />);

    expect(figuresOf(container)).toHaveLength(4);
    expect(container.querySelector('.figurines__title')?.textContent).toBe('one');
    expect(container.querySelector('.figurines__sub')?.textContent).toBe('one subtitle');
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(4)}`);
  });

  it('exposes itself as a carousel labelled by the figure in focus', () => {
    const { container } = render(<Figurines data={base} />);
    const region = root(container);

    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect(region.getAttribute('aria-label')).toBe('one');
  });

  it('drops a row with no image instead of printing a broken pane', () => {
    const { container } = render(
      <Figurines
        data={{ ...base, figurines: [figurine('one'), { title: 'ghost' }, figurine('two')] }}
      />
    );

    expect(figuresOf(container)).toHaveLength(2);
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(2)}`);
  });

  it('renders nothing at all when no row survives', () => {
    const empty = render(<Figurines data={{ ...base, figurines: [] }} />);
    expect(empty.container.querySelector('.figurines')).toBeNull();
    empty.unmount();

    /* an unset collection is not an empty array — both must leave the page */
    const missing = render(<Figurines data={{ ...base, figurines: undefined }} />);
    expect(missing.container.querySelector('.figurines')).toBeNull();
  });

  it('accepts the declared prefixed ids as well as the short keys', () => {
    const { container } = render(
      <Figurines
        data={{
          figurines: [{ 'figurines.image': '/dotted.png', 'figurines.title': 'dotted' }],
          figurines_ghost_text: 'عرض',
          figurines_store_label: 'متجر',
          figurines_cta_text: 'تسوق',
        }}
      />
    );

    expect(container.querySelector('.figurines__title')?.textContent).toBe('dotted');
    expect(container.querySelector('.figurines__ghost')?.textContent).toBe('عرض');
    expect(container.querySelector('.figurines__brand')?.textContent).toBe('متجر');
    expect(container.querySelector('.figurines__cta')?.textContent).toContain('تسوق');
  });

  it('falls back to the ghost word when a figure carries no title', () => {
    const untitled = base.figurines.map((row) => ({ ...row, title: '', subtitle: '' }));
    const { container } = render(<Figurines data={{ ...base, figurines: untitled }} />);

    expect(container.querySelector('.figurines__title')).toBeNull();
    expect(root(container).getAttribute('aria-label')).toBe('SHOWROOM');
  });

  it('keeps a ghost word even when the merchant cleared the setting', () => {
    const { container } = render(
      <Figurines data={{ ...base, ghost_text: '', figurines: [figurine('one', { title: '' })] }} />
    );
    expect(container.querySelector('.figurines__ghost')?.textContent).toBe('SHOWROOM');
  });

  it('paints the stage with the focused figure colour, and a fallback when it has none', () => {
    const { container } = render(<Figurines data={base} />);
    expect(root(container).style.getPropertyValue('--fig-bg')).toBe('#123456');

    const colourless = base.figurines.map((row) => ({ ...row, color: '' }));
    const plain = render(<Figurines data={{ ...base, figurines: colourless }} />);
    expect(root(plain.container).style.getPropertyValue('--fig-bg')).toBe('#C96F4A');
  });

  it('assigns the depth roles around the figure in focus', () => {
    const { container } = render(<Figurines data={base} />);
    const roles = figuresOf(container).map(
      (fig) => fig.className.split('figurines__fig--')[1]
    );
    /* RTL reading order: the next figure waits on the left (`end`), the
       previous one on the right (`start`), everything else sits back. */
    expect(roles).toEqual(['center', 'end', 'back', 'start']);
  });

  /* ── the counter and the arrows ─────────────────────────────────────── */

  it('moves exactly one figurine per press and wraps at the end', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { container } = render(<Figurines data={base} />);
    const next = () => navButtons(container)[1];

    for (let step = 1; step <= 4; step += 1) {
      fireEvent.click(next());
      expect(countOf(container)).toBe(`${pad((step % 4) + 1)} / ${pad(4)}`);
      unlock();
    }
    /* four presses on four figures lands back on the first */
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(4)}`);
    expect(container.querySelector('.figurines__title')?.textContent).toBe('one');
  });

  it('refuses a second press while the crossfade is still travelling', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { container } = render(<Figurines data={base} />);

    fireEvent.click(navButtons(container)[1]);
    fireEvent.click(navButtons(container)[1]);
    fireEvent.click(navButtons(container)[1]);
    /* three presses inside one 650ms window are one step, not three */
    expect(countOf(container)).toBe(`${pad(2)} / ${pad(4)}`);
  });

  it('mirrors the arrow keys through the layout direction', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    document.documentElement.dir = 'rtl';
    const { container } = render(<Figurines data={base} />);

    /* in RTL "forward" is leftward, so ArrowLeft advances the row */
    fireEvent.keyDown(root(container), { key: 'ArrowLeft' });
    expect(countOf(container)).toBe(`${pad(2)} / ${pad(4)}`);
    unlock();

    fireEvent.keyDown(root(container), { key: 'ArrowRight' });
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(4)}`);
  });

  it('keeps the counter numerals left-to-right inside an Arabic page', () => {
    const { container } = render(<Figurines data={base} />);
    expect(container.querySelector('.figurines__count')?.getAttribute('dir')).toBe('ltr');
  });

  it('hides the arrows when there is only one figurine to show', () => {
    const { container } = render(
      <Figurines data={{ ...base, figurines: [figurine('solo')] }} />
    );
    expect(container.querySelector('.figurines__nav')).toBeNull();
    expect(container.querySelector('.figurines__caption')).not.toBeNull();
  });

  /* ── gesture ─────────────────────────────────────────────────────────── */

  it('turns the row on a swipe past the 48px threshold', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { container } = render(<Figurines data={base} />);
    const stage = root(container);

    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 300, clientY: 200 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 200, clientY: 200 });
    expect(countOf(container)).toBe(`${pad(2)} / ${pad(4)}`);
  });

  it('leaves a short drag alone — a tap must not turn the row', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { container } = render(<Figurines data={base} />);
    const stage = root(container);

    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 300, clientY: 200 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 280, clientY: 200 });
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(4)}`);
  });

  /* ── autoplay ────────────────────────────────────────────────────────── */

  it('advances on its own only when the merchant asked for it', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });

    const still = render(<Figurines data={base} />);
    act(() => void vi.advanceTimersByTime(30_000));
    expect(countOf(still.container)).toBe(`${pad(1)} / ${pad(4)}`);
    still.unmount();

    const auto = render(<Figurines data={{ ...base, autoplay: true, auto_seconds: 2 }} />);
    act(() => void vi.advanceTimersByTime(2_100));
    expect(countOf(auto.container)).toBe(`${pad(2)} / ${pad(4)}`);
  });

  it('never autoplays for a visitor who asked for less motion', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    reduced = true;

    const { container } = render(<Figurines data={{ ...base, autoplay: true, auto_seconds: 2 }} />);
    act(() => void vi.advanceTimersByTime(30_000));
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(4)}`);
  });

  it('clamps the merchant cadence instead of trusting it blindly', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    /* 1s is below the 2s floor the setting documents, so 6s is used instead:
       a 1s flip would be unreadable, and the test proves the floor exists. */
    const { container } = render(
      <Figurines data={{ ...base, autoplay: true, auto_seconds: 1 }} />
    );

    act(() => void vi.advanceTimersByTime(3_000));
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(4)}`);
    act(() => void vi.advanceTimersByTime(3_500));
    expect(countOf(container)).toBe(`${pad(2)} / ${pad(4)}`);
  });

  /* ── links, cutout, cleared copy ─────────────────────────────────────── */

  it('links only the figure in focus, and only when it has a url', () => {
    const withUrl = base.figurines.map((row, i) =>
      i === 0 ? { ...row, url: '/product/one' } : row
    );
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const { container } = render(<Figurines data={{ ...base, figurines: withUrl }} />);

    expect(container.querySelectorAll('.figurines__link')).toHaveLength(1);
    expect(container.querySelector('.figurines__link')?.getAttribute('href')).toBe('/product/one');

    fireEvent.click(navButtons(container)[1]);
    /* the new figure has no url, so nothing in the row is a link any more */
    expect(container.querySelectorAll('.figurines__link')).toHaveLength(0);
  });

  it('multiply-blends the figures by default and stops on request', () => {
    const on = render(<Figurines data={base} />);
    expect(on.container.querySelectorAll('.figurines__img--cutout')).toHaveLength(4);
    on.unmount();

    const off = render(<Figurines data={{ ...base, auto_cutout: false }} />);
    expect(off.container.querySelectorAll('.figurines__img--cutout')).toHaveLength(0);
  });

  it('hides the copy the merchant cleared', () => {
    const { container } = render(
      <Figurines data={{ ...base, store_label: '', cta_text: '', cta_link: null }} />
    );
    expect(container.querySelector('.figurines__brand')).toBeNull();
    expect(container.querySelector('.figurines__cta')).toBeNull();
    /* the caption survives — the figure's own title is still set */
    expect(container.querySelector('.figurines__title')?.textContent).toBe('one');
  });

  /* ── the stage contract ──────────────────────────────────────────────── */

  it('caps the stage at six figures but counts them all', () => {
    const many = Array.from({ length: 8 }, (_, i) => figurine(`f${i}`));
    const { container } = render(<Figurines data={{ ...base, figurines: many }} />);

    expect(figuresOf(container)).toHaveLength(6);
    expect(countOf(container)).toBe(`${pad(1)} / ${pad(8)}`);
  });

  it('reports a zero fold offset when the hero is opted under the header', () => {
    /* `--fig-fit` lands on the block root — the element the stylesheet's lift
       reads — so the measured offset and the CSS can never disagree. */
    const plain = render(<Figurines data={base} />);
    /* jsdom has no layout, so the measured top clamps to the 64px floor */
    expect(root(plain.container).style.getPropertyValue('--fig-fit')).toBe('64px');
    plain.unmount();

    const under = render(<Figurines data={{ ...base, under_header: true }} />);
    expect(root(under.container).style.getPropertyValue('--fig-fit')).toBe('0px');
  });

  it('loads the focused image eagerly and the rest lazily', () => {
    const { container } = render(<Figurines data={base} />);
    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>('.figurines__img'));
    expect(imgs[0].getAttribute('loading')).toBe('eager');
    expect(imgs.slice(1).every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
  });
});
