import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type Ref,
  type RefObject,
} from 'react';
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaTelInput } from '@salla.sa/twilight-components-react/tel-input';
import { lockBodyOverflow, unlockBodyOverflow } from '../../lib/bodyOverflow';
import { openSocialLogin, type SocialFailure } from '../../lib/loginSocial';
import { CloseIcon } from '../icons';

/**
 * LoginAuthModal — the store's OWN login popup, built on the Salla SDK's auth
 * API, replacing the hosted `s-login-modal-wrapper` (which lives inside the
 * accounts.salla.com iframe and cannot be themed) as the surface the customer
 * sees. Same logic as the hosted form, different design: one ink card, lemon
 * accent, underline fields, staged entrance — see `login-auth.scss`.
 *
 * Flows (all through `salla.auth.api`, verified against the SDK bundle):
 *   start → `login({type, email|phone})` sends an OTP → `code`
 *   code  → `verify(...)`:
 *             `data.case === 'authenticated'` → the SDK fetches the token and
 *               fires `auth::logged.in` itself (the engine's context listener
 *               updates the SPA state) — we just close;
 *             `data.case === 'new_customer'` → `register`, keeping the SAME
 *               code the customer just entered, exactly like the hosted form;
 *   register → `register({...profile, code})` → authenticated → close.
 *
 * Social (Google / Facebook / Apple): the provider's callback can only be
 * received by an accounts.salla.com window, so the OAuth step happens in a
 * popup we open ourselves — `lib/loginSocial.ts` drives the opener handshake
 * and hands the result to `salla.auth.api.handlAfterAuthenticatedResponse`.
 * The SDK's hosted login modal is never used: its design is not this store's,
 * and it is what used to appear over this card on a social tap.
 *
 * Everything reads the store's own auth config (`email_allowed`,
 * `mobile_allowed`, `login.social.*`); no new merchant-facing setting.
 */

type Screen = 'start' | 'code' | 'register';
type Method = 'email' | 'mobile';

/** What the store allows, read once per open from the SDK config. */
interface LoginSettings {
  emailAllowed: boolean;
  mobileAllowed: boolean;
  /** Default dial country, e.g. 'sa' — feeds the tel input's initial flag. */
  country: string;
  social: string[];
}

/** The identifier the customer is verifying, carried between screens. */
interface Pending {
  method: Method;
  email?: string;
  /** National number, from the tel input. */
  phone?: string;
  /** 'SA'-style ISO code, as the auth endpoints expect it. */
  countryCode?: string;
  /** '966'-style key, no plus. */
  countryKey?: string;
}

/** The SDK owns the element's real methods; borrow its forwardRef type so the
 *  ref we hand back to `SallaTelInput` is the exact element type it declares. */
type TelHandle = NonNullable<
  ComponentPropsWithRef<typeof SallaTelInput>['ref']
> extends Ref<infer T> ? T : never;

/**
 * `salla-tel-input` exposes no placeholder prop and builds its <input> in light
 * DOM a tick after mount, so an empty phone field was a blank rectangle with
 * nothing telling the customer what to type. Attach the attribute from the ref
 * callback (the node exists there, the input may not yet) and keep watching
 * until Stencil has rendered it.
 */
const telObserved = new WeakSet<HTMLElement>();

function applyTelPlaceholder(node: HTMLElement | null, text: string, searchText?: string): void {
  if (!node || !text) return;

  /* The card clips its own overflow, and on the register screen the phone field
     is low enough that the country panel would run past that edge. Measure the
     room left and hand it to the panel as a max-height (see the SCSS). */
  const measurePanelRoom = () => {
    const card = node.closest('.login-auth__card');
    if (!card) return;
    const room = Math.round(
      card.getBoundingClientRect().bottom - node.getBoundingClientRect().bottom - 20,
    );
    node.style.setProperty('--la-tel-panel-max', `${Math.max(168, room)}px`);
  };

  const paint = () => {
    const input = node.querySelector<HTMLInputElement>(
      'input.s-tel-input-control, input[type="tel"]',
    );
    if (input && input.placeholder !== text) input.placeholder = text;

    /* The country panel is rebuilt on every open and ships an English
       "Search" placeholder whatever the storefront language is. */
    if (searchText) {
      const search = node.querySelector<HTMLInputElement>('.iti__search-input');
      if (search) {
        if (search.placeholder !== searchText) search.placeholder = searchText;
        const dir = document.documentElement.getAttribute('dir') || 'rtl';
        if (search.getAttribute('dir') !== dir) search.setAttribute('dir', dir);
      }
    }
    measurePanelRoom();
  };
  paint();
  if (telObserved.has(node)) return;
  telObserved.add(node);
  new MutationObserver(paint).observe(node, { childList: true, subtree: true });
}

