/* ==========================================================================
   Consistency audit for the Selia home blocks.

   A home block is spread over five files that are easy to let drift apart:
     scripts/selia-specs.cjs   -> the merchant's field ids
     twilight.json             -> the published manifest
     app/router.tsx            -> two registration maps
     app/styles/app.scss       -> the @import that actually ships the CSS
     twilight.preview.json     -> the seed data the dev server renders

   The expensive failures here are all silent: a field the merchant edits that
   no component reads, a component reading an id that was never declared (so it
   always falls back), a missing registration (empty wrapper, no error), or a
   missing SCSS import (unstyled block that still "renders"). This checks all
   of them in one pass and exits non-zero on anything real.

   Run:  node scripts/verify-selia.cjs
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const specs = require('./selia-specs.cjs');
const twilight = readJson('twilight.json');
const preview = readJson('twilight.preview.json');
const router = read('app/router.tsx');
const appScss = read('app/styles/app.scss');

const errors = [];
const warnings = [];
const note = (kind, message) => (kind === 'error' ? errors : warnings).push(message);

/* The generator publishes one catalogue for all 34 blocks. Building the
   source map from it means adding a 35th block cannot silently skip the
   field-read audit — the old hand-maintained map is exactly how the second
   batch got to 17 registrations behind the specs. */
const catalogue = require('./selia-blocks.generated.json');
const SOURCES = Object.fromEntries(
  catalogue.map((block) => [block.name, `home.${block.key}`])
);

/** Where each block's SCSS lives. The eight hand-written blocks own a file
 *  each; the 26 generated ones share `selia-generated.scss`. */
const FIRST_EIGHT_STYLES = {
  Statistics: 'selia-statistics',
  MapLocation: 'selia-map',
  BlogTeaser: 'selia-blog',
  ContactForm: 'selia-contact',
  TickerBar: 'selia-ticker',
  CategoryHero: 'selia-cathero',
  Branches: 'selia-branches',
  ProductPicks: 'selia-picks',
};
const STYLES = Object.fromEntries(
  catalogue.map((block) => [block.name, block.generated ? 'selia-generated' : FIRST_EIGHT_STYLES[block.name]])
);

/* ------------------------------------------------------------------ *
 * 1. Manifest shape — identical keys to the theme's original 8 blocks.
 * ------------------------------------------------------------------ */
if (!Array.isArray(twilight.components)) {
  note('error', 'twilight.json components is not an array (schema rejects it)');
}
const manifest = Array.isArray(twilight.components) ? twilight.components : [];
const ours = manifest.filter((c) => !c.path.startsWith('home.selia-'));
const selia = manifest.filter((c) => c.path.startsWith('home.selia-'));
const requiredKeys = ['key', 'title', 'icon', 'path', 'image', 'is_default', 'fields'];

for (const component of selia) {
  for (const key of requiredKeys) {
    if (!(key in component)) note('error', `${component.path}: missing manifest key "${key}"`);
  }
  if (!component.title || !component.title.ar || !component.title.en) {
    note('error', `${component.path}: title needs both ar and en`);
  }
}
for (const [index, component] of ours.entries()) {
  for (const key of requiredKeys) {
    if (!(key in component)) note('warn', `original block #${index}: missing "${key}"`);
  }
}
const paths = manifest.map((c) => c.path);
const duplicates = paths.filter((p, i) => paths.indexOf(p) !== i);
if (duplicates.length) note('error', `duplicate manifest paths: ${[...new Set(duplicates)].join(', ')}`);
const keys = manifest.map((c) => c.key).filter(Boolean);
const duplicateKeys = keys.filter((k, i) => keys.indexOf(k) !== i);
if (duplicateKeys.length) note('error', `duplicate component uuids: ${[...new Set(duplicateKeys)].join(', ')}`);

/* ------------------------------------------------------------------ *
 * 2. Every spec is published, every published Selia block has a spec.
 * ------------------------------------------------------------------ */
