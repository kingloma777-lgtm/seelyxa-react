import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowImage,
  rowLink,
  rowText,
  prefersReducedMotion,
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

const DEFAULT_PRODUCT_IMAGE = '/reference/oryzo-product.jpg';

const DEFAULT_SECTIONS: StorySection[] = [
  {
    title: 'ISN’T JUST\nA COASTER.',
    text: 'Designed to lift, insulate, and grip in all the right ways. It makes the simplest moment feel considered.',
    image: DEFAULT_PRODUCT_IMAGE,
    ctaText: 'EXPLORE',
    ctaLink: '',
  },
  {
    title: 'BORN FROM\nTHE EARTH.',
    text: 'Every surface tells a story. The grain, the warmth under your fingertips, the quiet confidence of a material that has existed for millions of years.',
    image: DEFAULT_PRODUCT_IMAGE,
    ctaText: 'DETAILS',
    ctaLink: '',
  },
  {
    title: 'DESIGNED\nFOR THE\nRITUAL.',
    text: 'Not mass-produced. Not disposable. Each piece carries the memory of the oak it came from — and the hand that shaped it. Made to age with grace, not to be replaced.',
    image: DEFAULT_PRODUCT_IMAGE,
    ctaText: '',
    ctaLink: '',
  },
];

/**
 * Dark editorial product showcase (faithful port of the Oryzo reference):
 * museum-presentation layout — full-bleed walnut canvas, warm cream typography
 * at weight 500 uppercase, the accent ink reserved for credits. Photographic
 * hero, void-mode reveals with the object centered and copy flanking it,
 * dashed hairline dividers between sections, and a closing CTA.
 */
