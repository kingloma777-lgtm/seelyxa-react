import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  readRows,
  readText,
  rowText,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface PortalWorldsProps {
  data: BlockData;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: 'Maya A.', role: 'Collector', text: 'It feels less like a store and more like stepping through a door.' },
  { name: 'Omar S.', role: 'Architect', text: 'The objects have presence without asking for attention.' },
  { name: 'Lina K.', role: 'Stylist', text: 'I keep returning for the details I missed the first time.' },
  { name: 'Hassan R.', role: 'Photographer', text: 'Quiet, precise, and completely sure of itself.' },
  { name: 'Noor M.', role: 'Curator', text: 'A rare mix of warmth and restraint.' },
  { name: 'Yara T.', role: 'Designer', text: 'Every surface invites a second look.' },
  { name: 'Sami D.', role: 'Writer', text: 'The kind of place you remember by feeling, not by name.' },
];

const deltaFor = (index: number, active: number, count: number) => {
  let delta = index - active;
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  return delta;
};

/** Portal-zoom hero and fanned testimonial carousel (Auragate adaptation). */
export function PortalWorlds({ data }: PortalWorldsProps) {
  const { t } = useTranslation();
  const hero = useRef<HTMLDivElement | null>(null);
  const root = useRef<HTMLElement | null>(null);
  useScrollProgress(hero);

  const portalImage = readText(data, 'portal_image', 'portal_worlds', '/reference/auragate-portal.jpg');
  const worldImage = readText(data, 'world_image', 'portal_worlds', '/reference/auragate-world.jpg');
  const brand = readText(data, 'brand', 'portal_worlds', 'AURAGATE');
  const title = readText(data, 'hero_title', 'portal_worlds', 'Step beyond the');
  const accent = readText(data, 'hero_accent', 'portal_worlds', 'ordinary.');
  const heroText = readText(
    data,
    'hero_text',
    'portal_worlds',
    'Objects and atmospheres for people who prefer the edge of the map.'
  );
  const note = readText(data, 'secondary_note', 'portal_worlds', 'A new world every season');
  const testimonialsTitle = readText(
    data,
    'testimonials_title',
    'portal_worlds',
    'Real wonders. Real worlds.'
  );
  const testimonialsText = readText(
    data,
    'testimonials_text',
    'portal_worlds',
    'Notes from the people who stepped through first.'
  );
  const footer = readText(data, 'footer_text', 'portal_worlds', 'AURAGATE © 2026 — ALL WORLDS RESERVED');
  const background = readText(data, 'background_color', 'portal_worlds', '#071018');
  const accentColor = readText(data, 'accent_color', 'portal_worlds', '#f7fbff');

  const testimonials = useMemo<Testimonial[]>(() => {
    const rows = readRows(data, 'items', 'portal_worlds');
    if (!rows.length) return DEFAULT_TESTIMONIALS;
    return rows.map((row) => ({
      name: rowText(row, 'name', 'portal_worlds'),
      role: rowText(row, 'role', 'portal_worlds'),
      text: rowText(row, 'text', 'portal_worlds'),
    }));
  }, [data]);

  const [active, setActive] = useState(0);
  const go = useCallback(
    (direction: number) => {
      if (!testimonials.length) return;
      setActive((current) => (current + direction + testimonials.length) % testimonials.length);
    },
    [testimonials.length]
  );

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = root.current.getBoundingClientRect();
    root.current.style.setProperty('--pw-px', `${((event.clientX - rect.left) / rect.width - 0.5) * 18}px`);
    root.current.style.setProperty('--pw-py', `${((event.clientY - rect.top) / rect.height - 0.5) * 14}px`);
  };
  const resetParallax = () => {
    root.current?.style.removeProperty('--pw-px');
    root.current?.style.removeProperty('--pw-py');
  };

  return (
    <section
      ref={root}
      className="portal-worlds"
      style={{ '--pw-bg': background, '--pw-accent': accentColor } as CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={resetParallax}
      aria-labelledby="portal-worlds-title"
    >
      <div
        className="portal-worlds__world"
        style={{ backgroundImage: `url("${worldImage.replace(/"/g, '%22')}")` }}
        aria-hidden
      />

      <div className="portal-worlds__hero" ref={hero}>
        <div className="portal-worlds__sticky">
          <nav className="portal-worlds__nav">
            <span>{brand}</span>
            <span className="portal-worlds__nav-note">{note}</span>
          </nav>

          <div className="portal-worlds__portal-wrap" aria-hidden>
            <img className="portal-worlds__portal" src={portalImage} alt="" loading="eager" />
          </div>

          <div className="portal-worlds__hero-copy">
            <p className="portal-worlds__script">Discover</p>
            <h2 id="portal-worlds-title">
              {title} <em>{accent}</em>
            </h2>
            <p className="portal-worlds__hero-text">{heroText}</p>
          </div>

          <span className="portal-worlds__scroll">SCROLL TO ENTER ↓</span>
        </div>
      </div>

      <div className="portal-worlds__testimonials">
        <header>
          <p>VOICES / 07</p>
          <h3>{testimonialsTitle}</h3>
          <span>{testimonialsText}</span>
        </header>

        <div
          className="portal-worlds__cards"
          role="region"
          aria-roledescription="carousel"
          aria-label={testimonialsTitle}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') go(-1);
            if (event.key === 'ArrowRight') go(1);
          }}
        >
          {testimonials.map((testimonial, index) => {
            const delta = deltaFor(index, active, testimonials.length);
            return (
              <button
                key={`${testimonial.name}-${index}`}
                type="button"
                className={`portal-worlds__card${index === active ? ' is-active' : ''}`}
                style={
                  {
                    '--pw-x': `${delta * 188}px`,
                    '--pw-y': `${Math.abs(delta) * 34}px`,
                    '--pw-rot': `${delta * 7}deg`,
                    '--pw-scale': Math.max(0.78, 1 - Math.abs(delta) * 0.07),
                    '--pw-z': 40 - Math.abs(delta),
                  } as CSSProperties
                }
                aria-current={index === active}
                onClick={() => setActive(index)}
              >
                <span className="portal-worlds__quote">“</span>
                <p>{testimonial.text}</p>
                <footer>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </footer>
              </button>
            );
          })}
        </div>

        <div className="portal-worlds__controls">
          <button type="button" aria-label={t('blocks.home.reviews_prev', 'Previous')} onClick={() => go(-1)}>
            ←
          </button>
          <span dir="ltr">
            {String(active + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
          <button type="button" aria-label={t('blocks.home.reviews_next', 'Next')} onClick={() => go(1)}>
            →
          </button>
        </div>
      </div>

      <footer className="portal-worlds__footer">
        <Link to="/">{brand}</Link>
        <span>{footer}</span>
      </footer>
    </section>
  );
}
