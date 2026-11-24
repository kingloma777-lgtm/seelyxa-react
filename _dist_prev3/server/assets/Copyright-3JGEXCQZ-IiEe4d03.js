import { la as require_jsx_runtime, qn as useTranslation, sn as Link } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/Copyright-3JGEXCQZ.js
var import_jsx_runtime = require_jsx_runtime();
function Copyright({ storeName = "" }) {
	const { t } = useTranslation();
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		t("blocks.footer.copyright", "Copyright"),
		" | ",
		year,
		" ",
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "hover:text-primary",
			children: storeName
		}),
		" "
	] });
}
//#endregion
export { Copyright };

//# sourceMappingURL=Copyright-3JGEXCQZ-IiEe4d03.js.map