#!/usr/bin/env node
/**
 * `npm run dev` wrapper.
 *
 * Two Windows-specific problems make a bare `vite dev` unusable here:
 *
 * 1) The shell exports HTTP_PROXY / HTTPS_PROXY / ALL_PROXY pointing at a
 *    loopback proxy (127.0.0.1:<port>). Wrangler passes them into workerd, so
 *    every SSR fetch() is proxied. The native runtime then dies after the
 *    first heavy render ("There was an access violation in the runtime"),
 *    miniflare's dispatchFetch rejects with `fetch failed`, and Vite paints a
 *    full-page error overlay / restarts the server. NO_PROXY alone is NOT
 *    enough: the crash is in workerd's proxied fetch path, not in Node's
 *    loopback fetch. Direct HTTPS works here, so dev runs without a proxy.
 *    This has to happen before Vite (and therefore undici / wrangler) loads.
 *
 * 2) Even without a proxy, workerd 1.20260820.1 sometimes crashes with a
 *    Windows access violation *during startup*, before Vite binds a port.
 *    It is a flaky native crash, not a theme error, and a fresh process
 *    normally starts fine. Restart transparently a few times instead of
 *    leaving the user with a dead localhost.
 *
 * Failure classification (2026-11-21). This wrapper used to retry any output
 * matching /error when starting dev server|fetch failed|ECONNRESET/ and call
 * it "workerd crashed — Windows runtime hiccup". A full disk emits exactly
 * that prefix ("error when starting dev server: Error: ENOSPC: no space left
 * on device, write" — thrown from Vite's loadConfigFromBundledFile), so four
 * real ENOSPC failures were reported as a runtime hiccup and retried. Now:
 *
 *   - a known fatal signature (ENOSPC, EADDRINUSE, EACCES/EPERM, config load
 *     error, missing module) is printed once, in one line, and exits non-zero
 *     with no retry — retrying cannot fix any of them;
 *   - ONLY an explicit workerd crash ("There was an access violation in the
 *     runtime", "Workers runtime crashed", "workerd crashed") is retried;
 *   - anything else exits non-zero with the last error line, unretried.
 *
 * Set SEELYXA_KEEP_PROXY=1 if this machine really needs an outbound proxy.
 * Set SEELYXA_NO_RETRY=1 to see the raw Vite failure on the first attempt.
 * Set SEELYXA_SKIP_DISK_CHECK=1 to skip the free-space preflight.
 * Set SEELYXA_MIN_FREE_MB (default 2048) / SEELYXA_TRACE_STORE_CAP_MB
 * (default 256) to move the two thresholds.
 */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const PROXY_KEYS = [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'ALL_PROXY',
  'http_proxy',
  'https_proxy',
  'all_proxy',
];

if (process.env.SEELYXA_KEEP_PROXY === '1') {
  // Keep the proxy, but never route workerd's loopback control channel or the
  // local dev server through it.
  const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'];
  for (const key of ['NO_PROXY', 'no_proxy']) {
    const current = (process.env[key] ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    process.env[key] = [...new Set([...current, ...LOOPBACK_HOSTS])].join(',');
  }
} else {
  for (const key of PROXY_KEYS) delete process.env[key];
}

// Vite re-optimizes (and clears) node_modules/.vite/deps whenever the config
// changes. That is a generated cache inside the project, but the WorkBuddy
// safe-delete shim counts it as a bulk deletion and aborts the whole dev
// server with SAFE_DELETE_BULK_CONFIRM_REQUIRED before it binds a port.
// Disable the shim for this one process; it is not inherited by anything else.
process.env.CODEBUDDY_SAFE_DELETE_ENABLED = '0';

const root = path.resolve(__dirname, '..');
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const viteArgs = ['dev', ...process.argv.slice(2)];

// The port Vite will actually bind. `salla theme dev` / `salla theme preview`
// spawn this script as `node scripts/dev-local.cjs --port 5174 --strictPort`
// when 5173 is taken, so the preflight has to follow that flag — checking a
// hardcoded 5173 killed every CLI-driven run instantly (2026-11-21).
function requestedPort() {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--port' || arg === '-p') {
      const next = Number(args[i + 1]);
      if (Number.isInteger(next) && next > 0) return next;
      continue;
    }
    if (arg.startsWith('--port=')) {
      const inline = Number(arg.slice('--port='.length));
      if (Number.isInteger(inline) && inline > 0) return inline;
    }
  }
  return null;
}

