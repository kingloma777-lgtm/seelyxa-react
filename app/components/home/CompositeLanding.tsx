import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
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
 * Composite — a landing page assembled from the theme's own home blocks
 * (faithful port of the reference document): the WebGL dissolve hero hands
 * off to a manifesto colophon with a dashed-hairline component index, the
 * arc gallery turns underneath, the figurine carousel and the pinned stamp
 * journal close the story, and a CTA footer in the hero's palette ends it.
 * A floating pill nav tracks the section under 40% of the viewport with a
 * per-frame rAF loop (guarded writes — React never re-renders for an
 * unchanged value), and the component index rows jump with direct anchors.
 * Every scene stays block-scoped, so merchants can place other blocks above
 * or below.
 */
export function CompositeLanding({ data }: CompositeLandingProps) {
  const { t } = useTranslation();
  const showDissolve = readBoolean(data, 'show_dissolve', 'composite', true);
  const showGallery = readBoolean(data, 'show_gallery', 'composite', true);
  const showFigurines = readBoolean(data, 'show_figurines', 'composite', true);
  const showStamps = readBoolean(data, 'show_stamps', 'composite', true);

  const brand = readText(data, 'brand', 'composite', 'SEELYXA / COMPOSITE');
  const manifestoEyebrow = readText(data, 'manifesto_eyebrow', 'composite', 'COMPOSITE · ASSEMBLED FROM THE LIBRARY');
  const manifestoTitle = readText(
    data,
    'manifesto_title',
    'composite',
    'Four scenes.\nOne continuous page.'
  );
  const manifestoText = readText(
    data,
    'manifesto_text',
    'composite',
    'This landing is not a new design — it is four existing blocks from this theme, stitched into a single scroll. The WebGL dissolve hero hands off to this colophon, the arc gallery turns underneath it, the figurine carousel crossfades, and the pinned stamp journal closes the story.'
  );
  const footerTitle = readText(
    data,
    'footer_title',
    'composite',
    'Build the next\nlanding from parts.'
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

  const figurineData = useMemo(() => FIGURINE_FALLBACK, []);

  /* Component index rows — renumbered to the scenes actually shown. */
  const sceneRows = [
    {
      href: 'composite-hero',
      stage: t('blocks.home.stage_hero', 'Hero'),
      component: 'Second Skin',
      effect: t('blocks.home.stage_hero_effect', 'WebGL fbm dissolve, scroll-scrubbed'),
      show: showDissolve,
    },
    {
      href: 'composite-gallery',
      stage: t('blocks.home.stage_gallery', 'Gallery'),
      component: 'ArcCoverflow',
      effect: t('blocks.home.stage_gallery_effect', 'Infinite cosine-arc coverflow'),
      show: showGallery,
    },
    {
      href: 'composite-figures',
      stage: t('blocks.home.stage_figures', 'Figures'),
      component: 'ToonHub',
      effect: t('blocks.home.stage_figures_effect', '650ms figurine crossfade'),
      show: showFigurines,
    },
    {
      href: 'composite-story',
      stage: t('blocks.home.stage_story', 'Story'),
      component: 'StampStory',
      effect: t('blocks.home.stage_story_effect', 'Pinned diagonal field-journal'),
      show: showStamps,
    },
  ];
  const indexRows = useMemo(
    () =>
      sceneRows
        .filter((row) => row.show)
        .map((row, index) => ({ ...row, n: String(index + 1).padStart(2, '0') })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showDissolve, showGallery, showFigurines, showStamps]
  );

  /* Nav sections — optional rows hide on small screens unless active. */
  const navSections = useMemo(
    () =>
      [
        { id: 'composite-manifesto', label: t('blocks.home.nav_manifesto', 'Manifesto'), optional: true, show: true },
        { id: 'composite-gallery', label: t('blocks.home.nav_gallery', 'Gallery'), optional: false, show: showGallery },
        { id: 'composite-figures', label: t('blocks.home.nav_figures', 'Figures'), optional: false, show: showFigurines },
        { id: 'composite-story', label: t('blocks.home.nav_story', 'Story'), optional: false, show: showStamps },
        { id: 'composite-contact', label: t('blocks.home.nav_contact', 'Contact'), optional: true, show: true },
      ].filter((section) => section.show),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showGallery, showFigurines, showStamps]
  );

  /* rAF active tracking (reference behaviour): the last section whose top is
     above 40% of the viewport wins; on the hero the Manifesto is active. */
  const [active, setActive] = useState('composite-manifesto');
  useEffect(() => {
    const ids = ['composite-hero', ...navSections.map((section) => section.id)];
    const fallback = navSections[0]?.id ?? 'composite-manifesto';
    let frame = 0;
    let lastActive = '';

    const update = () => {
      frame = window.requestAnimationFrame(update);
      let current = 'composite-hero';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = id;
      }
      const next = current === 'composite-hero' ? fallback : current;
      if (next !== lastActive) {
        lastActive = next;
        setActive(next);
      }
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [navSections]);

  /* Anchor jump — a direct scrollTo (reference behaviour). */
  const goTo = (id: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY });
  };

  const manifestoLines = manifestoTitle.split('\n');
  const footerLines = footerTitle.split('\n');

  return (
    <section
      className="composite"
      style={{ '--cmp-bg': background, '--cmp-accent': accent } as CSSProperties}
      aria-label={brand}
    >
      {/* Floating pill nav */}
      <nav className="composite__nav" aria-label="Composite landing">
        <a className="composite__brand" href="#composite-hero" onClick={goTo('composite-hero')}>
          {brand}
          <span className="composite__brand-dot" aria-hidden />
        </a>
        {navSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={goTo(section.id)}
            className={`composite__link${section.optional ? ' composite__link--opt' : ''}${
              active === section.id ? ' is-active' : ''
            }`}
          >
            {section.label}
          </a>
        ))}
      </nav>

      {/* 1 · HERO — dissolve (block-scoped) */}
      <div id="composite-hero">{showDissolve ? <DissolveHero data={{}} /> : null}</div>

      {/* 2 · MANIFESTO — glue band + component index */}
      <section className="composite__statement" id="composite-manifesto">
        <div className="composite__shell">
          <span className="composite__eyebrow">{manifestoEyebrow}</span>
          <h2 className="composite__display">
            {manifestoLines.map((line, index) =>
              index === 0 ? <span key={index}>{line}</span> : <br key={`br-${index}`} />
            )}
            {manifestoLines.slice(1).map((line, index) => (
              <span key={`line-${index}`}>{line}</span>
            ))}
          </h2>
          <p className="composite__lede">{manifestoText}</p>

          <ol className="composite__index">
            {indexRows.map((row) => (
              <li key={row.n}>
                <a href={`#${row.href}`} onClick={goTo(row.href)}>
                  <span className="composite__n">{row.n}</span>
                  <span className="composite__stage">{row.stage}</span>
                  <span className="composite__comp">{row.component}</span>
                  <span className="composite__fx">{row.effect}</span>
                </a>
              </li>
            ))}
          </ol>

          <p className="composite__meta">
            {t(
              'blocks.home.composite_meta_stack',
              'Stack · four home blocks · one continuous scroll'
            )}
          </p>
        </div>
      </section>

      {/* 3 · GALLERY */}
      <div id="composite-gallery">{showGallery ? <ArcProductGallery data={{}} /> : null}</div>

      {/* 4 · CAROUSEL */}
      <div id="composite-figures">{showFigurines ? <Figurines data={figurineData} /> : null}</div>

      {/* 5 · STORY */}
      <div id="composite-story">{showStamps ? <StampJourney data={{}} /> : null}</div>

      {/* 6 · CTA + FOOTER — glue band */}
      <footer className="composite__footer" id="composite-contact">
        <div className="composite__shell">
          <span className="composite__eyebrow">{t('blocks.home.composite_footer_eyebrow', 'The next one is yours')}</span>
          <h2 className="composite__display">
            {footerLines.map((line, index) =>
              index === 0 ? <span key={index}>{line}</span> : <br key={`br-${index}`} />
            )}
            {footerLines.slice(1).map((line, index) => (
              <span key={`line-${index}`}>{line}</span>
            ))}
          </h2>
          <p className="composite__lede">{footerText}</p>
          <div className="composite__cta-row">
            {ctaText ? (
              <Link to={ctaLink || '/'} className="composite__btn composite__btn--solid">
                {ctaText}
              </Link>
            ) : null}
            <a href="#composite-gallery" onClick={goTo('composite-gallery')} className="composite__btn composite__btn--ghost">
              {t('blocks.home.see_gallery', 'See the gallery')}
            </a>
          </div>

          <div className="composite__foot-meta">
            <span>{brand}</span>
            <span>
              {t('blocks.home.composite_meta_count', '{n} scenes · one continuous page').replace('{n}', String(indexRows.length || 4))}
            </span>
          </div>
        </div>
      </footer>
    </section>
  );
}
