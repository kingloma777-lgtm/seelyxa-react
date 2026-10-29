import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
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

/** Scroll-scrubbed MP4 hero with split-character headline and glass about panel. */
export function VideoPowerHero({ data }: VideoPowerHeroProps) {
  const root = useRef<HTMLElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);

  useScrollProgress(root, (progress) => {
    const element = video.current;
    if (!element || !duration || element.readyState < 1) return;
    const target = Math.min(duration - 0.02, Math.max(0, progress * duration));
    if (Math.abs(element.currentTime - target) > 0.04) {
      try {
        element.currentTime = target;
      } catch {
        /* some browsers refuse while metadata is still settling */
      }
    }
  });

  const videoUrl = readText(data, 'video_url', 'video_hero', DEFAULT_VIDEO);
  const poster = readText(data, 'poster', 'video_hero', '/reference/second-skin-wall.jpg');
  const eyebrow = readText(data, 'eyebrow', 'video_hero', 'THE NEXT CHAPTER');
  const title = readText(data, 'title', 'video_hero', 'Unleash The\nFull Power');
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
      : ['AURA', 'NORTH', 'FORM', 'STILL', 'ATELIER'];
  }, [data]);

  const lines = title.split(/\n/).map((line) => Array.from(line));
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const onLoaded = () => {
      setDuration(Number.isFinite(element.duration) ? element.duration : 0);
      setReady(true);
      const play = element.play();
      if (play) void play.catch(() => undefined).finally(() => element.pause());
    };
    element.addEventListener('loadedmetadata', onLoaded);
    if (element.readyState >= 1) onLoaded();
    return () => element.removeEventListener('loadedmetadata', onLoaded);
  }, [videoUrl]);

  let charIndex = 0;

  return (
    <section
      ref={root}
      className="video-hero"
      style={
        {
          '--vh-bg': background,
          '--vh-ink': textColor,
        } as CSSProperties
      }
      aria-labelledby="video-hero-title"
    >
      <div className="video-hero__sticky">
        <video
          ref={video}
          className="video-hero__video"
          src={videoUrl}
          poster={poster}
          muted
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="video-hero__shade" aria-hidden />
        <div className="video-hero__grain" aria-hidden />

        <nav className="video-hero__nav">
          <span className="video-hero__brand">SEELYXA</span>
          <span className="video-hero__nav-label">{eyebrow}</span>
          <Link to={ctaLink || '/'} className="video-hero__pill">
            {ctaText}
          </Link>
        </nav>

        <div className="video-hero__title-wrap">
          <p className="video-hero__kicker">{eyebrow}</p>
          <h2 id="video-hero-title" aria-label={title.replace(/\n/g, ' ')}>
            {lines.map((line, lineIndex) => (
              <span className="video-hero__line" key={lineIndex} aria-hidden>
                {line.map((character, index) => {
                  const order = charIndex++;
                  return (
                    <span
                      key={`${character}-${index}`}
                      style={{ '--char': order, '--chars': totalChars } as CSSProperties}
                    >
                      {character === ' ' ? '\u00a0' : character}
                    </span>
                  );
                })}
              </span>
            ))}
          </h2>
        </div>

        <aside className="video-hero__panel">
          <div className="video-hero__panel-copy">
            <p className="video-hero__panel-eyebrow">ABOUT / 001</p>
            <h3>{aboutTitle}</h3>
            <p>{aboutText}</p>
          </div>
          <div className="video-hero__panel-meta">
            <span>SCROLL SCRUBBED</span>
            <span>{ready ? 'VIDEO READY' : 'LOADING FILM'}</span>
          </div>
        </aside>

        <div className="video-hero__marquee" aria-hidden>
          <div>
            {[...brands, ...brands].map((brand, index) => (
              <span key={`${brand}-${index}`}>{brand}</span>
            ))}
          </div>
        </div>

        {!ready ? <div className="video-hero__loading">LOADING FILM / 00</div> : null}
      </div>
    </section>
  );
}
