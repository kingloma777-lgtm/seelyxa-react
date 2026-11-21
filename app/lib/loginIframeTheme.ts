/**
 * Login ownership bridge.
 *
 * 1. The store's own `LoginAuthModal` owns every guest login screen. The SDK
 *    mounts a SECOND `salla-login-modal` from `salla-user-menu`; its
 *    `login::open` listener would open the stock hosted iframe alongside ours.
 *    Setting BOTH method props to `false` on EVERY instance makes the SDK's own
 *    listener refuse to open — verified in the browser: zero
 *    `salla-modal.s-login-modal[visible]` after dispatch. We still keep our own
 *    instance disarmed from `ThemeLayout`; this covers the ones the platform
 *    injects later.
 *
 *    Social login does NOT need that modal: `lib/loginSocial.ts` opens the
 *    provider window itself and drives the accounts.salla.com handshake, so
 *    this disarm is absolute — there is no "armed" window any more, and the
 *    hosted form can never surface over our card.
 *
 * 2. If a hosted frame still appears (e.g. a platform-triggered flow), keep its
 *    own dark class off and invert it with our scoped CSS filter: `darkMode`
 *    whitens the form text but leaves the canvas white — white-on-white. Its
 *    bundle accepts a bridge message:
 *
 *      { source: 'login', type: 'darkMode', data: { isDark: false } }
 */

const LOGIN_ORIGIN = 'https://accounts.salla.com';
const LOGIN_FRAME = 'salla-modal.s-login-modal[visible] iframe';
const HOSTED_LOGIN_TAG = 'salla-login-modal';

type HostedLoginElement = HTMLElement & {
  isEmailAllowed?: boolean;
  isMobileAllowed?: boolean;
};

/**
 * The native element's `login::open` listener opens the hosted iframe only if
 * EITHER method prop is truthy, so both stay false on every instance. Writing
 * the properties (not just the attributes) matters: Stencil's boolean props
 * are backed by JS setters, and the properties are what its listener reads.
 */
function disarmNativeLoginModals(): void {
  document.querySelectorAll<HostedLoginElement>(HOSTED_LOGIN_TAG).forEach((element) => {
    if (element.isEmailAllowed !== false) element.isEmailAllowed = false;
    if (element.isMobileAllowed !== false) element.isMobileAllowed = false;
  });
}

// Deliberately false in both themes: the dark appearance is our CSS filter.
const HOSTED_PALETTE_MESSAGE = {
  source: 'login',
  type: 'darkMode',
  data: { isDark: false },
} as const;

function isLoginFrame(value: EventTarget | Element | null): value is HTMLIFrameElement {
  if (!(value instanceof HTMLIFrameElement)) return false;
  if (!value.matches(LOGIN_FRAME)) return false;
  try {
    // `src` is absolute in the SDK, but resolve it so a relative value cannot
    // be mistaken for the hosted app. Never post to an arbitrary frame.
    const src = value.src || value.getAttribute('src') || '';
    return new URL(src, window.location.href).origin === LOGIN_ORIGIN;
  } catch {
    return false;
  }
}

function loginFrames(): HTMLIFrameElement[] {
  return Array.from(document.querySelectorAll<HTMLIFrameElement>(LOGIN_FRAME)).filter(isLoginFrame);
}

/** The SDK inserts the frame as `about:blank` before it navigates. Posting to
 *  that window with the accounts origin makes the browser log an origin
 *  mismatch; wait for the real cross-origin document (contentDocument is null
 *  then) instead. A frame we cannot inspect is already where it should be. */
function frameReady(frame: HTMLIFrameElement): boolean {
  try {
    const doc = frame.contentDocument;
    if (!doc) return true;
    if (!doc.URL || doc.URL === 'about:blank') return false;
    return new URL(doc.URL).origin === LOGIN_ORIGIN;
  } catch {
    return false;
  }
}

/**
 * Install the bridge once from ThemeLayout. Returns a disposer so a hot reload
 * or a layout teardown cannot leave duplicate observers posting stale state.
 */
export function initLoginIframeTheme(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  const sent = new WeakSet<HTMLIFrameElement>();
  const timers = new Set<number>();

  const sync = (force = false) => {
    disarmNativeLoginModals();
    for (const frame of loginFrames()) {
      if (!frameReady(frame)) continue;
      if (!force && sent.has(frame)) continue;
      try {
        frame.contentWindow?.postMessage(HOSTED_PALETTE_MESSAGE, LOGIN_ORIGIN);
        sent.add(frame);
      } catch {
        // A frame can be navigated between the query and the post. The next
        // mutation/load will retry; never let it break the surrounding layout.
      }
    }
  };

  // The hosted app boots after its load event and may send its own darkMode
  // message while initialising. One forced re-send after the FIRST boot makes
  // the last word ours without turning this into a polling loop. The install
  // itself schedules it for modals already mounted before this effect ran; a
  // later load only schedules when no confirmation is pending.
  const scheduleConfirm = () => {
    if (timers.size) return;
    const id = window.setTimeout(() => {
      timers.delete(id);
      sync(true);
    }, 350);
    timers.add(id);
  };

  const onLoad = (event: Event) => {
    if (!isLoginFrame(event.target)) return;
    sync(true);
    scheduleConfirm();
  };
  document.addEventListener('load', onLoad, true);

  const domObserver = new MutationObserver(() => sync());
  if (document.body) {
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['visible', 'src', 'is-email-allowed', 'is-mobile-allowed'],
    });
  }

  // Covers a modal that was already mounted before this effect ran, plus the
  // ones the SDK appends right after it (salla-user-menu injects its own).
  sync(true);
  scheduleConfirm();

  return () => {
    document.removeEventListener('load', onLoad, true);
    domObserver.disconnect();
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
}
