import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { prefersReducedMotion } from '../../lib/homeBlock';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';
import { useQuery } from '@tanstack/react-query';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { buildCategoryIndex, enrichMenuNode } from '../../lib/menuCategoryIndex';
import { MorphMenuCard, type MenuCardProduct } from '../product/MorphMenuCard';
import {
  ProductCardSettingsContext,
  readProductCardOverrides,
  productCardOverrideAttrs,
  productCardOverrideVars,
  resolveProductCardSettings,
  useProductCardSettings,
} from '../../lib/productCardSettings';
import { SallaProductsList, ProductsListSkeleton } from '@salla.sa/twilight-components-react';
import type { CurtainSlot } from '../../lib/curtainSlots';
import { menuProductIds } from '../../lib/menuProducts';
import { menuNodeImage } from '../../lib/menuNodeImage';
import { builtInMenuKind } from '../../lib/menuItemKind';
import {
  activeSlot,
  categoryIdFromUrl,
  fallbackSlot,
  imgSrc,
  productIdFromUrl,
  rowsFrom,
} from '../../lib/curtainSlots';

/* ==========================================================================
   The curtain mega menu — the hovered category panel (≥1025px only).
   Ported from the Twig theme (`morph-header.js` §3 + curtain twig/SCSS); the
   rules quoted here are the old theme's and each one already cost a debug
   round there (`docs/header-reference.md`):

   · TWO columns: the hovered category's SUBcategories (54px discs, level 2)
     and ONE merchant slot from `curtain_slots` — Salla has exactly two
     category levels, so column 3 can never be taxonomy (rule 12). There is no
     disc column for the category itself: the nav already names it, and the
     identity moved into the subcategory column's label (its `menu.title`).
   · Hovering ANY nav category opens this panel — a childless one shows its
     empty state; hover is not a navigation gesture (rule 9). Every rendered
     node is a SUBcategory, so every one is drillable.
   · A category with children is still a link: click follows the href, hover
     focuses and swaps the featured rectangle (rule 16).
   · The featured rectangle prefers the merchant's featured picks
     (`node.products` → selected) and falls back to the category's own
     products (source "categories") rather than an empty state; the heading
     swaps with it and only a featured list carries the count.
   · FOUR products PER VIEW, in ONE row that never wraps — a second row pushed
     the panel past the fold (rule 23). Everything past the fourth is one
     swipe (or one arrow) away: the row is a reel, not a slice. Five 210px
     cards still fit a wide panel, so the arrows are driven by a MEASURED
     overflow, not by the count.
   ========================================================================== */

export interface CurtainLabels {
  noSubs: string;
  noSlot: string;
  noSlotHere: string;
  slotHint: string;
  noSlotMissing: string;
  slotMissingHint: string;
  featured: string;
  categoryProducts: string;
  emptyFeatured: string;
  reelPrev: string;
  reelNext: string;
}

/** The store menu node the curtain reads, plus the featured products the
 * menu builder can attach (`products` are ids, not items).
 *
 * `unknown` on purpose: the API answers an array ONLY when the merchant picked
 * featured products and the empty string `""` for every other node, so the
 * field is normalised with `menuProductIds` — never read as an array here. */
export interface CurtainMenu extends MenuItem {
  products?: unknown;
  children?: CurtainMenu[];
  /** the REAL category id behind the row, filled by the title-match enrichment
      (`menuCategoryIndex.ts`) — a node's own `id` is a menu-ROW id and its url
      is a store-root link on form-builder menus, so without this the
      `source="categories"` fallback has nothing to request (rule 29's data
      half) */
  categoryId?: number | null;
}

