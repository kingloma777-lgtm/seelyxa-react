import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { ua as require_react } from "./shared-home-CSJrMlCW.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-AQANJRBD.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function SiftSnippet({ beaconKey, customerId }) {
	(0, import_react.useEffect)(() => {
		if (!beaconKey) return;
		const sessionId = window.salla?.analytics?._anonymousId || "";
		window._sift = window._sift ?? [];
		const _sift = window._sift;
		_sift.push(["_setAccount", beaconKey]);
		_sift.push(["_setUserId", customerId || ""]);
		_sift.push(["_setSessionId", sessionId]);
		_sift.push(["_trackPageview"]);
		const script = document.createElement("script");
		script.src = "https://cdn.sift.com/s.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			script.remove();
			window._sift = void 0;
		};
	}, [beaconKey, customerId]);
	return null;
}
//#endregion
export { SiftSnippet };

//# sourceMappingURL=SiftSnippet-5FCU6TR6-XDG612fO.js.map