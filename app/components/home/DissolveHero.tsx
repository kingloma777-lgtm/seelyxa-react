import { useMemo, useRef, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readText,
  readBoolean,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface DissolveHeroProps {
  data: BlockData;
}

const DEFAULT_TITLE = 'SECOND SKIN';
const DEFAULT_STATEMENT =
  'A study in contrast, texture and the quiet confidence of something made to be lived in.';
const DEFAULT_ABOUT =
  'A small studio working between image, object and atmosphere. We build visual worlds that feel tactile before they are understood.';

/**
 * Full-height editorial hero with a scroll-scrubbed dissolve veil. The original
 * reference used a WebGL fBm shader; this Salla block reproduces the same
 * organic edge with layered CSS masks so it ships without a renderer and stays
 * readable in SSR.
 */
export function DissolveHero({ data }: DissolveHeroProps) {
  const root = useRef<HTMLElement | null>(null);
  useScrollProgress(root);

  const image = readText(data, 'image', 'dissolve_hero', '/reference/second-skin-wall.jpg');
  const eyebrow = readText(data, 'eyebrow', 'dissolve_hero', 'FORM / FUNCTION / FEELING');
  const title = readText(data, 'title', 'dissolve_hero', DEFAULT_TITLE);
  const intro = readText(
    data,
    'intro',
    'dissolve_hero',
    'An independent studio shaping quiet objects for loud lives.'
  );
  const statement = readText(data, 'statement', 'dissolve_hero', DEFAULT_STATEMENT);
  const aboutEyebrow = readText(data, 'about_eyebrow', 'dissolve_hero', 'THE STUDIO');
  const aboutText = readText(data, 'about_text', 'dissolve_hero', DEFAULT_ABOUT);
  const aboutMeta = readText(
    data,
    'about_meta',
    'dissolve_hero',
    'EST. 2018 — MILAN / RIYADH'
  );
  const ctaText = readText(data, 'cta_text', 'dissolve_hero', 'Enter the studio');
  const ctaLink = readText(data, 'cta_link', 'dissolve_hero', '#about');
  const background = readText(data, 'background_color', 'dissolve_hero', '#141414');
  const accent = readText(data, 'accent_color', 'dissolve_hero', '#f04e23');
  const showAbout = readBoolean(data, 'show_about', 'dissolve_hero', true);
  const words = useMemo(() => statement.split(/\s+/).filter(Boolean), [statement]);

  return (
    <section
      ref={root}
      className="dissolve-hero"
      style={
        {
          '--dh-bg': background,
          '--dh-accent': accent,
          '--dh-image': `url("${image.replace(/"/g, '%22')}")`,
        } as CSSProperties
      }
      aria-labelledby="dissolve-hero-title"
    >
      <div className="dissolve-hero__sticky">
        <div className="dissolve-hero__photo" role="img" aria-label={title} />
        <div className="dissolve-hero__grade" aria-hidden />
        <div className="dissolve-hero__veil" aria-hidden>
          <span />
        </div>
        <div className="dissolve-hero__grain" aria-hidden />

        <header className="dissolve-hero__header">
          <p className="dissolve-hero__eyebrow">{eyebrow}</p>
          <h2 id="dissolve-hero-title">{title}</h2>
          <p className="dissolve-hero__intro">{intro}</p>
        </header>

        <div className="dissolve-hero__content">
          <span className="dissolve-hero__mark" aria-hidden>
            ✦
          </span>
          <p className="dissolve-hero__statement" aria-label={statement}>
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                style={{ '--word-index': index, '--word-total': words.length } as CSSProperties}
              >
                {word}{' '}
              </span>
            ))}
          </p>
          <Link to={ctaLink || '#'} className="dissolve-hero__cta">
            {ctaText} <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>

      {showAbout ? (
        <div className="dissolve-hero__about" id="about">
          <div>
            <p className="dissolve-hero__about-eyebrow">{aboutEyebrow}</p>
            <span className="dissolve-hero__rule" aria-hidden />
          </div>
          <p className="dissolve-hero__about-copy">{aboutText}</p>
          <p className="dissolve-hero__about-meta">{aboutMeta}</p>
        </div>
      ) : null}
    </section>
  );
}
