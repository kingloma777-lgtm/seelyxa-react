#!/usr/bin/env node
/**
 * Design-system audit — measures the theme against the store-wide standard
 * (responsive · RTL/LTR · global tokens · animation · a11y).
 *
 * It reads, it never writes. Every number it prints is a count of real matches
 * in `app/styles/**` and `app/components/**`, so a "0" is proof and a "37" is a
 * work item — not an opinion.
 *
 *   node scripts/audit-design-system.cjs           # summary
 *   node scripts/audit-design-system.cjs --detail  # + file:line for each hit
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DETAIL = process.argv.includes('--detail');

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(full, out);
    } else out.push(full);
  }
  return out;
};

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

/* Tokens that make a value "system-provided" rather than hardcoded. A colour
   written as a hex literal is a defect only when it is not the definition site
   (`01-settings/global.scss`) and not inside a `--token:` declaration. */
const SCSS = walk(path.join(ROOT, 'app/styles')).filter((f) => f.endsWith('.scss'));
const TSX = walk(path.join(ROOT, 'app/components')).filter((f) => /\.(tsx?|ts)$/.test(f));

const checks = [];
const add = (name, hint) => {
  const check = { name, hint, hits: [] };
  checks.push(check);
  return check;
};

/* ── 1. hardcoded colours ─────────────────────────────────────────────── */
/* Split on purpose: a neutral black/white alpha (`rgba(0,0,0,.06)`) is an
   overlay or a shadow and carries no brand decision, while a HUE is a colour
   the merchant cannot change from the panel. Only the second is a real gap;
   lumping them together produced a scary 510 for what is mostly shadow ink. */
const chroma = add('hardcoded HUE (brand colour bypassing the tokens)', 'should read a --color-* / --ink-* token');
const neutral = add('hardcoded neutral (shadow / overlay ink)', 'acceptable, but a --line-* / alpha token is cleaner');
const TOKEN_FILES = /01-settings|02-generic\/dark\.scss/;

const parseRgb = (token) => {
  if (token.startsWith('#')) {
    let hex = token.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = hex.slice(0, 3).split('').map((c) => c + c).join('');
    if (hex.length < 6) return null;
    return [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
  }
  const nums = token.replace(/^[a-z]+\(/i, '').split(',').map((s) => parseFloat(s));
  return nums.length >= 3 && nums.slice(0, 3).every((n) => !Number.isNaN(n)) ? nums.slice(0, 3) : null;
};

/**
 * Is the colour at `index` the FALLBACK of a `var(--x, …)`? A fallback is the
 * token's default, not a bypass — flagging it would punish exactly the
 * components that already read the system.
 */
const isVarFallback = (line, index) => {
  let depth = 0;
  let varDepth = null;
  for (let i = 0; i < index; i++) {
    const ch = line[i];
    if (ch === '(') {
      depth++;
      // the `(` that closes over a `var` token starts a fallback context
      if (line.slice(Math.max(0, i - 5), i).includes('var') && line.slice(0, i).trimEnd().endsWith('var')) {
        varDepth = depth;
      }
    } else if (ch === ')') {
      if (varDepth !== null && depth === varDepth) varDepth = null;
      depth--;
    }
  }
  return varDepth !== null;
};

for (const file of SCSS) {
  if (TOKEN_FILES.test(rel(file))) continue;
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  let inBlockComment = false;

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // a comment describes a value, it does not paint one
    if (inBlockComment) {
      if (trimmed.includes('*/')) inBlockComment = false;
      return;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inBlockComment = true;
      return;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    if (/^\s*--/.test(line)) return; // a token definition is where a value belongs

    const re = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
    let m;
    while ((m = re.exec(line))) {
      if (isVarFallback(line, m.index)) continue;
      const rgb = parseRgb(m[0]);
      if (!rgb) continue;
      const hit = { file: rel(file), line: i + 1, text: trimmed.slice(0, 110) };
      const spread = Math.max(...rgb) - Math.min(...rgb);
      (spread <= 12 ? neutral : chroma).hits.push(hit);
    }
  });
}

/* ── 2. physical direction properties ─────────────────────────────────── */
const dirs = add(
  'physical left/right',
  'logical properties (inline-start/end) keep RTL working without a mirror'
);
const PHYSICAL =
  /(^|[\s;{])(margin|padding|border)-(left|right)\s*:|(^|[\s;{])left\s*:|(^|[\s;{])right\s*:|text-align\s*:\s*(left|right)\b|float\s*:\s*(left|right)\b/;
for (const file of SCSS) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    if (PHYSICAL.test(line)) dirs.hits.push({ file: rel(file), line: i + 1, text: line.trim().slice(0, 110) });
  });
}

/* ── 3. hardcoded type ────────────────────────────────────────────────── */
const type = add(
  'hardcoded font-family',
  'should read --font-display / --font-mono / --font-main'
);
/* `inherit` is the correct answer, and `sallaicons` is the icon font — neither
   is a design decision the merchant can make, so neither is a finding. */
const TYPE_OK = /var\(--|inherit|unset|initial|sallaicons/;
for (const file of SCSS) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    if (/font-family\s*:/.test(line) && !TYPE_OK.test(line))
      type.hits.push({ file: rel(file), line: i + 1, text: line.trim().slice(0, 110) });
  });
}

