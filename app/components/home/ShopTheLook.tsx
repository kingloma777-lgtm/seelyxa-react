import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
/* The barrel, not a subpath: the package exports `./hooks/useMoney` but no
   `./hooks/useNumber`, and the bare subpath fails to resolve at build time. */
import { useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { imgSrc, scalar } from '../../lib/curtainSlots';
import { rowProductId } from '../../lib/productPicker';
import {
  prefersReducedMotion,
  readBoolean,
  readRows,
  readTextOr,
  readValue,
  rowText,
  rowValue,
  type BlockRow,
} from '../../lib/homeBlock';
import { PlusIcon, ChevronDownIcon, ShoppingBagIcon } from '../icons';

/**
 * `shop-the-look` home block — a scene photo with numbered hotspots, each one
 * bound to a real catalogue product, next to a list that totals what the whole
 * look costs and adds it to the cart.
 *
 * The reference this was ported from is a hand-built mock, and every part of it
 * that only *looked* real is replaced here:
 *
 *  - **Prices and names come from the catalogue, not from the merchant's
 *    typing.** The reference stores `1323` and `1890` as strings on the block,
 *    so the first price change in the store leaves the section quoting a number
 *    that no longer exists. Here each hotspot names a product and the block
 *    reads name, image, price, stock and options from `api/product`
 *    (`source: 'selected'`, one request for the whole look).
 *  - **The option chips are gone.** `كامل / أسود / S / M / L` were decoration:
 *    clicking them did nothing, and a product that really has options cannot be
 *    added to the cart without choosing them. A product with options therefore
 *    opens **in place** — the row drops down and the store's own options control
 *    appears inside it, so the size is chosen and the piece added without ever
 *    leaving the look. Nothing in this block pretends to be a control it is not:
 *    the chips are the real `salla-product-options` element, posting the real
 *    `options[...]` fields into the real cart form.
 *  - **The add-to-cart is visible, and there is a total.** The reference hides
 *    its button with `display: none` and its checkboxes add up to nothing. Here
 *    the checkboxes decide the total, and one button adds what can be added —
 *    with an explicit line for the items that still need a size.
 *  - **The hotspots are 44px, not 38px.** 38px is under the comfortable thumb
 *    target, and these are the only way into the scene on a phone.
 *  - **A hotspot and its row are one thing.** Hovering or focusing either one
 *    lights the other, and tapping a dot scrolls its row into view, so the
 *    number on the photo always answers "which product is this?".
 *
 * Coordinates are percentages of the **frame** (never of the page), and the
 * frame keeps one aspect ratio at every viewport: `object-fit: cover` makes the
 * visible part of the photo a function of that ratio alone, so a mobile-specific
 * ratio would silently move every dot to a different spot. For the same reason
 * the dots are placed with physical `left`/`top` — a logical `inset-inline-start`
 * would flip them to the other side of the photo when the store is read LTR.
 */

const PREFIX = 'look';
const ITEMS = 'look_items';

/** Frame width ÷ height. One ratio for every viewport, on purpose (see above). */
const RATIOS = { portrait: 0.86, square: 1, landscape: 1.25 } as const;
export type ShopTheLookRatio = keyof typeof RATIOS;

export const shopTheLookRatio = (data: unknown): ShopTheLookRatio => {
  const key = scalar(readValue((data ?? {}) as Record<string, unknown>, 'ratio', PREFIX));
  return key === 'square' || key === 'landscape' ? key : 'portrait';
};

export const shopTheLookRatioClass = (data: unknown): string =>
  `look-ar--${shopTheLookRatio(data)}`;

/** Which rows start ticked — the look's default total is the merchant's call. */
type Preselect = 'all' | 'first' | 'none';

const preselectOf = (data: unknown): Preselect => {
  const key = scalar(readValue((data ?? {}) as Record<string, unknown>, 'preselect', PREFIX));
  return key === 'none' || key === 'first' ? key : 'all';
};

interface LookItem {
  key: string;
  productId: string;
  /** Percentage of the frame's width, from its LEFT edge. `null` = no dot. */
  x: number | null;
  /** Percentage of the frame's height, from its TOP edge. `null` = no dot. */
  y: number | null;
  note: string;
}

/** The product a picker field points at — the shared rule, so this block and
 * `product-chapters` can never disagree about which row means which product. */
function lookProductId(row: BlockRow): string {
  return rowProductId(row, 'product', ITEMS);
}

/** A coordinate, or `null` when the merchant left the field empty — which is
 * how a row says "this product is not on the photo, list it anyway". */
function lookCoord(row: BlockRow, key: 'x' | 'y'): number | null {
  const raw = rowValue(row, key, ITEMS);
  if (raw === undefined || raw === null || raw === '') return null;
  const value = Number(scalar(raw));
  if (!Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, value));
}

