import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';
import { useDragScroll } from '../../hooks/useDragScroll';

export interface ScrollCarouselProps {
  children: ReactNode;
  /** Extra class on the scroll track. */
  className?: string;
  prevLabel: string;
  nextLabel: string;
}

/**
 * Horizontal scroller with a progress bar and prev/next arrows — the shared
 * mechanism behind the testimonials and products carousels. Mouse drag, native
 * touch momentum, RTL-aware progress.
 */
export function ScrollCarousel({
  children,
  className = '',
  prevLabel,
  nextLabel,
}: ScrollCarouselProps) {
  /* The row's direction owns both the glyph and the sign of the travel. An
     Arabic store starts its first card on the RIGHT, so "forward" is a
     NEGATIVE `scrollLeft`; an English one starts on the left and "forward" is
     positive. Hardcoding either — which is what this did — leaves the English
     store with arrows that point the wrong way AND move the wrong way. */
  const { isRTL } = useTranslation();
  const track = useRef<HTMLDivElement>(null);
  const drag = useDragScroll(track);
  const [pos, setPos] = useState(0);
  const [thumb, setThumb] = useState(1);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setThumb(el.scrollWidth ? el.clientWidth / el.scrollWidth : 1);
    setPos(max > 0 ? Math.min(1, Math.abs(el.scrollLeft) / max) : 0);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    // Measured after layout (and on every resize), so mounting doesn't force a synchronous reflow.
    if (typeof ResizeObserver === 'undefined') {
      sync();
      return;
    }
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync, children]);

  /** One step, expressed as travel toward the END of the row (`forward` = +1)
   * or the START (-1); the layout direction turns that into a scroll delta. */
  const step = (forward: number) => {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const amount = (first?.offsetWidth || el.clientWidth * 0.8) + 24;
    el.scrollBy({ left: (isRTL ? -1 : 1) * forward * amount, behavior: 'smooth' });
  };

  const thumbWidth = Math.max(8, thumb * 100);

  return (
    <div className="scroll-carousel">
      <div
        ref={track}
        className={`scroll-carousel__track hide-scroll ${className}`.trim()}
        onScroll={sync}
        {...drag}
      >
        {children}
      </div>

      <div className="scroll-carousel__controls">
        <div className="scroll-carousel__progress" aria-hidden="true">
          <span
            className="scroll-carousel__progress-thumb"
            style={{
              width: `${thumbWidth}%`,
              insetInlineStart: `${pos * (100 - thumbWidth)}%`,
            }}
          />
        </div>

        <div className="scroll-carousel__nav">
          <button type="button" aria-label={prevLabel} onClick={() => step(-1)}>
            {isRTL ? <ArrowRightIcon aria-hidden="true" /> : <ArrowLeftIcon aria-hidden="true" />}
          </button>
          <button type="button" aria-label={nextLabel} onClick={() => step(1)}>
            {isRTL ? <ArrowLeftIcon aria-hidden="true" /> : <ArrowRightIcon aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}
