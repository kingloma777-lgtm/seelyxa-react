import { describe, it, expect } from 'vitest';
import {
  HEADER_DEFAULTS,
  headerVars,
  readHeaderSettings,
  scalarSetting,
} from '../../app/lib/headerSettings';

/**
 * The header's precedence chain, pinned.
 *
 * `docs/GLOBAL-SETTINGS.md` §5.2: a value that equals the design default is not
 * a decision, so it is NOT written inline — that is what lets the header
 * inherit `--ink-1` / `--surface-1` from the store palette (and flip with it at
 * night). Only a real deviation rides the `style` attribute.
 */
describe('headerSettings — the inherit rule', () => {
  it('writes nothing when the store never opened the panel', () => {
    const vars = headerVars(readHeaderSettings({}));
    expect(vars).toEqual({});
  });

  it('treats a saved value equal to the default as "inherit", not as an override', () => {
    /* a store that saved the manifest defaults must behave exactly like a store
       that saved nothing — otherwise "Inherit" would depend on the picker's
       history instead of on the value */
    const vars = headerVars(
      readHeaderSettings({
        header_glass_color: HEADER_DEFAULTS.glassColor,
        header_text_color: HEADER_DEFAULTS.textColor,
        header_glass_opacity: HEADER_DEFAULTS.glassOpacity,
        header_blur: HEADER_DEFAULTS.blur,
        header_nav_font_size: HEADER_DEFAULTS.navSize,
        header_nav_weight: HEADER_DEFAULTS.navWeight,
        header_nav_gap: HEADER_DEFAULTS.navGap,
      })
    );
    expect(vars).toEqual({});
  });

  it('emits only what the merchant actually changed', () => {
    const vars = headerVars(
      readHeaderSettings({
        header_glass_color: '#334455',
        header_glass_opacity: 62,
        header_blur: 24,
        header_text_color: '#123456',
        header_nav_font_size: 16,
        header_nav_weight: '800',
        header_nav_gap: 10,
      })
    );
    expect(vars).toEqual({
      '--morph-glass-color': '#334455',
      '--morph-glass-alpha': '62',
      '--morph-blur': '24px',
      '--morph-fg': '#123456',
      '--morph-nav-size': '16px',
      '--morph-nav-weight': '800',
      '--morph-nav-gap': '10px',
    });
  });
});

describe('headerSettings — a settings payload is not trusted', () => {
  it('drops anything that is not a plain colour', () => {
    /* the same boundary `MapLocation.mapSrc()` guards: a colour field is text,
       and text can carry a `url()` or a declaration break */
    for (const hostile of ['url(https://evil/x.png)', 'red; background: blue', 'var(--x)', 'expression(1)']) {
      const h = readHeaderSettings({ header_glass_color: hostile, header_text_color: hostile });
      expect(h.glassColor).toBe('');
      expect(h.textColor).toBe('');
      expect(headerVars(h)).toEqual({});
    }
  });

  it('accepts the shapes the picker and the engine actually ship', () => {
    expect(readHeaderSettings({ header_glass_color: '#abc' }).glassColor).toBe('#abc');
    expect(readHeaderSettings({ header_glass_color: 'rgb(1, 2, 3)' }).glassColor).toBe('rgb(1, 2, 3)');
    /* Salla may answer with `[{label, value, key}]` */
    expect(scalarSetting([{ label: 'x', value: '#112233', key: 'k' }])).toBe('#112233');
    expect(readHeaderSettings({ header_text_color: [{ value: '#112233' }] }).textColor).toBe('#112233');
  });

  it('clamps a number into the range its own control offers', () => {
    expect(readHeaderSettings({ header_glass_opacity: 0 }).glassOpacity).toBe(1);
    expect(readHeaderSettings({ header_glass_opacity: 400 }).glassOpacity).toBe(100);
    expect(readHeaderSettings({ header_blur: 999 }).blur).toBe(40);
    expect(readHeaderSettings({ header_nav_font_size: 0 }).navSize).toBe(1);
    expect(readHeaderSettings({ header_nav_gap: -5 }).navGap).toBe(0);
    /* a value the control does not offer falls back to the design default */
    expect(readHeaderSettings({ header_nav_weight: '900' }).navWeight).toBe(HEADER_DEFAULTS.navWeight);
  });
});

