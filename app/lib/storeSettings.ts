import { createContext, useContext } from 'react';
import { readBoolean, readText, type BlockData } from './homeBlock';

/**
 * The store's shared design & behaviour settings — the layer between what Salla
 * gives the theme and what each block does.
 *
 * The chain, and it only runs one way:
 *
 *   Salla runtime (`--color-primary`, `--font-main`, `store.settings.*`)
 *     → these settings (`global_*` in `twilight.json`)
 *       → `globalVars()`, written ONCE on `<html>` by `__root.tsx` at SSR
 *         → the theme's own tokens (`--radius-lg`, `--fs-sm`, `--shadow-sm`, …)
 *           → Tailwind's utilities read those tokens too (`rounded`, `text-sm`,
 *             `shadow`, `p-4`, `duration-300`), so every `@apply` in the
 *             project follows the setting
 *             → the block, which may re-point a token in its own subtree
 *
 * TWO CHANNELS, AND WHY
 * ---------------------
 * Most settings are a plain token replacement, so `globalVars()` emits the
 * final token name (`--shadow-sm`, `--type-scale`, `--radius-button`). There is
 * no bridging stylesheet in between, which means no second copy of the value
 * that can rot.
 *
 * The PALETTE is the exception: it is emitted as `--gs-*` and re-pointed by
 * `01-settings/global-settings.scss` inside `html:not(.dark)`. Night mode is a
 * VISITOR state — the header's moon/sun button flips `html.dark` at runtime —
 * and an inline declaration on `<html>` out-ranks every stylesheet rule, so a
 * palette written inline could never be flipped back to day. Anything that
 * depends on a runtime class has to come from a stylesheet that can say
 * `:not(.dark)`.
 *
 * Two rules make the chain honest:
 *
 *  1. **Unset writes nothing.** If the merchant never opens the panel, this
 *     module emits zero custom properties and every block renders exactly what
 *     it rendered before the system existed. That is why the defaults are
 *     `'theme'` and not a literal: a value that is always present can never
 *     fall through to the layer below it.
 *  2. **A global value is never copied into a block.** A block inherits by
 *     *not declaring* the variable. `resolveSetting` is the only place the
 *     order is written down, so a new block cannot invent its own version of
 *     the rule.
 *
 * WHY `<html>` AND NOT `.app-inner` (changed 2026-11-21)
 * -----------------------------------------------------
 * A custom property declared on `:root` cannot read a property declared on a
 * nested element. Every scale in `01-settings/tokens.scss` is declared on
 * `:root`, and Tailwind's config reads those tokens — so as long as `--gs-*`
 * lived on `.app-inner`, the typography, radius, shadow and motion scales could
 * not see the merchant's choice at all, and nothing outside `.app-inner` (cart
 * drawer, bottom sheets, modals — all portalled to `body`) could see it either.
 *
 * Writing on `<html>` in `__root.tsx` fixes both: the root tokens resolve the
 * merchant's value, and every portal inherits it. It is server-rendered, so
 * there is no frame of the old design, and `ctx.settings` is available at SSR
 * time (`THEME-RUNTIME.md`).
 */

/** `salla` = follow `--color-primary`; `custom` = the merchant's own accent. */
export type AccentMode = 'salla' | 'custom';

/** `theme` = leave the block on its designed radius. */
export type RadiusChoice = 'theme' | '0' | '8' | '12' | '18' | '22';
export type ContainerChoice = 'theme' | '1200' | '1280' | '1440' | '1600';
export type GutterChoice = 'theme' | '16' | '24' | '32' | '40';
export type SectionGapChoice = 'theme' | '24' | '48' | '80';

/** `theme` = the palette the theme ships. The other three are complete
 *  surface families, not a single colour. */
export type SurfacePreset = 'theme' | 'warm' | 'cool' | 'neutral';
/** `theme` = the ink the theme ships. */
export type TextTone = 'theme' | 'strong' | 'soft' | 'warm';
/** `theme` = the hairline weight the theme ships. */
export type BorderStrength = 'theme' | 'soft' | 'strong';

/* ── typography ─────────────────────────────────────────────────────────── */
export type TypeScale = 'theme' | '90' | '95' | '105' | '110' | '115';
export type LineHeightChoice = 'theme' | 'tight' | 'normal' | 'relaxed';
export type HeadingFont = 'theme' | 'main' | 'display';
export type HeadingWeight = 'theme' | '600' | '700' | '800';

/* ── layout ─────────────────────────────────────────────────────────────── */
export type Density = 'theme' | 'compact' | 'normal' | 'relaxed';

/* ── shape, elevation ───────────────────────────────────────────────────── */
export type ButtonShape = 'theme' | 'pill' | 'rounded' | 'square';
export type ShadowLevel = 'theme' | 'none' | 'soft' | 'medium' | 'strong';

/* ── controls ───────────────────────────────────────────────────────────── */
export type ButtonHeight = 'theme' | '36' | '40' | '44' | '48' | '52';
export type ButtonSize = 'theme' | 'sm' | 'md' | 'lg';
export type ButtonWeight = 'theme' | '500' | '600' | '700' | '800';

/* ── media ──────────────────────────────────────────────────────────────── */
export type MediaRadius = 'theme' | 'none' | 'small' | 'medium' | 'large' | 'round';
export type IconSize = 'theme' | '14' | '16' | '18' | '20' | '24';

