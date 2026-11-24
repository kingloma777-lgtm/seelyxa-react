import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { Bn as ListSkeleton, Gi as getTwilightContext, Gn as ProductsSliderSkeleton, Jn as SliderSkeleton, Kn as Pulse, Mn as BackgroundSliderSkeleton, Pn as BulletDeliverySkeleton, Qn as useTranslation, Ur as TwilightContext, Wr as useTwilight, Yr as api, at as product, bn as LazyRenderWhenVisible, ei as getActiveScope, er as queryOptions, et as ProductCard, fn as Link, ha as require_react, hn as Image, ma as require_jsx_runtime, qn as ReviewItemSkeleton, rt as registry, tr as useQuery, ui as whenSallaLoaded, wn as SallaSlider$1, xn as SallaButton, zn as FixedProductsSkeleton } from "./shared-home-CcULkdy1.js";
import { t as ItemsList } from "./ItemsList-MgXfLD3w.js";
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/native/salla-products-list/SallaProductsList.js
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_ROOT_CLASS = "s-products-list";
var DEFAULT_ITEMS_CLASS = "s-products-list-wrapper";
function SallaProductsList({ className, itemsClassName, children, ...props }) {
	const mergedClassName = className ? `${DEFAULT_ROOT_CLASS} ${className}` : DEFAULT_ROOT_CLASS;
	const mergedItemsClassName = itemsClassName ? `${DEFAULT_ITEMS_CLASS} ${itemsClassName}` : DEFAULT_ITEMS_CLASS;
	return (0, import_jsx_runtime.jsx)(ItemsList, {
		className: mergedClassName,
		itemsClassName: mergedItemsClassName,
		...props,
		children
	});
}
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/shared/ssr-window.esm.mjs
/**
* SSR Window 5.0.1
* Better handling for window object in SSR environment
* https://github.com/nolimits4web/ssr-window
*
* Copyright 2025, Vladimir Kharlampidi
*
* Licensed under MIT
*
* Released on: June 27, 2025
*/
function isObject$2(obj) {
	return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend$2(target = {}, src = {}) {
	const noExtend = [
		"__proto__",
		"constructor",
		"prototype"
	];
	Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
		if (typeof target[key] === "undefined") target[key] = src[key];
		else if (isObject$2(src[key]) && isObject$2(target[key]) && Object.keys(src[key]).length > 0) extend$2(target[key], src[key]);
	});
}
var ssrDocument = {
	body: {},
	addEventListener() {},
	removeEventListener() {},
	activeElement: {
		blur() {},
		nodeName: ""
	},
	querySelector() {
		return null;
	},
	querySelectorAll() {
		return [];
	},
	getElementById() {
		return null;
	},
	createEvent() {
		return { initEvent() {} };
	},
	createElement() {
		return {
			children: [],
			childNodes: [],
			style: {},
			setAttribute() {},
			getElementsByTagName() {
				return [];
			}
		};
	},
	createElementNS() {
		return {};
	},
	importNode() {
		return null;
	},
	location: {
		hash: "",
		host: "",
		hostname: "",
		href: "",
		origin: "",
		pathname: "",
		protocol: "",
		search: ""
	}
};
function getDocument() {
	const doc = typeof document !== "undefined" ? document : {};
	extend$2(doc, ssrDocument);
	return doc;
}
var ssrWindow = {
	document: ssrDocument,
	navigator: { userAgent: "" },
	location: {
		hash: "",
		host: "",
		hostname: "",
		href: "",
		origin: "",
		pathname: "",
		protocol: "",
		search: ""
	},
	history: {
		replaceState() {},
		pushState() {},
		go() {},
		back() {}
	},
	CustomEvent: function CustomEvent() {
		return this;
	},
	addEventListener() {},
	removeEventListener() {},
	getComputedStyle() {
		return { getPropertyValue() {
			return "";
		} };
	},
	Image() {},
	Date() {},
	screen: {},
	setTimeout() {},
	clearTimeout() {},
	matchMedia() {
		return {};
	},
	requestAnimationFrame(callback) {
		if (typeof setTimeout === "undefined") {
			callback();
			return null;
		}
		return setTimeout(callback, 0);
	},
	cancelAnimationFrame(id) {
		if (typeof setTimeout === "undefined") return;
		clearTimeout(id);
	}
};
function getWindow() {
	const win = typeof window !== "undefined" ? window : {};
	extend$2(win, ssrWindow);
	return win;
}
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/shared/utils.mjs
function classesToTokens(classes = "") {
	return classes.trim().split(" ").filter((c) => !!c.trim());
}
function deleteProps(obj) {
	const object = obj;
	Object.keys(object).forEach((key) => {
		try {
			object[key] = null;
		} catch (e) {}
		try {
			delete object[key];
		} catch (e) {}
	});
}
function nextTick(callback, delay = 0) {
	return setTimeout(callback, delay);
}
function now() {
	return Date.now();
}
function getComputedStyle$1(el) {
	const window = getWindow();
	let style;
	if (window.getComputedStyle) style = window.getComputedStyle(el, null);
	if (!style && el.currentStyle) style = el.currentStyle;
	if (!style) style = el.style;
	return style;
}
function getTranslate(el, axis = "x") {
	const window = getWindow();
	let matrix;
	let curTransform;
	let transformMatrix;
	const curStyle = getComputedStyle$1(el);
	if (window.WebKitCSSMatrix) {
		curTransform = curStyle.transform || curStyle.webkitTransform;
		if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
		transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
	} else {
		transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
		matrix = transformMatrix.toString().split(",");
	}
	if (axis === "x") {
		if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
		else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
		else curTransform = parseFloat(matrix[4]);
	}
	if (axis === "y") {
		if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
		else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
		else curTransform = parseFloat(matrix[5]);
	}
	return curTransform || 0;
}
function isObject$1(o) {
	return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
}
function isNode(node) {
	if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") return node instanceof HTMLElement;
	return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend$1(...args) {
	const to = Object(args[0]);
	for (let i = 1; i < args.length; i += 1) {
		const nextSource = args[i];
		if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
			const keysArray = Object.keys(Object(nextSource)).filter((key) => key !== "__proto__" && key !== "constructor" && key !== "prototype");
			for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
				const nextKey = keysArray[nextIndex];
				const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
				if (desc !== void 0 && desc.enumerable) {
					if (isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
						if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey];
						else extend$1(to[nextKey], nextSource[nextKey]);
					} else if (!isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
						to[nextKey] = {};
						if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey];
						else extend$1(to[nextKey], nextSource[nextKey]);
					} else to[nextKey] = nextSource[nextKey];
				}
			}
		}
	}
	return to;
}
function setCSSProperty(el, varName, varValue) {
	el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll({ swiper, targetPosition, side }) {
	const window = getWindow();
	const startPosition = -swiper.translate;
	let startTime = null;
	let time;
	const duration = swiper.params.speed;
	swiper.wrapperEl.style.scrollSnapType = "none";
	window.cancelAnimationFrame(swiper.cssModeFrameID);
	const dir = targetPosition > startPosition ? "next" : "prev";
	const isOutOfBound = (current, target) => {
		return dir === "next" && current >= target || dir === "prev" && current <= target;
	};
	const animate = () => {
		time = (/* @__PURE__ */ new Date()).getTime();
		if (startTime === null) startTime = time;
		const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
		const easeProgress = .5 - Math.cos(progress * Math.PI) / 2;
		let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
		if (isOutOfBound(currentPosition, targetPosition)) currentPosition = targetPosition;
		swiper.wrapperEl.scrollTo({ [side]: currentPosition });
		if (isOutOfBound(currentPosition, targetPosition)) {
			swiper.wrapperEl.style.overflow = "hidden";
			swiper.wrapperEl.style.scrollSnapType = "";
			setTimeout(() => {
				swiper.wrapperEl.style.overflow = "";
				swiper.wrapperEl.scrollTo({ [side]: currentPosition });
			});
			window.cancelAnimationFrame(swiper.cssModeFrameID);
			return;
		}
		swiper.cssModeFrameID = window.requestAnimationFrame(animate);
	};
	animate();
}
function elementChildren(element, selector = "") {
	const window = getWindow();
	const children = [...element.children];
	if (window.HTMLSlotElement && element instanceof HTMLSlotElement) children.push(...element.assignedElements());
	if (!selector) return children;
	return children.filter((el) => el.matches(selector));
}
function elementIsChildOfSlot(el, slot) {
	const elementsQueue = [slot];
	while (elementsQueue.length > 0) {
		const elementToCheck = elementsQueue.shift();
		if (el === elementToCheck) return true;
		elementsQueue.push(...elementToCheck.children, ...elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : [], ...elementToCheck.assignedElements ? elementToCheck.assignedElements() : []);
	}
}
function elementIsChildOf(el, parent) {
	const window = getWindow();
	let isChild = parent.contains(el);
	if (!isChild && window.HTMLSlotElement && parent instanceof HTMLSlotElement) {
		isChild = [...parent.assignedElements()].includes(el);
		if (!isChild) isChild = elementIsChildOfSlot(el, parent);
	}
	return isChild;
}
function showWarning(text) {
	try {
		console.warn(text);
		return;
	} catch (err) {}
}
function createElement$1(tag, classes = []) {
	const el = document.createElement(tag);
	el.classList.add(...Array.isArray(classes) ? classes : classesToTokens(classes));
	return el;
}
function elementPrevAll(el, selector) {
	const prevEls = [];
	while (el.previousElementSibling) {
		const prev = el.previousElementSibling;
		if (selector) {
			if (prev.matches(selector)) prevEls.push(prev);
		} else prevEls.push(prev);
		el = prev;
	}
	return prevEls;
}
function elementNextAll(el, selector) {
	const nextEls = [];
	while (el.nextElementSibling) {
		const next = el.nextElementSibling;
		if (selector) {
			if (next.matches(selector)) nextEls.push(next);
		} else nextEls.push(next);
		el = next;
	}
	return nextEls;
}
function elementStyle(el, prop) {
	return getWindow().getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
	let child = el;
	let i;
	if (child) {
		i = 0;
		while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i += 1;
		return i;
	}
}
function elementParents(el, selector) {
	const parents = [];
	let parent = el.parentElement;
	while (parent) {
		if (selector) {
			if (parent.matches(selector)) parents.push(parent);
		} else parents.push(parent);
		parent = parent.parentElement;
	}
	return parents;
}
function elementOuterSize(el, size, includeMargins) {
	const window = getWindow();
	if (includeMargins) return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
	return el.offsetWidth;
}
function makeElementsArray(el) {
	return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
function setInnerHTML(el, html = "") {
	if (typeof trustedTypes !== "undefined") el.innerHTML = trustedTypes.createPolicy("html", { createHTML: (s) => s }).createHTML(html);
	else el.innerHTML = html;
}
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/shared/swiper-core.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var support;
function calcSupport() {
	const window = getWindow();
	const document = getDocument();
	return {
		smoothScroll: document.documentElement && document.documentElement.style && "scrollBehavior" in document.documentElement.style,
		touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
	};
}
function getSupport() {
	if (!support) support = calcSupport();
	return support;
}
var deviceCached;
function calcDevice({ userAgent } = {}) {
	const support = getSupport();
	const window = getWindow();
	const platform = window.navigator.platform;
	const ua = userAgent || window.navigator.userAgent;
	const device = {
		ios: false,
		android: false
	};
	const screenWidth = window.screen.width;
	const screenHeight = window.screen.height;
	const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
	let ipad = ua.match(/(iPad)(?!\1).*OS\s([\d_]+)/);
	const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
	const windows = platform === "Win32";
	let macos = platform === "MacIntel";
	if (!ipad && macos && support.touch && [
		"1024x1366",
		"1366x1024",
		"834x1194",
		"1194x834",
		"834x1112",
		"1112x834",
		"768x1024",
		"1024x768",
		"820x1180",
		"1180x820",
		"810x1080",
		"1080x810"
	].indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
		ipad = ua.match(/(Version)\/([\d.]+)/);
		if (!ipad) ipad = [
			0,
			1,
			"13_0_0"
		];
		macos = false;
	}
	if (android && !windows) {
		device.os = "android";
		device.android = true;
	}
	if (ipad || iphone || ipod) {
		device.os = "ios";
		device.ios = true;
	}
	return device;
}
function getDevice(overrides = {}) {
	if (!deviceCached) deviceCached = calcDevice(overrides);
	return deviceCached;
}
var browser;
function calcBrowser() {
	const window = getWindow();
	const device = getDevice();
	let needPerspectiveFix = false;
	function isSafari() {
		const ua = window.navigator.userAgent.toLowerCase();
		return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
	}
	if (isSafari()) {
		const ua = String(window.navigator.userAgent);
		if (ua.includes("Version/")) {
			const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
			needPerspectiveFix = major < 16 || major === 16 && minor < 2;
		}
	}
	const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
	const isSafariBrowser = isSafari();
	const need3dFix = isSafariBrowser || isWebView && device.ios;
	return {
		isSafari: needPerspectiveFix || isSafariBrowser,
		needPerspectiveFix,
		need3dFix,
		isWebView
	};
}
function getBrowser() {
	if (!browser) browser = calcBrowser();
	return browser;
}
function Resize({ swiper, on, emit }) {
	const window = getWindow();
	let observer = null;
	let animationFrame = null;
	const resizeHandler = () => {
		if (!swiper || swiper.destroyed || !swiper.initialized) return;
		emit("beforeResize");
		emit("resize");
	};
	const createObserver = () => {
		if (!swiper || swiper.destroyed || !swiper.initialized) return;
		observer = new ResizeObserver((entries) => {
			animationFrame = window.requestAnimationFrame(() => {
				const { width, height } = swiper;
				let newWidth = width;
				let newHeight = height;
				entries.forEach(({ contentBoxSize, contentRect, target }) => {
					if (target && target !== swiper.el) return;
					newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
					newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
				});
				if (newWidth !== width || newHeight !== height) resizeHandler();
			});
		});
		observer.observe(swiper.el);
	};
	const removeObserver = () => {
		if (animationFrame) window.cancelAnimationFrame(animationFrame);
		if (observer && observer.unobserve && swiper.el) {
			observer.unobserve(swiper.el);
			observer = null;
		}
	};
	const orientationChangeHandler = () => {
		if (!swiper || swiper.destroyed || !swiper.initialized) return;
		emit("orientationchange");
	};
	on("init", () => {
		if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
			createObserver();
			return;
		}
		window.addEventListener("resize", resizeHandler);
		window.addEventListener("orientationchange", orientationChangeHandler);
	});
	on("destroy", () => {
		removeObserver();
		window.removeEventListener("resize", resizeHandler);
		window.removeEventListener("orientationchange", orientationChangeHandler);
	});
}
function Observer({ swiper, extendParams, on, emit }) {
	const observers = [];
	const window = getWindow();
	const attach = (target, options = {}) => {
		const observer = new (window.MutationObserver || window.WebkitMutationObserver)((mutations) => {
			if (swiper.__preventObserver__) return;
			if (mutations.length === 1) {
				emit("observerUpdate", mutations[0]);
				return;
			}
			const observerUpdate = function observerUpdate() {
				emit("observerUpdate", mutations[0]);
			};
			if (window.requestAnimationFrame) window.requestAnimationFrame(observerUpdate);
			else window.setTimeout(observerUpdate, 0);
		});
		observer.observe(target, {
			attributes: typeof options.attributes === "undefined" ? true : options.attributes,
			childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
			characterData: typeof options.characterData === "undefined" ? true : options.characterData
		});
		observers.push(observer);
	};
	const init = () => {
		if (!swiper.params.observer) return;
		if (swiper.params.observeParents) {
			const containerParents = elementParents(swiper.hostEl);
			for (let i = 0; i < containerParents.length; i += 1) attach(containerParents[i]);
		}
		attach(swiper.hostEl, { childList: swiper.params.observeSlideChildren });
		attach(swiper.wrapperEl, { attributes: false });
	};
	const destroy = () => {
		observers.forEach((observer) => {
			observer.disconnect();
		});
		observers.splice(0, observers.length);
	};
	extendParams({
		observer: false,
		observeParents: false,
		observeSlideChildren: false
	});
	on("init", init);
	on("destroy", destroy);
}
var eventsEmitter = {
	on(events, handler, priority) {
		const self = this;
		if (!self.eventsListeners || self.destroyed) return self;
		if (typeof handler !== "function") return self;
		const method = priority ? "unshift" : "push";
		events.split(" ").forEach((event) => {
			if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
			self.eventsListeners[event][method](handler);
		});
		return self;
	},
	once(events, handler, priority) {
		const self = this;
		if (!self.eventsListeners || self.destroyed) return self;
		if (typeof handler !== "function") return self;
		function onceHandler(...args) {
			self.off(events, onceHandler);
			if (onceHandler.__emitterProxy) delete onceHandler.__emitterProxy;
			handler.apply(self, args);
		}
		onceHandler.__emitterProxy = handler;
		return self.on(events, onceHandler, priority);
	},
	onAny(handler, priority) {
		const self = this;
		if (!self.eventsListeners || self.destroyed) return self;
		if (typeof handler !== "function") return self;
		const method = priority ? "unshift" : "push";
		if (self.eventsAnyListeners.indexOf(handler) < 0) self.eventsAnyListeners[method](handler);
		return self;
	},
	offAny(handler) {
		const self = this;
		if (!self.eventsListeners || self.destroyed) return self;
		if (!self.eventsAnyListeners) return self;
		const index = self.eventsAnyListeners.indexOf(handler);
		if (index >= 0) self.eventsAnyListeners.splice(index, 1);
		return self;
	},
	off(events, handler) {
		const self = this;
		if (!self.eventsListeners || self.destroyed) return self;
		if (!self.eventsListeners) return self;
		events.split(" ").forEach((event) => {
			if (typeof handler === "undefined") self.eventsListeners[event] = [];
			else if (self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler, index) => {
				if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) self.eventsListeners[event].splice(index, 1);
			});
		});
		return self;
	},
	emit(...args) {
		const self = this;
		if (!self.eventsListeners || self.destroyed) return self;
		if (!self.eventsListeners) return self;
		let events;
		let data;
		let context;
		if (typeof args[0] === "string" || Array.isArray(args[0])) {
			events = args[0];
			data = args.slice(1, args.length);
			context = self;
		} else {
			events = args[0].events;
			data = args[0].data;
			context = args[0].context || self;
		}
		data.unshift(context);
		(Array.isArray(events) ? events : events.split(" ")).forEach((event) => {
			if (self.eventsAnyListeners && self.eventsAnyListeners.length) self.eventsAnyListeners.forEach((eventHandler) => {
				eventHandler.apply(context, [event, ...data]);
			});
			if (self.eventsListeners && self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler) => {
				eventHandler.apply(context, data);
			});
		});
		return self;
	}
};
function updateSize() {
	const swiper = this;
	let width;
	let height;
	const el = swiper.el;
	if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) width = swiper.params.width;
	else width = el.clientWidth;
	if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) height = swiper.params.height;
	else height = el.clientHeight;
	if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) return;
	width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
	height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
	if (Number.isNaN(width)) width = 0;
	if (Number.isNaN(height)) height = 0;
	Object.assign(swiper, {
		width,
		height,
		size: swiper.isHorizontal() ? width : height
	});
}
function updateSlides() {
	const swiper = this;
	function getDirectionPropertyValue(node, label) {
		return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
	}
	const params = swiper.params;
	const { wrapperEl, slidesEl, rtlTranslate: rtl, wrongRTL } = swiper;
	const isVirtual = swiper.virtual && params.virtual.enabled;
	const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
	const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
	const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
	let snapGrid = [];
	const slidesGrid = [];
	const slidesSizesGrid = [];
	let offsetBefore = params.slidesOffsetBefore;
	if (typeof offsetBefore === "function") offsetBefore = params.slidesOffsetBefore.call(swiper);
	let offsetAfter = params.slidesOffsetAfter;
	if (typeof offsetAfter === "function") offsetAfter = params.slidesOffsetAfter.call(swiper);
	const previousSnapGridLength = swiper.snapGrid.length;
	const previousSlidesGridLength = swiper.slidesGrid.length;
	const swiperSize = swiper.size - offsetBefore - offsetAfter;
	let spaceBetween = params.spaceBetween;
	let slidePosition = -offsetBefore;
	let prevSlideSize = 0;
	let index = 0;
	if (typeof swiperSize === "undefined") return;
	if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
	else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
	swiper.virtualSize = -spaceBetween - offsetBefore - offsetAfter;
	slides.forEach((slideEl) => {
		if (rtl) slideEl.style.marginLeft = "";
		else slideEl.style.marginRight = "";
		slideEl.style.marginBottom = "";
		slideEl.style.marginTop = "";
	});
	if (params.centeredSlides && params.cssMode) {
		setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
		setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
	}
	if (params.cssMode) {
		setCSSProperty(wrapperEl, "--swiper-slides-offset-before", `${offsetBefore}px`);
		setCSSProperty(wrapperEl, "--swiper-slides-offset-after", `${offsetAfter}px`);
	}
	const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
	if (gridEnabled) swiper.grid.initSlides(slides);
	else if (swiper.grid) swiper.grid.unsetSlides();
	let slideSize;
	const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
		return typeof params.breakpoints[key].slidesPerView !== "undefined";
	}).length > 0;
	for (let i = 0; i < slidesLength; i += 1) {
		slideSize = 0;
		const slide = slides[i];
		if (slide) {
			if (gridEnabled) swiper.grid.updateSlide(i, slide, slides);
			if (elementStyle(slide, "display") === "none") continue;
		}
		if (isVirtual && params.slidesPerView === "auto") {
			if (params.virtual.slidesPerViewAutoSlideSize) slideSize = params.virtual.slidesPerViewAutoSlideSize;
			if (slideSize && slide) {
				if (params.roundLengths) slideSize = Math.floor(slideSize);
				slide.style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
			}
		} else if (params.slidesPerView === "auto") {
			if (shouldResetSlideSize) slide.style[swiper.getDirectionLabel("width")] = ``;
			const slideStyles = getComputedStyle(slide);
			const currentTransform = slide.style.transform;
			const currentWebKitTransform = slide.style.webkitTransform;
			if (currentTransform) slide.style.transform = "none";
			if (currentWebKitTransform) slide.style.webkitTransform = "none";
			if (params.roundLengths) slideSize = swiper.isHorizontal() ? elementOuterSize(slide, "width", true) : elementOuterSize(slide, "height", true);
			else {
				const width = getDirectionPropertyValue(slideStyles, "width");
				const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
				const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
				const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
				const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
				const boxSizing = slideStyles.getPropertyValue("box-sizing");
				if (boxSizing && boxSizing === "border-box") slideSize = width + marginLeft + marginRight;
				else {
					const { clientWidth, offsetWidth } = slide;
					slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
				}
			}
			if (currentTransform) slide.style.transform = currentTransform;
			if (currentWebKitTransform) slide.style.webkitTransform = currentWebKitTransform;
			if (params.roundLengths) slideSize = Math.floor(slideSize);
		} else {
			slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
			if (params.roundLengths) slideSize = Math.floor(slideSize);
			if (slide) slide.style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
		}
		if (slide) slide.swiperSlideSize = slideSize;
		slidesSizesGrid.push(slideSize);
		if (params.centeredSlides) {
			slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
			if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
			if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
			if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
			if (params.roundLengths) slidePosition = Math.floor(slidePosition);
			if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
			slidesGrid.push(slidePosition);
		} else {
			if (params.roundLengths) slidePosition = Math.floor(slidePosition);
			if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
			slidesGrid.push(slidePosition);
			slidePosition = slidePosition + slideSize + spaceBetween;
		}
		swiper.virtualSize += slideSize + spaceBetween;
		prevSlideSize = slideSize;
		index += 1;
	}
	swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
	if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
	if (params.setWrapperSize) wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
	if (gridEnabled) swiper.grid.updateWrapperSize(slideSize, snapGrid);
	if (!params.centeredSlides) {
		const isFractionalSlidesPerView = params.slidesPerView !== "auto" && params.slidesPerView % 1 !== 0;
		const shouldSnapToSlideEdge = params.snapToSlideEdge && !params.loop && (params.slidesPerView === "auto" || isFractionalSlidesPerView);
		let lastAllowedSnapIndex = snapGrid.length;
		if (shouldSnapToSlideEdge) {
			let minVisibleSlides;
			if (params.slidesPerView === "auto") {
				minVisibleSlides = 1;
				let accumulatedSize = 0;
				for (let i = slidesSizesGrid.length - 1; i >= 0; i -= 1) {
					accumulatedSize += slidesSizesGrid[i] + (i < slidesSizesGrid.length - 1 ? spaceBetween : 0);
					if (accumulatedSize <= swiperSize) minVisibleSlides = slidesSizesGrid.length - i;
					else break;
				}
			} else minVisibleSlides = Math.floor(params.slidesPerView);
			lastAllowedSnapIndex = Math.max(slidesLength - minVisibleSlides, 0);
		}
		const newSlidesGrid = [];
		for (let i = 0; i < snapGrid.length; i += 1) {
			let slidesGridItem = snapGrid[i];
			if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
			if (shouldSnapToSlideEdge) {
				if (i <= lastAllowedSnapIndex) newSlidesGrid.push(slidesGridItem);
			} else if (snapGrid[i] <= swiper.virtualSize - swiperSize) newSlidesGrid.push(slidesGridItem);
		}
		snapGrid = newSlidesGrid;
		if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
			if (!shouldSnapToSlideEdge) snapGrid.push(swiper.virtualSize - swiperSize);
		}
	}
	if (isVirtual && params.loop) {
		const size = slidesSizesGrid[0] + spaceBetween;
		if (params.slidesPerGroup > 1) {
			const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
			const groupSize = size * params.slidesPerGroup;
			for (let i = 0; i < groups; i += 1) snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
		}
		for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
			if (params.slidesPerGroup === 1) snapGrid.push(snapGrid[snapGrid.length - 1] + size);
			slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
			swiper.virtualSize += size;
		}
	}
	if (snapGrid.length === 0) snapGrid = [0];
	if (spaceBetween !== 0) {
		const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
		slides.filter((_, slideIndex) => {
			if (!params.cssMode || params.loop) return true;
			if (slideIndex === slides.length - 1) return false;
			return true;
		}).forEach((slideEl) => {
			slideEl.style[key] = `${spaceBetween}px`;
		});
	}
	if (params.centeredSlides && params.centeredSlidesBounds) {
		let allSlidesSize = 0;
		slidesSizesGrid.forEach((slideSizeValue) => {
			allSlidesSize += slideSizeValue + (spaceBetween || 0);
		});
		allSlidesSize -= spaceBetween;
		const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
		snapGrid = snapGrid.map((snap) => {
			if (snap <= 0) return -offsetBefore;
			if (snap > maxSnap) return maxSnap + offsetAfter;
			return snap;
		});
	}
	if (params.centerInsufficientSlides) {
		let allSlidesSize = 0;
		slidesSizesGrid.forEach((slideSizeValue) => {
			allSlidesSize += slideSizeValue + (spaceBetween || 0);
		});
		allSlidesSize -= spaceBetween;
		if (allSlidesSize < swiperSize) {
			const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
			snapGrid.forEach((snap, snapIndex) => {
				snapGrid[snapIndex] = snap - allSlidesOffset;
			});
			slidesGrid.forEach((snap, snapIndex) => {
				slidesGrid[snapIndex] = snap + allSlidesOffset;
			});
		}
	}
	Object.assign(swiper, {
		slides,
		snapGrid,
		slidesGrid,
		slidesSizesGrid
	});
	if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
		setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
		setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
		const addToSnapGrid = -swiper.snapGrid[0];
		const addToSlidesGrid = -swiper.slidesGrid[0];
		swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
		swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
	}
	if (slidesLength !== previousSlidesLength) swiper.emit("slidesLengthChange");
	if (snapGrid.length !== previousSnapGridLength) {
		if (swiper.params.watchOverflow) swiper.checkOverflow();
		swiper.emit("snapGridLengthChange");
	}
	if (slidesGrid.length !== previousSlidesGridLength) swiper.emit("slidesGridLengthChange");
	if (params.watchSlidesProgress) swiper.updateSlidesOffset();
	swiper.emit("slidesUpdated");
	if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
		const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
		const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
		if (slidesLength <= params.maxBackfaceHiddenSlides) {
			if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
		} else if (hasClassBackfaceClassAdded) swiper.el.classList.remove(backFaceHiddenClass);
	}
}
function updateAutoHeight(speed) {
	const swiper = this;
	const activeSlides = [];
	const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
	let newHeight = 0;
	let i;
	if (typeof speed === "number") swiper.setTransition(speed);
	else if (speed === true) swiper.setTransition(swiper.params.speed);
	const getSlideByIndex = (index) => {
		if (isVirtual) return swiper.slides[swiper.getSlideIndexByData(index)];
		return swiper.slides[index];
	};
	if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) {
		if (swiper.params.centeredSlides) (swiper.visibleSlides || []).forEach((slide) => {
			activeSlides.push(slide);
		});
		else for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
			const index = swiper.activeIndex + i;
			if (index > swiper.slides.length && !isVirtual) break;
			activeSlides.push(getSlideByIndex(index));
		}
	} else activeSlides.push(getSlideByIndex(swiper.activeIndex));
	for (i = 0; i < activeSlides.length; i += 1) if (typeof activeSlides[i] !== "undefined") {
		const height = activeSlides[i].offsetHeight;
		newHeight = height > newHeight ? height : newHeight;
	}
	if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
	const swiper = this;
	const slides = swiper.slides;
	const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
	for (let i = 0; i < slides.length; i += 1) slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
}
var toggleSlideClasses$1 = (slideEl, condition, className) => {
	if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className);
	else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
};
function updateSlidesProgress(translate = this && this.translate || 0) {
	const swiper = this;
	const params = swiper.params;
	const { slides, rtlTranslate: rtl, snapGrid } = swiper;
	if (slides.length === 0) return;
	if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
	let offsetCenter = -translate;
	if (rtl) offsetCenter = translate;
	swiper.visibleSlidesIndexes = [];
	swiper.visibleSlides = [];
	let spaceBetween = params.spaceBetween;
	if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size;
	else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
	for (let i = 0; i < slides.length; i += 1) {
		const slide = slides[i];
		let slideOffset = slide.swiperSlideOffset;
		if (params.cssMode && params.centeredSlides) slideOffset -= slides[0].swiperSlideOffset;
		const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
		const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
		const slideBefore = -(offsetCenter - slideOffset);
		const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
		const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
		const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
		if (isVisible) {
			swiper.visibleSlides.push(slide);
			swiper.visibleSlidesIndexes.push(i);
		}
		toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
		toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
		slide.progress = rtl ? -slideProgress : slideProgress;
		slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
	}
}
function updateProgress(translate) {
	const swiper = this;
	if (typeof translate === "undefined") {
		const multiplier = swiper.rtlTranslate ? -1 : 1;
		translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
	}
	const params = swiper.params;
	const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	let { progress, isBeginning, isEnd, progressLoop } = swiper;
	const wasBeginning = isBeginning;
	const wasEnd = isEnd;
	if (translatesDiff === 0) {
		progress = 0;
		isBeginning = true;
		isEnd = true;
	} else {
		progress = (translate - swiper.minTranslate()) / translatesDiff;
		const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
		const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
		isBeginning = isBeginningRounded || progress <= 0;
		isEnd = isEndRounded || progress >= 1;
		if (isBeginningRounded) progress = 0;
		if (isEndRounded) progress = 1;
	}
	if (params.loop) {
		const firstSlideIndex = swiper.getSlideIndexByData(0);
		const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
		const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
		const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
		const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
		const translateAbs = Math.abs(translate);
		if (translateAbs >= firstSlideTranslate) progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
		else progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
		if (progressLoop > 1) progressLoop -= 1;
	}
	Object.assign(swiper, {
		progress,
		progressLoop,
		isBeginning,
		isEnd
	});
	if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
	if (isBeginning && !wasBeginning) swiper.emit("reachBeginning toEdge");
	if (isEnd && !wasEnd) swiper.emit("reachEnd toEdge");
	if (wasBeginning && !isBeginning || wasEnd && !isEnd) swiper.emit("fromEdge");
	swiper.emit("progress", progress);
}
var toggleSlideClasses = (slideEl, condition, className) => {
	if (condition && !slideEl.classList.contains(className)) slideEl.classList.add(className);
	else if (!condition && slideEl.classList.contains(className)) slideEl.classList.remove(className);
};
function updateSlidesClasses() {
	const swiper = this;
	const { slides, params, slidesEl, activeIndex } = swiper;
	const isVirtual = swiper.virtual && params.virtual.enabled;
	const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	const getFilteredSlide = (selector) => {
		return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
	};
	let activeSlide;
	let prevSlide;
	let nextSlide;
	if (isVirtual) {
		if (params.loop) {
			let slideIndex = activeIndex - swiper.virtual.slidesBefore;
			if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
			if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
			activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
		} else activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
	} else if (gridEnabled) {
		activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
		nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
		prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
	} else activeSlide = slides[activeIndex];
	if (activeSlide) {
		if (!gridEnabled) {
			nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
			if (params.loop && !nextSlide) nextSlide = slides[0];
			prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
			if (params.loop && false);
		}
	}
	slides.forEach((slideEl) => {
		toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
		toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
		toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
	});
	swiper.emitSlidesClasses();
}
var processLazyPreloader = (swiper, imageEl) => {
	if (!swiper || swiper.destroyed || !swiper.params) return;
	const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
	const slideEl = imageEl.closest(slideSelector());
	if (slideEl) {
		let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
		if (!lazyEl && swiper.isElement) {
			if (slideEl.shadowRoot) lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
			else requestAnimationFrame(() => {
				if (slideEl.shadowRoot) {
					lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
					if (lazyEl && !lazyEl.lazyPreloaderManaged) lazyEl.remove();
				}
			});
		}
		if (lazyEl && !lazyEl.lazyPreloaderManaged) lazyEl.remove();
	}
};
var unlazy = (swiper, index) => {
	if (!swiper.slides[index]) return;
	const imageEl = swiper.slides[index].querySelector("[loading=\"lazy\"]");
	if (imageEl) imageEl.removeAttribute("loading");
};
var preload = (swiper) => {
	if (!swiper || swiper.destroyed || !swiper.params) return;
	let amount = swiper.params.lazyPreloadPrevNext;
	const len = swiper.slides.length;
	if (!len || !amount || amount < 0) return;
	amount = Math.min(amount, len);
	const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
	const activeIndex = swiper.activeIndex;
	if (swiper.params.grid && swiper.params.grid.rows > 1) {
		const activeColumn = activeIndex;
		const preloadColumns = [activeColumn - amount];
		preloadColumns.push(...Array.from({ length: amount }).map((_, i) => {
			return activeColumn + slidesPerView + i;
		}));
		swiper.slides.forEach((slideEl, i) => {
			if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
		});
		return;
	}
	const slideIndexLastInView = activeIndex + slidesPerView - 1;
	if (swiper.params.rewind || swiper.params.loop) for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
		const realIndex = (i % len + len) % len;
		if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
	}
	else for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) unlazy(swiper, i);
};
function getActiveIndexByTranslate(swiper) {
	const { slidesGrid, params } = swiper;
	const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	let activeIndex;
	for (let i = 0; i < slidesGrid.length; i += 1) if (typeof slidesGrid[i + 1] !== "undefined") {
		if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) activeIndex = i;
		else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) activeIndex = i + 1;
	} else if (translate >= slidesGrid[i]) activeIndex = i;
	if (params.normalizeSlideIndex) {
		if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
	}
	return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
	const swiper = this;
	const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	const { snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex } = swiper;
	let activeIndex = newActiveIndex;
	let snapIndex;
	const getVirtualRealIndex = (aIndex) => {
		let realIndex = aIndex - swiper.virtual.slidesBefore;
		if (realIndex < 0) realIndex = swiper.virtual.slides.length + realIndex;
		if (realIndex >= swiper.virtual.slides.length) realIndex -= swiper.virtual.slides.length;
		return realIndex;
	};
	if (typeof activeIndex === "undefined") activeIndex = getActiveIndexByTranslate(swiper);
	if (snapGrid.indexOf(translate) >= 0) snapIndex = snapGrid.indexOf(translate);
	else {
		const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
		snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
	}
	if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
	if (activeIndex === previousIndex && !swiper.params.loop) {
		if (snapIndex !== previousSnapIndex) {
			swiper.snapIndex = snapIndex;
			swiper.emit("snapIndexChange");
		}
		return;
	}
	if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
		swiper.realIndex = getVirtualRealIndex(activeIndex);
		return;
	}
	const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	let realIndex;
	if (swiper.virtual && params.virtual.enabled) {
		if (params.loop) realIndex = getVirtualRealIndex(activeIndex);
		else realIndex = activeIndex;
	} else if (gridEnabled) {
		const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
		let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
		if (Number.isNaN(activeSlideIndex)) activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
		realIndex = Math.floor(activeSlideIndex / params.grid.rows);
	} else if (swiper.slides[activeIndex]) {
		const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
		if (slideIndex) realIndex = parseInt(slideIndex, 10);
		else realIndex = activeIndex;
	} else realIndex = activeIndex;
	Object.assign(swiper, {
		previousSnapIndex,
		snapIndex,
		previousRealIndex,
		realIndex,
		previousIndex,
		activeIndex
	});
	if (swiper.initialized) preload(swiper);
	swiper.emit("activeIndexChange");
	swiper.emit("snapIndexChange");
	if (swiper.initialized || swiper.params.runCallbacksOnInit) {
		if (previousRealIndex !== realIndex) swiper.emit("realIndexChange");
		swiper.emit("slideChange");
	}
}
function updateClickedSlide(el, path) {
	const swiper = this;
	const params = swiper.params;
	let slide = el.closest(`.${params.slideClass}, swiper-slide`);
	if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
		if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) slide = pathEl;
	});
	let slideFound = false;
	let slideIndex;
	if (slide) {
		for (let i = 0; i < swiper.slides.length; i += 1) if (swiper.slides[i] === slide) {
			slideFound = true;
			slideIndex = i;
			break;
		}
	}
	if (slide && slideFound) {
		swiper.clickedSlide = slide;
		if (swiper.virtual && swiper.params.virtual.enabled) swiper.clickedIndex = parseInt(slide.getAttribute("data-swiper-slide-index"), 10);
		else swiper.clickedIndex = slideIndex;
	} else {
		swiper.clickedSlide = void 0;
		swiper.clickedIndex = void 0;
		return;
	}
	if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) swiper.slideToClickedSlide();
}
var update = {
	updateSize,
	updateSlides,
	updateAutoHeight,
	updateSlidesOffset,
	updateSlidesProgress,
	updateProgress,
	updateSlidesClasses,
	updateActiveIndex,
	updateClickedSlide
};
function getSwiperTranslate(axis = this.isHorizontal() ? "x" : "y") {
	const swiper = this;
	const { params, rtlTranslate: rtl, translate, wrapperEl } = swiper;
	if (params.virtualTranslate) return rtl ? -translate : translate;
	if (params.cssMode) return translate;
	let currentTranslate = getTranslate(wrapperEl, axis);
	currentTranslate += swiper.cssOverflowAdjustment();
	if (rtl) currentTranslate = -currentTranslate;
	return currentTranslate || 0;
}
function setTranslate(translate, byController) {
	const swiper = this;
	const { rtlTranslate: rtl, params, wrapperEl, progress } = swiper;
	let x = 0;
	let y = 0;
	const z = 0;
	if (swiper.isHorizontal()) x = rtl ? -translate : translate;
	else y = translate;
	if (params.roundLengths) {
		x = Math.floor(x);
		y = Math.floor(y);
	}
	swiper.previousTranslate = swiper.translate;
	swiper.translate = swiper.isHorizontal() ? x : y;
	if (params.cssMode) wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y;
	else if (!params.virtualTranslate) {
		if (swiper.isHorizontal()) x -= swiper.cssOverflowAdjustment();
		else y -= swiper.cssOverflowAdjustment();
		wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
	}
	let newProgress;
	const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	if (translatesDiff === 0) newProgress = 0;
	else newProgress = (translate - swiper.minTranslate()) / translatesDiff;
	if (newProgress !== progress) swiper.updateProgress(translate);
	swiper.emit("setTranslate", swiper.translate, byController);
}
function minTranslate() {
	return -this.snapGrid[0];
}
function maxTranslate() {
	return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate = 0, speed = this.params.speed, runCallbacks = true, translateBounds = true, internal) {
	const swiper = this;
	const { params, wrapperEl } = swiper;
	if (swiper.animating && params.preventInteractionOnTransition) return false;
	const minTranslate = swiper.minTranslate();
	const maxTranslate = swiper.maxTranslate();
	let newTranslate;
	if (translateBounds && translate > minTranslate) newTranslate = minTranslate;
	else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;
	else newTranslate = translate;
	swiper.updateProgress(newTranslate);
	if (params.cssMode) {
		const isH = swiper.isHorizontal();
		if (speed === 0) wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
		else {
			if (!swiper.support.smoothScroll) {
				animateCSSModeScroll({
					swiper,
					targetPosition: -newTranslate,
					side: isH ? "left" : "top"
				});
				return true;
			}
			wrapperEl.scrollTo({
				[isH ? "left" : "top"]: -newTranslate,
				behavior: "smooth"
			});
		}
		return true;
	}
	if (speed === 0) {
		swiper.setTransition(0);
		swiper.setTranslate(newTranslate);
		if (runCallbacks) {
			swiper.emit("beforeTransitionStart", speed, internal);
			swiper.emit("transitionEnd");
		}
	} else {
		swiper.setTransition(speed);
		swiper.setTranslate(newTranslate);
		if (runCallbacks) {
			swiper.emit("beforeTransitionStart", speed, internal);
			swiper.emit("transitionStart");
		}
		if (!swiper.animating) {
			swiper.animating = true;
			if (!swiper.onTranslateToWrapperTransitionEnd) swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
				if (!swiper || swiper.destroyed) return;
				if (e.target !== this) return;
				swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
				swiper.onTranslateToWrapperTransitionEnd = null;
				delete swiper.onTranslateToWrapperTransitionEnd;
				swiper.animating = false;
				if (runCallbacks) swiper.emit("transitionEnd");
			};
			swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
		}
	}
	return true;
}
var translate = {
	getTranslate: getSwiperTranslate,
	setTranslate,
	minTranslate,
	maxTranslate,
	translateTo
};
function setTransition(duration, byController) {
	const swiper = this;
	if (!swiper.params.cssMode) {
		swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
		swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
	}
	swiper.emit("setTransition", duration, byController);
}
function transitionEmit({ swiper, runCallbacks, direction, step }) {
	const { activeIndex, previousIndex } = swiper;
	let dir = direction;
	if (!dir) {
		if (activeIndex > previousIndex) dir = "next";
		else if (activeIndex < previousIndex) dir = "prev";
		else dir = "reset";
	}
	swiper.emit(`transition${step}`);
	if (runCallbacks && dir === "reset") swiper.emit(`slideResetTransition${step}`);
	else if (runCallbacks && activeIndex !== previousIndex) {
		swiper.emit(`slideChangeTransition${step}`);
		if (dir === "next") swiper.emit(`slideNextTransition${step}`);
		else swiper.emit(`slidePrevTransition${step}`);
	}
}
function transitionStart(runCallbacks = true, direction) {
	const swiper = this;
	const { params } = swiper;
	if (params.cssMode) return;
	if (params.autoHeight) swiper.updateAutoHeight();
	transitionEmit({
		swiper,
		runCallbacks,
		direction,
		step: "Start"
	});
}
function transitionEnd(runCallbacks = true, direction) {
	const swiper = this;
	const { params } = swiper;
	swiper.animating = false;
	if (params.cssMode) return;
	swiper.setTransition(0);
	transitionEmit({
		swiper,
		runCallbacks,
		direction,
		step: "End"
	});
}
var transition = {
	setTransition,
	transitionStart,
	transitionEnd
};
function slideTo(index = 0, speed, runCallbacks = true, internal, initial) {
	if (typeof index === "string") index = parseInt(index, 10);
	const swiper = this;
	let slideIndex = index;
	if (slideIndex < 0) slideIndex = 0;
	const { params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled } = swiper;
	if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) return false;
	if (typeof speed === "undefined") speed = swiper.params.speed;
	const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
	let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
	if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
	const translate = -snapGrid[snapIndex];
	if (params.normalizeSlideIndex) for (let i = 0; i < slidesGrid.length; i += 1) {
		const normalizedTranslate = -Math.floor(translate * 100);
		const normalizedGrid = Math.floor(slidesGrid[i] * 100);
		const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
		if (typeof slidesGrid[i + 1] !== "undefined") {
			if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) slideIndex = i;
			else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) slideIndex = i + 1;
		} else if (normalizedTranslate >= normalizedGrid) slideIndex = i;
	}
	if (swiper.initialized && slideIndex !== activeIndex) {
		if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) return false;
		if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
			if ((activeIndex || 0) !== slideIndex) return false;
		}
	}
	if (slideIndex !== (previousIndex || 0) && runCallbacks) swiper.emit("beforeSlideChangeStart");
	swiper.updateProgress(translate);
	let direction;
	if (slideIndex > activeIndex) direction = "next";
	else if (slideIndex < activeIndex) direction = "prev";
	else direction = "reset";
	const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
	if (!(isVirtual && initial) && (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate)) {
		swiper.updateActiveIndex(slideIndex);
		if (params.autoHeight) swiper.updateAutoHeight();
		swiper.updateSlidesClasses();
		if (params.effect !== "slide") swiper.setTranslate(translate);
		if (direction !== "reset") {
			swiper.transitionStart(runCallbacks, direction);
			swiper.transitionEnd(runCallbacks, direction);
		}
		return false;
	}
	if (params.cssMode) {
		const isH = swiper.isHorizontal();
		const t = rtl ? translate : -translate;
		if (speed === 0) {
			if (isVirtual) {
				swiper.wrapperEl.style.scrollSnapType = "none";
				swiper._immediateVirtual = true;
			}
			if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
				swiper._cssModeVirtualInitialSet = true;
				requestAnimationFrame(() => {
					wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
				});
			} else wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
			if (isVirtual) requestAnimationFrame(() => {
				swiper.wrapperEl.style.scrollSnapType = "";
				swiper._immediateVirtual = false;
			});
		} else {
			if (!swiper.support.smoothScroll) {
				animateCSSModeScroll({
					swiper,
					targetPosition: t,
					side: isH ? "left" : "top"
				});
				return true;
			}
			wrapperEl.scrollTo({
				[isH ? "left" : "top"]: t,
				behavior: "smooth"
			});
		}
		return true;
	}
	const isSafari = getBrowser().isSafari;
	if (isVirtual && !initial && isSafari && swiper.isElement) swiper.virtual.update(false, false, slideIndex);
	swiper.setTransition(speed);
	swiper.setTranslate(translate);
	swiper.updateActiveIndex(slideIndex);
	swiper.updateSlidesClasses();
	swiper.emit("beforeTransitionStart", speed, internal);
	swiper.transitionStart(runCallbacks, direction);
	if (speed === 0) swiper.transitionEnd(runCallbacks, direction);
	else if (!swiper.animating) {
		swiper.animating = true;
		if (!swiper.onSlideToWrapperTransitionEnd) swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
			if (!swiper || swiper.destroyed) return;
			if (e.target !== this) return;
			swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
			swiper.onSlideToWrapperTransitionEnd = null;
			delete swiper.onSlideToWrapperTransitionEnd;
			swiper.transitionEnd(runCallbacks, direction);
		};
		swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
	}
	return true;
}
function slideToLoop(index = 0, speed, runCallbacks = true, internal) {
	if (typeof index === "string") index = parseInt(index, 10);
	const swiper = this;
	if (swiper.destroyed) return;
	if (typeof speed === "undefined") speed = swiper.params.speed;
	const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
	let newIndex = index;
	if (swiper.params.loop) {
		if (swiper.virtual && swiper.params.virtual.enabled) newIndex = newIndex + swiper.virtual.slidesBefore;
		else {
			let targetSlideIndex;
			if (gridEnabled) {
				const slideIndex = newIndex * swiper.params.grid.rows;
				targetSlideIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
			} else targetSlideIndex = swiper.getSlideIndexByData(newIndex);
			const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
			const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter } = swiper.params;
			const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
			let slidesPerView = swiper.params.slidesPerView;
			if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic();
			else {
				slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
				if (bothDirections && slidesPerView % 2 === 0) slidesPerView = slidesPerView + 1;
			}
			let needLoopFix = cols - targetSlideIndex < slidesPerView;
			if (bothDirections) needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
			if (internal && bothDirections && swiper.params.slidesPerView !== "auto" && !gridEnabled) needLoopFix = false;
			if (needLoopFix) {
				const direction = bothDirections ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
				swiper.loopFix({
					direction,
					slideTo: true,
					activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
					slideRealIndex: direction === "next" ? swiper.realIndex : void 0
				});
			}
			if (gridEnabled) {
				const slideIndex = newIndex * swiper.params.grid.rows;
				newIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
			} else newIndex = swiper.getSlideIndexByData(newIndex);
		}
	}
	requestAnimationFrame(() => {
		swiper.slideTo(newIndex, speed, runCallbacks, internal);
	});
	return swiper;
}
function slideNext(speed, runCallbacks = true, internal) {
	const swiper = this;
	const { enabled, params, animating } = swiper;
	if (!enabled || swiper.destroyed) return swiper;
	if (typeof speed === "undefined") speed = swiper.params.speed;
	let perGroup = params.slidesPerGroup;
	if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
	const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
	const isVirtual = swiper.virtual && params.virtual.enabled;
	if (params.loop) {
		if (animating && !isVirtual && params.loopPreventsSliding) return false;
		swiper.loopFix({ direction: "next" });
		swiper._clientLeft = swiper.wrapperEl.clientLeft;
		if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
			requestAnimationFrame(() => {
				swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
			});
			return true;
		}
	}
	if (params.rewind && swiper.isEnd) return swiper.slideTo(0, speed, runCallbacks, internal);
	return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}
