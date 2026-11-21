// @vitest-environment node
/**
 * The design-system contract, as a test.
 *
 * `tokens.test.ts` proves the token *layer* exists and that store → section →
 * card inherits in one direction. This file proves the layer cannot be
 * *bypassed*, which is a different failure: a component that writes its own
 * `--radius-card: 22px` looks correct today and silently stops following the
 * system tomorrow, and nothing renders differently until someone edits the
 * global token and only half the store moves.
 *
 * Four guarantees:
 *
 *  1. The merchant's font reaches the theme's faces through `--font-main`
 *     (the engine writes it), so changing the store font moves every heading.
 *  2. `--font-display` stays a theme role — it is the identity, not a setting.
 *  3. No component invents a global role token; it may only re-point one at
 *     another token. That is the Global vs. Component-level classification.
 *  4. `--bg-store` is declared in exactly one file, so a dark-mode canvas
 *     change is a one-line edit and cannot drift from a second copy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const stylesRoot = path.join(themeRoot, 'app/styles');
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${stylesRoot}/${file}`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

function declarations(root: Root, selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
    }
  });
  return decls;
}

/** Every `.scss` under `app/styles`, as `{ file, text }`, skipping `vendor/`. */
function scssFiles(dir = stylesRoot, out: Array<{ file: string; text: string }> = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'vendor') continue;
      scssFiles(full, out);
    } else if (entry.name.endsWith('.scss')) {
      out.push({ file: path.relative(themeRoot, full).replace(/\\/g, '/'), text: fs.readFileSync(full, 'utf8') });
    }
  }
  return out;
}

/**
 * Global role tokens: the ones §13.5 says a component may *consume* and may
 * re-point, but must never re-invent with a literal.
 */
const GLOBAL_ROLES = [
  '--bg-store',
  '--bg-section',
  '--bg-card',
  '--radius-card',
  '--radius-button',
  '--radius-input',
  '--radius-media',
  '--shadow-card',
  '--motion-fast',
  '--motion-base',
  '--motion-slow',
  '--ease-out',
  '--ease-in-out',
  '--ease-spring',
];

describe('the merchant font reaches the theme through one variable', () => {
  it('body and heading faces follow `--font-main`, not a literal family', async () => {
    const t = declarations(await compile('01-settings/tokens.scss'), ':root');

    // the engine writes `--font-main` from the merchant's typography setting;
    // these two roles must resolve through it or a store font change does nothing
    for (const role of ['--font-body', '--font-heading']) {
      expect(t[role], role).toContain('var(--font-main');
      expect(t[role], role).toContain('system-ui'); // and keep a fallback chain
    }
  });

  it('`--font-display` stays a theme role, not a merchant setting', async () => {
    const t = declarations(await compile('01-settings/tokens.scss'), ':root');

    // decision (2026-11-20): the theme owns its identity. The editorial serif is
    // what makes the display blocks recognisable — wiring it to `--font-main`
    // would flatten 34 blocks into whatever face the store happens to use.
    expect(t['--font-display']).toBeTruthy();
    expect(t['--font-display']).not.toContain('var(--font-main');
  });
});

