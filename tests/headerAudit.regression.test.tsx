/* Header / Mega-Menu audit regressions (2026-11-16).
 *
 * Each test below failed before its fix and passes after it:
 *  1. switching `header_layout` at runtime changed the number of hooks in
 *     `Header` (React 19: "Internal React error: Expected static flag was missing"),
 *  2. the mega-menu's fallback slot was re-picked with `Math.random()` on every
 *     render, so the featured image changed under the pointer and SSR disagreed
 *     with the client.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const state = { theme: { settings: {} as Record<string, unknown> } };

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ matches: [], location: { pathname: '/ar' } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ store: { url: '/', name: 'Acme' }, theme: state.theme }),
  useIsHome: () => true,
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({ HookSlot: () => null }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: () => <img alt="" />,
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => (
    <a href={String(to ?? '#')} {...rest}>{children}</a>
  ),
  CurrencySymbol: () => <span />,
}));
vi.mock('@salla.sa/twilight-theme-engine/layout', () => ({ PageAdvertisements: () => null }));
vi.mock('@salla.sa/twilight-components-react/search', () => ({ SallaSearch: () => null }));
vi.mock('@salla.sa/twilight-components-react/social', () => ({ SallaSocial: () => null }));
vi.mock('@salla.sa/twilight-components-react/user-menu', () => ({ SallaUserMenu: () => null }));
vi.mock('@salla.sa/twilight-components-react/cart-summary', () => ({ SallaCartSummary: () => null }));
vi.mock('../app/components/layout/MorphHeader', () => ({
  MorphHeader: () => <div data-testid="mock-morph-head" />,
}));

import { Header } from '../app/components/layout/Header';

describe('audit: Header', () => {
  beforeEach(() => {
    state.theme = { settings: {} };
  });

  /* The theme used to offer three layouts (`lite` / `default` / `morph`) and
   * `Header` switched between them at runtime. The other two are gone from the
   * customization settings, so every store renders the morph header — including
   * one that still carries the old value. */
  it('renders the morph header for a saved lite/default/missing header_layout', () => {
    for (const saved of ['lite', 'default', 'morph', undefined]) {
      state.theme = { settings: saved ? { header_layout: saved } : {} };
      const { container, unmount } = render(<Header />);
      expect(container.querySelector('[data-testid="mock-morph-head"]')).not.toBeNull();
      unmount();
    }
  });

  it('does NOT crash when header_layout changes at runtime', () => {
    state.theme = { settings: { header_layout: 'morph' } };
    const { rerender } = render(<Header />);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let error: Error | null = null;
    try {
      for (const next of ['lite', 'default', 'morph']) {
        state.theme = { settings: { header_layout: next } };
        act(() => { rerender(<Header />); });
      }
    } catch (e) {
      error = e as Error;
    }
    const reactInternal = consoleError.mock.calls
      .flat()
      .some((arg) => String(arg).includes('Internal React error'));
    consoleError.mockRestore();
    expect(error).toBeNull();
    // A hook-count change makes React emit "Internal React error: Expected static flag was missing".
    expect(reactInternal).toBe(false);
  });
});

/* ── curtain random fallback stability ─────────────────────────────────── */
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['cats'] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: vi.fn(() => Promise.resolve({ data: [] })) },
}));
vi.mock('@salla.sa/twilight-components-react', () => ({
  SallaProductsList: ({ children }: { children?: (items: unknown[]) => React.ReactNode }) => (
    <div>{children ? children([]) : null}</div>
  ),
  ProductsListSkeleton: () => null,
}));
vi.mock('../app/components/product/MorphMenuCard', () => ({
  MorphMenuCard: () => <div />,
}));

import { MorphCurtain } from '../app/components/layout/MorphCurtain';
import { readSlots } from '../app/lib/curtainSlots';

const LABELS = {
  noSubs: 'x', noSlot: 'x', noSlotHere: 'x', slotHint: 'x',
  noSlotMissing: 'x', slotMissingHint: 'x', featured: 'x',
  categoryProducts: 'x', emptyFeatured: 'x',
};
const MENU = { id: 1, title: 'A', url: '/ar/a/c1', children: [] };
const TWO_SLOTS = [
  { category: [{ value: '/other/c9' }], type: [{ value: 'image' }], image: 'one.png', title: 'One' },
  { category: [{ value: '/other/c8' }], type: [{ value: 'image' }], image: 'two.png', title: 'Two' },
];

describe('audit: MorphCurtain fallback', () => {
  it('does NOT re-roll the random fallback slot on every re-render', () => {
    const random = vi.spyOn(Math, 'random');
    random.mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
    const slots = readSlots(TWO_SLOTS);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const props = {
      open: true, menu: MENU as never, focusId: null, slots,
      slotsRaw: TWO_SLOTS, labels: LABELS, pieces: (n: number) => `${n}`,
      onDrill: () => {},
    };
    const { container, rerender } = render(
      <QueryClientProvider client={client}><MorphCurtain {...props} /></QueryClientProvider>
    );
    const first = container.querySelector('.morph-spotlight__img')?.getAttribute('src');
    act(() => {
      rerender(<QueryClientProvider client={client}><MorphCurtain {...props} labels={{ ...LABELS }} /></QueryClientProvider>);
    });
    const second = container.querySelector('.morph-spotlight__img')?.getAttribute('src');
    random.mockRestore();
    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });
});