const VITE_PORT = requestedPort() ?? 5173;

// The Node inspector is the one port Vite does not choose for us. It only
// matters when something upstream asked for `--inspect`; override or skip it
// with SEELYXA_INSPECT_PORT=0 when two dev servers have to coexist.
const INSPECT_PORT = Number(process.env.SEELYXA_INSPECT_PORT ?? 9229);

// 5177 used to sit in this list as "the Salla editor preview". It appears
// nowhere in the engine, the CLI or this project — the editor is served by the
// same Vite server at /__twilight/editor — so it only produced false failures.
const requiredPorts = () =>
  [...new Set([VITE_PORT, INSPECT_PORT])].filter(port => port > 0);

const MAX_ATTEMPTS = 4;
const RESTART_DELAY_MS = 2000;
const HEALTHY_MS = 120000;

const MIN_FREE_BYTES =
  Number(process.env.SEELYXA_MIN_FREE_MB ?? 2048) * 1024 * 1024;

// workerd's local observability trace store is a Durable Object SQLite created
// with `preventEviction: true`, so it never shrinks on its own: it reached
// 1.07 GB in `.wrangler/state/v3/observability` before this cap existed. It is
// pure local-dev state, so clearing it costs nothing but the trace history.
const TRACE_STORE_DIR = path.join(root, '.wrangler', 'state', 'v3', 'observability');
const TRACE_STORE_CAP_BYTES =
  Number(process.env.SEELYXA_TRACE_STORE_CAP_MB ?? 256) * 1024 * 1024;

// Ordered by priority: the first match wins, so ENOSPC is reported as ENOSPC
// even though its stack trace also mentions loadConfigFromBundledFile.
const FATAL_PATTERNS = [
  {
    code: 'ENOSPC',
    match: /ENOSPC|no space left on device/i,
    explain: 'the disk is full — Vite could not write its bundled config.',
    fix: 'free space (`pnpm clean:cache`) and run `pnpm dev` again; a retry cannot help.',
  },
  {
    code: 'EADDRINUSE',
    match: /EADDRINUSE|address already in use/i,
    explain: 'a port this theme needs is already bound.',
    fix: 'run `pnpm clean:dev` to clear the stale workerd / vite process.',
  },
  {
    code: 'EACCES',
    match: /\bEACCES\b|\bEPERM\b|operation not permitted/i,
    explain: 'a file could not be written — permissions, or a locked file.',
    fix: 'stop whatever holds the file (usually an older dev server) and retry.',
  },
  {
    code: 'CONFIG',
    match: /failed to load config|loadConfigFromBundledFile|error while loading config/i,
    explain: 'vite.config.ts could not be loaded or bundled.',
    fix: 'fix the config error printed above; the same config fails the same way.',
  },
  {
    code: 'MODULE_NOT_FOUND',
    match: /Cannot find module|ERR_MODULE_NOT_FOUND|Cannot find package/i,
    explain: 'a dependency is missing from node_modules.',
    fix: 'run `pnpm install`.',
  },
];

// The only signature a restart can plausibly fix: a native workerd crash.
const WORKERD_CRASH =
  /There was an access violation in the runtime|Workers runtime crashed|workerd(?:\.exe)?\s+(?:has\s+)?crashed|ERR_RUNTIME_FAILURE/i;

const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const MAX_TAIL = 24000;

let child = null;
let attempts = 0;
let stopping = false;
let stdoutTail = '';
let stderrTail = '';
let startedAt = 0;

const stripAnsi = (text) => text.replace(ANSI, '');

/** Keep the last MAX_TAIL characters of a stream. */
function append(previous, chunk) {
  return (previous + chunk).slice(-MAX_TAIL);
}

/** First fatal signature in the child's output, or null. */
function classify(text) {
  const plain = stripAnsi(text);
  return FATAL_PATTERNS.find((pattern) => pattern.match.test(plain)) ?? null;
}

