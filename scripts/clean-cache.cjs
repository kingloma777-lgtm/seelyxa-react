#!/usr/bin/env node
/**
 * `pnpm clean:cache` — reclaim space from generated state that lives INSIDE
 * this repo, then report exactly what it freed.
 *
 * Only three families are touched, and only under the repo root:
 *
 *   node_modules/.vite*   Vite's dep cache, its bundled-config temp files
 *                         (.vite-temp) and stale optimizer output (.vite-stale)
 *   dist                  build output, including dist/_previous_build
 *   .wrangler             local wrangler logs and workerd's observability trace
 *                         store — a Durable Object SQLite created with
 *                         `preventEviction: true` that never shrinks by itself
 *                         (it reached 1.07 GB before `dev-local.cjs` capped it)
 *
 * node_modules/.pnpm is deliberately NEVER touched: removing it costs a full
 * `pnpm install` and is what a broken install needs, not what a full disk does.
 * Nothing outside the repo is ever touched — no %TEMP%, no pnpm store, no
 * CrashDumps.
 *
 * Stop the dev server first: workerd holds the trace store open, and Windows
 * will refuse the delete (reported as "in use", not as a crash).
 *
 *   pnpm clean:cache --dry-run    # list what would go, delete nothing
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

/** Resolve a repo-relative path, refusing anything that escapes the root. */
function insideRepo(relative) {
  const full = path.resolve(root, relative);
  const rel = path.relative(root, full);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`refusing to touch ${full}: outside ${root}`);
  }
  return full;
}

function directorySize(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else {
        try {
          total += fs.statSync(full).size;
        } catch {
          /* vanished mid-walk */
        }
      }
    }
  }
  return total;
}

function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function freeBytes(target) {
  try {
    const stats = fs.statfsSync(target);
    return stats.bsize * stats.bavail;
  } catch {
    return null;
  }
}

// --- collect targets ---------------------------------------------------------
const targets = [];

// node_modules/.vite* — the cache, the config temp dir and the stale copies.
const nodeModules = path.join(root, 'node_modules');
if (fs.existsSync(nodeModules)) {
  for (const entry of fs.readdirSync(nodeModules, { withFileTypes: true })) {
    if (!entry.name.startsWith('.vite')) continue;
    targets.push(insideRepo(path.join('node_modules', entry.name)));
  }
}

targets.push(insideRepo('dist'));
targets.push(insideRepo(path.join('.wrangler', 'logs')));
targets.push(insideRepo(path.join('.wrangler', 'state', 'v3', 'observability')));

// --- delete ------------------------------------------------------------------
const before = freeBytes(root);
let freed = 0;
let failed = 0;
let touched = 0;

console.log(`clean:cache${dryRun ? ' (dry run)' : ''} in ${root}\n`);

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  const size = directorySize(target);
  const label = path.relative(root, target);

  if (dryRun) {
    console.log(`  would free  ${formatBytes(size).padStart(10)}  ${label}`);
    freed += size;
    touched += 1;
    continue;
  }

  try {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 2, retryDelay: 120 });
    console.log(`  freed       ${formatBytes(size).padStart(10)}  ${label}`);
    freed += size;
    touched += 1;
  } catch (error) {
    failed += 1;
    console.error(
      `  in use      ${formatBytes(size).padStart(10)}  ${label}  (${error.code ?? error.message})`
    );
  }
}

// --- report ------------------------------------------------------------------
if (touched === 0) {
  console.log('  nothing to clean — the caches are already empty.');
} else {
  console.log(`\n  ${dryRun ? 'would free' : 'freed'} ${formatBytes(freed)}`);
}

const after = freeBytes(root);
if (before !== null && after !== null) {
  const drive = path.parse(root).root;
  console.log(
    `  ${drive} free: ${formatBytes(before)} -> ${formatBytes(after)}` +
      (dryRun ? ' (unchanged, dry run)' : '')
  );
}

if (failed > 0) {
  console.error(
    `\n  ${failed} target(s) still locked. Stop the dev server (\`pnpm clean:dev\`) and re-run.`
  );
  process.exit(1);
}
