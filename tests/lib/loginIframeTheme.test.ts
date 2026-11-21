import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { initLoginIframeTheme } from '../../app/lib/loginIframeTheme';

const ORIGIN = 'https://accounts.salla.com';
const LIGHT_PALETTE = {
  source: 'login',
  type: 'darkMode',
  data: { isDark: false },
};
function mountFrame(src = `${ORIGIN}/?src=false`, visible = true) {
  document.body.innerHTML = `
    <salla-modal class="s-login-modal"${visible ? ' visible' : ''}>
      <iframe src="${src}" title="Salla Login"></iframe>
    </salla-modal>
  `;
  const frame = document.querySelector('iframe') as HTMLIFrameElement;
  const postMessage = vi.fn();
  Object.defineProperty(frame, 'contentWindow', {
    configurable: true,
    value: { postMessage },
  });
  // jsdom leaves an accessible `about:blank` document; the real hosted frame
  // is cross-origin, where contentDocument reads as null. Mark it ready.
  Object.defineProperty(frame, 'contentDocument', {
    configurable: true,
    value: null,
  });
  return { frame, postMessage };
}

function nativeLoginModal(props: Record<string, unknown> = {}) {
  const el = document.createElement('salla-login-modal') as HTMLElement & {
    isEmailAllowed?: unknown;
    isMobileAllowed?: unknown;
  };
  Object.assign(el, props);
  document.body.appendChild(el);
  return el;
}

describe('initLoginIframeTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('forces the hosted form to stay in its readable LIGHT palette', () => {
    const { postMessage } = mountFrame();
    const stop = initLoginIframeTheme();

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(LIGHT_PALETTE, ORIGIN);
    stop();
  });

  it('never posts to a frame outside the hosted login origin or a hidden modal', () => {
    const foreign = mountFrame('https://elsewhere.example/login');
    const stopForeign = initLoginIframeTheme();
    expect(foreign.postMessage).not.toHaveBeenCalled();
    stopForeign();

    const hidden = mountFrame(`${ORIGIN}/?src=false`, false);
    const stopHidden = initLoginIframeTheme();
    expect(hidden.postMessage).not.toHaveBeenCalled();
    stopHidden();
  });

  it('disarms every native login modal, including the one salla-user-menu injects', () => {
    // Our instance is mounted false from React; the platform's own starts
    // with its defaults (email false, mobile true) and would open the stock
    // form on `login::open` right alongside our designed one.
    nativeLoginModal({ isEmailAllowed: false, isMobileAllowed: false });
    const injected = nativeLoginModal({ isEmailAllowed: undefined, isMobileAllowed: true });
    const stop = initLoginIframeTheme();

    const all = Array.from(document.querySelectorAll<HTMLElement & {
      isEmailAllowed?: unknown;
      isMobileAllowed?: unknown;
    }>('salla-login-modal'));
    expect(all).toHaveLength(2);
    for (const el of all) {
      expect(el.isEmailAllowed).toBe(false);
      expect(el.isMobileAllowed).toBe(false);
    }

    // Re-disarm if the platform flips a prop after hydration.
    injected.isMobileAllowed = true;
    injected.setAttribute('is-mobile-allowed', 'true');
    document.body.appendChild(document.createElement('span'));
    // MutationObserver callbacks are async; give them a microtask.
    return Promise.resolve().then(() => {
      expect(injected.isMobileAllowed).toBe(false);
      stop();
    });
  });

  it('keeps every instance disarmed, so the stock form can never open', async () => {
    // Social login no longer borrows this modal (see lib/loginSocial.ts), so
    // there is no "armed" window any more: a `login::open` must never bring the
    // hosted form back over our own card.
    const ours = nativeLoginModal({ isEmailAllowed: false, isMobileAllowed: false });
    const injected = nativeLoginModal({ isEmailAllowed: undefined, isMobileAllowed: true });
    const stop = initLoginIframeTheme();
    expect(injected.isEmailAllowed).toBe(false);
    expect(injected.isMobileAllowed).toBe(false);

    injected.isMobileAllowed = true;
    injected.setAttribute('is-mobile-allowed', 'true');
    document.body.appendChild(document.createElement('span'));
    await Promise.resolve();
    expect(injected.isEmailAllowed).toBe(false);
    expect(injected.isMobileAllowed).toBe(false);
    expect(ours.isEmailAllowed).toBe(false);
    expect(ours.isMobileAllowed).toBe(false);
    stop();
  });

  it('waits for the hosted document instead of posting into about:blank', () => {
    const { frame, postMessage } = mountFrame();
    Object.defineProperty(frame, 'contentDocument', {
      configurable: true,
      value: { URL: 'about:blank' },
    });
    const stop = initLoginIframeTheme();
    expect(postMessage).not.toHaveBeenCalled();

    Object.defineProperty(frame, 'contentDocument', {
      configurable: true,
      value: null,
    });
    frame.dispatchEvent(new Event('load'));
    expect(postMessage).toHaveBeenCalledWith(LIGHT_PALETTE, ORIGIN);
    stop();
  });

  it('re-sends once after the hosted document loads, including one late confirmation', () => {
    vi.useFakeTimers();
    const { frame, postMessage } = mountFrame();
    const stop = initLoginIframeTheme();
    postMessage.mockClear();

    // The install already armed its confirmation; the boot load reuses it.
    frame.dispatchEvent(new Event('load'));
    expect(postMessage).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(350);
    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenLastCalledWith(LIGHT_PALETTE, ORIGIN);
    stop();
  });

  it('stops observing after disposal', () => {
    const { frame, postMessage } = mountFrame();
    const stop = initLoginIframeTheme();
    stop();
    postMessage.mockClear();

    frame.dispatchEvent(new Event('load'));
    expect(postMessage).not.toHaveBeenCalled();
  });
});
