/**
 * Dev-only colour panel.
 *
 * Why this exists: the engine's editor schema drops `format`, so a
 * `format: "color"` field reaches `/__twilight/editor` as `kind: 'text'` and is
 * drawn as a bare text box. There is no `color` kind in the engine (checked in
 * 1.0.133 and 1.0.183), and the editor exposes no extension hook — so instead
 * of patching an installed package or reaching into the editor's DOM, the theme
 * renders its own panel next to the engine's gear button.
 *
 * It talks to the same two public surfaces the engine's own editor uses:
 *
 *   - `virtual:twilight/schema` → `devSchema.preview`, the saved state this
 *     page rendered with (`__root.tsx` already imports it).
 *   - `POST /__twilight/preview` with `{ state, from }` → the dev server writes
 *     `twilight.preview.json`, re-runs the server modules and broadcasts
 *     `twilight:preview` over Vite's socket. The engine's own store listens for
 *     that event and adopts the state, so the storefront re-renders live with
 *     no reload. Our `from` id is a constant, so it never matches the store's
 *     per-tab random id and the store always accepts our writes.
 *
 * Nothing here is imported in production: `__root.tsx` gates the mount on
 * `import.meta.env.DEV`, and the panel itself is a lazy import, so the whole
 * module tree-shakes out of a build.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  collectColors,
  toState,
  type ColorEntry,
  type ColorGroup,
  type PreviewState,
  type RawManifest,
} from '../../lib/devColorFields';
import { ColorField } from './ColorField';

const ENDPOINT = '/__twilight/preview';
/** Identifies our saves on the socket; never equals the store's per-tab id. */
const SOURCE = 'seelyxa-color-panel';
/** Longer than the engine store's 250ms debounce, so a drag does not queue. */
const SAVE_DELAY = 260;
/** Set on the iframe the editor frames the storefront in. */
const EDITOR_FRAME_ATTR = 'data-twilight-editor';
const THEME_GROUP = '__theme__';

const LIGHT = {
  '--sx-bg': '#ffffff',
  '--sx-ink': '#0f172a',
  '--sx-muted': '#64748b',
  '--sx-line': '#e2e8f0',
  '--sx-field': '#f8fafc',
  '--sx-hover': '#f1f5f9',
} as React.CSSProperties;

const DARK = {
  '--sx-bg': '#0f172a',
  '--sx-ink': '#e2e8f0',
  '--sx-muted': '#94a3b8',
  '--sx-line': '#1e293b',
  '--sx-field': '#111c30',
  '--sx-hover': '#16233b',
} as React.CSSProperties;

