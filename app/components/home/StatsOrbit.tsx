import { memo, useEffect, useId, useRef, useState } from 'react';
import {
  readBoolean,
  readRows,
  readTextOr,
  readValue,
  rowText,
  rowValue,
  useReveal,
  type BlockData,
} from '../../lib/homeBlock';
import { imgSrc, scalar } from '../../lib/curtainSlots';
import { useCountUp } from './selia/useCountUp';

/**
 * `home.stats-orbit` — a store's trust figures, presented as a small
 * instrument: one moss sphere inside a segmented lime ring, four glass
 * chips hanging off it.
 *
 * This is the fourth shape of this block and the one that stayed. The first
 * three were all *too heavy for a store*: a pinned full-screen scroll walk, a
 * full-bleed dark slab with a 374px orb, then a dark rounded panel. All three
 * repainted the merchant's page. What a store needs is a jewel sitting ON the
 * page, not a wall in front of it — so the block now has no surface at all:
 * every colour is a theme token (`--ink-*`, `--surface-*`, `--line-*`), and
 * the site's own background and its night mode both show through.
 *
 *  - the orb is ~200px and carries its own light (halo, specular, caustic), so
 *    it lifts off a white canvas without a panel behind it;
 *  - the ring is an instrument, not decoration: a hairline track, one arc per
 *    figure, a fine dotted halo, and a single bead of light (the comet) that
 *    orbits it forever;
 *  - the sphere's centre is a LENS, not a list. It shows one figure at a time
 *    — the claim you are pointing at — so the number can be large and legible
 *    at a small orb size. Hover a chip and the lens swaps to that chip.
 *
 * Decisions worth keeping:
 *
 *  - **The scatter is computed, not hand-picked.** Cards alternate sides so
 *    any count lands balanced (4 → 2+2, 5 → 3+2), spread evenly down that
 *    side's band, and step outward when level with the orb's widest point.
 *  - **Placement and motion live on two elements.** `.slot` owns where a card
 *    sits; `.card` owns how it arrives. One element would fight itself.
 *  - **The lens is `aria-hidden`.** Every figure already sits on a chip in
 *    full; announcing the lens too would read each number twice.
 *  - **No-JS is the readable still.** The card's hidden state is armed by
 *    `[data-armed]`, which only JavaScript sets — server HTML ships every card
 *    visible and resting. Reduced motion gets the same still, at once.
 */

const PREFIX = 'stats_orbit';
/* The collection's own id — rows arrive as `stats_orbit_items.title`, so the
   row reader needs the full id as its prefix (the `chapters_items` pattern). */
const ITEMS = 'stats_orbit_items';

/** The reference's ramp for a row with no colour of its own. Kept inside a
 * narrow lightness band on purpose: the arcs form ONE ring, and a ramp with
 * a dark green in it made the finished ring look broken rather than
 * segmented. */
const ARC_RAMP = ['#c9f26c', '#a9e06a', '#d9f792', '#b9e86e', '#9ee06f', '#e6fcae'];

/* ── the scatter, computed from the count ────────────────────────────────────
   A hand-picked list cannot serve every merchant: four figures on it landed
   THREE cards on one side and ONE on the other. The cards alternate sides
   instead — index 0, 2, 4… host on the left (the side the reference gives the
   extra card to), 1, 3, 5… on the right — so any count lands balanced
   (4 → 2+2, 5 → 3+2, 7 → 4+3, 8 → 4+4). The cards sharing a side spread
   evenly down that side's vertical band, and a card sitting level with the
   sphere's middle steps OUTWARD, because there the orb's silhouette is at its
   widest. Coordinates stay percentages of the stage box. */

/** ±20% of the stage height is the band where the orb is at its widest. */
const MIDDLE_BAND = 20;
/** Card-centre x per side, per depth: near the middle band the card steps to
 * the outer value, elsewhere it can sit closer in. `[left, right]`. */
const X_INNER = [26, 74] as const;
const X_OUTER = [20.5, 79.5] as const;

