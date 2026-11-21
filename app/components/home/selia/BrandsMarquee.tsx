import type { CSSProperties } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/**
 * `selia-animated-brands` — a wall of brand logos walking past the container
 * edge, one or two rows, alternating direction.
 *
 * The reference (a Builder.io section) is the whole design and it is small:
 *
 *  - every logo sits on a **light grey square tile** with a 10% inset, so ten
 *    differently-shaped logos read as one row of equal objects instead of a
 *    ragged line of different-sized marks;
 *  - the logos are **grayscale at rest and coloured on hover** — the wall is
 *    quiet until you point at one;
 *  - the row is **masked at both edges** (opaque between 20% and 80%), so a
 *    logo emerges from the page rather than being cut by a hard border;
 *  - two rows run **opposite ways**, which is what makes the block feel alive
 *    without any single logo moving fast.
 *
 * Kept from the reference: 100px tile, 10% padding, 27px gap, ~38px/s, the
 * 20/80 mask, the second row reversed.
 *
 * Fixed from the reference:
 *
 *  - **The loop cannot open a hole.** The reference duplicates the list twice
 *    and translates by 50%; with ten brands that is ~1270px per copy, which is
 *    *narrower* than a 1440px container — so the seam shows an empty gap once
 *    per cycle. Here each half repeats the list until it overflows the widest
 *    container, which is the only version of the trick that survives a short
 *    collection.
 *  - **The duplicate halves are `aria-hidden` and `tabindex="-1"`**, so a
 *    screen reader hears ten brands and not thirty, and Tab does not walk the
 *    same link three times. The second row is decorative repetition of the
 *    first, so it is hidden from the accessibility tree as a whole.
 *  - **It stops.** Hover or keyboard focus pauses the row — a logo wall that
 *    cannot be read at rest is a wall of moving images.
 *  - **`prefers-reduced-motion` gets a composed still**: one wrapped grid of
 *    tiles, no mask, no belt.
 *
 * The tiles are `direction: ltr` on purpose: a logo has no reading direction,
 * and physical translate on a flex track is the only arrangement that behaves
 * identically in Arabic and English stores (the RTL flex anchor is what makes
 * a `max-content` track scroll backwards in a marquee — see the ticker).
 */

/** Smallest tile the stylesheet can produce (`--bw-tile` floor) plus its
 *  smallest gap. Deliberately an UNDER-estimate: if the real tiles are bigger
 *  the half is wider than predicted, which is harmless, whereas an over-
 *  estimate leaves a gap at the seam on a wide screen. */
const UNIT_PX = 84 + 14;
/** One half must out-run the widest container (1440 + page padding). */
const MIN_HALF_PX = 2400;
/** px per second — the reference's 60s for ~2310px of track. */
const SPEED = 40;

export interface BrandLogo {
  image: string;
  href: string;
  title: string;
}

interface TileProps {
  item: BrandLogo;
  /** Accessible name. A logo has no text, so without this the tile is either
   *  an unnamed link or an image nobody can identify. */
  label: string;
  /** A copy the visitor cannot perceive: out of the tab order and unnamed. */
  echo: boolean;
  eager: boolean;
}

function Tile({ item, label, echo, eager }: TileProps) {
  const body = (
    <img
      className="selia-bw__img"
      src={item.image}
      alt={echo ? '' : label}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
  const className = 'selia-bw__tile';

  if (!item.href) {
    return (
      <span
        className={className}
        role={echo ? undefined : 'img'}
        aria-label={echo ? undefined : label}
        aria-hidden={echo ? true : undefined}
        title={echo ? undefined : label}
      >
        {body}
      </span>
    );
  }

  return (
    <a
      className={className}
      href={item.href}
      title={echo ? undefined : label}
      aria-label={echo ? undefined : label}
      aria-hidden={echo ? true : undefined}
      tabIndex={echo ? -1 : undefined}
      {...(/^https?:\/\//i.test(item.href) ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {body}
    </a>
  );
}

export function BrandsMarquee({
  items,
  twoRows,
}: {
  items: BrandLogo[];
  twoRows: boolean;
}) {
  const { isLTR, t } = useTranslation();
  /* A logo carries its own name as artwork, so a row without one is not
     nameless — it is named «ماركة». Better than an unnamed link. */
  const unnamed = t('blocks.brands.tile', 'ماركة');

  /* A row with no picture is not a brand — it is a blank tile that reads as a
     broken image. Rows that arrive half-filled are dropped rather than
     rendered empty. */
  const logos = items.filter((item) => item.image);
  if (!logos.length) return null;

  const copies = Math.max(1, Math.ceil(MIN_HALF_PX / (logos.length * UNIT_PX)));
  const halfWidth = logos.length * copies * UNIT_PX;
  const duration = Math.max(18, Math.round(halfWidth / SPEED));

  /* The second row starts half a list further along, so the two rows never sit
     in vertical columns — that alignment is what makes a two-row wall look
     like a table instead of a belt. */
  const offset = Math.ceil(logos.length / 2);
  const rotated = [...logos.slice(offset), ...logos.slice(0, offset)];
  const rows = twoRows ? [logos, rotated] : [logos];

  const half = (row: BrandLogo[], rowIndex: number, halfIndex: number) => (
    <ul className="selia-bw__half" key={halfIndex} aria-hidden={halfIndex === 1 ? true : undefined}>
      {Array.from({ length: copies }).flatMap((_, copy) =>
        row.map((item, index) => {
          /* Only the first copy of the first half is the real one. */
          const echo = halfIndex === 1 || copy > 0 || rowIndex > 0;
          return (
            <li className="selia-bw__item" key={`${copy}-${index}`} data-echo={echo ? '1' : undefined}>
              <Tile
                item={item}
                label={item.title || unnamed}
                echo={echo}
                eager={rowIndex === 0 && copy === 0 && index < 4}
              />
            </li>
          );
        })
      )}
    </ul>
  );

  return (
    <div className="selia-bw" data-rows={rows.length} dir={isLTR ? 'ltr' : 'rtl'}>
      {rows.map((row, rowIndex) => (
        <div
          className="selia-bw__row"
          key={rowIndex}
          data-row={rowIndex + 1}
          /* The second row is the same wall walking the other way — nothing
             here is new information, so it is hidden from the a11y tree. */
          aria-hidden={rowIndex > 0 ? true : undefined}
        >
          <div
            className="selia-bw__track"
            data-dir={rowIndex > 0 ? 'back' : 'fwd'}
            style={
              {
                '--bw-duration': `${duration}s`,
                /* Start the return row mid-cycle so both rows are always
                   moving in opposite phases, not mirrored in step. */
                ...(rowIndex > 0 ? { animationDelay: `-${Math.round(duration * 0.37)}s` } : {}),
              } as CSSProperties
            }
          >
            {half(row, rowIndex, 0)}
            {half(row, rowIndex, 1)}
          </div>
        </div>
      ))}
    </div>
  );
}
