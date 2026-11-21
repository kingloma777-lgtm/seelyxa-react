import { pickerValue, scalar } from '../../../lib/curtainSlots';
import { rowValue, type BlockRow } from '../../../lib/homeBlock';
import { rowProductId } from '../../../lib/productPicker';

/**
 * Small readers shared by the ported Selia blocks.
 *
 * These exist because Selia's own blocks read the same three field shapes and
 * get them subtly wrong in different places, so the bugs differ per block. One
 * implementation, used everywhere, is one place to fix.
 */

/**
 * The human label of a picker value.
 *
 * A Salla picker stores `{ label, value, key }` inside an array, and
 * `pickerValue` deliberately puts the **value** (a url) first — right for
 * linking, useless for display. Reading `pickerValue()[0]` as a name is how a
 * category tile ends up captioned `/categories/1436244360`. This walks the
 * object for the text fields instead, so the caption is what the merchant saw
 * in the picker.
 */
export function pickerLabel(value: unknown): string {
  const walk = (input: unknown): string => {
    if (input === null || input === undefined) return '';
    if (Array.isArray(input)) {
      for (const item of input) {
        const found = walk(item);
        if (found) return found;
      }
      return '';
    }
    if (typeof input === 'object') {
      const obj = input as Record<string, unknown>;
      for (const key of ['label', 'title', 'name', 'text']) {
        const candidate = obj[key];
        if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
      }
      return '';
    }
    return '';
  };
  return walk(value);
}

/** A row's picker value as a link target (url first, then any text shape). */
export function rowLink(row: BlockRow, key: string, prefix: string): string {
  return scalar(rowValue(row, key, prefix));
}

/** A row's picker value as a caption, falling back to an explicit text field. */
export function rowCaption(row: BlockRow, key: string, prefix: string, fallbackKey?: string): string {
  const label = pickerLabel(rowValue(row, key, prefix));
  if (label) return label;
  if (fallbackKey) {
    const text = scalar(rowValue(row, fallbackKey, prefix));
    if (text) return text;
  }
  return '';
}

/**
 * Turns a merchant-typed icon name into a class the theme actually ships.
 *
 * Salla's editor hands back a bare name (`truck`) from some pickers and a full
 * class (`sicon-truck`) from others, and Selia's Twig concatenates the prefix
 * blindly — so half the icons in a store render as an empty box. Accepting
 * both shapes costs one `startsWith`.
 */
export function iconClass(name: string): string {
  const value = (name || '').trim();
  if (!value) return '';
  return value.startsWith('sicon-') ? value : `sicon-${value}`;
}

/**
 * A merchant link, sanitised to the schemes a storefront can actually use.
 *
 * A `variable-list` field is free-form in older payloads and some merchants
 * paste `javascript:…` into it by mistake. Everything that is not http(s), a
 * root-relative path, an anchor, mailto or tel is dropped here, once, instead
 * of being trusted in 26 different `<a href>` sites.
 */
export function safeHref(value: unknown): string {
  const raw = typeof value === 'string' ? value : scalar(value);
  const href = raw.trim();
  if (!href) return '';
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href)) return href;
  return '';
}

/** Product ids from a picker, as numbers the list API accepts. */
export function idsFromPicker(value: unknown): number[] {
  const entries = Array.isArray(value) ? value : value === null || value === undefined ? [] : [value];
  return entries
    .map((entry) => Number(rowProductId({ picker: entry } as BlockRow, 'picker', '')))
    .filter((id) => Number.isFinite(id) && id > 0);
}

/** The device visibility value, normalised to one of its three real values. */
export function visibilityOf(value: unknown): 'all' | 'desktop' | 'mobile' {
  const text = scalar(value);
  return text === 'desktop' || text === 'mobile' ? text : 'all';
}

/** `pickerValue` re-exported so blocks do not import from two places. */
export { pickerValue, scalar };
