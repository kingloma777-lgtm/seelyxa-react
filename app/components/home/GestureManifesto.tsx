import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  clamp,
  prefersReducedMotion,
  readRows,
  readText,
  rowText,
  type BlockData,
} from '../../lib/homeBlock';

export interface GestureManifestoProps {
  data: BlockData;
}

/* Reference geometry (InnerCircle): the virtual scroll spans 3.5 viewport
   heights; every window below is expressed in those same units, so the block
   is 4.5 viewports tall and native scroll maps directly onto progress. */
const RANGE = 3.5;

const NAV_RATIOS = [0.25, 0.5, 0.95, RANGE] as const;

const DEFAULT_TILES = [
  { title: 'Less, but better', text: 'A short list of objects, considered for years.' },
  { title: 'Made to be held', text: 'Weight, texture and balance before decoration.' },
  { title: 'Open editions', text: 'Small runs, released when they are ready.' },
];

const DEFAULT_MANIFESTO = [
  'We believe in the quiet object.',
  'In surfaces that remember the hand.',
  'In patience as a material.',
  'In making less, and making it last.',
  'In the space between use and ritual.',
  'In forms that do not shout.',
  'In the honesty of a visible seam.',
  'In objects that age with us.',
  'In the end of the trend cycle.',
  'In beginning again.',
  'In the everyday, elevated.',
  'In the circle, kept small.',
];

const quadInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

/* Reference cylinder: R 380 / line height 32, rotateX the surface angle,
   depth-blur beyond 1.5 lines, opacity falls off with cos. */
const DRUM_R = 380;
const DRUM_LINE = 32;

const activeSectionFor = (progress: number) => {
  if (progress < 0.18) return -1;
  if (progress < 0.45) return 0;
  if (progress < 0.68) return 1;
  if (progress < 1.15) return 2;
  return 3;
};

/**
 * Gesture manifesto (faithful port of the InnerCircle reference): a magenta
 * first screen — scrubbed film, giant Michroma wordmark whose characters
 * collapse (yPercent 300 / y 25vh / scaleY 1.2 / scaleX 0.9, staggered) over
 * the first viewport, and three white tiles that slide in blurred from
 * p > 0.75 — then a dark rounded second screen rising from below (1.15 → 1.65
 * eased cubic-out) while the first blurs up to 64px, carrying a cylindrical
 * type drum (1.45 → 3.5) and a logo marquee. Native scroll maps onto the
 * reference's 0 → 3.5 virtual range, smoothed with the 0.08 lerp.
 */
