import { describe, it, expect } from 'vitest';
import { readBoolean, readNumber, readText, readValue } from '../../app/lib/homeBlock';

/* The one rule that matters here: the PREFIXED key is the real field id, so it
   wins over the short alias. Reading the alias first is what made every edit in
   the merchant's settings silently shadowed by the seed data — "I changed the
   image and nothing happened". */

describe('readValue', () => {
  it('prefers the prefixed field id over the short alias', () => {
    expect(readValue({ image: '/seed.jpg', second_skin_image: '/mine.jpg' }, 'image', 'second_skin')).toBe(
      '/mine.jpg'
    );
  });

  it('accepts the dotted form the collection payloads use', () => {
    expect(
      readValue({ 'stamp_story.travel': 'long', travel: 'short' }, 'travel', 'stamp_story')
    ).toBe('long');
  });

  it('falls back to the short alias when only that exists', () => {
    expect(readValue({ travel: 'short' }, 'travel', 'stamp_story')).toBe('short');
  });

  it('treats an empty prefixed value as cleared, not as missing', () => {
    expect(readValue({ title: 'Seed', second_skin_title: '' }, 'title', 'second_skin')).toBe('');
    expect(readText({ title: 'Seed', second_skin_title: '' }, 'title', 'second_skin', '')).toBe('');
  });

  it('ignores a null prefixed value and keeps looking', () => {
    expect(readValue({ second_skin_title: null, title: 'Seed' }, 'title', 'second_skin')).toBe(
      'Seed'
    );
  });

  it('survives missing data', () => {
    expect(readValue(undefined, 'title', 'second_skin')).toBeUndefined();
  });
});

describe('typed readers', () => {
  it('reads numbers and booleans through the same priority', () => {
    expect(readNumber({ speed: 1, second_skin_speed: '3' }, 'speed', 'second_skin', 2)).toBe(3);
    expect(readBoolean({ grain: true, second_skin_grain: false }, 'grain', 'second_skin', true)).toBe(
      false
    );
  });

  it('keeps the default when a number is unset or empty', () => {
    /* `Number('')` is 0 — an unset setting must not silently become zero */
    expect(readNumber({}, 'speed', 'second_skin', 2)).toBe(2);
    expect(readNumber({ second_skin_speed: '' }, 'speed', 'second_skin', 2)).toBe(2);
    expect(readNumber({ second_skin_speed: 'abc' }, 'speed', 'second_skin', 2)).toBe(2);
    expect(readNumber({ second_skin_speed: '0' }, 'speed', 'second_skin', 2)).toBe(0);
  });
});
