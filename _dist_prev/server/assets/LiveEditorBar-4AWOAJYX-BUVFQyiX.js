import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Kn as useTranslation, Qi as targetOf, Xi as areaOf, Yi as BLOCK_ATTRIBUTE, Zi as postToEditor, ca as require_jsx_runtime, la as require_react, oa as require_react_dom } from "./shared-home-CDptNpzP.js";
import { t as moveLiveBlock } from "./chunk-IXHM24Z4-BL3m6gSv.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/LiveEditorBar-4AWOAJYX.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var import_jsx_runtime = require_jsx_runtime();
var ACCENT = "#5dd5c4";
var LAYER = 2147483e3;
var BUSY_TIMEOUT_MS = 1e4;
var DOUBLE_CLICK_MS = 300;
var MOVE_MS = 300;
var DEFAULT_LABELS = {
	ar: {
		edit: "تعديل",
		hide: "إخفاء",
		moveup: "تحريك لأعلى",
		movedown: "تحريك لأسفل",
		duplicate: "تكرار",
		add: "إضافة عنصر",
		delete: "حذف",
		header: "رأس الصفحة",
		footer: "ذيل الصفحة"
	},
	en: {
		edit: "Edit",
		hide: "Hide",
		moveup: "Move up",
		movedown: "Move down",
		duplicate: "Duplicate",
		add: "Add element",
		delete: "Delete",
		header: "Header",
		footer: "Footer"
	}
};
var BLOCK_ACTIONS = [
	"edit",
	"hide",
	"moveup",
	"movedown",
	"duplicate",
	"add",
	"delete"
];
var DEV_ACTIONS = BLOCK_ACTIONS.filter((action) => action !== "hide");
var ICONS = {
	edit: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 20h9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })] }),
	hide: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m2 2 20 20" })
	] }),
	moveup: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m18 15-6-6-6 6" }),
	movedown: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 9 6 6 6-6" }),
	duplicate: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
		x: "8",
		y: "8",
		width: "14",
		height: "14",
		rx: "2"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2" })] }),
	add: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" }),
	delete: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M3 6h18" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
	] })
};
var OUTLINE = {
	position: "fixed",
	zIndex: LAYER,
	pointerEvents: "none",
	boxSizing: "border-box",
	border: `2px solid ${ACCENT}`
};
var CHIP = {
	position: "absolute",
	top: 0,
	insetInlineStart: 0,
	padding: "4px 12px",
	background: ACCENT,
	color: "#0f172a",
	font: "500 14px/1.4 system-ui, sans-serif",
	whiteSpace: "nowrap"
};
var BAR = {
	position: "fixed",
	zIndex: LAYER + 1,
	display: "flex",
	gap: 4,
	padding: 6,
	background: "#fff",
	borderRadius: 8,
	boxShadow: "0 4px 16px rgba(15, 23, 42, 0.18)",
	transform: "translateX(-50%)"
};
function buttonStyle(action, disabled) {
	return {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		minWidth: 36,
		height: 36,
		padding: "0 8px",
		border: 0,
		borderRadius: 6,
		background: "transparent",
		color: action === "delete" ? "#e11d48" : action === "edit" ? "#0d9488" : "#475569",
		font: "500 14px/1 system-ui, sans-serif",
		cursor: disabled ? "default" : "pointer",
		opacity: disabled ? .35 : 1
	};
}
function Icon({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: "18",
		height: "18",
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		children
	});
}
function blockSiblings(el) {
	const parent = el.parentElement;
	if (!parent) return [el];
	return Array.from(parent.children).filter((child) => child instanceof HTMLElement && child.hasAttribute("data-live-block"));
}
var slides = /* @__PURE__ */ new WeakMap();
function moveInPlace(el, action) {
	const siblings = blockSiblings(el);
	const from = siblings.indexOf(el);
	const to = action === "moveup" ? from - 1 : from + 1;
	if (from === -1 || to < 0 || to >= siblings.length) return null;
	const before = new Map(siblings.map((block) => [block, block.getBoundingClientRect().top]));
	for (const block of siblings) slides.get(block)?.cancel();
	let moved = false;
	(0, import_react_dom.flushSync)(() => {
		moved = moveLiveBlock(from, to);
	});
	if (!moved) return null;
	if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return [];
	const started = [];
	for (const [block, top] of before) {
		const shift = top - block.getBoundingClientRect().top;
		if (!shift || typeof block.animate !== "function") continue;
		const slide = block.animate([{ transform: `translateY(${shift}px)` }, { transform: "none" }], {
			duration: MOVE_MS,
			easing: "ease-in-out"
		});
		slides.set(block, slide);
		started.push(slide);
	}
	return started;
}
function connected(el) {
	return el?.isConnected ? el : null;
}
function boxOf(el) {
	const rect = el.getBoundingClientRect();
	if (rect.width || rect.height) return rect;
	const boxes = Array.from(el.children, boxOf).filter((box) => box.width || box.height);
	if (!boxes.length) return rect;
	const top = Math.min(...boxes.map((box) => box.top));
	const left = Math.min(...boxes.map((box) => box.left));
	const right = Math.max(...boxes.map((box) => box.left + box.width));
	const bottom = Math.max(...boxes.map((box) => box.top + box.height));
	return {
		top,
		left,
		width: right - left,
		height: bottom - top
	};
}
function useLayoutTick(active) {
	const [, setTick] = (0, import_react.useState)(0);
	const following = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		let frame = 0;
		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => setTick((n) => n + 1));
		};
		window.addEventListener("scroll", schedule, {
			capture: true,
			passive: true
		});
		window.addEventListener("resize", schedule);
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
		observer?.observe(document.body);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule, { capture: true });
			window.removeEventListener("resize", schedule);
			observer?.disconnect();
		};
	}, [active]);
	(0, import_react.useEffect)(() => () => void (following.current += 1), []);
	return (0, import_react.useCallback)((slides2) => {
		const run = ++following.current;
		let ended = false;
		Promise.allSettled(slides2.map((slide) => slide.finished)).then(() => {
			ended = true;
			if (following.current === run) setTick((n) => n + 1);
		});
		const step = () => {
			if (following.current !== run) return;
			setTick((n) => n + 1);
			if (!ended) requestAnimationFrame(step);
		};
		step();
	}, []);
}
function useLabels() {
	const { t, i18n } = useTranslation();
	const defaults = i18n?.language?.startsWith("ar") ? DEFAULT_LABELS.ar : DEFAULT_LABELS.en;
	return Object.fromEntries(Object.keys(defaults).map((key) => [key, t(`blocks.live_editor.${key}`, { defaultValue: defaults[key] })]));
}
function useHeldLinkClicks(barRef) {
	(0, import_react.useEffect)(() => {
		let held = null;
		let replaying = false;
		const onClick = (event) => {
			if (replaying || event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
			if (barRef.current?.contains(event.target)) return;
			const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
			if (!(link instanceof HTMLAnchorElement) || !targetOf(link)) return;
			event.preventDefault();
			event.stopPropagation();
			const previous = held;
			if (previous) {
				window.clearTimeout(previous.timer);
				held = null;
				if (previous.link === link) return;
			}
			held = {
				link,
				timer: window.setTimeout(() => {
					held = null;
					replaying = true;
					link.click();
					replaying = false;
				}, DOUBLE_CLICK_MS)
			};
		};
		document.addEventListener("click", onClick, true);
		return () => {
			document.removeEventListener("click", onClick, true);
			if (held) window.clearTimeout(held.timer);
		};
	}, [barRef]);
}
function Outline({ el, label }) {
	const rect = boxOf(el);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-testid": "live-editor-outline",
		style: {
			...OUTLINE,
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height
		},
		children: label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			style: CHIP,
			children: label
		})
	});
}
function Toolbar({ target, labels, busy, barRef, actions, onAct }) {
	const rect = boxOf(target);
	const style = {
		...BAR,
		top: Math.max(rect.top + 8, 8),
		left: rect.left + rect.width / 2
	};
	if (areaOf(target)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: barRef,
		"data-testid": "live-editor-bar",
		style,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"data-testid": "live-editor-edit",
			style: buttonStyle("area", false),
			onClick: () => onAct(target, "edit"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: ICONS.edit }), labels.edit]
		})
	});
	const siblings = blockSiblings(target);
	const index = siblings.indexOf(target);
	const isDisabled = (action) => busy !== null || action === "moveup" && index <= 0 || action === "movedown" && index >= siblings.length - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: barRef,
		"data-testid": "live-editor-bar",
		role: "toolbar",
		"aria-label": labels.edit,
		style,
		children: actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"data-testid": `live-editor-${action}`,
			title: labels[action],
			"aria-label": labels[action],
			"aria-busy": busy === action || void 0,
			disabled: isDisabled(action),
			style: buttonStyle(action, isDisabled(action)),
			onClick: () => onAct(target, action),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: ICONS[action] })
		}, action))
	});
}
function blockRefOf(el, id) {
	if (/^\d+$/.test(id)) return { id };
	return {
		id,
		copy: Array.from(document.querySelectorAll(`[${BLOCK_ATTRIBUTE}]`)).filter((block) => block.getAttribute(BLOCK_ATTRIBUTE) === id).indexOf(el)
	};
}
function LiveEditorBar({ origin, dev = false }) {
	const [hovered, setHovered] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const barRef = (0, import_react.useRef)(null);
	const [host, setHost] = (0, import_react.useState)(null);
	const labels = useLabels();
	useHeldLinkClicks(barRef);
	const target = connected(hovered);
	const selected = connected(editing);
	const follow = useLayoutTick(Boolean(target || selected));
	const act = (0, import_react.useCallback)((el, action) => {
		const area = areaOf(el);
		if (area) {
			postToEditor(origin, `preview::edit.${area}`, { id: `store-${area}` });
			setEditing(el);
			return;
		}
		const id = el.getAttribute(BLOCK_ATTRIBUTE);
		if (!id) return;
		const ref = blockRefOf(el, id);
		const slid = !dev && (action === "moveup" || action === "movedown") ? moveInPlace(el, action) : null;
		const moved = slid !== null;
		postToEditor(origin, `preview::${action}.component`, moved ? {
			...ref,
			moved
		} : ref);
		if (slid) follow(slid);
		if (action === "edit") setEditing(el);
		else if (!dev && (action === "hide" || action === "duplicate" || action === "delete")) setBusy(action);
	}, [
		origin,
		dev,
		follow
	]);
	(0, import_react.useEffect)(() => {
		const onOver = (event) => {
			if (barRef.current?.contains(event.target)) return;
			setHovered(targetOf(event.target));
		};
		const onOut = (event) => {
			if (!event.relatedTarget) setHovered(null);
		};
		const onDoubleClick = (event) => {
			if (barRef.current?.contains(event.target)) return;
			const el = targetOf(event.target);
			if (el) act(el, "edit");
		};
		document.addEventListener("mouseover", onOver);
		document.addEventListener("mouseout", onOut);
		document.addEventListener("dblclick", onDoubleClick);
		return () => {
			document.removeEventListener("mouseover", onOver);
			document.removeEventListener("mouseout", onOut);
			document.removeEventListener("dblclick", onDoubleClick);
		};
	}, [act]);
	(0, import_react.useEffect)(() => setHost(document.body), []);
	(0, import_react.useEffect)(() => {
		if (!busy) return;
		const timer = window.setTimeout(() => setBusy(null), BUSY_TIMEOUT_MS);
		return () => window.clearTimeout(timer);
	}, [busy]);
	if (!host || !target && !selected) return null;
	const targetArea = target ? areaOf(target) : null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		selected && selected !== target && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outline, { el: selected }),
		target && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outline, {
			el: target,
			label: targetArea ? labels[targetArea] : void 0
		}),
		target && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toolbar, {
			target,
			labels,
			busy,
			barRef,
			actions: dev ? DEV_ACTIONS : BLOCK_ACTIONS,
			onAct: act
		})
	] }), host);
}
//#endregion
export { LiveEditorBar };

//# sourceMappingURL=LiveEditorBar-4AWOAJYX-BUVFQyiX.js.map