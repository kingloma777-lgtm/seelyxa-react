/* ==========================================================================
   Generates the 26 second-batch Selia block components from the field specs.

   WHY GENERATE: the merchant contract is 394 fields across 34 blocks. A
   hand-written component that forgets one field is a label in the editor that
   does nothing, and no test notices. Emitting the readers from the same object
   that publishes the manifest makes "declared but unread" structurally
   impossible. `verify-selia.cjs` then checks the emitted source anyway.

   The behaviour is NOT generated: `app/components/home/selia/SeliaAuto.tsx`
   owns it, once. These files are just the contract — the explicit, greppable
   list of reads that ties a block's field ids to its renderer.

   Also patches the three bracketed regions of `app/router.tsx`. Re-run after
   any spec change:  node scripts/gen-selia.cjs
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const specs = require('./selia-specs.cjs');

/* Filename + layout archetype per block. `kind` is the switch in SeliaAuto;
   the visual differences between, say, square links and image grid come from
   their own switches (`data-*`) and column shapes, not from a second engine. */
const BLOCKS = [
  ['selia-advanced-slider', 'AdvancedSlider', 'slider'],
  ['selia-featured-categories', 'FeaturedCategories', 'tiles'],
  ['selia-product-videos', 'ProductVideos', 'product-videos'],
  ['selia-detailed-products', 'DetailedProducts', 'detailed-products'],
  ['selia-product-tabs', 'ProductTabs', 'product-tabs'],
  ['selia-about-store', 'AboutStore', 'about'],
  ['selia-square-links', 'SquareLinks', 'tiles'],
  ['selia-image-grid', 'ImageGrid', 'tiles'],
  ['selia-custom-links', 'CustomLinks', 'tiles'],
  ['selia-circle-links', 'CircleLinks', 'tiles'],
  ['selia-double-banner', 'DoubleBanner', 'banners'],
  ['selia-animated-banners', 'AnimatedBanners', 'slider'],
  ['selia-video-gallery', 'VideoGallery', 'videos'],
  ['selia-before-after', 'BeforeAfter', 'compare'],
  ['selia-dynamic-banner', 'DynamicBanner', 'dynamic-banner'],
  ['selia-triple-banner', 'TripleBanner', 'banners'],
  ['selia-featured-animated-products', 'FeaturedAnimatedProducts', 'featured-products'],
  ['selia-offers-counter', 'OffersCounter', 'counter'],
  ['selia-faq', 'Faq', 'faq'],
  ['selia-store-features', 'StoreFeatures', 'features'],
  ['selia-dynamic-product-gallery', 'DynamicProductGallery', 'gallery-hotspots'],
  ['selia-featured-product', 'FeaturedProduct', 'featured-product'],
  ['selia-testimonials', 'Testimonials', 'testimonials'],
  ['selia-animated-brands', 'AnimatedBrands', 'marquee'],
  ['selia-advanced-content', 'AdvancedContent', 'content'],
  ['selia-special-offer', 'SpecialOffer', 'promo'],
];

/* The first eight blocks predate the generator and keep their own markup. */
const FIRST = [
  ['selia-statistics', 'Statistics'],
  ['selia-map-location', 'MapLocation'],
  ['selia-blog', 'BlogTeaser'],
  ['selia-contact-form', 'ContactForm'],
  ['selia-ticker-bar', 'TickerBar'],
  ['selia-category-hero', 'CategoryHero'],
  ['selia-branches', 'Branches'],
  ['selia-custom-products', 'ProductPicks'],
];

const lit = (value) => JSON.stringify(value === undefined ? null : value);
const q = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/** The longest common `_`-terminated prefix of a block's top-level ids. */
function derivePrefix(fields) {
  let prefix = fields[0]?.id ?? '';
  for (const field of fields) {
    let i = 0;
    while (i < prefix.length && i < field.id.length && prefix[i] === field.id[i]) i += 1;
    prefix = prefix.slice(0, i);
  }
  return prefix.replace(/[^_]*$/, '').replace(/_$/, '');
}

/** The manifest default of a control, in the shape the editor writes. */
function defaultValue(field) {
  if (field.format === 'dropdown-list') return field.selected?.[0]?.value ?? '';
  if (field.format === 'variable-list') return field.value ?? [];
  if (field.format === 'switch') return field.value ?? false;
  return field.value ?? '';
}

function describe(key) {
  const spec = specs[`home.${key}`];
  if (!spec) throw new Error(`no spec for home.${key}`);
  const staticFields = spec.fields.filter((f) => f.type === 'static');
  const top = spec.fields.filter((f) => f.type !== 'static' && f.type !== 'collection');
  const collections = spec.fields.filter((f) => f.type === 'collection');
  if (collections.length > 1) throw new Error(`${key}: ${collections.length} collections (renderer supports one)`);
  const prefix = derivePrefix(top);
  const controls = top.map((field) => ({
    key: field.id.slice(prefix.length + 1),
    format: field.format,
    value: defaultValue(field),
    id: field.id,
  }));
  const collection = collections[0];
  const columns = collection
    ? collection.fields.map((field) => ({
        id: field.id,
        key: field.id.startsWith(`${collection.id}.`)
          ? field.id.slice(collection.id.length + 1)
          : field.id,
        format: field.format,
        value: defaultValue(field),
      }))
    : [];
  return {
    key,
    spec,
    prefix,
    controls,
    collection: collection?.id,
    columns,
    staticFields,
    collectionField: collection,
  };
}

