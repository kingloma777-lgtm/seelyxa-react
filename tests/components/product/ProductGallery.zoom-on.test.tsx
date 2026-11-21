import { useEffect, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductGallery } from '../../../app/components/product/ProductGallery';

/**
 * The ON half of `imageZoom` — the behaviour every store already had, and must
 * keep. The OFF half (and the proof that the library is not downloaded at all)
 * lives in `ProductGallery.zoom-off.test.tsx`.
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
  id: 7002,
  name: 'Course',
  images: [
    { id: 1, url: 'https://cdn.test/a.webp', video_url: null, video_type: null, type: 'image' },
    { id: 2, url: 'https://cdn.test/b.webp', video_url: null, video_type: null, type: 'image' },
  ],
} as unknown as Product;

const lightboxSlides = (container: HTMLElement) => [
  ...container.querySelectorAll('a[data-fslightbox]'),
];

beforeEach(() => {
  settings.value = {};
  (window as unknown as { salla: unknown }).salla = {
    event: { on: vi.fn(), off: vi.fn(), dispatch: vi.fn() },
    storage: { get: vi.fn(() => []) },
    wishlist: { event: { onAdded: vi.fn(), onRemoved: vi.fn() } },
  };
});

describe('imageZoom on', () => {
  it('treats a missing setting as ON, so no existing store loses zoom', () => {
    // the field shipped `false` while doing nothing, so every stored `false` is
    // the manifest default and not a decision
    const { container } = render(<ProductGallery product={product} />);
    expect(lightboxSlides(container)).toHaveLength(2);
  });

  it('keeps the lightbox when the merchant explicitly turns it on', () => {
    settings.value = { imageZoom: true };
    const { container } = render(<ProductGallery product={product} />);
    expect(lightboxSlides(container)).toHaveLength(2);
  });

  it('loads the library and opens the overlay on a click', async () => {
    const { container } = render(<ProductGallery product={product} />);
    await waitFor(() => expect(window.refreshFsLightbox).toBeTypeOf('function'));

    fireEvent.click(lightboxSlides(container)[1]);
    await waitFor(() => expect(document.querySelector('.fslightbox-container')).toBeTruthy());
  });
});
