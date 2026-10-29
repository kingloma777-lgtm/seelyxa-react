import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import {
  readText,
  readNumber,
  prefersReducedMotion,
  useScrollProgress,
  type BlockData,
} from '../../lib/homeBlock';

export interface LensZoomSpotlightProps {
  data: BlockData;
}

/* Reference constants (Larevoltosa): the doodle fixture is fetched at runtime
   (not bundled), the zoom homes onto the glasses at 47%/21% and scales to 22
   via the literal reference formula 1 + p*2*(22-1). */
const SETTINGS = {
  doodleURL: '/reference/larevoltosa-doodle.svg',
  glaresPerLens: 2,
  finalZoomScale: 22,
  zoomFocus: '47% 21%',
};

/**
 * Pinned "zoom into the glasses" spotlight (faithful port of the Larevoltosa
 * reference). The middle coral section pins for three viewport-heights while
 * one scrubbed progress value drives everything with direct style writes:
 * the doodle scales toward its glasses, white glare bands sweep the lenses
 * (done at 0.75), the merchant photo fades in (0.5 → 1) clipped to the two
 * lens silhouettes built at runtime, and the headline flips word-by-word
 * (0.65 → 0.85).
 */
export function LensZoomSpotlight({ data }: LensZoomSpotlightProps) {
  const root = useRef<HTMLElement | null>(null);
  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const machineRef = useRef<{ render(progress: number): void } | null>(null);
  const progressRef = useRef(0);

  const intro = readText(data, 'intro_title', 'lens_zoom', 'LOOK CLOSER');
  const spotlight = readText(data, 'spotlight_title', 'lens_zoom', 'THE WORLD IN THE DETAIL');
  const outro = readText(data, 'outro_title', 'lens_zoom', 'EVERY FRAME IS A DOOR');
  const image = readText(data, 'lens_image', 'lens_zoom', '/reference/larevoltosa-lens.jpg');
  const background = readText(data, 'background_color', 'lens_zoom', '#252627');
  const accent = readText(data, 'accent_color', 'lens_zoom', '#eb5e55');
  const finalScale = readNumber(data, 'final_scale', 'lens_zoom', SETTINGS.finalZoomScale);
  const words = useMemo(() => spotlight.split(/\s+/).filter(Boolean), [spotlight]);

  /* Build the lens machinery exactly like the reference: inject the doodle,
     find glare paths (computed opacity 0.6), clip each lens silhouette into a
     clipPath, insert a clipped <g> with photo + sweep bands in the glare's
     own z-order, then colour the lens bodies with the section accent. */
  useEffect(() => {
    const rootEl = root.current;
    const wrap = svgWrapRef.current;
    if (!rootEl || !wrap || prefersReducedMotion()) return undefined;

    let disposed = false;
    fetch(SETTINGS.doodleURL)
      .then((response) => response.text())
      .then((svgText) => {
        if (disposed) return;
        wrap.innerHTML = svgText;
        const svg = wrap.querySelector('svg');
        if (!svg) return;

        const SVG_NS = 'http://www.w3.org/2000/svg';
        const XLINK_NS = 'http://www.w3.org/1999/xlink';
        const defs = document.createElementNS(SVG_NS, 'defs');
        svg.insertBefore(defs, svg.firstChild);

        const lensImages: SVGImageElement[] = [];
        const glareBands: { band: SVGRectElement; sweepDistance: number }[] = [];

        const glarePaths = Array.from(svg.querySelectorAll<SVGPathElement>('path')).filter(
          (path) => window.getComputedStyle(path).opacity === '0.6'
        );

        glarePaths.forEach((glarePath, lensIndex) => {
          const lensShape = glarePath.previousElementSibling as SVGPathElement | null;
          if (!lensShape) return;
          const bounds = lensShape.getBBox();

          const clipPath = document.createElementNS(SVG_NS, 'clipPath');
          clipPath.setAttribute('id', `lens-clip-${lensIndex}`);
          clipPath.appendChild(lensShape.cloneNode(true));
          defs.appendChild(clipPath);

          const lensGroup = document.createElementNS(SVG_NS, 'g');
          lensGroup.setAttribute('clip-path', `url(#lens-clip-${lensIndex})`);

          const photo = document.createElementNS(SVG_NS, 'image');
          photo.setAttribute('href', image);
          photo.setAttributeNS(XLINK_NS, 'xlink:href', image);
          photo.setAttribute('x', String(bounds.x));
          photo.setAttribute('y', String(bounds.y));
          photo.setAttribute('width', String(bounds.width));
          photo.setAttribute('height', String(bounds.height));
          photo.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          photo.setAttribute('opacity', '0');
          lensGroup.appendChild(photo);
          lensImages.push(photo);

          const bandWidth = bounds.width * 0.22;
          const sweepDistance = bounds.width + bandWidth * 2;
          const spacing = sweepDistance / SETTINGS.glaresPerLens;
          for (let bandIndex = 0; bandIndex < SETTINGS.glaresPerLens; bandIndex += 1) {
            const band = document.createElementNS(SVG_NS, 'rect');
            band.setAttribute('x', String(bounds.x + bounds.width * 0.3 - bandIndex * spacing));
            band.setAttribute('y', String(bounds.y - bounds.height * 0.25));
            band.setAttribute('width', String(bandWidth));
            band.setAttribute('height', String(bounds.height * 1.5));
            band.setAttribute('fill', '#ffffff');
            band.setAttribute('opacity', '0.6');
            lensGroup.appendChild(band);
            glareBands.push({ band, sweepDistance });
          }

          /* Load-bearing line: insert relative to the glare's own parent, then
             drop the glare itself (reference behaviour). */
          glarePath.parentNode?.insertBefore(lensGroup, glarePath);
          glarePath.remove();
        });

        /* transform-box locks 47% 21% onto the doodle's own geometry. */
        svg.style.transformOrigin = SETTINGS.zoomFocus;
        svg.style.transformBox = 'fill-box';

        const wordEls = Array.from(rootEl.querySelectorAll<HTMLElement>('.lens-zoom__word'));

        const render = (progress: number) => {
          const glareProgress = Math.min(progress / 0.75, 1);
          glareBands.forEach(({ band, sweepDistance }) => {
            band.style.transform = `translateX(${(glareProgress * sweepDistance).toFixed(2)}px)`;
          });

          const scale = 1 + progress * 2 * (finalScale - 1);
          svg.style.transform = `scale(${scale.toFixed(4)})`;

          const fade = progress >= 0.5 ? (progress - 0.5) / 0.5 : 0;
          lensImages.forEach((photo) => {
            photo.style.opacity = fade.toFixed(3);
          });

          /* Hard per-word flips between 0.65 and 0.85. */
          if (progress < 0.65) {
            wordEls.forEach((word) => (word.style.opacity = '0'));
          } else if (progress > 0.85) {
            wordEls.forEach((word) => (word.style.opacity = '1'));
          } else {
            const textProgress = (progress - 0.65) / 0.2;
            wordEls.forEach((word, index) => {
              word.style.opacity = textProgress >= index / wordEls.length ? '1' : '0';
            });
          }
        };

        machineRef.current = { render };
        render(progressRef.current);
      })
      .catch(() => {
        /* Fixture unavailable: the CSS fallback plate stays visible. */
      });

    return () => {
      disposed = true;
      machineRef.current = null;
    };
  }, [image, finalScale, words]);

  useScrollProgress(root, (progress) => {
    progressRef.current = progress;
    machineRef.current?.render(progress);
  });

  return (
    <section
      ref={root}
      className="lens-zoom"
      style={{ '--lz-bg': background, '--lz-accent': accent } as CSSProperties}
      aria-labelledby="lens-zoom-title"
    >
      <div className="lens-zoom__intro">
        <h2>{intro}</h2>
      </div>

      <div className="lens-zoom__pin">
        <div className="lens-zoom__spotlight">
          <div className="lens-zoom__svg-container">
            {/* Rendered while the doodle fixture loads (or under reduced
                motion): the lens photo as a static plate. */}
            <div
              className="lens-zoom__fallback"
              style={{ backgroundImage: `url("${image.replace(/"/g, '%22')}")` } as CSSProperties}
              aria-hidden
            />
            <div className="lens-zoom__svg-center" ref={svgWrapRef} />
          </div>

          <div className="lens-zoom__header">
            <h2 id="lens-zoom-title">
              {words.map((word, index) => (
                <span key={`${word}-${index}`} className="lens-zoom__word">
                  {word}{' '}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>

      <div className="lens-zoom__outro">
        <h2>{outro}</h2>
      </div>
    </section>
  );
}
