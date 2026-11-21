// @vitest-environment node
/**
 * The store-wide standard, as assertions.
 *
 * Three of its clauses are cheap to verify and expensive to regress silently:
 *
 *   1. **Direction** — an arrow drawn for Arabic must mirror in English, or the
 *      back button points forwards for half the shoppers.
 *   2. **Motion** — a shopper who asked for less motion must not get a
 *      travelling band or a pulsing skeleton.
 *   3. **One palette** — the semantic tokens must exist and the night theme
 *      must flip them in ONE place, never per component.
 *
 * The rest of the standard (token coverage, fluid sizing) is measured by
 * `scripts/audit-design-system.cjs`, which counts rather than asserts.
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

/** Every rule whose selector matches `predicate`, flattened. */
function rules(root: Root, predicate: (selector: string) => boolean) {
  const found: { selector: string; decls: Record<string, string> }[] = [];
  root.walkRules((rule) => {
    rule.selectors.forEach((selector) => {
      if (!predicate(selector)) return;
      const decls: Record<string, string> = {};
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
      found.push({ selector, decls });
    });
  });
  return found;
}

/** Rules that sit INSIDE an `@media (prefers-reduced-motion: reduce)` block. */
function reducedRules(root: Root, needle: string) {
  const found: { selector: string; decls: Record<string, string> }[] = [];
  root.walkAtRules('media', (at) => {
    if (!at.params.includes('prefers-reduced-motion')) return;
    at.walkRules((rule) => {
      rule.selectors.forEach((selector) => {
        if (!selector.includes(needle)) return;
        const decls: Record<string, string> = {};
        rule.walkDecls((decl) => {
          decls[decl.prop] = decl.value;
        });
        found.push({ selector, decls });
      });
    });
  });
  return found;
}

/** Sass drops the quotes: `[dir='ltr']` compiles to `[dir=ltr]`. */
const LTR = /\[dir=['"]?ltr['"]?\]/;

/** Is there a rule that flips this element's glyph when the page is LTR? */
function mirrored(root: Root, needle: string) {
  return rules(root, (s) => s.includes(needle) && LTR.test(s) && s.includes('svg')).some((r) =>
    (r.decls['transform'] ?? '').includes('scaleX(-1)')
  );
}

describe('direction — a glyph drawn for Arabic mirrors in English', () => {
  it('the mobile page-title back button points back in both languages', async () => {
    expect(mirrored(await compile('04-components/mobile-page-title.scss'), '.mobile-page-title__back')).toBe(
      true
    );
  });

  it('the product gallery back button mirrors — and only the back one', async () => {
    const root = await compile('04-components/product.scss');
    expect(mirrored(root, '.is-back')).toBe(true);
    // the share and wishlist buttons share `.product-gallery__bar-btn`; their
    // glyphs are not directional, so the mirror must be scoped to `.is-back`
    const blanket = rules(
      root,
      (s) => s.includes('.product-gallery__bar-btn svg') && LTR.test(s)
    );
    expect(blanket).toHaveLength(0);
  });
});

describe('motion — a shopper who asked for less gets less', () => {
  it('the decorative entrances finish instantly, the spinner keeps turning', async () => {
    const root = await compile('02-generic/common.scss');

    // decorative: the end state at once
    for (const cls of ['.pulse-anime', '.slide-in-start', '.scale-pulse']) {
      expect(reducedRules(root, cls).length, cls).toBeGreaterThan(0);
    }
    // functional: still turning, just slowly — a frozen spinner reads as a
    // frozen store
    const spinner = reducedRules(root, '.loader:before')[0];
    expect(spinner.decls['animation-duration']).toBe('3s');
  });

  it('the utility entrances and the skeleton shimmer are neutralised', async () => {
    const animations = await compile('02-generic/animations.scss');
    expect(reducedRules(animations, '.fadeInDown').length).toBeGreaterThan(0);

    const common = await compile('02-generic/common.scss');
    const shimmer = reducedRules(common, '.s-skeleton-pulse')[0];
    expect(shimmer?.decls['animation']).toBe('none');
  });
});

describe('one palette — tokens are declared once, night flips them once', () => {
  it('the semantic surface/ink tokens exist on :root and are re-declared in html.dark', async () => {
    const root = await compile('01-settings/global.scss');
    // `--bg-page` is an alias of `--bg-store` (see tokens.test.ts), so the
    // canvas token that actually flips is the store level
    const required = ['--bg-store', '--surface-1', '--surface-2', '--ink-1', '--ink-2', '--ink-3', '--line-1'];

    const rootDecls = rules(root, (s) => s === ':root')[0]?.decls ?? {};
    const darkDecls = rules(root, (s) => s === 'html.dark')[0]?.decls ?? {};

    for (const token of required) {
      expect(rootDecls[token], `${token} on :root`).toBeTruthy();
      expect(darkDecls[token], `${token} flipped in html.dark`).toBeTruthy();
    }
  });

  it('a component never declares its own copy of a semantic token', async () => {
    // a token re-declared inside a component shadows the store's and the
    // merchant's setting stops arriving
    for (const file of ['04-components/product-card.scss', '04-components/morph-header.scss']) {
      const root = await compile(file);
      const own = rules(root, (s) => s.includes('--bg-page') || s.includes('--surface-1'));
      expect(own, file).toHaveLength(0);
    }
  });

  it('type roles are tokens, not family literals repeated per block', async () => {
    const settings = await compile('01-settings/tokens.scss');
    const rootDecls = rules(settings, (s) => s === ':root')[0]?.decls ?? {};
    // both roles exist with the exact stack they replaced, so the swap is
    // invisible until a merchant overrides them
    expect(rootDecls['--font-display']).toBe("'Playfair Display', Georgia, serif");
    expect(rootDecls['--font-mono']).toBe('ui-monospace, SFMono-Regular, Menlo, monospace');

    for (const file of [
      '04-components/selia-cathero.scss',
      '04-components/selia-contact.scss',
      '04-components/morph-header.scss',
    ]) {
      const root = await compile(file);
      const literals = rules(root, (s) => true).filter((r) =>
        Object.entries(r.decls).some(
          ([prop, value]) =>
            prop === 'font-family' &&
            (value.includes('Playfair Display') ||
              value.includes('SFMono-Regular'))
        )
      );
      expect(literals, file).toHaveLength(0);
    }
  });
});
