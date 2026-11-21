import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  closeHeaderMenu,
  getHeaderMenuState,
  openHeaderMenu,
  subscribeHeaderMenu,
} from '../../app/lib/headerMenu';

describe('headerMenu store', () => {
  beforeEach(() => {
    closeHeaderMenu();
  });

  it('starts closed', () => {
    expect(getHeaderMenuState()).toEqual({ open: false });
  });

  it('opens and closes', () => {
    openHeaderMenu();
    expect(getHeaderMenuState()).toEqual({ open: true });

    closeHeaderMenu();
    expect(getHeaderMenuState()).toEqual({ open: false });
  });

  it('returns the SAME object until something changes — useSyncExternalStore re-renders on identity', () => {
    const first = getHeaderMenuState();
    expect(getHeaderMenuState()).toBe(first);

    openHeaderMenu();
    const open = getHeaderMenuState();
    expect(open).not.toBe(first);
    expect(getHeaderMenuState()).toBe(open);
  });

  it('notifies subscribers once per real change, and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHeaderMenu(listener);

    openHeaderMenu();
    expect(listener).toHaveBeenCalledTimes(1);
    // Already open: no second notification (a redundant emit would re-render
    // the whole header for nothing).
    openHeaderMenu();
    expect(listener).toHaveBeenCalledTimes(1);

    closeHeaderMenu();
    expect(listener).toHaveBeenCalledTimes(2);
    closeHeaderMenu();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    openHeaderMenu();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
