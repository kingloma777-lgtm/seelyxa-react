import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ProductImage } from '@salla.sa/twilight-theme-engine/types';

/**
 * The card's image gallery: every photo the product has, swipeable, with the
 * dots the reference design puts between the picture and the name.
 *
 * Two portals, because neither host is ours:
 *
 * - the **track** goes inside the engine's image `<a>`, absolutely covering the
 *   single picture it renders. Keeping it inside the anchor is what keeps the
 *   picture clickable — a sibling track would leave a dead rectangle where the
 *   product photo is. The engine's own `<img>` is hidden (not removed) so the
 *   same photo is not decoded and announced twice.
 * - the **dots** go into `.s-product-card-content`, which the stylesheet lays
 *   out as a grid with a `dots` row above the name.
 *
 * Swipe is native: `overflow-x: auto` + `scroll-snap-type: x mandatory` gives
 * touch dragging, momentum and snapping without a line of JavaScript. The only
 * script is (a) mapping scroll position to the active dot and (b) stopping a
 * drag from navigating — the track lives inside a link, so a swipe would
 * otherwise open the product page on release.
 */
export interface ProductCardGalleryProps {
  images: ProductImage[];
  name: string;
  /** The engine's image anchor — becomes the track's host. */
  anchor: HTMLElement;
  /** The engine's content column — becomes the dots' host. */
  content: HTMLElement | null;
}

export function ProductCardGallery({ images, name, anchor, content }: ProductCardGalleryProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  /* The engine's single picture sits under the track; hide it so the browser
     does not decode two copies and a screen reader does not announce the same
     product image twice. */
  useEffect(() => {
    const picture = anchor.firstElementChild as HTMLElement | null;
    if (!picture) return;
    const previous = picture.style.display;
    picture.style.display = 'none';
    return () => {
      picture.style.display = previous;
    };
  }, [anchor]);

  /* A drag inside a link fires a click on release. Track the pointer and eat
     that click — the swipe is the intent, not the navigation. */
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let dragged = false;

    const down = (event: PointerEvent) => {
      startX = event.clientX;
      startY = event.clientY;
      dragged = false;
    };
    const move = (event: PointerEvent) => {
      if (dragged) return;
      if (Math.abs(event.clientX - startX) > 8 || Math.abs(event.clientY - startY) > 8) dragged = true;
    };
    const click = (event: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      event.preventDefault();
      event.stopPropagation();
    };

    anchor.addEventListener('pointerdown', down);
    anchor.addEventListener('pointermove', move);
    anchor.addEventListener('click', click, true);
    return () => {
      anchor.removeEventListener('pointerdown', down);
      anchor.removeEventListener('pointermove', move);
      anchor.removeEventListener('click', click, true);
    };
  }, [anchor]);

  /* Scroll → active dot. Written once per frame at most, and only re-renders
     when the index actually changes (the dots are the only consumers). */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;

    const read = () => {
      frame = 0;
      const width = track.clientWidth || 1;
      /* RTL containers report a negative `scrollLeft` in Chromium and Firefox,
         a positive one in older WebKit — the absolute value covers both. */
      const next = Math.min(count - 1, Math.max(0, Math.round(Math.abs(track.scrollLeft) / width)));
      setIndex((previous) => (previous === next ? previous : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    read();
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  const goTo = useCallback((target: number) => {
    const slide = trackRef.current?.children[target] as HTMLElement | undefined;
    /* `scrollIntoView` rather than `scrollLeft`: it knows which way the
       container runs, so the same call works in Arabic and English. */
    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  /* Roving tabindex — one tab stop per card, arrows to move between photos.
     Twenty cards × four dots would otherwise be eighty extra stops. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + count) % count;
    goTo(next);
    const dots = dotsRef.current?.querySelectorAll<HTMLButtonElement>('.pc-dots__dot');
    dots?.[next]?.focus();
  };

  const label = (position: number) =>
    t('pages.products.card_image', 'الصورة {n} من {total}')
      .replace('{n}', String(position))
      .replace('{total}', String(count));

  return (
    <>
      {createPortal(
        <div className="pc-gallery" ref={trackRef}>
          {images.map((image, position) => (
            <div className="pc-gallery__slide" key={`${image.url}-${position}`}>
              <img
                src={image.url}
                alt={position === 0 ? (image.alt ?? name) : ''}
                loading={position === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>,
        anchor
      )}

      {count > 1 &&
        content &&
        createPortal(
          <div className="pc-dots" role="group" aria-label={name} ref={dotsRef} onKeyDown={onKeyDown}>
            {images.map((image, position) => (
              <button
                key={`dot-${image.url}-${position}`}
                type="button"
                className="pc-dots__dot"
                aria-label={label(position + 1)}
                aria-current={position === index ? 'true' : undefined}
                tabIndex={position === index ? 0 : -1}
                onClick={() => goTo(position)}
              />
            ))}
          </div>,
          content
        )}
    </>
  );
}
