import { describe, it, expect } from 'vitest';
import {
  GLOBAL_SETTINGS_DEFAULTS,
  readGlobalSettings,
  globalVars,
  resolveSetting,
  isCssColor,
  RADIUS_PX,
  CONTAINER_PX,
  GUTTER_PX,
  SECTION_GAP_PX,
  SURFACE_PRESETS,
  TEXT_TONES,
  BORDER_STRENGTHS,
} from '../../app/lib/storeSettings';

/**
 * The global settings are read once and pushed into CSS, so the failure mode is
 * silent: a value that is emitted when it should not be, or one that is dropped
 * when it should arrive. These pin the two rules the whole system rests on —
 * **unset writes nothing**, and **an override is independent per value** — plus
 * the eight scenarios the store owner asked to see proven.
 */

/** A store that has never opened the panel. */
const LEGACY_STORE = {
  header_layout: 'morph',
  header_shape: 'wide',
  header_theme_toggle: true,
  header_glass_color: '#ffffff',
  product_card_radius: 22,
  product_card_bg: '#fdfaf3',
  product_card_ink: '#2b2519',
  enable_cart_drawer: true,
  global_enable_scroll_reveal: true,
};

describe('a store that never opened the panel', () => {
  it('resolves to "use what is already there"', () => {
    expect(readGlobalSettings(undefined)).toEqual(GLOBAL_SETTINGS_DEFAULTS);
    expect(readGlobalSettings({})).toEqual(GLOBAL_SETTINGS_DEFAULTS);
    expect(readGlobalSettings(LEGACY_STORE)).toEqual(GLOBAL_SETTINGS_DEFAULTS);
  });

  /* Scenario 6 — no settings at all. The token layer underneath must stay the
     only source; one emitted variable would mean the theme had started
     overriding its own defaults. */
  it('emits NO custom property at all', () => {
    expect(globalVars(readGlobalSettings(LEGACY_STORE))).toEqual({});
    expect(globalVars(GLOBAL_SETTINGS_DEFAULTS)).toEqual({});
  });

  /* Scenario 8 — old stores keep every customisation they already saved. The
     global layer is additive: it cannot move a component key it does not own. */
  it('does not touch a single component key', () => {
    const before = { ...LEGACY_STORE };
    readGlobalSettings(before);
    expect(before).toEqual(LEGACY_STORE);
  });
});

describe('the accent', () => {
  /* Scenario 7 — Salla's colour stays the source unless the merchant says
     otherwise. `--gs-accent` being absent is what lets `--color-primary`
     through; emitting a copy here would be a second source of truth. */
  it('is NOT emitted in `salla` mode, so the engine variable wins', () => {
    const vars = globalVars(readGlobalSettings({ global_accent_mode: 'salla', global_accent_color: '#ff0000' }));
    expect(vars['--gs-accent']).toBeUndefined();
  });

  /* Scenario 1 — one global colour reaches every block that inherits it: they
     all read `var(--gs-accent, …)`, so one declaration on `.app-inner` moves
     them together. */
  it('is emitted in `custom` mode and inherits to every consumer', () => {
    const vars = globalVars(readGlobalSettings({ global_accent_mode: 'custom', global_accent_color: '#c9f26c' }));
    expect(vars['--gs-accent']).toBe('#c9f26c');
  });

  it('is not emitted for half a decision (custom mode, no colour)', () => {
    expect(globalVars(readGlobalSettings({ global_accent_mode: 'custom' }))['--gs-accent']).toBeUndefined();
    expect(
      globalVars(readGlobalSettings({ global_accent_mode: 'custom', global_accent_color: '' }))['--gs-accent']
    ).toBeUndefined();
  });

  it('refuses anything that is not a colour, so a payload cannot escape into CSS', () => {
    for (const bad of ['red;background:url(x)', 'url(#x)', 'var(--x)', 'expression(1)', 'rgb(1,2,3);']) {
      expect(isCssColor(bad), bad).toBe(false);
      expect(
        globalVars(readGlobalSettings({ global_accent_mode: 'custom', global_accent_color: bad }))['--gs-accent'],
        bad
      ).toBeUndefined();
    }
    for (const good of ['#fff', '#ffffff', '#ffffffcc', 'rgb(1, 2, 3)', 'hsl(10 20% 30% / 0.5)']) {
      expect(isCssColor(good), good).toBe(true);
    }
  });
});

