import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductCard, plainText, descriptionLine, shortLine } from '../../../app/components/product/ProductCard';
import { ProductCardSettingsContext, readProductCardSettings } from '../../../app/lib/productCardSettings';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The card is the engine's own markup plus the content it does not render: the
 * short line (fed as the engine's `subtitle` prop, so it is in the
 * server-rendered HTML), the review count (an attribute the stylesheet prints
 * with `attr()`), the swipeable gallery and — for an unreviewed product — the
 * «لا تقييمات» row.
 *
 * The wishlist button is deliberately the engine's own, on the image corner —
 * the old wrapper hid it and portaled a copy into the footer, and that is what
 * these tests used to assert. If someone reintroduces the hide, the first test
 * here fails.
 *
 * The engine card is mocked with the *shape* that matters: an image anchor
 * (the gallery's host), a content column (the dots' and the rating row's host)
 * and the conditional rating row the real card renders.
 */

/* `vi.hoisted` because `vi.mock` factories are lifted above the imports — a
   plain `let` here would be in its temporal dead zone when they run. */
const state = vi.hoisted(() => ({
  settings: {} as Record<string, unknown>,
  detail: undefined as undefined | { images?: Array<{ url: string }>; rating?: { stars: number; count: number } },
}));

vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  ProductCard: ({
    product,
    layout = 'vertical',
  }: {
    product: {
      id: number;
      name: string;
      url?: string;
      subtitle?: string;
      rating?: { stars: number; count: number };
    };
    layout?: string;
  }) => (
    <div className="s-product-card s-product-card-vertical" data-testid="engine-card">
      <div className="s-product-card-image">
        <a href={product.url ?? '/p'}>
          <img src="photo.jpg" alt="" />
        </a>
        {layout !== 'horizontal' && (
          <button type="button" className="s-product-card-wishlist-btn" aria-label="engine wishlist" />
        )}
      </div>
      <div className="s-product-card-content">
        <div className="s-product-card-content-main">
          <h3 className="s-product-card-content-title">{product.name}</h3>
          {product.subtitle ? (
            <p className="s-product-card-content-subtitle" data-testid="subtitle">
              {product.subtitle}
            </p>
          ) : null}
        </div>
        <div className="s-product-card-content-sub">
          {/* the engine's own condition — no stars means no row at all */}
          {product.rating?.stars ? (
            <div className="s-product-card-rating" data-testid="rating">
              <span>{product.rating.stars}</span>
            </div>
          ) : null}
        </div>
        <div className="s-product-card-content-footer">
          <salla-add-product-button fill="outline" />
        </div>
      </div>
    </div>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: state.settings } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      detail: (id: string) => ({
        queryKey: ['products', 'detail', id],
        queryFn: () => Promise.resolve({ id: Number(id), name: 'detail', ...(state.detail ?? {}) }),
      }),
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fallback?: string) => fallback ?? _k }),
}));

const base = { id: 42, name: 'Test product' } as unknown as Product;

function renderCard(product: Product = base) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <ProductCardSettingsContext.Provider value={readProductCardSettings(state.settings)}>
        <ProductCard product={product} />
      </ProductCardSettingsContext.Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  cleanup();
  state.settings = {};
  state.detail = undefined;
  /* jsdom has no `scrollIntoView`; the dots call it */
  Element.prototype.scrollIntoView = vi.fn();
});

describe('plainText / descriptionLine', () => {
  it('turns block tags into breaks so a list does not collapse into one run', () => {
    expect(plainText('<ul><li>الخصر: 36</li><li>الطول: 130</li></ul>')).toBe('الخصر: 36\nالطول: 130');
  });

  it('decodes entities rather than printing them', () => {
    expect(plainText('<p>قطن &amp; كتان &quot;فاخر&quot;</p>')).toBe('قطن & كتان "فاخر"');
  });

  it('refuses a size table — a column of numbers is not a sentence', () => {
    expect(descriptionLine('<ul><li>المقاس:36</li><li>الطول:130</li><li>الكم:5.5</li></ul>')).toBe('');
  });

  it('picks the first fragment that reads like prose', () => {
    const html =
      '<ul><li>المقاس:36</li><li>الطول:130</li></ul><p>فستان صيفي بقصة واسعة وأكمام قصيرة يصلح للمناسبات اليومية.</p>';
    expect(descriptionLine(html)).toBe('فستان صيفي بقصة واسعة وأكمام قصيرة يصلح للمناسبات اليومية.');
  });

  it('returns nothing for an empty description instead of an empty line', () => {
    expect(descriptionLine('')).toBe('');
    expect(descriptionLine(undefined)).toBe('');
  });
});

describe('shortLine', () => {
  it('lets a real subtitle win over the description', () => {
    const p = {
      ...base,
      subtitle: 'قطن مصري',
      description: '<p>وصف طويل جدًا لا يجب أن يظهر لأن للمنتج وصفًا مختصرًا.</p>',
    } as unknown as Product;
    expect(shortLine(p)).toBe('قطن مصري');
  });

  it('cuts a long sentence at a word boundary with an ellipsis', () => {
    /* no digits: `descriptionLine` rejects a fragment that is mostly numbers
       (that is how a size table gets filtered out), and this test is about the
       cut, not the filter */
    const words = Array.from({ length: 60 }, () => 'فستان');
    const line = shortLine({ ...base, description: `<p>${words.join(' ')}</p>` } as unknown as Product);
    expect(line.length).toBeLessThanOrEqual(151);
    expect(line.endsWith('…')).toBe(true);
    expect(line).not.toContain('  ');
  });
});

