import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readText,
  readBoolean,
  readNumber,
  clamp,
  prefersReducedMotion,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';
import { dissolveVertexShader, dissolveFragmentShader } from '../../lib/shaders';

export interface DissolveHeroProps {
  data: BlockData;
}

const DEFAULT_TITLE = 'SECOND SKIN';
const DEFAULT_STATEMENT =
  'A study in contrast, texture and the quiet confidence of something made to be lived in.';
const DEFAULT_ABOUT =
  'A small studio working between image, object and atmosphere. We build visual worlds that feel tactile before they are understood.';

/* Reference constants (Second Skin): how far noise perturbs the dissolve edge
   and how fast scroll converts into progress (dissolve finishes in the first
   half of the block's scrollable 175svh). */
const CONFIG = { spread: 0.5, speed: 2 };
/* Matches the reference ScrollTrigger mapping: progress saturates at 1.1 so the
   ragged edge keeps a sliver living past the end of the sweep. */
const MAX_PROGRESS = 1.1;

/* 'three' ships without bundled types here (declared ambient), so its classes
   are used as values and the few needed locals are typed as `any`. */
function hexToRgbVec3(hex: string) {
  const raw = hex.replace('#', '').trim();
  const hex6 = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const value = Number.isFinite(Number.parseInt(hex6, 16))
    ? Number.parseInt(hex6, 16)
    : 0x141414;
  return new THREE.Vector3(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  );
}

/**
 * Faithful port of the Second Skin reference: a 175svh hero stacks four layers
 * — the full-bleed wall portrait (graded in CSS by an ember multiply
 * gradient), the centered header, a transparent WebGL canvas above both, and
 * the statement content in the bottom 125svh — followed by a dark 100svh
 * about section. The canvas renders one fullscreen quad whose fragment shader
 * dissolves the view with a ragged fbm-noise edge driven directly by scroll
 * position (parking the scroll freezes the dissolve mid-sweep), while the
 * statement reveals word-by-word over a "top 25% → bottom 100%" scroll range.
 *
 * Merchant data keeps the Salla plumbing (image, copy, colours, about switch)
 * on top of the reference geometry; a small mono CTA is a merchant-only extra.
 */
