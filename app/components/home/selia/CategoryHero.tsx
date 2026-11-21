import type { CSSProperties } from 'react';
import {
  readBoolean,
  readRows,
  readTextOr,
  readValue,
  rowValue,
  type BlockData,
} from '../../../lib/homeBlock';
import { imgSrc } from '../../../lib/curtainSlots';
import { SeliaCta, SeliaSection } from './SeliaSection';
import { pickerLabel, rowLink } from './seliaFields';

/**
 * `home.selia-category-hero` — «تصنيفات مميزة مع خلفية».
 *
 * The "atelier folio" composition. The previous version was a flat brown slab
 * with small type, a faint rectangle drawn over the photograph, and four cards
 * staggered at two different heights — which read as a broken grid rather than
 * as art direction. The merchant's hero photo and the four category photos were
 * also crops of the same room, so the whole section looked like one picture
 * photocopied five times.
 *
 * What replaces it:
 *
 *   - a RULED MASTHEAD with one short accent rule instead of three competing
 *     display numerals;
 *   - an INK COLOPHON with a real type scale (a display headline, a tinted
 *     accent word, a readable lede) and a photographic PLATE on the other side
 *     that overlaps it like a framed print on a gallery wall. Type still never
 *     sits on the photograph.
 *   - the hero photograph is deliberately desaturated, so it behaves as a
 *     backdrop; hovering a category cross-fades that category's own photo into
 *     the plate (pure CSS `:has()`, no state, no hydration risk, and a clean
 *     no-op where `:has()` is unsupported). The colour therefore LIVES in the
 *     category cards, and the repeated room reads as a deliberate detail series.
 *   - a separate INDEX STRIP: aligned cards on one baseline (no stagger), each
 *     with a numbered tab fused into the frame's corner and an arrow badge.
 *
 * Everything still comes from theme tokens and the merchant's `--selia-accent`,
 * so dark mode and LTR need no duplicate rules.
 */
const PREFIX = 'cathero';
const ITEMS = 'hero_categories';

const pad = (n: number) => String(n).padStart(2, '0');

