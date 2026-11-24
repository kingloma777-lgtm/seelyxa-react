import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, cleanup, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductCard, plainText, descriptionLine, shortLine } from '../../../app/components/product/ProductCard';
import { ProductCardSettingsContext, readProductCardSettings } from '../../../app/lib/productCardSettings';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/**
 * The card is the engine's own markup plus the content it does not render: the
 * short line (fed as the engine's `subtitle` prop, so it is in the
 * server-rendered HTML), the review count (an attribute the stylesheet prints
 * with `attr()`), the maker's mark in the meta rail, the monogram for a
 * product with no usable photograph, the swipeable gallery and — when the
 * merchant asks for it — the «لا تقييمات» wording.
 *
 * The action rail is the one thing that replaces an engine control: the heart
 * stays in the markup (server-rendered, pre-hydration) and `data-pc-actions`
 * tells the stylesheet to hide it once the rail mounts. If someone drops the
 * attribute, the first test here fails.
 *
 * The engine card is mocked with the *shape* that matters: an image anchor
 * (the gallery's host), a plate (the badge's, the monogram's and the rail's
 * host), a content column (the dots' and the empty rail's host) and the
 * conditional rating row (the maker's mark's host) the real card renders.
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

  it('strips markup that arrived escaped, instead of printing it as text', () => {
    /* The store shipped a description escaped twice — `&lt;p class="…"&gt;` —
       and the card printed `p class="ql-direction-rtl"> <span …` under the
       product name, because tags were stripped BEFORE entities were decoded.
       Decoding first leaves nothing for the tag strip to miss. */
    expect(
      plainText('&lt;p class="ql-direction-rtl"&gt;يوكس كيب سويس رول طري.&lt;/p&gt;')
    ).toBe('يوكس كيب سويس رول طري.');
    /* and a double escape, which needs a second pass to surface the tag */
    expect(plainText('&amp;lt;b&amp;gt;عرض&amp;lt;/b&amp;gt;')).toBe('عرض');
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
  it('keeps the engine heart in the markup and hands the corner to the rail', async () => {
    const { getByLabelText, container } = renderCard();
    /* the engine's button stays in the server-rendered HTML — it is what a
       customer sees before hydration — and the rail takes over from it */
    await waitFor(() => expect(getByLabelText('engine wishlist')).toBeTruthy());
    const heart = getByLabelText('engine wishlist');
    expect(heart.closest('.s-product-card-image')).toBeTruthy();
    /* the card is marked so the stylesheet can hide the engine's copy; the
       attribute, not an inline style, keeps the engine's own render intact */
    await waitFor(() =>
      expect(
        container.querySelector('.s-product-card-vertical')?.getAttribute('data-pc-actions')
      ).toBe('1')
    );
    /* and the rail itself is on the plate, beside the engine's hidden copy */
    const rail = container.querySelector('.pc-actions');
    expect(rail).toBeTruthy();
    expect(rail?.closest('.s-product-card-image')).toBeTruthy();
    expect(rail?.querySelectorAll('button').length).toBe(4);
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

describe('ProductCard — the meta rail', () => {
  it('portals the maker’s mark INTO the engine’s own score row', async () => {
    /* One rail, not two lines: the score is the engine's server-rendered row
       (so the number is in the first paint) and the brand joins it rather than
       stacking a second thin line above the name. */
    const p = {
      ...base,
      brand: { name: 'دار عود' },
      rating: { stars: 4.8, count: 120 },
    } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.s-product-card-rating .pc-brand')).toBeTruthy());
    const brand = container.querySelector('.s-product-card-rating .pc-brand');
    expect(brand?.textContent).toBe('دار عود');
    /* exactly one: a second copy on the label would print the maker twice */
    expect(container.querySelectorAll('.pc-brand').length).toBe(1);
  });

  it('gives the maker’s mark its own line when the product has no score', async () => {
    const p = { ...base, brand: { name: 'دار عود' } } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.pc-brand')).toBeTruthy());
    expect(container.querySelector('.s-product-card-rating')).toBeNull();
    /* the label is its host, and the stylesheet's `grid-area: meta` puts it on
       the reserved first row — so the name does not move up into its place */
    expect(
      container.querySelector('.pc-brand')?.parentElement?.classList.contains('s-product-card-content')
    ).toBe(true);
  });

  it('keeps the maker’s mark when the merchant turns the score off', async () => {
    /* The brand is not part of the rating. Hiding the row must not take the
       maker with it — the rail is still the label's first line. */
    state.settings = { product_card_rating: false };
    const p = {
      ...base,
      brand: { name: 'دار عود' },
      rating: { stars: 4.8, count: 120 },
    } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.pc-brand')).toBeTruthy());
    expect(container.querySelector('.s-product-card-rating .pc-brand')).toBeNull();
  });

  it('prints no rail at all for a product with neither brand nor score', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('[data-testid="engine-card"]')).toBeTruthy());
    expect(container.querySelector('.pc-brand')).toBeNull();
    expect(container.querySelector('.pc-rating')).toBeNull();
    /* and nothing is inserted into the label to hold the row open: the ROW is
       reserved by the grid track, not by an empty element on show */
    expect(container.querySelector('.s-product-card-content')?.children.length).toBe(3);
  });
});