const specPaths = Object.keys(specs);
const byPath = new Map(manifest.map((c) => [c.path, c]));
for (const specPath of specPaths) {
  if (!byPath.has(specPath)) note('error', `${specPath}: spec exists but no manifest entry (run apply-selia.cjs)`);
}
for (const component of selia) {
  if (!specPaths.includes(component.path)) note('error', `${component.path}: manifest entry with no spec`);
}

/* ------------------------------------------------------------------ *
 * 3. Router: both registration maps, keyed by the path WITHOUT `home.`.
 *    The engine strips that prefix, so `home.selia-blog` -> `selia-blog`.
 * ------------------------------------------------------------------ */
for (const specPath of specPaths) {
  const key = specPath.replace(/^home\./, '');
  const occurrences = (router.match(new RegExp(`'${key}'\\s*:`, 'g')) || []).length;
  if (occurrences < 2) {
    note('error', `${specPath}: router registers '${key}' ${occurrences}/2 times (needs the component map AND the config map)`);
  }
  const previewPaths = (preview.layout || []).filter((b) => b.path === key).length;
  if (previewPaths === 0) note('error', `${specPath}: no seed block '${key}' in twilight.preview.json`);
  if (previewPaths > 1) note('error', `${specPath}: ${previewPaths} duplicate seed blocks '${key}'`);
}

/* ------------------------------------------------------------------ *
 * 4. SCSS is imported. A missing @import renders an unstyled block, which
 *    looks like a broken component but never throws.
 * ------------------------------------------------------------------ */
for (const name of ['selia-base', ...Object.values(STYLES)]) {
  if (!appScss.includes(`04-components/${name}`)) {
    note('error', `app/styles/app.scss: missing @import for ${name}`);
  }
}

/* ------------------------------------------------------------------ *
 * 5. Field ids: every read has a declared id, every declared control is
 *    read. This is the merchant-facing half — a label with no effect is
 *    worse than no label at all.
 * ------------------------------------------------------------------ */
const collectIds = (fields) => {
  const top = new Set();
  const columns = new Map();
  for (const field of fields) {
    if (field.type === 'static') continue;
    top.add(field.id);
    if (field.type === 'collection') {
      columns.set(
        field.id,
        new Set((field.fields || []).map((f) => f.id))
      );
    }
  }
  return { top, columns };
};

