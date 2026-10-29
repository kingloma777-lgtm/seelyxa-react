import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { imgSrc, pickerValue, rowsFrom, scalar } from '../../lib/curtainSlots';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';

/**
 * `figurines` home block — a full-viewport depth carousel hero.
 *
 * Four merchant figurines stand on the bottom edge: the focused one sharp and
 * tall in the middle, the neighbours small and blurred at the sides, the rest
 * pushed far back. One event crossfades EVERYTHING at once — the section's
 * background colour, each figure's height/position/scale/blur/opacity and the
 * ghost word behind them — so the screen never cuts, it morphs.
 *
 * Against the reference this adds what a real store needs: RTL-native sides
 * and arrows, pointer magnetism on the figures, keyboard arrows, swipe,
 * optional autoplay (paused on hover, off under reduced motion), an honest
 * SSR/static frame when JS is off, and the multiply-blend cutout mode that
 * makes ordinary white-background product photos stand like figurines.
 *
 * Styling: `04-components/home-blocks.scss` (`.s-block--figurines`). The
 * geometry tiers are CSS, not JS resize state — one source of truth.
 */

/** Anton is the reference's display face for the Latin show-words. React 19
 * hoists these links into <head> and dedupes them; `font-display: swap` keeps
 * text visible while it loads, and the theme font is the fallback, so the
 * block never blocks on the font. */
const ANTON_HREF =
  'https://fonts.googleapis.com/css2?family=Anton&display=swap';

/** Row fields are keyed by the SHORT name; the prefixed id only as a fallback
 * (`main-links` is the proof — old rule 15). Top-level settings arrive EITHER
 * short (`store_label`) or under the declared id (`figurines_store_label`,
 * `figurines.store_label` depending on the delivery) — accept every shape,
 * exactly like the collection rows do. */
const field = (row: Record<string, unknown>, name: string): unknown => {
  if (!row) return undefined;
  if (row[name] !== undefined && row[name] !== null) return row[name];
  return row[`figurines.${name}`];
};

interface Figurine {
  src: string;
  title: string;
  subtitle: string;
  color: string;
  url: string;
}

/** When a row ships no colour, these four take over — warm sibliings of the
 * theme's ink, each one able to carry the white ink of the ghost + captions. */
const FALLBACK_COLORS = ['#C96F4A', '#7FA36D', '#C97BA0', '#6FA7D8'];

const EASE_MS = 650;
/** Autoplay speed when the merchant has not chosen one: 6s. */
const AUTO_FALLBACK_S = 6;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface FigurinesProps {
  data: {
    figurines?: unknown;
    ghost_text?: string;
    store_label?: string;
    cta_text?: string;
    cta_link?: unknown;
    autoplay?: boolean | string | number;
    auto_cutout?: boolean | string;
    position?: number;
    [key: string]: unknown;
  };
}

type Role = 'center' | 'start' | 'end' | 'back';

const roleFor = (index: number, active: number, length: number): Role => {
  if (index === active) return 'center';
  if (index === (active + 1) % length) return 'end';
  if (index === (active + length - 1) % length) return 'start';
  return 'back';
};