/* ── motion ─────────────────────────────────────────────────────────────── */
export type MotionSpeed = 'theme' | 'off' | 'calm' | 'lively';
export type MotionEasing = 'theme' | 'soft' | 'snappy' | 'linear';

/* ── surfaces ───────────────────────────────────────────────────────────── */
export type OverlayStrength = 'theme' | 'light' | 'dark';

export interface GlobalSettings {
  accentMode: AccentMode;
  /** `''` = no custom accent. */
  accent: string;
  radius: RadiusChoice;
  container: ContainerChoice;
  gutter: GutterChoice;
  sectionGap: SectionGapChoice;
  surfacePreset: SurfacePreset;
  textTone: TextTone;
  borderStrength: BorderStrength;

  typeScale: TypeScale;
  lineHeight: LineHeightChoice;
  headingFont: HeadingFont;
  headingWeight: HeadingWeight;

  density: Density;

  buttonShape: ButtonShape;
  shadow: ShadowLevel;

  buttonHeight: ButtonHeight;
  buttonSize: ButtonSize;
  buttonWeight: ButtonWeight;

  mediaRadius: MediaRadius;
  iconSize: IconSize;

  motionSpeed: MotionSpeed;
  motionEasing: MotionEasing;

  overlay: OverlayStrength;

  /** Behavioural, not a token: gates an observer. */
  scrollReveal: boolean;
  /** `true` = the store shows a card border. */
  cardBorder: boolean;
  /** `true` = every animation collapses to its end state. */
  reduceMotion: boolean;
}

const PREFIX = 'global';

/**
 * The state a store is in before it ever touches this panel — and the state
 * every existing store is in right now. Every field resolves to "use what is
 * already there".
 */
export const GLOBAL_SETTINGS_DEFAULTS: GlobalSettings = {
  accentMode: 'salla',
  accent: '',
  radius: 'theme',
  container: 'theme',
  gutter: 'theme',
  sectionGap: 'theme',
  surfacePreset: 'theme',
  textTone: 'theme',
  borderStrength: 'theme',

  typeScale: 'theme',
  lineHeight: 'theme',
  headingFont: 'theme',
  headingWeight: 'theme',

  density: 'theme',

  buttonShape: 'theme',
  shadow: 'theme',

  buttonHeight: 'theme',
  buttonSize: 'theme',
  buttonWeight: 'theme',

  mediaRadius: 'theme',
  iconSize: 'theme',

  motionSpeed: 'theme',
  motionEasing: 'theme',

  overlay: 'theme',

  /* ON, because that is what every store installed before the field existed
     already does — the observer arms on a missing setting. */
  scrollReveal: true,
  /* ON, because the theme's cards already carry a hairline. */
  cardBorder: true,
  reduceMotion: false,
};

/** The pixel each choice stands for. `theme` is absent on purpose: it means
 *  "emit nothing", not "emit 0". */
export const RADIUS_PX: Record<Exclude<RadiusChoice, 'theme'>, number> = {
  '0': 0,
  '8': 8,
  '12': 12,
  '18': 18,
  '22': 22,
};

/**
 * The radius the theme's own card role ships (`--radius-xl: 22px`).
 *
 * The panel offers card radii, and the whole corner ramp in `tokens.scss` is
 * `calc(<step> * var(--radius-scale))`. Dividing the choice by this base makes
 * `--radius-xl` equal the choice exactly — so `--radius-card` and every
 * `rounded-*` utility move together and proportionally, instead of the card
 * moving alone while the buttons beside it keep their corners.
 */
export const RADIUS_BASE = 22;

export const CONTAINER_PX: Record<Exclude<ContainerChoice, 'theme'>, number> = {
  '1200': 1200,
  '1280': 1280,
  '1440': 1440,
  '1600': 1600,
};

export const GUTTER_PX: Record<Exclude<GutterChoice, 'theme'>, number> = {
  '16': 16,
  '24': 24,
  '32': 32,
  '40': 40,
};

export const SECTION_GAP_PX: Record<Exclude<SectionGapChoice, 'theme'>, number> = {
  '24': 24,
  '48': 48,
  '80': 80,
};

/**
 * A surface preset is a FAMILY, not one colour.
 *
 * The merchant asks for "a warmer store" and what that means in practice is
 * four backgrounds (canvas + three surface levels) plus the muted ink that has
 * to stay readable on them. Shipping only the backgrounds is how a "warm"
 * theme ends up with the same cool grey captions it had before, one contrast
 * step darker than the canvas it sits on.
 *
 * `ink3` therefore belongs to the family: it is the muted ink MEASURED against
 * this family's `s2`/`s3`, so a preset can never make small text harder to
 * read than the theme's own baseline. `storeSettings.test.ts` recomputes the
 * WCAG ratio for every family and fails if one drifts below it.
 *
 * EVERY FAMILY HAS A NIGHT FACE
 * -----------------------------
 * A store whose dashboard colour mode is dark used to get nothing from this
 * setting: the bridge only painted `html:not(.dark)`, so the merchant picked
 * "warm" and the storefront did not move. That is the definition of a fake
 * control, so each family carries a second set of values.
 *
 * The night face is NOT "the day face darkened" and it is not a formula over
 * the day face either — it is the same HUE at the theme's night lightness
 * (`#0b0e14` canvas, `#141923` card, `#f2f3f5` ink). A warm store stays warm
 * after dark instead of turning into the same cool grey as every other store,
 * and because the values are literal the contrast test can measure them
 * exactly instead of trusting a `color-mix()` the browser may refuse.
 */
