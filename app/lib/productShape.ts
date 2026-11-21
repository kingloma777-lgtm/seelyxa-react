/* ==========================================================================
   Neutral product shapes.

   Why these exist: every ready-made GLB on the internet carries the colours
   and the artwork of the thing it was modelled as — a branded spray can is a
   branded spray can, and a merchant selling their own bottle cannot use it.
   Re-texturing one is not an option either, because the logo is baked into
   the map and the UVs are laid out for it.

   So the block ships shapes instead of models: a solid of revolution with no
   texture at all, built from a 2D profile the merchant never sees. The body
   colour, the finish and the width are the merchant's, the sticker is the
   merchant's, and the result is their product — not a stock asset.

   A profile is a polyline in [radius, height], both in the same unit, with
   height normalised to 1. It starts and ends ON the axis (radius 0), which
   closes the solid: bottom face, wall, top face. The small intermediate
   points are fillets — `LatheGeometry` averages normals along the profile, so
   a hard corner would read as a soft roll instead of an edge.

   Kept free of `three` on purpose: the data is testable, and the geometry is
   built where the renderer already lives.
   ========================================================================== */

export type ShapeKey = 'bottle' | 'jar' | 'tube' | 'can' | 'flask';
export type ShapeChoice = ShapeKey | 'none';

/** One point of a lathe profile: `[radius, height]`, height in 0 → 1. */
export type ProfilePoint = readonly [number, number];

export const SHAPES: Record<ShapeKey, readonly ProfilePoint[]> = {
  /* a shampoo / water bottle: straight wall, rounded shoulder, short neck,
     a cap that overhangs the neck by a hair */
  bottle: [
    [0, 0],
    [0.15, 0],
    [0.19, 0.012],
    [0.2, 0.035],
    [0.2, 0.56],
    [0.198, 0.6],
    [0.188, 0.64],
    [0.166, 0.69],
    [0.136, 0.735],
    [0.108, 0.772],
    [0.094, 0.8],
    [0.09, 0.83],
    [0.09, 0.895],
    [0.104, 0.9],
    [0.106, 0.906],
    [0.106, 0.978],
    [0.098, 0.99],
    [0.07, 0.997],
    [0, 1],
  ],
  /* a wide, squat jar with a screw lid that is wider than the body — the
     shape most food and cosmetics jars actually have */
  jar: [
    [0, 0],
    [0.2, 0],
    [0.245, 0.01],
    [0.258, 0.03],
    [0.258, 0.52],
    [0.256, 0.548],
    [0.25, 0.564],
    [0.268, 0.574],
    [0.272, 0.59],
    [0.272, 0.945],
    [0.268, 0.962],
    [0.25, 0.976],
    [0.2, 0.986],
    [0, 1],
  ],
  /* a cosmetic tube: slim body, tapered shoulder, flip cap */
  tube: [
    [0, 0],
    [0.09, 0],
    [0.128, 0.01],
    [0.135, 0.028],
    [0.135, 0.7],
    [0.132, 0.735],
    [0.12, 0.77],
    [0.1, 0.8],
    [0.078, 0.822],
    [0.062, 0.838],
    [0.058, 0.862],
    [0.058, 0.882],
    [0.072, 0.886],
    [0.074, 0.892],
    [0.074, 0.972],
    [0.066, 0.984],
    [0.04, 0.996],
    [0, 1],
  ],
  /* a metal can: a straight wall with a rolled rim at each end, and the
     shallow dome a drinks can has on top */
  can: [
    [0, 0],
    [0.17, 0],
    [0.198, 0.008],
    [0.206, 0.022],
    [0.206, 0.952],
    [0.202, 0.968],
    [0.19, 0.98],
    [0.172, 0.99],
    [0.15, 0.995],
    [0, 1],
  ],
  /* a conical flask: perfume, lab glass, or a tapered sauce bottle */
  flask: [
    [0, 0],
    [0.19, 0],
    [0.232, 0.012],
    [0.234, 0.03],
    [0.19, 0.15],
    [0.14, 0.32],
    [0.1, 0.48],
    [0.074, 0.6],
    [0.062, 0.66],
    [0.058, 0.7],
    [0.058, 0.862],
    [0.07, 0.868],
    [0.072, 0.876],
    [0.072, 0.966],
    [0.064, 0.98],
    [0.038, 0.994],
    [0, 1],
  ],
};

