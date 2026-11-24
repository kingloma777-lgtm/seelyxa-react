import { describe, it, expect } from 'vitest';
import {
  readProductCardSettings,
  readProductCardOverrides,
  resolveProductCardSettings,
  productCardVars,
  productCardOverrideVars,
  productCardOverrideAttrs,
  productCardFlags,
  PRODUCT_CARD_DEFAULTS,
  PRODUCT_CARD_OVERRIDES_INHERIT,
  PRODUCT_CARD_OVERRIDE_PREFIX,
  HOVER_GEOMETRY,
  RATIO_GEOMETRY,
} from '../../app/lib/productCardSettings';
import { BADGE_DEFAULTS } from '../../app/lib/productBadgeStyle';

/**
 * The card settings are read once and pushed into CSS, so a wrong read is not
 * a visible error — it is a control that does nothing. These pin the three
 * shapes the engine actually sends (scalar, `[{value}]`, number) and the two
 * clamps that keep a saved out-of-range value from breaking the layout.
 */

describe('readProductCardSettings', () => {
  it('returns the reference design when the store has never opened the panel', () => {
    expect(readProductCardSettings(undefined)).toEqual(PRODUCT_CARD_DEFAULTS);
    expect(readProductCardSettings({})).toEqual(PRODUCT_CARD_DEFAULTS);
  });

  it('reads booleans, dropdown items and numbers by their prefixed field id', () => {
    const s = readProductCardSettings({
      product_card_badge: false,
      product_card_rating: true,
      product_card_desc: false,
      product_card_wishlist: false,
      product_card_cart_style: [{ label: 'شريط', value: 'bar', key: 'x' }],
      product_card_radius: 6,
      product_card_bg: '#101010',
      product_card_shadow: 'lift',
      product_card_title_font: 'serif',
      product_card_img_ratio: 'portrait',
    });

    expect(s.badge).toBe(false);
    expect(s.rating).toBe(true);
    expect(s.desc).toBe(false);
    expect(s.wishlist).toBe(false);
    expect(s.cart).toBe('bar');
    expect(s.radius).toBe(6);
    expect(s.bg).toBe('#101010');
    expect(s.shadow).toBe('lift');
    expect(s.font).toBe('serif');
    expect(s.ratio).toBe('portrait');
  });

  it('accepts a dropdown that arrives as a bare string, which is how preview data stores it', () => {
    const s = readProductCardSettings({ product_card_cart_style: 'bar' });
    expect(s.cart).toBe('bar');
  });

  it('defaults the gallery to on and the «no ratings» wording to OFF', () => {
    const s = readProductCardSettings(undefined);
    expect(s.gallery).toBe(true);
    /* The label no longer depends on that row: the meta rail is a reserved
       grid track, so a product with no score simply has a rail with no second
       half — and a catalogue without reviews reads as calm instead of forty
       cards announcing the same absence. The merchant opts in to the wording. */
    expect(s.ratingEmpty).toBe(false);
    expect(readProductCardSettings({ product_card_rating_empty: true }).ratingEmpty).toBe(true);
    expect(readProductCardSettings({ product_card_gallery: false }).gallery).toBe(false);
  });

  it('defaults the short line to ONE line — the card is a caption, not a paragraph', () => {
    expect(readProductCardSettings(undefined).descLines).toBe(1);
    expect(readProductCardSettings({ product_card_desc_lines: 2 }).descLines).toBe(2);
  });

  it('carries the badge system as ONE object, not a scattering of fields', () => {
    /* The badge is a system with its own reader (`lib/productBadgeStyle`); the
       card settings only carry it, so a new badge control never means a new
       field on this interface. */
    expect(readProductCardSettings(undefined).badgeStyle).toEqual(BADGE_DEFAULTS);
    const s = readProductCardSettings({
      product_card_badge_placement: 'frame',
      product_card_badge_shape: 'ticket',
      product_card_badge_font_size: 12,
    });
    expect(s.badgeStyle.placement).toBe('frame');
    expect(s.badgeStyle.shape).toBe('ticket');
    expect(s.badgeStyle.fontSize).toBe(12);
    /* and the other properties are untouched by those three */
    expect(s.badgeStyle.ring).toBe(BADGE_DEFAULTS.ring);
  });

  it('clamps a saved radius and line count instead of trusting the payload', () => {
    expect(readProductCardSettings({ product_card_radius: 400 }).radius).toBe(44);
    expect(readProductCardSettings({ product_card_radius: -20 }).radius).toBe(0);
    expect(readProductCardSettings({ product_card_desc_lines: 0 }).descLines).toBe(1);
    expect(readProductCardSettings({ product_card_desc_lines: 9 }).descLines).toBe(4);
  });

  it('falls back to the default when a dropdown holds a value the theme does not know', () => {
    const s = readProductCardSettings({
      product_card_cart_style: 'diagonal',
      product_card_shadow: 'glow',
      product_card_title_font: 'comic',
      product_card_img_ratio: 'hexagon',
    });

    expect(s.cart).toBe(PRODUCT_CARD_DEFAULTS.cart);
    expect(s.shadow).toBe(PRODUCT_CARD_DEFAULTS.shadow);
    expect(s.font).toBe(PRODUCT_CARD_DEFAULTS.font);
    expect(s.ratio).toBe(PRODUCT_CARD_DEFAULTS.ratio);
  });

  it('keeps the merchant colour and does not read an empty string as "use the default"', () => {
    // an unset colour must not become transparent
    expect(readProductCardSettings({ product_card_bg: '' }).bg).toBe(PRODUCT_CARD_DEFAULTS.bg);
    expect(readProductCardSettings({ product_card_bg: '#123456' }).bg).toBe('#123456');
  });

  it('reads the image presentation: how the photo fills the plate, and where it is cut', () => {
    expect(readProductCardSettings({ product_card_img_fit: 'contain' }).imgFit).toBe('contain');
    expect(readProductCardSettings({ product_card_img_position: 'top' }).imgPosition).toBe('top');
    /* the default is what the storefront has always painted — a new default
       would re-frame every photo in every grid on upgrade */
    expect(readProductCardSettings(undefined).imgFit).toBe('cover');
    expect(readProductCardSettings(undefined).imgPosition).toBe('center');
    /* an unknown value falls back rather than reaching CSS as a broken keyword */
    expect(readProductCardSettings({ product_card_img_fit: 'stretch' }).imgFit).toBe('cover');
    expect(readProductCardSettings({ product_card_img_position: 'left' }).imgPosition).toBe('center');
  });

  it('reads the hover choice, and falls back to the design on garbage', () => {
    expect(readProductCardSettings({ product_card_hover: 'none' }).hover).toBe('none');
    expect(readProductCardSettings({ product_card_hover: 'zoom' }).hover).toBe('zoom');
    expect(readProductCardSettings(undefined).hover).toBe('both');
    expect(readProductCardSettings({ product_card_hover: 'wobble' }).hover).toBe('both');
  });
});

