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
import { productBadge } from '../../lib/productBadge';
import { ProductCardActions } from './ProductCardActions';
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
 * 2. **The meta rail.** The engine prints the average (`4.8`) and stops, in a
 *    row of its own under the name. The label wants maker and score on ONE
 *    10.5px line above the name — the order a shopper decides in. So the
 *    engine's row is kept (it is server-rendered, and `data-count` lets the
 *    stylesheet append `(120)` with `attr()` — no extra node, no re-render),
 *    and the merchant's brand is portaled into it at the start.
 *
 *    The row itself only exists when the product has stars (`rating?.stars && …`
 *    in the engine), so a store with unreviewed products gets cards with the
 *    rail and cards without it, in the same grid. {@link ProductCard} fills the
 *    empty case with «لا تقييمات» — the merchant's switch, and never a
 *    made-up average — and a product with no brand and no score simply has no
 *    rail: an absent line is better than a reserved one.
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
 * 4. **The action rail.** Four controls share the print's inline-end corner:
 *    the wishlist heart (the engine's own position, so nothing moves), quick
 *    view, compare and similar products. They are one portalled group rather
 *    than four absolutely-placed buttons — see {@link ProductCardActions} for
 *    why the heart is the rail's own copy reading the engine's wishlist store.
 *    The card is marked `data-pc-actions="1"` while the rail is mounted and
 *    the stylesheet hides the engine's corner heart under that mark, so the
 *    same corner never shows two hearts. Layouts that the theme does not
 *    restyle (`horizontal`, `fullImage`) keep the engine's card untouched.
 *
 *    The engine's own heart stays in the server-rendered HTML: it is what a
 *    customer sees before hydration, and the rail takes over from it rather
 *    than leaving the corner empty for a frame.
 *
 * 5. **The tag.** See the note above {@link discountBadge} — one rule for
 *    every state, printed on the card root so it can hang over the card's edge.
 */
export function ProductCard(props: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  /* Provided by ThemeLayout; falls back to the reference defaults when a card
     is rendered outside the layout (unit tests, editor previews). */
  const settings = useProductCardSettings();
  const { t } = useTranslation();

  const [inView, setInView] = useState(false);
  /* A broken photograph is a state the card has to answer, and the engine
     cannot: it renders `<img src="">` and the browser paints its own broken
     icon inside the print. One capture listener covers every image the card
     ever mounts (the single photo, the gallery's slides) without touching the
     engine's markup. */
  const [imgFailed, setImgFailed] = useState(false);
  const [hosts, setHosts] = useState<{
    anchor: HTMLElement | null;
    content: HTMLElement | null;
    plate: HTMLElement | null;
    rating: HTMLElement | null;
    card: HTMLElement | null;
  }>({
    anchor: null,
    content: null,
    plate: null,
    rating: null,
    card: null,
  });

  const productId = props.product?.id == null ? '' : String(props.product.id);
  /* The engine prints its own heart on the print's corner for vertical cards;
     `horizontal` and `fullImage` are different cards the theme does not
     restyle, so the rail stays out of them rather than landing unstyled. */
  const layout = props.layout ?? 'vertical';
  const wantsActions = layout !== 'horizontal' && layout !== 'fullImage';
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
         column (the dots are a grid row of it). The CARD ROOT is the badge's
         host: the tag hangs over the card's top edge, so it has to live
         outside the print — the print clips (it owns the photo's corner and the
         zoom), and a node inside it would be cut in half. The RATING row is the
         fourth: the maker's mark is portaled INTO it, so the two share one
         10.5px rail instead of stacking two thin lines above the name. */
      const anchor = root.querySelector<HTMLElement>('.s-product-card-image > a');
      const content = root.querySelector<HTMLElement>('.s-product-card-content');
      const plate = root.querySelector<HTMLElement>('.s-product-card-image');
      const ratingRow = root.querySelector<HTMLElement>('.s-product-card-rating');
      const cardRoot = root.querySelector<HTMLElement>('.s-product-card-vertical');
      /* The rail's own corner marker. Set as an attribute instead of a class so
         the stylesheet can hide the engine's heart without a second portal, and
         read from the engine's node so it survives every card re-render. */
      if (cardRoot) cardRoot.setAttribute('data-pc-actions', wantsActions ? '1' : '0');
      setHosts((previous) =>
        previous.anchor === anchor &&
        previous.content === content &&
        previous.plate === plate &&
        previous.rating === ratingRow &&
        previous.card === cardRoot
          ? previous
          : { anchor, content, plate, rating: ratingRow, card: cardRoot }
      );
    };

    sync();
    /* The card hydrates in pieces (the add button is a web component), so the
       nodes this touches can appear after the first pass. */
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [reviewCount, wantsActions]);

  /* `error` does not bubble, so it is caught in the capture phase on the card
     itself — that covers the engine's single photo AND every gallery slide the
     portal mounts later, without a listener per image. */
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onError = (event: Event) => {
      if ((event.target as HTMLElement | null)?.tagName !== 'IMG') return;
      setImgFailed(true);
    };
    root.addEventListener('error', onError, true);
    return () => root.removeEventListener('error', onError, true);
  }, []);

  const gallery = settings.gallery && images.length > 1 && hosts.anchor ? (
    <ProductCardGallery
      images={images}
      name={product.name}
      anchor={hosts.anchor}
      content={hosts.content}
      dotsHost={hosts.plate}
    />
  ) : null;

  /* The rail lives on the print, next to the engine's own heart — which the
     stylesheet hides under `[data-pc-actions='1']` the moment this mounts. */
  const actions =
    wantsActions && hosts.plate ? <ProductCardActions product={product} plate={hosts.plate} /> : null;

  /* ---------- the meta rail ----------

     The maker's mark and the score share ONE 10.5px line above the name: maker
     at the start, score at the end, and whichever is missing closes the gap.
     That is one row instead of two thin ones, and it is why the label reads
     top-down — who made it, what it is, what it costs — instead of starting
     with a rating the shopper has not asked for yet.

     The score itself stays the ENGINE's row (it is in the server-rendered
     HTML, so the number is there before hydration and the stylesheet prints the
     count with `attr()`); the brand is portaled into it. When the engine
     renders no row — an unreviewed product — the brand gets a line of its own,
     and when the merchant turned the empty state off there is no row at all
     rather than an empty one held open for symmetry. */
  const brandName = (product.brand?.name ?? '').trim();
  const brandNode = brandName ? <span className="pc-brand">{brandName}</span> : null;
  /* `settings.rating` off hides the engine's row, so the brand must not be
     portaled into a node the stylesheet has just hidden. */
  const ratingHost = settings.rating && hasStars ? hosts.rating : null;
  const brandInRail = ratingHost && brandNode ? createPortal(brandNode, ratingHost) : null;

  const emptyRating =
    !ratingHost && settings.rating && settings.ratingEmpty && !hasStars && hosts.content
      ? createPortal(
          <div className="pc-rating">
            <i className="sicon-star2" aria-hidden="true" />
            <span>{t('pages.products.no_ratings', 'لا تقييمات')}</span>
            {brandNode}
          </div>,
          hosts.content
        )
      : null;

  /* no score at all: the brand is the whole rail */
  const brandAlone =
    !ratingHost && !emptyRating && brandNode && hosts.content
      ? createPortal(brandNode, hosts.content)
      : null;

  /* ---------- the print's own states ----------

     A product with no photograph — or one whose photograph 404s — used to leave
     the print as a blank well, which reads as a broken card. The well now
     carries the product's initial as a watermark in the display face: the
     card is a deliberate plate, it still identifies the product, and the
     monogram is decorative (`aria-hidden`) because the name beside it already
     says everything. */
  const imageUrl = props.product?.image?.url ?? '';
  const monogram = !imageUrl || imgFailed ? (product.name ?? '').trim().charAt(0) || '·' : '';
  const monogramPlate =
    monogram && hosts.plate
      ? createPortal(
          <span className="pc-monogram" aria-hidden="true">
            {monogram}
          </span>,
          hosts.plate
        )
      : null;

  /* The store card printed only the engine's promotion title, so a product
     discounted without a Salla promotion wore NO tag in the grid — while the
     very same product showed `-60%` in the mega menu. The rule is now one
     function (`lib/productBadge`), and this is the surface that renders it for
     every case.

     The tag REPLACES the engine's node rather than sitting beside it: the
     engine prints `.s-product-card-promotion-title` inside the print, where it
     is clipped by the photo's corner and can never hang over the card's edge.
     The stylesheet hides that node on this layout and this portal prints the
     same words — pre-order label, promotion title, availability, computed
     discount — as one `.pc-badge` that follows the merchant's badge design
     (`lib/productBadgeStyle`). */
  const badgeStyle = settings.badgeStyle;
  const badge = settings.badge
    ? productBadge(
        product,
        /* the merchant's own wording for availability, and the store's string
           when they left it empty */
        badgeStyle.outText || t('pages.products.out_of_stock', 'نفدت الكمية'),
        badgeStyle.saleTemplate
      )
    : null;
  const discountBadge =
    badge && (hosts.card ?? hosts.plate)
      ? createPortal(
          <span className={`pc-badge${badge.out ? ' pc-badge--out' : ''}`}>
            <span className="pc-badge__text">{badge.text}</span>
          </span>,
          (hosts.card ?? hosts.plate) as HTMLElement
        )
      : null;

  return (
    <div ref={ref} style={{ display: 'contents' }}>
      <EngineProductCard {...props} product={product} />
      {gallery}
      {actions}
      {brandInRail}
      {brandAlone}
      {emptyRating}
      {monogramPlate}
      {discountBadge}
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

/** HTML → one line of text, block boundaries kept as `\n`.
 *
 *  Order matters: a description can arrive escaped (`&lt;p class="…"&gt;`),
 *  and stripping tags BEFORE decoding leaves the markup on the card as visible
 *  text — the store printed `p class="ql-direction-rtl"> <span …` under a
 *  product name. So decode, strip, and repeat while decoding keeps revealing
 *  tags; the loop settles on plain prose in one or two passes for a normal
 *  description and stops immediately when there is nothing to decode. */
export function plainText(html: string): string {
  let text = html;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decodeEntities(text.replace(BLOCK_TAGS, '\n').replace(/<[^>]*>/g, ' '));
    if (next === text) break;
    text = next;
  }
  return text
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
