import { useId, useRef, type CSSProperties } from 'react';
import {
  readText,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface LensZoomSpotlightProps {
  data: BlockData;
}

/**
 * Pinned optical zoom: a hand-drawn mascot scales toward its glasses until the
 * two lenses become windows onto a merchant photograph.
 */
export function LensZoomSpotlight({ data }: LensZoomSpotlightProps) {
  const root = useRef<HTMLElement | null>(null);
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const leftLens = `lens-left-${id}`;
  const rightLens = `lens-right-${id}`;
  useScrollProgress(root);

  const intro = readText(data, 'intro_title', 'lens_zoom', 'LOOK CLOSER');
  const spotlight = readText(data, 'spotlight_title', 'lens_zoom', 'THE WORLD IN THE DETAIL');
  const outro = readText(data, 'outro_title', 'lens_zoom', 'EVERY FRAME IS A DOOR');
  const image = readText(data, 'lens_image', 'lens_zoom', '/reference/larevoltosa-lens.jpg');
  const background = readText(data, 'background_color', 'lens_zoom', '#252627');
  const accent = readText(data, 'accent_color', 'lens_zoom', '#eb5e55');
  const words = spotlight.split(/\s+/).filter(Boolean);

  return (
    <section
      ref={root}
      className="lens-zoom"
      style={{ '--lz-bg': background, '--lz-accent': accent } as CSSProperties}
      aria-labelledby="lens-zoom-title"
    >
      <div className="lens-zoom__intro">
        <p>{intro}</p>
        <span aria-hidden>↓</span>
      </div>

      <div className="lens-zoom__sticky">
        <svg
          className="lens-zoom__doodle"
          viewBox="0 0 500 500"
          role="img"
          aria-label={spotlight}
        >
          <defs>
            <clipPath id={leftLens}>
              <circle cx="181" cy="207" r="48" />
            </clipPath>
            <clipPath id={rightLens}>
              <circle cx="319" cy="207" r="48" />
            </clipPath>
          </defs>

          <g className="lens-zoom__face">
            <path d="M250 62c-78 0-130 56-130 142 0 106 55 220 130 220s130-114 130-220C380 118 328 62 250 62Z" />
            <path d="M157 165c20-35 54-54 93-54s73 19 93 54" />
            <path d="M185 290c17 24 39 37 65 37s48-13 65-37" />
            <path d="M247 222l-7 34 15 3" />
            <path d="M220 360c18 10 42 10 60 0" />
            <path d="M120 194c-30-8-51 3-62 25" />
            <path d="M380 194c30-8 51 3 62 25" />
            <path d="M138 133c9-30 26-49 51-62" />
            <path d="M362 133c-9-30-26-49-51-62" />
            <circle cx="181" cy="207" r="59" className="lens-zoom__rim" />
            <circle cx="319" cy="207" r="59" className="lens-zoom__rim" />
            <path d="M240 207c7-8 13-8 20 0" />
            <path d="M132 192c12-15 27-22 46-22" />
            <path d="M270 192c12-15 27-22 46-22" />
          </g>

          <g className="lens-zoom__photo" clipPath={`url(#${leftLens})`}>
            <image href={image} x="90" y="130" width="300" height="170" preserveAspectRatio="xMidYMid slice" />
          </g>
          <g className="lens-zoom__photo" clipPath={`url(#${rightLens})`}>
            <image href={image} x="200" y="130" width="300" height="170" preserveAspectRatio="xMidYMid slice" />
          </g>

          <g className="lens-zoom__glare" aria-hidden>
            <rect x="122" y="166" width="16" height="86" rx="8" />
            <rect x="260" y="166" width="16" height="86" rx="8" />
          </g>
        </svg>

        <div className="lens-zoom__content">
          <p className="lens-zoom__eyebrow">DETAIL / 01</p>
          <h2 id="lens-zoom-title">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                style={{ '--lz-word': index, '--lz-words': words.length } as CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
          </h2>
          <p className="lens-zoom__outro">{outro}</p>
        </div>
      </div>
    </section>
  );
}