describe('productCardVars', () => {
  it('writes the radius in px and the line clamp as a unitless number', () => {
    const vars = productCardVars(readProductCardSettings({ product_card_radius: 18, product_card_desc_lines: 3 }));
    expect(vars['--pc-radius']).toBe('18px');
    // `-webkit-line-clamp: 3px` is invalid and silently drops the clamp
    expect(vars['--pc-desc-lines']).toBe('3');
  });

  it('leaves the DEFAULT corner and panel on the store’s roles', () => {
    /* The card is the largest surface on the storefront, and it used to be
       pinned to `22px` / `#fdfaf3` no matter what the store settings said — so
       `global_radius` and `global_surface_preset` moved every element on the
       page except the one the customer is looking at. The default is now a
       reference with the designed value as its fallback; anything the merchant
       actually picks in the card panel is still a literal that wins. */
    const vars = productCardVars(readProductCardSettings({}));
    expect(vars['--pc-radius']).toBe('var(--radius-card, 22px)');
    expect(vars['--pc-bg']).toBe('var(--gs-card-surface, #fdfaf3)');

    // a chosen value is written verbatim, so the card setting stays in charge
    const chosen = productCardVars(
      readProductCardSettings({ product_card_radius: 0, product_card_bg: '#101010' })
    );
    expect(chosen['--pc-radius']).toBe('0px');
    expect(chosen['--pc-bg']).toBe('#101010');
  });

  it('emits the image-ratio geometry as the two variables the cards read', () => {
    /* The store card's ratio block keys off `--pc-ar-pad` and the mega menu's
       media plate off `--pc-ar-num` — both derived here from ONE setting, so
       the two card contexts can never disagree about the merchant's ratio. */
    const square = productCardVars(readProductCardSettings({}));
    expect(square['--pc-ar-num']).toBe('1');
    expect(square['--pc-ar-pad']).toBe('100%');

    const portrait = productCardVars(
      readProductCardSettings({ product_card_img_ratio: 'portrait' })
    );
    expect(portrait['--pc-ar-num']).toBe('0.75');
    expect(portrait['--pc-ar-pad']).toBe('133.3333%');

    const landscape = productCardVars(
      readProductCardSettings({ product_card_img_ratio: 'landscape' })
    );
    expect(landscape['--pc-ar-num']).toBe('1.3333');
    expect(landscape['--pc-ar-pad']).toBe('75%');
  });

  it('emits the image presentation and the hover geometry both cards interpolate', () => {
    /* ONE setting, the derived values as variables — this is what lets the
       store card and the mega card share the photo's presentation instead of
       each hardcoding its own `object-fit`. */
    const chosen = productCardVars(
      readProductCardSettings({
        product_card_img_fit: 'contain',
        product_card_img_position: 'top',
      })
    );
    expect(chosen['--pc-img-fit']).toBe('contain');
    expect(chosen['--pc-img-pos']).toBe('top');

    const byDefault = productCardVars(readProductCardSettings({}));
    expect(byDefault['--pc-img-fit']).toBe('cover');
    expect(byDefault['--pc-img-pos']).toBe('center');
    /* the shipped hover is the design's: the tile rises and the photo grows */
    expect(byDefault['--pc-hover-lift']).toBe('-4px');
    expect(byDefault['--pc-img-zoom']).toBe('1.045');
  });

  it('turns each hover choice into its own pair of motions', () => {
    /* The two motions are separate layers: folding the zoom into the tile's
       transform would scale the title, the badge and the price with the photo. */
    const at = (hover: 'both' | 'lift' | 'zoom' | 'none') =>
      productCardVars(readProductCardSettings({ product_card_hover: hover }));

    expect([at('lift')['--pc-hover-lift'], at('lift')['--pc-img-zoom']]).toEqual(['-4px', '1']);
    expect([at('zoom')['--pc-hover-lift'], at('zoom')['--pc-img-zoom']]).toEqual(['0px', '1.045']);
    expect([at('none')['--pc-hover-lift'], at('none')['--pc-img-zoom']]).toEqual(['0px', '1']);
  });

  it('derives the geometry tables from one place, so a new choice cannot half-exist', () => {
    expect(Object.keys(HOVER_GEOMETRY).sort()).toEqual(['both', 'lift', 'none', 'zoom']);
    expect(Object.keys(RATIO_GEOMETRY).sort()).toEqual(['landscape', 'portrait', 'square']);
  });
});