function anchorFor(index: number, count: number): readonly [number, number] {
  const side = index % 2;
  const n = side === 0 ? Math.ceil(count / 2) : Math.floor(count / 2);
  const k = Math.floor(index / 2); // the card's rank within its own side
  /* Four or more on one side means a dense column: it takes a wider band and
     a shorter chip (see `data-dense` in the stylesheet), or the rows collide. */
  const dense = n >= 4;
  const top = dense ? 12 : 16;
  const span = dense ? 76 : 68;
  const y = n === 1 ? 50 : Math.round(top + (k * span) / (n - 1));
  const x = Math.abs(y - 50) <= MIDDLE_BAND ? X_OUTER[side] : X_INNER[side];
  return [x, y];
}

type Tone = 'up' | 'flat' | 'down';

/**
 * The pill's tone is read from the merchant's own text, so `-٤٪`, `−4%` and
 * `0%` land on the right colour without a second control to keep in sync.
 */
function toneOf(delta: string): Tone {
  const text = delta.trim();
  if (!text) return 'flat';
  if (/^[-−–]/.test(text)) return 'down';
  if (/^[0٠](\D|$)/.test(text)) return 'flat';
  return 'up';
}

function OrbitCard({
  title,
  value,
  unit,
  date,
  delta,
  color,
  countUp,
}: {
  title: string;
  value: string;
  unit: string;
  date: string;
  delta: string;
  color: string;
  countUp: boolean;
}) {
  const { ref, display } = useCountUp(value, countUp);
  const tone = toneOf(delta);

  return (
    <article
      className="stats-orbit__card"
      data-reveal
      style={{ '--arc': color } as React.CSSProperties}
    >
      <header className="stats-orbit__card-head">
        {title && (
          /* the reference clamps the name to one line and lets the card
             breathe instead of reshaping around it */
          <span className="stats-orbit__card-title">{title}</span>
        )}
        {delta && (
          /* `dir="ltr"` so the sign stays where the merchant typed it: inside
             an RTL run, bidi moves a leading `+`/`-` to the far end and
             `+13%` renders as `13%+`. */
          <span className="stats-orbit__delta" data-tone={tone} dir="ltr">
            {delta}
          </span>
        )}
      </header>

      <p className="stats-orbit__card-value">
        <span className="stats-orbit__card-number" dir="ltr" ref={ref}>
          {display}
        </span>
        {unit && <span className="stats-orbit__card-unit">{unit}</span>}
      </p>

      {date && (
        <footer className="stats-orbit__card-tail">
          <span className="stats-orbit__card-date">{date}</span>
        </footer>
      )}
    </article>
  );
}

/** The instrument: a hairline track, one arc per figure with a real gap
 * between them, a fine dotted halo, and the bead of light that orbits.
 *
 * The colours are painted inline from the same ramp the chips use, because
 * `:nth-of-type` counts the track circle as the first `circle` sibling — the
 * arcs would start one colour late and the ring would stop matching its cards.
 */
