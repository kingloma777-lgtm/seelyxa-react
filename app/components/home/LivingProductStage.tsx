import {
  createElement,
  memo,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/* --------------------------------------------------------------------------
 * Living Product Stage — ported from the Twig theme (`seelyxa`,
 * `src/views/components/home/living-product-stage.twig` +
 * `living-product-stage.scss` + `partials/living-product-stage.js`).
 * A layered cinematic scroll journey (320vh sticky stage) where the product
 * travels in, breathes, is scanned (hotspot) and hands off to a commercial
 * panel. The entrance pose IS the first frame of scroll. Base (no JS /
 * reduced motion / SSR) shows the assembled scene fully visible.
 * ------------------------------------------------------------------------ */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// 0 before a, 1 after b — smoothstep between.
const smooth = (t: number, a: number, b: number) => {
  const u = clamp((t - a) / (b - a), 0, 1);
  return u * u * (3 - 2 * u);
};

/* The old `seelyxa.scroll.watch` onProgress values: p ∈ [-1, 1] center-based.
   For the stage, the journey is its own formula (twig parity): */
function journeyT(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  if (rect.top <= 0) return 1; // stage fully scrolled in
  return clamp((vh - rect.top) / rect.height, 0, 1);
}

/* The per-frame motion, verbatim from the old JS except `stage`/queries live
   on the inner sticky root the component owns. */
function apply(
  root: HTMLElement,
  els: Record<string, HTMLElement | HTMLElement[]>,
  sgn: number,
  t: number
) {
  const product = els.product as HTMLElement;
  const frame = els.frame as HTMLElement;
  const img = els.img as HTMLElement;
  const mirror = els.mirror as HTMLElement;
  const floor = els.floor as HTMLElement;
  const halo = els.halo as HTMLElement;
  const watermark = els.watermark as HTMLElement;
  const cool = els.cool as HTMLElement;
  const warm = els.warm as HTMLElement;
  const panel = els.panel as HTMLElement;
  const ring = els.ring as HTMLElement;
  const fill = els.fill as HTMLElement;
  const dust = els.dust as HTMLElement[];
  const labels = els.labels as HTMLElement[];
  const w = product.clientWidth || 420;

  /* phase blends */
  const ent = easeOutBack(smooth(t, 0, 0.25)); // entrance (overshoot = alive)
  const alive = smooth(t, 0.26, 0.4) * (1 - smooth(t, 0.66, 0.78));
  const disc = smooth(t, 0.55, 0.72); // macro / discovery
  const done = smooth(t, 0.74, 1); // commercial end

  const breathe = Math.sin(clamp((t - 0.26) / 0.47, 0, 1) * Math.PI * 4);
  const sway = Math.sin(clamp((t - 0.26) / 0.47, 0, 1) * Math.PI * 2.3);
  const warmth = smooth(t, 0.45, 0.85); // cool → warm crossfade

  /* product travel + breathing */
  const startX = sgn * -0.6 * w;
  const endX = sgn * -0.2 * w;
  const x = startX * (1 - ent) + endX * done;
  const y = 130 * (1 - ent) + sway * 10 * alive - 26 * done;
  product.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

  /* frame: scale story + 3D entrance + sway */
  const scale = (0.3 + 0.7 * ent) * (1 + 0.05 * breathe * alive) * (1 + 0.22 * disc) * (1 - 0.2 * done);
  const rotZ = -9 * sgn * (1 - ent) + sway * 2.5 * alive;
  const rotY = 56 * sgn * (1 - ent);
  frame.style.transform = `scale(${scale.toFixed(3)}) rotateZ(${rotZ.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`;

  /* entrance focus: blur → sharp + brightness lift */
  img.style.filter = `blur(${(6 * (1 - ent)).toFixed(1)}px) brightness(${(0.82 + 0.18 * ent).toFixed(2)})`;

  /* reflection + floor shadow */
  mirror.style.opacity = (smooth(t, 0.12, 0.3) * (1 - 0.45 * done)).toFixed(3);
  floor.style.opacity = (smooth(t, 0.06, 0.2) * (1 - 0.5 * done)).toFixed(3);
  floor.style.transform = `translateX(-50%) scaleX(${(0.72 + 0.5 * ent).toFixed(3)})`;

  /* halo behind product blooms on discovery */
  halo.style.opacity = ((0.5 + 0.4 * disc) * (1 - smooth(t, 0.9, 1))).toFixed(3);
  halo.style.transform = `translate(-50%, -50%) scale(${(0.8 + 0.55 * disc).toFixed(3)}) rotate(${(disc * 30).toFixed(1)}deg)`;

  /* brand watermark: counter-parallax (depth contrast) */
  const wmx = -sgn * 10 * (1 - ent) + sgn * 6 * done;
  watermark.style.opacity = (0.18 * smooth(t, 0.1, 0.3) * (1 - 0.8 * done)).toFixed(3);
  watermark.style.transform = `translate(calc(-50% + ${wmx.toFixed(1)}vw), -50%)`;

  /* auras crossfade */
  cool.style.opacity = (0.75 * (1 - warmth)).toFixed(3);
  warm.style.opacity = (0.75 * warmth).toFixed(3);

  /* dust particles float upward at their own depth factor */
  dust.forEach((d, i) => {
    const f = parseFloat(d.dataset.lpD || '') || 0.8;
    const ph = i % 2 ? 0.3 : 0;
    const op = (0.55 * smooth(t, 0.26, 0.5) * (1 - 0.7 * done) * clamp(f + 0.3, 0, 1)).toFixed(3);
    d.style.opacity = op;
    d.style.transform =
      `translate3d(${(Math.sin((t + ph) * Math.PI * 2) * 16 * f).toFixed(1)}px, ${(-t * f * 90).toFixed(1)}vh, 0) ` +
      `scale(${(0.6 + 0.7 * Math.abs(Math.sin(t * 3 + i))).toFixed(2)})`;
  });

  /* commercial panel + energy hand-off ring from the motion */
  const pvis = smooth(t, 0.76, 0.95);
  panel.style.opacity = pvis.toFixed(3);
  panel.style.transform =
    `translate3d(${(sgn * 26 * (1 - pvis)).toFixed(1)}vw, ${(44 * (1 - pvis)).toFixed(1)}px, 0) ` +
    `scale(${(0.93 + 0.07 * pvis).toFixed(3)})`;

  const ringV = smooth(t, 0.72, 0.88) * (1 - smooth(t, 0.9, 1));
  ring.style.opacity = ringV.toFixed(3);
  ring.style.transform = `translate(-50%, -50%) scale(${(0.1 + 0.9 * ringV).toFixed(3)})`;

  /* journey indicator */
  fill.style.width = `${(t * 100).toFixed(1)}%`;
  const bounds = [0.4, 0.6, 0.82];
  labels.forEach((label, i) => {
    const lo = i === 0 ? -1 : bounds[i - 1];
    const hi = i === 3 ? 2 : bounds[i];
    label.classList.toggle('is-on', t >= lo && t < hi);
  });

  /* phase classes */
  root.classList.toggle('living-product--hot', disc > 0.12);
  root.classList.toggle('living-product--settled', done > 0.8);
}

type StageProduct = {
  id?: number | string;
  name?: string;
  subtitle?: string;
  url?: string;
  image?: { url?: string; small_url?: string; alt?: string } | string;
  is_on_sale?: boolean;
  sale_price?: number | string;
  regular_price?: number | string;
  starting_price?: number | string;
  price?: number | string;
  status?: string;
  type?: string;
  [key: string]: unknown;
};

function resolveProduct(value: unknown): StageProduct | null {
  let v: unknown = value;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object' && 'product' in (v as StageProduct)) {
    v = (v as StageProduct).product;
  }
  return v && typeof v === 'object' ? (v as StageProduct) : null;
}

