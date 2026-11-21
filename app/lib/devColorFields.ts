/**
 * Colour fields for the dev-only colour panel.
 *
 * The engine's editor schema drops `format` (`classifyString` maps every string
 * input to `kind: 'text'`), so a `format: "color"` field is indistinguishable
 * from a text field in `DevSchema`. The panel therefore reads the manifest
 * itself for discovery, and the schema only for the live preview state.
 *
 * Everything here is pure: no React, no DOM, no fetch. The panel owns the
 * network call; this module only answers "which colours exist", "what is this
 * one worth now", and "give me the state with this one changed".
 */

export interface PreviewBlock {
  id: string;
  path: string;
  fields: Record<string, unknown>;
}

export interface PreviewState {
  enabled: boolean;
  settings: Record<string, unknown>;
  layout: PreviewBlock[] | null;
}

interface RawField {
  id?: string;
  type?: string;
  format?: string;
  value?: unknown;
  label?: string;
  description?: string | null;
  fields?: RawField[];
}

interface RawComponent {
  path?: string;
  key?: string;
  title?: string | { ar?: string; en?: string };
  fields?: RawField[];
}

export interface RawManifest {
  settings?: RawField[];
  components?: RawComponent[];
}

/** One editable colour, bound to the place its value lives. */
export interface ColorEntry {
  /** Manifest id — `detail_frame_color` or `detail_items.ticker_background`. */
  id: string;
  /** Unique per rendered row (two blocks can own the same manifest id). */
  key: string;
  label: string;
  description: string;
  /** The manifest default, used by the reset button. */
  fallback: string;
  /** Current value as `#rrggbb`; `''` is "no colour" (two optional row accents). */
  value: string;
  /** Pure updater: `hex` as `#rrggbb`, or `''` to drop the override. */
  apply: (state: PreviewState, hex: string) => PreviewState;
}

export interface ColorGroup {
  /** Group heading; `null` for the theme settings group. */
  title: string | null;
  entries: ColorEntry[];
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** A value the `<input type="color">` can open on: `#rrggbb`, else `''`. */
export function normalizeHex(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const value = raw.trim();
  if (!HEX.test(value)) return '';
  /* `<input type="color">` accepts 7 characters only; `#abc` is expanded and
     the 8-digit alpha form is dropped rather than silently rejected. */
  if (value.length === 4) return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  return value.slice(0, 7).toLowerCase();
}

/** Typed hex from the text field: accepts `abc`, `#ABC`, `#aabbcc`. */
export function parseHexInput(raw: string): string | null {
  const value = raw.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{3}$/i.test(value) && !/^[0-9a-f]{6}$/i.test(value)) return null;
  return normalizeHex(`#${value}`);
}

/** Salla stores dropdown-ish values as `[{ value }]`; colours arrive as text. */
function scalar(raw: unknown): string {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first && typeof first === 'object' && 'value' in (first as Record<string, unknown>)) {
    return String((first as Record<string, unknown>).value ?? '');
  }
  return typeof first === 'string' ? first : '';
}

const isColor = (field: RawField) => field.type === 'string' && field.format === 'color';

const titleOf = (component: RawComponent): string => {
  const t = component.title;
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object') return t.ar || t.en || '';
  return component.path ?? '';
};

/** The manifest's components keyed by their preview path (`home.x` → `x`). */
function componentsByPath(manifest: RawManifest): Map<string, RawComponent> {
  const map = new Map<string, RawComponent>();
  for (const component of manifest.components ?? []) {
    const path = (component.path ?? '').replace(/^home\./, '');
    if (path) map.set(path, component);
  }
  return map;
}

/** A component's colour fields, top-level first, then each collection's rows. */
function colorFieldsOf(component: RawComponent): {
  top: RawField[];
  rows: { collection: string; field: RawField }[];
} {
  const top: RawField[] = [];
  const rows: { collection: string; field: RawField }[] = [];
  for (const field of component.fields ?? []) {
    if (isColor(field)) {
      top.push(field);
      continue;
    }
    if (field.type === 'collection' && Array.isArray(field.fields)) {
      const collection = field.id ?? '';
      for (const sub of field.fields) {
        if (isColor(sub) && collection) rows.push({ collection, field: sub });
      }
    }
  }
  return { top, rows };
}

/** The row key the preview stores: the `<collection>.` prefix is stripped. */
function rowKey(fieldId: string, collection: string): string {
  const prefix = `${collection}.`;
  return fieldId.startsWith(prefix) ? fieldId.slice(prefix.length) : fieldId;
}

/** A collection's default rows, in the shape the preview stores them. */
function defaultRows(component: RawComponent, collection: string): Record<string, unknown>[] {
  const field = (component.fields ?? []).find((f) => f.id === collection);
  const rows = Array.isArray(field?.value) ? field.value : [];
  return rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object');
}

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  const next = list.slice();
  next[index] = value;
  return next;
}

/**
 * Set or remove one key. An empty colour is "no colour": the key goes away
 * instead of being stored as `""`, which is what the two optional row accents
 * (`figurines.color`, `stats_orbit_items.color`) default to.
 */
function withKey(
  record: Record<string, unknown>,
  key: string,
  hex: string
): Record<string, unknown> {
  const next = { ...record };
  if (hex) next[key] = hex;
  else delete next[key];
  return next;
}

