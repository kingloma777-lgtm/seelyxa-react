import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { En as withDeferredHydration, Gn as L, la as require_jsx_runtime, ot as CloseIcon, qn as useTranslation, ua as require_react, zr as useTwilight } from "./shared-home-CR99BuTM.js";
import "./shared-product-N_AOhgpy.js";
import { L as lockBodyOverflow, R as unlockBodyOverflow } from "./router-26TzvfmH.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-tel-input.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaTelInputElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get autofocus() {
		return true;
	}
	get countryCode() {
		return true;
	}
	get disabled() {
		return true;
	}
	get getValues() {
		return true;
	}
	get isValid() {
		return true;
	}
	get name() {
		return true;
	}
	get phone() {
		return true;
	}
};
var defineSallaTelInput_runtime = () => {};
var SallaTelInputCore = /*@__PURE__*/ L({
	tagName: "salla-tel-input",
	elementClass: SallaTelInputElement_runtime,
	react: import_react.default,
	events: { onPhoneEntered: "phoneEntered" },
	defineCustomElement: defineSallaTelInput_runtime
});
SallaTelInputCore.displayName = "SallaTelInputCore";
var SallaTelInput = withDeferredHydration(SallaTelInputCore, "SallaTelInput");
//#endregion
//#region app/lib/loginSocial.ts
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
var LOGIN_ORIGIN = "https://accounts.salla.com";
var POPUP_NAME = "seelyxa_social_login";
var POPUP_FEATURES = "popup=yes,width=520,height=660,menubar=no,toolbar=no,location=yes,status=no";
/** A human cannot finish 2FA faster than this; past it we stop listening so a
*  forgotten window cannot keep a stale listener alive for the session. */
var GIVE_UP_AFTER = 6e5;
function salla() {
	return window.salla;
}
/** The payload `salla-login-modal` sends its iframe, verbatim. */
function initMessage(api) {
	const storage = {
		user: api.storage?.get?.("user"),
		s_translations: api.storage?.get?.("s_translations"),
		token: api.storage?.get?.("token")
	};
	for (const key of Object.keys(storage)) if (!storage[key]) delete storage[key];
	return {
		source: "login",
		type: "init",
		data: {
			id: api.config?.get?.("store.id"),
			lang: api.lang?.locale ?? "ar",
			isDark: false,
			apiUrl: String(api.config?.get?.("store.api") ?? "").replace(/\/+$/, ""),
			supportWebAuth: true,
			withoutReload: false,
			inline: false,
			settings: api.config?.all?.(),
			storage
		}
	};
}
/**
* Open the provider window and drive the handshake. Returns a disposer that
* settles the attempt early (used when the modal closes underneath it).
*/
function openSocialLogin(provider, handlers = {}) {
	const api = salla();
	const url = `${LOGIN_ORIGIN}/social-login/${encodeURIComponent(provider)}?mode=tab`;
	let popup = null;
	try {
		popup = window.open(url, POPUP_NAME, POPUP_FEATURES);
	} catch {
		popup = null;
	}
	if (!popup) {
		handlers.onFailed?.("blocked");
		return () => {};
	}
	let settled = false;
	let authenticated = false;
	let poll = 0;
	let timeout = 0;
	const stop = () => {
		window.removeEventListener("message", onMessage);
		if (poll) window.clearInterval(poll);
		if (timeout) window.clearTimeout(timeout);
		poll = 0;
		timeout = 0;
	};
	const settle = (failure) => {
		if (settled) return;
		settled = true;
		stop();
		if (failure) handlers.onFailed?.(failure);
	};
	function onMessage(event) {
		if (event.origin !== LOGIN_ORIGIN) return;
		const data = event.data;
		if (!data || data.source !== "login" || typeof data.type !== "string") return;
		const type = data.type.replace("iframe::", "");
		const payload = data.message;
		if (type === "ready") {
			const target = event.source;
			if (!target) return;
			const init = initMessage(api ?? {});
			target.postMessage(init, LOGIN_ORIGIN);
			target.postMessage({
				source: "login",
				type: "width",
				data: document.body.clientWidth
			}, LOGIN_ORIGIN);
			return;
		}
		if (type === "notify") {
			const kind = payload?.type;
			const notify = api?.notify;
			if (kind && notify?.[kind]) notify[kind](payload?.message ?? "");
			return;
		}
		if (type === "authenticated" || type === "authenticated_web_auth") {
			authenticated = true;
			const done = api?.auth?.api?.handlAfterAuthenticatedResponse;
			if (typeof done !== "function") {
				settle("failed");
				return;
			}
			settle();
			done(payload, true).then(() => handlers.onAuthenticated?.()).catch(() => handlers.onFailed?.("failed"));
			return;
		}
		if (type === "tab_failed") settle("rejected");
	}
	window.addEventListener("message", onMessage);
	poll = window.setInterval(() => {
		if (popup && popup.closed) {
			if (!authenticated) settle("closed");
			else stop();
		}
	}, 700);
	timeout = window.setTimeout(() => settle("timeout"), GIVE_UP_AFTER);
	return () => {
		stop();
		settled = true;
	};
}
//#endregion
//#region app/components/layout/LoginAuthModal.tsx
var import_jsx_runtime = require_jsx_runtime();
/**
* `salla-tel-input` exposes no placeholder prop and builds its <input> in light
* DOM a tick after mount, so an empty phone field was a blank rectangle with
* nothing telling the customer what to type. Attach the attribute from the ref
* callback (the node exists there, the input may not yet) and keep watching
* until Stencil has rendered it.
*/
var telObserved = /* @__PURE__ */ new WeakSet();
function applyTelPlaceholder(node, text, searchText) {
	if (!node || !text) return;
	const measurePanelRoom = () => {
		const card = node.closest(".login-auth__card");
		if (!card) return;
		const room = Math.round(card.getBoundingClientRect().bottom - node.getBoundingClientRect().bottom - 20);
		node.style.setProperty("--la-tel-panel-max", `${Math.max(168, room)}px`);
	};
	const paint = () => {
		const input = node.querySelector("input.s-tel-input-control, input[type=\"tel\"]");
		if (input && input.placeholder !== text) input.placeholder = text;
		if (searchText) {
			const search = node.querySelector(".iti__search-input");
			if (search) {
				if (search.placeholder !== searchText) search.placeholder = searchText;
				const dir = document.documentElement.getAttribute("dir") || "rtl";
				if (search.getAttribute("dir") !== dir) search.setAttribute("dir", dir);
			}
		}
		measurePanelRoom();
	};
	paint();
	if (telObserved.has(node)) return;
	telObserved.add(node);
	new MutationObserver(paint).observe(node, {
		childList: true,
		subtree: true
	});
}
var CLOSE_AFTER = 60;
var TEL_PLACEHOLDER = "5X XXX XXXX";
function readSettings() {
	const salla = window.salla;
	const settings = {
		emailAllowed: true,
		mobileAllowed: false,
		country: "sa",
		social: [
			"google",
			"facebook",
			"apple"
		]
	};
	try {
		const auth = salla?.config?.get?.("store.settings.auth") ?? {};
		settings.emailAllowed = auth.email_allowed !== false;
		settings.mobileAllowed = auth.mobile_allowed === true;
		settings.country = (Array.isArray(auth.countries) ? auth.countries : [])[0] || "sa";
	} catch {}
	let queried = false;
	const social = [
		"google",
		"facebook",
		"apple",
		"x"
	].filter((provider) => {
		let value;
		try {
			value = salla?.config?.get?.(`login.social.${provider}`);
		} catch {
			value = void 0;
		}
		if (value !== void 0) queried = true;
		return value === true;
	});
	if (queried) settings.social = social;
	return settings;
}
/** Salla auth errors arrive in several coats; unwrap the human message. */
function extractError(error, fallback) {
	const e = error;
	return e?.error?.message ?? e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e?.message ?? fallback;
}
/** One line per social failure — the card explains itself instead of opening
*  another window, which is the whole point of the direct popup flow. */
function socialErrorMessage(reason, label, t) {
	const withProvider = (key, fallback) => t(key, fallback).replace("{provider}", label);
	switch (reason) {
		case "blocked": return t("auth.social_blocked", "المتصفح منع نافذة تسجيل الدخول. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.");
		case "closed": return withProvider("auth.social_closed", "أُغلقت نافذة {provider} قبل إتمام الدخول.");
		case "rejected": return withProvider("auth.social_rejected", "تعذّر بدء الدخول عبر {provider} من هذا العنوان. استخدم البريد الإلكتروني.");
		case "timeout": return withProvider("auth.social_timeout", "انتهت مهلة الدخول عبر {provider}.");
		default: return withProvider("auth.social_failed", "تعذّر إتمام الدخول عبر {provider}، حاول مرة أخرى.");
	}
}
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		width: "18",
		height: "18",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			})
		]
	});
}
function FacebookIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		width: "18",
		height: "18",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "#1877F2",
			d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
		})
	});
}
function AppleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		width: "18",
		height: "18",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.078-1.68 0-3.213 1.008-4.09 2.512-1.785 3.05-.458 7.57 1.285 10.05.84 1.2 1.845 2.543 3.18 2.543 1.26 0 1.735-.84 3.27-.84 1.515 0 1.95.84 3.24.825 1.365-.015 2.22-1.26 3.045-2.46.915-1.335 1.29-2.625 1.305-2.7-.03-.015-2.55-.975-2.565-3.75-.015-2.34 1.92-3.465 2.01-3.51-1.095-1.605-2.775-1.8-3.36-1.845-1.5-.12-2.79.84-3.36.84zm2.55-3.15c.675-.81 1.14-1.92 1.005-3.03-1.005.045-2.22.675-2.94 1.5-.615.72-1.17 1.875-1.035 2.985 1.11.09 2.235-.615 2.97-1.455z"
		})
	});
}
function SocialGlyph({ provider }) {
	if (provider === "google") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {});
	if (provider === "facebook") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacebookIcon, {});
	if (provider === "apple") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppleIcon, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "login-auth__social-x",
		"aria-hidden": "true",
		children: "𝕏"
	});
}
/**
* Mounted once in ThemeLayout's GlobalModals for guests; opens on
* `login::open` (the trigger the header, the mobile sheet and the SDK's own
* cart flows all dispatch), closes on `auth::logged.in`. Rendering is
* client-only by construction: `isOpen` starts false, so SSR prints nothing.
*/
function LoginAuthModal() {
	const { t } = useTranslation();
	const { store } = useTwilight();
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [screen, setScreen] = (0, import_react.useState)("start");
	const [method, setMethod] = (0, import_react.useState)("email");
	const [registerMode, setRegisterMode] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [marketing, setMarketing] = (0, import_react.useState)(true);
	const [code, setCode] = (0, import_react.useState)("");
	const [registerCode, setRegisterCode] = (0, import_react.useState)("");
	const [identifierLabel, setIdentifierLabel] = (0, import_react.useState)("");
	const [countdown, setCountdown] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	/** Which provider's window is currently open, if any. */
	const [socialPending, setSocialPending] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	/** Field-level message for the phone input. `isValid()` returns a boolean and
	*  paints nothing of its own, so an invalid submit used to do nothing at all. */
	const [telError, setTelError] = (0, import_react.useState)("");
	const pendingRef = (0, import_react.useRef)(null);
	const cardRef = (0, import_react.useRef)(null);
	const startTelRef = (0, import_react.useRef)(null);
	const regTelRef = (0, import_react.useRef)(null);
	/** Disposer for the running social handshake (popup + message listener). */
	const socialStopRef = (0, import_react.useRef)(null);
	/** Fresh state for a new visit — `show` doubles as the reset. */
	const show = (0, import_react.useCallback)(() => {
		const next = readSettings();
		pendingRef.current = null;
		socialStopRef.current?.();
		socialStopRef.current = null;
		setSettings(next);
		setMethod(next.emailAllowed ? "email" : "mobile");
		setScreen("start");
		setRegisterMode(false);
		setEmail("");
		setFirstName("");
		setLastName("");
		setCode("");
		setRegisterCode("");
		setIdentifierLabel("");
		setCountdown(0);
		setBusy(false);
		setSocialPending(null);
		setError("");
		setIsOpen(true);
	}, []);
	const hide = (0, import_react.useCallback)(() => setIsOpen(false), []);
	(0, import_react.useEffect)(() => {
		const salla = window.salla;
		if (!salla?.event?.on) return;
		const onOpen = () => show();
		const onLoggedIn = () => hide();
		salla.event.on("login::open", onOpen);
		salla.event.on("auth::logged.in", onLoggedIn);
		return () => {
			salla.event.off("login::open", onOpen);
			salla.event.off("auth::logged.in", onLoggedIn);
		};
	}, [show, hide]);
	(0, import_react.useEffect)(() => {
		if (!telError) return;
		const nodes = [startTelRef.current, regTelRef.current].filter(Boolean);
		const clear = () => setTelError("");
		nodes.forEach((node) => node.addEventListener("input", clear, true));
		return () => nodes.forEach((node) => node.removeEventListener("input", clear, true));
	}, [telError]);
	(0, import_react.useEffect)(() => {
		if (isOpen) return;
		socialStopRef.current?.();
		socialStopRef.current = null;
		setSocialPending(null);
	}, [isOpen]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		lockBodyOverflow();
		return () => unlockBodyOverflow();
	}, [isOpen]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") hide();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, hide]);
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const raf = requestAnimationFrame(() => {
			cardRef.current?.querySelector("input:not([type=\"checkbox\"]), salla-tel-input input")?.focus();
		});
		return () => cancelAnimationFrame(raf);
	}, [isOpen, screen]);
	(0, import_react.useEffect)(() => {
		if (countdown <= 0) return;
		const id = window.setTimeout(() => setCountdown((c) => c - 1), 1e3);
		return () => window.clearTimeout(id);
	}, [countdown]);
	const describeIdentifier = (pending) => pending.method === "email" ? pending.email || "" : `+${pending.countryKey ?? ""} ${pending.phone ?? ""}`;
	const submitStart = async (e) => {
		e.preventDefault();
		if (busy) return;
		setError("");
		const salla = window.salla;
		let pending;
		if (method === "email") {
			const value = email.trim();
			if (!value) {
				setError(t("auth.errors.email_required", "أدخل بريدك الإلكتروني أولًا"));
				return;
			}
			pending = {
				method: "email",
				email: value
			};
		} else {
			const tel = startTelRef.current;
			if (!tel) return;
			if (!await tel.isValid()) {
				setTelError(t("auth.errors.phone_invalid", "أدخل رقم جوال صحيحًا"));
				return;
			}
			setTelError("");
			const values = await tel.getValues();
			pending = {
				method: "mobile",
				phone: values.phone,
				countryCode: String(values.countryCode || "").toUpperCase(),
				countryKey: String(values.countryKey || "").replace("+", "")
			};
		}
		pendingRef.current = pending;
		setIdentifierLabel(describeIdentifier(pending));
		setBusy(true);
		try {
			await salla.auth.api.login(pending.method === "email" ? {
				type: "email",
				email: pending.email
			} : {
				type: "mobile",
				phone: pending.phone,
				country_code: pending.countryCode
			});
			setRegisterMode(false);
			setCode("");
			setCountdown(CLOSE_AFTER);
			setScreen("code");
		} catch (err) {
			setError(extractError(err, t("auth.errors.generic", "تعذّر إتمام الطلب، حاول مرة أخرى")));
		} finally {
			setBusy(false);
		}
	};
	const submitCode = async (e) => {
		e.preventDefault();
		const pending = pendingRef.current;
		const value = code.trim();
		if (!pending || !value || busy) return;
		setBusy(true);
		setError("");
		const salla = window.salla;
		try {
			if (registerMode) {
				await doRegister(pending, value);
				return;
			}
			const res = await salla.auth.api.verify(pending.method === "email" ? {
				type: "email",
				email: pending.email,
				code: value
			} : {
				type: "mobile",
				phone: pending.phone,
				country_code: pending.countryCode,
				code: value
			}, true);
			if (res?.data?.redirect_url) {
				window.location.href = res.data.redirect_url;
				return;
			}
			if (res?.data?.case === "new_customer") {
				setRegisterCode(value);
				setScreen("register");
			} else hide();
		} catch (err) {
			setError(extractError(err, t("auth.errors.generic", "تعذّر إتمام الطلب، حاول مرة أخرى")));
		} finally {
			setBusy(false);
		}
	};
	const doRegister = async (pending, codeValue) => {
		const salla = window.salla;
		setBusy(true);
		setError("");
		try {
			const payload = {
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				phone: pending.phone,
				country_code: pending.countryCode,
				country_key: pending.countryKey,
				verified_by: pending.method,
				custom_fields: [],
				marketing_opt_in: marketing,
				code: codeValue
			};
			if (pending.method === "email") payload.email = pending.email;
			else payload.email = email.trim();
			await salla.auth.api.register(payload);
			hide();
		} catch (err) {
			setError(extractError(err, t("auth.errors.generic", "تعذّر إتمام الطلب، حاول مرة أخرى")));
		} finally {
			setBusy(false);
		}
	};
	const submitRegisterForm = async (e) => {
		e.preventDefault();
		if (busy) return;
		setError("");
		const first = firstName.trim();
		const last = lastName.trim();
		if (!first || !last) {
			setError(t("auth.errors.name_required", "أكمل الاسم الأول والأخير"));
			return;
		}
		const salla = window.salla;
		let pending = pendingRef.current;
		if (!pending) {
			if (method === "email") {
				const value = email.trim();
				if (!value) {
					setError(t("auth.errors.email_required", "أدخل بريدك الإلكتروني أولًا"));
					return;
				}
				pending = {
					method: "email",
					email: value
				};
			} else pending = { method: "mobile" };
		}
		if ((!pending || pending.method === "email") && regTelRef.current) {
			if (!await regTelRef.current.isValid()) {
				setTelError(t("auth.errors.phone_invalid", "أدخل رقم جوال صحيحًا"));
				return;
			}
			setTelError("");
			const values = await regTelRef.current.getValues();
			pending = {
				...pending,
				phone: values.phone,
				countryCode: String(values.countryCode || "").toUpperCase(),
				countryKey: String(values.countryKey || "").replace("+", "")
			};
		}
		pendingRef.current = pending;
		setIdentifierLabel(describeIdentifier(pending));
		if (registerCode) {
			await doRegister(pending, registerCode);
			return;
		}
		setBusy(true);
		try {
			await salla.auth.api.login(pending.method === "email" ? {
				type: "email",
				email: pending.email
			} : {
				type: "mobile",
				phone: pending.phone,
				country_code: pending.countryCode
			});
			setRegisterMode(true);
			setCode("");
			setCountdown(CLOSE_AFTER);
			setScreen("code");
		} catch (err) {
			setError(extractError(err, t("auth.errors.generic", "تعذّر إتمام الطلب، حاول مرة أخرى")));
		} finally {
			setBusy(false);
		}
	};
	const resendCode = async () => {
		const pending = pendingRef.current;
		if (!pending || countdown > 0 || busy) return;
		setBusy(true);
		setError("");
		const salla = window.salla;
		try {
			await salla.auth.api.resend(pending.method === "email" ? {
				type: "email",
				email: pending.email
			} : {
				type: "mobile",
				phone: pending.phone,
				country_code: pending.countryCode
			});
			setCountdown(CLOSE_AFTER);
		} catch (err) {
			setError(extractError(err, t("auth.errors.generic", "تعذّر إتمام الطلب، حاول مرة أخرى")));
		} finally {
			setBusy(false);
		}
	};
	const goRegister = () => {
		setError("");
		pendingRef.current = null;
		setRegisterCode("");
		setScreen("register");
	};
	const goBack = () => {
		setError("");
		if (registerMode) {
			setScreen("register");
			return;
		}
		pendingRef.current = null;
		setScreen("start");
	};
	const startSocial = (provider) => {
		if (socialPending) return;
		setError("");
		setSocialPending(provider);
		const label = provider === "apple" ? "Apple" : provider.charAt(0).toUpperCase() + provider.slice(1);
		socialStopRef.current = openSocialLogin(provider, {
			onAuthenticated: () => {
				socialStopRef.current = null;
				setSocialPending(null);
				hide();
			},
			onFailed: (reason) => {
				socialStopRef.current = null;
				setSocialPending(null);
				setError(socialErrorMessage(reason, label, t));
			}
		});
	};
	const trapTab = (e) => {
		if (e.key !== "Tab") return;
		const card = cardRef.current;
		if (!card) return;
		const focusables = Array.from(card.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), salla-tel-input input")).filter((el) => el.offsetParent !== null);
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
	const socialList = settings?.social ?? [
		"google",
		"facebook",
		"apple"
	];
	const privacyUrl = typeof window !== "undefined" ? window.salla?.url?.get?.("/privacy-policy") ?? "/privacy-policy" : "#";
	const title = screen === "start" ? t("auth.login_title", "أهلًا بك") : screen === "code" ? t(registerMode ? "auth.code_register_title" : "auth.code_title", "أدخل رمز التحقق") : t("auth.register_title", "أنشئ حسابك");
	const subtitle = screen === "start" ? t("auth.login_subtitle", "سجّل دخولك لتتابع طلباتك وتحتفظ بما يعجبك.") : screen === "code" ? t(registerMode ? "auth.code_register_subtitle" : "auth.code_subtitle", "أرسلنا رمز التحقق إلى") : t("auth.register_subtitle", "دقيقة واحدة وينتهي التسجيل.");
	const spinner = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "login-auth__spinner",
		"aria-hidden": "true"
	});
	t("auth.errors.generic", "تعذّر إتمام الطلب، حاول مرة أخرى");
	const telSearchLabel = t("auth.search_country", "ابحث عن دولة");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "login-auth",
		role: "presentation",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "login-auth__overlay",
			onClick: hide
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			ref: cardRef,
			className: "login-auth__card",
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			onKeyDown: trapTab,
			suppressHydrationWarning: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "login-auth__close",
					onClick: hide,
					"aria-label": t("auth.close", "إغلاق"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseIcon, { "aria-hidden": "true" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "login-auth__head",
					children: [
						store?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "login-auth__eyebrow",
							children: store.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "login-auth__title",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "login-auth__subtitle",
							children: [subtitle, screen === "code" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "login-auth__sent",
								dir: pending?.method === "mobile" ? void 0 : "ltr",
								children: identifierLabel
							})] })]
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "login-auth__error",
					role: "alert",
					children: error
				}),
				screen === "start" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "login-auth__form",
					onSubmit: submitStart,
					children: [
						bothMethods && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "login-auth__tabs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: method === "email" ? "is-active" : "",
								onClick: () => setMethod("email"),
								children: t("auth.tab_email", "البريد الإلكتروني")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: method === "mobile" ? "is-active" : "",
								onClick: () => setMethod("mobile"),
								children: t("auth.tab_mobile", "رقم الجوال")
							})]
						}),
						method === "email" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "login-auth__field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "login-auth__label",
								children: t("auth.email", "البريد الإلكتروني")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "login-auth__input",
								type: "email",
								dir: "ltr",
								autoComplete: "email",
								placeholder: t("auth.email_placeholder", "name@example.com"),
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `login-auth__field${telError ? " login-auth__field--invalid" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__label",
									children: t("auth.phone", "رقم الجوال")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaTelInput, {
									ref: (node) => {
										startTelRef.current = node;
										applyTelPlaceholder(node, TEL_PLACEHOLDER, telSearchLabel);
									},
									name: "mobile",
									countryCode: settings?.country,
									suppressHydrationWarning: true
								}),
								telError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__field-error",
									role: "alert",
									children: telError
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "login-auth__cta",
							disabled: busy,
							children: busy ? spinner : t("auth.continue", "دخول")
						}),
						socialList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "login-auth__divider",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("auth.or", "أو تابع عبر") })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "login-auth__social",
								children: socialList.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "login-auth__social-btn",
									onClick: () => startSocial(provider),
									disabled: !!socialPending,
									"aria-busy": socialPending === provider,
									children: [socialPending === provider ? spinner : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialGlyph, { provider }), provider === "apple" ? "Apple" : provider.charAt(0).toUpperCase() + provider.slice(1)]
								}, provider))
							}),
							socialPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "login-auth__social-wait",
								role: "status",
								children: t("auth.social_wait", "أكمل الدخول في النافذة الجديدة…")
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "login-auth__swap",
							children: [
								t("auth.no_account", "ليس لديك حساب؟"),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: goRegister,
									children: t("auth.create_link", "أنشئ حسابًا")
								})
							]
						})
					]
				}),
				screen === "code" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "login-auth__form",
					onSubmit: submitCode,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "login-auth__field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "login-auth__label",
								children: t("auth.code_label", "رمز التحقق")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "login-auth__input login-auth__input--code",
								inputMode: "numeric",
								autoComplete: "one-time-code",
								dir: "ltr",
								maxLength: 8,
								placeholder: "······",
								value: code,
								onChange: (e) => setCode(e.target.value.replace(/\D/g, ""))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "login-auth__cta",
							disabled: busy || !code.trim(),
							children: busy ? spinner : t(registerMode ? "auth.create_btn" : "auth.verify_btn", registerMode ? "إتمام إنشاء الحساب" : "تحقق وتسجيل الدخول")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "login-auth__aux",
							children: [countdown > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "login-auth__resend-wait",
								children: t("auth.resend_in", "إعادة الإرسال بعد {n} ثانية").replace("{n}", String(countdown))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "login-auth__link",
								onClick: resendCode,
								disabled: busy,
								children: t("auth.resend", "إعادة إرسال الرمز")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "login-auth__link",
								onClick: goBack,
								children: t("auth.back", "رجوع")
							})]
						})
					]
				}),
				screen === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "login-auth__form",
					onSubmit: submitRegisterForm,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "login-auth__row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "login-auth__field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__label",
									children: t("auth.first_name", "الاسم الأول")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "login-auth__input",
									autoComplete: "given-name",
									value: firstName,
									onChange: (e) => setFirstName(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "login-auth__field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__label",
									children: t("auth.last_name", "الاسم الأخير")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: "login-auth__input",
									autoComplete: "family-name",
									value: lastName,
									onChange: (e) => setLastName(e.target.value)
								})]
							})]
						}),
						pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "login-auth__locked",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__locked-label",
									children: t(pending.method === "email" ? "auth.email" : "auth.phone", pending.method === "email" ? "البريد الإلكتروني" : "رقم الجوال")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__locked-value",
									dir: pending.method === "email" ? "ltr" : void 0,
									children: identifierLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "login-auth__link",
									onClick: goBack,
									children: t("auth.change", "تغيير")
								})
							]
						}) : method === "email" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "login-auth__field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "login-auth__label",
								children: t("auth.email", "البريد الإلكتروني")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "login-auth__input",
								type: "email",
								dir: "ltr",
								autoComplete: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})]
						}),
						(!pending || pending.method === "email") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `login-auth__field${telError ? " login-auth__field--invalid" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__label",
									children: t("auth.phone", "رقم الجوال")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaTelInput, {
									ref: (node) => {
										regTelRef.current = node;
										applyTelPlaceholder(node, TEL_PLACEHOLDER, telSearchLabel);
									},
									name: "mobile",
									countryCode: settings?.country,
									suppressHydrationWarning: true
								}),
								telError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "login-auth__field-error",
									role: "alert",
									children: telError
								}) : null
							]
						}),
						(!pending || pending.method === "mobile") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "login-auth__field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "login-auth__label",
								children: t("auth.email_optional", "البريد الإلكتروني (اختياري)")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "login-auth__input",
								type: "email",
								dir: "ltr",
								autoComplete: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "login-auth__check",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: marketing,
								onChange: (e) => setMarketing(e.target.checked)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("auth.marketing", "أوافق على استلام العروض والتحديثات") })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "login-auth__cta",
							disabled: busy,
							children: busy ? spinner : t(registerCode ? "auth.create_btn" : "auth.send_code", registerCode ? "إتمام إنشاء الحساب" : "إرسال رمز التحقق")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "login-auth__privacy",
					children: [
						t("auth.privacy_prefix", "بالمتابعة أنت توافق على"),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: privacyUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							children: t("auth.privacy_link", "سياسة الخصوصية")
						})
					]
				})
			]
		})]
	});
}
//#endregion
export { LoginAuthModal };

//# sourceMappingURL=LoginAuthModal-CrmwOejo.js.map