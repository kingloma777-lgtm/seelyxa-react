import { useSyncExternalStore } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The comparison list — a small, customer-owned selection of products the card
 * can add to, persisted like the wishlist so a refresh does not empty it.
 *
 * WHY THIS IS NOT A SALLA STORE
 * -----------------------------
 * Salla ships a wishlist (SDK + hook) but no compare feature: there is no
 * `salla.compare`, no compare endpoint and no theme setting for it. So the
 * selection is the theme's own, and this file is its single source of truth —
 * one module-level list, one storage key, one subscription, exactly the shape
 * the engine's `useWishlist` uses. Anything that renders a compare control
 * reads `useCompare()` and cannot disagree with another surface.
 *
 * WHAT IS STORED
 * --------------
 * A SNAPSHOT, not an id. The tray shows four thumbnails on every page of the
 * store; storing ids would mean one product request per chip per page, and a
 * compare row that pops in after the customer has already read it. The values
 * copied here are the ones the card was rendering at the moment of the click
 * (name, price, brand, rating, availability), so the panel is instant and as
 * fresh as the page that offered it. Nothing is invented: a field the product
 * does not carry is simply absent from the row.
 *
 * FOUR, FIRST-IN-FIRST-OUT
 * ------------------------
 * A compare table stops being readable past four columns on any screen, and a
 * fifth click that silently does nothing reads as a broken button. So adding a
 * fifth product drops the oldest one instead of refusing — the customer's last
 * intent is always honoured, and the limit is visible in the tray.
 */

export const COMPARE_MAX = 4;

const STORAGE_KEY = 'seelyxa::compare';

/** The slice of a product a comparison actually uses. */
export interface CompareItem {
  id: number;
  name: string;
  url: string;
  image: string;
  /** What the customer pays today. */
  price: number;
  /** The price before the discount, or `null` when the product is not on sale. */
  regularPrice: number | null;
  isOnSale: boolean;
  brand: string;
  /** Average score, `0` when the product has no reviews. */
  stars: number;
  reviews: number;
  outOfStock: boolean;
}

/** A price field, as a number — list payloads send strings, details send numbers. */
function toAmount(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

/**
 * The comparison row a card hands to the store.
 *
 * The same priority the rest of the theme uses for prices: `is_on_sale` plus a
 * sale price that is genuinely lower. A product flagged on sale with two equal
 * prices is not on sale, and the row must not print a struck-through number
 * that matches the one beside it.
 */
export function compareItemFromProduct(product: Product | undefined | null): CompareItem | null {
  if (!product) return null;
  const id = Number(product.id);
  if (!Number.isFinite(id)) return null;

  const price = toAmount(product.price) ?? 0;
  const sale = toAmount(product.sale_price);
  const onSale = !!product.is_on_sale && sale != null && sale > 0 && sale < price;
  const brand = (product.brand?.name ?? '').trim();
  const stars = Number(product.rating?.stars ?? 0);

  return {
    id,
    name: product.name ?? '',
    url: product.url ?? '',
    image: product.image?.url ?? '',
    price: onSale ? (sale as number) : price,
    regularPrice: onSale ? price : null,
    isOnSale: onSale,
    brand,
    stars: Number.isFinite(stars) ? stars : 0,
    reviews: Number(product.rating?.count ?? 0) || 0,
    outOfStock: !!product.is_out_of_stock,
  };
}

let items: CompareItem[] = [];
const listeners = new Set<() => void>();
let loaded = false;
let listening = false;

/** A frozen constant, so SSR and the first client render agree on identity. */
const EMPTY: CompareItem[] = [];

function isItem(value: unknown): value is CompareItem {
  const item = value as CompareItem | null;
  return !!item && typeof item.id === 'number' && Number.isFinite(item.id) && typeof item.name === 'string';
}

function persist() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* private mode / quota: the selection still works for this page */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Read the stored selection ONCE, on the client.
 *
 * Guarded rather than lazy-per-call: the snapshot function runs on every
 * render of every card, and re-reading `localStorage` there would make the
 * snapshot an unstable value (React would loop).
 */
function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    items = Array.isArray(parsed) ? parsed.filter(isItem).slice(0, COMPARE_MAX) : [];
  } catch {
    items = [];
  }

  /* another tab is the only writer this list does not hear about */
  if (!listening && typeof window !== 'undefined') {
    listening = true;
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return;
      loaded = false;
      load();
      emit();
    });
  }
}

function subscribe(listener: () => void): () => void {
  load();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CompareItem[] {
  return items;
}

function getServerSnapshot(): CompareItem[] {
  return EMPTY;
}

export function getCompareItems(): CompareItem[] {
  load();
  return items;
}

/** `true` when the product is already in the list. */
export function isCompared(id: number): boolean {
  load();
  return items.some((item) => item.id === id);
}

export function addToCompare(item: CompareItem): void {
  load();
  if (items.some((entry) => entry.id === item.id)) return;
  /* drop the oldest, never the newest: see the header note */
  const next = [...items, item];
  items = next.length > COMPARE_MAX ? next.slice(next.length - COMPARE_MAX) : next;
  persist();
  emit();
}

export function removeFromCompare(id: number): void {
  load();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return;
  items = next;
  persist();
  emit();
}

/** Add or remove, in one call — the button's own behaviour. */
export function toggleCompare(item: CompareItem): 'added' | 'removed' {
  if (isCompared(item.id)) {
    removeFromCompare(item.id);
    return 'removed';
  }
  addToCompare(item);
  return 'added';
}

export function clearCompare(): void {
  load();
  if (!items.length) return;
  items = [];
  persist();
  emit();
}

export interface UseCompareResult {
  items: CompareItem[];
  count: number;
  has: (id: number) => boolean;
  add: (item: CompareItem) => void;
  remove: (id: number) => void;
  toggle: (item: CompareItem) => 'added' | 'removed';
  clear: () => void;
}

/**
 * The live selection. Every card subscribes; a toggle re-renders the cards
 * that are on screen and the tray in the layout, which is exactly the surface
 * count that has to stay in sync.
 */
export function useCompare(): UseCompareResult {
  load();
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    items: current,
    count: current.length,
    has: (id) => current.some((item) => item.id === id),
    add: addToCompare,
    remove: removeFromCompare,
    toggle: toggleCompare,
    clear: clearCompare,
  };
}
