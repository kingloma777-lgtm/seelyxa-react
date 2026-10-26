import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react';
import { Header } from '../../../app/components/layout/Header';
import { MorphHeader } from '../../../app/components/layout/MorphHeader';

/* The store menu payload (twilight API): two top categories, one with kids. */
const MENUS = [
  { id: 1, title: 'الأثاث', url: '/ar/furniture', children: [{ id: 11, title: 'كراسي', url: '/ar/furniture/chairs' }] },
  { id: 2, title: 'الإضاءة', url: '/ar/lighting', children: [] },
] as unknown as Record<string, unknown>[];

const state = {
  store: {
    url: '/',
    name: 'Acme',
    logo: 'logo.png',
    social: {},
  } as Record<string, unknown>,
  theme: { settings: {} as Record<string, unknown> },
  isHome: false,
  routeIds: [] as string[],
  menus: null as Record<string, unknown>[] | null,
};

type RouterStateStub = {
  matches: { routeId: string }[];
  location: { pathname: string };
};

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: RouterStateStub) => unknown }) =>
    select({
      matches: state.routeIds.map((routeId) => ({ routeId })),
      location: { pathname: '/ar' },
    }),
}));

/* `useQuery` is stubbed to resolve instantly with the fixture payload. The
   curtain also reads the category tree through this hook (the
   menuCategoryIndex enrichment), so the stub keys on the queryKey and hands
   the menus fixture only to the menus query — everything else resolves as an
   empty list (no categories → no enrichment effects on these fixtures). */
vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: unknown) => {
    const arg = opts as { queryKey?: unknown[] } | (() => { queryKey: unknown[] });
    const key = typeof arg === 'function' ? arg().queryKey : arg?.queryKey;
    const isMenus = Array.isArray(key) && key[0] === 'morph-menus';
    return { data: isMenus ? (state.menus ?? MENUS) : [], isLoading: false };
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['morph-menus'] }) } },
}));

vi.mock('@salla.sa/twilight-theme-engine/api/category', () => ({
  category: { queries: { list: () => ({ queryKey: ['morph-categories'] }) } },
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ store: state.store, theme: state.theme, currency: { code: 'SAR' } }),
  useIsHome: () => state.isHome,
  /* the pill's search navigates; every scenario here renders without a router */
  useNavigate: () => vi.fn(),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => String(value ?? '') }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { queries: { list: () => ({ queryKey: ['morph-search'] }) } },
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k, locale: 'ar' }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <a href={String(to)} className={className as string} {...rest}>
      {children}
    </a>
  ),
  Image: (props: Record<string, unknown>) => <img alt={String(props.alt ?? '')} src={String(props.src ?? '')} />,
  CurrencySymbol: ({ currency }: { currency?: string }) => <i data-currency={currency} />,
}));

