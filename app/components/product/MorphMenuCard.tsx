import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { useProductCardSettings } from '../../lib/productCardSettings';
import { discountPercent, originalPrice, productBadge } from '../../lib/productBadge';
import { WishlistHeartButton } from './WishlistHeartButton';

/** The fields a product list row carries that this card reads.
 *  `rating` is optional ON PURPOSE: some Salla list endpoints omit it, and the
 *  store card only fetches a product detail when its own gallery switch is on.
 *  This card never fetches — no duplicate requests — so an absent rating means
 *  no star row, never an invented average. */
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
  rating?: { stars?: number | string; count?: number | string } | null;
  /** The maker's mark on the meta rail. Optional: a list row may omit it. */
  brand?: { name?: string } | null;
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

/** The entities a description can arrive carrying. */
const ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&amp;': '&',
};
const decode = (value: string): string =>
  value.replace(/&(lt|gt|quot|#39|apos|nbsp|amp);/g, (m) => ENTITIES[m] ?? m);

/** Descriptions come with markup; the card shows two plain-text lines.
 *
 *  Some rows arrive DOUBLE-escaped — `&lt;p class="ql-direction-rtl"&gt;` is a
 *  paragraph tag the merchant's editor escaped before saving. A stripper that
 *  runs on the raw string finds no `<` and leaves the whole tag visible as
 *  text (the card read `lt;p class=&quot;ql-direction-rtl&quot;&gt;`), so the
 *  value is decoded, stripped, then decoded once more for the leftovers. */
const plain = (value?: string): string =>
  decode(decode(value ?? '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The mega menu's product card. It wears the STORE's card design
 * (`04-components/product-card.scss`): cream tile, square photo plate in the
 * merchant's image colour, the name in bold, two lines of description, the
 * price, then the add-to-cart disc and the wishlist disc. Every colour is a
 * `--pc-*` token inherited from `.app-inner`, so the header card retints with
 * the store's card settings instead of carrying a copy of them.
 *
 * Deliberately NOT the site's `ProductCard`: that one is the engine's own slot
 * markup (badges, rating, gallery, the wide cart bar) and every product list
 * uses it. This is the curtain's card, so its styling lives in
 * `04-components/morph-header.scss` and nothing else on the site changes.
 */
export function MorphMenuCard({ product }: { product: MenuCardProduct }) {
  const { format } = useMoney();
  const { t } = useTranslation();
  const wishlist = useWishlist();
  /* The same merchant switches the STORE card reads. They travel as a context
     from ThemeLayout, so the mega card honours «إعدادات كارت المنتج» instead of
     keeping a second, silently different design. */
  const cardSettings = useProductCardSettings();
  const id = Number(product.id);
  const src = picture(product.image);
  const name = product.name ?? '';
  const blurb = plain(product.subtitle || product.description);
  const onSale = product.is_on_sale && product.sale_price != null;
  const href = product.url || '#';

  /* ── one badge, one rule of priority ─────────────────────────────────────
     The rule lives in `lib/productBadge` because the store card needs the very
     same one: availability outranks a promotion, the merchant's own title
     outranks a computed percentage, and a `-0%` is never printed. The menu card
     has no engine promo slot of its own, so it also prints the merchant's
     `promotion_title` — the grid already does, in its own slot. */
  const badge = productBadge(
    product,
    cardSettings.badgeStyle.outText || t('pages.products.out_of_stock', 'نفدت الكمية'),
    cardSettings.badgeStyle.saleTemplate
  );
  const cut = discountPercent(product);
  const gross = originalPrice(product);
  /* The store card's star row, only when the list actually sent a rating.
     No detail request is made here — an absent rating stays absent. */
  const stars = Number(product.rating?.stars ?? 0);
  const reviews = Math.max(0, Number(product.rating?.count ?? 0));
  const brand = (product.brand?.name ?? '').trim();

  return (
    <article className="morph-menu-card" data-product-id={String(product.id)}>
      {/* The store card's image panel: one link for the photo, with the heart
          as a SIBLING on its corner (a button inside a link is invalid HTML and
          a nested interactive target). */}
      <div className="morph-menu-card__media" data-morph-media>
        <Link to={href} className="morph-menu-card__media-link" aria-label={name}>
          {src ? (
            /* eager, never lazy: this card mounts INSIDE the curtain as it
               opens, under the panel's opacity entrance and React remounts of
               the featured region on every focus change — a lazy fetch here
               starts late or restarts with each hover, which reads as "the
               product picture never shows" (deep image audit, 2026-10). */
            <img src={src} alt="" loading="eager" decoding="async" />
          ) : (
            <span className="morph-menu-card__media-empty" />
          )}
        </Link>
        {cardSettings.wishlist && (
          <WishlistHeartButton
            productId={id}
            ariaLabel={t('pages.wishlist.toggle', 'Add or remove to wishlist')}
            className={`morph-menu-card__fav${wishlist.has(id) ? ' is-fav' : ''}`}
            onClick={() => wishlist.toggle(id)}
          />
        )}
      </div>

      {cardSettings.badge && badge && (
        /* ON THE CARD, not on the print: the tag is clamped over the card's TOP
           EDGE — half on the page, half on the photo — with a ring of the card's
           paper cutting it in. `pc-badge` is the shared skin
           (`product-card.scss`), so the tag does not change design when it
           moves from the grid into the menu; `--out` is the one state that must
           not wear the sale colour. */
        <span className={`pc-badge morph-menu-card__badge${badge.out ? ' pc-badge--out' : ''}`}>
          <span className="pc-badge__text">{badge.text}</span>
        </span>
      )}

      {/* The label: a grid of its own (the card is a flex column: print, then
          label), so the meta rail / name / line / price sit in the SAME order
          and on the SAME baselines as the store card's engine wrappers. The
          row is reserved even when empty, which is what keeps a row of cards
          from turning into a staircase. */}
      <div className="morph-menu-card__body">
        {/* the maker's mark and the score share one 10.5px line, exactly as on
            the store card — and the score only renders when the list actually
            sent one, so no product wears an invented average */}
        <div className="morph-menu-card__meta">
          {brand && <span className="pc-brand">{brand}</span>}
          {cardSettings.rating &&
            (stars > 0 ? (
              <div className="morph-menu-card__rating" data-count={reviews || undefined}>
                <i aria-hidden="true">★</i>
                <span>{stars.toFixed(1)}</span>
              </div>
            ) : cardSettings.ratingEmpty ? (
              <div className="morph-menu-card__rating morph-menu-card__rating--empty">
                <i aria-hidden="true">★</i>
                <span>{t('pages.products.no_ratings', 'لا تقييمات')}</span>
              </div>
            ) : null)}
        </div>
        <h3 className="morph-menu-card__name">
          <Link to={href}>{name}</Link>
        </h3>
        {cardSettings.desc && blurb && <p className="morph-menu-card__desc">{blurb}</p>}
        <p className="morph-menu-card__price">
          <span className="morph-menu-card__now">
            {onSale ? format(product.sale_price ?? '') : format(product.price ?? '')}
          </span>
          {/* the old price is printed only when it is a REAL, higher price —
              the struck line is the buyer's proof, not decoration. It must be
              the SAME field `discountPercent` measured, or a payload whose
              `price` already equals `sale_price` prints «١٨٨» struck beside a
              live «١٨٨»: a discount that proves nothing. The store card puts
              it beside the new one, on the same baseline, in the same quiet
              13px. */}
          {cut > 0 && gross != null && (
            <span className="morph-menu-card__was">{format(String(gross))}</span>
          )}
        </p>

        {/* Inside the LABEL, absolutely positioned onto the print: the label's
            top edge is the print's bottom edge, so the disc straddles the seam
            with no arithmetic on the photo's ratio. The platform's own button
            knows a product with options has to open them instead of adding
            blind, and it owns the cart call. */}
        <div className="morph-menu-card__actions">
          <SallaAddProductButton
            className="morph-menu-card__add"
            productId={product.id}
            productStatus={addStatus(product.status)}
            productType={addType(product.type)}
            fill="solid"
            loaderPosition="center"
          >
            {t('pages.products.add_to_cart', 'أضف لسلة الشراء')}
          </SallaAddProductButton>
        </div>
      </div>
    </article>
  );
}