for (const [name, specPath] of Object.entries(SOURCES)) {
  const file = `app/components/home/selia/${name}.tsx`;
  if (!fs.existsSync(path.join(root, file))) {
    note('error', `${specPath}: component source ${file} is missing`);
    continue;
  }
  const source = read(file);
  const component = byPath.get(specPath);
  // Audit the published manifest, not just the spec: the manifest is what the
  // merchant's editor actually writes to.
  const { top, columns } = collectIds(component ? component.fields : []);
  const specIds = collectIds(specs[specPath].fields);
  if (!component) continue;

  // Spec and manifest must agree, or an edit to the spec was never applied.
  for (const id of specIds.top) {
    if (!top.has(id)) note('error', `${specPath}: spec field "${id}" is not in twilight.json (run apply-selia.cjs)`);
  }

  const prefixConst = source.match(/const PREFIX = '([^']+)'/)?.[1] || '';
  const itemsConst = source.match(/const ITEMS = '([^']+)'/)?.[1] || '';
  const usedTop = new Set();
  const usedColumns = new Set();

  // Top-level reads: readXxx(data, 'key', PREFIX | 'literal')
  const topCall = /read(?:TextOr|Text|Number|Boolean|Rows|Value)\(\s*data\s*,\s*'([^']+)'\s*,\s*(PREFIX|'([^']+)')/g;
  for (const match of source.matchAll(topCall)) {
    const [, fieldKey, prefixExpr, literal] = match;
    const prefix = prefixExpr === 'PREFIX' ? prefixConst : literal;
    if (!prefix) {
      note('error', `${specPath}: read '${fieldKey}' has no resolvable prefix`);
      continue;
    }
    const id = `${prefix}_${fieldKey}`;
    usedTop.add(id);
    if (!top.has(id) && !columns.has(fieldKey)) {
      note('error', `${specPath}: reads "${id}" but no such field is declared`);
    }
    // A collection is addressed by its own id, not by `<prefix>_<id>`.
    if (columns.has(fieldKey)) usedTop.add(fieldKey);
  }

  /* Row reads: rowXxx(row, 'key', ITEMS | PREFIX | 'literal').
     Most of these address a collection column. `rowProductId` is the exception:
     the selected-products block builds a synthetic `{products: entry}` row to
     reuse the shared helper, and the scope is the TOP-LEVEL picker field
     (`picks_products`), not a collection. Modeling that as a collection would
     report a false error for a read that resolves correctly at runtime. */
  const rowCall = /row(?:Text|Value|ProductId|Link)\([^,]+,\s*'([^']+)'\s*,\s*(ITEMS|PREFIX|'([^']+)')/g;
  for (const match of source.matchAll(rowCall)) {
    const [, fieldKey, scopeExpr, literal] = match;
    const scope = scopeExpr === 'ITEMS' ? itemsConst : scopeExpr === 'PREFIX' ? prefixConst : literal;
    if (!scope) {
      note('error', `${specPath}: row read '${fieldKey}' has no resolvable scope`);
      continue;
    }
    if (scopeExpr === 'PREFIX') {
      const id = `${scope}_${fieldKey}`;
      usedTop.add(id);
      if (!top.has(id)) note('error', `${specPath}: row read "${id}" but no such field is declared`);
      continue;
    }
    const id = `${scope}.${fieldKey}`;
    usedColumns.add(id);
    const available = columns.get(scope);
    if (!available) {
      note('error', `${specPath}: row read "${id}" but collection "${scope}" does not exist`);
    } else if (!available.has(id)) {
      note('error', `${specPath}: row read "${id}" but no such column is declared`);
    }
  }

  // Declared controls that nothing reads. Collection containers and static
  // header/description entries are structural, not controls.
  for (const id of top) {
    if (columns.has(id)) continue;
    if (!usedTop.has(id)) note('warn', `${specPath}: merchant control "${id}" is never read — it does nothing`);
  }
  for (const [collection, columnIds] of columns) {
    for (const id of columnIds) {
      if (!usedColumns.has(id)) note('warn', `${specPath}: column "${id}" in ${collection} is never read`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 6. Preview seed keys must use the SAME ids the editor writes. A short
 *    alias in the seed is exactly the trap `readValue` warns about: the
 *    prefixed field then always wins and the merchant's edit looks ignored.
 * ------------------------------------------------------------------ */
for (const specPath of specPaths) {
  const key = specPath.replace(/^home\./, '');
  const block = (preview.layout || []).find((b) => b.path === key);
  if (!block || !block.fields) continue;
  const component = byPath.get(specPath);
  if (!component) continue;
  const { top, columns } = collectIds(component.fields);
  const collectionIds = new Set([...columns.values()].flatMap((set) => [...set]));
  for (const seedKey of Object.keys(block.fields)) {
    if (top.has(seedKey) || columns.has(seedKey)) continue;
    if (collectionIds.has(seedKey)) continue;
    note('warn', `${specPath}: preview seed key "${seedKey}" matches no declared field id`);
  }
}

/* ------------------------------------------------------------------ */
const lines = [
  `components: ${manifest.length} (${ours.length} original + ${selia.length} Selia)`,
  `specs:      ${specPaths.length}`,
  `errors:     ${errors.length}`,
  `warnings:   ${warnings.length}`,
];
if (warnings.length) lines.push('', '--- warnings ---', ...warnings.map((w) => `  ! ${w}`));
if (errors.length) lines.push('', '--- errors ---', ...errors.map((e) => `  x ${e}`));
console.log(lines.join('\n'));
process.exit(errors.length ? 1 : 0);
