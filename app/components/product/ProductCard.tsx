import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard as EngineProductCard } from '@salla.sa/twilight-theme-engine/product';
/* Imported under a different name on purpose: this component also has a local
   `product` (the value handed to the engine card), and the two colliding made
   `useQuery`'s generic inference circular. */
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product, ProductRating } from '@salla.sa/twilight-theme-engine/types';
import { useProductCardSettings } from '../../lib/productCardSettings';
import { ProductCardGallery } from './ProductCardGallery';

type ProductCardProps = ComponentProps<typeof EngineProductCard>;

/** How long a fetched detail stays fresh. A card only needs the gallery and the
 *  rating from it, and both change rarely — this keeps a scroll back up the
 *  page from re-requesting every product it passes. */
const DETAIL_STALE_MS = 10 * 60 * 1000;

/**
 * The store's product card.
 *
 * The design is a **theme setting group** («إعدادات كارت المنتج»), applied as
 * custom properties + data attributes on `.app-inner` by `ThemeLayout` — see
 * `app/lib/productCardSettings.ts` and `04-components/product-card.scss`. This
 * file is only the part CSS cannot do: the content the engine card does not
 * render.
 *
 * 1. **The short line.** The reference card carries a sentence under the name.
 *    The engine prints `product.subtitle` there and nothing else, and a Salla
 *    list response almost never has one — so the card would be name → price,
 *    with the design's middle missing. A product's `description` is present,
 *    but it is HTML and often a paragraph: {@link shortLine} strips it and cuts
 *    it at a word. A real subtitle always wins, so a merchant who writes one
 *    still controls the line.
 *
 *    Done by *rewriting the prop*, not by injecting DOM after mount: the engine
 *    renders the subtitle server-side, so the line is in the first paint and
 *    nothing shifts when the card hydrates.
 *
 * 2. **The review count.** The engine prints the average (`4.8`) and stops.
 *    The reference prints `4.8 (120)`. `data-count` on the rating row lets the
 *    stylesheet append it with `attr()` — no extra node, no re-render, and the
 *    row's height never changes.
 *
 *    The row itself only exists when the product has stars (`rating?.stars && …`
 *    in the engine), so a store with unreviewed products gets cards with the
 *    star row and cards without it, in the same grid. {@link ProductCard} fills
 *    the empty case with «لا تقييمات» — the merchant's switch, and never a
 *    made-up average.
 *
 * 3. **The gallery.** A product has several photos; a list response carries
 *    only the first (`image`), and the type says so: `images` is "detail
 *    responses only". So the card fetches its own detail — once, lazily, when
 *    it scrolls into view — and hands the photos to {@link ProductCardGallery}.
 *    The same fetch fills in `rating`, which some list endpoints omit
 *    entirely: without it a card can show stars that the store does have, and
 *    the merchant reads that as "the rating is broken".
 *
 *    Both are behind the `product_card_gallery` switch: a catalogue of ten
 *    thousand products should be able to say "no extra requests per card".
 *
 * Deliberately **not** here: the wishlist button. The engine already renders it
 * on the image corner for vertical cards — the design wants exactly that — so
 * the old "hide it and portal a copy into the footer" dance is gone. The corner
 * button is also the one the engine keeps in sync with `useWishlist` on every
 * render, which a portaled copy never could.
 */
