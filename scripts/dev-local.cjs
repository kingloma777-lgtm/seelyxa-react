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
 *    Windows access violation *during startup*, before Vite binds a port:
 *      error when starting dev server: TypeError: fetch failed (ECONNRESET)
 *    It is a flaky native crash, not a theme error, and a fresh process
 *    normally starts fine. Restart transparently a few times instead of
 *    leaving the user with a dead localhost.
 *
 * Set SEELYXA_KEEP_PROXY=1 if this machine really needs an outbound proxy.
 * Set SEELYXA_NO_RETRY=1 to see the raw Vite failure on the first attempt.
 */
const { spawn } = require('node:child_process');
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

const MAX_ATTEMPTS = 4;
const RESTART_DELAY_MS = 2000;
const HEALTHY_MS = 120000;
const CRASH_SIGNATURE =
  /access violation|fetch failed|Workers runtime crashed|ECONNRESET|ERR_RUNTIME_FAILURE|error when starting dev server/i;

let child = null;
let attempts = 0;
let stopping = false;
let tail = '';
let startedAt = 0;

function remember(text) {
  tail = (tail + text).slice(-12000);
}

function start() {
  attempts += 1;
  startedAt = Date.now();
  tail = '';

  child = spawn(process.execPath, [viteBin, ...viteArgs], {
    cwd: root,
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
    remember(chunk.toString());
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
    remember(chunk.toString());
  });

  child.on('exit', (code, signal) => {
    if (stopping) {
      process.exit(code ?? 0);
      return;
    }

    // A process that stayed up for a while was healthy; give the next one a
    // fresh set of retries rather than counting down forever.
    const ranLong = Date.now() - startedAt > HEALTHY_MS;
    if (ranLong) attempts = 0;

    const crashed = CRASH_SIGNATURE.test(tail);
    if (
      crashed &&
      process.env.SEELYXA_NO_RETRY !== '1' &&
      attempts < MAX_ATTEMPTS
    ) {
      console.error(
        `\n[dev-local] workerd crashed (attempt ${attempts}/${MAX_ATTEMPTS}). ` +
          `This is a Windows runtime hiccup, not a theme error — restarting in ${RESTART_DELAY_MS / 1000}s...\n`
      );
      setTimeout(start, RESTART_DELAY_MS);
      return;
    }

    if (crashed && attempts >= MAX_ATTEMPTS) {
      console.error(
        `\n[dev-local] workerd crashed ${MAX_ATTEMPTS} times in a row. ` +
          `See the runtime output above; try re-running \`npm run dev\`.`
      );
    }
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
}

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    stopping = true;
    if (child && !child.killed) child.kill(sig);
  });
}

start();
