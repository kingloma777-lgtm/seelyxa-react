import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { imgSrc, scalar } from '../../../lib/curtainSlots';
import { SeliaCta, SeliaSection } from './SeliaSection';
import { BrandsMarquee } from './BrandsMarquee';
import { idsFromPicker, safeHref, visibilityOf } from './seliaFields';
import {
  SeliaAccordion,
  SeliaBeforeAfter,
  SeliaCountdown,
  SeliaHeroSlider,
  SeliaMedia,
  SeliaProductGrid,
  SeliaProductVideoGrid,
  SeliaScroller,
  SeliaStars,
  SeliaTabs,
  SeliaTileLink,
  SeliaTiles,
  SeliaVideo,
  useSeliaProducts,
  type HeroSlide,
  type SeliaTile,
} from './kit';

/* ==========================================================================
   One renderer for the 26 Selia blocks added in the second batch.

   The merchant-facing contract lives in `scripts/selia-specs-batch2.cjs`.
   Every generated block reads EVERY declared field explicitly and hands the
   values here; this file is the single place that decides what a colour, a
   switch, a picker or a repeater column *does*. That split is deliberate:

     - the generated file is the audit trail (verified by verify-selia.cjs);
     - this file is the behaviour, written once instead of 26 times.

   Every control is published to the DOM twice: as `--selia-<key>` (so the
   stylesheet, and the merchant's `custom_css`, can consume it) and as
   `data-<key>` (so scoped CSS can branch on a switch). Nothing is read and
   thrown away. Text columns that a layout does not have a slot for still
   render as a meta line rather than disappearing.

   SSR rule: no `Date.now()`, `matchMedia`, viewport or observer reads during
   render. Locale comes from `useTranslation()` (SSR-safe), and the product
   queries live in a child component so they are never called conditionally.
   ========================================================================== */

export interface SeliaControl {
  /** Short key, e.g. `auto_height` — the generated file reads `<prefix>_<key>`. */
  key: string;
  format: string;
  /** The manifest default, used when the placement has no value. */
  value?: unknown;
}

export interface SeliaColumn extends SeliaControl {
  /** Full id, e.g. `slides.desktop`. */
  id: string;
}

export interface SeliaSchema {
  /** Router key, e.g. `selia-advanced-slider`. */
  path: string;
  kind: string;
  prefix: string;
  collection?: string;
  controls: SeliaControl[];
  columns: SeliaColumn[];
}

export type SeliaValues = Record<string, unknown>;
export type SeliaRows = Array<Record<string, unknown>>;

/* -------------------------------------------------------------------------- *
 * Normalisation
 * -------------------------------------------------------------------------- */

const isOn = (value: unknown) =>
  value === true || value === 1 || value === '1' || value === 'true';

const asNumber = (value: unknown, fallback = 0) => {
  const flat = value !== null && typeof value === 'object' ? scalar(value) : value;
  const parsed = Number(flat);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asText = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return scalar(value);
};

/** Every numeric format the Salla manifest allows, plus the legacy `slider`
 *  spelling so a block generated before the format fix still normalises. */
const NUMERIC_FORMATS = new Set(['number', 'integer', 'numeric', 'slider']);

/** One field value, reduced to the primitive its format promises. */
function normalize(format: string, raw: unknown, fallback: unknown): unknown {
  const value = raw === undefined || raw === null ? fallback : raw;
  switch (format) {
    case 'switch':
      return isOn(value);
    case 'number':
    case 'integer':
    case 'numeric':
    case 'slider':
      return asNumber(value, asNumber(fallback));
    case 'image':
      return imgSrc(value);
    case 'variable-list':
      return value ?? [];
    default:
      return asText(value);
  }
}

function normalizedControls(schema: SeliaSchema, values: SeliaValues) {
  const out: Record<string, unknown> = {};
  for (const control of schema.controls) {
    out[control.key] = normalize(control.format, values[control.key], control.value);
  }
  return out;
}

function normalizedRows(schema: SeliaSchema, rows: SeliaRows) {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const column of schema.columns) {
      out[column.key] = normalize(column.format, row[column.key], column.value);
    }
    return out;
  });
}

/* -------------------------------------------------------------------------- *
 * A row, described by the SHAPE of its columns rather than by name lookups
 * alone. Two blocks with differently named image columns still land in
 * `images`; a layout only needs to say "use the first image".
 * -------------------------------------------------------------------------- */

