/**
 * Silences the engine's per-block render log.
 *
 * `HomeComponentRenderer` lives in `@salla.sa/twilight-theme-engine/dist` — vendor
 * code, not this repo — and it prints one line per block per render:
 *
 *   [HomeComponentRenderer] RENDER: path=…, index=…, renderCount=…
 *
 * With 36 blocks on the home page that is ~108 lines per page load, in the
 * browser console *and* in the dev-server terminal (workerd forwards the
 * worker's console). The `RENDER` line is guarded by
 * `process.env.NODE_ENV === 'development'` inside the engine; the `MOUNT` and
 * `UNMOUNT` lines in its `useEffect` are **not** guarded at all, so they also run
 * in production builds.
 *
 * We cannot edit node_modules (pnpm restores it) and we do not want the whole
 * engine pushed through the transform pipeline just to delete three statements,
 * so the filter is applied at the console boundary, dev only. Production
 * behaviour is untouched.
 *
 * If the engine ever stops logging under this prefix this module becomes a no-op.
 */
const PREFIX = '[HomeComponentRenderer]';

interface MarkedConsole {
  __seelyxaEngineLogsQuiet?: true;
}

export function quietEngineDevLogs(): void {
  if (!import.meta.env.DEV) return;
  if (typeof console === 'undefined' || typeof console.log !== 'function') return;

  const current = console.log as typeof console.log & MarkedConsole;
  // Idempotent: server and client both call this, and a re-import must not
  // stack wrappers around wrappers.
  if (current.__seelyxaEngineLogsQuiet) return;

  const original = current.bind(console);
  const filtered = (...args: unknown[]): void => {
    if (typeof args[0] === 'string' && args[0].startsWith(PREFIX)) return;
    original(...args);
  };

  (filtered as typeof console.log & MarkedConsole).__seelyxaEngineLogsQuiet = true;
  console.log = filtered;
}
