import { Suspense, useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { ProductCard } from '../product/ProductCard';
import { SallaProductsList, ProductsListSkeleton } from '@salla.sa/twilight-components-react';
import type { CurtainSlot } from '../../lib/curtainSlots';
import {
  activeSlot,
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
 * menu builder can attach (`products` are ids, not items). */
export interface CurtainMenu extends MenuItem {
  products?: (string | number)[];
  children?: CurtainMenu[];
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
  const img = imgSrc(node.image);
  const className = `morph-node morph-node--2${active ? ' is-active' : ''}`;

  const media = (
    <span className="morph-node__media">
      <span className="morph-node__disc">
        {img && (
          // a real <img>, never a background-image inside a style attribute —
          // a bare quote in a style attribute silently dropped the background
          // and read as "no image configured" (old rule 19)
          <img
            className="morph-node__img"
            src={img}
            alt=""
            loading="lazy"
            decoding="async"
          />
        )}
      </span>
      {Boolean(node.children?.length) && (
        <span className="morph-node__badge">{node.children!.length}</span>
      )}
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
              <ProductCard key={String((item as { id: unknown }).id)} product={item as never} />
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
          loading="lazy"
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
  // The product slot keeps its own card frame — the component owns its image
  // box, and forcing the aspect box on it is exactly how a platform upgrade
  // breaks the theme (rule 23's slot half).
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
  const ids = (node.products ?? []).filter(Boolean).map(Number);
  const hasFeatured = ids.length > 0;
  const catId =
    node.id !== undefined && node.id !== null && node.id !== '' ? node.id : null;
  const value = hasFeatured ? ids : catId !== null ? [Number(catId)] : [];
  const source: ProductsListSource = hasFeatured ? 'selected' : 'categories';

  const loader = useCallback(
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
      {!value.length ? (
        <p className="morph-featured__empty">{labels.emptyFeatured}</p>
      ) : (
        <Suspense fallback={<ProductsListSkeleton />}>
          <SallaProductsList loader={loader} itemsClassName="morph-featured__list">
            {(items: unknown[]) =>
              items.slice(0, 4).map((item) => (
                <ProductCard
                  key={String((item as { id: unknown }).id)}
                  product={item as never}
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
  const kids = menu?.children ?? [];
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
            {menu && (
              <p className="morph-layer__label">{menu.title}</p>
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
              menu && <p className="morph-layer__empty">{labels.noSubs}</p>
            )}
          </div>
          {/* the slot layer keeps its wrapper through every re-render: its
              class IS its grid slot and its plate (rule 18) */}
          <div className="morph-layer" data-morph-dyn="slot">
            {menu && (
              <SlotColumn
                menu={menu}
                focus={focus}
                slots={slots}
                slotsRaw={slotsRaw}
                labels={labels}
              />
            )}
          </div>
        </div>
        {menu && (
          /* keyed on the focused node: the old rebuild replaced the dynamic
             region's innerHTML on every category change, which replayed the
             entrances (morphCurtainIn on the featured rectangle) — React keeps
             the wrapper, so a remount is what replays the same transition. */
          <div data-morph-dyn="featured" key={String((focus ?? menu).id)}>
            <FeaturedRow node={focus ?? menu} labels={labels} pieces={pieces} />
          </div>
        )}
      </div>
    </div>
  );
}
