import { useEffect, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { COMPARE_MAX, useCompare, type CompareItem } from '../../lib/compare';
import { CloseIcon } from '../icons';
import { ProductDialog } from './ProductDialog';

/**
 * The comparison bar — the one surface that proves the card's compare button
 * is not a decoration.
 *
 * Mounted once in `ThemeLayout`, so a product added from a home rail, a
 * category grid or the search results is the same selection everywhere. It
 * appears only when there is something to compare and disappears when the last
 * product is removed, which is why it does not need a close button of its own.
 */
export function CompareTray() {
  const { t } = useTranslation();
  const { items, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);

  /* Removing the last product from inside the table closes it: an empty
     comparison table is a dead end, not a state. */
  useEffect(() => {
    if (!items.length) setOpen(false);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <>
      <div
        className="pc-compare-tray"
        role="region"
        aria-label={t('product_card.compare_list', 'قائمة المقارنة')}
      >
        <ul className="pc-compare-tray__items">
          {items.map((item) => (
            <li className="pc-compare-tray__item" key={item.id}>
              <Link to={item.url} className="pc-compare-tray__thumb" aria-label={item.name}>
                {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span aria-hidden="true" />}
              </Link>
              <button
                type="button"
                className="pc-compare-tray__remove"
                aria-label={`${t('product_card.compare_remove', 'إزالة من المقارنة')} — ${item.name}`}
                onClick={() => remove(item.id)}
              >
                <CloseIcon aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <span className="pc-compare-tray__count" aria-hidden="true">
          {items.length}/{COMPARE_MAX}
        </span>

        <button
          type="button"
          className="pc-compare-tray__go"
          disabled={items.length < 2}
          onClick={() => setOpen(true)}
        >
          {t('product_card.compare_go', 'قارن')}
        </button>

        <button
          type="button"
          className="pc-compare-tray__clear"
          aria-label={t('product_card.compare_clear', 'مسح المقارنة')}
          onClick={clear}
        >
          <CloseIcon aria-hidden="true" />
        </button>
      </div>

      <CompareDialog open={open} onClose={() => setOpen(false)} items={items} onRemove={remove} />
    </>
  );
}

interface CompareDialogProps {
  open: boolean;
  onClose: () => void;
  items: CompareItem[];
  onRemove: (id: number) => void;
}

/**
 * The table itself. Rows are the fields every product actually carries — price,
 * maker, score, availability — and a missing value prints a dash instead of a
 * blank cell, so the columns stay aligned and the absence is honest.
 */
function CompareDialog({ open, onClose, items, onRemove }: CompareDialogProps) {
  const { t } = useTranslation();

  return (
    <ProductDialog
      open={open}
      onClose={onClose}
      size="lg"
      title={t('product_card.compare_title', 'مقارنة المنتجات')}
      className="pc-compare"
    >
      {({ mounted }) =>
        mounted ? <CompareTable items={items} onClose={onClose} onRemove={onRemove} /> : null
      }
    </ProductDialog>
  );
}

/** The table — mounted with the panel, because it formats prices through the
 *  store's money hook (see `ProductDialog`'s `children` note). */
function CompareTable({ items, onClose, onRemove }: Omit<CompareDialogProps, 'open'>) {
  const { t } = useTranslation();
  const { format } = useMoney();

  const dash = <span className="pc-compare__dash" aria-hidden="true">—</span>;

  return (
    <div className="pc-compare__scroll">
      <table className="pc-compare__table">
        <thead>
          <tr>
            <td className="pc-compare__corner" />
            {items.map((item) => (
              <th scope="col" className="pc-compare__col" key={item.id}>
                <div className="pc-compare__head">
                  <Link to={item.url} className="pc-compare__frame" onClick={onClose}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <span className="pc-compare__monogram" aria-hidden="true">
                        {(item.name ?? '').trim().charAt(0) || '·'}
                      </span>
                    )}
                  </Link>
                  <Link to={item.url} className="pc-compare__name" onClick={onClose}>
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    className="pc-compare__remove"
                    onClick={() => onRemove(item.id)}
                  >
                    {t('product_card.compare_remove', 'إزالة من المقارنة')}
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <th scope="row">{t('product_card.row_price', 'السعر')}</th>
            {items.map((item) => (
              <td key={item.id}>
                <span className={item.regularPrice != null ? 'pc-compare__sale' : undefined}>
                  {format(item.price)}
                </span>
                {item.regularPrice != null && (
                  <s className="pc-compare__was">{format(item.regularPrice)}</s>
                )}
              </td>
            ))}
          </tr>

          <tr>
            <th scope="row">{t('product_card.row_brand', 'العلامة التجارية')}</th>
            {items.map((item) => (
              <td key={item.id}>{item.brand || dash}</td>
            ))}
          </tr>

          <tr>
            <th scope="row">{t('product_card.row_rating', 'التقييم')}</th>
            {items.map((item) => (
              <td key={item.id}>
                {item.stars > 0 ? (
                  <span className="pc-compare__rating">
                    <i className="sicon-star2" aria-hidden="true" />
                    {item.stars}
                    {item.reviews > 0 && <span className="pc-compare__reviews">({item.reviews})</span>}
                  </span>
                ) : (
                  dash
                )}
              </td>
            ))}
          </tr>

          <tr>
            <th scope="row">{t('product_card.row_stock', 'التوفر')}</th>
            {items.map((item) => (
              <td key={item.id}>
                <span className={item.outOfStock ? 'pc-compare__out' : 'pc-compare__in'}>
                  {item.outOfStock
                    ? t('pages.products.out_of_stock', 'نفدت الكمية')
                    : t('product_card.in_stock', 'متوفر')}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