function slidePrev(speed, runCallbacks = true, internal) {
	const swiper = this;
	const { params, snapGrid, slidesGrid, rtlTranslate, enabled, animating } = swiper;
	if (!enabled || swiper.destroyed) return swiper;
	if (typeof speed === "undefined") speed = swiper.params.speed;
	const isVirtual = swiper.virtual && params.virtual.enabled;
	if (params.loop) {
		if (animating && !isVirtual && params.loopPreventsSliding) return false;
		swiper.loopFix({ direction: "prev" });
		swiper._clientLeft = swiper.wrapperEl.clientLeft;
	}
	const translate = rtlTranslate ? swiper.translate : -swiper.translate;
	function normalize(val) {
		if (val < 0) return -Math.floor(Math.abs(val));
		return Math.floor(val);
	}
	const normalizedTranslate = normalize(translate);
	const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
	const isFreeMode = params.freeMode && params.freeMode.enabled;
	let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
	if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
		let prevSnapIndex;
		snapGrid.forEach((snap, snapIndex) => {
			if (normalizedTranslate >= snap) prevSnapIndex = snapIndex;
		});
		if (typeof prevSnapIndex !== "undefined") prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
	}
	let prevIndex = 0;
	if (typeof prevSnap !== "undefined") {
		prevIndex = slidesGrid.indexOf(prevSnap);
		if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
		if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
			prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
			prevIndex = Math.max(prevIndex, 0);
		}
	}
	if (params.rewind && swiper.isBeginning) {
		const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
		return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
	} else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
		requestAnimationFrame(() => {
			swiper.slideTo(prevIndex, speed, runCallbacks, internal);
		});
		return true;
	}
	return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}