export const SHAPE_ORDER: readonly ShapeChoice[] = [
  'bottle',
  'jar',
  'tube',
  'can',
  'flask',
  'none',
];

/** The profile as plain tuples, with the merchant's width applied. Width is
 * a multiplier on the radius only — the height is normalised, so a "slim"
 * bottle stays the same size on screen and simply loses girth. */
export function shapeProfile(key: ShapeKey, width = 1): Array<[number, number]> {
  const points = SHAPES[key] ?? SHAPES.bottle;
  return points.map(([radius, height]) => [radius * width, height]);
}

/** A shape key from whatever the editor sent, with the bottle as the default:
 * a merchant who never touched the field must still get a product. */
export function shapeOf(value: unknown): ShapeChoice {
  const raw = typeof value === 'string' ? value.trim() : '';
  return (SHAPE_ORDER as readonly string[]).includes(raw) ? (raw as ShapeChoice) : 'bottle';
}

/** The widest a pasted silhouette may be, in units of its own height. Beyond
 * this the "product" is a disc, which is always a typo rather than a design. */
const MAX_RADIUS = 0.75;

/** A silhouette the merchant wrote themselves, normalised to the same unit as
 * the presets: height 0 → 1, radius in the same scale.
 *
 * Accepted shapes of the input, because a merchant pastes whatever their tool
 * gave them: a bare array of `[radius, height]` pairs, or the same array under
 * a `profile` key. Anything else is refused rather than guessed at — a wrong
 * solid is worse than the preset.
 *
 * The ends are closed on the axis (radius 0), because `LatheGeometry` does not
 * cap a profile that stops short: the product would render with a hole in its
 * base, which reads as a modelling bug in the theme. */
export function profileFromCode(raw: unknown): Array<[number, number]> | null {
  const value =
    Array.isArray(raw) ? raw : (raw as { profile?: unknown } | null)?.profile;
  if (!Array.isArray(value) || value.length < 3 || value.length > 64) return null;

  const points: Array<[number, number]> = [];
  for (const item of value) {
    if (!Array.isArray(item) || item.length < 2) return null;
    const radius = Number(item[0]);
    const height = Number(item[1]);
    if (!Number.isFinite(radius) || !Number.isFinite(height) || radius < 0) return null;
    points.push([radius, height]);
  }

  const heights = points.map((point) => point[1]);
  const min = Math.min(...heights);
  const max = Math.max(...heights);
  const span = max - min;
  /* a flat profile has no solid to revolve */
  if (span <= 1e-6) return null;
  const scale = 1 / span;

  const normalised = points.map(
    ([radius, height]) =>
      [Math.min(radius * scale, MAX_RADIUS), (height - min) * scale] as [number, number]
  );

  if (normalised[0][0] > 0) normalised.unshift([0, normalised[0][1]]);
  if (normalised[normalised.length - 1][0] > 0) {
    const last = normalised[normalised.length - 1];
    normalised.push([0, last[1]]);
  }
  return normalised;
}

/* ── finishes ────────────────────────────────────────────────────────────────
   Metalness is not free: a metal surface reflects its surroundings and has
   almost no diffuse colour, so at metalness 1 with nothing to reflect it
   renders black. The scene therefore carries a small procedural environment
   map (see ProductScrub) and these values are tuned against it. */
export type FinishKey = 'matte' | 'satin' | 'gloss' | 'metal';

export const FINISHES: Record<FinishKey, { roughness: number; metalness: number }> = {
  matte: { roughness: 0.88, metalness: 0 },
  satin: { roughness: 0.45, metalness: 0.04 },
  gloss: { roughness: 0.12, metalness: 0.06 },
  metal: { roughness: 0.34, metalness: 0.92 },
};

export const FINISH_ORDER: readonly FinishKey[] = ['matte', 'satin', 'gloss', 'metal'];

export function finishOf(value: unknown): FinishKey {
  const raw = typeof value === 'string' ? value.trim() : '';
  return (FINISH_ORDER as readonly string[]).includes(raw) ? (raw as FinishKey) : 'satin';
}
