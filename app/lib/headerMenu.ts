/**
 * The header's fullscreen index (the morph burger overlay) — a module store
 * rather than context, because the two things that open it do not share a
 * parent: the burger lives in `MorphHeader`, the Categories tab in
 * `MobileBottomBar`, and `ThemeLayout` only mounts both.
 *
 * Read it with `useSyncExternalStore(subscribeHeaderMenu, getHeaderMenuState)`.
 * `getHeaderMenuState` returns the same object until something actually
 * changes, which is what the hook requires (a fresh object per call would
 * re-render forever).
 *
 * This used to be a `navOpen` React state lifted into `ThemeLayout`, back when
 * the theme also shipped a `lite`/`default` header whose slide-in drawer the
 * bottom bar shared. Those layouts are gone (the merchant picks the morph
 * header and nothing else), so the only menu left is the morph index and the
 * store replaces the prop plumbing.
 */

export interface HeaderMenuState {
  open: boolean;
}

const CLOSED: HeaderMenuState = { open: false };
const OPEN: HeaderMenuState = { open: true };

let state: HeaderMenuState = CLOSED;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeHeaderMenu(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getHeaderMenuState(): HeaderMenuState {
  return state;
}

export function openHeaderMenu(): void {
  if (state.open) return;
  state = OPEN;
  emit();
}

export function closeHeaderMenu(): void {
  if (!state.open) return;
  state = CLOSED;
  emit();
}
