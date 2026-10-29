import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { DissolveHero } from '../../../app/components/home/DissolveHero';
import { ArcProductGallery } from '../../../app/components/home/ArcProductGallery';
import { StampJourney } from '../../../app/components/home/StampJourney';
import { LensZoomSpotlight } from '../../../app/components/home/LensZoomSpotlight';
import { ProductModelScroll } from '../../../app/components/home/ProductModelScroll';
import { EditorialProductStory } from '../../../app/components/home/EditorialProductStory';
import { PortalWorlds } from '../../../app/components/home/PortalWorlds';
import { VideoPowerHero } from '../../../app/components/home/VideoPowerHero';
import { GestureManifesto } from '../../../app/components/home/GestureManifesto';
import { AscendWebglLanding } from '../../../app/components/home/AscendWebglLanding';
import { CompositeLanding } from '../../../app/components/home/CompositeLanding';

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_key: string, fallback?: string) => fallback ?? _key }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to: string; children?: unknown; className?: string }) => (
    <a href={to} className={className}>
      {children as never}
    </a>
  ),
}));

beforeAll(() => {
  // Keep the Three.js branches out of jsdom; every block has a CSS fallback.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

describe('reference home blocks', () => {
  it('renders DissolveHero with merchant title and statement', () => {
    const { getByText, container } = render(
      <DissolveHero data={{ dissolve_hero_title: 'A NEW SKIN' }} />
    );
    expect(getByText('A NEW SKIN')).toBeTruthy();
    expect(container.querySelector('.dissolve-hero__statement')).toBeTruthy();
  });

  it('renders ArcProductGallery and advances the active slide', () => {
    const { container, getAllByLabelText } = render(<ArcProductGallery data={{}} />);
    expect(container.querySelectorAll('.arc-gallery__slide').length).toBe(7);
    const title = container.querySelector('.arc-gallery__title-row h2')?.textContent;
    fireEvent.click(getAllByLabelText('Next')[0]);
    expect(container.querySelector('.arc-gallery__title-row h2')?.textContent).not.toBe(title);
  });

  it('renders StampJourney with the reference postmarks', () => {
    const { container } = render(<StampJourney data={{}} />);
    expect(container.querySelectorAll('.stamp-journey__stamp').length).toBe(3);
    expect(container.querySelector('.stamp-journey__trail-ink')).toBeTruthy();
  });

  it('renders LensZoomSpotlight with the merchant spotlight title and image', () => {
    const { container } = render(
      <LensZoomSpotlight data={{ lens_zoom_spotlight_title: 'LOOK INSIDE' }} />
    );
    // The doodle fixture is injected at runtime (reference behaviour); SSR
    // shows the fallback photo plate and the merchant headline.
    expect(container.querySelector('.lens-zoom__fallback')).toBeTruthy();
    expect(container.querySelector('.lens-zoom__header')?.textContent).toContain('LOOK INSIDE');
  });

  it('renders ProductModelScroll headings and CTA', () => {
    const { getByText, container } = render(
      <ProductModelScroll data={{ product_model_title_primary: 'THE OBJECT' }} />
    );
    // header-1 is split per char for the reveal; compare its joined text.
    expect(container.querySelector('#product-model-title')?.textContent?.trim()).toBe('THE OBJECT');
    expect(getByText('Discover the object')).toBeTruthy();
  });

  it('renders EditorialProductStory chapters from merchant rows', () => {
    const { container } = render(
      <EditorialProductStory
        data={{
          editorial_story_sections: [
            { 'editorial_story.title': 'First chapter', 'editorial_story.text': 'Copy' },
          ],
        }}
      />
    );
    expect(container.querySelectorAll('.editorial-story__chapter').length).toBe(1);
    expect(container.textContent).toContain('First chapter');
  });

  it('renders PortalWorlds and advances testimonial cards', () => {
    const { container, getAllByLabelText } = render(<PortalWorlds data={{}} />);
    expect(container.querySelectorAll('.portal-worlds__card').length).toBe(7);
    fireEvent.click(getAllByLabelText('Next')[0]);
    expect(container.querySelectorAll('.portal-worlds__card.is-active').length).toBe(1);
  });

  it('renders VideoPowerHero with a scrubbable video source', () => {
    const { container } = render(
      <VideoPowerHero data={{ video_hero_title: 'NEW\nFILM' }} />
    );
    expect(container.querySelector('video')?.getAttribute('src')).toBeTruthy();
    expect(container.querySelectorAll('.video-hero__line').length).toBe(2);
  });

  it('renders GestureManifesto scenes and the rotating manifesto', () => {
    const { container } = render(<GestureManifesto data={{}} />);
    expect(container.querySelectorAll('.gesture-manifesto__tiles article').length).toBe(3);
    expect(container.querySelectorAll('.gesture-manifesto__drum p').length).toBeGreaterThan(3);
  });

  it('renders AscendWebglLanding with features and stats', () => {
    const { container, getByText } = render(<AscendWebglLanding data={{}} />);
    expect(getByText('A complete visual system.')).toBeTruthy();
    expect(container.querySelectorAll('.ascend__feature-grid article').length).toBe(6);
    expect(container.querySelectorAll('.ascend__metrics div').length).toBe(4);
  });

  it('composes the four scenes and honours visibility switches', () => {
    const { container } = render(
      <CompositeLanding data={{ composite_show_gallery: false }} />
    );
    expect(container.querySelector('.dissolve-hero')).toBeTruthy();
    expect(container.querySelector('.figurines')).toBeTruthy();
    expect(container.querySelector('.stamp-journey')).toBeTruthy();
    expect(container.querySelector('.arc-gallery')).toBeNull();
  });
});
