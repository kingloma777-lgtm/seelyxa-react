import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { PlusIcon } from '../icons';
import { WishlistHeartButton } from './WishlistHeartButton';

/** The fields a product list row carries that this card reads. */
export interface MenuCardProduct {
  id: number | string;
  name?: string;
  url?: string;
  description?: string;
  subtitle?: string;
  price?: string | number;
  sale_price?: string | number | null;
  is_on_sale?: boolean;
  status?: string;
  type?: string;
  image?: { url?: string } | string | null;
}

/** The platform button's own enums, narrowed from the free-form API strings. */
const ADD_STATUSES = ['sale', 'out', 'out-and-notify', 'hidden'] as const;
const ADD_TYPES = [
  'product',
  'service',
  'codes',
  'digital',
  'food',
  'donating',
  'group_products',
  'booking',
  'financial_support',
] as const;
const addStatus = (value?: string) =>
  (ADD_STATUSES as readonly string[]).includes(value ?? '')
    ? (value as (typeof ADD_STATUSES)[number])
    : 'sale';
const addType = (value?: string) =>
  (ADD_TYPES as readonly string[]).includes(value ?? '')
    ? (value as (typeof ADD_TYPES)[number])
    : 'product';

/** A product row's picture, whether the API answers an object or a bare url. */
const picture = (image: MenuCardProduct['image']): string => {
  if (!image) return '';
  return typeof image === 'string' ? image : image.url || '';
};

/** Descriptions come with markup; the card shows two plain-text lines. */
const plain = (value?: string): string =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The mega menu's product card — the merchant's reference design: a circular
 * picture breaking out over a white rounded card, the name in bold, two lines
 * of description, the price, then the add-to-cart disc and the wishlist disc.
 *
 * Deliberately NOT the site's `ProductCard`: that one is a grid card (square
 * picture, price row, wide button) and every product list uses it. This is the
 * curtain's own card, so its styling lives in `04-components/morph-header.scss`
 * and nothing else on the site changes.
 */
export function MorphMenuCard({ product }: { product: MenuCardProduct }) {
  const { format } = useMoney();
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const id = Number(product.id);
  const src = picture(product.image);
  const name = product.name ?? '';
  const blurb = plain(product.subtitle || product.description);
  const onSale = product.is_on_sale && product.sale_price != null;
  const href = product.url || '#';

  return (
    <article className="morph-menu-card" data-product-id={String(product.id)}>
      <Link to={href} className="morph-menu-card__media" aria-hidden="true" data-morph-media>
        {src ? (
          /* eager, never lazy: this card mounts INSIDE the curtain as it
             opens, under the panel's opacity entrance and React remounts of
             the featured region on every focus change — a lazy fetch here
             starts late or restarts with each hover, which reads as "the
             product picture never shows" (deep image audit, 2026-10). These
             thumbnails are Salla's own ~500x500 jpgs, a few KB each. */
          <img src={src} alt="" loading="eager" decoding="async" />
        ) : (
          <span className="morph-menu-card__media-empty" />
        )}
      </Link>

      <Link to={href} className="morph-menu-card__body">
        <h3 className="morph-menu-card__name">{name}</h3>
        {blurb && <p className="morph-menu-card__desc">{blurb}</p>}
        <p className="morph-menu-card__price">
          {onSale ? format(product.sale_price ?? '') : format(product.price ?? '')}
        </p>
      </Link>

      <div className="morph-menu-card__actions">
        {/* the platform's own button: it knows a product with options has to
            open them instead of adding blind, and it owns the cart call */}
        <SallaAddProductButton
          className="morph-menu-card__add"
          productId={product.id}
          productStatus={addStatus(product.status)}
          productType={addType(product.type)}
          fill="solid"
          loaderPosition="center"
        >
          <PlusIcon className="morph-menu-card__plus" aria-hidden="true" />
          <span className="morph-sr-only">{t('pages.products.add_to_cart', 'أضف لسلة الشراء')}</span>
        </SallaAddProductButton>

        <WishlistHeartButton
          productId={id}
          ariaLabel={t('pages.wishlist.toggle', 'Add or remove to wishlist')}
          className={`morph-menu-card__fav${wishlist.has(id) ? ' is-fav' : ''}`}
          onClick={() => wishlist.toggle(id)}
        />
      </div>
    </article>
  );
}
