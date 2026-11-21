import { describe, it, expect } from 'vitest';
import { menuNodeImage } from '../../app/lib/menuNodeImage';

describe('menuNodeImage', () => {
  it('reads the plain string image the category tree sends', () => {
    expect(menuNodeImage({ image: 'https://cdn.salla.sa/c/c1.jpg' })).toBe('https://cdn.salla.sa/c/c1.jpg');
  });

  it('reads a picker-shaped image before falling back to other fields', () => {
    expect(menuNodeImage({ image: { url: 'chairs.png' }, thumbnail: 'thumb.png' })).toBe('chairs.png');
  });

  it('falls back to thumbnail / media.image / images[0] in order', () => {
    expect(menuNodeImage({ thumbnail: 't.png', media: { image: 'm.png' } })).toBe('t.png');
    expect(menuNodeImage({ media: { image: 'm.png' } })).toBe('m.png');
    expect(menuNodeImage({ images: [{ url: 'i.png' }] })).toBe('i.png');
  });

  it('finds a deeply nested image when no named field carries one', () => {
    expect(menuNodeImage({ extra_image: { url: 'deep.png' } })).toBe('deep.png');
  });

  it('returns an empty string for a row without any picture', () => {
    expect(menuNodeImage({ id: 1, title: 'A', url: '/ar/a' })).toBe('');
    expect(menuNodeImage(null)).toBe('');
  });
});
