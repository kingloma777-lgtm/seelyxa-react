import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { SecondSkin } from '../../../app/components/home/SecondSkin';

/* The block is a WebGL effect wrapped in plain content. These tests pin the
   parts that must survive a device without a GPU: the words are all there, the
   timeline is expressed in variables rather than tweens, and the fallback class
   arrives instead of an empty canvas. */

const base = {
  image: '/wall.jpg',
  eyebrow: 'Calx',
  title: 'Second Skin',
  subtitle: 'Hand-troweled lime',
  body: 'one two three four',
  mark: '✳',
};

describe('SecondSkin', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the header copy', () => {
    const { container } = render(<SecondSkin data={base} />);
    expect(container.querySelector('.second-skin__title')?.textContent).toBe('Second Skin');
    expect(container.querySelector('.second-skin__eyebrow')?.textContent).toBe('Calx');
    expect(container.querySelector('.second-skin__subtitle')?.textContent).toBe(
      'Hand-troweled lime'
    );
    expect(container.querySelector('.second-skin__wall img')?.getAttribute('src')).toBe(
      '/wall.jpg'
    );
  });

  it('splits the paragraph into words that each own a slice of the timeline', () => {
    const { container } = render(<SecondSkin data={base} />);
    const words = [...container.querySelectorAll<HTMLElement>('.second-skin__word')];

    expect(words.map((word) => word.textContent)).toEqual(['one', 'two', 'three', 'four']);
    /* the slice start is what the stylesheet's clamp() reads — four words means
       0, 0.25, 0.5, 0.75 */
    expect(words.map((word) => word.style.getPropertyValue('--ss-from'))).toEqual([
      '0',
      '0.25',
      '0.5',
      '0.75',
    ]);

    const root = container.querySelector('.second-skin') as HTMLElement;
    expect(root.style.getPropertyValue('--ss-total')).toBe('4');
  });

  it('keeps the paragraph readable when WebGL is unavailable', async () => {
    const { container } = render(<SecondSkin data={base} />);

    /* jsdom has no WebGL context, so the renderer construction throws and the
       block is expected to fall back rather than leave an empty canvas over
       unreadable text */
    await waitFor(() =>
      expect(container.querySelector('.second-skin')?.classList.contains('is-flat')).toBe(true)
    );
  });

  it('drops the studio note entirely — the block is one hero and nothing else', () => {
    const { container } = render(
      <SecondSkin
        data={{
          ...base,
          about_eyebrow: 'The studio',
          about_text: 'A small crew.',
          about_meta: 'Booking',
        }}
      />
    );
    /* the fields are gone from the manifest; old payloads that still carry them
       must not resurrect a section the merchant asked to remove */
    expect(container.querySelector('.second-skin__about')).toBeNull();
    expect(container.querySelector('.second-skin__about-text')).toBeNull();
    expect(container.querySelector('.second-skin__about-meta')).toBeNull();
  });

  it('carries the merchant colours onto the root', () => {
    const { container } = render(
      <SecondSkin data={{ ...base, fill_color: '#101010', tint_color: '#3355ff' }} />
    );
    const root = container.querySelector('.second-skin') as HTMLElement;
    expect(root.style.getPropertyValue('--ss-fill')).toBe('#101010');
    expect(root.style.getPropertyValue('--ss-tint')).toBe('#3355ff');
  });

  /* one field inks every piece of type: the eyebrow, title, subtitle, the
     closing paragraph and the mark all inherit `color` from the root, so the
     variable is the whole contract */
  it('carries the merchant text colour onto the root, prefixed or short', () => {
    const short = render(<SecondSkin data={{ ...base, text_color: '#ffcc00' }} />);
    expect(
      (short.container.querySelector('.second-skin') as HTMLElement).style.getPropertyValue(
        '--ss-text'
      )
    ).toBe('#ffcc00');

    const prefixed = render(
      <SecondSkin data={{ ...base, text_color: '#00ffcc', second_skin_text_color: '#ff00cc' }} />
    );
    expect(
      (prefixed.container.querySelector('.second-skin') as HTMLElement).style.getPropertyValue(
        '--ss-text'
      )
    ).toBe('#ff00cc');
  });

  it('falls back to the ivory text colour when the merchant picks none', () => {
    const { container } = render(<SecondSkin data={base} />);
    expect(
      (container.querySelector('.second-skin') as HTMLElement).style.getPropertyValue('--ss-text')
    ).toBe('#efece3');
  });

  it('renders nothing when it has neither a title nor an image', () => {
    const { container } = render(<SecondSkin data={{ body: 'orphan' }} />);
    expect(container.querySelector('.second-skin')).toBeNull();
  });

  /* The reported bug: a merchant replaces the portrait in the block settings
     and the hero keeps showing the seeded one. Both keys are in the payload —
     `image` from the seed, `second_skin_image` from the editor — so the real
     field id has to win. */
  it('lets the merchant image beat the seeded short key', () => {
    const { container } = render(
      <SecondSkin
        data={{ ...base, image: '/seed.jpg', second_skin_image: '/uploaded.jpg' }}
      />
    );
    expect(container.querySelector('.second-skin__wall img')?.getAttribute('src')).toBe(
      '/uploaded.jpg'
    );
  });

  it('resolves an uploaded image that arrives as an object', () => {
    const { container } = render(
      <SecondSkin
        data={{
          ...base,
          second_skin_image: { url: '/object.jpg', small_url: '/thumb.jpg', alt: 'wall' },
        }}
      />
    );
    expect(container.querySelector('.second-skin__wall img')?.getAttribute('src')).toBe(
      '/object.jpg'
    );
  });

  it('treats an empty prefixed title as cleared instead of falling back to the seed', () => {
    const { container } = render(
      <SecondSkin data={{ ...base, second_skin_title: '', second_skin_image: '/only.jpg' }} />
    );
    expect(container.querySelector('.second-skin__title')).toBeNull();
    expect(container.querySelector('.second-skin__wall img')?.getAttribute('src')).toBe(
      '/only.jpg'
    );
  });

  /* The dissolve colour is only half the control: at full opacity the fill
     paints over the photo, so there is nothing to mix WITH. `--ss-mix` is the
     merchant's strength, and the shader multiplies the fill's alpha by it. */
  it('defaults the submerge layer to a full cover', () => {
    const { container } = render(<SecondSkin data={base} />);
    const root = container.querySelector('.second-skin') as HTMLElement;
    expect(root.style.getPropertyValue('--ss-mix')).toBe('1');
  });

  it('turns the merchant mix percentage into the layer strength', () => {
    const { container } = render(<SecondSkin data={{ ...base, second_skin_mix: '70' }} />);
    const root = container.querySelector('.second-skin') as HTMLElement;
    expect(root.style.getPropertyValue('--ss-mix')).toBe('0.7');
  });

  it('clamps a mix value outside 0–100', () => {
    const high = render(<SecondSkin data={{ ...base, second_skin_mix: '150' }} />);
    expect(
      (high.container.querySelector('.second-skin') as HTMLElement).style.getPropertyValue(
        '--ss-mix'
      )
    ).toBe('1');
    high.unmount();

    const low = render(<SecondSkin data={{ ...base, second_skin_mix: '-20' }} />);
    expect(
      (low.container.querySelector('.second-skin') as HTMLElement).style.getPropertyValue(
        '--ss-mix'
      )
    ).toBe('0');
  });
});
