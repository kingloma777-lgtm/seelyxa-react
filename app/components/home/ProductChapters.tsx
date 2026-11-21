/* ==========================================================================
   product-chapters — a pinned stage where each product owns the frame.

   The reference (henrietta.wearetattoodigital.com) runs its product showcase
   as a GSAP master timeline pinned for six viewports with `scrub: 1.4`, on top
   of Lenis. Measured, not guessed:

     - the stage's background colour is INTERPOLATED, not swapped: sampled at
       five scroll offsets it walks rgb(214,67,23) → rgb(244,80,22) →
       rgb(241,153,21) → rgb(239,196,21), a continuous ramp between chapters;
     - the giant word is split per letter (`gsap_split_letter`) and each letter
       travels vertically on its own stagger — the word does not slide
       sideways, it cascades;
     - the word is a PALE TINT of the chapter colour, not white (sampled
       rgb(227,168,152) on rgb(244,80,22), about a 55% mix), and it spans
       roughly 4%→94% of the frame width: it nearly fills the frame and keeps
       a margin. It does not bleed off the edges;
     - the pack is a CUT-OUT — no card, no rectangle, no studio background —
       and it stands about 65% of the frame height;
     - the pack turns during the hand-over and comes back upright at rest;
     - a small label ribbon sits at −5° on one side, and the CTA is a circle
       TOUCHING THE PRODUCT on the other — not a button in the corner.

   None of that needs GSAP. Everything here is a function of ONE number:

       pos = the float chapter index (0 … n−1)

   Each chapter's signed distance from `pos` (`--d`) drives its opacity, its
   pack's tilt and scale, and every letter of its word. Because the mapping is
   a pure function of `pos`, the sequence is reversible frame-for-frame and a
   frame costs two style writes — no timeline to keep in sync, no library.

   `pos` itself is `chapterPosition(progress, count)`: an integer while the
   chapter is at rest, then a ramp through the hand-over. The dwell is what
   makes it read as chapters rather than as a slideshow — without it the
   cross-fade would consume the whole segment and no chapter would ever be
   still long enough to be read.

   The chapter's own colour paints its own layer, so the ramp above is a
   cross-fade of two opaque layers rather than colour arithmetic. The stage
   underneath holds the chapter being moved TOWARDS, so the mix never dips
   through the page background mid-transition.
   ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { rowProductId } from '../../lib/productPicker';
import { imgSrc } from '../../lib/curtainSlots';
import { isJoinedScript, splitForMask } from '../../lib/splitForMask';
import {
  clamp,
  prefersReducedMotion,
  readBoolean,
  readNumber,
  readRows,
  readText,
  readTextOr,
  rowText,
  rowValue,
  useScrollProgress,
} from '../../lib/homeBlock';

const PREFIX = 'chapters';
const CHAPTERS = 'chapters_items';

/** Scroll budget per chapter, in svh, ON TOP of the pinned viewport. */
const RUN = { short: 70, medium: 105, long: 140 } as const;
type Travel = keyof typeof RUN;

const MIN_CHAPTERS = 2;
const MAX_CHAPTERS = 6;

/** How much of a chapter's segment it spends at rest before the hand-over
 * starts. At 0.55 the chapter is still for a little over half its scroll and
 * the move itself is snappy — the reference's `scrub` catch-up does the same
 * job with a time constant instead. */
const DWELL = 0.55;

/** How wide the giant word is drawn, as a multiple of the frame. Measured off
 * the reference's BUFFALO frame: the word runs from 4% to 94% of the width,
 * so it nearly fills the frame and keeps a margin at both ends. It does NOT
 * bleed — an earlier pass drew it at 116% and the first and last letters were
 * cropped, which reads as abstract shapes rather than as a word. */
const BLEED = 0.96;

const travelOf = (data: Record<string, unknown>): Travel => {
  const value = readText(data, 'travel', PREFIX, 'medium');
  return value in RUN ? (value as Travel) : 'medium';
};

/** How many chapters the manifest actually holds — the reserved height has to
 * agree with it, so the router and the component both call this. */
