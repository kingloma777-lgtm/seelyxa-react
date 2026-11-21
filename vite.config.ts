import { defineConfig, type UserConfig } from 'vite';
import { twilightReact } from '@salla.sa/twilight-theme-engine/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// The shell exports HTTP_PROXY/HTTPS_PROXY/ALL_PROXY pointing at a loopback
// proxy. Wrangler passes them into workerd, so every SSR fetch() is proxied;
// on Windows that crashes the native runtime after the first heavy render
// ("There was an access violation in the runtime"), miniflare's dispatchFetch
// rejects with `fetch failed`, and Vite paints the full-page error overlay /
// restarts the server. Direct HTTPS works here, so dev runs without a proxy.
// `scripts/dev-local.cjs` already removes the variables before Vite is loaded;
// this is the second line of defence for anyone running `vite dev` directly.
// Set SEELYXA_KEEP_PROXY=1 to opt out (e.g. on a machine that needs a proxy).
if (process.env.SEELYXA_KEEP_PROXY !== '1') {
  for (const key of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'ALL_PROXY',
    'http_proxy',
    'https_proxy',
    'all_proxy',
  ] as const) {
    delete process.env[key];
  }
}
// Never route the dev server's own loopback traffic through a proxy that may
// be injected later (or kept via SEELYXA_KEEP_PROXY=1).
const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'];
for (const key of ['NO_PROXY', 'no_proxy'] as const) {
  const current = (process.env[key] ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  process.env[key] = [...new Set([...current, ...LOOPBACK_HOSTS])].join(',');
}

export default defineConfig(async () => ({
  server: {
    hmr: {
      // workerd on Windows can still die with a native "access violation" on a
      // cold render. `scripts/dev-local.cjs` restarts it and the next request
      // is 200, but Vite would otherwise cover the preview with a full-page
      // overlay for that self-healing error. Errors are still printed in the
      // dev-server terminal; set SEELYXA_SHOW_OVERLAY=1 when debugging real
      // theme errors so they show up in the browser too.
      overlay: process.env.SEELYXA_SHOW_OVERLAY === '1',
    },
  },
  plugins: [
    // twilightReact() registers and configures the SSR runtime, so a theme
    // configures no server runtime of its own.
    ...(await twilightReact({
      localesDir: './locales',
    })),
    {
      // Engine 1.0.133's plugin still lists
      // "engine > react-i18next > html-parse-stringify > void-elements" as a
      // client optimizeDeps entry, but html-parse-stringify@4.0.1 has no
      // dependencies at all — the package is not in the graph, the optimizer
      // fails to resolve it, and the poisoned pre-bundle then 404s
      // (the "file does not exist at .vite/deps_ssr/…" overlay on every
      // restart). Run after the engine's config hook and strip the stale
      // entry; its parent (html-parse-stringify) is included, so nothing is lost.
      name: 'seelyxa:strip-stale-optimize-dep',
      enforce: 'post',
      config(config: UserConfig) {
        config.optimizeDeps ??= {};
        const include = config.optimizeDeps.include;
        if (Array.isArray(include)) {
          config.optimizeDeps.include = include.filter(
            (d) => !d.endsWith('> void-elements')
          );
        }
      },
    },
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  resolve: {
    alias: [
      // Swiper's stylesheets otherwise land in a per-chunk CSS file that the
      // framework links render-blocking on every page. The same rules ship in
      // app/styles/vendor/swiper.css via app.css and critical.scss instead.
      {
        find: /^swiper\/css(\/navigation|\/autoplay)?$/,
        // `import.meta.dirname` (Node 20.11+) instead of `__dirname`: the config
        // is ESM and Vite's native config loader does not provide `__dirname`,
        // so it warns on every start and will break when that loader is default.
        replacement: path.resolve(import.meta.dirname, './app/lib/empty-css.ts'),
      },
    ],
    // Singleton libs whose React context must be shared between the app and the
    // engine's bundled screens/components (they call useSuspenseQuery /
    // useTranslation but don't own these). Without dedupe the strict published
    // layout resolves a second copy → "No QueryClient set" / missing i18n context.
    // `pnpm why` confirms react/react-dom are installed once (19.2.8); the
    // entries stay because pnpm can legitimately materialise a peer-variant
    // copy on any future install, and that is the failure this prevents.
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'react-dom/server',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'react-i18next',
      'i18next',
    ],
  },
  environments: {
    ssr: {
      // The workerd SSR runner can't execute raw CommonJS ("module is not
      // defined") and SSR environments don't pre-bundle deps by default. Pre-
      // optimize the CJS deps that reach SSR: @tanstack/react-query (so the
      // engine's QueryClientProvider and route loaders share one
      // QueryClientContext) and the engine's i18n chain
      // (react-i18next → html-parse-stringify, use-sync-external-store).
      // Only the packages resolvable under pnpm's strict layout are listed:
      // transitive deps (void-elements …) are bundled by the optimizer with
      // their parent entry automatically — a deeper include path fails to
      // resolve and poisons the whole pre-bundle (the missing deps_ssr file).
      optimizeDeps: {
        include: [
          // React itself, in the SSR environment, for the same reason: the
          // pre-bundled react-query / react-i18next chunks get their own copy of
          // React inlined unless `react` is an explicit pre-bundle entry. When
          // the app's own SSR modules then import the externalised CJS copy,
          // React is loaded twice and the render throws
          //   "Invalid hook call … Cannot read properties of null (reading 'useEffect')"
          // inside QueryClientProvider. Listing react here makes every SSR
          // consumer resolve to the single pre-bundled ESM instance.
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          'react-dom/server',
          '@tanstack/react-query',
          '@salla.sa/twilight-theme-engine > react-i18next',
          '@salla.sa/twilight-theme-engine > i18next',
          '@salla.sa/twilight-theme-engine > react-i18next > html-parse-stringify',
          '@salla.sa/twilight-theme-engine > react-i18next > use-sync-external-store',
        ],
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler', silenceDeprecations: ['import'] } as any,
    },
  },
  build: {
    modulePreload: {
      resolveDependencies: (url: string, deps: string[]): string[] => {
        return deps.filter(
          (d: string) =>
            d.includes('vendor') ||
            d.includes('router') ||
            d.includes('main') ||
            d.includes('index') ||
            d.includes('shared-')
        );
      },
    },
    rollupOptions: {
      external: ['@salla.sa/twilight-components', '@salla.sa/twilight-components/dist/*'],
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        manualChunks(id: string): string | undefined {
          // Kept apart so the entry, which only waits for the LCP image, imports nothing heavy.
          if (id.includes('vite/preload-helper')) {
            return 'preload-helper';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@tanstack/react-router/')) {
            return 'vendor-router';
          }
          /* The theme no longer DECLARES `@uidotdev/usehooks` (it never imported
             it), but `@salla.sa/twilight-theme-engine` does — its BrandsPage,
             dropdown and ThankYouPage bundles import it. The rule therefore
             still fires, and must stay: without it the engine's hooks land in
             the engine chunk and every page that touches a dropdown pays for
             them. Removing the rule because the package left our package.json
             would silently undo the split. */
          if (id.includes('node_modules/@uidotdev/usehooks/')) {
            return 'vendor-hooks';
          }
          if (
            id.includes('/components/common/Breadcrumb') ||
            id.includes('/components/common/NoContent') ||
            id.includes('/components/common/Image') ||
            id.includes('/components/common/Link') ||
            id.includes('/components/common/CurrencySymbol')
          ) {
            return 'shared-common';
          }
          if (
            id.includes('/components/product/ProductCard') ||
            id.includes('/components/product/ProductDetails') ||
            id.includes('/components/product/ProductGallery') ||
            id.includes('/components/product/AddToCartForm')
          ) {
            return 'shared-product';
          }
          if (
            id.includes('/components/home/ProductsSlider') ||
            id.includes('/components/home/Testimonials') ||
            id.includes('/components/home/HomeComponentRenderer')
          ) {
            return 'shared-home';
          }
        },
      },
    },
  },
}));