interface Pair {
  key: string;
  value: string;
}

interface RowView {
  values: Record<string, unknown>;
  images: Pair[];
  videos: Pair[];
  links: Array<{ key: string; href: string }>;
  texts: Array<{ key: string; value: string; format: string }>;
  colors: Pair[];
  numbers: Array<{ key: string; value: number }>;
  options: Pair[];
  flags: Pair[];
  style: CSSProperties;
  data: Record<string, string>;
}

function describeRow(schema: SeliaSchema, values: Record<string, unknown>): RowView {
  const view: RowView = {
    values,
    images: [],
    videos: [],
    links: [],
    texts: [],
    colors: [],
    numbers: [],
    options: [],
    flags: [],
    style: {},
    data: {},
  };
  const vars: Record<string, string> = {};
  view.style = vars as CSSProperties;

  for (const column of schema.columns) {
    const value = values[column.key];
    const key = column.key;
    vars[`--s-${key}`] = asText(value);

    switch (column.format) {
      case 'image':
        if (value) view.images.push({ key, value: String(value) });
        view.data[`data-has-${key}`] = value ? '1' : '0';
        break;
      case 'url': {
        const text = asText(value);
        if (text) {
          if (/video|mp4|youtu|vimeo/i.test(key) || /\.(mp4|webm)(\?|$)/i.test(text)) {
            view.videos.push({ key, value: text });
          }
          view.links.push({ key, href: safeHref(text) });
        }
        break;
      }
      case 'variable-list': {
        const href = safeHref(value);
        if (href) view.links.push({ key, href });
        break;
      }
      case 'color': {
        const text = asText(value);
        if (text) view.colors.push({ key, value: text });
        break;
      }
      case 'slider': {
        const number = asNumber(value);
        view.numbers.push({ key, value: number });
        view.data[`data-${key}`] = String(number);
        break;
      }
      case 'switch': {
        const flag = isOn(value);
        view.flags.push({ key, value: flag ? '1' : '0' });
        view.data[`data-${key}`] = flag ? '1' : '0';
        break;
      }
      case 'dropdown-list': {
        const option = asText(value);
        if (option) {
          view.options.push({ key, value: option });
          view.data[`data-${key}`] = option;
        }
        break;
      }
      default: {
        const text = asText(value);
        if (text) view.texts.push({ key, value: text, format: column.format });
      }
    }
  }
  return view;
}

const findText = (view: RowView, pattern: RegExp, exclude: RegExp = /$^/) =>
  view.texts.find((item) => pattern.test(item.key) && !exclude.test(item.key))?.value ?? '';

const firstImage = (view: RowView) => view.images[0]?.value ?? '';

/** The second image is a mobile/English variant only when its key says so. */
const secondImage = (view: RowView) => {
  const candidate = view.images.find(
    (item) => /mobile|_en$|en_/i.test(item.key) && item.key !== view.images[0]?.key
  );
  return candidate?.value ?? '';
};

const firstLink = (view: RowView) => view.links.find((item) => item.href)?.href ?? '';

function rowTitle(view: RowView) {
  return (
    findText(view, /^(title|name|heading|question|label|caption)$/i, /button|link_|ticker/) ||
    findText(view, /title|name|heading|question|caption/i, /button|link_|ticker/) ||
    findText(view, /.*/, /button|link_|ticker|subtitle|description|answer|text/)
  );
}

function rowDescription(view: RowView) {
  return (
    findText(view, /description|answer|body|text|subtitle/i, /ticker|button/) ||
    view.texts.find((item) => item.format === 'textarea')?.value ||
    ''
  );
}

/* -------------------------------------------------------------------------- *
 * The generic card. Every layout below is a different arrangement of these.
 * -------------------------------------------------------------------------- */