const CLOSE_AFTER = 60; // seconds before the resend link arms
const TEL_PLACEHOLDER = '5X XXX XXXX';

function readSettings(): LoginSettings {
  const salla = (window as unknown as { salla?: any }).salla;
  const settings: LoginSettings = {
    emailAllowed: true,
    mobileAllowed: false,
    country: 'sa',
    social: ['google', 'facebook', 'apple'],
  };
  try {
    const auth = salla?.config?.get?.('store.settings.auth') ?? {};
    settings.emailAllowed = auth.email_allowed !== false;
    settings.mobileAllowed = auth.mobile_allowed === true;
    const countries: string[] = Array.isArray(auth.countries) ? auth.countries : [];
    settings.country = countries[0] || 'sa';
  } catch {
    /* SDK not ready yet — the defaults above already match the common store. */
  }
  // Social mirrors the hosted form's own fallback: `login.social.<provider>`
  // when the config answers, otherwise the standard three.
  let queried = false;
  const social = (['google', 'facebook', 'apple', 'x'] as const).filter((provider) => {
    let value: unknown;
    try {
      value = salla?.config?.get?.(`login.social.${provider}`);
    } catch {
      value = undefined;
    }
    if (value !== undefined) queried = true;
    return value === true;
  });
  if (queried) settings.social = social;
  return settings;
}

/** Salla auth errors arrive in several coats; unwrap the human message. */
function extractError(error: unknown, fallback: string): string {
  const e = error as any;
  return (
    e?.error?.message ??
    e?.response?.data?.error?.message ??
    e?.response?.data?.message ??
    e?.message ??
    fallback
  );
}

/** One line per social failure — the card explains itself instead of opening
 *  another window, which is the whole point of the direct popup flow. */
function socialErrorMessage(
  reason: SocialFailure,
  label: string,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const withProvider = (key: string, fallback: string) =>
    t(key, fallback).replace('{provider}', label);

  switch (reason) {
    case 'blocked':
      return t(
        'auth.social_blocked',
        'المتصفح منع نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.',
      );
    case 'closed':
      return withProvider(
        'auth.social_closed',
        'أُغلقت نافذة {provider} قبل إتمام الدخول.',
      );
    case 'rejected':
      return withProvider(
        'auth.social_rejected',
        'تعذّر بدء الدخول عبر {provider} من هذا العنوان. استخدم البريد الإلكتروني.',
      );
    case 'timeout':
      return withProvider('auth.social_timeout', 'انتهت مهلة الدخول عبر {provider}.');
    default:
      return withProvider(
        'auth.social_failed',
        'تعذّر إتمام الدخول عبر {provider}، حاول مرة أخرى.',
      );
  }
}

/* Brand glyphs for the ghost pills — the same paths the hosted form prints. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.078-1.68 0-3.213 1.008-4.09 2.512-1.785 3.05-.458 7.57 1.285 10.05.84 1.2 1.845 2.543 3.18 2.543 1.26 0 1.735-.84 3.27-.84 1.515 0 1.95.84 3.24.825 1.365-.015 2.22-1.26 3.045-2.46.915-1.335 1.29-2.625 1.305-2.7-.03-.015-2.55-.975-2.565-3.75-.015-2.34 1.92-3.465 2.01-3.51-1.095-1.605-2.775-1.8-3.36-1.845-1.5-.12-2.79.84-3.36.84zm2.55-3.15c.675-.81 1.14-1.92 1.005-3.03-1.005.045-2.22.675-2.94 1.5-.615.72-1.17 1.875-1.035 2.985 1.11.09 2.235-.615 2.97-1.455z"
      />
    </svg>
  );
}

function SocialGlyph({ provider }: { provider: string }) {
  if (provider === 'google') return <GoogleIcon />;
  if (provider === 'facebook') return <FacebookIcon />;
  if (provider === 'apple') return <AppleIcon />;
  return <span className="login-auth__social-x" aria-hidden="true">𝕏</span>;
}

/**
 * Mounted once in ThemeLayout's GlobalModals for guests; opens on
 * `login::open` (the trigger the header, the mobile sheet and the SDK's own
 * cart flows all dispatch), closes on `auth::logged.in`. Rendering is
 * client-only by construction: `isOpen` starts false, so SSR prints nothing.
 */
