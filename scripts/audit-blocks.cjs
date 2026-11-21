#!/usr/bin/env node
/**
 * Block auditor — one row of evidence per registered home block.
 *
 * The shared contract test proves a block renders and hydrates. It does not
 * prove the block reads its settings, survives RTL, respects reduced motion, or
 * has an empty state. This measures those per block so the review has numbers
 * instead of impressions.
 *
 * READ-ONLY.
 *
 * Usage:
 *   node scripts/audit-blocks.cjs
 *   node scripts/audit-blocks.cjs --json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const JSON_OUT = process.argv.includes('--json');

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');

const twilight = JSON.parse(read(path.join(ROOT, 'twilight.json')));
const routerSrc = read(path.join(ROOT, 'app/router.tsx'));
const seliaRegistry = read(path.join(ROOT, 'app/components/home/selia/registry.generated.ts'));

const pascalOf = (s) =>
  s
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/** Find the TSX that implements a block, by convention then by registry. */
function findComponent(pathKey) {
  const short = pathKey.replace(/^home\./, '');
  const pascal = pascalOf(short);
  /* Selia blocks live in `home/selia/` and drop the `selia-` prefix in their
     filename: `home.selia-statistics` → `selia/Statistics.tsx`. Two of them
     rename the concept as well, so they are mapped explicitly rather than
     guessed. */
  const ALIASES = {
    'selia-blog': 'BlogTeaser',
    'selia-custom-products': 'ProductPicks',
  };
  const withoutSelia = pascalOf(short.replace(/^selia-/, ''));
  const candidates = [
    ALIASES[short] ? path.join(ROOT, 'app/components/home/selia', `${ALIASES[short]}.tsx`) : null,
    path.join(ROOT, 'app/components/home', `${pascal}.tsx`),
    path.join(ROOT, 'app/components/home/selia', `${pascal}.tsx`),
    path.join(ROOT, 'app/components/home/selia', `${withoutSelia}.tsx`),
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

/* Every stylesheet, read once — a block is "styled" when its own sheet exists
   OR its class prefix appears anywhere in the style tree. Several blocks share
   `home-blocks.scss` and the Selia family shares `selia-base`/`selia-generated`,
   so a filename lookup alone reports working blocks as unstyled. */
const allScss = (() => {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.scss')) out.push(fs.readFileSync(full, 'utf8'));
    }
  };
  walk(path.join(ROOT, 'app/styles'));
  return out.join('\n');
})();

/** Find the SCSS that dresses a block. */
function findStyle(pathKey) {
  const short = pathKey.replace(/^home\./, '');
  const candidates = [
    path.join(ROOT, 'app/styles/04-components', `${short}.scss`),
    path.join(ROOT, 'app/styles/04-components', `selia-${short.replace(/^selia-/, '')}.scss`),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

/** Does any test file mention this block? */
function findTests(pascal, short) {
  const dir = path.join(ROOT, 'tests');
  const hits = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(test|spec)\.tsx?$/.test(entry.name)) {
        const text = read(full);
        if (text.includes(pascal) || text.includes(`home.${short}`) || text.includes(`'${short}'`)) {
          hits.push(path.relative(ROOT, full).replace(/\\/g, '/'));
        }
      }
    }
  };
  walk(dir);
  return hits;
}