/** Tolerant price → number. Prices arrive as numbers from this API, but a
 * currency-converted or formatted response can send `"1,323.00"`, and `Number()`
 * of that is `NaN` — which would quietly make the total `NaN` too. */
const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** What one of this product costs as shown: the sale price when it is on sale,
 * otherwise the lowest variant price for a product with options. */
const unitPrice = (item: Product): number => {
  if (item.is_on_sale && item.sale_price != null) return toNumber(item.sale_price);
  return toNumber(item.starting_price ?? item.price);
};

/** A product that can go straight into the cart from a list row: no options to
 * choose, and something in stock. Everything else needs its own page. */
const canAddDirect = (item: Product): boolean =>
  !item.has_options && !item.is_out_of_stock;

/** The amount actually charged for the chosen variant.
 *
 * The SDK's own types promise a bare `{ price, sale_price }`, but the live
 * endpoint answers with a full envelope — `{ status, success, data: { price,
 * regular_price, has_sale_price } }` — and `data.price` is already the payable
 * amount. Reading only the documented shape silently produced `null` for every
 * variant, so the row kept quoting «from» after a size had been chosen. Both
 * shapes are read here. */
const payable = (result?: unknown): number | null => {
  if (!result || typeof result !== 'object') return null;
  const envelope = result as { data?: unknown; price?: unknown; sale_price?: unknown };
  const payload = (envelope.data && typeof envelope.data === 'object'
    ? envelope.data
    : envelope) as { price?: unknown; sale_price?: unknown };
  const sale = toNumber(payload.sale_price);
  const plain = toNumber(payload.price);
  const value = sale > 0 ? sale : plain;
  return value > 0 ? value : null;
};

/* The options control is a web component with its own runtime, and it is only
   ever needed by the customer who opens a row. Importing it eagerly would put
   it in the home page's bundle for every visitor, so it is fetched on the first
   open and kept in its own chunk from then on. */
const OptionsControl = lazy(() =>
  import('@salla.sa/twilight-components-react/product-options').then((module) => ({
    default: module.SallaProductOptionsCore,
  }))
);

type OptionsElement = HTMLElement & { setOptionsData?: (data: never[]) => void };

/**
 * One row's options, opened in place.
 *
 * Mounted only while its row is open, so both the details request and the web
 * component cost nothing until a customer asks for them. The element posts
 * `options[...]` fields into this form, which is the same shape the cart
 * endpoint expects from the product page — one add-to-cart path, not two.
 */
