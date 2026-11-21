import {
  Component,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  product,
  type ProductsListResult,
  type ProductsListSource,
} from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { ProductCard } from '../../product/ProductCard';
import { safeHref } from './seliaFields';
import { SeliaCta } from './SeliaSection';

/* ==========================================================================
   Rendering primitives shared by the second batch of Selia blocks.

   Selia shipped 34 independent Twig sections; the ones that all do "a strip of
   linked pictures" each had their own carousel, their own arrow buttons and
   their own idea of what an RTL "next" means. Porting that literally would
   ship six carousels with six different bugs. These primitives own the
   behaviour once; the 26 block files own the field reading and the markup
   that makes each block look like itself.

   SSR rule for every interactive primitive: the FIRST render (server and
   client) must be identical. Anything that depends on `Date.now()`, the
   viewport, `matchMedia`, or an observer only starts inside `useEffect`.
   ========================================================================== */

type ProductItem = ProductsListResult['items'][number];

const SOURCE_MAP: Record<string, ProductsListSource> = {
  latest: 'latest',
  offers: 'offers',
  best_selling: 'best_selling',
  top_rated: 'top-rated',
  selected: 'selected',
};

/**
 * One product source for all the product-bearing blocks.
 *
 * `selected` gets its ids from the merchant's picker; the catalogue-wide
 * sources deliberately omit `sourceValue` because sending `null` makes the
 * products API answer 422 and the whole section disappears with no error.
 */
export function useSeliaProducts(type = 'latest', ids: number[] = [], limit = 8) {
  const source = SOURCE_MAP[type] ?? 'latest';
  // The engine's query builder can throw when the Twilight store runtime has not
  // initialised (a local preview / sandbox without a live store). Catch it and
  // return an empty, disabled query so the block degrades to its preview data
  // instead of taking the whole section down with it.
  //
  // The builder's own return type is kept (not `Parameters<typeof useQuery>[0]`):
  // the looser type erases `select`'s data type, so the spread below no longer
  // type-checks and `data` degrades to `{}`.
  type ListOptions = ReturnType<typeof product.queries.list>;
  let options: ListOptions;
  try {
    options = product.queries.list({
      source,
      ...(source === 'selected' ? { sourceValue: ids } : {}),
      perPage: limit,
    });
  } catch {
    options = {
      queryKey: ['selia-safe-list', source, ids.join(',')],
      enabled: false,
    } as unknown as ListOptions;
  }
  const { data, isLoading } = useQuery({
    ...options,
    enabled:
      (options as { enabled?: boolean }).enabled !== false &&
      (source !== 'selected' || ids.length > 0),
  });
  return {
    products: (data?.items ?? []).slice(0, limit) as ProductItem[],
    isLoading,
  };
}

