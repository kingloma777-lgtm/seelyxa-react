import { useEffect, useMemo, useRef, useState, type WheelEvent as ReactWheelEvent } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  readNumber,
  readRows,
  readText,
  rowImage,
  rowLink,
  rowText,
  prefersReducedMotion,
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

/* Reference constants (Objet / ArcCoverflow): slide box is 200×275 (3:4
   portrait), consecutive anchors sit 100px apart on the track, and a single
   per-frame lerp chases the scroll target. All arc math is hand-written. */
const SLIDE_WIDTH = 200;
const SLIDE_HEIGHT = 275;
const SLIDE_GAP = 100;
const SCROLL_LERP = 0.05;

/**
 * Infinite cosine-arc coverflow (faithful port of the ArcCoverflow reference).
 * Slides wrap modularly over the track so the row loops forever in both
 * directions; the nearest-center slide is biggest and lifted, the rest shrink
 * and sink along a raised-cosine arc. Wheel / drag / arrows feed a scroll
 * target that the lerp chases — positions are continuous, not stepped. The
 * caption title follows whichever slide is closest to center.
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
  /* Reference defaults: 200px arc drop, 100px center lift. */
  const arcDepth = Math.max(0, readNumber(data, 'arc_depth', 'arc_gallery', 200));
  const centerLift = Math.max(0, readNumber(data, 'center_lift', 'arc_gallery', 100));

  const stageRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const lastXRef = useRef<number | null>(null);
  const nudgeRef = useRef(0);

  const [active, setActive] = useState(() => Math.floor((slides.length - 1) / 2));
  const activeRef = useRef(active);
  activeRef.current = active;

  const trackWidth = slides.length * SLIDE_GAP;
  const slideElsRef = useRef<HTMLElement[]>([]);

  /* Reference arc-layout engine, expressed in stage-local coordinates. */
  const layout = (scrollOffset: number, slideEls: HTMLElement[]) => {
    const stage = stageRef.current;
    if (!stage) return;
    const centerX = stage.offsetWidth / 2;
    const baselineY = stage.offsetHeight * 0.4;
    const halfStageWidth = stage.offsetWidth * 0.5;
    slides.forEach((_, i) => {
      const slideEl = slideEls[i];
      if (!slideEl) return;
      let wrappedOffsetX = (((i * SLIDE_GAP - scrollOffset) % trackWidth) + trackWidth) % trackWidth;
      if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth;

      const dist = (centerX + wrappedOffsetX - centerX) / halfStageWidth;
      const absDist = Math.min(Math.abs(dist), 1.3);

      const scaleFactor = Math.max(1 - absDist * 0.8, 0.25);
      const scaledWidth = SLIDE_WIDTH * scaleFactor;
      const scaledHeight = SLIDE_HEIGHT * scaleFactor;

      const arcDropY = (1 - Math.cos(Math.min(absDist, 1) * Math.PI)) * 0.5 * arcDepth;
      const centerLiftY = Math.max(1 - absDist * 2, 0) * centerLift;

      slideEl.style.transform = `translate3d(${centerX + wrappedOffsetX - scaledWidth / 2}px, ${
        baselineY - scaledHeight / 2 + arcDropY - centerLiftY
      }px, 0)`;
      slideEl.style.width = `${scaledWidth}px`;
      slideEl.style.height = `${scaledHeight}px`;
      slideEl.style.zIndex = String(Math.round((1 - absDist) * 100));
    });
  };

  const closestIndex = (scrollOffset: number) => {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < slides.length; i += 1) {
      let wrappedOffsetX = (((i * SLIDE_GAP - scrollOffset) % trackWidth) + trackWidth) % trackWidth;
      if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth;
      const distance = Math.abs(wrappedOffsetX);
      if (distance < bestDist) {
        bestDist = distance;
        best = i;
      }
    }
    return best;
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const slideEls = Array.from(stage.querySelectorAll<HTMLElement>('[data-index]'));
    slideElsRef.current = slideEls;

    const reduced = prefersReducedMotion();
    const paint = (scrollOffset: number) => {
      layout(scrollOffset, slideEls);
      if (!nudgeRef.current) {
        const closest = closestIndex(scrollOffset);
        if (closest !== activeRef.current) setActive(closest);
      }
    };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const lerp = reduced ? 1 : SCROLL_LERP;
      currentRef.current += (targetRef.current - currentRef.current) * lerp;
      if (nudgeRef.current && Math.abs(targetRef.current - currentRef.current) < 0.5) {
        nudgeRef.current = 0;
      }
      paint(currentRef.current);
    };
    paint(currentRef.current);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, arcDepth, centerLift]);

  if (!slides.length) return null;
  const current = slides[active] ?? slides[0];

  /* Slide i is centered when its anchor aligns with the scroll offset. */
  const centerOn = (index: number) => {
    let wrappedOffsetX = (((index * SLIDE_GAP - currentRef.current) % trackWidth) + trackWidth) % trackWidth;
    if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth;
    targetRef.current = currentRef.current + wrappedOffsetX;
    nudgeRef.current = 1;
    setActive(index);
  };


  const go = (direction: number) => {
    targetRef.current += direction * SLIDE_GAP;
    nudgeRef.current = 1;
    setActive((activeSlide) => (activeSlide + direction + slides.length) % slides.length);
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    /* Reference behaviour: the wheel turns the collection instead of scrolling
       the page — but only while the block actually fills the viewport, so a
       partially-seen block never traps page scrolling. */
    const rect = stage.getBoundingClientRect();
    if (rect.top < -8 || rect.bottom < window.innerHeight - 8) return;
    event.preventDefault();
    targetRef.current += (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * 0.5;
    nudgeRef.current = 0;
  };

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
        <span className="arc-gallery__brand">{brand}</span>
        <p className="arc-gallery__note">{note}</p>
      </header>

      <div
        ref={stageRef}
        className="arc-gallery__stage"
        onWheel={onWheel}
        onPointerDown={(event) => {
          lastXRef.current = event.clientX;
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          const lastX = lastXRef.current;
          if (lastX === null) return;
          targetRef.current += (lastX - event.clientX) * 1.2;
          lastXRef.current = event.clientX;
          nudgeRef.current = 0;
        }}
        onPointerUp={() => (lastXRef.current = null)}
        onPointerCancel={() => (lastXRef.current = null)}
      >
        {slides.map((slide, index) => (
          <button
            key={`${slide.image}:${index}`}
            type="button"
            data-index={index}
            className="arc-gallery__slide"
            aria-label={slide.title || `${index + 1}`}
            aria-current={index === active}
            onClick={() => centerOn(index)}
          >
            <img src={slide.image} alt={slide.alt} draggable={false} loading={index < 3 ? 'eager' : 'lazy'} />
          </button>
        ))}

        <footer className="arc-gallery__caption">
          <div className="arc-gallery__eyebrow">
            <span aria-hidden />
            <p>{eyebrow}</p>
            <span aria-hidden />
          </div>
          <div className="arc-gallery__title-row">
            <button type="button" aria-label={t('blocks.home.reviews_prev', 'Previous')} onClick={() => go(-1)}>
              ←
            </button>
            <h2>{current.title}</h2>
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
      </div>
    </section>
  );
}
