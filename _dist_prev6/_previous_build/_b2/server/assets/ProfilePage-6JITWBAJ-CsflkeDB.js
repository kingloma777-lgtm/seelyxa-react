import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { En as withDeferredHydration, Gn as L, Wt as useUser, la as require_jsx_runtime, ua as require_react, wn as HookSlot } from "./shared-home-G5JNrgQH.js";
import { t as SallaUserSettings } from "./salla-user-settings-DwsVFoMN.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-user-profile.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SallaUserProfileElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get minAge() {
		return true;
	}
};
var defineSallaUserProfile_runtime = () => {};
var SallaUserProfileCore = /*@__PURE__*/ L({
	tagName: "salla-user-profile",
	elementClass: SallaUserProfileElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaUserProfile_runtime
});
SallaUserProfileCore.displayName = "SallaUserProfileCore";
var SallaUserProfile = withDeferredHydration(SallaUserProfileCore, "SallaUserProfile");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-verify.js
var SallaVerifyElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get autoReload() {
		return true;
	}
	get display() {
		return true;
	}
	get getCode() {
		return true;
	}
	get open() {
		return true;
	}
	get supportWebAuth() {
		return true;
	}
	get type() {
		return true;
	}
};
var defineSallaVerify_runtime = () => {};
var SallaVerifyCore = /*@__PURE__*/ L({
	tagName: "salla-verify",
	elementClass: SallaVerifyElement_runtime,
	react: import_react.default,
	events: { onVerified: "verified" },
	defineCustomElement: defineSallaVerify_runtime
});
SallaVerifyCore.displayName = "SallaVerifyCore";
var SallaVerify = withDeferredHydration(SallaVerifyCore, "SallaVerify");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/ProfilePage-6JITWBAJ.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage(_props) {
	const { data: user } = useUser();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:profile.start" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:profile.form.start" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaUserProfile, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:profile.form.end" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaVerify, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaUserSettings, {
			...user?.preferences?.notifications_enabled ? { isNotifiable: true } : {},
			className: "mt-10 block"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:profile.end" })
	] });
}
//#endregion
export { ProfilePage };

//# sourceMappingURL=ProfilePage-6JITWBAJ-CsflkeDB.js.map