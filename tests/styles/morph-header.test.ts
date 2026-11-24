// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll } from 'vitest';
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

/* One compile for the whole file. Sass + Tailwind is ~200ms, and every `it`
   below used to pay it again — 30 compiles pushed the first test past the 5s
   default timeout whenever the suite ran in parallel. The AST is read-only
   here, so a shared one is safe. */
let compiled: Promise<Root> | null = null;
const css = () => (compiled ??= compile('morph-header.scss'));

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

/** Declarations from the unconditionally-applied rule only (no @media copy). */
function baseDeclarations(root: Root, selector: string): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' || !rule.selectors.includes(selector)) return;
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.value;
    });
  });
  return decls;
}

/** Declarations inside a named `@media` block (PostCSS keeps the at-rule as
 *  a parent, so the media params are not part of `rule.selector`). */
function mediaDeclarations(
  root: Root,
  params: string,
  selector: string
): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkAtRules('media', (atRule) => {
    if (atRule.params !== params) return;
    atRule.walkRules((rule) => {
      if (rule.selectors.includes(selector)) {
        rule.walkDecls((decl) => {
          decls[decl.prop] = decl.value;
        });
      }
    });
  });
  return decls;
}

/** The same, for the OPT-IN layout: only rules gated by `data-morph-mega`.
 *  Exact selector match, so an unqualified classic rule can never answer a
 *  showcase assertion (the two layouts must be verified independently). */
function showcaseDeclarations(root: Root, selector: string): Record<string, string> {
  const qualified = `.morph-header[data-morph-mega=showcase] ${selector}`;
  const decls: Record<string, string> = {};
  root.walkRules((rule) => {
    if (rule.selectors.includes(qualified)) {
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
    }
  });
  return decls;
}

describe('morph-header.scss invariants (ported from the Twig theme)', () => {
  /* The single Sass + Tailwind compile takes ~0.9s alone and several seconds
     when the whole suite runs in parallel — and whichever `it` runs first pays
     for it. Paying it here, off the clock, keeps the first assertion from
     timing out on a loaded machine (a false red, not a broken rule). */
  beforeAll(async () => {
    await css();
  }, 30000);

  it('morphs the pill on the single scrolled boolean', async () => {
    const root = await css();

    const scrolled = declarations(root, '.morph-header.is-scrolled .morph-pill');
    expect(scrolled['max-width']).toBe('880px');
    expect(scrolled['border-radius']).toBe('999px');
    expect(scrolled['background-color']).toContain('var(--morph-glass)');
    // the blur lives on the pill only (fixed descendants keep the viewport as
    // their containing block while the takeover is open)
    expect(scrolled['backdrop-filter']).toContain('blur(var(--morph-blur');
  });

  it('the blob never transitions its translate (it must follow the cursor)', async () => {
    const root = await css();

    const blob = declarations(root, '.morph-blob');
    expect(blob['transition']).toBeTruthy();
    // `translate` is written per-frame by the component; sliding it would
    // fight the eased transform (old morph-header.js rule 25)
    expect(blob['transition']).not.toMatch(/(^|,)\s*translate[\s,]/);
    /* the slide is still the house curve, now scaled by the store's motion
       speed so `global_motion_speed = off` really stops it (measured: the
       header's chrome kept its own seconds while every other surface obeyed) */
    expect(blob['transition']).toContain('transform calc(500ms * var(--motion-scale)) var(--morph-ease)');
  });

  it('keeps the hero scrim gated on data-morph-lift, desktop only', async () => {
    const root = await css();

    const scrim = declarations(root, 'html[data-morph-lift="1"] .morph-header:not(.is-scrolled)::before');
    // the scrim is the themed ::before — a gradient legibility wash under the
    // frosted pill, present only while the first block opted in and unscrolled
    expect(scrim.content).toBe('""');
    expect(scrim.background).toContain('linear-gradient');
  });

  it('declares a visible focus ring (reset.scss kills the browser default)', async () => {
    const root = await css();

    /* MEASURED FAILURE: `02-generic/reset.scss` ships `a:focus { outline: none }`,
       so every link in this header reported `outline-style: none` while focused.
       The ring is the merchant's accent when there is one, else Salla's primary,
       else the element's own ink — never a hardcoded hue. */
    const ring = declarations(root, '.morph-header :is(a, button, [tabindex]):focus-visible');
    expect(ring.outline).toContain('2px solid');
    expect(ring.outline).toContain('var(--gs-accent');

    /* the search field clips its own box, so its ring lives on the field */
    const field = declarations(root, '.morph-search__field:focus-within');
    expect(field.outline).toContain('2px solid');
  });

  it('swaps to the night logo without moving the row', async () => {
    const root = await css();

    /* MEASURED FAILURE: Salla ships one logo, and the demo store's navy wordmark
       sat on the night bar (#131820) at ~1.8:1 — legible on paper, unreadable on
       screen. A CSS filter would flatten a coloured brand, so the merchant may
       upload a light variant; the swap must be display-only, or the logo box
       would jump when the mode changes. */
    expect(declarations(root, '.morph-brand__logo--night').display).toBe('none');
    expect(
      declarations(root, 'html.dark .morph-brand .morph-brand__logo--night').display
    ).toBe('block');
    /* the day logo is hidden ONLY when a night variant exists — `:has()` is what
       keeps a store without the setting on its single logo */
    expect(
      declarations(
        root,
        'html.dark .morph-brand:has(.morph-brand__logo--night) .morph-brand__logo--day'
      ).display
    ).toBe('none');
    expect(
      declarations(root, 'html.dark .morph-brand .morph-brand__logo--day')
    ).toEqual({});
  });

  it('takes the collapsed search field out of the accessibility tree', async () => {
    const root = await css();

    /* MEASURED FAILURE: at 320–1024px the closed field measured 340px wide with
       193px of it off-canvas in RTL. `opacity: 0` hides it from the eye but not
       from a screen reader, so assistive tech met a search field that is nowhere
       on the screen. `visibility: hidden` removes the subtree from the a11y tree
       and from hit-testing; the delay keeps the collapse animation visible. */
    const closed = declarations(root, '.morph-search__field');
    expect(closed.visibility).toBe('hidden');
    expect(closed.transition).toContain('visibility 0s linear');

    /* and the open face must cancel the delay, or the field would stay invisible
       for the whole 400ms growth */
    const open = declarations(root, '.morph-search.is-open .morph-search__field');
    expect(open.visibility).toBe('visible');
    expect(open['transition-delay']).toBe('0s, 0s, 0s, 0s, 0s, 0s');
  });

  it('drops the pill blur while the account takeover is open', async () => {
    const root = await css();

    const open = declarations(
      root,
      '.morph-header .morph-pill:has(.s-user-menu-toggler.opened)'
    );
    expect(open['backdrop-filter']).toBe('none');
  });

  it('night mode inherits the store ink instead of overriding the merchant', async () => {
    const root = await css();

    /* The old contract forced `--morph-fg: #e8eaf0 !important` and
       `--morph-glass-color: #1a1f28 !important` at night, which silently threw
       away a merchant's header colours after sunset and made "inherit" a lie
       in both modes. The ink and the glass now resolve from the palette bridge
       (`--ink-1`, `--surface-1`), so this rule must NOT declare them. */
    const dark = declarations(root, 'html.dark .morph-header');
    expect(dark['--morph-fg']).toBeUndefined();
    expect(dark['--morph-glass-color']).toBeUndefined();

    const header = declarations(root, '.morph-header');
    expect(header['--morph-fg']).toBe('var(--ink-1, #0f172a)');
    expect(header['--morph-glass-color']).toBe('var(--surface-1, #ffffff)');

    /* the hero scrim keeps white ink over the merchant's picture in BOTH modes
       — there neither the store ink nor the header override is right */
    const scrim = declarations(
      root,
      'html.dark[data-morph-lift="1"] .morph-header:not(.is-scrolled)'
    );
    expect(scrim['--morph-fg']).toBe('#ffffff');
  });
});

