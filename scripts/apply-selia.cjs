/* ==========================================================================
   Applies `selia-specs.cjs` to `twilight.json`.

   Idempotent on purpose: a block that is already in the theme keeps its uuid
   and its position, and only its fields/title/icon are refreshed. That means a
   corrected Arabic label is one edit in the spec plus one run, and re-running
   never produces the duplicate-block mess that hand-editing a 4000-line JSON
   eventually does.

   Collection fields get a uuid of their own, reused when the collection id
   already exists — the editor keys its stored rows off it.
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const twilightPath = path.join(root, 'twilight.json');
const specs = require('./selia-specs.cjs');

const uuid = () => crypto.randomUUID();
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const twilight = readJson(twilightPath);
const components = twilight.components;

/* `components` MUST be an array. The schema validator says so out loud at dev
   start (`[twilight-react:schema] twilight.json components: Must be an array`),
   and a working tree that had drifted to `{"0":…,"1":…}` is why the merchant
   editor showed none of the theme's blocks. Accept either shape on read so this
   script can repair a drifted file instead of depending on it. */
const list = Array.isArray(components)
  ? [...components]
  : Object.keys(components)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => components[key]);

/** Existing uuid per collection id, so a re-run keeps the editor's rows bound. */
const existingCollectionKeys = new Map();
list.forEach((component) => {
  (component.fields || []).forEach((field) => {
    if (field.type === 'collection' && field.id && field.key) {
      existingCollectionKeys.set(field.id, field.key);
    }
  });
});

function prepare(fields) {
  return fields.map((field) => {
    if (field.type !== 'collection') return field;
    const key = existingCollectionKeys.get(field.id) || uuid();
    existingCollectionKeys.set(field.id, key);
    return { ...field, key };
  });
}

const report = [];

Object.entries(specs).forEach(([componentPath, spec]) => {
  const position = list.findIndex((component) => component.path === componentPath);
  const fields = prepare(spec.fields);

  if (position >= 0) {
    const existing = list[position];
    existing.title = spec.title;
    existing.icon = spec.icon;
    existing.fields = fields;
    report.push(`updated  ${componentPath}  (${fields.length} fields)`);
    return;
  }

  list.push({
    key: uuid(),
    title: spec.title,
    icon: spec.icon,
    path: componentPath,
    image: '',
    is_default: true,
    fields,
  });
  report.push(`added    ${componentPath}  (${fields.length} fields)`);
});

/* Written back as an ARRAY — see the note where `list` is built. The object
   form is what the schema rejects, so this run repairs it as a side effect.
   Any `home.selia-*` entry that is no longer in the specs is pruned: renaming a
   block in the spec would otherwise leave the old path in the manifest, and a
   path with no registered component renders an empty wrapper with no error
   anywhere. */
const specPaths = new Set(Object.keys(specs));
const pruned = list.filter(
  (component) => !/^home\.selia-/.test(component.path) || specPaths.has(component.path)
);
const removed = list.length - pruned.length;
twilight.components = pruned;

fs.writeFileSync(twilightPath, `${JSON.stringify(twilight, null, 2)}\n`, 'utf8');
if (removed) console.log(`pruned   ${removed} stale selia path(s)`);

const fieldCount = list.reduce((total, component) => total + (component.fields || []).length, 0);
console.log(report.join('\n'));
console.log(`\ntotal components: ${list.length}`);
console.log(`total fields:     ${fieldCount}`);
