// @vitest-environment node
/**
 * Every control in the store-settings panel, proven to do something.
 *
 * `no-dead-settings.test.ts` proves each `global_*` field is READ. That is
 * necessary and not sufficient: a field can be read, resolved, and then land on
 * a variable nothing consumes — the "inert panel" this system exists to
 * prevent. This file drives the real resolver with the real manifest options
 * and asserts the output CHANGES.
 *
 * Three failure modes it catches, none of which a type error or a screenshot
 * would show:
 *
 *  1. **An option the resolver does not accept.** The manifest offers
 *     `motion_speed: normal`; `MOTION_SPEEDS` has no `normal`, so the merchant
 *     picks "normal" and silently gets `theme`. The option is dead on arrival.
 *  2. **A setting that resolves but emits nothing** — a control wired to
 *     nothing.
 *  3. **A resolver field with no manifest field**, or the reverse: the panel
 *     and the code drifting apart one key at a time.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  GLOBAL_ATTR_NAMES,
  GLOBAL_SETTINGS_DEFAULTS,
  GLOBAL_VAR_NAMES,
  globalAttributes,
  globalVars,
  readGlobalSettings,
} from '../../app/lib/storeSettings';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(themeRoot, 'twilight.json'), 'utf8'));

/**
 * The manifest id ↔ the resolver field, written out rather than derived.
 * `global_accent_color` becomes `accent` and `global_enable_scroll_reveal`
 * becomes `scrollReveal`, so a snake→camel rule would quietly pass for the 25
 * fields that happen to match and hide the two that do not.
 */
const FIELD: Record<string, keyof typeof GLOBAL_SETTINGS_DEFAULTS> = {
  global_accent_mode: 'accentMode',
  global_accent_color: 'accent',
  global_surface_preset: 'surfacePreset',
  global_text_tone: 'textTone',
  global_border_strength: 'borderStrength',
  global_type_scale: 'typeScale',
  global_line_height: 'lineHeight',
  global_heading_font: 'headingFont',
  global_heading_weight: 'headingWeight',
  global_container: 'container',
  global_gutter: 'gutter',
  global_section_gap: 'sectionGap',
  global_density: 'density',
  global_radius: 'radius',
  global_media_radius: 'mediaRadius',
  global_shadow: 'shadow',
  global_card_border: 'cardBorder',
  global_button_shape: 'buttonShape',
  global_button_height: 'buttonHeight',
  global_button_size: 'buttonSize',
  global_button_weight: 'buttonWeight',
  global_icon_size: 'iconSize',
  global_motion_speed: 'motionSpeed',
  global_motion_easing: 'motionEasing',
  global_reduce_motion: 'reduceMotion',
  global_enable_scroll_reveal: 'scrollReveal',
  global_overlay: 'overlay',
};

/** What a setting produces: the custom properties, the attributes, or both. */
function output(settings: Record<string, unknown>): string {
  const resolved = readGlobalSettings(settings);
  return JSON.stringify([globalVars(resolved), globalAttributes(resolved)]);
}

const fields = (manifest.settings ?? []).filter(
  (s: { id?: string; type: string }) => s.type !== 'static' && String(s.id).startsWith('global_')
);

const EMPTY = output({});

describe('the panel and the resolver describe the same surface', () => {
  it('every manifest field has a resolver field, and every resolver field a manifest field', () => {
    const manifestIds = fields.map((s: { id: string }) => s.id).sort();
    expect(manifestIds).toEqual(Object.keys(FIELD).sort());
    expect(Object.keys(GLOBAL_SETTINGS_DEFAULTS).sort()).toEqual(
      Object.values(FIELD).sort()
    );
  });
});

