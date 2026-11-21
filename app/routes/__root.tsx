import { lazy, Suspense } from 'react';
import { Scripts, Outlet } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
  ThemeHeadContent,
  ThemeStylesheet,
} from '@salla.sa/twilight-theme-engine/tanstack';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { ThemeLayout } from '../components/layout/ThemeLayout';
import { HOME_ROUTE_ID, PRODUCT_ROUTE_ID } from '../lib/routeIds';
import { COLOR_MODE_BOOT_SCRIPT } from '../lib/colorMode';
import { globalAttributes, globalVars, readGlobalSettings } from '../lib/storeSettings';
import type { CSSProperties } from 'react';
import appCssUrl from '../styles/app.css?url';
import homeCriticalCss from '../styles/critical.scss?inline';
import productCriticalCss from '../styles/critical-product.scss?inline';
import morphCriticalCss from '../styles/morph-critical.scss?inline';

// Dev-only: reads the theme's local twilight.json (settings + components),
// fills defaults, and lets you edit them live. Imported from the engine's `/dev`
// subpath under an import.meta.env.DEV gate so it is tree-shaken from prod builds.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;

// Dev-only: the engine's editor has no `color` field kind, so `format: "color"`
// settings render there as text boxes. This panel draws them as swatches and
// saves through the same `POST /__twilight/preview` the editor uses. Gated and
// lazily imported so it never reaches a production bundle.
const DevColorPanel = import.meta.env.DEV
  ? lazy(() => import('../components/dev/DevColorPanel').then((m) => ({ default: m.DevColorPanel })))
  : null;

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

// The client bundle skips the stylesheet strings; hydration adopts the inline
// <style> by its href. The KEYS must stay identical on both sides — only the
// values are server-only.
const EMPTY_CRITICAL_CSS = {
  [HOME_ROUTE_ID]: '',
  [PRODUCT_ROUTE_ID]: '',
};

function RootComponent() {
  const ctx = getTwilightContext();
  // ThemeStylesheet posts the full app sheet until after the first paint, so
  // the inline critical sheet is ALL the CSS a first paint has. The morph
  // header is the only header this theme has, with its own 2.9k-line
  // stylesheet; without its critical subset the first paint shows an unstyled
  // bar. It used to be conditional on `header_layout === 'morph'` — that
  // setting now offers one value, so the subset is always in.
  const criticalCss = import.meta.env.SSR
    ? {
        [HOME_ROUTE_ID]: homeCriticalCss + morphCriticalCss,
        [PRODUCT_ROUTE_ID]: productCriticalCss + morphCriticalCss,
      }
    : EMPTY_CRITICAL_CSS;
  /* The merchant's dashboard colour mode, read SERVER-SIDE so the first byte
     already carries the right canvas — the same reason the card settings are
     rendered inline. `ctx.settings` throws when the payload has not loaded
     (error and maintenance pages), and a colour mode is not worth an exception
     there: light is the theme's documented default.

     The SAME read feeds the store's design settings (`global_*`). They have to
     be on `<html>` and not on `.app-inner`: every scale they drive lives on
     `:root` in `01-settings/tokens.scss`, and a `:root` token cannot resolve a
     property declared on a nested element — so a merchant's type scale or
     corner radius would have had nowhere to land. `<html>` is also the parent
     of the portals (cart drawer, bottom sheets, modals), which `.app-inner` is
     not. It is server-rendered, so there is no frame of the old design. */
  let merchantDark = false;
  let globalStyle: CSSProperties = {};
  let globalAttrs: Record<string, string> = {};
  try {
    merchantDark = ctx.settings?.theme?.color?.is_dark === true;
    /* `ctx.settings.theme.settings` is the store's SAVED payload — the values
       the merchant last published from the dashboard. In the dev server those
       values live in `twilight.preview.json` instead, and the engine merges
       them into `theme.settings` on the CLIENT only (`TwilightProvider` spreads
       `useDevSettingsOverrides()`), which is why the server render used to
       carry none of them. Reading the same saved state here reproduces that
       merge on the server, so the first byte already shows the merchant's
       design instead of one frame of the shipped one. A production build ships
       an empty schema, so this branch is dead there. */
    const preview = devSchema.preview;
    const saved = ctx.settings?.theme?.settings as Record<string, unknown> | undefined;
    const merged =
      import.meta.env.DEV && preview?.enabled && preview.settings
        ? { ...saved, ...preview.settings }
        : saved;
    const storeSettings = readGlobalSettings(merged);
    globalStyle = globalVars(storeSettings) as CSSProperties;
    globalAttrs = globalAttributes(storeSettings);
  } catch {
    /* Error and maintenance pages render without a settings payload. An
       unset panel writes nothing anyway, so an empty object is the correct
       fallback for both. */
    merchantDark = false;
  }
  return (
    <html
      lang={ctx.locale}
      dir={ctx.dir}
      data-color-mode={merchantDark ? 'dark' : 'light'}
      style={globalStyle}
      {...globalAttrs}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Home and product paint from inline critical CSS; `bootClient` adds the full sheet once
            their first screen has painted. Other routes: the full sheet blocks, as before. */}
        <ThemeStylesheet href={appCssUrl} critical={criticalCss} />
        {/* Colour mode: `.dark` must land on <html> BEFORE the first paint (no
            flash), so it is an inline script. It reads ONE thing from the DOM —
            `data-color-mode`, which the server rendered from the merchant's
            dashboard choice — and lets a saved visitor choice win over it. The
            OS preference is deliberately not consulted: it used to flip the
            header to the dark palette while the body stayed light, which the
            merchant read as a broken header. `lib/colorMode.ts` holds the policy
            and the key; this tag only executes it. */}
        <script dangerouslySetInnerHTML={{ __html: COLOR_MODE_BOOT_SCRIPT }} />
        <ThemeHeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          To get full functionality of this site you need to enable JavaScript.
          <a href="https://www.enable-javascript.com/" rel="noreferrer" target="_blank">
            To enable JavaScript on webpage
          </a>
          .
        </noscript>
        <TwilightProvider
          translations={themeTranslations}
          layout={ThemeLayout}
          toastMobilePosition="top-center"
        >
          <Outlet />
        </TwilightProvider>
        <TanStackRouterDevtools position="bottom-right" />
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        {DevColorPanel && (
          <Suspense fallback={null}>
            <DevColorPanel preview={devSchema.preview ?? null} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
