import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShopTheLook, shopTheLookRatio, shopTheLookRatioClass } from '../../../app/components/home/ShopTheLook';

/* What these tests protect is the honesty of the block, not its looks: that a
   product with options opens its own picker in place (and never offers a direct
   add before the options are chosen), that the total is arithmetic over
   catalogue prices and follows the checkboxes, that an empty `selected` source
   is not sent at all, and that a hotspot and its row stay one thing. */

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    locale: 'ar',
    direction: 'rtl',
    isRTL: true,
    isLTR: false,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (amount: number) => `${amount} SAR` }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useNumber: () => ({ format: (value: number | string) => String(value) }),
}));

/* The real control is a Stencil web component that needs the Salla runtime; the
   block only cares that it is handed the product's options and a product id —
   and that its inputs post into the row's own form. */
vi.mock('@salla.sa/twilight-components-react/product-options', () => ({
  SallaProductOptionsCore: ({
    options,
    productId,
  }: {
    options: string;
    productId: number | string;
  }) => (
    <div className="fake-options" data-product={String(productId)} data-options={options}>
      <select name="options[5]" defaultValue="51" aria-label="size">
        <option value="51">S</option>
        <option value="52">M</option>
      </select>
    </div>
  ),
}));

const listMock = vi.fn();
const detailMock = vi.fn();

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: (params: Record<string, unknown>) => ({
        queryKey: ['products', 'list', params],
        queryFn: () => listMock(params),
      }),
      detail: (id: string) => ({
        queryKey: ['products', 'detail', id],
        queryFn: () => detailMock(id),
      }),
    },
  },
}));

interface FakeProduct {
  id: number;
  name: string;
  url: string;
  price: number;
  sale_price?: number | null;
  regular_price?: number;
  starting_price?: number | null;
  is_on_sale?: boolean;
  has_options?: boolean;
  is_out_of_stock?: boolean;
  image?: { url: string };
}

const makeProduct = (id: number, over: Partial<FakeProduct> = {}): FakeProduct => ({
  id,
  name: `Product ${id}`,
  url: `/p${id}`,
  price: 100,
  sale_price: null,
  regular_price: 100,
  starting_price: null,
  is_on_sale: false,
  has_options: false,
  is_out_of_stock: false,
  image: { url: `/${id}.jpg` },
  ...over,
});

/** A row pointing at a product, optionally without coordinates. */
const row = (id: number, x: number | null = 50, y: number | null = 50, note = '') => ({
  'look_items.product': [{ label: `P${id}`, value: `https://store.test/p${id}`, key: String(id) }],
  'look_items.x': x,
  'look_items.y': y,
  'look_items.note': note,
});

/** A detail response: the list card carries `has_options`, only the detail
 * carries the options themselves. */
const makeDetail = (id: number, options: unknown[], over: Partial<FakeProduct> = {}) => ({
  ...makeProduct(id, { has_options: true, ...over }),
  options,
});

const SIZE_OPTION = [
  {
    id: 5,
    name: 'المقاس',
    type: 'single-option',
    required: true,
    details: [
      { id: 51, name: 'S' },
      { id: 52, name: 'M' },
    ],
  },
];

const base = {
  look_scene_image: '/scene.jpg',
  look_ratio: 'landscape',
  look_caption: 'الركن',
  look_eyebrow: 'الإطلالة',
  look_title: 'الركن الذي يحبّه الجميع',
  look_body: 'ثلاث قطع',
  look_hint: 'اضغط الرقم',
  look_preselect: 'all',
  look_show_total: true,
  look_bg: '#f4f2ec',
  look_ink: '#2f3a2e',
};

function renderBlock(data: Record<string, unknown>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <ShopTheLook data={data} />
    </QueryClientProvider>
  );
}

const dots = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.shop-the-look__dot'));

const rows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.shop-the-look__row'));

const boxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('.shop-the-look__pick input'));

/** Waits for the catalogue to have answered: the rows are already in place
 * while loading (as placeholders), so counting rows alone would pass too early
 * and assert against a list that has no products in it yet. */
