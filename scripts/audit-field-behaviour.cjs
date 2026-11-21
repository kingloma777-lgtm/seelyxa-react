#!/usr/bin/env node
/**
 * Field BEHAVIOUR auditor — the second question after "is this field read?".
 *
 * `audit-settings.cjs` proves a field has a reader. That still leaves four ways
 * a setting can lie to a merchant, and none of them show up in a test or in
 * `check:manifest`:
 *
 *   1. DEFAULT DRIFT — the manifest promises one default and the code falls
 *      back to another. A fresh install and a "reset" then disagree.
 *   2. TYPE DRIFT — a switch read as text, or a number read as text: the value
 *      arrives as `'false'` (truthy) or `'12'` and the block misbehaves.
 *   3. DEAD OPTIONS — a dropdown offers four choices and the code branches on
 *      none of them, so every choice renders the same thing.
 *   4. RANGE DRIFT — the manifest allows 2..60 and the code clamps to 2..12,
 *      silently discarding the merchant's choice above 12.
 *
 * READ-ONLY. Writes nothing.
 *
 * Usage: node scripts/audit-field-behaviour.cjs [--json]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const APP = path.join(ROOT, 'app');
const JSON_OUT = process.argv.includes('--json');

function collect(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules') continue;
      collect(full, acc);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

/* ── source index ───────────────────────────────────────────────────────── */
const files = collect(APP).map((file) => {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  /* string consts, so an identifier prefix can be resolved to its literal */
  const consts = new Map();
  for (const m of text.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::\s*\w+\s*)?=\s*['"]([^'"]+)['"]/g)) {
    consts.set(m[1], m[2]);
  }
  return { rel, text, lines: text.split('\n'), consts };
});

