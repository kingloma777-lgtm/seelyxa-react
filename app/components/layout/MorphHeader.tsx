import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { Link, Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight, useIsHome } from '@salla.sa/twilight-theme-engine/providers';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { SallaMenu } from '@salla.sa/twilight-components-react/menu';
import { SallaContacts } from '@salla.sa/twilight-components-react/contacts';
import { SallaSocial } from '@salla.sa/twilight-components-react/social';
import { SallaUserMenu } from '@salla.sa/twilight-components-react/user-menu';
import { SallaCartSummary } from '@salla.sa/twilight-components-react/cart-summary';
import {
  MORE_MENU_ID,
  fitCount,
  menuKey,
  pruneUntitled,
  splitMenu,
} from '../../lib/menuOverflow';
import { type MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { openStoreSwitcher } from '../../lib/storeSwitchers';
import { useHydrated } from '../../hooks/useHydrated';
import { resolveMorphIcon } from '../../lib/morphIcons';
import { MorphCurtain, type CurtainLabels, type CurtainMenu } from './MorphCurtain';
import { readSlots } from '../../lib/curtainSlots';
import { LanguagesIcon } from '../icons';

/* ==========================================================================
 * MorphPill — the cinematic store header, ported from the Twig theme
 * (`seelyxa`: header.twig + morph-header.js + morph-header.scss).
 * --------------------------------------------------------------------------
 * Four concepts folded into one sticky stack:
 *  1. the morphing pill — ONE boolean (`scrollY > 40` → `.is-scrolled`) that
 *     takes the bar from a flat 1600px stripe to a frosted 880px capsule;
 *  2. a magnetic center nav whose links lean toward the cursor, with ONE
 *     `morph-blob` pill moved (never cloned) underneath the hovered link;
 *  3. a kinetic fullscreen index, opened by the mobile burger: numbered rows
 *     push up skewed and a preview card chases the cursor (desktop pointers);
 *  4. an expanding search: the real live search stays mounted and is clipped
 *     to a 40px disc until its toggle opens it.
 * Plus the light/dark toggle with the View Transition "magic reveal", the
 * utility top bar above the pill, and the "under-header" lift the cinematic
 * home blocks opt into (`s-block--under-header`).
 *
 * The curtain mega menu (desktop) arrives with its own component/commit and
 * keys off `menuIndex` below; the nav wiring is already ordered for it.
 *
 * Everything keeps the old theme's classes (`morph-*`) so the SCSS port stays
 * a port instead of a rewrite, and so the hard-learned SCSS rules (see the old
 * theme's AGENTS.md) carry over verbatim.
 * ========================================================================== */

const SCROLL_MORPH_AT = 40; // px — the pill's morph boolean (twig parity)
const DESKTOP_MIN = 1025; // px — the blob nav lives here; below: burger overlay

/* The account preview card has no menu image to show, so it breathes in
   gradients picked by row index — one per hover, stable and cheap. */
const ACCOUNT_GRADIENTS = [
  'linear-gradient(140deg,#d9c3ab,#8f6a49)',
  'linear-gradient(140deg,#e9e1d6,#b09b85)',
  'linear-gradient(140deg,#dcd6cf,#7f766c)',
  'linear-gradient(140deg,#e3d3c6,#a37f61)',
  'linear-gradient(140deg,#e8dde5,#b391a3)',
  'linear-gradient(140deg,#eef0e8,#9fb0a4)',
  'linear-gradient(140deg,#ded6e4,#7a5f86)',
  'linear-gradient(140deg,#eae1d6,#b79b7d)',
];

/**
 * Salla theme settings can ship any field as the picker shape
 * `[{label, value, key}]` (same runtime boundary the home blocks hit — see
 * `lib/cinematicMedia.ts`). Flatten one such value to its first string.
 */
function scalarSetting(value: unknown): string | undefined {
  let v: unknown = value;
  if (Array.isArray(v)) v = v[0];
  if (v && typeof v === 'object' && typeof (v as Record<string, unknown>).value === 'string') {
    return (v as Record<string, unknown>).value as string;
  }
  return typeof v === 'string' && v ? v : undefined;
}

function numberSetting(value: unknown, fallback: number): number {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>).value : value;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

/** One icon slot: settings' value first, design default second (see morphIcons). */
function MorphIco({
  setting,
  legacy,
  className,
  ariaLabel,
}: {
  setting: unknown;
  legacy: string;
  className?: string;
  ariaLabel?: string | null;
}) {
  const { sicon, glyph } = resolveMorphIcon(setting, legacy);
  if (sicon) {
    return <i className={`morph-ico is-sicon sicon-${sicon}${className ? ` ${className}` : ''}`} aria-hidden={!ariaLabel} aria-label={ariaLabel ?? undefined} />;
  }
  return (
    <span
      className={`morph-ico${className ? ` ${className}` : ''}`}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 24 24" width="${glyph.size}" height="${glyph.size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${glyph.body}</svg>`,
      }}
    />
  );
}

const CARET = (
  <svg
    className="morph-link__caret"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* The store menu, filtered once at the source: one list, one index space —
   everything (nav, curtain, overlay numbering) reads this same array (old
   morph-header.js rule 11). Untitled rows come from the API (e.g. the brands
   link) and are dropped with the theme's shared helper. */
export function useStoreMenus() {
  const { data } = useQuery(menu.queries.header());
  const menus = useMemo(() => pruneUntitled((data ?? []) as MenuItem[]), [data]);
  return { menus, ready: menus.length > 0 || (data?.length ?? 0) > 0 };
}

/** Utility bar above the pill — the old theme's own top bar, kept as-is. */
function MorphTopbar({
  scrolled,
  showImportantLinks,
}: {
  scrolled: boolean;
  showImportantLinks: boolean;
}) {
  const { store } = useTwilight();
  const { t, languageName } = useTranslation();
  const multilingual = Boolean(store?.settings?.is_multilingual || store?.settings?.currencies_enabled);
  return (
    <div
      className={`morph-topbar${scrolled ? ' is-scrolled' : ''}`}
      data-testid="morph-header-topbar"
    >
      <div className="container flex justify-between">
        <div className="flex-1 flex items-center gap-2">
          {showImportantLinks && (
            <SallaMenu source="footer" topnav className="morph-topbar__menu" suppressHydrationWarning />
          )}
          {multilingual && (
            <div className="header-buttons morph-topbar__switcher">
              <button
                type="button"
                className="morph-topbar__switcher-btn"
                onClick={() => openStoreSwitcher('language')}
                aria-label={languageName || t('blocks.header.language', 'Language')}
              >
                <LanguagesIcon aria-hidden="true" />
                <span className="hidden sm:inline">{languageName}</span>
              </button>
            </div>
          )}
          <div className="hidden lg:block">
            <salla-bullet-delivery-tag />
          </div>
          {store?.scope && (
            <button
              type="button"
              className="btn--rounded-gray"
              onClick={() => openStoreSwitcher('branch')}
            >
              <i className="sicon-location rtl:ml-1 ltr:mr-1" aria-hidden="true" />
              {store.scope.name}
            </button>
          )}
        </div>
        <SallaContacts contacts={store?.contacts} contactsTitle="N/A" isHeader />
        <span className="sr-only">{t('common.titles.contacts', 'Contacts')}</span>
      </div>
    </div>
  );
}

/* The fullscreen resource (Mobile menu) index */
interface OverlayRow {
  menu: MenuItem;
  index: number;
}

function MorphOverlay({
  open,
  rows,
  onClose,
  labels,
}: {
  open: boolean;
  rows: OverlayRow[];
  onClose: () => void;
  labels: { close: string; shop: string };
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const chase = useRef({ x: -300, y: -300, tx: -300, ty: -300 });
  const raf = useRef(0);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // focus management + cursor-chasing card, ported from morph-header.js ⑤
  useLayoutEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    closeRef.current?.focus();
    chase.current.x = chase.current.tx = -300;
    chase.current.y = chase.current.ty = -300;
    // gentle CSS-only interval: rows stagger via inline delay, the card runs on rAF below
    const step = () => {
      const c = chase.current;
      c.x += (c.tx - c.x) * 0.14;
      c.y += (c.ty - c.y) * 0.14;
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${c.x}px,${c.y}px,0)`;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf.current);
      (openerRef.current as HTMLElement | null | undefined)?.focus?.();
      previewRef.current?.classList.remove('is-live');
    };
  }, [open]);

  const onMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    chase.current.tx = event.clientX;
    chase.current.ty = event.clientY;
  };

  const onMouseOverRow = (menu: MenuItem) => {
    // DOM property assignment (not an attribute): CSSOM parses `url("…")` and a
    // background has to remain a URL, not serialized text (old rule 19).
    if (cardRef.current) {
      const image = (menu as MenuItem & { image?: unknown }).image;
      cardRef.current.style.backgroundImage = typeof image === 'string' && image ? `url(${JSON.stringify(image)})` : '';
    }
    if (labelRef.current) labelRef.current.textContent = menu.title ?? '';
    previewRef.current?.classList.add('is-live');
  };

  return (
    <div
      id="morph-overlay"
      className={`morph-overlay${open ? '' : ' is-hidden'}`}
      onMouseMove={onMouseMove}
      onMouseLeave={() => previewRef.current?.classList.remove('is-live')}
      aria-hidden={!open}
    >
      <div className="morph-overlay__inner">
        <div className="morph-overlay__head">
          <button type="button" ref={closeRef} className="morph-overlay__close" onClick={onClose}>
            {/* the merchant's `header_icon_close` rides the settings too; the
                overlay keeps the design glyph as its legacy default */}
            <span data-testid="morph-overlay-close-label">{labels.close}</span>
            <MorphIco setting={undefined} legacy="x" />
          </button>
        </div>

        <nav className="morph-overlay__nav" data-testid="morph-overlay-nav" aria-label="main menu">
          {rows.map(({ menu, index }) => (
            /* the row band is a plain div — the engine `Link` takes no mouse
               props, and the preview's hover hooks belong to the band */
            <div
              key={String(menu.id) + String(menu.url)}
              className="morph-overlay__row"
              onMouseOver={() => onMouseOverRow(menu)}
            >
              <Link to={menu.url || '#'} className="morph-overlay__row-link">
                <span
                  className="morph-overlay__row-inner"
                  style={{ animationDelay: `${(0.12 + index * 0.06).toFixed(2)}s` }}
                >
                  <span className="morph-overlay__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="morph-overlay__label">{menu.title}</span>
                  <span className="morph-overlay__cta">{labels.shop} →</span>
                </span>
              </Link>
            </div>
          ))}
          {!rows.length && <p className="morph-overlay__empty-row"></p>}
        </nav>

        <div className="morph-overlay__foot">
          <span className="morph-overlay__note">
            <SallaSocial data-testid="morph-header-social" />
          </span>
        </div>
      </div>

      <div className="morph-overlay__preview" ref={previewRef} aria-hidden="true">
        <div className="morph-overlay__preview-card" ref={cardRef} />
        <p className="morph-overlay__preview-label" ref={labelRef} />
      </div>
    </div>
  );
}

