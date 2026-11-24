import { resolveMorphIcon } from '../../lib/morphIcons';

/**
 * One icon slot: the merchant's picker value first, the design glyph second.
 *
 * Shared by the pill, the phone index and the search field, so an icon choice
 * made once reaches every copy of that control (the index carries the same
 * close/theme glyphs the pill does).
 */
export function MorphIco({
  setting,
  legacy,
  className,
  ariaLabel,
}: {
  setting: unknown;
  legacy: string;
  className?: string;
  ariaLabel?: string | null;
}) {
  const { sicon, glyph } = resolveMorphIcon(setting, legacy);
  if (sicon) {
    return (
      <i
        className={`morph-ico is-sicon sicon-${sicon}${className ? ` ${className}` : ''}`}
        aria-hidden={!ariaLabel}
        aria-label={ariaLabel ?? undefined}
      />
    );
  }
  return (
    <span
      className={`morph-ico${className ? ` ${className}` : ''}`}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 24 24" width="${glyph.size}" height="${glyph.size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${glyph.body}</svg>`,
      }}
    />
  );
}

/* Both theme glyphs are always in the markup and `html.dark` picks which one
   paints (see morph-header.scss) — one token, no JS icon state to go stale.
   Shared by the pill's toggle and the phone index's own button, which is the
   only copy a phone sees (the pill's is `display: none` there: the row has no
   width to spare, measured live). */
export function ThemeGlyphs() {
  return (
    <>
      <span className="morph-ico morph-theme-btn__glyph morph-theme-btn__moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      </span>
      <span className="morph-ico morph-theme-btn__glyph morph-theme-btn__sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </span>
    </>
  );
}