const CSS = `
.sx-fab{position:fixed;left:14px;bottom:70px;z-index:2147483001;width:44px;height:44px;padding:0;border-radius:50%;
  border:1px solid var(--sx-line);background:var(--sx-bg);cursor:pointer;display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 16px rgba(0,0,0,.28)}
.sx-fab span{width:20px;height:20px;border-radius:50%;
  background:conic-gradient(#ef4444,#f59e0b,#22c55e,#0ea5e9,#8b5cf6,#ef4444)}
.sx-panel{position:fixed;left:14px;bottom:70px;z-index:2147483001;width:372px;max-width:calc(100vw - 28px);
  max-height:min(72vh,620px);display:flex;flex-direction:column;overflow:hidden;border-radius:14px;
  border:1px solid var(--sx-line);background:var(--sx-bg);color:var(--sx-ink);
  box-shadow:0 12px 40px rgba(0,0,0,.32);font:12px/1.5 system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;direction:rtl}
.sx-panel *{box-sizing:border-box}
.sx-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--sx-line)}
.sx-title{font-weight:700;font-size:13px}
.sx-count{font-size:11px;color:var(--sx-muted)}
.sx-spacer{flex:1}
.sx-dot{width:7px;height:7px;border-radius:50%;flex:none}
.sx-dot--saving{background:#f59e0b}
.sx-dot--saved{background:#22c55e}
.sx-dot--error{background:#ef4444}
.sx-status{font-size:11px;color:var(--sx-muted)}
.sx-close{border:0;background:transparent;color:var(--sx-muted);font-size:18px;line-height:1;cursor:pointer;
  padding:2px 6px;border-radius:6px}
.sx-close:hover{background:var(--sx-hover);color:var(--sx-ink)}
.sx-search{margin:8px 12px;padding:6px 10px;border:1px solid var(--sx-line);border-radius:8px;
  background:var(--sx-field);color:var(--sx-ink);font:inherit}
.sx-search:focus{outline:2px solid #0d9488;outline-offset:-1px}
.sx-body{overflow:auto;padding:0 8px 10px;overscroll-behavior:contain}
.sx-group-head{display:flex;align-items:center;gap:6px;width:100%;padding:6px 4px;border:0;background:var(--sx-bg);
  color:var(--sx-muted);font:700 11px/1.6 inherit;text-align:right;cursor:pointer;position:sticky;top:0;z-index:1}
.sx-group-head:hover{color:var(--sx-ink)}
.sx-caret{width:10px;flex:none;transition:transform .12s}
.sx-caret--open{transform:rotate(-90deg)}
.sx-row{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:8px}
.sx-row:hover{background:var(--sx-hover)}
.sx-swatch-wrap{position:relative;width:30px;height:30px;flex:none}
.sx-swatch{appearance:none;-webkit-appearance:none;width:30px;height:30px;padding:0;cursor:pointer;
  border:1px solid var(--sx-line);border-radius:8px;background:transparent;
  box-shadow:inset 0 0 0 1px rgba(128,128,128,.32)}
.sx-swatch::-webkit-color-swatch-wrapper{padding:0}
.sx-swatch::-webkit-color-swatch{border:0;border-radius:7px}
.sx-swatch::-moz-color-swatch{border:0;border-radius:7px}
.sx-swatch-slash{position:absolute;inset:7px;border-radius:3px;pointer-events:none;
  background:linear-gradient(45deg,transparent 44%,#ef4444 44%,#ef4444 56%,transparent 56%)}
.sx-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
.sx-hex{width:88px;flex:none;padding:4px 6px;border:1px solid var(--sx-line);border-radius:7px;
  background:var(--sx-field);color:var(--sx-ink);text-align:center;direction:ltr;
  font:12px ui-monospace,SFMono-Regular,Menlo,monospace}
.sx-hex:focus{outline:2px solid #0d9488;outline-offset:-1px}
.sx-hex--bad{border-color:#ef4444}
.sx-reset{width:24px;height:24px;flex:none;padding:0;font-size:13px;line-height:1;cursor:pointer;
  border:1px solid transparent;border-radius:7px;background:transparent;color:var(--sx-muted)}
.sx-reset:hover:not(:disabled){background:var(--sx-hover);color:var(--sx-ink);border-color:var(--sx-line)}
.sx-reset:disabled{opacity:.28;cursor:default}
.sx-empty{padding:18px 12px;text-align:center;color:var(--sx-muted)}
.sx-error{margin:0 12px 8px;padding:6px 8px;border-radius:8px;background:rgba(239,68,68,.12);color:#ef4444;font-size:11px}
@media (prefers-reduced-motion:reduce){.sx-caret{transition-duration:1ms}}
`;

let manifestPromise: Promise<RawManifest> | null = null;

/**
 * `/twilight.json` is served by Vite in dev; one fetch per page, shared.
 *
 * Browser only. A module-level promise is a request-crossing I/O object in the
 * worker: if this ever ran during SSR the promise created for request A would be
 * awaited in request B and workerd would reject it with "Cannot perform I/O on
 * behalf of a different request". The panel is lazily imported and only opened
 * from an effect, so this is a guard, not a hot path.
 */
function loadManifest(): Promise<RawManifest> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('DevColorPanel is browser-only'));
  }
  manifestPromise ??= fetch(`${import.meta.env.BASE_URL}twilight.json`, { cache: 'no-store' }).then(
    async (response) => {
      if (!response.ok) throw new Error(`twilight.json — HTTP ${response.status}`);
      return (await response.json()) as RawManifest;
    }
  );
  return manifestPromise;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** The editor frames the storefront; its preview pane owns that surface. */
function inEditorFrame(): boolean {
  try {
    return window.frameElement?.hasAttribute(EDITOR_FRAME_ATTR) ?? false;
  } catch {
    return false;
  }
}

type Status = 'idle' | 'saving' | 'saved' | 'error';

const STATUS_LABEL: Record<Status, string> = {
  idle: '',
  saving: 'جارٍ الحفظ',
  saved: 'محفوظ',
  error: 'فشل الحفظ',
};

export interface DevColorPanelProps {
  /** `devSchema.preview` — the state the server rendered this page with. */
  preview?: PreviewState | null;
}

