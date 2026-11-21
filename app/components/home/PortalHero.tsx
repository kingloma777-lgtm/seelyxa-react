import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { imgSrc, pickerValue, scalar } from '../../lib/curtainSlots';
import {
  clamp,
  prefersReducedMotion,
  readNumber,
  readRows,
  readTextOr,
  readValue,
  rowText,
  useScrollProgress,
} from '../../lib/homeBlock';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';

/**
 * `portal-hero` home block — walk through a portal, land in a world, read the
 * reviews. A port of the reference's "Auragate" hero.
 *
 * The reference is one page: a fixed world image, a fixed nav, a 160vh intro
 * that zooms a portal photo from 1× to 7.5× while the copy fades, then a
 * testimonials section and a footer on the same world. Two thirds of that is
 * the reference's own chrome — the nav and the footer belong to the theme — so
 * this port keeps the two acts and drops the furniture:
 *
 *   1. **The walk-through.** A sticky stage over a 100svh + run budget. One
 *      scroll number, eased, scales the portal (1 → 7.5) about its doorway and
 *      the world behind it (1 → 1.18); the copy leaves in the first 22%, the
 *      portal dissolves between 66% and 88% into the world it was covering.
 *   2. **The reviews.** A centred heading and an arc of cards — the active one
 *      upright and lit, its neighbours dropped, tilted and dimmed, wrapping
 *      around so the row never ends.
 *
 * Deviations from the reference, all deliberate:
 *
 *  - **Nothing is `position: fixed`.** The world is `sticky` inside the block
 *    with a negative block-end margin, so it covers the block and only the
 *    block. A fixed layer would keep painting over the theme's header and
 *    footer on every store page that uses this hero.
 *  - **The carousel geometry is CSS.** The reference switches seven numbers on
 *    `useIsMobile`; here every one of them is a custom property that a media
 *    query rewrites, and the component writes only `--pos` / `--abs` per card.
 *    One source of truth, and a resize never re-renders the row.
 *  - **RTL is geometry, not a flip.** `--ph-dir` (1 or -1) multiplies the
 *    horizontal step and the tilt, so the fan mirrors with the page while the
 *    quotes stay readable. Read from `getComputedStyle`, not `:dir()` — the
 *    production CSS minifier rewrites that into a language selector.
 *  - **The pointer parallax stops when it settles.** The reference runs an
 *    unbounded rAF loop from mount; this one runs only while the block is on
 *    screen and the smoothed offset is still catching up.
 *  - **Reduced motion gets the still, not a frozen scrub.** The run collapses
 *    to nothing, the portal stays at 1×, and the copy never fades — the block
 *    becomes a hero plus a row of reviews, which is the composition minus the
 *    motion.
 */

const PREFIX = 'portal_hero';

/** The run is the extra travel after the first viewport, per pacing tier. The
 * reference spends 60vh on the zoom; the tiers bracket that. */
const PACE_RUN = { short: 40, medium: 80, long: 140 } as const;
export type PortalHeroPace = keyof typeof PACE_RUN;

export const portalHeroPace = (data: unknown): PortalHeroPace => {
  const key = scalar(readValue((data ?? {}) as Record<string, unknown>, 'pace', PREFIX));
  return key === 'short' || key === 'long' ? key : 'medium';
};

/** The reserved height in the router is a static string, so the run length
 * arrives through a class — one per tier, and both sides call this. */
export const portalHeroRunClass = (data: unknown): string =>
  `portal-hero-run--${portalHeroPace(data)}`;

/** The reference's ease for the zoom: slow at both ends, fast through the
 * doorway. Linear scaling reads as a cheap dolly. */
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

/** Text colour for the lit card, derived instead of asked for: a merchant who
 * picks a dark card surface should not also have to remember to change the
 * ink, and a second colour field is a second way to get it wrong. */
function inkFor(hex: string): string {
  const value = parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) return '#2c2420';
  const channel = (shift: number) => {
    const raw = ((value >> shift) & 255) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
  return luminance > 0.42 ? '#2c2420' : '#f7fbff';
}

interface Quote {
  text: string;
  author: string;
}

interface PortalHeroProps {
  data: Record<string, unknown>;
}

