import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
// The eager core, not the deferred loader: options are a form control the
// customer has just opened the panel to use — the visibility hydration races
// with the dialog's own entrance and leaves the control on its skeleton.
import { SallaProductOptionsCore as SallaProductOptions } from '@salla.sa/twilight-components-react/product-options';
import { SallaQuantityInput } from '@salla.sa/twilight-components-react/quantity-input';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { discountPercent, originalPrice, payablePrice } from '../../lib/productBadge';
import { ArrowLeftIcon, ArrowRightIcon, HeartIcon, ShareIcon } from '../icons';
import { ProductDialog } from './ProductDialog';

type AddProductButtonProps = ComponentProps<typeof SallaAddProductButton>;
type AddProductType = NonNullable<AddProductButtonProps['productType']>;

/** The values the add-to-cart element accepts; anything else falls back to a
 *  plain product rather than an empty button. */
const ADD_TYPES: readonly AddProductType[] = [
  'product',
  'service',
  'codes',
  'digital',
  'food',
  'donating',
  'group_products',
  'booking',
  'financial_support',
];

/** Same window the card uses — a detail opened twice in ten minutes is one request. */
const DETAIL_STALE_MS = 10 * 60 * 1000;

/** How long «تم نسخ الرابط» stays on the share button. */
const COPIED_MS = 2000;

/**
 * The merchant's description as one readable line.
 *
 * `DOMParser` builds an INERT document: nothing in the string is fetched or
 * executed, and the entities (`&nbsp;`, `&amp;`) are decoded for us. The panel
 * shows an excerpt, so the tags — images, bullet lists, inline styles — are
 * exactly what has to go; the product page is one click away for the full
 * article.
 *
 * The walk adds a space after every BLOCK, not after every element: `textContent`
 * glues `</p><ul>` together into one word («أنيقةقصة»), and a space after an
 * inline `<span>` would split a word in two instead.
 */
const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'UL', 'OL', 'BR', 'HR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TR', 'TD', 'TH', 'TABLE', 'SECTION', 'ARTICLE', 'BLOCKQUOTE', 'FIGURE',
]);

function textOf(node: Node): string {
  /* 3 = text, 1 = element. The numeric constants keep this usable where the
     `Node` global is not defined (a server render never calls it, but the
     module should not depend on that). */
  if (node.nodeType === 3) return node.nodeValue ?? '';

  let text = '';
  node.childNodes.forEach((child) => {
    text += textOf(child);
  });

  if (node.nodeType === 1 && BLOCK_TAGS.has((node as Element).tagName)) text += ' ';
  return text;
}

function plainText(html: string | undefined): string {
  let source = (html ?? '').trim();
  if (!source || typeof DOMParser === 'undefined') return '';

  /* The merchant's editor stores some descriptions escaped (`&lt;p&gt;`), so
     one pass can hand back markup as text. The second pass only runs when the
     result still looks like a tag, never on prose that happens to use «<». */
  for (let pass = 0; pass < 2; pass += 1) {
    const body = new DOMParser().parseFromString(source, 'text/html').body;
    const text = textOf(body).replace(/\s+/g, ' ').trim();
    if (!/<\/?[a-z][a-z0-9-]*(\s|\/?>)/i.test(text)) return text;
    source = text;
  }

  return source;
}

type OptionsElement = HTMLElement & { setOptionsData?: (data: never[]) => void };

/**
 * The amount a chosen variant costs. The SDK types promise a bare
 * `{ price, sale_price }`, but the live endpoint answers
 * `{ status, success, data: { price, regular_price, has_sale_price } }`.
 * Reading only the documented shape would leave the price row quoting the
 * «from» figure after a size was picked — with no error anywhere.
 */
function payableVariant(result: unknown): number | null {
  if (!result || typeof result !== 'object') return null;
  const envelope = result as { data?: unknown; price?: unknown; sale_price?: unknown };
  const payload = (
    envelope.data && typeof envelope.data === 'object' ? envelope.data : envelope
  ) as { price?: unknown; sale_price?: unknown };
  const amount = (value: unknown) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  };
  const sale = amount(payload.sale_price);
  const plain = amount(payload.price);
  const value = sale > 0 ? sale : plain;
  return value > 0 ? value : null;
}

