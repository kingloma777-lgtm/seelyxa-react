import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyColorMode,
  resolveColorMode,
  COLOR_MODE_BOOT_SCRIPT,
  COLOR_MODE_STORAGE_KEY,
} from '../../app/lib/colorMode';

/**
 * One painter (`html.dark`), two inputs, a fixed order.
 *
 * The bug this replaces was not "dark mode is missing" — it was that two
 * systems decided the same surface and neither knew about the other. These pin
 * the arbitration, because getting it wrong is invisible in code review and
 * very visible on a merchant's storefront.
 */

describe('resolveColorMode', () => {
  it('lets the visitor’s saved choice win — the behaviour every store has today', () => {
    expect(resolveColorMode({ saved: 'dark', merchantDark: false })).toBe('dark');
    expect(resolveColorMode({ saved: 'light', merchantDark: true })).toBe('light');
  });

  /* The actual fix: a merchant who picked dark in the Salla dashboard used to
     get a light storefront, because only `localStorage` was consulted. */
  it('honours the merchant’s dashboard choice when the visitor never chose', () => {
    expect(resolveColorMode({ merchantDark: true })).toBe('dark');
    expect(resolveColorMode({ saved: null, merchantDark: true })).toBe('dark');
  });

  it('is light by default — the theme’s documented default, not the OS preference', () => {
    expect(resolveColorMode({})).toBe('light');
    expect(resolveColorMode({ saved: null, merchantDark: false })).toBe('light');
  });

  it('ignores anything that is not a real choice', () => {
    for (const junk of ['', 'auto', 'DARK', '1', 'system']) {
      expect(resolveColorMode({ saved: junk, merchantDark: false }), junk).toBe('light');
      expect(resolveColorMode({ saved: junk, merchantDark: true }), junk).toBe('dark');
    }
  });
});

describe('the boot script', () => {
  it('reads the one key the toggle writes and the attribute the server rendered', () => {
    expect(COLOR_MODE_BOOT_SCRIPT).toContain(COLOR_MODE_STORAGE_KEY);
    expect(COLOR_MODE_BOOT_SCRIPT).toContain('data-color-mode');
    // the class the stylesheet paints from
    expect(COLOR_MODE_BOOT_SCRIPT).toContain("classList.add('dark')");
  });

  it('mirrors the engine’s body class instead of letting the two disagree', () => {
    /* `html.dark` is what this theme paints from; `body.color-mode-*` is what
       Salla's embedded components read, and the engine writes it from the
       MERCHANT's choice. A visitor who flips the moon button used to get a dark
       page with light `<salla-*>` widgets. The script therefore writes BOTH —
       and it must REMOVE the other value, because the engine only ever
       `classList.add`s and two `color-mode-*` classes on one element are
       resolved by source order, not by intent. */
    expect(COLOR_MODE_BOOT_SCRIPT).toContain('color-mode-');
    expect(COLOR_MODE_BOOT_SCRIPT).toContain("remove('color-mode-dark','color-mode-light')");
    // still no second DECISION: the mode comes from the key + the attribute
    expect(COLOR_MODE_BOOT_SCRIPT.match(/color-mode-/g)?.length).toBe(3);
  });

  it('cannot throw its way into a blank page', () => {
    // storage is wrapped: private mode and blocked cookies are normal
    expect(COLOR_MODE_BOOT_SCRIPT).toMatch(/try\{s=localStorage/);
    expect(COLOR_MODE_BOOT_SCRIPT.startsWith('(function(){try{')).toBe(true);
  });

  it('is one line, because it sits on the critical path of every page', () => {
    expect(COLOR_MODE_BOOT_SCRIPT).not.toContain('\n');
  });
});

describe('applyColorMode — the two switches never disagree', () => {
  const root = () => document.documentElement;
  const body = () => document.body;

  beforeEach(() => {
    root().className = '';
    body().className = '';
  });

  it('writes the class the stylesheet paints from', () => {
    applyColorMode('dark');
    expect(root().classList.contains('dark')).toBe(true);
    applyColorMode('light');
    expect(root().classList.contains('dark')).toBe(false);
  });

  it('mirrors the engine’s body class, so embedded widgets follow', () => {
    applyColorMode('dark');
    expect(body().classList.contains('color-mode-dark')).toBe(true);
    expect(body().classList.contains('color-mode-light')).toBe(false);
  });

  it('REMOVES the other value — the engine only ever adds', () => {
    /* `themeBodyClasses` does `classList.add(...)`, never a remove. A visitor
       who flips the moon button on a store whose dashboard is light would end
       up with BOTH classes on <body>, and the winner would be decided by source
       order in the engine's stylesheet, not by the visitor's choice. */
    body().className = 'color-mode-light salla-x';
    applyColorMode('dark');
    expect(body().classList.contains('color-mode-light')).toBe(false);
    expect(body().classList.contains('color-mode-dark')).toBe(true);
    // and it leaves everything it does not own alone
    expect(body().classList.contains('salla-x')).toBe(true);
  });

  it('survives a missing body (the boot script runs before it exists)', () => {
    const saved = document.body;
    Object.defineProperty(document, 'body', { value: null, configurable: true });
    expect(() => applyColorMode('dark')).not.toThrow();
    Object.defineProperty(document, 'body', { value: saved, configurable: true });
    expect(root().classList.contains('dark')).toBe(true);
  });
});
