import { useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { cart } from '@salla.sa/twilight-theme-engine/api/cart';
import type { CartItem as CartItemType } from '@salla.sa/twilight-theme-engine/types';
import { CloseIcon, ShoppingBagIcon } from '../icons';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useScrollLock } from '../../hooks/useScrollLock';
import { afterNextPaint } from '../../lib/afterNextPaint';
import {
  closeCartDrawer,
  getCartDrawerState,
  openCartDrawer,
  subscribeCartDrawer,
} from '../../lib/cartDrawer';
import { CartDrawerItem } from './CartDrawerItem';

/** Matches the transition duration in `04-components/cart-drawer.scss`. */
const TRANSITION_MS = 340;

/** Stable empty array — a fresh `[]` each render would remount every row. */
const EMPTY_ITEMS: CartItemType[] = [];

interface ProductAddedEntry {
  id?: string | number;
  cart_item_id?: string | number;
}

interface AddItemResponse {
  data?: {
    cart?: { items?: Array<{ id: string | number; product_id?: string | number }> };
    events?: { 'twilight::api'?: { events?: { 'Product Added'?: ProductAddedEntry[] } } };
  };
}

interface CartEventBus {
  on?: (name: string, cb: (...args: unknown[]) => void) => void;
  off?: (name: string, cb: (...args: unknown[]) => void) => void;
}

function getSdk() {
  return (typeof window === 'undefined' ? undefined : window.salla) as
    | {
        event?: CartEventBus;
        onReady?: () => Promise<unknown>;
        url?: { get?: (key: string) => string | undefined };
        helpers?: { number?: (value: number) => string };
        notify?: { error?: (message: string) => void };
        log?: (message: string, error?: unknown) => void;
      }
    | undefined;
}

/**
 * Binds `name` on the SDK's event bus, and re-binds when the SDK arrives late
 * (`theme::ready`) or is re-initialised. Returns the unbind function; the
 * listener always comes off the emitter it was added to, never off whatever
 * `window.salla.event` happens to be by then.
 */
function bindCartEvent(name: string, handler: (...args: unknown[]) => void): () => void {
  let boundTo: CartEventBus | undefined;
  let cancelled = false;

  const bind = () => {
    if (boundTo || cancelled) return;
    const event = getSdk()?.event;
    if (!event?.on) return;
    boundTo = event;
    event.on(name, handler);
  };

  bind();
  document.addEventListener('theme::ready', bind);
  void getSdk()
    ?.onReady?.()
    .then(bind);

  return () => {
    cancelled = true;
    document.removeEventListener('theme::ready', bind);
    boundTo?.off?.(name, handler);
  };
}

