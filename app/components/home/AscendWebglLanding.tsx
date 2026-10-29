import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import {
  readRows,
  readText,
  rowText,
  useReveal,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface AscendWebglLandingProps {
  data: BlockData;
}

const DEFAULT_FEATURES = [
  ['Orbit intelligence', 'A living scene that responds to attention, not clicks.'],
  ['Zero-friction', 'No plugin, no player chrome. The product is the interface.'],
  ['Built to scale', 'From a single hero to a full campaign, one visual language.'],
  ['Material honesty', 'Light, weight and surface tuned until they feel physical.'],
  ['Quiet performance', 'A capped render budget keeps the experience smooth.'],
  ['Own the frame', 'Every section is composed, never templated.'],
];

/** WebGL landing: orbiting product, star field and scroll-parallax story. */
export function AscendWebglLanding({ data }: AscendWebglLandingProps) {
  const root = useRef<HTMLElement | null>(null);
  const hero = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  useReveal(root);
  useScrollProgress(hero, (value) => {
    progress.current = value;
  });

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
    'The same object, re-composed for every surface. Scroll, orbit and inspect without leaving the story.'
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
      : [
          { value: '60fps', label: 'target frame rate' },
          { value: '2×', label: 'pixel ratio cap' },
          { value: '100%', label: 'responsive scenes' },
          { value: '0', label: 'plugins required' },
        ];
  }, [data]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let disposed = false;
    let frame = 0;
    let cleanup = () => {};

    const boot = async () => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!gl) return;
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
        if (disposed) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
        camera.position.set(0, 0.4, 8);
        const renderer = new THREE.WebGLRenderer({ canvas: element, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        scene.add(new THREE.AmbientLight(0x7282a8, 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 3);
        key.position.set(5, 6, 4);
        scene.add(key);
        const glow = new THREE.PointLight(0x5df0a8, 8, 20);
        glow.position.set(-4, 1, 3);
        scene.add(glow);

        const group = new THREE.Group();
        scene.add(group);

        const starsGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(1400 * 3);
        for (let i = 0; i < 1400; i += 1) {
          positions[i * 3] = (Math.random() - 0.5) * 28;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 22 - 4;
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starsMaterial = new THREE.PointsMaterial({
          color: 0x8ca0c8,
          size: 0.025,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
        });
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        new GLTFLoader().load(
          modelUrl,
          (gltf: any) => {
            if (disposed) return;
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            model.position.set(-center.x, -center.y, -center.z);
            model.scale.setScalar(2.7 / Math.max(0.001, size.y));
            group.add(model);
            setReady(true);
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
          const p = progress.current;
          group.rotation.y += 0.0025 + pointer.current.x * 0.0015;
          group.rotation.x = -0.15 + pointer.current.y * 0.08 + p * 0.18;
          group.position.y = -0.1 - p * 0.6;
          stars.rotation.y = p * 0.3;
          camera.position.z = 8 - p * 1.2;
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(render);
        };
        render();

        const onPointer = (event: PointerEvent) => {
          pointer.current = {
            x: (event.clientX / window.innerWidth - 0.5) * 2,
            y: (event.clientY / window.innerHeight - 0.5) * 2,
          };
        };
        window.addEventListener('pointermove', onPointer, { passive: true });

        cleanup = () => {
          window.removeEventListener('pointermove', onPointer);
          observer.disconnect();
          if (frame) window.cancelAnimationFrame(frame);
          starsGeometry.dispose();
          starsMaterial.dispose();
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
        };
      } catch {
        /* CSS star field remains */
      }
    };

    void boot();
    return () => {
      disposed = true;
      cleanup();
    };
  }, [modelUrl]);

  const lines = title.split(/\n/);

  return (
    <section
      ref={root}
      className="ascend"
      style={{ '--as-bg': background, '--as-accent': accent } as CSSProperties}
      aria-labelledby="ascend-title"
    >
      <div className="ascend__hero" ref={hero}>
        <div className="ascend__stars" aria-hidden />
        <canvas ref={canvas} className={`ascend__canvas${ready ? ' is-ready' : ''}`} aria-hidden />
        <div className="ascend__hero-shade" aria-hidden />

        <nav className="ascend__nav">
          <span>{brand}</span>
          <div>
            <a href="#ascend-features">Features</a>
            <a href="#ascend-showcase">Showcase</a>
            <Link to={primaryLink || '/'}>{primaryText}</Link>
          </div>
        </nav>

        <div className="ascend__hero-copy">
          <p>{eyebrow}</p>
          <h2 id="ascend-title">
            {lines.map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </h2>
          <p className="ascend__intro">{intro}</p>
          <div className="ascend__actions">
            <Link to={primaryLink || '/'} className="ascend__button">
              {primaryText}
            </Link>
            <a href={secondaryLink || '#ascend-features'} className="ascend__button ascend__button--ghost">
              {secondaryText}
            </a>
          </div>
        </div>

        <div className="ascend__hero-meta">
          <span>SCROLL TO ORBIT</span>
          <span>WEBGL / REAL TIME</span>
        </div>
      </div>

      <div className="ascend__features" id="ascend-features">
        <header data-reveal>
          <p>CAPABILITIES / 06</p>
          <h3>A complete visual system.</h3>
        </header>
        <div className="ascend__feature-grid">
          {features.map((feature, index) => (
            <article key={`${feature.title}-${index}`} data-reveal>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h4>{feature.title}</h4>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="ascend__showcase" id="ascend-showcase">
        <div className="ascend__showcase-copy" data-reveal>
          <p>SHOWCASE / 01</p>
          <h3>{showcaseTitle}</h3>
          <p>{showcaseText}</p>
        </div>
        <div className="ascend__dashboard" data-reveal aria-hidden>
          <div className="ascend__dashboard-top">
            <span>ORBIT / LIVE</span>
            <span className="ascend__live">●</span>
          </div>
          <div className="ascend__bars">
            {[38, 64, 48, 82, 56, 74, 42].map((height, index) => (
              <span key={index} style={{ '--bar-height': `${height}%`, '--bar-index': index } as CSSProperties} />
            ))}
          </div>
          <div className="ascend__metrics">
            {stats.slice(0, 4).map((stat) => (
              <div key={`${stat.value}-${stat.label}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ascend__cta" data-reveal>
        <p>READY WHEN YOU ARE</p>
        <h3>{ctaTitle}</h3>
        <Link to={primaryLink || '/'} className="ascend__button">
          {ctaText}
        </Link>
      </div>

      <footer className="ascend__footer">
        <span>{footer}</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </section>
  );
}