export interface SurfaceFamily {
  /** the page canvas */
  canvas: string;
  s1: string;
  s2: string;
  s3: string;
  /** the muted ink this family needs to keep its small text legible */
  ink3: string;
  /** the same family at night — see the note above */
  night: { canvas: string; s1: string; s2: string; s3: string; ink3: string };
}

export const SURFACE_PRESETS: Record<Exclude<SurfacePreset, 'theme'>, SurfaceFamily> = {
  /* ivory — the reference store's paper, warm without turning yellow */
  warm: {
    canvas: '#faf7f2',
    s1: '#fffdf8',
    s2: '#f4efe6',
    s3: '#eae3d6',
    ink3: '#736c63',
    night: { canvas: '#17120d', s1: '#1d1812', s2: '#241e17', s3: '#2e271e', ink3: '#a89e8e' },
  },
  /* the same neutrality as the theme, one step cooler and one step greyer */
  cool: {
    canvas: '#f2f4f8',
    s1: '#ffffff',
    s2: '#f4f6fa',
    s3: '#e7ecf3',
    ink3: '#6f757d',
    night: { canvas: '#0d1117', s1: '#131820', s2: '#19202a', s3: '#222b37', ink3: '#8d95a2' },
  },
  /* paper — a warm-neutral that reads as "unbleached" next to pure white */
  neutral: {
    canvas: '#f7f7f4',
    s1: '#ffffff',
    s2: '#f3f3ef',
    s3: '#e8e8e2',
    ink3: '#75756f',
    night: { canvas: '#121310', s1: '#181a16', s2: '#1f211c', s3: '#282b25', ink3: '#9a9b92' },
  },
};

/**
 * Text tone re-points the two inks that carry reading text.
 *
 * It deliberately does NOT own `ink-3`: the muted ink is a property of the
 * surface family (see above), so two settings can never fight over one
 * variable. Every tone here stays above 4.5:1 on every preset's `s2`, and its
 * `night` pair stays above the theme's own night ratio for the same role.
 */
export const TEXT_TONES: Record<
  Exclude<TextTone, 'theme'>,
  { ink1: string; ink2: string; night: { ink1: string; ink2: string } }
> = {
  strong: {
    ink1: '#14161a',
    ink2: '#2f363d',
    night: { ink1: '#ffffff', ink2: '#ccd1d9' },
  },
  soft: {
    ink1: '#3d434a',
    ink2: '#5f676e',
    night: { ink1: '#dfe3e8', ink2: '#aab2bd' },
  },
  warm: {
    ink1: '#2b2519',
    ink2: '#5c5245',
    night: { ink1: '#f5efe4', ink2: '#c9bfae' },
  },
};

/**
 * Border strength changes the WEIGHT of the hairlines, not their hue: the same
 * ink the palette uses, at a different alpha, so it composites correctly over
 * whatever surface the preset chose.
 *
 * At night the ink flips to white — the day values are a dark ink at low alpha,
 * which on a `#0b0e14` canvas is invisible. The night alphas are the theme's
 * own night hairlines (`0.09` / `0.18`) stretched in the same proportion.
 */
export const BORDER_STRENGTHS: Record<
  Exclude<BorderStrength, 'theme'>,
  { line1: string; line2: string; night: { line1: string; line2: string } }
> = {
  soft: {
    line1: 'rgba(20, 20, 30, 0.05)',
    line2: 'rgba(20, 20, 30, 0.10)',
    night: { line1: 'rgba(255, 255, 255, 0.06)', line2: 'rgba(255, 255, 255, 0.12)' },
  },
  strong: {
    line1: 'rgba(20, 20, 30, 0.16)',
    line2: 'rgba(20, 20, 30, 0.30)',
    night: { line1: 'rgba(255, 255, 255, 0.20)', line2: 'rgba(255, 255, 255, 0.36)' },
  },
};

/* ── the scales ─────────────────────────────────────────────────────────── */

/** A multiplier the Tailwind config and the token layer both read. */
export const TYPE_SCALES: Record<Exclude<TypeScale, 'theme'>, number> = {
  '90': 0.9,
  '95': 0.95,
  '105': 1.05,
  '110': 1.1,
  '115': 1.15,
};

export const LINE_HEIGHTS: Record<Exclude<LineHeightChoice, 'theme'>, number> = {
  tight: 0.94,
  normal: 1,
  relaxed: 1.08,
};

export const HEADING_FONTS: Record<Exclude<HeadingFont, 'theme'>, string> = {
  main: 'var(--font-main, system-ui, sans-serif)',
  display: 'var(--font-display, Georgia, serif)',
};

export const HEADING_WEIGHTS: Record<Exclude<HeadingWeight, 'theme'>, number> = {
  '600': 600,
  '700': 700,
  '800': 800,
};

export const DENSITIES: Record<Exclude<Density, 'theme'>, number> = {
  compact: 0.82,
  normal: 1,
  relaxed: 1.18,
};

export const BUTTON_SHAPES: Record<Exclude<ButtonShape, 'theme'>, string> = {
  pill: 'var(--radius-full)',
  rounded: 'var(--radius-lg)',
  square: '0px',
};

/**
 * Elevation is a SET, not one shadow: a card, a dropdown and a drawer are three
 * different depths, and a merchant who asks for "no shadows" means all three.
 *
 * `card` is the value the theme's 221 bare `shadow` utilities paint today, and
 * `night` exists because the day ramp is the TEXT ink at low alpha — at night
 * that ink is near-white, so a card would glow. `medium` is the theme's own set
 * restated, so it is the "no change" preset in everything but name.
 */