const loaded = async (container: HTMLElement, count: number) => {
  await waitFor(() => {
    expect(rows(container)).toHaveLength(count);
    expect(container.querySelectorAll('.shop-the-look__name.is-waiting')).toHaveLength(0);
  });
};

beforeEach(() => {
  listMock.mockReset();
  detailMock.mockReset();
  listMock.mockResolvedValue({ items: [] });
  detailMock.mockResolvedValue(makeDetail(11, SIZE_OPTION));
  // @ts-expect-error — the SDK is not loaded in jsdom; the block only calls it.
  window.salla = { form: { onSubmit: vi.fn() } };
});

describe('ShopTheLook', () => {
  it('reads the products it was pointed at from the catalogue, in one request', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11), makeProduct(22)] });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await loaded(container, 2);
    expect(listMock).toHaveBeenCalledTimes(1);
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'selected', sourceValue: [11, 22] })
    );
    expect(screen.getByText('Product 11')).toBeTruthy();
    expect(screen.getByText('Product 22')).toBeTruthy();
  });

  it('asks for each product once even when two hotspots share it', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    renderBlock({ ...base, look_items: [row(11, 30, 30), row(11, 70, 70)] });
    await waitFor(() => expect(listMock).toHaveBeenCalled());
    expect(listMock.mock.calls[0][0].sourceValue).toEqual([11]);
  });

  /** An empty `selected` source is the whole catalogue, not nothing. */
  it('never sends an empty selected source', async () => {
    const { container } = renderBlock({ ...base, look_items: [] });
    expect(container.firstChild).toBeNull();
    expect(listMock).not.toHaveBeenCalled();
  });

  it('shows a dot per row that has coordinates, and none for a row without', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11), makeProduct(22)] });
    const { container } = renderBlock({
      ...base,
      look_items: [row(11, 30, 40), row(22, null, null)],
    });

    await loaded(container, 2);
    expect(dots(container)).toHaveLength(1);
    expect(dots(container)[0].style.left).toBe('30%');
    expect(dots(container)[0].style.top).toBe('40%');
  });

  it('names the dot after its product, and numbers it like its row', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11), makeProduct(22)] });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await loaded(container, 2);
    expect(dots(container)).toHaveLength(2);
    expect(dots(container)[1].getAttribute('aria-label')).toBe('2 — Product 22');
    expect(container.querySelectorAll('.shop-the-look__badge')[1].textContent).toBe('2');
  });

  /** A product with options cannot be added without choosing them — so the row
   * opens its own picker instead of sending the customer to another page. */
  it('opens the options inside the row, and never offers a direct add first', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(11, { has_options: true }), makeProduct(22)],
    });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await loaded(container, 2);
    const [first, second] = rows(container);

    expect(first.querySelector('.shop-the-look__buy')).toBeNull();
    expect(first.querySelector('a.shop-the-look__cta')).toBeNull();
    expect(first.querySelector('.shop-the-look__drop')).toBeNull();

    const toggle = first.querySelector<HTMLButtonElement>('.shop-the-look__cta.is-toggle');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.textContent).toBe('Choose options');

    fireEvent.click(toggle as HTMLButtonElement);

    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(toggle?.textContent).toBe('Hide options');
    const drop = first.querySelector('.shop-the-look__drop');
    expect(drop).not.toBeNull();
    expect(toggle?.getAttribute('aria-controls')).toBe(drop?.id);

    // the control is handed this product's options, and posts into the cart form
    const control = await waitFor(() => {
      const node = container.querySelector<HTMLElement>('.fake-options');
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });
    expect(control.dataset.product).toBe('11');
    expect(JSON.parse(control.dataset.options ?? '[]')).toHaveLength(1);

    const form = container.querySelector<HTMLFormElement>('.shop-the-look__form');
    const data = new FormData(form as HTMLFormElement);
    expect(data.get('id')).toBe('11');
    expect(data.get('quantity')).toBe('1');

    // the row with nothing to choose keeps its direct add, and its name links out
    expect(second.querySelector('.shop-the-look__buy')).not.toBeNull();
    expect(second.querySelector('.shop-the-look__cta.is-toggle')).toBeNull();
    expect(second.querySelector('.shop-the-look__name')?.tagName).toBe('A');
  });

  it('opens from the row body, but not from the tick', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11, { has_options: true })] });
    const { container } = renderBlock({ ...base, look_items: [row(11)] });

    await loaded(container, 1);
    const rowNode = rows(container)[0];
    const isOpen = () => rowNode.classList.contains('is-open');

    // the tick decides the total, it does not open anything
    fireEvent.click(boxes(container)[0]);
    expect(isOpen()).toBe(false);

    /* The piece's own name is part of the way in, not a link out: the most
       obvious thing to press must not be the one thing that leaves the page. */
    const name = rowNode.querySelector('.shop-the-look__name') as HTMLElement;
    expect(name.tagName).toBe('SPAN');
    fireEvent.click(name);
    expect(isOpen()).toBe(true);

    fireEvent.click(name);
    expect(isOpen()).toBe(false);

    fireEvent.click(rowNode.querySelector('.shop-the-look__info') as HTMLElement);
    expect(isOpen()).toBe(true);
  });

  it('keeps one row open at a time', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(11, { has_options: true }), makeProduct(22, { has_options: true })],
    });
    detailMock.mockImplementation((id: string) => makeDetail(Number(id), SIZE_OPTION));
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await loaded(container, 2);
    const [first, second] = rows(container);

    fireEvent.click(first.querySelector('.shop-the-look__cta.is-toggle') as HTMLElement);
    expect(first.classList.contains('is-open')).toBe(true);

    fireEvent.click(second.querySelector('.shop-the-look__cta.is-toggle') as HTMLElement);
    expect(second.classList.contains('is-open')).toBe(true);
    expect(first.classList.contains('is-open')).toBe(false);
    expect(first.querySelector('.shop-the-look__drop')).toBeNull();
  });

  /** The chosen size has its own price, and the look's total is about what the
   * customer would actually pay — not about the cheapest variant. */
  it('prices the row and the total from the chosen variant, and forgets it on close', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(11, { has_options: true, price: 300, starting_price: 180 })],
    });
    /* the real endpoint answers with an envelope, not the bare `{price}` the
       SDK types describe — reading only the documented shape left every row
       quoting «from» after a size had been picked */
    const getPrice = vi.fn().mockResolvedValue({
      status: 200,
      success: true,
      data: { price: 300, regular_price: 380, has_sale_price: false },
    });
    // @ts-expect-error — the SDK stub
    window.salla = { form: { onSubmit: vi.fn() }, product: { getPrice } };

    const { container } = renderBlock({ ...base, look_items: [row(11)] });
    await loaded(container, 1);

    const sum = () => container.querySelector('.shop-the-look__sum-value')?.textContent;
    const now = () => container.querySelector('.shop-the-look__now')?.textContent;

    // nothing chosen yet: the cheapest variant, and the «From» qualifier
    expect(now()).toBe('180 SAR');
    expect(container.querySelector('.shop-the-look__from')).not.toBeNull();
    expect(sum()).toBe('180 SAR');

    fireEvent.click(container.querySelector('.shop-the-look__cta.is-toggle') as HTMLElement);
    const form = await waitFor(() => {
      const node = container.querySelector<HTMLFormElement>('.shop-the-look__form');
      expect(node).not.toBeNull();
      return node as HTMLFormElement;
    });

    // a real change from inside the form, the way the options control emits one
    fireEvent.change(form.querySelector('select') as HTMLSelectElement, {
      target: { value: '52' },
    });

    await waitFor(() => expect(now()).toBe('300 SAR'));
    expect(sum()).toBe('300 SAR');
    expect(container.querySelector('.shop-the-look__from')).toBeNull();
    expect(getPrice).toHaveBeenCalledTimes(1);
    expect(getPrice.mock.calls[0][0]).toBeInstanceOf(FormData);

    // closed, the row cannot keep quoting a size it no longer shows
    fireEvent.click(container.querySelector('.shop-the-look__cta.is-toggle') as HTMLElement);
    await waitFor(() => expect(sum()).toBe('180 SAR'));
    expect(now()).toBe('180 SAR');
  });

  it('marks an out-of-stock row as unavailable instead of offering either action', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11, { is_out_of_stock: true })] });
    const { container } = renderBlock({ ...base, look_items: [row(11)] });

    await loaded(container, 1);
    const cta = rows(container)[0].querySelector('.shop-the-look__cta');
    expect(cta?.textContent).toBe('Unavailable');
    expect(cta?.tagName).toBe('SPAN');
    expect(container.querySelector('.shop-the-look__buy')).toBeNull();
  });

  it('totals the ticked rows from catalogue prices, sale price included', async () => {
    listMock.mockResolvedValue({
      items: [
        makeProduct(11, { price: 300, sale_price: 250, regular_price: 300, is_on_sale: true }),
        makeProduct(22, { price: 120 }),
        makeProduct(33, { price: 80 }),
      ],
    });
    const { container } = renderBlock({
      ...base,
      look_items: [row(11), row(22), row(33)],
    });

    await loaded(container, 3);
    expect(container.querySelector('.shop-the-look__sum-value')?.textContent).toBe('450 SAR');
    expect(container.querySelector('.shop-the-look__sum-count')?.textContent).toBe('3 items');
  });

  it('recomputes the total when a row is unticked', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(11, { price: 300 }), makeProduct(22, { price: 120 })],
    });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await loaded(container, 2);
    expect(container.querySelector('.shop-the-look__sum-value')?.textContent).toBe('420 SAR');

    fireEvent.click(boxes(container)[0]);

    await waitFor(() =>
      expect(container.querySelector('.shop-the-look__sum-value')?.textContent).toBe('120 SAR')
    );
    expect(container.querySelector('.shop-the-look__sum-count')?.textContent).toBe('1 items');
    expect(rows(container)[0].classList.contains('is-picked')).toBe(false);
    expect(rows(container)[1].classList.contains('is-picked')).toBe(true);
  });

  it('starts with the rows the merchant chose to preselect', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(11), makeProduct(22)],
    });

    const all = renderBlock({ ...base, look_items: [row(11), row(22)] });
    await loaded(all.container, 2);
    expect(boxes(all.container).map((box) => box.checked)).toEqual([true, true]);
    all.unmount();

    const first = renderBlock({ ...base, look_preselect: 'first', look_items: [row(11), row(22)] });
    await loaded(first.container, 2);
    expect(boxes(first.container).map((box) => box.checked)).toEqual([true, false]);
    first.unmount();

    const none = renderBlock({ ...base, look_preselect: 'none', look_items: [row(11), row(22)] });
    await loaded(none.container, 2);
    expect(boxes(none.container).map((box) => box.checked)).toEqual([false, false]);
    expect(none.container.querySelector('.shop-the-look__sum-value')?.textContent).toBe('0 SAR');
  });

  /** The batch button adds only what can be added, and says so. */
  it('adds the ticked products that need nothing chosen, and counts them', async () => {
    listMock.mockResolvedValue({
      items: [makeProduct(11, { has_options: true }), makeProduct(22), makeProduct(33)],
    });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22), row(33)] });

    await loaded(container, 3);

    const button = container.querySelector<HTMLButtonElement>('.shop-the-look__add-all');
    expect(button?.textContent).toBe('Add selected (2)');
    expect(container.querySelector('.shop-the-look__sum-note')?.textContent).toContain('1');

    const onSubmit = vi.fn();
    // @ts-expect-error — the SDK stub from beforeEach
    window.salla = { form: { onSubmit } };

    fireEvent.click(button as HTMLButtonElement);

    // one cart submit per addable row, never one for the optioned product
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    onSubmit.mock.calls.forEach(([action]) => expect(action).toBe('cart.addItem'));
  });

  it('submits the row form with the product id and a quantity of one', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    const { container } = renderBlock({ ...base, look_items: [row(11)] });

    await loaded(container, 1);
    const form = container.querySelector<HTMLFormElement>('.shop-the-look__buy');
    const data = new FormData(form as HTMLFormElement);
    expect(data.get('id')).toBe('11');
    expect(data.get('quantity')).toBe('1');
  });

  it('lights a row when its dot is hovered, and clears it on leave', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11), makeProduct(22)] });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await waitFor(() => expect(dots(container)).toHaveLength(2));
    fireEvent.mouseEnter(dots(container)[1]);
    expect(rows(container)[1].classList.contains('is-linked')).toBe(true);
    expect(rows(container)[0].classList.contains('is-linked')).toBe(false);

    fireEvent.mouseLeave(dots(container)[1]);
    expect(rows(container)[1].classList.contains('is-linked')).toBe(false);
  });

  it('drops a row whose product is gone from the catalogue', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    const { container } = renderBlock({ ...base, look_items: [row(11), row(22)] });

    await loaded(container, 1);
    expect(screen.queryByText('Product 22')).toBeNull();
  });

  it('hides the total bar when the merchant turns it off', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    const { container } = renderBlock({ ...base, look_show_total: false, look_items: [row(11)] });

    await loaded(container, 1);
    expect(container.querySelector('.shop-the-look__total')).toBeNull();
    expect(container.querySelector('.shop-the-look__add-all')).toBeNull();
    // the per-row add is still there
    expect(container.querySelector('.shop-the-look__buy')).not.toBeNull();
  });

  it('clears the copy fields the merchant emptied, and keeps the block', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    const { container } = renderBlock({
      ...base,
      look_eyebrow: '',
      look_body: '',
      look_hint: '',
      look_caption: '',
      look_items: [row(11)],
    });

    await loaded(container, 1);
    expect(container.querySelector('.shop-the-look__eyebrow')).toBeNull();
    expect(container.querySelector('.shop-the-look__body')).toBeNull();
    expect(container.querySelector('.shop-the-look__hint')).toBeNull();
    expect(container.querySelector('.shop-the-look__caption')).toBeNull();
    expect(container.querySelector('.shop-the-look__title')).not.toBeNull();
  });

  it('keeps the list and drops the two-column grid when there is no scene photo', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    const { container } = renderBlock({ ...base, look_scene_image: '', look_items: [row(11)] });

    await loaded(container, 1);
    expect(container.querySelector('.shop-the-look__scene')).toBeNull();
    expect(container.querySelector('.shop-the-look')?.classList.contains('is-solo')).toBe(true);
  });

  it('paints the merchant colours and the ratio on the block itself', async () => {
    listMock.mockResolvedValue({ items: [makeProduct(11)] });
    const { container } = renderBlock({
      ...base,
      look_bg: '#101010',
      look_ink: '#fafafa',
      look_ratio: 'square',
      look_items: [row(11)],
    });

    await loaded(container, 1);
    const root = container.querySelector<HTMLElement>('.shop-the-look');
    expect(root?.style.getPropertyValue('--look-bg')).toBe('#101010');
    expect(root?.style.getPropertyValue('--look-ink')).toBe('#fafafa');
    expect(root?.getAttribute('data-look-ratio')).toBe('square');
  });
});

describe('shopTheLookRatio', () => {
  it('reads the merchant tier and falls back to portrait', () => {
    expect(shopTheLookRatio({ look_ratio: 'square' })).toBe('square');
    expect(shopTheLookRatio({ look_ratio: 'landscape' })).toBe('landscape');
    expect(shopTheLookRatio({ look_ratio: '' })).toBe('portrait');
    expect(shopTheLookRatio({})).toBe('portrait');
    expect(shopTheLookRatio(undefined)).toBe('portrait');
  });

  it('supplies the class the router and the stylesheet both key off', () => {
    expect(shopTheLookRatioClass({ look_ratio: 'landscape' })).toBe('look-ar--landscape');
  });
});