describe('the two header shapes (`header_shape`)', () => {
  /* The shape is one attribute and nothing else: `MorphHeader` writes
     `data-morph-shape`, and every wide rule hangs off it. The capsule's own
     rules are NOT scoped to the attribute, which is what makes `pill` the
     zero-cost default — and what these tests protect. */
  const wide = '.morph-header[data-morph-shape=wide]';

  it('the wide bar is a two-row grid: brand on the centre line, nav beneath', async () => {
    const root = await css();

    const pill = declarations(root, `${wide} .morph-pill`);
    expect(pill.display).toBe('grid');
    // three columns with equal, shrinkable sides — that is what keeps the
    // logo centred even while the search field is expanded
    expect(pill['grid-template-columns']).toBe('minmax(0, 1fr) auto minmax(0, 1fr)');
    expect(pill['grid-template-areas']).toBe('"start brand end" "nav   nav   nav"');
    // a bar, not a capsule
    expect(pill['max-width']).toBe('1920px');
    expect(pill['border-radius']).toBeUndefined();

    expect(declarations(root, `${wide} .morph-pill__nav`)['grid-area']).toBe('nav');
    expect(declarations(root, `${wide} .morph-brand`)['grid-area']).toBe('brand');
  });

  it('flattens the capsule wrappers so the chips become grid items', async () => {
    const root = await css();

    // the lead (burger + brand) and the actions row are flex boxes in the
    // capsule; `display: contents` lets their children take the grid cells
    expect(declarations(root, `${wide} .morph-pill__lead`).display).toBe('contents');
    expect(declarations(root, `${wide} .morph-pill__actions`).display).toBe('contents');
    // …while the clusters themselves become the grid items
    expect(declarations(root, `${wide} .morph-actions`).display).toBe('flex');
  });

  it('sends each cluster to its own page edge', async () => {
    const root = await css();

    const start = declarations(root, `${wide} .morph-actions--start`);
    expect(start['grid-area']).toBe('start');
    expect(start['justify-self']).toBe('start');

    const end = declarations(root, `${wide} .morph-actions--end`);
    expect(end['grid-area']).toBe('end');
    expect(end['justify-self']).toBe('end');
  });

  it('the heart belongs to the wide bar only', async () => {
    const root = await css();

    // the capsule's row has no room for a fifth disc. The rule is scoped to
    // `.morph-pill` so it outranks `.morph-icon-btn`'s own `display: flex`
    // (a bare `.morph-wishlist` has the same weight and loses on source order).
    expect(declarations(root, '.morph-pill .morph-wishlist').display).toBe('none');
    expect(declarations(root, `${wide} .morph-wishlist`).display).toBe('flex');
  });

  it('compacts in place on scroll into a rounded, inset slab', async () => {
    const root = await css();

    const scrolled = declarations(root, `${wide}.is-scrolled .morph-pill`);
    // still the full-bleed max-width (not the capsule's 880px)…
    expect(scrolled['max-width']).toBe('1920px');
    /* The radius is the store's card corner, NOT `999px`. Measured at 1920px:
       a two-row slab with a half-height radius becomes a stadium whose curved
       ends eat the first and last nav item. The capsule keeps its 999px — that
       is what a capsule is. */
    expect(scrolled['border-radius']).toBe('var(--morph-panel-radius)');
    // the frost is the same promise as the capsule's
    expect(scrolled['background-color']).toContain('var(--morph-glass)');
    expect(scrolled['backdrop-filter']).toContain('blur(var(--morph-blur');
    // the gutter that makes it read as a slab rather than a full-bleed band
    expect(declarations(root, `${wide}.is-scrolled .morph-bar`)['padding-inline']).toBe('20px');
    // …and it keeps two tight rows by stepping the logo and the nav down
    /* 32px, not 38px: the scrolled slab is meant to read as "the bar got out
       of the way". Measured at the 1440 baseline it was 113.6px tall — a
       21px compaction on a 134.8px bar, which is a state change nobody can
       see. With the logo at 32 and the nav's hover pills giving back 2px, the
       scrolled slab lands at ~84px, a 30% drop that is legible as a state. */
    expect(declarations(root, `${wide}.is-scrolled .morph-brand img`)['max-height']).toBe('32px');
    expect(declarations(root, `${wide}.is-scrolled .morph-pill__nav`)['--morph-nav-size']).toBe('13px');
  });

  it('keeps the capsule’s rhythm: 24px page gutter, 16px between discs', async () => {
    const root = await css();

    /* The discs are the capsule's own, so the spacing has to be the capsule's
       too: a 24px page gutter to the first disc, then its 16px chip gap. If
       either drifts, the wide bar stops reading as the same design.
       The 12/8 vertical pair replaced 14/10 for a measured reason: the bar's
       own 10px gutter plus the pill's 14px top padding gave the logo row 24px
       of air above it against 10px below the menu row, so the two rows sat in
       the bar unevenly and the header measured 134.8px. 8px bar + 12px pill
       on top and 8px under the menu row is one rhythm, and the header is
       ~115px. The horizontal 24px is untouched — it is the page gutter. */
    expect(declarations(root, `${wide} .morph-pill`).padding).toBe('12px 24px 8px');
    // the base `.morph-actions` gap is only a fallback — both clusters pin it
    // (and the phone breakpoint re-gaps the capsule at 8px, so the wide block
    // is the only place this 16px is stated for the desktop row)
    expect(declarations(root, `${wide} .morph-actions--start`).gap).toBe('16px');
    expect(declarations(root, `${wide} .morph-actions--end`).gap).toBe('16px');
  });

  it('does not repaint a single chip — the two shapes share one design', async () => {
    const root = await css();

    /* The merchant's rule: the shapes differ in ARRANGEMENT only. So the wide
       block must not touch a chip's size, surface, ink or badge — every one of
       these lookups has to come back EMPTY. If one ever returns declarations,
       the wide bar has started drifting away from the capsule again (that is
       exactly how the "bare glyphs" pass broke it). */
    const untouched = [
      '.morph-icon-btn',
      '.morph-search',
      '.morph-search__toggle',
      '.morph-loco-btn',
      '.morph-slot--account salla-user-menu',
      '.morph-pill__actions salla-cart-summary .s-cart-summary-wrapper',
      '.morph-pill__actions salla-cart-summary .s-cart-summary-count',
      '.morph-pill__actions salla-cart-summary .s-cart-summary-wrapper .morph-cart-glyph',
    ];
    for (const sel of untouched) {
      expect(declarations(root, `${wide} ${sel}`), sel).toEqual({});
    }
  });

  it('keeps the capsule’s fixed chip order across the two clusters', async () => {
    const root = await css();

    /* The markup order is the WIDE order (utilities cluster first); the
       capsule flattens both clusters back into one row and restores its own
       order with `order`. If these numbers drift, the capsule silently
       re-arranges. */
    const order = (sel: string) =>
      declarations(root, `.morph-pill__actions > .morph-actions > ${sel}`).order;
    expect(order('.morph-loco-btn')).toBe('1');
    expect(order('.morph-bullet')).toBe('2');
    expect(order('.morph-search')).toBe('3');
    expect(order('.morph-theme-btn')).toBe('4');
    expect(order('.morph-slot--account')).toBe('5');
    expect(order('.morph-slot--cart')).toBe('6');
    expect(order('.morph-wishlist')).toBe('8');
  });

  it('orders the wide clusters from the page edge inward', async () => {
    const root = await css();

    // order 1 is the outermost item on both sides, because the row itself is
    // inline-start → inline-end (so this mirrors for free in RTL)
    expect(declarations(root, `${wide} .morph-actions--start > .morph-wishlist`).order).toBe('1');
    expect(declarations(root, `${wide} .morph-actions--start > .morph-search`).order).toBe('2');

    const endOrder = (sel: string) =>
      declarations(root, `${wide} .morph-actions--end > ${sel}`).order;
    expect(endOrder('.morph-theme-btn')).toBe('1');
    expect(endOrder('.morph-slot--account')).toBe('2');
    expect(endOrder('.morph-slot--cart')).toBe('3');
    expect(endOrder('.morph-loco-btn')).toBe('4');
    expect(endOrder('.morph-bullet')).toBe('5');
  });

  it('leaves the chips to the capsule — nothing is stripped', async () => {
    const root = await css();

    /* Regression guard for the pass that removed the surfaces: the wide bar
       once repainted every chip as a bare glyph (transparent background, no
       shadow, a 40px box, a 20px glyph) and re-pinned the cart badge. The
       capsule's own rules have to reach the wide bar untouched. */
    for (const sel of [
      '.morph-icon-btn',
      '.morph-slot--account salla-user-menu',
      '.morph-pill__actions salla-cart-summary .s-cart-summary-wrapper',
    ]) {
      expect(declarations(root, `${wide} ${sel}`), sel).toEqual({});
    }

    // the shared recipe the wide bar inherits verbatim
    expect(declarations(root, '.morph-icon-btn').background).toContain('var(--morph-chip-bg)');
    expect(declarations(root, '.morph-icon-btn')['border-radius']).toBe('999px');
    const cart = declarations(root, '.morph-pill__actions salla-cart-summary .s-cart-summary-wrapper');
    expect(cart.background).toContain('var(--morph-chip-bg)');
    expect(cart['box-shadow']).toContain('var(--morph-chip-shadow)');
  });
});

