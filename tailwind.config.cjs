const fs = require('fs');
const path = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');

// In the monorepo the installed engine links to the live package, whose dist a
// rebuild rewrites under a running dev server; scan its source there instead.
const engineSrc = path.join(__dirname, '../theme-engine/src');
const engineContent = fs.existsSync(engineSrc)
  ? `${engineSrc}/**/*.{js,ts,jsx,tsx}`
  : './node_modules/@salla.sa/twilight-theme-engine/dist/**/*.js';

/* ==========================================================================
   THE UTILITIES READ THE DESIGN TOKENS.

   Every `@apply` in this project resolves through this file, so a scale that
   stops here is a scale that reaches ~740 call sites instead of the ~0 that
   read `var(--fs-*)` by hand. That is why the merchant's typography, density,
   corner, elevation and motion settings are wired HERE and not in a component
   sheet.

   Three rules keep it honest:

   1. **The multiplier is the hook.** `calc(0.875rem * var(--type-scale, 1))`
      computes 0.875rem for a store that never opened the panel — the exact
      value Tailwind shipped — and follows the setting for one that did.
      There is no second literal, so nothing can drift.
   2. **Only what the store can honestly change.** Padding, gap and space take
      `--density`; MARGIN does not. Negative margins in this theme are
      alignment hacks (`-mt-28` pulling a card over a hero, `-mx-4` bleeding a
      scroll track), not vertical rhythm — and Tailwind renders a negative
      utility by prefixing `-` to the value, which would produce the invalid
      `-calc(1rem * var(--density))` and silently drop the declaration.
   3. **A token, not a literal, wherever a token exists.** `rounded`,
      `shadow`, `rounded-full` and the night shadow all resolve to the role
      tokens in `01-settings/tokens.scss`, so one setting moves every utility
      at once.
   ========================================================================== */

/** `1rem` → `calc(1rem * var(--density, 1))`; zero stays zero. */
const scaled = (value, variable) => {
  if (value === undefined || value === null) return value;
  const text = String(value).trim();
  if (text === '' || text === '0' || text === '0px' || text === 'normal' || text === 'none') {
    return value;
  }
  return `calc(${text} * var(${variable}, 1))`;
};

const mapValues = (scale, variable) =>
  Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, scaled(value, variable)]));

/* Density: padding, gap and the `space-*` track gutters. */
const denseSpacing = mapValues(defaultTheme.spacing, '--density');

/* Typography: every size multiplied by the type scale, every line height by
   the line scale. Tailwind's scale entries are `[size, { lineHeight }]` tuples,
   so both halves travel together — a store that shrinks its type keeps the
   same vertical rhythm instead of clipping ascenders. */
const scaledFontSizes = Object.fromEntries(
  Object.entries(defaultTheme.fontSize).map(([key, value]) => {
    if (!Array.isArray(value)) return [key, scaled(value, '--type-scale')];
    const [size, options] = value;
    const next = { ...(options || {}) };
    if (next.lineHeight) next.lineHeight = scaled(next.lineHeight, '--line-scale');
    return [key, [scaled(size, '--type-scale'), next]];
  })
);

/* Motion: durations follow the speed setting. `--motion-scale: 0.001` is the
   "off" value, which is a 1ms transition and not a 0ms one. */
