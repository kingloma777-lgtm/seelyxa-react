import type { CSSProperties, ReactNode } from 'react';

/**
 * The shell every ported Selia block renders inside.
 *
 * Selia's 34 blocks were written as 34 independent Twig sections, and each one
 * re-declares its own container width, its own heading margins and its own
 * colours. Porting them one-for-one would put 34 slightly different paddings
 * and 34 slightly different heading sizes on the same home page — which is
 * exactly what makes a store built out of copied sections feel assembled
 * rather than designed.
 *
 * So the shared geometry lives here, once:
 *
 *  - **one container** (`--selia-pad`, capped by `--selia-max`), so every block
 *    lines up on the same left edge no matter which one the merchant uses;
 *  - **one heading** (title + optional subtitle, centred by default) with one
 *    rhythm below it, so two adjacent blocks do not fight about the gap;
 *  - **no colours of its own.** Everything is `--ink-*` / `--surface-*` /
 *    `--line-*`, the palette `html.dark` already flips, so a block ported here
 *    is legible in night mode without a single `if dark` override. Selia's
 *    hardcoded `#004956` is a *default*, not a design: it arrives as the
 *    merchant's colour picker value and is used as an accent, never as the
 *    only colour in the block.
 *
 * `bleed` is for the blocks whose own artwork must reach the screen edge
 * (a banner, a map, a ticker). It widens the section but keeps the heading
 * inside the same container as everything else, so a full-width block still
 * starts on the grid.
 */
export interface SeliaSectionProps {
  /** Merchant's heading. Omitted → no heading row at all, not an empty one. */
  title?: string;
  subtitle?: string;
  /** `start` puts the heading on the reading edge; the Selia default is centred. */
  align?: 'center' | 'start';
  /** Background / artwork runs to the screen edge; the heading keeps the container. */
  bleed?: boolean;
  /** Block slug, turned into `selia--<variant>` for the block's own overrides. */
  variant: string;
  /** Rendered inside the container, below the heading. */
  children: ReactNode;
  /** The merchant's custom CSS class (`custom_css`), passed through as-is. */
  className?: string;
  /** `display` control: every Selia panel offers «ظهور العنصر حسب المتصفح». */
  display?: 'all' | 'desktop' | 'mobile';
  /** Merchant colours / sizes, published as `--selia-*` custom properties. */
  style?: CSSProperties;
  /** Boolean switches, published as `data-<key>` for scoped CSS. */
  flags?: Record<string, boolean | string>;
}

export function SeliaSection({
  title,
  subtitle,
  align = 'center',
  bleed = false,
  variant,
  children,
  className,
  display = 'all',
  style,
  flags,
}: SeliaSectionProps) {
  const dataProps: Record<string, string> = {};
  for (const [key, value] of Object.entries(flags ?? {})) {
    /* The stylesheet selects `[data-full_width='1']`, i.e. the field's own
       spelling. Replacing `_` with `-` here (or emitting "true" instead of
       "1") silently detaches every merchant switch from its CSS rule. */
    const name = `data-${key.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;
    dataProps[name] = value === true ? '1' : value === false ? '0' : String(value);
  }
  const classes = ['selia', `selia--${variant}`];
  if (bleed) classes.push('selia--bleed');
  if (align === 'start') classes.push('selia--start');
  if (display !== 'all') classes.push(`selia--${display}-only`);
  if (className) classes.push(className);

  return (
    <section className={classes.join(' ')} style={style} {...dataProps}>
      <div className="selia__inner">
        {(title || subtitle) && (
          <header className="selia__head">
            {title && <h2 className="selia__title">{title}</h2>}
            {subtitle && <p className="selia__subtitle">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

/**
 * The one call-to-action used across the ported blocks.
 *
 * It renders an `<a>` and not a `Link` because the merchant's URL field can
 * point anywhere — a category, a page, or an off-site link — and `Link` only
 * understands the router's own routes. `rel` is set on every external target
 * so an affiliate link in a banner cannot reach back into the store page.
 *
 * `bg` / `ink` exist for the blocks that offer the merchant a dedicated pair of
 * button colours. They are published as `--selia-cta-bg` / `--selia-cta-ink`
 * and win over the accent; a block that offers neither passes nothing and keeps
 * the accent it always had.
 */
export function SeliaCta({
  label,
  href,
  tone = 'solid',
  bg,
  ink,
}: {
  label?: string;
  href?: string;
  tone?: 'solid' | 'ghost';
  bg?: string;
  ink?: string;
}) {
  if (!label) return null;
  const external = !!href && /^https?:\/\//i.test(href);
  const style: Record<string, string> = {};
  if (bg) style['--selia-cta-bg'] = bg;
  if (ink) style['--selia-cta-ink'] = ink;
  return (
    <a
      className={`selia-cta selia-cta--${tone}`}
      href={href || '#'}
      style={bg || ink ? (style as CSSProperties) : undefined}
      {...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {label}
    </a>
  );
}
