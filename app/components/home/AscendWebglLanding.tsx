import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  clamp,
  prefersReducedMotion,
  readRows,
  readText,
  rowText,
  type BlockData,
} from '../../lib/homeBlock';

export interface AscendWebglLandingProps {
  data: BlockData;
}

/* ──────────────────── Reference scene constants (ascend/index.html) ─── */

const LAYERS = { NONE: 0, TORUS: 1, BLOOM: 2, ENTIRE: 3 } as const;
const PLANET_RADIUS = 1.95;
const SPIN = 0.03;
const INIT_ROTATION = 2.07;
const TILT = 0.37;
const ENTRY_DUR = 1.9;
const ENTRY_START_Y = -6.5;

const STOPS_X = [
  { p: 0, v: 0 },
  { p: 0.32, v: -3.1 },
  { p: 0.64, v: 3.2 },
  { p: 1, v: 0 },
];
const STOPS_Y = [
  { p: 0, v: -4.5 },
  { p: 0.32, v: 0.55 },
  { p: 0.64, v: 0.45 },
  { p: 1, v: 0.15 },
];
const STOPS_S = [
  { p: 0, v: 2.15 },
  { p: 0.32, v: 1.0 },
  { p: 0.64, v: 0.92 },
  { p: 1, v: 1.12 },
];

const sampleStops = (stops: { p: number; v: number }[], p: number) => {
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      const smooth = t * t * (3 - 2 * t);
      return a.v + (b.v - a.v) * smooth;
    }
  }
  return stops[stops.length - 1].v;
};

const hexToVec3 = (hex: string, THREE: any) => {
  const clean = hex.replace('#', '');
  return new THREE.Vector3(
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255
  );
};

