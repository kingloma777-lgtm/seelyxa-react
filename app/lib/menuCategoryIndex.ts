import type { Category } from '@salla.sa/twilight-theme-engine/types';
import type { CurtainMenu } from '../components/layout/MorphCurtain';

/* ════════════════════════════════════════════════════════════════════════════
   Menu nodes have no pictures of their own on form-builder menus.

   Measured against the live store (store_id 1510890315, dev-vgckq3fssfhjewwi):

   · `menus/header` answers `image: ""` or `null` on EVERY row — the payload
     has the field (the menu builder can attach a root-level image), but the
     merchant's items were built as custom links and carry none.
   · The node urls point at the store root, so `categoryIdFromUrl()` finds no
     `/c<digits>` and the featured rectangle's `source="categories"` fallback
     has no category id either.
   · The store's real tree (`GET /store/v1/categories` — the request
     `category.list()` in the engine) DOES carry pictures on every real
     category, plus the raw numeric `id_` the product endpoint needs.
   · Matching by title hits 8/8 real rows (the other menu rows are builder
     test items with no category behind them, and must stay unmatched).

   So the curtain enriches its nodes from the category tree, on ONE key: the
   normalized title. Level-aware — a level-1 node is a main category, a
   deeper one a subcategory — with the other level as fallback, because the
   merchant may name a menu item after a subcategory ("المدخل") on a node the
   builder placed at the root.
   ══════════════════════════════════════════════════════════════════════════ */

export interface MenuCategoryHint {
  /** flat image url string, exactly what `Category.image` sends */
  image: string;
  /** the raw numeric id (`Category.id_`) — what `source="categories"` takes;
      `null` on the rare row without one, and the rectangle keeps its honest
      empty state */
  id: number | null;
}

export interface MenuCategoryIndex {
  /** top-level categories, keyed by normalized name */
  mains: Map<string, MenuCategoryHint>;
  /** subcategories, keyed by normalized name */
  subs: Map<string, MenuCategoryHint>;
}

/* Arabic titles are compared glyph-blind: diacritics stripped, alef variants
   and teh marbuta unified, spaces collapsed. Case matters for latin text. */
export function normalizeTitle(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u064B-\u065D]/g, '')
    .replace(/[\u0640]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}

/* ── the index: one pass over the category tree ────────────────────────── */
export function buildCategoryIndex(categories: Category[]): MenuCategoryIndex {
  const mains: Map<string, MenuCategoryHint> = new Map();
  const subs: Map<string, MenuCategoryHint> = new Map();
  const hintOf = (cat: Category): MenuCategoryHint => ({
    image: cat.image || '',
    id: typeof cat.id_ === 'number' && Number.isFinite(cat.id_) ? cat.id_ : null,
  });
  const register = (map: Map<string, MenuCategoryHint>, cat: Category) => {
    const key = normalizeTitle(cat.name);
    /* first wins: two categories under one parent may share a name in Salla
       (the builder allows it) — an arbitrary draw is worse than the first */
    if (key && !map.has(key)) map.set(key, hintOf(cat));
  };
  categories.forEach((cat) => {
    register(mains, cat);
    (cat.sub_categories ?? []).concat(cat.items ?? []).forEach((sub) => {
      register(subs, sub);
    });
  });
  return { mains, subs };
}

/* Level-aware lookup: the node's own level first, the other map as fallback. */
export function matchMenuNode(
  index: MenuCategoryIndex,
  node: { title?: unknown },
  level = 1
): MenuCategoryHint | null {
  const key = normalizeTitle(node.title);
  if (!key) return null;
  return (level <= 1 ? index.mains.get(key) : index.subs.get(key)) ??
    (level <= 1 ? index.subs : index.mains).get(key) ??
    null;
}

/* ── one enriched copy of a menu node (the source tree is never mutated;
   React state rules: state, not DOM edits) ─────────────────────────────── */
export function enrichMenuNode(
  node: CurtainMenu,
  index: MenuCategoryIndex,
  level = 1
): CurtainMenu {
  /* the merchant's explicit image always wins — enrichment only fills what
     the payload left empty */
  const own = typeof (node as { image?: unknown }).image === 'string'
    ? (node.image as string)
    : '';
  const hint = matchMenuNode(index, node, level);
  const children = Array.isArray(node.children) ? node.children : [];
  return {
    ...node,
    image: own || hint?.image || null,
    categoryId: node.categoryId ?? hint?.id ?? null,
    children: children.map((child) => enrichMenuNode(child, index, level + 1)),
  };
}
