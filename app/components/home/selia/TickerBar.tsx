import {
  readBoolean,
  readNumber,
  readRows,
  readTextOr,
  rowText,
  type BlockData,
} from '../../../lib/homeBlock';
import { SeliaSection } from './SeliaSection';

/**
 * `home.selia-ticker-bar` — one or more lines of copy that scroll across the
 * page, optionally tilted and crossing each other.
 *
 * Selia's version is a single `<marquee>`-style strip with two colours. Kept,
 * with the parts a marquee gets wrong fixed:
 *
 *  - **It is not a `<marquee>`.** The deprecated element cannot be paused, its
 *    speed is not controllable, and it is announced once per repetition by
 *    screen readers. Here the scrolling copies are `aria-hidden` and one
 *    visually-hidden copy carries the text, so the announcement is the sentence
 *    — once, for the whole stack of bars.
 *  - **It stops.** Hovering or focusing pauses it, which is the only way a
 *    reader can finish a sentence that scrolls away. `prefers-reduced-motion`
 *    (or the merchant's own «بدون حركة») turns the whole thing into a static
 *    centred line.
 *  - **It scrolls the way the page reads.** The track moves left in an LTR
 *    store and right in an RTL one, so the text travels with the eye instead of
 *    against it — and a row marked «عكسي» travels the other way.
 *  - **Speed is a function of length, not of the element.** A fixed duration
 *    makes a short line crawl and a long line fly; the duration here is derived
 *    from the estimated width of one half-track and the row's own px/second,
 *    so two rows with the same speed really do move at the same speed.
 *
 * ── Multiple bars ─────────────────────────────────────────────────────────
 * `ticker_rows` is a collection, so each bar owns its text, colour, direction,
 * speed, size and style. Two arrangement modes exist on top of that:
 *
 *  - **مائلة** — every bar rotates by the same angle. The bar is widened past
 *    the viewport and pulled back with negative inline margins, because a
 *    rotated 100%-wide bar leaves two triangular holes at the edges.
 *  - **متقاطعة** — the angle alternates (＋/−) and the merchant sets a negative
 *    gap, so the bars overlap and form an ×. Both halves of that are needed:
 *    tilting alone gives two parallel ribbons, and overlapping alone gives one
 *    thick block.
 *
 * The strip is `bleed` on purpose: an announcement bar that stops at the
 * container edge is not a bar, it is a box.
 */
const PREFIX = 'ticker';
const ITEMS = 'ticker_rows';

/** Estimated width of one character at the strip's font size, in px. Used to
 *  size the half-track and to derive the duration — an estimate is enough
 *  because the seam is invisible at any width (two identical halves). */
const CHAR_PX = 8.6;
/** A half-track narrower than this leaves a visible gap on a wide screen. */
const MIN_HALF_PX = 2600;
const SIZE_SCALE: Record<string, string> = { sm: '0.85', md: '1', lg: '1.2' };

interface Bar {
  text: string;
  href: string;
  background: string;
  color: string;
  reverse: boolean;
  speed: number;
  scale: string;
  outline: boolean;
}