export function CategoryHero({ data }: { data: BlockData }) {
  const title = readTextOr(data, 'title', PREFIX, '');
  const eyebrow = readTextOr(data, 'eyebrow', PREFIX, 'مجموعات مختارة');
  const headline = readTextOr(data, 'headline', PREFIX, 'كل البيت، في مكان واحد');
  const lede = readTextOr(
    data,
    'subtitle',
    PREFIX,
    'من الأثاث إلى آخر تفصيلة في الغرفة — اختر التصنيف الذي يشبه ذوقك وابدأ منه.'
  );
  const background = imgSrc(readValue(data, 'background', PREFIX));
  const ctaLabel = readTextOr(data, 'cta_label', PREFIX, '');
  const ctaLink = readTextOr(data, 'cta_link', PREFIX, '');
  const compactMobile = readBoolean(data, 'compact_mobile', PREFIX, true);
  const rows = readRows(data, ITEMS, PREFIX);

  const tiles = rows
    .map((row) => ({
      image: imgSrc(rowValue(row, 'image', ITEMS)),
      link: rowLink(row, 'category', ITEMS),
      caption: pickerLabel(rowValue(row, 'category', ITEMS)),
    }))
    .filter((tile) => tile.image || tile.link);

  if (!background && !tiles.length) return null;

  const count = tiles.length;
  /* The ghost numeral and the chips are decorative; the count is also spoken
     once, in the header, so a screen reader does not read it nine times. */
  const style = { '--cathero-count': pad(count) } as CSSProperties;

  /* The last word gets the accent treatment. Splitting on whitespace (never
     on characters) keeps Arabic shaping intact, and emitting the joining
     space explicitly keeps textContent byte-for-byte equal to the merchant's
     string — the SSR/hydration test asserts exactly that. */
  const words = headline.trim().split(/\s+/).filter(Boolean);
  const headLead = words.length > 1 ? words.slice(0, -1).join(' ') : headline;
  const headAccent = words.length > 1 ? words[words.length - 1] : '';

  return (
    <SeliaSection variant="cathero">
      <div className="selia__head selia-cathero__head">
        <div className="selia-cathero__head-main">
          {eyebrow && <span className="selia-cathero__eyebrow">{eyebrow}</span>}
          {title && <h2 className="selia__title selia-cathero__title">{title}</h2>}
        </div>
        <p className="selia-cathero__count">
          <span className="selia-cathero__count-num">{pad(count)}</span>
          <span className="selia-cathero__count-label">تصنيفًا في الفهرس</span>
        </p>
      </div>

      <div
        className={`selia-cathero${compactMobile ? ' selia-cathero--compact' : ''}${
          background ? '' : ' selia-cathero--no-bg'
        }`}
        style={style}
      >
        <div className="selia-cathero__banner">
          <div className="selia-cathero__colophon">
            <span className="selia-cathero__ghost" aria-hidden="true">
              {pad(count)}
            </span>
            <span className="selia-cathero__spine" aria-hidden="true">
              CATALOGUE · {pad(count)}
            </span>
            <div className="selia-cathero__copy">
              <span className="selia-cathero__folio" aria-hidden="true">
                دفتر المجموعات <i />{' '}
                {/* A bare `01 — 04` inside an RTL line is reordered by bidi
                    into `04 — 01`. The numeric run owns its direction. */}
                <span dir="ltr">
                  {pad(1)} — {pad(count)}
                </span>
              </span>
              {headline && (
                <h3 className="selia-cathero__headline">
                  {headLead}
                  {headAccent && (
                    <>
                      {' '}
                      <span className="selia-cathero__accent-word">{headAccent}</span>
                    </>
                  )}
                </h3>
              )}
              {lede && <p className="selia-cathero__lede">{lede}</p>}
              {ctaLabel && (
                <div className="selia-cathero__cta">
                  <SeliaCta label={ctaLabel} href={ctaLink} />
                </div>
              )}
            </div>
          </div>

          <div className="selia-cathero__scene">
            <div className="selia-cathero__plate">
              {background && (
                /* decorative: the colophon already says what this is, so the
                   photograph is not announced twice */
                <img
                  className="selia-cathero__bg"
                  src={background}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                />
              )}
              {/* One layer per category. Hovering a card below reveals its own
                  picture here. Same URLs as the cards, so the browser fetches
                  each file once; they are decorative and never announced. */}
              {tiles.map((tile, index) =>
                tile.image ? (
                  <img
                    key={index}
                    className="selia-cathero__preview"
                    data-index={index + 1}
                    src={tile.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null
              )}
              <span className="selia-cathero__viewfinder" aria-hidden="true" />
            </div>
          </div>
        </div>

        {count > 0 && (
          <div className="selia-cathero__shelf">
            <div className="selia-cathero__shelf-head">
              <span className="selia-cathero__shelf-title">التصنيفات</span>
              <span className="selia-cathero__shelf-rule" aria-hidden="true" />
              {/* Same bidi rule: the folio is a numeric run, not Arabic text. */}
              <span className="selia-cathero__shelf-folio" dir="ltr">
                {pad(1)} — {pad(count)}
              </span>
            </div>
            <ul className="selia-cathero__tiles" aria-label={title || 'التصنيفات'}>
              {tiles.map((tile, index) => {
                const content = (
                  <>
                    <span className="selia-cathero__frame">
                      {tile.image ? (
                        <img
                          src={tile.image}
                          alt={tile.caption}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      ) : (
                        <span className="selia-cathero__fallback" aria-hidden="true" />
                      )}
                      <span className="selia-cathero__num" aria-hidden="true">
                        {pad(index + 1)}
                      </span>
                    </span>
                    {tile.caption && (
                      <span className="selia-cathero__meta">
                        <span className="selia-cathero__name">{tile.caption}</span>
                        <span className="selia-cathero__arrow" aria-hidden="true" />
                      </span>
                    )}
                  </>
                );
                return (
                  <li className="selia-cathero__tile" key={index}>
                    {tile.link ? (
                      <a className="selia-cathero__tile-link" href={tile.link}>
                        {content}
                      </a>
                    ) : (
                      <div className="selia-cathero__tile-link">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            <span className="selia-cathero__swipe" aria-hidden="true">
              اسحب لاستكشاف المجموعات
            </span>
          </div>
        )}
      </div>
    </SeliaSection>
  );
}
