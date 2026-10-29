import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowText,
  clamp,
  prefersReducedMotion,
  useScrollProgress,
  useReveal,
  type BlockData,
} from '../../lib/homeBlock';

export interface ProductModelScrollProps {
  data: BlockData;
}

interface Feature {
  icon: string;
  title: string;
  text: string;
}

const DEFAULT_FEATURES: Feature[] = [
  {
    icon: 'ϟ',
    title: 'Built to last',
    text: 'Designed to match your pace, this model runs all week on a single charge. No interruptions, no slowing down.',
  },
  {
    icon: '⌁',
    title: 'Stay synced',
    text: 'With app integration, it helps you stay consistent. Monitor intake, set goals, and make every use count.',
  },
];

/**
 * Pinned product stage with a rotating GLTF model (faithful port of the
 * GRNDProductScroll reference). The overview section pins for ten
 * viewport-heights while scroll progress drives: header-1 sliding out left,
 * the circular mask exploding from the center (0.2 → 0.3), header-2 sweeping
 * across (300% travel), the dividers growing and the two tooltips revealing,
 * all in the reference's exact progress windows — while the model spins
 * 12π (six turns) about its local Y.
 */
export function ProductModelScroll({ data }: ProductModelScrollProps) {
  const root = useRef<HTMLElement | null>(null);
  const pin = useRef<HTMLDivElement | null>(null);
  const headerOne = useRef<HTMLDivElement | null>(null);
  const headerTwo = useRef<HTMLDivElement | null>(null);
  const mask = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const progress = useRef(0);
  const [modelReady, setModelReady] = useState(false);

  useScrollProgress(root);
  useReveal(root);

  const modelUrl = readText(data, 'model_url', 'product_model', '/reference/shaker.glb');
  const fallbackImage = readText(data, 'fallback_image', 'product_model', '');
  const intro = readText(data, 'intro_title', 'product_model', 'FORM FOLLOWS FEELING');
  const primary = readText(data, 'title_primary', 'product_model', 'THE DAILY');
  const secondary = readText(data, 'title_secondary', 'product_model', 'RITUAL');
  const outro = readText(data, 'outro_title', 'product_model', 'MADE TO DISAPPEAR INTO YOUR DAY');
  const ctaText = readText(data, 'cta_text', 'product_model', 'Discover the object');
  const ctaLink = readText(data, 'cta_link', 'product_model', '/');
  const background = readText(data, 'background_color', 'product_model', '#0d0d0d');
  const textColor = readText(data, 'text_color', 'product_model', '#e0dfdf');

  const features = useMemo<Feature[]>(() => {
    const rows = readRows(data, 'features', 'product_model');
    if (!rows.length) return DEFAULT_FEATURES;
    return rows.map((row) => ({
      icon: rowText(row, 'icon', 'product_model', '✦'),
      title: rowText(row, 'title', 'product_model'),
      text: rowText(row, 'text', 'product_model'),
    }));
  }, [data]);

  const primaryChars = useMemo(() => primary.split(''), [primary]);

  /* Pinned scrub — the exact reference progress windows, applied with direct
     style writes over element refs. */
  useEffect(() => {
    const pinEl = pin.current;
    if (!pinEl || prefersReducedMotion()) return undefined;

    const render = (progressValue: number) => {
      const header1 = headerOne.current;
      const header2 = headerTwo.current;
      const maskEl = mask.current;

      // 1. Header 1 slides out left (0.05 → 0.35).
      let xPercent = 0;
      if (progressValue >= 0.35) xPercent = -100;
      else if (progressValue > 0.05) xPercent = -100 * ((progressValue - 0.05) / 0.3);
      if (header1) header1.style.transform = `translateX(${xPercent.toFixed(2)}%)`;

      // 2. Circular mask expands (0.20 → 0.30).
      let maskSize = 0;
      if (progressValue >= 0.3) maskSize = 100;
      else if (progressValue > 0.2) maskSize = 100 * ((progressValue - 0.2) / 0.1);
      if (maskEl) maskEl.style.clipPath = `circle(${maskSize.toFixed(2)}% at 50% 50%)`;

      // 3. Header 2 sweeps across (0.15 → 0.50), 300% travel.
      let header2X = 100;
      if (progressValue >= 0.5) header2X = -200;
      else if (progressValue >= 0.15) header2X = 100 - 300 * ((progressValue - 0.15) / 0.35);
      if (header2) header2.style.transform = `translateX(${header2X.toFixed(2)}%)`;

      // 4. Dividers grow (0.45 → 0.65).
      let dividerScale = 0;
      if (progressValue >= 0.65) dividerScale = 100;
      else if (progressValue > 0.45) dividerScale = 100 * ((progressValue - 0.45) / 0.2);
      pinEl.querySelectorAll<HTMLElement>('.product-model__divider').forEach((divider) => {
        divider.style.transform = `scaleX(${(dividerScale / 100).toFixed(3)})`;
      });

      // 5. Tooltip reveals (threshold toggles).
      pinEl.querySelectorAll<HTMLElement>('.product-model__tooltip').forEach((tooltip, index) => {
        tooltip.classList.toggle('is-on', progressValue >= (index === 0 ? 0.65 : 0.85));
      });
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = Math.max(1, pinEl.offsetHeight - window.innerHeight);
      progress.current = clamp(-pinEl.getBoundingClientRect().top / distance);
      render(progress.current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Three.js stage — exact reference lighting/camera/pose, model normalized
     and rotated 12π about its local Y as scroll progresses. */
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let disposed = false;
    let frame = 0;
    let cleanup = () => {};

    const boot = async () => {
      const probe = document.createElement('canvas');
      const context =
        probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ||
        probe.getContext('webgl', { failIfMajorPerformanceCaveat: true });
      if (!context) return;
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(1, 2, 3);
        scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-2, 0, -2);
        scene.add(fillLight);

        let model: any = null;
        let tiltDone = false;

        new GLTFLoader().load(
          modelUrl,
          (gltf: any) => {
            if (disposed) return;
            model = gltf.scene;
            model.traverse((object: any) => {
              if (object.isMesh) {
                const material = object.material;
                if (material) {
                  material.metalness = 0.05;
                  material.roughness = 0.9;
                }
              }
            });
            const group = new THREE.Group();
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z) || 1;
            // Reference pose: model sits left of center on desktop, straight
            // on mobile, with a -25° z-tilt.
            const isMobile = window.innerWidth < 1000;
            model.position.set(
              isMobile ? 0 : -size.x * 0.4,
              isMobile ? 0.05 : 0.085,
              0
            );
            model.rotation.z = isMobile ? 0 : THREE.MathUtils.degToRad(-25);
            group.add(model);
            const d = isMobile ? 2 : 1.25;
            camera.position.set(0, 0, maxDimension * d);
            camera.lookAt(0, 0, 0);
            scene.add(group);
            tiltDone = true;
            setModelReady(true);
          },
          undefined,
          () => undefined
        );

        const resize = () => {
          const rect = element.getBoundingClientRect();
          const width = Math.max(1, rect.width);
          const height = Math.max(1, rect.height);
          renderer.setSize(width, height, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(element);

        const renderLoop = () => {
          if (disposed) return;
          const value = progress.current;
          if (tiltDone) {
            handleRotation(value);
          }
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(renderLoop);
        };
        renderLoop();

        const handleRotation = (value: number) => {
          if (!model) return;
          const rotationProgress = Math.max(0, (value - 0.05) / 0.95);
          model.rotation.y = Math.PI * 3 * 4 * rotationProgress;
        };

        cleanup = () => {
          observer.disconnect();
          if (frame) window.cancelAnimationFrame(frame);
          scene.traverse((object: any) => {
            object.geometry?.dispose?.();
            const material = object.material;
            if (Array.isArray(material)) material.forEach((entry) => entry.dispose?.());
            else material?.dispose?.();
          });
          renderer.dispose();
          model = null;
        };
      } catch {
        /* CSS fallback remains visible */
      }
    };

    void boot();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [modelUrl]);

  return (
    <section
      ref={root}
      className="product-model"
      style={
        {
          '--pm-bg': background,
          '--pm-ink': textColor,
        } as CSSProperties
      }
      aria-labelledby="product-model-title"
    >
      <div className="product-model__intro">
        <h2>{intro}</h2>
      </div>

      <div className="product-model__pin" ref={pin}>
        <div className="product-model__overview">
          <div className="product-model__header-one" ref={headerOne}>
            <h2 id="product-model-title">
              {primaryChars.map((char, index) =>
                char.trim() === '' ? (
                  <span key={`space-${index}`}>{' '}</span>
                ) : (
                  <span key={`char-${index}`} className="product-model__char">
                    <span style={{ transitionDelay: `${index * 22}ms` }}>{char}</span>
                  </span>
                )
              )}
            </h2>
          </div>

          <div className="product-model__header-two" ref={headerTwo} aria-hidden>
            <h2>{secondary}</h2>
          </div>

          <div className="product-model__mask" ref={mask} aria-hidden />

          <div className="product-model__stage" aria-hidden>
            <canvas ref={canvas} className="product-model__canvas" />
            {!modelReady && fallbackImage ? (
              <img className="product-model__fallback" src={fallbackImage} alt="" />
            ) : null}
          </div>

          <div className="product-model__tooltips">
            {features.slice(0, 2).map((feature, index) => (
              <article
                key={`${feature.title}-${index}`}
                className={`product-model__tooltip${index === 1 ? ' product-model__tooltip--end' : ''}`}
                style={{ '--feature-index': index } as CSSProperties}
              >
                <div className="product-model__icon">
                  <span className="product-model__glyph" aria-hidden>
                    {feature.icon}
                  </span>
                </div>
                <div className="product-model__divider" aria-hidden />
                <div className="product-model__feature" data-reveal>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="product-model__outro">
        <h2>{outro}</h2>
        {ctaText ? (
          <Link to={ctaLink || '/'} className="product-model__cta">
            {ctaText} <span aria-hidden>↗</span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