function LookOptions({
  entry,
  rowKey,
  onPrice,
}: {
  entry: Product;
  rowKey: string;
  onPrice: (key: string, price: number | null) => void;
}) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  /* `has_options` is on the list card, the options themselves are on the detail
     response — hence one request per row, on open, cached by react-query. */
  const { data: detail, isFetching } = useQuery(product.queries.detail(String(entry.id)));

  /* Memoised on purpose: a fresh array on every render re-runs the ref callback,
     `setOptionsData` re-fills the selection, and the size the customer just
     picked silently jumps back to the first one. */
  const options = useMemo(
    () => (detail?.options?.length ? detail.options : (entry.options ?? [])),
    [detail, entry.options]
  );

  const optionsRef = useCallback(
    (el: OptionsElement | null) => void el?.setOptionsData?.(options as never[]),
    [options]
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.salla?.form.onSubmit('cart.addItem', event);
  };

  /* Every change is a price question: the chosen size may cost more than the
     «from» figure on the row. An incomplete selection has no price, and the row
     goes back to quoting its starting price. */
  const change = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const complete = Array.from(form.elements).every(
      (el) => !(el as HTMLInputElement).willValidate || (el as HTMLInputElement).validity.valid
    );
    if (!complete) {
      onPrice(rowKey, null);
      return;
    }
    const pending = window.salla?.product?.getPrice?.(new FormData(form));
    if (!pending) return;
    pending
      .then((result) => onPrice(rowKey, payable(result)))
      .catch(() => onPrice(rowKey, null));
  };

  const waiting = !options.length && isFetching;

  if (waiting) {
    return (
      <p className="shop-the-look__waiting" role="status">
        {t('blocks.home.look_loading', 'Loading options…')}
      </p>
    );
  }

  /* The list said this product has options but the detail came back without
     them. Opening the product page is the honest way out — inventing a picker
     here would add a variant the store does not know. */
  if (!options.length) {
    return (
      <p className="shop-the-look__waiting">
        {t('blocks.home.look_options_failed', "Couldn't load the options.")}{' '}
        <Link to={entry.url} className="shop-the-look__inline-link">
          {t('blocks.home.look_view_product', 'Product details')}
        </Link>
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      className="shop-the-look__form"
      method="post"
      onSubmit={submit}
      onChange={change}
    >
      <input type="hidden" name="id" value={entry.id} />
      <input type="hidden" name="quantity" value="1" />

      <Suspense
        fallback={
          <p className="shop-the-look__waiting" role="status">
            {t('blocks.home.look_loading', 'Loading options…')}
          </p>
        }
      >
        <OptionsControl
          key={entry.id}
          ref={optionsRef}
          options={JSON.stringify(options)}
          productId={entry.id}
          uniqueKey={`look-${entry.id}`}
          /* The options-prop path skips the component's own details fetch, so
             the parent's stock state has to be handed over explicitly — the
             prop defaults to `false`, which would mark every variant sold out. */
          productAvailable={!entry.is_out_of_stock}
          noPadding={true}
        />
      </Suspense>

      <div className="shop-the-look__form-actions">
        <button type="submit" className="shop-the-look__submit">
          <ShoppingBagIcon aria-hidden="true" />
          <span>{t('blocks.home.look_add_to_cart', 'Add to cart')}</span>
        </button>
        <Link to={entry.url} className="shop-the-look__inline-link">
          {t('blocks.home.look_view_product', 'Product details')}
        </Link>
      </div>
    </form>
  );
}

function imgSrcOf(data: Record<string, unknown>, key: string): string {
  return imgSrc(readValue(data, key, PREFIX)) || '';
}

