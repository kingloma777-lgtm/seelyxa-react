import { useCallback, useRef, useState } from 'react';
import type { CartItem as CartItemType, Money } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Delete01Icon } from '../icons';
import { CartQuantity } from './CartQuantity';
import { cartItemTotalLabel } from './CartItem';

interface CartDrawerItemProps {
  item: CartItemType;
  /** This is the line that was just added — flash it once on open. */
  flash?: boolean;
  /** Called after a successful quantity change / delete so the panel refetches. */
  onMutated?: () => void;
  /** Follow a product link: the drawer has to close before the route changes. */
  onNavigate: () => void;
}

function toNumber(value: number | Money | undefined): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? value : value.amount;
}

function moneyCurrency(value: number | Money | undefined): string | undefined {
  return typeof value === 'object' ? value.currency : undefined;
}

/**
 * One line inside the cart drawer.
 *
 * Same contract as the cart page's `CartItem`, narrowed to what a 420px panel
 * can hold: the row is still a `<form>` that posts its WHOLE payload — the API
 * rejects a quantity without the item's options, which is why the options
 * element is rendered here rather than a read-only summary of the selection.
 */
export function CartDrawerItem({ item, flash = false, onMutated, onNavigate }: CartDrawerItemProps) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const [deleting, setDeleting] = useState(false);
  // Set synchronously before the delete request starts: a stepper commit still
  // sitting in its 350ms debounce window would otherwise update a gone line.
  const deletingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const changeQuantity = useCallback(
    async (quantity: number) => {
      if (deletingRef.current) return;
      const form = formRef.current;
      if (form && !form.reportValidity()) throw new Error('Required options are missing');
      const payload = form ? new FormData(form) : undefined;
      payload?.set('quantity', String(quantity));
      await window.salla?.cart.updateItem(payload ?? { id: item.id, quantity });
      onMutated?.();
    },
    [item.id, onMutated]
  );

  // Option changes run through the SDK's own cart form handler; the quantity
  // stepper posts to `salla.cart` itself (above).
  const handleChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    if (!(e.target as HTMLElement)?.closest?.('salla-product-options')) return;
    window.salla?.form.onChange('cart.updateItem', e);
    window.setTimeout(() => onMutated?.(), 800);
  };

  const handleDelete = async () => {
    if (deleting) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      await window.salla?.cart.deleteItem(item.id);
      onMutated?.();
    } catch {
      deletingRef.current = false;
      setDeleting(false);
    }
  };

  const price = toNumber(item.price);
  const wasPrice = item.is_on_sale ? toNumber(item.original_price) : undefined;
  const showWasPrice = wasPrice != null && price != null && wasPrice > price;
  const isFreeProduct = price === 0 && item.has_discount;

  return (
    <form
      ref={formRef}
      id={`cart-drawer-item-${item.id}`}
      className={`cart-drawer__row${flash ? ' is-new' : ''}`}
      data-line-id={item.id}
      onChange={handleChange}
    >
      <input type="hidden" name="id" value={item.id} />

      {/* not a link: the row's name already goes to the product, and a second
          focus stop on the same target is noise in a 420px panel */}
      <div className="cart-drawer__media">
        <img src={item.product_image} alt="" loading="lazy" decoding="async" />
        {isFreeProduct && (
          <span className="cart-drawer__free">{t('pages.loyalty_program.free_product', 'Free')}</span>
        )}
      </div>

      <div className="cart-drawer__info">
        <Link to={item.url} className="cart-drawer__name" onClick={onNavigate}>
          {item.product_name}
        </Link>

        <p className="cart-drawer__price">
          <span className="cart-drawer__price-now">
            {format(price, { currency: moneyCurrency(item.price) })}
          </span>
          {showWasPrice && (
            <s className="cart-drawer__price-was">
              {format(wasPrice, { currency: moneyCurrency(item.original_price) })}
            </s>
          )}
        </p>

        {item.type === 'donating' ? (
          <p className="cart-drawer__total">
            <span className="cart-drawer__total-label">
              {t('blocks.cart.item_total', 'Total')}
            </span>
            <strong>{cartItemTotalLabel(item, format, t)}</strong>
          </p>
        ) : (
          <div className="cart-drawer__line">
            {item.is_hidden_quantity ? (
              <>
                <input type="hidden" name="quantity" value={item.quantity} />
                <span className="cart-drawer__qty-static">
                  {t('pages.products.quantity', 'Quantity')}: {item.quantity}
                </span>
              </>
            ) : (
              <CartQuantity
                value={item.quantity}
                max={item.max_quantity ?? undefined}
                label={t('pages.products.quantity', 'Quantity')}
                disabled={deleting}
                onChange={changeQuantity}
              />
            )}

            <p className="cart-drawer__total">
              <span className="cart-drawer__total-label">
                {t('blocks.cart.item_total', 'Total')}
              </span>
              <strong>{cartItemTotalLabel(item, format, t)}</strong>
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="cart-drawer__remove"
        aria-label={t('common.elements.remove', 'Remove from the cart')}
        aria-busy={deleting}
        disabled={deleting}
        onClick={handleDelete}
      >
        {deleting ? (
          <span className="cart-drawer__remove-spinner" aria-hidden="true" />
        ) : (
          <Delete01Icon aria-hidden="true" />
        )}
      </button>

      {item.options && item.options.length > 0 && (
        // Raw element, not the React wrapper: the wrapper assigns `options`
        // after the constructor ran, so it falls back to the product's default
        // options instead of the cart item's selection. As an attribute it is
        // set before connect, and the element parses it once — hence the key.
        <salla-product-options
          key={JSON.stringify(item.options)}
          options={JSON.stringify(item.options)}
          product-id={item.product_id}
        />
      )}
    </form>
  );
}
