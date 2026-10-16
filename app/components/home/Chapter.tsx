import { createElement, memo, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import {
  asImage,
  asSelection,
  asVarUrl,
  loadModelViewer,
  modelViewerAttrs,
  MV,
  prefersReducedMotion,
} from '../../lib/cinematicMedia';

/* --------------------------------------------------------------------------
 * Chapter — ported from the Twig theme (`seelyxa`,
 * `src/views/components/home/chapter.twig` + `chapter.scss` +
 * `partials/chapter.js`). Full-bleed scene divider: parallax bg, scene
 * heights, chapter label, one-shot reveal.
 * ------------------------------------------------------------------------ */

export interface ChapterData {
  bg_type?: unknown;
  bg_image?: unknown;
  bg_video_url?: unknown;
  bg_video_poster?: unknown;
  model_src?: unknown;
  model_poster?: unknown;
  model_auto_rotate?: boolean;
  overlay_opacity?: number | string;
  height_mode?: unknown;
  chapter_label?: unknown;
  headline?: unknown;
  subtitle?: unknown;
  content_align?: unknown;
  text_color?: string;
  show_ctas?: boolean;
  primary_label?: unknown;
  primary_url?: unknown;
  secondary_label?: unknown;
  secondary_url?: unknown;
  reveal_animation?: unknown;
  parallax?: boolean;
  under_header?: boolean;
  position?: number;
  [key: string]: unknown;
}

export interface ChapterProps {
  data: ChapterData;
}

export const Chapter = memo(function Chapter({ data }: ChapterProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const bgType = asSelection(data.bg_type, 'image');
  const heightMode = asSelection(data.height_mode, 'medium');
  const reveal = asSelection(data.reveal_animation, 'fade-up');
  const contentAlign = asSelection(data.content_align, 'center');
  const bg = asImage(data.bg_image);
  const videoPoster = asImage(data.bg_video_poster);
  const modelPoster = asImage(data.model_poster);
  const videoUrl = typeof data.bg_video_url === 'string' ? data.bg_video_url : '';
  const modelSrc = typeof data.model_src === 'string' ? data.model_src : '';
  const primaryUrl = asVarUrl(data.primary_url);
  const secondaryUrl = asVarUrl(data.secondary_url);
  const primaryLabel = typeof data.primary_label === 'string' ? data.primary_label : '';
  const secondaryLabel = typeof data.secondary_label === 'string' ? data.secondary_label : '';
  const overlay = Number(data.overlay_opacity ?? 45) || 0;
  const doParallax = Boolean(data.parallax);
  const showCtas = data.show_ctas !== false; // undefined ⇒ on, like the twig default

  const hasMedia =
    (bgType === 'video' && Boolean(videoUrl)) ||
    (bgType === '3d' && Boolean(modelSrc)) ||
    (bgType === 'image' && Boolean(bg?.url));
  const hasContent =
    Boolean(
      (typeof data.chapter_label === 'string' && data.chapter_label) ||
        (typeof data.headline === 'string' && data.headline) ||
        (typeof data.subtitle === 'string' && data.subtitle) ||
        (showCtas && ((primaryLabel && primaryUrl) || (secondaryLabel && secondaryUrl)))
    );

  /* ---- reveal room + parallax. Sections/classes live on the inner root, so
     the old `.s-block--chapter.chapter--js` pairing becomes `.chapter--js`
     here; SSR / no-JS renders keep everything visible. ---- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = prefersReducedMotion();
    const doReveal = !reduced && reveal !== 'none';

    let observer: IntersectionObserver | undefined;
    if (doReveal) {
      root.classList.add('chapter--js');
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            root.classList.add('is-in-view');
            observer?.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(root);
    }

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const layer = root.querySelector('[data-chapter-parallax]');
        const img = layer?.querySelector('.chapter__img') as HTMLElement | null;
        if (!img) return;
        const height = root.getBoundingClientRect().height;
        // p in [-1, 1], center-based — the old `seelyxa.scroll.watch` math.
        const progress =
          (root.getBoundingClientRect().top + height / 2 - window.innerHeight / 2) /
          window.innerHeight;
        img.style.transform = `translate3d(0, ${(-progress * 0.12 * height).toFixed(1)}px, 0)`;
      });
    };
    if (!reduced && doParallax) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove('chapter--js', 'is-in-view');
    };
  }, [reveal, doParallax]);

  /* ---- lazy-load <model-viewer> only when a 3D bg is used ---- */
  useEffect(() => {
    if (bgType === '3d' && modelSrc) loadModelViewer();
  }, [bgType, modelSrc]);

  /* ---- media ---- */
  let media: ReactNode;
  if (bgType === 'video' && videoUrl) {
    media = (
      <video
        className="chapter__video"
        autoPlay
        muted
        loop
        playsInline
        poster={videoPoster?.url}
        src={videoUrl}
      />
    );
  } else if (bgType === '3d' && modelSrc) {
    media = createElement(
      MV,
      modelViewerAttrs({
        className: 'chapter__model',
        src: modelSrc,
        poster: modelPoster?.url,
        autoRotate: Boolean(data.model_auto_rotate),
        cameraControls: true,
      })
    );
  } else if (bg?.url) {
    media = (
      <div className="chapter__bg" data-chapter-parallax>
        <Image
          src={bg.url}
          srcSet={bg.small_url ? `${bg.small_url} 640w, ${bg.url} 1920w` : undefined}
          sizes={bg.small_url ? '100vw' : undefined}
          className="chapter__img"
          alt=""
          noWrapper
        />
      </div>
    );
  } else {
    media = <div className="chapter__bg" data-chapter-parallax />;
  }

  if (!hasMedia && !hasContent) return null;

  const style: CSSProperties = {
    '--chapter-text-color': (typeof data.text_color === 'string' && data.text_color) || '#ffffff',
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      data-testid="store-home-chapter"
      data-reveal={reveal}
      className={`chapter chapter--${heightMode} chapter--align-${contentAlign}${
        doParallax ? ' chapter--parallax' : ''
      }`}
      style={style}
    >
      <div className="chapter__media" data-chapter-media>
        {media}
      </div>

      <div className="chapter__overlay" style={{ opacity: overlay / 100 }} />

      <div className="chapter__container">
        <div className="chapter__content">
          {typeof data.chapter_label === 'string' && data.chapter_label ? (
            <p className="chapter__label" data-chapter-reveal>
              {data.chapter_label}
            </p>
          ) : null}
          {typeof data.headline === 'string' && data.headline ? (
            <h2 className="chapter__title" data-chapter-reveal>
              {data.headline}
            </h2>
          ) : null}
          {typeof data.subtitle === 'string' && data.subtitle ? (
            <p className="chapter__text" data-chapter-reveal>
              {data.subtitle}
            </p>
          ) : null}

          {showCtas && ((primaryLabel && primaryUrl) || (secondaryLabel && secondaryUrl)) ? (
            <div className="chapter__actions" data-chapter-reveal>
              {primaryLabel && primaryUrl ? (
                <Link to={primaryUrl} className="hero-btn hero-btn--primary">
                  {primaryLabel}
                </Link>
              ) : null}
              {secondaryLabel && secondaryUrl ? (
                <Link to={secondaryUrl} className="hero-btn hero-btn--ghost">
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});
