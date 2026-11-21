import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ScrollCarousel } from '../../../app/components/common/ScrollCarousel';

/* The row is shared by the products slider, the photos slider and the product
   page's "similar products" — so a wrong arrow is wrong in three places at
   once. What matters is not the markup but the SIGN of the travel: on an
   Arabic store the first card sits on the right, so "forward" is a negative
   `scrollLeft`; on an English one it is positive. Both must be right, because
   the theme ships both. */

let rtl = false;

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    get isRTL() {
      return rtl;
    },
  }),
}));

const scrollBy = vi.fn();

beforeEach(() => {
  rtl = false;
  scrollBy.mockReset();
  /* jsdom has no scrolling model; the spy is the only way to observe what the
     component asks the browser to do. */
  Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
    configurable: true,
    writable: true,
    value: scrollBy,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const cards = ['a', 'b', 'c', 'd'].map((name) => <div key={name}>{name}</div>);

const renderRow = () =>
  render(
    <ScrollCarousel prevLabel="Previous" nextLabel="Next">
      {cards}
    </ScrollCarousel>
  );

const buttons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.scroll-carousel__nav button'));

describe('ScrollCarousel', () => {
  it('renders its cards and names both arrows', () => {
    const { container } = renderRow();
    expect(container.querySelectorAll('.scroll-carousel__track > div')).toHaveLength(4);

    const [prev, next] = buttons(container);
    expect(prev.getAttribute('aria-label')).toBe('Previous');
    expect(next.getAttribute('aria-label')).toBe('Next');
  });

  /* ── the direction contract ──────────────────────────────────────────── */

  it('walks a left-to-right row in the direction each arrow promises', () => {
    const { container } = renderRow();
    const [prev, next] = buttons(container);

    /* jsdom reports a zero-size track, so the step falls back to 0.8 × 0 plus
       the 24px gap — a fixed 24px, which makes the assertion exact. */
    fireEvent.click(next);
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 24, behavior: 'smooth' });

    fireEvent.click(prev);
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -24, behavior: 'smooth' });
  });

  it('turns both the travel and the glyph around on an Arabic store', () => {
    rtl = true;
    const { container } = renderRow();
    const [prev, next] = buttons(container);

    /* RTL: the row starts on the right, so forward is negative */
    fireEvent.click(next);
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -24, behavior: 'smooth' });

    fireEvent.click(prev);
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 24, behavior: 'smooth' });
  });

  it('points the arrows the way the layout reads', () => {
    const ltr = renderRow();
    const [ltrPrev, ltrNext] = buttons(ltr.container);
    expect(ltrPrev.querySelector('svg')?.getAttribute('class') ?? '').not.toContain('rotate');
    /* the two glyphs must differ — an identical pair means one is wrong */
    expect(ltrPrev.innerHTML).not.toBe(ltrNext.innerHTML);
    ltr.unmount();

    rtl = true;
    const rtlRow = renderRow();
    const [rtlPrev, rtlNext] = buttons(rtlRow.container);
    expect(rtlPrev.innerHTML).not.toBe(rtlNext.innerHTML);
    /* and the pair is mirrored relative to the LTR pair */
    expect(rtlPrev.innerHTML).toBe(ltrNext.innerHTML);
    expect(rtlNext.innerHTML).toBe(ltrPrev.innerHTML);
  });

  /* ── the progress bar ────────────────────────────────────────────────── */

  it('starts with a full-width thumb when nothing overflows', () => {
    const { container } = renderRow();
    const thumbEl = container.querySelector<HTMLElement>('.scroll-carousel__progress-thumb')!;
    expect(thumbEl.style.width).toBe('100%');
    expect(thumbEl.style.insetInlineStart).toBe('0%');
  });

  it('keeps the progress bar out of the accessibility tree', () => {
    const { container } = renderRow();
    expect(container.querySelector('.scroll-carousel__progress')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    buttons(container).forEach((button) => {
      /* the glyph is decorative — the button already carries the name */
      expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});
