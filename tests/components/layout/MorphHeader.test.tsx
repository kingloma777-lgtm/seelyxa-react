import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react';
import { Header } from '../../../app/components/layout/Header';
import { MorphHeader } from '../../../app/components/layout/MorphHeader';
import { closeHeaderMenu } from '../../../app/lib/headerMenu';

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
  /* the real component puts `className` on the <img> and spreads the rest of
     the props onto it — the mock has to do the same or a test cannot tell the
     day logo from the night one */
  Image: (props: Record<string, unknown>) => (
    <img
      alt={String(props.alt ?? '')}
      src={String(props.src ?? '')}
      className={props.className as string}
      aria-hidden={props['aria-hidden'] as boolean | undefined}
    />
  ),
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
vi.mock('@salla.sa/twilight-components-react/user-menu', async () => {
  const ReactLib = await import('react');
  return {
    /* forward the ref: MorphHeader attaches its host-only click forwarder to
       the custom element through it */
    SallaUserMenu: ReactLib.forwardRef(
      (
        { children }: { children?: React.ReactNode },
        ref: React.ForwardedRef<HTMLElement>
      ) => <salla-user-menu ref={ref as never}>{children}</salla-user-menu>
    ),
  };
});
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
  // The index's open flag is a module store (`lib/headerMenu`) — it survives a
  // test that clicks the burger, so reset it here or the next test starts with
  // the overlay already up.
  closeHeaderMenu();
});

afterEach(() => {
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-morph-lift');
  document.body.style.overflow = '';
  window.localStorage.clear();
  /* No `closeHeaderMenu()` here: RTL's own cleanup is registered first, so our
     hook runs BEFORE the tree unmounts — the store would notify a still-mounted
     header, and that setState lands outside `act`. `beforeEach` resets it
     instead, before anything renders. */
});

