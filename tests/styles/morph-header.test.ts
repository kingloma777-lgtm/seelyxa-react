// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/04-components/${file}`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

/** The declarations of the first rule whose selectors exactly include `selector`. */
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

describe('morph-header.scss invariants (ported from the Twig theme)', () => {
  it('morphs the pill on the single scrolled boolean', async () => {
    const root = await compile('morph-header.scss');

    const scrolled = declarations(root, '.morph-header.is-scrolled .morph-pill');
    expect(scrolled['max-width']).toBe('880px');
    expect(scrolled['border-radius']).toBe('999px');
    expect(scrolled['background-color']).toContain('var(--morph-glass)');
    // the blur lives on the pill only (fixed descendants keep the viewport as
    // their containing block while the takeover is open)
    expect(scrolled['backdrop-filter']).toContain('blur(var(--morph-blur');
  });

  it('the blob never transitions its translate (it must follow the cursor)', async () => {
    const root = await compile('morph-header.scss');

    const blob = declarations(root, '.morph-blob');
    expect(blob['transition']).toBeTruthy();
    // `translate` is written per-frame by the component; sliding it would
    // fight the eased transform (old morph-header.js rule 25)
    expect(blob['transition']).not.toMatch(/(^|,)\s*translate[\s,]/);
    expect(blob['transition']).toContain('transform 0.5s var(--morph-ease)');
  });

  it('keeps the hero scrim gated on data-morph-lift, desktop only', async () => {
    const root = await compile('morph-header.scss');

    const scrim = declarations(root, 'html[data-morph-lift="1"] .morph-header:not(.is-scrolled)::before');
    // the scrim is the themed ::before — a gradient legibility wash under the
    // frosted pill, present only while the first block opted in and unscrolled
    expect(scrim.content).toBe('""');
    expect(scrim.background).toContain('linear-gradient');
  });

  it('drops the pill blur while the account takeover is open', async () => {
    const root = await compile('morph-header.scss');

    const open = declarations(
      root,
      '.morph-header .morph-pill:has(.s-user-menu-toggler.opened)'
    );
    expect(open['backdrop-filter']).toBe('none');
  });

  it('the dark overrides keep the scrim text white on both sides', async () => {
    const root = await compile('morph-header.scss');

    const dark = declarations(root, 'html.dark .morph-header');
    expect(dark['--morph-fg']).toBe('#e8eaf0');
    expect(dark['--morph-glass-color']).toBe('#1a1f28');

    const scrim = declarations(
      root,
      'html.dark[data-morph-lift="1"] .morph-header:not(.is-scrolled)'
    );
    expect(scrim['--morph-fg']).toBe('#ffffff');
  });
});
