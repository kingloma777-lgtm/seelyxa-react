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
 * Split Scene — ported from the Twig theme (`seelyxa`,
 * `src/views/components/home/split-scene.twig` + `split-scene.scss` +
 * `partials/split-scene.js`). Storytelling text + media (image / video / 3D)
 * side by side, direction-aware media placement.
 * ------------------------------------------------------------------------ */

export interface SplitSceneData {
  media_type?: unknown;
  media_image?: unknown;
  media_video_url?: unknown;
  media_video_poster?: unknown;
  model_src?: unknown;
  model_poster?: unknown;
  model_auto_rotate?: boolean;
  media_position?: unknown;
  media_rounded?: boolean;
  kicker?: unknown;
  headline?: unknown;
  subtitle?: unknown;
  text_color?: string;
  link_label?: unknown;
  link_url?: unknown;
  second_label?: unknown;
  second_url?: unknown;
  reveal_animation?: unknown;
  under_header?: boolean;
  position?: number;
  [key: string]: unknown;
}

export interface SplitSceneProps {
  data: SplitSceneData;
}

export const SplitScene = memo(function SplitScene({ data }: SplitSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const mediaType = asSelection(data.media_type, 'image');
  const reveal = asSelection(data.reveal_animation, 'fade-up');
  const mediaImage = asImage(data.media_image);
  const videoPoster = asImage(data.media_video_poster);
  const modelPoster = asImage(data.model_poster);
  const videoUrl = typeof data.media_video_url === 'string' ? data.media_video_url : '';
  const modelSrc = typeof data.model_src === 'string' ? data.model_src : '';
  const linkUrl = asVarUrl(data.link_url);
  const secondUrl = asVarUrl(data.second_url);
  const linkLabel = typeof data.link_label === 'string' ? data.link_label : '';
  const secondLabel = typeof data.second_label === 'string' ? data.second_label : '';

  const hasMedia =
    (mediaType === 'video' && Boolean(videoUrl)) ||
    (mediaType === '3d' && Boolean(modelSrc)) ||
    (mediaType === 'image' && Boolean(mediaImage?.url));
  const hasContent =
    Boolean(
      (typeof data.kicker === 'string' && data.kicker) ||
        (typeof data.headline === 'string' && data.headline) ||
        (typeof data.subtitle === 'string' && data.subtitle) ||
        (linkLabel && linkUrl) ||
        (secondLabel && secondUrl)
    );

  /* ---- one-shot scroll reveal (IO; content stays visible without JS/reduced) ---- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reveal === 'none' || prefersReducedMotion()) return;

    root.classList.add('split-scene--js');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          root.classList.add('is-in-view');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      root.classList.remove('split-scene--js', 'is-in-view');
    };
  }, [reveal]);

  /* ---- lazy-load <model-viewer> only when a 3D media is used ---- */
  useEffect(() => {
    if (mediaType === '3d' && modelSrc) loadModelViewer();
  }, [mediaType, modelSrc]);

  /* ---- media ---- */
  let media: ReactNode;
  if (mediaType === 'video' && videoUrl) {
    media = (
      <video
        className="split-scene__video"
        autoPlay
        muted
        loop
        playsInline
        poster={videoPoster?.url}
        src={videoUrl}
      />
    );
  } else if (mediaType === '3d' && modelSrc) {
    media = createElement(
      MV,
      modelViewerAttrs({
        className: 'split-scene__model',
        src: modelSrc,
        poster: modelPoster?.url,
        autoRotate: Boolean(data.model_auto_rotate),
        cameraControls: true,
      })
    );
  } else if (mediaImage?.url) {
    media = (
      <Image
        src={mediaImage.url}
        srcSet={
          mediaImage.small_url
            ? `${mediaImage.small_url} 640w, ${mediaImage.url} 1600w`
            : undefined
        }
        sizes={mediaImage.small_url ? '(min-width: 768px) 50vw, 100vw' : undefined}
        className="split-scene__img"
        alt=""
        noWrapper
      />
    );
  } else {
    media = <div className="split-scene__img" />;
  }

  if (!hasMedia && !hasContent) return null;

  const style: CSSProperties = {
    '--split-text-color': (typeof data.text_color === 'string' && data.text_color) || '#1f1f1f',
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      data-testid="store-home-split-scene"
      data-reveal={reveal}
      className={`split-scene split--media-${asSelection(data.media_position, 'right')}`}
      style={style}
    >
      <div className="container split-scene__grid">
        <div className="split-scene__media" data-split-reveal>
          {media}
        </div>

        <div className="split-scene__content">
          {typeof data.kicker === 'string' && data.kicker ? (
            <p className="split-scene__kicker">{data.kicker}</p>
          ) : null}
          {typeof data.headline === 'string' && data.headline ? (
            <h2 className="split-scene__title">{data.headline}</h2>
          ) : null}
          {typeof data.subtitle === 'string' && data.subtitle ? (
            <p className="split-scene__text">{data.subtitle}</p>
          ) : null}

          {(linkLabel && linkUrl) || (secondLabel && secondUrl) ? (
            <div className="split-scene__actions">
              {linkLabel && linkUrl ? (
                <Link to={linkUrl} className="hero-btn hero-btn--primary">
                  {linkLabel}
                </Link>
              ) : null}
              {secondLabel && secondUrl ? (
                <Link to={secondUrl} className="hero-btn hero-btn--ghost">
                  {secondLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});
