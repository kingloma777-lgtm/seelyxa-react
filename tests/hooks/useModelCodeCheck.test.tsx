import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useModelCodeCheck } from '../../app/lib/modelCode';

/* A valid model that is over the eager threshold but under the ceiling: the
   case where the merchant is editing a real 300 KB paste in the theme editor
   and every keystroke used to re-parse the whole document. */

const smallModel = JSON.stringify({ asset: { version: '2.0' }, scenes: [], nodes: [] });
const bigModel = JSON.stringify({
  asset: { version: '2.0' },
  scenes: [],
  nodes: [],
  extras: { filler: 'x'.repeat(40_000) },
});

describe('useModelCodeCheck', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads a small paste on the same render', () => {
    const { result } = renderHook(() => useModelCodeCheck(smallModel));
    expect(result.current.status).toBe('ok');
  });

  /* The editor pushes a settings update per keystroke; parsing 300 KB in that
     path is what made typing crawl. The verdict settles after the typing. */
  it('waits for the typing to stop before reading a big paste', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ code }) => useModelCodeCheck(code), {
      initialProps: { code: '' },
    });
    expect(result.current.status).toBe('empty');

    rerender({ code: bigModel });
    expect(result.current.status).toBe('empty');

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.status).toBe('ok');
    expect(result.current.model?.kind).toBe('gltf');
  });

  /* Oversized is the cheap answer: it is decided by `length` before anything
     is allocated, so it must not wait for a timer — the merchant needs to see
     "too big" the moment the paste lands. */
  it('refuses an oversized paste without waiting', () => {
    const { result } = renderHook(() => useModelCodeCheck('x'.repeat(400_001)));
    expect(result.current.status).toBe('oversize');
  });

  it('goes back to reading immediately when the paste shrinks again', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ code }) => useModelCodeCheck(code), {
      initialProps: { code: bigModel },
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.status).toBe('ok');

    rerender({ code: smallModel });
    expect(result.current.status).toBe('ok');
    rerender({ code: 'not a model at all' });
    expect(result.current.status).toBe('unreadable');
  });
});