export function GestureManifesto({ data }: GestureManifestoProps) {
  const { t } = useTranslation();
  const root = useRef<HTMLElement | null>(null);
  const firstRef = useRef<HTMLDivElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const videoWrap = useRef<HTMLDivElement | null>(null);
  const charsWrap = useRef<HTMLHeadingElement | null>(null);
  const tilesRef = useRef<HTMLDivElement | null>(null);
  const secondRef = useRef<HTMLDivElement | null>(null);
  const secondVideo = useRef<HTMLVideoElement | null>(null);
  const secondVideoWrap = useRef<HTMLDivElement | null>(null);
  const drumWrap = useRef<HTMLDivElement | null>(null);
  const drumDur = useRef({ a: 0, b: 0 });
  const firstDur = useRef(0);
  const navRef = useRef<HTMLElement | null>(null);
  const [videoReady, setVideoReady] = useState({ a: false, b: false });
  const [menuOpen, setMenuOpen] = useState(false);

  const videoUrl = readText(data, 'video_url', 'gesture_manifesto', '');
  const secondaryVideoUrl = readText(data, 'secondary_video_url', 'gesture_manifesto', '');
  const brand = readText(data, 'brand', 'gesture_manifesto', 'INNER CIRCLE');
  const title = readText(data, 'title', 'gesture_manifesto', 'INNER CIRCLE');
  const eyebrow = readText(data, 'eyebrow', 'gesture_manifesto', 'A STUDY IN PRESENCE');
  const background = readText(data, 'background_color', 'gesture_manifesto', '#11010a');
  const accent = readText(data, 'accent_color', 'gesture_manifesto', '#ff005e');
  const ctaText = readText(data, 'cta_text', 'gesture_manifesto', 'Enter the circle');
  const ctaLink = readText(data, 'cta_link', 'gesture_manifesto', '/');
  const manifestoText = readText(
    data,
    'manifesto_text',
    'gesture_manifesto',
    'A quiet refusal of the disposable. Twelve notes on making, keeping and living with objects.'
  );

  const tiles = useMemo(() => {
    const rows = readRows(data, 'tiles', 'gesture_manifesto');
    return rows.length
      ? rows.map((row) => ({
          title: rowText(row, 'title', 'gesture_manifesto'),
          text: rowText(row, 'text', 'gesture_manifesto'),
        }))
      : DEFAULT_TILES;
  }, [data]);

  const manifesto = useMemo(() => {
    const rows = readRows(data, 'manifesto', 'gesture_manifesto');
    const values = rows.map((row) => rowText(row, 'text', 'gesture_manifesto')).filter(Boolean);
    return values.length ? values : DEFAULT_MANIFESTO;
  }, [data]);

  const logos = useMemo(() => {
    const rows = readRows(data, 'logos', 'gesture_manifesto');
    const values = rows.map((row) => rowText(row, 'name', 'gesture_manifesto')).filter(Boolean);
    return values.length ? values : ['MONOCLE', 'KINFOLK', 'WALLPAPER*', 'CEREAL', 'APARTAMENTO'];
  }, [data]);

  const lines = useMemo(() => Array.from(title), [title]);

  /* The single rAF loop: native scroll → 0..3.5 unit progress, smoothed by
     the reference 0.08 lerp, then every layer is painted with direct style
     writes (first screen blur, tile slide, char collapse, second screen
     rise, drum cylinder, video seeks). */
  useEffect(() => {
    const section = root.current;
    if (!section) return undefined;
    const reduced = prefersReducedMotion();
    const mouseRaw = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };
    const videoSeek = { a: 0, b: 0 };
    let current = 0;
    let frame = 0;

    const paint = (progress: number) => {
      const first = Math.min(1, progress);
      const unit = window.innerHeight;

      /* First screen film (progress 0 → 1) with the 0.15 seek lerp. */
      if (video.current && firstDur.current > 0) {
        videoSeek.a += (first * firstDur.current - videoSeek.a) * 0.15;
        if (!video.current.seeking && Math.abs(video.current.currentTime - videoSeek.a) > 0.01) {
          video.current.currentTime = videoSeek.a;
        }
      }

      /* Whole first screen blurs away as the second rises (sin window). */
      const secondWindow = clamp((progress - 1.15) / 0.5);
      const blur = Math.sin((secondWindow * Math.PI) / 2) * 64;
      if (firstRef.current) {
        firstRef.current.style.filter = secondWindow > 0 ? `blur(${blur.toFixed(2)}px)` : 'none';
      }

      /* Void-split headline: per-char staggered collapse over unit 0 → 1. */
      const chars = charsWrap.current?.querySelectorAll<HTMLElement>('.gesture-manifesto__char');
      if (chars && chars.length) {
        const count = chars.length;
        const total = (count - 1) * 0.03 + 1;
        const time = first * total;
        chars.forEach((char, index) => {
          const local = clamp((time - index * 0.03) / 1);
          const eased = quadInOut(local);
          char.style.opacity = (1 - eased).toFixed(3);
          char.style.transform = `translateY(calc(${(eased * 300).toFixed(2)}% + ${(eased * 25).toFixed(2)}vh)) scaleY(${(1 + eased * 0.2).toFixed(3)}) scaleX(${(1 - eased * 0.1).toFixed(3)})`;
        });
      }

      /* Soap tiles: reveal p > 0.75, slide from x -90px blurred. */
      const tileEase = reduced ? 1 : clamp((progress - 0.75) / 0.22);
      if (tilesRef.current) {
        const visible = tileEase > 0;
        tilesRef.current.style.opacity = visible ? tileEase.toFixed(3) : '0';
        tilesRef.current.style.transform = `translateY(-50%) translateX(${(visible ? (tileEase - 1) * 90 : -48).toFixed(2)}px)`;
        tilesRef.current.style.filter = `blur(${(visible ? (1 - tileEase) * 12 : 12).toFixed(2)}px)`;
        tilesRef.current.style.pointerEvents = visible ? 'auto' : 'none';
      }

      /* Second screen rise: cubic-out, drawn rounded corners + pill. */
      const rising = reduced ? (secondWindow > 0 ? 1 : 0) : 1 - Math.pow(1 - secondWindow, 3);
      if (secondRef.current) {
        secondRef.current.style.transform = `translateY(${((1 - rising) * 100).toFixed(3)}%)`;
        secondRef.current.style.visibility = secondWindow > 0 ? 'visible' : 'hidden';
      }

      /* Second film: progressRange [1.45, 3.5] of the unit space. */
      if (secondVideo.current && drumDur.current.b > 0) {
        const mapped = clamp((progress - 1.45) / (RANGE - 1.45)) * drumDur.current.b;
        videoSeek.b += (mapped - videoSeek.b) * 0.15;
        if (!secondVideo.current.seeking && Math.abs(secondVideo.current.currentTime - videoSeek.b) > 0.01) {
          secondVideo.current.currentTime = videoSeek.b;
        }
      }

      /* Cylindrical drum (targetIndex over the manifesto lines). */
      const paragraphs = drumWrap.current?.querySelectorAll<HTMLElement>('.gesture-manifesto__drum p');
      if (paragraphs && paragraphs.length) {
        const drumProgress = clamp((progress - 1.45) / 2.05);
        const targetIndex = drumProgress * (paragraphs.length - 1);
        paragraphs.forEach((line, index) => {
          const diff = index - targetIndex;
          const translateY = diff * DRUM_LINE;
          const angleRad = translateY / DRUM_R;
          const angleDeg = (angleRad * 180) / Math.PI;
          const translateZ = Math.cos(angleRad) * DRUM_R - DRUM_R;
          const scale = 0.78 + Math.cos(angleRad) * 0.22;
          const opacity = Math.max(0, (Math.cos(angleRad) - 0.2) / 0.8);
          const depthBlur = Math.min(8, Math.max(0, (Math.abs(diff) - 1.5) * 0.75));
          line.style.transform = `translateY(${translateY.toFixed(2)}px) translateZ(${translateZ.toFixed(2)}px) rotateX(${(-angleDeg * 0.8).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          line.style.opacity = opacity.toFixed(3);
          line.style.filter = depthBlur > 0.1 ? `blur(${depthBlur.toFixed(2)}px)` : 'none';
        });
      }

      /* Active nav section (reference updateActiveSection windows). */
      const active = activeSectionFor(progress);
      navRef.current?.querySelectorAll<HTMLElement>('[data-nav-ratio]').forEach((item) => {
        item.classList.toggle('is-active', Number(item.getAttribute('data-nav-ratio')) === active);
      });
    };

    const loop = () => {
      frame = window.requestAnimationFrame(loop);

      /* Native scroll → unit progress over the 3.5 extra viewports. */
      const rect = section.getBoundingClientRect();
      const target = reduced ? 0 : clamp(-rect.top / window.innerHeight, 0, RANGE);
      current += (target - current) * 0.08;
      if (!reduced && Math.abs(target - current) < 0.001) current = target;

      mouseSmooth.x += (mouseRaw.x - mouseSmooth.x) * 0.07;
      mouseSmooth.y += (mouseRaw.y - mouseSmooth.y) * 0.07;
      if (videoWrap.current) {
        videoWrap.current.style.transform = `scale(1.05) translate(${(-mouseSmooth.x * 40).toFixed(2)}px, ${(-mouseSmooth.y * 40).toFixed(2)}px)`;
      }
      if (secondVideoWrap.current) {
        secondVideoWrap.current.style.transform = `scale(1.05) translate(${(-mouseSmooth.x * 40).toFixed(2)}px, ${(-mouseSmooth.y * 40).toFixed(2)}px)`;
      }

      paint(current);
    };

    const onMouse = (event: MouseEvent) => {
      mouseRaw.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRaw.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.cancelAnimationFrame(frame);
    };
  }, [videoUrl, secondaryVideoUrl, lines, tiles, manifesto]);

  /* Video metadata for the scrub ceilings. */
  useEffect(() => {
    const element = video.current;
    if (!element) return undefined;
    const onMeta = () => {
      firstDur.current = Number.isFinite(element.duration) ? element.duration : 0;
      setVideoReady((state) => ({ ...state, a: true }));
    };
    element.addEventListener('loadeddata', onMeta);
    element.addEventListener('error', onMeta);
    return () => {
      element.removeEventListener('loadeddata', onMeta);
      element.removeEventListener('error', onMeta);
    };
  }, [videoUrl]);

  useEffect(() => {
    const element = secondVideo.current;
    if (!element) return undefined;
    const onMeta = () => {
      drumDur.current.b = Number.isFinite(element.duration) ? element.duration : 0;
      setVideoReady((state) => ({ ...state, b: true }));
    };
    element.addEventListener('loadeddata', onMeta);
    element.addEventListener('error', onMeta);
    return () => {
      element.removeEventListener('loadeddata', onMeta);
      element.removeEventListener('error', onMeta);
    };
  }, [secondaryVideoUrl]);

  const navigate = (ratio: number) => {
    const section = root.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(0, section.offsetHeight - window.innerHeight);
    window.scrollTo({ top: top + (distance * ratio) / RANGE, behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLabels = [
    t('blocks.home.nav_projects', 'Projects'),
    t('blocks.home.nav_expertise', 'Expertise'),
    t('blocks.home.nav_about', 'About'),
    t('blocks.home.nav_manifesto', 'Manifesto'),
  ];

  return (
    <section
      ref={root}
      className="gesture-manifesto"
      style={{ '--gm-bg': background, '--gm-accent': accent } as CSSProperties}
      aria-labelledby="gesture-manifesto-title"
    >
      <div className="gesture-manifesto__sticky">
        {/* FIRST SCREEN — magenta film + splitting wordmark + tiles */}
        <div className="gesture-manifesto__first" ref={firstRef}>
          <div className="gesture-manifesto__first-media">
            <div className="gesture-manifesto__video-wrap" ref={videoWrap}>
              {videoUrl ? (
                <video
                  ref={video}
                  className="gesture-manifesto__video"
                  src={videoUrl}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden
                />
              ) : null}
            </div>
            {!videoReady.a && videoUrl ? (
              <div className="gesture-manifesto__loader">
                <span className="gesture-manifesto__loader-ring" aria-hidden />
                <span className="gesture-manifesto__loader-ping" aria-hidden />
                <p>LOADING SCROLL STREAM...</p>
              </div>
            ) : null}
          </div>

          <h2 id="gesture-manifesto-title" className="gesture-manifesto__title" ref={charsWrap} aria-label={title}>
            {lines.map((character, index) => (
              <span key={`${character}-${index}`} className="gesture-manifesto__char" aria-hidden>
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </h2>

          <div className="gesture-manifesto__tiles" ref={tilesRef}>
            {tiles.slice(0, 3).map((tile, index) => (
              <article key={`${tile.title}-${index}`}>
                <span className="gesture-manifesto__tile-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{tile.title}</h3>
                {tile.text ? <p>{tile.text}</p> : null}
              </article>
            ))}
          </div>
        </div>

        {/* Floating header */}
        <nav className="gesture-manifesto__nav" ref={navRef}>
          <button type="button" className="gesture-manifesto__nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg viewBox="0 0 80 80" width={48} height={48} fill="none" aria-hidden>
              <path
                d="M40 80C17.9086 80 0 62.0914 0 40V0C15.0436 0 28.1476 8.30466 34.9776 20.5796C25.6529 22.8063 18.7198 31.1937 18.7198 41.2004V42.0962C18.7198 53.3099 27.8104 62.4004 39.0242 62.4004H39.9199L39.9197 41.2004C39.9197 52.9088 49.4113 62.4004 61.1198 62.4004L61.1198 41.2004C61.1198 29.5187 51.6717 20.0437 40 20.0005L40 0H41.6902C62.8481 0 80 17.1519 80 38.3099V40C80 62.0914 62.0914 80 40 80Z"
                fill="white"
              />
            </svg>
            <span>{eyebrow}</span>
          </button>

          <div className="gesture-manifesto__nav-items">
            {NAV_RATIOS.map((ratio, index) => (
              <button
                key={navLabels[index]}
                type="button"
                data-nav-ratio={index}
                onClick={() => navigate(ratio)}
              >
                {navLabels[index]}
              </button>
            ))}
            {ctaText ? (
              <Link to={ctaLink || '/'} className="gesture-manifesto__nav-cta">
                {ctaText}
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            className="gesture-manifesto__burger"
            aria-label={t('blocks.home.menu', 'Menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {menuOpen ? (
            <div className="gesture-manifesto__menu">
              {NAV_RATIOS.map((ratio, index) => (
                <button key={navLabels[index]} type="button" onClick={() => navigate(ratio)}>
                  {navLabels[index]}
                </button>
              ))}
              {ctaText ? (
                <Link to={ctaLink || '/'} onClick={() => setMenuOpen(false)}>
                  {ctaText}
                </Link>
              ) : null}
            </div>
          ) : null}
        </nav>

        {/* SECOND SCREEN — dark, rises from below with the drum */}
        <div className="gesture-manifesto__second" ref={secondRef}>
          <span className="gesture-manifesto__grab" aria-hidden />

          <div className="gesture-manifesto__second-media">
            <div className="gesture-manifesto__video-wrap" ref={secondVideoWrap}>
              {secondaryVideoUrl ? (
                <video
                  ref={secondVideo}
                  className="gesture-manifesto__video"
                  src={secondaryVideoUrl}
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden
                />
              ) : null}
            </div>
            {!videoReady.b && secondaryVideoUrl ? (
              <div className="gesture-manifesto__loader">
                <span className="gesture-manifesto__loader-ring" aria-hidden />
                <span className="gesture-manifesto__loader-ping" aria-hidden />
                <p>LOADING DRUM STREAM...</p>
              </div>
            ) : null}
          </div>

          <div className="gesture-manifesto__drum-wrap">
            <div className="gesture-manifesto__drum" aria-label={manifestoText}>
              {manifesto.map((line, index) => (
                <p key={`${line}-${index}`}>{line}&nbsp;</p>
              ))}
            </div>
          </div>

          <div className="gesture-manifesto__logos" aria-hidden>
            <div className="gesture-manifesto__marquee">
              <div className="gesture-manifesto__marquee-track" style={{ animationDuration: '25s' }}>
                <div className="gesture-manifesto__marquee-group">
                  {logos.map((logo, index) => (
                    <span key={`${logo}-${index}`}>{logo}</span>
                  ))}
                </div>
                <div className="gesture-manifesto__marquee-group">
                  {logos.map((logo, index) => (
                    <span key={`${logo}-dup-${index}`}>{logo}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
