/**
 * The cart drawer's open state — a module store rather than context, because
 * the triggers and the panel do not share a parent: the header chip lives in
 * `MorphHeader`, the mobile bar tab in `MobileBottomBar`, and the panel itself
 * is registered on the engine's `body:end` hook slot.
 *
 * Read it with `useSyncExternalStore(subscribeCartDrawer, getCartDrawerState)`.
 * `getCartDrawerState` returns the same object until something actually
 * changes, which is what the hook requires (a fresh object per call would
 * re-render forever).
 */

export interface CartDrawerState {
  open: boolean;
  /** The cart line to flash when the panel opens — the one just added. */
  lineId: string | number | null;
}

const CLOSED: CartDrawerState = { open: false, lineId: null };

let state: CartDrawerState = CLOSED;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeCartDrawer(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCartDrawerState(): CartDrawerState {
  return state;
}

/** Open the panel, optionally flagging the cart line that was just added. */
export function openCartDrawer(lineId: string | number | null = null): void {
  if (state.open && state.lineId === lineId) return;
  state = { open: true, lineId };
  emit();
}

export function closeCartDrawer(): void {
  if (!state.open) return;
  state = CLOSED;
  emit();
}

/**
 * Click handler for anything that should *open the drawer* instead of
 * navigating to `/cart` — the header chip, the mobile bar tab.
 *
 * Returns `false` when the click was left alone, so the caller can skip its own
 * work too: a modified click (new tab, new window, middle button) keeps the
 * real link behaviour, and the plain one becomes the drawer.
 *
 * Note the deliberate absence of a `defaultPrevented` check. `<salla-cart-summary>`
 * ships its own click listener on the wrapper anchor, which both prevents the
 * default AND navigates through the SDK — so by the time a bubble-phase handler
 * runs, `defaultPrevented` is already true. The header therefore listens in the
 * CAPTURE phase and stops the event there; see `MorphHeader`.
 */
export function openCartDrawerFromEvent(event: {
  button?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}): boolean {
  if ((event.button ?? 0) !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  openCartDrawer();
  return true;
}