describe('curtain mega menu invariants (ported from the Twig theme)', () => {
  it('visibility is owned by `hidden` alone — hover bridge re-enables the gap', async () => {
    const root = await css();

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
    const root = await css();

    const panel = declarations(root, '.morph-curtain__panel');
    // sass keeps `min()` flat — the nested `calc` wrapper is resolved out
    expect(panel['max-width']).toBe('min(104rem, 100vw - 24px)');
    /* the cap reads the header's REAL height (`--salla-header-h`, published by
       MorphHeader's ResizeObserver): a guessed 96px left a 1280×640 laptop 12px
       short of the viewport. The dvh line is the last one, so it wins here. */
    expect(panel['max-height']).toContain('var(--salla-header-h');
    expect(panel['max-height']).toContain('100dvh');
    expect(panel['overflow-y']).toBe('auto');
    expect(panel['backdrop-filter']).toContain('blur(26px)');
  });

  it('the subcategory column is CAPPED, never a fixed height', async () => {
    const root = await css();

    /* Regression: `height: min(420px, 70vh - 160px)` turned a two-disc category
       into a 420px plate with 300px of nothing and pushed the featured row past
       the fold, so the whole mega menu had to scroll. */
    const column = declarations(root, '.morph-layer:not([data-morph-dyn=slot])');
    expect(column['height']).toBeUndefined();
    /* 440/140 now: the rail is a 38px-row list, so it holds two more rows than
       the 88px-disc grid did before the same cap bites. The cap's JOB is
       unchanged — the column hugs its rows and only scrolls when the category
       really has more children than the panel can show. */
    expect(column['max-height']).toBe('min(440px, 70vh - 140px)');
    // the grid hugs its rows and only shrinks when the cap bites
    expect(
      declarations(root, '.morph-layer:not([data-morph-dyn=slot]) .morph-layer__grid')['flex']
    ).toBe('0 1 auto');
  });

  it('the composition is a setting: classic stays the DEFAULT, showcase is opt-in', async () => {
    const root = await css();

    /* The store keeps the layout it shipped with. The three-column composition
       is a SECOND option behind `header_mega_layout = showcase`, not a
       replacement: a merchant who never opens the editor sees the same menu as
       before. The base rules are therefore classic; every showcase rule below
       is qualified by the header's own attribute. */
    const classicLayers = declarations(root, '.morph-curtain__layers');
    expect(classicLayers['display']).toBe('grid');
    expect(classicLayers['grid-template-columns']).toBe('minmax(0, 2fr) minmax(0, 1fr)');
    expect(classicLayers['gap']).toBe('22px');
    expect(declarations(root, '.morph-layer')['background']).toContain('var(--surface-2');
    expect(declarations(root, '.morph-layer')['border']).toContain('var(--line-1');
    expect(declarations(root, '.morph-layer__grid')['grid-template-columns']).toContain(
      'minmax(108px, 1fr)'
    );
    // the product row is a THIRD plate, under the two columns
    expect(declarations(root, '.morph-featured')['background']).toBe('var(--surface-2, #faf7f0)');
    expect(declarations(root, '.morph-curtain__panel')['display']).toBeUndefined();

    /* Opt-in: ONE surface, three columns — nav | products | slot. The wrapper
       becomes `display: contents` so its two children are the panel's own grid
       items and the AREAS place them in reading order without moving a node. */
    expect(showcaseDeclarations(root, '.morph-curtain__layers')['display']).toBe('contents');
    const panel = showcaseDeclarations(root, '.morph-curtain__panel');
    expect(panel['display']).toBe('grid');
    expect(panel['grid-template-areas']).toBe('"nav products slot"');
    expect(
      showcaseDeclarations(root, '.morph-layer:not([data-morph-dyn=slot])')['grid-area']
    ).toBe('nav');
    expect(showcaseDeclarations(root, '.morph-layer[data-morph-dyn=slot]')['grid-area']).toBe('slot');
    expect(showcaseDeclarations(root, '.morph-featured')['grid-area']).toBe('products');
    // the categories are a LIST of rows now, not a grid of discs
    expect(showcaseDeclarations(root, '.morph-layer__grid')['grid-template-columns']).toBe(
      'minmax(0, 1fr)'
    );
    expect(showcaseDeclarations(root, '.morph-featured')['background']).toBe('transparent');
  });

  it('the slot layer alone centres its content (attribute-scoped, label never moves)', async () => {
    const root = await css();

    const centre = declarations(
      root,
      '.morph-layer[data-morph-dyn=slot] > *:not(.morph-layer__label)'
    );
    expect(centre['margin-block']).toBe('auto');
  });

  it('subcategory nodes: classic keeps its 88px disc; showcase uses a 28px chip row', async () => {
    const root = await css();

    /* The DEFAULT is the merchant's disc grid — measured reasons for changing
       it (ragged baselines, 10px tracked caps breaking Arabic) justify an
       option, not a silent replacement of the layout they already have. */
    const classicDisc = declarations(root, '.morph-node--2 .morph-node__disc');
    expect(classicDisc['width']).toBe('88px');
    expect(classicDisc['height']).toBe('88px');
    expect(classicDisc['border-radius']).toBe('999px');
    expect(declarations(root, '.morph-node--2 .morph-node__name')['font-size']).toBe('12px');

    /* Opt-in: a row puts every name on one baseline, keeps the column scannable
       and survives a long Arabic name (ellipsis, not a third line). */
    const node = showcaseDeclarations(root, '.morph-node--2');
    expect(node['flex-direction']).toBe('row');
    expect(node['min-height']).toBe('38px');
    const disc = showcaseDeclarations(root, '.morph-node--2 .morph-node__disc');
    expect(disc['width']).toBe('28px');
    expect(disc['height']).toBe('28px');
    expect(disc['border-radius']).toBe('8px');
    /* the name is the row's subject now: 13px at weight 500 (12px at 400 read
       as a caption beside a picture that no longer exists) */
    const name = showcaseDeclarations(root, '.morph-node--2 .morph-node__name');
    expect(name['font-size']).toBe('13px');
    expect(name['font-weight']).toBe('500');
    expect(name['white-space']).toBe('nowrap');
    // hover = one ink wash on the row; the chevron is what moves, not the row
    const hover = showcaseDeclarations(root, '.morph-node--2:hover');
    expect(hover['background']).toContain('var(--morph-ink)');
    // the disc must NOT keep the classic lift when it becomes a chip
    const hoveredDisc = declarations(root, '.morph-node--2:hover .morph-node__disc');
    expect(hoveredDisc['transform']).toContain('scale(1.04)');
    expect(
      showcaseDeclarations(root, '.morph-node--2:hover .morph-node__disc')['transform']
    ).toBe('none');
  });

  it('the featured row is a ONE-ROW reel — four tracks per view, no wrap', async () => {
    const root = await css();

    const list = declarations(root, '.morph-featured .morph-featured__list');
    // it was a grid, and a grid WRAPS: the fifth product opened a second row
    // and pushed the panel past the fold, so the row is a reel instead
    expect(list['display']).toBe('flex');
    expect(list['flex-wrap']).toBeUndefined();
    expect(list['gap']).toBe('16px');
    expect(list['overflow-x']).toBe('auto');
    expect(list['scroll-snap-type']).toBe('x mandatory');
    // a scroll container CLIPS, so the row pays for the card's own shadow
    // (10px) and hover lift, and pulls the padding back with a negative margin
    // so it still occupies exactly the cards' height. No breakout band any
    // more: the photo plate now sits INSIDE the card, as in the store.
    expect(list['padding-block']).toBe('12px 14px');
    expect(list['margin-block']).toBe('-12px -14px');

    /* DEFAULT: four deterministic tracks — `(100% - 48px) / 4` is the row less
       three 16px gaps — with the store's 300px card ceiling. The ceiling used
       to be 210px, which on a 1080px panel left a ~190px sliver of the fifth
       card hanging off the edge: that reads as a broken row, not as a peek. */
    const classicTrack = baseDeclarations(root, '.morph-featured .morph-featured__list > *');
    expect(classicTrack['flex']).toBe('0 0 calc((100% - 48px) / 4)');
    expect(classicTrack['max-width']).toBe('300px');
    expect(classicTrack['scroll-snap-align']).toBe('start');

    /* Opt-in: the card is sized by the column instead, growing to fill what is
       left and never exceeding 320px. The old 210px cap left ~500px of a
       1350px row empty, with the smallest picture in the biggest frame. */
    const track = showcaseDeclarations(root, '.morph-featured .morph-featured__list > *');
    expect(track['flex']).toBe('1 0 clamp(190px, 29%, 320px)');
    expect(track['max-width']).toBe('320px');

    // centring is the FIT state only: centred overflow puts the first card
    // out of reach (the flexbox trap), so the measured state decides
    expect(
      declarations(root, '.morph-featured__reel[data-reel=fit] .morph-featured__list')[
        'justify-content'
      ]
    ).toBe('center');

    // each layout sizes the card from its OWN track
    expect(declarations(root, '.morph-featured .morph-menu-card')['max-width']).toBe('300px');
    expect(showcaseDeclarations(root, '.morph-featured .morph-menu-card')['max-width']).toBe('none');
    // the loading ghost follows the card in both layouts, or the row jumps
    expect(showcaseDeclarations(root, '.morph-featured .s-product-card-vertical')['max-width']).toBe(
      'none'
    );
  });

  it('the reel reflows on a phone instead of shrinking cards into strips', async () => {
    const root = await css();
    /* The desktop four-up rhythm is the classic composition and stays. What
       does not survive a 320px phone is four 46px cards: two per view on a
       tablet, one on a phone, the rest still reachable by swiping. */
    const tablet = mediaDeclarations(
      root,
      '(max-width: 767px)',
      '.morph-featured .morph-featured__list > *'
    );
    expect(tablet['flex']).toBe('0 0 calc((100% - 16px) / 2)');
    const phone = mediaDeclarations(
      root,
      '(max-width: 480px)',
      '.morph-featured .morph-featured__list > *'
    );
    expect(phone['flex']).toBe('0 0 min(210px, 100%)');

    /* Opt-in layout: a phone must not keep a 190px rail beside a 70px product
       sliver — both areas stack and the reel scrolls inside its own column. */
    let mobileAreas = '';
    let mobileCols = '';
    root.walkRules((rule) => {
      if (
        !rule.selectors.includes(
          '.morph-header[data-morph-mega=showcase] .morph-curtain__panel'
        ) ||
        rule.parent?.type === 'atrule'
      ) return;
      rule.walkDecls((decl) => {
        if (decl.prop === 'grid-template-areas') mobileAreas = decl.value;
        if (decl.prop === 'grid-template-columns') mobileCols = decl.value;
      });
    });
    expect(mobileAreas).toBe('"nav" "products"');
    expect(mobileCols).toBe('minmax(0, 1fr)');
  });

  it('the card IS the store card: a print, then a label with the same rows', async () => {
    const root = await css();

    /* The menu card is not a lookalike of the store card — it is the same TWO
       OBJECTS: a full-bleed print on the card's top edge (tag on its inline
       edge, disc on its bottom inline corner) and a paper label under a
       hairline with one column of rows. Every number below is
       `product-card.scss`'s own. */
    const tile = baseDeclarations(root, '.morph-featured .morph-menu-card');
    expect(tile['background']).toBe('var(--bg-card, #fdfaf3)');
    /* ONE corner value for the tile, its print and its label — the root stopped
       clipping so the tag could hang over the card's top edge, so the two
       children that own a corner paint it themselves */
    expect(tile['--pc-corner']).toBe('var(--pc-radius, 22px)');
    expect(tile['border-radius']).toBe('var(--pc-corner)');
    /* No inset on the tile: the photograph is the card's top edge, exactly as
       in the grid. `--pc-pad` moved inward to the label's own edges. */
    expect(tile['padding']).toBe('0');
    /* the tag straddles the card's TOP EDGE — a clipped card would saw it in
       half, so nothing clips here any more */
    expect(tile['overflow']).toBe('visible');
    expect(tile['box-shadow']).toBe('none'); // the merchant's switch turns it on
    expect(tile['transition']).toContain('0.5s cubic-bezier(0.2, 0.7, 0.2, 1)');
    /* the tile is a flex COLUMN — print, then plate. The grid lives in the
       plate, so the disc's offset measures from the plate's top edge. */
    expect(tile['display']).toBe('flex');
    expect(tile['flex-direction']).toBe('column');

    /* THE LABEL: one column, meta first, price closing it. `cart` is the last
       row and normally empty — the disc leaves the grid. */
    const body = baseDeclarations(root, '.morph-featured .morph-menu-card__body');
    expect(body['display']).toBe('grid');
    expect(body['grid-template-rows']).toBe(
      'minmax(18px, auto) auto auto minmax(auto, 1fr) auto auto'
    );
    expect(body['grid-template-areas']).toContain('"meta"');
    expect(body['grid-template-areas']?.indexOf('meta')).toBeLessThan(
      body['grid-template-areas']?.indexOf('name') ?? 0
    );
    expect(body['grid-template-areas']?.indexOf('price')).toBeGreaterThan(
      body['grid-template-areas']?.indexOf('name') ?? 0
    );
    /* the seam, and the density inset the merchant's `global_density` moves */
    expect(body['border-block-start']).toBe(
      '1px solid var(--pc-line, color-mix(in srgb, #2b2519 9%, transparent))'
    );
    expect(body['padding']).toBe('11px var(--pc-inset, 12px) 12px');
    /* and the plate rises into the print, exactly as on the store card — the
       overlap, the two rounded top corners, the shadow that makes it an object
       lying on a photograph */
    expect(body['margin-block-start']).toBe('calc(-1 * var(--pc-lift, 26px))');
    expect(body['border-start-start-radius']).toBe('16px');
    expect(body['border-start-end-radius']).toBe('16px');
    expect(body['box-shadow']).toContain('var(--pc-ink');

    /* the reserved meta rail: the maker's mark and the score on ONE 10.5px
       line, at the label's start — not spread to its two ends */
    const meta = baseDeclarations(root, '.morph-featured .morph-menu-card__meta');
    expect(meta['grid-area']).toBe('meta');
    expect(meta['min-height']).toBe('13px');
    expect(meta['font-size']).toBe('10.5px');

    expect(baseDeclarations(root, '.morph-featured .morph-menu-card__name')['font-size']).toBe(
      '15.5px'
    );
    expect(baseDeclarations(root, '.morph-featured .morph-menu-card__desc')['font-size']).toBe(
      '12.5px'
    );
    expect(
      baseDeclarations(root, '.morph-featured .morph-menu-card__desc')['-webkit-line-clamp']
    ).toBe('var(--pc-desc-lines, 1)');
    expect(baseDeclarations(root, '.morph-featured .morph-menu-card__now')['font-size']).toBe(
      '20px'
    );
    expect(baseDeclarations(root, '.morph-featured .morph-menu-card__was')['font-size']).toBe(
      '11.5px'
    );
    expect(baseDeclarations(root, '.morph-featured .morph-menu-card__was')['text-decoration']).toBe(
      'line-through'
    );

    /* the disc straddles the seam — 20px up from the plate's top edge on a
       36px disc, so half of it is on the picture and half on the plate */
    const actions = baseDeclarations(root, '.morph-featured .morph-menu-card__actions');
    expect(actions['position']).toBe('absolute');
    expect(actions['inset-block-start']).toBe('-20px');
    expect(actions['inset-inline-end']).toBe('var(--pc-inset, 12px)');
    const add = baseDeclarations(
      root,
      '.morph-featured .morph-menu-card__add .s-button-element'
    );
    expect(add['width']).toBe('36px');
    expect(add['border-radius']).toBe('50%');
    const glyph = baseDeclarations(
      root,
      '.morph-featured .morph-menu-card__add .s-button-element::before'
    );
    expect(glyph['-webkit-mask']).toContain('var(--pc-cart-icon)');
    const fav = baseDeclarations(root, '.morph-featured .morph-menu-card__fav');
    /* the store card's 30px disc: one blurred 32px disc here was the last
       `backdrop-filter` in a system that removed it from the grid for cost */
    expect(fav['width']).toBe('30px');
    /* and it is positioned on the WRAPPER: the class lands on the inner
       `.s-button-element`, which the hit-area block keeps `position: relative`
       — so an absolute rule there only nudged a button that was still in flow
       AFTER the photo link, and `overflow: hidden` clipped it out of sight. */
    const favWrap = baseDeclarations(root, '.morph-featured .morph-menu-card__media > .s-button-wrap');
    expect(favWrap['position']).toBe('absolute');
    expect(favWrap['inset-block-start']).toBe('8px');
    expect(favWrap['inset-inline-end']).toBe('8px');
    /* the corner is the wrapper's, so the button must NOT carry an absolute
       position of its own — that is what broke it */
    expect(fav['position']).not.toBe('absolute');

    /* Only the card width is the layout's — the picture RATIO is a card
       property now, inherited from the merchant's `product_card_img_ratio`
       through `--pc-ar-num` (re-pointable per component by `mega_card_ratio`),
       instead of the private square this plate used to hard-code. */
    const classicPlate = baseDeclarations(root, '.morph-featured .morph-menu-card__media');
    expect(classicPlate['aspect-ratio']).toBe('var(--pc-ar-num, 1)');
    /* Full-bleed: the photo's corner IS the card's corner, and since the card
       root stopped clipping (the tag straddles its top edge) the PRINT is what
       paints that corner — the card's value minus its hairline, and nothing on
       its floor. A second inner radius would draw a mat. */
    expect(classicPlate['border-start-start-radius']).toBe('calc(var(--pc-corner, 22px) - 1px)');
    expect(classicPlate['border-start-end-radius']).toBe('calc(var(--pc-corner, 22px) - 1px)');
    expect(classicPlate['border-end-start-radius']).toBe('0');
    expect(classicPlate['border-end-end-radius']).toBe('0');
    expect(classicPlate['background']).toBe('var(--pc-image-bg, #f4ebdc)');
    /* The photo's PRESENTATION is the store card's, read from the same two
       variables. This plate used to hardcode `contain` while the grid painted
       `cover`, so the same product wore two different crops — the largest
       drift in the card system, and invisible to a test that only looked at
       one surface. */
    const plateImg = baseDeclarations(root, '.morph-featured .morph-menu-card__media img');
    expect(plateImg['object-fit']).toBe('var(--pc-img-fit, cover)');
    expect(plateImg['object-position']).toBe('var(--pc-img-pos, center)');
    const showcasePlate = showcaseDeclarations(root, '.morph-featured .morph-menu-card__media');
    /* the opt-in layout inherits the same variable; its old 4:3 survives only
       as the fallback for a context that declares no ratio at all */
    expect(showcasePlate['aspect-ratio']).toBe('var(--pc-ar-num, 4/3)');
    expect(showcaseDeclarations(root, '.morph-featured .morph-menu-card')['max-width']).toBe('none');
    // no second type scale in the opt-in layout — it is the store card too
    expect(showcaseDeclarations(root, '.morph-featured .morph-menu-card__name')['font-size']).toBeUndefined();
  });

  it('the menu card obeys the SAME merchant switches as the store card', async () => {
    const root = await css();
    expect(
      declarations(root, '[data-pc-shadow=soft] .morph-menu-card')['box-shadow']
    ).toBe('var(--pc-shadow)');
    expect(declarations(root, '[data-pc-desc="0"] .morph-menu-card__desc')['display']).toBe('none');
    expect(declarations(root, '[data-pc-rating="0"] .morph-menu-card__rating')['display']).toBe('none');
    expect(
      declarations(root, '[data-pc-cart=bar] .morph-menu-card__add .s-button-element')[
        'border-radius'
      ]
    ).toBe('999px');
    const phone = mediaDeclarations(root, '(max-width: 767px)', '.morph-menu-card__name');
    expect(phone['font-size']).toBe('13.5px');
    /* the compact disc is 32px, one step under the full card's 36 — never
       larger, which is what an earlier copy did */
    const phoneAdd = mediaDeclarations(
      root,
      '(max-width: 767px)',
      '.morph-menu-card__add .s-button-element'
    );
    expect(phoneAdd['width']).toBe('32px');
  });

  it('the reel arrows bracket the track — they never float over a card', async () => {
    const root = await css();

    // a sibling, not an overlay: an overlay lands on the card that was just
    // swiped into view, and the track is what gives the arrows their room
    const reel = declarations(root, '.morph-featured__reel');
    expect(reel['display']).toBe('flex');
    expect(reel['gap']).toBe('8px');

    const wrapper = declarations(root, '.morph-featured__reel .s-products-list-wrapper');
    expect(wrapper['flex']).toBe('1 1 auto');
    expect(wrapper['min-width']).toBe('0');

    const nav = declarations(root, '.morph-featured__nav');
    /* `relative` is the 44px pseudo's anchor, NOT an overlay: nothing in this
       rule positions the arrow over the track (no top/bottom/inset) */
    expect(nav['position']).toBe('relative');
    expect(nav['top']).toBeUndefined();
    expect(nav['inset-inline-start']).toBeUndefined();
    expect(nav['flex']).toBe('none');
    expect(nav['width']).toBe('34px');
    expect(nav['height']).toBe('34px');

    const spent = declarations(root, '.morph-featured__nav:disabled');
    expect(spent['visibility']).toBe('hidden');
    expect(spent['pointer-events']).toBe('none');
    expect(spent['opacity']).toBe('0');

    // 34px disc, 44px target — the theme's rule for every small control
    expect(declarations(root, '.morph-featured__nav')['position']).toBe('relative');
    expect(declarations(root, '.morph-featured__nav::after')['inset']).toBe('-5px');
  });

  it('the platform card is clamped + centred with a SQUARE picture — the height half of the pair', async () => {
    const root = await css();

    const card = declarations(root, '.morph-featured .s-product-card-vertical');
    // the loading ghosts wear the real card's footprint, or the row jumps
    // size when the products land
    expect(card['max-width']).toBe('300px');
    expect(card['justify-self']).toBe('center');

    const image = declarations(root, '.morph-featured .s-product-card-vertical .s-product-card-image');
    /* A deterministic plate, but no longer a PRIVATE one: the height comes from
       the merchant's `product_card_img_ratio` (`--pc-ar-num`), the corner from
       the store's media role and the well from the card's image colour. A ghost
       pinned to `1 / 1` and `0` re-dressed the panel the moment the products
       arrived — the same drift the card system exists to prevent. */
    expect(image['aspect-ratio']).toBe('var(--pc-ar-num, 1)');
    expect(image['border-radius']).toBe(
      'var(--radius-media, calc(var(--pc-radius, 22px) - 9px))'
    );
    expect(image['background']).toBe('var(--pc-image-bg, #f4ebdc)');
  });

  it('the dark curtain keeps its own surfaces', async () => {
    const root = await css();

    /* The panel's night face is the store's, not a literal pair: the light
       rule reads `--surface-1` / `--line-1`, both of which the palette bridge
       re-points at night, so the dark rule carries the shadow and nothing
       else (a second palette here is what drifted before). */
    const light = declarations(root, '.morph-curtain__panel');
    expect(light['background']).toContain('var(--surface-1');
    expect(light['border']).toContain('var(--line-1');

    const panel = declarations(root, 'html.dark .morph-curtain__panel');
    expect(panel['background']).toBeUndefined();
    expect(panel['box-shadow']).toBeTruthy();

    /* The DEFAULT featured row is the third plate, and it takes `--surface-2`
       (day and night) — no dark literal of its own. In the opt-in showcase the
       panel is the only surface and the products column has no plate at all. */
    const featured = declarations(root, '.morph-featured');
    expect(featured['background']).toBe('var(--surface-2, #faf7f0)');
    expect(declarations(root, 'html.dark .morph-featured')['background']).toBeUndefined();
    expect(showcaseDeclarations(root, '.morph-featured')['background']).toBe('transparent');

    /* the platform card inside the featured plate is the last night literal in
       this file: `#20262f` was a second dark palette that ignored the merchant's
       own night surface. It no longer decides a surface AT ALL — the light rule
       reads `--bg-card`, which resolves to the night `--surface-1` (exactly the
       value the real card's night rule writes into `--pc-bg`). Pinning
       `--surface-3` here made the loading ghost a lighter tile than the card it
       stands in for, so the panel still re-dressed itself on load. */
    const entry = declarations(
      root,
      'html.dark .morph-featured .s-product-card-vertical .s-product-card-entry'
    );
    expect(entry['background']).toBeUndefined();
    expect(entry['border-color']).toContain('var(--line-1');
  });
});