export function chapterCount(data: unknown): number {
  const rows = readRows((data ?? {}) as Record<string, unknown>, 'items', PREFIX);
  const withProduct = rows.filter(
    (row) => rowProductId(row, 'product', CHAPTERS) !== ''
  ).length;
  return clamp(withProduct, MIN_CHAPTERS, MAX_CHAPTERS);
}

/** The reserved height is a static string in the engine config, so the budget
 * arrives as a class: one per (pacing tier × chapter count). */
export const productChaptersRunClass = (data: unknown): string =>
  `pc-run--${travelOf((data ?? {}) as Record<string, unknown>)}${chapterCount(data)}`;

/**
 * The float chapter index for a block progress of `progress` (0 → 1).
 *
 * The block is split into `count` segments — one per chapter — and each segment
 * is a dwell followed by a hand-over: at `DWELL` the move starts, at 1 the next
 * chapter is at rest. `count` segments (not `count − 1`) is what gives the LAST
 * chapter a still moment of its own: with `count − 1` the final chapter would
 * arrive exactly at `progress = 1`, which is the same frame the sticky stage
 * unpins, so it would never be seen at rest.
 */
export function chapterPosition(progress: number, count: number): number {
  const n = Math.max(1, Math.floor(count));
  if (n === 1) return 0;
  const raw = clamp(progress) * n;
  const index = Math.min(n - 1, Math.floor(raw));
  const local = raw - index;
  const move = clamp((local - DWELL) / (1 - DWELL));
  return Math.min(n - 1, index + move);
}