const scaledDurations = Object.fromEntries(
  Object.entries(defaultTheme.transitionDuration).map(([key, value]) => [
    key,
    scaled(value, '--motion-scale'),
  ])
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  important: false,
  content: [
    './app/**/*.{js,ts,jsx,tsx,scss,css}',
    engineContent,
    // SSR'd skeletons and wrapper markup carry `s-*` classes; scan the package that
    // renders them. Twilight web components ship their own CSS since 2.14.538
    // (SallaApp/twilight#2107), so the safelist is no longer compiled here.
    './node_modules/@salla.sa/twilight-components-react/dist/**/*.js',
    // The web components themselves (salla-modal, salla-localization-modal, …)
    // render the `s-*` shells (.s-modal-overlay, .s-modal-entering, .s-modal-body,
    // .s-localization-modal-* …) that the tailwind-theme plugin registers via
    // addUtilities — and Tailwind compiles a plugin utility only when its class
    // shows up in the content. Engine 1.0.133's dist no longer carries those
    // strings and the react wrappers don't either, which is why the localization
    // modal opened with no styling and never left its "entering" state. Scan the
    // components' own dist; under pnpm there is no top-level symlink for it.
    './node_modules/.pnpm/@salla.sa+twilight-componen_*/node_modules/@salla.sa/twilight-components/dist/**/*.js',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      padding: '10px',
      screens: {
        '2xl': '1280px',
      },
    },
    fontFamily: {
      sans: ['var(--font-main)', '-apple-system', 'BlinkMacSystemFont'],
      primary: 'var(--font-main)',
      /* the role `global_heading_font` re-points; `font-heading` on a title
         follows the store's choice, and the token falls back to the body face */
      heading: 'var(--font-heading)',
    },
    extend: {
      transitionTimingFunction: {
        elastic: 'cubic-bezier(0.55, 0, 0.1, 1)',
        /* The two curves the UTILITIES mean. They are separate tokens from
           `--ease-out`/`--ease-in-out` (the house curve the header reads)
           because Tailwind's defaults are not the theme's: mapping `ease-out`
           straight onto the house curve would re-time 31 existing rules the
           moment this file loaded, with no setting involved. */
        out: 'var(--ease-utility-out)',
        'in-out': 'var(--ease-utility-in-out)',
      },
      gridTemplateColumns: {
        'auto-fill': 'repeat(auto-fill, 290px)',
      },
      colors: {
        dark: '#1D1F1F',
        darker: '#0E0F0F',
        danger: '#AE0A0A',
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
      },
      /* A bare `border` / `border-t` / `border-y` takes its colour from here
         through Tailwind's preflight, so this is the one line that lets
         `global_border_strength` reach every hairline in the store — including
         the night flip, which a fixed `#e5e7eb` could never do. */
      borderColor: {
        DEFAULT: 'var(--line-1)',
      },
      spacing: {
        3.75: '15px',
        7.5: '30px',
        58: '232px',
        62: '248px',
        100: '28rem',
        116: '464px',
        132: '528px',
        200: '800px',
      },
      padding: denseSpacing,
      gap: denseSpacing,
      space: denseSpacing,
      borderRadius: {
        /* `rounded` is the corner `.btn` and every card paints today. It is a
           `calc` on the radius scale rather than a token because the ramp in
           `tokens.scss` has no 16px step — the scale is proportional (4/8/12/
           18/22/28), and 16px is Tailwind's own middle. */
        DEFAULT: 'calc(16px * var(--radius-scale, 1))',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-2xl)',
        large: 'var(--radius-xl)',
        big: 'calc(40px * var(--radius-scale, 1))',
        tiny: '3px',
      },
      fontSize: {
        ...scaledFontSizes,
        'icon-lg': 'calc(33px * var(--type-scale, 1))',
        xxs: 'calc(10px * var(--type-scale, 1))',
        xxxs: 'calc(8px * var(--type-scale, 1))',
        'title-size': 'calc(42px * var(--type-scale, 1))',
        '22px': 'calc(22px * var(--type-scale, 1))',
      },
      lineHeight: {
        12: scaled('3rem', '--line-scale'),
        14: scaled('3.5rem', '--line-scale'),
        16: scaled('4rem', '--line-scale'),
        18: scaled('4.5rem', '--line-scale'),
        20: scaled('5rem', '--line-scale'),
      },
      transitionDuration: scaledDurations,
      boxShadow: {
        /* bare `shadow` — 221 call sites — is the card role, so the elevation
           setting moves all of them at once */
        DEFAULT: 'var(--shadow-card)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-lg)',
        /* deliberately NOT tokenised: these are one-off art (a glow under a
           progress bar, a multi-layer mobile sheet), not store elevation */
        top: '0px 0px 10px #0000001A;',
        dropdown: '0 4px 8px rgba(161, 121, 121, 0.07)',
        light: '0px 4px 15px rgba(1, 1, 1, 0.06)',
        huge: '0px 3px 6px #00000029',
        progress: '0 5px 15px rgba(92, 213, 196, 0.4)',
        mobile:
          'rgb(0 0 0 / 9%) 0px 2px 1px, rgb(0 0 0 / 9%) 0px 4px 2px, rgb(0 0 0 / 9%) 0px 8px 4px, rgb(0 0 0 / 9%) 0px 16px 18px, rgb(0 0 0 / 9%) -15px 10px 7px, rgb(0 0 0 / 9%) -20px 10px 20px, rgb(0 0 0 / 9%) -20px 10px 20px, rgb(0 0 0 / 9%) -25px 20px 20px',
      },
      width: {
        18: '4.5rem',
        22: '5.5rem',
        74: '18.5rem',
        76: '19rem',
        78: '19.5rem',
      },
      height: {
        banner: '200px',
        'lg-banner': '428px',
        'full-banner': '600px',
        500: '500px',
        460: '460px',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      zIndex: {
        1: '1',
        2: '2',
        '-1': '-1',
      },
      screens: {
        xxs: { min: '380px', max: '479px' },
        xs: '480px',
      },
      backgroundOpacity: {
        '05': '0.05',
      },
      transitionProperty: {
        height: 'height',
      },
      keyframes: {
        slideUpFromBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        slideDownFromBottom: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        slideUpFromBottom: 'slideUpFromBottom .6s linear',
        slideDownFromBottom: 'slideDownFromBottom .6s linear',
      },
    },
  },
  corePlugins: {
    outline: false,
  },
  plugins: [require('@salla.sa/twilight-tailwind-theme'), require('@tailwindcss/forms')],
};
