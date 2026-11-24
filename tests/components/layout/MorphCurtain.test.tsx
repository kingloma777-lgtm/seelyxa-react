import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MorphCurtain, type CurtainLabels } from '../../../app/components/layout/MorphCurtain';
import { readSlots } from '../../../app/lib/curtainSlots';
import { product } from '@salla.sa/twilight-theme-engine/api/product';

/* The curtain reads the category tree through react-query (the
   `menuCategoryIndex` enrichment); the store app provides the provider, so
   the test does too — `retry: false` keeps the (networkless) failing query
   from stalling the run, an empty index is exactly the pre-enrichment state. */
function mountCurtain(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

/* The mock `SallaProductsList` fakes the RESOLVED loader payload: the curtain's
   own slot/featured loaders return instantly with these fixture items. It also
   hands the loader back so a test can call it and read the request the curtain
   would have made. */
let ITEMS: Record<string, unknown>[] = [];
let mockLoader: (() => unknown) | null = null;

vi.mock('@salla.sa/twilight-components-react', () => ({
  SallaProductsList: ({
    children,
    itemsClassName,
    loader,
  }: {
    children?: (items: unknown[]) => React.ReactNode;
    itemsClassName?: string;
    loader?: unknown;
  }) => {
    mockLoader = (loader as (() => unknown) | undefined) ?? null;
    return (
      <div className={itemsClassName} data-testid="curtain-items">
        {children ? children(ITEMS) : null}
      </div>
    );
  },
  ProductsListSkeleton: () => <div data-testid="curtain-skeleton" />,
}));

vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: Record<string, unknown> }) => (
    <div data-testid="curtain-card">{String(product.id)}</div>
  ),
}));

/* the menu card is a black box here too: same testdataid as the slot card, so
   the featured-row assertions keep reading "four cards in the list" no matter
   which card component paints them. It also PROBES the resolved card context,
   because the curtain is the component that must hand its cards the GLOBAL
   design overridden by `mega_card_*` — a wiring regression would leave the
   cards reading the raw globals. */
vi.mock('../../../app/components/product/MorphMenuCard', async () => {
  const { useProductCardSettings } = await import('../../../app/lib/productCardSettings');
  return {
    MorphMenuCard: ({ product }: { product: Record<string, unknown> }) => {
      const s = useProductCardSettings() as Record<string, unknown>;
      return (
        <div
          data-testid="curtain-card"
          data-pc-badge={String(s.badge)}
          data-pc-ratio={String(s.ratio)}
          data-pc-radius={String(s.radius)}
        >
          {String(product.id)}
        </div>
      );
    },
  };
});

/* The curtain reads its overrides from `theme.settings` — the same channel
   `ThemeLayout` reads the GLOBAL card settings from. The fixture is mutable so
   each scenario can write the merchant's saved values and render. */
const themeState: { settings: Record<string, unknown> } = { settings: {} };
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: themeState }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: vi.fn(() => Promise.resolve({ data: [] })) },
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
    ...rest
  }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <a href={String(to)} className={className as string} {...rest}>
      {children}
    </a>
  ),
}));

const LABELS: CurtainLabels = {
  noSubs: 'لا توجد أقسام فرعية',
  noSlot: 'لم تُضبط خانة',
  noSlotHere: 'الخانة مربوطة بقسم آخر',
  slotHint: 'اربط الخانة من التخصيص',
  noSlotMissing: 'الثيم لم يستلم أي قيمة',
  slotMissingHint: 'الشكل غير سليم',
  featured: 'مميزة',
  categoryProducts: 'منتجات',
  emptyFeatured: 'لا توجد منتجات',
  reelPrev: 'المنتجات السابقة',
  reelNext: 'المنتجات التالية',
};
const pieces = (n: number) => `${n} منتج`;

/* The hovered category: two subcategories, winners/featured picks. The urls
   carry REAL category ids (`/c<id>`), which is the only place the products API
   accepts one from — a node's own `id` is a menu-row id. */
