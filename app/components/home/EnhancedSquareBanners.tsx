import { memo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

interface BannerItem {
  image?: string;
  url?: string;
  title?: string;
  description?: string;
}

export interface EnhancedSquareBannersProps {
  data: {
    banners: BannerItem[];
    position?: number;
    [key: string]: unknown;
  };
}

/**
 * `squar_photo_bg_image_size` — a setting for THIS block.
 *
 * `home.enhanced-square-banners` is a Salla block, so the theme cannot declare
 * a field on it; the merchant's value therefore still arrives through the
 * theme settings. The read order is what makes the setting movable: the block
 * looks at its own data first (the moment a field exists — a platform update
 * or a future theme-owned block — it wins with no code change here), then the
 * saved theme value, then the block's designed default.
 */
function readImageFit(data: Record<string, unknown>, saved: unknown): 'cover' | 'contain' {
  const own = data.background_size ?? data.image_size ?? data.squar_photo_bg_image_size;
  const value = typeof own === 'string' ? own : typeof saved === 'string' ? saved : '';
  return value === 'cover' ? 'cover' : 'contain';
}

function MosaicBanner({
  banner,
  index,
  ctaLabel,
}: {
  banner: BannerItem;
  index: number;
  ctaLabel: string;
}) {
  return (
    <Link
      to={banner.url || '#'}
      aria-label={banner.title ? banner.title : `square-banner-${index}`}
      className="enhanced-square-banner bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${banner.image})` }}
    >
      <span className="enhanced-square-banner__content">
        {banner.title && <h2 className="enhanced-square-banner__title">{banner.title}</h2>}
        {banner.description && (
          <p className="enhanced-square-banner__description">{banner.description}</p>
        )}
        {banner.url && <span className="enhanced-square-banner__cta">{ctaLabel}</span>}
      </span>
    </Link>
  );
}

export const EnhancedSquareBanners = memo(function EnhancedSquareBanners({
  data,
}: EnhancedSquareBannersProps) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const { banners } = data;
  /* The block publishes the fit on its OWN root. It used to arrive as
     `data-sq-fit` on `.app-inner`, which meant every page in the store carried
     an attribute that only this block reads. */
  const fit = readImageFit(
    data as Record<string, unknown>,
    (theme?.settings as Record<string, unknown> | undefined)?.squar_photo_bg_image_size
  );

  if (!banners.length) return null;

  // 5 banners: hero mosaic — two stacked banners on each side, one tall
  // banner spanning both rows in the center. Fewer banners keep the plain grid.
  if (banners.length === 5) {
    const ctaLabel = t('blocks.home.discover_now', 'Discover now');
    return (
      <div className="enhanced-square-banners-mosaic" data-sq-fit={fit}>
        {banners.map((banner, index) => (
          // A static settings list whose items have no id: see
          // .react-doctor/false-positives.md.
          // react-doctor-disable-next-line react-doctor/no-array-index-as-key
          <MosaicBanner key={index} banner={banner} index={index} ctaLabel={ctaLabel} />
        ))}
      </div>
    );
  }

  const gridCols =
    banners.length <= 3 ? `md:grid-cols-${banners.length}` : 'md:grid-cols-3 two-row';
  const hasTwoRows = banners.length > 3;

  return (
    <div className={`grid ${gridCols} grid-flow-row gap-3 sm:gap-8`} data-sq-fit={fit}>
      {banners.map((banner, index) => (
        <Link
          key={index}
          to={banner.url || '#'}
          aria-label={banner.title ? banner.title : `square-banner-${index}`}
          className={`banner-entry bg-no-repeat bg-cover bg-center ${banner.title ? 'has-overlay' : ''} ${hasTwoRows ? 'h-banner' : 'h-lg-banner'}`}
          style={{ backgroundImage: `url(${banner.image})` }}
        >
          <article className="banner-entry__text text-with-border">
            <h2 className="banner__title font-bold mb-1 leading-6">{banner.title}</h2>
            <p className="banner__description">{banner.description}</p>
          </article>
        </Link>
      ))}
    </div>
  );
});