/* Settings we consume (typed only where the engine's `settings` is unknown) */
interface MorphSettings {
  header_glass_color?: unknown;
  header_glass_opacity?: unknown;
  header_blur?: unknown;
  header_text_color?: unknown;
  header_nav_font_size?: unknown;
  header_nav_weight?: unknown;
  header_topbar_hide?: unknown;
  header_theme_toggle?: unknown;
  header_icon_menu?: unknown;
  header_icon_search?: unknown;
  header_icon_account?: unknown;
  header_icon_localization?: unknown;
  header_icon_cart?: unknown;
  header_icon_close?: unknown;
  important_links?: unknown;
  /* the curtain mega menu's merchant slots (the theme's only collection) */
  curtain_slots?: unknown;
}

/**
 * The MorphPill header. Selected by the merchant through
 * `theme.settings.header_layout = 'morph'`; the default <Header/> keeps the
 * engine layouts untouched.
 */
export function MorphHeader() {
  const { store, theme } = useTwilight();
  const { t } = useTranslation();
  const isHomePage = useIsHome();
  const hydrated = useHydrated();
  const isProductPage = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === 'product'),
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const s = (theme?.settings ?? {}) as MorphSettings;

  /* True translations live in locales/ar.json + en.json (`blocks.header.*`).
     The fallbacks here are only for a missing key — kept SSR-safe (no
     `document` reads), with the design's Arabic as the base fallback. */
  const loc = (key: string, fallback: string) => t(key, fallback);

  /* ── settings → custom properties (inline, like the old style="…" hook) ── */
  const headerStyle = useMemo(() => {
    const style = {
      '--morph-glass-color': scalarSetting(s.header_glass_color) ?? '#ffffff',
      '--morph-glass-alpha': numberSetting(s.header_glass_opacity, 78),
      '--morph-blur': `${numberSetting(s.header_blur, 18)}px`,
      '--morph-fg': scalarSetting(s.header_text_color) ?? '#0f172a',
      '--morph-nav-size': `${numberSetting(s.header_nav_font_size, 14)}px`,
      '--morph-nav-weight': scalarSetting(s.header_nav_weight) ?? '700',
    } as CSSProperties;
    return style;
  }, [s.header_glass_color, s.header_glass_opacity, s.header_blur, s.header_text_color, s.header_nav_font_size, s.header_nav_weight]);

  const icons = {
    menu: s.header_icon_menu,
    search: s.header_icon_search,
    account: s.header_icon_account,
    localization: s.header_icon_localization,
    cart: s.header_icon_cart,
    close: s.header_icon_close,
  };

  /* `header_topbar_hide` default ON = the bar collapses when the pill morphs:
     the attribute owns that state in the SCSS (desktop media query only). */
  const hideTopbarOn = s.header_topbar_hide !== false && scalarSetting(s.header_topbar_hide) !== 'false';
  const themeToggleOn = s.header_theme_toggle !== false && scalarSetting(s.header_theme_toggle) !== 'false';
  const topbarImportantLinks = s.important_links !== false && scalarSetting(s.important_links) !== 'false';

  /* ── store menu (shared lists) ── */
  const { menus, ready } = useStoreMenus();

  /* ── the one morph boolean ── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_MORPH_AT);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── height sync + the "under-header" lift (old morph-header.js §1) ──
     The first real home block inside #main-content is lifted by the value of
     `--salla-header-h` only when it opted in via `s-block--under-header`, and
     the html attribute drives the header transparency in the SCSS. This mirrors
     the Twig port verbatim — the block wrapper is the engine's own home
     scaffold, so the theme cannot lift it through props; it is the documented
     counterpart of the `s-block--under-header` flag the block config emits. */
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const setHeight = () =>
      document.documentElement.style.setProperty(
        '--salla-header-h',
        `${rootRef.current?.offsetHeight ?? 0}px`
      );
    setHeight();
    const settle = window.setTimeout(setHeight, 250);
    window.addEventListener('resize', setHeight, { passive: true });
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && rootRef.current) {
      observer = new ResizeObserver(setHeight);
      observer.observe(rootRef.current);
    }
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', setHeight);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const onMobile = window.innerWidth < DESKTOP_MIN;
    const block = onMobile ? null : document.querySelector<HTMLElement>('#main-content .s-block');
    const lift = block?.classList.contains('s-block--under-header') ? block : null;
    document.documentElement.toggleAttribute('data-morph-lift', Boolean(lift));
    return () => document.documentElement.removeAttribute('data-morph-lift');
  }, [pathname, menus]);

  /* ── the magnetic nav + blob (old §2, ported with the same rules) ── */
  const navRef = useRef<HTMLElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const hoverLinkRef = useRef<HTMLAnchorElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const magneticRaf = useRef(0);
  const reducedMotion =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

  const moveBlob = (link: HTMLAnchorElement | null) => {
    const blob = blobRef.current;
    const nav = navRef.current;
    if (!blob || !nav) return;
    const clear = () => {
      hoverLinkRef.current = null;
      blob.classList.remove('is-on');
      blob.style.translate = '';
      linksRef.current.forEach((item) => item.classList.remove('is-on-blob'));
    };
    if (!link) {
      clear();
      return;
    }
    // mouseover bubbles from the label and the caret — re-placing on the same
    // link would restart the slide on every glyph (old moveBlob guard).
    if (link === hoverLinkRef.current) return;
    hoverLinkRef.current = link;
    const navRect = nav.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    // Position on the LAYOUT box (magnetic lean already included in the rect).
    const mx = (link as unknown as { _mx?: number })._mx || 0;
    const my = (link as unknown as { _my?: number })._my || 0;
    const dx = r.left - mx - navRect.left - blob.offsetLeft;
    const dy = r.top - my - navRect.top - blob.offsetTop;
    const appearing = !blob.classList.contains('is-on');
    if (appearing) blob.style.transition = 'none';
    blob.style.width = `${r.width}px`;
    blob.style.height = `${r.height}px`;
    blob.style.transform = `translate3d(${dx}px,${dy}px,0)`;
    blob.style.translate = `${mx}px ${my}px`;
    blob.classList.add('is-on');
    if (appearing) {
      // Flush the size at its final value, then restore the stylesheet's
      // transition so later slides still glide (no 0x0 → launch flash).
      void blob.offsetWidth;
      blob.style.transition = '';
    }
    linksRef.current.forEach((item) => item.classList.toggle('is-on-blob', item === link));
  };

  // per-frame lean toward the cursor; blob leans with its link
  useEffect(() => {
    if (reducedMotion) return;
    const nav = navRef.current;
    if (!nav) return;
    const apply = () => {
      magneticRaf.current = 0;
      const pointer = pointerRef.current;
      if (!pointer) return;
      linksRef.current.forEach((link) => {
        // measure the LAYOUT box (subtract the lean already applied)
        const r = link.getBoundingClientRect();
        const memo = link as unknown as { _mx: number; _my: number };
        memo._mx = memo._mx || 0;
        memo._my = memo._my || 0;
        const cx = r.left - memo._mx + r.width / 2;
        const cy = r.top - memo._my + r.height / 2;
        const dx = (pointer.x - cx) * 0.22;
        const dy = (pointer.y - cy) * 0.32;
        memo._mx = Math.min(Math.max(dx, -10), 10);
        memo._my = Math.min(Math.max(dy, -5), 5);
        link.style.transform = `translate3d(${memo._mx}px,${memo._my}px,0)`;
      });
      const hovered = hoverLinkRef.current;
      if (blobRef.current && hovered) {
        // lean the blob with its link (the same memo the links use)
        const lean = hovered as unknown as { _mx?: number; _my?: number };
        blobRef.current.style.translate = `${lean._mx ?? 0}px ${lean._my ?? 0}px`;
      }
    };
    const onMove = (event: MouseEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (!magneticRaf.current) magneticRaf.current = requestAnimationFrame(apply);
    };
    nav.addEventListener('mousemove', onMove);
    return () => {
      nav.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(magneticRaf.current);
    };
  }, [reducedMotion, ready]); // re-bind with the real list

  // listeners that own the hot link state (re-bound with menus)
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('.morph-link');
      if (!link) return;
      moveBlob(link);
      /* Hovering ANY category opens the curtain — the design's one panel, and
         a childless category still shows its empty state; hover is not a
         navigation gesture (old rule 9). Opening one screen closes the others
         (the old showPanel ran closeSearch + closeOverlay). */
      const at = linksRef.current.indexOf(link);
      if (curtainIndexRef.current !== at) {
        curtainIndexRef.current = at;
        setCurtainIndex(at);
        setCurtainFocusId(null);
        setSearchOpen(false);
        setOverlayOpen(false);
      }
      linksRef.current.forEach((item) => item.classList.toggle('is-open', item === link));
      if (link.dataset.morphHas === '1') link.setAttribute('aria-expanded', 'true');
    };
    const onOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('.morph-link');
      if (link && !link.contains(event.relatedTarget as Node)) {
        link.classList.remove('is-open');
        if (link.getAttribute('aria-expanded')) link.setAttribute('aria-expanded', 'false');
      }
    };
    const onLeave = () => {
      moveBlob(null);
      // leave-lean reset
      linksRef.current.forEach((link) => {
        const memo = link as unknown as { _mx: number; _my: number };
        link.style.transform = '';
        memo._mx = 0;
        memo._my = 0;
      });
      if (blobRef.current) blobRef.current.style.translate = '';
      pointerRef.current = null;
    };
    nav.addEventListener('mouseover', onOver);
    nav.addEventListener('mouseout', onOut);
    nav.addEventListener('mouseleave', onLeave);
    return () => {
      nav.removeEventListener('mouseover', onOver);
      nav.removeEventListener('mouseout', onOut);
      nav.removeEventListener('mouseleave', onLeave);
      moveBlob(null);
    };
  }, [ready]);

  /* ── the curtain (old §3): one panel, hovered nav category owns it ── */
  const [curtainIndex, setCurtainIndex] = useState<number | null>(null);
  const [curtainFocusId, setCurtainFocusId] = useState<string | null>(null);
  const curtainIndexRef = useRef<number | null>(null);

  /** `closePanel` of the old file: hide, clear the focus, drop every link's
      open state — a panel never lingers behind its own trigger. */
  const closeCurtain = useCallback(() => {
    if (curtainIndexRef.current == null) return;
    curtainIndexRef.current = null;
    setCurtainIndex(null);
    setCurtainFocusId(null);
    linksRef.current.forEach((item) => {
      item.classList.remove('is-open');
      if (item.getAttribute('aria-expanded')) item.setAttribute('aria-expanded', 'false');
    });
  }, []);

  /* Leaning the header entirely (pill or curtain) closes the panel — the
     curtain never covers the page, so there is nothing to keep it open for.
     The old root `mouseleave` ran closePanel + the same blob/lean reset the
     nav's own mouseleave does; the pointer can leave through either half. */
  const onHeaderLeave = useCallback(() => {
    closeCurtain();
    moveBlob(null);
    linksRef.current.forEach((link) => {
      const memo = link as unknown as { _mx: number; _my: number };
      link.style.transform = '';
      memo._mx = 0;
      memo._my = 0;
    });
    if (blobRef.current) blobRef.current.style.translate = '';
    pointerRef.current = null;
  }, [closeCurtain]);

  /* ── expanding search (old §6) ── */
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchFieldRef = useRef<HTMLDivElement>(null);

  /* mount the platform's inline search widget post-hydration — see the JSX */
  useEffect(() => {
    const field = searchFieldRef.current;
    if (!field || field.firstElementChild) return;
    const search = document.createElement('salla-search');
    search.setAttribute('inline', '');
    search.setAttribute('oval', '');
    search.setAttribute('height', '36');
    field.appendChild(search);
    return () => {
      field.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const input = searchRef.current?.querySelector('input');
    const focus = window.setTimeout(() => input?.focus(), 220);
    return () => window.clearTimeout(focus);
  }, [searchOpen]);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  /* ── fullscreen index (burger) ── */
  const [overlayOpen, setOverlayOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
   }, [overlayOpen]);

  /* ── light / dark with the View Transition reveal (old §0) ── */
  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const toggleDark = () => {
    const rootEl = document.documentElement;
    const next = !rootEl.classList.contains('dark');
    // aria state (label/pressed) — the glyph itself is pure CSS off `html.dark`
    setDark(next);
    const apply = () => {
      rootEl.classList.toggle('dark', next);
      try {
        window.localStorage.setItem('seelyxa-theme', next ? 'dark' : 'light');
      } catch {
        /* storage can be unavailable; the border-case is theme-only */
      }
    };
    if (reducedMotion || typeof document.startViewTransition !== 'function') {
      apply();
      return;
    }
    const btn = themeBtnRef.current;
    if (!btn) {
      apply();
      return;
    }
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    rootEl.style.setProperty('--morph-theme-x', `${x}px`);
    rootEl.style.setProperty('--morph-theme-y', `${y}px`);
    rootEl.style.setProperty('--morph-theme-r', `${r}px`);
    rootEl.classList.add('theme-transition');
    const transition = document.startViewTransition(apply);
    transition.finished.then(
      () => rootEl.classList.remove('theme-transition'),
      () => rootEl.classList.remove('theme-transition')
    );
  };

  /* ── escape cascade: overlay → search → curtain → account (old §7) ── */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (overlayOpen) setOverlayOpen(false);
      else if (searchOpen) setSearchOpen(false);
      else if (curtainIndexRef.current != null) closeCurtain();
      else closeAccount();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlayOpen, searchOpen, closeCurtain]);

  /* ── labels ── */
  const labels = {
    menu: loc('blocks.header.main_menu', 'القائمة'),
    search: loc('blocks.header.search', 'بحث'),
    account: loc('common.titles.account', 'حسابي'),
    language: loc('blocks.header.language', 'اللغة'),
    close: loc('blocks.header.close', 'إغلاق'),
    shop: loc('blocks.header.shop', 'تسوّق'),
    accountNote: loc('blocks.header.account_note', 'شحن مجاني للطلبات فوق 900 ر.س'),
    darkMode: loc('blocks.header.theme_dark', 'الوضع الليلي'),
    lightMode: loc('blocks.header.theme_light', 'الوضع النهاري'),
    emptyStore: loc('blocks.header.morph_empty_store', 'لا توجد أقسام في المتجر بعد.'),
    more: loc('common.titles.more', 'المزيد'),
  };

  /* the curtain's own labels — same fallback rule as the block above */
  const curtainLabels: CurtainLabels = {
    noSubs: loc('blocks.header.curtain_no_subs', 'لا توجد أقسام فرعية في هذا القسم.'),
    noSlot: loc('blocks.header.curtain_no_slot', 'لم تُضبط خانة لهذا القسم بعد.'),
    noSlotHere: loc('blocks.header.curtain_no_slot_here', 'الخانة مربوطة بقسم آخر.'),
    slotHint: loc('blocks.header.curtain_slot_hint', 'اجعل خانة «مميزة» تخص هذا القسم من تخصيص التصميم.'),
    noSlotMissing: loc(
      'blocks.header.curtain_no_slot_missing',
      'الثيم لم يستلم أي قيمة لخانات «مميزة» — هذه مشكلة في الثيم، وإعادة حفظ النموذج لن تحلها.'
    ),
    slotMissingHint: loc(
      'blocks.header.curtain_slot_missing_hint',
      'السطر بالأسفل فيه شكل البيانات اللي وصلنا — ابعته لمطوّر الثيم.'
    ),
    featured: loc('blocks.home.featured_products', 'مميزة'),
    categoryProducts: loc('blocks.header.curtain_category_products', 'منتجات'),
    emptyFeatured: loc(
      'blocks.header.curtain_empty_featured',
      'لا توجد منتجات مميزة في هذا القسم بعد.'
    ),
  };
  const piecesLabel = (n: number) => `${n} ${loc('blocks.header.curtain_piece', 'منتج')}`;

  const closeLabelRef = useRef(labels.close);
  closeLabelRef.current = labels.close;

  /* ── account takeover (old §7): the platform's own panel restyled into the
     same fullscreen screen, plus the cursor-chasing gradient preview and the
     body scroll lock, driven by a MutationObserver on the HOST exactly like
     the Twig theme — the list inside is the component's own render and may
     not exist at boot, and Preact can replace inner nodes at will. ── */
  const accountRef = useRef<HTMLElement>(null);
  const accountPreviewRef = useRef<HTMLDivElement>(null);
  const accountCardRef = useRef<HTMLDivElement>(null);
  const accountLabelRef = useRef<HTMLParagraphElement>(null);
  const accountChase = useRef({ x: -300, y: -300, tx: -300, ty: -300 });
  const accountRaf = useRef(0);

  useEffect(() => {
    const host = accountRef.current;
    const preview = accountPreviewRef.current;
    if (!host || !preview) return;
    const chase = accountChase.current;
    const isOpen = () => Boolean(host.querySelector('.s-user-menu-toggler.opened'));
    const rows = () => host.querySelectorAll('.s-user-menu-dropdown-item');

    /* the platform's close button ships the X only; the overlay's reads
       `[Close] [X]` — the word is drawn by CSS off this attribute, so the
       button stays untouched and still follows the page language. */
    const syncClose = () => {
      host
        .querySelectorAll('.s-user-menu-dropdown-header-close')
        .forEach((btn) => btn.setAttribute('data-close-text', closeLabelRef.current));
    };

    const step = () => {
      accountRaf.current = 0;
      chase.x += (chase.tx - chase.x) * 0.14;
      chase.y += (chase.ty - chase.y) * 0.14;
      preview.style.transform = `translate3d(${chase.x}px,${chase.y}px,0)`;
      if (isOpen()) accountRaf.current = requestAnimationFrame(step);
    };

    const track = (event: MouseEvent) => {
      if (reducedMotion) {
        // park on the pointer — never the one animated spot on the page
        chase.x = chase.tx = event.clientX;
        chase.y = chase.ty = event.clientY;
        preview.style.transform = `translate3d(${chase.x}px,${chase.y}px,0)`;
        return;
      }
      if (event.clientX || event.clientY) {
        chase.tx = event.clientX;
        chase.ty = event.clientY;
        if (!accountRaf.current) accountRaf.current = requestAnimationFrame(step);
      }
    };

    const onOver = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '.s-user-menu-dropdown-item a'
      );
      if (!link) return;
      const row = link.parentElement;
      const list = rows();
      const at = Array.prototype.indexOf.call(list, row);
      if (at < 0) return;
      if (accountCardRef.current) {
        accountCardRef.current.style.backgroundImage =
          ACCOUNT_GRADIENTS[at % ACCOUNT_GRADIENTS.length];
      }
      if (accountLabelRef.current) {
        const title = row?.querySelector('.s-user-menu-dropdown-item-title');
        accountLabelRef.current.textContent = title ? (title.textContent ?? '') : '';
      }
      preview.classList.add('is-live');
    };
    const onLeave = () => preview.classList.remove('is-live');

    host.addEventListener('mouseover', onOver);
    host.addEventListener('mouseleave', onLeave);
    host.addEventListener('mousemove', track);

    // observed on the HOST with subtree — survives Preact replacing nodes, and
    // covers the platform's own outside-click close (`opened = false`)
    let observer: MutationObserver | undefined;
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(() => {
        const open = isOpen();
        document.body.style.overflow = open ? 'hidden' : '';
        syncClose();
        if (!open) {
          preview.classList.remove('is-live');
          chase.x = chase.tx = -300;
          chase.y = chase.ty = -300;
        }
      });
      observer.observe(host, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
        childList: true,
      });
    }
    syncClose();
    return () => {
      host.removeEventListener('mouseover', onOver);
      host.removeEventListener('mouseleave', onLeave);
      host.removeEventListener('mousemove', track);
      observer?.disconnect();
      cancelAnimationFrame(accountRaf.current);
      if (!host.querySelector('.s-user-menu-toggler.opened')) {
        document.body.style.overflow = '';
      }
    };
  }, [reducedMotion]);

  /** Escape's last resort: the account takeover closes through its own API. */
  const closeAccount = () => {
    const host = accountRef.current as (HTMLElement & { opened?: boolean }) | null;
    if (!host || !host.querySelector('.s-user-menu-toggler.opened')) return false;
    host.opened = false;
    return true;
  };

  // aria state only; the glyph is pure CSS off `html.dark`, so there is no
  // icon state to keep fresh (old theme kept both glyphs in the markup for
  // exactly that reason).
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const overlayRows: OverlayRow[] = useMemo(
    () => menus.map((menu, index) => ({ menu, index })) as OverlayRow[],
    [menus]
  );

  /* the merchant's curtain slots — `curtain_slots` normalised once per save;
     the map is keyed under every candidate shape (see lib/curtainSlots) */
  const slotsMap = useMemo(() => readSlots(s.curtain_slots), [s.curtain_slots]);

  /* ── the nav stays on one line: items that don't fit move under a last
     «المزيد» item, exactly like the default header's one-line menu. That is
     what keeps the links off the brand and off the action icons at narrow
     desktop widths — the previously unguarded pill let its overflow paint
     over both. Hovering «المزيد» opens the SAME curtain, with the
     overflowing links as its subcategory discs (one panel, old rule 9). ── */
  const navKey = useMemo(() => menuKey(menus), [menus]);
  const moreProbeRef = useRef<HTMLSpanElement>(null);
  const [navMeasured, setNavMeasured] = useState<{
    key: string;
    widths: number[];
    more: number;
    gap: number;
  } | null>(null);
  const [navAvailable, setNavAvailable] = useState(0);

  const navCurrent = navMeasured?.key === navKey ? navMeasured : null;
  const navFit = navCurrent
    ? fitCount(navCurrent.widths, navAvailable, navCurrent.more, navCurrent.gap)
    : menus.length;
  const shownMenus = useMemo(
    () => (navCurrent ? splitMenu(menus, navFit, labels.more) : menus),
    [navCurrent, menus, navFit, labels.more]
  );

  /* Measure the full menu before it paints (the render below shows every link
     while `navCurrent` is null). Below 1025px the nav is `display: none` so
     everything measures 0 — the resize observer re-runs this once it has a
     width. */
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (navCurrent || !nav || !menus.length) return;
    const width = nav.clientWidth;
    setNavAvailable(width);
    if (width === 0) return;
    const links = nav.querySelectorAll<HTMLElement>(':scope > .morph-link');
    setNavMeasured({
      key: navKey,
      widths: Array.from(links, (link) => link.getBoundingClientRect().width),
      more: moreProbeRef.current?.getBoundingClientRect().width ?? 0,
      gap: parseFloat(getComputedStyle(nav).columnGap) || 0,
    });
  }, [navCurrent, menus, navKey, navAvailable, ready]);

  // The width the nav has to fill (also fires when the pill morphs 1600→880).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setNavAvailable(nav.clientWidth));
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  // Text measured before the web font loaded is narrower than it will be.
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts || document.fonts.status === 'loaded') {
      return;
    }
    let active = true;
    document.fonts.ready.then(() => {
      if (active) setNavMeasured(null);
    });
    return () => {
      active = false;
    };
  }, []);

  /* The helper list must mirror the LIVE DOM in order (old rule 11: one index
     space). Splitting unsplitting the row re-keys and swaps link elements; a
     push-only ref callback left stale entries behind, which shifted every
     `linksRef.indexOf` off by the removed row. Rebuild it from the nav, and
     drop a hover reference the DOM no longer holds. */
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    linksRef.current = Array.from(
      nav.querySelectorAll<HTMLAnchorElement>(':scope > .morph-link')
    );
    if (hoverLinkRef.current && !linksRef.current.includes(hoverLinkRef.current)) {
      moveBlob(null);
    }
  }, [shownMenus, ready]);

  const curtainMenu: CurtainMenu | null =
    curtainIndex != null
      ? ((shownMenus[curtainIndex] as CurtainMenu | undefined) ?? null)
      : null;

  const searchToggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSearchOpen((open) => !open);
  };

  // the slot content the component copies; the click belongs to salla-user-menu
  const accountSlot = (
    <Fragment>
      <MorphIco setting={icons.account} legacy="user" className="morph-account-ico" />
      <span className="morph-sr-only">{labels.account}</span>
    </Fragment>
  );

  return (
    <header
      ref={rootRef}
      data-testid="morph-header"
      className={`morph-header${scrolled ? ' is-scrolled' : ''}${ready ? ' is-ready' : ''}`}
      style={headerStyle}
      {...(hideTopbarOn ? { 'data-hide-topbar': '' } : {})}
      onMouseLeave={onHeaderLeave}
      suppressHydrationWarning
    >
      {/* ① utility top bar */}
      <MorphTopbar scrolled={scrolled} showImportantLinks={topbarImportantLinks} />

      {/* ② the pill */}
      <div className="morph-bar">
        <div className={`morph-pill${searchOpen ? ' morph-pill--search-open' : ''}`} data-testid="morph-pill">
          <div className="morph-pill__lead">
            <button
              type="button"
              className="morph-burger"
              data-testid="morph-header-burger"
              aria-controls="morph-overlay"
              aria-expanded={overlayOpen}
              aria-label={labels.menu}
              onClick={() => {
                setOverlayOpen(true);
                // opening one screen closes the others (the old opening set)
                closeCurtain();
              }}
            >
              <MorphIco setting={icons.menu} legacy="menu" />
            </button>
            <Link to={store?.url || '/'} className="morph-brand" data-testid="morph-header-logo">
              <Image src={store?.logo} alt={`${store?.name || 'Store'} logo`} priority width={175} height={48} />
              <span className="morph-sr-only">{store?.name}</span>
              {/* post-hydration h1 for home SEO — during hydration the level
                  is stable (h2) because `useIsHome` settles after mount, and
                  an h1/h2 flip there breaks React hydration (seen live) */}
              {isHomePage && hydrated ? (
                <h1 className="morph-sr-only">{store?.name}</h1>
              ) : (
                <h2 className="morph-sr-only">{store?.name}</h2>
              )}
            </Link>
          </div>

          {/* center nav ≥1025px, magnetic + blob */}
          <nav ref={navRef} className="morph-pill__nav" aria-label={labels.menu} data-testid="morph-nav">
            {!ready && (
              <span className="morph-nav__skel" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </span>
            )}
            {ready && !menus.length && <p className="morph-nav__empty">{labels.emptyStore}</p>}
            {shownMenus.map((item) => {
              const hasKids = (item.children?.length ?? 0) > 0;
              /* «المزيد» is synthetic — it opens nowhere; hovering it shows the
                 overflowing links in the curtain (its children), so a plain
                 anchor that refuses the jump. */
              if (item.id === MORE_MENU_ID) {
                return (
                  <a
                    key={MORE_MENU_ID}
                    href="#"
                    className="morph-link"
                    data-morph-more="1"
                    data-morph-has="1"
                    aria-haspopup="true"
                    aria-expanded="false"
                    data-testid="morph-more"
                    onClick={(event) => event.preventDefault()}
                  >
                    <span>{item.title}</span>
                    {CARET}
                  </a>
                );
              }
              return (
                <Link
                  key={`${String(item.id)}-${item.url}`}
                  to={item.url || '#'}
                  className="morph-link"
                  data-morph-has={hasKids ? '1' : undefined}
                  aria-haspopup={hasKids || undefined}
                  aria-expanded={hasKids ? 'false' : undefined}
                >
                  <span>{item.title}</span>
                  {hasKids && CARET}
                </Link>
              );
            })}
            {/* Sizes «المزيد» before it exists; styled like a real link and
                hidden (visibility, not display) so the widths stay honest. */}
            {navCurrent == null && ready && menus.length > 0 && (
              <span className="morph-nav__probe" aria-hidden="true">
                <span ref={moreProbeRef} className="morph-link" data-morph-has="1">
                  <span>{labels.more}</span>
                  {CARET}
                </span>
              </span>
            )}
            <span ref={blobRef} className="morph-blob" data-testid="morph-blob" aria-hidden="true" />
          </nav>

          {/* actions */}
          <div className="morph-pill__actions" data-testid="morph-header-actions">
            <button
              type="button"
              className="morph-icon-btn morph-localization-btn"
              onClick={() => openStoreSwitcher('language')}
              aria-label={labels.language}
              data-testid="morph-localization-btn"
            >
              <MorphIco setting={icons.localization} legacy="languages" />
            </button>

            <div className="hidden 2xl:block">
              <salla-bullet-delivery-tag />
            </div>

            {/* the disc: live search clipped, our glyph covering it until open */}
            <div ref={searchRef} className={`morph-search${searchOpen ? ' is-open' : ''}`} data-testid="morph-search">
              <div className="morph-search__field" ref={searchFieldRef}>
              {/* `salla-search` mounts AFTER hydration (the engine does the same
                  for its heavy stencil widgets in ThemeLayout): the platform's
                  own runtime upgrades the element before React hydrates, and a
                  JSX-rendered `<salla-search>` then fails hydration against the
                  upgraded DOM — server keeps the field empty and the disc's
                  glyph covers it, so nothing flashes. */}
            </div>
              <button
                type="button"
                className={`morph-search__toggle${searchOpen ? ' is-active' : ''}`}
                aria-expanded={searchOpen}
                aria-label={labels.search}
                onClick={searchToggle}
              >
                <MorphIco
                  setting={icons.search}
                  legacy="search"
                  className={`morph-search__glyph morph-search__glyph--open${searchOpen ? ' morph-search__glyph--hidden' : ''}`}
                />
                <MorphIco
                  setting={icons.close}
                  legacy="x"
                  className={`morph-search__glyph morph-search__glyph--close${searchOpen ? '' : ' morph-search__glyph--hidden'}`}
                />
              </button>
            </div>

            {themeToggleOn && (
              <button
                type="button"
                ref={themeBtnRef}
                className="morph-icon-btn morph-theme-btn"
                onClick={toggleDark}
                aria-label={dark ? labels.lightMode : labels.darkMode}
                aria-pressed={dark}
                data-testid="morph-theme-btn"
              >
                <span className="morph-ico morph-theme-btn__glyph morph-theme-btn__moon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                  </svg>
                </span>
                <span className="morph-ico morph-theme-btn__glyph morph-theme-btn__sun" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                </span>
              </button>
            )}

            {/* account: the takeover's trigger is the slot copy — the class lives
                on the CONTENT the component copies, not the wrapper (old rule 4) */}
            <SallaUserMenu
              ref={accountRef as never}
              avatarOnly
              showHeader
              showTrigger
              data-testid="morph-user-menu"
              suppressHydrationWarning
            >
              <span slot="trigger" className="morph-account-slot">
                {accountSlot}
              </span>
              <span slot="login-btn" className="morph-account-slot">
                {accountSlot}
              </span>
            </SallaUserMenu>

            {/* hover preview for the account takeover — the overlay's own
                cursor-chasing card, reused so both screens share one object.
                Sits OUTSIDE `salla-user-menu` because the component owns (and
                re-renders) everything inside its own panel. */}
            <div
              ref={accountPreviewRef}
              className="morph-overlay__preview morph-account-preview"
              data-testid="morph-account-preview"
              aria-hidden="true"
            >
              <div className="morph-overlay__preview-card" ref={accountCardRef} />
              <p className="morph-overlay__preview-label" ref={accountLabelRef} />
            </div>

            {/* the takeover's other half: `.morph-overlay` is one self-contained
                box, but here the head and the nav are the platform's own
                children which we only restyle — so the foot is mounted here and
                pinned to the same insets, which is what makes the two screens
                read as one design. */}
            <div className="morph-overlay__foot morph-account-foot" aria-hidden="true">
              <span className="morph-overlay__note">{labels.accountNote}</span>
              <span className="morph-overlay__social">
                <SallaSocial data-testid="morph-header-account-social" />
              </span>
            </div>

            <SallaCartSummary data-testid="morph-cart-summary" suppressHydrationWarning>
              <span slot="icon" className="morph-ico header-btn__icon icon" data-testid="morph-cart-icon">
                <MorphIco
                  setting={icons.cart}
                  legacy="bag"
                  className="morph-ico--slot"
                />
              </span>
            </SallaCartSummary>
          </div>
        </div>
      </div>

      {/* ③ the curtain mega menu — the hovered nav category's own panel.
          Inside the header element: its `top:100%` hair needs a hover bridge
          to exist (old rule 10), and being a child both the panel and the
          pointer state survive moving down through the gap. */}
      <MorphCurtain
        open={curtainMenu != null}
        menu={curtainMenu}
        focusId={curtainFocusId}
        slots={slotsMap}
        slotsRaw={s.curtain_slots}
        labels={curtainLabels}
        pieces={piecesLabel}
        onDrill={(node) => setCurtainFocusId(String(node.id))}
      />

      {/* ④ fullscreen index (burger) */}
      <MorphOverlay
        open={overlayOpen}
        rows={overlayRows}
        onClose={() => setOverlayOpen(false)}
        labels={{ close: labels.close, shop: labels.shop }}
      />
    </header>
  );
}

/** Whether the merchant picked the MorphPill layout for this theme. */
export function useMorphHeaderEnabled(): boolean {
  const { theme } = useTwilight();
  return (theme?.settings as { header_layout?: string } | undefined)?.header_layout === 'morph';
}
