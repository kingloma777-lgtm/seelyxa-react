import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { pickerValue, scalar } from '../../lib/curtainSlots';
import {
  prefersReducedMotion,
  readBoolean,
  readNumber,
  readRows,
  readTextOr,
  readValue,
  rowImage,
  rowText,
  rowValue,
} from '../../lib/homeBlock';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';

/**
 * `arc-coverflow` home block — an endless cosine-arc coverflow. A port of the
 * reference's "ArcCoverflow" slider.
 *
 * Cards ride an arc: the one nearest the centre is the largest and lifted, its
 * neighbours shrink and sink as they move out, and the row wraps modulo the
 * track so it loops forever in both directions. One lerp per frame chases the
 * scroll target; the only thing React re-renders is the caption, and only when
 * a different card takes the centre.
 *
 * Deviations from the reference, all deliberate:
 *
 *  - **The wheel no longer hijacks the page.** The reference calls
 *    `preventDefault()` on `wheel` inside a `100svh` section, so a visitor
 *    scrolling down over it can never get past it — fine for a one-page demo,
 *    a scroll trap on a store. Here only a *horizontal* wheel (a trackpad
 *    two-finger swipe) turns the collection; a vertical wheel is left alone and
 *    the page scrolls. Drag, the arrow buttons and the keyboard cover the rest.
 *  - **`touch-action: pan-y`, not `none`.** Same reason on a phone: a vertical
 *    swipe scrolls the page, a horizontal one turns the cards.
 *  - **The arc is measured against the block, not the window.** The reference
 *    reads `window.innerWidth / innerHeight` per frame; a block on a page has
 *    its own box, and its own height is a merchant setting.
 *  - **No GSAP.** The reference writes `x / y / width / height` inline every
 *    frame, which is four layout-affecting properties per card. Here the card
 *    keeps its layout size and the frame writes three custom properties
 *    (`--x`, `--y`, `--s`) that a CSS transform consumes — composited, no
 *    layout, no library.
 *  - **The frame loop stops.** It runs only while the offset is still catching
 *    up, only while the block is on screen, and never under reduced motion
 *    (where the lerp is instant, so a single frame is the whole animation).
 *  - **Spacing adapts to the count.** The reference is tuned for nine slides;
 *    at four the cards pile up into one stack. The gap grows as slides are
 *    removed so the fan keeps its shape instead of collapsing.
 */

const PREFIX = 'arc';
const SLIDES = 'arc_slides';

/** Section height as a share of the viewport. Three tiers rather than a slider
 * because the router reserves the block's height with a static string that
 * reads `--ac-height`; a class per tier keeps the two sides in agreement. */
const HEIGHTS = { compact: 60, medium: 78, tall: 95 } as const;
export type ArcCoverflowHeight = keyof typeof HEIGHTS;

export const arcCoverflowHeight = (data: unknown): ArcCoverflowHeight => {
  const key = scalar(readValue((data ?? {}) as Record<string, unknown>, 'height', PREFIX));
  return key === 'compact' || key === 'tall' ? key : 'medium';
};

export const arcCoverflowHeightClass = (data: unknown): string =>
  `arc-coverflow-h--${arcCoverflowHeight(data)}`;

/** The reference's ratios, kept as one block so the composition cannot drift:
 * card 3:4, one card's width between centres, centre line at 40% of the box. */
const CARD_RATIO = 1.375;
const GAP_RATIO = 0.5;
/** The reference is composed for nine slides; below that the gap opens up so
 * the fan spans the same width instead of collapsing into a stack. */
const REFERENCE_COUNT = 9;
const BASELINE = 0.4;

interface Slide {
  src: string;
  title: string;
  note: string;
  url: string;
}

export interface ArcCoverflowProps {
  data: Record<string, unknown>;
}