const MENU = {
  id: 1,
  title: 'الأثاث',
  url: '/ar/furniture/c1',
  children: [
    { id: 11, title: 'كراسي', url: '/ar/furniture/c11' },
    { id: 12, title: 'طاولات', url: '/ar/furniture/c12' },
  ],
};
const CHILDLESS = { id: 2, title: 'الإضاءة', url: '/ar/lighting', children: [] };
const OFFERS = { id: 3, title: 'تخفيضات', url: '/ar/offers', children: [] };

const slotsFixtureImage = [
  {
    category: [{ value: '/ar/furniture/c11' }],
    type: [{ value: 'image' }],
    image: 'chairs.png',
    title: 'الكراسي الأول',
  },
];
const slotsFixtureProduct = [
  {
    category: [{ value: '/ar/furniture/c11' }],
    type: [{ value: 'product' }],
    product: [{ value: 'https://store.sa/p555' }],
  },
];

const base = (over: Partial<Parameters<typeof MorphCurtain>[0]> = {}) => ({
  open: true,
  menu: MENU as never,
  focusId: null as string | null,
  slots: readSlots([] as unknown),
  slotsRaw: [] as unknown,
  labels: LABELS,
  pieces,
  onDrill: vi.fn(),
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockLoader = null;
  themeState.settings = {};
  ITEMS = [{ id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }, { id: 105 }];
});

