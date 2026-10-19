/**
 * The ids the menu builder attached to a node as its featured products.
 *
 * `menus/header` does NOT always answer with an array: a node carries an array
 * of ids ONLY when the merchant picked featured products. Every other node
 * answers the empty string `""`, and the engine's `MenuItem` type does not
 * declare the field at all — so reading `.filter` straight off the value threw
 * `TypeError: (node.products ?? []).filter is not a function` inside the
 * curtain, and React's error boundary replaced the whole storefront with
 * "Something went wrong!". On the demo store 19 of 20 nodes answer `""`, so
 * hovering almost any category took the page down.
 *
 * The shape is therefore normalised in ONE place, defensively: an array (or a
 * nested one), a comma/space separated string, a JSON string, a picker-shaped
 * `{ value }` / `{ id }` object, or a bare number. Anything unusable is no
 * picks at all — never a thrown render.
 */
export function menuProductIds(value: unknown): number[] {
  return flatten(value)
    .map((entry) => Number(entry))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function flatten(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (typeof value === 'number') return [value];
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];
    if (text.startsWith('[')) {
      try {
        return flatten(JSON.parse(text));
      } catch {
        // not JSON after all — fall through to the delimiter split
      }
    }
    return text.split(/[,\s]+/).filter(Boolean);
  }
  if (typeof value === 'object') {
    // pickers store `{label, value, key}` (see curtainSlots) — take the value
    const record = value as Record<string, unknown>;
    return flatten(record.value ?? record.id ?? null);
  }
  return [];
}