describe('the layout values', () => {
  it('`theme` emits nothing for every one of them', () => {
    const vars = globalVars(
      readGlobalSettings({
        global_radius: 'theme',
        global_container: 'theme',
        global_gutter: 'theme',
        global_section_gap: 'theme',
      })
    );
    expect(vars).toEqual({});
  });

  it('a chosen value is emitted in px, once, under its own variable', () => {
    const vars = globalVars(
      readGlobalSettings({
        global_radius: '18',
        global_container: '1600',
        global_gutter: '24',
        global_section_gap: '48',
      })
    );
    expect(vars).toEqual({
      '--gs-radius': '18px',
      /* the same decision, twice: the exact pixel the Selia shell reads and
         the multiplier the whole corner ramp in `tokens.scss` reads */
      '--radius-scale': '0.8182',
      '--gs-container': '1600px',
      '--container-max': '1600px',
      '--gs-gutter': '24px',
      '--gs-section-gap': '48px',
    });
  });

  /* Scenario 2 — an override is independent per value. Picking a radius must
     not drag the container with it. */
  it('one choice never emits another value', () => {
    const vars = globalVars(readGlobalSettings({ global_radius: '8' }));
    // the radius role and its multiplier — never the container or the gutter
    expect(Object.keys(vars).sort()).toEqual(['--gs-radius', '--radius-scale']);
  });

  it('reads the dropdown shapes the engine actually sends', () => {
    // the engine sends either the bare value or `[{ label, value, key }]`
    expect(readGlobalSettings({ global_radius: [{ label: 'دافئة', value: '18', key: 'k' }] }).radius).toBe('18');
    expect(readGlobalSettings({ global_radius: '18' }).radius).toBe('18');
  });

  it('falls back to `theme` for a value it does not recognise', () => {
    expect(readGlobalSettings({ global_radius: '999' }).radius).toBe('theme');
    expect(readGlobalSettings({ global_container: 'huge' }).container).toBe('theme');
    expect(readGlobalSettings({ global_accent_mode: 'nonsense' }).accentMode).toBe('salla');
  });

  it('every option maps to the number its label promises', () => {
    expect(RADIUS_PX['22']).toBe(22);
    expect(CONTAINER_PX['1440']).toBe(1440);
    expect(GUTTER_PX['40']).toBe(40);
    expect(SECTION_GAP_PX['80']).toBe(80);
  });
});

describe('resolveSetting — the inheritance order', () => {
  /* Scenarios 1-4 at the value level: the same function every block calls. */
  it('component override beats the global setting', () => {
    expect(resolveSetting('#ff0000', '#000000', '#004956', '#111111')).toBe('#ff0000');
  });

  /* Scenario 3 — the global changes; the override does not move. */
  it('keeps the override when the global value changes', () => {
    expect(resolveSetting('#ff0000', '#222222', '#004956', '#111111')).toBe('#ff0000');
  });

  /* Scenario 4 — clearing the override returns the CURRENT global, not the one
     that was there when the override was written. */
  it('falls back to the current global when the override is cleared', () => {
    expect(resolveSetting('', '#222222', '#004956', '#111111')).toBe('#222222');
    expect(resolveSetting(null, '#333333', '#004956', '#111111')).toBe('#333333');
    expect(resolveSetting(undefined, '#444444', '#004956', '#111111')).toBe('#444444');
  });

  /* Scenario 7 — with no theme setting, Salla's own value is next in line.
     Note the global argument is `''`, not `'theme'`: `'theme'` is a *choice*
     consumed by `readGlobalSettings` (it means "emit nothing"), and by the time
     a block calls the resolver the choice has already become an absent value. */
  it('uses the Salla value when neither the block nor the theme set one', () => {
    expect(resolveSetting('', '', '#004956', '#111111')).toBe('#004956');
  });

  it('uses the fallback when nothing at all is set', () => {
    expect(resolveSetting('', '', '', '#111111')).toBe('#111111');
  });

  /* The reason this is a function and not `a || b || c`: `0` and `false` are
     real values, and `||` throws them away. */
  it('treats 0 and false as values, and only whitespace as empty', () => {
    expect(resolveSetting(0, 18, undefined, 22)).toBe(0);
    expect(resolveSetting(false, true, undefined, true)).toBe(false);
    expect(resolveSetting('   ', 18, undefined, 22)).toBe(18);
    expect(resolveSetting('', 0, undefined, 22)).toBe(0);
  });

  /* Scenario 5 — a block added tomorrow calls the same function with its own
     three inputs; nothing about it is registered anywhere. */
  it('is usable by a block that did not exist when the system was built', () => {
    const newBlock = (local: string, global: string, salla: string) =>
      resolveSetting(local, global, salla, 'transparent');
    expect(newBlock('', '', '')).toBe('transparent');
    expect(newBlock('', '', '#123456')).toBe('#123456');
    expect(newBlock('', '#654321', '#123456')).toBe('#654321');
    expect(newBlock('#abcdef', '#654321', '#123456')).toBe('#abcdef');
  });
});