interface QuickViewBuyFormProps {
  product: Product;
  onClose: () => void;
  /** The panel's headline price, used until a variant answers. */
  now: number;
  was: number | null;
  onSale: boolean;
  outOfStock: boolean;
  addType: AddProductType;
}

/**
 * The part under the description: the store's own options control, its price
 * row, the quantity stepper beside the add button, and the way out to the full
 * product. This is a real form on the same `cart.addItem` path as the product
 * page, not a row of decorative size chips — the add-to-cart element owns the
 * options form, so a second selector drawn in the panel could never reprice it.
 */
function QuickViewBuyForm({
  product,
  onClose,
  now,
  was,
  onSale,
  outOfStock,
  addType,
}: QuickViewBuyFormProps) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const [live, setLive] = useState<number | null>(null);
  const [optionsReady, setOptionsReady] = useState(false);
  const id = Number(product.id);

  /* A new product is a new set of options and a new price. */
  const options = useMemo(() => product.options ?? [], [product.options]);
  const optionsRef = useCallback(
    (el: OptionsElement | null) => void el?.setOptionsData?.(options as never[]),
    [options]
  );

  const max = Number(product.max_quantity ?? 0);
  /* The loaded stepper reads `name`/`max` from attributes, not from properties. */
  const quantityRef = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      el.setAttribute('name', 'quantity');
      if (max > 0) el.setAttribute('max', String(max));
      else el.removeAttribute('max');
    },
    [max]
  );

  useEffect(() => setLive(null), [id]);

  /* salla-product-options reads `options` only in its constructor. Seed
     page.id before the SDK is ready, then wait for it before mounting — the
     same gate the product page's form uses. */
  useEffect(() => {
    const salla = window.salla;
    if (!salla) return;
    let alive = true;
    salla.config?.set?.('page.id', id);
    Promise.resolve(salla.onReady?.()).finally(() => {
      if (alive) setOptionsReady(true);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const onChange = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const complete = Array.from(form.elements).every(
      (el) => !(el as HTMLInputElement).willValidate || (el as HTMLInputElement).validity.valid
    );
    if (!complete) {
      setLive(null);
      return;
    }
    const pending = window.salla?.product?.getPrice?.(new FormData(form));
    if (!pending) return;
    Promise.resolve(pending)
      .then((result) => setLive(payableVariant(result)))
      .catch(() => setLive(null));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.salla?.form.onSubmit('cart.addItem', event);
  };

  return (
    <div className="pc-quick__buy">
      <form
        className="pc-quick__buy-form"
        encType="multipart/form-data"
        method="post"
        onChange={onChange}
        onSubmit={onSubmit}
      >
        <input type="hidden" name="id" value={id} />

        {optionsReady && options.length > 0 ? (
          <div className="pc-quick__options-box">
            <SallaProductOptions
              key={id}
              ref={optionsRef}
              options={JSON.stringify(options)}
              productId={id}
            />
          </div>
        ) : null}

        <div className="pc-quick__price-line">
          <span className="pc-quick__price-label">{t('product_card.price', 'السعر')}</span>
          <span className="pc-quick__price-values">
            <span className={`pc-quick__buy-price${onSale ? ' is-sale' : ''}`}>
              {format(live ?? now)}
            </span>
            {onSale && was !== null ? (
              <s className="pc-quick__buy-was">{format(was)}</s>
            ) : null}
          </span>
        </div>

        <div className="pc-quick__buy-row">
          {product.is_hidden_quantity || product.type === 'booking' ? (
            <input type="hidden" name="quantity" value="1" />
          ) : (
            <SallaQuantityInput
              ref={quantityRef}
              className="pc-quick__qty"
              max={max > 0 ? max : undefined}
              value={1}
              name="quantity"
              aria-label={t('pages.products.quantity', 'الكمية')}
            />
          )}
          <div className="pc-quick__cta">
            <SallaAddProductButton
              productId={id}
              productStatus={outOfStock ? 'out' : 'sale'}
              productType={addType}
              fill="solid"
              width="wide"
              type="submit"
              onSuccess={onClose}
            />
          </div>
        </div>
      </form>

      <Link className="pc-quick__more" to={product.url} onClick={onClose}>
        {t('product_card.view_product', 'عرض المنتج')}
      </Link>
    </div>
  );
}

export interface QuickViewDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

/**
 * The product, without leaving the grid.
 *
 * The panel is a *summary* laid out like the product page's own buy box, not a
 * narrower copy of it: the gallery on one side with its own arrows and page
 * dots, and on the other the category, the name, the two tools a shopper wants
 * before deciding (wishlist, share), the price with its saving and its
 * percentage, the merchant's opening lines, and the store's own add-to-cart
 * element — the same `<salla-add-product-button>` the card uses, so options,
 * stock rules and the cart toast behave exactly as they do on a card.
 *
 * The row under the description is the store's own buy form: options, a
 * live-priced «السعر» line, the stepper beside the add button, and the link out
 * to the full product. Those controls are drawn here (not imitated) because the
 * add-to-cart element owns the options form — a separate row of chips could
 * never move the price with it.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * -----------------------------
 * No gallery thumbnails: the arrows and the dots are the same control at two
 * sizes, and five thumbnails under a 460px photo is a second photograph. No
 * embedded description images or second article either — the panel shows the
 * merchant's opening lines as text and sends the shopper to the product page
 * for the full article.
 *
 * It renders from the LIST product first and swaps in the detail when it
 * arrives: a dialog that waits on a request before showing the name it already
 * had reads as slow, and the extra fields (the photo set, the description, the
 * category) are exactly the ones that can arrive late.
 */
export function QuickViewDialog({ product, open, onClose }: QuickViewDialogProps) {
  const { t } = useTranslation();

  return (
    <ProductDialog
      open={open}
      onClose={onClose}
      title={t('product_card.quick_view', 'نظرة سريعة')}
      className="pc-quick"
    >
      {({ mounted }) =>
        mounted ? <QuickViewBody product={product} onClose={onClose} /> : null
      }
    </ProductDialog>
  );
}

/**
 * The panel's contents. A separate component so the hooks that need a live
 * store (`useMoney`, `useWishlist`) mount with the dialog and not with every
 * card in a grid — see `ProductDialog`'s `children` note.
 */
function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const wishlist = useWishlist();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  const detail = useQuery({
    ...productApi.queries.detail(String(product.id)),
    staleTime: DETAIL_STALE_MS,
  });

  const view = detail.data ?? product;

  const images = useMemo(() => {
    const all = view.images?.length ? view.images : view.image?.url ? [view.image] : [];
    return all.filter((image) => !!image?.url);
  }, [view]);

  /* A new product is a new first photo. */
  useEffect(() => {
    setActive(0);
  }, [product.id]);

  /* The copy confirmation is a timer on a surface that can close under it. */
  useEffect(
    () => () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  /* The struck line and the payable figure read the card's own functions, so
     the panel and the badge can never describe two different reductions. */
  const was = originalPrice(view);
  const now = payablePrice(view);
  const onSale = !!view.is_on_sale && was !== null && now > 0 && now < was;
  /* The saving is a claim, so it is gated on the platform's own flag and not
     on two prices that happen to differ: a product with variants can carry a
     `regular_price` above its `price` without being on sale at all. */
  const savings = onSale && was !== null && was > now ? was - now : 0;
  const off = discountPercent(view);

  const stars = Number(view.rating?.stars ?? 0);
  const reviews = Number(view.rating?.count ?? 0);
  const outOfStock = !!view.is_out_of_stock;
  const addType = ADD_TYPES.includes(view.type as AddProductType)
    ? (view.type as AddProductType)
    : 'product';

  const description = useMemo(() => plainText(view.description), [view.description]);

  const id = Number(view.id);
  const saved = wishlist.has(id);

  const count = images.length;
  const canBrowse = count > 1;
  const step = (by: number) => setActive((index) => (index + by + count) % count);

  const shareUrl = view.url || (typeof window === 'undefined' ? '' : window.location.href);
  const onShare = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: view.name, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* dismissed the sheet, or the clipboard refused: nothing to report */
    }
  };

  const labels = {
    photos: t('product_card.photos', 'صور المنتج'),
    photo: t('product_card.photo_n', 'الصورة'),
    prev: t('product_card.prev_photo', 'الصورة السابقة'),
    next: t('product_card.next_photo', 'الصورة التالية'),
    wishAdd: t('product_card.wishlist_add', 'أضف إلى المفضلة'),
    wishRemove: t('product_card.wishlist_remove', 'إزالة من المفضلة'),
    share: t('product_card.share', 'مشاركة'),
    copied: t('product_card.link_copied', 'تم نسخ الرابط'),
  };

  /* `format` is a REACT NODE, not a string: the engine draws the amount and
     the store's currency glyph (`<i class="sicon-sar">`) as one inline pair.
     So the template is split around `{value}` and the node is dropped into the
     gap — stringifying it would print `[object Object]` on the chip. */
  const [saveBefore, saveAfter = ''] = String(
    t('product_card.you_save', 'وفر {value}')
  ).split('{value}');
  const offLabel = String(t('product_card.discount_off', 'خصم {value}%')).replace(
    '{value}',
    String(off)
  );

  return (
    <div className="pc-quick__layout">
      <div className="pc-quick__media">
        <div className="pc-quick__stage">
          {images[active] ? (
            <img
              className="pc-quick__photo"
              src={images[active].url}
              alt={images[active].alt || view.name}
              width={720}
              height={720}
              loading="lazy"
            />
          ) : (
            <span className="pc-quick__monogram" aria-hidden="true">
              {(view.name ?? '').trim().charAt(0) || '·'}
            </span>
          )}

          {canBrowse && (
            <>
              <button
                type="button"
                className="pc-quick__arrow pc-quick__arrow--prev"
                aria-label={labels.prev}
                onClick={() => step(-1)}
              >
                <ArrowRightIcon aria-hidden="true" />
              </button>
              <button
                type="button"
                className="pc-quick__arrow pc-quick__arrow--next"
                aria-label={labels.next}
                onClick={() => step(1)}
              >
                <ArrowLeftIcon aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {canBrowse && (
          <div className="pc-quick__dots" role="group" aria-label={labels.photos}>
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                className="pc-quick__dot"
                aria-current={index === active ? 'true' : 'false'}
                aria-label={`${labels.photo} ${index + 1}`}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pc-quick__info">
        <div className="pc-quick__top">
          <div className="pc-quick__heading">
            {view.category?.name ? (
              <Link className="pc-quick__chip" to={view.category.url || '#'}>
                {view.category.name}
              </Link>
            ) : view.brand?.name ? (
              <Link className="pc-quick__chip" to={view.brand.url || '#'}>
                {view.brand.name}
              </Link>
            ) : null}

            <h3 className="pc-quick__name">
              <Link to={view.url}>{view.name}</Link>
            </h3>

            {stars > 0 && (
              <p className="pc-quick__rating">
                <i className="sicon-star2" aria-hidden="true" />
                <span>{stars}</span>
                {reviews > 0 && <span className="pc-quick__reviews">({reviews})</span>}
              </p>
            )}

            {view.subtitle ? <p className="pc-quick__subtitle">{view.subtitle}</p> : null}
          </div>

          <div className="pc-quick__tools">
            <button
              type="button"
              className={`pc-quick__tool${saved ? ' is-active' : ''}`}
              aria-label={saved ? labels.wishRemove : labels.wishAdd}
              aria-pressed={saved}
              title={saved ? labels.wishRemove : labels.wishAdd}
              onClick={() => void wishlist.toggle(id)}
            >
              <HeartIcon filled={saved} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`pc-quick__tool${copied ? ' is-done' : ''}`}
              aria-label={copied ? labels.copied : labels.share}
              title={copied ? labels.copied : labels.share}
              onClick={() => void onShare()}
            >
              <ShareIcon aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className={`pc-quick__price${onSale ? ' is-sale' : ''}`}>
          <span className="pc-quick__now">{format(now)}</span>
          {onSale && was !== null && <s className="pc-quick__was">{format(was)}</s>}
          {savings > 0 && (
            <span className="pc-quick__save">
              {saveBefore}
              {format(savings)}
              {saveAfter}
            </span>
          )}
          {off > 0 && <span className="pc-quick__off">{offLabel}</span>}
        </p>

        <p className={`pc-quick__stock${outOfStock ? ' is-out' : ''}`}>
          {outOfStock
            ? t('pages.products.out_of_stock', 'نفدت الكمية')
            : t('product_card.in_stock', 'متوفر')}
        </p>

        {description ? (
          <div className="pc-quick__desc">
            <p className="pc-quick__desc-text">{description}</p>
          </div>
        ) : null}

        <QuickViewBuyForm
          product={view}
          onClose={onClose}
          now={now}
          was={was}
          onSale={onSale}
          outOfStock={outOfStock}
          addType={addType}
        />
      </div>
    </div>
  );
}
