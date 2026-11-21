import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blog } from '@salla.sa/twilight-theme-engine/api/blog';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
/* The route barrel, not a `/types` subpath: the package exports
   `./routes/blog` but not `./routes/blog/types`, so the deep import fails at
   build time even though the file exists on disk. */
import type { ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';
import { readNumber, readTextOr, type BlockData } from '../../../lib/homeBlock';
import { SeliaSection } from './SeliaSection';

/**
 * `home.selia-blog-teaser` — the newest articles, with the store's own
 * categories as a filter row.
 *
 * Selia's block has one field: a select of "المدونة". That select exists
 * because their Twig renders a *specific* blog object, and a Salla store has
 * exactly one blog — so the question the field asks has no answer here, and
 * asking the merchant to pick from a one-item list would be a control that
 * cannot be wrong. It is replaced with the thing the field was reaching for:
 * the store's own blog **categories**, offered to the *visitor* as tabs.
 *
 * Everything shown is real: the articles, their photos, their dates and their
 * links come from `blog.get()` / `blog.articles.list()` and open the store's
 * own article pages. Nothing is typed by hand, so a new post appears here the
 * moment it is published — and a deleted one leaves with no broken card.
 *
 * Filtering re-queries rather than filtering in the browser: the overview only
 * carries the latest few articles, so a client-side filter would show an empty
 * grid for any category whose posts are not in that first handful.
 *
 * ── The layout ────────────────────────────────────────────────────────────
 * Three equal cards with a photo on top is the shape every theme ships, and it
 * wastes the one thing a blog has that a product grid does not: an *order*. A
 * newest-first list with no emphasis says "here are three things"; the reader
 * has no entry point. So the newest article is a **feature** — full-bleed
 * photo, the headline set over it — and the rest are numbered rows beside it,
 * the way a magazine runs its contents page. That also survives any `count`
 * the merchant picks: one article is a feature, eight is a feature and seven
 * rows, and neither leaves a hole in a grid.
 */
const PREFIX = 'blog';
const DEFAULT_COUNT = 3;

/* ── dates ───────────────────────────────────────────────────────────────────
   The API sends `created_at` as `{ date: '2024-12-31 11:39:22.000000',
   timezone: 'Asia/Riyadh' }`, not as a string. `new Date(String(value))` on
   that object yields `[object Object]`, an Invalid Date — which is why the old
   cards reserved a line and then printed nothing.

   Formatting is done from a month table instead of `Intl.DateTimeFormat` on
   purpose: the runtime's ICU data differs between Node and the browser, so the
   server could render `٤ نوفمبر ٢٠٢٦` where the browser renders `4 نوفمبر
   2026`. That is a hydration mismatch on every card. A table is identical on
   both sides, so the date is correct in the server HTML itself — no blank
   slot, no post-mount swap. */
const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  if (typeof value === 'string') {
    const fromString = new Date(value);
    return Number.isNaN(fromString.getTime()) ? null : fromString;
  }
  if (value && typeof value === 'object' && 'date' in value) {
    const raw = String((value as { date: unknown }).date ?? '').trim();
    if (!raw) return null;
    /* `2024-12-31 11:39:22.000000` → `2024-12-31T11:39:22`. The value is
       already in the store's timezone and carries no offset, so it is parsed as
       local time rather than shifted by a `Z` that was never there. */
    const iso = (raw.includes('T') ? raw : raw.replace(' ', 'T')).replace(/\.\d+$/, '');
    const fromObject = new Date(iso);
    return Number.isNaN(fromObject.getTime()) ? null : fromObject;
  }
  return null;
}

