// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root } from 'postcss';
import tailwindcss from 'tailwindcss';

/**
 * The Global Product Card System's CSS contract.
 *
 * The merchant's brief asks for ONE card design whose settings reach every
 * surface — the store grid, the mega menu, the galleries, any future block.
 * That promise is kept or broken entirely in the stylesheets, and the way it
 * broke before was invisible: the grid painted `object-fit: cover` while the
 * menu plate hardcoded `contain`, so the same product wore two different
 * crops. Nothing failed. No test looked at both files at once.
 *
 * This file does. It compiles both stylesheets and pins four kinds of thing:
 *
 *  1. the defaults are declared ONCE, on `.app-inner`, not per surface;
 *  2. each surface reads the SAME variable for the same decision;
 *  3. the COMPOSITION is the same two objects on both cards — a print with an
 *     attached tab and a disc that straddles the seam, then a label whose one
 *     column reserves its meta row so a row of cards shares a baseline;
 *  4. the badge skin is defined once and both cards wear it.
 *
 * A new surface that hardcodes `object-fit`, re-introduces a tile inset, or
 * puts the disc back inside the grid fails here, which is the point.
 */

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/04-components/${file}`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

let card: Root;
let menu: Root;
let engine: Root;
let actions: Root;

/* Four Sass roots through PostCSS: on a loaded machine this brushes the 10s
   default (measured ~9.4s with the suite running in parallel), so the hook gets
   its own budget instead of failing as a flake. */
beforeAll(async () => {
  [card, menu, engine, actions] = await Promise.all([
    compile('product-card.scss'),
    compile('morph-header.scss'),
    compile('product.scss'),
    compile('product-actions.scss'),
  ]);
}, 60000);

/** Declarations from rules that exactly include `selector` and sit OUTSIDE any
 *  at-rule. */
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

function mediaDeclarations(root: Root, params: string, selector: string): Record<string, string> {
  return atRuleDeclarations(root, 'media', params, selector);
}

/** The same, for any conditional group — `@media` and `@container` alike. The
 *  card's compact scale is reached BOTH ways, so both have to be readable. */
function atRuleDeclarations(
  root: Root,
  name: string,
  params: string,
  selector: string
): Record<string, string> {
  const decls: Record<string, string> = {};
  root.walkAtRules(name, (atRule) => {
    if (atRule.params !== params) return;
    atRule.walkRules((rule) => {
      if (!rule.selectors.includes(selector)) return;
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
    });
  });
  return decls;
}

/** Every declaration on a card's media image, whichever surface it belongs to. */
const CARD_MEDIA_IMAGES = [
  '.s-product-card-vertical .s-product-card-image img',
  '.pc-gallery__slide img',
  '.morph-featured .morph-menu-card__media img',
  '.morph-spotlight--product .morph-menu-card__media img',
];

describe('the card system declares its defaults once', () => {
  it('puts the image presentation, the hover geometry and the inset on `.app-inner`', () => {
    /* `.app-inner` is where `--pc-*` already lives and where `ThemeLayout`
       writes the merchant's values inline. Declaring a default on a CARD would
       shadow the inherited value and the merchant's choice would stop arriving. */
    const defaults = baseDeclarations(card, '.app-inner');
    expect(defaults['--pc-img-fit']).toBe('cover');
    expect(defaults['--pc-img-pos']).toBe('center');
    expect(defaults['--pc-hover-lift']).toBe('-4px');
    expect(defaults['--pc-img-zoom']).toBe('1.045');
    /* density-derived, so `global_density` reaches the largest surface on the
       page instead of stopping at the card's own inset */
    expect(defaults['--pc-pad']).toBe('calc(10px * var(--density, 1))');
    /* the label's own inset is DERIVED from the density inset, one step up —
       a second literal here would freeze the merchant's density out of the
       type's margin */
    expect(defaults['--pc-inset']).toBe('calc(var(--pc-pad, 10px) + 2px)');
    /* the fallback is the design decision, so it must equal the setting's own
       default: the short line is ONE line. A stale `2` here would only show up
       on a store whose inline style is missing, which is exactly the case no
       screenshot ever covers. */
    expect(defaults['--pc-desc-lines']).toBe('1');
  });

  it('does not re-declare an inherited default on either card', () => {
    /* The trap the playbook already paid for: a component re-declaring a
       variable it inherits shadows the merchant's value forever. */
    for (const selector of ['.s-product-card-vertical', '.morph-featured .morph-menu-card']) {
      const decls = baseDeclarations(selector === '.s-product-card-vertical' ? card : menu, selector);
      expect(decls['--pc-img-fit']).toBeUndefined();
      expect(decls['--pc-hover-lift']).toBeUndefined();
      expect(decls['--pc-pad']).toBeUndefined();
      expect(decls['--pc-inset']).toBeUndefined();
    }
  });
});

describe('both surfaces read the same variable for the same decision', () => {
  it('fills the photo from `--pc-img-fit` and cuts it from `--pc-img-pos`', () => {
    /* THE regression this file exists for. The grid said `cover`, the menu
       plate said `contain`, and one product was cropped in one place and
       letterboxed in the other. */
    for (const selector of CARD_MEDIA_IMAGES) {
      const root = selector.includes('morph-menu-card') ? menu : card;
      const decls = baseDeclarations(root, selector);
      expect(decls['object-fit'], `${selector} must read --pc-img-fit`).toBe(
        'var(--pc-img-fit, cover)'
      );
      expect(decls['object-position'], `${selector} must read --pc-img-pos`).toBe(
        'var(--pc-img-pos, center)'
      );
    }
  });

  it('never hardcodes a fit or a position on a card media image again', () => {
    /* A literal here is how the two surfaces drifted apart in the first place;
       the assertion is on the PROPERTY, not on a particular value, so a new
       literal fails whatever it says. */
    for (const root of [card, menu]) {
      root.walkRules((rule) => {
        const touchesCardMedia = rule.selectors.some((s) =>
          /(s-product-card-image|morph-menu-card__media|pc-gallery__slide)\s+img/.test(s)
        );
        if (!touchesCardMedia) return;
        rule.walkDecls(/^object-(fit|position)$/, (decl) => {
          expect(
            decl.value.startsWith('var(--pc-img-'),
            `${rule.selector} hardcodes ${decl.prop}: ${decl.value}`
          ).toBe(true);
        });
      });
    }
  });

  it('moves the tile and the photo from the shared hover geometry', () => {
    const storeHover = mediaDeclarations(card, '(hover: hover)', '.s-product-card-vertical:hover');
    const menuHover = mediaDeclarations(
      menu,
      '(hover: hover)',
      '.morph-featured .morph-menu-card:hover'
    );
    expect(storeHover['transform']).toBe('translateY(var(--pc-hover-lift, -4px))');
    expect(menuHover['transform']).toBe('translateY(var(--pc-hover-lift, -4px))');

    const storeZoom = mediaDeclarations(
      card,
      '(hover: hover)',
      '.s-product-card-vertical:hover .s-product-card-image img'
    );
    const menuZoom = mediaDeclarations(
      menu,
      '(hover: hover)',
      '.morph-featured .morph-menu-card:hover .morph-menu-card__media img'
    );
    expect(storeZoom['transform']).toBe('scale(var(--pc-img-zoom, 1.045))');
    expect(menuZoom['transform']).toBe('scale(var(--pc-img-zoom, 1.045))');
  });
});

describe('the print is the card’s edge on both surfaces', () => {
  it('gives the tile no inset of its own, and puts the density inset in the label', () => {
    /* The composition is FULL-BLEED: the photograph IS the card's top edge, so
       the tile itself carries no inset — a padding on the tile would put a mat
       around the picture and turn the card back into a framed thumbnail.
       `--pc-pad` did not disappear, it moved inward: the label is what the
       merchant's `global_density` now moves. */
    expect(baseDeclarations(card, '.s-product-card-vertical')['padding']).toBe('0');
    expect(baseDeclarations(menu, '.morph-featured .morph-menu-card')['padding']).toBe('0');

    expect(
      baseDeclarations(card, '.s-product-card-vertical .s-product-card-content')['padding']
    ).toBe('11px var(--pc-inset) 12px');
    expect(baseDeclarations(menu, '.morph-featured .morph-menu-card__body')['padding']).toBe(
      '11px var(--pc-inset, 12px) 12px'
    );

    /* and the label must NOT re-inset the name: the padding above is the
       label's, and a second one on the type double-pads the card */
    expect(baseDeclarations(menu, '.morph-featured .morph-menu-card__name')['padding-inline']).toBeUndefined();
  });

  it('lays the plate ON the print — it rises 32px into the picture, rounded and shadowed', () => {
    /* THE silhouette. The label is not a block stacked under the photograph; it
       is a plate laid on it. Without the negative margin the card is a column
       of two rectangles, which is the conventional card this replaced. The
       radius is on the two TOP corners only — the bottom follows the card — and
       the shadow is what makes the plate an object on a photograph, including
       on a white packshot where plate and picture are the same colour. */
    const plate = baseDeclarations(card, '.s-product-card-vertical .s-product-card-content');
    expect(plate['margin-block-start']).toBe('calc(-1 * var(--pc-lift))');
    expect(plate['border-start-start-radius']).toBe('20px');
    expect(plate['border-start-end-radius']).toBe('20px');
    expect(plate['box-shadow']).toContain('var(--pc-ink)');
    /* it must paint ABOVE the picture, or the overlap is invisible */
    expect(plate['position']).toBe('relative');
    expect(plate['z-index']).toBe('2');
    /* ONE number for the lift, and the gallery dots read it too: at 15px from
       the photo's floor they were buried under the plate and vanished from
       every card in the grid. */
    expect(baseDeclarations(card, '.s-product-card-vertical')['--pc-lift']).toBe('32px');
    expect(baseDeclarations(card, '.pc-dots')['inset-block-end']).toBe(
      'calc(var(--pc-lift, 32px) + 12px)'
    );

    /* the same two objects on the mega card, at its own scale */
    const megaPlate = baseDeclarations(menu, '.morph-featured .morph-menu-card__body');
    expect(megaPlate['margin-block-start']).toBe('calc(-1 * var(--pc-lift, 26px))');
    expect(megaPlate['border-start-start-radius']).toBe('16px');
    expect(megaPlate['border-start-end-radius']).toBe('16px');
    expect(megaPlate['box-shadow']).toContain('var(--pc-ink');
  });

  it('lifts the plate by less on a compact card, where 32px is a quarter of the width', () => {
    /* the card IS the query container, so the override lands on the two
       subtrees that read the number — the plate's label and the dots' picture */
    const compactImage = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      '.s-product-card-vertical .s-product-card-image'
    );
    expect(compactImage['--pc-lift']).toBe('22px');
    const compact = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      '.s-product-card-vertical .s-product-card-content'
    );
    expect(compact['--pc-lift']).toBe('22px');
    expect(compact['border-start-start-radius']).toBe('16px');
    expect(compact['border-start-end-radius']).toBe('16px');
    /* and the plate keeps the same two-ended floor there too: the disc shrinks
       with the card instead of leaving the grid */
    expect(compact['grid-template-columns']).toBe('minmax(0, 1fr) auto');
  });

  it('flushes the media plate at every width instead of re-introducing a mat', () => {
    /* The breakpoint used to re-introduce a tile inset, so every phone and
       tablet card wore a mat around its photo while the desktop card was
       full-bleed — the same design, broken at the breakpoint where most of the
       traffic lives. Only the corner scales below 960. */
    const compact = mediaDeclarations(card, '(max-width: 960px)', '.s-product-card-vertical');
    expect(compact['padding']).toBeUndefined();
    /* the corner scales ONCE, into the value the print and the label read */
    expect(compact['--pc-corner']).toBe('calc(var(--pc-radius) * 0.82)');
    expect(compact['border-radius']).toBe('var(--pc-corner)');
    /* and the print still paints the card's top corner — the root no longer
       clips, so this rule must not reset it to 0 */
    const compactPrint = mediaDeclarations(
      card,
      '(max-width: 960px)',
      '.s-product-card-vertical .s-product-card-image'
    );
    expect(compactPrint['border-start-start-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(compactPrint['border-start-end-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(compactPrint['border-end-start-radius']).toBe('0');

    /* the mega card shrinks its corner at the same breakpoint, from the same
       radius role — a menu card with the desktop corner next to a compacted
       store card reads as a different product line */
    const menuCompact = mediaDeclarations(menu, '(max-width: 767px)', '.morph-menu-card');
    expect(menuCompact['--pc-corner']).toBe('calc(var(--pc-radius, 22px) * 0.82)');
    expect(menuCompact['border-radius']).toBe('var(--pc-corner)');
    expect(
      mediaDeclarations(menu, '(max-width: 767px)', '.morph-menu-card__media')[
        'border-start-start-radius'
      ]
    ).toBe('calc(var(--pc-corner, 22px) - 1px)');
  });
});

describe('the label is one grid, and both cards share its rows', () => {
  /* The composition, as a list of rows. `meta` first is the decision: the
     maker's mark and the score lead, so a card is never a name with a score
     tacked underneath it. The `.` row is the slack — it sits between the short
     line and the price, so a stretched card grows air UNDER the text instead of
     between the name and what it costs. The last row is TWO columns: the figure
     opens it, the cart disc closes it. */
  const ROWS = 'minmax(18px, auto) auto auto minmax(auto, 1fr) auto';
  /* the mega card's body is its own grid and still spends a row on its action */
  const MEGA_ROWS = 'minmax(18px, auto) auto auto minmax(auto, 1fr) auto auto';

  it('places the meta rail, the name, the line and the price on one grid', () => {
    const store = baseDeclarations(card, '.s-product-card-vertical .s-product-card-content');
    expect(store['grid-template-rows']).toBe(ROWS);
    /* the floor is TWO columns, so the disc can end the row the figure opens */
    expect(store['grid-template-columns']).toBe('minmax(0, 1fr) auto');
    /* Sass normalises the area strings to double quotes, so the assertion is on
       the NAME — what matters is the order, and that is asserted below. */
    expect(store['grid-template-areas']).toContain('"meta');
    expect(store['grid-template-areas']?.indexOf('meta')).toBeLessThan(
      store['grid-template-areas']?.indexOf('main') ?? 0
    );
    expect(store['grid-template-areas']?.indexOf('price')).toBeGreaterThan(
      store['grid-template-areas']?.indexOf('main') ?? 0
    );
    /* `price` and `cart` share the last row, and nothing else is on it (the
       column padding in the source survives Sass, hence the double space) */
    expect(store['grid-template-areas']).toContain('"price  cart"');

    /* the mega card answers the SAME question with the same rows — it names its
       areas `name` instead of `main` because its heading is its own element,
       not the engine's wrapper */
    const mega = baseDeclarations(menu, '.morph-featured .morph-menu-card__body');
    expect(mega['grid-template-rows']).toBe(MEGA_ROWS);
    expect(mega['display']).toBe('grid');
    expect(mega['grid-template-areas']).toContain('"meta"');
    expect(mega['grid-template-areas']?.indexOf('meta')).toBeLessThan(
      mega['grid-template-areas']?.indexOf('name') ?? 0
    );
  });

  it('reserves the meta row so a row of cards shares one baseline', () => {
    /* Measured, not guessed: a card with a brand started its name 18px lower
       than a neighbour without one, and the grid read as a staircase. The row
       is reserved by the TRACK, and the rail's own height is fixed to match —
       a margin here and a track there would disagree the moment the rail's
       font changes. */
    const rail = baseDeclarations(card, '.s-product-card-vertical .s-product-card-rating');
    expect(rail['min-height']).toBe('13px');
    expect(rail['margin']).toBe('0');
    expect(rail['grid-area']).toBe('meta');

    const megaRail = baseDeclarations(menu, '.morph-featured .morph-menu-card__meta');
    expect(megaRail['min-height']).toBe('13px');
    expect(megaRail['grid-area']).toBe('meta');
  });

  it('puts the maker’s mark FIRST in the rail, whichever surface appends it', () => {
    /* A portal APPENDS, so the brand span is the last child in the DOM but must
       be the first thing the eye meets. `order: -1` is the only fix that keeps
       the DOM honest — and it mirrors for free in an RTL flex row. */
    const brand = baseDeclarations(card, '.s-product-card-rating .pc-brand');
    expect(brand['order']).toBe('-1');
    expect(brand['margin']).toBe('0');
    expect(brand['margin-inline-end']).toBe('2px');
  });

  it('draws a hairline seam instead of a gradient dissolve', () => {
    /* The 46px dissolve turned a white packshot's floor into a grey smear in
       night mode and ate 18px of every card. One crisp rule says "the print
       ends here" in both modes. */
    expect(
      baseDeclarations(card, '.s-product-card-vertical .s-product-card-content')[
        'border-block-start'
      ]
    ).toBe('1px solid var(--pc-line)');
    expect(
      baseDeclarations(menu, '.morph-featured .morph-menu-card__body')['border-block-start']
    ).toBe('1px solid var(--pc-line, color-mix(in srgb, #2b2519 9%, transparent))');
  });

  it('closes the reading column with the price, at the label’s START', () => {
    /* Measured in the browser, then corrected: an END-aligned figure sat 300px
       from the name it belongs to on a 238px card, in the very corner the
       short line's ellipsis lands in — the two read as one broken block. At
       the start the column ends on its own number, and the disc opposite it
       closes the same floor at the inline end. */
    for (const [root, selector] of [
      [card, '.s-product-card-vertical .s-product-card-sale-price'],
      [menu, '.morph-featured .morph-menu-card__price'],
    ] as const) {
      const decls = baseDeclarations(root, selector);
      expect(decls['justify-self'], `${selector} must start-align`).toBe('start');
      expect(decls['text-align']).toBe('start');
      expect(decls['justify-content']).toBe('flex-start');
    }
    /* and the disc takes the OPPOSITE end of that row, so the two never share
       an axis */
    expect(
      baseDeclarations(
        card,
        "[data-pc-cart=circle] .s-product-card-vertical .s-product-card-content-footer > div"
      )['justify-self']
    ).toBe('end');
  });

  it('gives the struck price’s currency glyph a readable floor', () => {
    /* `0.58em` of 11.5px is 6.7px — printed as a smudge, not as a currency. */
    expect(
      baseDeclarations(card, '.s-product-card-vertical .s-product-card-sale-price span i')[
        'font-size'
      ]
    ).toBe('0.72em');
  });
});

describe('the action disc closes the label’s floor, in the grid', () => {
  it('ends the price’s own row, opposite the figure', () => {
    /* THE composition, restored: the disc is the card's last element, on the
       floor, at the inline end. It is NOT on the print — a control straddling
       the seam turns the photograph into a toolbar and leaves the label's floor
       half empty. */
    const disc = baseDeclarations(
      card,
      "[data-pc-cart=circle] .s-product-card-vertical .s-product-card-content-footer > div"
    );
    expect(disc['grid-area']).toBe('cart');
    expect(disc['justify-self']).toBe('end');
    expect(disc['align-self']).toBe('end');
    /* nothing takes it out of the grid */
    expect(disc['position']).toBeUndefined();
    expect(disc['inset-block-start']).toBeUndefined();
    expect(disc['inset-inline-end']).toBeUndefined();
    /* The disc's footprint, NOT `auto`: the engine writes `style="width:100%"`
       on this node while the button is still a skeleton, and an inline style no
       sheet rule can outrank — `max-width` is the one property it does not set,
       so the placeholder can never grow past the disc (measured at
       1280/1440/1920). */
    expect(disc['width']).toBe('auto');
    expect(disc['max-width']).toBe('36px');
    expect(disc['margin']).toBe('0 0 2px');

    /* the mega card keeps its own action inside the plate — a separate surface
       with its own body grid */
    const megaDisc = baseDeclarations(menu, '.morph-featured .morph-menu-card__actions');
    expect(megaDisc['position']).toBe('absolute');
    expect(megaDisc['inset-block-start']).toBe('-20px');
  });

  it('keeps the disc in the grid at compact sizes instead of shrinking it onto the print', () => {
    /* A compact override that puts the action back on the print would be a
       second composition at the widths most traffic uses. The disc only
       shrinks; the row it ends is the card's own. */
    const compact = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      "[data-pc-cart=circle] .s-product-card-vertical .s-product-card-content-footer > div"
    );
    expect(compact['position']).toBeUndefined();
    expect(compact['inset-inline-end']).toBeUndefined();
    /* and the wrapper keeps the disc's footprint at this size too, or the
       skeleton overflows by a different number on every card width */
    expect(compact['width']).toBe('30px');
    expect(compact['max-width']).toBe('30px');

    /* The compact TYPE is reached by the container query only, and that is the
       design: the card's type has to follow the CARD's width, not the
       viewport's — Salla hands a 768px window 133px cards, narrower than the
       160px a 375px phone gives. The `@media (max-width: 960px)` block scales
       the CORNER only; if the mixin were ever copied into it, the two paths
       would drift the moment one was edited. */
    const narrow = mediaDeclarations(
      card,
      '(max-width: 960px)',
      "[data-pc-cart=circle] .s-product-card-vertical .s-product-card-content-footer > div"
    );
    expect(narrow['position']).toBeUndefined();
  });

  it('sizes the disc by the card, not by the viewport', () => {
    /* 36 on the full card, 30 on the compact one — the disc must never be
       larger than the desktop disc, which is what an earlier copy did. */
    expect(
      baseDeclarations(
        card,
        "[data-pc-cart=circle] .s-product-card-vertical salla-add-product-button .s-button-element"
      )['width']
    ).toBe('36px');
    expect(
      atRuleDeclarations(
        card,
        'container',
        '(max-width: 190px)',
        "[data-pc-cart=circle] .s-product-card-vertical salla-add-product-button .s-button-element"
      )['width']
    ).toBe('30px');
  });
});

describe('the two cart skins are exclusive, whichever ancestor declared them', () => {
  /* THE bug this pins: a COMPONENT override can set the cart to `bar` for its
     own subtree while `.app-inner` still carries `data-pc-cart="circle"`, so
     BOTH blocks match and the bar inherits the disc's masked `::before`, its
     clipped label and its 30px compact width — a blue circle with invisible
     text, sitting on the description. The bar has to undo the circle skin
     explicitly; inheritance cannot be relied on to pick a winner. */
  const BAR = "[data-pc-cart=bar] .s-product-card-vertical";
  const BAR_BTN = `${BAR} salla-add-product-button .s-button-element`;
  const CIRCLE_BTN =
    "[data-pc-cart=circle] .s-product-card-vertical salla-add-product-button .s-button-element";

  /** The declarations of a rule nested under `selector` (Sass `&:hover`). */
  function nested(root: Root, selector: string, suffix: string): Record<string, string> {
    const decls: Record<string, string> = {};
    root.walkRules((rule) => {
      if (!rule.selectors.includes(`${selector}${suffix}`)) return;
      rule.walkDecls((decl) => {
        decls[decl.prop] = decl.value;
      });
    });
    return decls;
  }

  it('makes the bar a footer that spans the label, not a disc in the corner', () => {
    const wrap = baseDeclarations(card, `${BAR} .s-product-card-content-footer > div`);
    /* `static` undoes the disc's `absolute`, and `stretch` undoes the compact
       circle's `justify-self: end` — without it the bar collapses to the width
       of its own label and sits in a corner like a very wide icon */
    expect(wrap['position']).toBe('static');
    expect(wrap['inset']).toBe('auto');
    expect(wrap['justify-self']).toBe('stretch');
    expect(wrap['width']).toBe('100%');
    expect(wrap['margin-block-start']).toBe('10px');
    /* the disc's cap must be released, or a bar is clamped to 36px */
    expect(wrap['max-width']).toBe('none');
  });

  it('prints the bar’s label and draws no masked glyph', () => {
    /* the circle hides its label from sight and paints a CSS mask instead */
    const circleText = baseDeclarations(
      card,
      "[data-pc-cart=circle] .s-product-card-vertical salla-add-product-button .s-button-text"
    );
    expect(circleText['clip']).toBe('rect(0 0 0 0)');
    expect(circleText['position']).toBe('absolute');

    const barText = baseDeclarations(card, `${BAR} salla-add-product-button .s-button-text`);
    expect(barText['clip']).toBe('auto');
    expect(barText['position']).toBe('static');
    expect(barText['width']).toBe('auto');

    /* and the bar's `::before` is explicitly emptied — a bar is a labelled
       button, so the disc's mask must not survive it */
    expect(nested(card, BAR_BTN, '::before')['content']).toBe('none');

    const bar = baseDeclarations(card, BAR_BTN);
    expect(bar['width']).toBe('100%');
    expect(bar['height']).toBe('40px');
    expect(bar['background']).toBe('var(--color-primary)');
    expect(bar['color']).toBe('var(--color-primary-reverse)');
  });

  it('gives the bar its own row under the price, at every scale', () => {
    /* The disc ends the floor's inline end, so the plate is TWO columns on the
       last row. A bar cannot live in a 36px column — it would be a sliver — so
       bar mode re-lays the plate with the price on one row and the bar across
       the next, at the full size AND at the compact one. */
    const base = baseDeclarations(card, `${BAR} .s-product-card-content`);
    expect(base['grid-template-columns']).toBe('minmax(0, 1fr)');
    expect(base['grid-template-areas']).toContain('"price"');
    expect(base['grid-template-areas']).toContain('"cart"');
    expect(base['grid-template-areas']).not.toContain('"price cart"');

    const areas = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      `${BAR} .s-product-card-content`
    );
    expect(areas['grid-template-areas']).toContain('"price"');
    expect(areas['grid-template-areas']).toContain('"cart"');
    expect(areas['grid-template-columns']).toBe('minmax(0, 1fr)');

    /* `100%` again: the compact CIRCLE rule comes later in the cascade and
       pins the disc to 30px, so a bar that only re-declared its height kept
       the disc's width */
    const btn = atRuleDeclarations(card, 'container', '(max-width: 190px)', BAR_BTN);
    expect(btn['width']).toBe('100%');
    expect(btn['height']).toBe('36px');

    const wrap = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      `${BAR} .s-product-card-content-footer > div`
    );
    expect(wrap['justify-self']).toBe('stretch');
    expect(wrap['width']).toBe('100%');
    expect(wrap['max-width']).toBe('none');
  });
});

describe('the badge is a system, not a shape', () => {
  it('defines the skin ONCE, and every value is the merchant’s to move', () => {
    const badge = baseDeclarations(card, '.pc-badge');
    expect(Object.keys(badge).length).toBeGreaterThan(0);
    /* a flex row, because the tag may carry a dot before its words */
    expect(badge['display']).toBe('inline-flex');
    expect(badge['align-items']).toBe('center');
    /* every measurement is a fallback: `lib/productBadgeStyle` writes only the
       values the merchant changed, so the designed default survives until they
       touch that property */
    expect(badge['padding']).toBe('var(--pc-tag-pad-y, 6px) var(--pc-tag-pad-x, 10px)');
    expect(badge['border-radius']).toBe('var(--pc-tag-radius, 0px)');
    expect(badge['font-size']).toBe('var(--pc-tag-fs, 10px)');
    expect(badge['font-weight']).toBe('var(--pc-tag-fw, 700)');
    /* the border is always the TEXT's colour — one control for style, one for
       thickness, and the colour can never disagree with the words */
    expect(badge['border']).toBe('var(--pc-tag-bw, 0) var(--pc-tag-bs, solid) currentColor');
    /* the face, as roles: a palette change reaches the tag */
    expect(badge['background']).toBe('var(--pc-tag-bg)');
    expect(badge['color']).toBe('var(--pc-tag-ink)');
    /* a label, not a control — the photo's link keeps the whole plate */
    expect(badge['pointer-events']).toBe('none');
    /* no letter spacing and no text-transform: the tag prints Arabic as often
       as «-60%», and letter spacing breaks the joins in a cursive script */
    expect(badge['letter-spacing']).toBeUndefined();
    expect(badge['text-transform']).toBeUndefined();
  });

  it('gives the words their own box, so a long label ellipses inside the tag', () => {
    const text = baseDeclarations(card, '.pc-badge__text');
    expect(text['overflow']).toBe('hidden');
    expect(text['text-overflow']).toBe('ellipsis');
    expect(text['min-width']).toBe('0');
  });

  it('offers four SILHOUETTES — shapes, not colours', () => {
    expect(baseDeclarations(card, '[data-pc-badge-shape=sharp]')['--pc-tag-radius']).toBe('0px');
    expect(baseDeclarations(card, '[data-pc-badge-shape=soft]')['--pc-tag-radius']).toBe('6px');
    expect(baseDeclarations(card, '[data-pc-badge-shape=pill]')['--pc-tag-radius']).toBe('999px');
    expect(baseDeclarations(card, '[data-pc-badge-shape=ticket]')['--pc-tag-radius']).toBe('8px');
    /* the ticket is the one that is not a radius: three soft corners and one
       square, so it reads as a stub rather than a rounded box */
    const ticket = baseDeclarations(card, '[data-pc-badge-shape=ticket] .pc-badge');
    expect(ticket['border-start-start-radius']).toBe('0');
    expect(ticket['border-start-end-radius']).toBe('var(--pc-tag-radius, 8px)');
    expect(ticket['border-end-end-radius']).toBe('var(--pc-tag-radius, 8px)');
    expect(ticket['border-end-start-radius']).toBe('var(--pc-tag-radius, 8px)');
  });

  it('offers four PLACEMENTS, and each one is a different relationship', () => {
    /* `edge` — clamped over the card's top edge, cut in by the white ring */
    const edge = baseDeclarations(card, '[data-pc-badge-place=edge] .pc-badge');
    expect(edge['inset-block-start']).toBe('calc(var(--pc-tag-edge-y, -10px) + var(--pc-tag-dy, 0px))');
    expect(edge['inset-inline-start']).toBe(
      'calc(var(--pc-tag-edge-x, var(--pc-inset, 12px)) + var(--pc-tag-dx, 0px))'
    );
    /* the action rail owns the other end of the same edge, and its width is
       ONE variable (`--pc-actions-w`: 30px disc + 8px inset, re-declared for
       the compact 2×2 cluster in `product-actions.scss`) so the tag and the
       rail cannot drift apart */
    expect(edge['max-width']).toBe(
      'calc(100% - var(--pc-inset, 12px) - var(--pc-actions-w, 46px))'
    );
    expect(edge['box-shadow']).toBe('0 0 0 var(--pc-tag-ring, 3px) var(--pc-tag-ring-color, #fff)');

    /* `frame` — inside the card's corner, wearing the CARD's corner on that
       side, and no ring by default: there is nothing to cut through */
    const frame = baseDeclarations(card, '[data-pc-badge-place=frame] .pc-badge');
    expect(frame['inset-block-start']).toBe('calc(0px + var(--pc-tag-dy, 0px))');
    expect(frame['border-start-start-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(frame['box-shadow']).toBe('0 0 0 var(--pc-tag-ring, 0px) var(--pc-tag-ring-color, #fff)');

    /* `attached` — square where it meets the card's inline edge */
    const attached = baseDeclarations(card, '[data-pc-badge-place=attached] .pc-badge');
    expect(attached['inset-inline-start']).toBe('calc(0px + var(--pc-tag-dx, 0px))');
    expect(attached['border-start-start-radius']).toBe('0');
    expect(attached['border-end-start-radius']).toBe('0');
    expect(attached['box-shadow']).toBe('0 0 0 var(--pc-tag-ring, 0px) var(--pc-tag-ring-color, #fff)');

    /* `free` — an independent tag: it floats, so it carries a real shadow */
    const free = baseDeclarations(card, '[data-pc-badge-place=free] .pc-badge');
    expect(free['inset-block-start']).toBe('calc(10px + var(--pc-tag-dy, 0px))');
    expect(free['box-shadow']).toContain('0 6px 16px -8px');
  });

  it('splits the edge label 9px outside the card and 16px inside it', () => {
    /* The geometry is an ARITHMETIC, not a pair of numbers: the label is one
       line of type plus its own vertical padding, and the anchor is that height
       minus the 16px that has to sit on the photograph. Change the padding and
       the offset has to follow, or the tag silently becomes half-and-half. */
    const label = baseDeclarations(card, '.pc-badge');
    const padY = Number(/var\(--pc-tag-pad-y, (\d+(?:\.\d+)?)px\)/.exec(label['padding'] ?? '')?.[1]);
    const fontSize = Number(/var\(--pc-tag-fs, (\d+(?:\.\d+)?)px\)/.exec(label['font-size'] ?? '')?.[1]);
    const lineHeight = Number(label['line-height']);
    expect([padY, fontSize, lineHeight]).toEqual([6, 10, 1.3]);
    const height = fontSize * lineHeight + padY * 2;
    expect(height).toBe(25);

    /* The anchor is measured from the card's PADDING box; the card carries a
       1px hairline, so -10px of padding box is 9px above the painted edge. */
    const border = baseDeclarations(card, '.s-product-card-vertical')['border'];
    expect(border).toContain('1px solid');
    const edge = baseDeclarations(card, '[data-pc-badge-place=edge] .pc-badge');
    const offset = Number(/var\(--pc-tag-edge-y, (-?\d+)px\)/.exec(edge['inset-block-start'] ?? '')?.[1]);
    expect(offset).toBe(-10);
    const above = Math.abs(offset) - 1;
    expect(above).toBe(9);
    expect(height - above).toBe(16);

    /* the compact scale moves the seam to 7px, and only the anchor moves: the
       compact padding and type are the card's own scale, not a second design */
    const compact = atRuleDeclarations(card, 'container', '(max-width: 190px)', '.s-product-card-vertical .pc-badge');
    expect(compact['--pc-tag-edge-y']).toBe('-8px');
    expect(compact['padding']).toBe('var(--pc-tag-pad-y, 4px) var(--pc-tag-pad-x, 7px)');
    expect(compact['font-size']).toBe('var(--pc-tag-fs, 9px)');
    expect(Math.abs(Number(compact['--pc-tag-edge-y'].replace('px', ''))) - 1).toBe(7);
  });

  it('trims the sold-out label’s padding at the compact scale, and only its padding', () => {
    /* «نفدت الكمية» is the longest label the store ships. On a 168px card it is
       the one tag that can crowd the photograph, so it gives up a pixel of
       padding on each axis — 4/7 becomes 3/6 — while its type and its contrast
       stay exactly where they were: readability is the constraint here, not
       the thing being traded away. */
    const soldOut = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      '.s-product-card-vertical .pc-badge--out'
    );
    expect(soldOut['padding']).toBe('var(--pc-tag-pad-y, 3px) var(--pc-tag-pad-x, 6px)');

    /* the shared tag keeps 4/7 and 9px, and the sold-out rule never touches the
       type — a smaller label would be a legibility change, not a padding one */
    const tag = atRuleDeclarations(
      card,
      'container',
      '(max-width: 190px)',
      '.s-product-card-vertical .pc-badge'
    );
    expect(tag['padding']).toBe('var(--pc-tag-pad-y, 4px) var(--pc-tag-pad-x, 7px)');
    expect(tag['font-size']).toBe('var(--pc-tag-fs, 9px)');
    expect(soldOut['font-size']).toBeUndefined();

    /* and the step is in the FALLBACK, so a merchant who set their own padding
       keeps it at every width — the store card's standing rule */
    expect(soldOut['padding']).toContain('var(--pc-tag-pad-y,');
    expect(soldOut['padding']).toContain('var(--pc-tag-pad-x,');
  });

  it('rings the tag in white by day and in the night surface after dark', () => {
    /* the ring is what makes the notch: a label whose outline is the card's own
       paper stops the card's border and lets it resume */
    expect(baseDeclarations(card, '.app-inner')['--pc-tag-ring-color']).toBe('#fff');
    /* a white ring on a night card is a glow, not a cut */
    const night = baseDeclarations(card, 'html.dark .s-product-card-vertical');
    expect(night['--pc-tag-ring-color']).toBe('var(--pc-bg)');
    /* the menu card wears the same tag, so it carries the same line */
    expect(baseDeclarations(menu, 'html.dark .morph-featured .morph-menu-card')['--pc-tag-ring-color']).toBe(
      'var(--bg-card)'
    );
  });

  it('turns any placement into a STRIP when the merchant asks for full width', () => {
    const strip = baseDeclarations(card, '[data-pc-badge-stretch="1"] .pc-badge');
    expect(strip['inset-inline']).toBe('0');
    expect(strip['width']).toBe('100%');
    expect(strip['max-width']).toBe('none');
    expect(strip['justify-content']).toBe('center');
    /* FLUSH, not 10px down: a full-width band with a strip of photograph above
       it reads as a floating bar, not as a placement */
    expect(strip['inset-block-start']).toBe('calc(0px + var(--pc-tag-dy, 0px))');
  });

  it('gives a strip the card own top corners, and only those', () => {
    /* A band spans the whole top edge, so BOTH of its top corners are the card's
       corner — otherwise the far one stays square and pokes out of the
       silhouette. The floor corners stay square: the band sits on the picture.
       (Sass normalises `'1'` to `"1"` and drops the quotes on `frame`, which is a
       valid identifier — the selector below is the compiled form.) */
    const band = baseDeclarations(
      card,
      '[data-pc-badge-stretch="1"][data-pc-badge-place=frame] .pc-badge'
    );
    expect(band['border-start-start-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(band['border-start-end-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(band['border-end-start-radius']).toBeUndefined();
    expect(band['border-end-end-radius']).toBeUndefined();
  });

  it('steps the control rail BELOW a strip instead of printing the discs on it', () => {
    /* A white heart disc on a white band has no edge at all, and on a coloured
       band it reads as a hole punched through the label. The step is the band's
       own height — its vertical padding twice, one line of type at 1.3, its
       border — plus the 8px inset the rail already keeps from the card's edge.
       It lives in `product-actions.scss`, beside the `inset-block-start` it has
       to beat, and it applies to EVERY card in the grid: a row where two cards
       carry a band and two do not would otherwise hang its hearts at two
       heights. */
    const rail = baseDeclarations(actions, '[data-pc-badge-stretch="1"] .pc-actions');
    expect(rail['inset-block-start']).toBe(
      'calc(2 * var(--pc-tag-pad-y, 6px) + 2 * var(--pc-tag-bw, 0px) + var(--pc-tag-fs, 10px) * 1.3 + var(--pc-tag-dy, 0px) + 8px)'
    );
    /* and the band is not allowed to reserve that space a second time by moving
       the engine's own heart, which the rail replaced */
    const engineHeart = baseDeclarations(
      card,
      '[data-pc-badge-stretch="1"] .s-product-card-vertical .s-product-card-image > .s-button-wrap'
    );
    expect(engineHeart['inset-block-start']).toBeUndefined();
  });

  it('paints the two TYPES from one skin, with a tone each', () => {
    /* `inherit` is the shared face; the other three are the same skin in a
       different weight, so availability can stay quieter than a discount */
    const outQuiet = baseDeclarations(card, '[data-pc-badge-out=quiet] .pc-badge--out');
    expect(outQuiet['background']).toBe('color-mix(in srgb, var(--pc-ink) 68%, var(--pc-bg))');
    expect(outQuiet['color']).toBe('var(--pc-bg)');
    /* and OPAQUE — `--pc-muted` is ink with `transparent` in it, which let the
       photograph through the tag */
    expect(outQuiet['background']).not.toContain('transparent');

    const saleInk = baseDeclarations(card, '[data-pc-badge-sale=ink] .pc-badge:not(.pc-badge--out)');
    expect(saleInk['background']).toBe('var(--pc-ink)');
    expect(saleInk['color']).toBe('var(--pc-bg)');

    const salePaper = baseDeclarations(card, '[data-pc-badge-sale=paper] .pc-badge:not(.pc-badge--out)');
    expect(salePaper['background']).toBe('var(--pc-bg)');
    expect(salePaper['color']).toBe('var(--pc-ink)');
  });

  it('carries the optional details without a second element', () => {
    const dot = baseDeclarations(card, '[data-pc-badge-detail=dot] .pc-badge::before');
    /* Sass normalises the empty string to double quotes */
    expect(dot['content']).toBe('""');
    expect(dot['width']).toBe('4px');
    expect(dot['border-radius']).toBe('50%');

    const keyline = baseDeclarations(card, '[data-pc-badge-detail=keyline] .pc-badge::after');
    expect(keyline['position']).toBe('absolute');
    expect(keyline['inset']).toBe('3px');
    /* it follows the tag's own silhouette instead of imposing a second one */
    expect(keyline['border-radius']).toBe('inherit');
  });

  it('lets the card stop clipping, and gives every corner an owner', () => {
    const tile = baseDeclarations(card, '.s-product-card-vertical');
    /* `edge` and `frame` are the same element in two places: a clipped card
       could not carry either */
    expect(tile['overflow']).toBe('visible');
    expect(tile['--pc-corner']).toBe('var(--pc-radius)');
    expect(tile['border-radius']).toBe('var(--pc-corner)');

    const print = baseDeclarations(card, '.s-product-card-vertical .s-product-card-image');
    expect(print['border-start-start-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(print['border-start-end-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(print['border-end-start-radius']).toBe('0');
    /* and it still clips, which is what keeps the hover zoom in its plate */
    expect(print['overflow']).toBe('hidden');

    const label = baseDeclarations(card, '.s-product-card-vertical .s-product-card-content');
    expect(label['border-end-start-radius']).toBe('calc(var(--pc-corner) - 1px)');
    expect(label['border-end-end-radius']).toBe('calc(var(--pc-corner) - 1px)');
  });

  it('prints the engine’s own tag exactly zero times on the vertical card', () => {
    /* The engine's node lives INSIDE the print, where the photo's corner clips
       it and where it can never reach the card's edge. The theme prints the
       same words as `.pc-badge` on the card root. */
    expect(
      baseDeclarations(card, '.s-product-card-vertical .s-product-card-promotion-title')['display']
    ).toBe('none');
  });

  it('leaves the mega card’s tag with NOTHING of its own but the stacking order', () => {
    /* The skin and the placement are shared rules; a hardcoded inset here would
       out-rank the merchant's choice and the menu tag would stop following it. */
    const menuBadge = baseDeclarations(menu, '.morph-featured .morph-menu-card__badge');
    expect(menuBadge['background']).toBeUndefined();
    expect(menuBadge['border-radius']).toBeUndefined();
    expect(menuBadge['font-size']).toBeUndefined();
    expect(menuBadge['padding']).toBeUndefined();
    expect(menuBadge['position']).toBeUndefined();
    expect(menuBadge['inset-block-start']).toBeUndefined();
    expect(menuBadge['inset-inline-start']).toBeUndefined();
    expect(menuBadge['z-index']).toBe('4');
  });

  it('hides the tag from the one merchant switch', () => {
    const off = baseDeclarations(card, '[data-pc-badge="0"] .s-product-card-promotion-title');
    expect(off['display']).toBe('none');
    const selectors = new Set<string>();
    card.walkRules((rule) => {
      if (rule.selectors.includes('[data-pc-badge="0"] .pc-badge')) {
        rule.walkDecls('display', (d) => selectors.add(d.value));
      }
    });
    expect([...selectors]).toEqual(['none']);
  });
});

describe('the photo keeps the shape the merchant chose', () => {
  it('never lets the plate grow past its ratio', () => {
    /* `product.scss` used to say `@apply flex-none sm:flex-1` on the
       fit-height plate. On a desktop the plate then ate every pixel the card
       had left over, so the merchant's square ratio came out 213x216 on one
       card and 213x240 on the next: three different crops in one row, and a
       different photo size on every row. Measured, not guessed. */
    const plate = baseDeclarations(
      engine,
      '.s-product-card-fit-height.s-product-card-vertical .s-product-card-image'
    );
    expect(plate['flex']).toBe('none');
    /* the old rule was `flex-none sm:flex-1` — the growing half lived inside a
       media query, so a base-only assertion would have passed while the desktop
       card kept eating its own slack */
    engine.walkAtRules('media', (atRule) => {
      atRule.walkRules((rule) => {
        if (!rule.selectors.includes('.s-product-card-fit-height.s-product-card-vertical .s-product-card-image')) {
          return;
        }
        rule.walkDecls('flex', (decl) => {
          const grow = decl.value.trim().split(/\s+/)[0];
          expect(grow, `${atRule.params} must not grow the plate`).not.toBe('1');
        });
      });
    });
    /* and the card system itself must not grow it either */
    expect(baseDeclarations(card, '.s-product-card-vertical .s-product-card-image')['flex']).toBe(
      '0 0 auto'
    );
  });

  it('keeps a missing or broken photo a deliberate plate, not a blank rectangle', () => {
    /* The engine still renders an `<img>` with an empty or dead `src`. The
       monogram is a watermark sized by the CARD's width (`cqw`), so it holds
       its proportion at 130px and at 300px without a media query. */
    const mono = baseDeclarations(card, '.pc-monogram');
    expect(mono['font-size']).toBe('30cqw');
    expect(mono['position']).toBe('absolute');
    /* it must never eat a click meant for the product link */
    expect(mono['pointer-events']).toBe('none');
    /* and the dead `<img>` is hidden, so a broken-image glyph never sits on top
       of the watermark */
    expect(baseDeclarations(card, '.s-product-card-image:has(.pc-monogram) img')['opacity']).toBe(
      '0'
    );
  });
});

describe('night mode repaints both surfaces from the same tokens', () => {
  /* The merchant's palette is a LIGHT palette. A store that has night mode on
     needs the card to belong to it, so these are the only declarations in
     either file that shadow an inherited `--pc-*` — and they must be the same
     values on both cards, or one surface goes dark and the other stays ivory. */
  it('re-points the same palette on both cards', () => {
    const store = baseDeclarations(card, 'html.dark .s-product-card-vertical');
    const mega = baseDeclarations(menu, 'html.dark .morph-featured .morph-menu-card');
    for (const token of ['--pc-bg', '--pc-image-bg', '--pc-ink', '--pc-line', '--pc-muted']) {
      expect(store[token], `store night ${token}`).toBeTruthy();
      expect(mega[token], `mega night ${token}`).toBe(store[token]);
    }
    expect(store['--pc-bg']).toBe('var(--surface-1)');
    expect(store['--pc-ink']).toBe('var(--ink-1)');
    /* the ROLE, not `--surface-2`: `global-settings.scss` already resolves the
       night face per mode, so a merchant's palette reaches the photo well */
    expect(store['--pc-image-bg']).toBe('var(--surface-media)');
  });

  it('keeps the horizontal layouts’ badge on the same night pair', () => {
    /* `product.scss` still paints the horizontal and minimal layouts from
       `--pc-badge-*`; the vertical card no longer reads it. Dropping the pair
       from either night block would leave those layouts with a light badge on a
       dark tile. */
    const store = baseDeclarations(card, 'html.dark .s-product-card-vertical');
    const mega = baseDeclarations(menu, 'html.dark .morph-featured .morph-menu-card');
    expect(store['--pc-badge-bg']).toBe('var(--surface-3)');
    expect(store['--pc-badge-ink']).toBe('var(--ink-1)');
    expect(mega['--pc-badge-bg']).toBe(store['--pc-badge-bg']);
    expect(mega['--pc-badge-ink']).toBe(store['--pc-badge-ink']);
  });

  it('gives the controls on the print a solid night plate', () => {
    /* The heart and the disc float over the PHOTO, and a photo is light far
       more often than not. A translucent tint of the night surface measured
       mid-grey over a white product shot — light ink on grey, the weakest
       control on the card. */
    const storeHeart = baseDeclarations(
      card,
      'html.dark .s-product-card-vertical .s-product-card-image .s-product-card-wishlist-btn'
    );
    expect(storeHeart['background']).toBe('var(--surface-3)');
    const megaHeart = baseDeclarations(menu, 'html.dark .morph-featured .morph-menu-card__fav');
    expect(megaHeart['background']).toBe('var(--surface-3)');
  });

  it('does not mute the struck price twice', () => {
    /* `product.scss` halves the span with `opacity-50`; the muted token already
       carries the weight, and both together left the old price at ~33% alpha. */
    const span = baseDeclarations(card, '.s-product-card-vertical .s-product-card-sale-price span');
    expect(span['opacity']).toBe('1');
    expect(span['color']).toBe('var(--pc-muted)');
  });

  it('sizes the currency glyph under the figure, so the money reads as one number', () => {
    /* The currency is an `<i class="sicon-sar">` INSIDE the price heading, not a
       span: at the figure's own 20px/650 it rendered as a second number of
       equal importance. */
    const glyph = baseDeclarations(
      card,
      '.s-product-card-vertical .s-product-card-sale-price h4 i'
    );
    expect(glyph['font-size']).toBe('0.58em');
    expect(glyph['color']).toBe('var(--pc-muted)');
  });
});