function imgUrl(image: StageProduct['image']): string {
  if (image && typeof image === 'object') return image.url || '';
  return typeof image === 'string' ? image : '';
}

function imgAlt(
  image: StageProduct['image'],
  name: string | undefined
): string {
  if (image && typeof image === 'object' && image.alt) return image.alt;
  return name || '';
}

export interface LivingProductStageData {
  single_product?: unknown;
  kicker?: unknown;
  hotspot_label?: unknown;
  product_link_label?: unknown;
  under_header?: boolean;
  position?: number;
  [key: string]: unknown;
}

export interface LivingProductStageProps {
  data: LivingProductStageData;
}

const DUST_DEPTHS = [0.45, 0.8, 1.2, 0.65, 1.5, 1.0, 0.55, 1.3];
const DUST_LEFTS = [12, 26, 42, 58, 70, 84, 33, 61];

const ADD_BUTTON_TAG = 'salla-add-product-button';

export const LivingProductStage = memo(function LivingProductStage({
  data,
}: LivingProductStageProps) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const rootRef = useRef<HTMLDivElement>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const product = resolveProduct(data.single_product);
  const kicker = typeof data.kicker === 'string' ? data.kicker : '';
  const hotspotLabel =
    (typeof data.hotspot_label === 'string' && data.hotspot_label) ||
    t('blocks.home.lp_hotspot', 'تفاصيل المنتج');
  const linkLabel =
    (typeof data.product_link_label === 'string' && data.product_link_label) ||
    t('blocks.home.lp_view', 'عرض المنتج');
  const src = product ? imgUrl(product.image) : '';
  const alt = product ? imgAlt(product.image, product.name) : '';

  /* ---- the cinematic journey (rAF on scroll; client only) ---- */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = rootRef.current;
    if (!root) return;

    const productEl = root.querySelector('[data-lp-product]');
    const frameEl = root.querySelector('[data-lp-frame]');
    const panelEl = root.querySelector('[data-lp-panel]');
    if (!productEl || !frameEl || !panelEl) return;

    const els = {
      product: productEl,
      frame: frameEl,
      img: frameEl.querySelector('img'),
      cool: root.querySelector('[data-lp-cool]'),
      warm: root.querySelector('[data-lp-warm]'),
      halo: root.querySelector('[data-lp-halo]'),
      mirror: root.querySelector('[data-lp-mirror]'),
      floor: root.querySelector('[data-lp-floor]'),
      watermark: root.querySelector('[data-lp-watermark]'),
      dust: Array.from(root.querySelectorAll('[data-lp-dust]')),
      panel: panelEl,
      ring: root.querySelector('[data-lp-ring]'),
      fill: root.querySelector('[data-lp-fill]'),
      labels: Array.from(root.querySelectorAll('[data-lp-lab]')),
    } as unknown as Record<string, HTMLElement | HTMLElement[]>;

    if (!els.img || !els.watermark || !els.cool || !els.warm || !els.fill) return;

    root.classList.add('living-product--js');
    const sgn = document.documentElement.dir === 'rtl' ? 1 : -1;

    // Lock the current frame immediately (no flash before scroll).
    apply(root, els, sgn, journeyT(root));

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply(root, els, sgn, journeyT(root));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove('living-product--js', 'living-product--hot', 'living-product--settled');
    };
  }, [product?.id]);

  /* ---- hotspot popup (interactive even under reduced motion) ---- */
  useEffect(() => {
    if (!popupOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.living-product__product')) setPopupOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [popupOpen]);

  const priceText: ReactNode | null = product
    ? product.is_on_sale
      ? format(product.sale_price ?? '')
      : product.starting_price
        ? format(product.starting_price)
        : format(product.price ?? '')
    : null;

  const oldPriceText: ReactNode | null =
    product?.is_on_sale && product.regular_price ? format(product.regular_price) : null;

  const addToCart = product
    ? createElement(
    ADD_BUTTON_TAG,
    {
      fill: 'outline',
      width: 'wide',
      'product-id': String(product.id ?? ''),
      'product-status': product.status ?? '',
      'product-type': product.type ?? '',
      class: 'living-product__cta',
      key: 'lp-cta',
    },
    <i className="sicon-shopping-bag text-base" aria-hidden="true"></i>,
    <span>{t('pages.products.add_to_cart', 'أضف لسلة الشراء')}</span>
    )
    : null;

  /* Product-dependent scene (mirrors the twig `{% if product %}` wrap). */
  const sceneBlock = product ? (
    <>
      {/* giant brand watermark, counter-parallax */}
      <div className="living-product__watermark" data-lp-watermark aria-hidden="true">
        {product.name}
      </div>

      <div className="living-product__scene">
        <div className="living-product__halo" data-lp-halo aria-hidden="true"></div>

        <div className="living-product__product" data-lp-product>
          <div className="living-product__frame" data-lp-frame>
            <Image src={src} className="living-product__img" alt={alt} noWrapper />
            <span className="living-product__scan" data-lp-scan aria-hidden="true"></span>
          </div>

          <div className="living-product__mirror" data-lp-mirror aria-hidden="true">
            <img src={src} alt="" loading="lazy" />
          </div>

          <button
            type="button"
            className="living-product__hotspot"
            data-lp-hotspot
            aria-label={hotspotLabel}
            aria-expanded={popupOpen ? 'true' : 'false'}
            onClick={() => setPopupOpen((v) => !v)}
          >
            <span className="living-product__hotspot-dot" aria-hidden="true"></span>
          </button>

          <div className="living-product__popup" data-lp-popup>
            <span className="living-product__popup-label">{hotspotLabel}</span>
            <div className="living-product__popup-name">{product.name}</div>
            {product.subtitle ? (
              <p className="living-product__popup-text">{product.subtitle}</p>
            ) : null}
            <Link to={product.url || '#'} className="living-product__popup-link">
              {linkLabel} <i className="sicon-keyboard_arrow_left"></i>
            </Link>
          </div>
        </div>

        <div className="living-product__floor" data-lp-floor aria-hidden="true"></div>
      </div>

      {/* commercial panel — emerges with the motion */}
      <div className="living-product__panel" data-lp-panel>
        <div className="living-product__panel-card">
          {kicker ? <span className="living-product__kicker">{kicker}</span> : null}
          <h3 className="living-product__title">{product.name}</h3>
          {product.subtitle ? (
            <p className="living-product__text">{product.subtitle}</p>
          ) : null}
          <div className="living-product__prices">
            <span className="living-product__price">{priceText}</span>
            {oldPriceText ? <span className="living-product__old">{oldPriceText}</span> : null}
          </div>
          {addToCart}
          <Link to={product.url || '#'} className="living-product__link">
            {linkLabel} <i className="sicon-keyboard_arrow_left"></i>
          </Link>
        </div>
      </div>

      {/* energy hand-off ring at the commercial end */}
      <div className="living-product__ring" data-lp-ring aria-hidden="true"></div>
    </>
  ) : null;

  return (
    <div
      ref={rootRef}
      data-testid="store-home-living-product"
      data-live-product
      className={`living-product${popupOpen ? ' living-product--popup-open' : ''}`}
    >
      <div className="living-product__inner" data-lp-inner>
        {/* ambient auras — cool → warm across the journey */}
        <div className="living-product__aura" aria-hidden="true">
          <span
            className="living-product__aura living-product__aura--cool"
            data-lp-cool
          ></span>
          <span
            className="living-product__aura living-product__aura--warm"
            data-lp-warm
          ></span>
        </div>

        {/* floating dust (breath particles) */}
        {DUST_DEPTHS.map((depth, i) => (
          <span
            key={i}
            className="living-product__dust"
            data-lp-dust
            data-lp-d={depth}
            style={{ ['--lp-d' as string]: depth, left: `${DUST_LEFTS[i]}%` }}
          />
        ))}

        {sceneBlock}

        {!product ? (
          <div className="living-product__empty">
            <strong>
              {kicker || t('blocks.home.lp_empty_pick', 'أضف منتجاً')}
            </strong>
            <p>
              {t(
                'blocks.home.lp_empty_text',
                'اختر منتجاً من إعدادات "مرحلة المنتج الحية" ليبدأ المشهد.'
              )}
            </p>
          </div>
        ) : null}

        {/* cinematic journey indicator */}
        <div className="living-product__pointer" data-lp-pointer aria-hidden="true">
          <div className="living-product__pointer-track">
            <span className="living-product__pointer-fill" data-lp-fill></span>
          </div>
          <div className="living-product__pointer-labels">
            <span data-lp-lab="in">{t('blocks.home.lp_phase_in', 'دخول')}</span>
            <span data-lp-lab="alive">{t('blocks.home.lp_phase_alive', 'حياة')}</span>
            <span data-lp-lab="disc">{t('blocks.home.lp_phase_disc', 'اكتشاف')}</span>
            <span data-lp-lab="done">{t('blocks.home.lp_phase_done', 'اكتمال')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