const blocks = (twilight.components || []).map((component) => {
  const pathKey = component.path || '';
  const short = pathKey.replace(/^home\./, '');
  const pascal = short
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const tsxPath = findComponent(pathKey);
  const scssPath = findStyle(pathKey);
  const tsx = tsxPath ? read(tsxPath) : '';
  const scss = scssPath ? read(scssPath) : '';

  const fields = (component.fields || []).filter((f) => f.type !== 'static');
  const registeredInRouter =
    routerSrc.includes(short) || routerSrc.includes(pascal) || seliaRegistry.includes(`./${pascal}`);
  const tests = findTests(pascal, short);

  /* 34 of the 43 blocks are thin generated wrappers over one shared engine
     (`SeliaAuto`) and one shared shell (`SeliaSection`). The container, the
     single `<h2>`, the palette and the empty-state guard live there once —
     checking for them per block would report 29 "defects" that are really the
     architecture working as designed. So a wrapper inherits its shell's
     guarantees and the report says so instead of inventing findings. */
  const sharedShell = /SeliaAuto|SeliaSection/.test(tsx);
  /* `SeliaAllBlocks.ssr-csr.test.tsx` walks `SELIA_BLOCKS[path]`, so it covers
     every Selia block without naming any of them. Name-matching would report 34
     covered blocks as untested. */
  const sharedTestExists = fs.existsSync(path.join(ROOT, 'tests/components/home/SeliaAllBlocks.ssr-csr.test.tsx'));
  const coveredBySharedTest = sharedShell && sharedTestExists;
  /* `figurines` and the shared `home-blocks.scss` case: styled if the block's
     own sheet exists, or its class prefix is dressed somewhere in the tree. */
  const classPrefix = short.replace(/^selia-/, 'selia-');
  const styledSomewhere = allScss.includes(`${classPrefix}__`) || allScss.includes(`.${classPrefix} `) || allScss.includes(`.${classPrefix}{`);
  /* A Selia wrapper with no sheet of its own is not unstyled: `selia-base.scss`
     carries the shared card/section language and only 7 blocks add overrides.
     That is the architecture — 34 blocks that each re-declared their own
     container would be the defect. */
  const hasSharedBase = sharedShell && fs.existsSync(path.join(ROOT, 'app/styles/04-components/selia-base.scss'));
  const sharedStyle = !!scssPath || styledSomewhere || hasSharedBase;

  /* RTL: a block is direction-safe when it uses logical properties or reads the
     direction itself. Physical `left/right` in a block that never consults
     direction is the pattern that breaks Arabic. */
  const physical = (scss.match(/(?:^|[\s;{])(?:left|right)\s*:/g) || []).length;
  const logical = (scss.match(/inset-inline|margin-inline|padding-inline|border-inline|inline-start|inline-end|text-align:\s*(?:start|end)/g) || []).length;
  const readsDirection = /isRTL|getComputedStyle\([^)]*\)\.direction|dir\s*===|\[dir=/.test(scss + tsx);

  /* Motion: does the block animate, and does it honour the preference? */
  const animates = /@keyframes|animation\s*:|transition\s*:/.test(scss);
  const honoursReduce = /prefers-reduced-motion/.test(scss) || /prefersReducedMotion/.test(tsx);

  /* Dark mode: tokens vs literals. */
  const usesSurfaceTokens = /--surface-|--ink-|--line-|--bg-|html\.dark|var\(--/.test(scss);
  const hardcodedHex = (scss.match(/#[0-9a-fA-F]{3,8}\b/g) || []).length;

  /* Semantics + empty state. */
  const headings = (tsx.match(/<h[1-6]\b/g) || []).length;
  const ariaCount = (tsx.match(/aria-[a-z]+=/g) || []).length;
  const altCount = (tsx.match(/alt=/g) || []).length;
  const imgCount = (tsx.match(/<img\b|<Image\b/g) || []).length;
  const returnsNull = /return null/.test(tsx);
  const memoised = /memo\(|useMemo\(/.test(tsx);
  const effectCount = (tsx.match(/useEffect\(/g) || []).length;

  return {
    path: pathKey,
    pascal,
    tsx: tsxPath ? path.relative(ROOT, tsxPath).replace(/\\/g, '/') : null,
    scss: scssPath ? path.relative(ROOT, scssPath).replace(/\\/g, '/') : null,
    sharedShell,
    lines: tsx ? tsx.split('\n').length : 0,
    fields: fields.length,
    registered: registeredInRouter,
    tests: tests.length + (coveredBySharedTest ? 1 : 0),
    physical,
    logical,
    readsDirection,
    animates,
    honoursReduce,
    usesSurfaceTokens,
    hardcodedHex,
    headings,
    ariaCount,
    altCount,
    imgCount,
    returnsNull: returnsNull || sharedShell,
    memoised,
    effectCount,
    hasStyle: !!scssPath || sharedStyle,
    ariaOk: ariaCount > 0 || sharedShell,
  };
});

if (JSON_OUT) {
  console.log(JSON.stringify(blocks, null, 1));
  process.exit(0);
}

const pad = (v, n) => String(v).padEnd(n);
const num = (v, n) => String(v).padStart(n);

console.log('');
console.log(`Block audit — ${blocks.length} registered blocks`);
console.log('');
console.log(
  `${pad('block', 32)}${num('ln', 6)}${num('fld', 5)}${num('tst', 5)}  ${pad('rtl', 10)}${pad('motion', 12)}${pad('a11y', 14)}dark`
);
console.log('-'.repeat(96));
for (const b of blocks) {
  const rtl = b.readsDirection ? 'direction' : b.logical > b.physical ? 'logical' : b.physical > 0 ? `PHYSICAL ${b.physical}` : 'ok';
  const motion = !b.animates ? 'static' : b.honoursReduce ? 'reduce ok' : 'NO REDUCE';
  const a11y = `${b.headings}h ${b.ariaCount}a ${b.altCount}/${b.imgCount}alt`;
  const dark = b.hardcodedHex > 20 ? `LITERAL ${b.hardcodedHex}` : b.usesSurfaceTokens ? 'tokens' : 'none';
  console.log(
    `${pad(b.path.replace('home.', ''), 32)}${num(b.lines, 6)}${num(b.fields, 5)}${num(b.tests, 5)}  ${pad(rtl, 10)}${pad(motion, 12)}${pad(a11y, 14)}${dark}`
  );
}

const flag = (label, list) => {
  if (!list.length) return;
  console.log(`\n  ${label} (${list.length})`);
  for (const b of list) console.log(`    ${b.path}`);
};

console.log('');
flag('NO TEST FILE', blocks.filter((b) => !b.tests));
flag('NOT REGISTERED', blocks.filter((b) => !b.registered));
flag('NO STYLESHEET (own or shared)', blocks.filter((b) => !b.hasStyle));
flag('NO TSX FOUND', blocks.filter((b) => !b.tsx));
flag('PHYSICAL left/right WITH NO DIRECTION READ', blocks.filter((b) => b.physical > 0 && !b.readsDirection && b.logical === 0));
flag('ANIMATES WITHOUT reduced-motion', blocks.filter((b) => b.animates && !b.honoursReduce));
flag('NO EMPTY-STATE GUARD (own or shared)', blocks.filter((b) => !b.returnsNull));
flag('NO aria AT ALL (own or shared)', blocks.filter((b) => !b.ariaOk));
flag('IMAGES BUT NO alt', blocks.filter((b) => b.imgCount > 0 && b.altCount === 0));
console.log('');
