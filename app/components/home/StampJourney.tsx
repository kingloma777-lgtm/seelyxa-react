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
    symbol: 'B',
    title: 'Monti Lessini',
    note: '',
    url: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=700&q=70',
    country: 'ITALIA',
    symbol: 'B',
    title: "Sant'Anna",
    note: '',
    url: '',
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=700&q=70',
    country: 'ITALIA',
    symbol: 'B',
    title: 'Alpi Veronesi',
    note: '',
    url: '',
  },
];

/* Reference geometry (StampStory): the container is 400vw × 300vh and travels
   diagonally by -300vw / -150vh, walking down-right past three stamps whose
   centers sit at 50vw/50vh, 200vw/135vh and 350vw/200vh — exactly where the
   trail path starts, bends and ends (viewBox 4000×3000). */
const TRAIL_PATH =
  'M 500 500 C 800 600, 1200 400, 1400 800 C 1600 1200, 1500 1400, 2000 1350 C 2500 1300, 2800 1100, 3000 1500 S 3200 2000, 3500 2000';

const ANCHORS = [
  { x: 50, y: 50, rotate: -4 },
  { x: 200, y: 135, rotate: 5 },
  { x: 350, y: 200, rotate: -3 },
] as const;

const NOTE_TOPS = [15, 35, 25] as const;
const NOTE_ROTATIONS = [-6, 8, -5, -4, 7, -6] as const;

/**
 * Pinned field-journal (faithful port of the StampStory reference): the
 * viewport is pinned while the scene travels diagonally down-right across
 * merchant stamps; a dotted trail draws itself along the path connecting
 * them (SVG mask reveal), handwritten place names float in beside each
 * stamp, and grain + vignette overlays sit above everything.
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
              symbol: rowText(row, 'symbol', 'stamp_journey', 'B'),
              title: rowText(row, 'title', 'stamp_journey'),
              note: rowText(row, 'note', 'stamp_journey'),
              url: rowLink(row, 'url', 'stamp_journey'),
            }))
            .filter((stamp) => stamp.image)
        : DEFAULT_STAMPS,
    [rows]
  );

  const coordinates = readText(
    data,
    'coordinates',
    'stamp_journey',
    'CAMPOSILVANO - N 45° 37\' 53.51" E 11° 5\' 46.01"'
  );
  const background = readText(data, 'background_color', 'stamp_journey', '#000000');
  const trail = readText(data, 'trail_color', 'stamp_journey', '#f5d44f');

  if (!stamps.length) return null;

  const card = (stamp: Stamp, index: number) => (
    <article className="stamp-journey__stamp">
      <div className="stamp-journey__perforation" aria-hidden />
      <div className="stamp-journey__inner">
        <img
          className="stamp-journey__image"
          src={stamp.image}
          alt={stamp.title}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
        <div className="stamp-journey__country">
          <span>{stamp.country}</span>
          <span className="stamp-journey__symbol">{stamp.symbol}</span>
        </div>
        <p className="stamp-journey__place">{stamp.title}</p>
      </div>
    </article>
  );

  return (
    <section
      ref={root}
      className="stamp-journey"
      style={
        {
          '--sj-bg': background,
          '--sj-trail': trail,
        } as CSSProperties
      }
      aria-label={coordinates}
    >
      <div className="stamp-journey__sticky">
        <div className="stamp-journey__scene">
          <svg
            className="stamp-journey__trail"
            viewBox="0 0 4000 3000"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <mask id="stamp-journey-draw">
                <path className="stamp-journey__trail-mask" d={TRAIL_PATH} pathLength="1" />
              </mask>
            </defs>
            <path className="stamp-journey__trail-ink" d={TRAIL_PATH} mask="url(#stamp-journey-draw)" />
          </svg>

          {stamps.map((stamp, index) => {
            const anchor = ANCHORS[index % ANCHORS.length];
            const cycle = Math.floor(index / ANCHORS.length);
            const entryVars = {
              '--stamp-x': `${anchor.x + cycle * 24}vw`,
              '--stamp-y': `${anchor.y + cycle * 14}vh`,
              '--stamp-r': `${anchor.rotate}deg`,
            } as CSSProperties;
            const noteStart =
              index === 0 ? -1 : 0.45 + ((index - 1) / Math.max(1, stamps.length - 2)) * 0.5;
            const noteVars = {
              top: `${NOTE_TOPS[index % NOTE_TOPS.length]}%`,
              left: index % 2 === 0 ? '125%' : 'auto',
              right: index % 2 === 0 ? 'auto' : '125%',
              '--note-start': noteStart,
              '--note-rot': `${NOTE_ROTATIONS[index % NOTE_ROTATIONS.length]}deg`,
            } as unknown as CSSProperties;
            return (
              <div className="stamp-journey__entry" key={`${stamp.image}:${index}`} style={entryVars}>
                {stamp.url ? (
                  <Link to={stamp.url} className="stamp-journey__link">
                    {card(stamp, index)}
                  </Link>
                ) : (
                  card(stamp, index)
                )}
                <span className="stamp-journey__note" style={noteVars} aria-hidden>
                  {stamp.note || stamp.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cinematic overlays (pinned above the scene) */}
        <div className="stamp-journey__grain" aria-hidden />
        <div className="stamp-journey__vignette" aria-hidden />

        <div className="stamp-journey__ui">
          <div className="stamp-journey__ui-top">
            <span>INDEX •</span>
            <span className="stamp-journey__ui-dim">ALL</span>
            <span>ABOUT</span>
          </div>
          <div className="stamp-journey__ui-bottom">{coordinates}</div>
        </div>
      </div>
    </section>
  );
}
