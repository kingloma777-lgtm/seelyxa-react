// @vitest-environment node
/**
 * The token layer, as a contract.
 *
 * The merchant's ask was architectural: one central system, and — explicitly —
 * three background levels (store → section → card) that are *allowed to
 * differ* but must inherit in a clear direction. These assertions pin that
 * chain down, because it is the kind of rule that rots silently: one block
 * setting `background: #fff` on its own is enough to break the model, and
 * nothing looks wrong until the merchant changes the store canvas.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/${file}`);
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

describe('the token layer covers every category the system promises', () => {
  it('declares type, background, radius, elevation, spacing, layout and motion', async () => {
    const root = await compile('01-settings/tokens.scss');
    const t = declarations(root, ':root');

    // type roles + scale
    for (const token of ['--font-body', '--font-heading', '--font-display', '--font-mono'])
      expect(t[token], token).toBeTruthy();
    for (const token of ['--fs-xs', '--fs-base', '--fs-3xl'])
      expect(t[token], token).toBeTruthy();
    // every step of the scale is multiplied by its hook — see token-contract
    expect(t['--lh-normal']).toBe('calc(1.6 * var(--line-scale))');
    expect(t['--ls-eyebrow']).toBe('0.24em');

    // background levels
    expect(t['--bg-section']).toBe('transparent');
    expect(t['--bg-card-soft']).toBe('var(--surface-2)');

    // status: one red family, three roles — the store used to carry four
    // unrelated reds for the same meaning
    expect(t['--danger']).toBe('#dc2626');
    expect(t['--danger-on-ink']).toBe('#ff443a');
    expect(t['--danger-soft']).toBe('#fdeeee');

    // radius scale + role aliases
    for (const token of ['--radius-sm', '--radius-md', '--radius-xl', '--radius-full'])
      expect(t[token], token).toBeTruthy();
    expect(t['--radius-card']).toBe('var(--radius-xl)');
    // `--radius-button` and `--radius-media` have NO shipped default on
    // purpose: each button/media surface carries its own, so one number
    // cannot flatten three designed shapes. They exist only when set.
    expect(t['--radius-button']).toBeUndefined();
    expect(t['--radius-media']).toBeUndefined();

    // elevation: one ink, several weights
    for (const token of ['--shadow-sm', '--shadow-md', '--shadow-lg'])
      expect(t[token], token).toContain('var(--ink-1)');
    // the value 221 bare `shadow` utilities paint today
    expect(t['--shadow-card']).toBe('5px 10px 30px #2b2d340d');

    // spacing / layout
    expect(t['--space-1']).toBe('calc(4px * var(--density))');
    expect(t['--space-16']).toBe('calc(64px * var(--density))');
    expect(t['--container-max']).toBe('1440px');
    expect(t['--gutter']).toContain('clamp(');

    // motion: durations, curves and the standard travel
    for (const token of ['--motion-fast', '--motion-base', '--motion-slow'])
      expect(t[token], token).toBeTruthy();
    for (const token of ['--ease-out', '--ease-in-out', '--ease-spring'])
      expect(t[token], token).toContain('cubic-bezier(');
    expect(t['--motion-distance']).toBe('24px');
  });
});

describe('store → section → card: one direction of inheritance', () => {
  it('the STORE canvas is one token, flipped once at night', async () => {
    const root = await compile('01-settings/global.scss');

    const day = declarations(root, ':root');
    expect(day['--bg-store']).toBe('#ffffff');
    // `--bg-page` is the legacy alias, not a second literal — every existing
    // rule keeps working without being rewritten
    expect(day['--bg-page']).toBe('var(--bg-store)');

    const night = declarations(root, 'html.dark');
    expect(night['--bg-store']).toBe('#0b0e14');
    // the canvas is decided in ONE place; a second declaration here would be
    // a second source of truth that can drift from the alias
    expect(night['--bg-page']).toBeUndefined();
  });

  it('the SECTION level is transparent by default and paints itself from the token', async () => {
    const tokens = declarations(await compile('01-settings/tokens.scss'), ':root');
    // "show the store canvas through me" — the default every block gets free
    expect(tokens['--bg-section']).toBe('transparent');

    const common = await compile('02-generic/common.scss');
    expect(declarations(common, '.s-block')['background-color']).toBe(
      'var(--bg-section, transparent)'
    );
  });

  it('the STORE canvas is actually painted — one declaration retints the site', async () => {
    const common = await compile('02-generic/common.scss');
    // without this the canvas was the UA's white and `--bg-store` did nothing
    // in day mode; because sections are transparent, this one rule is enough
    expect(declarations(common, 'body')['background-color']).toBe('var(--bg-store, #fff)');
  });

  it('night mode does not flatten a band the merchant set', async () => {
    const dark = await compile('02-generic/dark.scss');
    // the old rule was a hard `background: transparent` on every block, which
    // silently erased `--bg-section` after dark
    expect(declarations(dark, 'html.dark .s-block')['background-color']).toBe(
      'var(--bg-section, transparent)'
    );
  });

  it('the CARD level resolves the merchant card colour where it is written', async () => {
    const root = await compile('04-components/product-card.scss');
    const inner = declarations(root, '.app-inner');

    // `--pc-bg` is written INLINE on this element by ThemeLayout, so the card
    // level has to be declared on the same element — on `:root` the reference
    // would resolve where `--pc-bg` does not exist
    expect(inner['--pc-bg']).toBe('#fdfaf3');
    expect(inner['--bg-card']).toBe('var(--pc-bg)');
  });

  it('a component consumes the LEVEL, never a literal of its own', async () => {
    const root = await compile('04-components/morph-header.scss');
    const card = declarations(root, '.morph-featured .morph-menu-card');
    // the mega card reads the card level, so a section that retints its cards
    // reaches the header too
    expect(card['background']).toBe('var(--bg-card, #fdfaf3)');
  });

  it('the header spends the house curves instead of its own copies', async () => {
    const root = await compile('04-components/morph-header.scss');
    const header = declarations(root, '.morph-header');
    expect(header['--morph-ease']).toBe('var(--ease-out)');
    expect(header['--morph-spring']).toBe('var(--ease-spring)');
  });

  it('a block with its own spectrum declares it once, not at every site', async () => {
    const root = await compile('04-components/stats-orbit.scss');
    const scope = declarations(root, '.stats-orbit');

    // the orb's jewel palette: nine rules used to repeat these literals
    expect(scope['--orbit-arc']).toBe('#a9e06a');
    expect(scope['--orbit-sphere-1']).toBe('#cdeb96');
    expect(scope['--orbit-up-bg']).toBe('#c9f26c');

    // and no rule below re-states one of them
    const palette = /#a9e06a|#cdeb96|#86bd57|#4b7c36|#24451f|#0d1c0d|#c9f26c|#17280b|#d6453a|#c8402f|#9ed35e|#d9f792|#b8e86a/;
    const literals = [];
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--orbit-')) return;
      if (palette.test(decl.value)) literals.push(`${decl.prop}: ${decl.value}`);
    });
    expect(literals).toEqual([]);
  });
});
