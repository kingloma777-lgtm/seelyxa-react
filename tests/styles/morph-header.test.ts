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
    expect(blob['transition']).toContain('transform 0.5s var(--morph-ease)');
  });

  it('keeps the hero scrim gated on data-morph-lift, desktop only', async () => {
    const root = await css();

    const scrim = declarations(root, 'html[data-morph-lift="1"] .morph-header:not(.is-scrolled)::before');
    // the scrim is the themed ::before — a gradient legibility wash under the
    // frosted pill, present only while the first block opted in and unscrolled
    expect(scrim.content).toBe('""');
    expect(scrim.background).toContain('linear-gradient');
  });

  it('drops the pill blur while the account takeover is open', async () => {
    const root = await css();

    const open = declarations(
      root,
      '.morph-header .morph-pill:has(.s-user-menu-toggler.opened)'
    );
    expect(open['backdrop-filter']).toBe('none');
  });

  it('the dark overrides keep the scrim text white on both sides', async () => {
    const root = await css();

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
    // …but the ends round off to half-circles, like the capsule's
    expect(scrolled['border-radius']).toBe('999px');
    // the frost is the same promise as the capsule's
    expect(scrolled['background-color']).toContain('var(--morph-glass)');
    expect(scrolled['backdrop-filter']).toContain('blur(var(--morph-blur');
    // the gutter that makes it read as a slab rather than a full-bleed band
    expect(declarations(root, `${wide}.is-scrolled .morph-bar`)['padding-inline']).toBe('20px');
    // …and it keeps two tight rows by stepping the logo and the nav down
    expect(declarations(root, `${wide}.is-scrolled .morph-brand img`)['max-height']).toBe('38px');
    expect(declarations(root, `${wide}.is-scrolled .morph-pill__nav`)['--morph-nav-size']).toBe('13px');
  });

  it('keeps the capsule’s rhythm: 24px page gutter, 16px between discs', async () => {
    const root = await css();

    /* The discs are the capsule's own, so the spacing has to be the capsule's
       too: a 24px page gutter to the first disc, then its 16px chip gap. If
       either drifts, the wide bar stops reading as the same design. */
    expect(declarations(root, `${wide} .morph-pill`).padding).toBe('14px 24px 10px');
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
    expect(column['max-height']).toBe('min(420px, 70vh - 160px)');
    // the grid hugs its rows and only shrinks when the cap bites
    expect(
      declarations(root, '.morph-layer:not([data-morph-dyn=slot]) .morph-layer__grid')['flex']
    ).toBe('0 1 auto');
  });

  it('the layer split is the merchant contract: two thirds subcategories, one third everything else', async () => {
    const root = await css();

    // last-wins collect across base + min-width rules
    expect(declarations(root, '.morph-curtain__layers')['grid-template-columns']).toBe('2fr 1fr');
    // the discs grid keeps a cell floor that fits the 88px disc + its name
    expect(declarations(root, '.morph-layer__grid')['grid-template-columns']).toBe(
      'repeat(auto-fill, minmax(108px, 1fr))'
    );
  });

  it('the slot layer alone centres its content (attribute-scoped, label never moves)', async () => {
    const root = await css();

    const centre = declarations(
      root,
      '.morph-layer[data-morph-dyn=slot] > *:not(.morph-layer__label)'
    );
    expect(centre['margin-block']).toBe('auto');
  });

  it('subcategory nodes are ONE circle size holding the picture, name beneath', async () => {
    const root = await css();

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

    // four tracks per view, capped so a wide panel cannot stretch them
    const track = declarations(root, '.morph-featured .morph-featured__list > *');
    expect(track['flex']).toBe('0 0 calc((100% - 48px) / 4)');
    expect(track['max-width']).toBe('210px');
    expect(track['scroll-snap-align']).toBe('start');

    // centring is the FIT state only: centred overflow puts the first card
    // out of reach (the flexbox trap), so the measured state decides
    expect(
      declarations(root, '.morph-featured__reel[data-reel=fit] .morph-featured__list')[
        'justify-content'
      ]
    ).toBe('center');

    // the card fills its track, so the row is actually 4×210 wide
    expect(declarations(root, '.morph-featured .morph-menu-card')['max-width']).toBe('210px');
  });

  it("the card wears the STORE's tile and its square photo plate", async () => {
    const root = await css();

    /* The merchant's "المربع الأصفر عايزه زي المربع الأصفر اللي فكارت المنتج في
       المتجر": the tile is `product-card.scss`'s, read from the SAME `--pc-*`
       tokens, so retinting the store's card retints this one too. */
    const tile = declarations(root, '.morph-featured .morph-menu-card');
    // the CARD level of the background chain (store → section → card) — it
    // resolves the merchant's card colour today, and a section that sets
    // `--bg-card` reaches this card without a second rule
    expect(tile['background']).toBe('var(--bg-card, #fdfaf3)');
    expect(tile['border-radius']).toBe('var(--pc-radius, 22px)');
    expect(tile['border']).toBe(
      '1px solid var(--pc-line, color-mix(in srgb, #2b2519 9%, transparent))'
    );
    // the store's own numbers: 10px inset, and the plate clipped by the tile
    expect(tile['padding']).toBe('10px');
    expect(tile['overflow']).toBe('hidden');
    expect(tile['transition']).toContain('0.5s cubic-bezier(0.2, 0.7, 0.2, 1)');

    const plate = declarations(root, '.morph-featured .morph-menu-card__media');
    // SQUARE, in the merchant's image colour, one radius step inside the tile
    expect(plate['aspect-ratio']).toBe('1');
    expect(plate['background']).toBe('var(--pc-image-bg, #f4ebdc)');
    expect(plate['border-radius']).toBe('calc(var(--pc-radius, 22px) - 9px)');
    // the circular breakout is gone — that was the one shape the store lacks,
    // and what the featured row's 52px clipping band existed for
    expect(plate['margin']).toBe('0 0 6px');
    expect(plate['box-shadow']).toBeUndefined();
    expect(plate['border']).toBeUndefined();
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
    expect(card['max-width']).toBe('210px');
    expect(card['justify-self']).toBe('center');

    const image = declarations(root, '.morph-featured .s-product-card-vertical .s-product-card-image');
    expect(image['aspect-ratio']).toBe('1/1');
    expect(image['border-radius']).toBe('0');
  });

  it('the dark curtain keeps its own surfaces', async () => {
    const root = await css();

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
    expect(scope['--morph-shine']).toBe('rgba(255, 224, 160, 0.35)');
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
