import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  clamp,
  prefersReducedMotion,
  readRows,
  readText,
  rowText,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface PortalWorldsProps {
  data: BlockData;
}

interface Voice {
  text: string;
  name: string;
  role: string;
}

const DEFAULT_VOICES: Voice[] = [
  { text: 'It is amazing to see and feel the worlds I am stepping into each day.', name: '', role: '' },
  { text: 'I have been feeling much more alive inside these living worlds, even on the long days.', name: '', role: '' },
  { text: 'My wonder has been growing so fast that it is hard to believe the difference.', name: '', role: '' },
  { text: 'The first two scenes felt alive. I tried everything we dreamed up and it worked.', name: '', role: '' },
  { text: 'The wonder of it all really moved me, it even brought a tear to my eyes.', name: '', role: '' },
  { text: 'I finally feel immersed, like the worlds were built just for me.', name: '', role: '' },
  { text: 'Stepping into it was effortless and the worlds have been unlike anything I dreamt.', name: '', role: '' },
];

/* Reference parallax magnitudes (Auragate): world drifts by ±6px, portal ±7px
   behind the cursor, both smoothed with a 0.07 lerp each frame. */
const MAG = { world: 6, portal: 7 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(max-width: 767px)');
    setMobile(mq.matches);
    const handler = (event: MediaQueryListEvent) => setMobile(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

/**
 * Arc card carousel — faithful port of the reference ArcCardCarousel: the card
 * nearest the center is biggest, upright and lit; the rest fan out with a
 * modular wrap so the row loops forever in both directions. Only the center
 * card accepts pointer events.
 */
function ArcCardCarousel({ items }: { items: Voice[] }) {
  const { t } = useTranslation();
  const total = items.length;
  const isMobile = useIsMobile();
  const [active, setActive] = useState(() => Math.floor(total / 2));

  const CARD_W = isMobile ? 230 : 300;
  const CARD_H = isMobile ? 320 : 420;
  const STEP_X = isMobile ? 170 : 295;
  const DROP_Y = isMobile ? 34 : 52;
  const TILT = isMobile ? 7 : 8;
  const CONTAINER_H = isMobile ? 460 : 560;
  const half = Math.floor(total / 2);

  const navigate = (direction: number) => {
    if (!total) return;
    setActive((previous) => (previous + direction + total) % total);
  };

  if (!items.length) return null;

  return (
    <div
      className="portal-worlds__cards"
      style={{ height: CONTAINER_H, '--pw-c-w': `${CARD_W}px`, '--pw-c-h': `${CARD_H}px` } as CSSProperties}
    >
      {items.map((item, index) => {
        let position = index - active;
        if (position > half) position -= total;
        if (position < -half) position += total;
        const distance = Math.abs(position);
        const isCenter = position === 0;

        /* Reference per-index arc math. */
        const tx = position * STEP_X;
        const ty = distance * DROP_Y + (isCenter ? (isMobile ? 22 : 30) : 0);
        const rotate = position * TILT;
        const opacity = isCenter ? 1 : Math.max(0, 0.6 - (distance - 1) * 0.2);
        const zIndex = 100 - distance;

        return (
          <div
            key={`${item.text}-${index}`}
            className={`portal-worlds__card${isCenter ? ' is-active' : ''}`}
            style={
              {
                '--pw-x': `${tx.toFixed(1)}px`,
                '--pw-y': `${ty.toFixed(1)}px`,
                '--pw-rot': `${rotate.toFixed(2)}deg`,
                '--pw-z': zIndex,
                '--pw-op': opacity.toFixed(3),
              } as CSSProperties
            }
            aria-current={isCenter}
          >
            <p>“{item.text}”</p>
            {item.name || item.role ? (
              <footer>
                {item.name ? <strong>{item.name}</strong> : null}
                {item.role ? <span>{item.role}</span> : null}
              </footer>
            ) : null}
          </div>
        );
      })}

      <div className="portal-worlds__controls">
        <button
          type="button"
          className="portal-worlds__controls-prev"
          aria-label={t('blocks.home.reviews_prev', 'Previous')}
          onClick={() => navigate(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          className="portal-worlds__controls-next"
          aria-label={t('blocks.home.reviews_next', 'Next')}
          onClick={() => navigate(1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c2420" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Portal-zoom hero (faithful port of the Auragate reference): a fixed-looking
 * world backdrop slowly zooms (1 → 1.18) with cursor parallax, the nav floats
 * above it, and a 160vh intro track pins a portal photograph that scales
 * 1 → 7.5 toward the viewer (origin 52% 38%) before dissolving past p > 0.66
 * while the hero copy fades out by p / 0.22. Section two is testimonials with
 * the arc card carousel, then a four-column footer.
 */
export function PortalWorlds({ data }: PortalWorldsProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const introRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [uiVisible, setUiVisible] = useState(false);

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

  const items = useMemo<Voice[]>(() => {
    const rows = readRows(data, 'items', 'portal_worlds');
    if (!rows.length) return DEFAULT_VOICES;
    return rows.map((row) => ({
      text: rowText(row, 'text', 'portal_worlds'),
      name: rowText(row, 'name', 'portal_worlds'),
      role: rowText(row, 'role', 'portal_worlds'),
    }));
  }, [data]);

  /* Intro-track scroll progress (reference mapping: clamped scrollY over the
     track's remaining height). */
  useScrollProgress(introRef, (progress) => {
    scrollRef.current = progress;
    setScrollProgress(progress);
  });

  /* Cursor-parallax + zoom loop: the same eased scale the reference rAF loop
     writes every frame (world 1 → 1.18, portal 1 → 7.5). */
  useEffect(() => {
    const mouseRaw = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };
    let frame = 0;

    const onMouse = (event: MouseEvent) => {
      mouseRaw.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRaw.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    if (prefersReducedMotion()) {
      mouseRaw.x = 0;
      mouseRaw.y = 0;
    } else {
      window.addEventListener('mousemove', onMouse, { passive: true });
      frame = window.requestAnimationFrame(loop);
    }

    function loop() {
      frame = window.requestAnimationFrame(loop);
      mouseSmooth.x = lerp(mouseSmooth.x, mouseRaw.x, 0.07);
      mouseSmooth.y = lerp(mouseSmooth.y, mouseRaw.y, 0.07);

      const eased = easeInOut(scrollRef.current);
      if (worldRef.current) {
        const scale = lerp(1, 1.18, eased);
        worldRef.current.style.transform = `scale(${scale.toFixed(4)}) translate(${(-mouseSmooth.x * MAG.world).toFixed(2)}px, ${(-mouseSmooth.y * MAG.world).toFixed(2)}px)`;
      }
      if (portalRef.current) {
        const scale = lerp(1, 7.5, eased);
        portalRef.current.style.transform = `scale(${scale.toFixed(4)}) translate(${(-mouseSmooth.x * MAG.portal).toFixed(2)}px, ${(-mouseSmooth.y * MAG.portal).toFixed(2)}px)`;
      }
    }

    return () => {
      window.removeEventListener('mousemove', onMouse);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* UI reveal timer (reference: nav/copy drift in after 600ms). */
  useEffect(() => {
    const timer = window.setTimeout(() => setUiVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  /* Reference opacity windows: the portal dissolves after p > 0.66 and the
     hero copy fades by p / 0.22. */
  const portalOpacity =
    scrollProgress <= 0.66 ? 1 : clamp(1 - (scrollProgress - 0.66) / 0.22);
  const scene1Opacity = clamp(1 - scrollProgress / 0.22);

  const uiOpacity = uiVisible ? 1 : 0;
  const uiTransform = uiVisible ? 'translateY(0)' : 'translateY(24px)';

  /* Brand split for the script + sans logo lockup. */
  const brandWords = brand.trim().split(/\s+/);
  const brandScript = brandWords.length > 1 ? brandWords[0] : brand.slice(0, Math.max(1, Math.ceil(brand.length / 2)));
  const brandSans = brandWords.length > 1 ? brandWords.slice(1).join(' ') : brand.slice(Math.ceil(brand.length / 2));

  return (
    <section
      className="portal-worlds"
      style={{ '--pw-bg': background, '--pw-accent': accentColor, '--pw-progress': scrollProgress.toFixed(4) } as CSSProperties}
      aria-labelledby="portal-worlds-title"
    >
      {/* World backdrop (reference keeps it fixed behind everything) */}
      <div className="portal-worlds__world" aria-hidden>
        <div className="portal-worlds__world-layer" ref={worldRef}>
          <img src={worldImage} alt="" loading="eager" />
        </div>
      </div>

      {/* Floating nav */}
      <nav className="portal-worlds__nav">
        <span className="portal-worlds__logo">
          <em>{brandScript}</em>
          {brandSans}
        </span>
        <div className="portal-worlds__nav-actions">
          <button type="button" className="portal-worlds__nav-demo">
            {t('blocks.home.watch_demo', 'Watch Demo')}
          </button>
          <button type="button" className="portal-worlds__nav-menu" aria-label={t('blocks.home.menu', 'Menu')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#161616" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </nav>

      {/* 160vh intro track with sticky portal zoom */}
      <div className="portal-worlds__intro" ref={introRef}>
        <div className="portal-worlds__sticky">
          <div
            className="portal-worlds__portal"
            ref={portalRef}
            style={{ opacity: portalOpacity }}
            aria-hidden
          >
            <img src={portalImage} alt="" loading="eager" />
          </div>

          <div
            className="portal-worlds__hero-copy"
            style={{ opacity: scene1Opacity, pointerEvents: scene1Opacity < 0.05 ? 'none' : 'auto' }}
          >
            <div className="portal-worlds__hero-main">
              <h2 id="portal-worlds-title">
                <em style={{ opacity: uiOpacity, transform: uiTransform }}>{accent}</em>
                <span style={{ opacity: uiOpacity, transform: uiTransform }}>{title}</span>
              </h2>
              <p style={{ opacity: uiOpacity, transform: uiTransform }}>{heroText}</p>
            </div>

            {!isMobile ? (
              <div className="portal-worlds__hero-aside" style={{ opacity: uiOpacity, transform: uiTransform }}>
                <span aria-hidden>{`${note.trim().charAt(0).toUpperCase()}.`}</span>
                <p>{note}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Section 2 — testimonials + carousel */}
      <div className="portal-worlds__testimonials">
        <header>
          <h3 style={{ opacity: uiOpacity, transform: uiTransform }}>{testimonialsTitle}</h3>
          <p style={{ opacity: uiOpacity, transform: uiTransform }}>{testimonialsText}</p>
        </header>
        <ArcCardCarousel items={items} />
      </div>

      {/* Four-column footer */}
      <footer className="portal-worlds__footer">
        <div className="portal-worlds__footer-brand">
          <span className="portal-worlds__logo">
            <em>{brandScript}</em>
            {brandSans}
          </span>
          <p>{footer}</p>
        </div>
        <div className="portal-worlds__footer-col">
          <h4>{t('blocks.home.explore', 'Explore')}</h4>
          <a href="#portal-worlds-title">{t('blocks.home.how_it_works', 'How it works')}</a>
          <a href="#portal-worlds-title">{t('blocks.home.features', 'Features')}</a>
        </div>
        <div className="portal-worlds__footer-col">
          <h4>{t('blocks.home.contact', 'Contact')}</h4>
          <a href="#portal-worlds-title">{t('blocks.home.twitter', 'X (Twitter)')}</a>
          <a href="#portal-worlds-title">{t('blocks.home.hello', 'hello@example.com')}</a>
        </div>
        <div className="portal-worlds__footer-col">
          <h4>{t('blocks.home.legal', 'Legal')}</h4>
          <a href="#portal-worlds-title">{t('blocks.home.privacy', 'Privacy Policy')}</a>
          <a href="#portal-worlds-title">{t('blocks.home.terms', 'Terms of Service')}</a>
        </div>
      </footer>
    </section>
  );
}
