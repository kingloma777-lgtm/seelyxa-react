import { describe, it, expect } from 'vitest';
import {
  BADGE_DEFAULTS,
  badgeAttrs,
  badgeVars,
  readBadgeStyle,
  saleBadgeText,
} from '../../app/lib/productBadgeStyle';

/**
 * The badge system's model.
 *
 * Two things here are invisible when they break, which is why they are pinned:
 *
 *  1. **The "write only what changed" rule.** The stylesheet owns a designed
 *     default per placement (a tag on the card's edge is cut in by a 3px ring; a
 *     tag inside the frame is not). If this file wrote every value, a store that
 *     never opened the panel would get a flattened copy of the design instead —
 *     and every placement would look the same.
 *  2. **The text composer.** `{value}` is the only substitution, so a template
 *     can never invent a figure, and a numeric result must carry the bidi
 *     isolate or «-22%» prints as «22%-» on an Arabic page.
 */

describe('readBadgeStyle', () => {
  it('returns the reference tag when the store has never opened the panel', () => {
    expect(readBadgeStyle(undefined)).toEqual(BADGE_DEFAULTS);
    expect(readBadgeStyle({})).toEqual(BADGE_DEFAULTS);
  });

  it('reads every family by its prefixed field id', () => {
    const s = readBadgeStyle({
      product_card_badge_placement: 'frame',
      product_card_badge_shape: 'ticket',
      product_card_badge_radius: 12,
      product_card_badge_stretch: true,
      product_card_badge_offset_x: -6,
      product_card_badge_offset_y: 8,
      product_card_badge_ring: 5,
      product_card_badge_surface: 'paper',
      product_card_badge_border_style: 'dashed',
      product_card_badge_border_width: 2,
      product_card_badge_font_size: 12,
      product_card_badge_font_weight: '800',
      product_card_badge_pad_x: 14,
      product_card_badge_pad_y: 8,
      product_card_badge_detail: 'dot',
      product_card_badge_out_text: 'خلاص',
      product_card_badge_sale_template: 'خصم {value}%',
      product_card_badge_out_tone: 'paper',
      product_card_badge_sale_tone: 'quiet',
    });

    expect(s.placement).toBe('frame');
    expect(s.shape).toBe('ticket');
    expect(s.radius).toBe(12);
    expect(s.stretch).toBe(true);
    expect(s.offsetX).toBe(-6);
    expect(s.offsetY).toBe(8);
    expect(s.ring).toBe(5);
    expect(s.surface).toBe('paper');
    expect(s.borderStyle).toBe('dashed');
    expect(s.borderWidth).toBe(2);
    expect(s.fontSize).toBe(12);
    expect(s.fontWeight).toBe(800);
    expect(s.padX).toBe(14);
    expect(s.padY).toBe(8);
    expect(s.detail).toBe('dot');
    expect(s.outText).toBe('خلاص');
    expect(s.saleTemplate).toBe('خصم {value}%');
    expect(s.outTone).toBe('paper');
    expect(s.saleTone).toBe('quiet');
  });

  it('accepts a dropdown that arrives as a bare string, which is how preview data stores it', () => {
    expect(readBadgeStyle({ product_card_badge_placement: 'free' }).placement).toBe('free');
    expect(readBadgeStyle({ product_card_badge_shape: 'pill' }).shape).toBe('pill');
  });

  it('falls back instead of trusting a value the stylesheet cannot paint', () => {
    const s = readBadgeStyle({
      product_card_badge_placement: 'orbit',
      product_card_badge_shape: 'blob',
      product_card_badge_surface: 'glass',
      product_card_badge_detail: 'sparkles',
      product_card_badge_out_tone: 'loud',
      product_card_badge_bg: 'not-a-colour',
      product_card_badge_ink: '#fff',
    });
    expect(s.placement).toBe(BADGE_DEFAULTS.placement);
    expect(s.shape).toBe(BADGE_DEFAULTS.shape);
    expect(s.surface).toBe(BADGE_DEFAULTS.surface);
    expect(s.detail).toBe(BADGE_DEFAULTS.detail);
    expect(s.outTone).toBe(BADGE_DEFAULTS.outTone);
    /* a colour the browser would drop falls back to the designed pair */
    expect(s.bg).toBe(BADGE_DEFAULTS.bg);
    expect(s.ink).toBe('#fff');
  });

  it('clamps the numbers instead of letting a saved payload break the layout', () => {
    const s = readBadgeStyle({
      product_card_badge_font_size: 90,
      product_card_badge_pad_x: 0,
      product_card_badge_offset_x: -400,
      product_card_badge_ring: 40,
      product_card_badge_radius: 900,
      product_card_badge_border_width: 9,
    });
    expect(s.fontSize).toBe(16);
    expect(s.padX).toBe(4);
    expect(s.offsetX).toBe(-24);
    expect(s.ring).toBe(8);
    expect(s.radius).toBe(40);
    expect(s.borderWidth).toBe(4);
  });

  it('keeps the discount template alive even when the merchant empties it', () => {
    /* An empty template would print a bare tag with no figure — the one thing a
       discount badge exists to say. */
    expect(readBadgeStyle({ product_card_badge_sale_template: '  ' }).saleTemplate).toBe(
      BADGE_DEFAULTS.saleTemplate
    );
  });
});