describe('a zero radius is a choice, not an absence', () => {
  /* The settings layer's own version of the `0` rule: "square corners" is the
     most common override a merchant picks, and it is the one a truthiness check
     would silently throw away. */
  it('emits `0px` when the merchant picks the square option', () => {
    expect(globalVars(readGlobalSettings({ global_radius: '0' }))).toEqual({
      '--gs-radius': '0px',
      '--radius-scale': '0',
    });
    expect(RADIUS_PX['0']).toBe(0);
  });
});

describe('isolation: one block cannot restyle the store', () => {
  /* Scenario 2 at the boundary that matters: the global variables are written
     once on `.app-inner`. A block value that leaked into them would restyle
     every block in the store from one component's override. */
  it('a component value never appears in the global variables', () => {
    const vars = globalVars(readGlobalSettings({ global_radius: '12' }));
    expect(vars).toEqual({ '--gs-radius': '12px', '--radius-scale': '0.5455' });
    expect(Object.values(vars)).not.toContain('0px');
  });

  it('two blocks resolving against the same global stay independent', () => {
    const global = 22;
    const hero = resolveSetting(0, global, undefined, 12); // explicit square
    const card = resolveSetting('', global, undefined, 12); // inherits
    expect(hero).toBe(0);
    expect(card).toBe(22);
  });

  it('reading the settings twice is pure — no mutation, same output', () => {
    const payload = { global_accent_mode: 'custom', global_accent_color: '#123456', global_radius: '18' };
    const first = globalVars(readGlobalSettings(payload));
    const second = globalVars(readGlobalSettings(payload));
    expect(first).toEqual(second);
    expect(payload).toEqual({ global_accent_mode: 'custom', global_accent_color: '#123456', global_radius: '18' });
  });

  it('a later global change reaches every consumer, because there is one output', () => {
    const eight = globalVars(readGlobalSettings({ global_radius: '8' }))['--gs-radius'];
    const twentyTwo = globalVars(readGlobalSettings({ global_radius: '22' }))['--gs-radius'];
    expect(eight).toBe('8px');
    expect(twentyTwo).toBe('22px');
  });
});

describe('RTL / LTR neutrality', () => {
  /* Every value here is symmetric by construction — radius, width, gutter and
     vertical gap. A physical `left`/`right` in a settings name is the trap this
     pins: it would need a mirrored duplicate for the other direction. */
  it('emits no directional property, so one output serves both directions', () => {
    const vars = globalVars(
      readGlobalSettings({
        global_accent_mode: 'custom',
        global_accent_color: '#123456',
        global_radius: '18',
        global_container: '1280',
        global_gutter: '24',
        global_section_gap: '48',
      })
    );
    expect(Object.keys(vars).sort()).toEqual([
      '--container-max',
      '--gs-accent',
      '--gs-container',
      '--gs-gutter',
      '--gs-radius',
      '--gs-section-gap',
      '--radius-scale',
    ]);
    for (const key of Object.keys(vars)) {
      expect(key, key).not.toMatch(/left|right|top|bottom/);
    }
  });
});