describe('ProductCard', () => {
  it('leaves the engine wishlist button on the image corner', async () => {
    const { getByLabelText } = renderCard();
    /* the first paint schedules the host sync; letting it land inside `waitFor`
       keeps React from warning about an update outside `act` */
    await waitFor(() => expect(getByLabelText('engine wishlist')).toBeTruthy());
    const heart = getByLabelText('engine wishlist');
    expect(heart.closest('.s-product-card-image')).toBeTruthy();
    expect(heart.style.display).not.toBe('none');
  });

  it('feeds the description as the engine subtitle when the product has no short line', async () => {
    const p = {
      ...base,
      description: '<p>فستان صيفي بقصة واسعة وأكمام قصيرة يصلح للمناسبات اليومية.</p>',
    } as unknown as Product;
    const { getByTestId } = renderCard(p);
    await waitFor(() =>
      expect(getByTestId('subtitle').textContent).toBe('فستان صيفي بقصة واسعة وأكمام قصيرة يصلح للمناسبات اليومية.')
    );
  });

  it('renders no subtitle row when the description is only a spec table', async () => {
    const p = { ...base, description: '<ul><li>المقاس:36</li><li>الطول:130</li></ul>' } as unknown as Product;
    const { queryByTestId } = renderCard(p);
    await waitFor(() => expect(queryByTestId('engine-card')).toBeTruthy());
    expect(queryByTestId('subtitle')).toBeNull();
  });

  it('publishes the review count on the rating row for the stylesheet to print', async () => {
    const p = { ...base, rating: { stars: 4.8, count: 120 } } as unknown as Product;
    const { getByTestId } = renderCard(p);
    await waitFor(() => expect(getByTestId('rating').getAttribute('data-count')).toBe('120'));
  });

  it('omits the count attribute when the product has no reviews', async () => {
    const p = { ...base, rating: { stars: 4.8, count: 0 } } as unknown as Product;
    const { getByTestId } = renderCard(p);
    await waitFor(() => expect(getByTestId('rating')).toBeTruthy());
    expect(getByTestId('rating').hasAttribute('data-count')).toBe(false);
  });

  it('makes the add button solid, which the engine ships as outline', async () => {
    const { container } = renderCard();
    await waitFor(() =>
      expect(container.querySelector('salla-add-product-button')?.getAttribute('fill')).toBe('solid')
    );
  });
});

describe('ProductCard — unreviewed products', () => {
  it('fills the row the engine leaves out with «لا تقييمات»', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-rating')).toBeTruthy());
    expect(container.querySelector('.pc-rating')?.textContent).toContain('لا تقييمات');
    /* the real row must stay absent — two rows in one card is worse than none */
    expect(container.querySelector('.s-product-card-rating')).toBeNull();
  });

  it('leaves the row out when the merchant turned the empty state off', async () => {
    state.settings = { product_card_rating_empty: false };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('[data-testid="engine-card"]')).toBeTruthy());
    expect(container.querySelector('.pc-rating')).toBeNull();
  });

  it('never prints the empty state on a product that does have stars', async () => {
    const p = { ...base, rating: { stars: 4.6, count: 89 } } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.s-product-card-rating')).toBeTruthy());
    expect(container.querySelector('.pc-rating')).toBeNull();
  });

  it('takes the rating from the product detail when the list dropped it', async () => {
    state.detail = { rating: { stars: 4.9, count: 12 } };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.s-product-card-rating')).toBeTruthy());
    expect(container.querySelector('.s-product-card-rating')?.getAttribute('data-count')).toBe('12');
    expect(container.querySelector('.pc-rating')).toBeNull();
  });
});

describe('ProductCard — gallery', () => {
  it('puts every photo of the product in the card, one dot each', async () => {
    state.detail = { images: [{ url: 'a.jpg' }, { url: 'b.jpg' }, { url: 'c.jpg' }] };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelectorAll('.pc-gallery__slide').length).toBe(3));
    expect(container.querySelectorAll('.pc-dots__dot').length).toBe(3);
  });

  it('mounts the track inside the image link so the photo stays clickable', async () => {
    state.detail = { images: [{ url: 'a.jpg' }, { url: 'b.jpg' }] };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-gallery')).toBeTruthy());
    expect(container.querySelector('.pc-gallery')?.parentElement?.tagName).toBe('A');
  });

  it('hides the engine picture underneath instead of decoding it twice', async () => {
    state.detail = { images: [{ url: 'a.jpg' }, { url: 'b.jpg' }] };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-gallery')).toBeTruthy());
    expect((container.querySelector('.s-product-card-image img') as HTMLElement).style.display).toBe('none');
  });

  it('starts on the first photo and gives the dots one tab stop', async () => {
    state.detail = { images: [{ url: 'a.jpg' }, { url: 'b.jpg' }, { url: 'c.jpg' }] };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelectorAll('.pc-dots__dot').length).toBe(3));
    const dots = [...container.querySelectorAll('.pc-dots__dot')];
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    expect(dots.filter((d) => d.getAttribute('tabindex') === '0')).toHaveLength(1);
    expect(dots[0].getAttribute('aria-label')).toBe('الصورة 1 من 3');
  });

  it('renders no gallery when the product has a single photo', async () => {
    state.detail = { images: [{ url: 'a.jpg' }] };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('[data-testid="engine-card"]')).toBeTruthy());
    expect(container.querySelector('.pc-gallery')).toBeNull();
  });

  it('asks for no detail at all when the merchant turned the gallery off', async () => {
    state.settings = { product_card_gallery: false };
    state.detail = { images: [{ url: 'a.jpg' }, { url: 'b.jpg' }] };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('[data-testid="engine-card"]')).toBeTruthy());
    expect(container.querySelector('.pc-gallery')).toBeNull();
  });
});