describe('productCardFlags', () => {
  it('turns every switch into 0/1 and every choice into its own value', () => {
    const flags = productCardFlags(
      readProductCardSettings({
        product_card_badge: false,
      product_card_rating: false,
      product_card_rating_count: false,
      product_card_rating_empty: false,
      product_card_desc: false,
        product_card_wishlist: false,
        product_card_cart_style: 'bar',
        product_card_shadow: 'none',
        product_card_title_font: 'serif',
        product_card_badge_shape: 'pill',
      })
    );

    expect(flags).toMatchObject({
      'data-pc-badge': '0',
      /* the shape travels as its own attribute even with the tag switched off:
         the merchant's choice survives the switch, so re-enabling the tag
         restores the corner they picked */
      'data-pc-badge-shape': 'pill',
      'data-pc-rating': '0',
      'data-pc-rating-count': '0',
      'data-pc-rating-empty': '0',
      'data-pc-desc': '0',
      'data-pc-wish': '0',
      'data-pc-cart': 'bar',
      'data-pc-shadow': 'none',
      'data-pc-font': 'serif',
    });
  });
});

/* ══ the Global Product Card System's override layer ═════════════════════════
   These pin the inheritance contract the merchant panel promises:
     gate off        → every local is ignored, whatever is saved
     'inherit'       → the GLOBAL value, read live — never a copy of it
     one override    → touches that property only, nothing else
     back to inherit → the global value is restored on the next render
   A regression in any of the four is a control that lies, not a style bug. */

