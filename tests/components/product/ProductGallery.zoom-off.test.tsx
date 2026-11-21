import { useEffect, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductGallery } from '../../../app/components/product/ProductGallery';

/**
 * `imageZoom` used to be a control that did nothing: the field shipped `false`
 * while the lightbox was wired unconditionally, and its own description
 * admitted as much.
 *
 * This file covers the OFF half, and it is a separate file on purpose: the
 * assertion that matters most is "the library is never imported", which can
 * only be made in a module registry where nothing else has imported it yet.
 * The ON half lives in `ProductGallery.zoom-on.test.tsx`.
 */
const settings = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: settings.value } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

vi.mock('@salla.sa/twilight-components-react/slider', () => ({
  SallaSlider: ({ children, onAfterInit }: { children?: ReactNode; onAfterInit?: () => void }) => {
    useEffect(() => onAfterInit?.(), [onAfterInit]);
    return <div>{children}</div>;
  },
}));

vi.mock('@salla.sa/twilight-components-react/social-share', () => ({
  SallaSocialShare: () => null,
}));

const product = {
  id: 7001,
  name: 'Course',
  images: [
    { id: 1, url: 'https://cdn.test/a.webp', video_url: null, video_type: null, type: 'image' },
    { id: 2, url: 'https://cdn.test/b.webp', video_url: null, video_type: null, type: 'image' },
  ],
} as unknown as Product;

beforeEach(() => {
  settings.value = { imageZoom: false };
  (window as unknown as { salla: unknown }).salla = {
    event: { on: vi.fn(), off: vi.fn(), dispatch: vi.fn() },
    storage: { get: vi.fn(() => []) },
    wishlist: { event: { onAdded: vi.fn(), onRemoved: vi.fn() } },
  };
});

describe('imageZoom off', () => {
  it('renders no lightbox link at all, rather than a link that does nothing', () => {
    const { container } = render(<ProductGallery product={product} />);

    expect(container.querySelectorAll('a[data-fslightbox]')).toHaveLength(0);
    // and no focusable dead control left behind
    expect(container.querySelectorAll('a[href="https://cdn.test/a.webp"]')).toHaveLength(0);
    // the images themselves still render
    expect(container.querySelectorAll('img').length).toBeGreaterThanOrEqual(2);
  });

  it('never imports the lightbox library', async () => {
    render(<ProductGallery product={product} />);

    // the slides are laid out (the effect that would import it has run), yet
    // nothing installed the library — ~20KB a store that turned zoom off
    // should never download
    await waitFor(() => expect(document.querySelector('.product-gallery__poster')).toBeNull());
    expect(window.refreshFsLightbox).toBeUndefined();
  });

  it('still opens the native app gallery, which is a different surface', () => {
    const openGallery = vi.fn(() => true);
    const sdk = (window as unknown as { salla: Record<string, unknown> }).salla;
    sdk.mobile = { isEnabled: () => true, openBrowser: vi.fn(), openGallery };

    const { container } = render(<ProductGallery product={product} />);
    const slide = container.querySelector<HTMLElement>('[data-img-id="2"]');
    expect(slide).toBeTruthy();

    expect(fireEvent.click(slide!)).toBe(false);
    expect(openGallery).toHaveBeenLastCalledWith(product.images, product.images[1]);
  });
});
