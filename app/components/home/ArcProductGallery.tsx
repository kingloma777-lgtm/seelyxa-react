import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  readNumber,
  readRows,
  readText,
  rowImage,
  rowLink,
  rowText,
  type BlockData,
} from '../../lib/homeBlock';

export interface ArcProductGalleryProps {
  data: BlockData;
}

interface Slide {
  image: string;
  title: string;
  alt: string;
  url: string;
}

const DEFAULT_SLIDES: Slide[] = [
  ['Vessel 01', 'https://motionprompts.dev/c/voku-image-slider/img1.jpg'],
  ['Vessel 02', 'https://motionprompts.dev/c/voku-image-slider/img2.jpg'],
  ['Vessel 03', 'https://motionprompts.dev/c/voku-image-slider/img3.jpg'],
  ['Vessel 04', 'https://motionprompts.dev/c/voku-image-slider/img4.jpg'],
  ['Vessel 05', 'https://motionprompts.dev/c/voku-image-slider/img5.jpg'],
  ['Vessel 06', 'https://motionprompts.dev/c/voku-image-slider/img6.jpg'],
  ['Vessel 07', 'https://motionprompts.dev/c/voku-image-slider/img7.jpg'],
].map(([title, image]) => ({ title, image, alt: title, url: '' }));

const shortestDelta = (index: number, active: number, count: number) => {
  let delta = index - active;
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  return delta;
};

/**
 * Infinite coverflow gallery laid out on a raised-cosine arc. Wheel, drag,
 * arrows and keyboard move one shared active index; every visual property is
 * derived from the shortest wrap-around distance, so the row loops forever.
 */
export function ArcProductGallery({ data }: ArcProductGalleryProps) {
  const { t } = useTranslation();
  const rows = readRows(data, 'items', 'arc_gallery');
  const slides = useMemo<Slide[]>(
    () =>
      rows.length
        ? rows
            .map((row) => {
              const image = rowImage(row, 'image', 'arc_gallery');
              const title = rowText(row, 'title', 'arc_gallery');
              return {
                image,
                title,
                alt: rowText(row, 'alt', 'arc_gallery', title),
                url: rowLink(row, 'url', 'arc_gallery'),
              };
            })
            .filter((slide) => slide.image)
        : DEFAULT_SLIDES,
    [rows]
  );

  const brand = readText(data, 'brand', 'arc_gallery', 'ATELIER / N° 09');
  const note = readText(data, 'note', 'arc_gallery', 'Objects in orbit — autumn edition');
  const eyebrow = readText(data, 'eyebrow', 'arc_gallery', 'THE COLLECTION');
  const hint = readText(data, 'hint', 'arc_gallery', 'Scroll, drag or use ← →');
  const arcDepth = Math.max(0, readNumber(data, 'arc_depth', 'arc_gallery', 190));
  const centerLift = Math.max(0, readNumber(data, 'center_lift', 'arc_gallery', 90));

  const [active, setActive] = useState(() => Math.floor((slides.length - 1) / 2));
  const pointer = useRef<{ x: number; active: number } | null>(null);

  const go = useCallback(
    (direction: number) => {
      setActive((current) => (current + direction + slides.length) % slides.length);
    },
    [slides.length]
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, active };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start) return;
    const distance = event.clientX - start.x;
    if (Math.abs(distance) > 42) {
      go(distance > 0 ? -1 : 1);
    }
  };

  if (!slides.length) return null;
  const current = slides[active] ?? slides[0];

  return (
    <section
      className="arc-gallery"
      aria-roledescription="carousel"
      aria-label={t('blocks.home.gallery', 'Product gallery')}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') go(-1);
        if (event.key === 'ArrowRight') go(1);
      }}
    >
      <header className="arc-gallery__masthead">
        <span>{brand}</span>
        <span>{note}</span>
      </header>

      <div
        className="arc-gallery__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointer.current = null)}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 16) {
            go(event.deltaX > 0 ? 1 : -1);
          }
        }}
      >
        {slides.map((slide, index) => {
          const delta = shortestDelta(index, active, slides.length);
          const distance = Math.abs(delta);
          const scale = Math.max(0.25, 1 - distance * 0.14);
          const y = (1 - Math.cos(Math.min(distance, 3) * 0.62)) * arcDepth;
          const lift = distance === 0 ? -centerLift : 0;
          return (
            <button
              key={`${slide.image}:${index}`}
              type="button"
              className={`arc-gallery__slide${index === active ? ' is-active' : ''}`}
              style={
                {
                  '--arc-x': `${delta * 205}px`,
                  '--arc-y': `${y + lift}px`,
                  '--arc-scale': scale,
                  '--arc-rotate': `${delta * 4.5}deg`,
                  '--arc-z': 100 - distance,
                  '--arc-opacity': distance > 4 ? 0 : 1,
                } as CSSProperties
              }
              aria-label={slide.title || `${index + 1}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
            >
              <img src={slide.image} alt={slide.alt} draggable={false} loading={index < 3 ? 'eager' : 'lazy'} />
            </button>
          );
        })}
      </div>

      <footer className="arc-gallery__caption">
        <div className="arc-gallery__eyebrow">
          <span />
          <p>{eyebrow}</p>
          <span />
        </div>
        <div className="arc-gallery__title-row">
          <button type="button" aria-label={t('blocks.home.reviews_prev', 'Previous')} onClick={() => go(-1)}>
            ←
          </button>
          <h2 key={current.title}>{current.title}</h2>
          <button type="button" aria-label={t('blocks.home.reviews_next', 'Next')} onClick={() => go(1)}>
            →
          </button>
        </div>
        <p className="arc-gallery__hint">{hint}</p>
        {current.url ? (
          <Link className="arc-gallery__cta" to={current.url}>
            {t('blocks.home.view_product', 'View piece')} <span aria-hidden>↗</span>
          </Link>
        ) : null}
      </footer>
    </section>
  );
}