/** The store's own product card — prices, stock and photos stay live. */
export function SeliaProductGrid({
  products,
  className = '',
  skeleton = 4,
}: {
  products: ProductItem[];
  className?: string;
  skeleton?: number;
}) {
  if (!products.length) {
    return (
      <ul className={`selia-products ${className}`} aria-hidden="true">
        {Array.from({ length: Math.max(1, Math.min(skeleton, 8)) }).map((_, index) => (
          <li className="selia-products__item" key={index}>
            <div className="selia-products__skeleton" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={`selia-products ${className}`}>
      {products.map((item) => (
        <li className="selia-products__item" key={item.id}>
          <ProductCard product={item} />
        </li>
      ))}
    </ul>
  );
}

/** A fixed-ratio image frame with an optional separate mobile image. */
export function SeliaMedia({
  src,
  mobile,
  alt = '',
  className = '',
  fit = 'cover',
  children,
  style,
}: {
  src?: string;
  mobile?: string;
  alt?: string;
  className?: string;
  fit?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={`selia-media ${className}`} style={style}>
      {src ? (
        <picture>
          {mobile ? <source media="(max-width: 640px)" srcSet={mobile} /> : null}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            style={{ objectFit: fit as CSSProperties['objectFit'] }}
          />
        </picture>
      ) : (
        <span className="selia-media__placeholder" aria-hidden="true" />
      )}
      {children}
    </div>
  );
}

/**
 * A video with a poster fallback. Autoplay is paused for reduced-motion users
 * after mount — `matchMedia` cannot be consulted during the server render.
 */
export function SeliaVideo({
  src,
  poster,
  autoplay = false,
  controls = true,
  className = '',
}: {
  src?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      ref.current?.pause();
    }
  }, [autoplay]);

  if (!src) return <SeliaMedia src={poster} className={className} />;
  return (
    <video
      ref={ref}
      className={`selia-video ${className}`}
      src={src}
      poster={poster || undefined}
      controls={controls}
      muted
      loop
      playsInline
      autoPlay={autoplay}
      preload="metadata"
    />
  );
}

/** A link that degrades to a plain container when the merchant left it empty. */
export function SeliaTileLink({
  href,
  className,
  label,
  children,
}: {
  href?: string;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  const link = safeHref(href);
  if (!link) return <div className={className}>{children}</div>;
  const external = /^https?:\/\//i.test(link);
  return (
    <a
      className={className}
      href={link}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(label ? { 'aria-label': label } : {})}
    >
      {children}
    </a>
  );
}

export interface SeliaTile {
  image?: string;
  mobile?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  badge?: string;
  style?: CSSProperties;
}

/** The linked-picture grid used by the six link/banner families. */
export function SeliaTiles({
  tiles,
  variant,
  className = '',
  showCaption = true,
}: {
  tiles: SeliaTile[];
  variant: string;
  className?: string;
  showCaption?: boolean;
}) {
  if (!tiles.length) return null;
  return (
    <ul className={`selia-tiles selia-tiles--${variant} ${className}`}>
      {tiles.map((tile, index) => (
        <li className="selia-tiles__item" key={index} style={tile.style}>
          <SeliaTileLink href={tile.href} label={tile.title} className="selia-tiles__link">
            <SeliaMedia src={tile.image} mobile={tile.mobile} alt={tile.title || ''} className="selia-tiles__media" />
            {tile.badge ? <span className="selia-tiles__badge">{tile.badge}</span> : null}
            {showCaption && (tile.title || tile.subtitle) ? (
              <span className="selia-tiles__caption">
                {tile.title ? <span className="selia-tiles__title">{tile.title}</span> : null}
                {tile.subtitle ? <span className="selia-tiles__subtitle">{tile.subtitle}</span> : null}
              </span>
            ) : null}
          </SeliaTileLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * A horizontal scroller with optional arrows and autoplay.
 *
 * `scrollLeft` is negative in RTL Chrome and positive in LTR, so the step is
 * multiplied by the computed reading direction. Without that, the "next"
 * arrow on an Arabic store walks backwards through the strip — the single
 * most common bug in a copied carousel.
 */
export function SeliaScroller({
  children,
  className = '',
  arrows = false,
  autoplay = false,
  interval = 5,
  label = 'العناصر',
}: {
  children: ReactNode;
  className?: string;
  arrows?: boolean;
  autoplay?: boolean;
  interval?: number;
  label?: string;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const step = (direction: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    const first = node.querySelector<HTMLElement>('[data-slide]');
    const card = first ? first.getBoundingClientRect().width + 16 : node.clientWidth * 0.8;
    const rtl = window.getComputedStyle(node).direction === 'rtl';
    /* `scrollBy` is missing in jsdom and in a few embedders' parsers, and a
       click that throws here dead-ends the arrows. Direct assignment is the
       honest fallback: same pixels, no smooth promise. */
    if (typeof node.scrollBy === 'function') {
      node.scrollBy({ left: direction * card * (rtl ? -1 : 1), behavior: 'smooth' });
    } else {
      node.scrollLeft += direction * card * (rtl ? -1 : 1);
    }
  };

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const node = ref.current;
    if (!node) return;
    const timer = window.setInterval(
      () => {
        const max = node.scrollWidth - node.clientWidth;
        const position = Math.abs(node.scrollLeft);
        if (max <= 2) return;
        if (position >= max - 2) node.scrollTo({ left: 0, behavior: 'smooth' });
        else step(1);
      },
      Math.max(1500, interval * 1000)
    );
    return () => window.clearInterval(timer);
    // `step` closes over the ref, not over changing props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, interval]);

  return (
    <div className={`selia-scroller ${className}`}>
      <div className="selia-scroller__track" ref={ref} tabIndex={0} role="region" aria-label={label}>
        {children}
      </div>
      {arrows ? (
        <div className="selia-scroller__arrows">
          <button type="button" className="selia-scroller__arrow" onClick={() => step(-1)} aria-label={t('blocks.home.reviews_prev', 'السابق')}>
            <i className="sicon-arrow-right" aria-hidden="true" />
          </button>
          <button type="button" className="selia-scroller__arrow" onClick={() => step(1)} aria-label={t('blocks.home.reviews_next', 'التالي')}>
            <i className="sicon-arrow-left" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * A countdown whose first render is deliberately static.
 *
 * `Date.now()` on the server and on the client are different instants; putting
 * the difference into the first render is a guaranteed hydration mismatch.
 * The dashes ship in the HTML, then the real clock starts on mount — crawlers
 * still get a labelled timer instead of an empty div.
 */
export function SeliaCountdown({ until, className = '' }: { until: string; className?: string }) {
  const { t } = useTranslation();
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const end = new Date(until).getTime();
    if (!Number.isFinite(end)) return;
    const tick = () => {
      const seconds = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const days = Math.floor(seconds / 86400);
      setDisplay(`${pad(days)}:${pad(Math.floor((seconds % 86400) / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [until]);

  return (
    <div className={`selia-clock ${className}`} role="timer" aria-live="off" aria-label={t('blocks.selia.countdown_label', 'الوقت المتبقي')}>
      {(display ?? '--:--:--:--').split(':').map((cell, index) => (
        <span className="selia-clock__cell" key={index}>
          {cell}
        </span>
      ))}
    </div>
  );
}

/** Accessible tabs. `useId` keeps ids stable between the server and client. */
export function SeliaTabs({
  tabs,
  style = 'pills',
  label = 'التبويبات',
}: {
  tabs: Array<{ label: string; content: ReactNode }>;
  style?: string;
  label?: string;
}) {
  const [active, setActive] = useState(0);
  const base = useId();
  if (!tabs.length) return null;

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (active + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setActive(next);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[next]?.focus();
  };

  return (
    <div className={`selia-tabs selia-tabs--${style}`}>
      <div className="selia-tabs__list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={index}
            role="tab"
            id={`${base}-tab-${index}`}
            aria-controls={`${base}-panel-${index}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            className="selia-tabs__tab"
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`${base}-panel-${index}`}
          aria-labelledby={`${base}-tab-${index}`}
          hidden={index !== active}
          className="selia-tabs__panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/** Native `<details>`: works with no JS, keyboard, and every screen reader. */
export function SeliaAccordion({
  items,
  className = '',
}: {
  items: Array<{ question: string; answer: string; href?: string; buttonLabel?: string }>;
  className?: string;
}) {
  return (
    <div className={`selia-accordion ${className}`}>
      {items.map((item, index) => (
        <details className="selia-accordion__item" key={index} open={index === 0}>
          <summary className="selia-accordion__question">{item.question}</summary>
          <div className="selia-accordion__answer">
            <p>{item.answer}</p>
            {item.buttonLabel ? (
              <a className="selia-cta selia-cta--ghost" href={safeHref(item.href) || '#'}>
                {item.buttonLabel}
              </a>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}

/** Draggable before/after comparison; the split starts at 50% on both sides. */
export function SeliaBeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  vertical = false,
  color,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  vertical?: boolean;
  color?: string;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(50);
  const style = {
    '--ba-split': `${value}%`,
    ...(color ? { '--ba-line': color } : {}),
  } as CSSProperties;

  return (
    <div className="selia-ba" style={style} data-vertical={vertical ? 'yes' : 'no'}>
      <div className="selia-ba__frame">
        <img className="selia-ba__img" src={after} alt={afterLabel || ''} loading="lazy" />
        {/* The «before» layer is anchored to the inline-start edge and grows
            with `--ba-split`, so in Arabic the past sits on the right — the
            side the eye reaches first — without a single `if rtl`. */}
        <div className="selia-ba__clip">
          <img className="selia-ba__img" src={before} alt={beforeLabel || ''} loading="lazy" />
        </div>
        <span className="selia-ba__line" aria-hidden="true">
          {/* The grip is the whole affordance: a bare 2px rule reads as a seam
              between two photos, not as something you are allowed to drag. */}
          <span className="selia-ba__grip">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9.5 6.5 4.5 12l5 5.5" />
              <path d="M14.5 6.5 19.5 12l-5 5.5" />
            </svg>
          </span>
        </span>
        {beforeLabel ? <span className="selia-ba__label selia-ba__label--start">{beforeLabel}</span> : null}
        {afterLabel ? <span className="selia-ba__label selia-ba__label--end">{afterLabel}</span> : null}
        <input
          className="selia-ba__range"
          type="range"
          min="1"
          max="99"
          value={value}
          aria-label={t('blocks.selia.before_after_handle', 'اسحب للمقارنة بين الصورتين')}
          onChange={(event) => setValue(Number(event.target.value))}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   Hero slider (`selia-advanced-slider`).

   The block's own contract promises a fade, a transition speed, pagination
   dots and a button per slide. What shipped rendered a horizontal scroll
   track with a title and a description — no button, no dots, no fade — so
   most of the eleven controls did nothing. This is the slider the fields
   describe: slides stacked in one frame, cross-fading (or sliding) on a
   timer, with a real CTA, a numbered pager that shows the remaining time,
   arrows, keyboard support and swipe.

   Everything is opt-in from the merchant's switches; nothing autoplays for a
   visitor who asked for reduced motion.
   ========================================================================== */

export interface HeroSlide {
  image?: string;
  mobile?: string;
  title?: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
  ctaBg?: string;
  ctaInk?: string;
  video?: string;
  /** Merchant's «موضع النص»: a physical side, honoured literally. */
  position?: string;
  fit?: string;
}

export function SeliaHeroSlider({
  slides,
  arrows = true,
  dots = true,
  autoplay = true,
  interval = 5,
  speed = 2,
  effect = 'fade',
  kenBurns = false,
  showVideo = false,
  label = 'الشرائح',
}: {
  slides: HeroSlide[];
  arrows?: boolean;
  dots?: boolean;
  autoplay?: boolean;
  interval?: number;
  speed?: number;
  effect?: string;
  kenBurns?: boolean;
  showVideo?: boolean;
  label?: string;
}) {
  const { t } = useTranslation();
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef({ x: 0, moved: false });

  const go = (next: number) => {
    if (count < 1) return;
    setIndex(((next % count) + count) % count);
  };

  useEffect(() => {
    if (!autoplay || count < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), Math.max(2000, interval * 1000));
    return () => window.clearInterval(timer);
  }, [autoplay, count, interval, paused]);

  /* A swipe must not also fire the CTA underneath it. `moved` is set on the
     pointer move and cleared by the click that follows. */
  const onPointerDown = (event: React.PointerEvent) => {
    drag.current = { x: event.clientX, moved: false };
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (Math.abs(event.clientX - drag.current.x) > 12) drag.current.moved = true;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) < 48) return;
    const rtl = window.getComputedStyle(event.currentTarget as Element).direction === 'rtl';
    const forward = rtl ? dx > 0 : dx < 0;
    go(index + (forward ? 1 : -1));
  };
  const onClickCapture = (event: React.MouseEvent) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
  };

  const style = {
    '--hero-speed': `${speed}s`,
    '--hero-interval': interval,
    '--hero-index': index,
    '--hero-dir': 1,
  } as CSSProperties;

  return (
    <div
      className="selia-hero"
      data-effect={effect === 'slide' ? 'slide' : 'fade'}
      data-playing={autoplay && !paused && count > 1 ? 'true' : 'false'}
      style={style}
      /* Pausing lives on the widget, not on the stage: the arrows and the
         pager are siblings of the stage, so hovering the control the visitor
         is about to use would otherwise leave the timer running. */
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="selia-hero__stage"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          /* In Arabic «next» is to the left, so the physical key that advances
             is the opposite one. */
          const rtl = window.getComputedStyle(event.currentTarget).direction === 'rtl';
          const back = rtl ? 'ArrowRight' : 'ArrowLeft';
          const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
          if (event.key === forward) { event.preventDefault(); go(index + 1); }
          if (event.key === back) { event.preventDefault(); go(index - 1); }
          if (event.key === 'Home') { event.preventDefault(); go(0); }
          if (event.key === 'End') { event.preventDefault(); go(count - 1); }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current.moved = false; }}
        onClickCapture={onClickCapture}
      >
        {slides.map((slide, i) => {
          const active = i === index;
          const position = ['left', 'center'].includes(slide.position ?? '') ? slide.position : 'right';
          return (
            <div
              className="selia-hero__slide"
              data-active={active ? 'true' : 'false'}
              data-pos={position}
              style={{ '--i': i } as CSSProperties}
              aria-hidden={active ? undefined : true}
              key={i}
            >
              <div className="selia-hero__media">
                {showVideo && slide.video ? (
                  <SeliaVideo
                    src={slide.video}
                    poster={slide.image}
                    autoplay={active}
                    controls={false}
                    className="selia-hero__video"
                  />
                ) : (
                  <SeliaMedia
                    src={slide.image}
                    mobile={slide.mobile}
                    alt={slide.title || ''}
                    fit={slide.fit || 'cover'}
                    className="selia-hero__img"
                  />
                )}
              </div>
              <span className="selia-hero__scrim" aria-hidden="true" />
              <div className="selia-hero__inner">
                <div className="selia-hero__copy">
                  {slide.title ? <h3 className="selia-hero__title">{slide.title}</h3> : null}
                  {slide.description ? <p className="selia-hero__desc">{slide.description}</p> : null}
                  {slide.ctaLabel ? (
                    <span
                      className="selia-hero__cta"
                      style={{
                        '--hero-cta-bg': slide.ctaBg || '#111111',
                        '--hero-cta-ink': slide.ctaInk || '#ffffff',
                      } as CSSProperties}
                    >
                      <SeliaCta label={slide.ctaLabel} href={slide.href} tone="solid" />
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {arrows && count > 1 ? (
        <>
          <button
            type="button"
            className="selia-hero__arrow selia-hero__arrow--prev"
            onClick={() => go(index - 1)}
            aria-label={t('blocks.home.reviews_prev', 'الشريحة السابقة')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M14.5 5.5 8 12l6.5 6.5" />
            </svg>
          </button>
          <button
            type="button"
            className="selia-hero__arrow selia-hero__arrow--next"
            onClick={() => go(index + 1)}
            aria-label={t('blocks.home.reviews_next', 'الشريحة التالية')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M14.5 5.5 8 12l6.5 6.5" />
            </svg>
          </button>
        </>
      ) : null}

      {dots && count > 1 ? (
        <div className="selia-hero__pager">
          <span className="selia-hero__count" aria-hidden="true" dir="ltr">
            <b>{pad(index + 1)}</b>
            <i>/</i>
            {pad(count)}
          </span>
          <div className="selia-hero__dots" role="tablist" aria-label={label}>
            {slides.map((_, i) => (
              <button
                type="button"
                role="tab"
                className="selia-hero__dot"
                data-active={i === index ? 'true' : 'false'}
                aria-selected={i === index}
                aria-label={`الشريحة ${i + 1}`}
                onClick={() => go(i)}
                key={i}
              >
                {/* Re-keyed on every change so the fill restarts from zero on
                    the slide that just became active. */}
                <span className="selia-hero__dot-fill" key={`${i}-${index}`} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** A row of 1–5 filled stars, with the numeric value kept for screen readers. */
export function SeliaStars({ value }: { value: number }) {
  const count = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="selia-stars" aria-label={`${count} من 5 نجوم`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <i className={index < count ? 'sicon-star is-filled' : 'sicon-star'} key={index} aria-hidden="true" />
      ))}
    </span>
  );
}

/* ==========================================================================
   Product-video cards (`selia-product-videos`).

   The merchant picks a product and pastes that product's video URL; the block
   renders the store's real card — name, price, add-to-cart — with the video
   as the media instead of the photo. The list endpoint carries prices and
   stock but never options, so the add-to-cart is the platform's own button:
   it opens the options when the product has them instead of adding blind.
   ========================================================================== */

export interface SeliaProductVideoEntry {
  productId: string;
  video: string;
}

/** The fields a product list row carries that the video card reads. */
interface CardProduct {
  id: number | string;
  name?: string;
  url?: string;
  price?: string | number;
  sale_price?: string | number | null;
  /** The price before the discount — `price` already holds what the customer pays. */
  regular_price?: string | number | null;
  is_on_sale?: boolean;
  status?: string;
  type?: string;
  image?: { url?: string } | string | null;
}

/** The platform button's own enums, narrowed from the free-form API strings. */
const ADD_STATUSES = ['sale', 'out', 'out-and-notify', 'hidden'] as const;
const ADD_TYPES = [
  'product',
  'service',
  'codes',
  'digital',
  'food',
  'donating',
  'group_products',
  'booking',
  'financial_support',
] as const;
const addStatus = (value?: string) =>
  (ADD_STATUSES as readonly string[]).includes(value ?? '')
    ? (value as (typeof ADD_STATUSES)[number])
    : 'sale';
const addType = (value?: string) =>
  (ADD_TYPES as readonly string[]).includes(value ?? '')
    ? (value as (typeof ADD_TYPES)[number])
    : 'product';

/** A product row's picture, whether the API answers an object or a bare url. */
const pictureOf = (image: CardProduct['image']): string => {
  if (!image) return '';
  return typeof image === 'string' ? image : image.url || '';
};

/**
 * The card's video: muted, looping, letterboxed on a dark stage, and started
 * only when it scrolls into view (and only for visitors who did not ask for
 * reduced motion). `preload="none"` keeps a four-card row off the critical
 * path; the product photo arrives first as the poster.
 */
function SeliaCardVideo({
  src,
  poster,
  autoplay,
  videoRef,
  onPlaying,
}: {
  src: string;
  poster: string;
  autoplay: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onPlaying?: (playing: boolean) => void;
}) {
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    /* `muted` is a DOM property here, never a React prop: hydration reads the
       property back, and a server-rendered `muted` attribute is only reflected
       by real browsers — jsdom (and the sweep test) would see `false` and warn
       on every card. Setting it before play() also satisfies autoplay policy. */
    node.muted = true;
    if (!autoplay) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const attempt = () => {
      /* jsdom's media element has no playback; a card that throws here would
         dead-end the whole grid in tests. */
      const pending = node.play?.();
      if (pending && typeof (pending as Promise<void>).then === 'function') {
        (pending as Promise<void>).then(() => onPlaying?.(true)).catch(() => {});
      } else {
        onPlaying?.(true);
      }
    };
    if (!('IntersectionObserver' in window)) {
      attempt();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) attempt();
          else {
            node.pause?.();
            onPlaying?.(false);
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoplay, src, videoRef, onPlaying]);

  return (
    <video
      ref={videoRef}
      className="selia-vcard__video"
      src={src}
      poster={poster || undefined}
      loop
      playsInline
      preload="none"
    />
  );
}

/**
 * A tiny error boundary. The Salla web components (`SallaAddProductButton`,
 * `useWishlist`) read the Twilight runtime context; when that context fails to
 * hydrate (common in the local dev/preview harness) they throw. Without a
 * boundary that throw unmounts the whole card and the grid collapses to Salla's
 * default skeleton. We catch it and show a plain, still-functional control
 * instead, so the block always renders with its real data.
 */
class SeliaBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  // Swallow: the fallback already communicates the failure mode to the user.
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Plain add-to-cart button used when the Salla web component cannot hydrate.
 * It mirrors the Salla button's look and, when the runtime is present, pushes
 * the product into the cart through the public `Salla.Cart` API; otherwise it
 * drops the visitor on the product page so the action is never lost.
 */
function SeliaAddButtonFallback({
  product,
  label,
}: {
  product: CardProduct;
  label: string;
}) {
  const onAdd = () => {
    const salla = (window as unknown as { Salla?: { Cart?: { addProduct?: (id: number, qty?: number) => void } } }).Salla;
    if (salla?.Cart?.addProduct) {
      salla.Cart.addProduct(Number(product.id) || 0, 1);
    } else if (product.url) {
      window.location.href = product.url;
    }
  };
  return (
    <span className="selia-vcard__add">
      <button type="button" className="s-button-element" onClick={onAdd}>
        <i className="sicon-cart" aria-hidden="true" />
        <span className="selia-vcard__add-label">{label}</span>
      </button>
    </span>
  );
}

/**
 * True only after the Salla store runtime has attached. The Salla web components
 * (`SallaAddProductButton`, the wishlist) read `window.Salla.store` during their
 * `componentWillLoad`; when it is missing (a preview sandbox, an offline author)
 * that throw escapes React's error boundaries — it is a custom-element lifecycle,
 * not a React render — and takes the whole block down with it. We therefore never
 * mount those components until the store is present, and show the plain,
 * still-functional fallback instead.
 */
function useSallaStoreReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(
      typeof window !== 'undefined' &&
        !!(window as unknown as { Salla?: { store?: unknown } }).Salla?.store
    );
  }, []);
  return ready;
}

/** The reference's material glyphs, inline so a card needs no icon font. */
function PlayGlyph() {
  return (
    <svg className="selia-vcard__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg className="selia-vcard__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

function MutedGlyph() {
  return (
    <svg className="selia-vcard__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function UnmutedGlyph() {
  return (
    <svg className="selia-vcard__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  );
}

export function SeliaProductVideoCard({
  product,
  video,
  autoplay,
  index,
  showProduct,
}: {
  product: CardProduct;
  video: string;
  autoplay: boolean;
  index: number;
  showProduct: boolean;
}) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const storeReady = useSallaStoreReady();
  const videoRef = useRef<HTMLVideoElement>(null);
  /* SSR-safe first paint: the transport glyph follows the merchant's autoplay
     switch, never a media event, so the server HTML and the client's first
     render agree. */
  const [playing, setPlaying] = useState(autoplay);
  const [muted, setMuted] = useState(true);

  const poster = pictureOf(product.image);
  const name = product.name ?? '';
  const href = product.url || '#';
  const onSale = product.is_on_sale && product.sale_price != null;
  const shown = onSale ? (product.sale_price ?? '') : (product.price ?? '');
  // `price` already carries the amount the customer pays, so the struck twin has
  // to come from `regular_price` — comparing `price` with `sale_price` compared a
  // figure with itself and the discount never showed.
  const before = product.regular_price ?? product.price ?? '';
  const showCompare = onSale && String(before) !== '' && String(before) !== String(shown);

  const togglePlay = () => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) {
      const pending = node.play?.();
      if (pending && typeof pending.catch === 'function') pending.catch(() => {});
      setPlaying(true);
    } else {
      node.pause?.();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const node = videoRef.current;
    if (!node) return;
    node.muted = !node.muted;
    setMuted(node.muted);
  };

  const addLabel = t('pages.products.add_to_cart', 'أضف إلى السلة');

  return (
    <article className="selia-vcard" data-selia-index={index}>
      <div className="selia-vcard__media">
        {video ? (
          <SeliaCardVideo
            src={video}
            poster={poster}
            autoplay={autoplay}
            videoRef={videoRef}
            onPlaying={setPlaying}
          />
        ) : poster ? (
          <img src={poster} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="selia-vcard__stage" aria-hidden="true" />
        )}

        <div className="selia-vcard__controls">
          {video ? (
            <>
              <button
                type="button"
                className="selia-vcard__ctl"
                onClick={togglePlay}
                aria-label={
                  playing
                    ? t('blocks.home.video_pause', 'إيقاف مؤقت')
                    : t('blocks.home.video_play', 'تشغيل')
                }
                aria-pressed={playing}
              >
                {playing ? <PauseGlyph /> : <PlayGlyph />}
              </button>
              <button
                type="button"
                className="selia-vcard__ctl"
                onClick={toggleMute}
                aria-label={
                  muted
                    ? t('blocks.home.video_unmute', 'تشغيل الصوت')
                    : t('blocks.home.video_mute', 'كتم الصوت')
                }
                aria-pressed={muted}
              >
                {muted ? <MutedGlyph /> : <UnmutedGlyph />}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {showProduct ? (
        <div className="selia-vcard__panel">
          <a className="selia-vcard__thumb" href={href} tabIndex={-1} aria-hidden="true">
            {poster ? (
              <img src={poster} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="selia-vcard__thumb-empty" aria-hidden="true" />
            )}
          </a>
          <div className="selia-vcard__info">
            <a className="selia-vcard__name" href={href}>
              {name}
            </a>
            <p className="selia-vcard__note">
              {t('blocks.home.product_video_note', 'تتوفر أقساط بدون فوائد')}
            </p>
            {shown !== '' ? (
              <p className="selia-vcard__price">
                <span className="selia-vcard__now">{format(shown)}</span>
                {showCompare ? (
                  <s className="selia-vcard__compare">{format(before)}</s>
                ) : null}
              </p>
            ) : null}
          </div>
          {/* the round control is the panel's third column, not part of the copy */}
          {storeReady ? (
            <SeliaBoundary fallback={<SeliaAddButtonFallback product={product} label={addLabel} />}>
              <SallaAddProductButton
                className="selia-vcard__add"
                productId={product.id}
                productStatus={addStatus(product.status)}
                productType={addType(product.type)}
                fill="solid"
                loaderPosition="center"
              >
                <i className="sicon-cart" aria-hidden="true" />
                <span className="selia-vcard__add-label">{addLabel}</span>
              </SallaAddProductButton>
            </SeliaBoundary>
          ) : (
            <SeliaAddButtonFallback product={product} label={addLabel} />
          )}
        </div>
      ) : null}
    </article>
  );
}

/**
 * The product-video grid: one query for every row's product, then a card per
 * row with that row's video. A row whose product is still loading keeps its
 * slot (the grid does not reflow when the catalogue lands); a row whose
 * product no longer exists is skipped once the list has settled.
 */
/**
 * When the live catalogue cannot be reached (a preview sandbox, a store that
 * blocks the products API, an offline author), we still want the block to be
 * visible: the merchant wired up a product id and a video, so render the card
 * from that row's own data. Prices/stock/add-to-cart stay empty here and are
 * upgraded the moment the real product resolves through `useSeliaProducts`.
 */
function syntheticProduct(entry: SeliaProductVideoEntry): CardProduct {
  const id = Number(entry.productId);
  return {
    id: Number.isFinite(id) && id > 0 ? id : entry.productId,
    name: '',
    url: '',
    price: '',
    sale_price: null,
    is_on_sale: false,
    status: 'sale',
    type: 'product',
    image: null,
  };
}

export function SeliaProductVideoGrid({
  entries,
  autoplay,
  showProduct,
  layout = 'slider',
  title = '',
  subtitle = '',
  className = '',
}: {
  entries: SeliaProductVideoEntry[];
  autoplay: boolean;
  showProduct: boolean;
  /** `slider` is the reference's four-up reel; `grid` wraps the same cards. */
  layout?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const { t, isRTL } = useTranslation();
  /* The reference is a reel, ALWAYS: a placement that saved «شبكة» before this
     design must not fall back to a static grid and lose its arrows and bars.
     The value still ships as `data-layout` so a merchant's `custom_css` can
     target it, but it no longer forks the render. */
  const reel = true;
  const trackRef = useRef<HTMLDivElement>(null);
  /* Deterministic first paint: four clips per page, the reference's own count.
     The real per-view width is measured after mount. */
  const [pages, setPages] = useState(() => Math.max(1, Math.ceil(entries.length / 4)));
  const [page, setPage] = useState(0);

  const ids = useMemo(() => {
    const out: number[] = [];
    entries.forEach((entry) => {
      const id = Number(entry.productId);
      if (Number.isFinite(id) && id > 0 && !out.includes(id)) out.push(id);
    });
    return out;
  }, [entries]);

  const { products, isLoading } = useSeliaProducts('selected', ids, Math.max(ids.length, 1));

  const catalogue = useMemo(() => {
    const map = new Map<string, CardProduct>();
    products.forEach((item) => map.set(String(item.id), item as CardProduct));
    return map;
  }, [products]);

  /** Scroll position → page. The track itself is the source of truth, so a
   *  swipe and an arrow keep the pagination bars honest. */
  const readPage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth || 1;
    const count = Math.max(1, Math.round(track.scrollWidth / width));
    setPages(count);
    setPage(Math.max(0, Math.min(count - 1, Math.round(Math.abs(track.scrollLeft) / width))));
  }, []);

  useEffect(() => {
    if (!reel) return;
    readPage();
    window.addEventListener('resize', readPage);
    return () => window.removeEventListener('resize', readPage);
  }, [readPage, reel, entries.length]);

  const goToPage = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth || 1;
    const target = Math.max(0, Math.min(pages - 1, next));
    /* RTL scroll offsets are negative in both engines the theme targets. */
    const direction = window.getComputedStyle(track).direction === 'rtl' ? -1 : 1;
    track.scrollTo({ left: direction * target * width, behavior: 'smooth' });
    setPage(target);
  };

  if (!entries.length) return null;

  const label = title || t('blocks.home.product_videos', 'فيديوهات المنتجات');
  /* The reference's chevrons: in RTL "previous" points right. */
  const rightChevron = 'M11.438 22.479l6.125-6.125-6.125-6.125 1.875-1.875 8 8-8 8z';
  const leftChevron = 'M20.563 22.104l-1.875 1.875-8-8 8-8 1.875 1.875-6.125 6.125z';

  return (
    <div className={`selia-reels ${className}`.trim()} data-layout={layout}>
      {title || subtitle || reel ? (
        <div className="selia-reels__head">
          <div className="selia-reels__heading">
            {title ? <h2 className="selia-reels__title">{title}</h2> : null}
            {subtitle ? <p className="selia-reels__subtitle">{subtitle}</p> : null}
          </div>
          {reel ? (
            <div className="selia-reels__nav">
              <button
                type="button"
                className="selia-reels__arrow"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 0}
                aria-label={t('blocks.home.reviews_prev', 'السابق')}
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d={isRTL ? rightChevron : leftChevron} />
                </svg>
              </button>
              <button
                type="button"
                className="selia-reels__arrow"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pages - 1}
                aria-label={t('blocks.home.reviews_next', 'التالي')}
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d={isRTL ? leftChevron : rightChevron} />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="selia-vproducts"
        data-reel={reel ? '1' : '0'}
        ref={trackRef}
        onScroll={reel ? readPage : undefined}
        role={reel ? 'region' : undefined}
        aria-roledescription={reel ? 'carousel' : undefined}
        aria-label={reel ? label : undefined}
      >
        {entries.map((entry, index) => {
          const item = catalogue.get(entry.productId);
          // Render from the row's own data when the catalogue is missing but the
          // row still carries something to show (a video or a chosen product).
          const preview = !item && (entry.video || entry.productId);
          if (item || preview) {
            return (
              <SeliaProductVideoCard
                key={`${entry.productId}-${index}`}
                product={item ?? syntheticProduct(entry)}
                video={entry.video}
                autoplay={autoplay}
                index={index}
                showProduct={showProduct}
              />
            );
          }
          if (isLoading) {
            return <div className="selia-vproducts__waiting" key={`waiting-${index}`} aria-hidden="true" />;
          }
          return null;
        })}
      </div>

      {reel ? (
        <div className="selia-reels__dots" role="tablist" aria-label={label}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              type="button"
              role="tab"
              className="selia-reels__dot"
              data-active={i === page ? 'true' : 'false'}
              aria-selected={i === page}
              aria-label={`${label} ${i + 1}`}
              onClick={() => goToPage(i)}
              key={i}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
