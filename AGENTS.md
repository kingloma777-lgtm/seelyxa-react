# AGENTS.md

Salla React storefront theme: TanStack Start (server-rendered at the edge) on
`@salla.sa/twilight-theme-engine`. You customize the engine; you do not fork it.

## Read the docs before writing code

Do not write an engine API from memory. Look it up first:

- Salla Partners MCP tool `salla_themes_docs` (`search`, `read`, `list`), or
- `https://docs.salla.dev/twilight/react/llms.txt` (index), then add `.md` to any page URL.

| I want to…                                             | Read                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Add a page                                             | `/recipes/add-a-page`                                                                |
| Change a built-in page                                 | `/recipes/fork-a-built-in-route`                                                     |
| Add a home block                                       | `/recipes/add-a-home-block`                                                          |
| Replace the product card                               | `/recipes/replace-the-product-card`                                                  |
| Put content in an existing spot                        | `/recipes/add-content-to-a-slot`                                                     |
| Add translations                                       | `/recipes/add-translation-keys`                                                      |
| React to cart events                                   | `/recipes/react-to-cart-events`                                                      |
| Add a merchant setting                                 | `/guide/settings`, and `/guide/twilight-json` for every key and format               |
| Load data in a page                                    | `/guide/loading-data`                                                                |
| Style something                                        | `/guide/styling`                                                                     |
| Navigate, detect the page, redirect or 404 in a loader | `/hooks/navigation`                                                                  |
| Set classes on `<html>`/`<body>`                       | `/hooks/use-document-class`                                                          |
| Loading placeholders                                   | `/components/skeleton`                                                               |
| Keep it fast, or lint it                               | `/guide/performance`, `/guide/lint-your-theme`                                       |
| Use a `<salla-*>` web component                        | `/web-components` (index), then `/web-components/<tag>` for its props, events, slots |

## Layout

```text
app/start.ts          request middleware. Rarely edited.
app/router.tsx        createRouter(), registerHomeComponents(), registerThemeHooks()
app/routes.ts         EDIT: manifest of custom or overriding routes
app/routes/__root.tsx EDIT: the only hand-maintained route file
app/routes/*          your route files (declared in routes.ts); the rest are generated
app/routeTree.gen.ts  GENERATED. Never edit.
app/components/       EDIT: your components and overrides
app/hooks/            EDIT: React hooks (useX.ts) + hook-slot registrations (index.tsx)
app/lib/              EDIT: non-React helpers and constants
app/styles/           Tailwind + SCSS
FORKS.md              EDIT: engine components copied into this theme; update on engine upgrades
locales/{ar,en}.json  EDIT: theme translations
twilight.json         EDIT: merchant settings, home blocks, features
```

## Rules that prevent the usual mistakes

**Routes**

- A new or overriding page needs both: a `route('/path', 'file.tsx')` entry in `app/routes.ts` and the file in `app/routes/`.
- Every storefront route path starts with `{-$locale}`: `createFileRoute('/{-$locale}/about')`.
- Never put `// @auto-generated` at the top of a route file you own. The next build deletes it.
- Never edit `routeTree.gen.ts`. It is regenerated.
- Test pages at `/ar` or `/en`, never `/`.

**Components and registry**

- Only three registry keys are resolved: `product:card`, the `home:*` blocks, `account:layout-pending`. Overriding any other name does nothing. For anything else use a hook slot or fork the route.
- To replace the product card call `registry.register('product:card', X)` and then `registry.override('product:card', X)`. `override()` alone is silently ignored.
- Home blocks are bound by key in `registerHomeComponents({ ...DefaultHomeComponents, key: MyComponent })`. Keep the spread, or you lose the defaults.
- A block with a `view_style` is looked up as `key:styleN` before `key`. Register both when you replace it.

**Imports**

- Import from the narrowest public subpath: `@salla.sa/twilight-theme-engine/hooks/useStore`, `/common`, `/cart`, `/product`, `/layout`.
- Never import from `dist/` or `src/` of the engine. Those paths are not public.
- Use the engine `Link` (`/common`) for internal navigation, not `<a>`.

**Data and settings**

- Theme settings are a plain object: `const { settings } = useTheme(); settings?.my_id ?? default`. There is no `settings.get()`.
- `useMoney().format()` returns a React node, not a string.
- Merchant settings and home blocks are declared in `twilight.json`; reading them in code is not enough.
- The SDK is `window.salla`. Subscribe and unsubscribe with the same API and the same function reference, in a `useEffect` cleanup. Use the dotted event name (`auth::logged.in`).
- No `window.location.reload()` and no manual DOM edits. Use state, refs and `key`.

**Translations**

- Add keys to both `locales/ar.json` and `locales/en.json`. Arabic and RTL come first: use logical CSS (`ms-*`, `ps-*`, `text-start`) not left/right.

## Web components (`<salla-*>`)

The engine renders many Salla widgets as web components. In React, prefer, in this order:

1. A native engine component (`Link`, `ProductCard`, `Breadcrumb`, product lists and sliders) when one exists.
2. A wrapper from `@salla.sa/twilight-components-react` (granular import: `.../slider`, `.../rating-stars`).
3. A raw `<salla-*>` tag only if there is no wrapper.

Before using one, `read` `/web-components/<tag>` (for example `/web-components/salla-modal`) for its exact props, events, methods and slots. Do not invent attributes.

**Engine dev preview (`POST /__twilight/preview`)**

The dev preview state (`twilight.preview.json`, body `{ state: { enabled, settings, layout } }`)
overrides BOTH home layout and theme settings while `enabled: true`. Two ways it once
took the MorphPill header down — never repeat them:

- `settings: {}` is NOT "no override". The engine merges `{ ...baseTheme.settings, ...overrides }`,
  so any key you omit keeps the store's value — but `header_layout` (the MorphPill gate,
  `settings.header_layout === 'morph'`) must be present and must be the **scalar string**
  `'morph'`; a picker array `[{ value: 'morph' }]` fails that strict comparison and the
  header silently falls back to `site-header--lite`.
- `enabled: false` drops the override entirely and exposes the store's real settings —
  which on a dev store may not have `header_layout = morph` saved at all.

**Never hammer-move the dev dev-server off them — one reload per change.** Every page
load makes the engine fetch `api.salla.dev/store/v1/store/settings`. Pin that request
often enough (rapid reload loops during diagnostics) and Cloudflare answers
**429 Too Many Requests with a challenge page** (`cf-mitigated: challenge`) for the
whole machine IP — every SSR render then fails with a **500** (the settings fetch
throws), the client logs *"Could not hydrate twilight context"* + a hydration
mismatch, and the page looks randomly broken: popups dead, mega menu half-rendered,
cart page off. None of that is a code regression; it is the rate limit. The fix is
one: **stop reloading and let the cooldown pass** (minutes, IP-wide, survives a dev
server restart). Verify with a single `fetch` of the page (status 200, `morph-header`
in the HTML) before opening it again.

Reproducible restore payload: all `value`/`selected` fields from `twilight.json`
(`header_layout` forced to the scalar string `'morph'`, no `curtain_slots` — that
collection keeps passing through to the store's real value), `layout: null` to render
no home blocks. Served settings merge over the store's, so omit anything you do not
want to shadow.

## Verify

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm check:manifest   # after editing twilight.json: duplicate ids, missing options, bad values
```

Do not start `pnpm dev` yourself; ask the user to run it. Typecheck needs `app/routeTree.gen.ts`, which `pnpm build` or `pnpm dev` generates.
