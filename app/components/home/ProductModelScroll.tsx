import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowText,
  useScrollProgress,
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
    title: 'Precision motor',
    text: 'A quiet brushless core calibrated for a full week of daily use.',
  },
  {
    icon: '⌁',
    title: 'Wireless by design',
    text: 'USB-C, ten hours, and no seam in sight. Built to disappear into the ritual.',
  },
];

/**
 * Pinned product stage with a real GLTF model. Three.js is imported only in the
 * browser and only when a WebGL context exists; the static product silhouette
 * is the honest fallback for reduced motion, old devices and SSR.
 */
export function ProductModelScroll({ data }: ProductModelScrollProps) {
  const root = useRef<HTMLElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const progress = useRef(0);
  const [modelReady, setModelReady] = useState(false);
  useScrollProgress(root, (value) => {
    progress.current = value;
  });

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
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0.15, 4.2);
        const renderer = new THREE.WebGLRenderer({
          canvas: element,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x28221d, 2.2));
        const key = new THREE.DirectionalLight(0xffd8b8, 3.5);
        key.position.set(4, 6, 5);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xa9c7ff, 2.2);
        rim.position.set(-5, 1, -4);
        scene.add(rim);

        const group = new THREE.Group();
        scene.add(group);
        let model: any = null;

        new GLTFLoader().load(
          modelUrl,
          (gltf: any) => {
            if (disposed) return;
            model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const height = Math.max(size.y, 0.001);
            model.position.set(-center.x, -center.y, -center.z);
            const scale = 2.5 / height;
            model.scale.setScalar(scale);
            group.add(model);
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
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(element);

        const render = () => {
          if (disposed) return;
          const value = progress.current;
          group.rotation.y = value * Math.PI * 12;
          group.rotation.x = Math.sin(value * Math.PI * 2) * 0.18 - 0.12;
          group.position.y = -0.08 + Math.sin(value * Math.PI) * 0.16;
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(render);
        };
        render();

        cleanup = () => {
          observer.disconnect();
          if (frame) window.cancelAnimationFrame(frame);
          group.traverse((object: { geometry?: { dispose?: () => void }; material?: unknown }) => {
            object.geometry?.dispose?.();
            const material = object.material as
              | { dispose?: () => void }
              | { dispose?: () => void }[]
              | undefined;
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
          '--pm-progress': 0,
        } as CSSProperties
      }
      aria-labelledby="product-model-title"
    >
      <div className="product-model__sticky">
        <div className="product-model__halo" aria-hidden />
        <div className="product-model__grid" aria-hidden />

        <div className="product-model__intro">
          <p>{intro}</p>
          <span>01 / 03</span>
        </div>

        <h2 className="product-model__headline product-model__headline--one" id="product-model-title">
          {primary}
        </h2>
        <h2 className="product-model__headline product-model__headline--two">{secondary}</h2>

        <div className="product-model__stage" aria-hidden>
          <canvas ref={canvas} className={`product-model__canvas${modelReady ? ' is-ready' : ''}`} />
          {!modelReady ? (
            fallbackImage ? (
              <img className="product-model__fallback" src={fallbackImage} alt="" />
            ) : (
              <div className="product-model__bottle">
                <span />
                <span />
              </div>
            )
          ) : null}
        </div>

        <div className="product-model__features">
          {features.slice(0, 4).map((feature, index) => (
            <article key={`${feature.title}-${index}`} style={{ '--feature-index': index } as CSSProperties}>
              <span className="product-model__icon" aria-hidden>
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>

        <div className="product-model__outro">
          <p>{outro}</p>
          <Link to={ctaLink || '/'} className="product-model__cta">
            {ctaText} <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
