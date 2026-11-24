import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Bi as getTwilightContext, Ei as resolveRequestVersionId, Gt as MAINTENANCE_EVIDENCE_HEADER, Jt as maintenanceEvidence, Ti as resolveRequestScope, Ui as runWithTwilightContext, Yt as maintenanceEvidenceHeader, bi as legacyLocaleRedirectHref, di as STORE_BASE_HEADER, gi as extractTokenFromCookies, la as require_jsx_runtime, tn as rootHead, ua as require_react, wi as resolveAddressedStore } from "./shared-home-CSJrMlCW.js";
import { T as useRouter, f as useTags, m as useRouterState, p as Asset } from "./vendor-router-Joy6KoUR.js";
import { t as createMiddleware } from "./createMiddleware-bHELZO7i.js";
import { n as tsrStartManifest } from "./_tanstack-start-manifest_v-DQUA7Q7G.js";
import { n as requestHostOf, o as readNativeAppHeaders } from "./chunk-OOLS535M-S3-Hos8K.js";
import "./shared-product-BC5Y0DiL.js";
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/tanstack.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var subscribeNothing = () => () => {};
function ThemeStylesheet({ href, critical = {} }) {
	const routeId = useRouterState({ select: (state) => state.matches.find((match) => Object.hasOwn(critical, match.routeId))?.routeId });
	const [criticalRoute] = (0, import_react.useState)(routeId);
	const hydrated = (0, import_react.useSyncExternalStore)(subscribeNothing, () => true, () => false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		criticalRoute && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", {
			href: "salla-critical-css",
			precedence: "critical",
			children: critical[criticalRoute]
		}),
		(!criticalRoute || hydrated) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
			id: "salla-theme-css",
			rel: "stylesheet",
			href,
			precedence: "default"
		}),
		criticalRoute && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("noscript", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
			rel: "stylesheet",
			href
		}) })
	] });
}
function ThemeHeadContent() {
	const tags = useTags();
	const nonce = useRouter().options.ssr?.nonce;
	return tags.filter((tag) => !(tag.tag === "link" && tag.attrs?.rel === "modulepreload")).map((tag) => /* @__PURE__ */ (0, import_react.createElement)(Asset, {
		...tag,
		key: `tsr-meta-${JSON.stringify(tag)}`,
		nonce
	}));
}
var COPY = {
	store: {
		title: "المتجر غير موجود!",
		message: "نأسف هذا المتجر غير موجود حاليا!."
	},
	domain: {
		title: "نطاق المتجر غير موجود!",
		message: "نأسف نطاق المتجر المطلوب غير موجود حاليا!."
	}
};
var PAGE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<meta name="theme-color" content="#37a495">
<meta name="author" content="\u0645\u0646\u0635\u0629 \u0633\u0644\u0629">
<meta name="robots" content="noindex, follow">
<meta name="copyright" content="Salla.sa">
<title>{title}</title>
<link rel="icon" type="image/png" href="https://cdn.salla.network/images/logo/logo-square.png">
<link rel="apple-touch-icon-precomposed" href="https://cdn.salla.network/images/logo/logo-square.png">
<link rel="stylesheet" href="https://cdn.salla.network/fonts/pingarlt.css?v=0.2">
<link rel="stylesheet" href="https://cdn.assets.salla.network/prod/stores/vendor/salla/errors/css/app.css?id=0d7e71fbf018a0d5c478129a56c7a71f">
</head>
<body class="body body--rtl body--bg iframe-embed">
<header id="header" class="header header--404"></header>
<main id="main" class="main main--404">
<div class="container container--wide">
<div class="e404-container">
<div class="landing">
<h1 class="title title--giant title--404"><img src="https://cdn.assets.salla.network/prod/stores/vendor/salla/errors/images/error.svg" alt=""/> 410</h1>
<h3>{title}</h3>
<p>{message}<br> \u0628\u0625\u0645\u0643\u0627\u0646\u0643 \u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0635\u0641\u062D\u0629 \u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0623\u0648 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0644\u0644\u062A\u0645\u062A\u0639 \u0628\u0645\u062A\u062C\u0631 \u0631\u0627\u0626\u0639!</p>
<a href="https://s.salla.sa/register">\u0633\u062C\u0644 \u0645\u062A\u062C\u0631\u0643 \u0627\u0644\u0623\u0646</a>
</div>
</div>
<div class="form-group msg-container"></div>
</div>
</main>
<footer id="footer" class="footer"></footer>
</body>
</html>
`;
function storeNotFoundPage(kind) {
	const { title, message } = COPY[kind];
	return PAGE.replaceAll("{title}", title).replace("{message}", message);
}
function storeNotFoundResponse(kind) {
	return new Response(storeNotFoundPage(kind), {
		status: 410,
		headers: {
			"content-type": "text/html; charset=UTF-8",
			"cache-control": "max-age=0, must-revalidate, no-cache, no-store, private"
		}
	});
}
function withMaintenanceStatus(result) {
	const response = result instanceof Response ? result : result?.response instanceof Response ? result.response : null;
	if (!response || response.status !== 200 || !getTwilightContext().maintenance) return result;
	const unavailable = new Response(response.body, {
		status: 503,
		statusText: "Service Unavailable",
		headers: response.headers
	});
	stampMaintenanceEvidence(unavailable.headers);
	return result instanceof Response ? unavailable : {
		...result,
		response: unavailable
	};
}
function stampMaintenanceEvidence(headers) {
	let settings;
	try {
		settings = getTwilightContext().settings;
	} catch {
		return;
	}
	const evidence = maintenanceEvidence(settings);
	if (!Object.keys(evidence).length) return;
	headers.set(MAINTENANCE_EVIDENCE_HEADER, maintenanceEvidenceHeader(evidence));
	if (evidence.trace) headers.set("x-trace-id", evidence.trace);
	console.warn("[twilight] maintenance page", {
		...evidence,
		title: settings?.maintenance_details?.title
	});
}
function withStoreNotFoundPage(result) {
	if (!getTwilightContext().storeNotFound) return result;
	const page = storeNotFoundAnswer();
	return result?.response instanceof Response ? {
		...result,
		response: page
	} : page;
}
function storeNotFoundOrThrow(error) {
	if (getTwilightContext().storeNotFound) return storeNotFoundAnswer();
	throw error;
}
function storeNotFoundAnswer() {
	const { storeId, storeBase } = getTwilightContext();
	return storeNotFoundResponse(storeId || storeBase ? "store" : "domain");
}
var twilightMiddleware = (options) => {
	const cookieName = options?.cookieName ?? "token";
	return createMiddleware().server(async ({ request, next }) => {
		const cookieHeader = request.headers.get("Cookie");
		const authToken = extractTokenFromCookies(cookieHeader, cookieName);
		const scope = resolveRequestScope(request.url, cookieHeader);
		const requestHost = requestHostOf(request);
		const { storeId, storeBase, storeBaseFollowsLocale } = resolveAddressedStore(request.url, cookieHeader, requestHost, request.headers.get(STORE_BASE_HEADER));
		const versionId = resolveRequestVersionId(request.url, cookieHeader, requestHost);
		const nativeAppHeaders = readNativeAppHeaders(request.headers);
		if (storeBase && storeBaseFollowsLocale && (request.method === "GET" || request.method === "HEAD")) {
			const location = legacyLocaleRedirectHref(request.url, storeBase);
			if (location) return new Response(null, {
				status: 302,
				headers: { Location: location }
			});
		}
		const response = await runWithTwilightContext({
			authToken,
			scope,
			storeId,
			storeBase,
			storeBaseFollowsLocale,
			versionId,
			requestHost,
			nativeAppHeaders
		}, () => {
			const result = next({ context: { authToken } });
			const settle = (rendered) => withMaintenanceStatus(withStoreNotFoundPage(rendered));
			return result instanceof Promise ? result.then(settle, storeNotFoundOrThrow) : settle(result);
		});
		return storeBaseFollowsLocale ? varyOnCookie(response) : response;
	});
};
function withVaryCookie(response) {
	const headers = new Headers(response.headers);
	headers.append("Vary", "Cookie");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
function varyOnCookie(result) {
	if (result instanceof Response) return withVaryCookie(result);
	const carried = result?.response;
	if (carried instanceof Response) result.response = withVaryCookie(carried);
	return result;
}
var CRITICAL_ASSETS = [
	{
		rel: "preconnect",
		href: "https://api.salla.dev"
	},
	{
		rel: "preconnect",
		href: "https://cdn.salla.sa"
	},
	{
		rel: "preconnect",
		href: "https://cdn.assets.salla.network",
		crossOrigin: "anonymous"
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous"
	}
];
function extractLocale(url) {
	return url.match(/^\/([a-z]{2})(\/|$)/)?.[1];
}
function buildLinkHeader(link) {
	const href = link.href;
	const rel = link.rel;
	if (!href || !rel) return null;
	if (rel === "stylesheet") {
		if (link.media === "print") return null;
		return `<${href}>; rel=preload; as=style`;
	}
	if (rel === "preload") {
		const asType = link.as;
		if (!asType) return null;
		const parts = [
			`<${href}>`,
			"rel=preload",
			`as=${asType}`
		];
		if (asType === "font" || link.crossOrigin) parts.push("crossorigin");
		return parts.join("; ");
	}
	if (rel === "modulepreload") return `<${href}>; rel=modulepreload`;
	return null;
}
var earlyHintsMiddleware = () => {
	let cachedManifestPaths = null;
	return createMiddleware().server(async ({ request, next }) => {
		const response = await next();
		const accept = request.headers.get("Accept") ?? "";
		if (!accept.includes("text/html") && accept !== "*/*") return response;
		if (!(response instanceof Response)) return response;
		const linkHeaders = [];
		try {
			const locale = extractLocale(new URL(request.url).pathname);
			if (locale) {
				const links = rootHead({ params: { locale } }).links ?? [];
				for (const link of links) {
					const header = buildLinkHeader(link);
					if (header) linkHeaders.push(header);
				}
			}
		} catch (e) {
			console.warn("[earlyHints] rootHead failed:", e instanceof Error ? e.message : e);
			for (const asset of CRITICAL_ASSETS) {
				const co = "crossOrigin" in asset ? asset.crossOrigin : void 0;
				linkHeaders.push(`<${asset.href}>; rel=${asset.rel}${co ? "; crossorigin" : ""}`);
			}
		}
		if (!cachedManifestPaths) try {
			const rootAssets = tsrStartManifest().routes["__root__"]?.assets ?? [];
			const seen = /* @__PURE__ */ new Set();
			cachedManifestPaths = [];
			for (const asset of rootAssets) if (asset.tag === "link" && asset.attrs?.href?.endsWith(".css")) {
				if (!seen.has(asset.attrs.href)) {
					seen.add(asset.attrs.href);
					cachedManifestPaths.push(asset.attrs.href);
				}
			}
		} catch (e) {
			console.warn("[earlyHints] tsrStartManifest failed:", e instanceof Error ? e.message : e);
		}
		if (cachedManifestPaths) for (const href of cachedManifestPaths) linkHeaders.push(`<${href}>; rel=preload; as=style`);
		if (linkHeaders.length === 0) {
			console.warn("[earlyHints] no critical assets found — no Link headers added");
			return response;
		}
		const headers = new Headers(response.headers);
		for (const linkHeader of linkHeaders) headers.append("Link", linkHeader);
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	});
};
//#endregion
export { twilightMiddleware as i, ThemeStylesheet as n, earlyHintsMiddleware as r, ThemeHeadContent as t };

//# sourceMappingURL=tanstack-DAEN3d1v.js.map