export function ShopTheLook({ data }: { data: Record<string, unknown> }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const { format: formatNumber } = useNumber();

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [linked, setLinked] = useState<string | null>(null);
  /* One row open at a time: these are pieces of one look, and two open pickers
     would push the second one's total out of sight of its own row. */
  const [openRow, setOpenRow] = useState<string | null>(null);
  /* The price of the variant chosen in an open row, keyed by row. Cleared when
     the row closes, because the picker goes with it — a closed row must not
     quote a size it is no longer showing. */
  const [livePrice, setLivePrice] = useState<Record<string, number | null>>({});
  const forms = useRef(new Map<string, HTMLFormElement>());
  const rowNodes = useRef(new Map<string, HTMLElement>());

  const items = useMemo<LookItem[]>(
    () =>
      readRows(data, 'items', PREFIX)
        .map((row, index) => {
          const productId = lookProductId(row);
          return {
            key: `${productId || 'row'}-${index}`,
            productId,
            x: lookCoord(row, 'x'),
            y: lookCoord(row, 'y'),
            note: rowText(row, 'note', ITEMS),
          };
        })
        .filter((item) => item.productId),
    [data]
  );

  /* One id per product: two hotspots may point at the same product, and a
     duplicated `source_value` only asks the API for the same row twice. */
  const ids = useMemo(() => {
    const out: number[] = [];
    items.forEach((item) => {
      const id = Number(item.productId);
      if (Number.isFinite(id) && id > 0 && !out.includes(id)) out.push(id);
    });
    return out;
  }, [items]);

  const { data: result, isLoading } = useQuery({
    ...product.queries.list({
      source: 'selected',
      sourceValue: ids,
      perPage: Math.max(1, ids.length),
    }),
    /* An EMPTY `selected` source is not "nothing" — the API answers it with the
       store's whole catalogue. Without this gate a block whose merchant has not
       picked anything yet fetches and prints the front page of the store. */
    enabled: ids.length > 0,
  });

  const catalogue = useMemo(() => {
    const map = new Map<string, Product>();
    (result?.items ?? []).forEach((item) => map.set(String(item.id), item));
    return map;
  }, [result]);

  /* A row whose product was deleted or unpublished has nothing to show; while
     the list is still loading every row waits in place instead of vanishing and
     popping back in. */
  const rows = items
    .map((item) => ({ item, product: catalogue.get(item.productId) }))
    .filter((entry) => entry.product || isLoading);

  const scene = imgSrcOf(data, 'scene_image');
  const ratio = shopTheLookRatio(data);
  const preselect = preselectOf(data);
  const showTotal = readBoolean(data, 'show_total', PREFIX, true);
  const eyebrow = readTextOr(data, 'eyebrow', PREFIX, '');
  const title = readTextOr(data, 'title', PREFIX, '');
  const body = readTextOr(data, 'body', PREFIX, '');
  const hint = readTextOr(data, 'hint', PREFIX, '');
  const caption = readTextOr(data, 'caption', PREFIX, '');
  const bg = readTextOr(data, 'bg', PREFIX, '#f4f2ec');
  const ink = readTextOr(data, 'ink', PREFIX, '#2f3a2e');

  const isPicked = (item: LookItem, index: number) =>
    item.key in touched
      ? touched[item.key]
      : preselect === 'all' || (preselect === 'first' && index === 0);

  /** The row's price as it should be read right now: the variant the customer
   * chose in the open panel when there is one, otherwise the catalogue's own
   * sale price / lowest variant price. */
  const priceOf = (item: LookItem, product: Product): number => {
    const live = livePrice[item.key];
    return typeof live === 'number' ? live : unitPrice(product);
  };

  const chosen = rows.filter((entry, index) => entry.product && isPicked(entry.item, index));
  const total = chosen.reduce(
    (sum, entry) => sum + priceOf(entry.item, entry.product as Product),
    0
  );
  const addable = chosen.filter((entry) => canAddDirect(entry.product as Product));
  const needsChoice = chosen.filter((entry) => (entry.product as Product).has_options).length;
  const unavailable = chosen.filter(
    (entry) => !(entry.product as Product).has_options && (entry.product as Product).is_out_of_stock
  ).length;

  if (!rows.length) return null;

  const revealRow = (key: string) => {
    setLinked(key);
    const node = rowNodes.current.get(key);
    if (!node || typeof node.scrollIntoView !== 'function') return;
    node.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const toggle = (item: LookItem, index: number) => {
    const next = !isPicked(item, index);
    setTouched((current) => ({ ...current, [item.key]: next }));
  };

  const notePrice = useCallback((key: string, price: number | null) => {
    setLivePrice((current) => (current[key] === price ? current : { ...current, [key]: price }));
  }, []);

  /** Opening one row closes the other, and closing drops the variant price with
   * the panel that produced it. */
  const toggleRow = (key: string) => {
    const previous = openRow;
    setOpenRow(previous === key ? null : key);
    if (previous) {
      setLivePrice((current) =>
        previous in current ? { ...current, [previous]: null } : current
      );
    }
  };

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.salla?.form.onSubmit('cart.addItem', event);
  };

  /** Adds every ticked product that needs nothing chosen first. `requestSubmit`
   * (not `submit`) so React's own `onSubmit` runs and the whole add goes through
   * the same path as a single row's button. */
  const addChosen = () => {
    addable.forEach((entry) => {
      const form = forms.current.get(entry.item.key);
      if (!form) return;
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  };

  return (
    <div
      className={`shop-the-look${scene ? '' : ' is-solo'}`}
      style={{ '--look-bg': bg, '--look-ink': ink } as CSSProperties}
      data-look-ratio={ratio}
    >
      <div className="shop-the-look__inner">
        {scene ? (
          <div className="shop-the-look__media">
            <figure className="shop-the-look__scene">
              <img
                className="shop-the-look__photo"
                src={scene}
                alt={caption || title}
                loading="lazy"
                decoding="async"
              />

              {rows.map((entry, index) => {
                const { x, y } = entry.item;
                if (x === null || y === null) return null;
                const isLinked = linked === entry.item.key;
                /* While the catalogue is still answering there is no product
                   name yet, and `"٢ — "` is what a screen reader would say. The
                   number alone is honest; the name joins it when it arrives. */
                const number = formatNumber(index + 1);
                const name = entry.product?.name ?? '';
                return (
                  <button
                    key={entry.item.key}
                    type="button"
                    className={`shop-the-look__dot${isLinked ? ' is-linked' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={name ? `${number} — ${name}` : number}
                    onMouseEnter={() => setLinked(entry.item.key)}
                    onMouseLeave={() =>
                      setLinked((current) => (current === entry.item.key ? null : current))
                    }
                    onFocus={() => setLinked(entry.item.key)}
                    onBlur={() =>
                      setLinked((current) => (current === entry.item.key ? null : current))
                    }
                    onClick={() => revealRow(entry.item.key)}
                  >
                    <span className="shop-the-look__dot-num">{formatNumber(index + 1)}</span>
                  </button>
                );
              })}

              {caption ? (
                <figcaption className="shop-the-look__caption">{caption}</figcaption>
              ) : null}
            </figure>
          </div>
        ) : null}

        <div className="shop-the-look__panel">
          {(eyebrow || title || body) && (
            <div className="shop-the-look__head">
              {eyebrow ? <p className="shop-the-look__eyebrow">{eyebrow}</p> : null}
              {title ? <h2 className="shop-the-look__title">{title}</h2> : null}
              {body ? <p className="shop-the-look__body">{body}</p> : null}
              {hint ? <p className="shop-the-look__hint">{hint}</p> : null}
            </div>
          )}

          <ul className="shop-the-look__list">
            {rows.map((entry, index) => {
              const { item, product: entryProduct } = entry;
              const picked = isPicked(item, index);
              const isLinked = linked === item.key;
              const outOfStock = !!entryProduct?.is_out_of_stock;
              const expandable = !!entryProduct?.has_options && !outOfStock;
              const isOpen = expandable && openRow === item.key;
              const panelId = `look-options-${item.key}`;
              const live = livePrice[item.key];
              const hasLive = typeof live === 'number';
              /* «From» is only true when the variants actually span a range:
                 `starting_price` equals `price` on a single-variant product, and
                 a «From 100» over a product that costs exactly 100 is noise. A
                 chosen size is exact, so it drops the qualifier as well. */
              const startsFrom =
                !hasLive &&
                !!entryProduct?.has_options &&
                entryProduct.starting_price != null &&
                toNumber(entryProduct.starting_price) < toNumber(entryProduct.price);

              /* The whole row is the way in — "tap the piece and it drops open".
                 The controls inside it keep their own behaviour: this only fires
                 on the parts of the row that are not already a control. */
              const onRowClick = (event: ReactMouseEvent<HTMLLIElement>) => {
                if (!expandable) return;
                const target = event.target as HTMLElement | null;
                if (target?.closest('a, button, input, label, form, .shop-the-look__drop')) return;
                toggleRow(item.key);
              };

              return (
                <li
                  key={item.key}
                  ref={(node) => {
                    if (node) rowNodes.current.set(item.key, node);
                    else rowNodes.current.delete(item.key);
                  }}
                  className={[
                    'shop-the-look__row',
                    picked ? 'is-picked' : '',
                    isLinked ? 'is-linked' : '',
                    expandable ? 'is-expandable' : '',
                    isOpen ? 'is-open' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => setLinked(item.key)}
                  onMouseLeave={() =>
                    setLinked((current) => (current === item.key ? null : current))
                  }
                  onClick={onRowClick}
                >
                  <div className="shop-the-look__rowhead">
                    <label className="shop-the-look__pick">
                      <input
                        type="checkbox"
                        checked={picked}
                        onChange={() => toggle(item, index)}
                        aria-label={`${t('blocks.home.look_select', 'Select')} ${entryProduct?.name ?? ''}`.trim()}
                      />
                      <span className="shop-the-look__box" aria-hidden="true" />
                    </label>

                    <span className="shop-the-look__thumb">
                      {entryProduct?.image?.url ? (
                        <img src={entryProduct.image.url} alt="" loading="lazy" />
                      ) : null}
                      <span className="shop-the-look__badge" aria-hidden="true">
                        {formatNumber(index + 1)}
                      </span>
                    </span>

                    <div className="shop-the-look__info">
                      {entryProduct ? (
                        /* A row that opens is one big target: its name must not
                           be a link out, or the most obvious thing to press is
                           the one thing that leaves the page instead of
                           opening the sizes. The panel carries the way to the
                           product page for the customer who wants it. */
                        expandable ? (
                          <span className="shop-the-look__name is-static">
                            {entryProduct.name}
                          </span>
                        ) : (
                          <Link to={entryProduct.url} className="shop-the-look__name">
                            {entryProduct.name}
                          </Link>
                        )
                      ) : (
                        <span className="shop-the-look__name is-waiting" aria-hidden="true" />
                      )}
                      {item.note ? <p className="shop-the-look__note">{item.note}</p> : null}
                    </div>

                    <div className="shop-the-look__trade">
                      <div className="shop-the-look__price">
                        {entryProduct && startsFrom ? (
                          <em className="shop-the-look__from">
                            {t('blocks.home.look_from', 'From')}
                          </em>
                        ) : null}
                        <span className="shop-the-look__now">
                          {entryProduct ? format(hasLive ? live : unitPrice(entryProduct)) : ''}
                        </span>
                        {!hasLive && entryProduct?.is_on_sale && entryProduct.regular_price ? (
                          <s className="shop-the-look__was">{format(entryProduct.regular_price)}</s>
                        ) : null}
                      </div>

                      {expandable && entryProduct ? (
                        <button
                          type="button"
                          className="shop-the-look__cta is-toggle"
                          aria-expanded={isOpen}
                          aria-controls={isOpen ? panelId : undefined}
                          onClick={() => toggleRow(item.key)}
                        >
                          <span>
                            {isOpen
                              ? t('blocks.home.look_hide', 'Hide options')
                              : t('blocks.home.look_choose', 'Choose options')}
                          </span>
                          <ChevronDownIcon
                            className="shop-the-look__chevron"
                            aria-hidden="true"
                          />
                        </button>
                      ) : entryProduct && !outOfStock ? (
                        <form
                          ref={(node) => {
                            if (node) forms.current.set(item.key, node);
                            else forms.current.delete(item.key);
                          }}
                          className="shop-the-look__buy"
                          method="post"
                          onSubmit={onAdd}
                        >
                          <input type="hidden" name="id" value={entryProduct.id} />
                          <input type="hidden" name="quantity" value="1" />
                          <button type="submit" className="shop-the-look__cta">
                            <PlusIcon className="shop-the-look__plus" aria-hidden="true" />
                            <span>{t('blocks.home.look_add', 'Add')}</span>
                          </button>
                        </form>
                      ) : entryProduct ? (
                        <span className="shop-the-look__cta is-off">
                          {t('blocks.home.look_out_of_stock', 'Unavailable')}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {isOpen && entryProduct ? (
                    <div className="shop-the-look__drop" id={panelId}>
                      <LookOptions entry={entryProduct} rowKey={item.key} onPrice={notePrice} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* The total is arithmetic over catalogue prices, so it has no honest
              value until they arrive — a "0" that fills in a moment later reads
              as a bug, not as loading. */}
          {showTotal && !isLoading ? (
            <div className="shop-the-look__total">
              <div className="shop-the-look__sum">
                <span className="shop-the-look__sum-label">
                  {t('blocks.home.look_total', 'Look total')}
                </span>
                <strong className="shop-the-look__sum-value">{format(total)}</strong>
                <span className="shop-the-look__sum-count">
                  {`${formatNumber(chosen.length)} ${t('blocks.home.look_pieces', 'items')}`}
                </span>
              </div>

              {addable.length > 0 ? (
                <button type="button" className="shop-the-look__add-all" onClick={addChosen}>
                  <ShoppingBagIcon aria-hidden="true" />
                  <span>
                    {`${t('blocks.home.look_add_selected', 'Add selected')} (${formatNumber(addable.length)})`}
                  </span>
                </button>
              ) : null}

              {needsChoice > 0 ? (
                <p className="shop-the-look__sum-note">
                  {`${formatNumber(needsChoice)} ${t(
                    'blocks.home.look_needs_choice',
                    'of the selected items need a size chosen from the list.'
                  )}`}
                </p>
              ) : null}

              {unavailable > 0 ? (
                <p className="shop-the-look__sum-note">
                  {`${formatNumber(unavailable)} ${t(
                    'blocks.home.look_unavailable_note',
                    'of the selected items are out of stock.'
                  )}`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