describe('headerSettings — behaviour flags', () => {
  it('sticky defaults to on and can be turned off', () => {
    expect(readHeaderSettings({}).sticky).toBe(true);
    expect(readHeaderSettings({ header_sticky: false }).sticky).toBe(false);
    expect(readHeaderSettings({ header_sticky: 'false' }).sticky).toBe(false);
    expect(readHeaderSettings({ header_sticky: 'true' }).sticky).toBe(true);
  });

  it('surface is glass unless the merchant chose solid', () => {
    expect(readHeaderSettings({}).surface).toBe('glass');
    expect(readHeaderSettings({ header_surface: 'solid' }).surface).toBe('solid');
    expect(readHeaderSettings({ header_surface: 'nonsense' }).surface).toBe('glass');
  });

  it('radius: inherit writes nothing, a pixel writes the panel radius', () => {
    expect(headerVars(readHeaderSettings({ header_radius: 'inherit' }))).toEqual({});
    expect(headerVars(readHeaderSettings({}))).toEqual({});
    expect(headerVars(readHeaderSettings({ header_radius: '18' }))).toEqual({
      '--morph-panel-radius': '18px',
    });
    /* `0` is a decision, not an empty value — `||` would drop it */
    expect(headerVars(readHeaderSettings({ header_radius: '0' }))).toEqual({
      '--morph-panel-radius': '0px',
    });
  });

  it('shape and the theme toggle keep their historical defaults', () => {
    expect(readHeaderSettings({}).shape).toBe('wide');
    expect(readHeaderSettings({ header_shape: 'pill' }).shape).toBe('pill');
    expect(readHeaderSettings({}).themeToggle).toBe(true);
    expect(readHeaderSettings({ header_theme_toggle: false }).themeToggle).toBe(false);
  });

  it('the mega-menu layout stays CLASSIC unless the merchant opts into showcase', () => {
    /* The new composition is the second option in the editor, never a silent
       replacement of the layout a store already has — including when the
       setting arrives empty, stale, or as a hostile payload. */
    expect(HEADER_DEFAULTS.megaLayout).toBe('classic');
    expect(readHeaderSettings({}).megaLayout).toBe('classic');
    expect(readHeaderSettings({ header_mega_layout: '' }).megaLayout).toBe('classic');
    expect(readHeaderSettings({ header_mega_layout: 'showcase-ish' }).megaLayout).toBe('classic');
    expect(readHeaderSettings({ header_mega_layout: { value: 'javascript:alert(1)' } }).megaLayout).toBe('classic');

    /* All three shapes the `items` + `dropdown-list` control actually ships. */
    expect(readHeaderSettings({ header_mega_layout: 'showcase' }).megaLayout).toBe('showcase');
    expect(readHeaderSettings({ header_mega_layout: { value: 'showcase' } }).megaLayout).toBe('showcase');
    expect(
      readHeaderSettings({
        header_mega_layout: [{ label: 'واجهة العرض', value: 'showcase', key: 'k' }],
      }).megaLayout
    ).toBe('showcase');
  });

  it('accepts only a fetchable image as the night logo', () => {
    /* the picker yields a CDN url; anything else is a payload, not a logo */
    expect(readHeaderSettings({ header_logo_dark: 'https://cdn.salla.network/a/logo.png' }).logoDark).toBe(
      'https://cdn.salla.network/a/logo.png'
    );
    expect(readHeaderSettings({ header_logo_dark: '/images/logo-light.svg' }).logoDark).toBe('/images/logo-light.svg');
    /* the picker's `{url}` / `[{url}]` shapes resolve through `imgSrc` */
    expect(readHeaderSettings({ header_logo_dark: { url: 'https://cdn.salla.network/b.png' } }).logoDark).toBe(
      'https://cdn.salla.network/b.png'
    );
    expect(readHeaderSettings({ header_logo_dark: [{ url: 'https://cdn.salla.network/c.png' }] }).logoDark).toBe(
      'https://cdn.salla.network/c.png'
    );
    /* and nothing else does */
    expect(readHeaderSettings({ header_logo_dark: 'javascript:alert(1)' }).logoDark).toBe('');
    expect(readHeaderSettings({ header_logo_dark: 'data:image/svg+xml,<svg onload=alert(1)>' }).logoDark).toBe('');
    expect(readHeaderSettings({ header_logo_dark: 'not a url' }).logoDark).toBe('');
    expect(readHeaderSettings({}).logoDark).toBe('');
  });
});