/* ── 4. motion without a reduced-motion escape ────────────────────────── */
const motion = add(
  'animated file without prefers-reduced-motion',
  'every file that animates owes a reduced-motion branch'
);
for (const file of SCSS) {
  const src = fs.readFileSync(file, 'utf8');
  const animates = /@keyframes|animation\s*:|transition\s*:/.test(src);
  if (animates && !/prefers-reduced-motion/.test(src))
    motion.hits.push({ file: rel(file), line: 0, text: 'animates, no reduced-motion branch' });
}

/* ── 5. fixed widths in flow layout ───────────────────────────────────── */
const fixed = add('fixed px width', 'fluid sizing survives every viewport');
for (const file of SCSS) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    if (/(^|[\s;{])(width|min-width)\s*:\s*\d{3,}px/.test(line))
      fixed.hits.push({ file: rel(file), line: i + 1, text: line.trim().slice(0, 110) });
  });
}

/* ── 6. inline colour / direction in components ───────────────────────── */
const inline = add('inline style colour in a component', 'tokens travel via class or CSS var');
for (const file of TSX) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    if (/(style=\{\{[^}]*?(color|background|fontFamily)\s*:)/.test(line))
      inline.hits.push({ file: rel(file), line: i + 1, text: line.trim().slice(0, 110) });
  });
}

/* ── 7. rtl awareness of the components that carry arrows/icons ───────── */
const rtl = add(
  'directional icon with no direction read in the component',
  'CANDIDATE — check the matching SCSS for a [dir=ltr] mirror before touching it'
);
for (const file of TSX) {
  const src = fs.readFileSync(file, 'utf8');
  const hasArrow = /Arrow(Left|Right)Icon|Chevron(Left|Right)|arrow-left|arrow-right/.test(src);
  if (hasArrow && !/isRTL|dir\s*===|\[dir=|direction/.test(src))
    rtl.hits.push({ file: rel(file), line: 0, text: 'directional icon, no direction read' });
}

/* ── report ───────────────────────────────────────────────────────────── */
const total = checks.reduce((n, c) => n + c.hits.length, 0);
console.log(`\nDesign-system audit — ${SCSS.length} SCSS files, ${TSX.length} component files\n`);
for (const c of checks) {
  const flag = c.hits.length === 0 ? 'OK  ' : 'FAIL';
  console.log(`${flag}  ${String(c.hits.length).padStart(4)}  ${c.name}`);
  if (c.hits.length) console.log(`            ↳ ${c.hint}`);
  if (DETAIL) {
    for (const h of c.hits) console.log(`            ${h.file}:${h.line}  ${h.text}`);
  } else {
    const byFile = new Map();
    for (const h of c.hits) byFile.set(h.file, (byFile.get(h.file) || 0) + 1);
    const top = [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (top.length) console.log(`            ${top.map(([f, n]) => `${path.basename(f)}×${n}`).join('  ')}`);
  }
}
console.log(`\n${total} findings\n`);
process.exitCode = total === 0 ? 0 : 1;