describe('every option in the panel is a value the resolver accepts', () => {
  const items = fields.filter((s: { type: string }) => s.type === 'items');

  it('covers every dropdown in the group', () => {
    expect(items.length).toBeGreaterThanOrEqual(18);
  });

  for (const setting of items) {
    it(`${setting.id} — no option falls back to "theme"`, () => {
      const field = FIELD[setting.id];
      const rejected: string[] = [];

      for (const option of setting.options as Array<{ value: string }>) {
        const resolved = readGlobalSettings({ [setting.id]: option.value })[field];
        // `theme` is only correct when the option IS `theme`
        if (resolved !== option.value) {
          rejected.push(`${option.value} → ${String(resolved)}`);
        }
      }

      expect(rejected, `${setting.id} has options the resolver does not accept`).toEqual([]);
    });
  }
});

/**
 * The accent is a PAIR: `mode = custom` alone decides nothing (there is no
 * colour yet) and a colour alone is ignored (the mode is still `salla`). Half
 * a decision is not a decision, so the two fields are proven together below
 * instead of one at a time.
 */
const PAIRED = new Set(['global_accent_mode', 'global_accent_color']);

describe('every setting actually changes the document', () => {
  for (const setting of fields) {
    const id = setting.id as string;
    const field = FIELD[id];
    if (PAIRED.has(id)) continue;

    it(`${id} — at least one option emits something`, () => {
      /* `scrollReveal` is a behaviour, not a token: it arms the observer in
         `ThemeLayout`, so its proof is a different one (below). */
      if (field === 'scrollReveal') {
        const layout = fs.readFileSync(
          path.join(themeRoot, 'app/components/layout/ThemeLayout.tsx'),
          'utf8'
        );
        expect(layout).toContain('globalSettings.scrollReveal');
        expect(layout).toContain('initScrollReveal(main, { enabled: revealEnabled })');
        return;
      }

      const values: Array<string | boolean> =
        setting.type === 'items'
          ? (setting.options as Array<{ value: string }>).map((o) => o.value)
          : setting.type === 'boolean'
            ? [true, false]
            : [setting.value];

      const changed = values.filter((value) => output({ [id]: value }) !== EMPTY);

      expect(changed.length, `${id} emits nothing for any option`).toBeGreaterThan(0);
    });
  }

  it('the accent pair emits only when both halves are chosen', () => {
    expect(output({ global_accent_mode: 'custom' })).toBe(EMPTY);
    expect(output({ global_accent_color: '#7c3aed' })).toBe(EMPTY);
    expect(
      globalVars(readGlobalSettings({ global_accent_mode: 'custom', global_accent_color: '#7c3aed' }))
    ).toEqual({ '--gs-accent': '#7c3aed' });
    // and the salla mode wins over a leftover colour, so the engine value stands
    expect(
      globalVars(readGlobalSettings({ global_accent_mode: 'salla', global_accent_color: '#7c3aed' }))
    ).toEqual({});
  });

  it('a switch is not "on" by default and inert when flipped', () => {
    // `global_card_border` defaults to true; turning it OFF must emit an attribute
    expect(globalAttributes(readGlobalSettings({ global_card_border: false }))).toEqual({
      'data-gs-card-border': 'off',
    });
    expect(globalAttributes(readGlobalSettings({ global_card_border: true }))).toEqual({});

    expect(globalAttributes(readGlobalSettings({ global_reduce_motion: true }))).toEqual({
      'data-reduce-motion': '1',
    });
    expect(globalAttributes(readGlobalSettings({ global_reduce_motion: false }))).toEqual({});
  });
});

describe('the untouched panel emits nothing at all', () => {
  it('no custom property and no attribute', () => {
    expect(EMPTY).toBe('[{},{}]');
  });

  it('every option spelled `theme` resolves to the shipped design', () => {
    const themed = fields
      .filter((s: { type: string }) => s.type === 'items')
      .reduce<Record<string, string>>((acc, s: { id: string }) => {
        acc[s.id] = 'theme';
        return acc;
      }, {});

    expect(output(themed)).toBe('[{},{}]');
  });
});