describe('ProductCard — unreviewed products', () => {
  it('prints «لا تقييمات» only when the merchant asked for the wording', async () => {
    /* OFF by default. The label no longer depends on the row — the rail simply
       is not there — so a catalogue without reviews reads as calm instead of
       forty cards announcing the same absence. */
    state.settings = { product_card_rating_empty: true };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-rating')).toBeTruthy());
    expect(container.querySelector('.pc-rating')?.textContent).toContain('لا تقييمات');
    /* the real row must stay absent — two rows in one card is worse than none */
    expect(container.querySelector('.s-product-card-rating')).toBeNull();
  });

  it('leaves the rail out entirely by default', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('[data-testid="engine-card"]')).toBeTruthy());
    expect(container.querySelector('.pc-rating')).toBeNull();
  });

  it('never prints the empty state on a product that does have stars', async () => {
    state.settings = { product_card_rating_empty: true };
    const p = { ...base, rating: { stars: 4.6, count: 89 } } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.s-product-card-rating')).toBeTruthy());
    expect(container.querySelector('.pc-rating')).toBeNull();
  });

  it('puts the maker’s mark inside the «لا تقييمات» row, not on a line above it', async () => {
    state.settings = { product_card_rating_empty: true };
    const p = { ...base, brand: { name: 'دار عود' } } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.pc-rating .pc-brand')).toBeTruthy());
    expect(container.querySelectorAll('.pc-brand').length).toBe(1);
  });

  it('takes the rating from the product detail when the list dropped it', async () => {
    state.detail = { rating: { stars: 4.9, count: 12 } };
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.s-product-card-rating')).toBeTruthy());
    expect(container.querySelector('.s-product-card-rating')?.getAttribute('data-count')).toBe('12');
    expect(container.querySelector('.pc-rating')).toBeNull();
  });
});

describe('ProductCard — the print’s own states', () => {
  it('turns a missing photograph into a deliberate plate, not a blank well', async () => {
    const { container } = renderCard();
    await waitFor(() => expect(container.querySelector('.pc-monogram')).toBeTruthy());
    const mono = container.querySelector('.pc-monogram');
    expect(mono?.textContent).toBe('T');
    /* decorative: the name beside it already says what the product is */
    expect(mono?.getAttribute('aria-hidden')).toBe('true');
    /* and it lives on the PLATE, so the well keeps the print's shape */
    expect(mono?.closest('.s-product-card-image')).toBeTruthy();
  });

  it('answers a photograph that fails to load with the same plate', async () => {
    /* `error` does not bubble, so the card listens in the capture phase — which
       covers the engine's single photo AND every gallery slide mounted later,
       without a listener per image. */
    const p = { ...base, image: { url: 'dead.jpg' } } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('[data-testid="engine-card"]')).toBeTruthy());
    expect(container.querySelector('.pc-monogram')).toBeNull();

    const img = container.querySelector('.s-product-card-image img') as HTMLImageElement;
    await act(async () => {
      img.dispatchEvent(new Event('error'));
    });
    await waitFor(() => expect(container.querySelector('.pc-monogram')).toBeTruthy());
  });

  it('prints a tag for a discount the engine’s own promo slot left empty', async () => {
    /* The grid used to show NO tag on a product discounted without a Salla
       promotion, while the mega menu showed `-60%` for the same product. */
    const p = {
      ...base,
      price: 200,
      sale_price: 80,
      is_on_sale: true,
    } as unknown as Product;
    const { container } = renderCard(p);
    await waitFor(() => expect(container.querySelector('.pc-badge')).toBeTruthy());
    const badge = container.querySelector('.pc-badge');
    /* the figures are wrapped in bidi ISOLATES (U+2066 … U+2069): in an RTL
       line a bare «-60%» re-orders to «60%-», so the sign has to be pinned to
       the number it belongs to. Asserting the raw string keeps that deliberate,
       not accidental. */
    expect(badge?.textContent).toBe('\u2066-60%\u2069');
    /* On the CARD ROOT, not inside the print: the tag is clamped over the
       card's top edge, and the print clips its own overflow — a badge inside
       it would be sawn in half. */
    expect(badge?.parentElement?.classList.contains('s-product-card-vertical')).toBe(true);
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