function componentSource(block, name, kind) {
  const { key, prefix, controls, collection, columns } = block;
  const controlSchema = controls
    .map((c) => `    { key: ${q(c.key)}, format: ${q(c.format)}, value: ${lit(c.value)} },`)
    .join('\n');
  const columnSchema = columns
    .map((c) => `    { id: ${q(c.id)}, key: ${q(c.key)}, format: ${q(c.format)}, value: ${lit(c.value)} },`)
    .join('\n');
  const valueReads = controls
    .map((c) => `    ${q(c.key)}: readValue(data, ${q(c.key)}, PREFIX),`)
    .join('\n');
  const rowReads = columns
    .map((c) => `      ${q(c.key)}: rowValue(row, ${q(c.key)}, ITEMS),`)
    .join('\n');

  const itemsConst = collection ? `const ITEMS = ${q(collection)};\n` : '';
  const collectionLine = collection ? `  collection: ITEMS,\n` : '';
  const rowsExpr = collection
    ? `  const rows = readRows(data, ITEMS, PREFIX).map((row) => ({\n${rowReads}\n  }));`
    : '  const rows: SeliaRows = [];';

  return `/* GENERATED by scripts/gen-selia.cjs — do not edit by hand.
   Merchant contract: scripts/selia-specs-batch2.cjs (${controls.length} controls, ${columns.length} row columns).
   Behaviour: app/components/home/selia/SeliaAuto.tsx (kind "${kind}").
   Re-run the generator after any spec change; verify-selia.cjs audits the reads. */
import { memo } from 'react';
import { readRows, readValue, rowValue, type BlockData } from '../../../lib/homeBlock';
import { SeliaAuto, type SeliaRows, type SeliaSchema, type SeliaValues } from './SeliaAuto';

const PREFIX = ${q(prefix)};
${itemsConst}
const SCHEMA: SeliaSchema = {
  path: ${q(key)},
  kind: ${q(kind)},
  prefix: PREFIX,
${collectionLine}  controls: [
${controlSchema}
  ],
  columns: [
${columnSchema}
  ],
};

/** \`home.${key}\` — ${block.spec.title.en} / ${block.spec.title.ar}. */
export const ${name} = memo(function ${name}({ data }: { data: BlockData }) {
  const values: SeliaValues = {
${valueReads}
  };
${rowsExpr}
  return <SeliaAuto schema={SCHEMA} values={values} rows={rows} />;
});
`;
}

/* -------------------------------------------------------------------------- *
 * Emit
 * -------------------------------------------------------------------------- */

const dir = path.join(root, 'app/components/home/selia');
const catalogue = [];

for (const [key, name, kind] of BLOCKS) {
  const block = describe(key);
  fs.writeFileSync(path.join(dir, `${name}.tsx`), componentSource(block, name, kind), 'utf8');
  catalogue.push({ key, name, kind, prefix: block.prefix, collection: block.collection ?? null, generated: true });
}
for (const [key, name] of FIRST) {
  catalogue.push({ key, name, kind: 'hand-written', prefix: null, collection: null, generated: false });
}
catalogue.sort((a, b) => Object.keys(specs).indexOf(`home.${a.key}`) - Object.keys(specs).indexOf(`home.${b.key}`));

fs.writeFileSync(
  path.join(__dirname, 'selia-blocks.generated.json'),
  `${JSON.stringify(catalogue, null, 2)}\n`,
  'utf8'
);

/* A typed path -> component map for tests and the visual harness. The router
   keeps its own explicit map (the playbook requires two visible registrations
   there), but 34 hand-maintained import lists in test files would drift. */
const registry = `/* GENERATED by scripts/gen-selia.cjs — do not edit by hand. */
import type { ComponentType } from 'react';
import type { BlockData } from '../../../lib/homeBlock';
${catalogue.map((b) => `import { ${b.name} } from './${b.name}';`).join('\n')}

export type SeliaBlockComponent = ComponentType<{ data: BlockData }>;

export const SELIA_BLOCKS: Record<string, SeliaBlockComponent> = {
${catalogue.map((b) => `  '${b.key}': ${b.name},`).join('\n')}
};
`;
fs.writeFileSync(path.join(dir, 'registry.generated.ts'), registry, 'utf8');

/* -------------------------------------------------------------------------- *
 * Router — three bracketed regions, replaced idempotently.
 * -------------------------------------------------------------------------- */

const routerPath = path.join(root, 'app/router.tsx');
let router = fs.readFileSync(routerPath, 'utf8');

const imports = catalogue
  .map((b) => `import { ${b.name} } from './components/home/selia/${b.name}';`)
  .join('\n');
const map = catalogue.map((b) => `  ${q(b.key)}: ${b.name},`).join('\n');
const config = catalogue
  .map((b) => `  ${q(b.key)}: { className: ${q(`s-block s-block--${b.key}`)} },`)
  .join('\n');

const region = (source, tag, content) => {
  const start = `/* @selia:${tag}:start */`;
  const end = `/* @selia:${tag}:end */`;
  const a = source.indexOf(start);
  const b = source.indexOf(end);
  if (a < 0 || b < 0 || b < a) throw new Error(`router.tsx is missing the ${tag} markers`);
  return `${source.slice(0, a + start.length)}\n${content}\n${source.slice(b)}`;
};

router = region(router, 'imports', imports);
router = region(router, 'map', map);
router = region(router, 'config', config);
fs.writeFileSync(routerPath, router, 'utf8');

console.log(`generated ${BLOCKS.length} components`);
console.log(`catalogue  ${catalogue.length} blocks -> scripts/selia-blocks.generated.json`);
console.log('router     imports / component map / config map refreshed');
