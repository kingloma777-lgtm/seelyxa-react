import { hookRegistry, HookName, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { AddProductToast, CartDrawer } from '../components/cart';
import { DigitalFilesSettings } from '../components/product';

/**
 * The two cart-surface switches. `enable_cart_drawer` is this theme's own
 * setting — the engine's `ThemeSettings` only knows the toast one, so both are
 * read through one local shape instead of casting at every call site.
 */
interface CartSurfaceSettings {
  enable_cart_drawer?: boolean;
  enable_add_product_toast?: boolean;
}

const cartSurface = (context: HookContext): CartSurfaceSettings =>
  (context.twilight?.theme?.settings ?? {}) as CartSurfaceSettings;

export function registerThemeHooks() {
  // The cart drawer is the default surface for "I added something" and for the
  // header cart chip. Registered at body:end so there is one instance per page,
  // portalled out of the layout. Default on; `enable_cart_drawer: false` puts
  // the old toast back (and the chip navigates to /cart again).
  hookRegistry.register(
    HookName.BODY_END,
    (context: HookContext) => {
      if (cartSurface(context).enable_cart_drawer === false) return null;
      return <CartDrawer />;
    },
    40
  );

  // AddProductToast at body:end — only when the drawer is switched off, so a
  // store never gets both an overlay and a toast for the same add-to-cart.
  hookRegistry.register(
    HookName.BODY_END,
    (context: HookContext) => {
      const settings = cartSurface(context);
      if (settings.enable_cart_drawer !== false) return null;
      if (settings.enable_add_product_toast === false) return null;
      return <AddProductToast />;
    },
    50
  );

  // Register DigitalFilesSettings at product:single.description hook slot
  // Receives product from ProductDetails via context prop
  hookRegistry.register(
    HookName.PRODUCT_DESCRIPTION,
    (context: HookContext) => {
      const { product } = context as { product?: Product };
      if (!product?.digital_files_settings) return null;
      return <DigitalFilesSettings {...product.digital_files_settings} />;
    },
    50
  );
}
