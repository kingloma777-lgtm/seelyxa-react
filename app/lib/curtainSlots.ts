/* ==========================================================================
   curtain_slots — the merchant's featured slot per category.
   Ported line-for-line from the Twig theme's `morph-header.js` §3; every rule
   there has the price of a debug round on the live store attached to it
   (`docs/header-reference.md`). The rule numbers below are the old file's.
   ========================================================================== */

/** Salla supports exactly TWO category levels, so the curtain's third column
 * cannot be taxonomy — it is one `curtain_slots` row per category carrying a
 * featured product OR an image (old rule 12). */

/** Every candidate key a picker/`items` field may carry, in the order the
 * value wins: `value` leads (the url), then free-text fallbacks. */
const PICKER_KEYS = ['value', 'url', 'link', 'id', 'label', 'title', 'name'];

/** Row fields are keyed by the SHORT name, with the prefixed id as fallback
 * (old rule 15 — `main-links.twig` is the proof). */
const ROW_KEYS = [
  'category', 'curtain_slots.category',
  'type', 'curtain_slots.type',
  'product', 'curtain_slots.product',
  'image', 'curtain_slots.image',
  'title', 'curtain_slots.title',
];

export interface CurtainSlot {
  type: 'image' | 'product';
  product: string;
  image: string;
  title: string;
}

export interface CurtainNodeLike {
  id?: string | number;
  url?: string | null;
  title?: string | null;
  image?: unknown;
  children?: CurtainNodeLike[] | null;
}