/* ── one gradient/category disc with its name beneath it ──────────────────── */
function CurtainNode({
  node,
  active,
  onDrill,
}: {
  node: CurtainMenu;
  active: boolean;
  onDrill: (node: CurtainMenu) => void;
}) {
  // anything with a url is a LINK, including a category with children (rule 16)
  const navigable = Boolean(node.url);
  /* The API's image field is not stable; the resolver lives in lib so the
     render stays about layout. The node objects are stable between focus
     changes (enrichMenuNode is memoised), so the bounded deep search runs once
     per node instead of once per hover. */
  const img = useMemo(() => menuNodeImage(node), [node]);
  const className = `morph-node morph-node--2${active ? ' is-active' : ''}`;

  const media = (
    <span className="morph-node__media">
      <span className="morph-node__disc" data-img={img || ''} style={img ? { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {img ? (
          <img
            className="morph-node__img"
            src={img}
            alt=""
            /* eager, never lazy: the curtain OPENS on hover, and a lazy fetch
               here starts only on a later layout pass — paired with the
               panel's opacity entrance it reads as "the picture never shows"
               (deep image audit, 2026-10). The urls are tiny category thumbs,
               300-900px jpgs; eager costs nothing. */
            decoding="async"
            style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        ) : (
          <span className="morph-node__img" />
        )}
      </span>
    </span>
  );
  const name = <span className="morph-node__name">{node.title}</span>;

  if (navigable) {
    return (
      <Link
        to={node.url!}
        className={className}
        data-node-id={String(node.id)}
        data-level="2"
        /* `aria-pressed` is a button-only state and is invalid on a link. The
           active disc is a hover/focus highlight, not a selected navigation
           destination, so it stays a visual cue only. */
      >
        {media}
        {name}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={className}
      data-node-id={String(node.id)}
      data-level="2"
      aria-pressed={active}
      onClick={() => onDrill(node)}
    >
      {media}
      {name}
    </button>
  );
}

/* ── the merchant slot column (content only; the layer wrapper is the panel's
   structure and stays put so its grid slot survives every focus change —
   rule 18's split is by content, never by wrapper) ──────────────────────── */
function SlotProductCard({ productId }: { productId: number }) {
  const loader = useCallback(
    () => product.list({ source: 'selected', sourceValue: [productId], perPage: 1 }),
    [productId]
  );
  return (
    <Suspense fallback={<ProductsListSkeleton />}>
      <SallaProductsList loader={loader}>
        {(items: unknown[]) =>
          items
            .slice(0, 1)
            .map((item) => (
              <MorphMenuCard
                key={String((item as { id: unknown }).id)}
                product={item as MenuCardProduct}
              />
            ))
        }
      </SallaProductsList>
    </Suspense>
  );
}

function SlotColumn({
  menu,
  focus,
  slots,
  slotsRaw,
  labels,
}: {
  menu: CurtainMenu;
  focus: CurtainMenu | null;
  slots: Map<string, CurtainSlot>;
  /* the setting's raw value — the FOUR honest states need it: with no rows at
     all the message is a theme defect, not a merchant instruction (see the old
     slotInner triage, old rules 15b) */
  slotsRaw: unknown;
  labels: CurtainLabels;
}) {
  // precise resolver stays precise (null for unmatched categories), and the
  // fallback draw is a separate call (old rule 26)
  const slot =
    activeSlot(slots, menu, focus) ??
    fallbackSlot(slots, `menu:${String(menu.id)}|${menu.url ?? ''}|focus:${String(focus?.id ?? '')}`);

  if (!slot) {
    const configured = new Set(slots.values()).size;
    const rawText = slotsRaw == null ? '' : JSON.stringify(slotsRaw);
    let text = labels.noSlot;
    let hint = labels.slotHint;
    if (configured) {
      text = labels.noSlotHere;
    } else if (!rawText || rawText === '[]' || rawText === 'null' || rawText === '""') {
      text = labels.noSlotMissing;
      hint = labels.slotMissingHint;
    }
    /* These strings are addressed to the MERCHANT ("this is a theme problem,
       re-saving the form will not fix it") — measured in the storefront, where
       a shopper read them as broken content. The diagnostic is a build-time
       affordance: in a production bundle an unconfigured slot shows the same
       neutral line a section without products shows, and nothing else. */
    if (!import.meta.env.DEV) {
      return <p className="morph-layer__empty">{labels.emptyFeatured}</p>;
    }
    return (
      <>
        <p className="morph-layer__empty">{text}</p>
        <p className="morph-layer__empty morph-layer__empty--hint">{hint}</p>
      </>
    );
  }

  if (slot.type === 'image') {
    const src = imgSrc(slot.image);
    if (!src) {
      return <p className="morph-layer__empty">{labels.noSlot}</p>;
    }
    // ONE rectangle, caption ON the picture (rule 27). No invented "مميزة"
    // fallback (rule 28): no name → no caption at all.
    const name = slot.title || focus?.title || menu.title || '';
    return (
      <Link
        to={focus?.url || menu.url || '/'}
        className="morph-spotlight"
        data-morph-slot="image"
      >
        <img
          className="morph-spotlight__img"
          src={src}
          alt=""
          /* eager: the slot is the first thing the eye lands on when the
             curtain opens — a lazy fetch can miss the opening beat entirely
             (deep image audit, 2026-10). */
          decoding="async"
        />
        {name && <span className="morph-spotlight__title">{name}</span>}
      </Link>
    );
  }

  const id = productIdFromUrl(slot.product);
  if (!id) {
    return <p className="morph-layer__empty">{labels.noSlot}</p>;
  }
  /* The merchant's PRODUCT slot wears the SAME mega-menu card the featured
     rectangle shows (`MorphMenuCard`) — plus its own shine, so it reads as a
     feature and not a stray row card. The wrapper stays inside the spotlight
     frame (a platform card owns its own internals; forcing the aspect box on
     it is how a platform upgrade breaks the theme — rule 23's slot half). */
  return (
    <div className="morph-spotlight morph-spotlight--product" data-morph-slot="product">
      <SlotProductCard productId={Number(id)} />
    </div>
  );
}

/* ── the featured rectangle below the two layers ─────────────────────────── */
function FeaturedRow({
  node,
  labels,
  pieces,
}: {
  node: CurtainMenu;
  labels: CurtainLabels;
  pieces: (n: number) => string;
}) {
  const { isRTL } = useTranslation();
  const ids = menuProductIds(node.products);
  const hasFeatured = ids.length > 0;
  /* The merchant may attach ten products to a category, and the row used to
     slice them to four — the rest were silently dropped, with no way to reach
     them. It is a REEL now: four cards per view, the rest one swipe (or one
     arrow) away, and the panel keeps its height because the row never wraps.
     24 is Salla's own page ceiling; a featured list longer than that is a
     catalogue, not a menu. */
  const limit = hasFeatured ? Math.min(ids.length, 24) : 12;
  const reelRef = useRef<HTMLDivElement>(null);
  const [reel, setReel] = useState({ overflow: false, atStart: true, atEnd: true });
  /* The fallback needs a REAL category id, and a node's own `id` is a menu-ROW
     id: sent as `source_value` it answers 422 and the rectangle stays empty for
     every category without featured picks (the majority of them). The real id
     travels in the node's url (`categoryIdFromUrl`), the built-in offers page
     has a source of its own, and anything else gets the honest empty state
     instead of a request that cannot succeed. */
  /* `categoryIdFromUrl` reads the node url — and on form-builder menus that
     url is the store root, carrying no category id: the title-match
     enrichment (`menuCategoryIndex.ts`) then supplies the category's raw
     `id_` as the second source (the node's own `id` is a menu-ROW id and
     answers 422 — rule 29). The built-in offers page keeps a source of its
     own; anything else gets the honest empty state. */
  const categoryId = categoryIdFromUrl(node.url) || node.categoryId || null;
  const offers = !hasFeatured && !categoryId && builtInMenuKind(node) === 'offers';
  const source: ProductsListSource = hasFeatured
    ? 'selected'
    : categoryId
      ? 'categories'
      : 'offers';
  const value: number[] = hasFeatured ? ids : categoryId ? [Number(categoryId)] : [];
  /* `offers` needs no value, so the empty state keys on "can any source fill
     this?", not on `value.length` alone. */
  const canFill = hasFeatured || !!categoryId || offers;

  const loader = useCallback(
    // only ever called by the list below, i.e. when `canFill`
    () => product.list({ source, sourceValue: value, perPage: limit }),
    [source, value.join(','), limit] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* Overflow is MEASURED, not counted: five 210px cards still fit a wide
     panel, so "more than four" and "needs a scroll" are different questions —
     and the answer changes with the viewport. RTL inverts `scrollLeft` (0 at
     the inline start, negative towards the end), hence the absolute value. */
  const measure = useCallback(() => {
    const track = reelRef.current?.querySelector<HTMLElement>('.morph-featured__list');
    if (!track) return;
    const rest = track.scrollWidth - track.clientWidth;
    const x = Math.abs(track.scrollLeft);
    const next = { overflow: rest > 2, atStart: x <= 2, atEnd: x >= rest - 2 };
    setReel((prev) =>
      prev.overflow === next.overflow && prev.atStart === next.atStart && prev.atEnd === next.atEnd
        ? prev
        : next
    );
  }, []);

  useEffect(() => {
    const host = reelRef.current;
    if (!host) return;
    measure();
    /* The track only exists once the list resolves, so the HOST is what gets
       observed; `scroll` does not bubble, but a capture listener on the host
       still sees it (and a resize of the host covers the async first paint).
       The mutation observer is what catches a DATA swap: the next category's
       cards are the same height, so nothing resizes and the resize observer
       stays quiet — a stale "overflow" would leave arrows on a row of four. */
    host.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(host);
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(measure);
    mo?.observe(host, { childList: true, subtree: true });
    return () => {
      host.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
      mo?.disconnect();
    };
  }, [measure]);

  /* One page at a time, in the writing direction: `scrollBy` takes a physical
     offset, so RTL negates it. `scroll-snap-type` then lands the reel on a
     card edge instead of wherever the arithmetic stopped. */
  const nudge = (dir: 1 | -1) => {
    const track = reelRef.current?.querySelector<HTMLElement>('.morph-featured__list');
    if (!track) return;
    const step = Math.max(160, track.clientWidth * 0.8);
    track.scrollBy({
      left: (isRTL ? -dir : dir) * step,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="morph-featured">
      <div className="morph-featured__head">
        <p>
          {hasFeatured ? labels.featured : labels.categoryProducts} · {node.title}
        </p>
        {hasFeatured && <span>{pieces(ids.length)}</span>}
      </div>
      {!canFill ? (
        <p className="morph-featured__empty">{labels.emptyFeatured}</p>
      ) : (
        <div
          className="morph-featured__reel"
          ref={reelRef}
          data-reel={reel.overflow ? 'scroll' : 'fit'}
        >
          {/* the arrows bracket the track instead of floating over it: an
              overlay lands on the card the merchant just swiped into view */}
          {reel.overflow && (
            <button
              type="button"
              className="morph-featured__nav is-prev"
              aria-label={labels.reelPrev}
              disabled={reel.atStart}
              onClick={() => nudge(-1)}
            >
              {isRTL ? (
                <ArrowRightIcon width={16} height={16} strokeWidth={2.25} />
              ) : (
                <ArrowLeftIcon width={16} height={16} strokeWidth={2.25} />
              )}
            </button>
          )}
          <Suspense fallback={<ProductsListSkeleton />}>
            <SallaProductsList
              loader={loader}
              /* one page, no sentinel: a curtain row has no scroll to reach
                 one, and the old default paginated behind the panel */
              mode="once"
              itemsClassName="morph-featured__list"
            >
              {(items: unknown[]) =>
                items
                  .slice(0, limit)
                  .map((item) => (
                    <MorphMenuCard
                      key={String((item as { id: unknown }).id)}
                      product={item as MenuCardProduct}
                    />
                  ))
              }
            </SallaProductsList>
          </Suspense>
          {reel.overflow && (
            <button
              type="button"
              className="morph-featured__nav is-next"
              aria-label={labels.reelNext}
              disabled={reel.atEnd}
              onClick={() => nudge(1)}
            >
              {isRTL ? (
                <ArrowLeftIcon width={16} height={16} strokeWidth={2.25} />
              ) : (
                <ArrowRightIcon width={16} height={16} strokeWidth={2.25} />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── the panel itself ─────────────────────────────────────────────────────── */
export function MorphCurtain({
  open,
  menu,
  focusId,
  slots,
  slotsRaw,
  labels,
  pieces,
  onDrill,
}: {
  open: boolean;
  menu: CurtainMenu | null;
  /** the focused SUBcategory id (state p1); resolved against the CURRENT
     menu's children so a stale id from a previously hovered category cannot
     survive the hover (old renderCurtain guard, stateless version) */
  focusId: string | null;
  slots: Map<string, CurtainSlot>;
  slotsRaw: unknown;
  labels: CurtainLabels;
  pieces: (n: number) => string;
  onDrill: (node: CurtainMenu) => void;
}) {
  /* ── the Global Product Card System, component half ───────────────────────
     The curtain's cards wear the STORE's card design by default: the
     resolved context below starts as the global `ProductCardSettingsContext`
     value `ThemeLayout` provides, and the mega menu's own panel
     («تخصيص كارت الميجا منيو») can override properties PER PROPERTY —
     anything left on «مثل المتجر» inherits the global value live, so a
     radius change next week still moves a curtain that only overrode its
     ratio today.

     Two channels, mirroring how the global settings reach a card:
     - the switches the CARD decides in React (badge / wishlist / desc /
       rating) travel as a scoped context provider — every `MorphMenuCard`
       under the curtain reads the resolved value, never the raw setting;
     - the surface properties (ratio / radius / colours) travel as custom
       properties on the curtain root, which is a NEARER ancestor than
       `.app-inner` — the subtree follows the override, the rest of the
       store never sees it, and "inherit" writes nothing at all. */
  const { theme } = useTwilight();
  const globalCard = useProductCardSettings();
  const overrides = useMemo(
    () => readProductCardOverrides(theme?.settings as Record<string, unknown> | undefined),
    [theme?.settings]
  );
  const resolvedCard = useMemo(
    () => resolveProductCardSettings(globalCard, overrides),
    [globalCard, overrides]
  );
  const cardOverrideStyle = productCardOverrideVars(overrides) as CSSProperties;
  const cardOverrideAttrs = productCardOverrideAttrs(overrides) as Record<
    `data-${string}`,
    string
  >;

  /* The category tree fills what the menus payload left empty: the store's
     real tree carries a picture and the raw `id_` on every row, while a
     form-builder menu item answers `image: ""` and an url without a category
     id (both measured — see `menuCategoryIndex.ts`). One query, one index;
     the enrichment NEVER mutates the source rows, it produces a copy, and the
     merchant's own attached image still wins over the matched one. */
  const { data: categoryTree } = useQuery(category.queries.list());
  const categoryIndex = useMemo(
    () => buildCategoryIndex(categoryTree ?? []),
    [categoryTree]
  );
  const activeMenu = useMemo(
    () => (menu ? enrichMenuNode(menu, categoryIndex) : null),
    [menu, categoryIndex]
  );
  const kids = activeMenu?.children ?? [];
  const focus = focusId
    ? (kids.find((kid) => String(kid.id) === focusId) ?? null)
    : null;

  /* Delegated: the drill belongs to the panel, not to 30 separate handlers,
     and the engine `Link` carries no hover props. Re-rendering replaces
     nothing the pointer depends on — the anchors survive a focus change
     because React reconciles the same keyed elements (old rule 17, React
     translation). */
  const onPanelOver = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-node-id]'
    );
    if (!target) return;
    const node = kids.find((kid) => String(kid.id) === target.getAttribute('data-node-id'));
    if (node) onDrill(node);
  };
  const onPanelClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-node-id]'
    );
    // a link navigates (rule 16); only a non-anchor node (ours: none today,
    // defensive parity with the old click path) drills on click
    if (target?.tagName === 'A') return;

    if (!target) return;
    const node = kids.find((kid) => String(kid.id) === target.getAttribute('data-node-id'));
    if (node) onDrill(node);
  };

  return (
    <ProductCardSettingsContext.Provider value={resolvedCard}>
      <div
        className="morph-curtain"
        hidden={!open}
        data-morph-curtain
        data-testid="morph-curtain"
        style={cardOverrideStyle}
        {...cardOverrideAttrs}
      >
        <div
          className="morph-curtain__panel"
          role="region"
          onMouseOver={onPanelOver}
          onClick={onPanelClick}
        >
          <div className="morph-curtain__layers" data-morph-layers>
            <div className="morph-layer">
              {activeMenu && (
                <p className="morph-layer__label">{activeMenu.title}</p>
              )}
              {kids.length ? (
                <div className="morph-layer__grid">
                  {kids.map((kid) => (
                    <CurtainNode
                      key={`${String(kid.id)}-${kid.url}`}
                      node={kid}
                      active={Boolean(focus && String(focus.id) === String(kid.id))}
                      onDrill={onDrill}
                    />
                  ))}
                </div>
              ) : (
                activeMenu && <p className="morph-layer__empty">{labels.noSubs}</p>
              )}
            </div>
            {/* the slot layer keeps its wrapper through every re-render: its
                class IS its grid slot and its plate (rule 18) */}
            <div className="morph-layer" data-morph-dyn="slot">
              {activeMenu && (
                <SlotColumn
                  menu={activeMenu}
                  focus={focus}
                  slots={slots}
                  slotsRaw={slotsRaw}
                  labels={labels}
                />
              )}
            </div>
          </div>
          {activeMenu && (
            /* keyed on the focused node: the old rebuild replaced the dynamic
               region's innerHTML on every category change, which replayed the
               entrances (morphCurtainIn on the featured rectangle) — React keeps
               the wrapper, so a remount is what replays the same transition. */
            <div data-morph-dyn="featured" key={String((focus ?? activeMenu).id)}>
              <FeaturedRow node={focus ?? activeMenu} labels={labels} pieces={pieces} />
            </div>
          )}
        </div>
      </div>
    </ProductCardSettingsContext.Provider>
  );
}