describe('badgeVars', () => {
  it('writes NOTHING for a store that never opened the panel', () => {
    /* the whole point: the stylesheet's own per-placement defaults survive */
    expect(badgeVars(BADGE_DEFAULTS)).toEqual({});
  });

  it('writes only the properties the merchant actually moved', () => {
    const vars = badgeVars({
      ...BADGE_DEFAULTS,
      fontSize: 12,
      ring: 0,
      offsetX: -4,
      borderWidth: 2,
      borderStyle: 'dashed',
      padX: 16,
    });
    expect(vars).toEqual({
      '--pc-tag-fs': '12px',
      '--pc-tag-ring': '0px',
      '--pc-tag-dx': '-4px',
      '--pc-tag-bw': '2px',
      '--pc-tag-bs': 'dashed',
      '--pc-tag-pad-x': '16px',
    });
    /* and nothing it did not move */
    expect(vars['--pc-tag-fs']).toBeDefined();
    expect(vars['--pc-tag-dy']).toBeUndefined();
    expect(vars['--pc-tag-radius']).toBeUndefined();
  });

  it('writes colours ONLY for a custom surface', () => {
    /* the three presets are the store's own roles, so a palette change reaches
       them and a preset can never go stale */
    expect(badgeVars({ ...BADGE_DEFAULTS, surface: 'paper' })).toEqual({});
    expect(badgeVars({ ...BADGE_DEFAULTS, surface: 'custom', bg: '#101010', ink: '#fafafa' })).toEqual({
      '--pc-tag-bg': '#101010',
      '--pc-tag-ink': '#fafafa',
    });
  });
});

describe('badgeAttrs', () => {
  it('turns every structural choice into its own attribute', () => {
    const attrs = badgeAttrs({
      ...BADGE_DEFAULTS,
      placement: 'frame',
      shape: 'pill',
      surface: 'paper',
      stretch: true,
      detail: 'keyline',
      outTone: 'ink',
      saleTone: 'quiet',
    });
    expect(attrs).toEqual({
      'data-pc-badge-place': 'frame',
      'data-pc-badge-shape': 'pill',
      'data-pc-badge-surface': 'paper',
      'data-pc-badge-stretch': '1',
      'data-pc-badge-detail': 'keyline',
      'data-pc-badge-out': 'ink',
      'data-pc-badge-sale': 'quiet',
    });
  });

  it('always writes a placement and a shape — the stylesheet has no "no placement"', () => {
    const attrs = badgeAttrs(BADGE_DEFAULTS);
    expect(attrs['data-pc-badge-place']).toBe('edge');
    expect(attrs['data-pc-badge-shape']).toBe('sharp');
    expect(attrs['data-pc-badge-stretch']).toBe('0');
  });
});

describe('saleBadgeText', () => {
  const LRI = '\u2066';
  const PDI = '\u2069';

  it('puts the computed figure where the merchant asked for it', () => {
    expect(saleBadgeText('-{value}%', 22)).toBe(`${LRI}-22%${PDI}`);
    expect(saleBadgeText('خصم {value}%', 22)).toBe('خصم 22%');
    expect(saleBadgeText('{value}% off', 22)).toBe(`${LRI}22% off${PDI}`);
  });

  it('isolates a numeric result, because an RTL paragraph moves the minus', () => {
    /* U+2066 … U+2069 is an LRI/PDI pair: without it an Arabic page renders
       «-22%» as «22%-», which reads as a typo rather than as a discount. */
    expect(saleBadgeText('-{value}%', 22).startsWith(LRI)).toBe(true);
    expect(saleBadgeText('-{value}%', 22).endsWith(PDI)).toBe(true);
    /* a template that OPENS with a letter is left exactly as written — an
       isolate around an Arabic label would break its joining context */
    expect(saleBadgeText('خصم {value}%', 22)).not.toContain(LRI);
  });

  it('substitutes every occurrence, and prints no figure if the merchant omits it', () => {
    expect(saleBadgeText('{value}% / {value}', 5)).toBe(`${LRI}5% / 5${PDI}`);
    expect(saleBadgeText('عرض خاص', 22)).toBe('عرض خاص');
  });
});