/**
 * The opt-in attributes are the only channel that needs a stylesheet rule, and
 * a rule keyed on an attribute nobody writes is invisible. Each one below is
 * matched against a selector in `01-settings/global-settings.scss`.
 */
describe('every attribute the resolver can emit has a rule that reads it', () => {
  const sheet = fs.readFileSync(
    path.join(themeRoot, 'app/styles/01-settings/global-settings.scss'),
    'utf8'
  );

  const cases: Array<[Record<string, unknown>, string]> = [
    [{ global_media_radius: 'medium' }, 'html[data-gs-media]'],
    [{ global_button_shape: 'pill' }, 'html[data-gs-btn]'],
    [{ global_icon_size: '20' }, 'html[data-gs-icon]'],
    [{ global_card_border: false }, "html[data-gs-card-border='off']"],
    [{ global_shadow: 'soft' }, 'html[data-gs-shadow]'],
    [{ global_reduce_motion: true }, "html[data-reduce-motion='1']"],
  ];

  for (const [settings, selector] of cases) {
    it(`${selector} exists for ${JSON.stringify(settings)}`, () => {
      const attrs = globalAttributes(readGlobalSettings(settings));
      expect(Object.keys(attrs).length).toBe(1);
      expect(sheet).toContain(selector);
    });
  }
});

/**
 * The cleanup list, and the reason it has to be exhaustive.
 *
 * `applyGlobalSettings` clears a property by name, so a property the resolver
 * can emit but the list omits is a value that can never be taken back: the
 * merchant sets a radius, then sets it to "theme", and the inline declaration
 * survives — inline out-ranks every stylesheet rule, so the token never comes
 * back and the control looks stuck. The list is also read in the other
 * direction: a name that is never emitted would be cleared every time, which
 * is dead weight in a hot path.
 */
describe('the cleanup list is exactly the set of properties the resolver emits', () => {
  /** Every setting at a value that emits, so nothing is missing from the union. */
  const EVERYTHING: Record<string, unknown> = {
    global_accent_mode: 'custom',
    global_accent_color: '#7c3aed',
    global_surface_preset: 'warm',
    global_text_tone: 'soft',
    global_border_strength: 'strong',
    global_type_scale: '110',
    global_line_height: 'relaxed',
    global_heading_font: 'display',
    global_heading_weight: '800',
    global_container: '1440',
    global_gutter: '32',
    global_section_gap: '48',
    global_density: 'relaxed',
    global_radius: '12',
    global_media_radius: 'large',
    global_shadow: 'strong',
    global_card_border: false,
    global_button_shape: 'pill',
    global_button_height: '48',
    global_button_size: 'lg',
    global_button_weight: '600',
    global_icon_size: '20',
    global_motion_speed: 'calm',
    global_motion_easing: 'snappy',
    global_reduce_motion: true,
    global_overlay: 'dark',
  };

  it('the properties match the list, both directions', () => {
    const emitted = Object.keys(globalVars(readGlobalSettings(EVERYTHING))).sort();
    expect(emitted).toEqual([...GLOBAL_VAR_NAMES].sort());
  });

  it('the attributes match their list, both directions', () => {
    const emitted = Object.keys(globalAttributes(readGlobalSettings(EVERYTHING))).sort();
    expect(emitted).toEqual([...GLOBAL_ATTR_NAMES].sort());
  });

  it('the sample above really does exercise every control', () => {
    // a field left out of EVERYTHING would shrink the union silently and the
    // two assertions above would then compare two equally short lists.
    // `scrollReveal` is excluded on purpose: it emits nothing, because its
    // consumer is the observer `ThemeLayout` arms, not a custom property.
    const emitting = Object.keys(FIELD).filter((id) => id !== 'global_enable_scroll_reveal');
    expect(Object.keys(EVERYTHING).sort()).toEqual(emitting.sort());
  });

  it('no name in either list is duplicated', () => {
    expect(new Set(GLOBAL_VAR_NAMES).size).toBe(GLOBAL_VAR_NAMES.length);
    expect(new Set(GLOBAL_ATTR_NAMES).size).toBe(GLOBAL_ATTR_NAMES.length);
  });
});