export interface ShadowSet {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  card: string;
  night: string;
}

export const SHADOWS: Record<Exclude<ShadowLevel, 'theme'>, ShadowSet> = {
  /* `0 0 #0000` and not `none`: Tailwind composes `box-shadow` as
     `var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)`,
     and a `none` in that list makes the whole declaration invalid — which
     would leave whatever shadow the element had before. A transparent zero
     shadow is the honest "no shadow" inside a composition. */
  none: {
    xs: '0 0 #0000',
    sm: '0 0 #0000',
    md: '0 0 #0000',
    lg: '0 0 #0000',
    card: '0 0 #0000',
    night: '0 0 #0000',
  },
  soft: {
    xs: '0 1px 2px -1px color-mix(in srgb, var(--ink-1) 12%, transparent)',
    sm: '0 2px 8px -6px color-mix(in srgb, var(--ink-1) 26%, transparent)',
    md: '0 8px 18px -14px color-mix(in srgb, var(--ink-1) 34%, transparent)',
    lg: '0 14px 30px -24px color-mix(in srgb, var(--ink-1) 44%, transparent)',
    card: '0 4px 18px -6px color-mix(in srgb, var(--ink-1) 12%, transparent)',
    night: '0 10px 24px -18px rgba(0, 0, 0, 0.5)',
  },
  medium: {
    xs: '0 1px 2px -1px color-mix(in srgb, var(--ink-1) 18%, transparent)',
    sm: '0 4px 12px -8px color-mix(in srgb, var(--ink-1) 45%, transparent)',
    md: '0 14px 30px -22px color-mix(in srgb, var(--ink-1) 55%, transparent)',
    lg: '0 22px 44px -34px color-mix(in srgb, var(--ink-1) 70%, transparent)',
    card: '5px 10px 30px #2b2d340d',
    night: '0 18px 40px -22px rgba(0, 0, 0, 0.7)',
  },
  strong: {
    xs: '0 2px 4px -1px color-mix(in srgb, var(--ink-1) 26%, transparent)',
    sm: '0 8px 18px -10px color-mix(in srgb, var(--ink-1) 55%, transparent)',
    md: '0 20px 40px -26px color-mix(in srgb, var(--ink-1) 68%, transparent)',
    lg: '0 32px 60px -40px color-mix(in srgb, var(--ink-1) 82%, transparent)',
    card: '0 10px 36px -8px color-mix(in srgb, var(--ink-1) 22%, transparent)',
    night: '0 26px 56px -24px rgba(0, 0, 0, 0.85)',
  },
};

export const BUTTON_HEIGHTS: Record<Exclude<ButtonHeight, 'theme'>, number> = {
  '36': 36,
  '40': 40,
  '44': 44,
  '48': 48,
  '52': 52,
};

export const BUTTON_SIZES: Record<Exclude<ButtonSize, 'theme'>, string> = {
  sm: '0.8125rem',
  md: '0.875rem',
  lg: '0.9375rem',
};

export const BUTTON_WEIGHTS: Record<Exclude<ButtonWeight, 'theme'>, number> = {
  '500': 500,
  '600': 600,
  '700': 700,
  '800': 800,
};

export const MEDIA_RADII: Record<Exclude<MediaRadius, 'theme'>, string> = {
  none: '0px',
  small: 'var(--radius-sm)',
  medium: 'var(--radius-md)',
  large: 'var(--radius-lg)',
  round: 'var(--radius-full)',
};

export const ICON_SIZES: Record<Exclude<IconSize, 'theme'>, number> = {
  '14': 14,
  '16': 16,
  '18': 18,
  '20': 20,
  '24': 24,
};

/** `off` is not `0ms`: a 0ms transition still fires `transitionend` and still
 *  costs a style recalc. `1ms` is the value the reduced-motion layer already
 *  uses for the same reason. */
export const MOTION_SPEEDS: Record<Exclude<MotionSpeed, 'theme'>, number> = {
  off: 0.001,
  calm: 0.72,
  lively: 1.35,
};

export const MOTION_EASINGS: Record<Exclude<MotionEasing, 'theme'>, string> = {
  soft: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  snappy: 'cubic-bezier(0.2, 1.35, 0.4, 1)',
  linear: 'linear',
};

/** The alpha of the veil behind a modal, a drawer or the mega menu. */
export const OVERLAYS: Record<Exclude<OverlayStrength, 'theme'>, number> = {
  light: 0.42,
  dark: 0.78,
};

