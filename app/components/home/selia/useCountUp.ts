import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../lib/homeBlock';

/**
 * Counts a number up when it scrolls into view — used by Statistics and Offers
 * Counter, the two blocks whose whole point is a number that moves.
 *
 * Three decisions worth keeping:
 *
 *  - **The merchant's text is never re-formatted.** They typed `1.2K`, `+٥٠٠`
 *    or `٩٩٪`; the digits are found inside that string and the surrounding
 *    characters are left exactly where they were. Rebuilding the string from a
 *    number would turn `1.2K` into `1200` and an Arabic-Indic `٥٠٠` into `500`,
 *    which is not the same figure to the reader.
 *  - **A string with no number is returned untouched** and never animates, so a
 *    label like "مجانًا" cannot flash `0` before settling.
 *  - **The final frame is the merchant's own text**, not the animation's last
 *    rounding — a count that stops at `99` because of a rounding step is worse
 *    than no animation at all.
 *
 * **SSR:** the first render — server AND client — is the final figure. Starting
 * from `''` would ship a row of empty numbers in the server HTML, which is what
 * a crawler, a link preview or a visitor with JavaScript off actually sees. It
 * is also a hydration trap: any server/client difference in the initial state
 * makes React discard the section. The animation therefore begins only after
 * mount, and only once the number is on screen; until then the real value is
 * what is on the page.
 *
 * Reduced motion leaves the final value in place with no animation at all: a
 * visitor who asked the system to stop moving things did not ask for a
 * spinning counter.
 */
export function useCountUp(text: string, enabled: boolean, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = text ?? '';
  const [display, setDisplay] = useState(final);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || prefersReducedMotion()) {
      // Also keeps the label in sync if the merchant edits the figure while
      // the block is mounted.
      setDisplay(final);
      return;
    }

    const match = final.match(/-?\d[\d.,]*/);
    if (!match) {
      setDisplay(final);
      return;
    }

    const raw = match[0];
    const target = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(target)) {
      setDisplay(final);
      return;
    }

    // `1,200` keeps its thousands separator while it counts; `1.2` keeps one
    // decimal place. The separator is read off the merchant's own text rather
    // than assumed from the locale, because they may have typed either.
    const separator = raw.includes(',') ? ',' : '';
    const decimals = raw.includes('.') ? (raw.split('.')[1] || '').length : 0;
    const format = (value: number) => {
      const fixed = value.toFixed(decimals);
      return separator
        ? fixed.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
        : fixed;
    };

    const start = final.slice(0, match.index ?? 0);
    const end = final.slice((match.index ?? 0) + raw.length);

    let frame = 0;
    let startedAt = 0;
    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      // easeOutCubic: fast off the line, settles gently on the real figure
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(progress >= 1 ? final : `${start}${format(target * eased)}${end}`);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    /** The only place the real figure is replaced. Deferring it until the
     * number is visible means the SSR value is not thrown away for blocks that
     * are still far below the fold. */
    const startAnimation = () => {
      setDisplay(`${start}${format(0)}${end}`);
      frame = window.requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      startAnimation();
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          startAnimation();
        });
      },
      { threshold: 0.35 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [final, enabled, duration]);

  return { ref, display };
}