interface Chapter {
  key: string;
  productId: string;
  /** the giant word — the merchant's own, or the product's name */
  word: string;
  label: string;
  note: string;
  color: string;
  /** an optional cut-out of the same product: a transparent PNG that replaces
   * the catalogue photo, which is always a rectangle with its own background */
  cutout: string;
  product?: Product;
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const unitPrice = (item: Product): number => {
  if (item.is_on_sale && item.sale_price != null) return toNumber(item.sale_price);
  return toNumber(item.starting_price ?? item.price);
};

/** A chapter's colour has to be a colour: an empty field is a missing value,
 * not a design decision, so it falls back to the seed rather than to nothing. */
const colorOf = (row: ReturnType<typeof readRows>[number], index: number): string => {
  const fallbacks = ['#c52826', '#f45016', '#f3b015', '#1f4d3a', '#2b2f6b', '#6b2f5b'];
  return rowText(row, 'color', CHAPTERS, '') || fallbacks[index % fallbacks.length];
};

/**
 * The giant word, split so every letter can travel on its own beat.
 *
 * Latin splits into per-character `inline-block`s, which is free and exact.
 *
 * A joined script cannot be split that way: each glyph in its own box is
 * shaped in isolation, so «الكرسي» comes out as disconnected letters — the
 * word stops being a word. But the reference's whole effect IS per-letter, so
 * falling back to per-word would lose the thing being asked for.
 *
 * The way to get both is to never split the text: render the word once and
 * overlay N copies, each CLIPPED to one letter's column. Every copy is the
 * whole, correctly shaped word, so the joins survive; only the visible slice
 * differs, and moving a slice moves exactly one letter. The columns come from
 * `Range` rects over the single text node — measuring the shaped text without
 * cutting it.
 */
function ChapterWord({ text, scale }: { text: string; scale: number }) {
  const boxRef = useRef<HTMLParagraphElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  const [bands, setBands] = useState<Array<[number, number]> | null>(null);
  const joined = isJoinedScript(text);

  /* Pass 1 — the fit.
   *
   * A character count can only GUESS how wide a word will be: at the same font
   * size Arabic glyphs are about half as wide as Latin ones, so one constant
   * overflows the frame by a third on «الكرسي» and leaves a gap on «CHAIR».
   * Measure the shaped word and scale it to the bleed instead. The relation is
   * linear in font-size, so a single pass lands exactly on target; the
   * multiplication by the previous `fit` is what keeps it exact when the text
   * or the merchant's size changes later. */
  useEffect(() => {
    const box = boxRef.current;
    const ink = inkRef.current;
    if (!box || !ink) return;
    /* The width that is actually painted. For a joined script that is the
       whole shaped word; for a Latin one it is the union of the per-letter
       units, which is NOT the same number — each unit is its own inline-block
       and carries its own side bearings, so fitting the measuring copy instead
       of the letters leaves the painted word a few percent too wide and the
       first letter cut at the frame's edge. */
    const paintedWidth = () => {
      const units = box.querySelectorAll('.product-chapters__unit');
      if (units.length) {
        const first = units[0].getBoundingClientRect();
        const last = units[units.length - 1].getBoundingClientRect();
        return Math.abs(last.right - first.left);
      }
      return ink.getBoundingClientRect().width;
    };
    const measure = () => {
      const boxWidth = box.getBoundingClientRect().width;
      const width = paintedWidth();
      if (!boxWidth || !width) return;
      const target = boxWidth * BLEED * scale;
      setFit((previous) => {
        /* SHRINK ONLY. The reference gives every chapter the same cap height
           whatever its word is — measured across five of them at 303px — so the
           size is fixed and the width is allowed to vary. Scaling UP to fill
           the frame is what makes a five-letter word giant and an eight-letter
           one small, which is the opposite of the reference. `--fit` is
           therefore a guard for a word that is too long, never a stretch. */
        const next = Math.min(1, (previous * target) / width);
        /* a hundredth of a percent is invisible; skipping the write keeps the
           ResizeObserver from re-triggering itself for nothing */
        return Math.abs(next - previous) < 0.0001 ? previous : next;
      });
    };
    measure();
    /* the stage is a fluid width, and the webfont can land after first paint.
       `ResizeObserver` is absent in jsdom and in a few old browsers — the
       measurement above has already run, so the word is simply not re-fitted
       on resize there instead of throwing. */
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(box);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer?.disconnect();
  }, [text, scale]);

  /* Pass 2 — the letter columns.
   *
   * Depends on `fit` because the columns are where each letter sits at the
   * FINAL size; measuring them before the fit lands would clip the letters in
   * the wrong places. `Range` rects over the single text node measure the
   * shaped word without cutting it. */
  useEffect(() => {
    if (!joined) {
      setBands(null);
      return;
    }
    const box = boxRef.current;
    const node = box?.querySelector('.product-chapters__ink')?.firstChild;
    if (!box || !node || node.nodeType !== Node.TEXT_NODE) return;
    const textNode = node as Text;
    const boxRect = box.getBoundingClientRect();
    if (!boxRect.width) return;
    const range = document.createRange();
    const out: Array<[number, number]> = [];
    for (let i = 0; i < textNode.data.length; i++) {
      if (/\s/.test(textNode.data[i])) continue;
      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);
      const rect = range.getBoundingClientRect();
      if (!rect.width) continue;
      out.push([
        (rect.left - boxRect.left) / boxRect.width,
        (rect.right - boxRect.left) / boxRect.width,
      ]);
    }
    /* a band that arrives empty means the font had not settled — keep the
       whole word visible rather than swapping in zero slices */
    if (out.length) setBands(out);
  }, [joined, text, fit]);

  const groups = splitForMask(text);
  const chars = groups.reduce(
    (sum, group) => sum + group.reduce((n, unit) => n + Array.from(unit.ch).length, 0),
    0
  );
  const count = bands?.length || Math.max(1, chars);

  return (
    <p
      ref={boxRef}
      className={`product-chapters__word${bands ? ' is-sliced' : ''}`}
      dir="auto"
      style={
        { '--n': count, '--chars': Math.max(1, chars), '--fit': fit } as CSSProperties
      }
    >
      {/* the real word: it holds the layout, and it is what a screen reader
          reads. The slices below are decorative copies of it. */}
      <span className="product-chapters__ink" ref={inkRef}>
        {text}
      </span>

      {bands
        ? bands.map(([a, b], index) => (
            <span
              className="product-chapters__slice"
              aria-hidden="true"
              key={index}
              style={{ '--i': index, '--a': a, '--b': b } as CSSProperties}
            >
              <span className="product-chapters__slice-word">{text}</span>
            </span>
          ))
        : groups.map((group, groupIndex) => (
            <span className="product-chapters__wordgroup" key={groupIndex}>
              {group.map((unit) => (
                <span
                  className="product-chapters__unit"
                  key={unit.i}
                  style={{ '--i': unit.i } as CSSProperties}
                >
                  {unit.ch}
                </span>
              ))}
            </span>
          ))}
    </p>
  );
}