/* ── the palette family ────────────────────────────────────────────────────
   A surface preset is a family, not a colour: four backgrounds plus the muted
   ink measured against them. These tests hold the family together, and — the
   part that cannot be eyeballed — recompute the WCAG contrast of every
   ink/background pair the panel can produce, so a future tweak to one hex
   fails here instead of shipping unreadable captions.
   ------------------------------------------------------------------------ */

/** WCAG 2.x relative luminance of a hex colour. */
function luminance(hex: string): number {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** What the theme ships today — the bar a preset may not fall below. */
const BASELINE_MUTED = contrast('#7c8082', '#f5f7f9');
/** And the same bar for the night face: `html.dark`'s own muted ink on its own
 *  `s3`. The day ratio is the wrong yardstick there — night ink on a night
 *  surface starts from a different pair entirely, and `s3` is the strictest
 *  pair the theme actually ships (4.61:1 against 5.35:1 on `s2`). */
const BASELINE_MUTED_NIGHT = contrast('#8d95a2', '#242b37');

describe('the surface family', () => {
  it('`theme` emits nothing, so the palette is untouched', () => {
    expect(globalVars(readGlobalSettings({ global_surface_preset: 'theme' }))).toEqual({});
    expect(globalVars(readGlobalSettings({}))).toEqual({});
  });

  it('emits the whole family — canvas, three levels and the muted ink, both faces — or none of it', () => {
    for (const name of ['warm', 'cool', 'neutral'] as const) {
      const vars = globalVars(readGlobalSettings({ global_surface_preset: name }));
      expect(Object.keys(vars).sort(), name).toEqual([
        '--gs-canvas',
        '--gs-canvas-night',
        '--gs-card-image-day',
        '--gs-card-image-night',
        '--gs-card-surface',
        '--gs-ink-3',
        '--gs-ink-3-night',
        '--gs-surface-1',
        '--gs-surface-1-night',
        '--gs-surface-2',
        '--gs-surface-2-night',
        '--gs-surface-3',
        '--gs-surface-3-night',
      ]);
    }
  });

  it('gives every family a night face that is a real night surface', () => {
    // a store whose dashboard is in dark mode used to get nothing from this
    // setting at all: the bridge only painted `html:not(.dark)`. The night
    // face is what makes the control honest there.
    for (const [name, family] of Object.entries(SURFACE_PRESETS)) {
      const { ink3, ...surfaces } = family.night;
      for (const value of Object.values(surfaces)) {
        expect(value, `${name} night`).toMatch(/^#[0-9a-f]{6}$/i);
        // dark enough to be night: a day canvas pasted into the night face
        // would paint a bright band across a dark page
        expect(luminance(value), `${name} ${value} is a night value`).toBeLessThan(0.25);
      }
      // the ink is the exception — it has to be LIGHT to be read at all
      expect(luminance(ink3), `${name} night ink`).toBeGreaterThan(0.25);
    }
  });

  it('keeps the night levels ordered and readable too', () => {
    /* The order INVERTS at night: a raised surface is lighter than the page,
       not darker. The theme's own night set does the same (`#141923` card on a
       `#0b0e14` canvas), so a family that kept the day order would be a card
       darker than its own page. */
    for (const [name, family] of Object.entries(SURFACE_PRESETS)) {
      const { canvas, s1, s2, s3, ink3 } = family.night;
      const [l1, l2, l3] = [s1, s2, s3].map(luminance);
      expect(l1, `${name} night s1 < s2`).toBeLessThan(l2);
      expect(l2, `${name} night s2 < s3`).toBeLessThan(l3);
      expect(l1, `${name} night card > canvas`).toBeGreaterThan(luminance(canvas));
      /* Step-wise, not total range: night luminance is compressed (the theme's
         own night set spans ~0.015 from `s1` to `s3` against the day set's
         ~0.05), so a day-sized threshold would reject every honest night face.
         What has to hold is that each step is a perceptible one. */
      expect(l2 - l1, `${name} night s1→s2 step`).toBeGreaterThan(0.002);
      expect(l3 - l2, `${name} night s2→s3 step`).toBeGreaterThan(0.002);
      // and the muted ink clears the theme's own night baseline, not the day one
      for (const level of [s2, s3]) {
        expect(contrast(ink3, level), `${name} night ink3 on ${level}`).toBeGreaterThanOrEqual(
          BASELINE_MUTED_NIGHT
        );
      }
    }
  });

  it('keeps the three families distinguishable after dark', () => {
    // the failure this prevents: every preset collapsing to the same near-black
    // at 6% mix, so the merchant picks "warm" and nothing moves
    const canvases = Object.entries(SURFACE_PRESETS).map(
      ([name, f]) => [name, f.night.canvas] as const
    );
    expect(new Set(canvases.map(([, c]) => c)).size).toBe(canvases.length);
    for (let i = 0; i < canvases.length; i += 1) {
      for (let j = i + 1; j < canvases.length; j += 1) {
        const [aName, a] = canvases[i];
        const [bName, b] = canvases[j];
        expect(Math.abs(luminance(a) - luminance(b)), `${aName} vs ${bName}`).toBeGreaterThan(0);
      }
    }
  });

  it('a half family is impossible: the muted ink always travels with the surfaces', () => {
    // the bug this prevents: new canvas, old cool-grey captions, one contrast
    // step darker than the page they sit on
    for (const family of Object.values(SURFACE_PRESETS)) {
      expect(family.ink3).toMatch(/^#[0-9a-f]{6}$/i);
      expect(family.canvas).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('never makes small text harder to read than the theme already does', () => {
    for (const [name, family] of Object.entries(SURFACE_PRESETS)) {
      for (const level of [family.s2, family.s3]) {
        expect(contrast(family.ink3, level), `${name} ink3 on ${level}`).toBeGreaterThanOrEqual(
          BASELINE_MUTED
        );
      }
    }
  });

  it('keeps the surface levels distinct, so a card still reads as raised', () => {
    for (const [name, family] of Object.entries(SURFACE_PRESETS)) {
      const canvas = luminance(family.canvas);
      const [s1, s2, s3] = [family.s1, family.s2, family.s3].map(luminance);

      // a card is never darker than the page it sits on
      expect(s1, `${name} card vs canvas`).toBeGreaterThanOrEqual(canvas);
      // and the three fill levels descend, so `s3` still reads as "stronger"
      expect(s1, `${name} s1 > s2`).toBeGreaterThan(s2);
      expect(s2, `${name} s2 > s3`).toBeGreaterThan(s3);
      // enough total range that the levels are actually distinguishable
      expect(s1 - s3, `${name} total range`).toBeGreaterThan(0.03);
    }
  });

  it('falls back to `theme` for a value it does not recognise', () => {
    expect(readGlobalSettings({ global_surface_preset: 'neon' }).surfacePreset).toBe('theme');
    expect(globalVars(readGlobalSettings({ global_surface_preset: 'neon' }))).toEqual({});
  });
});

describe('the text tone', () => {
  it('owns the two reading inks and never the muted one', () => {
    for (const name of ['strong', 'soft', 'warm'] as const) {
      const vars = globalVars(readGlobalSettings({ global_text_tone: name }));
      expect(Object.keys(vars).sort(), name).toEqual([
        '--gs-ink-1',
        '--gs-ink-1-night',
        '--gs-ink-2',
        '--gs-ink-2-night',
      ]);
      expect(vars['--gs-ink-3'], name).toBeUndefined();
      expect(vars['--gs-ink-3-night'], name).toBeUndefined();
    }
  });

  it('stays above 4.5:1 on every surface family the panel can pair it with', () => {
    const surfaces = [
      { s1: '#ffffff', s2: '#f5f7f9' },
      ...Object.values(SURFACE_PRESETS).map((f) => ({ s1: f.s1, s2: f.s2 })),
    ];
    const tones = [{ ink1: '#231f1e', ink2: '#465058' }, ...Object.values(TEXT_TONES)];

    for (const tone of tones) {
      for (const surface of surfaces) {
        expect(contrast(tone.ink2, surface.s2), `ink2 ${tone.ink2} on ${surface.s2}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(tone.ink1, surface.s1), `ink1 ${tone.ink1} on ${surface.s1}`).toBeGreaterThanOrEqual(7);
      }
    }
  });

  it('`theme` emits nothing', () => {
    expect(globalVars(readGlobalSettings({ global_text_tone: 'theme' }))).toEqual({});
    expect(readGlobalSettings({ global_text_tone: 'loud' }).textTone).toBe('theme');
  });
});

describe('the border strength', () => {
  it('re-points both hairlines and nothing else', () => {
    for (const name of ['soft', 'strong'] as const) {
      const vars = globalVars(readGlobalSettings({ global_border_strength: name }));
      expect(Object.keys(vars).sort(), name).toEqual([
        '--gs-line-1',
        '--gs-line-1-night',
        '--gs-line-2',
        '--gs-line-2-night',
      ]);
      // the same ink at a different alpha, so it composites over any preset
      expect(vars['--gs-line-1'], name).toMatch(/^rgba\(20, 20, 30, 0\.\d+\)$/);
      // and at night the ink flips to white — a dark hairline on a `#0b0e14`
      // canvas is invisible, which is how a "border strength" control ends up
      // doing nothing on a dark store
      expect(vars['--gs-line-1-night'], name).toMatch(/^rgba\(255, 255, 255, 0\.\d+\)$/);
    }
  });

  it('keeps the two hairlines ordered — the emphasis line is always the darker one', () => {
    const alpha = (value: string) => Number(value.replace(/^.*,\s*/, '').replace(')', ''));
    for (const [name, pair] of Object.entries(BORDER_STRENGTHS)) {
      expect(alpha(pair.line2), name).toBeGreaterThan(alpha(pair.line1));
      // the same order at night, so the two modes stay one decision
      expect(alpha(pair.night.line2), `${name} night`).toBeGreaterThan(alpha(pair.night.line1));
    }
    // and the "soft" option is genuinely softer than the theme's own 0.08/0.16
    expect(alpha(BORDER_STRENGTHS.soft.line1)).toBeLessThan(0.08);
    expect(alpha(BORDER_STRENGTHS.strong.line1)).toBeGreaterThan(0.08);
    // the night pair brackets the theme's own night hairlines (0.09 / 0.18)
    expect(alpha(BORDER_STRENGTHS.soft.night.line1)).toBeLessThan(0.09);
    expect(alpha(BORDER_STRENGTHS.strong.night.line1)).toBeGreaterThan(0.09);
  });

  it('`theme` emits nothing', () => {
    expect(globalVars(readGlobalSettings({ global_border_strength: 'theme' }))).toEqual({});
    expect(readGlobalSettings({ global_border_strength: 'heavy' }).borderStrength).toBe('theme');
  });
});

describe('the three palette settings compose', () => {
  it('a full choice emits both faces with no collision', () => {
    const vars = globalVars(
      readGlobalSettings({
        global_surface_preset: 'warm',
        global_text_tone: 'warm',
        global_border_strength: 'strong',
      })
    );
    expect(Object.keys(vars).sort()).toEqual([
      '--gs-canvas',
      '--gs-canvas-night',
      '--gs-card-image-day',
      '--gs-card-image-night',
      '--gs-card-surface',
      '--gs-ink-1',
      '--gs-ink-1-night',
      '--gs-ink-2',
      '--gs-ink-2-night',
      '--gs-ink-3',
      '--gs-ink-3-night',
      '--gs-line-1',
      '--gs-line-1-night',
      '--gs-line-2',
      '--gs-line-2-night',
      '--gs-surface-1',
      '--gs-surface-1-night',
      '--gs-surface-2',
      '--gs-surface-2-night',
      '--gs-surface-3',
      '--gs-surface-3-night',
    ]);
  });

  it('picking a tone alone never repaints a surface', () => {
    const vars = globalVars(readGlobalSettings({ global_text_tone: 'soft' }));
    for (const key of Object.keys(vars)) expect(key, key).not.toMatch(/--gs-surface|--gs-canvas/);
  });

  it('the palette settings do not disturb the layout settings', () => {
    const vars = globalVars(
      readGlobalSettings({ global_radius: '12', global_surface_preset: 'cool' })
    );
    expect(vars['--gs-radius']).toBe('12px');
    expect(vars['--gs-surface-2']).toBe(SURFACE_PRESETS.cool.s2);
  });
});
