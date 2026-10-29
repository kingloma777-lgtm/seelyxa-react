import { useId, useMemo, useRef, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowImage,
  rowLink,
  rowText,
  useReveal,
  type BlockData,
} from '../../lib/homeBlock';

export interface EditorialProductStoryProps {
  data: BlockData;
}

interface StorySection {
  title: string;
  text: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

const DEFAULT_SECTIONS: StorySection[] = [
  {
    title: 'A quieter kind of luxury.',
    text: 'The silhouette is reduced to what matters: weight, warmth and the way a surface catches the afternoon. Nothing added for attention. Nothing removed for economy.',
    image: '/reference/oryzo-product.jpg',
    ctaText: 'Explore the finish',
    ctaLink: '/',
  },
  {
    title: 'Built around the hand.',
    text: 'Each piece is turned, sanded and finished in small batches. The variation you see is the record of that work — a fingerprint, not a flaw.',
    image: '/reference/oryzo-product.jpg',
    ctaText: 'See the process',
    ctaLink: '/',
  },
  {
    title: 'Made for the long table.',
    text: 'Designed to move from the shelf to the hand without ceremony. Objects that earn their place by being used, not protected.',
    image: '/reference/oryzo-product.jpg',
    ctaText: 'View the collection',
    ctaLink: '/',
  },
];

/**
 * Editorial product story: full-bleed photographic hero, alternating
 * object/copy reveals and a quiet closing call to action.
 */
export function EditorialProductStory({ data }: EditorialProductStoryProps) {
  const root = useRef<HTMLElement | null>(null);
  const rawId = useId();
  const base = `editorial-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  useReveal(root);

  const heroImage = readText(data, 'hero_image', 'editorial_story', '/reference/oryzo-hero.jpg');
  const brand = readText(data, 'brand', 'editorial_story', 'ORYZO');
  const tagline = readText(
    data,
    'tagline',
    'editorial_story',
    'Objects with a memory of the hand that made them.'
  );
  const cardTitle = readText(data, 'hero_card_title', 'editorial_story', 'The Walnut Series');
  const cardText = readText(
    data,
    'hero_card_text',
    'editorial_story',
    'Turned from a single block. Finished with oil, wax and time.'
  );
  const ctaEyebrow = readText(data, 'cta_eyebrow', 'editorial_story', 'COMMISSIONS / 2026');
  const ctaTitle = readText(
    data,
    'cta_title',
    'editorial_story',
    'Bring a piece of the studio into your home.'
  );
  const ctaText = readText(data, 'cta_text', 'editorial_story', 'The studio works in small runs, made to order.');
  const ctaLinkText = readText(data, 'cta_link_text', 'editorial_story', 'Start a conversation');
  const ctaLink = readText(data, 'cta_link', 'editorial_story', '/');
  const footer = readText(data, 'footer_text', 'editorial_story', 'ORYZO STUDIO — MILAN / RIYADH');
  const background = readText(data, 'background_color', 'editorial_story', '#100904');
  const accent = readText(data, 'accent_color', 'editorial_story', '#dc5000');

  const sections = useMemo<StorySection[]>(() => {
    const rows = readRows(data, 'sections', 'editorial_story');
    if (!rows.length) return DEFAULT_SECTIONS;
    return rows.map((row, index) => ({
      title: rowText(row, 'title', 'editorial_story', `Chapter ${index + 1}`),
      text: rowText(row, 'text', 'editorial_story'),
      image: rowImage(
        row,
        'image',
        'editorial_story',
        index % 2 ? '/reference/oryzo-product.jpg' : '/reference/oryzo-hero.jpg'
      ),
      ctaText: rowText(row, 'cta_text', 'editorial_story', 'Discover'),
      ctaLink: rowLink(row, 'cta_link', 'editorial_story'),
    }));
  }, [data]);

  return (
    <section
      ref={root}
      className="editorial-story"
      style={{ '--es-bg': background, '--es-accent': accent } as CSSProperties}
      aria-labelledby={`${base}-title`}
    >
      <div className="editorial-story__nav">
        <span>{brand}</span>
        <div>
          <a href={`#${base}-story`}>Story</a>
          <a href={`#${base}-objects`}>Objects</a>
          <a href={`#${base}-contact`}>Contact</a>
        </div>
      </div>

      <header className="editorial-story__hero">
        <img src={heroImage} alt="" loading="eager" />
        <div className="editorial-story__shade" aria-hidden />
        <p className="editorial-story__wordmark" aria-hidden>
          {brand}
        </p>
        <div className="editorial-story__hero-copy" data-reveal>
          <span>EST. 2018</span>
          <h2 id={`${base}-title`}>{tagline}</h2>
        </div>
        <aside className="editorial-story__card" data-reveal>
          <span>01 — MATERIAL</span>
          <h3>{cardTitle}</h3>
          <p>{cardText}</p>
        </aside>
      </header>

      <div className="editorial-story__divider" aria-hidden />

      <div className="editorial-story__chapters" id={`${base}-story`}>
        {sections.map((section, index) => (
          <article
            className={`editorial-story__chapter${index % 2 ? ' is-reversed' : ''}`}
            key={`${section.title}-${index}`}
            id={index === 0 ? `${base}-objects` : undefined}
          >
            <div className="editorial-story__chapter-copy" data-reveal>
              <span>{String(index + 1).padStart(2, '0')} / CHAPTER</span>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
              {section.ctaText ? (
                <Link to={section.ctaLink || '#'} className="editorial-story__text-link">
                  {section.ctaText} <span aria-hidden>↗</span>
                </Link>
              ) : null}
            </div>
            <div className="editorial-story__object" data-reveal>
              <img src={section.image} alt={section.title} loading="lazy" />
            </div>
          </article>
        ))}
      </div>

      <div className="editorial-story__divider" aria-hidden />

      <div className="editorial-story__cta" id={`${base}-contact`} data-reveal>
        <span>{ctaEyebrow}</span>
        <h3>{ctaTitle}</h3>
        <p>{ctaText}</p>
        <Link to={ctaLink || '/'} className="editorial-story__button">
          {ctaLinkText}
        </Link>
      </div>

      <footer className="editorial-story__footer">
        <span>{footer}</span>
        <span>© {new Date().getFullYear()} — ALL RIGHTS RESERVED</span>
      </footer>
    </section>
  );
}