export function ProductChapters({ data }: { data: Record<string, unknown> }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const rootRef = useRef<HTMLDivElement>(null);
  /* the chapter the stage is heading for, mirrored so the scroll handler can
   * tell a real change from a frame that merely repeated */
  const baseRef = useRef(-1);
  const activeRef = useRef(-1);
  /* Reduced motion is STATE, not an imperative class. The block renders twice
   * in a normal visit — once while the catalogue is loading, once when it
   * answers — and a `classList.add` on the first render is wiped by the second,
   * because React owns `className`. The visitor would then get the full scroll
   * stage after all, on the setting they turned on to avoid exactly that. */
  const [flat, setFlat] = useState(false);

  const rows = readRows(data, 'items', PREFIX);
  const chapters = rows
    .map((row, index) => {
      const productId = rowProductId(row, 'product', CHAPTERS);
      return {
        key: `${productId || 'row'}-${index}`,
        productId,
        word: rowText(row, 'word', CHAPTERS, ''),
        label: rowText(row, 'label', CHAPTERS, ''),
        note: rowText(row, 'note', CHAPTERS, ''),
        color: colorOf(row, index),
        cutout: imgSrc(rowValue(row, 'cutout', CHAPTERS)),
      };
    })
    .filter((chapter) => chapter.productId);

  const ids = chapters
    .map((chapter) => Number(chapter.productId))
    .filter((id, index, all) => Number.isFinite(id) && id > 0 && all.indexOf(id) === index);

  const { data: result, isLoading } = useQuery({
    ...product.queries.list({
      source: 'selected',
      sourceValue: ids,
      perPage: Math.max(1, ids.length),
    }),
    /* an empty `selected` source answers with the whole catalogue */
    enabled: ids.length > 0,
  });

  const catalogue = new Map<string, Product>();
  (result?.items ?? []).forEach((item) => catalogue.set(String(item.id), item));

  /* a chapter whose product was deleted has nothing to show; while the list is
     still loading the chapter waits with its own copy instead of vanishing */
  const live: Chapter[] = chapters
    .map((chapter) => ({ ...chapter, product: catalogue.get(chapter.productId) }))
    .filter((chapter) => chapter.product || isLoading);

  const travel = travelOf(data);
  const ink = readText(data, 'ink', PREFIX, '#ffffff');
  const wordScale = clamp(readNumber(data, 'word_size', PREFIX, 100), 60, 140) / 100;
  const showPrice = readBoolean(data, 'show_price', PREFIX, true);
  const ctaLabel = readTextOr(data, 'cta', PREFIX, t('blocks.home.chapters_shop', 'Shop'));
  /* A catalogue photo is a rectangle with its own background, not a cut-out.
     `surface` (the default) puts that rectangle on a light card, which always
     reads as a decision. `blend` multiplies it into the chapter colour to knock
     the white out, which is closer to the reference but also tints the product
     itself — measured on the grey armchair, on the red chapter, as a red
     chair — so it is an opt-in, not the default. A chapter with its own
     cut-out ignores the setting entirely. */
  const packStyle = (() => {
    const value = readText(data, 'pack_style', PREFIX, 'surface');
    return value === 'blend' || value === 'bare' ? value : 'surface';
  })();

  /* The one number. `useScrollProgress` already writes `--block-progress`;
   * the floor/clamp behind `pos` is the only part CSS cannot do, so it is the
   * only part JS owns. */
  useScrollProgress(rootRef, (progress) => {
    const root = rootRef.current;
    if (!root) return;
    /* the flat state has no position to be at: every chapter is laid out in
       turn and every one of them is live */
    if (flat) return;
    const pos = chapterPosition(progress, live.length);
    root.style.setProperty('--pc-pos', pos.toFixed(4));

    /* the stage holds the colour being moved TOWARDS, so the two opaque layers
     * cross-fade over a background that already matches one of them and the
     * mix never dips through the page's own colour */
    const base = Math.min(live.length - 1, Math.ceil(pos - 1e-6));
    if (base !== baseRef.current) {
      baseRef.current = base;
      root.style.setProperty('--pc-base', live[base]?.color ?? live[0]?.color ?? '#000000');
    }

    /* only the chapter at rest is interactive: a half-faded CTA must not take
     * a tap meant for the one underneath it */
    const active = Math.round(pos);
    if (active !== activeRef.current) {
      activeRef.current = active;
      const nodes = root.querySelectorAll<HTMLElement>('.product-chapters__chapter');
      nodes.forEach((node, index) => {
        node.classList.toggle('is-active', index === active);
        /* a half-faded CTA must not take a tap, and must not take a Tab stop,
           meant for the chapter that is actually on screen */
        node.toggleAttribute('inert', index !== active);
      });
    }
  });

  /* reduced motion gets a composed still — every chapter laid out one after
   * another at full opacity, with the scroll budget collapsed (see the
   * stylesheet) so the visitor is not walked through six empty viewports.
   * Read in an effect, not during render: on the server `matchMedia` does not
   * exist, so deciding during render would hydrate a different tree. */
  useEffect(() => {
    if (prefersReducedMotion()) setFlat(true);
  }, []);

  if (!live.length) return null;

  return (
    <div
      ref={rootRef}
      className={`product-chapters is-pack-${packStyle}${flat ? ' is-flat' : ''}`}
      style={
        {
          /* the same budget the router's class sets — a deleted product may
             shrink `live`, but the block's own height must stay the one the
             wrapper reserved, or the page would jump on load */
          '--pc-run': `${chapterCount(data) * RUN[travel]}svh`,
          '--pc-base': live[0].color,
          '--pc-ink': ink,
          '--pc-word': wordScale,
        } as CSSProperties
      }
    >
      <div className="product-chapters__stage">
        {live.map((chapter, index) => {
          const item = chapter.product;
          const word = chapter.word || item?.name || '';
          /* the cut-out wins: it is the merchant saying "this product has no
             background", which no blend mode can produce from a JPG */
          const image = chapter.cutout || item?.image?.url || '';

          return (
            <section
              key={chapter.key}
              className={`product-chapters__chapter${
                flat || index === 0 ? ' is-active' : ''
              }`}
              style={
                {
                  '--k': index,
                  '--pc-bg': chapter.color,
                } as CSSProperties
              }
              /* every chapter but the one on screen is out of the tab order and
                 out of the accessibility tree; the scroll handler moves this
                 with the chapter. The flat state has nothing off-screen, so
                 nothing is withheld there. */
              inert={!flat && index !== 0}
            >
              <ChapterWord text={word} scale={wordScale} />

              {/* The pack and the circle are one figure: the circle is
                  anchored to the pack's edge, so it sits one gap away from the
                  product whatever shape the merchant's photo is. It is a
                  sibling of the pack rather than a child, so the pack's blend
                  mode cannot tint it. */}
              {image || item ? (
                <div className="product-chapters__figure">
                  {image ? (
                    <div
                      className={`product-chapters__pack${
                        chapter.cutout ? ' is-cutout' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={item?.name ?? ''}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                  ) : null}

                  {item ? (
                    <a className="product-chapters__cta" href={item.url}>
                      {showPrice ? (
                        <strong className="product-chapters__price">
                          {format(unitPrice(item))}
                        </strong>
                      ) : null}
                      <span className="product-chapters__cta-label">{ctaLabel}</span>
                    </a>
                  ) : null}
                </div>
              ) : null}

              {chapter.label ? (
                /* NO `dir="auto"` here: this element is positioned with
                   `inset-inline-start`, so its own direction decides which
                   side it lands on. Arabic label text inside an English store
                   resolves `auto` to RTL and the ribbon jumps to the opposite
                   side, on top of the price circle. Bidi already renders the
                   Arabic run correctly without it. */
                <span className="product-chapters__pill">{chapter.label}</span>
              ) : null}

              {chapter.note ? (
                <p className="product-chapters__note" dir="auto">
                  {chapter.note}
                </p>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
