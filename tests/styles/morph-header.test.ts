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
    expect(panel['max-height']).toBe('min(80vh, 100vh - 96px)');
    expect(panel['overflow-y']).toBe('auto');
    expect(panel['backdrop-filter']).toContain('blur(26px)');
  });

  it('the layer split is the merchant contract: two thirds subcategories, one third everything else', async () => {
    const root = await compile('morph-header.scss');

    // last-wins collect across base + min-width rules
    expect(declarations(root, '.morph-curtain__layers')['grid-template-columns']).toBe('2fr 1fr');
    // the discs grid keeps a cell floor that fits the 88px disc + its name
    expect(declarations(root, '.morph-layer__grid')['grid-template-columns']).toBe(
      'repeat(auto-fill, minmax(108px, 1fr))'
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

  it('subcategory nodes are ONE circle size holding the picture, name beneath', async () => {
    const root = await compile('morph-header.scss');

    // the merchant asked for a circle with the category picture inside and the
    // name under it — same size for every node, no per-level ladder
    const disc = declarations(root, '.morph-node--2 .morph-node__disc');
    expect(disc['width']).toBe('88px');
    expect(disc['height']).toBe('88px');
    expect(disc['aspect-ratio']).toBe('1');
    // the round clip lives on the shared __disc rule (sass flattens the parent)
    expect(declarations(root, '.morph-node__disc')['border-radius']).toBe('999px');
    // the name sits UNDER the disc: no tile foot padding, its own line box
    const name = declarations(root, '.morph-node--2 .morph-node__name');
    expect(name['font-size']).toBe('12px');
    expect(name['padding']).toBe('0');
    // hover = lift + ink ring + name ink, one gesture for the three
    const hover = declarations(root, '.morph-node--2:hover .morph-node__disc');
    expect(hover['transform']).toContain('scale(1.04)');
    expect(hover['box-shadow']).toContain('var(--morph-ink)');
  });

  it('the featured row is FOUR capped tracks, centred with a tight gap', async () => {
    const root = await compile('morph-header.scss');

    const list = declarations(root, '.morph-featured .morph-featured__list');
    // `1fr` tracks across the whole rectangle left ~150px of air BETWEEN
    // neighbouring cards; capped tracks + centring keep the gap constant and
    // push the leftover width out to symmetric margins
    expect(list['grid-template-columns']).toBe('repeat(4, minmax(0, 210px))');
    expect(list['justify-content']).toBe('center');
    expect(list['gap']).toBe('16px');
    // the card fills its track, so the row is actually 4×210 wide
    expect(declarations(root, '.morph-featured .morph-menu-card')['max-width']).toBe('210px');
  });

  it('the platform card is clamped + centred with a SQUARE picture — the height half of the pair', async () => {
    const root = await compile('morph-header.scss');

    const card = declarations(root, '.morph-featured .s-product-card-vertical');
    // the loading ghosts wear the real card's footprint, or the row jumps
    // size when the products land
    expect(card['max-width']).toBe('210px');
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

describe('one-line nav fit invariants («المزيد» keeps links off the brand/actions)', () => {
  it('hides the measurement probe invisibly but layable', async () => {
    const root = await compile('morph-header.scss');

    const probe = declarations(root, '.morph-nav__probe');
    expect(probe['position']).toBe('absolute');
    expect(probe['visibility']).toBe('hidden');
    expect(probe['pointer-events']).toBe('none');
    expect(probe['display']).toBe('flex');
  });

  it('keeps the nav one-line-safe: the row can shrink, centered, tiny gap', async () => {
    const root = await compile('morph-header.scss');

    const nav = declarations(root, '.morph-pill__nav');
    expect(nav['flex']).toContain('1 1 auto');
    expect(nav['min-width']).toBe('0');
    expect(nav['justify-content']).toBe('center');
    expect(nav['gap']).toBe('2px');
  });
});

describe('phone screens + account takeover invariants', () => {
  /* The takeover is a `position: fixed`, viewport-sized panel rendered INSIDE
     the 38px account disc. The disc clips (overflow) and its backdrop-filter
     makes it the containing block, so while the panel is open both have to go
     or the screen renders as a sliver pinned to the chip — measured live as a
     40×140 box instead of 390×844, which is what "clicking does nothing" was. */
  it('the account disc stops clipping / containing the takeover while it is open', async () => {
    const root = await compile('morph-header.scss');

    const host = declarations(
      root,
      '.morph-header .morph-pill salla-user-menu:has(.s-user-menu-toggler.opened)'
    );
    expect(host['overflow']).toBe('visible');
    expect(host['backdrop-filter']).toBe('none');
  });

  /* The phone's bottom bar is z-220 and paints over every overlay, so the two
     morph screens must end above it. Before this the index's theme chip sat at
     y 772–810 inside the bar's 780–844 — the chip existed, but only 8px of it
     was visible, which reads as "no dark-mode toggle on the phone". */
  it('both morph screens give the phone bottom bar its 64px band back', async () => {
    const root = await compile('morph-header.scss');
    // Sass folds the arithmetic, so the band reads `calc(<n>px + var(--safe-bottom))`
    const band = (value: string) => {
      const match = /calc\((\d+)px \+ var\(--safe-bottom\)\)/.exec(value ?? '');
      expect(match, `expected a bottom-bar band, got "${value}"`).toBeTruthy();
      return Number(match![1]);
    };

    expect(band(declarations(root, '.morph-overlay__inner')['padding-bottom'])).toBeGreaterThanOrEqual(64);
    expect(
      band(
        declarations(root, '.morph-pill salla-user-menu .s-user-menu-dropdown')['padding-bottom']
      )
    ).toBeGreaterThanOrEqual(64);
    expect(band(declarations(root, '.morph-account-foot')['bottom'])).toBeGreaterThanOrEqual(64);
  });

  /* Bands must keep their own height: the index nav is a flex column, so the
     default shrink squeezed 23 rows into 27px each while their label is 29px
     and every row clipped on top of the next. */
  it('index rows do not shrink below their label; the nav scrolls instead', async () => {
    const root = await compile('morph-header.scss');

    const row = declarations(root, '.morph-overlay__row');
    expect(row['flex']).toBe('0 0 auto');
  });
});
