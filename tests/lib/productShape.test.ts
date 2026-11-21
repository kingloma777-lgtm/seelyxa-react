import { describe, it, expect } from 'vitest';
import {
  FINISHES,
  SHAPES,
  SHAPE_ORDER,
  finishOf,
  profileFromCode,
  shapeOf,
  shapeProfile,
  type ShapeKey,
} from '../../app/lib/productShape';

/* The built-in shapes are the block's answer to "a ready-made model is
   branded by definition": a solid of revolution has no texture, so the
   merchant's colour and sticker are the only things on it. These tests pin the
   geometric invariants a lathe needs — a profile that does not start and end on
   the axis produces a surface with a hole in it, and one that doubles back on
   itself produces inside-out normals. */

const KEYS = SHAPE_ORDER.filter((key): key is ShapeKey => key !== 'none');

describe('productShape', () => {
  it.each(KEYS)('%s closes on the axis at both ends', (key) => {
    const points = SHAPES[key];
    expect(points[0][0]).toBe(0);
    expect(points[points.length - 1][0]).toBe(0);
  });

  it.each(KEYS)('%s rises monotonically from 0 to 1', (key) => {
    const heights = SHAPES[key].map(([, height]) => height);
    expect(heights[0]).toBe(0);
    expect(heights[heights.length - 1]).toBe(1);
    /* non-decreasing, not strictly: the bottom face is a flat ring, and a
       profile that ever doubled back would turn the wall inside out */
    for (let i = 1; i < heights.length; i += 1) {
      expect(heights[i]).toBeGreaterThanOrEqual(heights[i - 1]);
    }
  });

  /* The frame is shared with the headline, so a body wider than about a third
     of its own height would push the product over the copy at 1.25× framing. */
  it.each(KEYS)('%s stays inside the frame', (key) => {
    const radii = SHAPES[key].map(([radius]) => radius);
    expect(Math.max(...radii)).toBeLessThan(0.3);
  });

  it('scales the radius and leaves the height alone', () => {
    const slim = shapeProfile('bottle', 0.7);
    const full = shapeProfile('bottle', 1);
    expect(slim[5][0]).toBeCloseTo(full[5][0] * 0.7, 6);
    expect(slim.map(([, height]) => height)).toEqual(full.map(([, height]) => height));
  });

  it('falls back to the bottle for a missing or unknown shape', () => {
    expect(shapeOf(undefined)).toBe('bottle');
    expect(shapeOf('')).toBe('bottle');
    expect(shapeOf('teapot')).toBe('bottle');
    expect(shapeOf('  jar  ')).toBe('jar');
    /* the only value that removes the product still has to survive the read */
    expect(shapeOf('none')).toBe('none');
  });

  it('falls back to satin for a missing or unknown finish', () => {
    expect(finishOf(undefined)).toBe('satin');
    expect(finishOf('velvet')).toBe('satin');
    expect(finishOf('metal')).toBe('metal');
  });

  /* Metalness is not a look, it is a reflectance: at 0.92 with no environment
     map the product renders black, which is why the scene carries one. */
  it('keeps the metal finish reflective and the matte one diffuse', () => {
    expect(FINISHES.metal.metalness).toBeGreaterThan(0.8);
    expect(FINISHES.matte.metalness).toBe(0);
    expect(FINISHES.matte.roughness).toBeGreaterThan(FINISHES.gloss.roughness);
    expect(FINISHES.gloss.roughness).toBeLessThan(0.2);
  });
});

/* A pasted silhouette is the third way a merchant gets a product without a
   file: they draw the profile, the block revolves it. It has to arrive in the
   same units as the presets or `body_width` stops meaning anything, and it has
   to be closed on the axis or the product renders with a hole in its base. */
describe('profileFromCode', () => {
  it('normalises height to 1 and keeps the radius in the same scale', () => {
    const points = profileFromCode([
      [0, 0],
      [0.2, 0],
      [0.2, 2],
      [0, 2],
    ]);
    expect(points).not.toBeNull();
    expect(points?.[1]).toEqual([0.1, 0]);
    expect(points?.[2]).toEqual([0.1, 1]);
  });

  it('accepts the recipe under a profile key', () => {
    const bare = profileFromCode([[0, 0], [0.2, 0], [0.2, 1], [0, 1]]);
    const wrapped = profileFromCode({ profile: [[0, 0], [0.2, 0], [0.2, 1], [0, 1]] });
    expect(wrapped).toEqual(bare);
  });

  /* LatheGeometry does not cap a profile that stops short of the axis: the
     product would be an open tube. The ends are closed here instead. */
  it('closes an open profile on the axis', () => {
    const points = profileFromCode([
      [0.2, 0],
      [0.2, 0.5],
      [0.15, 1],
    ]);
    expect(points).toHaveLength(5);
    expect(points?.[0]).toEqual([0, 0]);
    expect(points?.[points.length - 1]).toEqual([0, 1]);
  });

  it('caps the radius so a typo cannot become a disc', () => {
    const points = profileFromCode([
      [0, 0],
      [50, 0],
      [50, 1],
      [0, 1],
    ]);
    expect(points?.[1][0]).toBe(0.75);
  });

  it('refuses a profile it cannot build', () => {
    expect(profileFromCode(null)).toBeNull();
    expect(profileFromCode([[0, 0], [0.2, 1]])).toBeNull();
    expect(profileFromCode([[0, 0], [0.2, 0], [0.2, 0]])).toBeNull();
    expect(profileFromCode([[0, 0], [-1, 0.5], [0, 1]])).toBeNull();
    expect(profileFromCode([[0, 0], ['x', 0.5], [0, 1]])).toBeNull();
    expect(profileFromCode({ shape: 'bottle' })).toBeNull();
  });
});
