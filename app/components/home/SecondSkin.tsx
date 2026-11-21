import { Fragment, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { clamp, readNumber, readText, readValue } from '../../lib/homeBlock';
import { imgSrc } from '../../lib/curtainSlots';

/**
 * `second-skin` home block — a scroll-scrubbed WebGL dissolve.
 *
 * A tall hero stacks four layers: the full-bleed wall portrait (graded in CSS
 * by an ember multiply), the centred header, a transparent canvas above both,
 * and the closing paragraph in the bottom of the section. The canvas draws one
 * fullscreen quad whose fragment shader floods the frame with the fill colour
 * from the bottom up along a ragged fbm-noise edge, so the portrait does not
 * fade out — it gets submerged.
 *
 * Deviations from the reference, all deliberate:
 *
 *  - **No Lenis, no ScrollTrigger.** Both hijack the page's scroll, which this
 *    theme does not allow inside a block. The dissolve only ever needed the
 *    raw scroll offset, so one rAF loop reads `getBoundingClientRect()` and
 *    writes two custom properties. Same motion, no global side effect.
 *  - **No SplitText.** The words are split at render time and each one carries
 *    its slice of the timeline as `--ss-from`; the fade itself is a CSS
 *    `clamp()` on a single `--ss-words` value. One style write per frame
 *    instead of a tween per word per frame.
 *  - **Renders on change, not on every frame.** The reference runs two
 *    unbounded rAF loops; this one renders only when the dissolve actually
 *    moved, and stops entirely while the hero is off-screen.
 *  - **Reduced motion never starts WebGL.** It gets the finished composition:
 *    a CSS scrim instead of a shader, and the paragraph fully inked.
 */

/** The dissolve is not time-based: progress is read from scroll and multiplied
 * by this, so the fill finishes in the first half of the section's travel. */
const SPEED = 2;

/** How far the noise pushes the fill's edge around, in uv units. The edge is
 * the whole effect — too small and it is a wipe, too large and it is fog. */
const SPREAD = 0.5;

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    /* the quad is already a 2×2 plane in clip space, so no matrices */
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uProgress;
  uniform vec3 uColor;
  uniform float uSpread;
  uniform float uMix;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  /* value noise — cheaper than simplex and, for an edge this ragged, the
     grid artefacts are invisible under the octave stack */
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    /* normalised to 0…1 so SPREAD means the same thing at every octave count */
    return value / 0.875;
  }

  void main() {
    /* Raw uv, no aspect correction. Correcting for the canvas aspect keeps
       the cells square in pixels, but the hero is 100vw × 175svh — on a phone
       that leaves barely four cells across the width and the edge turns into
       a few enormous blobs. The reference's plain uv keeps the pattern fine
       where the screen is narrow, which is where it matters. */
    vec2 p = vUv * 15.0;

    float edge = uProgress * 1.2 + (fbm(p) - 0.5) * uSpread;

    /* uv.y = 0 is the bottom: everything below the edge is filled, everything
       above stays transparent so the portrait shows through. A 0.004 band is
       enough to keep the edge from aliasing without softening the rag.

       uMix is the merchant's strength: at 1 the fill is opaque and swallows
       the frame, below 1 the portrait keeps showing through it, so the chosen
       colour and the photo's own colour average into one another instead of
       the photo simply disappearing under a flat card. */
    float alpha = 1.0 - smoothstep(edge - 0.004, edge + 0.004, vUv.y);
    gl_FragColor = vec4(uColor, alpha * uMix);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  if (!Number.isFinite(value)) return [0.078, 0.078, 0.078];
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

interface SecondSkinProps {
  data: {
    image?: unknown;
    eyebrow?: unknown;
    title?: unknown;
    subtitle?: unknown;
    body?: unknown;
    mark?: unknown;
    fill_color?: unknown;
    tint_color?: unknown;
    text_color?: unknown;
    mix?: unknown;
    [key: string]: unknown;
  };
}

/** Top-level settings arrive short (`title`) or prefixed (`second_skin_title`). */
const read = (data: SecondSkinProps['data'], key: string, fallback = '') =>
  readText(data, key, 'second_skin', fallback);

/** The image is not text: it can arrive as a url, a `{url, small_url, alt}`
 * object or a picker array, so it goes through `imgSrc` instead of being
 * flattened to a string. Reading it as text was why an uploaded image could
 * render as `[object Object]` — and reading the short key first was why a
 * perfectly good upload was ignored in favour of the seed image. */
const readImage = (data: SecondSkinProps['data'], key: string, fallback = '') =>
  imgSrc(readValue(data, key, 'second_skin')) || fallback;

/** How opaque the submerge layer ends up, 0 → 1. 1 is the reference look: the
 * fill swallows the frame. Anything lower lets the portrait keep showing
 * through, which is what makes the fill colour MIX with the photo's colours
 * instead of painting over them. */
const readMix = (data: SecondSkinProps['data']): number =>
  clamp(readNumber(data, 'mix', 'second_skin', 100) / 100);

export function SecondSkin({ data }: SecondSkinProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* live handles into the running scene, so a colour edit is a uniform write
     instead of a renderer rebuild — see the sync effect below */
  const materialRef = useRef<import('three').ShaderMaterial | null>(null);
  const drawRef = useRef<((progress: number) => void) | null>(null);
  const progressRef = useRef(0);

  const image = readImage(data, 'image');
  const eyebrow = read(data, 'eyebrow');
  const title = read(data, 'title');
  const subtitle = read(data, 'subtitle');
  const body = read(data, 'body');
  const mark = read(data, 'mark', '✳');
  const fill = read(data, 'fill_color', '#141414');
  const tint = read(data, 'tint_color', '#f04e23');
  /* one field for all the type: eyebrow, title, subtitle, paragraph and mark
     inherit it through `color` on the root */
  const text = read(data, 'text_color', '#efece3');
  const mix = readMix(data);

  /* Split here, at render time, so the word count is known before paint and
     each word can carry its slice of the timeline as a static variable. */
  const words = useMemo(() => body.split(/\s+/).filter(Boolean), [body]);

  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!root || !hero || !content || !canvas) return;

    /* Reduced motion gets the composed still: no WebGL at all, and the CSS
       scrim stands in for the fill. The paragraph is inked by the stylesheet. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('is-flat');
      root.style.setProperty('--ss-words', '1');
      return;
    }

    let disposed = false;
    let frame = 0;
    let stopRender: (() => void) | null = null;

    /* The measurement loop starts immediately and never waits for WebGL: it
       also drives the paragraph, and a device without a context must still get
       readable text. The shader attaches itself to it when it is ready. */
    let draw: ((progress: number) => void) | null = null;
    let drawn = -1;
    let inked = -1;

    const tick = () => {
      frame = window.requestAnimationFrame(tick);

      const rect = hero.getBoundingClientRect();
      const viewport = window.innerHeight;

      /* the paragraph: 0 when its top reaches 25% of the viewport, 1 when its
         bottom reaches the bottom — the reference's ScrollTrigger
         ("top 25%" → "bottom 100%") expressed as plain geometry */
      const contentRect = content.getBoundingClientRect();
      const start = viewport * 0.25;
      const end = viewport - contentRect.height;
      const wordProgress = clamp((start - contentRect.top) / Math.max(1, start - end));
      /* only on change: this loop runs for the life of the page, and an
         unconditional write invalidates style for the whole subtree */
      if (Math.abs(wordProgress - inked) > 0.001) {
        inked = wordProgress;
        root.style.setProperty('--ss-words', wordProgress.toFixed(4));
      }

      /* off-screen: stop paying for the draw */
      if (rect.bottom < -240 || rect.top > viewport + 240) return;

      const distance = Math.max(1, rect.height - viewport);
      const scrolled = clamp(-rect.top / distance);
      const progress = Math.min(scrolled * SPEED, 1.1);

      if (draw && Math.abs(progress - drawn) > 0.0015) {
        drawn = progress;
        draw(progress);
      }
    };
    frame = window.requestAnimationFrame(tick);

    (async () => {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        root.classList.add('is-flat');
        return;
      }
      if (disposed) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      } catch {
        /* no WebGL (or a blocked context): keep the portrait and the words,
           lose only the dissolve */
        root.classList.add('is-flat');
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uProgress: { value: 0 },
          uColor: { value: new THREE.Vector3(...hexToRgb(fill)) },
          uSpread: { value: SPREAD },
          uMix: { value: mix },
        },
      });
      scene.add(new THREE.Mesh(geometry, material));

      const resize = () => {
        const width = hero.offsetWidth;
        const height = hero.offsetHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
      };
      resize();

      /* the hero's height is in svh, so it changes with the mobile URL bar —
         a window resize listener misses that, a ResizeObserver does not */
      const observer = new ResizeObserver(resize);
      observer.observe(hero);

      draw = (progress: number) => {
        progressRef.current = progress;
        material.uniforms.uProgress.value = progress;
        renderer.render(scene, camera);
      };
      /* published so the colour/mix sync effect can recolour the running scene
         without tearing it down */
      materialRef.current = material;
      drawRef.current = draw;
      /* first frame, so the portrait is not left showing a blank canvas */
      draw(0);

      stopRender = () => {
        observer.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        materialRef.current = null;
        drawRef.current = null;
      };
    })();

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      stopRender?.();
    };
    /* `fill` / `mix` are deliberately NOT dependencies: they are pushed into
       the running material by the effect below. Re-running this one would
       dispose the renderer and build a second WebGLRenderer on the SAME
       <canvas>, which is how a colour edit ends up losing the context (and the
       block silently falling back to `is-flat`). */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A colour or strength edit is two uniform writes and one repaint. */
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const [r, g, b] = hexToRgb(fill);
    material.uniforms.uColor.value.set(r, g, b);
    material.uniforms.uMix.value = mix;
    drawRef.current?.(progressRef.current);
  }, [fill, mix]);

  if (!title && !image) return null;

  return (
    <div
      ref={rootRef}
      className="second-skin"
      style={
        {
          '--ss-fill': fill,
          '--ss-tint': tint,
          '--ss-text': text,
          '--ss-mix': mix,
          '--ss-total': words.length || 1,
        } as CSSProperties
      }
    >
      {/* The display faces come from `app.scss`'s single Google Fonts request.
          This block used to add its own `<link>` for a family that request
          already carried — a second stylesheet request for the same CSS, and a
          second preconnect pair, on every page that mounted the block. */}

      <div className="second-skin__hero" ref={heroRef}>
        {image ? (
          <div className="second-skin__wall">
            {/* rendered unconditionally behind the canvas: if WebGL fails the
                hero still shows the graded portrait */}
            <img src={image} alt="" loading="eager" decoding="async" />
          </div>
        ) : null}

        <div className="second-skin__header">
          {eyebrow ? (
            <span className="second-skin__eyebrow" dir="auto">
              {eyebrow}
            </span>
          ) : null}
          {title ? (
            <h2 className="second-skin__title" dir="auto">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="second-skin__subtitle" dir="auto">
              {subtitle}
            </p>
          ) : null}
        </div>

        <canvas className="second-skin__canvas" ref={canvasRef} aria-hidden="true" />

        {body ? (
          <div className="second-skin__content" ref={contentRef}>
            {mark ? (
              <span className="second-skin__mark" aria-hidden="true">
                {mark}
              </span>
            ) : null}
            <p className="second-skin__body" dir="auto">
              {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  <span
                    className="second-skin__word"
                    style={{ '--ss-from': index / words.length } as CSSProperties}
                  >
                    {word}
                  </span>
                  {index < words.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