export function EditorialProductStory({ data }: EditorialProductStoryProps) {
  const root = useRef<HTMLElement | null>(null);
  useReveal(root);

  const heroImage = readText(data, 'hero_image', 'editorial_story', '/reference/oryzo-hero.jpg');
  const brand = readText(data, 'brand', 'editorial_story', 'ORYZO');
  const tagline = readText(data, 'tagline', 'editorial_story', 'MADE FOR MUGS, BUILT FOR TABLES.');
  const cardTitle = readText(data, 'hero_card_title', 'editorial_story', 'Designed by the studio’s award-winning team.');
  const cardText = readText(data, 'hero_card_text', 'editorial_story', 'Handcrafted from sustainable raw material. Each piece is precision-cut and heat-pressed.');
  const ctaEyebrow = readText(data, 'cta_eyebrow', 'editorial_story', 'BUILT BY');
  const ctaTitle = readText(data, 'cta_title', 'editorial_story', 'READY TO MAKE\nTHE SIMPLEST\nMOMENT\nCONSIDERED?');
  const ctaText = readText(data, 'cta_text', 'editorial_story', 'Order directly or through select design retailers worldwide.');
  const ctaLinkText = readText(data, 'cta_link_text', 'editorial_story', 'ORDER NOW');
  const ctaLink = readText(data, 'cta_link', 'editorial_story', '/');
  const footer = readText(data, 'footer_text', 'editorial_story', 'DESIGNED IN-HOUSE · MADE RESPONSIBLY');
  const background = readText(data, 'background_color', 'editorial_story', '#100904');
  const accent = readText(data, 'accent_color', 'editorial_story', '#dc5000');

  const sections = useMemo<StorySection[]>(() => {
    const rows = readRows(data, 'sections', 'editorial_story');
    if (!rows.length) return DEFAULT_SECTIONS;
    return rows.map((row, index) => ({
      title: rowText(row, 'title', 'editorial_story', `CHAPTER ${index + 1}`),
      text: rowText(row, 'text', 'editorial_story'),
      image: rowImage(row, 'image', 'editorial_story', DEFAULT_PRODUCT_IMAGE),
      ctaText: rowText(row, 'cta_text', 'editorial_story'),
      ctaLink: rowLink(row, 'cta_link', 'editorial_story'),
    }));
  }, [data]);

  /* Reference hero parallax: the photographic layer drifts down 120px while
     the hero scrolls away (scrubbed from scroll position, never time-based). */
  useEffect(() => {
    const scope = root.current;
    const heroImg = scope?.querySelector<HTMLElement>('.editorial-story__hero img');
    if (!scope || !heroImg || prefersReducedMotion()) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = heroImg.parentElement;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const distance = Math.max(1, rect.height + window.innerHeight);
      const progress = Math.min(Math.max(-rect.top / distance, 0), 1);
      heroImg.style.transform = `translateY(${(progress * 120).toFixed(2)}px)`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [heroImage]);

  const jump = (target: string) => {
    root.current
      ?.querySelector(`[data-nav="${target}"]`)
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={root}
      className="editorial-story"
      style={{ '--es-bg': background, '--es-accent': accent } as CSSProperties}
      aria-labelledby="editorial-story-title"
    >
      <nav className="editorial-story__nav">
        <span className="editorial-story__nav-logo">{brand}</span>
        <div className="editorial-story__nav-links">
          <button type="button" className="is-active" onClick={() => jump('story')}>
            INTRO
          </button>
          <button type="button" onClick={() => jump('objects')}>
            FEATURES
          </button>
          <button type="button" onClick={() => jump('contact')}>
            CONTACT
          </button>
        </div>
      </nav>

      <div className="editorial-story__sidebar" aria-hidden>
        {brand} 1-MODEL
      </div>

      <header className="editorial-story__hero" data-nav="story">
        <img src={heroImage} alt={brand} loading="eager" />
        <div className="editorial-story__hero-grad" aria-hidden />

        <div className="editorial-story__brand" data-reveal>
          <p className="editorial-story__tag">{tagline}</p>
          <h2 id="editorial-story-title">{brand}</h2>
        </div>

        <aside className="editorial-story__card" data-reveal>
          <h3>{cardTitle}</h3>
          <hr className="editorial-story__rule" />
          <p>{cardText}</p>
        </aside>

        <div className="editorial-story__video-thumb" data-reveal aria-hidden>
          <span>{brand}</span>
          <div className="editorial-story__video-play" />
        </div>
      </header>

      <hr className="editorial-story__divider" data-reveal />

      {sections.map((section, index) => (
        <article
          key={`${section.title}-${index}`}
          className={`editorial-story__chapter${index % 2 ? ' is-mirrored' : ''}`}
          data-nav={index === 0 ? 'objects' : undefined}
        >
          <div className="editorial-story__chapter-head" data-reveal>
            <h3>{section.title}</h3>
          </div>
          <div className={`editorial-story__object${index === 1 && section.image === DEFAULT_PRODUCT_IMAGE ? ' is-tilted' : index === 2 && section.image === DEFAULT_PRODUCT_IMAGE ? ' is-lifted' : ''}`}>
            <img
              src={section.image}
              alt={section.title}
              loading={index === 0 ? 'eager' : 'lazy'}
              data-reveal
            />
          </div>
          <div className="editorial-story__chapter-body" data-reveal>
            <p>{section.text}</p>
            {section.ctaText ? (
              <Link
                to={section.ctaLink || '/'}
                className="editorial-story__btn-filled"
              >
                {section.ctaText}
              </Link>
            ) : null}
            {sections[index + 1] && section.ctaText ? (
              <Link
                to={sections[index + 1].ctaLink || '/'}
                className="editorial-story__btn-ghost"
              >
                {sections[index + 1].ctaText || 'DETAILS'}
              </Link>
            ) : (
              <span className="editorial-story__btn-ghost">{`${String(index + 1).padStart(2, '0')} · ${brand}`}</span>
            )}
          </div>
        </article>
      ))}

      <hr className="editorial-story__divider" data-reveal />

      <div className="editorial-story__cta" id="editorial-story-contact" data-nav="contact">
        <div data-reveal>
          <p className="editorial-story__tag" style={{ marginBottom: 14 }}>
            {ctaEyebrow}
          </p>
          <h3 className="editorial-story__cta-title">{ctaTitle}</h3>
        </div>
        <p className="editorial-story__cta-body" data-reveal>
          {ctaText}
        </p>
        <div data-reveal>
          <Link to={ctaLink || '/'} className="editorial-story__btn-filled">
            {ctaLinkText}
          </Link>
          <button
            type="button"
            className="editorial-story__btn-ghost"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            CONTACT
          </button>
        </div>
      </div>

      <footer className="editorial-story__footer" data-reveal>
        <span className="editorial-story__footer-legal">{footer}</span>
        <span className="editorial-story__footer-legal">
          © {new Date().getFullYear()} {brand}. ALL RIGHTS RESERVED.
        </span>
      </footer>
    </section>
  );
}