function formatDate(value: unknown, locale: string): string | null {
  const date = toDate(value);
  if (!date) return null;
  const isArabic = (locale || 'ar').toLowerCase().startsWith('ar');
  const months = isArabic ? AR_MONTHS : EN_MONTHS;
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return isArabic ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`;
}

function ArticleDate({ value, locale }: { value: unknown; locale: string }) {
  const label = formatDate(value, locale);
  const date = toDate(value);
  if (!label || !date) return null;
  return (
    <time className="selia-blog__date" dateTime={date.toISOString()}>
      {label}
    </time>
  );
}

/* A zero-padded ordinal for the contents list. Built by hand rather than with
   `toLocaleString`, for the same reason the months are a table: the runtime's
   number formatting is another Node-vs-browser difference. */
function ordinal(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/* The newest article. The photo is the card: the headline sits on a scrim over
   it, so the block has a focal point instead of three equal thumbnails. The
   image is `alt=""` because the headline beside it already names the link —
   repeating it would make a screen reader announce the article twice. */
function Feature({
  article,
  locale,
  readLabel,
}: {
  article: ArticleSummary;
  locale: string;
  readLabel: string;
}) {
  const tag = article.tags?.[0]?.name;
  /* No photo is a real state — a store can publish a post without one, and the
     article's own image can simply fail to load. A grey rectangle behind white
     type is unreadable, so the card switches to a *plate*: a deep ink panel
     with the store's accent behind it. It reads as a designed cover, not as a
     missing image.

     `broken` covers the second case: the URL exists, the CDN does not answer.
     Without it the card would keep a blank `--surface-2` box under white type —
     the one state where the headline is invisible. */
  const [broken, setBroken] = useState(false);
  const shot = useRef<HTMLImageElement>(null);
  /* `onError` alone is not enough here. The block hydrates lazily, so the
     image request starts long before React attaches a handler — if the CDN
     refuses it, the error has already fired and nothing catches it. So the
     effect reads the element's settled state *and* attaches a native listener
     for the case where the failure happens after hydration. Between the two,
     every ordering is covered, and the card never sits as white type on a
     blank `--surface-2` box. */
  useEffect(() => {
    const img = shot.current;
    if (!img) return undefined;
    const check = () => {
      if (img.complete && img.naturalWidth === 0) setBroken(true);
    };
    check();
    img.addEventListener('error', check);
    return () => img.removeEventListener('error', check);
  }, []);
  const hasPhoto = !!article.image && !broken;
  return (
    <a
      className="selia-blog__feature"
      href={article.url}
      data-plate={hasPhoto ? undefined : '1'}
    >
      {hasPhoto && (
        <span className="selia-blog__shot">
          <img
            ref={shot}
            src={article.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        </span>
      )}
      {hasPhoto && <span className="selia-blog__veil" aria-hidden="true" />}
      <span className="selia-blog__panel">
        {/* The category is a kicker above the headline, not a pill inside the
            meta row: at the top of the card it opens the composition and fills
            the empty upper third a bottom-aligned headline always leaves. */}
        {tag && <span className="selia-blog__kicker">{tag}</span>}
        <span className="selia-blog__body">
          <span className="selia-blog__name">{article.name}</span>
          {article.description && <span className="selia-blog__desc">{article.description}</span>}
          {/* The date sits at the FOOT of the card, not above the headline: the
              scrim is darkest at the bottom, and a small 76%-white label on the
              half-lit middle of the photo is the first thing to become
              unreadable when the merchant's article image is light. */}
          <span className="selia-blog__foot">
            <ArticleDate value={article.created_at} locale={locale} />
            <span className="selia-blog__more">
              {readLabel}
              <i className="sicon-arrow-left" aria-hidden="true" />
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}

/* The rest, as a contents list. The number is the anchor: it gives the column
   a rhythm a stack of equal cards cannot have, and it survives the case the
   photo does not — a post without an image would otherwise be a grey square.
   When there *is* a photo the number stays and the thumbnail joins it, so the
   list keeps the same rhythm whether or not the merchant uploads images. */
function Row({
  article,
  locale,
  index,
}: {
  article: ArticleSummary;
  locale: string;
  index: number;
}) {
  return (
    <li className="selia-blog__row">
      <a className="selia-blog__rowlink" href={article.url}>
        <span className="selia-blog__ord" aria-hidden="true">
          {ordinal(index)}
        </span>
        {article.image && (
          <span className="selia-blog__thumb">
            <img src={article.image} alt="" loading="lazy" decoding="async" />
          </span>
        )}
        <span className="selia-blog__rowbody">
          <ArticleDate value={article.created_at} locale={locale} />
          <span className="selia-blog__name">{article.name}</span>
          {article.description && <span className="selia-blog__desc">{article.description}</span>}
        </span>
        <i className="selia-blog__chev sicon-arrow-left" aria-hidden="true" />
      </a>
    </li>
  );
}

export function BlogTeaser({ data }: { data: BlockData }) {
  const { locale, t } = useTranslation();
  const title = readTextOr(data, 'title', PREFIX, '');
  const count = Math.max(1, Math.min(12, readNumber(data, 'count', PREFIX, DEFAULT_COUNT)));
  const [category, setCategory] = useState<string | null>(null);

  const { data: overview } = useQuery(blog.queries.overview());

  // Only fetched once a chip is chosen — the overview already carries the
  // unfiltered list, so an idle visit costs one request, not two.
  const { data: filtered, isFetching } = useQuery({
    ...blog.queries.articles({ category: category ?? undefined }),
    enabled: !!category,
  });

  const categories = overview?.categories ?? [];
  const articles = (category ? filtered?.data : overview?.articles) ?? [];
  const visible = articles.slice(0, count);

  /* The blog index is not in the payload, but every article URL is — the store
     prefix and the `/blog` segment are the same for all of them, so the root is
     derived rather than hardcoded (a hardcoded `/blog` 404s on a store served
     from `/ar/…`). No article → no link, rather than a link to nowhere. */
  const blogRoot = (() => {
    const url = articles[0]?.url ?? '';
    const at = url.indexOf('/blog/');
    return at > 0 ? `${url.slice(0, at)}/blog` : null;
  })();

  if (!overview || (!categories.length && !visible.length)) return null;

  const [lead, ...rest] = visible;

  return (
    <SeliaSection title={title} align="start" variant="blog">
      {/* The filter and the «كل المقالات» link are siblings of the heading, not
          a wrapper around both: on the grid they belong in different cells (the
          tabs under the title, the link on the opposite edge), and a wrapper
          would force them onto one line 700px apart. */}
      {categories.length > 0 && (
        <div
          className="selia-blog__filters"
          role="tablist"
          aria-label={t('blocks.home.blog_categories', 'تصنيفات المدونة')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={!category}
            className={`selia-blog__chip${!category ? ' is-active' : ''}`}
            onClick={() => setCategory(null)}
          >
            {t('blocks.home.blog_all_chip', 'الكل')}
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={category === String(item.id)}
              className={`selia-blog__chip${category === String(item.id) ? ' is-active' : ''}`}
              onClick={() => setCategory(String(item.id))}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      {blogRoot && (
        <a className="selia-blog__all" href={blogRoot}>
          {t('blocks.home.blog_all_articles', 'كل المقالات')}
          <i className="sicon-arrow-left" aria-hidden="true" />
        </a>
      )}

      {lead ? (
        <div className={`selia-blog${isFetching ? ' is-loading' : ''}`}>
          <Feature
            article={lead}
            locale={locale}
            readLabel={t('blocks.home.blog_read', 'اقرأ المقال')}
          />
          {rest.length > 0 && (
            <ul className="selia-blog__list">
              {rest.map((article, i) => (
                <Row key={article.id} article={article} locale={locale} index={i + 1} />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="selia-empty">لا توجد مقالات في هذا التصنيف بعد.</p>
      )}
    </SeliaSection>
  );
}
