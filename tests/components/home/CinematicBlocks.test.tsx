import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, fireEvent, cleanup } from '@testing-library/react';

import { CinematicHero } from '../../../app/components/home/CinematicHero';
import { SplitScene } from '../../../app/components/home/SplitScene';
import { Chapter } from '../../../app/components/home/Chapter';
import { LivingProductStage } from '../../../app/components/home/LivingProductStage';

/* Engine boundary mocks — same pattern as the other home-block tests. */
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({
    to,
    children,
    className,
    ...rest
  }: {
    to: string;
    children?: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  ),
  Image: ({
    src,
    alt,
    className,
    ...rest
  }: {
    src?: string | { url?: string; small_url?: string };
    alt?: string;
    className?: string;
  }) => (
    <img
      src={typeof src === 'string' ? src : src?.url}
      alt={alt ?? ''}
      className={className}
      {...rest}
    />
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (value: unknown) => `SAR ${(value ?? 0) as number}` as unknown as React.ReactNode,
  }),
}));

/* The hero's entrance path may wait for an <img> load event; jsdom never fires
   it, so stub complete images. */
beforeEach(() => {
  cleanup();
  Object.defineProperty(HTMLImageElement.prototype, 'complete', {
    configurable: true,
    get: () => true,
  });
});

describe('CinematicHero', () => {
  /* Documented guard: blocks with no content and no media render nothing,
     so an untouched editor block never leaves an empty box on the page. */
  it('renders nothing for empty editor data', () => {
    const { queryByTestId } = render(<CinematicHero data={{}} />);
    expect(queryByTestId('store-home-cinematic-hero')).toBeNull();
  });

  it('renders headline, CTAs and scroll indicator, always visible pre-JS', () => {
    const { container, getByText } = render(
      <CinematicHero
        data={
          {
            background_type: 'video',
            bg_video_url: 'https://cdn.example.com/bg.mp4',
            bg_video_poster: { url: 'poster.jpg' },
            headline: 'أهلاً بعالمك الجديد',
            subtitle: 'مقتطف السرد',
            show_ctas: true,
            primary_url: 'https://example.com/shop',
            primary_label: 'تسوق الآن',
            secondary_url: 'https://example.com/story',
            secondary_label: 'قصتنا',
            show_scroll_indicator: true,
            position: 0,
          } as never
        }
      />
    );
    expect(getByText('أهلاً بعالمك الجديد')).toBeTruthy();
    expect(getByText('مقتطف السرد')).toBeTruthy();
    const links = Array.from(container.querySelectorAll('a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://example.com/shop',
      'https://example.com/story',
    ]);
    expect(container.querySelector('.cinematic-hero__scroll')).toBeTruthy();
    expect(container.querySelector('video')).toBeTruthy();
    expect(
      container.querySelector('.hero-cinematic-js') // hidden state is client-only
    ).toBeNull();
  });
});

describe('SplitScene', () => {
  it('renders nothing for empty editor data (documented guard)', () => {
    const { queryByTestId } = render(<SplitScene data={{}} />);
    expect(queryByTestId('store-home-split-scene')).toBeNull();
  });

  it('renders image / 3d model variants and reveal classes stay off pre-JS', () => {
    const image = render(
      <SplitScene
        data={
          {
            media_type: 'image',
            media_image: { url: 'scene.jpg' },
            kicker: 'القسم الأول',
            headline: 'وجهان لقصة واحدة',
            link_label: 'اكتشف',
            link_url: 'https://example.com/a',
          } as never
        }
      />
    );
    expect(image.getByText('وجهان لقصة واحدة')).toBeTruthy();
    expect(image.container.querySelector('img[src="scene.jpg"]')).toBeTruthy();
    expect(image.container.querySelector('.split-scene--js')).toBeNull();

    const model = render(
      <SplitScene
        data={
          {
            media_type: '3d',
            model_src: 'https://modelcdn.example.com/chair.glb',
            model_poster: { url: 'chair.webp' },
          } as never
        }
      />
    );
    expect(model.container.querySelector('model-viewer')).toBeTruthy();
  });
});

describe('Chapter', () => {
  it('renders nothing for empty editor data (documented guard)', () => {
    const { queryByTestId } = render(<Chapter data={{}} />);
    expect(queryByTestId('store-home-chapter')).toBeNull();
  });

  it('renders content and default-on CTAs (twig parity)', () => {
    const { container, getByText } = render(
      <Chapter
        data={
          {
            bg_type: 'image',
            bg_image: { url: 'chapter.jpg' },
            chapter_label: 'الفصل ٢',
            headline: 'غرفة المعيشة',
            subtitle: 'أثاث يتنفس',
            primary_label: 'تابع',
            primary_url: 'https://example.com/next',
            parallax: true,
            position: 2,
          } as never
        }
      />
    );
    expect(getByText('غرفة المعيشة')).toBeTruthy();
    expect(getByText('الفصل ٢')).toBeTruthy();
    expect(container.querySelector('a[href="https://example.com/next"]')).toBeTruthy();
    expect(container.querySelector('.chapter--js')).toBeNull();
  });
});

describe('LivingProductStage', () => {
  const stageProduct = {
    id: 9,
    name: 'كرسي الأحلام',
    subtitle: 'خشب طبيعي، تصميم دافئ',
    url: 'https://example.com/p/9',
    image: { url: 'chair.png', alt: 'كرسي' },
    price: 420,
    sale_price: 420,
    is_on_sale: true,
    regular_price: 520,
  };

  it('renders the builder empty state with placeholder copy', () => {
    const { container, getByTestId, getByText } = render(
      <LivingProductStage data={{}} />
    );
    expect(getByTestId('store-home-living-product')).toBeTruthy();
    // t() mock resolves the Arabic fallback, matching the shipped locale keys.
    expect(getByText('اختر منتجاً من إعدادات "مرحلة المنتج الحية" ليبدأ المشهد.')).toBeTruthy();
    expect(container.querySelector('[data-lp-product]')).toBeNull();
  });

  it('renders the full stage: product frame, prices, add-to-cart element', () => {
    const { container, getByText, getByTestId, getAllByText } = render(
      <LivingProductStage
        data={
          {
            single_product: stageProduct,
            kicker: 'إطلاق',
            position: 3,
          } as never
        }
      />
    );
    expect(getByTestId('store-home-living-product')).toBeTruthy();
    expect(container.querySelector('img[src="chair.png"]')).toBeTruthy();
    // Name appears at least twice: hotspot popup + commercial panel.
    expect(getAllByText('كرسي الأحلام').length).toBeGreaterThanOrEqual(2);
    expect(getByText('SAR 420')).toBeTruthy();
    expect(getByText('SAR 520')).toBeTruthy(); // old price
    const addBtn = container.querySelector('salla-add-product-button');
    expect(addBtn).toBeTruthy();
    expect(addBtn?.getAttribute('product-id')).toBe('9');
  });

  it('hotspot popup opens on click and closes on outside click', () => {
    const { container, getByTestId } = render(
      <LivingProductStage data={{ single_product: stageProduct, position: 3 } as never} />
    );
    const root = getByTestId('store-home-living-product');
    const hotspot = root.querySelector('[data-lp-hotspot]') as HTMLElement;
    expect(root.classList.contains('living-product--popup-open')).toBe(false);
    act(() => {
      fireEvent.click(hotspot);
    });
    expect(root.classList.contains('living-product--popup-open')).toBe(true);
    act(() => {
      fireEvent.click(container.querySelector('[data-lp-inner]') as HTMLElement);
    });
    expect(root.classList.contains('living-product--popup-open')).toBe(false);
  });
});
