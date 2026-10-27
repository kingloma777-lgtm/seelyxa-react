import { Suspense, useCallback, useMemo } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { buildCategoryIndex, enrichMenuNode } from '../../lib/menuCategoryIndex';
import { MorphMenuCard, type MenuCardProduct } from '../product/MorphMenuCard';
import { SallaProductsList, ProductsListSkeleton } from '@salla.sa/twilight-components-react';
import type { CurtainSlot } from '../../lib/curtainSlots';
import { menuProductIds } from '../../lib/menuProducts';
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
   · FOUR products: one row of Salla's 4-column grid — five wrapped to a
     second row and pushed the panel past the fold (rule 23).
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
  const getImg = (v: any): string => {
    if (!v) return '';
    if (typeof v === 'string') {
      if (v.startsWith('http') || v.startsWith('/') || v.startsWith('data:')) return v;
      if (v.length > 10 && (v.includes('.jpg') || v.includes('.png') || v.includes('.webp') || v.includes('.jpeg') || v.includes('.gif'))) return v;
      return v;
    }
    if (Array.isArray(v)) return getImg(v[0]);
    if (typeof v === 'object') {
      return (
        getImg(v.url) ||
        getImg(v.image) ||
        getImg(v.src) ||
        getImg(v.small_url) ||
        getImg(v.thumbnail) ||
        getImg(v.value) ||
        getImg(v.link) ||
        getImg(v.original) ||
        getImg(v.file) ||
        getImg(v.path) ||
        getImg(v.logo) ||
        getImg(v.icon) ||
        getImg(v.img) ||
        ''
      );
    }
    return '';
  };
  let img = '';
  // Try to get image from various sources
  img = imgSrc(node.image);
  if (!img && typeof (node as any).image === 'string' && (node as any).image) {
    const s = (node as any).image;
    if (s.startsWith('http') || s.startsWith('/') || s.includes('.')) img = s;
  }
  if (!img && typeof (node as any).image === 'object' && (node as any).image?.url) {
    img = (node as any).image.url;
  }
  img = img || imgSrc((node as any).thumbnail);
  img = img || imgSrc((node as any).icon);
  img = img || imgSrc((node as any).image_url);
  img = img || imgSrc((node as any).imageUrl);
  img = img || imgSrc((node as any).cover);
  img = img || imgSrc((node as any).media);
  img = img || imgSrc((node as any).media?.image);
  img = img || imgSrc((node as any).media?.url);
  img = img || imgSrc((node as any).banner);
  img = img || imgSrc((node as any).picture);
  img = img || imgSrc((node as any).photo);
  img = img || imgSrc((node as any).featured_image);
  img = img || imgSrc((node as any).category_image);
  img = img || imgSrc((node as any).thumb);
  img = img || imgSrc((node as any).logo);
  img = img || getImg((node as any).images);
  img = img || getImg(node);
  if (!img) {
    for (const key of Object.keys(node as any)) {
      const lower = key.toLowerCase();
      if (lower.includes('image') || lower.includes('img') || lower.includes('photo') || lower.includes('icon') || lower.includes('thumb') || lower.includes('pic') || lower.includes('avatar') || lower.includes('cover') || lower.includes('banner')) {
        const found = getImg((node as any)[key]);
        if (found) {
          img = found;
          break;
        }
      }
    }
  }
  // Deep search as last resort
  if (!img) {
    const search = (obj: any, depth = 0): string => {
      if (!obj || depth > 4) return '';
      if (typeof obj === 'string') {
        if (obj.startsWith('http') && (obj.includes('.jpg') || obj.includes('.png') || obj.includes('.jpeg') || obj.includes('.webp') || obj.includes('.gif') || obj.includes('cdn') || obj.includes('images'))) return obj;
        if ((obj.startsWith('/') && obj.includes('.')) || obj.includes('uploads') || obj.includes('media')) return obj;
        return '';
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = search(item, depth + 1);
          if (found) return found;
        }
        return '';
      }
      if (typeof obj === 'object') {
        // Check common image keys first
        for (const k of ['image', 'url', 'src', 'thumbnail', 'icon', 'photo', 'picture']) {
          if (obj[k]) {
            const found = search(obj[k], depth + 1);
            if (found) return found;
          }
        }
        for (const k of Object.keys(obj)) {
          const lower = k.toLowerCase();
          if (lower.includes('image') || lower.includes('img') || lower.includes('photo') || lower.includes('thumb')) {
            const found = search(obj[k], depth + 1);
            if (found) return found;
          }
        }
      }
      return '';
    };
    img = search(node);
  }
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
        aria-pressed={active}
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
  const slot = activeSlot(slots, menu, focus) ?? fallbackSlot(slots);

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
  const ids = menuProductIds(node.products);
  const hasFeatured = ids.length > 0;
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
    () => product.list({ source, sourceValue: value, perPage: 4 }),
    [source, value.join(',')] // eslint-disable-line react-hooks/exhaustive-deps
  );

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
        <Suspense fallback={<ProductsListSkeleton />}>
          <SallaProductsList loader={loader} itemsClassName="morph-featured__list">
            {(items: unknown[]) =>
              items
                .slice(0, 4)
                .map((item) => (
                  <MorphMenuCard
                    key={String((item as { id: unknown }).id)}
                    product={item as MenuCardProduct}
                  />
                ))
            }
          </SallaProductsList>
        </Suspense>
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
    <div className="morph-curtain" hidden={!open} data-morph-curtain data-testid="morph-curtain">
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
  );
}
