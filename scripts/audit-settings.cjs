#!/usr/bin/env node
/**
 * Settings auditor — cross-references every merchant-facing field in
 * `twilight.json` against the code that is supposed to read it.
 *
 * Why it exists: `check:manifest` proves the manifest is well-formed, but not
 * that a setting does anything. A field can be valid, Arabic-labelled and
 * documented, and still be read by nobody — the merchant moves the slider and
 * nothing changes. That is invisible in review and invisible in tests.
 *
 * It is READ-ONLY. It writes no files and changes no settings.
 *
 * Usage:
 *   node scripts/audit-settings.cjs            # summary + unused list
 *   node scripts/audit-settings.cjs --detail   # every field, with where it is read
 *   node scripts/audit-settings.cjs --json     # machine-readable
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'app');
const TWILIGHT = path.join(ROOT, 'twilight.json');

const argv = process.argv.slice(2);
const DETAIL = argv.includes('--detail');
const JSON_OUT = argv.includes('--json');

/** Every source file a setting could plausibly be read from. */
function collectSources(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      collectSources(full, acc);
    } else if (/\.(tsx?|jsx?|scss|css|json)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

const sources = collectSources(APP).map((file) => {
  const text = fs.readFileSync(file, 'utf8');
  /* Settings are often composed, not spelled out: `productCardSettings.ts`
     declares `const PREFIX = 'product_card'` and reads
     `readBoolean(settings, 'badge', PREFIX, …)`, which resolves to the manifest
     id `product_card_badge`. Matching only the full id would report 468 of 611
     fields as dead — the loudest possible false positive, and exactly the kind
     of number that makes a report untrustworthy. So each file also exposes its
     declared prefixes and its quoted literals. */
  const prefixes = [...text.matchAll(/(?:const|let|var)\s+([A-Z0-9_]*PREFIX[A-Z0-9_]*)\s*=\s*['"]([^'"]+)['"]/g)]
    .map((m) => m[2]);
  /* A second composition style: blocks resolve a short key through a template
     literal — `data[`figurines_${name}`]` in `Figurines.tsx` — so the full id
     never appears as a string either. Both styles are real in this codebase and
     a reader that understands only one of them reports working settings as
     dead. */
  const templatePrefixes = [...text.matchAll(/`([a-z0-9]+(?:_[a-z0-9]+)*)_\$\{/g)].map((m) => m[1]);
  /* A wrapper that pins the prefix once and takes only the key:
     `const read = (data, key, fb) => readText(data, key, 'second_skin', fb)`.
     Call sites are then `read(data, 'eyebrow')` — the prefix never repeats, so
     the file's ambient prefix is the one passed where the KEY is an identifier. */
  const ambientPrefixes = [...text.matchAll(/\b(?:read|row)(?:Value|Text|TextOr|Number|Boolean|Rows|Image|Link)\(\s*[^,()]+,\s*[A-Za-z_$][\w$]*\s*,\s*['"]([^'"]+)['"]/g)]
    .map((m) => m[1]);
  /* A third style, and the one most blocks use: the prefix is an ARGUMENT —
     `readTextOr(data, 'title', 'map', '')` in `MapLocation.tsx` resolves the
     manifest id `map_title`. Matching the helper signature exactly (key = 2nd
     arg, prefix = 3rd) keeps this precise instead of pairing any two strings
     that happen to share a file. */
  const composed = new Set();
  for (const m of text.matchAll(/\b(?:read|row)(?:Value|Text|TextOr|Number|Boolean|Rows|Image|Link)\(\s*[^,()]+,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g)) {
    composed.add(`${m[2]}_${m[1]}`);
  }
  const literals = new Set([...text.matchAll(/['"]([^'"\n]{2,64})['"]/g)].map((m) => m[1]));
  return {
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    text,
    prefixes: [...new Set([...prefixes, ...templatePrefixes, ...ambientPrefixes])],
    composed,
    literals,
  };
});

/* The engine renders some surfaces from these same settings — the product
   card's out-of-stock button reads `notify_when_available_in_card`, the footer
   reads `footer_is_dark`. Scanning only `app/` therefore reported working
   settings as dead. Resolve the package symlink and read its built output as
   one more source; the files are minified, so a hit reports line 1 and the
   reader has to open the file. `.d.ts` files are deliberately excluded: a
   declared type is not a read. */
try {
  const engineRoot = fs.realpathSync(
    path.join(ROOT, 'node_modules/@salla.sa/twilight-theme-engine')
  );
  for (const file of collectSources(path.join(engineRoot, 'dist'))) {
    if (!file.endsWith('.js')) continue;
    sources.push({
      file: path.relative(ROOT, file).replace(/\\/g, '/'),
      text: fs.readFileSync(file, 'utf8'),
      prefixes: [],
      composed: new Set(),
      literals: new Set(),
    });
  }
} catch {
  /* package not installed — the app-only answer stands, and the summary says so */
}

/** Where is this field read? Returns [] when nothing reads it. */function findReaders(id) {
  const hits = [];
  for (const src of sources) {
    if (src.text.includes(id)) {
      const lines = src.text.split('\n');
      for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].includes(id)) {
          hits.push(`${src.file}:${i + 1}`);
          break;
        }
      }
      continue;
    }
    /* composed id via a helper call: `readTextOr(data, 'title', 'map', …)` */
    if (src.composed.has(id)) {
      const lines = src.text.split('\n');
      const at = lines.findIndex((line) => /read|row/.test(line) && line.includes(id.split('_').pop()));
      hits.push(`${src.file}:${at === -1 ? 1 : at + 1} (helper call)`);
      continue;
    }
    /* composed id: `<prefix>_<rest>` where the file declares the prefix and
       quotes the remainder */
    for (const prefix of src.prefixes) {
      if (!id.startsWith(`${prefix}_`)) continue;
      const rest = id.slice(prefix.length + 1);
      if (!src.literals.has(rest)) continue;
      const lines = src.text.split('\n');
      const at = lines.findIndex((line) => line.includes(`'${rest}'`) || line.includes(`"${rest}"`));
      hits.push(`${src.file}:${at === -1 ? 1 : at + 1} (prefix ${prefix})`);
      break;
    }
  }
  return hits;
}

const twilight = JSON.parse(fs.readFileSync(TWILIGHT, 'utf8'));

const fields = [];
const addField = (field, owner, ownerTitle) => {
  if (!field || typeof field !== 'object') return;
  fields.push({
    id: field.id,
    key: field.key,
    type: field.type,
    format: field.format,
    owner,
    ownerTitle: ownerTitle || '',
    hasDefault: field.value !== undefined || field.selected !== undefined || field.default !== undefined,
    labelAr: field.label && typeof field.label === 'object' ? field.label.ar : undefined,
    labelEn: field.label && typeof field.label === 'object' ? field.label.en : undefined,
  });
};

for (const setting of twilight.settings || []) {
  addField(setting, 'settings', 'theme settings');
}
for (const component of twilight.components || []) {
  const title = component.title && (component.title.en || component.title.ar);
  for (const field of component.fields || []) {
    addField(field, component.path || 'component', title);
  }
}

const results = fields.map((field) => {
  const ids = [field.id, field.key].filter(Boolean);
  const readers = ids.length ? [...new Set(ids.flatMap(findReaders))] : [];
  return { ...field, readers, consumed: readers.length > 0 };
});

// ---- type/format census (factual, no schema guessing) ----
const census = (key) => {
  const map = new Map();
  for (const r of results) {
    const v = r[key] === undefined ? '(none)' : String(r[key]);
    map.set(v, (map.get(v) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const unused = results.filter((r) => !r.consumed && r.type !== 'static');
const noId = results.filter((r) => !r.id);
const noDefault = results.filter((r) => !r.hasDefault);
const staticFields = results.filter((r) => r.type === 'static');

const summary = {
  totalFields: results.length,
  themeSettings: (twilight.settings || []).length,
  components: (twilight.components || []).length,
  consumed: results.length - unused.length,
  unused: unused.length,
  staticLabels: staticFields.length,
  withoutId: noId.length,
  withoutDefault: noDefault.length,
};

if (JSON_OUT) {
  console.log(JSON.stringify({ summary, unused, results }, null, 1));
  process.exit(0);
}

console.log('');
console.log(`Settings audit — ${summary.components} components, ${summary.themeSettings} theme settings, ${summary.totalFields} fields`);
console.log('');
console.log(`  ${String(summary.consumed).padStart(4)}  read by code`);
console.log(`  ${String(summary.staticLabels).padStart(4)}  static labels (type=static — no code expected)`);
console.log(`  ${String(summary.unused).padStart(4)}  NOT read by any code path`);
console.log(`  ${String(summary.withoutId).padStart(4)}  without an id`);
console.log(`  ${String(summary.withoutDefault).padStart(4)}  without a default (value/selected)`);

console.log('\n  field types');
for (const [k, n] of census('type')) console.log(`    ${String(n).padStart(4)}  ${k}`);
console.log('\n  field formats');
for (const [k, n] of census('format')) console.log(`    ${String(n).padStart(4)}  ${k}`);

if (unused.length) {
  console.log(`\n  NOT READ BY CODE (${unused.length})`);
  const byOwner = new Map();
  for (const u of unused) {
    const key = u.ownerTitle || u.owner;
    if (!byOwner.has(key)) byOwner.set(key, []);
    byOwner.get(key).push(u);
  }
  for (const [owner, list] of byOwner) {
    console.log(`\n    ${owner}`);
    for (const u of list) {
      const label = u.labelEn || u.labelAr || '(no label)';
      console.log(`      ${String(u.id || '(no id)').padEnd(34)} ${u.type || '?'}/${u.format || '?'}   ${String(label).slice(0, 46)}`);
    }
  }
}

if (DETAIL) {
  console.log('\n  ALL FIELDS');
  for (const r of results) {
    const where = r.consumed ? r.readers[0] : 'UNREAD';
    console.log(`    ${String(r.id || '(no id)').padEnd(34)} ${String(r.type || '?').padEnd(10)} ${String(r.format || '-').padEnd(12)} ${where}`);
  }
}

console.log('');