export function PortalHero({ data }: PortalHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const pastRef = useRef(false);
  const dirRef = useRef(1);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [active, setActive] = useState(() => 0);
  const { t } = useTranslation();

  /* Prefixed field id first — the editor's key wins over any seed alias, so a
     replaced image actually replaces it. Images go through `imgSrc`, never
     `readText`: a picker value is an object, and text-flattening it yields
     `[object Object]` as a src. */
  const world = imgSrcOf(data, 'world_image');
  const portal = imgSrcOf(data, 'portal_image') || world;

  const eyebrow = readTextOr(data, 'eyebrow', PREFIX);
  const title = readTextOr(data, 'title', PREFIX);
  const body = readTextOr(data, 'body', PREFIX);
  const ctaLabel = readTextOr(data, 'cta_label', PREFIX);
  const ctaUrl = pickerValue(readValue(data, 'cta_link', PREFIX))[0] ?? '';
  const signature = readTextOr(data, 'signature', PREFIX);
  const caption = readTextOr(data, 'caption', PREFIX);
  const reviewsTitle = readTextOr(data, 'reviews_title', PREFIX);
  const reviewsBody = readTextOr(data, 'reviews_body', PREFIX);

  const text = readTextOr(data, 'text_color', PREFIX, '#ffffff');
  const accent = readTextOr(data, 'accent_color', PREFIX, '#d9d9d9');
  const card = readTextOr(data, 'card_color', PREFIX, '#f7fbff');
  /* 50, not 45: `twilight.json` declares `value: 50` for this field, so a
     fallback of 45 made a fresh install (50) and a missing setting (45)
     disagree — the kind of drift nobody sees until a merchant resets. */
  const scrim = clamp(readNumber(data, 'scrim', PREFIX, 50) / 100);
  const pace = portalHeroPace(data);

  const quotes = useMemo<Quote[]>(
    () =>
      readRows(data, 'quotes', PREFIX)
        .map((row) => ({
          text: rowText(row, 'text', `${PREFIX}_quotes`),
          author: rowText(row, 'author', `${PREFIX}_quotes`),
        }))
        .filter((quote) => quote.text),
    [data]
  );

  const count = quotes.length;
  const half = Math.floor(count / 2);
  const activeIdx = count ? Math.min(Math.max(active, 0), count - 1) : 0;

  /* The headline carries its own line breaks — the reference's three lines are
     the composition, and a merchant editing the text should keep them. */
  const titleLines = useMemo(() => splitLines(title), [title]);
  const reviewLines = useMemo(() => splitLines(reviewsTitle), [reviewsTitle]);

  const navigate = (step: number) => {
    if (count < 2) return;
    setActive((prev) => (((prev + step) % count) + count) % count);
  };

  /* One scroll number. The hook measures the intro's own travel (100svh + run
     − viewport), which is why the reviews below can be any height without
     dragging the zoom along with them. */
  useScrollProgress(introRef, (progress) => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty('--ph-p', progress.toFixed(4));
    root.style.setProperty('--ph-eased', easeInOut(progress).toFixed(4));

    /* The copy is only clickable while it is visible. A class instead of a
       conditional `pointer-events` because CSS cannot read a number as a
       boolean — and an invisible CTA that still swallows clicks is worse than
       no CTA. */
    if (root.classList.contains('is-flat')) return;
    const past = progress > 0.23;
    if (past === pastRef.current) return;
    pastRef.current = past;
    root.classList.toggle('is-past-intro', past);
  });

  /* Direction, once. Read from the resolved style rather than `:dir()` — see
     the header note. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const dir = getComputedStyle(root).direction === 'rtl' ? -1 : 1;
    dirRef.current = dir;
    root.style.setProperty('--ph-dir', String(dir));
    root.dataset.flow = dir === -1 ? 'rtl' : 'ltr';
    if (prefersReducedMotion()) {
      root.classList.add('is-flat');
      root.style.setProperty('--ph-p', '0');
      root.style.setProperty('--ph-eased', '0');
    }
  }, []);

  /* Pointer parallax: ±6px on the world, ±7px on the portal, both scaled by
     the zoom (the reference composes `scale() translate()`, so the portal's
     parallax grows with it). The loop is bounded: it runs while the block is
     on screen and the smoothed value is still catching up, then stops. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    if (window.matchMedia?.('(hover: none)').matches) return;

    const raw = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let frame = 0;
    let visible = false;

    const write = () => {
      root.style.setProperty('--ph-mx', smooth.x.toFixed(4));
      root.style.setProperty('--ph-my', smooth.y.toFixed(4));
    };

    const tick = () => {
      frame = 0;
      smooth.x += (raw.x - smooth.x) * 0.07;
      smooth.y += (raw.y - smooth.y) * 0.07;
      write();
      if (Math.abs(raw.x - smooth.x) < 0.001 && Math.abs(raw.y - smooth.y) < 0.001) {
        smooth.x = raw.x;
        smooth.y = raw.y;
        write();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame && visible) frame = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!visible) return;
      raw.x = (event.clientX / window.innerWidth - 0.5) * 2;
      raw.y = (event.clientY / window.innerHeight - 0.5) * 2;
      start();
    };

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
          });
    observer?.observe(root);
    if (!observer) visible = true;

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    navigate((event.key === 'ArrowRight' ? 1 : -1) * dirRef.current);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    /* mouse users have the arrows, and a drag would fight text selection */
    if (event.pointerType === 'mouse') return;
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    /* dragging towards the inline-end pulls the previous card in — mirrored
       with the page, so the gesture reads the same in both directions */
    navigate(dx > 0 ? -dirRef.current : dirRef.current);
  };

  if (!portal && !title && !count) return null;

  return (
    <div
      ref={rootRef}
      className="portal-hero"
      data-pace={pace}
      data-count={count}
      data-active={activeIdx}
      style={
        {
          '--ph-text': text,
          '--ph-accent': accent,
          '--ph-card': card,
          '--ph-card-ink': inkFor(card),
          '--ph-scrim': scrim,
        } as CSSProperties
      }
    >
      {/* The display faces come from `app.scss`'s single Google Fonts request.
          This block used to add its own `<link>` for a family that request
          already carried — a second stylesheet request for the same CSS, and a
          second preconnect pair, on every page that mounted the block. */}

      {/* The world. Sticky, not fixed: it covers this block and nothing else,
          and the negative margin keeps it from adding a viewport of height. */}
      <div className="portal-hero__world" aria-hidden="true">
        <div className="portal-hero__world-inner">
          {world ? <img src={world} alt="" loading="eager" decoding="async" /> : null}
        </div>
      </div>

      <div className="portal-hero__intro" ref={introRef}>
        <div className="portal-hero__stage">
          <div className="portal-hero__portal" aria-hidden="true">
            {portal ? <img src={portal} alt="" loading="eager" decoding="async" /> : null}
          </div>
          <div className="portal-hero__veil" aria-hidden="true" />

          <div className="portal-hero__copy">
            <div className="portal-hero__lede">
              {titleLines.length ? (
                /* h2, not h1: this is a HOME block, and the home page's one h1
                   is the store name (MorphHeader's sr-only brand heading).
                   A second h1 here would break the one-h1-per-page rule for
                   every merchant who adds the block. The styling is on the
                   class, so the tag change is invisible. */
                <h2 className="portal-hero__title" dir="auto">
                  {titleLines.map((line, index) => (
                    <span className="portal-hero__line" key={`${line}-${index}`}>
                      {index === 0 && eyebrow ? (
                        <>
                          <span className="portal-hero__eyebrow" dir="auto">
                            {eyebrow}
                          </span>{' '}
                        </>
                      ) : null}
                      {line}
                    </span>
                  ))}
                </h2>
              ) : null}

              {body ? (
                <p className="portal-hero__body" dir="auto">
                  {body}
                </p>
              ) : null}

              {ctaLabel ? (
                <Link className="portal-hero__cta" to={ctaUrl || '/'}>
                  {ctaLabel}
                  <span className="portal-hero__cta-arrow" aria-hidden="true">
                    <ArrowRightIcon />
                  </span>
                </Link>
              ) : null}
            </div>

            {signature || caption ? (
              <div className="portal-hero__sign">
                {signature ? (
                  <span className="portal-hero__sign-mark" dir="auto">
                    {signature}
                  </span>
                ) : null}
                {caption ? (
                  <p className="portal-hero__sign-text" dir="auto">
                    {caption}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="portal-hero__reviews">
        {reviewLines.length || reviewsBody ? (
          <header className="portal-hero__reviews-head">
            {reviewLines.length ? (
              <h2 className="portal-hero__reviews-title" dir="auto">
                {reviewLines.map((line, index) => (
                  <span className="portal-hero__line" key={`${line}-${index}`}>
                    {line}
                  </span>
                ))}
              </h2>
            ) : null}
            {reviewsBody ? (
              <p className="portal-hero__reviews-body" dir="auto">
                {reviewsBody}
              </p>
            ) : null}
          </header>
        ) : null}

        {count ? (
          <div className="portal-hero__arc">
            <div
              className="portal-hero__cards"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (dragRef.current = null)}
            >
              {quotes.map((quote, index) => {
                let pos = index - activeIdx;
                if (pos > half) pos -= count;
                if (pos < -half) pos += count;
                const isCenter = pos === 0;

                return (
                  <div
                    key={`${quote.text.slice(0, 12)}-${index}`}
                    className={`portal-hero__card${isCenter ? ' is-center' : ''}`}
                    style={{ '--pos': pos, '--abs': Math.abs(pos) } as CSSProperties}
                    aria-hidden={!isCenter}
                  >
                    <p className="portal-hero__quote" dir="auto">
                      {quote.text}
                    </p>
                    {quote.author ? (
                      <span className="portal-hero__author" dir="auto">
                        {quote.author}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {count > 1 ? (
              <div
                className="portal-hero__nav"
                role="group"
                aria-label={t('blocks.home.reviews_nav', 'Reviews')}
                onKeyDown={onKeyDown}
              >
                <button
                  type="button"
                  className="portal-hero__arrow"
                  aria-label={t('blocks.home.reviews_prev', 'Previous')}
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeftIcon />
                </button>
                <button
                  type="button"
                  className="portal-hero__arrow portal-hero__arrow--next"
                  aria-label={t('blocks.home.reviews_next', 'Next')}
                  onClick={() => navigate(1)}
                >
                  <ArrowRightIcon />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function imgSrcOf(data: Record<string, unknown>, key: string): string {
  const value = readValue(data, key, PREFIX);
  const url = imgSrc(value);
  return url || '';
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
