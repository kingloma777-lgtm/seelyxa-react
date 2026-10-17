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

describe('curtain mega menu invariants (ported from the Twig theme)', () => {
  it('visibility is owned by `hidden` alone — hover bridge re-enables the gap', async () => {
    const root = await compile('morph-header.scss');

    expect(declarations(root, '.morph-curtain[hidden]')['display']).toBe('none');
    const rootCurtain = declarations(root, '.morph-curtain');
    expect(rootCurtain['top']).toBe('100%');
    expect(rootCurtain['pointer-events']).toBe('none');
    // the bridge: the pointer must be able to cross the 8px gap without
    // leaving the header element, or the panel flashes and vanishes
    const bridge = declarations(root, '.morph-curtain::before');
    expect(bridge['top']).toBe('-10px');
    expect(bridge['height']).toBe('20px');
    expect(bridge['pointer-events']).toBe('auto');
  });

  it('the panel is near-full-width but capped, and it scrolls not runs off-screen', async () => {
    const root = await compile('morph-header.scss');

    const panel = declarations(root, '.morph-curtain__panel');
    // sass keeps `min()` flat — the nested `calc` wrapper is resolved out
    expect(panel['max-width']).toBe('min(104rem, 100vw - 24px)');
    expect(panel['max-height']).toBe('calc(100vh - 96px)');
    expect(panel['overflow-y']).toBe('auto');
    expect(panel['backdrop-filter']).toContain('blur(26px)');
  });

  it('the layer split is the merchant contract: two thirds subcategories, one third everything else', async () => {
    const root = await compile('morph-header.scss');

    // last-wins collect across base + min-width rules
    expect(declarations(root, '.morph-curtain__layers')['grid-template-columns']).toBe('2fr 1fr');
    // the discs grid keeps its 84px minimum cell
    expect(declarations(root, '.morph-layer__grid')['grid-template-columns']).toBe(
      'repeat(auto-fill, minmax(84px, 1fr))'
    );
  });

  it('the slot layer alone centres its content (attribute-scoped, label never moves)', async () => {
    const root = await compile('morph-header.scss');

    const centre = declarations(
      root,
      '.morph-layer[data-morph-dyn=slot] > *:not(.morph-layer__label)'
    );
    expect(centre['margin-block']).toBe('auto');
  });

  it('subcategory discs are the 54px circle (one size, no ladder)', async () => {
    const root = await compile('morph-header.scss');

    const disc = declarations(root, '.morph-node--2 .morph-node__disc');
    expect(disc['width']).toBe('54px');
    expect(disc['height']).toBe('54px');
    // the round clip lives on the shared __disc rule (sass flattens the parent)
    expect(declarations(root, '.morph-node__disc')['border-radius']).toBe('999px');
    expect(declarations(root, '.morph-node--2 .morph-node__name')['font-size']).toBe('11px');
  });

  it('the featured row is FOUR cards on one 4-column track', async () => {
    const root = await compile('morph-header.scss');

    expect(declarations(root, '.morph-featured .morph-featured__list')['grid-template-columns']).toBe(
      'repeat(4, minmax(0, 1fr))'
    );
  });

  it('the platform card is clamped + centred with a SQUARE picture — the height half of the pair', async () => {
    const root = await compile('morph-header.scss');

    const card = declarations(root, '.morph-featured .s-product-card-vertical');
    expect(card['max-width']).toBe('190px');
    expect(card['justify-self']).toBe('center');

    const image = declarations(root, '.morph-featured .s-product-card-vertical .s-product-card-image');
    expect(image['aspect-ratio']).toBe('1/1');
    expect(image['border-radius']).toBe('0');
  });

  it('the dark curtain keeps its own surfaces', async () => {
    const root = await compile('morph-header.scss');

    const panel = declarations(root, 'html.dark .morph-curtain__panel');
    expect(panel['border-color']).toBe('rgba(255, 255, 255, 0.14)');
    expect(panel['background']).toContain('#14181f');

    const featured = declarations(root, 'html.dark .morph-featured');
    expect(featured['background']).toBe('#191e26');

    const entry = declarations(
      root,
      'html.dark .morph-featured .s-product-card-vertical .s-product-card-entry'
    );
    expect(entry['background']).toBe('#20262f');
  });
});