describe('readProductCardOverrides', () => {
  it('inherits everything while the panel is off, even with locals saved', () => {
    expect(
      readProductCardOverrides({
        mega_card_ratio: 'portrait',
        mega_card_radius: '0',
        mega_card_bg: '#101010',
      })
    ).toEqual(PRODUCT_CARD_OVERRIDES_INHERIT);
  });

  it('inherits everything when the component has never been configured', () => {
    expect(readProductCardOverrides(undefined)).toEqual(PRODUCT_CARD_OVERRIDES_INHERIT);
    expect(readProductCardOverrides({})).toEqual(PRODUCT_CARD_OVERRIDES_INHERIT);
  });

  it('reads a chosen property and leaves the rest on inherit', () => {
    const ov = readProductCardOverrides({
      mega_card_customize: true,
      mega_card_ratio: 'portrait',
    });

    expect(ov.customize).toBe(true);
    expect(ov.ratio).toBe('portrait');
    /* per-property independence: one local decision is not a whole design */
    expect(ov.radius).toBe('inherit');
    expect(ov.shadow).toBe('inherit');
    expect(ov.font).toBe('inherit');
    expect(ov.cart).toBe('inherit');
    expect(ov.bg).toBe('');
    expect(ov.badge).toBe('inherit');
    expect(ov.rating).toBe('inherit');
  });

  it('turns the radius choice into a number, and keeps inherit a string', () => {
    const ov = readProductCardOverrides({ mega_card_customize: true, mega_card_radius: '8' });
    expect(ov.radius).toBe(8);
    expect(readProductCardOverrides({ mega_card_customize: true, mega_card_radius: 'inherit' }).radius).toBe('inherit');
  });

  it('treats a colour equal to the global default as inherit — the picker cannot be empty', () => {
    const ov = readProductCardOverrides({
      mega_card_customize: true,
      mega_card_bg: '#fdfaf3',
      mega_card_image_bg: '#f4ebdc',
      mega_card_ink: '#2b2519',
    });

    /* the header panel's rule: the shipped default IS the reset marker, so
       "back to inherit" is one click and never a second control */
    expect(ov.bg).toBe('');
    expect(ov.imageBg).toBe('');
    expect(ov.ink).toBe('');
  });

  it('keeps a real colour and refuses a payload that is not one', () => {
    const ov = readProductCardOverrides({
      mega_card_customize: true,
      mega_card_bg: '#101010',
      mega_card_ink: 'url(javascript:alert(1))',
    });

    expect(ov.bg).toBe('#101010');
    /* a settings payload is merchant input: a non-colour never reaches style */
    expect(ov.ink).toBe('');
  });

  it('reads the switches as tri-state and falls back to inherit on garbage', () => {
    const ov = readProductCardOverrides({
      mega_card_customize: true,
      mega_card_badge: 'off',
      mega_card_wishlist: 'on',
      mega_card_desc: 'diagonal',
    });

    expect(ov.badge).toBe('off');
    expect(ov.wishlist).toBe('on');
    expect(ov.desc).toBe('inherit');
  });

  it('reads the image presentation and the hover choice as independently overridable', () => {
    const ov = readProductCardOverrides({
      mega_card_customize: true,
      mega_card_img_fit: 'contain',
      mega_card_img_position: 'bottom',
      mega_card_hover: 'none',
    });

    expect(ov.imgFit).toBe('contain');
    expect(ov.imgPosition).toBe('bottom');
    expect(ov.hover).toBe('none');
    /* and nothing else was pinned by touching them */
    expect(ov.ratio).toBe('inherit');
    expect(ov.radius).toBe('inherit');
    expect(ov.bg).toBe('');

    expect(
      readProductCardOverrides({ mega_card_customize: true, mega_card_img_fit: 'stretch' }).imgFit
    ).toBe('inherit');
  });

  /* ── the layer belongs to the SYSTEM, not to the mega menu ─────────────── */
  it('ships `mega_card` as the default prefix, so every saved store keeps working', () => {
    expect(PRODUCT_CARD_OVERRIDE_PREFIX).toBe('mega_card');
    expect(readProductCardOverrides({ mega_card_customize: true, mega_card_ratio: 'portrait' }).ratio).toBe(
      'portrait'
    );
  });

  it('reads any component’s prefix, which is what makes the system reusable', () => {
    /* A new block that renders products adds a panel and calls the same reader
       with its own prefix — no second copy of the inheritance rules. */
    const ov = readProductCardOverrides(
      {
        featured_card_customize: true,
        featured_card_ratio: 'landscape',
        featured_card_hover: 'lift',
      },
      'featured_card'
    );

    expect(ov.customize).toBe(true);
    expect(ov.ratio).toBe('landscape');
    expect(ov.hover).toBe('lift');
  });

  it('never mixes two components’ saved values', () => {
    /* The whole promise of a scoped override: the menu's local ratio must not
       answer for a block, and a block's locals must not leak into the menu. */
    const data = {
      mega_card_customize: true,
      mega_card_ratio: 'portrait',
      featured_card_customize: false,
      featured_card_ratio: 'landscape',
    };

    expect(readProductCardOverrides(data, 'mega_card').ratio).toBe('portrait');
    expect(readProductCardOverrides(data, 'featured_card')).toEqual(
      PRODUCT_CARD_OVERRIDES_INHERIT
    );
    /* a component that never configured anything inherits, whatever else is
       saved under a sibling prefix */
    expect(readProductCardOverrides({ mega_card_customize: true }, 'featured_card')).toEqual(
      PRODUCT_CARD_OVERRIDES_INHERIT
    );
  });
});

