import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';import { Link } from '@salla.sa/twilight-theme-engine/common';
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

export interface VideoPowerHeroProps {
  data: BlockData;
}

const DEFAULT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260709_080129_da34b00e-a5db-47dd-81a1-cccad79ac1ac.mp4';

const NAV_RATIOS = [0, 1, 0.5, 1] as const;

const quadInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

/**
 * Scroll-scrubbed film hero (faithful port of the ScrollHero reference).
 * The whole section is one sticky viewport over 500svh; scroll drives the
 * video scrub (frame 0 → last frame), the per-char headline collapse
 * (opacity → 0, yPercent → 250, scaleY → 1.2, scaleX → 0.9, staggered) over
 * the first 1000px, and the glass about panel that slides up from the bottom.
 * Mouse parallax drifts the video (±30px) and tilts the panel (±20px, ±4°).
 */
export function VideoPowerHero({ data }: VideoPowerHeroProps) {
  const { t } = useTranslation();
  const root = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const media = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const title = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const duration = useRef(0);
  const [ready, setReady] = useState(false);
  const [buffer, setBuffer] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useScrollProgress(root, (progress) => {
    /* Whole-block scrub: top = frame 0, bottom = last frame. */
    const element = video.current;
    if (!element || !duration.current || element.readyState < 1) return;
    const target = Math.min(duration.current - 0.02, Math.max(0, progress * duration.current));
    if (Math.abs(element.currentTime - target) > 0.04) {
      try {
        element.currentTime = target;
      } catch {
        /* some browsers refuse while metadata is still settling */
      }
    }
    /* Glass panel rides the same range: y = (1 - progress) * 100%. */
    if (panel.current) {
      panel.current.style.setProperty('--vh-panel-y', `${((1 - progress) * 100).toFixed(2)}%`);
    }
  });

  const videoUrl = readText(data, 'video_url', 'video_hero', DEFAULT_VIDEO);
  const poster = readText(data, 'poster', 'video_hero', '/reference/second-skin-wall.jpg');
  const eyebrow = readText(data, 'eyebrow', 'video_hero', 'THE NEXT CHAPTER');
  const titleText = readText(data, 'title', 'video_hero', 'Unleash The\nFull Power');
  const aboutTitle = readText(data, 'about_title', 'video_hero', 'About the house');
  const aboutText = readText(
    data,
    'about_text',
    'video_hero',
    'We make objects for the space between work and rest. Considered forms, honest materials, and a little bit of theatre.'
  );
  const ctaText = readText(data, 'cta_text', 'video_hero', 'Explore the collection');
  const ctaLink = readText(data, 'cta_link', 'video_hero', '/');
  const background = readText(data, 'background_color', 'video_hero', '#000000');
  const textColor = readText(data, 'text_color', 'video_hero', '#ffffff');

  const brands = useMemo(() => {
    const rows = readRows(data, 'brands', 'video_hero');
    return rows.length
      ? rows.map((row) => rowText(row, 'name', 'video_hero')).filter(Boolean)
      : ['VOICEFLOW', 'ZENDESK', 'PENDO', 'GLIDE', 'CANVA'];
  }, [data]);

  const lines = useMemo(() => titleText.split('\n').map((line) => Array.from(line)), [titleText]);

  /* Video boot + buffered-percentage reporting (reference behaviour). */
  useEffect(() => {
    const element = video.current;
    if (!element) return undefined;
    setReady(false);
    setBuffer(0);
    const onProgress = () => {
      if (element.duration && element.buffered.length) {
        const end = element.buffered.end(element.buffered.length - 1);
        setBuffer(Math.min(100, Math.round((end / element.duration) * 100)));
      }
    };
    const onSettled = () => {
      duration.current = Number.isFinite(element.duration) ? element.duration : 0;
      setReady(true);
    };
    element.addEventListener('progress', onProgress);
    element.addEventListener('loadedmetadata', onSettled);
    element.addEventListener('canplay', onSettled);
    element.addEventListener('error', onSettled);
    return () => {
      element.removeEventListener('progress', onProgress);
      element.removeEventListener('loadedmetadata', onSettled);
      element.removeEventListener('canplay', onSettled);
      element.removeEventListener('error', onSettled);
    };
  }, [videoUrl]);

  /* Mouse parallax: video drifts -30px, panel tilts ±20px/±4°, both lerp-
     smoothed each frame like the reference gsap tweens. */
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const raw = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let frame = 0;
    const onMouse = (event: MouseEvent) => {
      raw.x = (event.clientX / window.innerWidth - 0.5) * 2;
      raw.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      frame = window.requestAnimationFrame(loop);
      smooth.x += (raw.x - smooth.x) * 0.08;
      smooth.y += (raw.y - smooth.y) * 0.08;
      if (media.current) {
        media.current.style.transform = `scale(1.05) translate(${(-smooth.x * 30).toFixed(2)}px, ${(-smooth.y * 30).toFixed(2)}px)`;
      }
      if (panel.current) {
        panel.current.style.setProperty('--vh-tilt-x', `${(smooth.x * 20).toFixed(2)}px`);
        panel.current.style.setProperty('--vh-tilt-y', `${(smooth.y * 20).toFixed(2)}px`);
        panel.current.style.setProperty('--vh-rot-y', `${(smooth.x * 4).toFixed(2)}deg`);
        panel.current.style.setProperty('--vh-rot-x', `${(-smooth.y * 4).toFixed(2)}deg`);
      }
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    frame = window.requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Char collapse: the reference timeline spread over the first 1000px of
     scroll — each char owns a 0.05-stagger slice, tweened power2.inOut to
     opacity 0 / yPercent 250 / scaleY 1.2 / scaleX 0.9 (origin 50% 0%). */
  useEffect(() => {
    const scope = root.current;
    const wrap = title.current;
    if (!scope || !wrap || prefersReducedMotion()) return undefined;

    const chars = Array.from(wrap.querySelectorAll<HTMLElement>('.video-hero__char'));
    const count = Math.max(1, chars.length);
    const totalTime = (count - 1) * 0.05 + 1;

    const paint = (progress: number) => {
      const time = progress * totalTime;
      chars.forEach((char, index) => {
        const local = clamp((time - index * 0.05) / 1);
        const eased = quadInOut(local);
        char.style.opacity = (1 - eased).toFixed(3);
        char.style.transform = `translateY(${(eased * 250).toFixed(2)}%) scaleY(${(1 + eased * 0.2).toFixed(3)}) scaleX(${(1 - eased * 0.1).toFixed(3)})`;
      });
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = scope.getBoundingClientRect();
      paint(clamp(-rect.top / 1000));
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
  }, [lines]);

  const scrollToRatio = (ratio: number) => {
    const section = root.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(0, section.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + distance * ratio, behavior: 'smooth' });
    setMenuOpen(false);
  };

  /* Pill-liquid geometry (reference math: an inscribed circle that grows over
     the label on hover — CSS transition stands in for the gsap timeline). */
  useEffect(() => {
    const nav = root.current?.querySelector<HTMLElement>('.video-hero__nav');
    if (!nav) return;
    nav.querySelectorAll<HTMLElement>('.video-hero__pill-item').forEach((pill) => {
      const circle = pill.querySelector<HTMLElement>('.video-hero__pill-circle');
      if (!circle) return;
      const width = pill.offsetWidth || 1;
      const height = pill.offsetHeight || 1;
      const radius = (width * width / 4 + height * height) / (2 * height);
      const diameter = 2 * radius + 2;
      const delta = radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4)) + 1;
      circle.style.width = `${diameter}px`;
      circle.style.height = `${diameter}px`;
      circle.style.bottom = `${-delta}px`;
      circle.style.transformOrigin = `50% ${diameter - delta}px`;
    });
  }, [ctaText]);

  let charIndex = 0;

  return (
    <section
      ref={root}
      className="video-hero"
      data-scroll-container
      style={{ '--vh-bg': background, '--vh-ink': textColor } as CSSProperties}
      aria-labelledby="video-hero-title"
    >
      <div className="video-hero__pin">
        <div className="video-hero__media" ref={media} aria-hidden>
          <video
            ref={video}
            className="video-hero__video"
            src={videoUrl}
            poster={poster || undefined}
            muted
            playsInline
            preload="auto"
          />
        </div>

        {!ready ? (
          <div className="video-hero__loading">
            <span>
              {t('blocks.home.loading_film', 'Loading...')} {buffer}%
            </span>
          </div>
        ) : null}

        {/* Pill nav with liquid hover */}
        <nav className="video-hero__nav" style={{ fontFamily: "'Manrope', 'Twilight', sans-serif" }}>
          <button
            type="button"
            className="video-hero__logo"
            aria-label={t('blocks.home.back_to_top', 'Back to top')}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMenuOpen(false);
            }}
          >
            <svg viewBox="0 0 100 100" fill="white" width="24" height="24" aria-hidden>
              <path d="m50,50c0,18.2,14.77,32.98,32.97,32.98,0-18.2-14.77-32.98-32.97-32.98Z" />
              <path d="m17.02,82.98c18.2,0,32.98-14.77,32.98-32.98-18.2,0-32.98,14.77-32.98,32.98Z" />
              <path d="m82.98,17.02c-18.2,0-32.97,14.77-32.97,32.97,18.2,0,32.97-14.77,32.97-32.97Z" />
              <path d="m17.02,17.02c0,18.2,14.77,32.97,32.98,32.97,0-18.2-14.77-32.97-32.98-32.97Z" />
            </svg>
          </button>

          <div className="video-hero__nav-items">
            {NAV_RATIOS.map((ratio, index) => {
              const labels = [
                t('blocks.home.nav_home', 'HOME'),
                t('blocks.home.nav_about', 'ABOUT'),
                t('blocks.home.nav_services', 'SERVICES'),
                t('blocks.home.nav_contact', 'CONTACT'),
              ];
              const label = labels[index] ?? 'HOME';
              return (
                <button
                  key={label}
                  type="button"
                  className="video-hero__pill-item"
                  onClick={() => scrollToRatio(ratio)}
                >
                  <span className="video-hero__pill-circle" aria-hidden />
                  <span className="video-hero__pill-label">
                    <span className="video-hero__pill-text">{label}</span>
                    <span className="video-hero__pill-text video-hero__pill-text--hover">{label}</span>
                  </span>
                </button>
              );
            })}

            {/* Merchant-only extra: the store CTA as a fifth liquid pill. */}
            {ctaText ? (
              <Link to={ctaLink || '/'} className="video-hero__pill-item">
                <span className="video-hero__pill-circle" aria-hidden />
                <span className="video-hero__pill-label">
                  <span className="video-hero__pill-text">{ctaText}</span>
                  <span className="video-hero__pill-text video-hero__pill-text--hover">{ctaText}</span>
                </span>
              </Link>
            ) : null}
          </div>

          {/* Mobile hamburger + dropdown */}
          <button
            type="button"
            className="video-hero__burger"
            aria-label={t('blocks.home.menu', 'Menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span style={menuOpen ? { transform: 'rotate(45deg) translateY(3px)' } : undefined} />
            <span style={menuOpen ? { transform: 'rotate(-45deg) translateY(-3px)' } : undefined} />
          </button>
          {menuOpen ? (
            <div className="video-hero__menu">
              {ctaText ? (
                <Link to={ctaLink || '/'} onClick={() => setMenuOpen(false)}>
                  {ctaText}
                </Link>
              ) : null}
            </div>
          ) : null}
        </nav>

        {/* Char-level split headline */}
        <div className="video-hero__title-wrap">
          <p className="video-hero__kicker">{eyebrow}</p>
          <div className="video-hero__title" ref={title} aria-label={titleText.replace(/\n/g, ' ')}>
            {lines.map((line, lineIndex) => (
              <span className="video-hero__line" key={lineIndex} aria-hidden>
                {line.map((character, index) => {
                  const order = charIndex++;
                  return (
                    <span key={`${character}-${index}`} className="video-hero__char">
                      {character === ' ' ? '\u00a0' : character}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        </div>

        {/* Glass about panel — slides up from the bottom */}
        <div className="video-hero__panel-wrap">
          <div className="video-hero__panel" ref={panel}>
            <div className="video-hero__panel-copy">
              <p className="video-hero__panel-eyebrow">{aboutTitle}</p>
              <h3>{aboutText}</h3>
            </div>
            <div className="video-hero__marquee" aria-hidden>
              <div className="video-hero__marquee-track">
                {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
                  <span key={`${brand}-${index}`}>{brand}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
