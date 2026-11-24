import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductDialog } from './ProductDialog';

export interface SimilarProductsDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

/** Six is what a 3×2 grid holds without scrolling on a phone. */
const SIMILAR_LIMIT = 6;

/**
 * «منتجات مشابهة» — the products Salla itself relates to this one.
 *
 * Not a search and not a category browse: the products endpoint has a
 * `related` source (`source=related&source_value[]=<id>`), which is the same
 * list the product page's "similar products" rail renders. Reusing it means
 * the panel shows what the merchant's own catalogue says is related, not what
 * a name-similarity guess would.
 *
 * The rows are deliberately compact rather than the store's full card: this
 * panel opens *from* a card, and nesting a second set of cards with their own
 * four action buttons inside a dialog would put the same control twice on one
 * screen and turn a 6-item list into six more detail requests.
 */
export function SimilarProductsDialog({ product, open, onClose }: SimilarProductsDialogProps) {
  const { t } = useTranslation();

  return (
    <ProductDialog
      open={open}
      onClose={onClose}
      size="lg"
      title={t('pages.products.similar_products', 'منتجات مشابهة')}
      className="pc-similar"
    >
      {({ mounted }) => (mounted ? <SimilarBody product={product} onClose={onClose} /> : null)}
    </ProductDialog>
  );
}

/** The list itself — mounted with the panel, so its request only exists while
 *  somebody is looking at it (see `ProductDialog`'s `children` note). */
function SimilarBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const id = Number(product.id);

  const query = useQuery({
    ...productApi.queries.list({
      source: 'related',
      sourceValue: [id],
      perPage: SIMILAR_LIMIT,
    }),
    enabled: Number.isFinite(id),
  });

  const items = (query.data?.items ?? []).filter((item) => Number(item.id) !== id);

  return (
    <>
      {query.isPending ? (
        <ul className="pc-similar__grid" aria-hidden="true">
          {Array.from({ length: SIMILAR_LIMIT }).map((_, index) => (
            <li className="pc-similar__item" key={index}>
              <div className="pc-similar__skeleton" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="pc-similar__empty">
          {t('product_card.no_similar', 'لا توجد منتجات مشابهة لهذا المنتج حاليًا.')}
        </p>
      ) : (
        <ul className="pc-similar__grid">
          {items.slice(0, SIMILAR_LIMIT).map((item) => (
            <li className="pc-similar__item" key={item.id}>
              <Link className="pc-similar__link" to={item.url} onClick={onClose}>
                <span className="pc-similar__frame">
                  {item.image?.url ? (
                    <img src={item.image.url} alt={item.image.alt || item.name} loading="lazy" />
                  ) : (
                    <span className="pc-similar__monogram" aria-hidden="true">
                      {(item.name ?? '').trim().charAt(0) || '·'}
                    </span>
                  )}
                </span>
                <span className="pc-similar__name">{item.name}</span>
                <span className="pc-similar__price">
                  {item.is_on_sale && item.sale_price ? format(item.sale_price) : format(item.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
