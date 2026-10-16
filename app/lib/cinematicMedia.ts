/**
 * Shared helpers for the cinematic home blocks (ported from the Twig theme
 * `seelyxa`). Field shapes at the Twilight runtime boundary:
 *
 * - Pickers (`format: dropdown-list` / `variable-list`) arrive as `{label,
 *   value, key}` objects inside arrays; themes must normalise them to text.
 * - Image fields arrive as `{url, small_url, alt}` or a plain URL string.
 * - `<model-viewer>` is a custom element loaded lazily, never bundled.
 */

type AnyRecord = Record<string, unknown>;

/** Normalise a picker/array-vs-string value to a plain string (or fallback). */
export function asSelection(value: unknown, fallback: string): string {
  let v = value;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object') {
    v = (v as AnyRecord).value;
    if (Array.isArray(v)) v = v[0];
  }
  return typeof v === 'string' && v ? v : fallback;
}

/** Image field: `{url, small_url}` or a plain URL string. */
export function asImage(
  value: unknown
): { url?: string; small_url?: string } | undefined {
  let v = value;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object') {
    const o = v as AnyRecord;
    const url = typeof o.url === 'string' ? o.url : undefined;
    const small = typeof o.small_url === 'string' ? o.small_url : undefined;
    if (url || small) return { url, small_url: small };
    return undefined;
  }
  return typeof v === 'string' && v ? { url: v } : undefined;
}

/** Variable-list (pick-a-link) field: flatten to a plain URL string. */
export function asVarUrl(value: unknown): string {
  let v = value;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object') {
    const o = v as AnyRecord;
    for (const key of ['value', 'url']) {
      const inner = o[key];
      if (typeof inner === 'string' && inner) return inner;
      if (Array.isArray(inner)) {
        const first = inner[0] as AnyRecord | undefined;
        if (first && typeof first.value === 'string' && first.value) return first.value;
      }
    }
    return '';
  }
  return typeof v === 'string' ? v : '';
}

/** Live reduced-motion probe (client only). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** `<model-viewer>` is a lazy-loaded custom element, never a React intrinsic. */
export const MV = 'model-viewer';
const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

let modelViewerRequested = false;
export function loadModelViewer(): void {
  if (modelViewerRequested || typeof window === 'undefined') return;
  modelViewerRequested = true;
  if (window.customElements?.get('model-viewer')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.async = true;
  script.src = MODEL_VIEWER_SRC;
  document.head.appendChild(script);
}

/** Common attribute shape for a hero/scene `<model-viewer>` node. */
export function modelViewerAttrs(opts: {
  className: string;
  src: string;
  poster?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
}): Record<string, string> {
  const attrs: Record<string, string> = {
    class: opts.className,
    'data-cinematic-model': '',
    src: opts.src,
    exposure: '1',
    'touch-action': 'pan-y',
    alt: '',
  };
  if (opts.poster) attrs.poster = opts.poster;
  if (opts.autoRotate) attrs['auto-rotate'] = '';
  if (opts.cameraControls) attrs['camera-controls'] = '';
  return attrs;
}
