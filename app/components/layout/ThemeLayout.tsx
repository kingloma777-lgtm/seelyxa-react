import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { Footer } from '@salla.sa/twilight-theme-engine/layout';
import { initLoginIframeTheme } from '../../lib/loginIframeTheme';
import { applyColorMode, readSavedColorMode, resolveColorMode } from '../../lib/colorMode';
import { initScrollReveal } from '../../lib/scrollReveal';
import {
  closeHeaderMenu,
  getHeaderMenuState,
  openHeaderMenu,
  subscribeHeaderMenu,
} from '../../lib/headerMenu';
import {
  ProductCardSettingsContext,
  readProductCardSettings,
  productCardFlags,
  productCardVars,
} from '../../lib/productCardSettings';
import {
  GlobalSettingsContext,
  applyGlobalSettings,
  globalVars,
  readGlobalSettings,
} from '../../lib/storeSettings';
import { Header } from './Header';
import { ImportantLinksSheet } from './ImportantLinksSheet';
import { MobileAccountSheet } from './MobileAccountSheet';
import { MobileBottomBar } from './MobileBottomBar';
import { MobilePageTitleBar } from './MobilePageTitleBar';
import { UserMenuSheet } from './UserMenuSheet';

/**
 * Theme layout — passed to `<TwilightProvider layout={ThemeLayout}>` in
 * `app/routes/__root.tsx` to swap in the rebuilt {@link Header} and the same
 * global modals (offer / login / scopes) as the engine's `MasterLayout`.
 *
 * `Footer` is the engine's own shared component (`@salla.sa/twilight-theme-engine/layout`)
 * now, not a theme-owned fork -- `Header` stays theme-owned since it's deeply
 * specific to this theme's nav/search/account UI.
 */
const SallaLoginModal = lazy(() =>
  import('@salla.sa/twilight-components-react/login-modal').then((m) => ({
    default: m.SallaLoginModal,
  }))
);
/* The store's own login popup — lazy so the tel-input web component wrapper
   stays out of the main bundle until a guest actually needs it. */
const LoginAuthModal = lazy(() =>
  import('./LoginAuthModal').then((m) => ({ default: m.LoginAuthModal }))
);
const SallaScopes = lazy(() =>
  import('@salla.sa/twilight-components-react/scopes').then((m) => ({
    default: m.SallaScopes,
  }))
);
const SallaOfferModal = lazy(() =>
  import('@salla.sa/twilight-components-react/offer-modal').then((m) => ({
    default: m.SallaOfferModal,
  }))
);
const SallaLocalizationModal = lazy(() =>
  import('@salla.sa/twilight-components-react/localization-modal').then((m) => ({
    default: m.SallaLocalizationModal,
  }))
);

export interface ThemeLayoutProps {
  children: ReactNode;
}

/**
 * The engine's shared modals ThemeLayout mounts globally, each gated on
 * whether the store actually needs it: the offer modal always, the
 * language / currency switcher only when the store has more than one of
 * either, the login modal only for a guest, scopes only when the store has
 * one. Split out from {@link ThemeLayout} itself so that component stays
 * about the page structure (header, footer, bottom bar, sheets) rather than
 * also carrying every modal's own gating condition.
 */
