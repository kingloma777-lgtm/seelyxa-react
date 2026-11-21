import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { openSocialLogin } from '../../app/lib/loginSocial';

const ORIGIN = 'https://accounts.salla.com';

interface FakePopup {
  closed: boolean;
  close: () => void;
}

let popup: FakePopup;
let openSpy: ReturnType<typeof vi.fn>;
let handlAfterAuthenticatedResponse: ReturnType<typeof vi.fn>;
/** Every attempt started in a test — disposed in afterEach, or one test's
 *  listener would answer the next test's `ready`. */
let disposers: Array<() => void>;

function installSalla(overrides: Record<string, unknown> = {}) {
  handlAfterAuthenticatedResponse = vi.fn().mockResolvedValue({});
  (window as any).salla = {
    config: {
      get: (key: string) =>
        ({
          'store.id': '1510890315',
          'store.api': 'https://api.salla.dev/store/v1/',
          'store.url': 'https://example.salla.sa/ar',
        })[key],
      all: () => ({ store: { id: 1510890315 } }),
    },
    lang: { locale: 'ar' },
    storage: { get: (key: string) => (key === 'token' ? 'tok' : undefined) },
    notify: { success: vi.fn() },
    auth: { api: { handlAfterAuthenticatedResponse } },
    ...overrides,
  };
}

/** A message as accounts.salla.com would send it, from the popup window. */
function fromAccounts(data: unknown, source: unknown = popup) {
  const event = new MessageEvent('message', { data, origin: ORIGIN });
  Object.defineProperty(event, 'source', { configurable: true, value: source });
  window.dispatchEvent(event);
}

const flush = () => Promise.resolve().then(() => Promise.resolve());

describe('openSocialLogin — direct provider window, no hosted form', () => {
  const open = (provider: string, handlers: Parameters<typeof openSocialLogin>[1] = {}) => {
    const dispose = openSocialLogin(provider, handlers);
    disposers.push(dispose);
    return dispose;
  };

  beforeEach(() => {
    disposers = [];
    document.body.innerHTML = '';
    popup = {
      closed: false,
      close: () => {
        popup.closed = true;
      },
    };
    openSpy = vi.fn(() => popup);
    vi.stubGlobal('open', openSpy);
    installSalla();
  });

  afterEach(() => {
    disposers.forEach((dispose) => dispose());
    vi.unstubAllGlobals();
    vi.useRealTimers();
    delete (window as any).salla;
  });

  it('opens the provider page in TAB mode — the only mode that waits for the opener', () => {
    open('google');
    expect(openSpy).toHaveBeenCalledTimes(1);
    const url = String(openSpy.mock.calls[0][0]);
    expect(url).toBe(`${ORIGIN}/social-login/google?mode=tab`);
    // A popup without mode=tab redirects to the provider immediately and then
    // has nowhere to deliver the result.
    expect(url).toContain('mode=tab');
  });

  it('answers `ready` with the same init payload the SDK iframe gets', () => {
    open('facebook');
    const post = vi.fn();
    fromAccounts({ source: 'login', type: 'iframe::ready' }, { postMessage: post });

    expect(post).toHaveBeenCalledTimes(2);
    const [init, origin] = post.mock.calls[0];
    expect(origin).toBe(ORIGIN);
    expect(init.source).toBe('login');
    expect(init.type).toBe('init');
    expect(init.data.id).toBe('1510890315');
    expect(init.data.apiUrl).toBe('https://api.salla.dev/store/v1');
    expect(init.data.lang).toBe('ar');
    expect(init.data.settings).toEqual({ store: { id: 1510890315 } });
    expect(init.data.storage).toEqual({ token: 'tok' });
    // the accounts app's own dark theme is broken (white on white)
    expect(init.data.isDark).toBe(false);
    expect(post.mock.calls[1][0].type).toBe('width');
  });

  it('hands the authenticated response to the SDK and reports success', async () => {
    const onAuthenticated = vi.fn();
    const onFailed = vi.fn();
    open('apple', { onAuthenticated });

    fromAccounts({
      source: 'login',
      type: 'iframe::authenticated',
      message: { case: 'authenticated', token: 'jwt' },
    });
    await flush();

    expect(handlAfterAuthenticatedResponse).toHaveBeenCalledWith(
      { case: 'authenticated', token: 'jwt' },
      true,
    );
    expect(onAuthenticated).toHaveBeenCalledTimes(1);
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('reports a blocked popup instead of silently doing nothing', () => {
    openSpy.mockReturnValue(null);
    const onFailed = vi.fn();
    open('google', { onFailed });
    expect(onFailed).toHaveBeenCalledWith('blocked');
  });

  it('maps tab_failed to `rejected` (the accounts app refused this opener)', () => {
    const onFailed = vi.fn();
    open('google', { onFailed });
    fromAccounts({ source: 'login', type: 'iframe::tab_failed', message: {} });
    expect(onFailed).toHaveBeenCalledWith('rejected');
  });

  it('ignores messages from anywhere but accounts.salla.com', () => {
    const onFailed = vi.fn();
    const post = vi.fn();
    open('google', { onFailed });
    const event = new MessageEvent('message', {
      data: { source: 'login', type: 'iframe::tab_failed' },
      origin: 'https://evil.example',
    });
    Object.defineProperty(event, 'source', { configurable: true, value: { postMessage: post } });
    window.dispatchEvent(event);
    expect(onFailed).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });

  it('treats a closed provider window as an abandoned attempt', async () => {
    vi.useFakeTimers();
    const onFailed = vi.fn();
    open('google', { onFailed });
    popup.close();
    vi.advanceTimersByTime(1000);
    expect(onFailed).toHaveBeenCalledWith('closed');
  });

  it('stops listening once disposed, so a stale attempt cannot log anyone in', async () => {
    const onAuthenticated = vi.fn();
    const dispose = open('google', { onAuthenticated });
    dispose();
    fromAccounts({
      source: 'login',
      type: 'iframe::authenticated',
      message: { case: 'authenticated', token: 'jwt' },
    });
    await flush();
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(handlAfterAuthenticatedResponse).not.toHaveBeenCalled();
  });
});
