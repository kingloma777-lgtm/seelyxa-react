/**
 * Direct social login — Google / Facebook / Apple, with no hosted form.
 *
 * Why this file exists
 * --------------------
 * `salla.auth.api` has no social method: Salla's social login lives entirely
 * on accounts.salla.com. The SDK's own route is the hosted `salla-login-modal`
 * iframe, and clicking a provider inside it opens a popup. That iframe is a
 * second design the store does not want, so we talk to the accounts app
 * directly instead.
 *
 * The accounts app supports exactly this: open
 * `https://accounts.salla.com/social-login/<provider>?mode=tab` and it waits
 * for the opener to say who it is before it starts the provider redirect
 * (verified in the browser: without `mode=tab` it redirects immediately and
 * has nowhere to deliver the result; with it, it stays put and posts
 * `iframe::ready`). The handshake, copied from the app's own bundle:
 *
 *   popup → opener   { source:'login', type:'iframe::ready' }            ('*')
 *   opener → popup   { source:'login', type:'init', data:{…} }           (origin)
 *   opener → popup   { source:'login', type:'width', data: innerWidth }
 *   …provider auth…
 *   popup → opener   { source:'login', type:'iframe::authenticated',
 *                      message: <auth response> }
 *
 * `init.data` is the same payload `salla-login-modal` sends its iframe
 * (`sendInitMessage` in the component bundle): store id, locale, api url,
 * `settings: salla.config.all()`, and the storage hand-off. The accounts app
 * then validates the opener's origin against Salla's domain list (a custom
 * https domain is accepted through its store-settings lookup) and posts the
 * result with that origin as targetOrigin — which is why this only works from
 * the store's own https origin, never from `http://localhost`.
 *
 * The result is handed to `salla.auth.api.handlAfterAuthenticatedResponse`,
 * the SDK's own "I just got an auth response" entry point, so the session,
 * `auth::logged.in` and the engine's user context all behave exactly as they
 * do for the email/OTP flow.
 */

const LOGIN_ORIGIN = 'https://accounts.salla.com';
const POPUP_NAME = 'seelyxa_social_login';
const POPUP_FEATURES = 'popup=yes,width=520,height=660,menubar=no,toolbar=no,location=yes,status=no';
/** A human cannot finish 2FA faster than this; past it we stop listening so a
 *  forgotten window cannot keep a stale listener alive for the session. */
const GIVE_UP_AFTER = 10 * 60 * 1000;

export type SocialFailure =
  /** `window.open` returned nothing — popup blocker. */
  | 'blocked'
  /** The user closed the provider window before finishing. */
  | 'closed'
  /** accounts.salla.com refused this opener (bad origin / domain not allowed). */
  | 'rejected'
  /** The provider answered with an error, or the auth response could not be used. */
  | 'failed'
  /** Ten minutes with no answer. */
  | 'timeout';

export interface SocialHandlers {
  onAuthenticated?: () => void;
  onFailed?: (reason: SocialFailure) => void;
}

interface SallaAuthLike {
  storage?: { get?: (key: string) => unknown };
  config?: { get?: (key: string) => unknown; all?: () => unknown };
  lang?: { locale?: string };
  notify?: Record<string, (message: string) => void>;
  auth?: {
    api?: {
      handlAfterAuthenticatedResponse?: (
        data: unknown,
        refresh?: boolean,
      ) => Promise<unknown>;
    };
  };
}

function salla(): SallaAuthLike | undefined {
  return (window as unknown as { salla?: SallaAuthLike }).salla;
}

/** The payload `salla-login-modal` sends its iframe, verbatim. */
function initMessage(api: SallaAuthLike) {
  const storage: Record<string, unknown> = {
    user: api.storage?.get?.('user'),
    s_translations: api.storage?.get?.('s_translations'),
    token: api.storage?.get?.('token'),
  };
  for (const key of Object.keys(storage)) {
    if (!storage[key]) delete storage[key];
  }

  return {
    source: 'login',
    type: 'init',
    data: {
      id: api.config?.get?.('store.id'),
      lang: api.lang?.locale ?? 'ar',
      // Deliberately false: the accounts app's own dark theme paints white text
      // on a white canvas (measured), so the provider page is always light.
      isDark: false,
      apiUrl: String(api.config?.get?.('store.api') ?? '').replace(/\/+$/, ''),
      supportWebAuth: true,
      withoutReload: false,
      inline: false,
      settings: api.config?.all?.(),
      storage,
    },
  };
}

/**
 * Open the provider window and drive the handshake. Returns a disposer that
 * settles the attempt early (used when the modal closes underneath it).
 */
export function openSocialLogin(provider: string, handlers: SocialHandlers = {}): () => void {
  const api = salla();
  const url = `${LOGIN_ORIGIN}/social-login/${encodeURIComponent(provider)}?mode=tab`;

  let popup: Window | null = null;
  try {
    popup = window.open(url, POPUP_NAME, POPUP_FEATURES);
  } catch {
    popup = null;
  }
  if (!popup) {
    handlers.onFailed?.('blocked');
    return () => {};
  }

  let settled = false;
  let authenticated = false;
  let poll = 0;
  let timeout = 0;

  const stop = () => {
    window.removeEventListener('message', onMessage);
    if (poll) window.clearInterval(poll);
    if (timeout) window.clearTimeout(timeout);
    poll = 0;
    timeout = 0;
  };

  const settle = (failure?: SocialFailure) => {
    if (settled) return;
    settled = true;
    stop();
    if (failure) handlers.onFailed?.(failure);
  };

  function onMessage(event: MessageEvent) {
    if (event.origin !== LOGIN_ORIGIN) return;
    const data = event.data as { source?: string; type?: string; message?: any } | null;
    if (!data || data.source !== 'login' || typeof data.type !== 'string') return;

    const type = data.type.replace('iframe::', '');
    const payload = data.message;

    if (type === 'ready') {
      const target = event.source as Window | null;
      if (!target) return;
      const init = initMessage(api ?? {});
      target.postMessage(init, LOGIN_ORIGIN);
      target.postMessage(
        { source: 'login', type: 'width', data: document.body.clientWidth },
        LOGIN_ORIGIN,
      );
      return;
    }

    if (type === 'notify') {
      const kind = payload?.type;
      const notify = api?.notify;
      if (kind && notify?.[kind]) notify[kind](payload?.message ?? '');
      return;
    }

    if (type === 'authenticated' || type === 'authenticated_web_auth') {
      authenticated = true;
      const done = api?.auth?.api?.handlAfterAuthenticatedResponse;
      if (typeof done !== 'function') {
        settle('failed');
        return;
      }
      settle();
      void done(payload, true)
        .then(() => handlers.onAuthenticated?.())
        .catch(() => handlers.onFailed?.('failed'));
      return;
    }

    if (type === 'tab_failed') settle('rejected');
  }

  window.addEventListener('message', onMessage);

  // The accounts app closes itself once it has delivered the result, so a
  // closed window with no message means the customer walked away.
  poll = window.setInterval(() => {
    if (popup && popup.closed) {
      if (!authenticated) settle('closed');
      else stop();
    }
  }, 700);

  timeout = window.setTimeout(() => settle('timeout'), GIVE_UP_AFTER);

  return () => {
    stop();
    settled = true;
  };
}