export function ProductCard(props: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  /* Provided by ThemeLayout; falls back to the reference defaults when a card
     is rendered outside the layout (unit tests, editor previews). */
  const settings = useProductCardSettings();
  const { t } = useTranslation();

  const [inView, setInView] = useState(false);
  const [hosts, setHosts] = useState<{ anchor: HTMLElement | null; content: HTMLElement | null }>({
    anchor: null,
    content: null,
  });

  const productId = props.product?.id == null ? '' : String(props.product.id);
  /* A block that already handed us a full product (the featured slot) needs no
     request at all. */
  const ownImages = props.product?.images?.length ? props.product.images : null;
  const wantsDetail = settings.gallery && !ownImages && !!productId;

  /* Nothing is fetched for a card the customer never scrolls to. `rootMargin`
     buys the request a head start so the gallery is ready before the swipe.
     
     The observed node is the engine's card, **not** `ref`: the wrapper is
     `display: contents` so that the card stays a direct grid item, and an
     element with no box never intersects — observing it meant the observer
     fired zero times and every card silently stayed at `inView: false`. */
  useEffect(() => {
    if (!wantsDetail) return;
    const root = ref.current;
    if (!root) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const target = root.querySelector<HTMLElement>('.s-product-card') ?? root.firstElementChild;
    /* No card node yet is not a reason to never fetch — a card without photos
       is a worse bug than a card that asked early. */
    if (!target) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin: '200px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [wantsDetail]);

  /* The engine's options already carry `Product` and the scope-aware query key,
     so the result is typed without a generic — adding one would replace the
     key tuple with `readonly unknown[]` and the options stop matching. */
  const detail = useQuery({
    ...productApi.queries.detail(productId),
    enabled: wantsDetail && inView,
    staleTime: DETAIL_STALE_MS,
  });

  const images = ownImages ?? detail.data?.images ?? [];
  /* A rating from the list is authoritative when present; the detail is the
     fallback for endpoints that drop it. */
  const rating: ProductRating | undefined = props.product?.rating ?? detail.data?.rating;
  const reviewCount = Number(rating?.count ?? 0);
  /* The engine's row is `product.rating?.stars && <div …>`, so a product with
     no reviews has no row *and no gap where one would be* — two cards in the
     same grid then disagree about where the price sits. */
  const hasStars = Number(rating?.stars ?? 0) > 0;

  /* Only rebuild the product object when what it feeds actually changes — the
     engine card is memoised, and a fresh object every render would defeat that
     on every list scroll. */
  const product = useMemo(
    () => withCardData(props.product, rating),
    [props.product, rating]
  );

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const sync = () => {
      root.querySelectorAll<HTMLElement>('salla-add-product-button').forEach((el) => {
        // the engine ships the card button `fill="outline"`; the design wants it solid
        el.setAttribute('fill', 'solid');
        el.setAttribute('loader-position', 'center');
      });

      if (reviewCount > 0) {
        root.querySelector('.s-product-card-rating')?.setAttribute('data-count', String(reviewCount));
      }

      /* The gallery's two hosts are engine-owned nodes: the image anchor (the
         track lives inside it so the photo stays a link) and the content
         column (the dots are a grid row of it). */
      const anchor = root.querySelector<HTMLElement>('.s-product-card-image > a');
      const content = root.querySelector<HTMLElement>('.s-product-card-content');
      setHosts((previous) =>
        previous.anchor === anchor && previous.content === content ? previous : { anchor, content }
      );
    };

    sync();
    /* The card hydrates in pieces (the add button is a web component), so the
       nodes this touches can appear after the first pass. */
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [reviewCount]);

  const gallery = settings.gallery && images.length > 1 && hosts.anchor ? (
    <ProductCardGallery
      images={images}
      name={product.name}
      anchor={hosts.anchor}
      content={hosts.content}
    />
  ) : null;

  /* An unreviewed product still needs the row: the reference card is one shape
     for every product, and a grid where some cards have a star row and others
     do not makes the prices jump. The wording is the store's own «لا تقييمات»
     rather than a made-up score — an invented 5.0 would be a lie the merchant
     cannot see. */
  const emptyRating =
    settings.rating && settings.ratingEmpty && !hasStars && hosts.content
      ? createPortal(
          <div className="pc-rating">
            <i className="sicon-star2" aria-hidden="true" />
            <span>{t('pages.products.no_ratings', 'لا تقييمات')}</span>
          </div>,
          hosts.content
        )
      : null;

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      <EngineProductCard {...props} product={product} />
      {gallery}
      {emptyRating}
    </div>
  );
}

/** Long enough for two lines at a card's width, short enough that the cut is
 *  never mid-sentence in a place the eye notices. */
const SHORT_LINE_MAX = 150;

/** Block-level tags become line breaks before the tags are stripped — without
 *  this, a `<ul>` of size rows collapses into one run (`36الطول:130`) and the
 *  card prints a spec table as if it were a sentence. */
const BLOCK_TAGS = /<\/(?:p|li|div|h[1-6]|tr|td|th|blockquote|figcaption)>|<br\s*\/?>/gi;

function decodeEntities(html: string): string {
  return html
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** HTML → one line of text, block boundaries kept as `\n`. */
export function plainText(html: string): string {
  return decodeEntities(html.replace(BLOCK_TAGS, '\n').replace(/<[^>]*>/g, ' '))
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * The one line of a product description that belongs on a card.
 *
 * A Salla description is often not prose: this store's are size tables
 * (`المقاس:36 الطول:130 الكم:5.5`). Cutting the first 150 characters of that
 * prints a column of numbers under the product name, which reads as a bug.
 *
 * So the text is split into fragments and the first one that *reads like a
 * sentence* wins — at least five words, and fewer than one character in five
 * being a digit. A product whose description is nothing but a spec table
 * returns `''`, and the card simply has no line: an absent sentence is better
 * than a false one.
 */
export function descriptionLine(html: string | undefined): string {
  if (!html) return '';
  const fragments = plainText(html).split(/\n+|(?<=[.!؟?])\s+/);

  for (const fragment of fragments) {
    const text = fragment.trim();
    if (!text) continue;
    const words = text.split(/\s+/).length;
    const digits = (text.match(/[\d٠-٩]/g) ?? []).length;
    if (words >= 5 && digits / text.length < 0.18) return text;
  }
  return '';
}

/** The card's short line: the merchant's subtitle if there is one, otherwise
 *  the first real sentence of the description, cut at a word boundary.
 *  Returns `''` when the product has neither — the stylesheet then drops the
 *  row entirely instead of reserving an empty one. */
export function shortLine(product: Product | undefined): string {
  if (!product) return '';
  const subtitle = (product.subtitle ?? '').trim();
  if (subtitle) return subtitle;

  const text = descriptionLine(product.description);
  if (!text || text.length <= SHORT_LINE_MAX) return text;

  const cut = text.slice(0, SHORT_LINE_MAX);
  const space = cut.lastIndexOf(' ');
  /* A single 150-character "word" (a URL, a SKU run) has no boundary to cut
     at — hard-cut rather than hand the card an empty line. */
  return `${(space > 60 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/**
 * The product as the engine card should receive it: a short line where the
 * list left none, and a rating the list may have dropped.
 *
 * Returns the SAME object when neither applies — the engine card is memoised
 * and a needless new identity re-renders every card in the list.
 */
function withCardData(product: Product, rating: ProductRating | undefined): Product {
  const line = (product?.subtitle ?? '').trim() ? '' : shortLine(product);
  const needsRating = !!rating && !product?.rating;

  if (!line && !needsRating) return product;
  return {
    ...product,
    ...(line ? { subtitle: line } : null),
    ...(needsRating ? { rating } : null),
  };
}