export function TickerBar({ data }: { data: BlockData }) {
  const layout = readTextOr(data, 'layout', PREFIX, 'stack');
  const tilt = readNumber(data, 'tilt', PREFIX, 6);
  const gap = readNumber(data, 'gap', PREFIX, 10);
  const anim = readTextOr(data, 'anim', PREFIX, 'scroll');
  const hover = readTextOr(data, 'hover', PREFIX, 'pause');
  const fade = readBoolean(data, 'fade', PREFIX, false);
  const divider = readTextOr(data, 'divider', PREFIX, 'dot');
  const size = readNumber(data, 'size', PREFIX, 14);
  const weight = readTextOr(data, 'weight', PREFIX, '600');
  const radius = readNumber(data, 'radius', PREFIX, 0);
  const shadow = readBoolean(data, 'shadow', PREFIX, false);
  const topSpace = readBoolean(data, 'top_space', PREFIX, false);

  const bars: Bar[] = readRows(data, ITEMS, PREFIX)
    .map((row) => ({
      text: rowText(row, 'text', ITEMS).trim(),
      href: rowText(row, 'link', ITEMS).trim(),
      background: rowText(row, 'background', ITEMS, '#000000'),
      color: rowText(row, 'color', ITEMS, '#ffffff'),
      reverse: rowText(row, 'direction', ITEMS, 'page') === 'reverse',
      speed: Number(rowText(row, 'speed', ITEMS, '110')) || 110,
      scale: SIZE_SCALE[rowText(row, 'size', ITEMS, 'md')] || '1',
      outline: rowText(row, 'style', ITEMS, 'solid') === 'outline',
    }))
    .filter((bar) => bar.text.length > 0);

  if (!bars.length) return null;

  const tilted = layout !== 'stack' && tilt > 0;

  /* Two identical halves, each long enough to overflow the widest screen. The
     loop translates by exactly 50% — one half's width — so the second half is
     already standing where the first one started and the seam is invisible.
     One copy of the text per half only works when the text is longer than the
     viewport, so a short line is repeated until the half is wide enough. */
  const perHalf = (text: string) =>
    Math.max(1, Math.ceil(MIN_HALF_PX / Math.max(1, text.length * CHAR_PX)));

  /* Duration = width of one half / the row's own speed. Deriving it this way is
     what makes «سرعة ١٢٠» mean the same thing on a three-word bar and on a
     full sentence. */
  const duration = (bar: Bar) => {
    const halfWidth = bar.text.length * perHalf(bar.text) * CHAR_PX;
    return Math.max(6, Math.round(halfWidth / Math.max(20, bar.speed)));
  };

  const track = (bar: Bar) => {
    const half = (halfIndex: number) => (
      <span className="selia-ticker__half" key={halfIndex}>
        {Array.from({ length: perHalf(bar.text) }).map((_, index) => (
          <span className="selia-ticker__chunk" key={index}>
            <span className="selia-ticker__text">{bar.text}</span>
            {divider !== 'none' && <span className="selia-ticker__sep" aria-hidden="true" />}
          </span>
        ))}
      </span>
    );
    return (
      <span className="selia-ticker__track" aria-hidden="true">
        {half(0)}
        {half(1)}
      </span>
    );
  };

  return (
    <SeliaSection
      variant="ticker"
      bleed
      className={topSpace ? 'selia-ticker--spaced' : undefined}
    >
      <div
        className="selia-ticker"
        data-layout={layout}
        data-tilted={tilted ? '1' : '0'}
        data-anim={anim}
        data-hover={hover}
        data-fade={fade ? '1' : '0'}
        data-divider={divider}
        data-shadow={shadow ? '1' : '0'}
        style={
          {
            '--ticker-gap': `${gap}px`,
            /* the angle twice: once as a rotation, once as a bare number the
               stylesheet can multiply into the vertical padding a tilted bar
               needs (see selia-ticker.scss) */
            '--ticker-tilt-n': String(tilt),
            '--ticker-fs': `${size}px`,
            '--ticker-weight': weight,
            '--ticker-radius': `${radius}px`,
          } as React.CSSProperties
        }
      >
        <div className="selia-ticker__stage">
          {bars.map((bar, index) => {
            /* In «متقاطعة» the angle alternates per row; in «مائلة» every row
               takes the same one; in «متوازية» there is no rotation at all. */
            const angle =
              layout === 'cross' ? (index % 2 === 0 ? tilt : -tilt) : layout === 'tilt' ? tilt : 0;
            const inner = track(bar);
            const external = !!bar.href && /^https?:\/\//i.test(bar.href);

            return (
              <div
                className="selia-ticker__bar"
                key={index}
                data-dir={bar.reverse ? 'reverse' : 'page'}
                data-style={bar.outline ? 'outline' : 'solid'}
                style={
                  {
                    '--row-bg': bar.background,
                    '--row-ink': bar.color,
                    '--row-tilt': `${angle}deg`,
                    '--row-duration': `${duration(bar)}s`,
                    '--row-scale': bar.scale,
                  } as React.CSSProperties
                }
              >
                {bar.href ? (
                  <a
                    className="selia-ticker__link"
                    href={bar.href}
                    {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                  >
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>

        {/* One announcement for the whole stack: a reader hears the sentences
            in order, once, instead of each copy of each bar. Each bar is its
            own element rather than one joined string — an announcement bar is
            exactly the kind of copy that already contains an em dash, and a
            joined string cannot be split back into sentences. */}
        <span className="sr-only">
          {bars.map((bar, index) => (
            <span key={index}>
              {index > 0 ? '، ' : ''}
              {bar.text}
            </span>
          ))}
        </span>
      </div>
    </SeliaSection>
  );
}
