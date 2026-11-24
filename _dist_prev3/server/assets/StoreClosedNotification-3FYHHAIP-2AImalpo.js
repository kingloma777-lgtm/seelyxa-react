import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Fr as useIsProduct, Rt as useOpeningHours, la as require_jsx_runtime, qn as useTranslation, ua as require_react, zr as useTwilight } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-SQBLVCES.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function StoreClosedNotification(_props) {
	const { store } = useTwilight();
	const { t } = useTranslation();
	const { isOpen, isEnabled, nextOpenFormatted } = useOpeningHours(store.settings?.opening_hours);
	const [dismissed, setDismissed] = (0, import_react.useState)(false);
	if (!useIsProduct() || !isEnabled || isOpen || dismissed || !nextOpenFormatted) return null;
	const handleClose = (e) => {
		e.preventDefault();
		setDismissed(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "store-notify",
		id: "store-closed-notification",
		"data-testid": "store-closed-notification",
		style: {
			backgroundColor: "#d63031",
			color: "#fff",
			padding: "10px 15px",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			position: "relative"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: "#",
			id: "notify-close",
			onClick: handleClose,
			style: {
				position: "absolute",
				left: 15,
				color: "#fff",
				textDecoration: "none"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			style: {
				margin: 0,
				textAlign: "center",
				flex: 1
			},
			children: t("store.closed_notification", {
				defaultValue: `\u0627\u0644\u0645\u062A\u062C\u0631 \u062D\u0627\u0644\u064A\u0627 \u0645\u063A\u0644\u0642 \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0633\u064A\u062A\u0645 \u0641\u062A\u062D\u0647 (${nextOpenFormatted})`,
				nextOpen: nextOpenFormatted
			})
		})]
	});
}
//#endregion
export { StoreClosedNotification };

//# sourceMappingURL=StoreClosedNotification-3FYHHAIP-2AImalpo.js.map