/**
 * The three attributes added to close §8, each with the property that makes it
 * worth having rather than a plain token.
 *
 * `data-gs-shadow` and `data-gs-heading-weight` carry the VALUE, not a `1`:
 * the rules read `--shadow-card` / `--fw-heading`, and writing the level into
 * the attribute is what lets a test prove all four levels reach the DOM instead
 * of only the one that happened to be hardcoded in the selector.
 */
describe('the elevation, heading and container switches', () => {
  it('every shadow level emits its own attribute value', () => {
    for (const level of ['none', 'soft', 'medium', 'strong'] as const) {
      const attrs = globalAttributes(readGlobalSettings({ global_shadow: level }));
      expect(attrs['data-gs-shadow'], level).toBe(level);
    }
    // and `theme` stays silent, so an untouched store paints its own elevation
    expect(globalAttributes(readGlobalSettings({ global_shadow: 'theme' }))['data-gs-shadow']).toBeUndefined();
  });

  it('every heading weight emits its own attribute value', () => {
    for (const weight of ['600', '700', '800'] as const) {
      const attrs = globalAttributes(readGlobalSettings({ global_heading_weight: weight }));
      expect(attrs['data-gs-heading-weight'], weight).toBe(weight);
    }
    expect(
      globalAttributes(readGlobalSettings({ global_heading_weight: 'theme' }))['data-gs-heading-weight']
    ).toBeUndefined();
  });

  it('the container switch is a plain opt-in', () => {
    expect(globalAttributes(readGlobalSettings({ global_container: '1280' }))['data-gs-container']).toBe('1');
    expect(
      globalAttributes(readGlobalSettings({ global_container: 'theme' }))['data-gs-container']
    ).toBeUndefined();
  });

  it('the stylesheet reads all three, and the shadow rule is level-agnostic', () => {
    const sheet = fs.readFileSync(
      path.join(themeRoot, 'app/styles/01-settings/global-settings.scss'),
      'utf8'
    );
    // one rule, four levels: the level lives in the value, not in the selector
    expect(sheet).toContain('html[data-gs-shadow] :where(');
    expect(sheet).not.toMatch(/html\[data-gs-shadow='(none|soft|medium|strong)'\]/);
    /* the rule reads the ROLE, which the bridge resolves per mode — reading
       `--shadow-card` directly would paint a white glow on a dark card,
       because that ramp is the text ink at a low alpha */
    expect(sheet).toContain('box-shadow: var(--elevation-card) !important');
    expect(sheet).toContain('--elevation-card: var(--shadow-card)');
    expect(sheet).toContain('--elevation-card: var(--shadow-night)');
    expect(sheet).toContain('html[data-gs-heading-weight]');
    expect(sheet).toContain('font-weight: var(--fw-heading) !important');
    expect(sheet).toContain('html[data-gs-container] .container');
  });

  it('the heading rule keeps the two deliberate exceptions out', () => {
    const sheet = fs.readFileSync(
      path.join(themeRoot, 'app/styles/01-settings/global-settings.scss'),
      'utf8'
    );
    const start = sheet.indexOf('html[data-gs-heading-weight]');
    /* the selector wraps across lines, so the slice runs to the opening brace
       of the declaration block rather than to the first `}` (which is a `:not()`) */
    const rule = sheet
      .slice(start, sheet.indexOf('{', start))
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
    // an eyebrow is a small-caps label, a badge is a pill — neither is a title
    for (const excluded of ["[class*='eyebrow']", "[class*='badge']", "[class*='chip']"]) {
      expect(rule, excluded).toContain(`:not(${excluded})`);
    }
  });
});