describe('Global vs Component-level: a component may re-point, never re-invent', () => {
  it('no component file declares a global role token with a literal value', () => {
    const offenders: string[] = [];
    const declaration = new RegExp(`^\\s*(${GLOBAL_ROLES.join('|')})\\s*:\\s*(.+?);`, 'gm');

    for (const { file, text } of scssFiles()) {
      if (file.includes('/01-settings/')) continue; // the layer that owns the values
      const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      for (const match of stripped.matchAll(declaration)) {
        const value = match[2].trim();
        // allowed: a reference to another token, or arithmetic on one
        if (!/^(var\(|calc\(|color-mix\()/.test(value)) {
          offenders.push(`${file}: ${match[1]}: ${value}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('the card level is re-pointed at the merchant card colour, not redefined', async () => {
    const inner = declarations(await compile('04-components/product-card.scss'), '.app-inner');

    // `--bg-card` may be *re-pointed* to a component token (`--pc-bg`) — that is
    // the sanctioned override in §13.5 — but it may not become a literal here
    expect(inner['--bg-card']).toBe('var(--pc-bg)');
  });
});

describe('one source for the store canvas', () => {
  it('`--bg-store` is DECLARED once, in `01-settings/global.scss`', () => {
    const stripped = (text: string) =>
      text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    /* `global-settings.scss` is allowed to mention it, because the palette
       bridge RE-POINTS every level the merchant can choose — `--bg-store` is
       the one `body` paints from, so leaving it out meant the surface preset
       moved `.app-inner` while the page behind it stayed white. What it may
       not do is carry a second LITERAL: a hard value there would survive a
       palette change and paint the wrong canvas in one mode. */
    const literals: string[] = [];
    for (const { file, text } of scssFiles()) {
      for (const match of stripped(text).matchAll(/^\s*--bg-store\s*:\s*([^;]+);/gm)) {
        if (!/^(var\(|calc\(|color-mix\()/.test(match[1].trim())) {
          literals.push(`${file}: ${match[1].trim()}`);
        }
      }
    }

    // the two literals are the day and night canvases, and both live in the
    // palette file — one per mode, which is the whole point of the split
    expect(literals).toEqual([
      'app/styles/01-settings/global.scss: #ffffff',
      'app/styles/01-settings/global.scss: #0b0e14',
    ]);
  });

  it('the bridge re-points the store level in both modes', async () => {
    const sheet = await compile('01-settings/global-settings.scss');
    expect(declarations(sheet, 'html:not(.dark)')['--bg-store']).toBe(
      'var(--gs-canvas, #ffffff)'
    );
    expect(declarations(sheet, 'html.dark')['--bg-store']).toBe(
      'var(--gs-canvas-night, #0b0e14)'
    );
  });

  it('night mode flips the canvas at that one source', async () => {
    const night = declarations(await compile('01-settings/global.scss'), 'html.dark');

    expect(night['--bg-store']).toBe('#0b0e14');
    // and does not re-declare the legacy alias, which follows by reference
    expect(night['--bg-page']).toBeUndefined();
  });
});

/**
 * The merchant's global settings, as a contract.
 *
 * `storeSettings.test.ts` proves the resolver picks the right value.
 * This proves the value has somewhere to GO: a setting whose variable nothing
 * reads is a control that does nothing, and that is the failure this system
 * exists to prevent — not a wrong colour, an inert panel.
 */
describe('the global settings reach a real consumer', () => {
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('the settings layer is actually imported by the app stylesheet', () => {
    const app = fs.readFileSync(path.join(stylesRoot, 'app.scss'), 'utf8');
    expect(app).toContain("@import './01-settings/global-settings'");
    // after the token layer it re-points, before every component that reads it
    expect(app.indexOf("'./01-settings/tokens'")).toBeLessThan(
      app.indexOf("'./01-settings/global-settings'")
    );
  });

  it('the card role is a reference to the radius ramp, never a literal', async () => {
    const tokens = declarations(await compile('01-settings/tokens.scss'), ':root');

    // `--radius-card` must stay a pointer at `--radius-xl`, which is itself
    // `calc(22px * var(--radius-scale))`. A literal here would freeze the card
    // corner and stop `global_radius` from ever reaching it.
    expect(tokens['--radius-card']).toBe('var(--radius-xl)');
    expect(tokens['--radius-xl']).toMatch(/^calc\(22px \* var\(--radius-scale\)\)$/);
  });

  it('every scale in the token layer is multiplied by its hook', async () => {
    const tokens = declarations(await compile('01-settings/tokens.scss'), ':root');

    // The five multipliers are the whole mechanism: without them a setting has
    // no way to reach a token that was written as a fixed rem/px value.
    for (const size of ['--fs-xs', '--fs-sm', '--fs-base', '--fs-lg', '--fs-2xl', '--fs-3xl']) {
      expect(tokens[size], size).toContain('var(--type-scale)');
    }
    for (const lh of ['--lh-tight', '--lh-snug', '--lh-normal', '--lh-loose']) {
      expect(tokens[lh], lh).toContain('var(--line-scale)');
    }
    for (const space of ['--space-1', '--space-4', '--space-8', '--space-20']) {
      expect(tokens[space], space).toContain('var(--density)');
    }
    for (const radius of ['--radius-sm', '--radius-md', '--radius-lg', '--radius-2xl']) {
      expect(tokens[radius], radius).toContain('var(--radius-scale)');
    }
    for (const motion of ['--motion-fast', '--motion-base', '--motion-slow']) {
      expect(tokens[motion], motion).toContain('var(--motion-scale)');
    }
    // a pill is a shape, not a corner size: it must NOT collapse with the ramp
    expect(tokens['--radius-full']).toBe('999px');
  });

  it('the Tailwind utilities read the same hooks, so `@apply` follows the panel', () => {
    const config = fs.readFileSync(path.join(themeRoot, 'tailwind.config.cjs'), 'utf8');

    // this is what makes one setting reach ~740 `@apply` call sites instead of
    // the handful of rules that read `var(--fs-*)` by hand
    expect(config).toContain("'--type-scale'");
    expect(config).toContain("'--line-scale'");
    expect(config).toContain("'--density'");
    expect(config).toContain('var(--radius-scale, 1)');
    expect(config).toContain("'--motion-scale'");
    // and the role tokens, so `rounded`, `shadow` and the curves are one setting
    expect(config).toContain("DEFAULT: 'var(--shadow-card)'");
    expect(config).toContain("out: 'var(--ease-utility-out)'");
    // margin is deliberately NOT scaled — a negative margin utility would be
    // emitted as `-calc(...)`, which is not a valid length
    expect(config).not.toContain('margin: denseSpacing');
  });

  it('every --gs-* a component reads has a fallback', () => {
    // without the second argument a store that never opened the panel gets an
    // empty value — `border-radius:` with nothing after it — instead of the
    // token it shipped with.
    const offenders: string[] = [];
    const bare = /var\(\s*(--gs-[a-z-]+)\s*\)/g;

    for (const { file, text } of scssFiles()) {
      if (file.includes('/01-settings/')) continue;
      for (const match of strip(text).matchAll(bare)) {
        offenders.push(`${file}: ${match[1]}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('no stylesheet invents a --gs-* value of its own', () => {
    // the only writer is `ThemeLayout`, inline, from `globalVars()`. A
    // stylesheet default would make "the merchant chose nothing" and "the
    // merchant chose the default" indistinguishable.
    const declaring = scssFiles()
      .filter(({ file, text }) => !file.includes('/01-settings/') && /^\s*--gs-[a-z-]+\s*:/m.test(strip(text)))
      .map(({ file }) => file);

    expect(declaring).toEqual([]);
  });

  it('the Selia shell — 34 blocks — reads the settings, not its own numbers', async () => {
    const selia = declarations(await compile('04-components/selia-base.scss'), '.selia');

    expect(selia['--selia-radius']).toMatch(/^var\(--gs-radius,/);
    expect(selia['--selia-max']).toMatch(/^var\(--gs-container,/);
    expect(selia['--selia-pad']).toMatch(/^var\(--gs-gutter,/);
    // the accent chain: merchant's global → Salla's own colour → Selia's default
    expect(selia['--selia-accent']).toMatch(/^var\(--gs-accent,\s*var\(--color-primary,/);
  });
});

/**
 * The palette bridge: `global_surface_preset`, `global_text_tone` and
 * `global_border_strength` re-point the semantic palette at the root.
 *
 * Three things can go wrong and none of them is visible in a screenshot:
 *
 *  1. The bridge leaks across modes. Each mode has its own chosen set
 *     (`#0b0e14` night canvas, `#f2f3f5` night ink, white-alpha hairlines), so
 *     a day-mode ivory canvas applied at night paints a bright band across a
 *     dark page, and a night ink applied by day is unreadable. Hence two rules,
 *     one per mode.
 *  2. The bridge goes MISSING in one mode. A store whose dashboard colour mode
 *     is dark then gets nothing from these three settings — the merchant picks
 *     "warm" and the storefront does not move, which is the definition of a
 *     fake control. Hence both modes are asserted.
 *  3. The `var()` fallbacks drift from the palette. They exist so an unset
 *     setting computes exactly what it computes today; if the palette moves and
 *     the copy does not, every store that never opened the panel shifts.
 */
describe('the palette bridge', () => {
  /* The palette is the one family that cannot be written inline on `<html>`:
     night mode is a VISITOR state (the header's moon/sun button flips
     `html.dark` at runtime), and an inline declaration out-ranks every
     stylesheet rule — so the store could never go dark again. Hence a
     stylesheet rule per mode instead of a value in the `style` attribute. */
  const DAY = 'html:not(.dark)';
  const NIGHT = 'html.dark';
  /** Role tokens the bridge composes rather than re-points. */
  const BRIDGE_COMPOSED = ['--surface-media', '--bg-block', '--elevation-card'];
  /** The one composed token that cannot live on the root — see the test below. */
  const SECTION_NIGHT = 'html.dark :where(.selia)';

  it('has a rule per mode, and no unscoped palette declaration anywhere', async () => {
    const root = await compile('01-settings/global-settings.scss');

    const selectors: string[] = [];
    root.walkRules((rule) => selectors.push(...rule.selectors));

    expect(selectors).toContain(DAY);
    expect(selectors).toContain(NIGHT);
    expect(selectors).toContain(SECTION_NIGHT);

    /* Every palette declaration must be MODE-SCOPED: a bare
       `:root { --surface-1: … }` would apply in both modes at once, which is
       the leak this whole split exists to prevent. A selector that is neither
       the mode rule itself nor a descendant of one is exactly that leak, so
       the predicate is "the selector starts with a mode", not "it is a mode".
       The `.app-inner` paint is not a token — it carries a `background-color`,
       so it is not matched here. */
    const modeScoped = (selector: string) =>
      selector === DAY || selector === NIGHT || selector.startsWith(`${DAY} `) || selector.startsWith(`${NIGHT} `);

    root.walkRules((rule) => {
      const touchesPalette: string[] = [];
      rule.walkDecls((decl) => {
        if (decl.prop.startsWith('--') && !decl.prop.startsWith('--gs-')) {
          touchesPalette.push(decl.prop);
        }
      });
      if (!touchesPalette.length) return;
      const scoped = rule.selectors.some(modeScoped);
      expect(scoped, `${rule.selector} writes ${touchesPalette.join(', ')}`).toBe(true);
    });
  });

  it('re-points every semantic palette token, in both modes', async () => {
    const root = await compile('01-settings/global-settings.scss');
    const day = declarations(root, DAY);
    const night = declarations(root, NIGHT);

    const tokens = [
      '--surface-1',
      '--surface-2',
      '--surface-3',
      '--ink-1',
      '--ink-2',
      '--ink-3',
      '--line-1',
      '--line-2',
      '--bg-page',
    ];
    for (const token of tokens) {
      expect(day[token], `day ${token}`).toMatch(/^var\(--gs-/);
      expect(night[token], `night ${token}`).toMatch(/^var\(--gs-/);
      // the two modes must read DIFFERENT variables, or the night face is just
      // the day face wearing a different name
      expect(night[token], `night ${token} reads the day value`).not.toBe(day[token]);
      expect(night[token], `night ${token} is not a night variable`).toContain('-night');
    }

    // the canvas is PAINTED on the element that covers the viewport, because
    // Tailwind gives `.app-inner` a hard white and a token alone would lose
    const inner = declarations(
      await compile('01-settings/global-settings.scss'),
      'html:not(.dark) .app-inner'
    );
    expect(inner['background-color']).toBe('var(--gs-canvas, var(--bg-store))');
  });

  it('every fallback is the value the palette already ships for that mode', async () => {
    /* The composed root, in the order `app.scss` imports it: the palette
       (`global.scss`), the roles built on it (`tokens.scss`), then the bridge
       itself. A fallback that drifts from this is a store that never opened
       the panel rendering something slightly different from what it shipped.

       Night is `:root` PLUS `html.dark` — the same element, so the cascade of
       one over the other is the night palette. Comparing against `html.dark`
       alone would fail on `--bg-page`, which follows `--bg-store` by reference
       and is therefore never re-declared. */
    const palette = await compile('01-settings/global.scss');
    const day = {
      ...declarations(palette, ':root'),
      ...declarations(await compile('01-settings/tokens.scss'), ':root'),
    };
    const night = { ...day, ...declarations(palette, 'html.dark') };

    const bridge = await compile('01-settings/global-settings.scss');
    const fallbackOf = (value: string) => {
      // `var(--gs-x, <fallback>)` — the fallback may itself contain parens
      const match = /^var\(\s*--gs-[a-z0-9-]+\s*,\s*([\s\S]+)\)$/.exec(value.trim());
      return match?.[1].trim();
    };

    for (const [mode, expected] of [
      [DAY, day],
      [NIGHT, night],
    ] as const) {
      const compared: string[] = [];
      for (const [token, value] of Object.entries(declarations(bridge, mode))) {
        if (!token.startsWith('--')) continue;
        /* The bridge also COMPOSES two role tokens that the palette does not
           ship: `--surface-media` (the product-photo well) and `--bg-block`
           (a night-safe tint of a block's own colour). They are asserted on
           their own below — their fallbacks are a component's designed values,
           not the palette's, so comparing them to `:root` would be comparing
           the wrong two things. */
        if (BRIDGE_COMPOSED.includes(token)) continue;
        const fallback = fallbackOf(value);
        expect(fallback, `${mode} ${token} has no fallback`).toBeTruthy();
        expect(fallback, `${mode} ${token} drifted from the palette`).toBe(expected[token]);
        compared.push(token);
      }
      // the guard is worthless if it silently compared nothing
      expect(compared.length, mode).toBeGreaterThanOrEqual(9);
    }
  });

  it('the three role tokens it composes carry the designed values, per mode', async () => {
    const bridge = await compile('01-settings/global-settings.scss');
    const day = declarations(bridge, DAY);
    const night = declarations(bridge, NIGHT);

    /* The product-photo well. Day is the card's designed cream; night is the
       theme's own night `s2`. Both are literals here because the card's own
       `--pc-image-bg` is inline and cannot be mode-aware — so if these two
       drift, the card's photo well is the thing that shows it. */
    expect(day['--surface-media']).toBe('var(--gs-card-image-day, #f4ebdc)');
    expect(night['--surface-media']).toBe('var(--gs-card-image-night, #1b212c)');
    expect(night['--surface-media']).not.toBe(day['--surface-media']);

    /* The card elevation. The shadow override is one rule with one `var()`, so
       the mode has to be decided here — and the night half must be the night
       token, not the day one: the day ramp is the text ink at a low alpha, and
       at night that ink is near-white, so the card would glow. */
    expect(day['--elevation-card']).toBe('var(--shadow-card)');
    expect(night['--elevation-card']).toBe('var(--shadow-night)');
    expect(night['--elevation-card']).not.toBe(day['--elevation-card']);

    /* A block's own background colour is a literal the merchant picked by day.
       At night it becomes a low-alpha tint of itself, so the merchant's hue
       survives without painting a light band on a dark page. An unset colour
       mixes `transparent`, so the unset case paints nothing.

       It is declared on the SECTION and not on the root, because a custom
       property is substituted where it is DECLARED: on `html` the merchant's
       inline `--selia-bg` does not exist, so the mix would compute to
       `transparent` — a valid colour — and beat the `var(--bg-block, …)`
       fallback, deleting the merchant's colour at night instead of tinting it.
       This assertion is what stops someone "tidying" it back onto the root. */
    expect(day['--bg-block']).toBeUndefined();
    expect(night['--bg-block']).toBeUndefined();
    expect(declarations(bridge, SECTION_NIGHT)['--bg-block']).toBe(
      'color-mix(in srgb, var(--selia-bg, transparent) 16%, transparent)'
    );
    // and it must be NIGHT-only: a day tint would darken every merchant band
    expect(declarations(bridge, 'html:not(.dark) :where(.selia)')['--bg-block']).toBeUndefined();
  });

  it('still never writes a --gs-* value of its own', async () => {
    const root = await compile('01-settings/global-settings.scss');

    const written: string[] = [];
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--gs-')) written.push(decl.prop);
    });

    // `ThemeLayout` is the only writer; a stylesheet default would make "the
    // merchant chose nothing" and "the merchant chose the default" identical
    expect(written).toEqual([]);
  });
});

/**
 * The other half of the contract: the *inline* channel.
 *
 * `selia-base.scss` declaring `--selia-accent: var(--gs-accent, …)` is worth
 * nothing if a block also writes `--selia-accent` inline on the same element —
 * an inline declaration out-ranks the stylesheet rule, so the merchant's store
 * setting is replaced by whatever literal the component shipped with. That is
 * exactly how `global_accent_color` reached zero blocks and how an empty
 * background field painted a cream band on a night page.
 *
 * The rule these pin: **publish only what the merchant chose**. An empty field
 * publishes nothing and the stylesheet resolves the inheritance.
 */
describe('a block may not publish an inherited token as an inline literal', () => {
  const componentsRoot = path.join(themeRoot, 'app/components');

  function tsxFiles(dir = componentsRoot, out: Array<{ file: string; text: string }> = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) tsxFiles(full, out);
      else if (entry.name.endsWith('.tsx')) {
        out.push({ file: path.relative(themeRoot, full).replace(/\\/g, '/'), text: fs.readFileSync(full, 'utf8') });
      }
    }
    return out;
  }

  /** `vars['--selia-x'] = <expression>;` → the expression. */
  function inlineWrites(text: string, prop: string) {
    const clean = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const re = new RegExp(`vars\\[\\s*['"](${prop})['"]\\s*\\]\\s*=\\s*([^;]+);`, 'g');
    return Array.from(clean.matchAll(re), (m) => m[2].trim());
  }

  it('never writes a literal fallback for an inherited Selia token', () => {
    const offenders: string[] = [];
    const inherited = ['--selia-accent', '--selia-bg', '--selia-ink'];

    for (const { file, text } of tsxFiles()) {
      for (const prop of inherited) {
        for (const expr of inlineWrites(text, prop)) {
          // `a || '#fff'` is the bug: it makes "the merchant chose nothing"
          // indistinguishable from "the block chose cream".
          if (/\|\|\s*['"]/.test(expr)) offenders.push(`${file}: ${prop} = ${expr}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('never freezes the radius at a px literal other than the explicit 0', () => {
    const offenders: string[] = [];

    for (const { file, text } of tsxFiles()) {
      for (const expr of inlineWrites(text, '--selia-radius')) {
        // an explicit `0px` is a real override ("square corners"); any other
        // px value is the block deciding the store's radius for itself.
        if (/['"]\d+px['"]/.test(expr.replace(/['"]0px['"]/g, ''))) {
          offenders.push(`${file}: --selia-radius = ${expr}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('no component paints a background literal that a night page cannot flip', () => {
    const offenders: string[] = [];

    for (const { file, text } of tsxFiles()) {
      // the cream Selia ships as a *section* background. The theme's section
      // level is `transparent`, so this literal is a light band in dark mode.
      if (/#f6f4f0/i.test(text)) offenders.push(file);
    }

    expect(offenders).toEqual([]);
  });
});


/**
 * The two heading roles.
 *
 * `global_heading_font` and `global_heading_weight` are worth nothing if they
 * only reach the 34 ported Selia blocks: the engine's product names, page
 * titles and section headings are `<h1>`…`<h6>`, and a merchant who picks a
 * display face would see the block titles change and nothing else.
 *
 * The weight is the interesting half. The store ships TWO designed weights —
 * 700 on a block title, 600 on an engine heading — so `--fw-heading` carries no
 * `:root` default at all: each surface owns its own fallback, and the setting
 * unifies them only when the merchant asks. A single `:root` default would have
 * silently re-weighted one family the moment the other was wired up.
 */
describe('the heading roles reach every heading in the store', () => {
  const read = (file: string) => fs.readFileSync(path.join(stylesRoot, file), 'utf8');
  /* comments out of the way: the rules below are documented, and a commented
     `font-weight: 600` would otherwise satisfy the assertion it documents */
  const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  /** the body of a rule, without its comments */
  const ruleBody = (text: string, selector: string) => {
    const start = text.indexOf(selector);
    expect(start, `${selector} not found`).toBeGreaterThanOrEqual(0);
    const open = text.indexOf('{', start);
    const close = text.indexOf('}', open);
    return strip(text.slice(open + 1, close));
  };

  it('the engine heading elements read both roles', () => {
    const body = ruleBody(read('02-generic/reset.scss'), 'h1, .h1,');
    expect(body).toContain('font-family: var(--font-heading)');
    // 600 is what this rule shipped with, and it is the fallback — not a
    // `:root` default that would have applied to the block titles too
    expect(body).toContain('font-weight: var(--fw-heading, 600)');
  });

  it('the block titles read both roles, with their own shipped weight', () => {
    const body = ruleBody(read('04-components/selia-base.scss'), '.selia__title');
    expect(body).toContain('font-family: var(--font-heading)');
    expect(body).toContain('font-weight: var(--fw-heading, 700)');
  });

  it('`--fw-heading` has no root default, so neither family is re-weighted', async () => {
    const root = declarations(await compile('01-settings/tokens.scss'), ':root');
    expect(root['--fw-heading']).toBeUndefined();
  });

  it('`--font-heading` does have one, and it is the store’s own face', async () => {
    const root = declarations(await compile('01-settings/tokens.scss'), ':root');
    // an untouched panel must compute exactly what it computed before: the
    // engine writes `--font-main`, and the role follows it
    expect(root['--font-heading']).toBe(
      'var(--font-main, system-ui, -apple-system, \'Segoe UI\', sans-serif)'
    );
  });
});