const oneOf = <T extends string>(raw: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

const RADIUS_KEYS = ['theme', '0', '8', '12', '18', '22'] as const;
const CONTAINER_KEYS = ['theme', '1200', '1280', '1440', '1600'] as const;
const GUTTER_KEYS = ['theme', '16', '24', '32', '40'] as const;
const GAP_KEYS = ['theme', '24', '48', '80'] as const;
const SURFACE_KEYS = ['theme', 'warm', 'cool', 'neutral'] as const;
const TONE_KEYS = ['theme', 'strong', 'soft', 'warm'] as const;
const BORDER_KEYS = ['theme', 'soft', 'strong'] as const;
const TYPE_SCALE_KEYS = ['theme', '90', '95', '105', '110', '115'] as const;
const LH_KEYS = ['theme', 'tight', 'normal', 'relaxed'] as const;
const HEADING_FONT_KEYS = ['theme', 'main', 'display'] as const;
const HEADING_WEIGHT_KEYS = ['theme', '600', '700', '800'] as const;
const DENSITY_KEYS = ['theme', 'compact', 'normal', 'relaxed'] as const;
const BUTTON_SHAPE_KEYS = ['theme', 'pill', 'rounded', 'square'] as const;
const SHADOW_KEYS = ['theme', 'none', 'soft', 'medium', 'strong'] as const;
const BUTTON_HEIGHT_KEYS = ['theme', '36', '40', '44', '48', '52'] as const;
const BUTTON_SIZE_KEYS = ['theme', 'sm', 'md', 'lg'] as const;
const BUTTON_WEIGHT_KEYS = ['theme', '500', '600', '700', '800'] as const;
const MEDIA_RADIUS_KEYS = ['theme', 'none', 'small', 'medium', 'large', 'round'] as const;
const ICON_SIZE_KEYS = ['theme', '14', '16', '18', '20', '24'] as const;
const MOTION_SPEED_KEYS = ['theme', 'off', 'calm', 'lively'] as const;
const MOTION_EASING_KEYS = ['theme', 'soft', 'snappy', 'linear'] as const;
const OVERLAY_KEYS = ['theme', 'light', 'dark'] as const;

/**
 * A value that is safe to put in a `style` attribute.
 *
 * The field is a colour picker, but a settings payload is not a trusted
 * channel — the same reason `MapLocation.mapSrc()` exists. Anything that is
 * not a hex colour or a plain `rgb()/hsl()` call is dropped, so a pasted
 * `url(…)` or `;background:red` cannot escape into the stylesheet.
 */
export function isCssColor(value: string): boolean {
  const text = value.trim();
  if (!text) return false;
  if (/^#[0-9a-f]{3,8}$/i.test(text)) return true;
  return /^(rgb|hsl)a?\(\s*[0-9.,%\s/]+\)$/i.test(text);
}

export function readGlobalSettings(settings: BlockData | undefined): GlobalSettings {
  const d = GLOBAL_SETTINGS_DEFAULTS;
  /* Every value is read by its bare key through the shared readers, spelled
     out on its own line rather than through a local helper. That is deliberate:
     `tests/settings/no-dead-settings.test.ts` greps this file for
     `readText(settings, '<key>'` to prove each `global_*` field in the manifest
     is actually read here, and a helper would hide every one of them. */
  const read = <T extends string>(key: string, allowed: readonly T[], fallback: T): T =>
    oneOf(readText(settings, key, PREFIX, fallback), allowed, fallback);

  return {
    accentMode: read('accent_mode', ['salla', 'custom'] as const, d.accentMode),
    /* `readText` returns the fallback for `''`, which is exactly right here:
       an empty colour is "no override", not "the colour named empty". */
    accent: readText(settings, 'accent_color', PREFIX, d.accent),
    radius: read('radius', RADIUS_KEYS, d.radius),
    container: read('container', CONTAINER_KEYS, d.container),
    gutter: read('gutter', GUTTER_KEYS, d.gutter),
    sectionGap: read('section_gap', GAP_KEYS, d.sectionGap),
    surfacePreset: read('surface_preset', SURFACE_KEYS, d.surfacePreset),
    textTone: read('text_tone', TONE_KEYS, d.textTone),
    borderStrength: read('border_strength', BORDER_KEYS, d.borderStrength),

    typeScale: read('type_scale', TYPE_SCALE_KEYS, d.typeScale),
    lineHeight: read('line_height', LH_KEYS, d.lineHeight),
    headingFont: read('heading_font', HEADING_FONT_KEYS, d.headingFont),
    headingWeight: read('heading_weight', HEADING_WEIGHT_KEYS, d.headingWeight),

    density: read('density', DENSITY_KEYS, d.density),

    buttonShape: read('button_shape', BUTTON_SHAPE_KEYS, d.buttonShape),
    shadow: read('shadow', SHADOW_KEYS, d.shadow),

    buttonHeight: read('button_height', BUTTON_HEIGHT_KEYS, d.buttonHeight),
    buttonSize: read('button_size', BUTTON_SIZE_KEYS, d.buttonSize),
    buttonWeight: read('button_weight', BUTTON_WEIGHT_KEYS, d.buttonWeight),

    mediaRadius: read('media_radius', MEDIA_RADIUS_KEYS, d.mediaRadius),
    iconSize: read('icon_size', ICON_SIZE_KEYS, d.iconSize),

    motionSpeed: read('motion_speed', MOTION_SPEED_KEYS, d.motionSpeed),
    motionEasing: read('motion_easing', MOTION_EASING_KEYS, d.motionEasing),

    overlay: read('overlay', OVERLAY_KEYS, d.overlay),

    scrollReveal: readBoolean(settings, 'enable_scroll_reveal', PREFIX, d.scrollReveal),
    cardBorder: readBoolean(settings, 'card_border', PREFIX, d.cardBorder),
    reduceMotion: readBoolean(settings, 'reduce_motion', PREFIX, d.reduceMotion),
  };
}

/**
 * The custom properties for `<html>` — only the ones the merchant set.
 *
 * Written by the server-rendered document shell, so a block never paints one
 * frame of the old design while a client effect catches up.
 *
 * The names are mostly the TOKEN names (`--shadow-sm`, `--type-scale`) rather
 * than a parallel `--gs-*` namespace: the value is a plain replacement for a
 * token `:root` already declares, so writing it inline on `<html>` is the
 * whole bridge and there is no copy to drift. Only the palette keeps the
 * `--gs-` prefix, because it has to be re-pointed from a `:not(.dark)`
 * stylesheet rule (see the module header).
 */
export function globalVars(g: GlobalSettings): Record<string, string> {
  const vars: Record<string, string> = {};

  /* A custom accent only exists when the merchant both chose the mode AND
     picked a usable colour. Half a decision is not a decision. */
  if (g.accentMode === 'custom' && isCssColor(g.accent)) {
    vars['--gs-accent'] = g.accent.trim();
  }

  /* ── shape ─────────────────────────────────────────────────────────────
     `--gs-radius` is the exact pixel the panel offers, for the Selia shell
     (34 blocks read it). `--radius-scale` is the same decision expressed as a
     multiplier on the whole corner ramp, so `rounded`, `rounded-lg` and the
     card role all shrink together instead of one corner moving alone. */
  const radius = RADIUS_PX[g.radius as Exclude<RadiusChoice, 'theme'>];
  if (radius !== undefined) {
    vars['--gs-radius'] = `${radius}px`;
    /* four decimals: `8 / 22` is 0.363636…, and a 17-digit string in a style
       attribute is noise in every devtools screenshot for no benefit */
    vars['--radius-scale'] = String(Number((radius / RADIUS_BASE).toFixed(4)));
  }

  const container = CONTAINER_PX[g.container as Exclude<ContainerChoice, 'theme'>];
  if (container !== undefined) {
    vars['--gs-container'] = `${container}px`;
    vars['--container-max'] = `${container}px`;
  }

  const gutter = GUTTER_PX[g.gutter as Exclude<GutterChoice, 'theme'>];
  if (gutter !== undefined) vars['--gs-gutter'] = `${gutter}px`;

  const gap = SECTION_GAP_PX[g.sectionGap as Exclude<SectionGapChoice, 'theme'>];
  if (gap !== undefined) vars['--gs-section-gap'] = `${gap}px`;

  /* ── palette (the one `--gs-*` family, read by the CSS bridge) ──────────
     The surface family: canvas + the three surface levels + the muted ink that
     was measured against them. Emitted together or not at all — a half family
     (new canvas, old muted ink) is exactly the readability regression the
     family exists to prevent. */
  const surface = SURFACE_PRESETS[g.surfacePreset as Exclude<SurfacePreset, 'theme'>];
  if (surface) {
    vars['--gs-canvas'] = surface.canvas;
    vars['--gs-surface-1'] = surface.s1;
    vars['--gs-surface-2'] = surface.s2;
    vars['--gs-surface-3'] = surface.s3;
    vars['--gs-ink-3'] = surface.ink3;
    /* The card panel's own surface. `product-card.scss` gives `--pc-bg` the
       designed ivory as its fallback and the card's inline `--pc-bg` wins when
       the merchant picked a card colour — so this is the only channel by which
       a surface preset reaches the largest surface on the page.

       It points at `--gs-surface-1` rather than carrying the literal, because
       `--pc-bg` is written INLINE and an inline value cannot be mode-aware:
       with a literal, a warm store's cards and category tiles stayed near-white
       circles on a dark night page. The bridge is the mode-aware half, so the
       reference resolves to the day face by day and the night face after dark. */
    vars['--gs-card-surface'] = 'var(--gs-surface-1)';
    /* The well the product photo sits in — one step below the card panel, the
       way the card's own `#f4ebdc` sits below its `#fdfaf3`. `--pc-image-bg`
       is inline and cannot be mode-aware, so the mode is decided by the bridge
       and the card only names the variable (see `product-card.scss`). */
    vars['--gs-card-image-day'] = surface.s2;
    vars['--gs-card-image-night'] = surface.night.s2;
    /* the same family at night — the bridge reads these from `html.dark` */
    vars['--gs-canvas-night'] = surface.night.canvas;
    vars['--gs-surface-1-night'] = surface.night.s1;
    vars['--gs-surface-2-night'] = surface.night.s2;
    vars['--gs-surface-3-night'] = surface.night.s3;
    vars['--gs-ink-3-night'] = surface.night.ink3;
  }

  /* Text tone owns the two reading inks only; `--gs-ink-3` is the family's. */
  const tone = TEXT_TONES[g.textTone as Exclude<TextTone, 'theme'>];
  if (tone) {
    vars['--gs-ink-1'] = tone.ink1;
    vars['--gs-ink-2'] = tone.ink2;
    vars['--gs-ink-1-night'] = tone.night.ink1;
    vars['--gs-ink-2-night'] = tone.night.ink2;
  }

  const border = BORDER_STRENGTHS[g.borderStrength as Exclude<BorderStrength, 'theme'>];
  if (border) {
    vars['--gs-line-1'] = border.line1;
    vars['--gs-line-2'] = border.line2;
    vars['--gs-line-1-night'] = border.night.line1;
    vars['--gs-line-2-night'] = border.night.line2;
  }

  /* ── typography ────────────────────────────────────────────────────────
     Two multipliers and two roles. The multipliers are what make a store-wide
     type change possible at all: `--fs-*` and Tailwind's `text-*` scale are
     `calc(<size> * var(--type-scale))`, so a new size a future block adds
     follows the setting on the day it is written. */
  const scale = TYPE_SCALES[g.typeScale as Exclude<TypeScale, 'theme'>];
  if (scale !== undefined) vars['--type-scale'] = String(scale);

  const lh = LINE_HEIGHTS[g.lineHeight as Exclude<LineHeightChoice, 'theme'>];
  if (lh !== undefined) vars['--line-scale'] = String(lh);

  const headingFont = HEADING_FONTS[g.headingFont as Exclude<HeadingFont, 'theme'>];
  if (headingFont) vars['--font-heading'] = headingFont;

  const headingWeight = HEADING_WEIGHTS[g.headingWeight as Exclude<HeadingWeight, 'theme'>];
  if (headingWeight !== undefined) vars['--fw-heading'] = String(headingWeight);

  /* ── layout ──────────────────────────────────────────────────────────── */
  const density = DENSITIES[g.density as Exclude<Density, 'theme'>];
  if (density !== undefined) vars['--density'] = String(density);

  /* ── shape and elevation ─────────────────────────────────────────────── */
  const shape = BUTTON_SHAPES[g.buttonShape as Exclude<ButtonShape, 'theme'>];
  if (shape) vars['--radius-button'] = shape;

  const media = MEDIA_RADII[g.mediaRadius as Exclude<MediaRadius, 'theme'>];
  if (media) vars['--radius-media'] = media;

  const shadows = SHADOWS[g.shadow as Exclude<ShadowLevel, 'theme'>];
  if (shadows) {
    vars['--shadow-xs'] = shadows.xs;
    vars['--shadow-sm'] = shadows.sm;
    vars['--shadow-md'] = shadows.md;
    vars['--shadow-lg'] = shadows.lg;
    vars['--shadow-card'] = shadows.card;
    vars['--shadow-night'] = shadows.night;
  }

  /* ── controls ────────────────────────────────────────────────────────── */
  const buttonHeight = BUTTON_HEIGHTS[g.buttonHeight as Exclude<ButtonHeight, 'theme'>];
  if (buttonHeight !== undefined) vars['--btn-h'] = `${buttonHeight}px`;

  const buttonSize = BUTTON_SIZES[g.buttonSize as Exclude<ButtonSize, 'theme'>];
  if (buttonSize) vars['--btn-fs'] = buttonSize;

  const buttonWeight = BUTTON_WEIGHTS[g.buttonWeight as Exclude<ButtonWeight, 'theme'>];
  if (buttonWeight !== undefined) vars['--btn-fw'] = String(buttonWeight);

  /* ── icons ─────────────────────────────────────────────────────────────── */
  const icon = ICON_SIZES[g.iconSize as Exclude<IconSize, 'theme'>];
  if (icon !== undefined) vars['--icon-size'] = `${icon}px`;

  /* ── motion ────────────────────────────────────────────────────────────
     One multiplier for every duration, and the easing written into both roles
     it plays: the house curve the header reads and the curve the `ease-out` /
     `ease-in-out` utilities read. */
  const speed = MOTION_SPEEDS[g.motionSpeed as Exclude<MotionSpeed, 'theme'>];
  if (speed !== undefined) vars['--motion-scale'] = String(speed);

  const easing = MOTION_EASINGS[g.motionEasing as Exclude<MotionEasing, 'theme'>];
  if (easing) {
    vars['--ease-out'] = easing;
    vars['--ease-in-out'] = easing;
    vars['--ease-utility-out'] = easing;
    vars['--ease-utility-in-out'] = easing;
  }

  /* ── overlays ──────────────────────────────────────────────────────────── */
  const overlay = OVERLAYS[g.overlay as Exclude<OverlayStrength, 'theme'>];
  if (overlay !== undefined) vars['--overlay-alpha'] = String(overlay);

  return vars;
}

/**
 * Every custom property `globalVars()` can emit.
 *
 * Exists so {@link applyGlobalSettings} can CLEAR a property the merchant has
 * just set back to `theme`: `style.removeProperty` needs the name, and a
 * leftover inline declaration would pin the old value forever (inline beats
 * every stylesheet rule, so the token could never come back). Listing them
 * here also gives `tests/settings/global-effects.test.ts` something to hold
 * `globalVars()` against — a property emitted but not listed would never be
 * cleared, and one listed but never emitted would be dead weight.
 */
export const GLOBAL_VAR_NAMES = [
  /* palette — the only `--gs-*` family; see the module header */
  '--gs-accent',
  '--gs-canvas',
  '--gs-card-surface',
  '--gs-card-image-day',
  '--gs-card-image-night',
  '--gs-surface-1',
  '--gs-surface-2',
  '--gs-surface-3',
  '--gs-ink-1',
  '--gs-ink-2',
  '--gs-ink-3',
  '--gs-line-1',
  '--gs-line-2',
  /* the same palette at night, read from `html.dark` */
  '--gs-canvas-night',
  '--gs-surface-1-night',
  '--gs-surface-2-night',
  '--gs-surface-3-night',
  '--gs-ink-1-night',
  '--gs-ink-2-night',
  '--gs-ink-3-night',
  '--gs-line-1-night',
  '--gs-line-2-night',
  /* shape and layout */
  '--gs-radius',
  '--radius-scale',
  '--gs-container',
  '--container-max',
  '--gs-gutter',
  '--gs-section-gap',
  '--density',
  '--radius-button',
  '--radius-media',
  /* typography */
  '--type-scale',
  '--line-scale',
  '--font-heading',
  '--fw-heading',
  /* elevation */
  '--shadow-xs',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--shadow-card',
  '--shadow-night',
  /* controls */
  '--btn-h',
  '--btn-fs',
  '--btn-fw',
  '--icon-size',
  /* motion */
  '--motion-scale',
  '--ease-out',
  '--ease-in-out',
  '--ease-utility-out',
  '--ease-utility-in-out',
  /* surfaces */
  '--overlay-alpha',
] as const;

/** Every `data-` attribute {@link globalAttributes} can emit. */
export const GLOBAL_ATTR_NAMES = [
  'data-gs-media',
  'data-gs-btn',
  'data-gs-icon',
  'data-gs-card-border',
  'data-gs-shadow',
  'data-gs-heading-weight',
  'data-gs-container',
  'data-reduce-motion',
] as const;

/**
 * The switches that are not a scale.
 *
 * `cardBorder` and `reduceMotion` cannot be a custom property: one has to beat
 * a component's own single-class rule and the other has to beat twenty
 * `prefers-reduced-motion` blocks, so both are expressed as a `data-` attribute
 * on `<html>` and styled from `global-settings.scss`. They live here so
 * `__root.tsx` derives the whole surface from one object and a new switch has
 * one obvious place to be added.
 */
export function globalAttributes(g: GlobalSettings): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (g.mediaRadius !== 'theme') attrs['data-gs-media'] = '1';
  if (g.buttonShape !== 'theme') attrs['data-gs-btn'] = '1';
  if (g.iconSize !== 'theme') attrs['data-gs-icon'] = '1';
  if (!g.cardBorder) attrs['data-gs-card-border'] = 'off';
  /* Elevation has to reach the product card. Its shadow is a card setting
     (`--pc-shadow`, gated by `data-pc-shadow`), not one of the `--shadow-*`
     tokens, so re-pointing the tokens leaves the largest surface on the page
     at its own elevation — a merchant who picks "no shadows" or "strong"
     reads that as the control not working. The VALUE stays the token
     (`--shadow-card`); this attribute only says "the merchant made a choice". */
  if (g.shadow !== 'theme') attrs['data-gs-shadow'] = g.shadow;
  /* Heading weight has to beat the explicit `font-bold` / `font-black`
     utilities the ported blocks carry. Those are component-level values, so
     the rule is scoped to a heading the merchant can see AND opted into by
     choosing a weight — see the selector note in `global-settings.scss`. */
  if (g.headingWeight !== 'theme') attrs['data-gs-heading-weight'] = g.headingWeight;
  if (g.container !== 'theme') attrs['data-gs-container'] = '1';
  if (g.reduceMotion) attrs['data-reduce-motion'] = '1';
  return attrs;
}

/**
 * Write the whole surface onto `<html>` from the browser — the SAME two
 * emitters the server render uses, so there is no second source of truth.
 *
 * Why this exists at all: the server render covers the merchant's SAVED
 * values, and that is the channel a storefront needs. It does not cover a
 * value that changes after the first byte — the theme editor's live preview
 * merges its state into `theme.settings` on the client only
 * (`TwilightProvider` spreads `useDevSettingsOverrides()`), so without this
 * writer a merchant dragging the radius slider would see nothing until a
 * reload. Production and preview therefore go through one code path.
 *
 * Clearing is part of the job: setting a control back to "theme" has to
 * RESTORE the token, and an inline declaration out-ranks every stylesheet
 * rule, so a leftover property would pin the old value for good. The names
 * come from {@link GLOBAL_VAR_NAMES}, never from the element, so unrelated
 * inline properties are never touched.
 */
export function applyGlobalSettings(g: GlobalSettings, el?: HTMLElement | null): void {
  if (typeof document === 'undefined') return;
  const root = el ?? document.documentElement;
  if (!root) return;

  const vars = globalVars(g);
  for (const name of GLOBAL_VAR_NAMES) {
    const value: string | undefined = vars[name];
    if (value === undefined) root.style.removeProperty(name);
    else root.style.setProperty(name, value);
  }

  const attrs = globalAttributes(g);
  for (const name of GLOBAL_ATTR_NAMES) {
    const value: string | undefined = attrs[name];
    if (value === undefined) root.removeAttribute(name);
    else root.setAttribute(name, value);
  }
}

/** Anything that is not a real value. `0` and `false` are real values; `''`,
 *  `null` and whitespace are not. */
function isSet<T>(value: T | '' | null | undefined): value is T {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

/**
 * The one place the inheritance order is written.
 *
 *   1. the component's own value
 *   2. the store's global theme setting
 *   3. what Salla provides
 *   4. the safe fallback
 *
 * A block calls this instead of writing `local || global || official || x` by
 * hand, because that expression is wrong for every type where `0` or `false`
 * is meaningful — and it drifts between blocks.
 */
export function resolveSetting<T>(
  local: T | '' | null | undefined,
  global: T | '' | null | undefined,
  official: T | '' | null | undefined,
  fallback: T
): T {
  if (isSet(local)) return local;
  if (isSet(global)) return global;
  if (isSet(official)) return official;
  return fallback;
}

/**
 * Handed down as context so a block can make a decision CSS cannot (show a
 * badge, pick a layout) without calling `useTwilight()` itself — the same
 * contract `ProductCardSettingsContext` follows, and for the same reason: a
 * block must survive being rendered alone in a test or the editor.
 */
export const GlobalSettingsContext = createContext<GlobalSettings>(GLOBAL_SETTINGS_DEFAULTS);

export function useGlobalSettings(): GlobalSettings {
  return useContext(GlobalSettingsContext);
}
