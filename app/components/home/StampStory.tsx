import { useEffect, useId, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { imgSrc, rowsFrom, scalar } from '../../lib/curtainSlots';
import { clamp } from '../../lib/homeBlock';

/**
 * `stamp-story` home block — a scroll-driven "field journal" journey.
 *
 * The viewport is pinned (CSS `position: sticky`, not a JS pin) and the whole
 * scene travels across a run of vintage postage stamps, reversing direction
 * every three so a long journey zigzags instead of running off in one line.
 * A meandering dashed trail draws itself along the path that connects them and
 * a handwritten name floats in beside each stamp.
 *
 * Deliberately stripped against the reference: there is **no fixed UI chrome**
 * — the reference's top index bar and bottom coordinate line are gone, so the
 * block is photos + motion only. Everything the eye lands on is either a photo
 * or the trail.
 *
 * Why sticky + one CSS variable instead of a GSAP pin: a pin-spacer injected
 * by ScrollTrigger rewrites the page height on mount, which fights the
 * engine's lazy `RenderWhenVisible` wrapper and the sticky header. Sticky owns
 * no global scroll state — the block's own height IS the journey length, so
 * the reservation in `router.tsx` matches the real geometry and nothing shifts.
 *
 * One `--stamp-progress` (0 → 1) drives the camera, the handwriting reveals
 * and the trail draw. Only the trail's `stroke-dashoffset` needs a direct DOM
 * write (SVG lengths are not expressible in CSS), and it happens inside the
 * same rAF tick that sets the variable.
 *
 * RTL: card anchors use logical `inset-inline-start` and the travel direction
 * flips through `--stamp-dir`, so the journey reads right-to-left without a
 * second layout.
 */

/** The most stamps the merchant can add. Twelve is four reversals — beyond
 * that the journey is so long that nobody scrolls it in one go. */
export const MAX_STAMPS = 12;

/** How many stamps run in one direction before the journey doubles back.
 * After every three the camera comes from the other side, so a long journey
 * reads as a zigzag instead of a single endless diagonal. */
const GROUP = 3;

/** Step between two stamps, in the SVG's own 4000-scale space: 10 units =
 * 1vw horizontally, 1svh vertically. That is what makes the trail and the
 * cards share one geometry — an anchor at x=500 sits on `50vw`. */
const STEP_X = 700;
const STEP_Y = 520;

/** Scroll length per stamp-to-stamp leg, in viewport widths. */
const TRAVEL: Record<string, number> = { short: 130, medium: 200, long: 300 };

/** Rotation of the paper and of the handwriting, cycled per stamp so a long
 * row never looks mechanically repeated. */
const TILTS = [-4, 5, -3];
const SCRIPTS = [-6, 8, -5];

interface Anchor {
  x: number;
  y: number;
  tilt: number;
  script: number;
}

/**
 * Lays the stamps out as a zigzag: three legs running one way, then three
 * running back. The reversal is what keeps a twelve-stamp journey inside a
 * sheet of sane size — a single-direction run would need 800vw of scene.
 *
 * x is normalised afterwards so the leftmost stamp sits at 500, which keeps
 * every coordinate positive and the sheet's origin predictable.
 */
function buildAnchors(count: number): Anchor[] {
  const raw: Array<{ x: number; y: number }> = [];
  let x = 0;

  for (let i = 0; i < count; i += 1) {
    if (i > 0) {
      /* the leg that ARRIVES at stamp i belongs to stamp i's group, so the
         turn happens on the third stamp's arrival — three legs, then reverse */
      const direction = Math.floor(i / GROUP) % 2 === 0 ? 1 : -1;
      x += direction * STEP_X;
    }
    raw.push({ x, y: 520 + i * STEP_Y });
  }

  const minX = Math.min(...raw.map((point) => point.x));
  return raw.map((point, index) => ({
    x: point.x - minX + 500,
    y: point.y,
    tilt: TILTS[index % TILTS.length],
    script: SCRIPTS[index % SCRIPTS.length],
  }));
}

/** Sheet size in viewport units, with room for a full card plus its shadow on
 * every side of the outermost anchor. */
function sheetSize(anchors: readonly Anchor[]): { width: number; height: number } {
  const maxX = Math.max(...anchors.map((anchor) => anchor.x));
  const maxY = Math.max(...anchors.map((anchor) => anchor.y));
  return { width: maxX / 10 + 70, height: maxY / 10 + 80 };
}

const DEFAULT_TRAIL = '#f5d44f';
const DEFAULT_PAPER = '#fdfbf7';
const DEFAULT_INNER = '#f4f0e6';
const DEFAULT_BG = '#050505';

export interface StampStoryProps {
  data: {
    stamps?: unknown;
    trail_color?: string;
    paper_color?: string;
    inner_color?: string;
    bg_color?: string;
    travel?: string;
    grain?: boolean | string | number;
    vignette?: boolean | string | number;
    [key: string]: unknown;
  };
}

interface Stamp {
  src: string;
  name: string;
  header: string;
  symbol: string;
}

/** Reads the merchant's rows. Shared with `stampStoryRunClass` on purpose:
 * the wrapper has to reserve the height for the SAME number of stamps the
 * block will end up drawing, or the page jumps when the block mounts. A row
 * without an image is dropped by both, not just by the renderer. */
function readStamps(data: Record<string, unknown>): Stamp[] {
  const rows = rowsFrom(
    data.stamps ?? data.stamp_story_stamps ?? data['stamp_story.stamps']
  );
  /* Same rule as `readValue`: the field id the editor writes (`stamps.image`)
     beats the short alias (`image`) that the seed rows carry, otherwise a
     stamp's replaced image would keep rendering the seeded one. */
  const field = (row: Record<string, unknown>, name: string): unknown => {
    const prefixed = row[`stamps.${name}`] ?? row[`stamp_story.stamps.${name}`];
    return prefixed !== undefined && prefixed !== null ? prefixed : row[name];
  };

  return rows
    .slice(0, MAX_STAMPS)
    .map((row) => ({
      src: imgSrc(field(row, 'image')),
      name: scalar(field(row, 'name')),
      header: scalar(field(row, 'header')),
      symbol: scalar(field(row, 'symbol')),
    }))
    .filter((stamp) => stamp.src);
}

/**
 * The scroll run this placement needs, as a wrapper class name.
 *
 * `sectionClassNames.height` is a static string in the engine's config type,
 * so it cannot be computed per placement — but `className` can be a function
 * of the data. The class carries the run length in `--stamp-run`, which the
 * `height` string then reads. Without it the reservation would be the default
 * four screens for every placement, and a six-stamp journey would grow the
 * page by a thousand viewport widths the moment it mounts.
 */
export function stampStoryRunClass(data: unknown): string {
  const record = (data ?? {}) as Record<string, unknown>;
  const travel =
    scalar(record.travel ?? record.stamp_story_travel ?? record['stamp_story.travel']) ||
    'medium';
  const legs = Math.max(0, readStamps(record).length - 1);
  const key = travel === 'short' ? 's' : travel === 'long' ? 'l' : 'm';
  return `stamp-story-run--${key}${legs}`;
}

/** How far the trail swings sideways between two stamps, in SVG units
 * (10 units = 1vw). Big enough to read as a drawn line, small enough that it
 * never wanders into a neighbour's caption. */
const TRAIL_WAVE = 132;

/** Samples per stamp-to-stamp leg. 16 intervals puts a sample exactly on the
 * wave's crest and on every anchor, so the curve is faithful instead of
 * chorded across the bends. */
const TRAIL_STEPS = 16;

/**
 * The trail, sampled: a straight run between two stamps with a full sine
 * meander laid over it.
 *
 * The wave is zero at both ends, so the line still lands dead centre on each
 * stamp and only wanders in between. It is applied PERPENDICULAR to the leg,
 * not vertically, because the journey now reverses: a vertical wave would
 * bulge the wrong way on the return legs and read as a different line.
 */
function trailSamples(points: readonly Anchor[]): Array<{ x: number; y: number }> {
  const samples: Array<{ x: number; y: number }> = [];

  for (let leg = 0; leg < points.length - 1; leg += 1) {
    const a = points[leg];
    const b = points[leg + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const size = Math.hypot(dx, dy) || 1;

    /* the perpendicular, always oriented downward, so every leg bulges with
       the same hand whichever way the journey is running */
    let nx = -dy / size;
    let ny = dx / size;
    if (ny < 0) {
      nx = -nx;
      ny = -ny;
    }

    for (let step = leg === 0 ? 0 : 1; step <= TRAIL_STEPS; step += 1) {
      const t = step / TRAIL_STEPS;
      const wave = Math.sin(2 * Math.PI * t) * TRAIL_WAVE;
      samples.push({ x: a.x + dx * t + nx * wave, y: a.y + dy * t + ny * wave });
    }
  }

  return samples;
}

/**
 * Centripetal Catmull–Rom through the samples, as cubic Béziers.
 *
 * Centripetal (α = 0.5) and not uniform: uniform Catmull–Rom overshoots
 * wherever the spacing between samples changes, which is exactly what happens
 * at the crests of the wave and again at every reversal — it curls the trail
 * into loops there. Centripetal is the variant that provably cannot.
 *
 * It also takes no interest in x being monotone, which the old monotone-cubic
 * fit required and the zigzag layout no longer provides.
 */
function smoothPath(points: ReadonlyArray<{ x: number; y: number }>): string {
  const n = points.length;
  if (n < 2) return '';
  const round = (value: number) => Math.round(value * 10) / 10;
  const at = (index: number) => points[Math.max(0, Math.min(n - 1, index))];
  /* a knot spacing can never be zero, or the tangents divide by it */
  const span = (p: { x: number; y: number }, q: { x: number; y: number }) =>
    Math.pow(Math.max(1e-3, Math.hypot(q.x - p.x, q.y - p.y)), 0.5);

  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const t0 = 0;
    const t1 = t0 + span(p0, p1);
    const t2 = t1 + span(p1, p2);
    const t3 = t2 + span(p2, p3);

    /* Barry–Goldman tangents, scaled to the middle knot */
    const m1x =
      (t2 - t1) *
      ((p1.x - p0.x) / (t1 - t0) - (p2.x - p0.x) / (t2 - t0) + (p2.x - p1.x) / (t2 - t1));
    const m1y =
      (t2 - t1) *
      ((p1.y - p0.y) / (t1 - t0) - (p2.y - p0.y) / (t2 - t0) + (p2.y - p1.y) / (t2 - t1));
    const m2x =
      (t2 - t1) *
      ((p2.x - p1.x) / (t2 - t1) - (p3.x - p1.x) / (t3 - t1) + (p3.x - p2.x) / (t3 - t2));
    const m2y =
      (t2 - t1) *
      ((p2.y - p1.y) / (t2 - t1) - (p3.y - p1.y) / (t3 - t1) + (p3.y - p2.y) / (t3 - t2));

    d += ` C ${round(p1.x + m1x / 3)} ${round(p1.y + m1y / 3)},`;
    d += ` ${round(p2.x - m2x / 3)} ${round(p2.y - m2y / 3)},`;
    d += ` ${round(p2.x)} ${round(p2.y)}`;
  }
  return d;
}

function trailPath(points: readonly Anchor[]): string {
  return smoothPath(trailSamples(points));
}

/** Where the camera sits at `progress`, interpolated through the stamps.
 * A single linear travel can no longer work: the anchors reverse, so the
 * camera has to reverse with them or the stamps drift out of frame. */
function track(values: readonly number[], progress: number): number {
  const n = values.length;
  if (!n) return 0;
  if (n === 1) return values[0];
  const scaled = clamp(progress) * (n - 1);
  const index = Math.min(n - 2, Math.floor(scaled));
  return values[index] + (values[index + 1] - values[index]) * (scaled - index);
}

/** Arc length at `progress`, mapped through the anchors so the pen is exactly
 * on stamp i when the camera is. Without this the meander would make the
 * reveal run ahead or behind the stamps. */
function arcAt(progress: number, anchorArc: readonly number[], total: number): number {
  if (anchorArc.length < 2) return clamp(progress) * total;
  const legs = anchorArc.length - 1;
  const scaled = clamp(progress) * legs;
  const leg = Math.min(legs - 1, Math.floor(scaled));
  const t = scaled - leg;
  return anchorArc[leg] + (anchorArc[leg + 1] - anchorArc[leg]) * t;
}

export function StampStory({ data }: StampStoryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const lengthRef = useRef(0);
  const arcRef = useRef<number[]>([]);
  /* The mask id must be unique: two placements of this block on one page
     would otherwise share a mask and the second trail would never draw. */
  const maskId = `stamp-trail-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  /** Top-level settings arrive short (`travel`) or prefixed
   * (`stamp_story_travel`, `stamp_story.travel`) — accept every shape, but
   * let the real field id win. The short alias only exists in seed data, and
   * preferring it meant every edit made in the merchant's settings was
   * shadowed by the seed value. */
  const opt = (name: string): unknown => {
    const prefixed = data[`stamp_story_${name}`] ?? data[`stamp_story.${name}`];
    return prefixed !== undefined && prefixed !== null ? prefixed : data[name];
  };

  const text = (name: string, fallback: string): string => scalar(opt(name)) || fallback;

  const flag = (name: string, fallback: boolean): boolean => {
    const value = opt(name);
    if (value === undefined || value === null || value === '') return fallback;
    return value === true || value === 1 || value === '1' || value === 'true';
  };

  const stamps = useMemo<Stamp[]>(() => readStamps(data), [data]);

  const trail = text('trail_color', DEFAULT_TRAIL);
  const paper = text('paper_color', DEFAULT_PAPER);
  const inner = text('inner_color', DEFAULT_INNER);
  const background = text('bg_color', DEFAULT_BG);
  const grain = flag('grain', true);
  const vignette = flag('vignette', true);

  const count = stamps.length;
  const anchors = useMemo(() => buildAnchors(Math.max(1, count)), [count]);
  const sheet = sheetSize(anchors);
  /* One viewport width of scroll per stamp is far too quick, and the whole
     journey used to be a fixed four screens; with a merchant-chosen number of
     stamps the length has to follow the stamp count or the pacing collapses. */
  const journey = count > 1 ? (count - 1) * (TRAVEL[text('travel', 'medium')] ?? TRAVEL.medium) : 0;
  const path = count > 1 ? trailPath(anchors) : '';

  /* the camera track, in viewport units: stamp i is centred when it reads 0 */
  const camX = anchors.map((anchor) => anchor.x / 10 - 50);
  const camY = anchors.map((anchor) => anchor.y / 10 - 50);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const mask = maskRef.current;

    /* jsdom (and any non-visual renderer) has no SVG geometry API, so the
       whole reveal is skipped there instead of throwing. */
    if (mask && typeof mask.getTotalLength === 'function') {
      const length = mask.getTotalLength();
      lengthRef.current = length;
      mask.style.strokeDasharray = String(length);
      mask.style.strokeDashoffset = String(length);

      /* Where each stamp falls along the drawn line. The path meanders, so
         "halfway in progress" is not "halfway in arc length" — measuring it
         once at mount is what lets the pen sit on a stamp at every stop. */
      if (typeof mask.getPointAtLength === 'function') {
        const samples = 320;
        const points: Array<{ x: number; y: number; length: number }> = [];
        for (let i = 0; i <= samples; i += 1) {
          const at = (i / samples) * length;
          const point = mask.getPointAtLength(at);
          points.push({ x: point.x, y: point.y, length: at });
        }
        arcRef.current = anchors.map((anchor) => {
          let best = points[0];
          let closest = Infinity;
          for (const point of points) {
            const distance = (point.x - anchor.x) ** 2 + (point.y - anchor.y) ** 2;
            if (distance < closest) {
              closest = distance;
              best = point;
            }
          }
          return best.length;
        });
      }
    }

    const settle = () => {
      section.style.setProperty('--stamp-progress', '1');
      section.style.setProperty('--stamp-cam-x', String(camX[camX.length - 1] ?? 0));
      section.style.setProperty('--stamp-cam-y', String(camY[camY.length - 1] ?? 0));
      if (mask) mask.style.strokeDashoffset = '0';
    };

    /* A single stamp is a still: nothing to scrub, so show the finished frame
       instead of pinning the page for four empty viewports. */
    if (!journey) {
      settle();
      return;
    }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      settle();
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - stage.getBoundingClientRect().height);
      const progress = clamp(-rect.top / distance);
      section.style.setProperty('--stamp-progress', progress.toFixed(4));
      /* the camera follows the stamps, not a straight line: with the journey
         reversing every three legs a linear travel would slide the sheet the
         wrong way and lose the stamp it is supposed to be chasing */
      section.style.setProperty('--stamp-cam-x', track(camX, progress).toFixed(3));
      section.style.setProperty('--stamp-cam-y', track(camY, progress).toFixed(3));
      if (mask) {
        const drawn = arcAt(progress, arcRef.current, lengthRef.current);
        mask.style.strokeDashoffset = String(Math.max(0, lengthRef.current - drawn));
      }
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
  }, [journey, count]);

  if (!count) return null;

  return (
    <div
      ref={sectionRef}
      className="stamp-story"
      style={
        {
          '--stamp-journey': `${journey}vw`,
          '--stamp-sheet-w': `${sheet.width}vw`,
          '--stamp-sheet-h': `${sheet.height}svh`,
          '--stamp-bg': background,
          '--stamp-paper': paper,
          '--stamp-inner': inner,
          '--stamp-trail': trail,
        } as CSSProperties
      }
    >
      {/* The display faces come from `app.scss`'s single Google Fonts request.
          This block used to add its own `<link>` for a family that request
          already carried — a second stylesheet request for the same CSS, and a
          second preconnect pair, on every page that mounted the block. */}

      <div className="stamp-story__stage" ref={stageRef}>
        <div className="stamp-story__scene">
          {path ? (
            <svg
              className="stamp-story__trail"
              viewBox={`0 0 ${sheet.width * 10} ${sheet.height * 10}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <mask
                  id={maskId}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={sheet.width * 10}
                  height={sheet.height * 10}
                >
                  <path ref={maskRef} className="stamp-story__trail-mask" d={path} />
                </mask>
              </defs>
              <path
                className="stamp-story__trail-dots"
                d={path}
                mask={`url(#${maskId})`}
              />
            </svg>
          ) : null}

          {stamps.map((stamp, index) => {
            const anchor = anchors[index] ?? anchors[0];
            /* `reach` is exactly the progress at which this stamp is centred
               (the camera advances one anchor-step per leg). The name fades in
               a tenth of a leg early — far enough to read as "written as it
               arrives", close enough that it never shows up while the stamp is
               still at the edge of the frame. */
            const reach = count > 1 ? index / (count - 1) : 1;
            const reveal = Math.max(-0.12, reach - 0.1);
            return (
              <div
                key={`${stamp.src}-${index}`}
                className="stamp-story__card"
                style={
                  {
                    '--stamp-x': `${anchor.x / 10}vw`,
                    '--stamp-y': `${anchor.y / 10}svh`,
                    '--tilt': `${anchor.tilt}deg`,
                    '--hw-at': reveal.toFixed(3),
                    '--hw-rot': `${anchor.script}deg`,
                  } as CSSProperties
                }
              >
                <figure className="stamp-story__stamp">
                  <div className="stamp-story__paper" aria-hidden="true" />
                  <div className="stamp-story__inner">
                    <img
                      className="stamp-story__image"
                      src={stamp.src}
                      alt={stamp.name}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    {stamp.header || stamp.symbol ? (
                      <div className="stamp-story__header">
                        <span>{stamp.header}</span>
                        {stamp.symbol ? (
                          <span className="stamp-story__symbol">{stamp.symbol}</span>
                        ) : null}
                      </div>
                    ) : null}
                    {stamp.name ? (
                      <figcaption className="stamp-story__footer">{stamp.name}</figcaption>
                    ) : null}
                  </div>
                </figure>
                {stamp.name ? (
                  <span className="stamp-story__hw" aria-hidden="true">
                    {stamp.name}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {grain ? <div className="stamp-story__grain" aria-hidden="true" /> : null}
        {vignette ? <div className="stamp-story__vignette" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