describe('Header → MorphPill selection', () => {
  /* The lite/default layouts were removed from the customization settings, so
     `Header` no longer branches: a store still holding the old value gets the
     morph header rather than a blank bar. */
  it('renders the morph header for a saved lite/default value', () => {
    for (const saved of ['lite', 'default', undefined]) {
      state.theme = { settings: saved ? { header_layout: saved } : {} };
      const { container, unmount } = render(<Header />);
      expect(container.querySelector('.morph-header')).toBeTruthy();
      expect(container.querySelector('header.site-header')).toBeNull();
      unmount();
    }
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

  /* `header_shape` is the second axis: the same header, two arrangements. The
     attribute is the whole contract — every shape rule in morph-header.scss
     hangs off it, and the fallback matters because a missing key must not
     leave the bar with no layout at all. */
  it('publishes header_shape as data-morph-shape, defaulting to wide', () => {
    const cases: [unknown, string][] = [
      [undefined, 'wide'],
      ['wide', 'wide'],
      ['pill', 'pill'],
      /* the store's real shape for an `items` setting is the picker array, not
         a bare string — this is the case production actually hits */
      [[{ label: 'حبة (Pill)', value: 'pill', key: 'header-shape-pill' }], 'pill'],
      [[{ label: 'عريض (Wide)', value: 'wide', key: 'header-shape-wide' }], 'wide'],
      // a value we do not know yet must not blank the bar
      ['whatever', 'wide'],
      [{ label: 'Pill' }, 'wide'],
    ];
    for (const [value, expected] of cases) {
      state.theme = { settings: { header_layout: 'morph', header_shape: value } };
      const { container, unmount } = render(<MorphHeader />);
      expect(container.querySelector('[data-testid="morph-header"]')?.getAttribute('data-morph-shape')).toBe(
        expected
      );
      unmount();
    }
  });

  it('publishes the mega-menu layout as data-morph-mega, defaulting to classic', () => {
    /* CSS hangs both compositions off this one attribute. A store that never
       touched the editor must advertise `classic`, or the opt-in three-column
       layout would silently become the default. */
    const cases: [unknown, string][] = [
      [undefined, 'classic'],
      ['classic', 'classic'],
      ['showcase', 'showcase'],
      [[{ label: 'واجهة العرض', value: 'showcase', key: 'k' }], 'showcase'],
      [[{ label: 'التوزيعة الكلاسيكية', value: 'classic', key: 'k' }], 'classic'],
      ['a future layout we do not know', 'classic'],
    ];
    for (const [value, expected] of cases) {
      state.theme = { settings: { header_layout: 'morph', header_mega_layout: value } };
      const { container, unmount } = render(<MorphHeader />);
      expect(container.querySelector('[data-testid="morph-header"]')?.getAttribute('data-morph-mega')).toBe(
        expected
      );
      unmount();
    }
  });

  /* the heart is the wide shape's extra chip; the capsule has no room for a
     fifth disc, so it is hidden there by CSS — but it must be in the DOM (and
     in the utilities cluster, not the account one) for either shape to use it */
  it('keeps the wishlist chip in the utilities cluster', () => {
    const { container } = render(<MorphHeader />);
    const heart = container.querySelector('[data-testid="morph-wishlist"]');
    expect(heart).toBeTruthy();
    expect(heart?.getAttribute('href')).toBe('/account/wishlist');
    expect(heart?.getAttribute('aria-label')).toBe('المفضلة');
    // inside the inline-start cluster, which is what puts it on the page edge
    expect(container.querySelector('[data-testid="morph-header-actions-start"] [data-testid="morph-wishlist"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="morph-header-actions-end"] [data-testid="morph-wishlist"]')).toBeNull();
  });

  /* the platform components inject their own unclassed wrapper, so a parent's
     `order`/grid selectors cannot reach them — they are wrapped in classed
     slots precisely so the two shapes can order the chips */
  it('wraps the platform account/cart in orderable slots', () => {
    const { container } = render(<MorphHeader />);
    const account = container.querySelector('.morph-slot--account');
    const cart = container.querySelector('.morph-slot--cart');
    expect(account?.querySelector('salla-user-menu')).toBeTruthy();
    expect(cart?.querySelector('salla-cart-summary')).toBeTruthy();
    // and both live in the inline-end cluster, next to the theme toggle
    const end = container.querySelector('[data-testid="morph-header-actions-end"]');
    expect(end?.contains(account!)).toBe(true);
    expect(end?.contains(cart!)).toBe(true);
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

  it('writes nothing inline when the merchant changed nothing', () => {
    /* THE INHERIT CONTRACT. `--morph-fg` and `--morph-glass-color` used to be
       written on every store as literals, so the header could never follow the
       store palette and the dark block had to beat them with `!important`.
       With no decisions there is no `style` attribute at all, and the
       stylesheet resolves `var(--ink-1)` / `var(--surface-1)` per mode. */
    state.theme = { settings: {} };
    const { getByTestId, unmount } = render(<MorphHeader />);
    expect(getByTestId('morph-header').getAttribute('style')).toBeNull();
    unmount();

    /* the saved defaults are not decisions either */
    state.theme = {
      settings: {
        header_glass_color: '#ffffff',
        header_text_color: '#0f172a',
        header_glass_opacity: 78,
        header_blur: 18,
        header_nav_font_size: 14,
        header_nav_weight: '700',
      },
    };
    const second = render(<MorphHeader />);
    expect(second.getByTestId('morph-header').getAttribute('style')).toBeNull();
  });

  it('publishes the behaviour flags as data attributes', () => {
    state.theme = { settings: { header_sticky: false, header_surface: 'solid' } };
    const { getByTestId } = render(<MorphHeader />);
    const header = getByTestId('morph-header');
    expect(header.getAttribute('data-morph-sticky')).toBe('0');
    expect(header.getAttribute('data-morph-surface')).toBe('solid');
  });

  it('keeps the collapsed search field out of the tab order', () => {
    /* measured failure: the field is clipped to a 44px disc with `opacity: 0`,
       yet the input kept `tabIndex: 0` — a keyboard user tabbed into a control
       they could not see, and the focus ring was invisible with it */
    state.theme = { settings: {} };
    const { getByTestId, unmount } = render(<MorphHeader />);
    expect(getByTestId('morph-search-input').tabIndex).toBe(-1);
    /* `tabIndex` fixes the keyboard only. The field's child keeps
       `min-width: 340px`, so the closed box still measures 340px (193px of it
       off-canvas in RTL) — a screen reader could walk into a search field that
       is nowhere on the screen. `inert` removes the closed subtree from the
       accessibility tree, which is the half `tabIndex` cannot reach. */
    expect(getByTestId('morph-search-field').hasAttribute('inert')).toBe(true);
    unmount();

    /* opening it puts the field back in the sequence and back in the a11y tree */
    const second = render(<MorphHeader />);
    act(() => {
      fireEvent.click(second.getByTestId('morph-search').querySelector('.morph-search__toggle') as Element);
    });
    expect(second.getByTestId('morph-search-input').tabIndex).toBe(0);
    expect(second.getByTestId('morph-search-field').hasAttribute('inert')).toBe(false);
  });

  it('opens the mega menu on keyboard focus, not only on hover', () => {
    /* WCAG 2.1.1: the panel was hover-only, so a keyboard user could tab
       through eleven categories and never reach a subcategory */
    state.theme = { settings: {} };
    const { container } = render(<MorphHeader />);
    const curtain = container.querySelector<HTMLElement>('[data-testid="morph-curtain"]')!;
    expect(curtain.hidden).toBe(true);

    const link = container.querySelector<HTMLElement>('.morph-pill__nav > .morph-link')!;
    act(() => {
      link.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(curtain.hidden).toBe(false);
  });

  it('renders a night logo only when the merchant uploaded one', () => {
    /* Salla ships ONE logo. A dark wordmark on the night bar measured ~1.8:1,
       and a CSS filter would flatten a coloured brand — so the theme carries a
       night-only variant instead. With no variant the markup must stay exactly
       as it was: one image, no dead node, no second request. */
    state.theme = { settings: {} };
    const plain = render(<MorphHeader />);
    expect(plain.container.querySelectorAll('.morph-brand__logo--night').length).toBe(0);
    expect(plain.container.querySelectorAll('.morph-brand__logo--day').length).toBe(1);
    plain.unmount();

    state.theme = { settings: { header_logo_dark: 'https://cdn.salla.network/night.png' } };
    const withNight = render(<MorphHeader />);
    const night = withNight.container.querySelector('.morph-brand__logo--night') as HTMLImageElement;
    expect(night).toBeTruthy();
    expect(night.getAttribute('src')).toContain('night.png');
    /* the variant is decoration: the accessible name stays on the real logo
       and the sr-only store name, so a screen reader does not hear it twice */
    expect(night.getAttribute('aria-hidden')).toBe('true');
    expect(night.getAttribute('alt')).toBe('');
    withNight.unmount();

    /* a hostile value is dropped at the settings layer, not at the img */
    state.theme = { settings: { header_logo_dark: 'javascript:alert(1)' } };
    const hostile = render(<MorphHeader />);
    expect(hostile.container.querySelectorAll('.morph-brand__logo--night').length).toBe(0);
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

  /* The hit-band lives on the host, but the platform's handler lives on its
     child button. A tap on the band/rim used to target the host and die there,
     which is exactly the "profile icon does nothing" report. */
  it('forwards a tap on the enlarged profile disc to the real control', () => {
    const { container } = render(<MorphHeader />);
    // the test mock intentionally drops props, so query the custom element
    const host = container.querySelector('salla-user-menu') as HTMLElement;
    expect(host).toBeTruthy();
    const login = document.createElement('button');
    login.className = 's-user-menu-login-btn';
    const onClick = vi.fn();
    login.addEventListener('click', onClick);
    host.appendChild(login);

    act(() => {
      host.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onClick).toHaveBeenCalledTimes(1);

    // a tap that already hit the button must not be forwarded a second time
    act(() => {
      login.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onClick).toHaveBeenCalledTimes(2);
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

  it('traps Tab inside the fullscreen index instead of leaking focus to the header', () => {
    const { getByTestId } = render(<MorphHeader />);
    act(() => {
      fireEvent.click(getByTestId('morph-header-burger'));
    });
    const overlay = getByTestId('morph-overlay-nav').closest('.morph-overlay') as HTMLElement;
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
    const items = Array.from(
      overlay.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((el) => el.tabIndex >= 0);
    expect(items.length).toBeGreaterThan(1);
    const first = items[0];
    const last = items[items.length - 1];
    last.focus();
    act(() => {
      fireEvent.keyDown(document, { key: 'Tab' });
    });
    expect(document.activeElement).toBe(first);
    first.focus();
    act(() => {
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    });
    expect(document.activeElement).toBe(last);
  });

  it('does not run a cursor-chase rAF loop for reduced-motion visitors', () => {
    const matchMedia = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent: () => false,
          onchange: null,
        }) as unknown as MediaQueryList
    );
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    try {
      const { getByTestId } = render(<MorphHeader />);
      act(() => {
        fireEvent.click(getByTestId('morph-header-burger'));
      });
      expect(getByTestId('morph-overlay-nav').closest('.morph-overlay')?.classList.contains('is-hidden')).toBe(false);
      // The overlay's chase has no target under reduce; starting it would
      // rewrite the same transform 60×/s for as long as the menu is open.
      expect(raf).not.toHaveBeenCalled();
    } finally {
      raf.mockRestore();
      matchMedia.mockRestore();
    }
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