export function Figurines({ data }: FigurinesProps) {
  const { t } = useTranslation();
  const figurines = useMemo<Figurine[]>(
    () =>
      rowsFrom(data.figurines)
        .map((row) => ({
          src: imgSrc(field(row, 'image')),
          title: scalar(field(row, 'title')),
          subtitle: scalar(field(row, 'subtitle')),
          color: scalar(field(row, 'color')).toUpperCase(),
          url: pickerValue(field(row, 'url'))[0] ?? '',
        }))
        .filter((fig) => fig.src),
    [data]
  );

  const count = figurines.length;
  /* every top-level setting through one dual-shape reader — the declared id
     (`figurines_store_label`), the dotted id, and the short name all agree */
  const opt = useCallback((name: string): unknown => {
    if (data[name] !== undefined && data[name] !== null) return data[name];
    return data[`figurines_${name}`] ?? data[`figurines.${name}`];
  }, [data]);
  const [active, setActive] = useState(0);
  /* The one travel lock — same 650ms the CSS promises, so a fast double click
     cannot turn the roles mid-flight into a tangle. */
  const locking = useRef(false);
  const lock = useCallback(() => {
    if (locking.current) return;
    locking.current = true;
    window.setTimeout(() => (locking.current = false), EASE_MS);
  }, []);

  const slice = Math.min(count, 6);
  const activeIdx = Math.min(active, slice - 1);

  const goTo = useCallback(
    (delta: number) => {
      if (slice < 2 || locking.current) return;
      lock();
      setActive((prev) => (prev + delta + slice) % slice);
    },
    [slice, lock]
  );

  /* ── fit the first fold: the hero's bottom must land ON the viewport
     bottom edge, so the figurine's feet stand on the screen line rather
     than the ~40px under the sticky header. One CSS var, measured from
     this stage's own box; the stylesheet default stands in without JS. ── */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const top = Math.max(64, Math.round(stage.getBoundingClientRect().top));
      stage.style.setProperty('--fig-fit', `${top}px`);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  /* ── the ghost word never leaves the frame. The CSS tier font is the no-JS
     base; with JS the word itself is MEASURED and scaled down so its ink
     stays inside ~94% of the stage width AND in the upper half of the stage
     — that upper-half budget is also what keeps the caption's air below:
     however long the description grows, the letters end well above it. ── */
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const fitGhost = useCallback(() => {
    const el = ghostRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    el.style.fontSize = '';
    const range = document.createRange();
    range.selectNodeContents(el);
    if (typeof range.getBoundingClientRect !== 'function') return;
    const rect = range.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const budgetW = stage.clientWidth * 0.94;
    const budgetH = Math.max(150, Math.round(stage.clientHeight * 0.5));
    const fit = Math.min(1, budgetW / rect.width, budgetH / rect.height);
    if (fit < 1) {
      const base = parseFloat(getComputedStyle(el).fontSize);
      if (Number.isFinite(base) && base > 0) {
        el.style.fontSize = `${Math.max(40, Math.floor(base * fit))}px`;
      }
    }
  }, []);
  const ghostLabel = String(scalar(opt('ghost_text')) || 'SHOWROOM');
  useEffect(() => {
    fitGhost();
    window.addEventListener('resize', fitGhost);
    /* the fallback face renders narrower than Anton — re-fit once the real
       face lands, so the measure is never taken against the fallback */
    document.fonts?.addEventListener('loadingdone', fitGhost);
    return () => {
      window.removeEventListener('resize', fitGhost);
      document.fonts?.removeEventListener('loadingdone', fitGhost);
    };
  }, [fitGhost, ghostLabel]);

  /* ── the "under the header" opt-in (the Twig system): the merchant switch
     read through the usual dual-shape channel. When the wrapper carries
     `s-block--under-header`, the CSS lift (below, on the block) has already
     pulled the hero to y=0 BEHIND the sticky header — so the first fold is
     the FULL viewport and --fig-fit must report 0, never the header offset
     it used to clamp by. The component only pins the var inline so the
     stylesheet's lift and this component can never disagree. ── */
  const underRaw = opt('under_header');
  const underHeader = underRaw === true || underRaw === 1 || underRaw === '1';
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !underHeader) return;
    stage.style.setProperty('--fig-fit', '0px');
    return () => {
      stage.style.removeProperty('--fig-fit');
    };
  }, [underHeader]);

  /* ── autoplay — merchant switch, pauses on hover, never under reduce. The
     cadence is the merchant's own dropdown (`auto_seconds`), 2–60s honoured,
     6s when nothing is chosen. ── */
  const wantAuto = Boolean(opt('autoplay')) && slice > 1;
  const autoRaw = Number(scalar(opt('auto_seconds')));
  const autoMs =
    (Number.isFinite(autoRaw) && autoRaw >= 2 ? Math.min(60, autoRaw) : AUTO_FALLBACK_S) * 1000;
  const hovering = useRef(false);
  useEffect(() => {
    if (!wantAuto || prefersReducedMotion()) return;
    const ticker = window.setInterval(() => {
      if (!hovering.current && document.visibilityState === 'visible') goTo(1);
    }, autoMs);
    return () => window.clearInterval(ticker);
  }, [wantAuto, goTo, autoMs]);

  /* ── key arrows. The page direction owns the gesture: in RTL "next" is
     leftward, so the arrows mirror with the layout like native carousels. ── */
  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const rtl = document.documentElement.dir === 'rtl';
      if (event.key === 'ArrowLeft') goTo(rtl ? 1 : -1);
      else if (event.key === 'ArrowRight') goTo(rtl ? -1 : 1);
    },
    [goTo]
  );

  /* ── swipe — one pointer gesture, 48px past the start cancels ── */
  const pointerDown = useRef<number | null>(null);
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    pointerDown.current = event.clientX;
  };
  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const from = pointerDown.current;
      pointerDown.current = null;
      if (from === null) return;
      const dx = event.clientX - from;
      if (Math.abs(dx) < 48) return;
      goTo(dx > 0 ? -1 : 1);
    },
    [goTo]
  );

  /* ── magnetism: the figures lean toward the pointer a few hundredths. GPU
     variables only — the root carries --mx/--my, the transform of the figures
     uses both, and the mouse leave zeroes them. Requires a real pointer and
     no reduce. ── */
  const stageRef = useRef<HTMLDivElement | null>(null);
  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty('--mx', `${(px * 18).toFixed(1)}px`);
    stage.style.setProperty('--my', `${(py * 10).toFixed(1)}px`);
  }, []);
  const onStageLeave = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    hovering.current = false;
    stage.style.removeProperty('--mx');
    stage.style.removeProperty('--my');
  }, []);

  if (!slice) return null;

  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const nextIcon = isRTL ? <ArrowLeftIcon width={26} height={26} strokeWidth={2.25} /> : <ArrowRightIcon width={26} height={26} strokeWidth={2.25} />;

  const current = figurines[Math.min(activeIdx, figurines.length - 1)] ?? figurines[0];
  const bg = current.color || FALLBACK_COLORS[Math.min(activeIdx, FALLBACK_COLORS.length - 1)];
  const ghost = ghostLabel;
  const brand = scalar(opt('store_label'));
  const ctaText = scalar(opt('cta_text'));
  const ctaUrl = pickerValue(opt('cta_link'))[0] ?? '';
  /* The merchant's white-background photos stand as figurines through the
     multiply blend — and stay real cut-outs (PNG transparency) when the merchant
     already has them. */
  const cutoutRaw = opt('auto_cutout');
  const cutout = cutoutRaw !== false && cutoutRaw !== '0' && cutoutRaw !== '';

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      ref={stageRef}
      className="figurines"
      role="region"
      aria-roledescription="carousel"
      aria-label={current.title || ghost}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={onStageLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{ '--fig-bg': bg } as CSSProperties}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={ANTON_HREF} precedence="figurines-fonts" />

      {/* film grain keeps the flat colour from reading as a solid fill */}
      <div className="figurines__grain" aria-hidden />

      {brand ? <p className="figurines__brand">{brand}</p> : null}

      <div className="figurines__stage">
        {/* the ghost word paints INSIDE the figures' stacking context, one
            layer above the back figure and below the sides + center — so the
            deepest figurine stands BEHIND the word and it swallows it whole,
            which is the depth cue the reference gives. */}
        <div className="figurines__ghost" ref={ghostRef} aria-hidden>
          {ghost}
        </div>
        {figurines.slice(0, 6).map((fig, i) => {
          const role = roleFor(i, activeIdx, figurines.length);
          const body = (
            <img
              className={
                'figurines__img' + (cutout ? ' figurines__img--cutout' : '')
              }
              src={fig.src}
              alt={fig.title || ''}
              draggable={false}
              loading={i === activeIdx ? 'eager' : 'lazy'}
              decoding="async"
            />
          );
          /* a figurine with a url is a real link; keyboard stays honest — the
             blurred neighbours sit under the overlay, not inside this one */
          return (
            <div key={`${fig.src}:${i}`} className={`figurines__fig figurines__fig--${role}`} style={{ '--fig-i': i } as CSSProperties}>
              {fig.url && i === activeIdx ? <Link to={fig.url} className="figurines__link">{body}</Link> : body}
            </div>
          );
        })}
      </div>

      {/* current figurine speak + the two-role arrows */}
      <div className="figurines__info">
        <div className="figurines__caption" key={`${activeIdx}:${current.title}`}>
          {current.title ? <p className="figurines__title">{current.title}</p> : null}
          {current.subtitle ? <p className="figurines__sub">{current.subtitle}</p> : null}
        </div>
        {count > 1 ? (
          <div className="figurines__nav">
            <button type="button" aria-label={t('blocks.home.reviews_prev', 'Previous')} onClick={() => goTo(-1)}>
              {isRTL ? <ArrowRightIcon width={26} height={26} strokeWidth={2.25} /> : <ArrowLeftIcon width={26} height={26} strokeWidth={2.25} />}
            </button>
            <button type="button" aria-label={t('blocks.home.reviews_next', 'Next')} onClick={() => goTo(1)}>
              {isRTL ? <ArrowLeftIcon width={26} height={26} strokeWidth={2.25} /> : <ArrowRightIcon width={26} height={26} strokeWidth={2.25} />}
            </button>
            <span className="figurines__count" dir="ltr" aria-current="true">
              {pad(activeIdx + 1)} / {pad(count)}
            </span>
          </div>
        ) : null}
      </div>

      {ctaText ? (
        <Link className="figurines__cta" to={ctaUrl || '/'}>
          {ctaText}
          <span className="figurines__cta-arrow">{nextIcon}</span>
        </Link>
      ) : null}
    </div>
  );
}