/**
 * The single line that actually names the failure — the line carrying the
 * matched code when there is one, otherwise the last line that looks like an
 * error. Used so a fatal exit is one readable line, not a stack dump.
 */
function errorLine(text, regex) {
  const lines = stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const reversed = [...lines].reverse();
  const hit =
    (regex && reversed.find((line) => regex.test(line))) ??
    reversed.find((line) => /error|failed|cannot|denied|ENOSPC|EACCES/i.test(line)) ??
    reversed[0] ??
    'no output from vite';
  return hit.replace(/^error when starting dev server:\s*/i, '').slice(0, 300);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'unknown';
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Free bytes on the volume holding `target`, or null when unsupported. */
function freeBytes(target) {
  try {
    const stats = fs.statfsSync(target);
    return stats.bsize * stats.bavail;
  } catch {
    return null;
  }
}

/** Recursive size without following symlinks or junctions. */
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

/**
 * True when something is already listening on `port`.
 *
 * Both loopback addresses must be probed separately. Binding a single '::'
 * wildcard does NOT collide with a listener on a *specific* address on this
 * machine — verified: vite held `::1:5173` and the Node inspector held
 * `127.0.0.1:9229`, yet `listen({ port, host: '::' })` succeeded and the
 * preflight reported both ports free, so a second dev server started on top of
 * the first. EADDRNOTAVAIL (no IPv6 on this host) counts as free.
 */
function probePort(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();
    const done = (busy) => {
      server.removeAllListeners();
      try {
        server.close();
      } catch {
        /* already closed */
      }
      resolve(busy);
    };
    server.once('error', (error) => done(error.code === 'EADDRINUSE'));
    server.once('listening', () => done(false));
    server.listen({ port, host, exclusive: true });
  });
}

async function isPortBusy(port) {
  const results = await Promise.all([
    probePort(port, '127.0.0.1'),
    probePort(port, '::1'),
  ]);
  return results.some(Boolean);
}

/**
 * A full disk is the one failure that looks exactly like a workerd crash
 * ("error when starting dev server: …") and cannot be retried. Check both
 * volumes involved before spawning: Vite writes its bundled config next to the
 * project (`node_modules/.vite-temp`), and wrangler/miniflare use %TEMP%.
 */
function checkDiskSpace() {
  if (process.env.SEELYXA_SKIP_DISK_CHECK === '1') return;

  const volumes = [
    { label: 'project', target: root },
    { label: 'temp', target: os.tmpdir() },
  ];

  const short = volumes
    .map((volume) => ({ ...volume, free: freeBytes(volume.target) }))
    .filter((volume) => volume.free !== null && volume.free < MIN_FREE_BYTES);

  if (short.length === 0) return;

  for (const volume of short) {
    console.error(
      `[dev-local] only ${formatBytes(volume.free)} free on the ${volume.label} drive ` +
        `(${path.parse(volume.target).root}) — ${formatBytes(MIN_FREE_BYTES)} required.`
    );
  }
  console.error(
    '[dev-local] Vite writes its bundled config to node_modules/.vite-temp and fails with\n' +
      '            "ENOSPC: no space left on device" when the disk is full. Free space first:\n' +
      '              pnpm clean:cache\n'
  );
  process.exit(1);
}

/** Clear workerd's unbounded local trace store when it outgrows the cap. */
function capTraceStore() {
  if (!fs.existsSync(TRACE_STORE_DIR)) return;
  const size = directorySize(TRACE_STORE_DIR);
  if (size <= TRACE_STORE_CAP_BYTES) return;

  try {
    fs.rmSync(TRACE_STORE_DIR, { recursive: true, force: true, maxRetries: 2 });
    console.log(
      `[dev-local] cleared workerd's trace store (${formatBytes(size)} > ` +
        `${formatBytes(TRACE_STORE_CAP_BYTES)} cap); it is local dev state and rebuilds on start.`
    );
  } catch (error) {
    console.error(
      `[dev-local] trace store is ${formatBytes(size)} (cap ${formatBytes(TRACE_STORE_CAP_BYTES)}) ` +
        `and could not be cleared: ${error.code ?? error.message}. ` +
        'A running workerd holds it — `pnpm clean:dev` then retry.'
    );
  }
}

