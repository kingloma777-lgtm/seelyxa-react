#!/usr/bin/env node
/* ==========================================================================
   Home layout control for the dev preview — `twilight.preview.json`.

   WHY THIS EXISTS
   ---------------
   In dev, the home page does NOT render the store's blocks. The engine swaps
   them for the preview layout:

     chunk-WBPOWM74.js  useDevLayoutBlocks()
       if (!overrides.enabled || !overrides.layout) return components;  // store
       return overrides.layout.map(...)                                 // preview

   So `enabled: true` + `layout: []` is an empty home page, and `layout` is the
   only thing that decides what shows. Deleting blocks in the Salla dashboard
   changes the store, not this file — the page keeps showing the preview layout,
   which reads exactly like "they came back". Nothing is cached; the file is
   simply the source of truth.

   The second way they come back: `scripts/seed-selia-preview.cjs` appends every
   block from `selia-specs.cjs`. Never run it while testing one block at a time.

   The third way: an open dev tab holds the layout in memory and writes the whole
   state back (250ms debounce) on any panel change. Editing this file with a tab
   open is a race the tab wins. The Vite plugin full-reloads the page when the
   file changes, so a normal reload after a write is enough.

   USAGE
     node scripts/home-layout.cjs list
     node scripts/home-layout.cjs empty
     node scripts/home-layout.cjs only selia-faq
     node scripts/home-layout.cjs only selia-faq selia-testimonials
     node scripts/home-layout.cjs add selia-faq
     node scripts/home-layout.cjs remove selia-faq
     node scripts/home-layout.cjs restore

   `home.` prefix is accepted and stripped. `only` / `add` / `remove` take the
   block's own seeded fields from the backup, so a restored block keeps the
   artwork and copy it had; a path with no backup entry gets a bare block.
   ========================================================================== */

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const previewPath = path.join(root, 'twilight.preview.json');
const backupPath = path.join(root, 'twilight.preview.layout-backup.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const clean = (p) => String(p).replace(/^home\./, '').trim();
const randomId = () =>
  `b-${Array.from(globalThis.crypto.getRandomValues(new Uint8Array(6)), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('')}`;

/** The backup is the full seeded layout, written once and never overwritten by
 *  a shrink — otherwise "restore" would only restore what was left. */
function loadBackup() {
  if (fs.existsSync(backupPath)) return readJson(backupPath);
  const preview = readJson(previewPath);
  const backup = { savedAt: new Date().toISOString(), layout: preview.layout ?? [] };
  writeJson(backupPath, backup);
  return backup;
}

function blockFrom(pathname, backup) {
  const source = (backup.layout ?? []).find((block) => clean(block.path) === pathname);
  if (source) return { ...source, id: randomId(), fields: { ...source.fields } };
  return { id: randomId(), path: pathname, fields: {} };
}

const [command, ...args] = process.argv.slice(2);
const preview = readJson(previewPath);
const backup = loadBackup();
const current = Array.isArray(preview.layout) ? preview.layout : [];

function save(layout, note) {
  writeJson(previewPath, { ...preview, enabled: true, layout });
  console.log(`${note} — ${layout.length} block(s) in twilight.preview.json`);
  if (layout.length) console.log(layout.map((b, i) => `  ${i + 1}. ${b.path}`).join('\n'));
  else console.log('  (empty home — the page renders nothing but the header/footer)');
}

switch (command) {
  case 'list': {
    if (!current.length) {
      console.log('layout is empty.');
      break;
    }
    console.log(`enabled=${preview.enabled}  ${current.length} block(s):`);
    current.forEach((block, i) => console.log(`  ${i + 1}. ${block.path}  [${block.id}]`));
    console.log(`\nbackup: ${backup.layout.length} block(s) at ${path.basename(backupPath)}`);
    break;
  }

  case 'empty':
    save([], 'emptied');
    break;

  case 'only': {
    if (!args.length) throw new Error('only needs at least one block path');
    const wanted = args.map(clean);
    const unknown = wanted.filter((p) => !(backup.layout ?? []).some((b) => clean(b.path) === p));
    if (unknown.length) console.warn(`! not in the backup, adding bare: ${unknown.join(', ')}`);
    save(wanted.map((p) => blockFrom(p, backup)), `keeping only ${wanted.join(', ')}`);
    break;
  }

  case 'add': {
    if (!args.length) throw new Error('add needs a block path');
    const layout = [...current];
    for (const arg of args) {
      const p = clean(arg);
      if (layout.some((b) => clean(b.path) === p)) {
        console.log(`= ${p} already present, skipped`);
        continue;
      }
      layout.push(blockFrom(p, backup));
    }
    save(layout, 'added');
    break;
  }

  case 'remove': {
    if (!args.length) throw new Error('remove needs a block path');
    const drop = new Set(args.map(clean));
    const layout = current.filter((b) => !drop.has(clean(b.path)));
    save(layout, `removed ${[...drop].join(', ')}`);
    break;
  }

  case 'restore':
    save(backup.layout.map((b) => ({ ...b, fields: { ...b.fields } })), 'restored from backup');
    break;

  default:
    console.log(
      [
        'usage: node scripts/home-layout.cjs <command>',
        '',
        '  list                     show the current home layout',
        '  empty                    no blocks at all',
        '  only <path...>           exactly these blocks, in this order',
        '  add <path...>            append blocks',
        '  remove <path...>         drop blocks',
        '  restore                  put the full seeded layout back',
      ].join('\n')
    );
}