function slideReset(speed, runCallbacks = true, internal) {
	const swiper = this;
	if (swiper.destroyed) return;
	if (typeof speed === "undefined") speed = swiper.params.speed;
	return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}
function slideToClosest(speed, runCallbacks = true, internal, threshold = .5) {
	const swiper = this;
	if (swiper.destroyed) return;
	if (typeof speed === "undefined") speed = swiper.params.speed;
	let index = swiper.activeIndex;
	const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
	const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
	const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	if (translate >= swiper.snapGrid[snapIndex]) {
		const currentSnap = swiper.snapGrid[snapIndex];
		const nextSnap = swiper.snapGrid[snapIndex + 1];
		if (translate - currentSnap > (nextSnap - currentSnap) * threshold) index += swiper.params.slidesPerGroup;
	} else {
		const prevSnap = swiper.snapGrid[snapIndex - 1];
		const currentSnap = swiper.snapGrid[snapIndex];
		if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) index -= swiper.params.slidesPerGroup;
	}
	index = Math.max(index, 0);
	index = Math.min(index, swiper.slidesGrid.length - 1);
	return swiper.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
	const swiper = this;
	if (swiper.destroyed) return;
	const { params, slidesEl } = swiper;
	const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
	let slideToIndex = swiper.getSlideIndexWhenGrid(swiper.clickedIndex);
	let realIndex;
	const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
	const isGrid = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
	if (params.loop) {
		if (swiper.animating) return;
		realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
		if (params.centeredSlides) swiper.slideToLoop(realIndex);
		else if (slideToIndex > (isGrid ? (swiper.slides.length - slidesPerView) / 2 - (swiper.params.grid.rows - 1) : swiper.slides.length - slidesPerView)) {
			swiper.loopFix();
			slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
			nextTick(() => {
				swiper.slideTo(slideToIndex);
			});
		} else swiper.slideTo(slideToIndex);
	} else swiper.slideTo(slideToIndex);
}
var slide = {
	slideTo,
	slideToLoop,
	slideNext,
	slidePrev,
	slideReset,
	slideToClosest,
	slideToClickedSlide
};
function loopCreate(slideRealIndex, initial) {
	const swiper = this;
	const { params, slidesEl } = swiper;
	if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
	const initSlides = () => {
		elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`).forEach((el, index) => {
			el.setAttribute("data-swiper-slide-index", index);
		});
	};
	const clearBlankSlides = () => {
		const slides = elementChildren(slidesEl, `.${params.slideBlankClass}`);
		slides.forEach((el) => {
			el.remove();
		});
		if (slides.length > 0) {
			swiper.recalcSlides();
			swiper.updateSlides();
		}
	};
	const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	if (params.loopAddBlankSlides && (params.slidesPerGroup > 1 || gridEnabled)) clearBlankSlides();
	const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
	const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
	const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
	const addBlankSlides = (amountOfSlides) => {
		for (let i = 0; i < amountOfSlides; i += 1) {
			const slideEl = swiper.isElement ? createElement$1("swiper-slide", [params.slideBlankClass]) : createElement$1("div", [params.slideClass, params.slideBlankClass]);
			swiper.slidesEl.append(slideEl);
		}
	};
	if (shouldFillGroup) {
		if (params.loopAddBlankSlides) {
			addBlankSlides(slidesPerGroup - swiper.slides.length % slidesPerGroup);
			swiper.recalcSlides();
			swiper.updateSlides();
		} else showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
		initSlides();
	} else if (shouldFillGrid) {
		if (params.loopAddBlankSlides) {
			addBlankSlides(params.grid.rows - swiper.slides.length % params.grid.rows);
			swiper.recalcSlides();
			swiper.updateSlides();
		} else showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
		initSlides();
	} else initSlides();
	const bothDirections = params.centeredSlides || !!params.slidesOffsetBefore || !!params.slidesOffsetAfter;
	swiper.loopFix({
		slideRealIndex,
		direction: bothDirections ? void 0 : "next",
		initial
	});
}
function loopFix({ slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex, initial, byController, byMousewheel } = {}) {
	const swiper = this;
	if (!swiper.params.loop) return;
	swiper.emit("beforeLoopFix");
	const { slides, allowSlidePrev, allowSlideNext, slidesEl, params } = swiper;
	const { centeredSlides, slidesOffsetBefore, slidesOffsetAfter, initialSlide } = params;
	const bothDirections = centeredSlides || !!slidesOffsetBefore || !!slidesOffsetAfter;
	swiper.allowSlidePrev = true;
	swiper.allowSlideNext = true;
	if (swiper.virtual && params.virtual.enabled) {
		if (slideTo) {
			if (!bothDirections && swiper.snapIndex === 0) swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
			else if (bothDirections && swiper.snapIndex < params.slidesPerView) swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
			else if (swiper.snapIndex === swiper.snapGrid.length - 1) swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
		}
		swiper.allowSlidePrev = allowSlidePrev;
		swiper.allowSlideNext = allowSlideNext;
		swiper.emit("loopFix");
		return;
	}
	let slidesPerView = params.slidesPerView;
	if (slidesPerView === "auto") slidesPerView = swiper.slidesPerViewDynamic();
	else {
		slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
		if (bothDirections && slidesPerView % 2 === 0) slidesPerView = slidesPerView + 1;
	}
	const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
	let loopedSlides = bothDirections ? Math.max(slidesPerGroup, Math.ceil(slidesPerView / 2)) : slidesPerGroup;
	if (loopedSlides % slidesPerGroup !== 0) loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
	loopedSlides += params.loopAdditionalSlides;
	swiper.loopedSlides = loopedSlides;
	const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
	else if (gridEnabled && params.grid.fill === "row") showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
	const prependSlidesIndexes = [];
	const appendSlidesIndexes = [];
	const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
	const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !bothDirections;
	let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
	if (typeof activeSlideIndex === "undefined") activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
	else activeIndex = activeSlideIndex;
	const isNext = direction === "next" || !direction;
	const isPrev = direction === "prev" || !direction;
	let slidesPrepended = 0;
	let slidesAppended = 0;
	const activeColIndexWithShift = (gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex) + (bothDirections && typeof setTranslate === "undefined" ? -slidesPerView / 2 + .5 : 0);
	if (activeColIndexWithShift < loopedSlides) {
		slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
		for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
			const index = i - Math.floor(i / cols) * cols;
			if (gridEnabled) {
				const colIndexToPrepend = cols - index - 1;
				for (let i = slides.length - 1; i >= 0; i -= 1) if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
			} else prependSlidesIndexes.push(cols - index - 1);
		}
	} else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
		slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
		if (isInitialOverflow) slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
		for (let i = 0; i < slidesAppended; i += 1) {
			const index = i - Math.floor(i / cols) * cols;
			if (gridEnabled) slides.forEach((slide, slideIndex) => {
				if (slide.column === index) appendSlidesIndexes.push(slideIndex);
			});
			else appendSlidesIndexes.push(index);
		}
	}
	swiper.__preventObserver__ = true;
	requestAnimationFrame(() => {
		swiper.__preventObserver__ = false;
	});
	if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
		if (appendSlidesIndexes.includes(activeSlideIndex)) appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
		if (prependSlidesIndexes.includes(activeSlideIndex)) prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
	}
	if (isPrev) prependSlidesIndexes.forEach((index) => {
		slides[index].swiperLoopMoveDOM = true;
		slidesEl.prepend(slides[index]);
		slides[index].swiperLoopMoveDOM = false;
	});
	if (isNext) appendSlidesIndexes.forEach((index) => {
		slides[index].swiperLoopMoveDOM = true;
		slidesEl.append(slides[index]);
		slides[index].swiperLoopMoveDOM = false;
	});
	swiper.recalcSlides();
	if (params.slidesPerView === "auto") swiper.updateSlides();
	else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) swiper.slides.forEach((slide, slideIndex) => {
		swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
	});
	if (params.watchSlidesProgress) swiper.updateSlidesOffset();
	if (slideTo) {
		if (prependSlidesIndexes.length > 0 && isPrev) {
			if (typeof slideRealIndex === "undefined") {
				const currentSlideTranslate = swiper.slidesGrid[activeIndex];
				const diff = swiper.slidesGrid[activeIndex + slidesPrepended] - currentSlideTranslate;
				if (byMousewheel) swiper.setTranslate(swiper.translate - diff);
				else {
					swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
					if (setTranslate) {
						swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
						swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
					}
				}
			} else if (setTranslate) {
				const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
				swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
				swiper.touchEventsData.currentTranslate = swiper.translate;
			}
		} else if (appendSlidesIndexes.length > 0 && isNext) {
			if (typeof slideRealIndex === "undefined") {
				const currentSlideTranslate = swiper.slidesGrid[activeIndex];
				const diff = swiper.slidesGrid[activeIndex - slidesAppended] - currentSlideTranslate;
				if (byMousewheel) swiper.setTranslate(swiper.translate - diff);
				else {
					swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
					if (setTranslate) {
						swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
						swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
					}
				}
			} else {
				const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
				swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
			}
		}
	}
	swiper.allowSlidePrev = allowSlidePrev;
	swiper.allowSlideNext = allowSlideNext;
	if (swiper.controller && swiper.controller.control && !byController) {
		const loopParams = {
			slideRealIndex,
			direction,
			setTranslate,
			activeSlideIndex,
			byController: true
		};
		if (Array.isArray(swiper.controller.control)) swiper.controller.control.forEach((c) => {
			if (!c.destroyed && c.params.loop) c.loopFix({
				...loopParams,
				slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
			});
		});
		else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) swiper.controller.control.loopFix({
			...loopParams,
			slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
		});
	}
	swiper.emit("loopFix");
}
function loopDestroy() {
	const swiper = this;
	const { params, slidesEl } = swiper;
	if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
	swiper.recalcSlides();
	const newSlidesOrder = [];
	swiper.slides.forEach((slideEl) => {
		const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
		newSlidesOrder[index] = slideEl;
	});
	swiper.slides.forEach((slideEl) => {
		slideEl.removeAttribute("data-swiper-slide-index");
	});
	newSlidesOrder.forEach((slideEl) => {
		slidesEl.append(slideEl);
	});
	swiper.recalcSlides();
	swiper.slideTo(swiper.realIndex, 0);
}
var loop = {
	loopCreate,
	loopFix,
	loopDestroy
};
function setGrabCursor(moving) {
	const swiper = this;
	if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
	const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
	if (swiper.isElement) swiper.__preventObserver__ = true;
	el.style.cursor = "move";
	el.style.cursor = moving ? "grabbing" : "grab";
	if (swiper.isElement) requestAnimationFrame(() => {
		swiper.__preventObserver__ = false;
	});
}
function unsetGrabCursor() {
	const swiper = this;
	if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
	if (swiper.isElement) swiper.__preventObserver__ = true;
	swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
	if (swiper.isElement) requestAnimationFrame(() => {
		swiper.__preventObserver__ = false;
	});
}
var grabCursor = {
	setGrabCursor,
	unsetGrabCursor
};
function closestElement(selector, base = this) {
	function __closestFrom(el) {
		if (!el || el === getDocument() || el === getWindow()) return null;
		if (el.assignedSlot) el = el.assignedSlot;
		const found = el.closest(selector);
		if (!found && !el.getRootNode) return null;
		return found || __closestFrom(el.getRootNode().host);
	}
	return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
	const window = getWindow();
	const { params } = swiper;
	const edgeSwipeDetection = params.edgeSwipeDetection;
	const edgeSwipeThreshold = params.edgeSwipeThreshold;
	if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
		if (edgeSwipeDetection === "prevent") {
			event.preventDefault();
			return true;
		}
		return false;
	}
	return true;
}
function onTouchStart(event) {
	const swiper = this;
	if (swiper.destroyed) return;
	const document = getDocument();
	let e = event;
	if (e.originalEvent) e = e.originalEvent;
	const data = swiper.touchEventsData;
	if (e.type === "pointerdown") {
		if (data.pointerId !== null && data.pointerId !== e.pointerId) return;
		data.pointerId = e.pointerId;
	} else if (e.type === "touchstart" && e.targetTouches.length === 1) data.touchId = e.targetTouches[0].identifier;
	if (e.type === "touchstart") {
		preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
		return;
	}
	const { params, touches, enabled } = swiper;
	if (!enabled) return;
	if (!params.simulateTouch && e.pointerType === "mouse") return;
	if (swiper.animating && params.preventInteractionOnTransition) return;
	if (!swiper.animating && params.cssMode && params.loop) swiper.loopFix();
	let targetEl = e.target;
	if (params.touchEventsTarget === "wrapper") {
		if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
	}
	if ("which" in e && e.which === 3) return;
	if ("button" in e && e.button > 0) return;
	if (data.isTouched && data.isMoved) return;
	const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
	const eventPath = e.composedPath ? e.composedPath() : e.path;
	if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) targetEl = eventPath[0];
	const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
	const isTargetShadow = !!(e.target && e.target.shadowRoot);
	if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
		swiper.allowClick = true;
		return;
	}
	if (params.swipeHandler) {
		if (!targetEl.closest(params.swipeHandler)) return;
	}
	touches.currentX = e.pageX;
	touches.currentY = e.pageY;
	const startX = touches.currentX;
	const startY = touches.currentY;
	if (!preventEdgeSwipe(swiper, e, startX)) return;
	Object.assign(data, {
		isTouched: true,
		isMoved: false,
		allowTouchCallbacks: true,
		isScrolling: void 0,
		startMoving: void 0
	});
	touches.startX = startX;
	touches.startY = startY;
	data.touchStartTime = now();
	swiper.allowClick = true;
	swiper.updateSize();
	swiper.swipeDirection = void 0;
	if (params.threshold > 0) data.allowThresholdMove = false;
	let preventDefault = true;
	if (targetEl.matches(data.focusableElements)) {
		preventDefault = false;
		if (targetEl.nodeName === "SELECT") data.isTouched = false;
	}
	if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl && (e.pointerType === "mouse" || e.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) document.activeElement.blur();
	const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
	if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) e.preventDefault();
	if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) swiper.freeMode.onTouchStart();
	swiper.emit("touchStart", e);
}
function onTouchMove(event) {
	const document = getDocument();
	const swiper = this;
	if (swiper.destroyed) return;
	const data = swiper.touchEventsData;
	const { params, touches, rtlTranslate: rtl, enabled } = swiper;
	if (!enabled) return;
	if (!params.simulateTouch && event.pointerType === "mouse") return;
	let e = event;
	if (e.originalEvent) e = e.originalEvent;
	if (e.type === "pointermove") {
		if (data.touchId !== null) return;
		if (e.pointerId !== data.pointerId) return;
	}
	let targetTouch;
	if (e.type === "touchmove") {
		targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
		if (!targetTouch || targetTouch.identifier !== data.touchId) return;
	} else targetTouch = e;
	if (!data.isTouched) {
		if (data.startMoving && data.isScrolling) swiper.emit("touchMoveOpposite", e);
		return;
	}
	const pageX = targetTouch.pageX;
	const pageY = targetTouch.pageY;
	if (e.preventedByNestedSwiper) {
		touches.startX = pageX;
		touches.startY = pageY;
		return;
	}
	if (!swiper.allowTouchMove) {
		if (!e.target.matches(data.focusableElements)) swiper.allowClick = false;
		if (data.isTouched) {
			Object.assign(touches, {
				startX: pageX,
				startY: pageY,
				currentX: pageX,
				currentY: pageY
			});
			data.touchStartTime = now();
		}
		return;
	}
	if (params.touchReleaseOnEdges && !params.loop) {
		if (swiper.isVertical()) {
			if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
				data.isTouched = false;
				data.isMoved = false;
				return;
			}
		} else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) return;
		else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) return;
	}
	if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== e.target && e.pointerType !== "mouse") document.activeElement.blur();
	if (document.activeElement) {
		if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
			data.isMoved = true;
			swiper.allowClick = false;
			return;
		}
	}
	if (data.allowTouchCallbacks) swiper.emit("touchMove", e);
	touches.previousX = touches.currentX;
	touches.previousY = touches.currentY;
	touches.currentX = pageX;
	touches.currentY = pageY;
	const diffX = touches.currentX - touches.startX;
	const diffY = touches.currentY - touches.startY;
	if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
	if (typeof data.isScrolling === "undefined") {
		let touchAngle;
		if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) data.isScrolling = false;
		else if (diffX * diffX + diffY * diffY >= 25) {
			touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
			data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
		}
	}
	if (data.isScrolling) swiper.emit("touchMoveOpposite", e);
	if (typeof data.startMoving === "undefined") {
		if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) data.startMoving = true;
	}
	if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
		data.isTouched = false;
		return;
	}
	if (!data.startMoving) return;
	swiper.allowClick = false;
	if (!params.cssMode && e.cancelable) e.preventDefault();
	if (params.touchMoveStopPropagation && !params.nested) e.stopPropagation();
	let diff = swiper.isHorizontal() ? diffX : diffY;
	let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
	if (params.oneWayMovement) {
		diff = Math.abs(diff) * (rtl ? 1 : -1);
		touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
	}
	touches.diff = diff;
	diff *= params.touchRatio;
	if (rtl) {
		diff = -diff;
		touchesDiff = -touchesDiff;
	}
	const prevTouchesDirection = swiper.touchesDirection;
	swiper.swipeDirection = diff > 0 ? "prev" : "next";
	swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
	const isLoop = swiper.params.loop && !params.cssMode;
	const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
	if (!data.isMoved) {
		if (isLoop && allowLoopFix) swiper.loopFix({ direction: swiper.swipeDirection });
		data.startTranslate = swiper.getTranslate();
		swiper.setTransition(0);
		if (swiper.animating) {
			const evt = new window.CustomEvent("transitionend", {
				bubbles: true,
				cancelable: true,
				detail: { bySwiperTouchMove: true }
			});
			swiper.wrapperEl.dispatchEvent(evt);
		}
		data.allowMomentumBounce = false;
		if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(true);
		swiper.emit("sliderFirstMove", e);
	}
	(/* @__PURE__ */ new Date()).getTime();
	if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
		Object.assign(touches, {
			startX: pageX,
			startY: pageY,
			currentX: pageX,
			currentY: pageY,
			startTranslate: data.currentTranslate
		});
		data.loopSwapReset = true;
		data.startTranslate = data.currentTranslate;
		return;
	}
	swiper.emit("sliderMove", e);
	data.isMoved = true;
	data.currentTranslate = diff + data.startTranslate;
	let disableParentSwiper = true;
	let resistanceRatio = params.resistanceRatio;
	if (params.touchReleaseOnEdges) resistanceRatio = 0;
	if (diff > 0) {
		if (isLoop && allowLoopFix && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) swiper.loopFix({
			direction: "prev",
			setTranslate: true,
			activeSlideIndex: 0
		});
		if (data.currentTranslate > swiper.minTranslate()) {
			disableParentSwiper = false;
			if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
		}
	} else if (diff < 0) {
		if (isLoop && allowLoopFix && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) swiper.loopFix({
			direction: "next",
			setTranslate: true,
			activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
		});
		if (data.currentTranslate < swiper.maxTranslate()) {
			disableParentSwiper = false;
			if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
		}
	}
	if (disableParentSwiper) e.preventedByNestedSwiper = true;
	if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) data.currentTranslate = data.startTranslate;
	if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) data.currentTranslate = data.startTranslate;
	if (!swiper.allowSlidePrev && !swiper.allowSlideNext) data.currentTranslate = data.startTranslate;
	if (params.threshold > 0) {
		if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
			if (!data.allowThresholdMove) {
				data.allowThresholdMove = true;
				touches.startX = touches.currentX;
				touches.startY = touches.currentY;
				data.currentTranslate = data.startTranslate;
				touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
				return;
			}
		} else {
			data.currentTranslate = data.startTranslate;
			return;
		}
	}
	if (!params.followFinger || params.cssMode) return;
	if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
		swiper.updateActiveIndex();
		swiper.updateSlidesClasses();
	}
	if (params.freeMode && params.freeMode.enabled && swiper.freeMode) swiper.freeMode.onTouchMove();
	swiper.updateProgress(data.currentTranslate);
	swiper.setTranslate(data.currentTranslate);
}
function onTouchEnd(event) {
	const swiper = this;
	if (swiper.destroyed) return;
	const data = swiper.touchEventsData;
	let e = event;
	if (e.originalEvent) e = e.originalEvent;
	let targetTouch;
	if (!(e.type === "touchend" || e.type === "touchcancel")) {
		if (data.touchId !== null) return;
		if (e.pointerId !== data.pointerId) return;
		targetTouch = e;
	} else {
		targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
		if (!targetTouch || targetTouch.identifier !== data.touchId) return;
	}
	if ([
		"pointercancel",
		"pointerout",
		"pointerleave",
		"contextmenu"
	].includes(e.type)) {
		if (!(["pointercancel", "contextmenu"].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView))) return;
	}
	data.pointerId = null;
	data.touchId = null;
	const { params, touches, rtlTranslate: rtl, slidesGrid, enabled } = swiper;
	if (!enabled) return;
	if (!params.simulateTouch && e.pointerType === "mouse") return;
	if (data.allowTouchCallbacks) swiper.emit("touchEnd", e);
	data.allowTouchCallbacks = false;
	if (!data.isTouched) {
		if (data.isMoved && params.grabCursor) swiper.setGrabCursor(false);
		data.isMoved = false;
		data.startMoving = false;
		return;
	}
	if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(false);
	const touchEndTime = now();
	const timeDiff = touchEndTime - data.touchStartTime;
	if (swiper.allowClick) {
		const pathTree = e.path || e.composedPath && e.composedPath();
		swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
		swiper.emit("tap click", e);
		if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) swiper.emit("doubleTap doubleClick", e);
	}
	data.lastClickTime = now();
	nextTick(() => {
		if (!swiper.destroyed) swiper.allowClick = true;
	});
	if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
		data.isTouched = false;
		data.isMoved = false;
		data.startMoving = false;
		return;
	}
	data.isTouched = false;
	data.isMoved = false;
	data.startMoving = false;
	let currentPos;
	if (params.followFinger) currentPos = rtl ? swiper.translate : -swiper.translate;
	else currentPos = -data.currentTranslate;
	if (params.cssMode) return;
	if (params.freeMode && params.freeMode.enabled) {
		swiper.freeMode.onTouchEnd({ currentPos });
		return;
	}
	const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
	let stopIndex = 0;
	let groupSize = swiper.slidesSizesGrid[0];
	for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
		const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
		if (typeof slidesGrid[i + increment] !== "undefined") {
			if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
				stopIndex = i;
				groupSize = slidesGrid[i + increment] - slidesGrid[i];
			}
		} else if (swipeToLast || currentPos >= slidesGrid[i]) {
			stopIndex = i;
			groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
		}
	}
	let rewindFirstIndex = null;
	let rewindLastIndex = null;
	if (params.rewind) {
		if (swiper.isBeginning) rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
		else if (swiper.isEnd) rewindFirstIndex = 0;
	}
	const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
	const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
	if (timeDiff > params.longSwipesMs) {
		if (!params.longSwipes) {
			swiper.slideTo(swiper.activeIndex);
			return;
		}
		if (swiper.swipeDirection === "next") {
			if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
			else swiper.slideTo(stopIndex);
		}
		if (swiper.swipeDirection === "prev") {
			if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + increment);
			else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) swiper.slideTo(rewindLastIndex);
			else swiper.slideTo(stopIndex);
		}
	} else {
		if (!params.shortSwipes) {
			swiper.slideTo(swiper.activeIndex);
			return;
		}
		if (!(swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl))) {
			if (swiper.swipeDirection === "next") swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
			if (swiper.swipeDirection === "prev") swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
		} else if (e.target === swiper.navigation.nextEl) swiper.slideTo(stopIndex + increment);
		else swiper.slideTo(stopIndex);
	}
}
function onResize() {
	const swiper = this;
	const { params, el } = swiper;
	if (el && el.offsetWidth === 0) return;
	if (params.breakpoints) swiper.setBreakpoint();
	const { allowSlideNext, allowSlidePrev, snapGrid } = swiper;
	const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
	swiper.allowSlideNext = true;
	swiper.allowSlidePrev = true;
	swiper.updateSize();
	swiper.updateSlides();
	swiper.updateSlidesClasses();
	const isVirtualLoop = isVirtual && params.loop;
	if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
		const slides = isVirtual ? swiper.virtual.slides : swiper.slides;
		swiper.slideTo(slides.length - 1, 0, false, true);
	} else if (swiper.params.loop && !isVirtual) swiper.slideToLoop(swiper.realIndex, 0, false, true);
	else swiper.slideTo(swiper.activeIndex, 0, false, true);
	if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
		clearTimeout(swiper.autoplay.resizeTimeout);
		swiper.autoplay.resizeTimeout = setTimeout(() => {
			if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) swiper.autoplay.resume();
		}, 500);
	}
	swiper.allowSlidePrev = allowSlidePrev;
	swiper.allowSlideNext = allowSlideNext;
	if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
}
function onClick(e) {
	const swiper = this;
	if (swiper.destroyed) return;
	if (!swiper.enabled) return;
	if (!swiper.allowClick) {
		if (swiper.params.preventClicks) e.preventDefault();
		if (swiper.params.preventClicksPropagation && swiper.animating) {
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}
}
function onScroll() {
	const swiper = this;
	if (swiper.destroyed) return;
	const { wrapperEl, rtlTranslate, enabled } = swiper;
	if (!enabled) return;
	swiper.previousTranslate = swiper.translate;
	if (swiper.isHorizontal()) swiper.translate = -wrapperEl.scrollLeft;
	else swiper.translate = -wrapperEl.scrollTop;
	if (swiper.translate === 0) swiper.translate = 0;
	swiper.updateActiveIndex();
	swiper.updateSlidesClasses();
	let newProgress;
	const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	if (translatesDiff === 0) newProgress = 0;
	else newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
	if (newProgress !== swiper.progress) swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
	swiper.emit("setTranslate", swiper.translate, false);
}
function onLoad(e) {
	const swiper = this;
	if (swiper.destroyed) return;
	processLazyPreloader(swiper, e.target);
	if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) return;
	swiper.update();
}
function onDocumentTouchStart() {
	const swiper = this;
	if (swiper.destroyed) return;
	if (swiper.documentTouchHandlerProceeded) return;
	swiper.documentTouchHandlerProceeded = true;
	if (swiper.params.touchReleaseOnEdges) swiper.el.style.touchAction = "auto";
}
var events = (swiper, method) => {
	const document = getDocument();
	const { params, el, wrapperEl, device } = swiper;
	const capture = !!params.nested;
	const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
	const swiperMethod = method;
	if (!el || typeof el === "string") return;
	document[domMethod]("touchstart", swiper.onDocumentTouchStart, {
		passive: false,
		capture
	});
	el[domMethod]("touchstart", swiper.onTouchStart, { passive: false });
	el[domMethod]("pointerdown", swiper.onTouchStart, { passive: false });
	document[domMethod]("touchmove", swiper.onTouchMove, {
		passive: false,
		capture
	});
	document[domMethod]("pointermove", swiper.onTouchMove, {
		passive: false,
		capture
	});
	document[domMethod]("touchend", swiper.onTouchEnd, { passive: true });
	document[domMethod]("pointerup", swiper.onTouchEnd, { passive: true });
	document[domMethod]("pointercancel", swiper.onTouchEnd, { passive: true });
	document[domMethod]("touchcancel", swiper.onTouchEnd, { passive: true });
	document[domMethod]("pointerout", swiper.onTouchEnd, { passive: true });
	document[domMethod]("pointerleave", swiper.onTouchEnd, { passive: true });
	document[domMethod]("contextmenu", swiper.onTouchEnd, { passive: true });
	if (params.preventClicks || params.preventClicksPropagation) el[domMethod]("click", swiper.onClick, true);
	if (params.cssMode) wrapperEl[domMethod]("scroll", swiper.onScroll);
	if (params.updateOnWindowResize) swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
	else swiper[swiperMethod]("observerUpdate", onResize, true);
	el[domMethod]("load", swiper.onLoad, { capture: true });
};
function attachEvents() {
	const swiper = this;
	const { params } = swiper;
	swiper.onTouchStart = onTouchStart.bind(swiper);
	swiper.onTouchMove = onTouchMove.bind(swiper);
	swiper.onTouchEnd = onTouchEnd.bind(swiper);
	swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
	if (params.cssMode) swiper.onScroll = onScroll.bind(swiper);
	swiper.onClick = onClick.bind(swiper);
	swiper.onLoad = onLoad.bind(swiper);
	events(swiper, "on");
}
function detachEvents() {
	events(this, "off");
}
var events$1 = {
	attachEvents,
	detachEvents
};
var isGridEnabled = (swiper, params) => {
	return swiper.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
	const swiper = this;
	const { realIndex, initialized, params, el } = swiper;
	const breakpoints = params.breakpoints;
	if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
	const document = getDocument();
	const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
	const breakpointContainer = ["window", "container"].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document.querySelector(params.breakpointsBase);
	const breakpoint = swiper.getBreakpoint(breakpoints, breakpointsBase, breakpointContainer);
	if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
	const breakpointParams = (breakpoint in breakpoints ? breakpoints[breakpoint] : void 0) || swiper.originalParams;
	const wasMultiRow = isGridEnabled(swiper, params);
	const isMultiRow = isGridEnabled(swiper, breakpointParams);
	const wasGrabCursor = swiper.params.grabCursor;
	const isGrabCursor = breakpointParams.grabCursor;
	const wasEnabled = params.enabled;
	if (wasMultiRow && !isMultiRow) {
		el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
		swiper.emitContainerClasses();
	} else if (!wasMultiRow && isMultiRow) {
		el.classList.add(`${params.containerModifierClass}grid`);
		if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") el.classList.add(`${params.containerModifierClass}grid-column`);
		swiper.emitContainerClasses();
	}
	if (wasGrabCursor && !isGrabCursor) swiper.unsetGrabCursor();
	else if (!wasGrabCursor && isGrabCursor) swiper.setGrabCursor();
	[
		"navigation",
		"pagination",
		"scrollbar"
	].forEach((prop) => {
		if (typeof breakpointParams[prop] === "undefined") return;
		const wasModuleEnabled = params[prop] && params[prop].enabled;
		const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
		if (wasModuleEnabled && !isModuleEnabled) swiper[prop].disable();
		if (!wasModuleEnabled && isModuleEnabled) swiper[prop].enable();
	});
	const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
	const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
	const wasLoop = params.loop;
	if (directionChanged && initialized) swiper.changeDirection();
	extend$1(swiper.params, breakpointParams);
	const isEnabled = swiper.params.enabled;
	const hasLoop = swiper.params.loop;
	Object.assign(swiper, {
		allowTouchMove: swiper.params.allowTouchMove,
		allowSlideNext: swiper.params.allowSlideNext,
		allowSlidePrev: swiper.params.allowSlidePrev
	});
	if (wasEnabled && !isEnabled) swiper.disable();
	else if (!wasEnabled && isEnabled) swiper.enable();
	swiper.currentBreakpoint = breakpoint;
	swiper.emit("_beforeBreakpoint", breakpointParams);
	if (initialized) {
		if (needsReLoop) {
			swiper.loopDestroy();
			swiper.loopCreate(realIndex);
			swiper.updateSlides();
		} else if (!wasLoop && hasLoop) {
			swiper.loopCreate(realIndex);
			swiper.updateSlides();
		} else if (wasLoop && !hasLoop) swiper.loopDestroy();
	}
	swiper.emit("breakpoint", breakpointParams);
}
function getBreakpoint(breakpoints, base = "window", containerEl) {
	if (!breakpoints || base === "container" && !containerEl) return void 0;
	let breakpoint = false;
	const window = getWindow();
	const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
	const points = Object.keys(breakpoints).map((point) => {
		if (typeof point === "string" && point.indexOf("@") === 0) {
			const minRatio = parseFloat(point.substr(1));
			return {
				value: currentHeight * minRatio,
				point
			};
		}
		return {
			value: point,
			point
		};
	});
	points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
	for (let i = 0; i < points.length; i += 1) {
		const { point, value } = points[i];
		if (base === "window") {
			if (window.matchMedia(`(min-width: ${value}px)`).matches) breakpoint = point;
		} else if (value <= containerEl.clientWidth) breakpoint = point;
	}
	return breakpoint || "max";
}
var breakpoints = {
	setBreakpoint,
	getBreakpoint
};
function prepareClasses(entries, prefix) {
	const resultClasses = [];
	entries.forEach((item) => {
		if (typeof item === "object") Object.keys(item).forEach((classNames) => {
			if (item[classNames]) resultClasses.push(prefix + classNames);
		});
		else if (typeof item === "string") resultClasses.push(prefix + item);
	});
	return resultClasses;
}
function addClasses() {
	const swiper = this;
	const { classNames, params, rtl, el, device } = swiper;
	const suffixes = prepareClasses([
		"initialized",
		params.direction,
		{ "free-mode": swiper.params.freeMode && params.freeMode.enabled },
		{ "autoheight": params.autoHeight },
		{ "rtl": rtl },
		{ "grid": params.grid && params.grid.rows > 1 },
		{ "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column" },
		{ "android": device.android },
		{ "ios": device.ios },
		{ "css-mode": params.cssMode },
		{ "centered": params.cssMode && params.centeredSlides },
		{ "watch-progress": params.watchSlidesProgress }
	], params.containerModifierClass);
	classNames.push(...suffixes);
	el.classList.add(...classNames);
	swiper.emitContainerClasses();
}
function removeClasses() {
	const swiper = this;
	const { el, classNames } = swiper;
	if (!el || typeof el === "string") return;
	el.classList.remove(...classNames);
	swiper.emitContainerClasses();
}
var classes = {
	addClasses,
	removeClasses
};
function checkOverflow() {
	const swiper = this;
	const { isLocked: wasLocked, params } = swiper;
	const { slidesOffsetBefore } = params;
	if (slidesOffsetBefore) {
		const lastSlideIndex = swiper.slides.length - 1;
		const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
		swiper.isLocked = swiper.size > lastSlideRightEdge;
	} else swiper.isLocked = swiper.snapGrid.length === 1;
	if (params.allowSlideNext === true) swiper.allowSlideNext = !swiper.isLocked;
	if (params.allowSlidePrev === true) swiper.allowSlidePrev = !swiper.isLocked;
	if (wasLocked && wasLocked !== swiper.isLocked) swiper.isEnd = false;
	if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? "lock" : "unlock");
}
var checkOverflow$1 = { checkOverflow };
var defaults = {
	init: true,
	direction: "horizontal",
	oneWayMovement: false,
	swiperElementNodeName: "SWIPER-CONTAINER",
	touchEventsTarget: "wrapper",
	initialSlide: 0,
	speed: 300,
	cssMode: false,
	updateOnWindowResize: true,
	resizeObserver: true,
	nested: false,
	createElements: false,
	eventsPrefix: "swiper",
	enabled: true,
	focusableElements: "input, select, option, textarea, button, video, label",
	width: null,
	height: null,
	preventInteractionOnTransition: false,
	userAgent: null,
	url: null,
	edgeSwipeDetection: false,
	edgeSwipeThreshold: 20,
	autoHeight: false,
	setWrapperSize: false,
	virtualTranslate: false,
	effect: "slide",
	breakpoints: void 0,
	breakpointsBase: "window",
	spaceBetween: 0,
	slidesPerView: 1,
	slidesPerGroup: 1,
	slidesPerGroupSkip: 0,
	slidesPerGroupAuto: false,
	centeredSlides: false,
	centeredSlidesBounds: false,
	slidesOffsetBefore: 0,
	slidesOffsetAfter: 0,
	normalizeSlideIndex: true,
	centerInsufficientSlides: false,
	snapToSlideEdge: false,
	watchOverflow: true,
	roundLengths: false,
	touchRatio: 1,
	touchAngle: 45,
	simulateTouch: true,
	shortSwipes: true,
	longSwipes: true,
	longSwipesRatio: .5,
	longSwipesMs: 300,
	followFinger: true,
	allowTouchMove: true,
	threshold: 5,
	touchMoveStopPropagation: false,
	touchStartPreventDefault: true,
	touchStartForcePreventDefault: false,
	touchReleaseOnEdges: false,
	uniqueNavElements: true,
	resistance: true,
	resistanceRatio: .85,
	watchSlidesProgress: false,
	grabCursor: false,
	preventClicks: true,
	preventClicksPropagation: true,
	slideToClickedSlide: false,
	loop: false,
	loopAddBlankSlides: true,
	loopAdditionalSlides: 0,
	loopPreventsSliding: true,
	rewind: false,
	allowSlidePrev: true,
	allowSlideNext: true,
	swipeHandler: null,
	noSwiping: true,
	noSwipingClass: "swiper-no-swiping",
	noSwipingSelector: null,
	passiveListeners: true,
	maxBackfaceHiddenSlides: 10,
	containerModifierClass: "swiper-",
	slideClass: "swiper-slide",
	slideBlankClass: "swiper-slide-blank",
	slideActiveClass: "swiper-slide-active",
	slideVisibleClass: "swiper-slide-visible",
	slideFullyVisibleClass: "swiper-slide-fully-visible",
	slideNextClass: "swiper-slide-next",
	slidePrevClass: "swiper-slide-prev",
	wrapperClass: "swiper-wrapper",
	lazyPreloaderClass: "swiper-lazy-preloader",
	lazyPreloadPrevNext: 0,
	runCallbacksOnInit: true,
	_emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
	return function extendParams(obj = {}) {
		const moduleParamName = Object.keys(obj)[0];
		const moduleParams = obj[moduleParamName];
		if (typeof moduleParams !== "object" || moduleParams === null) {
			extend$1(allModulesParams, obj);
			return;
		}
		if (params[moduleParamName] === true) params[moduleParamName] = { enabled: true };
		if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) params[moduleParamName].auto = true;
		if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) params[moduleParamName].auto = true;
		if (!(moduleParamName in params && "enabled" in moduleParams)) {
			extend$1(allModulesParams, obj);
			return;
		}
		if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) params[moduleParamName].enabled = true;
		if (!params[moduleParamName]) params[moduleParamName] = { enabled: false };
		extend$1(allModulesParams, obj);
	};
}
var prototypes = {
	eventsEmitter,
	update,
	translate,
	transition,
	slide,
	loop,
	grabCursor,
	events: events$1,
	breakpoints,
	checkOverflow: checkOverflow$1,
	classes
};
var extendedDefaults = {};
var Swiper$1 = class Swiper$1 {
	constructor(...args) {
		let el;
		let params;
		if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") params = args[0];
		else [el, params] = args;
		if (!params) params = {};
		params = extend$1({}, params);
		if (el && !params.el) params.el = el;
		const document = getDocument();
		if (params.el && typeof params.el === "string" && document.querySelectorAll(params.el).length > 1) {
			const swipers = [];
			document.querySelectorAll(params.el).forEach((containerEl) => {
				const newParams = extend$1({}, params, { el: containerEl });
				swipers.push(new Swiper$1(newParams));
			});
			return swipers;
		}
		const swiper = this;
		swiper.__swiper__ = true;
		swiper.support = getSupport();
		swiper.device = getDevice({ userAgent: params.userAgent });
		swiper.browser = getBrowser();
		swiper.eventsListeners = {};
		swiper.eventsAnyListeners = [];
		swiper.modules = [...swiper.__modules__];
		if (params.modules && Array.isArray(params.modules)) params.modules.forEach((mod) => {
			if (typeof mod === "function" && swiper.modules.indexOf(mod) < 0) swiper.modules.push(mod);
		});
		const allModulesParams = {};
		swiper.modules.forEach((mod) => {
			mod({
				params,
				swiper,
				extendParams: moduleExtendParams(params, allModulesParams),
				on: swiper.on.bind(swiper),
				once: swiper.once.bind(swiper),
				off: swiper.off.bind(swiper),
				emit: swiper.emit.bind(swiper)
			});
		});
		swiper.params = extend$1({}, extend$1({}, defaults, allModulesParams), extendedDefaults, params);
		swiper.originalParams = extend$1({}, swiper.params);
		swiper.passedParams = extend$1({}, params);
		if (swiper.params && swiper.params.on) Object.keys(swiper.params.on).forEach((eventName) => {
			swiper.on(eventName, swiper.params.on[eventName]);
		});
		if (swiper.params && swiper.params.onAny) swiper.onAny(swiper.params.onAny);
		Object.assign(swiper, {
			enabled: swiper.params.enabled,
			el,
			classNames: [],
			slides: [],
			slidesGrid: [],
			snapGrid: [],
			slidesSizesGrid: [],
			isHorizontal() {
				return swiper.params.direction === "horizontal";
			},
			isVertical() {
				return swiper.params.direction === "vertical";
			},
			activeIndex: 0,
			realIndex: 0,
			isBeginning: true,
			isEnd: false,
			translate: 0,
			previousTranslate: 0,
			progress: 0,
			velocity: 0,
			animating: false,
			cssOverflowAdjustment() {
				return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
			},
			allowSlideNext: swiper.params.allowSlideNext,
			allowSlidePrev: swiper.params.allowSlidePrev,
			touchEventsData: {
				isTouched: void 0,
				isMoved: void 0,
				allowTouchCallbacks: void 0,
				touchStartTime: void 0,
				isScrolling: void 0,
				currentTranslate: void 0,
				startTranslate: void 0,
				allowThresholdMove: void 0,
				focusableElements: swiper.params.focusableElements,
				lastClickTime: 0,
				clickTimeout: void 0,
				velocities: [],
				allowMomentumBounce: void 0,
				startMoving: void 0,
				pointerId: null,
				touchId: null
			},
			allowClick: true,
			allowTouchMove: swiper.params.allowTouchMove,
			touches: {
				startX: 0,
				startY: 0,
				currentX: 0,
				currentY: 0,
				diff: 0
			},
			imagesToLoad: [],
			imagesLoaded: 0
		});
		swiper.emit("_swiper");
		if (swiper.params.init) swiper.init();
		return swiper;
	}
	getDirectionLabel(property) {
		if (this.isHorizontal()) return property;
		return {
			"width": "height",
			"margin-top": "margin-left",
			"margin-bottom ": "margin-right",
			"margin-left": "margin-top",
			"margin-right": "margin-bottom",
			"padding-left": "padding-top",
			"padding-right": "padding-bottom",
			"marginRight": "marginBottom"
		}[property];
	}
	getSlideIndex(slideEl) {
		const { slidesEl, params } = this;
		const firstSlideIndex = elementIndex(elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`)[0]);
		return elementIndex(slideEl) - firstSlideIndex;
	}
	getSlideIndexByData(index) {
		return this.getSlideIndex(this.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index));
	}
	getSlideIndexWhenGrid(index) {
		if (this.grid && this.params.grid && this.params.grid.rows > 1) {
			if (this.params.grid.fill === "column") index = Math.floor(index / this.params.grid.rows);
			else if (this.params.grid.fill === "row") index = index % Math.ceil(this.slides.length / this.params.grid.rows);
		}
		return index;
	}
	recalcSlides() {
		const swiper = this;
		const { slidesEl, params } = swiper;
		swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
	}
	enable() {
		const swiper = this;
		if (swiper.enabled) return;
		swiper.enabled = true;
		if (swiper.params.grabCursor) swiper.setGrabCursor();
		swiper.emit("enable");
	}
	disable() {
		const swiper = this;
		if (!swiper.enabled) return;
		swiper.enabled = false;
		if (swiper.params.grabCursor) swiper.unsetGrabCursor();
		swiper.emit("disable");
	}
	setProgress(progress, speed) {
		const swiper = this;
		progress = Math.min(Math.max(progress, 0), 1);
		const min = swiper.minTranslate();
		const current = (swiper.maxTranslate() - min) * progress + min;
		swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
		swiper.updateActiveIndex();
		swiper.updateSlidesClasses();
	}
	emitContainerClasses() {
		const swiper = this;
		if (!swiper.params._emitClasses || !swiper.el) return;
		const cls = swiper.el.className.split(" ").filter((className) => {
			return className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
		});
		swiper.emit("_containerClasses", cls.join(" "));
	}
	getSlideClasses(slideEl) {
		const swiper = this;
		if (swiper.destroyed) return "";
		return slideEl.className.split(" ").filter((className) => {
			return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0;
		}).join(" ");
	}
	emitSlidesClasses() {
		const swiper = this;
		if (!swiper.params._emitClasses || !swiper.el) return;
		const updates = [];
		swiper.slides.forEach((slideEl) => {
			const classNames = swiper.getSlideClasses(slideEl);
			updates.push({
				slideEl,
				classNames
			});
			swiper.emit("_slideClass", slideEl, classNames);
		});
		swiper.emit("_slideClasses", updates);
	}
	slidesPerViewDynamic(view = "current", exact = false) {
		const { params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex } = this;
		let spv = 1;
		if (typeof params.slidesPerView === "number") return params.slidesPerView;
		if (params.centeredSlides) {
			let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
			let breakLoop;
			for (let i = activeIndex + 1; i < slides.length; i += 1) if (slides[i] && !breakLoop) {
				slideSize += Math.ceil(slides[i].swiperSlideSize);
				spv += 1;
				if (slideSize > swiperSize) breakLoop = true;
			}
			for (let i = activeIndex - 1; i >= 0; i -= 1) if (slides[i] && !breakLoop) {
				slideSize += slides[i].swiperSlideSize;
				spv += 1;
				if (slideSize > swiperSize) breakLoop = true;
			}
		} else if (view === "current") {
			for (let i = activeIndex + 1; i < slides.length; i += 1) if (exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize) spv += 1;
		} else for (let i = activeIndex - 1; i >= 0; i -= 1) if (slidesGrid[activeIndex] - slidesGrid[i] < swiperSize) spv += 1;
		return spv;
	}
	update() {
		const swiper = this;
		if (!swiper || swiper.destroyed) return;
		const { snapGrid, params } = swiper;
		if (params.breakpoints) swiper.setBreakpoint();
		[...swiper.el.querySelectorAll("[loading=\"lazy\"]")].forEach((imageEl) => {
			if (imageEl.complete) processLazyPreloader(swiper, imageEl);
		});
		swiper.updateSize();
		swiper.updateSlides();
		swiper.updateProgress();
		swiper.updateSlidesClasses();
		function setTranslate() {
			const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
			const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
			swiper.setTranslate(newTranslate);
			swiper.updateActiveIndex();
			swiper.updateSlidesClasses();
		}
		let translated;
		if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
			setTranslate();
			if (params.autoHeight) swiper.updateAutoHeight();
		} else {
			if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
				const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
				translated = swiper.slideTo(slides.length - 1, 0, false, true);
			} else translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
			if (!translated) setTranslate();
		}
		if (params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
		swiper.emit("update");
	}
	changeDirection(newDirection, needUpdate = true) {
		const swiper = this;
		const currentDirection = swiper.params.direction;
		if (!newDirection) newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
		if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") return swiper;
		swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
		swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
		swiper.emitContainerClasses();
		swiper.params.direction = newDirection;
		swiper.slides.forEach((slideEl) => {
			if (newDirection === "vertical") slideEl.style.width = "";
			else slideEl.style.height = "";
		});
		swiper.emit("changeDirection");
		if (needUpdate) swiper.update();
		return swiper;
	}
	changeLanguageDirection(direction) {
		const swiper = this;
		if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
		swiper.rtl = direction === "rtl";
		swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
		if (swiper.rtl) {
			swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
			swiper.el.dir = "rtl";
		} else {
			swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
			swiper.el.dir = "ltr";
		}
		swiper.update();
	}
	mount(element) {
		const swiper = this;
		if (swiper.mounted) return true;
		let el = element || swiper.params.el;
		if (typeof el === "string") el = document.querySelector(el);
		if (!el) return false;
		el.swiper = swiper;
		if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) swiper.isElement = true;
		const getWrapperSelector = () => {
			return `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
		};
		const getWrapper = () => {
			if (el && el.shadowRoot && el.shadowRoot.querySelector) return el.shadowRoot.querySelector(getWrapperSelector());
			return elementChildren(el, getWrapperSelector())[0];
		};
		let wrapperEl = getWrapper();
		if (!wrapperEl && swiper.params.createElements) {
			wrapperEl = createElement$1("div", swiper.params.wrapperClass);
			el.append(wrapperEl);
			elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
				wrapperEl.append(slideEl);
			});
		}
		Object.assign(swiper, {
			el,
			wrapperEl,
			slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
			hostEl: swiper.isElement ? el.parentNode.host : el,
			mounted: true,
			rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
			rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
			wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
		});
		return true;
	}
	init(el) {
		const swiper = this;
		if (swiper.initialized) return swiper;
		if (swiper.mount(el) === false) return swiper;
		swiper.emit("beforeInit");
		if (swiper.params.breakpoints) swiper.setBreakpoint();
		swiper.addClasses();
		swiper.updateSize();
		swiper.updateSlides();
		if (swiper.params.watchOverflow) swiper.checkOverflow();
		if (swiper.params.grabCursor && swiper.enabled) swiper.setGrabCursor();
		if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
		else swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
		if (swiper.params.loop) swiper.loopCreate(void 0, true);
		swiper.attachEvents();
		const lazyElements = [...swiper.el.querySelectorAll("[loading=\"lazy\"]")];
		if (swiper.isElement) lazyElements.push(...swiper.hostEl.querySelectorAll("[loading=\"lazy\"]"));
		lazyElements.forEach((imageEl) => {
			if (imageEl.complete) processLazyPreloader(swiper, imageEl);
			else imageEl.addEventListener("load", (e) => {
				processLazyPreloader(swiper, e.target);
			});
		});
		preload(swiper);
		swiper.initialized = true;
		preload(swiper);
		swiper.emit("init");
		swiper.emit("afterInit");
		return swiper;
	}
	destroy(deleteInstance = true, cleanStyles = true) {
		const swiper = this;
		const { params, el, wrapperEl, slides } = swiper;
		if (typeof swiper.params === "undefined" || swiper.destroyed) return null;
		swiper.emit("beforeDestroy");
		swiper.initialized = false;
		swiper.detachEvents();
		if (params.loop) swiper.loopDestroy();
		if (cleanStyles) {
			swiper.removeClasses();
			if (el && typeof el !== "string") el.removeAttribute("style");
			if (wrapperEl) wrapperEl.removeAttribute("style");
			if (slides && slides.length) slides.forEach((slideEl) => {
				slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
				slideEl.removeAttribute("style");
				slideEl.removeAttribute("data-swiper-slide-index");
			});
		}
		swiper.emit("destroy");
		Object.keys(swiper.eventsListeners).forEach((eventName) => {
			swiper.off(eventName);
		});
		if (deleteInstance !== false) {
			if (swiper.el && typeof swiper.el !== "string") swiper.el.swiper = null;
			deleteProps(swiper);
		}
		swiper.destroyed = true;
		return null;
	}
	static extendDefaults(newDefaults) {
		extend$1(extendedDefaults, newDefaults);
	}
	static get extendedDefaults() {
		return extendedDefaults;
	}
	static get defaults() {
		return defaults;
	}
	static installModule(mod) {
		if (!Swiper$1.prototype.__modules__) Swiper$1.prototype.__modules__ = [];
		const modules = Swiper$1.prototype.__modules__;
		if (typeof mod === "function" && modules.indexOf(mod) < 0) modules.push(mod);
	}
	static use(module) {
		if (Array.isArray(module)) {
			module.forEach((m) => Swiper$1.installModule(m));
			return Swiper$1;
		}
		Swiper$1.installModule(module);
		return Swiper$1;
	}
};
Object.keys(prototypes).forEach((prototypeGroup) => {
	Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
		Swiper$1.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
	});
});
Swiper$1.use([Resize, Observer]);
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/shared/update-swiper.mjs
var paramsList = [
	"eventsPrefix",
	"injectStyles",
	"injectStylesUrls",
	"modules",
	"init",
	"_direction",
	"oneWayMovement",
	"swiperElementNodeName",
	"touchEventsTarget",
	"initialSlide",
	"_speed",
	"cssMode",
	"updateOnWindowResize",
	"resizeObserver",
	"nested",
	"focusableElements",
	"_enabled",
	"_width",
	"_height",
	"preventInteractionOnTransition",
	"userAgent",
	"url",
	"_edgeSwipeDetection",
	"_edgeSwipeThreshold",
	"_freeMode",
	"_autoHeight",
	"setWrapperSize",
	"virtualTranslate",
	"_effect",
	"breakpoints",
	"breakpointsBase",
	"_spaceBetween",
	"_slidesPerView",
	"maxBackfaceHiddenSlides",
	"_grid",
	"_slidesPerGroup",
	"_slidesPerGroupSkip",
	"_slidesPerGroupAuto",
	"_centeredSlides",
	"_centeredSlidesBounds",
	"_slidesOffsetBefore",
	"_slidesOffsetAfter",
	"normalizeSlideIndex",
	"_centerInsufficientSlides",
	"_snapToSlideEdge",
	"_watchOverflow",
	"roundLengths",
	"touchRatio",
	"touchAngle",
	"simulateTouch",
	"_shortSwipes",
	"_longSwipes",
	"longSwipesRatio",
	"longSwipesMs",
	"_followFinger",
	"allowTouchMove",
	"_threshold",
	"touchMoveStopPropagation",
	"touchStartPreventDefault",
	"touchStartForcePreventDefault",
	"touchReleaseOnEdges",
	"uniqueNavElements",
	"_resistance",
	"_resistanceRatio",
	"_watchSlidesProgress",
	"_grabCursor",
	"preventClicks",
	"preventClicksPropagation",
	"_slideToClickedSlide",
	"_loop",
	"loopAdditionalSlides",
	"loopAddBlankSlides",
	"loopPreventsSliding",
	"_rewind",
	"_allowSlidePrev",
	"_allowSlideNext",
	"_swipeHandler",
	"_noSwiping",
	"noSwipingClass",
	"noSwipingSelector",
	"passiveListeners",
	"containerModifierClass",
	"slideClass",
	"slideActiveClass",
	"slideVisibleClass",
	"slideFullyVisibleClass",
	"slideNextClass",
	"slidePrevClass",
	"slideBlankClass",
	"wrapperClass",
	"lazyPreloaderClass",
	"lazyPreloadPrevNext",
	"runCallbacksOnInit",
	"observer",
	"observeParents",
	"observeSlideChildren",
	"a11y",
	"_autoplay",
	"_controller",
	"coverflowEffect",
	"cubeEffect",
	"fadeEffect",
	"flipEffect",
	"creativeEffect",
	"cardsEffect",
	"hashNavigation",
	"history",
	"keyboard",
	"mousewheel",
	"_navigation",
	"_pagination",
	"parallax",
	"_scrollbar",
	"_thumbs",
	"virtual",
	"zoom",
	"control"
];
function isObject(o) {
	return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object" && !o.__swiper__;
}
function extend(target, src) {
	const noExtend = [
		"__proto__",
		"constructor",
		"prototype"
	];
	Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
		if (typeof target[key] === "undefined") target[key] = src[key];
		else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) {
			if (src[key].__swiper__) target[key] = src[key];
			else extend(target[key], src[key]);
		} else target[key] = src[key];
	});
}
function needsNavigation(params = {}) {
	return params.navigation && typeof params.navigation.nextEl === "undefined" && typeof params.navigation.prevEl === "undefined";
}
function needsPagination(params = {}) {
	return params.pagination && typeof params.pagination.el === "undefined";
}
function needsScrollbar(params = {}) {
	return params.scrollbar && typeof params.scrollbar.el === "undefined";
}
function uniqueClasses(classNames = "") {
	const classes = classNames.split(" ").map((c) => c.trim()).filter((c) => !!c);
	const unique = [];
	classes.forEach((c) => {
		if (unique.indexOf(c) < 0) unique.push(c);
	});
	return unique.join(" ");
}
function wrapperClass(className = "") {
	if (!className) return "swiper-wrapper";
	if (!className.includes("swiper-wrapper")) return `swiper-wrapper ${className}`;
	return className;
}
function updateSwiper({ swiper, slides, passedParams, changedParams, nextEl, prevEl, scrollbarEl, paginationEl }) {
	const updateParams = changedParams.filter((key) => key !== "children" && key !== "direction" && key !== "wrapperClass");
	const { params: currentParams, pagination, navigation, scrollbar, virtual, thumbs } = swiper;
	let needThumbsInit;
	let needControllerInit;
	let needPaginationInit;
	let needScrollbarInit;
	let needNavigationInit;
	let loopNeedDestroy;
	let loopNeedEnable;
	let loopNeedReloop;
	if (changedParams.includes("thumbs") && passedParams.thumbs && passedParams.thumbs.swiper && !passedParams.thumbs.swiper.destroyed && currentParams.thumbs && (!currentParams.thumbs.swiper || currentParams.thumbs.swiper.destroyed)) needThumbsInit = true;
	if (changedParams.includes("controller") && passedParams.controller && passedParams.controller.control && currentParams.controller && !currentParams.controller.control) needControllerInit = true;
	if (changedParams.includes("pagination") && passedParams.pagination && (passedParams.pagination.el || paginationEl) && (currentParams.pagination || currentParams.pagination === false) && pagination && !pagination.el) needPaginationInit = true;
	if (changedParams.includes("scrollbar") && passedParams.scrollbar && (passedParams.scrollbar.el || scrollbarEl) && (currentParams.scrollbar || currentParams.scrollbar === false) && scrollbar && !scrollbar.el) needScrollbarInit = true;
	if (changedParams.includes("navigation") && passedParams.navigation && (passedParams.navigation.prevEl || prevEl) && (passedParams.navigation.nextEl || nextEl) && (currentParams.navigation || currentParams.navigation === false) && navigation && !navigation.prevEl && !navigation.nextEl) needNavigationInit = true;
	const destroyModule = (mod) => {
		if (!swiper[mod]) return;
		swiper[mod].destroy();
		if (mod === "navigation") {
			if (swiper.isElement) {
				swiper[mod].prevEl.remove();
				swiper[mod].nextEl.remove();
			}
			currentParams[mod].prevEl = void 0;
			currentParams[mod].nextEl = void 0;
			swiper[mod].prevEl = void 0;
			swiper[mod].nextEl = void 0;
		} else {
			if (swiper.isElement) swiper[mod].el.remove();
			currentParams[mod].el = void 0;
			swiper[mod].el = void 0;
		}
	};
	if (changedParams.includes("loop") && swiper.isElement) {
		if (currentParams.loop && !passedParams.loop) loopNeedDestroy = true;
		else if (!currentParams.loop && passedParams.loop) loopNeedEnable = true;
		else loopNeedReloop = true;
	}
	updateParams.forEach((key) => {
		if (isObject(currentParams[key]) && isObject(passedParams[key])) {
			Object.assign(currentParams[key], passedParams[key]);
			if ((key === "navigation" || key === "pagination" || key === "scrollbar") && "enabled" in passedParams[key] && !passedParams[key].enabled) destroyModule(key);
		} else {
			const newValue = passedParams[key];
			if ((newValue === true || newValue === false) && (key === "navigation" || key === "pagination" || key === "scrollbar")) {
				if (newValue === false) destroyModule(key);
			} else currentParams[key] = passedParams[key];
		}
	});
	if (updateParams.includes("controller") && !needControllerInit && swiper.controller && swiper.controller.control && currentParams.controller && currentParams.controller.control) swiper.controller.control = currentParams.controller.control;
	if (changedParams.includes("children") && slides && virtual && currentParams.virtual.enabled) {
		virtual.slides = slides;
		virtual.update(true);
	} else if (changedParams.includes("virtual") && virtual && currentParams.virtual.enabled) {
		if (slides) virtual.slides = slides;
		virtual.update(true);
	}
	if (changedParams.includes("children") && slides && currentParams.loop) loopNeedReloop = true;
	if (needThumbsInit) {
		if (thumbs.init()) thumbs.update(true);
	}
	if (needControllerInit) swiper.controller.control = currentParams.controller.control;
	if (needPaginationInit) {
		if (swiper.isElement && (!paginationEl || typeof paginationEl === "string")) {
			paginationEl = document.createElement("div");
			paginationEl.classList.add("swiper-pagination");
			paginationEl.part.add("pagination");
			swiper.el.appendChild(paginationEl);
		}
		if (paginationEl) currentParams.pagination.el = paginationEl;
		pagination.init();
		pagination.render();
		pagination.update();
	}
	if (needScrollbarInit) {
		if (swiper.isElement && (!scrollbarEl || typeof scrollbarEl === "string")) {
			scrollbarEl = document.createElement("div");
			scrollbarEl.classList.add("swiper-scrollbar");
			scrollbarEl.part.add("scrollbar");
			swiper.el.appendChild(scrollbarEl);
		}
		if (scrollbarEl) currentParams.scrollbar.el = scrollbarEl;
		scrollbar.init();
		scrollbar.updateSize();
		scrollbar.setTranslate();
	}
	if (needNavigationInit) {
		if (swiper.isElement) {
			if (!nextEl || typeof nextEl === "string") {
				nextEl = document.createElement("div");
				nextEl.classList.add("swiper-button-next");
				setInnerHTML(nextEl, swiper.navigation.arrowSvg);
				nextEl.part.add("button-next");
				swiper.el.appendChild(nextEl);
			}
			if (!prevEl || typeof prevEl === "string") {
				prevEl = document.createElement("div");
				prevEl.classList.add("swiper-button-prev");
				setInnerHTML(prevEl, swiper.navigation.arrowSvg);
				prevEl.part.add("button-prev");
				swiper.el.appendChild(prevEl);
			}
		}
		if (nextEl) currentParams.navigation.nextEl = nextEl;
		if (prevEl) currentParams.navigation.prevEl = prevEl;
		navigation.init();
		navigation.update();
	}
	if (changedParams.includes("allowSlideNext")) swiper.allowSlideNext = passedParams.allowSlideNext;
	if (changedParams.includes("allowSlidePrev")) swiper.allowSlidePrev = passedParams.allowSlidePrev;
	if (changedParams.includes("direction")) swiper.changeDirection(passedParams.direction, false);
	if (loopNeedDestroy || loopNeedReloop) swiper.loopDestroy();
	if (loopNeedEnable || loopNeedReloop) swiper.loopCreate();
	swiper.update();
}
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/shared/update-on-virtual-data.mjs
function getParams(obj = {}, splitEvents = true) {
	const params = { on: {} };
	const events = {};
	const passedParams = {};
	extend(params, defaults);
	params._emitClasses = true;
	params.init = false;
	const rest = {};
	const allowedParams = paramsList.map((key) => key.replace(/_/, ""));
	const plainObj = Object.assign({}, obj);
	Object.keys(plainObj).forEach((key) => {
		if (typeof obj[key] === "undefined") return;
		if (allowedParams.indexOf(key) >= 0) {
			if (isObject(obj[key])) {
				params[key] = {};
				passedParams[key] = {};
				extend(params[key], obj[key]);
				extend(passedParams[key], obj[key]);
			} else {
				params[key] = obj[key];
				passedParams[key] = obj[key];
			}
		} else if (key.search(/on[A-Z]/) === 0 && typeof obj[key] === "function") {
			if (splitEvents) events[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
			else params.on[`${key[2].toLowerCase()}${key.substr(3)}`] = obj[key];
		} else rest[key] = obj[key];
	});
	[
		"navigation",
		"pagination",
		"scrollbar"
	].forEach((key) => {
		if (params[key] === true) params[key] = {};
		if (params[key] === false) delete params[key];
	});
	return {
		params,
		passedParams,
		rest,
		events
	};
}
function mountSwiper({ el, nextEl, prevEl, paginationEl, scrollbarEl, swiper }, swiperParams) {
	if (needsNavigation(swiperParams) && nextEl && prevEl) {
		swiper.params.navigation.nextEl = nextEl;
		swiper.originalParams.navigation.nextEl = nextEl;
		swiper.params.navigation.prevEl = prevEl;
		swiper.originalParams.navigation.prevEl = prevEl;
	}
	if (needsPagination(swiperParams) && paginationEl) {
		swiper.params.pagination.el = paginationEl;
		swiper.originalParams.pagination.el = paginationEl;
	}
	if (needsScrollbar(swiperParams) && scrollbarEl) {
		swiper.params.scrollbar.el = scrollbarEl;
		swiper.originalParams.scrollbar.el = scrollbarEl;
	}
	swiper.init(el);
}
function getChangedParams(swiperParams, oldParams, children, oldChildren, getKey) {
	const keys = [];
	if (!oldParams) return keys;
	const addKey = (key) => {
		if (keys.indexOf(key) < 0) keys.push(key);
	};
	if (children && oldChildren) {
		const oldChildrenKeys = oldChildren.map(getKey);
		const childrenKeys = children.map(getKey);
		if (oldChildrenKeys.join("") !== childrenKeys.join("")) addKey("children");
		if (oldChildren.length !== children.length) addKey("children");
	}
	paramsList.filter((key) => key[0] === "_").map((key) => key.replace(/_/, "")).forEach((key) => {
		if (key in swiperParams && key in oldParams) {
			if (isObject(swiperParams[key]) && isObject(oldParams[key])) {
				const newKeys = Object.keys(swiperParams[key]);
				const oldKeys = Object.keys(oldParams[key]);
				if (newKeys.length !== oldKeys.length) addKey(key);
				else {
					newKeys.forEach((newKey) => {
						if (swiperParams[key][newKey] !== oldParams[key][newKey]) addKey(key);
					});
					oldKeys.forEach((oldKey) => {
						if (swiperParams[key][oldKey] !== oldParams[key][oldKey]) addKey(key);
					});
				}
			} else if (swiperParams[key] !== oldParams[key]) addKey(key);
		}
	});
	return keys;
}
var updateOnVirtualData = (swiper) => {
	if (!swiper || swiper.destroyed || !swiper.params.virtual || swiper.params.virtual && !swiper.params.virtual.enabled) return;
	swiper.updateSlides();
	swiper.updateProgress();
	swiper.updateSlidesClasses();
	swiper.emit("_virtualUpdated");
	if (swiper.parallax && swiper.params.parallax && swiper.params.parallax.enabled) swiper.parallax.setTranslate();
};
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/swiper-react.mjs
/**
* Swiper React 12.2.0
* Most modern mobile touch slider and framework with hardware accelerated transitions
* https://swiperjs.com
*
* Copyright 2014-2026 Vladimir Kharlampidi
*
* Released under the MIT License
*
* Released on: May 27, 2026
*/
function _extends() {
	_extends = Object.assign ? Object.assign.bind() : function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
		}
		return target;
	};
	return _extends.apply(this, arguments);
}
function isChildSwiperSlide(child) {
	return child.type && child.type.displayName && child.type.displayName.includes("SwiperSlide");
}
function processChildren(c) {
	const slides = [];
	import_react.Children.toArray(c).forEach((child) => {
		if (isChildSwiperSlide(child)) slides.push(child);
		else if (child.props && child.props.children) processChildren(child.props.children).forEach((slide) => slides.push(slide));
	});
	return slides;
}
function getChildren(c) {
	const slides = [];
	const slots = {
		"container-start": [],
		"container-end": [],
		"wrapper-start": [],
		"wrapper-end": []
	};
	import_react.Children.toArray(c).forEach((child) => {
		if (isChildSwiperSlide(child)) slides.push(child);
		else if (child.props && child.props.slot && slots[child.props.slot]) slots[child.props.slot].push(child);
		else if (child.props && child.props.children) {
			const foundSlides = processChildren(child.props.children);
			if (foundSlides.length > 0) foundSlides.forEach((slide) => slides.push(slide));
			else slots["container-end"].push(child);
		} else slots["container-end"].push(child);
	});
	return {
		slides,
		slots
	};
}
function renderVirtual(swiper, slides, virtualData) {
	if (!virtualData) return null;
	const getSlideIndex = (index) => {
		let slideIndex = index;
		if (index < 0) slideIndex = slides.length + index;
		else if (slideIndex >= slides.length) slideIndex = slideIndex - slides.length;
		return slideIndex;
	};
	const style = swiper.isHorizontal() ? { [swiper.rtlTranslate ? "right" : "left"]: `${virtualData.offset}px` } : { top: `${virtualData.offset}px` };
	const { from, to } = virtualData;
	const loopFrom = swiper.params.loop ? -slides.length : 0;
	const loopTo = swiper.params.loop ? slides.length * 2 : slides.length;
	const slidesToRender = [];
	for (let i = loopFrom; i < loopTo; i += 1) if (i >= from && i <= to) slidesToRender.push(slides[getSlideIndex(i)]);
	return slidesToRender.map((child, index) => {
		return /*#__PURE__*/ import_react.cloneElement(child, {
			swiper,
			style,
			key: child.props.virtualIndex || child.key || `slide-${index}`
		});
	});
}
function useIsomorphicLayoutEffect(callback, deps) {
	if (typeof window === "undefined") return (0, import_react.useEffect)(callback, deps);
	return (0, import_react.useLayoutEffect)(callback, deps);
}
var SwiperSlideContext = /*#__PURE__*/ (0, import_react.createContext)(null);
var SwiperContext = /*#__PURE__*/ (0, import_react.createContext)(null);
var Swiper = /*#__PURE__*/ (0, import_react.forwardRef)(({ className, tag: Tag = "div", wrapperTag: WrapperTag = "div", children, onSwiper, ...rest } = {}, externalElRef) => {
	let eventsAssigned = false;
	const [containerClasses, setContainerClasses] = (0, import_react.useState)("swiper");
	const [virtualData, setVirtualData] = (0, import_react.useState)(null);
	const [breakpointChanged, setBreakpointChanged] = (0, import_react.useState)(false);
	const initializedRef = (0, import_react.useRef)(false);
	const swiperElRef = (0, import_react.useRef)(null);
	const swiperRef = (0, import_react.useRef)(null);
	const oldPassedParamsRef = (0, import_react.useRef)(null);
	const oldSlides = (0, import_react.useRef)(null);
	const nextElRef = (0, import_react.useRef)(null);
	const prevElRef = (0, import_react.useRef)(null);
	const paginationElRef = (0, import_react.useRef)(null);
	const scrollbarElRef = (0, import_react.useRef)(null);
	const { params: swiperParams, passedParams, rest: restProps, events } = getParams(rest);
	const { slides, slots } = getChildren(children);
	const onBeforeBreakpoint = () => {
		setBreakpointChanged(!breakpointChanged);
	};
	Object.assign(swiperParams.on, { _containerClasses(swiper, classes) {
		setContainerClasses(classes);
	} });
	const initSwiper = () => {
		Object.assign(swiperParams.on, events);
		eventsAssigned = true;
		const passParams = { ...swiperParams };
		delete passParams.wrapperClass;
		swiperRef.current = new Swiper$1(passParams);
		if (swiperRef.current.virtual && swiperRef.current.params.virtual.enabled) {
			swiperRef.current.virtual.slides = slides;
			const extendWith = {
				cache: false,
				slides,
				renderExternal: setVirtualData,
				renderExternalUpdate: false
			};
			extend(swiperRef.current.params.virtual, extendWith);
			extend(swiperRef.current.originalParams.virtual, extendWith);
		}
	};
	if (!swiperElRef.current) initSwiper();
	if (swiperRef.current) swiperRef.current.on("_beforeBreakpoint", onBeforeBreakpoint);
	const attachEvents = () => {
		if (eventsAssigned || !events || !swiperRef.current) return;
		Object.keys(events).forEach((eventName) => {
			swiperRef.current.on(eventName, events[eventName]);
		});
	};
	const detachEvents = () => {
		if (!events || !swiperRef.current) return;
		Object.keys(events).forEach((eventName) => {
			swiperRef.current.off(eventName, events[eventName]);
		});
	};
	(0, import_react.useEffect)(() => {
		return () => {
			if (swiperRef.current) swiperRef.current.off("_beforeBreakpoint", onBeforeBreakpoint);
		};
	});
	(0, import_react.useEffect)(() => {
		if (!initializedRef.current && swiperRef.current) {
			swiperRef.current.emitSlidesClasses();
			initializedRef.current = true;
		}
	});
	useIsomorphicLayoutEffect(() => {
		if (externalElRef) externalElRef.current = swiperElRef.current;
		if (!swiperElRef.current) return;
		if (swiperRef.current.destroyed) initSwiper();
		mountSwiper({
			el: swiperElRef.current,
			nextEl: nextElRef.current,
			prevEl: prevElRef.current,
			paginationEl: paginationElRef.current,
			scrollbarEl: scrollbarElRef.current,
			swiper: swiperRef.current
		}, swiperParams);
		if (onSwiper && !swiperRef.current.destroyed) onSwiper(swiperRef.current);
		return () => {
			if (swiperRef.current && !swiperRef.current.destroyed) swiperRef.current.destroy(true, false);
		};
	}, []);
	useIsomorphicLayoutEffect(() => {
		attachEvents();
		const changedParams = getChangedParams(passedParams, oldPassedParamsRef.current, slides, oldSlides.current, (c) => c.key);
		oldPassedParamsRef.current = passedParams;
		oldSlides.current = slides;
		if (changedParams.length && swiperRef.current && !swiperRef.current.destroyed) updateSwiper({
			swiper: swiperRef.current,
			slides,
			passedParams,
			changedParams,
			nextEl: nextElRef.current,
			prevEl: prevElRef.current,
			scrollbarEl: scrollbarElRef.current,
			paginationEl: paginationElRef.current
		});
		return () => {
			detachEvents();
		};
	});
	useIsomorphicLayoutEffect(() => {
		updateOnVirtualData(swiperRef.current);
	}, [virtualData]);
	function renderSlides() {
		if (swiperParams.virtual) return renderVirtual(swiperRef.current, slides, virtualData);
		return slides.map((child, index) => {
			return /*#__PURE__*/ import_react.cloneElement(child, {
				swiper: swiperRef.current,
				swiperSlideIndex: index
			});
		});
	}
	return /*#__PURE__*/ import_react.createElement(Tag, _extends({
		ref: swiperElRef,
		className: uniqueClasses(`${containerClasses}${className ? ` ${className}` : ""}`)
	}, restProps), /*#__PURE__*/ import_react.createElement(SwiperContext.Provider, { value: swiperRef.current }, slots["container-start"], /*#__PURE__*/ import_react.createElement(WrapperTag, { className: wrapperClass(swiperParams.wrapperClass) }, slots["wrapper-start"], renderSlides(), slots["wrapper-end"]), needsNavigation(swiperParams) && /*#__PURE__*/ import_react.createElement(import_react.Fragment, null, /*#__PURE__*/ import_react.createElement("div", {
		ref: prevElRef,
		className: "swiper-button-prev"
	}), /*#__PURE__*/ import_react.createElement("div", {
		ref: nextElRef,
		className: "swiper-button-next"
	})), needsScrollbar(swiperParams) && /*#__PURE__*/ import_react.createElement("div", {
		ref: scrollbarElRef,
		className: "swiper-scrollbar"
	}), needsPagination(swiperParams) && /*#__PURE__*/ import_react.createElement("div", {
		ref: paginationElRef,
		className: "swiper-pagination"
	}), slots["container-end"]));
});
Swiper.displayName = "Swiper";
var SwiperSlide = /*#__PURE__*/ (0, import_react.forwardRef)(({ tag: Tag = "div", children, className = "", swiper, zoom, lazy, virtualIndex, swiperSlideIndex, ...rest } = {}, externalRef) => {
	const slideElRef = (0, import_react.useRef)(null);
	const [slideClasses, setSlideClasses] = (0, import_react.useState)("swiper-slide");
	const [lazyLoaded, setLazyLoaded] = (0, import_react.useState)(false);
	function updateClasses(_s, el, classNames) {
		if (el === slideElRef.current) setSlideClasses(classNames);
	}
	useIsomorphicLayoutEffect(() => {
		if (typeof swiperSlideIndex !== "undefined") slideElRef.current.swiperSlideIndex = swiperSlideIndex;
		if (externalRef) externalRef.current = slideElRef.current;
		if (!slideElRef.current || !swiper) return;
		if (swiper.destroyed) {
			if (slideClasses !== "swiper-slide") setSlideClasses("swiper-slide");
			return;
		}
		swiper.on("_slideClass", updateClasses);
		return () => {
			if (!swiper) return;
			swiper.off("_slideClass", updateClasses);
		};
	});
	useIsomorphicLayoutEffect(() => {
		if (swiper && slideElRef.current && !swiper.destroyed) setSlideClasses(swiper.getSlideClasses(slideElRef.current));
	}, [swiper]);
	const slideData = {
		isActive: slideClasses.indexOf("swiper-slide-active") >= 0,
		isVisible: slideClasses.indexOf("swiper-slide-visible") >= 0,
		isFullyVisible: slideClasses.indexOf("swiper-slide-fully-visible") >= 0,
		isPrev: slideClasses.indexOf("swiper-slide-prev") >= 0,
		isNext: slideClasses.indexOf("swiper-slide-next") >= 0
	};
	const renderChildren = () => {
		return typeof children === "function" ? children(slideData) : children;
	};
	const onLoad = () => {
		setLazyLoaded(true);
	};
	return /*#__PURE__*/ import_react.createElement(Tag, _extends({
		ref: slideElRef,
		className: uniqueClasses(`${slideClasses}${className ? ` ${className}` : ""}`),
		"data-swiper-slide-index": virtualIndex,
		onLoad
	}, rest), zoom && /*#__PURE__*/ import_react.createElement(SwiperSlideContext.Provider, { value: slideData }, /*#__PURE__*/ import_react.createElement("div", {
		className: "swiper-zoom-container",
		"data-swiper-zoom": typeof zoom === "number" ? zoom : void 0
	}, renderChildren(), lazy && !lazyLoaded && /*#__PURE__*/ import_react.createElement("div", {
		className: "swiper-lazy-preloader",
		ref: (node) => {
			if (node) node.lazyPreloaderManaged = true;
		}
	}))), !zoom && /*#__PURE__*/ import_react.createElement(SwiperSlideContext.Provider, { value: slideData }, renderChildren(), lazy && !lazyLoaded && /*#__PURE__*/ import_react.createElement("div", {
		className: "swiper-lazy-preloader",
		ref: (node) => {
			if (node) node.lazyPreloaderManaged = true;
		}
	})));
});
SwiperSlide.displayName = "SwiperSlide";
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/shared/create-element-if-not-defined.mjs
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
	if (swiper.params.createElements) Object.keys(checkProps).forEach((key) => {
		if (!params[key] && params.auto === true) {
			let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
			if (!element) {
				element = createElement$1("div", checkProps[key]);
				element.className = checkProps[key];
				swiper.el.append(element);
			}
			params[key] = element;
			originalParams[key] = element;
		}
	});
	return params;
}
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/modules/navigation.mjs
var arrowSvg = `<svg class="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"/></svg>`;
function Navigation({ swiper, extendParams, on, emit }) {
	extendParams({ navigation: {
		nextEl: null,
		prevEl: null,
		addIcons: true,
		hideOnClick: false,
		disabledClass: "swiper-button-disabled",
		hiddenClass: "swiper-button-hidden",
		lockClass: "swiper-button-lock",
		navigationDisabledClass: "swiper-navigation-disabled"
	} });
	swiper.navigation = {
		nextEl: null,
		prevEl: null,
		arrowSvg
	};
	function getEl(el) {
		let res;
		if (el && typeof el === "string" && swiper.isElement) {
			res = swiper.el.querySelector(el) || swiper.hostEl.querySelector(el);
			if (res) return res;
		}
		if (el) {
			if (typeof el === "string") res = [...document.querySelectorAll(el)];
			if (swiper.params.uniqueNavElements && typeof el === "string" && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) res = swiper.el.querySelector(el);
			else if (res && res.length === 1) res = res[0];
		}
		if (el && !res) return el;
		return res;
	}
	function toggleEl(el, disabled) {
		const params = swiper.params.navigation;
		el = makeElementsArray(el);
		el.forEach((subEl) => {
			if (subEl) {
				subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
				if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
				if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
			}
		});
	}
	function update() {
		const { nextEl, prevEl } = swiper.navigation;
		if (swiper.params.loop) {
			toggleEl(prevEl, false);
			toggleEl(nextEl, false);
			return;
		}
		toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
		toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
	}
	function onPrevClick(e) {
		e.preventDefault();
		if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
		swiper.slidePrev();
		emit("navigationPrev");
	}
	function onNextClick(e) {
		e.preventDefault();
		if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
		swiper.slideNext();
		emit("navigationNext");
	}
	function init() {
		const params = swiper.params.navigation;
		swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
			nextEl: "swiper-button-next",
			prevEl: "swiper-button-prev"
		});
		if (!(params.nextEl || params.prevEl)) return;
		let nextEl = getEl(params.nextEl);
		let prevEl = getEl(params.prevEl);
		Object.assign(swiper.navigation, {
			nextEl,
			prevEl
		});
		nextEl = makeElementsArray(nextEl);
		prevEl = makeElementsArray(prevEl);
		const initButton = (el, dir) => {
			if (el) {
				if (params.addIcons && el.matches(".swiper-button-next,.swiper-button-prev") && !el.querySelector("svg")) {
					const tempEl = document.createElement("div");
					setInnerHTML(tempEl, arrowSvg);
					el.appendChild(tempEl.querySelector("svg"));
					tempEl.remove();
				}
				el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
			}
			if (!swiper.enabled && el) el.classList.add(...params.lockClass.split(" "));
		};
		nextEl.forEach((el) => initButton(el, "next"));
		prevEl.forEach((el) => initButton(el, "prev"));
	}
	function destroy() {
		let { nextEl, prevEl } = swiper.navigation;
		nextEl = makeElementsArray(nextEl);
		prevEl = makeElementsArray(prevEl);
		const destroyButton = (el, dir) => {
			el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
			el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
		};
		nextEl.forEach((el) => destroyButton(el, "next"));
		prevEl.forEach((el) => destroyButton(el, "prev"));
	}
	on("init", () => {
		if (swiper.params.navigation.enabled === false) disable();
		else {
			init();
			update();
		}
	});
	on("toEdge fromEdge lock unlock", () => {
		update();
	});
	on("destroy", () => {
		destroy();
	});
	on("enable disable", () => {
		let { nextEl, prevEl } = swiper.navigation;
		nextEl = makeElementsArray(nextEl);
		prevEl = makeElementsArray(prevEl);
		if (swiper.enabled) {
			update();
			return;
		}
		[...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.add(swiper.params.navigation.lockClass));
	});
	on("click", (_s, e) => {
		let { nextEl, prevEl } = swiper.navigation;
		nextEl = makeElementsArray(nextEl);
		prevEl = makeElementsArray(prevEl);
		const targetEl = e.target;
		let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
		if (swiper.isElement && !targetIsButton) {
			const path = e.path || e.composedPath && e.composedPath();
			if (path) targetIsButton = path.find((pathEl) => nextEl.includes(pathEl) || prevEl.includes(pathEl));
		}
		if (swiper.params.navigation.hideOnClick && !targetIsButton) {
			if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
			let isHidden;
			if (nextEl.length) isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
			else if (prevEl.length) isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
			if (isHidden === true) emit("navigationShow");
			else emit("navigationHide");
			[...nextEl, ...prevEl].filter((el) => !!el).forEach((el) => el.classList.toggle(swiper.params.navigation.hiddenClass));
		}
	});
	const enable = () => {
		swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
		init();
		update();
	};
	const disable = () => {
		swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
		destroy();
	};
	Object.assign(swiper.navigation, {
		enable,
		disable,
		update,
		init,
		destroy
	});
}
//#endregion
//#region node_modules/.pnpm/swiper@12.2.0/node_modules/swiper/modules/autoplay.mjs
function Autoplay({ swiper, extendParams, on, emit, params }) {
	swiper.autoplay = {
		running: false,
		paused: false,
		timeLeft: 0
	};
	extendParams({ autoplay: {
		enabled: false,
		delay: 3e3,
		waitForTransition: true,
		disableOnInteraction: false,
		stopOnLastSlide: false,
		reverseDirection: false,
		pauseOnMouseEnter: false
	} });
	let timeout;
	let raf;
	let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3e3;
	let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3e3;
	let autoplayTimeLeft;
	let autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
	let wasPaused;
	let isTouched;
	let pausedByTouch;
	let touchStartTimeout;
	let pausedByInteraction;
	let pausedByPointerEnter;
	function onTransitionEnd(e) {
		if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
		if (e.target !== swiper.wrapperEl) return;
		swiper.wrapperEl.removeEventListener("transitionend", onTransitionEnd);
		if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) return;
		resume();
	}
	const calcTimeLeft = () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (swiper.autoplay.paused) wasPaused = true;
		else if (wasPaused) {
			autoplayDelayCurrent = autoplayTimeLeft;
			wasPaused = false;
		}
		const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - (/* @__PURE__ */ new Date()).getTime();
		swiper.autoplay.timeLeft = timeLeft;
		emit("autoplayTimeLeft", timeLeft, timeLeft / autoplayDelayTotal);
		raf = requestAnimationFrame(() => {
			calcTimeLeft();
		});
	};
	const getSlideDelay = () => {
		let activeSlideEl;
		if (swiper.virtual && swiper.params.virtual.enabled) activeSlideEl = swiper.slides.find((slideEl) => slideEl.classList.contains("swiper-slide-active"));
		else activeSlideEl = swiper.slides[swiper.activeIndex];
		if (!activeSlideEl) return void 0;
		return parseInt(activeSlideEl.getAttribute("data-swiper-autoplay"), 10);
	};
	const getTotalDelay = () => {
		let totalDelay = swiper.params.autoplay.delay;
		const currentSlideDelay = getSlideDelay();
		if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0) totalDelay = currentSlideDelay;
		return totalDelay;
	};
	const run = (delayForce) => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		cancelAnimationFrame(raf);
		calcTimeLeft();
		let delay = delayForce;
		if (typeof delay === "undefined") {
			delay = getTotalDelay();
			autoplayDelayTotal = delay;
			autoplayDelayCurrent = delay;
		}
		autoplayTimeLeft = delay;
		const speed = swiper.params.speed;
		const proceed = () => {
			if (!swiper || swiper.destroyed) return;
			if (swiper.params.autoplay.reverseDirection) {
				if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
					swiper.slidePrev(speed, true, true);
					emit("autoplay");
				} else if (!swiper.params.autoplay.stopOnLastSlide) {
					swiper.slideTo(swiper.slides.length - 1, speed, true, true);
					emit("autoplay");
				}
			} else if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
				swiper.slideNext(speed, true, true);
				emit("autoplay");
			} else if (!swiper.params.autoplay.stopOnLastSlide) {
				swiper.slideTo(0, speed, true, true);
				emit("autoplay");
			}
			if (swiper.params.cssMode) {
				autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
				requestAnimationFrame(() => {
					run();
				});
			}
		};
		if (delay > 0) {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				proceed();
			}, delay);
		} else requestAnimationFrame(() => {
			proceed();
		});
		return delay;
	};
	const start = () => {
		autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
		swiper.autoplay.running = true;
		run();
		emit("autoplayStart");
	};
	const stop = () => {
		swiper.autoplay.running = false;
		clearTimeout(timeout);
		cancelAnimationFrame(raf);
		emit("autoplayStop");
	};
	const pause = (internal, reset) => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		clearTimeout(timeout);
		if (!internal) pausedByInteraction = true;
		const proceed = () => {
			emit("autoplayPause");
			if (swiper.params.autoplay.waitForTransition) swiper.wrapperEl.addEventListener("transitionend", onTransitionEnd);
			else resume();
		};
		swiper.autoplay.paused = true;
		if (reset) {
			proceed();
			return;
		}
		autoplayTimeLeft = (autoplayTimeLeft || swiper.params.autoplay.delay) - ((/* @__PURE__ */ new Date()).getTime() - autoplayStartTime);
		if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
		if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
		proceed();
	};
	const resume = () => {
		if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
		autoplayStartTime = (/* @__PURE__ */ new Date()).getTime();
		if (pausedByInteraction) {
			pausedByInteraction = false;
			run(autoplayTimeLeft);
		} else run();
		swiper.autoplay.paused = false;
		emit("autoplayResume");
	};
	const onVisibilityChange = () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		const document = getDocument();
		if (document.visibilityState === "hidden") {
			pausedByInteraction = true;
			pause(true);
		}
		if (document.visibilityState === "visible") resume();
	};
	const onPointerEnter = (e) => {
		if (e.pointerType !== "mouse") return;
		pausedByInteraction = true;
		pausedByPointerEnter = true;
		if (swiper.animating || swiper.autoplay.paused) return;
		pause(true);
	};
	const onPointerLeave = (e) => {
		if (e.pointerType !== "mouse") return;
		pausedByPointerEnter = false;
		if (swiper.autoplay.paused) resume();
	};
	const attachMouseEvents = () => {
		if (swiper.params.autoplay.pauseOnMouseEnter) {
			swiper.el.addEventListener("pointerenter", onPointerEnter);
			swiper.el.addEventListener("pointerleave", onPointerLeave);
		}
	};
	const detachMouseEvents = () => {
		if (swiper.el && typeof swiper.el !== "string") {
			swiper.el.removeEventListener("pointerenter", onPointerEnter);
			swiper.el.removeEventListener("pointerleave", onPointerLeave);
		}
	};
	const attachDocumentEvents = () => {
		getDocument().addEventListener("visibilitychange", onVisibilityChange);
	};
	const detachDocumentEvents = () => {
		getDocument().removeEventListener("visibilitychange", onVisibilityChange);
	};
	on("init", () => {
		if (swiper.params.autoplay.enabled) {
			attachMouseEvents();
			attachDocumentEvents();
			start();
		}
	});
	on("destroy", () => {
		detachMouseEvents();
		detachDocumentEvents();
		if (swiper.autoplay.running) stop();
	});
	on("_freeModeStaticRelease", () => {
		if (pausedByTouch || pausedByInteraction) resume();
	});
	on("_freeModeNoMomentumRelease", () => {
		if (!swiper.params.autoplay.disableOnInteraction) pause(true, true);
		else stop();
	});
	on("beforeTransitionStart", (_s, speed, internal) => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (internal || !swiper.params.autoplay.disableOnInteraction) pause(true, true);
		else stop();
	});
	on("sliderFirstMove", () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (swiper.params.autoplay.disableOnInteraction) {
			stop();
			return;
		}
		isTouched = true;
		pausedByTouch = false;
		pausedByInteraction = false;
		touchStartTimeout = setTimeout(() => {
			pausedByInteraction = true;
			pausedByTouch = true;
			pause(true);
		}, 200);
	});
	on("touchEnd", () => {
		if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
		clearTimeout(touchStartTimeout);
		clearTimeout(timeout);
		if (swiper.params.autoplay.disableOnInteraction) {
			pausedByTouch = false;
			isTouched = false;
			return;
		}
		if (pausedByTouch && swiper.params.cssMode) resume();
		pausedByTouch = false;
		isTouched = false;
	});
	on("slideChange", () => {
		if (swiper.destroyed || !swiper.autoplay.running) return;
		if (swiper.autoplay.paused) {
			autoplayTimeLeft = getTotalDelay();
			autoplayDelayTotal = getTotalDelay();
		}
	});
	Object.assign(swiper.autoplay, {
		start,
		stop,
		pause,
		resume
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/native/salla-slider/SallaSlider.js
function getDocumentDir() {
	if (typeof document === "undefined") return "ltr";
	return document.documentElement.dir || "ltr";
}
var SallaSlider = (0, import_react.forwardRef)(function SallaSlider({ blockTitle, blockSubtitle, displayAllUrl, displayAllTitle = "Display All", showControls = true, controlsOuter, autoPlay = false, loop = false, centered = false, slidesPerView = "auto", direction, sliderConfig = {}, slideClassName, children, className, id, onAfterInit, onSlideChange, onReachBeginning, onReachEnd, onTransitionEnd }, ref) {
	const swiperRef = (0, import_react.useRef)(null);
	(0, import_react.useImperativeHandle)(ref, () => ({
		slideTo: (index, speed, runCallbacks) => swiperRef.current?.swiper?.slideTo(index, speed, runCallbacks),
		slideNext: (speed, runCallbacks) => swiperRef.current?.swiper?.slideNext(speed, runCallbacks),
		slidePrev: (speed, runCallbacks) => swiperRef.current?.swiper?.slidePrev(speed, runCallbacks),
		update: () => swiperRef.current?.swiper?.update(),
		instance: () => swiperRef.current?.swiper,
		getSlides: () => swiperRef.current?.swiper?.slides ? Array.from(swiperRef.current.swiper.slides) : void 0
	}));
	const resolvedDirection = direction || getDocumentDir();
	const navigationConfig = showControls ? {
		nextEl: id ? `#${id} .s-slider-next` : "",
		prevEl: id ? `#${id} .s-slider-prev` : ""
	} : false;
	const handleInit = (0, import_react.useCallback)((swiper) => {
		onAfterInit?.(swiper);
	}, [onAfterInit]);
	const handleSlideChange = (0, import_react.useCallback)((swiper) => {
		onSlideChange?.(swiper);
	}, [onSlideChange]);
	const handleReachBeginning = (0, import_react.useCallback)((swiper) => {
		onReachBeginning?.(swiper);
	}, [onReachBeginning]);
	const handleReachEnd = (0, import_react.useCallback)((swiper) => {
		onReachEnd?.(swiper);
	}, [onReachEnd]);
	const handleTransitionEnd = (0, import_react.useCallback)((swiper) => {
		onTransitionEnd?.(swiper);
	}, [onTransitionEnd]);
	const wrapperClasses = [
		"s-slider-wrapper",
		controlsOuter ? "s-slider-controls-outer" : "",
		!blockTitle ? "s-slider-has-notitle s-slider-v-centered" : "",
		className || ""
	].filter(Boolean).join(" ");
	return (0, import_jsx_runtime.jsxs)("div", {
		id,
		className: wrapperClasses,
		children: [(blockTitle || showControls) && (0, import_jsx_runtime.jsxs)("div", {
			className: "s-slider-block__title",
			children: [blockTitle ? (0, import_jsx_runtime.jsxs)("div", {
				className: "s-slider-block__title-right",
				children: [(0, import_jsx_runtime.jsx)("h2", { children: blockTitle }), blockSubtitle ? (0, import_jsx_runtime.jsx)("p", { dangerouslySetInnerHTML: { __html: blockSubtitle } }) : null]
			}) : null, (0, import_jsx_runtime.jsxs)("div", {
				className: "s-slider-block__title-left",
				children: [displayAllUrl ? (0, import_jsx_runtime.jsx)("a", {
					href: displayAllUrl,
					className: "s-slider-block__display-all",
					children: displayAllTitle
				}) : null, showControls ? (0, import_jsx_runtime.jsxs)("div", {
					className: "s-slider-block__title-nav",
					dir: "rtl",
					children: [(0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Previous Slide",
						className: "s-slider-prev s-slider-nav-arrow",
						children: (0, import_jsx_runtime.jsx)("span", {
							className: "s-slider-button-icon",
							children: (0, import_jsx_runtime.jsx)("svg", {
								version: "1.1",
								xmlns: "http://www.w3.org/2000/svg",
								width: "32",
								height: "32",
								viewBox: "0 0 32 32",
								children: resolvedDirection === "rtl" ? (0, import_jsx_runtime.jsx)("path", { d: "M11.438 22.479l6.125-6.125-6.125-6.125 1.875-1.875 8 8-8 8z" }) : (0, import_jsx_runtime.jsx)("path", { d: "M20.563 22.104l-1.875 1.875-8-8 8-8 1.875 1.875-6.125 6.125z" })
							})
						})
					}), (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Next Slide",
						className: "s-slider-next s-slider-nav-arrow",
						children: (0, import_jsx_runtime.jsx)("span", {
							className: "s-slider-button-icon",
							children: (0, import_jsx_runtime.jsx)("svg", {
								version: "1.1",
								xmlns: "http://www.w3.org/2000/svg",
								width: "32",
								height: "32",
								viewBox: "0 0 32 32",
								children: resolvedDirection === "rtl" ? (0, import_jsx_runtime.jsx)("path", { d: "M20.563 22.104l-1.875 1.875-8-8 8-8 1.875 1.875-6.125 6.125z" }) : (0, import_jsx_runtime.jsx)("path", { d: "M11.438 22.479l6.125-6.125-6.125-6.125 1.875-1.875 8 8-8 8z" })
							})
						})
					})]
				}) : null]
			})]
		}), (0, import_jsx_runtime.jsx)("div", {
			className: "swiper s-slider-container",
			dir: resolvedDirection,
			children: (0, import_jsx_runtime.jsx)(Swiper, {
				ref: swiperRef,
				modules: [Navigation, Autoplay],
				slidesPerView,
				spaceBetween: 0,
				loop,
				centeredSlides: centered,
				direction: "horizontal",
				autoplay: autoPlay ? {
					delay: 1e4,
					disableOnInteraction: false
				} : false,
				navigation: navigationConfig,
				onInit: handleInit,
				onSlideChange: handleSlideChange,
				onReachBeginning: handleReachBeginning,
				onReachEnd: handleReachEnd,
				onTransitionEnd: handleTransitionEnd,
				...sliderConfig,
				children: import_react.Children.map(children, (child, index) => (0, import_jsx_runtime.jsx)(SwiperSlide, {
					className: slideClassName,
					children: child
				}, index))
			})
		})]
	});
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/native/salla-products-slider/SallaProductsSlider.js
function SallaProductsSlider({ loader, children, blockTitle, subTitle, displayAllUrl, autoplay, sliderConfig, sliderProps, skeleton, className, id, tag = "div" }) {
	const [products, setProducts] = (0, import_react.useState)([]);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let isMounted = true;
		const loadProducts = async () => {
			try {
				setIsLoading(true);
				const result = await loader();
				if (isMounted) setProducts(result.items);
			} catch (error) {
				console.error("Failed to load products:", error);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};
		loadProducts();
		return () => {
			isMounted = false;
		};
	}, [loader]);
	if (isLoading) return skeleton ? (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: skeleton }) : null;
	if (!products || products.length === 0) return null;
	return (0, import_jsx_runtime.jsx)(tag, {
		className,
		id,
		children: (0, import_jsx_runtime.jsx)(SallaSlider, {
			blockTitle,
			blockSubtitle: subTitle,
			displayAllUrl,
			autoPlay: autoplay,
			slideClassName: "s-products-slider-card",
			...sliderProps,
			children: products.map((product, index) => (0, import_jsx_runtime.jsx)("div", { children: children(product, index) }, index))
		})
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-PAMMBDFM.js
async function list(params) {
	const query = params ? `?${new URLSearchParams(params).toString()}` : "";
	const { data } = await api.get(`component/list${query}`).json();
	return data ?? [];
}
function without(blocks, excluded) {
	if (!excluded.length) return blocks;
	const paths = new Set(excluded.map((block) => block.path));
	const left = excluded.map((block) => JSON.stringify(block));
	return blocks.filter((block) => {
		if (!paths.has(block.path)) return true;
		const index = left.indexOf(JSON.stringify(block));
		if (index === -1) return true;
		left.splice(index, 1);
		return false;
	});
}
var home = {
	components: async () => {
		const [blocks, pageBlocks] = await Promise.all([list(), list({ show_in: "pages" })]);
		return without(blocks, pageBlocks);
	},
	/** The blocks the merchant placed at `hook` on a product, category or page. */
	blocks: async (hook, scope) => {
		return (await list({
			hooks: hook,
			...Object.fromEntries(Object.entries(scope).map(([key, id]) => [key, String(id)]))
		})).map((block) => ({
			...block,
			path: block.path.replace("home.", "")
		}));
	},
	queries: {
		components: () => queryOptions({
			queryKey: [
				"home",
				"components",
				{ scope: getActiveScope() }
			],
			queryFn: () => home.components()
		}),
		blocks: (hook, scope) => queryOptions({
			queryKey: [
				"home",
				"blocks",
				hook,
				scope
			],
			queryFn: () => home.blocks(hook, scope)
		})
	}
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-L55G7FJZ.js
function ProductsSlider({ data }) {
	const { t } = useTranslation();
	const { products, title, display_all_url: displayAllUrl, position = 1, priority = false, show_controls: showControls, controls_outer: controlsOuter, loop, centered, slides_per_view: slidesPerView, direction, autoplay } = data;
	const sliderProps = (0, import_react.useMemo)(() => ({
		id: `slider-${position}`,
		displayAllTitle: t("blocks.home.display_all", "View All"),
		...showControls !== void 0 && { showControls },
		...controlsOuter !== void 0 && { controlsOuter },
		...loop !== void 0 && { loop },
		...centered !== void 0 && { centered },
		...slidesPerView !== void 0 && { slidesPerView },
		...direction !== void 0 && { direction }
	}), [
		position,
		t,
		showControls,
		controlsOuter,
		loop,
		centered,
		slidesPerView,
		direction
	]);
	const loader = (0, import_react.useCallback)(() => product.list({
		source: products.source,
		sourceValue: products.source_value
	}), [products.source, products.source_value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsSliderSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaProductsSlider, {
			id: `best-offers-${position}-slider`,
			loader,
			sliderProps,
			...displayAllUrl ? { displayAllUrl } : {},
			...title ? { blockTitle: title } : {},
			...autoplay !== void 0 ? { autoplay } : {},
			skeleton: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsSliderSkeleton, {}),
			children: (product2, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product: product2,
				imagePriority: priority && index < 2
			})
		})
	});
}
var StoreFeatures = (0, import_react.memo)(function StoreFeatures2({ data }) {
	const { features } = data;
	if (!features.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(3,minmax(0,1fr))] gap-4 sm:gap-6 xl:gap-8",
		children: features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-block--features__item",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "feature-icon",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: feature.icon })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: feature.title }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: feature.description })
			]
		}, `${feature.icon}:${feature.title}:${feature.description ?? ""}`))
	}) });
});
var FixedBanner = (0, import_react.memo)(function FixedBanner2(props) {
	const { data, priority = false } = props;
	const image = data.image?.url;
	if (!image) return null;
	const url = data.url;
	const altText = data.image.alt?.trim() ? data.image.alt : data.title || "fixed banner";
	const imgProps = priority ? {
		loading: "eager",
		fetchPriority: "high",
		decoding: "sync"
	} : {
		loading: "lazy",
		decoding: "async"
	};
	const smallUrl = data.image.small_url;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: url || "#",
			className: "banner banner--fixed overflow-hidden",
			"aria-label": `Banner ${altText}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("picture", { children: [smallUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
				media: "(max-width: 767px)",
				srcSet: smallUrl
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				width: "1200",
				height: "300",
				src: image,
				alt: altText,
				style: {
					maxWidth: "100%",
					objectFit: "contain"
				},
				loading: imgProps.loading,
				decoding: imgProps.decoding,
				...priority && { fetchPriority: imgProps.fetchPriority }
			})] })
		})
	}) });
});
function FixedProducts({ data }) {
	const { t } = useTranslation();
	const { theme } = useTwilight();
	const title = data.title;
	const parsedLimit = Number(data.limit);
	const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : void 0;
	const isVertical = data.isVertical ?? theme.settings.vertical_fixed_products ?? true;
	const { data: result, isLoading } = useQuery(product.queries.list({
		source: data.products.source,
		sourceValue: data.products?.source_value,
		perPage: limit
	}));
	const products = result?.items ?? [];
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FixedProductsSkeleton, {});
	if (!products.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FixedProductsSkeleton, {}),
		children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-block__title",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "right-side",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title })
			}), data.display_all_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: data.display_all_url,
				className: "s-block__display-all",
				children: [t("blocks.home.display_all", "View All"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-arrow-left" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-products-list-wrapper " + (isVertical ? "s-products-list-vertical-cards" : "s-products-list-horizontal-cards"),
			children: products.slice(0, limit).map((product2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product: product2,
				layout: isVertical ? "vertical" : "horizontal"
			}, product2.id))
		})]
	});
}
var FeaturedProductsStyle1 = (0, import_react.memo)(function FeaturedProductsStyle12({ data }) {
	const items = data.items || [];
	const mainProduct = data.main_product;
	const [activeTab, setActiveTab] = (0, import_react.useState)(items[0]?.id || "");
	const [isAnimating, setIsAnimating] = (0, import_react.useState)(false);
	const handleTabClick = (0, import_react.useCallback)((tabId) => {
		if (tabId === activeTab) return;
		setIsAnimating(true);
		setActiveTab(tabId);
		setTimeout(() => setIsAnimating(false), 100);
	}, [activeTab]);
	if (!items.length) return null;
	const hasMultipleSections = items.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "s-block__title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "right-side",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: mainProduct?.title })
		}), hasMultipleSections && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tabs hide-scroll hidden lg:flex",
			children: items.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
				shape: "link",
				onClick: () => handleTabClick(section.id || ""),
				className: `tab-trigger ${activeTab === section.id ? "is-active" : ""}`,
				children: section.title || section.name
			}, section.id))
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `grid grid-cols-1 gap-8 ${mainProduct?.product ? "lg:grid-cols-2" : ""}`,
		children: [mainProduct?.product && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("custom-salla-product-card", {
				"shadow-on-hover": true,
				product: JSON.stringify(mainProduct.product),
				isSpecial: true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col",
			children: [hasMultipleSections && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tabs mb-4 sm:mb-8 hide-scroll lg:hidden",
				children: items.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
					shape: "link",
					onClick: () => handleTabClick(section.id || ""),
					className: `tab-trigger ${activeTab === section.id ? "is-active" : ""}`,
					children: section.title || section.name
				}, section.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tabs-wrapper flex flex-1",
				children: items.map((section) => {
					const isActive = activeTab === section.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `tabs__item grid-cols-2 ${mainProduct?.product ? "" : "lg:grid-cols-4"} ${isActive ? "is-active" : ""} ${isAnimating && isActive ? "opacity-0 translate-y-3" : ""} ${!isAnimating && isActive ? "opacity-100 translate-y-0" : ""}`,
						children: section.products?.slice(0, mainProduct?.product ? 4 : 8).map((product2, productIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("custom-salla-product-card", { product: JSON.stringify(product2) }, product2.id || productIndex))
					}, section.id);
				})
			})]
		})]
	})] });
});
var FeaturedProductsStyle2 = (0, import_react.memo)(function FeaturedProductsStyle22({ data }) {
	const { theme } = useTwilight();
	const items = data.items || [];
	const isSlider = data.is_slider ?? true;
	const cardLayout = theme.settings.vertical_fixed_products ?? true ? "vertical" : "horizontal";
	const [activeTab, setActiveTab] = (0, import_react.useState)(items[0]?.id || "");
	const [isAnimating, setIsAnimating] = (0, import_react.useState)(false);
	const handleTabClick = (0, import_react.useCallback)((tabId) => {
		if (tabId === activeTab) return;
		setIsAnimating(true);
		setActiveTab(tabId);
		setTimeout(() => setIsAnimating(false), 100);
	}, [activeTab]);
	const loader = (0, import_react.useCallback)((source, value, limit) => {
		return () => product.list({
			source,
			sourceValue: value,
			perPage: limit
		});
	}, []);
	if (!items.length) return null;
	const hasMultipleSections = items.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container",
		children: [hasMultipleSections && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tabs hide-scroll",
			children: items.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
				fill: "outline",
				onClick: () => handleTabClick(section.id || ""),
				className: `tab-trigger ${activeTab === section.id ? "is-active" : ""}`,
				children: section.title || section.name
			}, section.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "tabs-wrapper",
			children: items.map((section) => {
				const isActive = activeTab === section.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `tabs__item ${isActive ? "is-active" : ""} ${isAnimating && isActive ? "opacity-0 translate-y-3" : ""} ${!isAnimating && isActive ? "opacity-100 translate-y-0" : ""}`,
					children: isSlider ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaProductsSlider, {
						loader: loader(section.products.source, section.products?.source_value, section.products?.limit),
						sliderProps: { id: `section-${section.id}-slider` },
						children: (product2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
							className: "s-products-slider-card",
							product: product2
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaProductsList, {
						loader: loader(section.products.source, section.products?.source_value, section.products?.limit),
						itemsClassName: `s-products-list-${cardLayout}-cards`,
						children: (products) => products.map((product2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
							product: product2,
							layout: cardLayout
						}, product2.id))
					})
				}, section.id);
			})
		})]
	}) });
});
var FeaturedProductsStyle3 = (0, import_react.memo)(function FeaturedProductsStyle32({ data }) {
	const items = data.items || [];
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inner",
		children: items.map((section, sectionIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-block__title",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: section.title })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 grid lg:grid-cols-2 gap-4 sm:gap-8",
			children: section.featured_product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product: section.featured_product,
				layout: "fullImage",
				withShadow: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:gap-8",
				children: section.products?.slice(0, 3).map((product2, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					product: product2,
					layout: "minimal",
					withShadow: true,
					index: idx
				}, product2.id))
			})] }) : section.products?.map((product2, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product: product2,
				layout: "minimal",
				withShadow: true,
				index: idx
			}, product2.id))
		})] }, section.id || sectionIndex))
	}) });
});
var ParallaxBackground = (0, import_react.memo)(function ParallaxBackground2({ data }) {
	const { image, url, title, link_text: linkText, is_opacity: isOpacity = false } = data;
	if (!image?.url) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "full-banner-entry",
		style: { backgroundImage: `url(${image.url})` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `overlay h-full w-full ${isOpacity ? "bg-black" : ""} opacity-60 absolute top-0 left-0` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-full items-center justify-center p-5 xs:p-11 relative",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-bold leading-12",
				children: title
			}), url && linkText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: url,
				className: "inline-block text-white text-sm border rounded-md font-bold px-8 py-4",
				children: linkText
			})] })
		})]
	}) });
});
var PhotosSlider = (0, import_react.memo)(function PhotosSlider2({ data }) {
	const items = data.items || [];
	const position = data.position ?? 1;
	if (!items.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSlider$1, {
		type: "carousel",
		className: "home-slider photos-slider",
		centered: true,
		autoPlay: true,
		pagination: true,
		id: `photos-${position}-slider`,
		sliderConfig: { watchOverflow: true },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			slot: "items",
			children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "swiper-slide",
				style: { aspectRatio: "1200/300" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.url || "#",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
						src: item.image,
						className: "w-full h-full object-contain rounded-md",
						alt: `image-slider-${index}`,
						width: 1200,
						height: 300,
						priority: index === 0
					})
				})
			}, item.id ?? `${item.url ?? ""}:${item.image ?? ""}`))
		})
	}) });
});
var imageUrl = (item) => typeof item.image === "string" ? item.image : item.image?.url;
var SquarePhotos = (0, import_react.memo)(function SquarePhotos2({ data }) {
	const items = data.items || [];
	const title = data.title;
	if (!items.length) return null;
	const gridCols = items.length <= 3 ? `one-row md:grid-cols-${items.length}` : "md:grid-cols-3 two-row";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "s-block__title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "right-side",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `grid ${gridCols} grid-flow-row gap-3 sm:gap-8`,
		children: items.map((item) => /* @__PURE__ */ (0, import_react.createElement)(Link, {
			...item.link_type === "external_link" ? { target: "_blank" } : {},
			key: item.id ?? imageUrl(item) ?? item.url,
			className: `banner-entry square-photos ${item.text ? "has-overlay with-hover" : ""}`,
			style: { backgroundImage: `url(${imageUrl(item)})` },
			to: item.url || "#"
		}, item.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-with-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.text })
		})))
	})] });
});
var Youtube = (0, import_react.memo)(function Youtube2({ data }) {
	const { youtube_id: youtubeId } = data;
	const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!youtubeId) return;
		let mounted = true;
		import("./lite-youtube-BswVQ1gh.js").then(() => {
			if (mounted) setIsLoaded(true);
		}).catch((err) => {
			console.error("Failed to load lite-youtube:", err);
		});
		return () => {
			mounted = false;
		};
	}, [youtubeId]);
	if (!youtubeId) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "container",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "videoWrapper",
			children: isLoaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lite-youtube", {
				videoid: youtubeId,
				params: "rel=0"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-pulse bg-gray-200 w-full h-full min-h-[300px] rounded" })
		})
	}) });
});
var BundleComponent = (0, import_react.memo)(function BundleComponent2(props) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return null;
	const { component_name: componentName, bundle_id: bundleId, ...rest } = props.data;
	const config = JSON.stringify(rest);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("salla-custom-component", {
		"component-name": componentName,
		"bundle-id": bundleId,
		config,
		suppressHydrationWarning: true
	}) });
});
var LazyTestimonials = (0, import_react.lazy)(() => import("./Testimonials-MZCVP66E-UXcKMW7g.js").then((m) => ({ default: m.Testimonials })));
var DefaultHomeComponents = {
	"fixed-banner": FixedBanner,
	"photos-slider": PhotosSlider,
	testimonial: LazyTestimonials,
	"store-features": StoreFeatures,
	youtube: Youtube,
	"square-photos": SquarePhotos,
	"fixed-products": FixedProducts,
	"products-slider": ProductsSlider,
	"parallax-background": ParallaxBackground,
	"featured-products:style1": FeaturedProductsStyle1,
	"featured-products:style2": FeaturedProductsStyle2,
	"featured-products:style3": FeaturedProductsStyle3,
	"bundle-component": BundleComponent
};
function registerHomeComponents(components = DefaultHomeComponents, prefix = "home:") {
	Object.entries(components).forEach(([path, component]) => {
		if (component) registry.register(`${prefix}${path}`, component);
	});
}
var ComponentErrorBoundary = class extends import_react.Component {
	static {
		this.contextType = TwilightContext;
	}
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidUpdate(prevProps) {
		if (this.state.hasError && prevProps.data !== this.props.data) this.setState({
			hasError: false,
			error: null
		});
	}
	componentDidCatch(error, errorInfo) {
		if (!this.context) {
			console.error("[ComponentErrorBoundary] Must be used within TwilightProvider");
			return;
		}
		const { log } = this.context;
		const { data, position } = this.props;
		log.groupCollapsed(`HomeComponent Error: ${data.path || "unknown"}`);
		log.error("ERROR", error.message);
		log.label("COMPONENT", data.path || "unknown");
		log.label("POSITION", position);
		log.label("URL", typeof window !== "undefined" ? window.location.href : "SSR");
		log.label("TIME", (/* @__PURE__ */ new Date()).toISOString());
		log.trace("STACK TRACE", error.stack || "");
		log.trace("COMPONENT STACK", errorInfo.componentStack || "");
		log.dir("COMPONENT DATA", data);
		log.groupEnd();
	}
	render() {
		const { hasError, error } = this.state;
		const { children, data } = this.props;
		if (hasError && error) return null;
		return children;
	}
};
function SquareGridSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "s-block container grid grid-cols-2 sm:grid-cols-4 gap-4 py-8",
		children: [
			1,
			2,
			3,
			4
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulse, { className: "aspect-square" }, i))
	});
}
var FallbackComponent = (0, import_react.memo)(function FallbackComponent2({ data }) {
	return null;
});
function getComponentByPath(data) {
	const { path, view_style: viewStyle } = data;
	if (viewStyle) {
		const variantKey = `home:${path}:${viewStyle}`;
		const variant = registry.resolve(variantKey);
		if (variant) return variant;
	}
	const registryKey = `home:${path}`;
	const component = registry.resolve(registryKey);
	if (component) return component;
	return FallbackComponent;
}
var CHANNEL_VISIBILITY_CSS = "@media (max-width:767.98px){.s-hide-on-mobile{display:none!important}}@media (min-width:768px){.s-hide-on-desktop{display:none!important}}";
function channelVisibilityClass(data) {
	const raw = data.channel_visibility;
	if (!raw || typeof raw !== "object") return "";
	const desktop = raw.desktop !== false;
	const mobile = raw.mobile !== false;
	if (desktop && !mobile) return "s-hide-on-mobile";
	if (mobile && !desktop) return "s-hide-on-desktop";
	return "";
}
var COMPONENT_CONFIG = {
	"products-slider": {
		height: "450px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsSliderSkeleton, {})
	},
	"fixed-products": {
		height: "450px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FixedProductsSkeleton, {})
	},
	"featured-products": {
		height: "450px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsSliderSkeleton, {}),
		className: (data) => {
			const style = data.view_style;
			if (style === "style1") return "s-block s-block--featured-products s-block-tabs s-block--special-products container tabs-initialized";
			if (style === "style2") return `s-block s-block--featured-products s-block-tabs s-block--tabs-produtcs s-block--full-bg tabs-initialized ${data.is_slider ? "as-slider" : "as-grid"} bg-gray-100 py-8 sm:py-16`;
			if (style === "style3") return `s-block s-block--featured-products s-block--features-products${Array.isArray(data.items) && data.items.length > 1 ? " two-cols" : ""} container`;
			return "s-block s-block--featured-products container overflow-hidden";
		},
		id: (data) => `featured-products-${data.view_style}-${data.position ?? 0}`
	},
	testimonial: {
		height: "350px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewItemSkeleton, {})
	},
	"store-features": {
		height: "200px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulletDeliverySkeleton, {})
	},
	"parallax-background": {
		height: "500px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackgroundSliderSkeleton, {})
	},
	"fixed-banner": {
		height: "350px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackgroundSliderSkeleton, {})
	},
	"photos-slider": {
		height: "clamp(130px, 30vw, 350px)",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderSkeleton, {}),
		className: (data) => `s-block s-block--photos-slider${data.is_repeated ? " repeated-block" : ""}`
	},
	"square-photos": {
		height: "250px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareGridSkeleton, {})
	},
	youtube: {
		height: "350px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderSkeleton, {})
	},
	"bundle-component": {
		height: "0px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {}),
		className: (data) => `s-block s-block--bundle-${data.component_name}`,
		renderOnMount: true
	},
	"main-links": {
		height: "200px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}),
		className: (data) => {
			const mergeWithTop = data.merge_links_with_top_component;
			const position = data.position;
			return [
				"s-block",
				"s-block--main-links",
				mergeWithTop && position ? "merge-with-top-component" : "",
				!data.title && mergeWithTop ? "merged-has-no-title" : ""
			].filter(Boolean).join(" ");
		}
	},
	"square-links": {
		height: "200px",
		placeholder: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareGridSkeleton, {})
	}
};
var themeComponentConfig = {};
function registerHomeComponentConfig(config) {
	Object.assign(themeComponentConfig, config);
}
function resolveComponentConfig(path) {
	return themeComponentConfig[path] ?? COMPONENT_CONFIG[path];
}
function liveBlockIdOf(data) {
	const id = (typeof data.__dev_id === "string" ? data.__dev_id.replace(/~\d+$/, "") : void 0) ?? data.id ?? data.key;
	if (typeof id === "number" || typeof id === "string" && id) return String(id);
	return data.path || void 0;
}
var HomeComponentRenderer = (0, import_react.memo)(function HomeComponentRenderer2({ data, index, priority }) {
	const renderCountRef = (0, import_react.useRef)(0);
	renderCountRef.current += 1;
	(0, import_react.useEffect)(() => {
		console.log(`[HomeComponentRenderer] MOUNT: path=${data.path}, index=${index}, renderCount=${renderCountRef.current}`);
		return () => {
			console.log(`[HomeComponentRenderer] UNMOUNT: path=${data.path}, index=${index}`);
		};
	}, [data.path, index]);
	const isFirstComponent = priority ?? index <= 2;
	const Component2 = getComponentByPath(data);
	const config = resolveComponentConfig(data.path);
	const resolvedClassName = config?.className ? typeof config.className === "function" ? config.className(data) : config.className : `s-block s-block--${data.path}`;
	const hideClass = channelVisibilityClass(data);
	const resolvedId = config?.id ? typeof config.id === "function" ? config.id(data) : config.id : void 0;
	const liveBlockId = liveBlockIdOf(data);
	const height = config?.height || "400px";
	const renderOnMount = config?.renderOnMount ?? COMPONENT_CONFIG[data.path]?.renderOnMount;
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentErrorBoundary, {
		data,
		position: index + 1,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component2, { data: {
			...data,
			position: index + 1,
			priority: isFirstComponent
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [hideClass && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", {
		href: "twilight-channel-visibility",
		precedence: "default",
		children: CHANNEL_VISIBILITY_CSS
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyRenderWhenVisible, {
		rootMargin: "50px",
		className: hideClass ? `${resolvedClassName} ${hideClass}` : resolvedClassName,
		id: resolvedId,
		estimatedHeight: height,
		renderOnMount: isFirstComponent || renderOnMount === true,
		placeholder: config?.placeholder ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsSliderSkeleton, {}),
		blockIndex: void 0,
		liveBlockId,
		children: content
	})] });
});
var PageBlocks = (0, import_react.memo)(function PageBlocks2({ hook, scope }) {
	const { data: blocks = [] } = useQuery(home.queries.blocks(hook, scope));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: blocks.map((data, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeComponentRenderer, {
		data,
		index,
		priority: false
	}, index)) });
});
var registered = false;
function registerReorderHooks(labels) {
	if (registered) return;
	registered = true;
	whenSallaLoaded((sdk) => {
		sdk.hooks?.registerHook?.("salla-add-product-button", "componentDidLoad", (component) => {
			if (!component.host?.closest("[source=\"reorder\"], [data-source=\"reorder\"]")) return;
			const isOutOfStock = component.productStatus === "out" || component.productStatus === "out-and-notify";
			const setLabel = () => component.btn?.setText(isOutOfStock ? labels.outOfStock : labels.add);
			setLabel();
			sdk.lang?.onLoaded?.(setLabel);
			if (isOutOfStock) return;
			component.addProductToCart = async (event) => {
				event.preventDefault();
				const productId = component.productId ?? component.host.getAttribute("product-id");
				await sdk.order.api.reorderProduct?.(productId ?? void 0);
			};
		});
	});
}
function useReorderButtons(enabled) {
	const { t } = useTranslation();
	const add = t("pages.orders.repurchase");
	const outOfStock = t("pages.products.out_of_stock");
	(0, import_react.useEffect)(() => {
		if (enabled) registerReorderHooks({
			add,
			outOfStock
		});
	}, [
		enabled,
		add,
		outOfStock
	]);
}
var ReorderProducts = (0, import_react.memo)(function ReorderProducts2() {
	const { t } = useTranslation();
	const { authToken, settings } = getTwilightContext();
	const enabled = !!authToken && !!settings?.store?.features?.includes("reorder");
	const title = t("pages.orders.repurchase");
	useReorderButtons(enabled);
	const data = (0, import_react.useMemo)(() => ({
		path: "products-slider",
		title,
		display_all_url: "/products?source=reorder",
		products: { source: "reorder" }
	}), [title]);
	if (!enabled) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "reorder-section",
		"data-source": "reorder",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeComponentRenderer, {
			data,
			index: -1,
			priority: false
		})
	});
});
//#endregion
export { ProductsSlider as a, registerHomeComponents as c, SallaProductsSlider as d, SallaProductsList as f, PageBlocks as i, useReorderButtons as l, HomeComponentRenderer as n, ReorderProducts as o, LazyTestimonials as r, registerHomeComponentConfig as s, DefaultHomeComponents as t, home as u };

//# sourceMappingURL=chunk-L55G7FJZ-dWxZKcjA.js.map