export function DevColorPanel({ preview }: DevColorPanelProps) {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [manifest, setManifest] = useState<RawManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [saveError, setSaveError] = useState('');
  const [state, setState] = useState<PreviewState>(() => toState(preview));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* The state is also the source of truth for a save, and a save is fired from
     an event handler, so a ref keeps it readable without re-creating callbacks. */
  const stateRef = useRef(state);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    inFlight.current = true;
    setStatus('saving');
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        /* `enabled` must be on for the theme to read any override at all; the
           settings stay sparse, so only the colours touched here change. */
        body: JSON.stringify({ state: { ...stateRef.current, enabled: true }, from: SOURCE }),
      });
      if (!response.ok) throw new Error((await response.text()) || `HTTP ${response.status}`);
      setStatus('saved');
      setSaveError('');
    } catch (error) {
      setStatus('error');
      setSaveError(error instanceof Error ? error.message : String(error));
    } finally {
      inFlight.current = false;
    }
  }, []);

  const schedule = useCallback(() => {
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), SAVE_DELAY);
  }, [flush]);

  const applyColor = useCallback(
    (entry: ColorEntry, hex: string) => {
      const next = entry.apply(stateRef.current, hex);
      stateRef.current = next;
      setState(next);
      schedule();
    },
    [schedule]
  );

  /* Another surface (the engine's editor, another tab) saved. Adopt it so the
     next write here starts from the file's real content instead of a stale
     snapshot — unless this panel has an edit the server has not taken yet. */
  useEffect(() => {
    const hot = import.meta.hot;
    if (!hot) return;
    const onPreview = (payload: unknown) => {
      const data = payload as { state?: unknown; from?: string | null } | null;
      if (!data || data.from === SOURCE) return;
      if (!data.state || typeof data.state !== 'object') return;
      if (timer.current || inFlight.current) return;
      const next = toState(data.state);
      stateRef.current = next;
      setState(next);
    };
    hot.on('twilight:preview', onPreview);
    return () => hot.off('twilight:preview', onPreview);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open || manifest) return;
    let alive = true;
    loadManifest()
      .then((value) => {
        if (!alive) return;
        setManifest(value);
        setManifestError(null);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        manifestPromise = null;
        setManifestError(error instanceof Error ? error.message : String(error));
      });
    return () => {
      alive = false;
    };
  }, [open, manifest]);

  const groups: ColorGroup[] = useMemo(
    () => (manifest ? collectColors(manifest, state) : []),
    [manifest, state]
  );

  const shown: ColorGroup[] = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        title: group.title,
        entries: group.entries.filter(
          (entry) =>
            entry.label.toLowerCase().includes(needle) ||
            entry.id.toLowerCase().includes(needle) ||
            (group.title ?? '').toLowerCase().includes(needle)
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [groups, query]);

  const total = useMemo(
    () => groups.reduce((count, group) => count + group.entries.length, 0),
    [groups]
  );

  if (!mounted || inEditorFrame()) return null;

  const theme = dark ? DARK : LIGHT;
  const searching = query.trim().length > 0;

  return createPortal(
    <>
      <style>{CSS}</style>
      {open ? (
        <section className="sx-panel" style={theme} dir="rtl" aria-label="لوحة الألوان">
          <header className="sx-head">
            <span className="sx-title">الألوان</span>
            <span className="sx-count">{total ? `${total} حقلًا` : ''}</span>
            <span className="sx-spacer" />
            {status !== 'idle' && (
              <>
                <span className={`sx-dot sx-dot--${status}`} />
                <span className="sx-status">{STATUS_LABEL[status]}</span>
              </>
            )}
            <button
              type="button"
              className="sx-close"
              onClick={() => setOpen(false)}
              aria-label="إغلاق لوحة الألوان"
            >
              ×
            </button>
          </header>

          <input
            className="sx-search"
            type="search"
            value={query}
            placeholder="ابحث عن لون أو مكوّن…"
            onChange={(event) => setQuery(event.target.value)}
          />

          {manifestError && <div className="sx-error">تعذّر تحميل twilight.json — {manifestError}</div>}
          {status === 'error' && saveError && <div className="sx-error">{saveError}</div>}

          <div className="sx-body">
            {!manifest && !manifestError && <div className="sx-empty">جارٍ التحميل…</div>}
            {manifest && shown.length === 0 && (
              <div className="sx-empty">{searching ? 'لا نتائج' : 'لا توجد حقول ألوان'}</div>
            )}
            {shown.map((group, index) => {
              const key = group.title ?? THEME_GROUP;
              const isOpen = searching || (expanded[key] ?? key === THEME_GROUP);
              return (
                <div className="sx-group" key={`${key}-${index}`}>
                  <button
                    type="button"
                    className="sx-group-head"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded((prev) => ({ ...prev, [key]: !isOpen }))}
                  >
                    <span className={`sx-caret${isOpen ? ' sx-caret--open' : ''}`} aria-hidden="true">
                      ▾
                    </span>
                    {group.title ?? 'إعدادات الثيم'}
                    <span className="sx-count">{group.entries.length}</span>
                  </button>
                  {isOpen &&
                    group.entries.map((entry) => (
                      <ColorField
                        key={entry.key}
                        label={entry.label}
                        description={entry.description}
                        value={entry.value}
                        fallback={entry.fallback}
                        onChange={(hex) => applyColor(entry, hex)}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="sx-fab"
          style={theme}
          onClick={() => setOpen(true)}
          title="لوحة الألوان"
          aria-label="فتح لوحة الألوان"
        >
          <span />
        </button>
      )}
    </>,
    document.body
  );
}

export default DevColorPanel;