describe('resolveProductCardSettings', () => {
  it('gives the component the global design untouched when nothing is overridden', () => {
    const global = readProductCardSettings({ product_card_radius: 18 });
    const resolved = resolveProductCardSettings(global, PRODUCT_CARD_OVERRIDES_INHERIT);
    expect(resolved).toEqual(global);
  });

  it('overrides the chosen property only — the rest still track the globals', () => {
    const global = readProductCardSettings({ product_card_radius: 18, product_card_img_ratio: 'square' });
    const resolved = resolveProductCardSettings(
      global,
      readProductCardOverrides({ mega_card_customize: true, mega_card_ratio: 'portrait' })
    );

    expect(resolved.ratio).toBe('portrait');
    /* untouched properties keep following the GLOBAL values, live */
    expect(resolved.radius).toBe(18);
    expect(resolved.shadow).toBe(global.shadow);
    expect(resolved.bg).toBe(global.bg);
  });

  it('follows a later global change on every property left on inherit', () => {
    /* the anti-snapshot rule: an override must never pin the properties it
       did not choose — the merchant changing the global next week still moves
       the component, exactly as the panel's description promises */
    const ov = readProductCardOverrides({ mega_card_customize: true, mega_card_ratio: 'portrait' });
    const before = resolveProductCardSettings(
      readProductCardSettings({ product_card_radius: 22 }),
      ov
    );
    const after = resolveProductCardSettings(
      readProductCardSettings({ product_card_radius: 8 }),
      ov
    );

    expect(after.radius).toBe(8);
    /* the local decision survives the global change untouched */
    expect(after.ratio).toBe('portrait');
    expect(before.ratio).toBe('portrait');
  });

  it('resolves the switches independently of each other', () => {
    const resolved = resolveProductCardSettings(
      readProductCardSettings({ product_card_badge: false, product_card_desc: true }),
      readProductCardOverrides({
        mega_card_customize: true,
        mega_card_badge: 'on',
        mega_card_desc: 'off',
      })
    );

    expect(resolved.badge).toBe(true);
    expect(resolved.desc).toBe(false);
    /* a switch that was not re-decided keeps the global one */
    expect(resolved.wishlist).toBe(true);
    expect(resolved.rating).toBe(true);
  });

  it('restores the global value the moment a property goes back to inherit', () => {
    const global = readProductCardSettings({ product_card_shadow: 'lift' });
    const overridden = resolveProductCardSettings(
      global,
      readProductCardOverrides({ mega_card_customize: true, mega_card_shadow: 'none' })
    );
    const restored = resolveProductCardSettings(
      global,
      readProductCardOverrides({ mega_card_customize: true, mega_card_shadow: 'inherit' })
    );

    expect(overridden.shadow).toBe('none');
    expect(restored.shadow).toBe('lift');
  });

  it('inherits the photo presentation and the hover choice per property', () => {
    /* The acceptance case from the brief: a component that wants ONLY a
       different ratio keeps the store's fit, position and hover untouched —
       and keeps following them if the merchant changes them later. */
    const global = readProductCardSettings({
      product_card_img_fit: 'contain',
      product_card_img_position: 'top',
      product_card_hover: 'zoom',
    });
    const ratioOnly = readProductCardOverrides({
      mega_card_customize: true,
      mega_card_ratio: 'portrait',
    });

    const resolved = resolveProductCardSettings(global, ratioOnly);
    expect(resolved.ratio).toBe('portrait');
    expect(resolved.imgFit).toBe('contain');
    expect(resolved.imgPosition).toBe('top');
    expect(resolved.hover).toBe('zoom');

    /* a later global change still reaches every inherited property */
    const moved = resolveProductCardSettings(
      readProductCardSettings({ product_card_img_fit: 'cover' }),
      ratioOnly
    );
    expect(moved.imgFit).toBe('cover');
    expect(moved.ratio).toBe('portrait');
  });

  it('lets a component re-decide the photo and the hover on their own', () => {
    const resolved = resolveProductCardSettings(
      readProductCardSettings({}),
      readProductCardOverrides({
        mega_card_customize: true,
        mega_card_img_fit: 'contain',
        mega_card_hover: 'none',
      })
    );

    expect(resolved.imgFit).toBe('contain');
    expect(resolved.hover).toBe('none');
    /* untouched properties keep the global design */
    expect(resolved.imgPosition).toBe(PRODUCT_CARD_DEFAULTS.imgPosition);
    expect(resolved.radius).toBe(PRODUCT_CARD_DEFAULTS.radius);
  });
});