describe('MorphCurtain', () => {
  it('is hidden by the `hidden` attribute alone when closed', () => {
    const { getByTestId } = mountCurtain(<MorphCurtain {...base({ open: false })} />);
    expect(getByTestId('morph-curtain').hasAttribute('hidden')).toBe(true);
  });

  it('renders the hovered category: label, subcategory discs, names', () => {
    const { container } = mountCurtain(<MorphCurtain {...base()} />);
    expect(container.querySelector('.morph-layer__label')?.textContent).toBe('الأثاث');
    const nodes = container.querySelectorAll<HTMLElement>('[data-node-id]');
    expect(nodes).toHaveLength(2);
    expect(nodes[0].getAttribute('data-level')).toBe('2');
    // subcategories have no kids, so they carry no drill badge
    expect(container.querySelector('.morph-node__badge')).toBeNull();
    expect(container.querySelector('.morph-node__name')?.textContent).toBe('كراسي');
  });

  it('a childless category shows its honest empty state (rule 9)', () => {
    const { container } = mountCurtain(<MorphCurtain {...base({ menu: CHILDLESS as never })} />);
    expect(container.querySelector('.morph-layer__empty')?.textContent).toBe(LABELS.noSubs);
  });

  it('hover on any disc drills it (delegated —the engine Link carries no hover props)', () => {
    const onDrill = vi.fn();
    const { container } = mountCurtain(<MorphCurtain {...base({ onDrill })} />);
    const node = container.querySelector('[data-node-id="12"]') as HTMLElement;
    act(() => {
      fireEvent.mouseOver(node);
    });
    expect(onDrill).toHaveBeenCalledWith(expect.objectContaining({ id: 12 }));
  });

  it('marks exactly the focused disc active', () => {
    const { container } = mountCurtain(
      <MorphCurtain {...base({ focusId: '12' })} />
    );
    const active = container.querySelectorAll('.morph-node.is-active');
    expect(active).toHaveLength(1);
    expect(active[0].getAttribute('data-node-id')).toBe('12');
  });

  describe('the slot column', () => {
    it('no rows at all → the theme-defect message (the old triage)', () => {
      const { container } = mountCurtain(
        <MorphCurtain {...base({ slots: readSlots(undefined), slotsRaw: undefined })} />
      );
      const empties = container.querySelectorAll('.morph-layer__empty');
      expect(empties[0].textContent).toBe(LABELS.noSlotMissing);
      expect(empties[1].textContent).toBe(LABELS.slotMissingHint);
    });

    it('rows exist but none matches AND none renders → the merchant-instruction message', () => {
      // only malformed rows: the precise resolver misses AND the fallback pool
      // cannot use them, so the honest texts stand
      const lan = [
        { category: [{ value: '/ar/furniture/other' }], type: [{ value: 'image' }], image: '' },
      ];
      const { container } = mountCurtain(
        <MorphCurtain {...base({ slots: readSlots(lan), slotsRaw: lan })} />
      );
      const empties = container.querySelectorAll('.morph-layer__empty');
      expect(empties[0]?.textContent).toBe(LABELS.noSlotHere);
      expect(empties[1]?.textContent).toBe(LABELS.slotHint);
      expect(container.querySelector('.morph-spotlight')).toBeNull();
    });

    it('a matching subcategory serves ITS image slot, caption ON the picture', () => {
      const { container } = mountCurtain(
        <MorphCurtain
          {...base({ focusId: '11', slots: readSlots(slotsFixtureImage), slotsRaw: slotsFixtureImage })}
        />
      );
      const spotlight = container.querySelector('.morph-spotlight') as HTMLElement;
      expect(spotlight).toBeTruthy();
      expect(spotlight.getAttribute('data-morph-slot')).toBe('image');
      expect(spotlight.getAttribute('href')).toBe('/ar/furniture/c11');
      expect(spotlight.querySelector('img')?.getAttribute('src')).toBe('chairs.png');
      expect(spotlight.querySelector('.morph-spotlight__title')?.textContent).toBe('الكراسي الأول');
    });

    it('an untitled image slot borrows the hovered category name — never the word "مميزة" (rule 28)', () => {
      const fixture = [
        {
          category: [{ value: '/ar/furniture/c11' }],
          type: [{ value: 'image' }],
          image: 'x.png',
          title: '',
        },
      ];
      const { container } = mountCurtain(
        <MorphCurtain {...base({ focusId: '11', slots: readSlots(fixture), slotsRaw: fixture })} />
      );
      expect(container.querySelector('.morph-spotlight__title')?.textContent).toBe('كراسي');
    });

    it('an image slot with no source stays honest (the row is not renderable)', () => {
      const lan = [
        { category: [{ value: '/ar/furniture/c11' }], type: [{ value: 'image' }], image: '' },
      ];
      const { container } = mountCurtain(
        <MorphCurtain {...base({ focusId: '11', slots: readSlots(lan), slotsRaw: lan })} />
      );
      // the precise resolver returns null, and the fallback pool cannot use a
      // malformed row — the honest empty state stands
      expect(container.querySelector('.morph-layer__empty')?.textContent).toBe(LABELS.noSlot);
      expect(container.querySelector('.morph-spotlight')).toBeNull();
    });

    it('a product slot renders the clamped platform card inside its own box', () => {
      const lan = slotsFixtureProduct;
      ITEMS = [{ id: 555 }];
      const { container } = mountCurtain(
        <MorphCurtain {...base({ focusId: '11', slots: readSlots(lan), slotsRaw: lan })} />
      );
      const box = container.querySelector('.morph-spotlight--product') as HTMLElement;
      expect(box).toBeTruthy();
      expect(box.getAttribute('data-morph-slot')).toBe('product');
      expect(container.querySelector('[data-testid="curtain-card"]')?.textContent).toBe('555');
    });
  });

  describe('the featured rectangle below the layers', () => {
    it('follows the hovered MENU with the featured heading + count', () => {
      const { container } = mountCurtain(
        <MorphCurtain {...base({ menu: { ...MENU, products: [7, 8, 9] } as never })} />
      );
      const head = container.querySelector('.morph-featured__head');
      expect(head?.querySelector('p')?.textContent).toContain('مميزة');
      expect(head?.querySelector('span')?.textContent).toBe('3 منتج');
      // three picks, three cards — the row is not padded up to four
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(3);
    });

    /* The row used to slice the merchant's picks to four: the fifth product
       was fetched, then dropped, with no way to reach it. The count in the
       heading said five and the shelf showed four. */
    it('renders EVERY featured pick, not the first four', () => {
      const nine = [7, 8, 9, 10, 11, 12, 13, 14, 15];
      const { container } = mountCurtain(
        <MorphCurtain {...base({ menu: { ...MENU, products: nine } as never })} />
      );
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(5);
      expect(container.querySelector('.morph-featured__head span')?.textContent).toBe('9 منتج');
      mockLoader?.();
      expect(product.list).toHaveBeenCalledWith(expect.objectContaining({ perPage: 9 }));
    });

    it('an EMPTY-STRING products field is no picks, not a crash (demo-store shape)', () => {
      // 19 of 20 nodes come back as `products: ""`; `.filter` on that threw and
      // the error boundary blanked the storefront
      const { container } = mountCurtain(
        <MorphCurtain {...base({ menu: { ...MENU, products: '' } as never })} />
      );
      expect(container.querySelector('.morph-featured__head p')?.textContent).toContain(
        LABELS.categoryProducts
      );
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(5);
    });

    it('a focused sub swaps the rectangle to the focus node', () => {
      const { container } = mountCurtain(
        <MorphCurtain {...base({ menu: { ...MENU, products: [9] } as never, focusId: '12' })} />
      );
      expect(container.querySelector('.morph-featured__head p')?.textContent).toContain(
        `${LABELS.categoryProducts} · طاولات`
      );
    });

    it('falls back to the category products source (rule 19)', () => {
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      expect(container.querySelector('.morph-featured__head p')?.textContent).toContain('منتجات');
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(5);
    });

    it('sends the REAL category id — read from the url, never the menu-row id', () => {
      mountCurtain(<MorphCurtain {...base()} />);
      mockLoader?.();
      expect(product.list).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'categories', sourceValue: [1], perPage: 12 })
      );
    });

    it('the focused subcategory falls back to its OWN category id', () => {
      mountCurtain(<MorphCurtain {...base({ focusId: '12' })} />);
      mockLoader?.();
      expect(product.list).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'categories', sourceValue: [12] })
      );
    });

    it('the built-in offers page uses the offers source, which needs no value', () => {
      const { container } = mountCurtain(<MorphCurtain {...base({ menu: OFFERS as never })} />);
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(5);
      mockLoader?.();
      expect(product.list).toHaveBeenCalledWith(
        expect.objectContaining({ source: 'offers', sourceValue: [] })
      );
    });

    /* jsdom lays nothing out, so the overflow probe answers 0/0 — which is
       exactly the "four cards fit" case. The arrows are therefore stubbed
       into overflow by faking the two numbers the component reads. */
    const stubOverflow = (track: HTMLElement, rest: number, x = 0) => {
      Object.defineProperty(track, 'scrollWidth', { value: 1200, configurable: true });
      Object.defineProperty(track, 'clientWidth', { value: 1200 - rest, configurable: true });
      Object.defineProperty(track, 'scrollLeft', { value: x, configurable: true, writable: true });
    };

    it('a row that fits carries no arrows at all — not greyed, absent', () => {
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const reel = container.querySelector('.morph-featured__reel') as HTMLElement;
      expect(reel.getAttribute('data-reel')).toBe('fit');
      expect(container.querySelectorAll('.morph-featured__nav')).toHaveLength(0);
    });

    it('an overflowing row shows two arrows and disables only the spent one', () => {
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const track = container.querySelector('[data-testid="curtain-items"]') as HTMLElement;
      stubOverflow(track, 300);
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      const reel = container.querySelector('.morph-featured__reel') as HTMLElement;
      expect(reel.getAttribute('data-reel')).toBe('scroll');
      const prev = container.querySelector('.morph-featured__nav.is-prev') as HTMLButtonElement;
      const next = container.querySelector('.morph-featured__nav.is-next') as HTMLButtonElement;
      expect(prev.getAttribute('aria-label')).toBe(LABELS.reelPrev);
      expect(next.getAttribute('aria-label')).toBe(LABELS.reelNext);
      // at the inline start: prev is spent, next is live
      expect(prev.disabled).toBe(true);
      expect(next.disabled).toBe(false);
    });

    it('at the far end the NEXT arrow is the spent one (RTL scrollLeft is negative)', () => {
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const track = container.querySelector('[data-testid="curtain-items"]') as HTMLElement;
      stubOverflow(track, 300, -300); // RTL: the end of the reel
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      const prev = container.querySelector('.morph-featured__nav.is-prev') as HTMLButtonElement;
      const next = container.querySelector('.morph-featured__nav.is-next') as HTMLButtonElement;
      expect(prev.disabled).toBe(false);
      expect(next.disabled).toBe(true);
    });

    it('the arrows scroll one page, negated in RTL (scrollBy takes a physical offset)', () => {
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const track = container.querySelector('[data-testid="curtain-items"]') as HTMLElement;
      stubOverflow(track, 300);
      const scrollBy = vi.fn();
      (track as unknown as { scrollBy: unknown }).scrollBy = scrollBy;
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      const next = container.querySelector('.morph-featured__nav.is-next') as HTMLButtonElement;
      act(() => {
        fireEvent.click(next);
      });
      /* the store's default locale is Arabic, so "next" is leftward — 80% of
         the 900px scrollport, with the sign flipped */
      expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: -720 }));
    });

    it('a node that is not a category page → the honest empty text, no doomed request', () => {
      // its menu-row id would answer 422; the empty state is the honest answer
      const { container } = mountCurtain(<MorphCurtain {...base({ menu: CHILDLESS as never })} />);
      expect(container.querySelector('.morph-featured__empty')?.textContent).toBe(
        LABELS.emptyFeatured
      );
      expect(container.querySelector('[data-testid="curtain-items"]')).toBeNull();
      expect(mockLoader).toBeNull();
      expect(product.list).not.toHaveBeenCalled();
    });
  });

  /* ══ the Global Product Card System's component half ══════════════════════
     The curtain inherits the store's card design by default and re-declares
     ONLY what the merchant overrode, on the curtain root — a nearer ancestor
     than `.app-inner`, so the override is local and the rest of the store
     never sees it. These pin the wiring, not the resolution (that is
     `productCardSettings.test.ts`). */
  describe('the product-card overrides', () => {
    it('inherits silently: no override style, no override attributes', () => {
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const root = container.querySelector('.morph-curtain') as HTMLElement;
      expect(root.getAttribute('data-pc-shadow')).toBeNull();
      expect(root.getAttribute('data-pc-font')).toBeNull();
      expect(root.getAttribute('data-pc-cart')).toBeNull();
      /* React omits the style attribute entirely for an empty object — so a
         curtain on Inherit Global paints exactly what it painted before the
         system existed */
      expect(root.getAttribute('style')).toBeNull();
    });

    it('a saved local is INERT while the panel gate is off', () => {
      themeState.settings = { mega_card_ratio: 'portrait', mega_card_radius: '8' };
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const root = container.querySelector('.morph-curtain') as HTMLElement;
      expect(root.getAttribute('style')).toBeNull();
      const card = container.querySelector('[data-testid="curtain-card"]') as HTMLElement;
      expect(card.getAttribute('data-pc-ratio')).toBe('square');
    });

    it('writes the overridden properties on the curtain root only', () => {
      themeState.settings = {
        mega_card_customize: true,
        mega_card_ratio: 'portrait',
        mega_card_radius: '8',
        mega_card_shadow: 'none',
      };
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const root = container.querySelector('.morph-curtain') as HTMLElement;
      /* jsdom serializes the style attribute with a space after each colon */
      const style = root.getAttribute('style') ?? '';
      expect(style).toContain('--pc-ar-num: 0.75');
      expect(style).toContain('--pc-ar-pad: 133.3333%');
      expect(style).toContain('--pc-radius: 8px');
      expect(root.getAttribute('data-pc-shadow')).toBe('none');
      /* not overridden → not declared, so the subtree keeps inheriting `.app-inner` */
      expect(root.getAttribute('data-pc-font')).toBeNull();
      expect(style).not.toContain('--pc-bg');
    });

    it('hands its cards the resolved design through the scoped context', () => {
      themeState.settings = { mega_card_customize: true, mega_card_badge: 'off' };
      const { container } = mountCurtain(<MorphCurtain {...base()} />);
      const card = container.querySelector('[data-testid="curtain-card"]') as HTMLElement;
      /* the global default is ON; the local decision wins INSIDE the curtain */
      expect(card.getAttribute('data-pc-badge')).toBe('false');
      /* properties the merchant did not touch keep the global values */
      expect(card.getAttribute('data-pc-ratio')).toBe('square');
    });
  });
});