vi.mock('@salla.sa/twilight-components-react/menu', () => ({
  SallaMenu: () => <salla-menu />,
}));
vi.mock('@salla.sa/twilight-components-react/contacts', () => ({
  SallaContacts: () => <salla-contacts />,
}));
vi.mock('@salla.sa/twilight-components-react/social', () => ({
  SallaSocial: () => <salla-social />,
}));
vi.mock('@salla.sa/twilight-components-react/user-menu', () => ({
  SallaUserMenu: ({ children }: { children?: React.ReactNode }) => (
    <salla-user-menu>{children}</salla-user-menu>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/cart-summary', () => ({
  SallaCartSummary: ({ children }: { children?: React.ReactNode }) => (
    <salla-cart-summary>{children}</salla-cart-summary>
  ),
}));
/* the curtain imports these through the index barrel — stub the native list */
vi.mock('@salla.sa/twilight-components-react', () => ({
  SallaProductsList: () => <div data-testid="curtain-items" />,
  ProductsListSkeleton: () => <div data-testid="curtain-skeleton" />,
}));

/* The engine Header (the non-morph branch) is mocked at its own seams: the
   heavy sub-components and the hook slot it renders. */
vi.mock('../../../app/components/layout/HeaderMainMenu', () => ({
  HeaderMainMenu: () => <div data-testid="header-main-menu" />,
}));
vi.mock('../../../app/components/layout/HeaderNav', () => ({
  HeaderNav: () => <nav data-testid="header-nav" />,
}));
vi.mock('../../../app/components/layout/HeaderTopnav', () => ({
  HeaderTopnav: () => <div data-testid="header-topnav" />,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-hook-slot={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/layout', () => ({
  PageAdvertisements: () => <div data-testid="advertisement-bar-render" />,
}));

beforeEach(() => {
  state.store = { url: '/', name: 'Acme', logo: 'logo.png', social: {} };
  state.theme = { settings: {} };
  state.isHome = false;
  state.routeIds = [];
  state.menus = null;
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-morph-lift');
  window.localStorage.clear();
});

afterEach(() => {
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-morph-lift');
  document.body.style.overflow = '';
  window.localStorage.clear();
});

describe('Header → MorphPill selection', () => {
  it('keeps the engine shell for the lite/default layouts', () => {
    // the default branch mounts its sticky sentinel via IntersectionObserver
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    const { container } = render(<Header />);
    expect(container.querySelector('.morph-header')).toBeNull();
    expect(container.querySelector('header.site-header')).toBeTruthy();
  });
});

describe('MorphHeader', () => {
  beforeEach(() => {
    state.theme = { settings: { header_layout: 'morph' } };
  });

  it('is selected by header_layout = morph (through Header)', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('[data-testid="morph-header"]')).toBeTruthy();
  });

  it('renders the pill: brand, burger, nav categories, actions', () => {
    const { container, getByTestId, queryByTestId } = render(<MorphHeader />);
    expect(getByTestId('morph-pill')).toBeTruthy();
    expect(getByTestId('morph-header-burger')).toBeTruthy();
    /* the utility topbar was deleted (2026-10-20): nothing renders above the
       header, and its old test id must not come back */
    expect(queryByTestId('morph-header-topbar')).toBeNull();
    expect(container.querySelector('.morph-topbar')).toBeNull();

    // nav from the menu query — one link per untitled-pruned category. The
    // selector is scoped to the nav's direct children so the hidden
    // «المزيد» measuring probe (also .morph-link) never inflates the count.
    const links = container.querySelectorAll('.morph-pill__nav > .morph-link');
    expect(links).toHaveLength(2);
    // only the parent with kids carries the flag (rule 9 triage data)
    expect(links[0].getAttribute('data-morph-has')).toBe('1');
    expect(links[1].getAttribute('data-morph-has')).toBeNull();
    expect(container.querySelector('[data-testid="morph-blob"]')).toBeTruthy();
  });

  it('moves overflowing links under «المزيد» when they do not fit the row', () => {
    /* geometry: a 606px nav; every .morph-link is 40px + 11px per letter, so
       only the first three (تخفيضات، المدونة، اكسسورات) fit beside «المزيد». */
    const titles = ['تخفيضات', 'المدونة', 'اكسسورات', 'أجهزة منزلية', 'الإلكترونيات', 'الأرائك والكراسي', 'المنزل', 'صفحة الماركات'];
    const eight = titles.map((title, i) => ({
      id: i + 1,
      title,
      url: `/ar/cat-${i + 1}`,
      children: [{ id: (i + 1) * 10, title: `قسم ${title}`, url: `/ar/cat-${i + 1}/sub` }],
    }));
    state.menus = eight as unknown as Record<string, unknown>[];
    const widths = new Map(eight.map((m) => [m.title, m.title.length * 11 + 40]));
    const bcrSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const text = (this.textContent ?? '').trim();
        const w = widths.get(text) ?? text.length * 11 + 40;
        return {
          x: 0, y: 0, left: 0, top: 0,
          width: w, height: 40, right: w, bottom: 40, toJSON: () => ({}),
        } as DOMRect;
      });
    const cw = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
    Object.defineProperty(Element.prototype, 'clientWidth', {
      configurable: true,
      get: () => 606,
    });

    try {
      const { container } = render(<MorphHeader />);
      const nav = container.querySelector<HTMLElement>('.morph-pill__nav')!;

      // the split applied: exactly the three that fit, then «المزيد»
      const direct = Array.from(nav.querySelectorAll(':scope > .morph-link'));
      expect(direct.map((l) => l.textContent?.trim())).toEqual([
        'تخفيضات', 'المدونة', 'اكسسورات', 'المزيد',
      ]);
      expect(nav.querySelector('[data-testid="morph-more"]')).toBeTruthy();
      // the measuring probe is gone once the split is known
      expect(nav.querySelector('.morph-nav__probe')).toBeNull();

      // hovering «المزيد» opens the curtain that carries the overflowed links
      act(() => {
        direct[3].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      });
      const curtain = container.querySelector<HTMLElement>('[data-testid="morph-curtain"]')!;
      expect(curtain.hidden).toBe(false);
      // the curtain's discs are the overflowed links themselves
      eight.slice(3).forEach((m) => expect(curtain.textContent).toContain(m.title));
    } finally {
      bcrSpy.mockRestore();
      if (cw) Object.defineProperty(Element.prototype, 'clientWidth', cw);
    }
    state.menus = null;
  });

  it('writes the merchant settings as inline custom properties', () => {
    state.theme = {
      settings: {
        header_layout: 'morph',
        header_glass_color: '#334455',
        header_glass_opacity: 62,
        header_blur: 24,
        header_text_color: '#123456',
        header_nav_font_size: 16,
        header_nav_weight: '800',
      },
    };
    const { getByTestId } = render(<MorphHeader />);
    const style = getByTestId('morph-header').getAttribute('style') ?? '';
    expect(style).toContain('--morph-glass-color: #334455');
    expect(style).toContain('--morph-glass-alpha: 62');
    expect(style).toContain('--morph-blur: 24px');
    expect(style).toContain('--morph-fg: #123456');
    expect(style).toContain('--morph-nav-size: 16px');
    expect(style).toContain('--morph-nav-weight: 800');
  });

  it('morphs on one boolean (scrollY > 40) → .is-scrolled', () => {
    const { container } = render(<MorphHeader />);
    const header = container.querySelector('.morph-header');
    expect(header?.classList.contains('is-scrolled')).toBe(false);
    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 45 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(header?.classList.contains('is-scrolled')).toBe(true);
    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 10 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(header?.classList.contains('is-scrolled')).toBe(false);
  });

  it('burger opens the fullscreen index, Escape closes it', () => {
    const { getByTestId } = render(<MorphHeader />);
    const overlay = getByTestId('morph-overlay-nav').closest('.morph-overlay') as HTMLElement;
    expect(overlay.classList.contains('is-hidden')).toBe(true);

    act(() => {
      fireEvent.click(getByTestId('morph-header-burger'));
    });
    expect(overlay.classList.contains('is-hidden')).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(overlay.classList.contains('is-hidden')).toBe(true);
    expect(document.body.style.overflow).toBe('');
  });

  it('magnetic hover lights the blob under the hovered link only', () => {
    const { container } = render(<MorphHeader />);
    const link = container.querySelectorAll<HTMLElement>('.morph-link')[0];
    const other = container.querySelectorAll<HTMLElement>('.morph-link')[1];
    const blob = container.querySelector<HTMLElement>('[data-testid="morph-blob"]');

    act(() => {
      Object.defineProperty(link, 'offsetWidth', { configurable: true, value: 120 });
      Object.defineProperty(link, 'offsetHeight', { configurable: true, value: 40 });
      Object.defineProperty(link, 'offsetLeft', { configurable: true, value: 0 });
      Object.defineProperty(link, 'offsetTop', { configurable: true, value: 0 });
      link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });
    expect(blob?.classList.contains('is-on')).toBe(true);
    expect(link.classList.contains('is-on-blob')).toBe(true);
    expect(other?.classList.contains('is-on-blob')).toBe(false);

    act(() => {
      link.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }));
    });
  });

  it('theme toggle flips html.dark and remembers the choice', () => {
    const { getByTestId } = render(<MorphHeader />);
    const btn = getByTestId('morph-theme-btn');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    act(() => {
      fireEvent.click(btn);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('seelyxa-theme')).toBe('dark');
    // re-query: the aria press state lives on the re-rendered button
    expect(getByTestId('morph-theme-btn').getAttribute('aria-pressed')).toBe('true');
    act(() => {
      fireEvent.click(getByTestId('morph-theme-btn'));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('seelyxa-theme')).toBe('light');
  });

  it('theme toggle can be switched off by the merchant', () => {
    state.theme = { settings: { header_layout: 'morph', header_theme_toggle: false } };
    const { queryByTestId } = render(<MorphHeader />);
    expect(queryByTestId('morph-theme-btn')).toBeNull();
    // and the index does not quietly offer the one the merchant removed
    expect(queryByTestId('morph-overlay-theme-btn')).toBeNull();
  });

  /* The phone row cannot hold the pill's 44px chip (measured live: 554px of
     content in a 317px box), so the same toggle also lives in the burger's
     index. It must be the SAME switch, not a second state. */
  it('mirrors the theme toggle inside the burger index (the phone copy)', () => {
    const { getByTestId } = render(<MorphHeader />);
    expect(getByTestId('morph-overlay-theme-btn').getAttribute('aria-pressed')).toBe('false');
    act(() => {
      fireEvent.click(getByTestId('morph-overlay-theme-btn'));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(getByTestId('morph-theme-btn').getAttribute('aria-pressed')).toBe('true');
    expect(getByTestId('morph-overlay-theme-btn').getAttribute('aria-pressed')).toBe('true');
    act(() => {
      fireEvent.click(getByTestId('morph-theme-btn'));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(getByTestId('morph-overlay-theme-btn').getAttribute('aria-pressed')).toBe('false');
  });

  it('lifts the first home block when it opted into the under-header layer', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1300 });
    document.body.innerHTML =
      '<div id="main-content"><div class="s-block s-block--under-header" id="first-block"></div><div class="s-block"></div></div>';
    render(<MorphHeader />);
    await waitFor(() => {
      expect(document.documentElement.hasAttribute('data-morph-lift')).toBe(true);
    });
    // a page without the opt-in keeps the natural stacking
    document.body.innerHTML = '<div id="main-content"><div class="s-block"></div></div>';
  });

  it('no topbar renders above the header, whatever the settings say', () => {
    state.theme = { settings: { header_layout: 'morph', header_topbar_hide: false, important_links: true } };
    const { queryByTestId } = render(<MorphHeader />);
    /* the bar was deleted with its attribute and both settings: the merchant
       asked for nothing above the header and the language in the pill */
    expect(queryByTestId('morph-header-topbar')).toBeNull();
    expect(screen.getByTestId('morph-header').hasAttribute('data-hide-topbar')).toBe(false);
  });
});
