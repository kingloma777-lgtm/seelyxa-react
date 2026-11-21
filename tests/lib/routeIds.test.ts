import { describe, expect, it } from 'vitest';
import { HOME_ROUTE_ID, PRODUCT_ROUTE_ID, isHomePath } from '../../app/lib/routeIds';

/**
 * `isHomePath` decides the heading level of the store name in the header, and
 * therefore whether the home page ships an `h1` in its server-rendered HTML.
 * The engine's `useIsHome()` is not usable for that: its route id settles after
 * mount, so the home page used to render `h2` on the server and flip to `h1` on
 * the client — leaving crawlers with no `h1` at all.
 *
 * These cases pin the two path shapes that actually occur: production
 * (`/ar`, `/`) and the Salla dev shell (`/dev-<id>/ar`).
 */
describe('isHomePath', () => {
  it('accepts the production home shapes', () => {
    expect(isHomePath('/')).toBe(true);
    expect(isHomePath('/ar')).toBe(true);
    expect(isHomePath('/en')).toBe(true);
    expect(isHomePath('/ar/')).toBe(true);
    expect(isHomePath('/en/')).toBe(true);
  });

  it('accepts a regional locale on the home page', () => {
    expect(isHomePath('/ar-SA')).toBe(true);
    expect(isHomePath('/en-US')).toBe(true);
  });

  it('accepts the dev preview shell, which prefixes the store with /dev-<id>', () => {
    expect(isHomePath('/dev-vgckq3fssfhjewwi/ar')).toBe(true);
    expect(isHomePath('/dev-vgckq3fssfhjewwi/en')).toBe(true);
    expect(isHomePath('/dev-vgckq3fssfhjewwi/ar/')).toBe(true);
  });

  it('rejects every inner page, with or without the dev shell', () => {
    for (const path of [
      '/ar/cart',
      '/en/products',
      '/ar/search?q=x',
      '/ar/account/profile',
      '/dev-vgckq3fssfhjewwi/ar/cart',
      '/dev-vgckq3fssfhjewwi/en/products',
      '/ar/blog',
      '/en/account',
    ]) {
      expect(isHomePath(path), path).toBe(false);
    }
  });

  it('rejects a missing pathname instead of claiming it is home', () => {
    expect(isHomePath(undefined)).toBe(false);
    expect(isHomePath(null)).toBe(false);
    expect(isHomePath('')).toBe(false);
  });

  it('does not mistake a page whose slug starts with a locale-like pair', () => {
    // `/ar` is a locale, `/arabic` is not — the lookahead keeps them apart.
    expect(isHomePath('/arabic')).toBe(false);
    expect(isHomePath('/en-something/page')).toBe(false);
  });

  it('keeps the route-id constants that routes.ts depends on', () => {
    expect(HOME_ROUTE_ID).toBe('/{-$locale}/');
    expect(PRODUCT_ROUTE_ID).toBe('/{-$locale}/$slug/p{$id}');
  });
});
