import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { ha as require_react } from "./shared-home-CcULkdy1.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-4ENPEHYZ.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function gtmScript(gtmId) {
	return `
window.dataLayer = window.dataLayer || [];
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');

window.dataLayer = new Proxy(window.dataLayer, {
  set(target, property, value) {
    target[property] = value;
    if (typeof value === 'object') {
      ['form_data', 'data', 'gateway', 'config', 'request', 'headers']
        .forEach(function(key) { value && value.hasOwnProperty(key) && delete value[key]; });
    }
    return true;
  }
});
`.trim();
}
var INTERACTION_EVENTS = [
	"pointerdown",
	"keydown",
	"touchstart",
	"scroll",
	"wheel"
];
var GTM_LOAD_DELAY_MS = 4e3;
function GoogleTagBody({ gtmIds }) {
	const gtmId = gtmIds?.[0];
	(0, import_react.useEffect)(() => {
		if (!gtmId) return;
		const id = gtmId;
		let timer;
		const stopWaiting = () => {
			window.clearTimeout(timer);
			window.removeEventListener("load", onLoad);
			INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, inject));
		};
		function inject() {
			stopWaiting();
			if (document.getElementById("gtm-script")) return;
			const script = document.createElement("script");
			script.id = "gtm-script";
			script.textContent = gtmScript(id);
			document.head.appendChild(script);
		}
		function onLoad() {
			timer = window.setTimeout(inject, GTM_LOAD_DELAY_MS);
		}
		INTERACTION_EVENTS.forEach((type) => window.addEventListener(type, inject, {
			once: true,
			passive: true
		}));
		if (document.readyState === "complete") onLoad();
		else window.addEventListener("load", onLoad, { once: true });
		return () => {
			stopWaiting();
			document.getElementById("gtm-script")?.remove();
		};
	}, [gtmId]);
	return null;
}
//#endregion
export { GoogleTagBody };

//# sourceMappingURL=GoogleTag-Y6N4BOCW-BoIoBaAg.js.map