/** read* calls whose id is composed from (key, prefix). */
const calls = [];
const CALL_RE =
  /\b(read(?:TextOr|Text|Number|Boolean|Value|Rows|Image|Link))\(\s*[^,()]+?\s*,\s*(['"])([^'"]+)\2\s*,\s*(?:(['"])([^'"]+)\4|([A-Za-z_$][\w$]*))\s*(?:,\s*([^)]*))?\)/g;

for (const f of files) {
  for (const m of f.text.matchAll(CALL_RE)) {
    const kind = m[1];
    const key = m[3];
    let prefix = m[5] || '';
    if (!prefix && m[6]) prefix = f.consts.get(m[6]) || '';
    if (!prefix) continue;
    const raw = (m[7] || '').trim();
    const line = f.text.slice(0, m.index).split('\n').length;
    calls.push({ id: `${prefix}_${key}`, kind, fallbackRaw: raw, file: f.rel, line, text: f.text });
  }
}

/** Parse a fallback expression into a comparable primitive, or null. */
function parseFallback(raw) {
  if (!raw) return null;
  const s = raw.trim();
  const str = /^(['"])([\s\S]*)\1$/.exec(s);
  if (str) return { value: str[2], kind: 'string' };
  if (/^(true|false)$/.test(s)) return { value: s === 'true', kind: 'boolean' };
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return { value: Number(s), kind: 'number' };
  return null;
}

/** Normalise anything to a comparable string. */
const norm = (v) => {
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (v === null || v === undefined) return '';
  return String(v);
};

/* ── manifest ───────────────────────────────────────────────────────────── */
const twilight = JSON.parse(fs.readFileSync(path.join(ROOT, 'twilight.json'), 'utf8'));

const fields = [];
const push = (f, owner, ownerTitle) => {
  if (!f || typeof f !== 'object' || !f.id) return;
  let def = null;
  let multi = false;
  if (Array.isArray(f.selected)) {
    if (f.selected.length === 1 && f.selected[0] && f.selected[0].value !== undefined) {
      def = f.selected[0].value;
    } else if (f.selected.length > 1) multi = true;
  } else if (f.selected && typeof f.selected === 'object' && f.selected.value !== undefined) {
    def = f.selected.value;
  } else if (f.value !== undefined && (typeof f.value !== 'object' || f.value === null)) {
    def = f.value;
  }
  const options = Array.isArray(f.options)
    ? f.options.map((o) => (o && typeof o === 'object' ? o.value : o)).filter((v) => v !== undefined)
    : [];
  fields.push({
    id: f.id,
    type: f.type,
    format: f.format,
    owner,
    ownerTitle: ownerTitle || '',
    label: (f.label && (f.label.en || f.label.ar)) || '',
    default: def,
    multi,
    options,
    hasMin: f.min !== undefined,
    min: f.min,
    max: f.max,
  });
};

for (const s of twilight.settings || []) push(s, 'settings', 'Theme settings');
for (const c of twilight.components || []) {
  const title = c.title && (c.title.en || c.title.ar);
  for (const f of c.fields || []) push(f, c.path || 'component', title);
}

/* ── checks ─────────────────────────────────────────────────────────────── */
const findings = { defaultDrift: [], typeDrift: [], deadOptions: [], rangeDrift: [] };

const KIND_EXPECT = {
  readBoolean: ['boolean'],
  readNumber: ['number'],
  readText: ['string', 'items', 'collection'],
  readTextOr: ['string', 'items', 'collection'],
  readValue: ['string', 'items', 'collection', 'number', 'boolean'],
  readRows: ['collection', 'items'],
  readImage: ['string'],
  readLink: ['string'],
};

for (const f of fields) {
  if (f.type === 'static') continue;
  const mine = calls.filter((c) => c.id === f.id);
  if (!mine.length) continue;
  const c = mine[0];

  /* 1. default drift */
  const fb = parseFallback(c.fallbackRaw);
  if (fb && !f.multi && f.default !== null && f.default !== undefined && f.default !== '') {
    if (norm(fb.value) !== norm(f.default)) {
      findings.defaultDrift.push({
        id: f.id,
        owner: f.ownerTitle,
        declared: norm(f.default),
        codeFallback: norm(fb.value),
        where: `${c.file}:${c.line}`,
      });
    }
  }

  /* 2. type drift */
  const allowed = KIND_EXPECT[c.kind] || null;
  if (allowed && !allowed.includes(f.type)) {
    findings.typeDrift.push({
      id: f.id,
      owner: f.ownerTitle,
      declaredType: f.type,
      reader: c.kind,
      where: `${c.file}:${c.line}`,
    });
  }

  /* 3. dead options — a dropdown whose every value is unknown to the reader */
  if (f.options.length > 1 && f.format === 'dropdown-list') {
    const handled = f.options.filter((v) => {
      const s = String(v);
      if (!s) return false;
      /* quoted literal, object key, or a bare comparison against the value */
      return (
        c.text.includes(`'${s}'`) ||
        c.text.includes(`"${s}"`) ||
        new RegExp(`[{,\\s]${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:,\\]}]`).test(c.text)
      );
    });
    if (!handled.length) {
      findings.deadOptions.push({
        id: f.id,
        owner: f.ownerTitle,
        options: f.options.map(String),
        where: `${c.file}:${c.line}`,
      });
    }
  }

  /* 4. range drift — the code clamps tighter than the manifest allows */
  if (f.type === 'number' && (f.hasMin || f.max !== undefined)) {
    const mins = [...c.text.matchAll(/Math\.min\(\s*(\d+)\s*,/g)].map((m) => Number(m[1]));
    const maxs = [...c.text.matchAll(/Math\.max\(\s*(\d+)\s*,/g)].map((m) => Number(m[1]));
    const lo = mins.length ? Math.max(...mins) : null;
    const hi = maxs.length ? Math.min(...maxs) : null;
    const declMin = f.min !== undefined ? Number(f.min) : null;
    const declMax = f.max !== undefined ? Number(f.max) : null;
    if (hi !== null && declMax !== null && hi < declMax) {
      findings.rangeDrift.push({
        id: f.id,
        owner: f.ownerTitle,
        declared: `${declMin ?? '?'}..${declMax}`,
        clampedBy: `max ${hi}`,
        where: `${c.file}:${c.line}`,
      });
    } else if (lo !== null && declMin !== null && lo > declMin) {
      findings.rangeDrift.push({
        id: f.id,
        owner: f.ownerTitle,
        declared: `${declMin}..${declMax ?? '?'}`,
        clampedBy: `min ${lo}`,
        where: `${c.file}:${c.line}`,
      });
    }
  }
}

const total = findings.defaultDrift.length + findings.typeDrift.length +
  findings.deadOptions.length + findings.rangeDrift.length;

if (JSON_OUT) {
  console.log(JSON.stringify({ fields: fields.length, findings, total }, null, 1));
  process.exit(0);
}

const line = (label, arr, fmt) => {
  console.log(`\n  ${arr.length ? 'FLAG' : 'OK  '}  ${String(arr.length).padStart(3)}  ${label}`);
  for (const item of arr.slice(0, 14)) console.log(`          ${fmt(item)}`);
  if (arr.length > 14) console.log(`          … ${arr.length - 14} more`);
};

console.log('');
console.log(`Field behaviour audit — ${fields.length} fields with an id`);
console.log(`  ${calls.length} composed read-calls resolved`);
line('default drift (manifest default ≠ code fallback)', findings.defaultDrift,
  (x) => `${x.id.padEnd(32)} declared=${x.declared} code=${x.codeFallback}  ${x.where}`);
line('type drift (field type ≠ reader kind)', findings.typeDrift,
  (x) => `${x.id.padEnd(32)} ${x.declaredType} read by ${x.reader}  ${x.where}`);
line('dead options (no option value handled)', findings.deadOptions,
  (x) => `${x.id.padEnd(32)} [${x.options.join(',')}]  ${x.where}`);
line('range drift (code clamps tighter than declared)', findings.rangeDrift,
  (x) => `${x.id.padEnd(32)} declared ${x.declared} but ${x.clampedBy}  ${x.where}`);
console.log(`\n  ${total} behaviour finding(s)\n`);