/* Final composite: the warp3d flame background + additive layers. */
const FINAL_PASS = {
  uniforms: {
    iTime: { value: 0 },
    tDiffuse: { value: null },
    bloomTexture: { value: null },
    torusTexture: { value: null },
    uBg: { value: null },
    uFlameA: { value: null },
    uFlameB: { value: null },
    uFlameAmt: { value: 0.15 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
  fragmentShader: `
    uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture;
    uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
    varying vec2 vUv;
    vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
      pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
      pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
      pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
      return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
    void main(){
      vec2 uv = 2.*vUv - 1.;
      vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
      vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
      flame *= smoothstep(0.25, 1., abs(uv.y));
      float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
      vec3 bg = uBg * (1.0 - 0.4 * length(uv));
      gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz, 1.);
    }`,
};

/* ──────────────────── Merchant defaults ─── */

const DEFAULT_FEATURES = [
  ['Orbit intelligence', 'A living scene that responds to attention, not clicks.'],
  ['Zero-friction', 'No plugin, no player chrome. The product is the interface.'],
  ['Built to scale', 'From a single hero to a full campaign, one visual language.'],
  ['Material honesty', 'Light, weight and surface tuned until they feel physical.'],
  ['Quiet performance', 'A capped render budget keeps the experience smooth.'],
  ['Own the frame', 'Every section is composed, never templated.'],
];

const DEFAULT_STATS = [
  { value: '4.9★', label: 'Average product rating' },
  { value: '12k+', label: 'Orders shipped this year' },
  { value: '98%', label: 'Orders delivered on time' },
  { value: '3.4×', label: 'Repeat purchase growth' },
];

const DASH_BAR_HEIGHTS = [62, 88, 47, 95, 71, 80, 58];
const DASH_WIDTHS = [90, 72, 48, 34];
const LOGOS = ['VOGUE', 'GQ', 'ELLE', 'WIRED', 'MONOCLE', 'KINFOLK'];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
    <path d="M5 12h14" style={{ strokeWidth: 2 }} />
    <path d="m12 5 7 7-7 7" style={{ strokeWidth: 2 }} />
  </svg>
);

const FEATURE_ICONS = [
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="3" y="3" width="6" height="6" rx="1.5" />
    <rect x="15" y="15" width="6" height="6" rx="1.5" />
    <path d="M6 9v3a3 3 0 0 0 3 3h3" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 16v-4" />
    <path d="M13 16V8" />
    <path d="M18 16v-7" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>,
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
  </svg>,
];

const reveal = (delay: number) => ({ '--rd': `${delay}ms` }) as CSSProperties;

/** Reference reveal: threshold 0.18 with a -8% bottom rootMargin; the
    matched element keeps `.in` for good (opacity 0 → 1, y 26px → 0). */
function useReferenceReveal(
  ref: RefObject<HTMLElement | null>,
  deps: unknown[]
) {
  useEffect(() => {
    const rootEl = ref.current;
    if (!rootEl) return;
    const nodes = Array.from(rootEl.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Ascend WebGL landing — faithful port of the standalone reference document.
 * A pinned full-viewport canvas sits behind the page: the product (GLB)
 * enters with a -6.5 unit drop, then drifts through the sections on the
 * reference STOPS_X/Y/S curves, rendered by the layer-pass pipeline
 * (torusComposer / bloomComposer / finalComposer + UnrealBloom + warp3d
 * flame background). Sections, reveal delays and dashboard animation all
 * mirror the reference.
 */
export function AscendWebglLanding({ data }: AscendWebglLandingProps) {
  const { t } = useTranslation();
  const root = useRef<HTMLElement | null>(null);
  const pin = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const modelUrl = readText(data, 'model_url', 'ascend', '/reference/shaker.glb');
  const brand = readText(data, 'brand', 'ascend', 'ASCEND');
  const eyebrow = readText(data, 'eyebrow', 'ascend', 'A NEW GRAVITY');
  const title = readText(data, 'title', 'ascend', 'Objects that\nhold their own orbit.');
  const intro = readText(
    data,
    'intro',
    'ascend',
    'A product experience built in three dimensions — light, motion and material in one continuous frame.'
  );
  const primaryText = readText(data, 'primary_cta_text', 'ascend', 'Enter the experience');
  const primaryLink = readText(data, 'primary_cta_link', 'ascend', '/');
  const secondaryText = readText(data, 'secondary_cta_text', 'ascend', 'See how it works');
  const secondaryLink = readText(data, 'secondary_cta_link', 'ascend', '#ascend-features');
  const showcaseTitle = readText(data, 'showcase_title', 'ascend', 'Every angle considered.');
  const showcaseText = readText(
    data,
    'showcase_text',
    'ascend',
    'One object, re-lit and re-composed for every surface. Scroll, orbit and inspect without leaving the story.'
  );
  const ctaTitle = readText(data, 'cta_title', 'ascend', 'Ready to leave the ground?');
  const ctaText = readText(data, 'cta_text', 'ascend', 'Start your project');
  const accent = readText(data, 'accent_color', 'ascend', '#5df0a8');
  const background = readText(data, 'background_color', 'ascend', '#04060f');
  const footer = readText(data, 'footer_text', 'ascend', 'ASCEND — A DIGITAL OBJECT STUDIO');

  const features = useMemo(() => {
    const rows = readRows(data, 'features', 'ascend');
    return rows.length
      ? rows.map((row) => ({
          title: rowText(row, 'title', 'ascend'),
          text: rowText(row, 'text', 'ascend'),
        }))
      : DEFAULT_FEATURES.map(([titleValue, text]) => ({ title: titleValue, text }));
  }, [data]);

  const stats = useMemo(() => {
    const rows = readRows(data, 'stats', 'ascend');
    return rows.length
      ? rows.map((row) => ({
          value: rowText(row, 'value', 'ascend'),
          label: rowText(row, 'label', 'ascend'),
        }))
      : DEFAULT_STATS;
  }, [data]);

  /* Dashboard rows ride the first four stats (reference: New leads 90% …). */
  const dashRows = stats.slice(0, 4).map((stat, index) => {
    const match = /(\d+(?:\.\d+)?)/.exec(stat.value);
    const width = match ? clamp(Number(match[1]), 4, 100) : (DASH_WIDTHS[index] ?? 50);
    return {
      label: stat.label || t('blocks.home.stage', 'Stage'),
      value: stat.value || '0',
      width,
    };
  });

  useReferenceReveal(root, [features, stats]);

  useEffect(() => {
    const element = canvas.current;
    const pinEl = pin.current;
    const section = root.current;
    if (!element || !pinEl || !section) return;
    let disposed = false;
    let cleanup = () => {};

    const boot = async () => {
      const probe = document.createElement('canvas');
      const context = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!context) return;
      try {
        const THREE = await import('three');
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { GammaCorrectionShader }, { CopyShader }, { GLTFLoader }] =
          await Promise.all([
            import('three/addons/postprocessing/EffectComposer.js'),
            import('three/addons/postprocessing/RenderPass.js'),
            import('three/addons/postprocessing/UnrealBloomPass.js'),
            import('three/addons/postprocessing/ShaderPass.js'),
            import('three/addons/shaders/GammaCorrectionShader.js'),
            import('three/addons/shaders/CopyShader.js'),
            import('three/addons/loaders/GLTFLoader.js'),
          ]);
        if (disposed) return;

        const L = LAYERS;
        const reduced = prefersReducedMotion();
        const sizeNow = () => ({
          w: Math.max(1, pinEl.clientWidth),
          h: Math.max(1, pinEl.clientHeight),
        });

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const renderer = new THREE.WebGLRenderer({ canvas: element, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        if ('outputColorSpace' in renderer && THREE.SRGBColorSpace !== undefined) {
          renderer.outputColorSpace = THREE.SRGBColorSpace;
        } else if ('outputEncoding' in renderer) {
          renderer.outputEncoding = 3001; /* legacy sRGBEncoding */
        }

        const { w: w0, h: h0 } = sizeNow();
        const camera = new THREE.PerspectiveCamera(40, w0 / h0, 0.1, 200);
        camera.position.set(0, 0, 8);
        camera.layers.enable(L.TORUS);
        camera.layers.enable(L.BLOOM);
        camera.layers.enable(L.ENTIRE);
        scene.add(camera);

        /* Lights — visible only to the ENTIRE pass layer. */
        const lights: any[] = [];
        const addLight = (light: any, position?: number[]) => {
          if (position) light.position.set(position[0], position[1], position[2]);
          light.layers.set(L.ENTIRE);
          scene.add(light);
          lights.push(light);
        };
        addLight(new THREE.AmbientLight(0xffffff, 1.8));
        addLight(new THREE.DirectionalLight(0xffffff, 0.8), [0, 10, 2]);
        addLight(new THREE.DirectionalLight(0xffffff, 1.35), [-3, 4, 6]);
        addLight(new THREE.DirectionalLight(0x9fc4ff, 1.2), [3, -1, -5]);

        /* World group carries the STOPS movement; planet group holds tilt +
           spin + the GLB product. */
        const worldGroup = new THREE.Group();
        worldGroup.position.set(STOPS_X[0].v, STOPS_Y[0].v, 0);
        worldGroup.scale.setScalar(STOPS_S[0].v);
        scene.add(worldGroup);

        const planetGroup = new THREE.Group();
        planetGroup.rotation.z = TILT;
        worldGroup.add(planetGroup);

        /* Additive atmosphere halo (camera-facing billboard). */
        const glowMat = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uGlow: { value: hexToVec3('#3a6cff', THREE) },
            uIntensity: { value: 3.35 },
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `uniform vec3 uGlow; uniform float uIntensity; varying vec2 vUv;
void main(){
  float d = length(vUv - 0.5) * 2.0;
  float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
  gl_FragColor = vec4(uGlow * a * uIntensity, a);
}`,
        });
        const glowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glowMat);
        glowMesh.scale.setScalar(PLANET_RADIUS * 2.3);
        glowMesh.layers.enable(L.BLOOM);
        glowMesh.layers.enable(L.ENTIRE);
        glowMesh.layers.disable(L.TORUS);
        glowMesh.layers.disable(L.NONE);
        worldGroup.add(glowMesh);

        /* Ambient motes (additive warped points). */
        const moteCount = 320;
        const moteGeo = new THREE.BufferGeometry();
        {
          const positions = new Float32Array(moteCount * 3);
          const sizes = new Float32Array(moteCount);
          const seeds = new Float32Array(moteCount);
          for (let i = 0; i < moteCount; i += 1) {
            positions[i * 3] = Math.random() * 2 - 1;
            positions[i * 3 + 1] = Math.random() * 2 - 1;
            positions[i * 3 + 2] = Math.random() * 2 - 1;
            sizes[i] = 22 * (0.4 + Math.random());
            seeds[i] = Math.random();
          }
          moteGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          moteGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
          moteGeo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
        }
        const moteUniforms = {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(w0, h0) },
          uColor: { value: hexToVec3('#9fc4ff', THREE) },
        };
        const moteMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
          uniforms: moteUniforms,
          vertexShader: `attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
varying float vA;
vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
  p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
  p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
  return cos(p+vec3(1,2,4)); }
void main(){
  vec3 v = position*4.0 + warp(position, uTime)*1.2;
  vec4 mv = modelViewMatrix * vec4(v, 1.0);
  float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
  vA = farF * nearF;
  gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
  gl_Position = projectionMatrix * mv;
}`,
          fragmentShader: `uniform vec3 uColor; varying float vA;
void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
  float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.55); }`,
        });
        const motes = new THREE.Points(moteGeo, moteMat);
        motes.frustumCulled = false;
        motes.layers.enable(L.BLOOM);
        motes.layers.enable(L.ENTIRE);
        motes.layers.disable(L.TORUS);
        motes.layers.disable(L.NONE);
        scene.add(motes);

        /* Starfield on a sphere (r 90, twinkle). */
        const starCount = 1400;
        const starGeo = new THREE.BufferGeometry();
        {
          const positions = new Float32Array(starCount * 3);
          const seeds = new Float32Array(starCount);
          const brights = new Float32Array(starCount);
          const v = new THREE.Vector3();
          for (let i = 0; i < starCount; i += 1) {
            if (typeof v.randomDirection === 'function') {
              v.randomDirection();
            } else {
              const u = Math.random();
              const phi = Math.random() * Math.PI * 2;
              const cosTheta = u * 2 - 1;
              const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
              v.set(sinTheta * Math.cos(phi), sinTheta * Math.sin(phi), cosTheta);
            }
            v.multiplyScalar(90);
            positions[i * 3] = v.x;
            positions[i * 3 + 1] = v.y;
            positions[i * 3 + 2] = v.z;
            seeds[i] = Math.random();
            brights[i] = 0.35 + Math.random() * 0.65;
          }
          starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          starGeo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
          starGeo.setAttribute('bright', new THREE.BufferAttribute(brights, 1));
        }
        const starUniforms = {
          uTime: { value: 0 },
          uSize: { value: 1.6 },
          uFlicker: { value: 1 },
          uColor: { value: hexToVec3('#cfe0ff', THREE) },
          uRes: { value: new THREE.Vector2(w0, h0) },
        };
        const starMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: true,
          blending: THREE.AdditiveBlending,
          uniforms: starUniforms,
          vertexShader: `attribute float seed; attribute float bright;
uniform float uTime; uniform float uSize; uniform float uFlicker; uniform vec2 uRes;
varying float vTw;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.6 + 0.4 * sin(uTime * uFlicker + seed);
  vTw = bright * tw;
  gl_PointSize = max(uSize * uRes.y / 900.0 * (90.0 / max(-mv.z, 1.0)), 1.0);
  gl_Position = projectionMatrix * mv;
}`,
          fragmentShader: `uniform vec3 uColor; varying float vTw;
void main(){
  vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
  float core = smoothstep(0.5, 0.0, l);
  gl_FragColor = vec4(uColor, core * vTw);
}`,
        });
        const stars = new THREE.Points(starGeo, starMat);
        stars.frustumCulled = false;
        stars.layers.enable(L.TORUS);
        stars.layers.enable(L.BLOOM);
        stars.layers.enable(L.ENTIRE);
        stars.layers.disable(L.NONE);
        scene.add(stars);

        /* Layer-pass composers (reference order verbatim). */
        const torusComposer = new EffectComposer(renderer);
        torusComposer.addPass(new RenderPass(scene, camera));
        torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
        torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(w0, h0), 0.22, 0.2, 0));
        torusComposer.addPass(new ShaderPass(CopyShader));

        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.addPass(new RenderPass(scene, camera));
        bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(w0, h0), 0.5, 0.6, 0));
        bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

        const finalComposer = new EffectComposer(renderer);
        finalComposer.renderToScreen = true;
        finalComposer.addPass(new RenderPass(scene, camera));
        const finalPass = new ShaderPass(FINAL_PASS);
        finalPass.uniforms.uBg.value = hexToVec3('#040a1e', THREE);
        finalPass.uniforms.uFlameA.value = hexToVec3('#3a6cff', THREE);
        finalPass.uniforms.uFlameB.value = hexToVec3('#c1faff', THREE);
        finalComposer.addPass(finalPass);
        finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
        finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

        /* GLB product (replaces the reference planet) with the entry drop. */
        let productLoaded = false;
        let entryT = reduced ? 1 : 0;
        if (modelUrl) {
          new GLTFLoader().load(
            modelUrl,
            (gltf: any) => {
              if (disposed || productLoaded) return;
              productLoaded = true;
              const bottle = gltf.scene;
              bottle.traverse((object: any) => {
                if (!object.isMesh || !object.material) return;
                const material = object.material;
                if (material.metalness !== undefined) material.metalness = 0.05;
                if (material.roughness !== undefined) material.roughness = 0.9;
              });
              const box = new THREE.Box3().setFromObject(bottle);
              const size = box.getSize(new THREE.Vector3());
              const center = box.getCenter(new THREE.Vector3());
              const targetH = PLANET_RADIUS * 2.15;
              const scale = targetH / Math.max(size.y, 1e-6);
              bottle.scale.setScalar(scale);
              bottle.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
              bottle.traverse((object: any) => {
                if (!object.isMesh) return;
                object.layers.enable(L.ENTIRE);
                object.layers.enable(L.BLOOM);
                object.layers.disable(L.TORUS);
              });
              planetGroup.add(bottle);
              entryT = 0;
              setReady(true);
            },
            undefined,
            () => undefined
          );
        }

        /* Main loop — STOPS remap of scroll, entry drop, spin + compositing. */
        let frame = 0;
        let last = performance.now() * 0.001;
        let starTime = 0;
        let curP = 0;
        let curX = STOPS_X[0].v;
        let curY = STOPS_Y[0].v;
        let curS = STOPS_S[0].v;
        let spinPhase = 0;
        let announced = false;

        const tick = () => {
          if (disposed) return;
          frame = window.requestAnimationFrame(tick);
          const now = performance.now() * 0.001;
          const dt = Math.min(0.05, Math.max(0.001, now - last));
          last = now;
          starTime += dt;

          starUniforms.uTime.value = starTime;
          moteUniforms.uTime.value = now * 6.4;
          finalPass.uniforms.iTime.value = now;

          const rect = section.getBoundingClientRect();
          const span = rect.height - window.innerHeight;
          const target = span > 0 ? clamp(-rect.top / span, 0, 1) : 0;
          curP += (target - curP) * Math.min(1, dt * 4.5);
          const sideScale = clamp(window.innerWidth / 1200, 0.5, 1);
          const tX = sampleStops(STOPS_X, curP) * sideScale;
          const tY = sampleStops(STOPS_Y, curP);
          const tS = sampleStops(STOPS_S, curP);
          const k = Math.min(1, dt * 3.2);
          curX += (tX - curX) * k;
          curY += (tY - curY) * k;
          curS += (tS - curS) * k;

          let entryY = 0;
          if (productLoaded && entryT < 1) {
            entryT = Math.min(1, entryT + dt / ENTRY_DUR);
            const eased = 1 - Math.pow(1 - entryT, 3);
            entryY = ENTRY_START_Y * (1 - eased);
          }

          worldGroup.position.set(curX, curY + entryY, 0);
          worldGroup.scale.setScalar(curS);
          spinPhase += dt * SPIN;
          planetGroup.rotation.y = INIT_ROTATION + spinPhase + curP * Math.PI * 1.6;

          glowMesh.quaternion.copy(camera.quaternion);
          motes.position.copy(camera.position);

          camera.layers.set(L.TORUS);
          torusComposer.render();
          camera.layers.set(L.BLOOM);
          bloomComposer.render();
          camera.layers.set(L.ENTIRE);
          finalComposer.render();
          if (!announced) {
            announced = true;
            setReady(true);
          }
        };

        const onResize = () => {
          const { w, h } = sizeNow();
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          const ratio = Math.min(window.devicePixelRatio || 1, 2);
          renderer.setPixelRatio(ratio);
          renderer.setSize(w, h, false);
          [torusComposer, bloomComposer, finalComposer].forEach((composer) => {
            composer.setPixelRatio(ratio);
            composer.setSize(w, h);
          });
          starUniforms.uRes.value.set(w, h);
          moteUniforms.uRes.value.set(w, h);
        };        onResize();
        frame = window.requestAnimationFrame(tick);
        window.addEventListener('resize', onResize);

        cleanup = () => {
          window.removeEventListener('resize', onResize);
          if (frame) window.cancelAnimationFrame(frame);
          [moteGeo, starGeo, glowMat, moteMat, starMat].forEach((entry: any) => entry?.dispose?.());
          lights.forEach((light) => scene.remove(light));
          worldGroup.traverse((object: any) => {
            object.geometry?.dispose?.();
            const material = object.material;
            if (Array.isArray(material)) material.forEach((entry: any) => entry?.dispose?.());
            else material?.dispose?.();
          });
          torusComposer.dispose?.();
          bloomComposer.dispose?.();
          finalComposer.dispose?.();
          renderer.dispose();
        };
      } catch {
        /* the pinned viewport simply stays dark if WebGL is unavailable */
      }
    };

    void boot();
    return () => {
      disposed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]);

  const titleLines = title.split('\n');
  const year = new Date().getFullYear();

  return (
    <section
      ref={root}
      className="ascend"
      style={{ '--as-bg': background, '--as-accent': accent } as CSSProperties}
      aria-labelledby="ascend-title"
    >
      {/* Pinned full-viewport WebGL backdrop (reference: fixed canvas) */}
      <div className="ascend__backdrop" aria-hidden>
        <div className="ascend__backdrop-pin" ref={pin}>
          <canvas ref={canvas} className={`ascend__canvas${ready ? ' is-ready' : ''}`} />
        </div>
      </div>

      <div className="ascend__page">
        {/* SECTION 1 · HERO */}
        <header className="ascend__hero">
          <nav className="ascend__nav" data-reveal style={reveal(0)}>
            <Link className="ascend__brand" to="/">
              <span className="ascend__brand-mark">▲</span>
              {brand}
            </Link>
            <div className="ascend__nav-links">
              <a href="#ascend-features">{t('blocks.home.nav_features', 'Features')}</a>
              <a href="#ascend-features">{t('blocks.home.nav_solutions', 'Solutions')}</a>
              <a href="#ascend-solutions">{t('blocks.home.nav_plans', 'Plans')}</a>
              <a href="#ascend-cta">{t('blocks.home.nav_learning', 'Learning')}</a>
            </div>
            {primaryText ? (
              <Link className="ascend__btn ascend__btn--ghost" to={primaryLink || '/'}>
                {primaryText}
              </Link>
            ) : null}
          </nav>

          <div className="ascend__hero-inner">
            <span className="ascend__eyebrow" data-reveal style={reveal(20)}>
              {eyebrow}
            </span>
            <h1 id="ascend-title" className="ascend__hero-title" data-reveal style={reveal(60)}>
              {titleLines.map((line, index) =>
                index === 0 ? (
                  <span key={index}>{line}</span>
                ) : (
                  <span key={index}>
                    <br />
                    <em>{line}</em>
                  </span>
                )
              )}
            </h1>
            <p className="ascend__hero-sub" data-reveal style={reveal(180)}>
              {intro}
            </p>
            <div className="ascend__hero-actions" data-reveal style={reveal(300)}>
              {primaryText ? (
                <Link to={primaryLink || '/'} className="ascend__btn ascend__btn--primary">
                  {primaryText}
                  <ArrowIcon />
                </Link>
              ) : null}
              {secondaryText ? (
                <a href={secondaryLink || '#ascend-features'} className="ascend__btn ascend__btn--outline">
                  {secondaryText}
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <div className="ascend__logos" data-reveal style={reveal(420)}>
          <div className="ascend__logos-label">{t('blocks.home.logos_label', 'Trusted by fast-moving teams')}</div>
          <div className="ascend__logos-row">
            {LOGOS.map((logo) => (
              <span className="ascend__logo" key={logo}>
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 2 · FEATURES */}
        <section className="ascend__section ascend__features" id="ascend-features">
          <div className="ascend__section-head">
            <span className="ascend__eyebrow" data-reveal style={reveal(0)}>
              {t('blocks.home.ascend_features_eyebrow', 'Everything in orbit')}
            </span>
            <h2 data-reveal style={reveal(80)}>A complete visual system.</h2>
            <p data-reveal style={reveal(160)}>
              {t(
                'blocks.home.ascend_features_text',
                'Six ideas that keep the work fast, physical and unmistakably ours.'
              )}
            </p>
          </div>
          <div className="ascend__feature-grid">
            {features.map((feature, index) => (
              <article className="ascend__card" key={`${feature.title}-${index}`} data-reveal style={reveal(90 + index * 90)}>
                <div className="ascend__card-icon">
                  <span className="ascend__icon">{FEATURE_ICONS[index % FEATURE_ICONS.length]}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 3 · SHOWCASE + STATS */}
        <section className="ascend__section ascend__showcase" id="ascend-solutions">
          <div className="ascend__showcase-grid">
            <div className="ascend__showcase-copy">
              <div className="ascend__section-head">
                <span className="ascend__eyebrow" data-reveal style={reveal(0)}>
                  {t('blocks.home.momentum', 'Built for momentum')}
                </span>
                <h2 data-reveal style={reveal(90)}>{showcaseTitle}</h2>
                <p data-reveal style={reveal(180)}>{showcaseText}</p>
                <div className="ascend__hero-actions ascend__hero-actions--start" data-reveal style={reveal(270)}>
                  <Link to={primaryLink || '/'} className="ascend__btn ascend__btn--primary">
                    {t('blocks.home.explore_platform', 'Explore the platform')}
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            </div>
            <div className="ascend__dashboard" data-reveal style={reveal(160)}>
              <div className="ascend__dash-top">
                <h3>{t('blocks.home.pipeline', 'Pipeline')} · Q3</h3>
                <span className="ascend__dash-live">{t('blocks.home.live', 'Live')}</span>
              </div>
              <div className="ascend__dash-bars">
                {DASH_BAR_HEIGHTS.map((height, index) => (
                  <div
                    key={index}
                    className="ascend__dash-bar"
                    style={{ '--h': `${height}%`, '--i': index } as CSSProperties}
                  />
                ))}
              </div>
              <div className="ascend__dash-rows">
                {dashRows.map((row, index) => (
                  <div key={`${row.label}-${index}`} className="ascend__dash-row">
                    <span>
                      {row.label} {row.value}
                    </span>
                    <div className="ascend__dash-track">
                      <div
                        className="ascend__dash-fill"
                        style={{ '--w': `${row.width}%`, '--d': `${(0.05 + index * 0.07).toFixed(2)}s` } as CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ascend__stats">
            {stats.map((stat, index) => (
              <div key={`${stat.value}-${stat.label}`} className="ascend__stat" data-reveal style={reveal(80 + index * 80)}>
                <div className="ascend__stat-value">{stat.value}</div>
                <div className="ascend__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4 · CTA + FOOTER */}
        <section className="ascend__section ascend__cta" id="ascend-cta">
          <div className="ascend__cta-card" data-reveal style={reveal(0)}>
            <span className="ascend__eyebrow" data-reveal style={reveal(60)}>
              {t('blocks.home.ready_when_you_are', 'Ready when you are')}
            </span>
            <h2 data-reveal style={reveal(140)}>{ctaTitle}</h2>
            <p data-reveal style={reveal(220)}>
              {t('blocks.home.ascend_cta_note', 'Launch in minutes. No maintenance. Cancel anytime.')}
            </p>
            <div className="ascend__hero-actions" data-reveal style={reveal(300)}>
              {ctaText ? (
                <Link to={primaryLink || '/'} className="ascend__btn ascend__btn--primary">
                  {ctaText}
                  <ArrowIcon />
                </Link>
              ) : null}
              <a href="#ascend-title" className="ascend__btn ascend__btn--outline">
                {t('blocks.home.talk_to_sales', 'Talk to Sales')}
              </a>
            </div>
          </div>

          <footer className="ascend__footer" data-reveal style={reveal(0)}>
            <div className="ascend__footer-brand">
              <Link className="ascend__brand" to="/">
                <span className="ascend__brand-mark">▲</span>
                {brand}
              </Link>
              <p>{footer}</p>
            </div>
            <div className="ascend__footer-cols">
              <div className="ascend__footer-col">
                <h4>{t('blocks.home.product', 'Product')}</h4>
                <a href="#ascend-features">{t('blocks.home.nav_features', 'Features')}</a>
                <a href="#ascend-solutions">{t('blocks.home.nav_solutions', 'Solutions')}</a>
                <a href="#ascend-cta">{t('blocks.home.nav_plans', 'Plans')}</a>
              </div>
              <div className="ascend__footer-col">
                <h4>{t('blocks.home.company', 'Company')}</h4>
                <a href="#ascend-title">{t('blocks.home.about', 'About')}</a>
                <a href="#ascend-title">{t('blocks.home.careers', 'Careers')}</a>
                <a href="#ascend-title">{t('blocks.home.blog', 'Blog')}</a>
              </div>
              <div className="ascend__footer-col">
                <h4>{t('blocks.home.legal', 'Legal')}</h4>
                <a href="#ascend-title">{t('blocks.home.privacy', 'Privacy')}</a>
                <a href="#ascend-title">{t('blocks.home.terms', 'Terms')}</a>
                <a href="#ascend-title">{t('blocks.home.security', 'Security')}</a>
              </div>
            </div>
          </footer>

          <p className="ascend__copyright">
            © {year} {brand}, Inc. — {t('blocks.home.built_among_stars', 'Built among the stars.')}
          </p>
        </section>
      </div>
    </section>
  );
}
