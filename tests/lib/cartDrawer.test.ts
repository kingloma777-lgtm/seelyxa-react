import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  closeCartDrawer,
  getCartDrawerState,
  openCartDrawer,
  openCartDrawerFromEvent,
  subscribeCartDrawer,
} from '../../app/lib/cartDrawer';

describe('cartDrawer store', () => {
  beforeEach(() => {
    closeCartDrawer();
  });

  it('starts closed', () => {
    expect(getCartDrawerState()).toEqual({ open: false, lineId: null });
  });

  it('opens with the line that triggered it', () => {
    openCartDrawer(7);
    expect(getCartDrawerState()).toEqual({ open: true, lineId: 7 });
  });

  it('closes back to the empty state', () => {
    openCartDrawer(7);
    closeCartDrawer();
    expect(getCartDrawerState()).toEqual({ open: false, lineId: null });
  });

  it('returns the SAME object until something changes — useSyncExternalStore re-renders on identity', () => {
    const first = getCartDrawerState();
    expect(getCartDrawerState()).toBe(first);
    expect(getCartDrawerState()).toBe(first);

    openCartDrawer(1);
    expect(getCartDrawerState()).not.toBe(first);
  });

  it('notifies subscribers once per real change, and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCartDrawer(listener);

    openCartDrawer(3);
    expect(listener).toHaveBeenCalledTimes(1);

    // same open state, same line: nothing to tell React about
    openCartDrawer(3);
    expect(listener).toHaveBeenCalledTimes(1);

    // a different line is a real change — the flash has to move
    openCartDrawer(4);
    expect(listener).toHaveBeenCalledTimes(2);

    closeCartDrawer();
    expect(listener).toHaveBeenCalledTimes(3);

    // already closed: no phantom notification
    closeCartDrawer();
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    openCartDrawer(5);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('does not treat a closed → closed call as a change', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCartDrawer(listener);
    closeCartDrawer();
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});

describe('openCartDrawerFromEvent', () => {
  beforeEach(() => {
    closeCartDrawer();
  });

  it('opens on a plain left click', () => {
    expect(openCartDrawerFromEvent({ button: 0 })).toBe(true);
    expect(getCartDrawerState().open).toBe(true);
  });

  it.each([
    ['a modified click', { button: 0, metaKey: true }],
    ['ctrl+click', { button: 0, ctrlKey: true }],
    ['shift+click', { button: 0, shiftKey: true }],
    ['alt+click', { button: 0, altKey: true }],
    ['a middle click', { button: 1 }],
  ])('leaves %s to the link itself', (_label, event) => {
    expect(openCartDrawerFromEvent(event)).toBe(false);
    expect(getCartDrawerState().open).toBe(false);
  });

  it('never consults defaultPrevented — the platform chip prevents it on its own anchor', () => {
    // `<salla-cart-summary>` prevents the default from its own click listener,
    // which is why the header listens in the CAPTURE phase and why this helper
    // only looks at the modifiers.
    expect(openCartDrawerFromEvent({ button: 0 })).toBe(true);
    expect(getCartDrawerState().open).toBe(true);
  });
});
