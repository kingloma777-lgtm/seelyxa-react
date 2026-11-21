import { describe, it, expect, beforeEach } from 'vitest';
import { lockBodyOverflow, unlockBodyOverflow } from '../../app/lib/bodyOverflow';

/** The two MorphPill fullscreen surfaces used to write `body.style.overflow`
 *  independently; closing one unlocked the page behind the other. */
describe('bodyOverflow', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.documentElement.classList.remove('body-scroll-locked');
  });

  it('unlocks only after every holder has released the lock', () => {
    document.body.style.overflow = 'scroll';
    lockBodyOverflow(); // burger index
    lockBodyOverflow(); // account takeover
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.classList.contains('body-scroll-locked')).toBe(true);
    unlockBodyOverflow();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.classList.contains('body-scroll-locked')).toBe(true);
    unlockBodyOverflow();
    expect(document.body.style.overflow).toBe('scroll');
    expect(document.documentElement.classList.contains('body-scroll-locked')).toBe(false);
  });

  it('never underflows when an unlock arrives with no live lock', () => {
    unlockBodyOverflow();
    unlockBodyOverflow();
    lockBodyOverflow();
    expect(document.body.style.overflow).toBe('hidden');
    unlockBodyOverflow();
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.classList.contains('body-scroll-locked')).toBe(false);
  });
});