export function LoginAuthModal() {
  const { t } = useTranslation();
  const { store } = useTwilight();

  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<LoginSettings | null>(null);
  const [screen, setScreen] = useState<Screen>('start');
  const [method, setMethod] = useState<Method>('email');
  // The code screen serves two masters: verifying a login, or the final code
  // of a fresh registration (its submit routes to `register` instead).
  const [registerMode, setRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [marketing, setMarketing] = useState(true);
  const [code, setCode] = useState('');
  // The code that rides along into the register payload: captured from the
  // verify step (new_customer) or typed in the register-mode code screen.
  const [registerCode, setRegisterCode] = useState('');
  const [identifierLabel, setIdentifierLabel] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);
  /** Which provider's window is currently open, if any. */
  const [socialPending, setSocialPending] = useState<string | null>(null);
  const [error, setError] = useState('');
  /** Field-level message for the phone input. `isValid()` returns a boolean and
   *  paints nothing of its own, so an invalid submit used to do nothing at all. */
  const [telError, setTelError] = useState('');

  const pendingRef = useRef<Pending | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const startTelRef = useRef<TelHandle>(null);
  const regTelRef = useRef<TelHandle>(null);
  /** Disposer for the running social handshake (popup + message listener). */
  const socialStopRef = useRef<(() => void) | null>(null);

  /** Fresh state for a new visit — `show` doubles as the reset. */
  const show = useCallback(() => {
    const next = readSettings();
    pendingRef.current = null;
    socialStopRef.current?.();
    socialStopRef.current = null;
    setSettings(next);
    setMethod(next.emailAllowed ? 'email' : 'mobile');
    setScreen('start');
    setRegisterMode(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    setCode('');
    setRegisterCode('');
    setIdentifierLabel('');
    setCountdown(0);
    setBusy(false);
    setSocialPending(null);
    setError('');
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => setIsOpen(false), []);

  /* One listener pair for the modal's whole life: `login::open` is the shared
     trigger (ours now — the SDK modal's own listener is disarmed by mounting
     it with both method flags false), `auth::logged.in` closes us whether the
     login finished here or inside the social handoff. Same function
     references in the cleanup, per the subscribe/unsubscribe rule. */
  useEffect(() => {
    const salla = (window as unknown as { salla?: any }).salla;
    if (!salla?.event?.on) return;
    const onOpen = () => show();
    const onLoggedIn = () => hide();
    salla.event.on('login::open', onOpen);
    salla.event.on('auth::logged.in', onLoggedIn);
    return () => {
      salla.event.off('login::open', onOpen);
      salla.event.off('auth::logged.in', onLoggedIn);
    };
  }, [show, hide]);

  /* Drop the phone error the moment the customer edits the number again —
     the message refers to a value that no longer exists. */
  useEffect(() => {
    if (!telError) return;
    const nodes = [startTelRef.current, regTelRef.current].filter(Boolean) as HTMLElement[];
    const clear = () => setTelError('');
    nodes.forEach((node) => node.addEventListener('input', clear, true));
    return () => nodes.forEach((node) => node.removeEventListener('input', clear, true));
  }, [telError]);

  /* A closed card must not leave a message listener (or a popup poll) behind. */
  useEffect(() => {
    if (isOpen) return;
    socialStopRef.current?.();
    socialStopRef.current = null;
    setSocialPending(null);
  }, [isOpen]);

  /* Reference-counted scroll lock while the card is up. */
  useEffect(() => {
    if (!isOpen) return;
    lockBodyOverflow();
    return () => unlockBodyOverflow();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, hide]);

  /* Each new screen puts the cursor in its first field — no autofocus fight
     with hydration, just a paint-aligned rAF. */
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      cardRef.current
        ?.querySelector<HTMLElement>('input:not([type="checkbox"]), salla-tel-input input')
        ?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, screen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const describeIdentifier = (pending: Pending): string =>
    pending.method === 'email'
      ? pending.email || ''
      : `+${pending.countryKey ?? ''} ${pending.phone ?? ''}`;

  /* ── start: send the code ─────────────────────────────────────────────── */

  const submitStart = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    const salla = (window as unknown as { salla?: any }).salla;
    let pending: Pending;
    if (method === 'email') {
      const value = email.trim();
      if (!value) {
        setError(t('auth.errors.email_required', 'أدخل بريدك الإلكتروني أولًا'));
        return;
      }
      pending = { method: 'email', email: value };
    } else {
      const tel = startTelRef.current;
      if (!tel) return;
      if (!(await tel.isValid())) {
        setTelError(t('auth.errors.phone_invalid', 'أدخل رقم جوال صحيحًا'));
        return;
      }
      setTelError('');
      const values = await tel.getValues();
      pending = {
        method: 'mobile',
        phone: values.phone,
        countryCode: String(values.countryCode || '').toUpperCase(),
        countryKey: String(values.countryKey || '').replace('+', ''),
      };
    }
    pendingRef.current = pending;
    setIdentifierLabel(describeIdentifier(pending));
    setBusy(true);
    try {
      await salla.auth.api.login(
        pending.method === 'email'
          ? { type: 'email', email: pending.email }
          : { type: 'mobile', phone: pending.phone, country_code: pending.countryCode },
      );
      setRegisterMode(false);
      setCode('');
      setCountdown(CLOSE_AFTER);
      setScreen('code');
    } catch (err) {
      setError(extractError(err, t('auth.errors.generic', 'تعذّر إتمام الطلب، حاول مرة أخرى')));
    } finally {
      setBusy(false);
    }
  };

  /* ── code: verify the login, or complete a registration ──────────────── */

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    const pending = pendingRef.current;

    const value = code.trim();
    if (!pending || !value || busy) return;
    setBusy(true);
    setError('');
    const salla = (window as unknown as { salla?: any }).salla;
    try {
      if (registerMode) {
        await doRegister(pending, value);
        return;
      }
      const res: any = await salla.auth.api.verify(
        pending.method === 'email'
          ? { type: 'email', email: pending.email, code: value }
          : {
              type: 'mobile',
              phone: pending.phone,
              country_code: pending.countryCode,
              code: value,
            },
        true,
      );
      if (res?.data?.redirect_url) {
        window.location.href = res.data.redirect_url;
        return;
      }
      if (res?.data?.case === 'new_customer') {
        // The identifier is verified but unregistered: the SAME code rides
        // into the register payload, like the hosted form does.
        setRegisterCode(value);
        setScreen('register');
      } else {
        // 'authenticated' — the SDK already fetched the token and fired
        // `auth::logged.in`, whose listener closes us; hide() is the belt.
        hide();
      }
    } catch (err) {
      setError(extractError(err, t('auth.errors.generic', 'تعذّر إتمام الطلب، حاول مرة أخرى')));
    } finally {
      setBusy(false);
    }
  };

  /* ── register: the profile, then the account ─────────────────────────── */

  const doRegister = async (pending: Pending, codeValue: string) => {
    const salla = (window as unknown as { salla?: any }).salla;
    setBusy(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: pending.phone,
        country_code: pending.countryCode,
        country_key: pending.countryKey,
        verified_by: pending.method,
        custom_fields: [],
        marketing_opt_in: marketing,
        code: codeValue,
      };
      if (pending.method === 'email') payload.email = pending.email;
      else payload.email = email.trim();
      await salla.auth.api.register(payload);
      // 'authenticated' → SDK completes the session and fires logged.in.
      hide();
    } catch (err) {
      setError(extractError(err, t('auth.errors.generic', 'تعذّر إتمام الطلب، حاول مرة أخرى')));
    } finally {
      setBusy(false);
    }
  };

  const submitRegisterForm = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setError(t('auth.errors.name_required', 'أكمل الاسم الأول والأخير'));
      return;
    }
    const salla = (window as unknown as { salla?: any }).salla;

    // The identifier comes from the verification step, or from this form
    // (direct registration: no pending identifier yet).
    let pending = pendingRef.current;
    if (!pending) {
      if (method === 'email') {
        const value = email.trim();
        if (!value) {
          setError(t('auth.errors.email_required', 'أدخل بريدك الإلكتروني أولًا'));
          return;
        }
        pending = { method: 'email', email: value };
      } else {
        pending = { method: 'mobile' };
      }
    }

    // The phone is part of the profile AND required by the register endpoint,
    // so the tel input is filled whenever the identifier isn't already one.
    if ((!pending || pending.method === 'email') && regTelRef.current) {
      if (!(await regTelRef.current.isValid())) {
        setTelError(t('auth.errors.phone_invalid', 'أدخل رقم جوال صحيحًا'));
        return;
      }
      setTelError('');
      const values = await regTelRef.current.getValues();
      pending = {
        ...pending,
        phone: values.phone,
        countryCode: String(values.countryCode || '').toUpperCase(),
        countryKey: String(values.countryKey || '').replace('+', ''),
      };
    }
    pendingRef.current = pending;
    setIdentifierLabel(describeIdentifier(pending));

    if (registerCode) {
      // Arrived via the verify step — the code is already in hand.
      await doRegister(pending, registerCode);
      return;
    }
    // Fresh registration: get a code for the identifier first.
    setBusy(true);
    try {
      await salla.auth.api.login(
        pending.method === 'email'
          ? { type: 'email', email: pending.email }
          : { type: 'mobile', phone: pending.phone, country_code: pending.countryCode },
      );
      setRegisterMode(true);
      setCode('');
      setCountdown(CLOSE_AFTER);
      setScreen('code');
    } catch (err) {
      setError(extractError(err, t('auth.errors.generic', 'تعذّر إتمام الطلب، حاول مرة أخرى')));
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    const pending = pendingRef.current;
    if (!pending || countdown > 0 || busy) return;
    setBusy(true);
    setError('');
    const salla = (window as unknown as { salla?: any }).salla;
    try {
      await salla.auth.api.resend(
        pending.method === 'email'
          ? { type: 'email', email: pending.email }
          : { type: 'mobile', phone: pending.phone, country_code: pending.countryCode },
      );
      setCountdown(CLOSE_AFTER);
    } catch (err) {
      setError(extractError(err, t('auth.errors.generic', 'تعذّر إتمام الطلب، حاول مرة أخرى')));
    } finally {
      setBusy(false);
    }
  };

  /* ── navigation between screens ──────────────────────────────────────── */

  const goRegister = () => {
    setError('');
    pendingRef.current = null;
    setRegisterCode('');
    setScreen('register');
  };

  const goBack = () => {
    setError('');
    if (registerMode) {
      setScreen('register');
      return;
    }
    pendingRef.current = null;
    setScreen('start');
  };

  /* Social: one popup, straight to the provider, and this card stays put
     behind it — no second login surface. `openSocialLogin` owns the
     accounts.salla.com handshake; on success the SDK fires `auth::logged.in`
     (our listener above closes), and every failure lands as one line of text
     inside this card instead of another window. */
  const startSocial = (provider: string) => {
    if (socialPending) return;
    setError('');
    setSocialPending(provider);
    const label = provider === 'apple' ? 'Apple' : provider.charAt(0).toUpperCase() + provider.slice(1);
    socialStopRef.current = openSocialLogin(provider, {
      onAuthenticated: () => {
        socialStopRef.current = null;
        setSocialPending(null);
        hide();
      },
      onFailed: (reason: SocialFailure) => {
        socialStopRef.current = null;
        setSocialPending(null);
        setError(socialErrorMessage(reason, label, t));
      },
    });
  };

  /* Keep Tab inside the card while it's open. */
  const trapTab = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const card = cardRef.current;
    if (!card) return;
    const focusables = Array.from(
      card.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), salla-tel-input input',
      ),
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };


  if (!isOpen) return null;

  const pending = pendingRef.current;
  const bothMethods = !!settings?.emailAllowed && !!settings?.mobileAllowed;
  const socialList = settings?.social ?? ['google', 'facebook', 'apple'];
  const privacyUrl =
    typeof window !== 'undefined'
      ? ((window as unknown as { salla?: any }).salla?.url?.get?.('/privacy-policy') ??
        '/privacy-policy')
      : '#';

  const title =
    screen === 'start'
      ? t('auth.login_title', 'أهلًا بك')
      : screen === 'code'
        ? t(registerMode ? 'auth.code_register_title' : 'auth.code_title', 'أدخل رمز التحقق')
        : t('auth.register_title', 'أنشئ حسابك');
  const subtitle =
    screen === 'start'
      ? t('auth.login_subtitle', 'سجّل دخولك لتتابع طلباتك وتحتفظ بما يعجبك.')
      : screen === 'code'
        ? t(
            registerMode ? 'auth.code_register_subtitle' : 'auth.code_subtitle',
            'أرسلنا رمز التحقق إلى',
          )
        : t('auth.register_subtitle', 'دقيقة واحدة وينتهي التسجيل.');

  const spinner = <span className="login-auth__spinner" aria-hidden="true" />;
  const genericError = t('auth.errors.generic', 'تعذّر إتمام الطلب، حاول مرة أخرى');
  const telSearchLabel = t('auth.search_country', 'ابحث عن دولة');

  return (
    <div className="login-auth" role="presentation">
      <div className="login-auth__overlay" onClick={hide} />

      <section
        ref={cardRef}
        className="login-auth__card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={trapTab}
        suppressHydrationWarning
      >
        <button
          type="button"
          className="login-auth__close"
          onClick={hide}
          aria-label={t('auth.close', 'إغلاق')}
        >
          <CloseIcon aria-hidden="true" />
        </button>

        <header className="login-auth__head">
          {store?.name && <p className="login-auth__eyebrow">{store.name}</p>}
          <h2 className="login-auth__title">{title}</h2>
          <p className="login-auth__subtitle">
            {subtitle}
            {screen === 'code' && (
              <>
                {' '}
                <b className="login-auth__sent" dir={pending?.method === 'mobile' ? undefined : 'ltr'}>
                  {identifierLabel}
                </b>
              </>
            )}
          </p>
        </header>

        {error && (
          <p className="login-auth__error" role="alert">
            {error}
          </p>
        )}

        {screen === 'start' && (
          <form className="login-auth__form" onSubmit={submitStart}>
            {bothMethods && (
              <div className="login-auth__tabs">
                <button
                  type="button"
                  className={method === 'email' ? 'is-active' : ''}
                  onClick={() => setMethod('email')}
                >
                  {t('auth.tab_email', 'البريد الإلكتروني')}
                </button>
                <button
                  type="button"
                  className={method === 'mobile' ? 'is-active' : ''}
                  onClick={() => setMethod('mobile')}
                >
                  {t('auth.tab_mobile', 'رقم الجوال')}
                </button>
              </div>
            )}

            {method === 'email' ? (
              <label className="login-auth__field">
                <span className="login-auth__label">{t('auth.email', 'البريد الإلكتروني')}</span>
                <input
                  className="login-auth__input"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder={t('auth.email_placeholder', 'name@example.com')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            ) : (
              <div className={`login-auth__field${telError ? ' login-auth__field--invalid' : ''}`}>
                <span className="login-auth__label">{t('auth.phone', 'رقم الجوال')}</span>
                <SallaTelInput
                  ref={(node) => {
                    startTelRef.current = node;
                    applyTelPlaceholder(node as HTMLElement | null, TEL_PLACEHOLDER, telSearchLabel);
                  }}
                  name="mobile"
                  countryCode={settings?.country}
                  suppressHydrationWarning
                />
                {telError ? (
                  <span className="login-auth__field-error" role="alert">
                    {telError}
                  </span>
                ) : null}
              </div>
            )}

            <button type="submit" className="login-auth__cta" disabled={busy}>
              {busy ? spinner : t('auth.continue', 'دخول')}
            </button>

            {socialList.length > 0 && (
              <>
                <div className="login-auth__divider">
                  <span>{t('auth.or', 'أو تابع عبر')}</span>
                </div>
                <div className="login-auth__social">
                  {socialList.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      className="login-auth__social-btn"
                      onClick={() => startSocial(provider)}
                      disabled={!!socialPending}
                      aria-busy={socialPending === provider}
                    >
                      {socialPending === provider ? (
                        spinner
                      ) : (
                        <SocialGlyph provider={provider} />
                      )}
                      {provider === 'apple' ? 'Apple' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </button>
                  ))}
                </div>
                {socialPending && (
                  <p className="login-auth__social-wait" role="status">
                    {t('auth.social_wait', 'أكمل الدخول في النافذة الجديدة…')}
                  </p>
                )}
              </>
            )}

            <p className="login-auth__swap">
              {t('auth.no_account', 'ليس لديك حساب؟')}{' '}
              <button type="button" onClick={goRegister}>
                {t('auth.create_link', 'أنشئ حسابًا')}
              </button>
            </p>
          </form>
        )}

        {screen === 'code' && (
          <form className="login-auth__form" onSubmit={submitCode}>
            <label className="login-auth__field">
              <span className="login-auth__label">{t('auth.code_label', 'رمز التحقق')}</span>
              <input
                className="login-auth__input login-auth__input--code"
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                maxLength={8}
                placeholder="······"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </label>

            <button
              type="submit"
              className="login-auth__cta"
              disabled={busy || !code.trim()}
            >
              {busy
                ? spinner
                : t(
                    registerMode ? 'auth.create_btn' : 'auth.verify_btn',
                    registerMode ? 'إتمام إنشاء الحساب' : 'تحقق وتسجيل الدخول',
                  )}
            </button>

            <div className="login-auth__aux">
              {countdown > 0 ? (
                <span className="login-auth__resend-wait">
                  {t('auth.resend_in', 'إعادة الإرسال بعد {n} ثانية').replace(
                    '{n}',
                    String(countdown),
                  )}
                </span>
              ) : (
                <button type="button" className="login-auth__link" onClick={resendCode} disabled={busy}>
                  {t('auth.resend', 'إعادة إرسال الرمز')}
                </button>
              )}
              <button type="button" className="login-auth__link" onClick={goBack}>
                {t('auth.back', 'رجوع')}
              </button>
            </div>
          </form>
        )}

        {screen === 'register' && (
          <form className="login-auth__form" onSubmit={submitRegisterForm}>
            <div className="login-auth__row">
              <label className="login-auth__field">
                <span className="login-auth__label">{t('auth.first_name', 'الاسم الأول')}</span>
                <input
                  className="login-auth__input"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="login-auth__field">
                <span className="login-auth__label">{t('auth.last_name', 'الاسم الأخير')}</span>
                <input
                  className="login-auth__input"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>

            {/* Identifier: locked chip once verified, editable field otherwise. */}
            {pending ? (
              <div className="login-auth__locked">
                <span className="login-auth__locked-label">
                  {t(
                    pending.method === 'email' ? 'auth.email' : 'auth.phone',
                    pending.method === 'email' ? 'البريد الإلكتروني' : 'رقم الجوال',
                  )}
                </span>
                <span
                  className="login-auth__locked-value"
                  dir={pending.method === 'email' ? 'ltr' : undefined}
                >
                  {identifierLabel}
                </span>
                <button type="button" className="login-auth__link" onClick={goBack}>
                  {t('auth.change', 'تغيير')}
                </button>
              </div>
            ) : (
              method === 'email' && (
                <label className="login-auth__field">
                  <span className="login-auth__label">{t('auth.email', 'البريد الإلكتروني')}</span>
                  <input
                    className="login-auth__input"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )
            )}

            {(!pending || pending.method === 'email') && (
              <div className={`login-auth__field${telError ? ' login-auth__field--invalid' : ''}`}>
                <span className="login-auth__label">{t('auth.phone', 'رقم الجوال')}</span>
                <SallaTelInput
                  ref={(node) => {
                    regTelRef.current = node;
                    applyTelPlaceholder(node as HTMLElement | null, TEL_PLACEHOLDER, telSearchLabel);
                  }}
                  name="mobile"
                  countryCode={settings?.country}
                  suppressHydrationWarning
                />
                {telError ? (
                  <span className="login-auth__field-error" role="alert">
                    {telError}
                  </span>
                ) : null}
              </div>
            )}

            {(!pending || pending.method === 'mobile') && (
              <label className="login-auth__field">
                <span className="login-auth__label">
                  {t('auth.email_optional', 'البريد الإلكتروني (اختياري)')}
                </span>
                <input
                  className="login-auth__input"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}

            <label className="login-auth__check">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
              <span>{t('auth.marketing', 'أوافق على استلام العروض والتحديثات')}</span>
            </label>

            <button type="submit" className="login-auth__cta" disabled={busy}>
              {busy
                ? spinner
                : t(
                    registerCode ? 'auth.create_btn' : 'auth.send_code',
                    registerCode ? 'إتمام إنشاء الحساب' : 'إرسال رمز التحقق',
                  )}
            </button>
          </form>
        )}

        <p className="login-auth__privacy">
          {t('auth.privacy_prefix', 'بالمتابعة أنت توافق على')}{' '}
          <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
            {t('auth.privacy_link', 'سياسة الخصوصية')}
          </a>
        </p>
      </section>
    </div>
  );
}
