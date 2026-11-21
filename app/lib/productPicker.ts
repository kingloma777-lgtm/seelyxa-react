/* ==========================================================================
   Reading a product picker field.

   A `variable-list` / `products` field stores an array of entries, and which
   key holds the id depends on the field: the panel's picker writes the product
   URL into `value` and the id into `key`, an older payload may carry only the
   URL, and a hand-written preview may carry a bare number. `pickerValue`
   (curtainSlots) reads `value / url / link / id / label / title / name` and
   deliberately skips `key` — so a picker that files the id there resolves to
   no product at all, and the block drops the row with no error anywhere.

   Two blocks now bind a list row to a catalogue product, so the resolution
   lives here once instead of twice.
   ========================================================================== */

import { idFromUrl, pickerValue, productIdFromUrl } from './curtainSlots';
import { rowValue, type BlockRow } from './homeBlock';

/** The product id a row's picker points at, as a string (`''` when it points
 * at nothing). */
export function rowProductId(row: BlockRow, key: string, prefix: string): string {
  const raw = rowValue(row, key, prefix);
  const texts = pickerValue(raw);

  /* the picker's own `key` — see the header */
  if (raw && typeof raw === 'object') {
    (Array.isArray(raw) ? raw : [raw]).forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const entryKey = (entry as Record<string, unknown>).key;
      if (typeof entryKey !== 'string' && typeof entryKey !== 'number') return;
      const text = String(entryKey).trim();
      if (text && !texts.includes(text)) texts.push(text);
    });
  }

  for (const text of texts) {
    const id = productIdFromUrl(text);
    if (id) return id;
  }
  const numeric = texts.find((text) => /^\d+$/.test(text));
  if (numeric) return numeric;
  /* last resort: the last numeric run of whatever the picker stored */
  return idFromUrl(texts[0] ?? '');
}
