import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { la as require_jsx_runtime, sa as require_react_dom, ua as require_react, zr as useTwilight } from "./shared-home-G5JNrgQH.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-6TKIUG5C.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_jsx_runtime = require_jsx_runtime();
var sizeClasses = {
	sm: "w-64",
	md: "w-80",
	lg: "w-96",
	full: "w-full"
};
function Drawer({ isOpen, onClose, children, size = "md", closeOnBackdropClick = true, closeOnEscape = true, preventBodyScroll = true, className }) {
	const drawerRef = (0, import_react.useRef)(null);
	const previousActiveElement = (0, import_react.useRef)(null);
	const { theme } = useTwilight();
	const position = theme?.is_rtl ?? false ? "right" : "left";
	const handleKeyDown = (0, import_react.useCallback)((event) => {
		if (event.key === "Escape" && closeOnEscape) onClose();
	}, [closeOnEscape, onClose]);
	const handleBackdropClick = (0, import_react.useCallback)((_event) => {
		if (closeOnBackdropClick) onClose();
	}, [closeOnBackdropClick, onClose]);
	(0, import_react.useEffect)(() => {
		if (isOpen) {
			previousActiveElement.current = document.activeElement;
			drawerRef.current?.focus();
			if (preventBodyScroll) document.body.classList.add("menu-opened");
			document.addEventListener("keydown", handleKeyDown);
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			if (preventBodyScroll) document.body.classList.remove("menu-opened");
			previousActiveElement.current?.focus();
		};
	}, [
		isOpen,
		handleKeyDown,
		preventBodyScroll
	]);
	if (!isOpen || typeof document === "undefined") return null;
	const translateClass = isOpen ? "translate-x-0" : position === "left" ? "-translate-x-full" : "translate-x-full";
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[200]",
		"aria-modal": "true",
		role: "dialog",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`,
			onClick: handleBackdropClick,
			onKeyDown: (e) => {
				if ((e.key === "Enter" || e.key === " ") && closeOnBackdropClick) {
					e.preventDefault();
					onClose();
				}
			},
			role: "presentation"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: drawerRef,
			tabIndex: -1,
			className: `fixed top-0 bottom-0 flex flex-col bg-white shadow-xl ${sizeClasses[size]} ${position === "left" ? "left-0" : "right-0"} transform transition-transform duration-300 ease-out ${translateClass} ${className || ""}`,
			children
		})]
	}), document.body);
}
Drawer.Header = function DrawerHeader({ children, showCloseButton = true, onClose, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center justify-between border-b border-gray-200 px-4 py-3 ${className || ""}`,
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold text-gray-900",
			children
		}), showCloseButton && onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onClose,
			className: "rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				className: "h-6 w-6",
				fill: "none",
				viewBox: "0 0 24 24",
				stroke: "currentColor",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					strokeLinecap: "round",
					strokeLinejoin: "round",
					strokeWidth: 2,
					d: "M6 18L18 6M6 6l12 12"
				})
			})]
		})]
	});
};
Drawer.Body = function DrawerBody({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex-1 overflow-y-auto px-4 py-3 ${className || ""}`,
		...props,
		children
	});
};
Drawer.Footer = function DrawerFooter({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `border-t border-gray-200 px-4 py-3 ${className || ""}`,
		...props,
		children
	});
};
//#endregion
export { Drawer as t };

//# sourceMappingURL=chunk-6TKIUG5C-CGqWcK9X.js.map