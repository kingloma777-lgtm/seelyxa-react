import { useMemo, useRef, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowText,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface GestureManifestoProps {
  data: BlockData;
}

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

/** Native-scroll manifesto with a rising second scene and cylindrical type. */
export function GestureManifesto({ data }: GestureManifestoProps) {
  const root = useRef<HTMLElement | null>(null);
  useScrollProgress(root);

  const video = readText(data, 'video_url', 'gesture_manifesto', '');
  const secondaryVideo = readText(data, 'secondary_video_url', 'gesture_manifesto', '');
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

  return (
    <section
      ref={root}
      className="gesture-manifesto"
      style={
        {
          '--gm-bg': background,
          '--gm-accent': accent,
        } as CSSProperties
      }
      aria-labelledby="gesture-manifesto-title"
    >
      <div className="gesture-manifesto__sticky">
        <div className="gesture-manifesto__first">
          {video ? (
            <video
              className="gesture-manifesto__video"
              src={video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : null}
          <div className="gesture-manifesto__wash" aria-hidden />
          <nav className="gesture-manifesto__nav">
            <span>{brand}</span>
            <span>{eyebrow}</span>
            <Link to={ctaLink || '/'} className="gesture-manifesto__nav-cta">
              {ctaText}
            </Link>
          </nav>

          <h2 id="gesture-manifesto-title" aria-label={title}>
            {Array.from(title).map((character, index) => (
              <span
                key={`${character}-${index}`}
                style={{ '--gm-char': index } as CSSProperties}
                aria-hidden
              >
                {character === ' ' ? '\u00a0' : character}
              </span>
            ))}
          </h2>

          <div className="gesture-manifesto__tiles">
            {tiles.slice(0, 3).map((tile, index) => (
              <article key={`${tile.title}-${index}`} style={{ '--gm-tile': index } as CSSProperties}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{tile.title}</h3>
                <p>{tile.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="gesture-manifesto__second">
          {secondaryVideo ? (
            <video
              className="gesture-manifesto__second-video"
              src={secondaryVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : null}
          <div className="gesture-manifesto__second-top">
            <span>MANIFESTO / 12 NOTES</span>
            <span>{brand}</span>
          </div>

          <div className="gesture-manifesto__drum-wrap" aria-label={manifestoText}>
            <div className="gesture-manifesto__drum">
              {manifesto.map((line, index) => (
                <p
                  key={`${line}-${index}`}
                  style={
                    {
                      '--gm-line': index,
                      '--gm-lines': manifesto.length,
                    } as CSSProperties
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="gesture-manifesto__second-copy">
            <p>{manifestoText}</p>
            <Link to={ctaLink || '/'} className="gesture-manifesto__cta">
              {ctaText} <span aria-hidden>↗</span>
            </Link>
          </div>

          <div className="gesture-manifesto__logos" aria-hidden>
            <div>
              {[...logos, ...logos].map((logo, index) => (
                <span key={`${logo}-${index}`}>{logo}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