/** Normalised url key: protocol, `www.`, query/hash and trailing slash gone. */
export const slotKey = (url: unknown): string => {
  if (!url) return '';
  let value = String(url).trim();
  value = value.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  value = value.split(/[?#]/)[0];
  return value.replace(/\/+$/, '').toLowerCase();
};

/** The last numeric run in a url path is the category id, and the id survives
 * any locale or slug-shape disagreement the picker and the menu payload have */
export const idFromUrl = (url: unknown): string => {
  const path = String(url ?? '').split(/[?#]/)[0];
  const runs = path.match(/\d+/g);
  return runs && runs.length ? runs[runs.length - 1] : '';
};

/** A picker does NOT store a bare string — it stores `{label, value, key}`,
 * usually inside an array (old rule 22). Flatten every shape to its texts,
 * recursing into array ELEMENTS; walking PICKER_KEYS against the array itself
 * was the original silent-empty-map bug. */
export const pickerValue = (value: unknown): string[] => {
  const out: string[] = [];
  const push = (input: unknown) => {
    if (input === null || input === undefined) return;
    if (Array.isArray(input)) {
      input.forEach(push);
      return;
    }
    if (typeof input === 'object') {
      const obj = input as Record<string, unknown>;
      PICKER_KEYS.forEach((key) => push(obj[key]));
      return;
    }
    const text = String(input).trim();
    if (text && !out.includes(text)) out.push(text);
  };
  push(value);
  return out;
};

/** First flattened text of a normaliser chain. */
export const scalar = (value: unknown): string => pickerValue(value)[0] ?? '';

/** ONE picker value can be a url, a bare id, or a category NAME — so the row
 * is keyed under every shape it could plausibly take (old rule 13):
 * `url` + `tail:<last segment>` + `id:<n>` + the normalised text itself. */
export const keysFromText = (text: unknown): string[] => {
  const keys: string[] = [];
  const value = String(text ?? '').trim();
  if (!value) return keys;
  const url = slotKey(value);
  if (url) keys.push(url);
  if (url.includes('/')) {
    const tail = url.split('/').filter(Boolean).pop();
    if (tail) keys.push(`tail:${tail}`);
  }
  if (/^\d+$/.test(value)) {
    const key = `id:${value}`;
    if (!keys.includes(key)) keys.push(key);
  }
  const id = idFromUrl(value);
  if (id) {
    const key = `id:${id}`;
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
};

export const slotKeys = (value: unknown): string[] => {
  const keys: string[] = [];
  pickerValue(value).forEach((text) => {
    keysFromText(text).forEach((key) => {
      if (!keys.includes(key)) keys.push(key);
    });
  });
  return keys;
};

/** Image settings arrive as a plain url, a `{url, small_url, alt}` object, or
 * wrapped in a picker array — all three resolve here, not at the call. */
export const imgSrc = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return imgSrc(value[0]);
  const obj = value as { url?: string; small_url?: string; value?: string; src?: string };
  return obj.url || obj.small_url || obj.value || obj.src || '';
};

/** A collection need not arrive as an array (old rule 15b) — accepting only
 * arrays is a SILENT failure, so every observed shape is accepted. */
export const rowsFrom = (value: unknown): Record<string, unknown>[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (typeof value === 'string') {
    try {
      return rowsFrom(JSON.parse(value) as unknown);
    } catch {
      return [];
    }
  }
  if (typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if (ROW_KEYS.some((key) => Object.prototype.hasOwnProperty.call(obj, key))) {
    /* one row, handed back unwrapped */
    return [obj];
  }
  const keys = Object.keys(obj);
  /* one wrapper key holding the real list */
  if (keys.length === 1 && Array.isArray(obj[keys[0]])) {
    return obj[keys[0]] as Record<string, unknown>[];
  }
  /* rows keyed by index or a generated id */
  if (
    keys.length &&
    keys.every(
      (key) => obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])
    )
  ) {
    return keys.map((key) => obj[key] as Record<string, unknown>);
  }
  return [];
};

/** Short field name first; the prefixed id only as a fallback (rule 15). */
const field = (row: Record<string, unknown>, name: string): unknown => {
  if (!row) return undefined;
  if (row[name] !== undefined && row[name] !== null) return row[name];
  return row[`curtain_slots.${name}`];
};

/** Full rows → keyed map. First row wins, so a duplicated category cannot
 * make the panel flicker between two slots; one row is filed under EVERY
 * candidate key, so the count is `new Set(map.values()).size`, never
 * `map.size`. */
export const readSlots = (setting: unknown): Map<string, CurtainSlot> => {
  const map = new Map<string, CurtainSlot>();
  rowsFrom(setting).forEach((row) => {
    if (!row) return;
    const keys = slotKeys(field(row, 'category'));
    if (!keys.length) return;
    if (keys.some((key) => map.has(key))) return;
    const type = scalar(field(row, 'type')).toLowerCase();
    const slot: CurtainSlot = {
      type: type.includes('image') ? 'image' : 'product',
      product: scalar(field(row, 'product')),
      image: imgSrc(scalar(field(row, 'image'))),
      title: scalar(field(row, 'title')),
    };
    keys.forEach((key) => map.set(key, slot));
  });
  return map;
};

/** Candidate keys one node can answer to (id → urls → NAME). */
const nodeKeys = (node: CurtainNodeLike): string[] =>
  [`id:${String(node.id)}`, ...slotKeys(node.url), ...slotKeys(node.title)];

/** A slot resolves on the DEEPEST node in focus and falls back up the chain:
 * focused subcategory → the main category itself → one of its children (rule
 * 26's predecessor; the setting promises "this category or its branches"). */
export const activeSlot = (
  map: Map<string, CurtainSlot>,
  menu: CurtainNodeLike,
  focus: CurtainNodeLike | null
): CurtainSlot | null => {
  if (!map?.size) return null;
  const find = (node: CurtainNodeLike | null): CurtainSlot | null => {
    if (!node) return null;
    for (const key of nodeKeys(node)) {
      const hit = map.get(key);
      if (hit) return hit;
    }
    return null;
  };
  const byFocus = find(focus);
  if (byFocus) return byFocus;
  /* the main category's own slot wins over any of its children's */
  const byMain = find(menu);
  if (byMain) return byMain;
  const kids = menu.children ?? [];
  for (const kid of kids) {
    const byChild = find(kid);
    if (byChild) return byChild;
  }
  return null;
};

/** Whether a row can render at all (an image with a source, or a product with
 * an id) — a malformed row must not win a fallback draw and print a broken
 * pane. */
export const slotRenderable = (slot: CurtainSlot): boolean =>
  slot.type === 'image' ? !!slot.image : !!productIdFromUrl(slot.product);

/** A missing slot falls back to a RANDOM one — the merchant's rule beats
 * "never a stray slot" (rule 26). Renderable rows only; `null` when no row can
 * render, and the honest empty state stands. Kept separate from `activeSlot`
 * so the precise resolver keeps returning `null` for unmatched categories. */
export const fallbackSlot = (map: Map<string, CurtainSlot>): CurtainSlot | null => {
  if (!map?.size) return null;
  const renderable = [...new Set(map.values())].filter(slotRenderable);
  if (!renderable.length) return null;
  return renderable[Math.floor(Math.random() * renderable.length)];
};

/** The product picker returns a url whose id is the `/p<digits>` run — the
 * only thing a selected-source product list needs. */
export const productIdFromUrl = (url: unknown): string => {
  const match = /\/p(\d+)(?:[\/?#]|$)/.exec(String(url ?? ''));
  return match ? match[1] : '';
};

/** The REAL category id of a menu node, read from its url's `/c<digits>` run.
 *
 * A menu node's OWN `id` is a menu-ROW id, not a category id: sending it as
 * `source_value` to the products API answers **422** and the curtain's featured
 * rectangle stays empty for every category without merchant picks. Measured
 * against the live store (`store-identifier: dev-vgckq3fssfhjewwi`):
 * `source=categories` with the row id `1060795665` → 422, with the
 * `c1265994686` carried in the node's url → 200. The url is therefore the only
 * trustworthy carrier, and a node that is not a category page at all (no
 * `/c<digits>`) has no id to fall back to. */
export const categoryIdFromUrl = (url: unknown): string => {
  const match = /\/c(\d+)(?:[\/?#]|$)/.exec(String(url ?? ''));
  return match ? match[1] : '';
};