function GlobalModals() {
  const { store, currency } = useTwilight();
  const { locale } = useTranslation();
  const { isLoggedIn } = useUser();
  const showLocalization =
    !!store?.settings?.is_multilingual || !!store?.settings?.currencies_enabled;

  return (
    <>
      <Suspense>
        <SallaOfferModal />
      </Suspense>

      {/* Language / currency switcher — the header nav's sticky footer buttons
          dispatch `localization::open`; mount the modal here since our Header
          replaces the engine one that normally hosts it. */}
      {showLocalization && (
        <Suspense>
          <SallaLocalizationModal
            language={locale}
            currency={currency?.code || 'SAR'}
            suppressHydrationWarning
          />
        </Suspense>
      )}

      {/* Login has two engines now. LoginAuthModal owns the surface the
          customer sees (email/mobile OTP + register, all through the SDK's
          auth API). SallaLoginModal stays mounted ONLY as the social handoff:
          the provider popup's postMessage callback can only be received by a
          window on accounts.salla.com's origin, so the hosted iframe inside
          it is irreplaceable for Google/Facebook/Apple. Both of its method
          flags are false on purpose — that disarms its own `login::open`
          listener, leaving LoginAuthModal as the sole owner of that event;
          the social handoff arms this instance (see `lib/loginIframeTheme.ts`)
          and then fires `login::open`, which is what builds its iframe. */}
      {!isLoggedIn && (
        <Suspense>
          <LoginAuthModal />
        </Suspense>
      )}

      {!isLoggedIn && (
        <Suspense>
          <SallaLoginModal
            id="seelyxa-hosted-login"
            isEmailAllowed={false}
            isMobileAllowed={false}
            suppressHydrationWarning
          />
        </Suspense>
      )}

      {store?.scope && (
        <Suspense>
          <SallaScopes
            selection={store?.scope?.display_as === 'popup' ? 'mandatory' : 'optional'}
            suppressHydrationWarning
          />
        </Suspense>
      )}
    </>
  );
}

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { theme } = useTwilight();
  // The morph header's fullscreen index is a module store (`lib/headerMenu`),
  // read here so the mobile bottom bar's Categories tab lights up while it is
  // open and can raise it (the header itself reads the same store).
  const navOpen = useSyncExternalStore(
    subscribeHeaderMenu,
    getHeaderMenuState,
    getHeaderMenuState
  ).open;
  // The mobile bottom bar's More tab opens this sheet (settings + contacts +
  // the footer widgets, which the page footer doesn't show on mobile).
  const [accountOpen, setAccountOpen] = useState(false);
  // Its own "Important links" row opens this one in turn -- a second
  // full-screen sheet for the footer menu, not a drill-in within the first.
  const [importantLinksOpen, setImportantLinksOpen] = useState(false);
  // Its own "Account" row (logged in) opens this one in turn -- mirrors the
  // desktop header's user-menu dropdown (notifications / orders / pending
  // orders / wishlist / profile / logout).
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close every sheet/drawer on any route change — a bottom-bar tab (Home,
  // Cart) or a link inside one of them navigates without touching their own
  // state, so they would otherwise stay open over the new page.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    closeHeaderMenu();
    setAccountOpen(false);
    setImportantLinksOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  /* Salla's login form is a cross-origin iframe. Its native dark class leaves
     a white canvas under white text, so keep the hosted palette light and let
     the scoped CSS inversion in login-modal.scss paint it dark. This bridge
     overrides the SDK's own darkMode message on every open/reload. */
  useEffect(() => initLoginIframeTheme(), []);

  /* Re-assert the colour mode after the engine has written its own.
     `TwilightProvider` mounts a sync component that adds `color-mode-*` to
     `<body>` from the MERCHANT's choice; the boot script only runs before
     `<body>` exists. So a visitor who chose dark would end up with a dark page
     and light embedded `<salla-*>` widgets. Child effects run before the
     layout's, so this lands after the engine's write — and it re-runs whenever
     the theme payload changes, which is the only time the engine writes again. */
  const merchantDark = (theme as { color?: { is_dark?: boolean } } | undefined)?.color?.is_dark === true;
  useEffect(() => {
    applyColorMode(resolveColorMode({ saved: readSavedColorMode(), merchantDark }));
  }, [merchantDark]);

  /* The store-wide design settings, read ONCE and handed down as context for
     the decisions CSS cannot make (a block that has to pick a layout, a test
     that renders a block alone). The custom properties themselves are NOT
     written here any more: they are server-rendered on `<html>` by
     `app/routes/__root.tsx`, because the scales they drive live on `:root` and
     because the cart drawer, the bottom sheets and the modals are portalled to
     `body` — outside `.app-inner`, where they would never inherit the value. */
  const globalSettings = readGlobalSettings(theme?.settings as Record<string, unknown> | undefined);

  /* The server already wrote these onto `<html>`, so the first run of this
     effect is a no-op in a published store. It exists for the values that
     change AFTER the first byte: the theme editor's live preview merges its
     state into `theme.settings` on the client only, so a merchant dragging a
     slider has to see the store move without a reload. Same emitter as the
     server render (`globalVars` + `globalAttributes`), so the two channels
     cannot disagree — and the string guard keeps a re-render that changed
     nothing from touching the root's inline style at all. */
  const appliedVars = useRef('');
  useEffect(() => {
    const key = JSON.stringify(globalVars(globalSettings));
    if (key === appliedVars.current) return;
    appliedVars.current = key;
    applyGlobalSettings(globalSettings);
  });

  /* One observer for every home block. Re-arm on navigation (new sections)
     and when the merchant flips the switch in the editor. The setting is read
     through `storeSettings`, so there is one place that knows how a `global_*`
     key is spelled and one place that decides what a missing value means
     (ON — a store installed before this field existed still animates). */
  const mainRef = useRef<HTMLElement>(null);
  const revealEnabled = globalSettings.scrollReveal;
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    return initScrollReveal(main, { enabled: revealEnabled });
  }, [pathname, revealEnabled]);

  /* One read of the card settings feeds the wrapper: the colours and radius as
     custom properties (the stylesheet's only source), the switches as data
     attributes (they hide elements the engine renders, so no component has to
     re-render to honour them), and the image ratio as the class the ratio
     block in `product.scss` already keys off. Server-rendered, so a card never
     paints the old design for a frame. */
  const card = readProductCardSettings(theme?.settings as Record<string, unknown> | undefined);
  const cardStyle = productCardVars(card) as CSSProperties;
  const cardFlags = productCardFlags(card) as Record<`data-${string}`, string>;
  const shellStyle = cardStyle as CSSProperties;

  /* `squar_photo_bg_image_size` used to be resolved here and published as
     `data-sq-fit` on `.app-inner`. It is a BLOCK setting, not a store one, so
     the block now owns it (`EnhancedSquareBanners` reads its own data first,
     then the saved theme value). Keeping it here meant every page carried an
     attribute only one block ever read. */

  return (
    <GlobalSettingsContext.Provider value={globalSettings}>
      <ProductCardSettingsContext.Provider value={card}>
        <div
          className={`app-inner flex flex-col min-h-full product-card-img--${card.ratio}`}
          style={shellStyle}
          {...cardFlags}
          suppressHydrationWarning
        >
          <Header />
          <MobilePageTitleBar />
          <main id="main-content" className="flex-1" ref={mainRef}>
            {children}
          </main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
          <MobileBottomBar
            navOpen={navOpen}
            onOpenNav={openHeaderMenu}
            onCloseNav={closeHeaderMenu}
            accountOpen={accountOpen}
            onAccountOpenChange={setAccountOpen}
            secondSheetOpen={importantLinksOpen || userMenuOpen}
            cartDrawerEnabled={
              (theme?.settings as Record<string, unknown> | undefined)?.enable_cart_drawer !== false
            }
            onCloseSecondSheet={() => {
              setImportantLinksOpen(false);
              setUserMenuOpen(false);
            }}
          />
        </div>

        <MobileAccountSheet
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          onOpenImportantLinks={() => {
            setAccountOpen(false);
            setImportantLinksOpen(true);
          }}
          onOpenUserMenu={() => {
            setAccountOpen(false);
            setUserMenuOpen(true);
          }}
        />

        <ImportantLinksSheet open={importantLinksOpen} onClose={() => setImportantLinksOpen(false)} />

        <UserMenuSheet open={userMenuOpen} onClose={() => setUserMenuOpen(false)} />

        <GlobalModals />
      </ProductCardSettingsContext.Provider>
    </GlobalSettingsContext.Provider>
  );
}