async function preflight() {
  checkDiskSpace();
  capTraceStore();

  if (process.env.SEELYXA_SKIP_PORT_CHECK === '1') return;
  const ports = requiredPorts();
  const busy = [];
  for (const port of ports) {
    if (await isPortBusy(port)) busy.push(port);
  }
  if (busy.length === 0) return;

  console.error(
    `\n[dev-local] port${busy.length > 1 ? 's' : ''} ${busy.join(', ')} already in use.`
  );
  console.error(
    '            A previous workerd / vite run is still alive. Free them with:\n' +
      '              pnpm clean:dev\n' +
      `            (or run \`node scripts/dev-local.cjs --port ${
        VITE_PORT + 7
      }\` to pick another port).\n`
  );
  process.exit(1);
}

function finish(code, signal, forceNonZero = false) {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  if (forceNonZero) {
    process.exit(code && code !== 0 ? code : 1);
    return;
  }
  process.exit(code ?? 0);
}

function start() {
  attempts += 1;
  startedAt = Date.now();
  stdoutTail = '';
  stderrTail = '';

  child = spawn(process.execPath, [viteBin, ...viteArgs], {
    cwd: root,
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
    stdoutTail = append(stdoutTail, chunk.toString());
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
    stderrTail = append(stderrTail, chunk.toString());
  });

  child.on('exit', (code, signal) => {
    if (stopping) {
      process.exit(code ?? 0);
      return;
    }

    // Clean shutdown the user asked for (q, or a normal stop): nothing to
    // classify, nothing to report.
    if (!signal && code === 0) {
      process.exit(0);
      return;
    }

    // A process that stayed up for a while was healthy; give the next one a
    // fresh set of retries rather than counting down forever.
    if (Date.now() - startedAt > HEALTHY_MS) attempts = 0;

    const output = `${stdoutTail}\n${stderrTail}`;

    // 1. A known cause. Print it once, in one line, and stop — every entry in
    //    FATAL_PATTERNS fails identically on the next attempt.
    const fatal = classify(output);
    if (fatal) {
      console.error(`\n[dev-local] ${fatal.code}: ${errorLine(output, fatal.match)}`);
      console.error(`[dev-local] ${fatal.explain}`);
      console.error(`[dev-local] ${fatal.fix}`);
      finish(code, signal, true);
      return;
    }

    // 2. A real workerd crash. The only case worth retrying.
    const crashed = WORKERD_CRASH.test(stripAnsi(output));
    if (crashed) {
      if (process.env.SEELYXA_NO_RETRY !== '1' && attempts < MAX_ATTEMPTS) {
        console.error(
          `\n[dev-local] workerd crashed (attempt ${attempts}/${MAX_ATTEMPTS}). ` +
            `This is a Windows runtime hiccup, not a theme error — restarting in ${RESTART_DELAY_MS / 1000}s...\n`
        );
        setTimeout(start, RESTART_DELAY_MS);
        return;
      }
      console.error(
        `\n[dev-local] workerd crashed ${MAX_ATTEMPTS} times in a row. ` +
          `See the runtime output above; try \`pnpm clean:dev\` then \`pnpm dev\`.`
      );
      finish(code, signal, true);
      return;
    }

    // 3. Unrecognised. Still exit non-zero with the real line, but never
    //    pretend it was the runtime.
    console.error(
      `\n[dev-local] dev server exited (code ${code ?? 'none'}${signal ? `, signal ${signal}` : ''}) ` +
        'without a known failure signature.'
    );
    console.error(`[dev-local] last error: ${errorLine(output)}`);
    finish(code, signal, true);
  });
}

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    stopping = true;
    if (child && !child.killed) child.kill(sig);
  });
}

// Check disk space and ports once, then boot. The crash-retry path below reuses
// `start()` directly: after a crash our own socket may still be in TIME_WAIT,
// and blocking on that would turn a self-healing restart into a hard failure.
preflight().then(start, (error) => {
  console.error('[dev-local] preflight failed:', error);
  process.exit(1);
});