describe('one-line nav fit invariants («المزيد» keeps links off the brand/actions)', () => {
  it('hides the measurement probe invisibly but layable', async () => {
    const root = await css();

    const probe = declarations(root, '.morph-nav__probe');
    expect(probe['position']).toBe('absolute');
    expect(probe['visibility']).toBe('hidden');
    expect(probe['pointer-events']).toBe('none');
    expect(probe['display']).toBe('flex');
  });

  it('keeps the nav one-line-safe: the row can shrink, centered, tiny gap', async () => {
    const root = await css();

    const nav = declarations(root, '.morph-pill__nav');
    expect(nav['flex']).toContain('1 1 auto');
    expect(nav['min-width']).toBe('0');
    expect(nav['justify-content']).toBe('center');
    expect(nav['gap']).toBe('var(--morph-nav-gap, 2px)');
  });
});

describe('phone screens + account takeover invariants', () => {
  /* The takeover is a `position: fixed`, viewport-sized panel rendered INSIDE
     the 38px account disc. The disc clips (overflow) and its backdrop-filter
     makes it the containing block, so while the panel is open both have to go
     or the screen renders as a sliver pinned to the chip — measured live as a
     40×140 box instead of 390×844, which is what "clicking does nothing" was. */
  it('the account disc stops clipping / containing the takeover while it is open', async () => {
    const root = await css();

    const host = declarations(
      root,
      '.morph-header .morph-pill salla-user-menu:has(.s-user-menu-toggler.opened)'
    );
    expect(host['overflow']).toBe('visible');
    expect(host['backdrop-filter']).toBe('none');
  });

  /* Both screens are `aria-modal`. The persistent mobile tab bar (z-220) used
     to paint above them: hit-testing the bar's centre while the index was open
     returned `.mobile-bottom-bar__inner`, i.e. a button outside the dialog was
     still clickable. The header's own stacking context now lifts on the exact
     two open edges the body-scroll lock and MutationObserver already use. */
  it('lifts the whole header above the mobile tab bar while a screen is open', async () => {
    const root = await css();
    const z = (selector: string) => Number(declarations(root, selector)['z-index']);

    expect(z('.morph-header')).toBe(40);
    expect(z('.morph-header:has(.morph-overlay:not(.is-hidden))')).toBeGreaterThan(220);
    expect(z('.morph-header:has(.s-user-menu-toggler.opened)')).toBeGreaterThan(220);
  });

  /* The bar is now covered, not tolerated, so the old 64px clearance band is
     gone and the fullscreen screens use the whole viewport again. */
  it('no longer reserves a bottom-bar band inside the fullscreen screens', async () => {
    const root = await css();
    for (const selector of [
      '.morph-overlay__inner',
      '.morph-pill salla-user-menu .s-user-menu-dropdown',
      '.morph-account-foot',
    ]) {
      const d = declarations(root, selector);
      expect(d['padding-bottom'] ?? '').not.toContain('calc(');
      expect(d['bottom'] ?? '').not.toContain('64px');
    }
  });

  /* The 38px phone chips are a drawing size, not a target size. Their
     transparent ::after reaches 44px into the existing gaps; the row's own
     width budget never changes. */
  it('keeps 44px hit areas over the small phone controls', async () => {
    const root = await css();
    const burger = declarations(root, '.morph-burger::after');
    expect(burger['content']).toBe('""');
    expect(burger['height']).toBe('44px');
    expect(burger['inset-inline-start']).toBe('-12px');
    // the logo's target is a centred 44px band, independent of image height
    expect(declarations(root, '.morph-brand::after')['height']).toBe('44px');

    /* bordered chips expose a 36px padding box, so the expansion is 4px —
       the 3px figure measured as a 42px target in the browser. */
    expect(declarations(root, '.morph-pill salla-user-menu::after')['inset']).toBe('-4px');
    /* The host is not the control. With `pointer-events: auto` this band became
       the top hit node and swallowed every tap on the profile icon. */
    expect(declarations(root, '.morph-pill salla-user-menu::after')['pointer-events']).toBe('none');
    expect(declarations(root, '.morph-search__toggle::after')['inset']).toBe('-4px');
    expect(declarations(root, '.morph-pill__actions')['gap']).toBe('8px');
    expect(declarations(root, '.morph-brand')['overflow']).toBe('visible');
    const login = declarations(
      root,
      '.morph-pill salla-user-menu:not(:has(.s-user-menu-trigger-slot)) .s-user-menu-login-btn'
    );
    expect(login['width']).toContain('calc(100% + 8px)');
    const social = Number.parseInt(declarations(root, '.morph-overlay__social a')['min-height'], 10);
    const foot = Number.parseInt(declarations(root, '.morph-overlay__foot a')['min-height'], 10);
    expect(social).toBeGreaterThanOrEqual(44);
    expect(foot).toBeGreaterThanOrEqual(44);
  });

  /* Bands must keep their own height: the index nav is a flex column, so the
     default shrink squeezed 23 rows into 27px each while their label is 29px
     and every row clipped on top of the next. */
  it('index rows do not shrink below their label; the nav scrolls instead', async () => {
    const root = await css();

    const row = declarations(root, '.morph-overlay__row');
    expect(row['flex']).toBe('0 0 auto');
  });

  /* The store-wide standard: a component may not introduce colours the
     merchant cannot reach. The curtain, its cards and the account dropdown
     share ONE palette declared on `.morph-header` (the curtain and the overlay
     are children of it), so each value has exactly one definition and every
     use site reads a token. */
  it('the curtain palette is declared once and every site reads it', async () => {
    const root = await css();

    const scope = declarations(root, '.morph-header');
    expect(scope['--morph-hair']).toBe('rgba(112, 96, 72, 0.28)');
    expect(scope['--morph-hair-soft']).toBe('rgba(112, 96, 72, 0.16)');
    expect(scope['--morph-plate']).toContain('#e6ded2');
    expect(scope['--morph-plate-soft']).toContain('#efe9df');
    expect(scope['--morph-scrim']).toContain('rgba(22, 16, 9, 0.72)');
    expect(scope['--morph-lime']).toBe('#c6ff4a');
    /* the sheen token is gone with the 6s gradient sweep it fed — a
       decorative glow on a card the visitor is meant to read */
    expect(scope['--morph-shine']).toBeUndefined();
    // the header does NOT own a red: `danger` is a store-wide status role, so
    // restyling it once reaches the drawer, the account sheet and the header
    expect(scope['--morph-danger']).toBeUndefined();
    const dangerSites = [];
    root.walkDecls((decl) => {
      if (decl.value.includes('var(--danger-on-ink)')) dangerSites.push(decl.prop);
    });
    expect(dangerSites.length).toBeGreaterThan(0);

    // the raw values survive ONLY in that block — a second copy is a second
    // source of truth, and the merchant's override would stop arriving
    const literals = [];
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--morph-')) return;
      if (/rgba\(112, 96, 72|#e6ded2|#efe9df|#c6ff4a|#ff443a|#ff6b62|255, 224, 160/.test(decl.value))
        literals.push(`${decl.prop}: ${decl.value}`);
    });
    expect(literals).toEqual([]);
  });
});
