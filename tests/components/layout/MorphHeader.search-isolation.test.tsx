import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';

/**
 * The search field's state must not re-render the header.
 *
 * Measured before the split: every keystroke re-rendered `MorphHeader` — the
 * nav (and its magnetic listeners), the fullscreen index, the account takeover
 * and the curtain's props — because `searchTerm` lived in the header. That is
 * ~1500 lines of element tree per character typed, for a value whose only
 * consumer is the results panel.
 *
 * This test counts the renders of a header SIBLING (the curtain) while typing.
 * If the typing state ever moves back up into the header, the count moves with
 * it and this fails — which is the point: it is a behavioural guard, not a
 * source-shape one.
 */
let curtainRenders = 0;

vi.mock('../../../app/components/layout/MorphCurtain', () => ({
  MorphCurtain: () => {
    curtainRenders += 1;
    return <div data-testid="morph-curtain" hidden />;
  },
}));

const state = {
  menus: [
    { id: 1, title: 'الأثاث', url: '/ar/furniture', children: [] },
    { id: 2, title: 'الإضاءة', url: '/ar/lighting', children: [] },
  ] as Record<string, unknown>[],
};

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
    select({ matches: [], location: { pathname: '/ar' } }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isFetching: false }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['morph-menus'] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['morph-categories'] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { queries: { list: () => ({ queryKey: ['morph-search'] }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    store: { url: '/', name: 'Acme', logo: 'logo.png', social: {} },
    theme: { settings: {} },
    currency: { code: 'SAR' },
  }),
  useNavigate: () => vi.fn(),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k, locale: 'ar' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (v: unknown) => String(v ?? '') }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <a href={String(to)} {...rest}>
      {children}
    </a>
  ),
  Image: (props: Record<string, unknown>) => <img alt={String(props.alt ?? '')} src={String(props.src ?? '')} />,
  CurrencySymbol: () => <i />,
}));
vi.mock('@salla.sa/twilight-components-react/social', () => ({ SallaSocial: () => <span /> }));
vi.mock('@salla.sa/twilight-components-react/user-menu', () => ({
  SallaUserMenu: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@salla.sa/twilight-components-react/cart-summary', () => ({
  SallaCartSummary: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

import { MorphHeader } from '../../../app/components/layout/MorphHeader';

beforeEach(() => {
  curtainRenders = 0;
  /* `useStoreMenus` reads the query stub, which answers `[]` here — feed the
     fixture through the module-level array instead */
  state.menus.length = 2;
});

describe('search typing is isolated from the header', () => {
  it('does not re-render the header’s siblings while the keyword changes', () => {
    const { container, unmount } = render(<MorphHeader />);
    const before = curtainRenders;

    const toggle = container.querySelector<HTMLElement>('.morph-search__toggle')!;
    act(() => {
      fireEvent.click(toggle);
    });
    const afterOpen = curtainRenders;

    const input = container.querySelector<HTMLInputElement>('.morph-search__input')!;
    act(() => {
      for (const value of ['ك', 'كن', 'كنب']) {
        fireEvent.change(input, { target: { value } });
      }
    });

    /* the panel is a child of the search, so it re-renders on every keystroke;
       the curtain — a sibling of the whole search cluster — does not */
    expect(curtainRenders).toBe(afterOpen);
    expect(afterOpen - before).toBeLessThanOrEqual(1);
    expect(input.value).toBe('كنب');
    unmount();
  });
});
