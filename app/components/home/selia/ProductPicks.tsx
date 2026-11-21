import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { readBoolean, readNumber, readTextOr, readValue, type BlockData, type BlockRow } from '../../../lib/homeBlock';
import { rowProductId } from '../../../lib/productPicker';
import { ProductCard } from '../../product/ProductCard';
import { SeliaSection } from './SeliaSection';

/**
 * `home.selia-custom-products` — a row of products from the catalogue.
 *
 * Selia's block: heading, subtitle, display style, product type, count, and a
 * "show all" link. All of it is kept, and the product source is a real API
 * call (`product.queries.list`) rather than a hand-picked list — so prices,
 * stock and photos are the store's own and change with the catalogue.
 *
 * Two decisions worth knowing:
 *
 *  - **`selected` is a real source, not a loop over ids.** Salla's list API
 *    accepts `source: 'selected'` with the picked ids, which returns the
 *    products in the catalogue's own shape *and* filters out anything the
 *    merchant has since deleted. Fetching each id separately would be one
 *    request per card and would still render a broken card for a deleted one.
 *  - **The slider is a scroll container, not a carousel library.** Arrow
 *    buttons scroll the row by one card; touch, trackpad and keyboard all work
 *    because it is ordinary overflow. Nothing hijacks the page's vertical
 *    scroll — a horizontal strip that swallows vertical swipes is the classic
 *    way a home page becomes unscrollable on a phone.
 */
const PREFIX = 'picks';
const SOURCES: Record<string, ProductsListSource> = {
  latest: 'latest',
  offers: 'offers',
  best_selling: 'best_selling',
  top_rated: 'top-rated',
  selected: 'selected',
};

export function ProductPicks({ data }: { data: BlockData }) {
  const { t, isRTL } = useTranslation();
  const title = readTextOr(data, 'title', PREFIX, '');
  const subtitle = readTextOr(data, 'subtitle', PREFIX, '');
  const layout = readTextOr(data, 'layout', PREFIX, 'grid');
  const type = readTextOr(data, 'type', PREFIX, 'latest');
  const limit = Math.max(1, Math.min(24, readNumber(data, 'limit', PREFIX, 8)));
  /* `true`: the manifest ships `selected: true` for `show_all`, so falling back
     to `false` hid a link the editor showed as enabled. */
  const showAll = readBoolean(data, 'show_all', PREFIX, true);
  const topSpace = readBoolean(data, 'top_space', PREFIX, false);
  const source = SOURCES[type] ?? 'latest';

  // The picker's ids are read once per source, not per card: `rowProductId`
  // understands every shape the editor writes (url, bare id, `{key}`).
  // They go out as NUMBERS because `sourceValue` is typed `number[]` — a
  // string id is accepted by the API but rejected by the type, and casting the
  // array away would hide a genuinely bad id instead of dropping it here.
  const selectedIds =
    source === 'selected'
      ? ((): number[] => {
          const raw = readValue(data, 'products', PREFIX);
          const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
          return entries
            .map((entry) => Number(rowProductId({ products: entry } as BlockRow, 'products', PREFIX)))
            .filter((id) => Number.isFinite(id) && id > 0);
        })()
      : [];

  const { data: result, isLoading } = useQuery({
    ...product.queries.list({
      source,
      /* `sourceValue` is OMITTED, not null, for the catalogue-wide sources.
         Sending `null` serialises to `source_value[]=null` and the products API
         answers 422 — the block then renders nothing at all, with no error a
         merchant could act on. */
      ...(source === 'selected' ? { sourceValue: selectedIds } : {}),
      perPage: limit,
    }),
    // a `selected` block with nothing picked must not ask for every product
    enabled: source !== 'selected' || selectedIds.length > 0,
  });

  const products = (result?.items ?? []).slice(0, limit);
  const scroller = useRef<HTMLDivElement>(null);

  if (!isLoading && !products.length) return null;

  const isSlider = layout === 'slider';
  const viewAllHref = showAll ? (source === 'offers' ? '/offers' : '/products') : '';

  function scrollBy(direction: 1 | -1) {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>('.selia-picks__item');
    const step = card ? card.offsetWidth + 16 : node.clientWidth * 0.8;
    /* `scrollBy` takes a PHYSICAL offset, so the writing direction owns the
       sign — the same rule `kit.tsx` and `MorphCurtain` already follow. */
    node.scrollBy({ left: (isRTL ? -1 : 1) * step * direction, behavior: 'smooth' });
  }

  return (
    <SeliaSection
      title={title}
      subtitle={subtitle}
      variant="picks"
      className={topSpace ? 'selia-picks--spaced' : undefined}
    >
      {isLoading ? (
        <ul className="selia-picks selia-picks--grid" aria-hidden="true">
          {Array.from({ length: Math.min(4, limit) }).map((_, index) => (
            <li className="selia-picks__item" key={index}>
              <div className="selia-picks__skeleton" />
            </li>
          ))}
        </ul>
      ) : (
        <div className={`selia-picks-wrap${isSlider ? ' is-slider' : ''}`}>
          <div
            ref={scroller}
            className={`selia-picks selia-picks--${isSlider ? 'slider' : 'grid'}`}
            // the strip is only scrollable when it is a strip; a grid must not
            // become a tab stop
            {...(isSlider ? { tabIndex: 0, role: 'region', 'aria-label': title || 'المنتجات' } : {})}
          >
            {products.map((item) => (
              <div className="selia-picks__item" key={item.id}>
                <ProductCard product={item} />
              </div>
            ))}
          </div>

          {isSlider && products.length > 1 && (
            <div className="selia-picks__arrows">
              <button
                type="button"
                className="selia-picks__arrow"
                onClick={() => scrollBy(-1)}
                aria-label={t('blocks.home.reviews_prev', 'السابق')}
              >
                <i className={isRTL ? 'sicon-arrow-right' : 'sicon-arrow-left'} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="selia-picks__arrow"
                onClick={() => scrollBy(1)}
                aria-label={t('blocks.home.reviews_next', 'التالي')}
              >
                <i className={isRTL ? 'sicon-arrow-left' : 'sicon-arrow-right'} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {viewAllHref && (
        <div className="selia-picks__all">
          <a className="selia-cta selia-cta--ghost" href={viewAllHref}>
            عرض الكل
          </a>
        </div>
      )}
    </SeliaSection>
  );
}
