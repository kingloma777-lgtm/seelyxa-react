import { useMemo, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Figurines } from './Figurines';
import { DissolveHero } from './DissolveHero';
import { ArcProductGallery } from './ArcProductGallery';
import { StampJourney } from './StampJourney';
import {
  readBoolean,
  readText,
  type BlockData,
} from '../../lib/homeBlock';

export interface CompositeLandingProps {
  data: BlockData;
}

const FIGURINE_FALLBACK = {
  figurines: [
    {
      image: 'https://r2.motionsites.dev/motionsites/assets/6f8e47d0bc29.png',
      title: 'Form 01',
      subtitle: 'The first figure in the series.',
      color: '#F4845F',
    },
    {
      image: 'https://r2.motionsites.dev/motionsites/assets/15f4a07508d3.png',
      title: 'Form 02',
      subtitle: 'A study in balance and weight.',
      color: '#6BBF7A',
    },
    {
      image: 'https://r2.motionsites.dev/motionsites/assets/fda59aca3206.png',
      title: 'Form 03',
      subtitle: 'Soft geometry, held in light.',
      color: '#E882B4',
    },
    {
      image: 'https://r2.motionsites.dev/motionsites/assets/fa5b2ecfdedf.png',
      title: 'Form 04',
      subtitle: 'The final piece in the first edition.',
      color: '#6EB5FF',
    },
  ],
  ghost_text: 'OBJECTS',
  store_label: 'SEELYXA',
  cta_text: 'Discover the collection',
  auto_cutout: false,
};

/**
 * A composed landing made from four independently installable blocks. The
 * assembly deliberately scopes every scene and never owns document scrolling,
 * so merchants can still place other blocks above or below it.
 */
export function CompositeLanding({ data }: CompositeLandingProps) {
  const brand = readText(data, 'brand', 'composite', 'SEELYXA / COMPOSITE');
  const manifestoEyebrow = readText(data, 'manifesto_eyebrow', 'composite', 'MANIFESTO / 01');
  const manifestoTitle = readText(
    data,
    'manifesto_title',
    'composite',
    'A store is a sequence of feelings.'
  );
  const manifestoText = readText(
    data,
    'manifesto_text',
    'composite',
    'Four scenes, one continuous atmosphere. Each block can stand alone; together they form a single walk through the brand.'
  );
  const footerTitle = readText(
    data,
    'footer_title',
    'composite',
    'Begin with a single object.'
  );
  const footerText = readText(
    data,
    'footer_text',
    'composite',
    'The collection is released in small editions, made to be lived with.'
  );
  const ctaText = readText(data, 'cta_text', 'composite', 'Enter the store');
  const ctaLink = readText(data, 'cta_link', 'composite', '/');
  const background = readText(data, 'background_color', 'composite', '#141414');
  const accent = readText(data, 'accent_color', 'composite', '#f04e23');
  const showDissolve = readBoolean(data, 'show_dissolve', 'composite', true);
  const showGallery = readBoolean(data, 'show_gallery', 'composite', true);
  const showFigurines = readBoolean(data, 'show_figurines', 'composite', true);
  const showStamps = readBoolean(data, 'show_stamps', 'composite', true);

  const figurineData = useMemo(() => FIGURINE_FALLBACK, []);

  return (
    <section
      className="composite"
      style={{ '--cmp-bg': background, '--cmp-accent': accent } as CSSProperties}
      aria-label={brand}
    >
      <nav className="composite__nav">
        <span>{brand}</span>
        <div>
          {showDissolve ? <a href="#composite-hero">Hero</a> : null}
          {showGallery ? <a href="#composite-gallery">Gallery</a> : null}
          {showFigurines ? <a href="#composite-figures">Figures</a> : null}
          {showStamps ? <a href="#composite-story">Story</a> : null}
        </div>
      </nav>

      <div id="composite-hero">
        {showDissolve ? <DissolveHero data={{}} /> : null}
      </div>

      <div className="composite__band">
        <p>{manifestoEyebrow}</p>
        <h2>{manifestoTitle}</h2>
        <div>
          <p>{manifestoText}</p>
          <span>01 — HERO / 02 — GALLERY / 03 — FIGURES / 04 — STORY</span>
        </div>
      </div>

      <div id="composite-gallery">{showGallery ? <ArcProductGallery data={{}} /> : null}</div>

      <div id="composite-figures">{showFigurines ? <Figurines data={figurineData} /> : null}</div>

      <div id="composite-story">{showStamps ? <StampJourney data={{}} /> : null}</div>

      <div className="composite__footer">
        <p>COMPOSITE / END</p>
        <h2>{footerTitle}</h2>
        <p>{footerText}</p>
        <Link to={ctaLink || '/'} className="composite__cta">
          {ctaText} <span aria-hidden>↗</span>
        </Link>
        <span className="composite__credit">{brand}</span>
      </div>
    </section>
  );
}