/**
 * A row colour, written the way the blocks read it.
 *
 * Rows reach a block in two shapes: rows the engine seeded use the bare key
 * (`color`), rows that came from the store API keep the manifest's prefix
 * (`ticker_rows.color`) — the saved preview file holds both. `rowValue()` in
 * `app/lib/homeBlock.ts` reads the bare key first and the prefixed one second,
 * so writing the bare key always wins; the prefixed twin is dropped so a
 * cleared colour cannot resurface through it.
 */
function writeRowColor(
  row: Record<string, unknown>,
  collection: string,
  key: string,
  hex: string
): Record<string, unknown> {
  const next = withKey(row, key, hex);
  delete next[`${collection}.${key}`];
  return next;
}

/** The colour a row currently holds, whichever shape it was saved in. */
function readRowColor(row: Record<string, unknown>, collection: string, key: string): unknown {
  return row[key] ?? row[`${collection}.${key}`];
}

/**
 * Every colour the current preview state can change, grouped for the panel.
 *
 * Theme settings come first because they apply everywhere. Each block in the
 * preview layout follows, carrying its own top-level colours and the colours
 * of every row it actually has — a row colour belongs to a block instance, not
 * to the component, so there is nothing to edit when no block exists.
 */
export function collectColors(manifest: RawManifest, state: PreviewState): ColorGroup[] {
  const groups: ColorGroup[] = [];

  const theme: ColorEntry[] = (manifest.settings ?? [])
    .filter(isColor)
    .map((field): ColorEntry => {
      const id = field.id ?? '';
      const fallback = normalizeHex(field.value);
      return {
        id,
        key: `setting:${id}`,
        label: field.label ?? id,
        description: field.description ?? '',
        fallback,
        value: normalizeHex(state.settings?.[id]) || fallback,
        apply: (next, hex) => ({
          ...next,
          settings: withKey(next.settings ?? {}, id, hex),
        }),
      };
    })
    .filter((entry) => entry.id);
  if (theme.length) groups.push({ title: null, entries: theme });

  const byPath = componentsByPath(manifest);
  const layout = Array.isArray(state.layout) ? state.layout : [];

  layout.forEach((block, index) => {
    const component = byPath.get(block.path);
    if (!component) return;
    const { top, rows } = colorFieldsOf(component);
    const entries: ColorEntry[] = [];

    const writeField = (next: PreviewState, field: string, value: unknown): PreviewState => ({
      ...next,
      layout: (next.layout ?? []).map((item, at) =>
        at === index ? { ...item, fields: withKey(item.fields ?? {}, field, String(value ?? '')) } : item
      ),
    });

    for (const field of top) {
      const id = field.id ?? '';
      const fallback = normalizeHex(field.value);
      entries.push({
        id,
        key: `block:${index}:${id}`,
        label: field.label ?? id,
        description: field.description ?? '',
        fallback,
        value: normalizeHex(block.fields?.[id]) || fallback,
        apply: (next, hex) => writeField(next, id, hex),
      });
    }

    for (const { collection, field } of rows) {
      const key = rowKey(field.id ?? '', collection);
      const rowsValue = Array.isArray(block.fields?.[collection])
        ? (block.fields[collection] as Record<string, unknown>[])
        : defaultRows(component, collection);
      const defaults = defaultRows(component, collection);
      rowsValue.forEach((row, rowIndex) => {
        if (!row || typeof row !== 'object') return;
        const id = field.id ?? '';
        const fallback = normalizeHex(
          (defaults[rowIndex] ?? {})[`${collection}.${key}`] ?? (defaults[rowIndex] ?? {})[key] ?? field.value
        );
        entries.push({
          id,
          key: `block:${index}:${collection}:${rowIndex}:${key}`,
          label: `${field.label ?? key} — ${rowIndex + 1}`,
          description: field.description ?? '',
          fallback,
          value: normalizeHex(readRowColor(row, collection, key)) || fallback,
          apply: (next, hex) => {
            const current = (next.layout ?? [])[index]?.fields?.[collection];
            const source = Array.isArray(current) ? (current as Record<string, unknown>[]) : defaults;
            const updated = replaceAt(
              source,
              rowIndex,
              writeRowColor(source[rowIndex] ?? {}, collection, key, hex)
            );
            return {
              ...next,
              layout: (next.layout ?? []).map((item, at) =>
                at === index ? { ...item, fields: { ...item.fields, [collection]: updated } } : item
              ),
            };
          },
        });
      });
    }

    if (entries.length) groups.push({ title: titleOf(component) || block.path, entries });
  });

  return groups;
}

/** The state the panel starts from when the preview file is missing. */
export function emptyState(): PreviewState {
  return { enabled: true, settings: {}, layout: [] };
}

/** Coerce whatever the engine handed us into the panel's state shape. */
export function toState(preview: unknown): PreviewState {
  const raw = (preview ?? {}) as Partial<PreviewState>;
  return {
    enabled: raw.enabled !== false,
    settings: raw.settings && typeof raw.settings === 'object' ? { ...raw.settings } : {},
    layout: Array.isArray(raw.layout)
      ? raw.layout
          .filter((block): block is PreviewBlock => !!block && typeof block === 'object' && typeof block.path === 'string')
          .map((block) => ({ ...block, fields: { ...(block.fields ?? {}) } }))
      : null,
  };
}