export function DissolveHero({ data }: DissolveHeroProps) {
  const root = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const materialRef = useRef<any>(null);

  const image = readText(data, 'image', 'dissolve_hero', '/reference/second-skin-wall.jpg');
  const eyebrow = readText(data, 'eyebrow', 'dissolve_hero', 'FORM / FUNCTION / FEELING');
  const title = readText(data, 'title', 'dissolve_hero', DEFAULT_TITLE);
  const intro = readText(
    data,
    'intro',
    'dissolve_hero',
    'An independent studio shaping quiet objects for loud lives.'
  );
  const statement = readText(data, 'statement', 'dissolve_hero', DEFAULT_STATEMENT);
  const aboutEyebrow = readText(data, 'about_eyebrow', 'dissolve_hero', 'THE STUDIO');
  const aboutText = readText(data, 'about_text', 'dissolve_hero', DEFAULT_ABOUT);
  const aboutMeta = readText(data, 'about_meta', 'dissolve_hero', 'EST. 2018 — MILAN / RIYADH');
  const ctaText = readText(data, 'cta_text', 'dissolve_hero', 'Enter the studio');
  const ctaLink = readText(data, 'cta_link', 'dissolve_hero', '#');
  const background = readText(data, 'background_color', 'dissolve_hero', '#141414');
  const accent = readText(data, 'accent_color', 'dissolve_hero', '#f04e23');
  const dprCap = readNumber(data, 'max_dpr', 'dissolve_hero', 2);
  const showAbout = readBoolean(data, 'show_about', 'dissolve_hero', true);

  const words = useMemo(() => statement.split(/\s+/).filter(Boolean), [statement]);

  /* Scroll → dissolve progress (reference: recomputed from raw scroll
     position on every scroll event, never time-based). */
  useScrollProgress(root, (progress) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uProgress.value = Math.min(progress * CONFIG.speed, MAX_PROGRESS);
    material.userData.render?.();
  });

  /* (A) Three.js scene — a single clip-space quad. Skipped for reduced motion
     and when WebGL is unavailable (bots/old devices): the graded portrait
     simply stays visible, exactly like the reference's no-shader fallback. */
  useEffect(() => {
    const hero = root.current;
    const canvas = canvasRef.current;
    if (!hero || !canvas || prefersReducedMotion()) return undefined;

    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: dissolveVertexShader,
      fragmentShader: dissolveFragmentShader,
      transparent: true,
      uniforms: {
        uProgress: { value: 0 },
        uResolution: { value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight) },
        uColor: { value: hexToRgbVec3(background) },
        uSpread: { value: CONFIG.spread },
      },
    });
    materialRef.current = material;
    scene.add(new THREE.Mesh(geometry, material));

    /* The only changing uniform is uProgress, so the quad renders on demand
       (init / resize / scroll) instead of an always-on rAF loop. */
    const render = () => renderer.render(scene, camera);
    material.userData.render = render;

    const resize = () => {
      renderer.setSize(hero.offsetWidth, hero.offsetHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
      material.uniforms.uResolution.value.set(hero.offsetWidth, hero.offsetHeight);
      render();
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      materialRef.current = null;
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [background, dprCap]);

  /* (B) Word-by-word statement fade, scrubbed from scroll like the
     reference's ScrollTrigger (start "top 25%", end "bottom 100%"): each word
     owns an equal 1/total slice of progress and its opacity is a direct
     function of that slice. */
  useEffect(() => {
    const hero = root.current;
    const content = contentRef.current;
    if (!hero || !content || prefersReducedMotion() || !materialRef.current) return undefined;

    const wordEls = Array.from(hero.querySelectorAll<HTMLElement>('.dissolve-hero__word'));
    if (!wordEls.length) return undefined;

    const paint = (progress: number) => {
      const total = wordEls.length;
      wordEls.forEach((word, index) => {
        const from = index / total;
        const to = (index + 1) / total;
        let opacity = 0;
        if (progress >= to) opacity = 1;
        else if (progress >= from) opacity = (progress - from) / (to - from);
        word.style.opacity = opacity.toFixed(3);
      });
    };

    wordEls.forEach((word) => {
      word.style.opacity = '0';
    });
    const update = () => {
      const rect = content.getBoundingClientRect();
      const viewport = window.innerHeight;
      const distance = rect.height - viewport * 0.75;
      paint(clamp(distance > 0 ? (viewport * 0.25 - rect.top) / distance : 1));
    };
    update();

    let frame = 0;
    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          update();
        });
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
      wordEls.forEach((word) => {
        word.style.opacity = '';
      });
    };
  }, [words]);

  return (
    <section
      ref={root}
      className="dissolve-hero"
      style={
        {
          '--dh-bg': background,
          '--dh-accent': accent,
        } as CSSProperties
      }
      aria-labelledby="dissolve-hero-title"
    >
      <div className="dissolve-hero__hero">
        <div className="dissolve-hero__wall">
          {/* Rendered unconditionally behind the canvas — if WebGL fails the
              hero still shows the graded portrait. */}
          <img src={image} alt={title} loading="eager" decoding="async" />
        </div>

        <canvas ref={canvasRef} className="dissolve-hero__canvas" aria-hidden />

        <header className="dissolve-hero__header">
          <p className="dissolve-hero__eyebrow">{eyebrow}</p>
          <h2 id="dissolve-hero-title" className="dissolve-hero__title">
            {title}
          </h2>
          <p className="dissolve-hero__lede">{intro}</p>
        </header>

        <div className="dissolve-hero__content" ref={contentRef}>
          <span className="dissolve-hero__mark" aria-hidden>
            &#10033;
          </span>
          <p className="dissolve-hero__statement" aria-label={statement}>
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="dissolve-hero__word">
                {word}{' '}
              </span>
            ))}
          </p>
          {ctaText ? (
            <Link to={ctaLink || '#'} className="dissolve-hero__cta">
              {ctaText} <span aria-hidden>↗</span>
            </Link>
          ) : null}
        </div>
      </div>

      {showAbout ? (
        <div className="dissolve-hero__about" id="about">
          <div className="dissolve-hero__about-inner">
            <span className="dissolve-hero__eyebrow dissolve-hero__eyebrow--light">
              {aboutEyebrow}
            </span>
            <p className="dissolve-hero__about-copy">{aboutText}</p>
            <p className="dissolve-hero__about-meta">{aboutMeta}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