function DrawerSkeleton() {
  return (
    <div className="cart-drawer__skeleton" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div className="cart-drawer__skeleton-row" key={row}>
          <span className="cart-drawer__skeleton-media" />
          <span className="cart-drawer__skeleton-lines">
            <i />
            <i />
            <i />
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The cart drawer — a slide-over panel that replaces navigating to `/cart` when
 * the header chip or the mobile bar's cart tab is tapped, and that opens by
 * itself when a product is added.
 *
 * It is registered once on the engine's `body:end` slot (see `app/hooks`), so
 * the open state lives in `app/lib/cartDrawer.ts` rather than in a shared
 * parent. Mounting / enter / exit follow `common/BottomSheet.tsx`: `mounted`
 * keeps the panel in the tree through the exit and the open class is flipped
 * only after a forced reflow, so the closed transform always has a start frame.
 * Styling: `04-components/cart-drawer.scss`.
 */
export function CartDrawer() {
  const { t } = useTranslation();
  const { format } = useMoney();
  const queryClient = useQueryClient();
  const { open, lineId } = useSyncExternalStore(
    subscribeCartDrawer,
    getCartDrawerState,
    getCartDrawerState
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  // The detail query only starts once the drawer has been opened at least
  // once — otherwise every page load would fetch the cart for a closed panel.
  const [primed, setPrimed] = useState(false);
  // `submit` can take a second (cart status → checkout hand-off); the button
  // says so instead of looking dead, and a second tap is ignored.
  const [checkingOut, setCheckingOut] = useState(false);

  const { data: cartId } = useQuery(cart.queries.currentId());
  const { data: cartData } = useQuery({
    ...cart.queries.detail(cartId!),
    enabled: !!cartId && primed,
  });

  useScrollLock(open);

  // `html` reserves the scrollbar gutter (`scrollbar-gutter: stable`, so the
  // page never jumps when an overlay opens). A fixed panel is laid out in the
  // initial containing block, which EXCLUDES that gutter — so the panel would
  // stop 15px short of the screen edge and leave a bare strip beside it. Drop
  // the reservation while the panel owns the page; the body is scroll-locked
  // anyway, so nothing can shift behind the backdrop.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('cart-drawer-open');
    return () => root.classList.remove('cart-drawer-open');
  }, [open]);

  const refetchCart = useCallback(() => {
    if (cartId == null) return;
    void queryClient.invalidateQueries({ queryKey: cart.queries.detail(cartId).queryKey });
  }, [cartId, queryClient]);

  // Prime + refresh on every open: the panel may have been closed for a while
  // (another tab, the cart page itself), so never trust the cache it shows.
  // The ref keeps this effect on `open` alone — keying it on `refetchCart` would
  // re-fire the moment the cart id resolves and cost a second request on the
  // first open, when the query is already fetching for the first time.
  const refetchRef = useRef(refetchCart);
  useEffect(() => {
    refetchRef.current = refetchCart;
  }, [refetchCart]);

  useEffect(() => {
    if (!open) return;
    setPrimed(true);
    refetchRef.current();
  }, [open]);

  useEffect(() => {
    const onCartUpdated = () => refetchCart();
    return bindCartEvent('cart::updated', onCartUpdated);
  }, [refetchCart]);

  // Adding to the cart IS the drawer's trigger: no toast, no redirect.
  useEffect(() => {
    const onItemAdded = (...args: unknown[]) => {
      const [response, addedId] = args as [AddItemResponse | undefined, unknown];
      if (addedId == null) return;
      const productId = String(addedId);
      const entry = response?.data?.events?.['twilight::api']?.events?.['Product Added']
        ?.filter((item) => String(item.id) === productId)
        .at(-1);
      const line = response?.data?.cart?.items
        ?.filter((item) => String(item.product_id) === productId)
        .at(-1);
      openCartDrawer(entry?.cart_item_id ?? line?.id ?? null);
    };
    return bindCartEvent('cart::item.added', onItemAdded);
  }, []);

  // A history navigation (back / forward) leaves the panel floating over a page
  // it does not describe any more.
  useEffect(() => {
    const onPop = () => closeCartDrawer();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ONE interceptor for every cart chip on the page — the MorphPill header, the
  // engine's own header, anything else that renders `<salla-cart-summary>`. The
  // component attaches its own click listener to the wrapper anchor which both
  // prevents the default AND walks to /cart through the SDK, so a bubble-phase
  // handler never sees a clean event; document-level CAPTURE fires before it.
  // Nothing is registered when the drawer is switched off, because the whole
  // component is then never mounted.
  useEffect(() => {
    const onChipClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as Element | null;
      if (!target?.closest?.('salla-cart-summary')) return;
      event.preventDefault();
      event.stopPropagation();
      openCartDrawer();
    };
    document.addEventListener('click', onChipClick, true);
    return () => document.removeEventListener('click', onChipClick, true);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    setEntered(false);
    const unmount = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(unmount);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    void panelRef.current?.offsetWidth;
    return afterNextPaint(() => setEntered(true));
  }, [mounted, open]);

  // Park focus on the panel, not on its first control: the first control here
  // is the ✕, and focusing it on every open paints a focus ring nobody asked
  // for. Tab still reaches it immediately.
  useDialogFocus(panelRef, mounted && entered, 'container');

  // Read inside the listener only — a new closure from the parent must not tear
  // the listener down and re-add it on every render.
  const onCloseEvent = useEffectEvent(closeCartDrawer);
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseEvent();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted]);

  const handleCheckout = useCallback(async () => {
    if (checkingOut) return;

    // Same gate the engine's own `CartSummary` runs on the cart page: a row with
    // a required option left empty must not reach checkout. Our rows carry
    // `cart-drawer__row`, not `item-…`, so the engine's selector never sees them.
    const rows = Array.from(document.querySelectorAll<HTMLFormElement>('.cart-drawer__row'));
    const valid = rows.every((form) =>
      typeof form.reportValidity === 'function' ? form.reportValidity() : true
    );
    if (!valid) {
      getSdk()?.notify?.error?.(t('common.messages.required_fields', 'يرجى إكمال الحقول المطلوبة'));
      return;
    }

    setCheckingOut(true);
    try {
      // `submit` decides where to go: the checkout page, the cart page + login
      // for a guest on a store without embedded checkout, or nowhere at all.
      // Closing only AFTER it settles keeps the panel up if the call throws.
      await (window.salla as { cart?: { submit?: () => Promise<unknown> } } | undefined)?.cart
        ?.submit?.();
      closeCartDrawer();
    } catch (error) {
      getSdk()?.notify?.error?.(t('common.messages.generic_error', 'حدث خطأ، حاول مرة أخرى'));
      (window.salla as { log?: (message: string, error?: unknown) => void } | undefined)?.log?.(
        'cart submit failed',
        error
      );
    } finally {
      setCheckingOut(false);
    }
  }, [checkingOut, t]);

  if (!mounted || typeof document === 'undefined') return null;

  const items = cartData?.items ?? EMPTY_ITEMS;
  const count = cartData?.count ?? items.length;
  const formatCount = getSdk()?.helpers?.number;
  const cartUrl = getSdk()?.url?.get?.('cart') || '/cart';
  const discount = cartData?.total_discount || cartData?.discount || 0;
  const loading = cartData === undefined;

  return createPortal(
    <div
      className={`cart-drawer-root${entered ? ' is-open' : ''}`}
      // useDialogFocus traps Tab and Escape closes the panel, which is what the
      // rule asks <dialog> for: see .react-doctor/false-positives.md.
      // react-doctor-disable-next-line react-doctor/prefer-html-dialog
      role="dialog"
      aria-modal="true"
      aria-label={t('common.titles.cart', 'Cart')}
      data-testid="cart-drawer-root"
    >
      <div className="cart-drawer__backdrop" role="presentation" onClick={closeCartDrawer} />

      <aside ref={panelRef} tabIndex={-1} className="cart-drawer" data-testid="cart-drawer">
        <header className="cart-drawer__head">
          <h2 className="cart-drawer__title">
            {t('blocks.header.cart', 'Cart')}
            {count > 0 && (
              <span className="cart-drawer__count" data-testid="cart-drawer-count">
                {formatCount ? formatCount(count) : String(count)}
              </span>
            )}
          </h2>
          <button
            type="button"
            className="cart-drawer__close"
            aria-label={t('blocks.header.close', 'Close')}
            onClick={closeCartDrawer}
            data-testid="cart-drawer-close"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </header>

        <div className="cart-drawer__body">
          {loading ? (
            <DrawerSkeleton />
          ) : items.length === 0 ? (
            <div className="cart-drawer__empty" data-testid="cart-drawer-empty">
              <ShoppingBagIcon aria-hidden="true" />
              <p className="cart-drawer__empty-title">
                {t('pages.cart.empty_cart', 'Your cart is empty')}
              </p>
              <Link to="/" className="cart-drawer__empty-cta" onClick={closeCartDrawer}>
                {t('common.elements.back_home', 'Back to Home')}
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <CartDrawerItem
                key={item.id}
                item={item}
                flash={lineId != null && String(lineId) === String(item.id)}
                onMutated={refetchCart}
                onNavigate={closeCartDrawer}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="cart-drawer__foot">
            <dl className="cart-drawer__sum">
              <div className="cart-drawer__sum-row">
                <dt>{t('blocks.cart.sub_total', 'Subtotal')}</dt>
                <dd>{format(cartData?.sub_total ?? 0)}</dd>
              </div>
              {discount > 0 && (
                <div className="cart-drawer__sum-row cart-drawer__sum-row--muted">
                  <dt>{t('blocks.cart.discount', 'Discount')}</dt>
                  <dd>-{format(discount)}</dd>
                </div>
              )}
            </dl>

            <p className="cart-drawer__note">
              {t(
                'blocks.cart.shipping_note',
                'الشحن والضرائب تُحسب في صفحة إتمام الطلب'
              )}
            </p>

            <div className="cart-drawer__cta">
              <button
                type="button"
                className="cart-drawer__checkout"
                onClick={handleCheckout}
                disabled={checkingOut}
                aria-busy={checkingOut}
                data-testid="cart-drawer-checkout"
              >
                {checkingOut && <span className="cart-drawer__spinner" aria-hidden="true" />}
                <span>{t('pages.cart.complete_order', 'Complete Order')}</span>
              </button>
              <Link
                to={cartUrl}
                className="cart-drawer__view"
                onClick={closeCartDrawer}
                data-testid="cart-drawer-view-cart"
              >
                {t('pages.cart.view_cart', 'View Cart')}
              </Link>
            </div>
          </footer>
        )}
      </aside>
    </div>,
    document.body
  );
}
