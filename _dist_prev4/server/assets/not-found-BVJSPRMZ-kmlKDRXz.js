import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Ir as useLocation, Ji as isLocale, Lr as useNavigate, et as product, la as require_jsx_runtime, pn as LazyErrorPage, qn as useTranslation, ua as require_react, wn as HookSlot } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/not-found-BVJSPRMZ.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SHORT_CODE = /^[A-Za-z0-9]{5,10}$/;
function parseShortLinkPath(pathname) {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 2 && isLocale(segments[0]) && SHORT_CODE.test(segments[1])) return {
		code: segments[1],
		locale: segments[0]
	};
	if (segments.length === 1 && !isLocale(segments[0]) && SHORT_CODE.test(segments[0])) return { code: segments[0] };
	return null;
}
var PRODUCT_KEY = /^([0-9A-Za-z]+)-./;
function parseProductKeyPath(pathname) {
	const segments = pathname.split("/").filter(Boolean);
	const hasLocale = segments.length === 2 && isLocale(segments[0]);
	if (!hasLocale && (segments.length !== 1 || isLocale(segments[0]))) return null;
	const key = segments[segments.length - 1].match(PRODUCT_KEY)?.[1];
	if (!key) return null;
	return hasLocale ? {
		key,
		locale: segments[0]
	} : { key };
}
function productKeyOf(url) {
	try {
		return (new URL(url ?? "").pathname.split("/").filter(Boolean).pop() ?? "").match(PRODUCT_KEY)?.[1];
	} catch {
		return;
	}
}
async function findByProductKey(key) {
	const id = key.match(/^p(\d+)$/)?.[1];
	if (id) return Number(id);
	const { items } = await product.list({
		source: "search",
		keyword: key,
		perPage: 50
	});
	const found = items.find((item) => productKeyOf(item.url) === key);
	return found ? Number(found.id) : null;
}
function slugFromProductUrl(url) {
	try {
		const segments = new URL(url ?? "").pathname.split("/").filter(Boolean);
		const last = segments[segments.length - 1] ?? "";
		return /^p\d+$/.test(last) && segments.length > 1 ? segments[segments.length - 2] : "-";
	} catch {
		return "-";
	}
}
function useProductShortLink() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const shortLink = parseShortLinkPath(pathname);
	const productKey = parseProductKeyPath(pathname);
	const lookup = shortLink?.code ?? productKey?.key;
	const locale = shortLink?.locale ?? productKey?.locale;
	const isShortLink = !!shortLink;
	const [failed, setFailed] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!lookup) return;
		let cancelled = false;
		(isShortLink ? product.find(lookup).then((found) => found?.id ? `${slugFromProductUrl(found.url)}/p${found.id}` : null) : findByProductKey(lookup).then((id) => id ? `-/p${id}` : null)).then((path) => {
			if (cancelled) return;
			if (!path) return setFailed(lookup);
			navigate(`${locale ? `/${locale}` : ""}/${path}`, { replace: true });
		}).catch(() => !cancelled && setFailed(lookup));
		return () => {
			cancelled = true;
		};
	}, [
		lookup,
		isShortLink,
		locale,
		navigate
	]);
	return !!lookup && failed !== lookup;
}
function NotFoundPage(props = {}) {
	const { t } = useTranslation();
	const resolvingShortLink = useProductShortLink();
	const { title = t("common.errors.404") || "Page Not Found", message = t("common.errors.error_occurred") || "The page you are looking for does not exist or has been moved.", showHomeLink = true, homeLinkText = t("common.elements.back_home") || "Back to Home", LinkComponent } = props;
	if (resolvingShortLink) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LazyErrorPage, {
		code: 404,
		title,
		message,
		showAction: showHomeLink,
		actionText: homeLinkText,
		LinkComponent,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "notfound:start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "notfound:content" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "notfound:end" })
		]
	});
}
//#endregion
export { NotFoundPage };

//# sourceMappingURL=not-found-BVJSPRMZ-kmlKDRXz.js.map