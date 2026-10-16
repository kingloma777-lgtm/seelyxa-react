import {
  createElement,
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
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
 * Cinematic Hero — ported from the Twig theme (`seelyxa`,
 * `src/views/components/home/cinematic-hero.twig` + `cinematic-hero.scss` +
 * `partials/cinematic-hero.js`). Full-screen intro block: image / video / 3D
 * background, big headline, CTAs, entrance animation and a scroll indicator.
 * ------------------------------------------------------------------------ */

export interface CinematicHeroData {
  background_type?: unknown;
  bg_image?: unknown;
  bg_video_url?: unknown;
  bg_video_poster?: unknown;
  model_src?: unknown;
  model_poster?: unknown;
  model_auto_rotate?: boolean;
  overlay_opacity?: number | string;
  height_mode?: unknown;
  content_width?: unknown;
  content_position?: unknown;
  headline?: unknown;
  subtitle?: unknown;
  text_color?: string;
  show_ctas?: boolean;
  primary_label?: string;
  primary_url?: unknown;
  secondary_label?: string;
  secondary_url?: unknown;
  entrance_animation?: unknown;
  show_scroll_indicator?: boolean;
  under_header?: boolean;
  position?: number;
  [key: string]: unknown;
}

export interface CinematicHeroProps {
  data: CinematicHeroData;
}

export const CinematicHero = memo(function CinematicHero({ data }: CinematicHeroProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);

  const backgroundType = asSelection(data.background_type, 'image');
  const heightMode = asSelection(data.height_mode, 'full');
  const entrance = asSelection(data.entrance_animation, 'up');
  const contentWidth = asSelection(data.content_width, 'normal');
  const contentPosition = asSelection(data.content_position, 'center');
  const bg = asImage(data.bg_image);
  const videoPoster = asImage(data.bg_video_poster);
  const modelPoster = asImage(data.model_poster);
  const videoUrl = typeof data.bg_video_url === 'string' ? data.bg_video_url : '';
  const modelSrc = typeof data.model_src === 'string' ? data.model_src : '';
  const overlay = Number(data.overlay_opacity ?? 35) || 0;
  const primaryUrl = asVarUrl(data.primary_url);
  const secondaryUrl = asVarUrl(data.secondary_url);
  const hasContent =
    Boolean(
      (typeof data.headline === 'string' && data.headline) ||
        (typeof data.subtitle === 'string' && data.subtitle) ||
        (data.show_ctas && (primaryUrl || secondaryUrl))
    ) || Boolean(data.show_scroll_indicator);

  /* ---- entrance animation (runs client-only; SSR keeps content visible) ---- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-cinematic-reveal]'));
    if (!reveals.length || prefersReducedMotion()) return;

    // Hide only once JS owns the hero — mirrors the old `hero-cinematic-js`
    // gate, so a no-JS / pre-hydration render never hides the content.
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${80 * i}ms`;
    });
    root.classList.add('hero-cinematic-js');

    const start = () => requestAnimationFrame(() => root.classList.add('is-animated'));
    const media = root.querySelector('.cinematic-hero__media');
    if (media && media.tagName === 'IMG' && !(media as HTMLImageElement).complete) {
      media.addEventListener('load', start, { once: true });
      const fallback = setTimeout(start, 1500); // cached images may never fire load
      return () => {
        clearTimeout(fallback);
        media.removeEventListener('load', start);
        root.classList.remove('hero-cinematic-js', 'is-animated');
      };
    }
    start();
    return () => root.classList.remove('hero-cinematic-js', 'is-animated');
  }, [data.entrance_animation, data.headline, data.subtitle, data.show_ctas, backgroundType]);

  /* ---- subtle background parallax, desktop + motion only ---- */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.innerWidth < 1024) return;
    const root = rootRef.current;
    const media = root?.querySelector('.cinematic-hero__media') as HTMLElement | null;
    if (!root || !media) return;

    const speed = 0.18;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = root.getBoundingClientRect();
        // p in [-1, 1], center-based — identical math to `seelyxa.scroll.watch`.
        const progress =
          (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const shift = progress * -speed * rect.height * 0.5;
        media.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.08)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      media.style.transform = '';
    };
  }, [backgroundType, data.bg_image, videoUrl, modelSrc]);

  /* ---- lazy-load <model-viewer> only when a 3D background is used ---- */
  useEffect(() => {
    if (backgroundType === '3d' && modelSrc) loadModelViewer();
  }, [backgroundType, modelSrc]);

  /* ---- scroll indicator → next block ---- */
  const scrollToNext = () => {
    const section = rootRef.current?.closest('section, main');
    const next = section?.nextElementSibling || document.body;
    next.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  /* ---- media ---- */
  let media: ReactNode;
  if (backgroundType === 'video' && videoUrl) {
    media = (
      <video
        className="cinematic-hero__media"
        autoPlay
        muted
        loop
        playsInline
        poster={videoPoster?.url}
        src={videoUrl}
      />
    );
  } else if (backgroundType === '3d' && modelSrc) {
    media = createElement(
      MV,
      modelViewerAttrs({
        className: 'cinematic-hero__media',
        src: modelSrc,
        poster: modelPoster?.url,
        autoRotate: Boolean(data.model_auto_rotate),
        cameraControls: true,
      })
    );
  } else if (bg?.url) {
    media = (
      <Image
        src={bg.url}
        srcSet={bg.small_url ? `${bg.small_url} 640w, ${bg.url} 1920w` : undefined}
        sizes={bg.small_url ? '100vw' : undefined}
        className="cinematic-hero__media"
        alt=""
        priority
        noWrapper
      />
    );
  } else {
    media = <div className="cinematic-hero__media cinematic-hero__media--placeholder" />;
  }

  if (!hasContent && !bg?.url && !videoUrl && !modelSrc) return null;

  const style: CSSProperties = {
    '--hero-overlay': overlay,
    '--hero-text-color': (typeof data.text_color === 'string' && data.text_color) || '#ffffff',
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      data-testid="store-home-cinematic-hero"
      className={`cinematic-hero hero--${heightMode} hero--${entrance}`}
      style={style}
    >
      {media}

      <div className="cinematic-hero__overlay" />

      <div
        className={`cinematic-hero__content cinematic-hero__width--${contentWidth} cinematic-hero__align--${contentPosition}`}
      >
        {typeof data.headline === 'string' && data.headline ? (
          <h1 className="cinematic-hero__title" data-cinematic-reveal>
            {data.headline}
          </h1>
        ) : null}
        {typeof data.subtitle === 'string' && data.subtitle ? (
          <p className="cinematic-hero__subtitle" data-cinematic-reveal>
            {data.subtitle}
          </p>
        ) : null}

        {data.show_ctas ? (
          <div className="cinematic-hero__actions" data-cinematic-reveal>
            {data.primary_label && primaryUrl ? (
              <Link to={primaryUrl} className="hero-btn hero-btn--primary">
                {data.primary_label}
              </Link>
            ) : null}
            {data.secondary_label && secondaryUrl ? (
              <Link to={secondaryUrl} className="hero-btn hero-btn--ghost">
                {data.secondary_label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {data.show_scroll_indicator && heightMode !== 'auto' ? (
        <button
          type="button"
          className="cinematic-hero__scroll"
          data-cinematic-scroll
          onClick={scrollToNext}
          aria-label={t('blocks.home.hero_scroll', 'مرر للأسفل')}
        >
          <span className="cinematic-hero__mouse">
            <span className="cinematic-hero__wheel" />
          </span>
        </button>
      ) : null}
    </div>
  );
});