function RowCard({
  view,
  kind,
  index,
  showCaption = true,
  showVideo = false,
  showDescription = true,
}: {
  view: RowView;
  kind: string;
  index: number;
  showCaption?: boolean;
  showVideo?: boolean;
  showDescription?: boolean;
}) {
  const title = rowTitle(view);
  const description = showDescription ? rowDescription(view) : '';
  const image = firstImage(view);
  const mobile = secondImage(view);
  const href = firstLink(view);
  const video = showVideo ? view.videos[0]?.value ?? '' : '';
  const badge = findText(view, /badge|ticker_text|ribbon|tag/i) || findText(view, /subtitle/i);
  const ctaLabel = findText(view, /button_label|link_label|cta/i);
  const ctaHref = view.links.find((item) => /button|link/i.test(item.key) && item.href)?.href || href;
  const rating = view.numbers.find((item) => /rating|stars/i.test(item.key))?.value ?? 0;
  const icon = findText(view, /icon/i);
  const accent = view.colors[0]?.value;
  const top = view.numbers.find((item) => /^top$/i.test(item.key))?.value;
  const left = view.numbers.find((item) => /^left$/i.test(item.key))?.value;
  const fit = view.options.find((item) => /^fit$/i.test(item.key))?.value || 'cover';

  const used = new Set([
    ...view.texts.filter((item) =>
      [title, description, badge, ctaLabel, icon].includes(item.value)
    ).map((item) => item.key),
  ]);
  const extra = view.texts.filter((item) => !used.has(item.key));

  const style: CSSProperties = {
    ...view.style,
    ...(accent ? ({ '--card-accent': accent } as CSSProperties) : {}),
    ...(top !== undefined ? ({ '--card-top': `${top}%` } as CSSProperties) : {}),
    ...(left !== undefined ? ({ '--card-left': `${left}%` } as CSSProperties) : {}),
  };

  const body = (
    <>
      {video ? (
        <SeliaVideo src={video} poster={image} className="selia-card__video" />
      ) : image ? (
        <SeliaMedia
          src={image}
          mobile={mobile}
          alt={title}
          fit={fit === 'contain' ? 'contain' : 'cover'}
          className="selia-card__media"
        />
      ) : (
        <span className="selia-card__media selia-card__media--empty" aria-hidden="true" />
      )}
      {icon ? <i className={`selia-card__icon sicon-${icon.replace(/^sicon-/, '')}`} aria-hidden="true" /> : null}
      {badge ? <span className="selia-card__badge">{badge}</span> : null}
      {showCaption && (title || description || ctaLabel || extra.length || rating) ? (
        <div className="selia-card__body">
          {rating ? <SeliaStars value={rating} /> : null}
          {title ? <h3 className="selia-card__title">{title}</h3> : null}
          {description ? <p className="selia-card__desc">{description}</p> : null}
          {extra.map((item) => (
            <p className="selia-card__meta" key={item.key} data-selia-field={item.key}>
              {item.value}
            </p>
          ))}
          {ctaLabel ? (
            <span className="selia-card__cta">
              <SeliaCta label={ctaLabel} href={ctaHref} tone="ghost" />
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <li className={`selia-card selia-card--${kind}`} style={style} data-selia-index={index} {...view.data}>
      {href && !ctaLabel ? (
        <SeliaTileLink href={href} label={title} className="selia-card__link">
          {body}
        </SeliaTileLink>
      ) : (
        <div className="selia-card__link">{body}</div>
      )}
    </li>
  );
}

function Cards({
  views,
  kind,
  className = '',
  showCaption = true,
  showVideo = false,
  showDescription = true,
}: {
  views: RowView[];
  kind: string;
  className?: string;
  showCaption?: boolean;
  showVideo?: boolean;
  showDescription?: boolean;
}) {
  if (!views.length) return null;
  return (
    <ul className={`selia-cards selia-cards--${kind} ${className}`}>
      {views.map((view, index) => (
        <RowCard
          key={index}
          view={view}
          kind={kind}
          index={index}
          showCaption={showCaption}
          showVideo={showVideo}
          showDescription={showDescription}
        />
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- *
 * Product bodies. A separate component owns the query so the hook is never
 * called conditionally and every block keeps the same first paint (a skeleton
 * that is identical on the server and the client).
 * -------------------------------------------------------------------------- */

function Products({ type, ids, limit, className = '' }: { type: string; ids: number[]; limit: number; className?: string }) {
  const { products } = useSeliaProducts(type, ids, limit);
  return <SeliaProductGrid products={products} className={className} skeleton={Math.min(limit, 4)} />;
}

/* -------------------------------------------------------------------------- *
 * Top-level helpers
 * -------------------------------------------------------------------------- */

function textOf(v: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = asText(v[key]);
    if (value) return value;
  }
  return '';
}

function styleFromControls(schema: SeliaSchema, v: Record<string, unknown>) {
  const vars: Record<string, string> = {};
  const style = vars as CSSProperties;
  const flags: Record<string, boolean | string> = {};

  for (const control of schema.controls) {
    const value = v[control.key];
    const key = control.key;
    switch (control.format) {
      case 'switch':
        flags[key] = isOn(value);
        vars[`--selia-${key}`] = isOn(value) ? '1' : '0';
        break;
      case 'number':
      case 'integer':
      case 'numeric':
      case 'slider':
        vars[`--selia-${key}`] = String(asNumber(value));
        break;
      default: {
        const textValue = control.format === 'image' ? String(value ?? '') : asText(value);
        if (textValue) vars[`--selia-${key}`] = textValue;
      }
    }
  }

  /* Derived tokens the stylesheet actually consumes. A merchant colour named
     `background` must reach the background, not just sit in a variable nobody
     reads — that is the difference between a working control and a dead one. */
  const colors = schema.controls.filter((c) => c.format === 'color');
  const background = colors.find((c) => /background|bg/i.test(c.key));
  /* `background_color` also ends in `color`, so a loose /color$/ match makes
     the heading the SAME colour as its own background — invisible. Prefer the
     field whose whole job is the ink. */
  const ink =
    colors.find((c) => /^(text_color|text_colour|ink|color)$/i.test(c.key)) ??
    colors.find((c) => /text_color|text_colour/i.test(c.key));
  const accent =
    colors.find((c) => /accent|highlight|brand/i.test(c.key)) ??
    /* A `button_*` colour describes the call to action, not the block. Letting
       it become the accent painted the featured-products eyebrow with the
       button's label colour — and, with a white label, made the button a white
       pill with white text. The CTA reads its own two colours instead. */
    colors.find((c) => !/background|bg|text|ink/i.test(c.key) && !/^button/i.test(c.key));
  /* ── the store-wide settings reach these blocks by NOT being copied ──────
     `selia-base.scss` already declares the chain on `.selia`:

       --selia-bg     → transparent          (the section shows the page through it)
       --selia-accent → --gs-accent → --color-primary → Selia's default

     An inline value on that same `<section>` out-ranks the stylesheet rule, so
     publishing a fallback here does not "provide a default" — it REPLACES the
     merchant's global setting with a literal. That is how a store that picked
     an accent colour saw no change, and how an empty background field painted
     a cream band across a night page. So: publish only what the merchant
     actually chose; when the field is empty, publish nothing and let the
     stylesheet resolve the inheritance. */
  if (background) {
    const bg = asText(v[background.key]).trim();
    if (bg) vars['--selia-bg'] = bg;
  }
  if (ink) {
    const inkValue = asText(v[ink.key]).trim();
    if (inkValue) vars['--selia-ink'] = inkValue;
  }
  /* The focus ring needs `--selia-accent` to EXIST, not to be published here:
     `.selia` always declares it, so an empty field still resolves to the store
     colour. Publishing a literal was what stopped `global_accent_color` from
     reaching any of the 26 blocks that render through this function.

     Why the comparison and not just "is it empty": every colour field carries a
     hex default (`tests/settings/color-fields.test.ts` requires one so the
     picker can open on it), so a colour control is NEVER empty — `normalize()`
     fills the manifest default. An untouched field therefore arrives with a
     value, and publishing it would make the block's default beat the store
     setting. The rule is the one in `docs/GLOBAL-SETTINGS.md` §5.2: a value
     equal to the manifest default is "not a decision" and inherits; a value the
     merchant actually changed is an override and is published. */
  const accentDefault = accent ? asText(accent.value).trim().toLowerCase() : '';
  const accentValue = accent ? asText(v[accent.key]).trim() : '';
  if (accentValue && accentValue.toLowerCase() !== accentDefault) vars['--selia-accent'] = accentValue;

  /* Only numeric / dropdown columns can be a column count. A bare /count/
     match also swallows `hide_countdown` (a switch), which used to publish
     `--selia-cols:false` and break the grid. */
  const cols = schema.controls.find(
    (c) =>
      (NUMERIC_FORMATS.has(c.format) || c.format === 'dropdown-list') &&
      /(^|_)(cols|columns|limit|count)$/i.test(c.key)
  );
  if (cols) {
    const raw = NUMERIC_FORMATS.has(cols.format) ? v[cols.key] : asText(v[cols.key]);
    const value = asNumber(raw, 4);
    vars['--selia-cols'] = String(value > 0 ? value : 4);
  }

  /* `rounded` is three-state, not two: **on** = follow the store's radius,
     **off** = a real 0px override, **absent** = follow the store's radius.
     Publishing `18px` for "on" made this switch out-rank `global_radius` on
     the very element that declares it, so nine blocks ignored the merchant's
     choice. Only the explicit off is a value now. */
  const rounded = v.rounded;
  const roundedSet = rounded !== undefined && rounded !== null && rounded !== '';
  if ('rounded' in v && roundedSet && !isOn(rounded)) vars['--selia-radius'] = '0px';
  return { style, flags };
}

/* -------------------------------------------------------------------------- *
 * The renderer
 * -------------------------------------------------------------------------- */

export function SeliaAuto({
  schema,
  values,
  rows,
}: {
  schema: SeliaSchema;
  values: SeliaValues;
  rows: SeliaRows;
}) {
  const { isLTR, t } = useTranslation();
  const v = useMemo(() => normalizedControls(schema, values), [schema, values]);
  const r = useMemo(() => normalizedRows(schema, rows), [schema, rows]);
  const views = useMemo(() => r.map((row) => describeRow(schema, row)), [schema, r]);
  const { style, flags } = useMemo(() => styleFromControls(schema, v), [schema, v]);

  const title = textOf(v, 'title', 'heading');
  const subtitle = textOf(v, 'subtitle');
  const description = textOf(v, 'description');
  const customClass = asText(v.custom_css).replace(/[^A-Za-z0-9_\- ]/g, '').trim();
  const display = visibilityOf(v.display);
  /* The brand wall clips its own rows inside the container: the reference is a
     1440px band whose mask fades at the container edge, and a wall that bleeds
     to the screen edge loses exactly that framing. */
  const bleed = isOn(v.full_width) || ['slider', 'dynamic-banner', 'promo'].includes(schema.kind);
  const classes = [customClass, isOn(v.top_space) ? 'selia--top-space' : ''].filter(Boolean).join(' ');

  /* `background` on the brand wall is the colour of the TILE each logo sits
     on, not of the section — a grey section behind grey tiles is not the
     design, and the merchant's label says «لون خلفية الشعارات». */
  const sectionStyle: CSSProperties =
    schema.kind === 'marquee'
      ? ({
          ...style,
          '--bw-tile-bg': asText(v.background) || '#eeeeee',
          '--selia-bg': 'transparent',
        } as CSSProperties)
      : style;

  /* ------------------------------------------------------------------ *
   * Bodies that come from TOP-LEVEL fields (no repeater).
   * ------------------------------------------------------------------ */
  let body: ReactNode = null;
  const kind = schema.kind;
  /* Product Videos' stylesheet branches on the merchant's dropdown values
     (`data-layout`, `data-ratio`). Switches already reach the wrapper through
     `flags`; dropdowns do not, so this block publishes the two it reads —
     without changing every other block. */
  const sectionFlags =
    kind === 'product-videos'
      ? {
          ...flags,
          layout: asText(v.layout) || 'slider',
          ratio: asText(v.ratio) || '9-16',
        }
      : flags;

  switch (kind) {
    case 'about': {
      const media = asText(v.video);
      const image = asText(v.image);
      body = (
        <div className="selia-about">
          <div className="selia-about__media">
            {isOn(v.show_video) && media ? (
              <SeliaVideo src={media} poster={image} />
            ) : (
              <SeliaMedia src={image} alt={title} />
            )}
          </div>
          <div className="selia-about__copy">
            {subtitle ? <p className="selia-about__eyebrow">{subtitle}</p> : null}
            {description ? <p className="selia-about__body">{description}</p> : null}
            <SeliaCta label={textOf(v, 'button_label')} href={safeHref(v.button_link)} />
          </div>
        </div>
      );
      break;
    }

    case 'compare': {
      body = (
        <SeliaBeforeAfter
          before={asText(v.before)}
          after={asText(v.after)}
          beforeLabel={textOf(v, 'before_label')}
          afterLabel={textOf(v, 'after_label')}
          vertical={isOn(v.vertical)}
          color={asText(v.divider_color)}
        />
      );
      break;
    }

    case 'dynamic-banner': {
      /* Selia ships three artwork sets: Arabic light, English light and dark.
         Locale is read from the i18n context, never from the DOM, so the
         server HTML and the client's first render agree. */
      const dark = isOn(v.dark_banners);
      const desktop = dark
        ? asText(v.dark_desktop)
        : isLTR
          ? asText(v.en_desktop) || asText(v.ar_desktop)
          : asText(v.ar_desktop);
      const mobile = dark
        ? asText(v.dark_mobile)
        : isLTR
          ? asText(v.en_mobile) || asText(v.ar_mobile)
          : asText(v.ar_mobile);
      body = (
        <SeliaTileLink href={safeHref(v.link)} className="selia-dynbnr__link" label={title}>
          <SeliaMedia src={desktop} mobile={mobile} alt={title} className="selia-dynbnr__media" />
        </SeliaTileLink>
      );
      break;
    }

    case 'featured-products': {
      const ids = idsFromPicker(v.products);
      const type = isOn(v.use_source) ? 'selected' : 'latest';
      body = (
        <div className="selia-featured-products">
          {asText(v.background_image) ? (
            <SeliaMedia src={asText(v.background_image)} alt="" className="selia-featured-products__bg" />
          ) : null}
          <div className="selia-featured-products__copy">
            {textOf(v, 'extra') ? <p className="selia-featured-products__eyebrow">{textOf(v, 'extra')}</p> : null}
            {subtitle ? <p className="selia-featured-products__sub">{subtitle}</p> : null}
            {/* `button_background` / `button_color` are this block's own two
                colours; without them the CTA fell back to the accent and the
                merchant's picks sat unread in `--selia-button_*`. */}
            <SeliaCta
              label={textOf(v, 'button_label')}
              href={safeHref(v.button_link)}
              bg={asText(v.button_background)}
              ink={asText(v.button_color)}
            />
          </div>
          <Products type={type} ids={ids} limit={4} />
        </div>
      );
      break;
    }

    case 'counter':
    case 'promo': {
      const end = textOf(v, 'end_at');
      const hide = isOn(v.hide_countdown);
      body = (
        <div className={`selia-promo selia-promo--${kind}`}>
          {asText(v.background_image) ? (
            <SeliaMedia src={asText(v.background_image)} alt="" className="selia-promo__bg" />
          ) : null}
          <div className="selia-promo__copy">
            {subtitle ? <p className="selia-promo__sub">{subtitle}</p> : null}
            {description ? <p className="selia-promo__body">{description}</p> : null}
            {!hide && end ? <SeliaCountdown until={end} /> : null}
            <SeliaCta label={textOf(v, 'button_label')} href={safeHref(v.link || v.button_link)} />
          </div>
        </div>
      );
      break;
    }

    case 'featured-product': {
      const ids = idsFromPicker(v.product);
      body = (
        <div className="selia-featured-product">
          {!isOn(v.hide_countdown) ? <SeliaCountdown until={textOf(v, 'end_at')} /> : null}
          <Products type="selected" ids={ids} limit={1} />
        </div>
      );
      break;
    }

    case 'content': {
      const useVideo = asText(v.media_type) === 'video' || /video/i.test(asText(v.media_type));
      body = (
        <div className={`selia-content ${isOn(v.as_banner) ? 'selia-content--banner' : ''}`}>
          {isOn(v.show_media) ? (
            <div className="selia-content__media">
              {useVideo && asText(v.video) ? (
                <SeliaVideo src={asText(v.video)} poster={asText(v.image)} />
              ) : (
                <SeliaMedia src={asText(v.image)} alt={title} />
              )}
            </div>
          ) : null}
          <div className="selia-content__copy">
            {description ? <p className="selia-content__body">{description}</p> : null}
            {isOn(v.show_countdown) && textOf(v, 'end_at') ? <SeliaCountdown until={textOf(v, 'end_at')} /> : null}
            <SeliaCta label={textOf(v, 'button_label')} href={safeHref(v.button_url || v.button_link)} />
            {views.length ? <Cards views={views} kind="feature" /> : null}
          </div>
        </div>
      );
      break;
    }

    /* ---------------------------------------------------------------- *
     * Bodies built from repeater rows.
     * ---------------------------------------------------------------- */
    case 'slider': {
      /* Two blocks share this kind but not the same widget. Animated Banners
         is a peek-scroller of artwork strips; the Advanced Slider promises a
         fade, a speed, dots and a button per slide. Branching on the path
         keeps the banners byte-identical while the slider gets the thing its
         own fields describe. */
      if (schema.path === 'selia-advanced-slider') {
        const heroSlides: HeroSlide[] = views.map((view) => ({
          image: firstImage(view),
          mobile: view.images.find((item) => /mobile/i.test(item.key))?.value,
          title: rowTitle(view),
          description: rowDescription(view),
          href: firstLink(view),
          ctaLabel: findText(view, /button_label|button|cta/i, /background|color|link/),
          ctaBg: view.colors.find((item) => /background/i.test(item.key))?.value,
          ctaInk: view.colors.find((item) => /color/i.test(item.key) && !/background/i.test(item.key))?.value,
          video: view.videos[0]?.value,
          position: asText(view.values.text_position),
          fit: asText(view.values.fit),
        }));
        body = (
          <SeliaHeroSlider
            slides={heroSlides}
            arrows={isOn(v.arrows)}
            dots={isOn(v.dots)}
            autoplay={asNumber(v.duration, 0) > 0}
            interval={asNumber(v.duration, 5)}
            speed={asNumber(v.speed, 2)}
            effect={asText(v.effect)}
            kenBurns={isOn(v.image_animation)}
            showVideo={isOn(v.show_video)}
            label={title || 'الشرائح'}
          />
        );
        break;
      }
      /* Animated Banners ships a separate English/Dark artwork set. Choosing
         it from the i18n context (not the DOM) keeps SSR and CSR identical. */
      const english = isOn(v.different_en) && isLTR;
      const desktopKey = english ? /desktop_en/i : /desktop/i;
      const mobileKey = english ? /mobile_en/i : /mobile/i;
      const artwork = (view: RowView, pattern: RegExp) =>
        view.images.find((item) => pattern.test(item.key))?.value ?? firstImage(view);
      const tiles: SeliaTile[] = views.map((view) => ({
        image: artwork(view, desktopKey),
        mobile: artwork(view, mobileKey),
        title: rowTitle(view),
        subtitle: rowDescription(view),
        href: firstLink(view),
      }));
      body = (
        <SeliaScroller
          className="selia-scroller--hero"
          arrows={isOn(v.arrows)}
          autoplay={isOn(v.autoplay) || asNumber(v.duration, 0) > 0}
          interval={asNumber(v.duration, 5)}
          label={title || 'الشرائح'}
        >
          {tiles.map((tile, index) => (
            <div className="selia-slide" data-slide key={index}>
              <SeliaTileLink href={tile.href} className="selia-slide__link" label={tile.title}>
                <SeliaMedia src={tile.image} mobile={tile.mobile} alt={tile.title || ''} className="selia-slide__media" />
                <div className="selia-slide__copy">
                  {tile.title ? <h3>{tile.title}</h3> : null}
                  {tile.subtitle ? <p>{tile.subtitle}</p> : null}
                </div>
              </SeliaTileLink>
            </div>
          ))}
        </SeliaScroller>
      );
      break;
    }

    case 'banners': {
      const tiles: SeliaTile[] = views.map((view, index) => {
        /* `image_en` is a localised twin, not a second banner. */
        const english = isLTR && view.images.length > 1 && /_en$|en_/i.test(view.images[1].key);
        return {
          image: english ? view.images[1].value : firstImage(view),
          title: rowTitle(view),
          subtitle: rowDescription(view),
          href: firstLink(view),
          badge: index === 0 ? findText(view, /badge|subtitle/i) : '',
        };
      });
      body = <SeliaTiles tiles={tiles} variant={`banners-${Math.min(Math.max(tiles.length, 1), 3)}`} />;
      break;
    }

    case 'tiles':
      body = (
        <SeliaTiles
          tiles={views.map((view) => ({
            image: firstImage(view),
            mobile: secondImage(view),
            title: rowTitle(view),
            subtitle: rowDescription(view),
            href: firstLink(view),
            /* The merchant's per-row colour reaches the tile as `--card-accent`,
               the same property the card families already publish. Without it a
               tiles block cannot colour-code its items at all — the field was
               in the manifest but nothing read it. */
            ...(view.colors[0]?.value
              ? { style: { '--card-accent': view.colors[0].value } as CSSProperties }
              : {}),
          }))}
          variant={kind}
          showCaption={isOn(v.show_titles) || !('show_titles' in v)}
        />
      );
      break;

    case 'marquee':
      body = (
        <BrandsMarquee
          items={views.map((view) => ({
            image: firstImage(view),
            href: firstLink(view),
            title: rowTitle(view),
          }))}
          twoRows={isOn(v.two_rows)}
        />
      );
      break;

    case 'videos':
      body = (
        <Cards views={views} kind="video" showVideo className={asText(v.layout) || 'grid'} />
      );
      break;

    case 'product-videos': {
      /* One row = one product + that product's video. The card itself (name,
         price, add-to-cart) comes from the catalogue, so prices and stock stay
         live; the row only supplies the video. */
      body = (
        <SeliaProductVideoGrid
          /* The reference paints the title and the arrows on ONE row, so this
             block owns its head row instead of the shared centred one. */
          title={title}
          subtitle={subtitle}
          layout={asText(v.layout) || 'slider'}
          entries={views.map((view) => {
            const ids = idsFromPicker(view.values.product);
            return {
              productId: String(ids[0] ?? ''),
              video: view.videos[0]?.value ?? '',
            };
          })}
          autoplay={isOn(v.autoplay)}
          showProduct={isOn(v.show_product)}
        />
      );
      if (isOn(v.show_all)) {
        body = (
          <>
            {body}
            <a className="selia-vproducts__all" href="/products">
              {t('blocks.home.show_all', 'عرض الكل')}
            </a>
          </>
        );
      }
      break;
    }

    case 'faq':
      body = (
        <SeliaAccordion
          items={views.map((view) => ({
            question: findText(view, /question/i) || rowTitle(view),
            answer: rowDescription(view),
            buttonLabel: findText(view, /button_label/i),
            href: firstLink(view),
          }))}
        />
      );
      break;

    case 'testimonials':
      body = <Cards views={views} kind="review" />;
      break;

    case 'features':
      body = <Cards views={views} kind="feature" />;
      break;

    case 'gallery-hotspots': {
      body = (
        <div className="selia-hotspots">
          {views.map((view, index) => {
            const href = firstLink(view);
            const ids = idsFromPicker(view.values.product);
            return (
              <div
                className="selia-hotspots__item"
                key={index}
                style={view.style}
                {...view.data}
              >
                <SeliaMedia src={firstImage(view)} alt={findText(view, /caption/i)} className="selia-hotspots__media" />
                {findText(view, /caption/i) ? (
                  <span className="selia-hotspots__caption">{findText(view, /caption/i)}</span>
                ) : null}
                {ids.length ? (
                  <a className="selia-hotspots__dot" href={href || '#'} aria-label={findText(view, /caption/i)}>
                    <i className="sicon-plus" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      );
      break;
    }

    case 'detailed-products': {
      const ids = views.flatMap((view) => idsFromPicker(view.values.product));
      body = (
        <div className="selia-detailed">
          <Products type="selected" ids={ids} limit={Math.max(ids.length, 1)} />
          <ul className="selia-detailed__ticker">
            {views.map((view, index) => {
              const label = findText(view, /ticker_text/i);
              return label ? (
                <li key={index} style={view.style} {...view.data}>
                  {findText(view, /ticker_icon/i) ? (
                    <i className={`sicon-${findText(view, /ticker_icon/i)}`} aria-hidden="true" />
                  ) : null}
                  {label}
                </li>
              ) : null;
            })}
          </ul>
        </div>
      );
      break;
    }

    case 'product-tabs': {
      body = (
        <SeliaTabs
          style={textOf(v, 'tab_style') || 'pills'}
          tabs={views.map((view) => ({
            label: findText(view, /label/i) || rowTitle(view),
            content: (
              <Products
                type={asText(view.values.type) || 'latest'}
                ids={[]}
                limit={asNumber(view.values.limit, 4)}
              />
            ),
          }))}
        />
      );
      break;
    }

    default:
      body = <Cards views={views} kind={kind} />;
  }

  return (
    <SeliaSection
      /* product-videos renders its own head row (see the grid above). */
      title={kind === 'product-videos' ? undefined : title}
      subtitle={kind === 'product-videos' ? undefined : subtitle}
      variant={schema.path.replace(/^selia-/, '')}
      align={['about', 'content', 'promo', 'featured-products'].includes(kind) ? 'start' : 'center'}
      bleed={bleed}
      display={display}
      className={classes}
      style={sectionStyle}
      flags={sectionFlags}
    >
      {body}
    </SeliaSection>
  );
}
