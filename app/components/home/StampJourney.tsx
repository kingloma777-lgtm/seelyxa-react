import { useMemo, useRef, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowImage,
  rowLink,
  rowText,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface StampJourneyProps {
  data: BlockData;
}

interface Stamp {
  image: string;
  country: string;
  symbol: string;
  title: string;
  note: string;
  url: string;
}

const DEFAULT_STAMPS: Stamp[] = [
  {
    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=700&q=70',
    country: 'ITALIA',
    symbol: '✦',
    title: 'Monti Lessini',
    note: 'Where the path turns to stone',
    url: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=700&q=70',
    country: 'ITALIA',
    symbol: '◒',
    title: "Sant'Anna",
    note: 'A chapel, a field, a long afternoon',
    url: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=700&q=70',
    country: 'ITALIA',
    symbol: '⌁',
    title: 'Alpi Veronesi',
    note: 'The last light before the ridge',
    url: '',
  },
];

const POSITIONS = [
  { x: 15, y: 58, rotate: -4 },
  { x: 48, y: 34, rotate: 5 },
  { x: 81, y: 62, rotate: -3 },
  { x: 34, y: 72, rotate: 2 },
  { x: 65, y: 22, rotate: -5 },
  { x: 90, y: 46, rotate: 4 },
];

/**
 * Pinned field-journal: a diagonal camera move across merchant-selected
 * postage stamps while a dotted trail inks itself into the scene.
 */
export function StampJourney({ data }: StampJourneyProps) {
  const root = useRef<HTMLElement | null>(null);
  useScrollProgress(root);

  const rows = readRows(data, 'items', 'stamp_journey');
  const stamps = useMemo<Stamp[]>(
    () =>
      rows.length
        ? rows
            .map((row) => ({
              image: rowImage(row, 'image', 'stamp_journey'),
              country: rowText(row, 'country', 'stamp_journey', 'ITALIA'),
              symbol: rowText(row, 'symbol', 'stamp_journey', '✦'),
              title: rowText(row, 'title', 'stamp_journey'),
              note: rowText(row, 'note', 'stamp_journey'),
              url: rowLink(row, 'url', 'stamp_journey'),
            }))
            .filter((stamp) => stamp.image)
        : DEFAULT_STAMPS,
    [rows]
  );

  const intro = readText(
    data,
    'intro',
    'stamp_journey',
    'A field journal in three postmarks — places collected, folded and kept.'
  );
  const coordinates = readText(
    data,
    'coordinates',
    'stamp_journey',
    'CAMPOSILVANO · N 45° 37′ 53.51″ E 11° 5′ 46.01″'
  );
  const background = readText(data, 'background_color', 'stamp_journey', '#000000');
  const trail = readText(data, 'trail_color', 'stamp_journey', '#f5d44f');

  if (!stamps.length) return null;

  return (
    <section
      ref={root}
      className="stamp-journey"
      style={
        {
          '--sj-bg': background,
          '--sj-trail': trail,
          '--sj-count': stamps.length,
        } as CSSProperties
      }
      aria-labelledby="stamp-journey-title"
    >
      <div className="stamp-journey__sticky">
        <div className="stamp-journey__scene" aria-hidden={false}>
          <svg
            className="stamp-journey__trail"
            viewBox="0 0 2000 1200"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className="stamp-journey__trail-ghost"
              d="M120 880 C 380 760, 470 520, 760 500 S 1190 760, 1430 500 S 1750 310, 1940 290"
              pathLength="1"
            />
            <path
              className="stamp-journey__trail-ink"
              d="M120 880 C 380 760, 470 520, 760 500 S 1190 760, 1430 500 S 1750 310, 1940 290"
              pathLength="1"
            />
          </svg>

          {stamps.map((stamp, index) => {
            const position = POSITIONS[index % POSITIONS.length];
            const card = (
              <article
                className="stamp-journey__stamp"
                style={
                  {
                    '--stamp-x': `${position.x}%`,
                    '--stamp-y': `${position.y}%`,
                    '--stamp-r': `${position.rotate}deg`,
                    '--stamp-i': index,
                  } as CSSProperties
                }
              >
                <div className="stamp-journey__perforation">
                  <div className="stamp-journey__inner">
                    <img src={stamp.image} alt={stamp.title} loading={index === 0 ? 'eager' : 'lazy'} />
                    <div className="stamp-journey__country">
                      <span>{stamp.country}</span>
                      <span>{stamp.symbol}</span>
                    </div>
                    <p>{stamp.title}</p>
                  </div>
                </div>
                <span className="stamp-journey__note" aria-hidden>
                  {stamp.note}
                </span>
              </article>
            );
            return (
              <div className="stamp-journey__entry" key={`${stamp.image}:${index}`}>
                {stamp.url ? (
                  <Link to={stamp.url} className="stamp-journey__link">
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>

        <div className="stamp-journey__grain" aria-hidden />
        <div className="stamp-journey__vignette" aria-hidden />

        <div className="stamp-journey__ui">
          <div className="stamp-journey__ui-top">
            <span>JOURNAL / {String(stamps.length).padStart(2, '0')}</span>
            <span>INDEX</span>
            <span>ALL</span>
            <span>ABOUT</span>
          </div>
          <p className="stamp-journey__intro" id="stamp-journey-title">
            {intro}
          </p>
          <div className="stamp-journey__ui-bottom">
            <span>{coordinates}</span>
            <span>{String(Math.round(1 + (stamps.length - 1) * 0.8))} PLATES</span>
          </div>
        </div>
      </div>
    </section>
  );
}
