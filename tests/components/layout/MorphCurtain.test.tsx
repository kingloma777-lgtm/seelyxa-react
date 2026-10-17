import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { MorphCurtain, type CurtainLabels } from '../../../app/components/layout/MorphCurtain';
import { readSlots } from '../../../app/lib/curtainSlots';

/* The mock `SallaProductsList` fakes the RESOLVED loader payload: the curtain's
   own slot/featured loaders return instantly with these fixture items. */
let ITEMS: Record<string, unknown>[] = [];

vi.mock('@salla.sa/twilight-components-react', () => ({
  SallaProductsList: ({
    children,
    itemsClassName,
  }: {
    children?: (items: unknown[]) => React.ReactNode;
    itemsClassName?: string;
  }) => (
    <div className={itemsClassName} data-testid="curtain-items">
      {children ? children(ITEMS) : null}
    </div>
  ),
  ProductsListSkeleton: () => <div data-testid="curtain-skeleton" />,
}));

vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: Record<string, unknown> }) => (
    <div data-testid="curtain-card">{String(product.id)}</div>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    list: vi.fn(() => {
      throw new Error('not called in these tests');
    }),
  },
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
};
const pieces = (n: number) => `${n} منتج`;

/* The hovered category: two subcategories, winners/featured picks. */
const MENU = {
  id: 1,
  title: 'الأثاث',
  url: '/ar/furniture',
  children: [
    { id: 11, title: 'كراسي', url: '/ar/furniture/chairs' },
    { id: 12, title: 'طاولات', url: '/ar/furniture/tables' },
  ],
};
const CHILDLESS = { id: 2, title: 'الإضاءة', url: '/ar/lighting', children: [] };

const slotsFixtureImage = [
  {
    category: [{ value: '/ar/furniture/chairs' }],
    type: [{ value: 'image' }],
    image: 'chairs.png',
    title: 'الكراسي الأول',
  },
];
const slotsFixtureProduct = [
  {
    category: [{ value: '/ar/furniture/chairs' }],
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
  ITEMS = [{ id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }, { id: 105 }];
});

describe('MorphCurtain', () => {
  it('is hidden by the `hidden` attribute alone when closed', () => {
    const { getByTestId } = render(<MorphCurtain {...base({ open: false })} />);
    expect(getByTestId('morph-curtain').hasAttribute('hidden')).toBe(true);
  });

  it('renders the hovered category: label, subcategory discs, names', () => {
    const { container } = render(<MorphCurtain {...base()} />);
    expect(container.querySelector('.morph-layer__label')?.textContent).toBe('الأثاث');
    const nodes = container.querySelectorAll<HTMLElement>('[data-node-id]');
    expect(nodes).toHaveLength(2);
    expect(nodes[0].getAttribute('data-level')).toBe('2');
    // subcategories have no kids, so they carry no drill badge
    expect(container.querySelector('.morph-node__badge')).toBeNull();
    expect(container.querySelector('.morph-node__name')?.textContent).toBe('كراسي');
  });

  it('a childless category shows its honest empty state (rule 9)', () => {
    const { container } = render(<MorphCurtain {...base({ menu: CHILDLESS as never })} />);
    expect(container.querySelector('.morph-layer__empty')?.textContent).toBe(LABELS.noSubs);
  });

  it('hover on any disc drills it (delegated —the engine Link carries no hover props)', () => {
    const onDrill = vi.fn();
    const { container } = render(<MorphCurtain {...base({ onDrill })} />);
    const node = container.querySelector('[data-node-id="12"]') as HTMLElement;
    act(() => {
      fireEvent.mouseOver(node);
    });
    expect(onDrill).toHaveBeenCalledWith(expect.objectContaining({ id: 12 }));
  });

  it('marks exactly the focused disc active', () => {
    const { container } = render(
      <MorphCurtain {...base({ focusId: '12' })} />
    );
    const active = container.querySelectorAll('.morph-node.is-active');
    expect(active).toHaveLength(1);
    expect(active[0].getAttribute('data-node-id')).toBe('12');
  });

  describe('the slot column', () => {
    it('no rows at all → the theme-defect message (the old triage)', () => {
      const { container } = render(
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
      const { container } = render(
        <MorphCurtain {...base({ slots: readSlots(lan), slotsRaw: lan })} />
      );
      const empties = container.querySelectorAll('.morph-layer__empty');
      expect(empties[0]?.textContent).toBe(LABELS.noSlotHere);
      expect(empties[1]?.textContent).toBe(LABELS.slotHint);
      expect(container.querySelector('.morph-spotlight')).toBeNull();
    });

    it('a matching subcategory serves ITS image slot, caption ON the picture', () => {
      const { container } = render(
        <MorphCurtain
          {...base({ focusId: '11', slots: readSlots(slotsFixtureImage), slotsRaw: slotsFixtureImage })}
        />
      );
      const spotlight = container.querySelector('.morph-spotlight') as HTMLElement;
      expect(spotlight).toBeTruthy();
      expect(spotlight.getAttribute('data-morph-slot')).toBe('image');
      expect(spotlight.getAttribute('href')).toBe('/ar/furniture/chairs');
      expect(spotlight.querySelector('img')?.getAttribute('src')).toBe('chairs.png');
      expect(spotlight.querySelector('.morph-spotlight__title')?.textContent).toBe('الكراسي الأول');
    });

    it('an untitled image slot borrows the hovered category name — never the word "مميزة" (rule 28)', () => {
      const fixture = [
        {
          category: [{ value: '/ar/furniture/chairs' }],
          type: [{ value: 'image' }],
          image: 'x.png',
          title: '',
        },
      ];
      const { container } = render(
        <MorphCurtain {...base({ focusId: '11', slots: readSlots(fixture), slotsRaw: fixture })} />
      );
      expect(container.querySelector('.morph-spotlight__title')?.textContent).toBe('كراسي');
    });

    it('an image slot with no source stays honest (the row is not renderable)', () => {
      const lan = [
        { category: [{ value: '/ar/furniture/chairs' }], type: [{ value: 'image' }], image: '' },
      ];
      const { container } = render(
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
      const { container } = render(
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
      const { container } = render(
        <MorphCurtain {...base({ menu: { ...MENU, products: [7, 8, 9] } as never })} />
      );
      const head = container.querySelector('.morph-featured__head');
      expect(head?.querySelector('p')?.textContent).toContain('مميزة');
      expect(head?.querySelector('span')?.textContent).toBe('3 منتج');
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(4);
    });

    it('a focused sub swaps the rectangle to the focus node', () => {
      const { container } = render(
        <MorphCurtain {...base({ menu: { ...MENU, products: [9] } as never, focusId: '12' })} />
      );
      expect(container.querySelector('.morph-featured__head p')?.textContent).toContain(
        `${LABELS.categoryProducts} · طاولات`
      );
    });

    it('falls back to the category products source (rule 19)', () => {
      const { container } = render(<MorphCurtain {...base()} />);
      expect(container.querySelector('.morph-featured__head p')?.textContent).toContain('منتجات');
      expect(container.querySelectorAll('[data-testid="curtain-card"]')).toHaveLength(4);
    });

    it('a node with no id and no picks → the honest empty text', () => {
      const { container } = render(
        <MorphCurtain
          {...base({ menu: { id: undefined, title: 'الإضاءة', url: '/ar/lighting', children: [] } as never })}
        />
      );
      expect(container.querySelector('.morph-featured__empty')?.textContent).toBe(
        LABELS.emptyFeatured
      );
      expect(container.querySelector('[data-testid="curtain-items"]')).toBeNull();
    });
  });
});
