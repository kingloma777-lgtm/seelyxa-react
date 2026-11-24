import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { ua as require_react } from "./shared-home-G5JNrgQH.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-RBEYMAKM.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function TwilightBundles() {
	(0, import_react.useEffect)(() => {
		if (document.getElementById("twilight-bundles-assets")) return;
		const bundlesUrl = "https://cdn.assets.salla.network/prod/@salla.sa/twilight-bundles/latest/twilight-bundles.js";
		const injectBundles = () => {
			window.twilightBundlesObserver?.disconnect?.();
			if (document.getElementById("twilight-bundles-assets")) return;
			const script = document.createElement("script");
			script.type = "module";
			script.src = bundlesUrl;
			script.defer = true;
			script.id = "twilight-bundles-assets";
			document.head.appendChild(script);
		};
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) for (const node of mutation.addedNodes) if (node.nodeType === 1 && node.tagName?.toLowerCase() === "salla-custom-component") {
				injectBundles();
				return;
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		window.twilightBundlesObserver = observer;
		if (document.querySelector("salla-custom-component")) injectBundles();
		return () => {
			observer.disconnect();
		};
	}, []);
	return null;
}
//#endregion
export { TwilightBundles };

//# sourceMappingURL=TwilightBundles-G6GHWBID-dDs8whgr.js.map