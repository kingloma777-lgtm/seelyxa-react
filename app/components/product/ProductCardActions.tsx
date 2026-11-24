import { useCallback, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useProductCardSettings } from '../../lib/productCardSettings';
import { compareItemFromProduct, useCompare } from '../../lib/compare';
import { CompareIcon, HeartIcon, QuickViewIcon, SimilarIcon } from '../icons';
import { QuickViewDialog } from './QuickViewDialog';
import { SimilarProductsDialog } from './SimilarProductsDialog';

export interface ProductCardActionsProps {
  /** The card's prepared product (short line and rating already resolved). */
  product: Product;
  /** The print — the engine's `.s-product-card-image`, where the rail lives. */
  plate: HTMLElement;
}

type OpenDialog = 'quick' | 'similar' | null;

/**
 * The four things a shopper can do with a product without leaving the grid.
 *
 * WHY ONE RAIL
 * ------------
 * The engine prints a wishlist heart on the print's inline-end corner and
 * nothing else. Three more controls scattered on the card would each need
 * their own corner and their own hover; as one rail they share a size, a
 * surface, a rhythm and one hover behaviour, and the print stays a photograph
 * with a small control cluster instead of a toolbar.
 *
 * The heart is the FIRST item because it is where the engine's own heart
 * already was — a returning customer finds it without re-learning the card.
 * `ProductCard` marks the card with `data-pc-actions` and the stylesheet hides
 * the engine's copy, so the same corner never shows two hearts.
 *
 * WHY THE HEART IS RE-IMPLEMENTED RATHER THAN MOVED
 * -------------------------------------------------
 * The engine's button cannot be relocated: React owns that node and would
 * remove it from a parent it no longer has. So the rail renders its own — and
 * reads the SAME `useWishlist()` store the engine's copy reads, which means
 * the SDK calls, the local storage key, the cross-tab sync and the heart's
 * filled state are all the engine's own behaviour, not a look-alike.
 *
 * EVERY BUTTON DOES SOMETHING REAL
 * --------------------------------
 *   · heart   → `useWishlist().toggle` (Salla SDK)
 *   · eye     → the quick-view panel: photos, price, stock, add to cart
 *   · balance → the comparison list (`lib/compare`), with the tray in the layout
 *   · tiles   → the `related` products the product page's own rail uses
 */
export function ProductCardActions({ product, plate }: ProductCardActionsProps) {
  const { t } = useTranslation();
  const settings = useProductCardSettings();
  const wishlist = useWishlist();
  const compare = useCompare();
  const [dialog, setDialog] = useState<OpenDialog>(null);

  const id = Number(product.id);
  const saved = wishlist.has(id);
  const compared = compare.has(id);

  /* The snapshot is rebuilt only when the product itself changes: `useCompare`
     is a store, and a new object on every render would make every card's
     toggle handler new on every list scroll. */
  const item = useMemo(() => compareItemFromProduct(product), [product]);

  const stop = useCallback((event: MouseEvent) => {
    /* the plate is the photo's link on some layouts; a control inside it must
       never navigate */
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onWishlist = useCallback(
    (event: MouseEvent) => {
      stop(event);
      void wishlist.toggle(id);
    },
    [id, stop, wishlist]
  );

  const onCompare = useCallback(
    (event: MouseEvent) => {
      stop(event);
      if (item) compare.toggle(item);
    },
    [compare, item, stop]
  );

  const labels = {
    wishAdd: t('product_card.wishlist_add', 'أضف إلى المفضلة'),
    wishRemove: t('product_card.wishlist_remove', 'إزالة من المفضلة'),
    compareAdd: t('product_card.compare_add', 'أضف إلى المقارنة'),
    compareRemove: t('product_card.compare_remove', 'إزالة من المقارنة'),
    quick: t('product_card.quick_view', 'نظرة سريعة'),
    similar: t('pages.products.similar_products', 'منتجات مشابهة'),
    group: t('product_card.actions', 'إجراءات المنتج'),
  };

  const rail = (
    <div className="pc-actions" role="group" aria-label={labels.group}>
      {settings.wishlist && (
        <button
          type="button"
          className={`pc-actions__btn pc-actions__btn--wish${saved ? ' is-active' : ''}`}
          aria-label={saved ? labels.wishRemove : labels.wishAdd}
          aria-pressed={saved}
          data-tip={saved ? labels.wishRemove : labels.wishAdd}
          onClick={onWishlist}
        >
          <HeartIcon filled={saved} aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        className="pc-actions__btn"
        aria-label={labels.quick}
        aria-haspopup="dialog"
        data-tip={labels.quick}
        onClick={(event) => {
          stop(event);
          setDialog('quick');
        }}
      >
        <QuickViewIcon aria-hidden="true" />
      </button>

      <button
        type="button"
        className={`pc-actions__btn${compared ? ' is-active' : ''}`}
        aria-label={compared ? labels.compareRemove : labels.compareAdd}
        aria-pressed={compared}
        data-tip={compared ? labels.compareRemove : labels.compareAdd}
        onClick={onCompare}
      >
        <CompareIcon aria-hidden="true" />
      </button>

      <button
        type="button"
        className="pc-actions__btn"
        aria-label={labels.similar}
        aria-haspopup="dialog"
        data-tip={labels.similar}
        onClick={(event) => {
          stop(event);
          setDialog('similar');
        }}
      >
        <SimilarIcon aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <>
      {createPortal(rail, plate)}
      {/* Both panels portal themselves to <body>: the plate clips its
          overflow, so a dialog rendered in place would be cut to a thumbnail. */}
      <QuickViewDialog product={product} open={dialog === 'quick'} onClose={() => setDialog(null)} />
      <SimilarProductsDialog
        product={product}
        open={dialog === 'similar'}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