describe('productCardOverrideVars', () => {
  it('writes ONLY the overridden properties — inheritance is the absence of a declaration', () => {
    const vars = productCardOverrideVars(
      readProductCardOverrides({ mega_card_customize: true, mega_card_ratio: 'landscape' })
    );

    expect(vars).toEqual({ '--pc-ar-num': '1.3333', '--pc-ar-pad': '75%' });
  });

  it('writes the ratio geometry, the radius in px and both card-surface variables', () => {
    const vars = productCardOverrideVars(
      readProductCardOverrides({
        mega_card_customize: true,
        mega_card_ratio: 'portrait',
        mega_card_radius: '12',
        mega_card_bg: '#101010',
      })
    );

    expect(vars['--pc-ar-num']).toBe('0.75');
    expect(vars['--pc-ar-pad']).toBe('133.3333%');
    expect(vars['--pc-radius']).toBe('12px');
    /* `--bg-card` is the chain level the mega card's panel actually reads —
       without it a local colour would lose to the level `.app-inner` computes */
    expect(vars['--pc-bg']).toBe('#101010');
    expect(vars['--bg-card']).toBe('#101010');
  });

  it('writes nothing at all for a component left on Inherit Global', () => {
    expect(productCardOverrideVars(readProductCardOverrides({ mega_card_ratio: 'portrait' }))).toEqual({});
  });

  it('writes the photo presentation and the hover pair as inherited variables', () => {
    /* Variables, not attributes: one declaration on the component's subtree
       reaches the plate, the photo and the gallery slides — and it is the same
       channel the global panel writes, so the cascade has one rule. */
    const vars = productCardOverrideVars(
      readProductCardOverrides({
        mega_card_customize: true,
        mega_card_img_fit: 'contain',
        mega_card_img_position: 'top',
        mega_card_hover: 'none',
      })
    );

    expect(vars).toEqual({
      '--pc-img-fit': 'contain',
      '--pc-img-pos': 'top',
      '--pc-hover-lift': '0px',
      '--pc-img-zoom': '1',
    });
  });

  it('writes only the property that was actually re-decided', () => {
    const vars = productCardOverrideVars(
      readProductCardOverrides({ mega_card_customize: true, mega_card_img_fit: 'contain' })
    );
    expect(vars).toEqual({ '--pc-img-fit': 'contain' });
  });
});

describe('productCardOverrideAttrs', () => {
  it('carries only the attribute-driven properties, and only the overridden ones', () => {
    expect(
      productCardOverrideAttrs(
        readProductCardOverrides({ mega_card_customize: true, mega_card_shadow: 'none' })
      )
    ).toEqual({ 'data-pc-shadow': 'none' });

    expect(
      productCardOverrideAttrs(
        readProductCardOverrides({
          mega_card_customize: true,
          mega_card_font: 'serif',
          mega_card_cart: 'bar',
        })
      )
    ).toEqual({ 'data-pc-font': 'serif', 'data-pc-cart': 'bar' });
  });
});