function OrbitRing({ colors }: { colors: string[] }) {
  const count = colors.length;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const gap = count > 1 ? 7 : 0;
  const segment = circumference / count;

  return (
    <svg className="stats-orbit__ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle
        className="stats-orbit__ring-track"
        cx="50"
        cy="50"
        r="49"
        fill="none"
        stroke="currentColor"
      />

      {/* the dotted halo — reads as a measuring instrument, not a graphic */}
      <circle
        className="stats-orbit__ticks"
        cx="50"
        cy="50"
        r="48.2"
        fill="none"
        strokeDasharray="0.35 2.6"
      />

      {colors.map((color, i) => (
        <circle
          key={i}
          className="stats-orbit__arc"
          data-index={i}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="2"
          stroke={color}
          strokeDasharray={`${Math.max(segment - gap, 0.5)} ${circumference}`}
          strokeDashoffset={-(i * segment + gap / 2)}
          transform="rotate(-90 50 50)"
          /* `--arc` as well as `stroke`: the stylesheet re-tints the stroke
             toward the page ink so the ring reads on a white canvas and on the
             night one, and it can only do that from the custom property. */
          style={{ animationDelay: `${0.15 + i * 0.09}s`, '--arc': color } as React.CSSProperties}
        />
      ))}

      {/* `pathLength` normalises the dash maths, so the bead is the same length
          whatever radius the block ends up at. */}
      <circle
        className="stats-orbit__comet"
        cx="50"
        cy="50"
        r={radius}
        pathLength="100"
        fill="none"
        strokeWidth="2.6"
        strokeDasharray="1.4 98.6"
        strokeDashoffset="0"
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
}

export const StatsOrbit = memo(function StatsOrbit({ data }: { data: BlockData }) {
  const rows = readRows(data, ITEMS, PREFIX);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /* the lens: which figure the pointer is visiting (event-driven state — one
     render per hover, never a per-frame loop). The server HTML never carries
     it, so a no-JS page simply shows the first figure, and the pure-CSS hover
     answers (chip lift, sisters receding) still work. */
  const [focus, setFocus] = useState<number | null>(null);
  const eyebrow = readTextOr(data, 'eyebrow', PREFIX, '');
  const countUp = readBoolean(data, 'count_up', PREFIX, true);
  const showRing = readBoolean(data, 'show_ring', PREFIX, true);
  const centerImage = imgSrc(readValue(data, 'center_image', PREFIX));
  const headingId = useId();

  const cards = rows.map((row, index) => ({
    key: index,
    title: rowText(row, 'title', ITEMS),
    value: rowText(row, 'value', ITEMS),
    unit: rowText(row, 'unit', ITEMS),
    date: rowText(row, 'date', ITEMS),
    delta: rowText(row, 'delta', ITEMS),
    color: scalar(rowValue(row, 'color', ITEMS)) || ARC_RAMP[index % ARC_RAMP.length],
  }));

  /* The card's hidden state is armed by JS only: the server HTML must carry
     the whole scene (see the header). arming before useReveal means the first
     observed frame is already the armed one, and the reveal never double-
     plays for a card that is in view at load. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.dataset.armed = 'true';
  }, []);
  useReveal(stageRef);

  if (!cards.length) return null;

  const dense = Math.ceil(cards.length / 2) >= 4;

  return (
    <section
      className="stats-orbit"
      ref={sectionRef}
      data-focus={focus ?? undefined}
      data-dense={dense ? 'true' : undefined}
      aria-labelledby={eyebrow ? headingId : undefined}
    >
      <div className="stats-orbit__panel">
        <div className="stats-orbit__inner">
          {eyebrow && (
            <p className="stats-orbit__eyebrow" id={headingId}>
              {eyebrow}
            </p>
          )}

          <div className="stats-orbit__stage" ref={stageRef}>
            {/* the drifting motes — the reference's bokeh, rebuilt from
                gradients. First DOM child, so the sphere and the chips paint
                over them and no mote ever crosses text. */}
            <div className="stats-orbit__spores" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i />
            </div>

            <div className="stats-orbit__core">
              {showRing && <OrbitRing colors={cards.map((card) => card.color)} />}

              <div className="stats-orbit__orb" data-image={centerImage ? 'true' : undefined}>
                {centerImage ? <img src={centerImage} alt="" loading="lazy" decoding="async" /> : null}
              </div>

              {/* The lens: one figure at a time, the claim the visitor is
                  pointing at. Decorative — every figure is already on a chip,
                  so repeating them here for a screen reader would be noise. */}
              <div className="stats-orbit__lens" aria-hidden="true">
                {cards.map((card, i) => (
                  <span className="stats-orbit__face" data-i={i} key={card.key}>
                    {card.title && <i className="stats-orbit__face-label">{card.title}</i>}
                    <b className="stats-orbit__face-value" dir="ltr">
                      {card.value}
                    </b>
                    {card.unit && <i className="stats-orbit__face-unit">{card.unit}</i>}
                  </span>
                ))}
              </div>
            </div>

            <ul className="stats-orbit__list">
              {cards.map((card, index) => {
                const [ax, ay] = anchorFor(index, cards.length);
                return (
                  /* placement lives on the slot, motion on the card — see the
                     header comment. The SAME number drives both sides: the
                     slot's --reveal-i is the card's stagger order through
                     useReveal's DOM order, and the stylesheet reads it once. */
                  <li
                    key={card.key}
                    className="stats-orbit__slot"
                    data-side={ax < 50 ? 'l' : 'r'}
                    onMouseEnter={() => setFocus(index)}
                    onMouseLeave={() => setFocus(null)}
                    style={
                      {
                        '--ax': `${ax}%`,
                        '--ay': `${ay}%`,
                        '--reveal-i': index,
                      } as React.CSSProperties
                    }
                  >
                    <OrbitCard
                      title={card.title}
                      value={card.value}
                      unit={card.unit}
                      date={card.date}
                      delta={card.delta}
                      color={card.color}
                      countUp={countUp}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
});
