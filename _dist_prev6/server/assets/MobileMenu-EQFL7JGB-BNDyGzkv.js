import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Qn as useTranslation, Wr as useTwilight, fn as Link, ha as require_react, ma as require_jsx_runtime, tr as useQuery } from "./shared-home-CcULkdy1.js";
import { t as Drawer } from "./chunk-6TKIUG5C-CjT19CEu.js";
import { t as menu } from "./chunk-U2I3W3KW-CO5ITAPD.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/MobileMenu-EQFL7JGB.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MOBILE_SKELETON_ITEMS = 5;
var SKELETON_WIDTHS = [
	"w-32",
	"w-28",
	"w-36",
	"w-24",
	"w-30"
];
var MobileMenuSkeleton = (0, import_react.memo)(function MobileMenuSkeleton2() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-gray-100",
		children: Array.from({ length: MOBILE_SKELETON_ITEMS }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "py-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `inline-block animate-pulse rounded bg-gray-200 h-5 ${SKELETON_WIDTHS[i]}` })
		}, i))
	});
});
function MobileMenu(props) {
	if (!props.isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileMenuContent, { ...props });
}
function MobileMenuContent({ onClose }) {
	const { theme } = useTwilight();
	const { data: menus = [], isLoading } = useQuery(menu.queries.header());
	const { t } = useTranslation();
	const [menuStack, setMenuStack] = (0, import_react.useState)([]);
	const [isAnimating, setIsAnimating] = (0, import_react.useState)(false);
	const currentLevel = menuStack[menuStack.length - 1] ?? {
		title: "",
		items: menus
	};
	const isRootLevel = menuStack.length === 0;
	const openSubmenu = (0, import_react.useCallback)((item) => {
		if (item.children && item.children.length > 0) {
			setIsAnimating(true);
			setMenuStack((prev) => [...prev, {
				title: item.title,
				items: item.children
			}]);
			requestAnimationFrame(() => {
				setIsAnimating(false);
			});
		}
	}, []);
	const goBack = (0, import_react.useCallback)(() => {
		setIsAnimating(true);
		setMenuStack((prev) => prev.slice(0, -1));
		requestAnimationFrame(() => {
			setIsAnimating(false);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		document.body.classList.add("menu-opened");
		return () => document.body.classList.remove("menu-opened");
	}, []);
	const getListAnimationClass = () => {
		if (isAnimating) return theme.is_rtl ? "translate-x-4 opacity-0" : "-translate-x-4 opacity-0";
		return "translate-x-0 opacity-100";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Drawer, {
		isOpen: true,
		onClose,
		size: "md",
		closeOnBackdropClick: true,
		preventBodyScroll: false,
		className: "overflow-visible",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				"aria-label": t("common.buttons.close", "Close"),
				className: "absolute top-0 w-12 h-12 flex items-center justify-center bg-[#d35a51] text-white hover:bg-red-600 transition-colors z-50 ltr:-right-12 rtl:-left-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel text-xl leading-none" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Header, {
				showCloseButton: false,
				onClose,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 w-full",
					children: [!isRootLevel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0",
						onClick: goBack,
						"aria-label": t("common.buttons.back", "Back"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-keyboard_arrow_left text-xl flex items-center justify-center" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold text-lg truncate flex-1 text-center pr-6 rtl:pl-6 rtl:pr-0",
						children: isRootLevel ? t("blocks.header.main_menu", "Menu") : currentLevel.title
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer.Body, {
				className: "p-0 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mobile-menu h-full overflow-y-auto",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileMenuSkeleton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: `divide-y divide-gray-100 transition-all duration-200 ease-out ${getListAnimationClass()}`,
						children: currentLevel.items.map((item) => {
							const hasChildren = item.has_children && item.children && item.children.length > 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "mobile-menu-item",
								children: hasChildren ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "flex items-center justify-between w-full py-4 hover:text-primary transition-colors text-start group",
									onClick: () => openSubmenu(item),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gray-800 group-hover:text-primary font-medium text-base",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-keyboard_arrow_right rtl:rotate-180 text-gray-500 group-hover:text-primary text-lg flex items-center justify-center h-full" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.url,
									className: "block w-full py-4 hover:text-primary transition-colors text-gray-800 font-medium text-base group",
									onClick: onClose,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "group-hover:translate-x-1 rtl:group-hover:-translate-x-1 inline-block transition-transform",
										children: item.title
									})
								})
							}, item.id);
						})
					})
				})
			})
		]
	}) });
}
//#endregion
export { MobileMenu };

//# sourceMappingURL=MobileMenu-EQFL7JGB-BNDyGzkv.js.map