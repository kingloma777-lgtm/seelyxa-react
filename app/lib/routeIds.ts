// Same path string as `createFileRoute(...)` in `app/routes/$slug.p$id.tsx`.
export const PRODUCT_ROUTE_ID = '/{-$locale}/$slug/p{$id}';

// Same path string as `createFileRoute(...)` in `app/routes/index.tsx`.
export const HOME_ROUTE_ID = '/{-$locale}/';

/**
 * Is this router pathname the storefront's home page?
 *
 * Reads the path rather than the engine's `useIsHome()` on purpose. That hook
 * compares `getTwilightContext().routeId` to `RouteId.INDEX`, and the context
 * settles only after mount — which is why the header used to render `h2` on the
 * server and flip to `h1` on the client. A heading level that changes after
 * hydration is a real problem in two directions: crawlers and social bots that
 * do not execute JS saw **no `h1` at all** on the home page, and React had to
 * tolerate an element type change mid-life.
 *
 * A pathname from `useRouterState` is identical on the server and on the first
 * client render (it is part of the hydrated router state), so the heading level
 * can be decided once, in the markup, with nothing to flip.
 *
 * Accepts both shapes that occur:
 *   `/`, `/ar`, `/en`, `/ar/`            — production
 *   `/dev-<id>/ar`, `/dev-<id>/en`       — the Salla dev preview shell
 */
export function isHomePath(pathname: string | undefined | null): boolean {
  if (!pathname) return false;
  // The dev shell serves the store under `/dev-<id>/…`; a no-op in production.
  const withoutDevShell = pathname.replace(/^\/dev-[^/]+/, '');
  const withoutLocale = withoutDevShell.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '');
  return withoutLocale === '' || withoutLocale === '/';
}