export function ArcCoverflow({ data }: ArcCoverflowProps) {
  /* `direction` comes from the store's theme data, not from `document`.
     Reading `document.documentElement.dir` during render makes the server
     always render the LTR arrow while an Arabic client renders the RTL one —
     the two SVG paths differ, so React reports an attribute hydration mismatch
     and leaves the wrong icon on the page. */
  const { t, isRTL } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const goToRef = useRef<(step: number) => void>(() => {});
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const hovering = useRef(false);

  const slides = useMemo<Slide[]>(
    () =>
      readRows(data, 'slides', PREFIX)
        .map((row) => ({
          src: rowImage(row, 'image', SLIDES),
          title: rowText(row, 'title', SLIDES),
          note: rowText(row, 'note', SLIDES),
          url: pickerValue(rowValue(row, 'url', SLIDES))[0] ?? '',
        }))
        .filter((slide) => slide.src),
    [data]
  );

  const count = slides.length;
  const curve = Math.min(100, Math.max(0, readNumber(data, 'curve', PREFIX, 70)));
  const eyebrow = readTextOr(data, 'eyebrow', PREFIX, 'المجموعة المختارة');
  const hint = readTextOr(data, 'hint', PREFIX, 'اسحب، أو استخدم الأسهم');
  const label = readTextOr(data, 'label', PREFIX, '');
  const note = readTextOr(data, 'note', PREFIX, '');
  const autoplay = readBoolean(data, 'autoplay', PREFIX, false);

  /* The two colour pickers (`arc_bg` / `arc_ink`) were declared in the manifest
     with the same values the stylesheet hard-codes, but nothing ever read them:
     a merchant could change either one and the gallery did not move. They are
     written as custom properties rather than through a `style` prop because the
     geometry effect owns `root.style` — a React `style` prop would reset
     `--ac-w/--ac-h/--ac-gap` on every re-render and collapse the arc.
     An empty value removes the property, so the stylesheet default returns. */
  const bgColor = readTextOr(data, 'bg', PREFIX, '');
  const inkColor = readTextOr(data, 'ink', PREFIX, '');
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const set = (name: string, value: string) => {
      if (value) root.style.setProperty(name, value);
      else root.style.removeProperty(name);
    };
    set('--ac-bg', bgColor);
    set('--ac-ink', inkColor);
  }, [bgColor, inkColor]);

  /* The whole arc lives in this effect: geometry, the frame loop, the pointer
     gesture and the wheel. Nothing here is React state except the index that
     names the card in the caption, so a drag does not re-render the row. */
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage || count === 0) return;

    const cards = slideRefs.current.slice(0, count).filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    const reduce = prefersReducedMotion();
    /* 1 under reduce: the first frame lands on the target and the loop ends,
       which is the still — same composition, no motion to sit through. */
    const lerp = reduce ? 1 : 0.09;
    const dir = getComputedStyle(root).direction === 'rtl' ? -1 : 1;
    root.style.setProperty('--ac-dir', String(dir));

    let cardW = 200;
    let cardH = 275;
    let gap = 100;
    let track = 900;
    let halfW = 1;
    let baselineY = 0;
    let depth = 0;
    let lift = 0;

    let target = 0;
    let current = 0;
    let frame = 0;
    let alive = true;
    let snapTimer = 0;

    const writes = cards.map(() => ({ x: NaN, y: NaN, s: NaN, z: NaN }));

    const measure = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      /* Width from the block, capped by its height so a short (landscape
         phone) block shrinks the cards instead of cropping them. The 140px
         floor matters on a phone: the 15.5% ratio is the reference's desktop
         proportion, and applied to a 390px screen it gives a 60px card — the
         collection turns into thumbnails. */
      cardW = Math.round(Math.max(140, Math.min(W * 0.155, H * 0.36, 250)));
      cardH = Math.round(cardW * CARD_RATIO);
      /* The reference's spacing is tuned for nine cards; with four the row
         collapses into one stack, so the gap opens up — but only to 1.5×, or
         a short collection turns into five photos with air between them
         instead of a fan. */
      gap = Math.round(
        cardW * GAP_RATIO * Math.min(1.5, Math.max(1, REFERENCE_COUNT / Math.max(1, count)))
      );
      track = count * gap;
      /* a hidden block measures 0 — dividing by it would put
         `Infinitypx` into every card */
      halfW = Math.max(1, W / 2);
      baselineY = H * BASELINE;
      depth = (curve / 100) * cardH;
      lift = depth * 0.5;
      root.style.setProperty('--ac-w', `${cardW}px`);
      root.style.setProperty('--ac-h', `${cardH}px`);
      root.style.setProperty('--ac-gap', `${gap}px`);
      /* one write per measure, so the stylesheet's fallback row can centre
         itself before the first frame */
      root.style.setProperty('--ac-n', String(count));
    };

    const place = (offset: number) => {
      let nearest = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < count; i += 1) {
        /* virtual x on the track, wrapped into [0, track) then folded into
           [-track/2, track/2) so the row loops in both directions. `dir`
           mirrors the ORDER, not just the motion: in RTL the next card sits
           on the left, so pressing "next" brings the card the reader expects
           rather than walking the collection backwards. */
        let off = ((i * gap * dir - offset) % track + track) % track;
        if (off > track / 2) off -= track;

        const norm = off / halfW;
        const abs = Math.min(Math.abs(norm), 1.3);
        const scale = Math.max(1 - abs * 0.8, 0.25);
        /* raised cosine: flat at the centre, deepest at absDist = 1 */
        const drop = (1 - Math.cos(Math.min(abs, 1) * Math.PI)) * 0.5 * depth;
        /* a narrow lift that is gone by half a screen — this is what makes the
           centre card read as "picked" rather than merely biggest */
        const rise = Math.max(1 - abs * 2, 0) * lift;

        const x = off - (cardW * scale) / 2;
        const y = baselineY - (cardH * scale) / 2 + drop - rise;
        const z = Math.max(0, Math.round((1 - abs) * 100));

        const last = writes[i];
        /* sub-pixel writes are invisible and cost a style invalidation each */
        if (
          Math.abs(last.x - x) > 0.3 ||
          Math.abs(last.y - y) > 0.3 ||
          Math.abs(last.s - scale) > 0.002 ||
          last.z !== z
        ) {
          const el = cards[i];
          el.style.setProperty('--x', `${x.toFixed(1)}px`);
          el.style.setProperty('--y', `${y.toFixed(1)}px`);
          el.style.setProperty('--s', scale.toFixed(4));
          el.style.setProperty('--z', String(z));
          last.x = x;
          last.y = y;
          last.s = scale;
          last.z = z;
        }

        if (Math.abs(off) < nearestDist) {
          nearestDist = Math.abs(off);
          nearest = i;
        }
      }

      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActive(nearest);
      }
    };

    const tick = () => {
      frame = 0;
      if (!alive) return;
      const delta = target - current;
      if (Math.abs(delta) < 0.2) current = target;
      else current += delta * lerp;
      place(current);
      if (Math.abs(target - current) > 0.1) frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!alive || frame) return;
      frame = requestAnimationFrame(tick);
    };

    const snap = () => {
      if (!gap) return;
      target = Math.round(target / gap) * gap;
      wake();
    };

    measure();
    place(0);

    goToRef.current = (step: number) => {
      target += step * gap * dir;
      wake();
    };

    /* ── pointer: 1:1 while the finger is down, eased onto the nearest slot
       on release. Capturing only after 6px keeps a tap a tap — capture on
       pointerdown retargets the click to the stage and the card's link never
       fires. ── */
    let pointerId = -1;
    let startX = 0;
    let lastX = 0;
    let travelled = 0;
    let captured = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      lastX = event.clientX;
      travelled = 0;
      captured = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      travelled = Math.max(travelled, Math.abs(event.clientX - startX));
      if (!captured && travelled > 6) {
        captured = true;
        root.classList.add('is-dragging');
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {
          /* a synthetic or already-released pointer cannot be captured */
        }
      }
      if (!captured) return;
      target -= dx;
      current = target;
      place(current);
    };

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = -1;
      if (!captured) return;
      captured = false;
      root.classList.remove('is-dragging');
      snap();
    };

    /* ── wheel: horizontal only. A vertical wheel belongs to the page. ──
       `deltaX > 0` is the browser's own "scroll right", i.e. the row moves
       left — so it advances the collection in LTR and must be mirrored in
       RTL, exactly like the arrows. ── */
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      target += event.deltaX * dir;
      wake();
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snap, 180);
    };

    /* ── keys: the page direction owns "next", so the arrows mirror with the
       layout exactly like the buttons do ── */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      /* left is "forward" in RTL, so the key maps through the same direction
         the layout is mirrored by */
      goToRef.current((event.key === 'ArrowLeft' ? -1 : 1) * dir);
    };

    const onResize = () => {
      measure();
      place(current);
    };

    /* ── only animate what is on screen. An off-screen block with a running
       rAF loop is a phone battery spent on nothing. ── */
    let onScreen = true;
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          onScreen = entries.some((entry) => entry.isIntersecting);
          if (onScreen) wake();
          else if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
          }
        },
        { threshold: 0 }
      );
      observer.observe(root);
    }

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('wheel', onWheel, { passive: false });
    root.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(stage);
    }

    /* autoplay lives here so it shares `goTo` with the buttons; the interval
       is deliberately not cleared on hover, only skipped */
    let ticker = 0;
    if (autoplay && !reduce && count > 1) {
      ticker = window.setInterval(() => {
        if (hovering.current || !onScreen || document.visibilityState !== 'visible') return;
        target += gap * dir;
        wake();
      }, 4200);
    }

    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(snapTimer);
      if (ticker) window.clearInterval(ticker);
      observer?.disconnect();
      resizeObserver?.disconnect();
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', endDrag);
      stage.removeEventListener('pointercancel', endDrag);
      stage.removeEventListener('wheel', onWheel);
      root.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      cards.forEach((card) => {
        ['--x', '--y', '--s', '--z'].forEach((name) => card.style.removeProperty(name));
      });
      root.classList.remove('is-dragging');
      root.style.removeProperty('--ac-w');
      root.style.removeProperty('--ac-h');
      root.style.removeProperty('--ac-gap');
      root.style.removeProperty('--ac-n');
      root.style.removeProperty('--ac-dir');
    };
  }, [count, curve, autoplay]);

  const goTo = useCallback((step: number) => goToRef.current(step), []);

  if (!count) return null;

  const current = slides[Math.min(active, count - 1)] ?? slides[0];
  const prevIcon = isRTL ? <ArrowRightIcon width={20} height={20} strokeWidth={2} /> : <ArrowLeftIcon width={20} height={20} strokeWidth={2} />;
  const nextIcon = isRTL ? <ArrowLeftIcon width={20} height={20} strokeWidth={2} /> : <ArrowRightIcon width={20} height={20} strokeWidth={2} />;

  return (
    <div
      ref={rootRef}
      className="arc-coverflow"
      role="region"
      aria-roledescription="carousel"
      aria-label={label || t('blocks.home.arc_gallery', 'Product gallery')}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      {label || note ? (
        <div className="arc-coverflow__masthead">
          {label ? <span className="arc-coverflow__brand">{label}</span> : null}
          {note ? <p className="arc-coverflow__masthead-note">{note}</p> : null}
        </div>
      ) : null}

      <div className="arc-coverflow__stage" ref={stageRef} data-count={count}>
        {slides.map((slide, index) => {
          const body = (
            <img
              className="arc-coverflow__img"
              src={slide.src}
              alt={index === active ? slide.title : ''}
              draggable={false}
              loading={index < 3 ? 'eager' : 'lazy'}
              decoding="async"
            />
          );
          const isActive = index === active;
          return (
            <div
              key={`${slide.src}:${index}`}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className="arc-coverflow__slide"
              style={{ '--i': index } as CSSProperties}
              data-active={isActive ? 'true' : undefined}
              aria-hidden={isActive ? undefined : true}
            >
              {/* only the card at the centre is a link: a tilted neighbour is
                  decoration, and fourteen tab stops through a fan is not a
                  keyboard path anyone wants */}
              {slide.url && isActive ? (
                <Link to={slide.url} className="arc-coverflow__link">
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          );
        })}
      </div>

      <div className="arc-coverflow__caption">
        {eyebrow ? <p className="arc-coverflow__eyebrow">{eyebrow}</p> : null}
        {current?.title ? (
          <p className="arc-coverflow__title" aria-live="polite">
            {current.title}
          </p>
        ) : null}
        {current?.note ? <p className="arc-coverflow__note">{current.note}</p> : null}
        {hint ? <p className="arc-coverflow__hint">{hint}</p> : null}
        {count > 1 ? (
          <div className="arc-coverflow__nav">
            <button type="button" aria-label={t('blocks.home.reviews_prev', 'Previous')} onClick={() => goTo(-1)}>
              {prevIcon}
            </button>
            <button type="button" aria-label={t('blocks.home.reviews_next', 'Next')} onClick={() => goTo(1)}>
              {nextIcon}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
