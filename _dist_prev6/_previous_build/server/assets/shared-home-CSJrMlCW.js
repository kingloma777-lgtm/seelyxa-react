import { i as __toESM, n as __exportAll, r as __require$1, t as __commonJSMin } from "./rolldown-runtime-DbVrKiKs.js";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/.pnpm/react@19.2.8/node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.8";
}));
//#endregion
//#region node_modules/.pnpm/react@19.2.8/node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region node_modules/.pnpm/react@19.2.8/node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/.pnpm/react@19.2.8/node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region node_modules/.pnpm/use-sync-external-store@1.7.0_react@19.2.8/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
/**
* @license React
* use-sync-external-store-shim.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_use_sync_external_store_shim_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	var useState = React.useState;
	var useEffect = React.useEffect;
	var useLayoutEffect = React.useLayoutEffect;
	var useDebugValue = React.useDebugValue;
	function useSyncExternalStore$2(subscribe, getSnapshot) {
		var value = getSnapshot(), _useState = useState({ inst: {
			value,
			getSnapshot
		} }), inst = _useState[0].inst, forceUpdate = _useState[1];
		useLayoutEffect(function() {
			inst.value = value;
			inst.getSnapshot = getSnapshot;
			checkIfSnapshotChanged(inst) && forceUpdate({ inst });
		}, [
			subscribe,
			value,
			getSnapshot
		]);
		useEffect(function() {
			checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			return subscribe(function() {
				checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			});
		}, [subscribe]);
		useDebugValue(value);
		return value;
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function useSyncExternalStore$1(subscribe, getSnapshot) {
		return getSnapshot();
	}
	var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
	exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
}));
//#endregion
//#region node_modules/.pnpm/use-sync-external-store@1.7.0_react@19.2.8/node_modules/use-sync-external-store/shim/index.js
var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_use_sync_external_store_shim_production();
}));
//#endregion
//#region node_modules/.pnpm/react-dom@19.2.8_react@19.2.8/node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.2.8";
}));
//#endregion
//#region node_modules/.pnpm/react-dom@19.2.8_react@19.2.8/node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
//#endregion
//#region node_modules/.pnpm/rou3@0.8.1/node_modules/rou3/dist/index.mjs
var NullProtoObj = /* @__PURE__ */ (() => {
	const e = function() {};
	return e.prototype = Object.create(null), Object.freeze(e.prototype), e;
})();
//#endregion
//#region node_modules/.pnpm/srvx@0.11.22/node_modules/srvx/dist/adapters/cloudflare.mjs
var FastURL = URL;
var FastResponse = Response;
//#endregion
//#region node_modules/.pnpm/h3@2.0.1-rc.20/node_modules/h3/dist/h3-Bz4OPZv_.mjs
function decodePathname(pathname) {
	return decodeURI(pathname.includes("%25") ? pathname.replace(/%25/g, "%2525") : pathname);
}
var kEventNS = "h3.internal.event.";
var kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
var kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
var kEventResErrHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.err.headers`);
var H3Event = class {
	app;
	req;
	url;
	context;
	static __is_event__ = true;
	constructor(req, context, app) {
		this.context = context || req.context || new NullProtoObj();
		this.req = req;
		this.app = app;
		const _url = req._url;
		const url = _url && _url instanceof URL ? _url : new FastURL(req.url);
		if (url.pathname.includes("%")) url.pathname = decodePathname(url.pathname);
		this.url = url;
	}
	get res() {
		return this[kEventRes] ||= new H3EventResponse();
	}
	get runtime() {
		return this.req.runtime;
	}
	waitUntil(promise) {
		this.req.waitUntil?.(promise);
	}
	toString() {
		return `[${this.req.method}] ${this.req.url}`;
	}
	toJSON() {
		return this.toString();
	}
	get node() {
		return this.req.runtime?.node;
	}
	get headers() {
		return this.req.headers;
	}
	get path() {
		return this.url.pathname + this.url.search;
	}
	get method() {
		return this.req.method;
	}
};
var H3EventResponse = class {
	status;
	statusText;
	get headers() {
		return this[kEventResHeaders] ||= new Headers();
	}
	get errHeaders() {
		return this[kEventResErrHeaders] ||= new Headers();
	}
};
var DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
	return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
	if (!statusCode) return defaultStatusCode;
	if (typeof statusCode === "string") statusCode = +statusCode;
	if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
	return statusCode;
}
var HTTPError$1 = class HTTPError extends Error {
	get name() {
		return "HTTPError";
	}
	status;
	statusText;
	headers;
	cause;
	data;
	body;
	unhandled;
	static isError(input) {
		return input instanceof Error && input?.name === "HTTPError";
	}
	static status(status, statusText, details) {
		return new HTTPError({
			...details,
			statusText,
			status
		});
	}
	constructor(arg1, arg2) {
		let messageInput;
		let details;
		if (typeof arg1 === "string") {
			messageInput = arg1;
			details = arg2;
		} else details = arg1;
		const status = sanitizeStatusCode(details?.status || details?.statusCode || (details?.cause)?.status || (details?.cause)?.statusCode, 500);
		const statusText = sanitizeStatusMessage(details?.statusText || details?.statusMessage || (details?.cause)?.statusText || (details?.cause)?.statusMessage);
		const message = messageInput || details?.message || (details?.cause)?.message || details?.statusText || details?.statusMessage || [
			"HTTPError",
			status,
			statusText
		].filter(Boolean).join(" ");
		super(message, { cause: details });
		this.cause = details;
		this.status = status;
		this.statusText = statusText || void 0;
		const rawHeaders = details?.headers || (details?.cause)?.headers;
		this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
		this.unhandled = details?.unhandled ?? (details?.cause)?.unhandled ?? void 0;
		this.data = details?.data;
		this.body = details?.body;
	}
	get statusCode() {
		return this.status;
	}
	get statusMessage() {
		return this.statusText;
	}
	toJSON() {
		const unhandled = this.unhandled;
		return {
			status: this.status,
			statusText: this.statusText,
			unhandled,
			message: unhandled ? "HTTPError" : this.message,
			data: unhandled ? void 0 : this.data,
			...unhandled ? void 0 : this.body
		};
	}
};
function isJSONSerializable(value, _type) {
	if (value === null || value === void 0) return true;
	if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
	if (typeof value.toJSON === "function") return true;
	if (Array.isArray(value)) return true;
	if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
	if (value instanceof NullProtoObj) return true;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
var kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
var kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
	if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
	const response = prepareResponse(val, event, config);
	if (typeof response?.then === "function") return toResponse(response, event, config);
	const { onResponse } = config;
	return onResponse ? Promise.resolve(onResponse(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
	#headers;
	#init;
	body;
	constructor(body, init) {
		this.body = body;
		this.#init = init;
	}
	get status() {
		return this.#init?.status || 200;
	}
	get statusText() {
		return this.#init?.statusText || "OK";
	}
	get headers() {
		return this.#headers ||= new Headers(this.#init?.headers);
	}
};
function prepareResponse(val, event, config, nested) {
	if (val === kHandled) return new FastResponse(null);
	if (val === kNotFound) val = new HTTPError$1({
		status: 404,
		message: `Cannot find any route matching [${event.req.method}] ${event.url}`
	});
	if (val && val instanceof Error) {
		const isHTTPError = HTTPError$1.isError(val);
		const error = isHTTPError ? val : new HTTPError$1(val);
		if (!isHTTPError) {
			error.unhandled = true;
			if (val?.stack) error.stack = val.stack;
		}
		if (error.unhandled && !config.silent) console.error(error);
		const { onError } = config;
		const errHeaders = event[kEventRes]?.[kEventResErrHeaders];
		return onError && !nested ? Promise.resolve(onError(error, event)).catch((error) => error).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug, errHeaders);
	}
	const preparedRes = event[kEventRes];
	const preparedHeaders = preparedRes?.[kEventResHeaders];
	event[kEventRes] = void 0;
	if (!(val instanceof Response)) {
		const res = prepareResponseBody(val, event, config);
		const status = res.status || preparedRes?.status;
		return new FastResponse(nullBody(event.req.method, status) ? null : res.body, {
			status,
			statusText: res.statusText || preparedRes?.statusText,
			headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
		});
	}
	if (!preparedHeaders || nested || !val.ok) return val;
	try {
		mergeHeaders$1(val.headers, preparedHeaders, val.headers);
		return val;
	} catch {
		return new FastResponse(nullBody(event.req.method, val.status) ? null : val.body, {
			status: val.status,
			statusText: val.statusText,
			headers: mergeHeaders$1(val.headers, preparedHeaders)
		});
	}
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
	for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
	else target.set(name, value);
	return target;
}
var frozen = (name) => (...args) => {
	throw new Error(`Headers are frozen (${name} ${args.join(", ")})`);
};
var FrozenHeaders = class extends Headers {
	set = frozen("set");
	append = frozen("append");
	delete = frozen("delete");
};
var emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
var jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
	if (val === null || val === void 0) return {
		body: "",
		headers: emptyHeaders
	};
	const valType = typeof val;
	if (valType === "string") return { body: val };
	if (val instanceof Uint8Array) {
		event.res.headers.set("content-length", val.byteLength.toString());
		return { body: val };
	}
	if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
	if (isJSONSerializable(val, valType)) return {
		body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
		headers: jsonHeaders
	};
	if (valType === "bigint") return {
		body: val.toString(),
		headers: jsonHeaders
	};
	if (val instanceof Blob) {
		const headers = new Headers({
			"content-type": val.type,
			"content-length": val.size.toString()
		});
		let filename = val.name;
		if (filename) {
			filename = encodeURIComponent(filename);
			headers.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
		}
		return {
			body: val.stream(),
			headers
		};
	}
	if (valType === "symbol") return { body: val.toString() };
	if (valType === "function") return { body: `${val.name}()` };
	return { body: val };
}
function nullBody(method, status) {
	return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug, errHeaders) {
	let headers = error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders);
	if (errHeaders) headers = mergeHeaders$1(headers, errHeaders);
	return new FastResponse(JSON.stringify({
		...error.toJSON(),
		stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
	}, void 0, debug ? 2 : void 0), {
		status: error.status,
		statusText: error.statusText,
		headers
	});
}
function getRequestHost(event, opts = {}) {
	if (opts.xForwardedHost) {
		const xForwardedHost = (event.req.headers.get("x-forwarded-host") || "").split(",").shift()?.trim();
		if (xForwardedHost) return xForwardedHost;
	}
	return event.req.headers.get("host") || "";
}
function getRequestProtocol(event, opts = {}) {
	if (opts.xForwardedProto !== false) {
		const forwardedProto = event.req.headers.get("x-forwarded-proto");
		if (forwardedProto === "https") return "https";
		if (forwardedProto === "http") return "http";
	}
	return (event.url || new URL(event.req.url)).protocol.slice(0, -1);
}
function getRequestURL(event, opts = {}) {
	const url = new URL(event.url || event.req.url);
	url.protocol = getRequestProtocol(event, opts);
	if (opts.xForwardedHost) {
		const host = getRequestHost(event, opts);
		if (host) {
			url.host = host;
			if (!/:\d+$/.test(host)) url.port = "";
		}
	}
	return url;
}
var COOKIE_MAX_AGE_LIMIT = 3456e4;
function endIndex(str, min, len) {
	const index = str.indexOf(";", min);
	return index === -1 ? len : index;
}
function eqIndex(str, min, max) {
	const index = str.indexOf("=", min);
	return index < max ? index : -1;
}
function valueSlice(str, min, max) {
	if (min === max) return "";
	let start = min;
	let end = max;
	do {
		const code = str.charCodeAt(start);
		if (code !== 32 && code !== 9) break;
	} while (++start < end);
	while (end > start) {
		const code = str.charCodeAt(end - 1);
		if (code !== 32 && code !== 9) break;
		end--;
	}
	return str.slice(start, end);
}
var NullObject = /* @__PURE__ */ (() => {
	const C = function() {};
	C.prototype = Object.create(null);
	return C;
})();
function parse$1(str, options) {
	const obj = new NullObject();
	const len = str.length;
	if (len < 2) return obj;
	const dec = options?.decode || decode;
	const allowMultiple = options?.allowMultiple || false;
	let index = 0;
	do {
		const eqIdx = eqIndex(str, index, len);
		if (eqIdx === -1) break;
		const endIdx = endIndex(str, index, len);
		if (eqIdx > endIdx) {
			index = str.lastIndexOf(";", eqIdx - 1) + 1;
			continue;
		}
		const key = valueSlice(str, index, eqIdx);
		if (options?.filter && !options.filter(key)) {
			index = endIdx + 1;
			continue;
		}
		const val = dec(valueSlice(str, eqIdx + 1, endIdx));
		if (allowMultiple) {
			const existing = obj[key];
			if (existing === void 0) obj[key] = val;
			else if (Array.isArray(existing)) existing.push(val);
			else obj[key] = [existing, val];
		} else if (obj[key] === void 0) obj[key] = val;
		index = endIdx + 1;
	} while (index < len);
	return obj;
}
function decode(str) {
	if (!str.includes("%")) return str;
	try {
		return decodeURIComponent(str);
	} catch {
		return str;
	}
}
var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
var pathValueRegExp = /^[\u0020-\u003A\u003C-\u007E]*$/;
var __toString = Object.prototype.toString;
function serialize(_a0, _a1, _a2) {
	const isObj = typeof _a0 === "object" && _a0 !== null;
	const options = isObj ? _a1 : _a2;
	const stringify = options?.stringify || JSON.stringify;
	const cookie = isObj ? _a0 : {
		..._a2,
		name: _a0,
		value: _a1 == void 0 ? "" : typeof _a1 === "string" ? _a1 : stringify(_a1)
	};
	const enc = options?.encode || encodeURIComponent;
	if (!cookieNameRegExp.test(cookie.name)) throw new TypeError(`argument name is invalid: ${cookie.name}`);
	const value = cookie.value ? enc(cookie.value) : "";
	if (!cookieValueRegExp.test(value)) throw new TypeError(`argument val is invalid: ${cookie.value}`);
	if (!cookie.secure) {
		if (cookie.partitioned) throw new TypeError(`Partitioned cookies must have the Secure attribute`);
		if (cookie.sameSite && String(cookie.sameSite).toLowerCase() === "none") throw new TypeError(`SameSite=None cookies must have the Secure attribute`);
		if (cookie.name.length > 9 && cookie.name.charCodeAt(0) === 95 && cookie.name.charCodeAt(1) === 95) {
			const nameLower = cookie.name.toLowerCase();
			if (nameLower.startsWith("__secure-") || nameLower.startsWith("__host-")) throw new TypeError(`${cookie.name} cookies must have the Secure attribute`);
		}
	}
	if (cookie.name.length > 7 && cookie.name.charCodeAt(0) === 95 && cookie.name.charCodeAt(1) === 95 && cookie.name.toLowerCase().startsWith("__host-")) {
		if (cookie.path !== "/") throw new TypeError(`__Host- cookies must have Path=/`);
		if (cookie.domain) throw new TypeError(`__Host- cookies must not have a Domain attribute`);
	}
	let str = cookie.name + "=" + value;
	if (cookie.maxAge !== void 0) {
		if (!Number.isInteger(cookie.maxAge)) throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
		str += "; Max-Age=" + Math.max(0, Math.min(cookie.maxAge, COOKIE_MAX_AGE_LIMIT));
	}
	if (cookie.domain) {
		if (!domainValueRegExp.test(cookie.domain)) throw new TypeError(`option domain is invalid: ${cookie.domain}`);
		str += "; Domain=" + cookie.domain;
	}
	if (cookie.path) {
		if (!pathValueRegExp.test(cookie.path)) throw new TypeError(`option path is invalid: ${cookie.path}`);
		str += "; Path=" + cookie.path;
	}
	if (cookie.expires) {
		if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) throw new TypeError(`option expires is invalid: ${cookie.expires}`);
		str += "; Expires=" + cookie.expires.toUTCString();
	}
	if (cookie.httpOnly) str += "; HttpOnly";
	if (cookie.secure) str += "; Secure";
	if (cookie.partitioned) str += "; Partitioned";
	if (cookie.priority) switch (typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0) {
		case "low":
			str += "; Priority=Low";
			break;
		case "medium":
			str += "; Priority=Medium";
			break;
		case "high":
			str += "; Priority=High";
			break;
		default: throw new TypeError(`option priority is invalid: ${cookie.priority}`);
	}
	if (cookie.sameSite) switch (typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite) {
		case true:
		case "strict":
			str += "; SameSite=Strict";
			break;
		case "lax":
			str += "; SameSite=Lax";
			break;
		case "none":
			str += "; SameSite=None";
			break;
		default: throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
	}
	return str;
}
function isDate(val) {
	return __toString.call(val) === "[object Date]";
}
var maxAgeRegExp = /^-?\d+$/;
var _nullProto = /* @__PURE__ */ Object.getPrototypeOf({});
function parseSetCookie(str, options) {
	const len = str.length;
	let _endIdx = len;
	let eqIdx = -1;
	for (let i = 0; i < len; i++) {
		const c = str.charCodeAt(i);
		if (c === 59) {
			_endIdx = i;
			break;
		}
		if (c === 61 && eqIdx === -1) eqIdx = i;
	}
	if (eqIdx >= _endIdx) eqIdx = -1;
	const name = eqIdx === -1 ? "" : _trim(str, 0, eqIdx);
	if (name && name in _nullProto) return void 0;
	let value = eqIdx === -1 ? _trim(str, 0, _endIdx) : _trim(str, eqIdx + 1, _endIdx);
	if (!name && !value) return void 0;
	if (name.length + value.length > 4096) return void 0;
	if (options?.decode !== false) value = _decode(value, options?.decode);
	const setCookie = {
		name,
		value
	};
	let index = _endIdx + 1;
	while (index < len) {
		let endIdx = len;
		let attrEqIdx = -1;
		for (let i = index; i < len; i++) {
			const c = str.charCodeAt(i);
			if (c === 59) {
				endIdx = i;
				break;
			}
			if (c === 61 && attrEqIdx === -1) attrEqIdx = i;
		}
		if (attrEqIdx >= endIdx) attrEqIdx = -1;
		const attr = attrEqIdx === -1 ? _trim(str, index, endIdx) : _trim(str, index, attrEqIdx);
		const val = attrEqIdx === -1 ? void 0 : _trim(str, attrEqIdx + 1, endIdx);
		if (val === void 0 || val.length <= 1024) switch (attr.toLowerCase()) {
			case "httponly":
				setCookie.httpOnly = true;
				break;
			case "secure":
				setCookie.secure = true;
				break;
			case "partitioned":
				setCookie.partitioned = true;
				break;
			case "domain":
				if (val) setCookie.domain = (val.charCodeAt(0) === 46 ? val.slice(1) : val).toLowerCase();
				break;
			case "path":
				setCookie.path = val;
				break;
			case "max-age":
				if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Math.min(Number(val), COOKIE_MAX_AGE_LIMIT);
				break;
			case "expires": {
				if (!val) break;
				const date = new Date(val);
				if (Number.isFinite(date.valueOf())) {
					const maxDate = new Date(Date.now() + COOKIE_MAX_AGE_LIMIT * 1e3);
					setCookie.expires = date > maxDate ? maxDate : date;
				}
				break;
			}
			case "priority": {
				if (!val) break;
				const priority = val.toLowerCase();
				if (priority === "low" || priority === "medium" || priority === "high") setCookie.priority = priority;
				break;
			}
			case "samesite": {
				if (!val) break;
				const sameSite = val.toLowerCase();
				if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") setCookie.sameSite = sameSite;
				else setCookie.sameSite = "lax";
				break;
			}
			default: {
				const attrLower = attr.toLowerCase();
				if (attrLower && !(attrLower in _nullProto)) setCookie[attrLower] = val;
			}
		}
		index = endIdx + 1;
	}
	return setCookie;
}
function _trim(str, start, end) {
	if (start === end) return "";
	let s = start;
	let e = end;
	while (s < e && (str.charCodeAt(s) === 32 || str.charCodeAt(s) === 9)) s++;
	while (e > s && (str.charCodeAt(e - 1) === 32 || str.charCodeAt(e - 1) === 9)) e--;
	return str.slice(s, e);
}
function _decode(value, decode) {
	if (!decode && !value.includes("%")) return value;
	try {
		return (decode || decodeURIComponent)(value);
	} catch {
		return value;
	}
}
function parseCookies(event) {
	return parse$1(event.req.headers.get("cookie") || "");
}
function setCookie$1(event, name, value, options) {
	const newCookie = serialize({
		name,
		value,
		path: "/",
		...options
	});
	const currentCookies = event.res.headers.getSetCookie();
	if (currentCookies.length === 0) {
		event.res.headers.set("set-cookie", newCookie);
		return;
	}
	const newCookieKey = _getDistinctCookieKey(name, options || {});
	event.res.headers.delete("set-cookie");
	for (const cookie of currentCookies) {
		const parsed = parseSetCookie(cookie);
		if (!parsed) continue;
		if (_getDistinctCookieKey(cookie.split("=")?.[0], parsed) === newCookieKey) continue;
		event.res.headers.append("set-cookie", cookie);
	}
	event.res.headers.append("set-cookie", newCookie);
}
function _getDistinctCookieKey(name, options) {
	return [
		name,
		options.domain || "",
		options.path || "/"
	].join(";");
}
//#endregion
//#region node_modules/.pnpm/@tanstack+start-server-core@1.169.40/node_modules/@tanstack/start-server-core/dist/esm/request-response.js
var GLOBAL_EVENT_STORAGE_KEY = Symbol.for("tanstack-start:event-storage");
var globalObj = globalThis;
if (!globalObj[GLOBAL_EVENT_STORAGE_KEY]) globalObj[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
	return (typeof value === "object" || typeof value === "function") && value !== null && typeof value.then === "function";
}
function getSetCookieValues(headers) {
	const headersWithSetCookie = headers;
	if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
	const value = headers.get("set-cookie");
	return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
	if (response.ok) return;
	const eventSetCookies = getSetCookieValues(event.res.headers);
	if (eventSetCookies.length === 0) return;
	const responseSetCookies = getSetCookieValues(response.headers);
	response.headers.delete("set-cookie");
	for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
	for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function finalizeResponse(value, event) {
	const response = ensureResponse(value);
	mergeEventResponseHeaders(response, event);
	return response;
}
function finalizeMaybeResponse(value, event) {
	if (isPromiseLike(value)) return Promise.resolve(value).then((resolved) => finalizeResponse(resolved, event), (error) => finalizeResponse(handleResponseError(error), event));
	return finalizeResponse(value, event);
}
function ensureResponse(value) {
	if (value instanceof Response) return value;
	return new Response("Internal Server Error", { status: 500 });
}
function handleResponseError(error) {
	if (error instanceof Response) return error;
	if (error instanceof Error) throw error;
	return new Response("Internal Server Error", { status: 500 });
}
function requestHandler(handler) {
	return (request, requestOpts) => {
		let h3Event;
		try {
			h3Event = new H3Event(request);
		} catch (error) {
			if (error instanceof URIError) return new Response(null, {
				status: 400,
				statusText: "Bad Request"
			});
			throw error;
		}
		let response;
		try {
			response = eventStorage.run({ h3Event }, () => handler(request, requestOpts));
		} catch (error) {
			response = handleResponseError(error);
		}
		return toResponse(finalizeMaybeResponse(response, h3Event), h3Event);
	};
}
function getH3Event() {
	const event = eventStorage.getStore();
	if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
	return event.h3Event;
}
function getRequestHeaders() {
	return getH3Event().req.headers;
}
function getRequestHeader(name) {
	return getRequestHeaders().get(name) || void 0;
}
/**
* Get the full incoming request URL.
*
* If `xForwardedHost` is `true`, it will use the `x-forwarded-host` header if it exists.
*
* If `xForwardedProto` is `false`, it will not use the `x-forwarded-proto` header.
*/
function getRequestUrl(opts) {
	return getRequestURL(getH3Event(), opts);
}
/**
* Parse the request to get HTTP Cookie header string and return an object of all cookie name-value pairs.
* @returns Object of cookie name-value pairs
* ```ts
* const cookies = getCookies()
* ```
*/
function getCookies() {
	const cookies = parseCookies(getH3Event());
	const definedCookies = Object.create(null);
	for (const [name, value] of Object.entries(cookies)) if (value !== void 0) definedCookies[name] = value;
	return definedCookies;
}
/**
* Get a cookie value by name.
* @param name Name of the cookie to get
* @returns {*} Value of the cookie (String or undefined)
* ```ts
* const authorization = getCookie('Authorization')
* ```
*/
function getCookie(name) {
	return getCookies()[name];
}
/**
* Set a cookie value by name.
* @param name Name of the cookie to set
* @param value Value of the cookie to set
* @param options {CookieSerializeOptions} Options for serializing the cookie
* ```ts
* setCookie('Authorization', '1234567')
* ```
*/
function setCookie(name, value, options) {
	setCookie$1(getH3Event(), name, value, options);
}
function getResponse() {
	return getH3Event().res;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-OXMUPNMH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_shim = require_shim();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var DEV_LOOKUP_BUDGET_MS = 5e3;
var EMPTY_PREVIEW_STATE = {
	enabled: false,
	settings: {},
	layout: null
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-H2QBHOF2.js
var EDITOR_ORIGINS = [
	"https://s.salla.sa",
	"https://salla.design",
	"https://demostore.salla.sa"
];
var FRAME_LOADED_ACTION = "design::iframe.loaded";
var BLOCK_ATTRIBUTE = "data-live-block";
var AREA_ATTRIBUTE = "data-live-editor";
var AREA_FALLBACKS = {
	header: "header.store-header, header.site-header",
	footer: ".store-footer"
};
function parentOrigin() {
	if (window.self === window.top) return null;
	const ancestor = window.location.ancestorOrigins?.[0];
	if (ancestor) return ancestor;
	try {
		return document.referrer ? new URL(document.referrer).origin : null;
	} catch {
		return null;
	}
}
function editorOrigin() {
	if (typeof window === "undefined") return null;
	let origin;
	try {
		origin = parentOrigin();
	} catch {
		return null;
	}
	if (!origin) return null;
	if (EDITOR_ORIGINS.includes(origin)) return origin;
	return null;
}
function editorFrame() {
	if (typeof window === "undefined") return null;
	const origin = editorOrigin();
	return origin ? {
		origin,
		dev: false
	} : null;
}
function previewTheme(theme) {
	if (theme.settings?.header_is_sticky === false) return theme;
	return {
		...theme,
		settings: {
			...theme.settings,
			header_is_sticky: false
		}
	};
}
function postToEditor(origin, action, data) {
	window.parent.postMessage({
		action,
		data,
		is_salla: true
	}, origin);
}
function areaOf(el) {
	if (el.closest("[role=\"dialog\"]")) return null;
	const marked = el.getAttribute(AREA_ATTRIBUTE);
	if (marked === "header" || marked === "footer") return marked;
	if (el.matches(AREA_FALLBACKS.header)) return "header";
	if (el.matches(AREA_FALLBACKS.footer)) return "footer";
	return null;
}
var TARGET_SELECTOR = [
	`[${BLOCK_ATTRIBUTE}]`,
	`[${AREA_ATTRIBUTE}="header"]`,
	`[${AREA_ATTRIBUTE}="footer"]`,
	AREA_FALLBACKS.header,
	AREA_FALLBACKS.footer
].join(", ");
function targetOf(node) {
	let el = node instanceof Element ? node.closest(TARGET_SELECTOR) : null;
	while (el) {
		if (el.hasAttribute("data-live-block") || areaOf(el)) return el;
		el = el.parentElement?.closest(TARGET_SELECTOR) ?? null;
	}
	return null;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-OUW6WESU.js
var RouteId = {
	INDEX: "index",
	CART: "cart",
	SEARCH: "product.index.search",
	PRODUCT_INDEX: "product.index",
	PRODUCT_INDEX_LATEST: "product.index.latest",
	PRODUCT_INDEX_SALES: "product.index.sales",
	PRODUCT_INDEX_OFFERS: "product.index.offers",
	PRODUCT_INDEX_TAG: "product.index.tag",
	PRODUCT_SINGLE: "product.single",
	BLOG_INDEX: "blog.index",
	BLOG_SINGLE: "blog.single",
	BLOG_INDEX_AUTHOR: "blog.index.author",
	BLOG_INDEX_CATEGORY: "blog.index.category",
	BLOG_INDEX_TAG: "blog.index.tag",
	BRANDS_INDEX: "brands.index",
	BRANDS_SINGLE: "brands.single",
	CUSTOMER_LAYOUT: "customer.layout",
	CUSTOMER_PROFILE: "customer.profile",
	CUSTOMER_WISHLIST: "customer.wishlist",
	CUSTOMER_WALLET: "customer.wallet",
	CUSTOMER_NOTIFICATIONS: "customer.notifications",
	CUSTOMER_SETTINGS: "customer.settings",
	CUSTOMER_ORDERS_INDEX: "customer.orders.index",
	CUSTOMER_ORDERS_INDEX_PENDING: "customer.orders.index.pending",
	CUSTOMER_ORDERS_SINGLE: "customer.orders.single",
	CUSTOMER_LOYALTY_POINTS: "customer.loyalty_points",
	LOGOUT: "logout",
	LOYALTY: "loyalty",
	PAGE_SINGLE: "page-single",
	TESTIMONIALS: "testimonials",
	REVIEWS: "reviews",
	THANK_YOU: "thank-you"
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-T72DAX7R.js
var SUPPORTED_LOCALES = [
	"ar",
	"bg",
	"bn",
	"cs",
	"da",
	"de",
	"el",
	"en",
	"es",
	"et",
	"fa",
	"fi",
	"fr",
	"ga",
	"he",
	"hi",
	"hr",
	"hu",
	"hy",
	"ind",
	"it",
	"ja",
	"ko",
	"lv",
	"ms",
	"mt",
	"nl",
	"pl",
	"pt",
	"ro",
	"ru",
	"sl",
	"sq",
	"sv",
	"tl",
	"tr",
	"uk",
	"ur",
	"zh"
];
function isLocale(value) {
	return SUPPORTED_LOCALES.includes(value);
}
var FALLBACK_LANGUAGE_NAME = "العربية";
var RTL_LOCALES = [
	"ar",
	"fa",
	"he",
	"ur"
];
var LANGUAGE_NAMES = {
	ar: "العربية",
	en: "English"
};
function getLanguageInfo(locale) {
	const isRtl = RTL_LOCALES.includes(locale);
	return {
		code: locale,
		name: LANGUAGE_NAMES[locale] || locale.toUpperCase(),
		dir: isRtl ? "rtl" : "ltr"
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-DGUM43GV.js
var __require = /* @__PURE__ */ ((x) => typeof __require$1 !== "undefined" ? __require$1 : typeof Proxy !== "undefined" ? new Proxy(x, { get: (a, b) => (typeof __require$1 !== "undefined" ? __require$1 : a)[b] }) : x)(function(x) {
	if (typeof __require$1 !== "undefined") return __require$1.apply(this, arguments);
	throw Error("Dynamic require of \"" + x + "\" is not supported");
});
//#endregion
//#region node_modules/.pnpm/i18next@26.4.7_typescript@6.0.3/node_modules/i18next/dist/esm/i18next.js
var isString$1 = (obj) => typeof obj === "string";
var defer = () => {
	let res;
	let rej;
	const promise = new Promise((resolve, reject) => {
		res = resolve;
		rej = reject;
	});
	promise.resolve = res;
	promise.reject = rej;
	return promise;
};
var makeString = (object) => {
	if (object == null) return "";
	return String(object);
};
var copy = (a, s, t) => {
	a.forEach((m) => {
		if (s[m]) t[m] = s[m];
	});
};
var lastOfPathSeparatorRegExp = /###/g;
var cleanKey = (key) => key && key.includes("###") ? key.replace(lastOfPathSeparatorRegExp, ".") : key;
var canNotTraverseDeeper = (object) => !object || isString$1(object);
var getLastOfPath = (object, path, Empty) => {
	const stack = !isString$1(path) ? path : path.split(".");
	let stackIndex = 0;
	while (stackIndex < stack.length - 1) {
		if (canNotTraverseDeeper(object)) return {};
		const key = cleanKey(stack[stackIndex]);
		if (!object[key] && Empty) object[key] = new Empty();
		if (Object.prototype.hasOwnProperty.call(object, key)) object = object[key];
		else object = {};
		++stackIndex;
	}
	if (canNotTraverseDeeper(object)) return {};
	return {
		obj: object,
		k: cleanKey(stack[stackIndex])
	};
};
var setPath = (object, path, newValue) => {
	const { obj, k } = getLastOfPath(object, path, Object);
	if (obj !== void 0 || path.length === 1) {
		obj[k] = newValue;
		return;
	}
	let e = path[path.length - 1];
	let p = path.slice(0, path.length - 1);
	let last = getLastOfPath(object, p, Object);
	while (last.obj === void 0 && p.length) {
		e = `${p[p.length - 1]}.${e}`;
		p = p.slice(0, p.length - 1);
		last = getLastOfPath(object, p, Object);
		if (last?.obj && typeof last.obj[`${last.k}.${e}`] !== "undefined") last.obj = void 0;
	}
	last.obj[`${last.k}.${e}`] = newValue;
};
var pushPath = (object, path, newValue, concat) => {
	const { obj, k } = getLastOfPath(object, path, Object);
	obj[k] = obj[k] || [];
	obj[k].push(newValue);
};
var getPath = (object, path) => {
	const { obj, k } = getLastOfPath(object, path);
	if (!obj) return void 0;
	if (!Object.prototype.hasOwnProperty.call(obj, k)) return void 0;
	return obj[k];
};
var getPathWithDefaults = (data, defaultData, key) => {
	const value = getPath(data, key);
	if (value !== void 0) return value;
	return getPath(defaultData, key);
};
var deepExtend = (target, source, overwrite) => {
	for (const prop in source) if (prop !== "__proto__" && prop !== "constructor") {
		if (Object.prototype.hasOwnProperty.call(target, prop)) {
			if (isString$1(target[prop]) || target[prop] instanceof String || isString$1(source[prop]) || source[prop] instanceof String) {
				if (overwrite) target[prop] = source[prop];
			} else deepExtend(target[prop], source[prop], overwrite);
		} else target[prop] = source[prop];
	}
	return target;
};
var regexEscape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var _entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;",
	"/": "&#x2F;"
};
var escape = (data) => {
	if (isString$1(data)) return data.replace(/[&<>"'\/]/g, (s) => _entityMap[s]);
	return data;
};
var RegExpCache = class {
	constructor(capacity) {
		this.capacity = capacity;
		this.regExpMap = /* @__PURE__ */ new Map();
		this.regExpQueue = [];
	}
	getRegExp(pattern) {
		const regExpFromCache = this.regExpMap.get(pattern);
		if (regExpFromCache !== void 0) return regExpFromCache;
		const regExpNew = new RegExp(pattern);
		if (this.regExpQueue.length === this.capacity) this.regExpMap.delete(this.regExpQueue.shift());
		this.regExpMap.set(pattern, regExpNew);
		this.regExpQueue.push(pattern);
		return regExpNew;
	}
};
var chars = [
	" ",
	",",
	"?",
	"!",
	";"
];
var looksLikeObjectPathRegExpCache = new RegExpCache(20);
var looksLikeObjectPath = (key, nsSeparator, keySeparator) => {
	nsSeparator = nsSeparator || "";
	keySeparator = keySeparator || "";
	const possibleChars = chars.filter((c) => !nsSeparator.includes(c) && !keySeparator.includes(c));
	if (possibleChars.length === 0) return true;
	const r = looksLikeObjectPathRegExpCache.getRegExp(`(${possibleChars.map((c) => c === "?" ? "\\?" : c).join("|")})`);
	let matched = !r.test(key);
	if (!matched) {
		const ki = key.indexOf(keySeparator);
		if (ki > 0 && !r.test(key.substring(0, ki))) matched = true;
	}
	return matched;
};
var deepFind = (obj, path, keySeparator = ".") => {
	if (!obj) return void 0;
	if (obj[path]) {
		if (!Object.prototype.hasOwnProperty.call(obj, path)) return void 0;
		return obj[path];
	}
	const tokens = path.split(keySeparator);
	let current = obj;
	for (let i = 0; i < tokens.length;) {
		if (!current || typeof current !== "object") return;
		let next;
		let nextPath = "";
		for (let j = i; j < tokens.length; ++j) {
			if (j !== i) nextPath += keySeparator;
			nextPath += tokens[j];
			next = current[nextPath];
			if (next !== void 0) {
				if ([
					"string",
					"number",
					"boolean"
				].includes(typeof next) && j < tokens.length - 1) continue;
				i += j - i + 1;
				break;
			}
		}
		current = next;
	}
	return current;
};
var getCleanedCode = (code) => code?.replace(/_/g, "-");
var consoleLogger = {
	type: "logger",
	log(args) {
		this.output("log", args);
	},
	warn(args) {
		this.output("warn", args);
	},
	error(args) {
		this.output("error", args);
	},
	output(type, args) {
		console?.[type]?.apply?.(console, args);
	}
};
var baseLogger = new class Logger {
	constructor(concreteLogger, options = {}) {
		this.init(concreteLogger, options);
	}
	init(concreteLogger, options = {}) {
		this.prefix = options.prefix || "i18next:";
		this.logger = concreteLogger || consoleLogger;
		this.options = options;
		this.debug = options.debug;
	}
	log(...args) {
		return this.forward(args, "log", "", true);
	}
	warn(...args) {
		return this.forward(args, "warn", "", true);
	}
	error(...args) {
		return this.forward(args, "error", "");
	}
	deprecate(...args) {
		return this.forward(args, "warn", "WARNING DEPRECATED: ", true);
	}
	forward(args, lvl, prefix, debugOnly) {
		if (debugOnly && !this.debug) return null;
		args = args.map((a) => isString$1(a) ? a.replace(/[\r\n\x00-\x1F\x7F]/g, " ") : a);
		if (isString$1(args[0])) args[0] = `${prefix}${this.prefix} ${args[0]}`;
		return this.logger[lvl](args);
	}
	create(moduleName) {
		return new Logger(this.logger, {
			prefix: `${this.prefix}:${moduleName}:`,
			...this.options
		});
	}
	clone(options) {
		options = options || this.options;
		options.prefix = options.prefix || this.prefix;
		return new Logger(this.logger, options);
	}
}();
var EventEmitter = class {
	constructor() {
		this.observers = {};
	}
	on(events, listener) {
		events.split(" ").forEach((event) => {
			if (!this.observers[event]) this.observers[event] = /* @__PURE__ */ new Map();
			const numListeners = this.observers[event].get(listener) || 0;
			this.observers[event].set(listener, numListeners + 1);
		});
		return this;
	}
	off(event, listener) {
		if (!this.observers[event]) return;
		if (!listener) {
			delete this.observers[event];
			return;
		}
		this.observers[event].delete(listener);
	}
	once(event, listener) {
		const wrapper = (...args) => {
			listener(...args);
			this.off(event, wrapper);
		};
		this.on(event, wrapper);
		return this;
	}
	emit(event, ...args) {
		if (this.observers[event]) Array.from(this.observers[event].entries()).forEach(([observer, numTimesAdded]) => {
			for (let i = 0; i < numTimesAdded; i++) observer(...args);
		});
		if (this.observers["*"]) Array.from(this.observers["*"].entries()).forEach(([observer, numTimesAdded]) => {
			for (let i = 0; i < numTimesAdded; i++) observer(event, ...args);
		});
	}
};
var nonEmptyBundles = /* @__PURE__ */ new WeakSet();
var ResourceStore = class extends EventEmitter {
	constructor(data, options = {
		ns: ["translation"],
		defaultNS: "translation"
	}) {
		super();
		this.data = data || {};
		this.options = options;
		if (this.options.keySeparator === void 0) this.options.keySeparator = ".";
		if (this.options.ignoreJSONStructure === void 0) this.options.ignoreJSONStructure = true;
	}
	addNamespaces(ns) {
		if (!this.options.ns.includes(ns)) this.options.ns.push(ns);
	}
	removeNamespaces(ns) {
		const index = this.options.ns.indexOf(ns);
		if (index > -1) this.options.ns.splice(index, 1);
	}
	getResource(lng, ns, key, options = {}) {
		const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
		const ignoreJSONStructure = options.ignoreJSONStructure !== void 0 ? options.ignoreJSONStructure : this.options.ignoreJSONStructure;
		let path;
		if (lng.includes(".")) path = lng.split(".");
		else {
			path = [lng, ns];
			if (key) {
				if (Array.isArray(key)) path.push(...key);
				else if (isString$1(key) && keySeparator) path.push(...key.split(keySeparator));
				else path.push(key);
			}
		}
		const result = getPath(this.data, path);
		if (!result && !ns && !key && lng.includes(".")) {
			lng = path[0];
			ns = path[1];
			key = path.slice(2).join(".");
		}
		if (result || !ignoreJSONStructure || !isString$1(key)) return result;
		return deepFind(this.data?.[lng]?.[ns], key, keySeparator);
	}
	addResource(lng, ns, key, value, options = { silent: false }) {
		const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
		let path = [lng, ns];
		if (key) path = path.concat(keySeparator ? key.split(keySeparator) : key);
		if (lng.includes(".")) {
			path = lng.split(".");
			value = ns;
			ns = path[1];
		}
		this.addNamespaces(ns);
		setPath(this.data, path, value);
		if (!options.silent) this.emit("added", lng, ns, key, value);
	}
	addResources(lng, ns, resources, options = { silent: false }) {
		for (const m in resources) if (isString$1(resources[m]) || Array.isArray(resources[m])) this.addResource(lng, ns, m, resources[m], { silent: true });
		if (!options.silent) this.emit("added", lng, ns, resources);
	}
	addResourceBundle(lng, ns, resources, deep, overwrite, options = {
		silent: false,
		skipCopy: false
	}) {
		let path = [lng, ns];
		if (lng.includes(".")) {
			path = lng.split(".");
			deep = resources;
			resources = ns;
			ns = path[1];
		}
		this.addNamespaces(ns);
		let pack = getPath(this.data, path) || {};
		if (!options.skipCopy) resources = JSON.parse(JSON.stringify(resources));
		if (deep) deepExtend(pack, resources, overwrite);
		else pack = {
			...pack,
			...resources
		};
		setPath(this.data, path, pack);
		if (!options.silent) this.emit("added", lng, ns, resources);
	}
	removeResourceBundle(lng, ns) {
		if (this.hasResourceBundle(lng, ns)) delete this.data[lng][ns];
		this.removeNamespaces(ns);
		this.emit("removed", lng, ns);
	}
	hasResourceBundle(lng, ns) {
		return this.getResource(lng, ns) !== void 0;
	}
	getResourceBundle(lng, ns) {
		if (!ns) ns = this.options.defaultNS;
		return this.getResource(lng, ns);
	}
	getDataByLanguage(lng) {
		return this.data[lng];
	}
	hasLanguageSomeTranslations(lng) {
		const data = this.getDataByLanguage(lng);
		return !!(data && Object.keys(data) || []).find((v) => {
			const bundle = data[v];
			if (nonEmptyBundles.has(bundle)) return true;
			if (!bundle || Object.keys(bundle).length === 0) return false;
			if (typeof bundle === "object") nonEmptyBundles.add(bundle);
			return true;
		});
	}
	toJSON() {
		return this.data;
	}
};
var postProcessor = {
	processors: {},
	addPostProcessor(module) {
		this.processors[module.name] = module;
	},
	handle(processors, value, key, options, translator) {
		processors.forEach((processor) => {
			value = this.processors[processor]?.process(value, key, options, translator) ?? value;
		});
		return value;
	}
};
var PATH_KEY = Symbol("i18next/PATH_KEY");
function createProxy() {
	const state = [];
	const handler = Object.create(null);
	let proxy;
	handler.get = (target, key) => {
		proxy?.revoke?.();
		if (key === PATH_KEY) return state;
		state.push(key);
		proxy = Proxy.revocable(target, handler);
		return proxy.proxy;
	};
	return Proxy.revocable(Object.create(null), handler).proxy;
}
function keysFromSelector(selector, opts) {
	const { [PATH_KEY]: path } = selector(createProxy());
	const keySeparator = opts?.keySeparator ?? ".";
	const nsSeparator = opts?.nsSeparator ?? ":";
	const strict = opts?.enableSelector === "strict";
	if (path.length > 1 && nsSeparator) {
		const ns = opts?.ns;
		const nsList = strict ? Array.isArray(ns) ? ns : ns ? [ns] : null : Array.isArray(ns) ? ns : null;
		if (nsList) {
			if ((strict ? nsList : nsList.length > 1 ? nsList.slice(1) : []).includes(path[0])) return `${path[0]}${nsSeparator}${path.slice(1).join(keySeparator)}`;
		}
	}
	return path.join(keySeparator);
}
var shouldHandleAsObject = (res) => !isString$1(res) && typeof res !== "boolean" && typeof res !== "number";
var Translator = class Translator extends EventEmitter {
	constructor(services, options = {}) {
		super();
		copy([
			"resourceStore",
			"languageUtils",
			"pluralResolver",
			"interpolator",
			"backendConnector",
			"i18nFormat",
			"utils"
		], services, this);
		this.options = options;
		if (this.options.keySeparator === void 0) this.options.keySeparator = ".";
		this.logger = baseLogger.create("translator");
		this.checkedLoadedFor = {};
	}
	changeLanguage(lng) {
		if (lng) this.language = lng;
	}
	exists(key, o = { interpolation: {} }) {
		const opt = { ...o };
		if (key == null) return false;
		const resolved = this.resolve(key, opt);
		if (resolved?.res === void 0) return false;
		const isObject = shouldHandleAsObject(resolved.res);
		if (opt.returnObjects === false && isObject) return false;
		return true;
	}
	extractFromKey(key, opt) {
		let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
		if (nsSeparator === void 0) nsSeparator = ":";
		const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
		let namespaces = opt.ns || this.options.defaultNS || [];
		const wouldCheckForNsInKey = nsSeparator && key.includes(nsSeparator);
		const seemsNaturalLanguage = !this.options.userDefinedKeySeparator && !opt.keySeparator && !this.options.userDefinedNsSeparator && !opt.nsSeparator && !looksLikeObjectPath(key, nsSeparator, keySeparator);
		if (wouldCheckForNsInKey && !seemsNaturalLanguage) {
			const m = key.match(this.interpolator.nestingRegexp);
			if (m && m.length > 0) return {
				key,
				namespaces: isString$1(namespaces) ? [namespaces] : namespaces
			};
			const parts = key.split(nsSeparator);
			if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.includes(parts[0])) namespaces = parts.shift();
			key = parts.join(keySeparator);
		}
		return {
			key,
			namespaces: isString$1(namespaces) ? [namespaces] : namespaces
		};
	}
	translate(keys, o, lastKey) {
		let opt = typeof o === "object" ? { ...o } : o;
		if (typeof opt !== "object" && this.options.overloadTranslationOptionHandler) opt = this.options.overloadTranslationOptionHandler(arguments);
		if (typeof opt === "object") opt = { ...opt };
		if (!opt) opt = {};
		if (keys == null) return "";
		if (typeof keys === "function") keys = keysFromSelector(keys, {
			...this.options,
			...opt
		});
		if (!Array.isArray(keys)) keys = [String(keys)];
		keys = keys.map((k) => typeof k === "function" ? keysFromSelector(k, {
			...this.options,
			...opt
		}) : String(k));
		const returnDetails = opt.returnDetails !== void 0 ? opt.returnDetails : this.options.returnDetails;
		const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
		const { key, namespaces } = this.extractFromKey(keys[keys.length - 1], opt);
		const namespace = namespaces[namespaces.length - 1];
		let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
		if (nsSeparator === void 0) nsSeparator = ":";
		const lng = opt.lng || this.language;
		const appendNamespaceToCIMode = opt.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
		if (lng?.toLowerCase() === "cimode") {
			if (appendNamespaceToCIMode) {
				if (returnDetails) return {
					res: `${namespace}${nsSeparator}${key}`,
					usedKey: key,
					exactUsedKey: key,
					usedLng: lng,
					usedNS: namespace,
					usedParams: this.getUsedParamsDetails(opt)
				};
				return `${namespace}${nsSeparator}${key}`;
			}
			if (returnDetails) return {
				res: key,
				usedKey: key,
				exactUsedKey: key,
				usedLng: lng,
				usedNS: namespace,
				usedParams: this.getUsedParamsDetails(opt)
			};
			return key;
		}
		const resolved = this.resolve(keys, opt);
		let res = resolved?.res;
		const resUsedKey = resolved?.usedKey || key;
		const resExactUsedKey = resolved?.exactUsedKey || key;
		const noObject = [
			"[object Number]",
			"[object Function]",
			"[object RegExp]"
		];
		const joinArrays = opt.joinArrays !== void 0 ? opt.joinArrays : this.options.joinArrays;
		const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
		const needsPluralHandling = opt.count !== void 0 && !isString$1(opt.count);
		const hasDefaultValue = Translator.hasDefaultValue(opt);
		const defaultValueSuffix = needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, opt) : "";
		const defaultValueSuffixOrdinalFallback = opt.ordinal && needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, { ordinal: false }) : "";
		const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
		const defaultValue = needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] || opt[`defaultValue${defaultValueSuffix}`] || opt[`defaultValue${defaultValueSuffixOrdinalFallback}`] || opt.defaultValue;
		let resForObjHndl = res;
		if (handleAsObjectInI18nFormat && !res && hasDefaultValue) resForObjHndl = defaultValue;
		const handleAsObject = shouldHandleAsObject(resForObjHndl);
		const resType = Object.prototype.toString.apply(resForObjHndl);
		if (handleAsObjectInI18nFormat && resForObjHndl && handleAsObject && !noObject.includes(resType) && !(isString$1(joinArrays) && Array.isArray(resForObjHndl))) {
			if (!opt.returnObjects && !this.options.returnObjects) {
				if (!this.options.returnedObjectHandler) this.logger.warn("accessing an object - but returnObjects options is not enabled!");
				const r = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, resForObjHndl, {
					...opt,
					ns: namespaces
				}) : `key '${key} (${this.language})' returned an object instead of string.`;
				if (returnDetails) {
					resolved.res = r;
					resolved.usedParams = this.getUsedParamsDetails(opt);
					return resolved;
				}
				return r;
			}
			if (keySeparator) {
				const resTypeIsArray = Array.isArray(resForObjHndl);
				const copy = resTypeIsArray ? [] : {};
				const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
				for (const m in resForObjHndl) if (Object.prototype.hasOwnProperty.call(resForObjHndl, m)) {
					const deepKey = `${newKeyToUse}${keySeparator}${m}`;
					if (hasDefaultValue && !res) copy[m] = this.translate(deepKey, {
						...opt,
						defaultValue: shouldHandleAsObject(defaultValue) ? defaultValue[m] : void 0,
						joinArrays: false,
						ns: namespaces
					});
					else copy[m] = this.translate(deepKey, {
						...opt,
						joinArrays: false,
						ns: namespaces
					});
					if (copy[m] === deepKey) copy[m] = resForObjHndl[m];
				}
				res = copy;
			}
		} else if (handleAsObjectInI18nFormat && isString$1(joinArrays) && Array.isArray(res)) {
			res = res.join(joinArrays);
			if (res) res = this.extendTranslation(res, keys, opt, lastKey);
		} else {
			let usedDefault = false;
			let usedKey = false;
			if (!this.isValidLookup(res) && hasDefaultValue) {
				usedDefault = true;
				res = defaultValue;
			}
			if (!this.isValidLookup(res)) {
				usedKey = true;
				res = key;
			}
			const resForMissing = (opt.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey) && usedKey ? void 0 : res;
			const updateMissing = hasDefaultValue && defaultValue !== res && this.options.updateMissing;
			if (usedKey || usedDefault || updateMissing) {
				this.logger.log(updateMissing ? "updateKey" : "missingKey", lng, namespace, needsPluralHandling && !updateMissing ? `${key}${this.pluralResolver.getSuffix(lng, opt.count, opt)}` : key, updateMissing ? defaultValue : res);
				if (keySeparator) {
					const fk = this.resolve(key, {
						...opt,
						keySeparator: false
					});
					if (fk && fk.res) this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
				}
				let lngs = [];
				const fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, opt.lng || this.language);
				if (this.options.saveMissingTo === "fallback" && fallbackLngs && fallbackLngs[0]) for (let i = 0; i < fallbackLngs.length; i++) lngs.push(fallbackLngs[i]);
				else if (this.options.saveMissingTo === "all") lngs = this.languageUtils.toResolveHierarchy(opt.lng || this.language);
				else lngs.push(opt.lng || this.language);
				const send = (l, k, specificDefaultValue) => {
					const defaultForMissing = hasDefaultValue && specificDefaultValue !== res ? specificDefaultValue : resForMissing;
					if (this.options.missingKeyHandler) this.options.missingKeyHandler(l, namespace, k, defaultForMissing, updateMissing, opt);
					else if (this.backendConnector?.saveMissing) this.backendConnector.saveMissing(l, namespace, k, defaultForMissing, updateMissing, opt);
					this.emit("missingKey", l, namespace, k, res);
				};
				if (this.options.saveMissing) {
					if (this.options.saveMissingPlurals && needsPluralHandling) lngs.forEach((language) => {
						const suffixes = this.pluralResolver.getSuffixes(language, opt);
						if (needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] && !suffixes.includes(`${this.options.pluralSeparator}zero`)) suffixes.push(`${this.options.pluralSeparator}zero`);
						suffixes.forEach((suffix) => {
							send([language], key + suffix, opt[`defaultValue${suffix}`] || defaultValue);
						});
					});
					else send(lngs, key, defaultValue);
				}
			}
			res = this.extendTranslation(res, keys, opt, resolved, lastKey);
			if (usedKey && res === key && this.options.appendNamespaceToMissingKey) res = `${namespace}${nsSeparator}${key}`;
			if ((usedKey || usedDefault) && this.options.parseMissingKeyHandler) res = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${namespace}${nsSeparator}${key}` : key, usedDefault ? res : void 0, opt);
		}
		if (returnDetails) {
			resolved.res = res;
			resolved.usedParams = this.getUsedParamsDetails(opt);
			return resolved;
		}
		return res;
	}
	extendTranslation(res, key, opt, resolved, lastKey) {
		if (this.i18nFormat?.parse) res = this.i18nFormat.parse(res, {
			...this.options.interpolation.defaultVariables,
			...opt
		}, opt.lng || this.language || resolved.usedLng, resolved.usedNS, resolved.usedKey, { resolved });
		else if (!opt.skipInterpolation) {
			if (opt.interpolation) this.interpolator.init({
				...opt,
				interpolation: {
					...this.options.interpolation,
					...opt.interpolation
				}
			});
			const skipOnVariables = isString$1(res) && (opt?.interpolation?.skipOnVariables !== void 0 ? opt.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
			let nestBef;
			if (skipOnVariables) {
				const nb = res.match(this.interpolator.nestingRegexp);
				nestBef = nb && nb.length;
			}
			let data = opt.replace && !isString$1(opt.replace) ? opt.replace : opt;
			if (this.options.interpolation.defaultVariables) data = {
				...this.options.interpolation.defaultVariables,
				...data
			};
			res = this.interpolator.interpolate(res, data, opt.lng || this.language || resolved.usedLng, opt);
			if (skipOnVariables) {
				const na = res.match(this.interpolator.nestingRegexp);
				const nestAft = na && na.length;
				if (nestBef < nestAft) opt.nest = false;
			}
			if (!opt.lng && resolved && resolved.res) opt.lng = this.language || resolved.usedLng;
			if (opt.nest !== false) res = this.interpolator.nest(res, (...args) => {
				if (lastKey?.[0] === args[0] && !opt.context) {
					this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
					return null;
				}
				return this.translate(...args, key);
			}, opt);
			if (opt.interpolation) this.interpolator.reset();
		}
		const postProcess = opt.postProcess || this.options.postProcess;
		const postProcessorNames = isString$1(postProcess) ? [postProcess] : postProcess;
		if (res != null && postProcessorNames?.length && opt.applyPostProcessor !== false) res = postProcessor.handle(postProcessorNames, res, key, this.options && this.options.postProcessPassResolved ? {
			i18nResolved: {
				...resolved,
				usedParams: this.getUsedParamsDetails(opt)
			},
			...opt
		} : opt, this);
		return res;
	}
	resolve(keys, opt = {}) {
		let found;
		let usedKey;
		let exactUsedKey;
		let usedLng;
		let usedNS;
		if (isString$1(keys)) keys = [keys];
		if (Array.isArray(keys)) keys = keys.map((k) => typeof k === "function" ? keysFromSelector(k, {
			...this.options,
			...opt
		}) : k);
		keys.forEach((k) => {
			if (this.isValidLookup(found)) return;
			const extracted = this.extractFromKey(k, opt);
			const key = extracted.key;
			usedKey = key;
			let namespaces = extracted.namespaces;
			if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);
			const needsPluralHandling = opt.count !== void 0 && !isString$1(opt.count);
			const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
			const needsContextHandling = opt.context !== void 0 && (isString$1(opt.context) || typeof opt.context === "number") && opt.context !== "";
			const codes = opt.lngs ? opt.lngs : this.languageUtils.toResolveHierarchy(opt.lng || this.language, opt.fallbackLng);
			namespaces.forEach((ns) => {
				if (this.isValidLookup(found)) return;
				usedNS = ns;
				if (!this.checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(usedNS)) {
					this.checkedLoadedFor[`${codes[0]}-${ns}`] = true;
					this.logger.warn(`key "${usedKey}" for languages "${codes.join(", ")}" won't get resolved as namespace "${usedNS}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
				}
				codes.forEach((code) => {
					if (this.isValidLookup(found)) return;
					usedLng = code;
					const finalKeys = [key];
					if (this.i18nFormat?.addLookupKeys) this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, opt);
					else {
						let pluralSuffix;
						if (needsPluralHandling) pluralSuffix = this.pluralResolver.getSuffix(code, opt.count, opt);
						const zeroSuffix = `${this.options.pluralSeparator}zero`;
						const ordinalPrefix = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
						if (needsPluralHandling) {
							if (opt.ordinal && pluralSuffix.startsWith(ordinalPrefix)) finalKeys.push(key + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
							finalKeys.push(key + pluralSuffix);
							if (needsZeroSuffixLookup) finalKeys.push(key + zeroSuffix);
						}
						if (needsContextHandling) {
							const contextKey = `${key}${this.options.contextSeparator || "_"}${opt.context}`;
							finalKeys.push(contextKey);
							if (needsPluralHandling) {
								if (opt.ordinal && pluralSuffix.startsWith(ordinalPrefix)) finalKeys.push(contextKey + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
								finalKeys.push(contextKey + pluralSuffix);
								if (needsZeroSuffixLookup) finalKeys.push(contextKey + zeroSuffix);
							}
						}
					}
					let possibleKey;
					while (possibleKey = finalKeys.pop()) if (!this.isValidLookup(found)) {
						exactUsedKey = possibleKey;
						found = this.getResource(code, ns, possibleKey, opt);
					}
				});
			});
		});
		return {
			res: found,
			usedKey,
			exactUsedKey,
			usedLng,
			usedNS
		};
	}
	isValidLookup(res) {
		return res !== void 0 && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === "");
	}
	getResource(code, ns, key, options = {}) {
		if (this.i18nFormat?.getResource) return this.i18nFormat.getResource(code, ns, key, options);
		return this.resourceStore.getResource(code, ns, key, options);
	}
	getUsedParamsDetails(options = {}) {
		const optionsKeys = [
			"defaultValue",
			"ordinal",
			"context",
			"replace",
			"lng",
			"lngs",
			"fallbackLng",
			"ns",
			"keySeparator",
			"nsSeparator",
			"returnObjects",
			"returnDetails",
			"joinArrays",
			"postProcess",
			"interpolation"
		];
		const useOptionsReplaceForData = options.replace && !isString$1(options.replace);
		let data = useOptionsReplaceForData ? options.replace : options;
		if (useOptionsReplaceForData && typeof options.count !== "undefined") data = {
			...data,
			count: options.count
		};
		if (this.options.interpolation.defaultVariables) data = {
			...this.options.interpolation.defaultVariables,
			...data
		};
		if (!useOptionsReplaceForData) {
			data = { ...data };
			for (const key of optionsKeys) delete data[key];
		}
		return data;
	}
	static hasDefaultValue(options) {
		const prefix = "defaultValue";
		for (const option in options) if (Object.prototype.hasOwnProperty.call(options, option) && option.startsWith(prefix) && void 0 !== options[option]) return true;
		return false;
	}
};
var LanguageUtil = class {
	constructor(options) {
		this.options = options;
		this.supportedLngs = this.options.supportedLngs || false;
		this.logger = baseLogger.create("languageUtils");
		this.resolveHierarchyCache = {};
	}
	clearCache() {
		this.resolveHierarchyCache = {};
	}
	getScriptPartFromCode(code) {
		code = getCleanedCode(code);
		if (!code || !code.includes("-")) return null;
		const p = code.split("-");
		if (p.length === 2) return null;
		p.pop();
		if (p[p.length - 1].toLowerCase() === "x") return null;
		return this.formatLanguageCode(p.join("-"));
	}
	getLanguagePartFromCode(code) {
		code = getCleanedCode(code);
		if (!code || !code.includes("-")) return code;
		const p = code.split("-");
		return this.formatLanguageCode(p[0]);
	}
	formatLanguageCode(code) {
		if (isString$1(code) && code.includes("-")) {
			let formattedCode;
			try {
				formattedCode = Intl.getCanonicalLocales(code)[0];
			} catch (e) {}
			if (formattedCode && this.options.lowerCaseLng) formattedCode = formattedCode.toLowerCase();
			if (formattedCode) return formattedCode;
			if (this.options.lowerCaseLng) return code.toLowerCase();
			return code;
		}
		return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
	}
	isSupportedCode(code) {
		if (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) code = this.getLanguagePartFromCode(code);
		return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.includes(code);
	}
	getBestMatchFromCodes(codes) {
		if (!codes) return null;
		let found;
		codes.forEach((code) => {
			if (found) return;
			const cleanedLng = this.formatLanguageCode(code);
			if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
		});
		if (!found && this.options.supportedLngs) codes.forEach((code) => {
			if (found) return;
			const lngScOnly = this.getScriptPartFromCode(code);
			if (this.isSupportedCode(lngScOnly)) return found = lngScOnly;
			const lngOnly = this.getLanguagePartFromCode(code);
			if (this.isSupportedCode(lngOnly)) return found = lngOnly;
			found = this.options.supportedLngs.find((supportedLng) => {
				if (supportedLng === lngOnly) return true;
				if (!supportedLng.includes("-") && !lngOnly.includes("-")) return false;
				if (supportedLng.includes("-") && !lngOnly.includes("-") && supportedLng.slice(0, supportedLng.indexOf("-")) === lngOnly) return true;
				if (supportedLng.startsWith(lngOnly) && lngOnly.length > 1) return true;
				return false;
			});
		});
		if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];
		return found;
	}
	getFallbackCodes(fallbacks, code) {
		if (!fallbacks) return [];
		if (typeof fallbacks === "function") fallbacks = fallbacks(code);
		if (isString$1(fallbacks)) fallbacks = [fallbacks];
		if (Array.isArray(fallbacks)) return fallbacks;
		if (!code) return fallbacks.default || [];
		let found = fallbacks[code];
		if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
		if (!found) found = fallbacks[this.formatLanguageCode(code)];
		if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
		if (!found) found = fallbacks.default;
		return found || [];
	}
	toResolveHierarchy(code, fallbackCode) {
		const fallbackLng = this.options.fallbackLng;
		const fallbackLngKey = Array.isArray(fallbackLng) ? fallbackLng.join("|") : fallbackLng;
		if (fallbackLngKey !== this._cachedFallbackLng) {
			this.resolveHierarchyCache = {};
			this._cachedFallbackLng = fallbackLngKey;
		}
		const hasCacheableFallback = fallbackCode === void 0 || fallbackCode === false || isString$1(fallbackCode);
		const usesUncacheableOptionsFallback = fallbackCode === void 0 && typeof this.options.fallbackLng === "function";
		const cacheable = isString$1(code) && hasCacheableFallback && !usesUncacheableOptionsFallback;
		let cacheKey = null;
		if (cacheable) {
			let fallbackCacheKey;
			if (fallbackCode === void 0) fallbackCacheKey = "undefined";
			else if (fallbackCode === false) fallbackCacheKey = "boolean:false";
			else fallbackCacheKey = `string:${fallbackCode}`;
			cacheKey = `${code.length}:${code}|${fallbackCacheKey}`;
		}
		if (cacheKey !== null) {
			const cached = this.resolveHierarchyCache[cacheKey];
			if (cached !== void 0) return cached.slice();
		}
		const fallbackCodes = this.getFallbackCodes((fallbackCode === false ? [] : fallbackCode) || this.options.fallbackLng || [], code);
		const codes = [];
		const addCode = (c) => {
			if (!c) return;
			if (this.isSupportedCode(c)) codes.push(c);
			else this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
		};
		if (isString$1(code) && (code.includes("-") || code.includes("_"))) {
			if (this.options.load !== "languageOnly") addCode(this.formatLanguageCode(code));
			if (this.options.load !== "languageOnly" && this.options.load !== "currentOnly") addCode(this.getScriptPartFromCode(code));
			if (this.options.load !== "currentOnly") addCode(this.getLanguagePartFromCode(code));
		} else if (isString$1(code)) addCode(this.formatLanguageCode(code));
		fallbackCodes.forEach((fc) => {
			const formattedFc = this.formatLanguageCode(fc);
			if (!codes.includes(formattedFc)) addCode(formattedFc);
		});
		if (cacheKey !== null) {
			this.resolveHierarchyCache[cacheKey] = codes;
			return codes.slice();
		}
		return codes;
	}
};
var suffixesOrder = {
	zero: 0,
	one: 1,
	two: 2,
	few: 3,
	many: 4,
	other: 5
};
var dummyRule = {
	select: (count) => count === 1 ? "one" : "other",
	resolvedOptions: () => ({ pluralCategories: ["one", "other"] })
};
var PluralResolver = class {
	constructor(languageUtils, options = {}) {
		this.languageUtils = languageUtils;
		this.options = options;
		this.logger = baseLogger.create("pluralResolver");
		this.pluralRulesCache = {};
	}
	clearCache() {
		this.pluralRulesCache = {};
	}
	getRule(code, options = {}) {
		const cleanedCode = getCleanedCode(code === "dev" ? "en" : code);
		const type = options.ordinal ? "ordinal" : "cardinal";
		const cacheKey = JSON.stringify({
			cleanedCode,
			type
		});
		if (cacheKey in this.pluralRulesCache) return this.pluralRulesCache[cacheKey];
		let rule;
		try {
			rule = new Intl.PluralRules(cleanedCode, { type });
		} catch (err) {
			if (typeof Intl === "undefined") {
				this.logger.error("No Intl support, please use an Intl polyfill!");
				return dummyRule;
			}
			if (!code.match(/-|_/)) return dummyRule;
			const lngPart = this.languageUtils.getLanguagePartFromCode(code);
			rule = this.getRule(lngPart, options);
		}
		this.pluralRulesCache[cacheKey] = rule;
		return rule;
	}
	needsPlural(code, options = {}) {
		let rule = this.getRule(code, options);
		if (!rule) rule = this.getRule("dev", options);
		return rule?.resolvedOptions().pluralCategories.length > 1;
	}
	getPluralFormsOfKey(code, key, options = {}) {
		return this.getSuffixes(code, options).map((suffix) => `${key}${suffix}`);
	}
	getSuffixes(code, options = {}) {
		let rule = this.getRule(code, options);
		if (!rule) rule = this.getRule("dev", options);
		if (!rule) return [];
		return rule.resolvedOptions().pluralCategories.sort((pluralCategory1, pluralCategory2) => suffixesOrder[pluralCategory1] - suffixesOrder[pluralCategory2]).map((pluralCategory) => `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${pluralCategory}`);
	}
	getSuffix(code, count, options = {}) {
		const rule = this.getRule(code, options);
		if (rule) return `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${rule.select(count)}`;
		this.logger.warn(`no plural rule found for: ${code}`);
		return this.getSuffix("dev", count, options);
	}
};
var deepFindWithDefaults = (data, defaultData, key, keySeparator = ".", ignoreJSONStructure = true) => {
	let path = getPathWithDefaults(data, defaultData, key);
	if (!path && ignoreJSONStructure && isString$1(key)) {
		path = deepFind(data, key, keySeparator);
		if (path === void 0) path = deepFind(defaultData, key, keySeparator);
	}
	return path;
};
var regexSafe = (val) => val.replace(/\$/g, "$$$$");
var Interpolator = class {
	constructor(options = {}) {
		this.logger = baseLogger.create("interpolator");
		this.options = options;
		this.format = options?.interpolation?.format || ((value) => value);
		this.init(options);
	}
	init(options = {}) {
		if (!options.interpolation) options.interpolation = { escapeValue: true };
		const { escape: escape$1, escapeValue, useRawValueToEscape, prefix, prefixEscaped, suffix, suffixEscaped, formatSeparator, unescapeSuffix, unescapePrefix, nestingPrefix, nestingPrefixEscaped, nestingSuffix, nestingSuffixEscaped, nestingOptionsSeparator, maxReplaces, alwaysFormat } = options.interpolation;
		this.escape = escape$1 !== void 0 ? escape$1 : escape;
		this.escapeValue = escapeValue !== void 0 ? escapeValue : true;
		this.useRawValueToEscape = useRawValueToEscape !== void 0 ? useRawValueToEscape : false;
		this.prefix = prefix ? regexEscape(prefix) : prefixEscaped || "{{";
		this.suffix = suffix ? regexEscape(suffix) : suffixEscaped || "}}";
		this.formatSeparator = formatSeparator || ",";
		this.unescapePrefix = unescapeSuffix ? "" : unescapePrefix ? regexEscape(unescapePrefix) : "-";
		this.unescapeSuffix = this.unescapePrefix ? "" : unescapeSuffix ? regexEscape(unescapeSuffix) : "";
		this.nestingPrefix = nestingPrefix ? regexEscape(nestingPrefix) : nestingPrefixEscaped || regexEscape("$t(");
		this.nestingSuffix = nestingSuffix ? regexEscape(nestingSuffix) : nestingSuffixEscaped || regexEscape(")");
		this.nestingOptionsSeparator = nestingOptionsSeparator || ",";
		this.maxReplaces = maxReplaces || 1e3;
		this.alwaysFormat = alwaysFormat !== void 0 ? alwaysFormat : false;
		this.resetRegExp();
	}
	reset() {
		if (this.options) this.init(this.options);
	}
	resetRegExp() {
		const getOrResetRegExp = (existingRegExp, pattern) => {
			if (existingRegExp?.source === pattern) {
				existingRegExp.lastIndex = 0;
				return existingRegExp;
			}
			return new RegExp(pattern, "g");
		};
		this.regexp = getOrResetRegExp(this.regexp, `${this.prefix}(.+?)${this.suffix}`);
		this.regexpUnescape = getOrResetRegExp(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`);
		this.nestingRegexp = getOrResetRegExp(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']|"[^"]*"|'[^']*'|\\((?:[^()"']|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`);
	}
	interpolate(str, data, lng, options) {
		let match;
		let value;
		let replaces;
		const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
		const handleFormat = (key) => {
			if (!key.includes(this.formatSeparator)) {
				const path = deepFindWithDefaults(data, defaultData, key, this.options.keySeparator, this.options.ignoreJSONStructure);
				return this.alwaysFormat ? this.format(path, void 0, lng, {
					...options,
					...data,
					interpolationkey: key
				}) : path;
			}
			const p = key.split(this.formatSeparator);
			const k = p.shift().trim();
			const f = p.join(this.formatSeparator).trim();
			return this.format(deepFindWithDefaults(data, defaultData, k, this.options.keySeparator, this.options.ignoreJSONStructure), f, lng, {
				...options,
				...data,
				interpolationkey: k
			});
		};
		this.resetRegExp();
		if (!this.escapeValue && typeof str === "string" && /\$t\([^)]*\{[^}]*\{\{/.test(str)) this.logger.warn("nesting options string contains interpolated variables with escapeValue: false — if any of those values are attacker-controlled they can inject additional nesting options (e.g. redirect lng/ns). Sanitise untrusted input before passing it to t(), or keep escapeValue: true.");
		const missingInterpolationHandler = options?.missingInterpolationHandler || this.options.missingInterpolationHandler;
		const skipOnVariables = options?.interpolation?.skipOnVariables !== void 0 ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
		[{
			regex: this.regexpUnescape,
			safeValue: (val) => val
		}, {
			regex: this.regexp,
			safeValue: (val) => this.escapeValue ? this.escape(val) : val
		}].forEach((todo) => {
			replaces = 0;
			while (match = todo.regex.exec(str)) {
				const matchedVar = match[1].trim();
				value = handleFormat(matchedVar);
				if (value === void 0) {
					if (typeof missingInterpolationHandler === "function") {
						const temp = missingInterpolationHandler(str, match, options);
						value = isString$1(temp) ? temp : "";
					} else if (options && Object.prototype.hasOwnProperty.call(options, matchedVar)) value = "";
					else if (skipOnVariables) {
						value = match[0];
						continue;
					} else {
						this.logger.warn(`missed to pass in variable ${matchedVar} for interpolating ${str}`);
						value = "";
					}
				} else if (!isString$1(value) && !this.useRawValueToEscape) value = makeString(value);
				const safeValue = todo.safeValue(value);
				str = str.replace(match[0], regexSafe(safeValue));
				if (skipOnVariables) {
					todo.regex.lastIndex += safeValue.length;
					todo.regex.lastIndex -= match[0].length;
				} else todo.regex.lastIndex = 0;
				replaces++;
				if (replaces >= this.maxReplaces) break;
			}
		});
		return str;
	}
	nest(str, fc, options = {}) {
		let match;
		let value;
		let clonedOptions;
		const handleHasOptions = (key, inheritedOptions) => {
			const sep = this.nestingOptionsSeparator;
			if (!key.includes(sep)) return key;
			const c = key.split(new RegExp(`${regexEscape(sep)}[ ]*{`));
			let optionsString = `{${c[1]}`;
			key = c[0];
			optionsString = this.interpolate(optionsString, clonedOptions);
			const matchedSingleQuotes = optionsString.match(/'/g);
			const matchedDoubleQuotes = optionsString.match(/"/g);
			if ((matchedSingleQuotes?.length ?? 0) % 2 === 0 && !matchedDoubleQuotes || (matchedDoubleQuotes?.length ?? 0) % 2 !== 0) optionsString = optionsString.replace(/'/g, "\"");
			try {
				clonedOptions = JSON.parse(optionsString);
				if (inheritedOptions) clonedOptions = {
					...inheritedOptions,
					...clonedOptions
				};
			} catch (e) {
				this.logger.warn(`failed parsing options string in nesting for key ${key}`, e);
				return `${key}${sep}${optionsString}`;
			}
			if (clonedOptions.defaultValue && clonedOptions.defaultValue.includes(this.prefix)) delete clonedOptions.defaultValue;
			return key;
		};
		const nestingRegexp = new RegExp(this.nestingRegexp);
		let out = "";
		let lastEnd = 0;
		while (match = nestingRegexp.exec(str)) {
			let formatters = [];
			clonedOptions = { ...options };
			clonedOptions = clonedOptions.replace && !isString$1(clonedOptions.replace) ? clonedOptions.replace : clonedOptions;
			clonedOptions.applyPostProcessor = false;
			delete clonedOptions.defaultValue;
			const keyEndIndex = /{.*}/s.test(match[1]) ? match[1].lastIndexOf("}") + 1 : match[1].indexOf(this.formatSeparator);
			if (keyEndIndex !== -1) {
				formatters = match[1].slice(keyEndIndex).split(this.formatSeparator).map((elem) => elem.trim()).filter(Boolean);
				match[1] = match[1].slice(0, keyEndIndex);
			}
			value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
			if (value && match[0] === str && !isString$1(value)) return value;
			if (!isString$1(value)) value = makeString(value);
			if (!value) {
				this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
				value = "";
			}
			if (formatters.length) value = formatters.reduce((v, f) => this.format(v, f, options.lng, {
				...options,
				interpolationkey: match[1].trim()
			}), value.trim());
			out += str.slice(lastEnd, match.index) + makeString(value);
			lastEnd = nestingRegexp.lastIndex;
			this.regexp.lastIndex = 0;
		}
		return lastEnd ? out + str.slice(lastEnd) : str;
	}
};
var parseFormatStr = (formatStr) => {
	let formatName = formatStr.toLowerCase().trim();
	const formatOptions = {};
	if (formatStr.includes("(")) {
		const p = formatStr.split("(");
		formatName = p[0].toLowerCase().trim();
		const optStr = p[1].slice(0, -1);
		if (formatName === "currency" && !optStr.includes(":")) {
			if (!formatOptions.currency) formatOptions.currency = optStr.trim();
		} else if (formatName === "relativetime" && !optStr.includes(":")) {
			if (!formatOptions.range) formatOptions.range = optStr.trim();
		} else optStr.split(";").forEach((opt) => {
			if (opt) {
				const [key, ...rest] = opt.split(":");
				const val = rest.join(":").trim().replace(/^'+|'+$/g, "");
				const trimmedKey = key.trim();
				if (!formatOptions[trimmedKey]) formatOptions[trimmedKey] = val;
				if (val === "false") formatOptions[trimmedKey] = false;
				if (val === "true") formatOptions[trimmedKey] = true;
				if (!isNaN(val)) formatOptions[trimmedKey] = parseInt(val, 10);
			}
		});
	}
	return {
		formatName,
		formatOptions
	};
};
var createCachedFormatter = (fn) => {
	const cache = {};
	return (v, l, o) => {
		let optForCache = o;
		if (o && o.interpolationkey && o.formatParams && o.formatParams[o.interpolationkey] && o[o.interpolationkey]) optForCache = {
			...optForCache,
			[o.interpolationkey]: void 0
		};
		const key = l + JSON.stringify(optForCache);
		let frm = cache[key];
		if (!frm) {
			frm = fn(getCleanedCode(l), o);
			cache[key] = frm;
		}
		return frm(v);
	};
};
var createNonCachedFormatter = (fn) => (v, l, o) => fn(getCleanedCode(l), o)(v);
var Formatter = class {
	constructor(options = {}) {
		this.logger = baseLogger.create("formatter");
		this.options = options;
		this.init(options);
	}
	init(services, options = { interpolation: {} }) {
		this.formatSeparator = options.interpolation.formatSeparator || ",";
		const cf = options.cacheInBuiltFormats ? createCachedFormatter : createNonCachedFormatter;
		this.formats = {
			number: cf((lng, opt) => {
				const formatter = new Intl.NumberFormat(lng, { ...opt });
				return (val) => formatter.format(val);
			}),
			currency: cf((lng, opt) => {
				const formatter = new Intl.NumberFormat(lng, {
					...opt,
					style: "currency"
				});
				return (val) => formatter.format(val);
			}),
			datetime: cf((lng, opt) => {
				const formatter = new Intl.DateTimeFormat(lng, { ...opt });
				return (val) => formatter.format(val);
			}),
			relativetime: cf((lng, opt) => {
				const formatter = new Intl.RelativeTimeFormat(lng, { ...opt });
				return (val) => formatter.format(val, opt.range || "day");
			}),
			list: cf((lng, opt) => {
				const formatter = new Intl.ListFormat(lng, { ...opt });
				return (val) => formatter.format(val);
			})
		};
	}
	add(name, fc) {
		this.formats[name.toLowerCase().trim()] = fc;
	}
	addCached(name, fc) {
		this.formats[name.toLowerCase().trim()] = createCachedFormatter(fc);
	}
	format(value, format, lng, options = {}) {
		if (!format) return value;
		if (value == null) return value;
		const rawFormats = format.split(this.formatSeparator);
		const formats = [];
		for (let i = 0; i < rawFormats.length; i++) {
			let f = rawFormats[i];
			while (f.indexOf("(") > -1 && !f.includes(")") && i + 1 < rawFormats.length) f = `${f}${this.formatSeparator}${rawFormats[++i]}`;
			formats.push(f);
		}
		return formats.reduce((mem, f) => {
			const { formatName, formatOptions } = parseFormatStr(f);
			if (this.formats[formatName]) {
				let formatted = mem;
				try {
					const valOptions = options?.formatParams?.[options.interpolationkey] || {};
					const l = valOptions.locale || valOptions.lng || options.locale || options.lng || lng;
					formatted = this.formats[formatName](mem, l, {
						...formatOptions,
						...options,
						...valOptions
					});
				} catch (error) {
					this.logger.warn(error);
				}
				return formatted;
			} else this.logger.warn(`there was no format function for ${formatName}`);
			return mem;
		}, value);
	}
};
var removePending = (q, name) => {
	if (q.pending[name] !== void 0) {
		delete q.pending[name];
		q.pendingCount--;
	}
};
var Connector = class extends EventEmitter {
	constructor(backend, store, services, options = {}) {
		super();
		this.backend = backend;
		this.store = store;
		this.services = services;
		this.languageUtils = services.languageUtils;
		this.options = options;
		this.logger = baseLogger.create("backendConnector");
		this.waitingReads = [];
		this.maxParallelReads = options.maxParallelReads || 10;
		this.readingCalls = 0;
		this.maxRetries = options.maxRetries >= 0 ? options.maxRetries : 5;
		this.retryTimeout = options.retryTimeout >= 1 ? options.retryTimeout : 350;
		this.state = {};
		this.queue = [];
		this.backend?.init?.(services, options.backend, options);
	}
	queueLoad(languages, namespaces, options, callback) {
		const toLoad = {};
		const pending = {};
		const toLoadLanguages = {};
		const toLoadNamespaces = {};
		languages.forEach((lng) => {
			let hasAllNamespaces = true;
			namespaces.forEach((ns) => {
				const name = `${lng}|${ns}`;
				if (!options.reload && this.store.hasResourceBundle(lng, ns)) this.state[name] = 2;
				else if (this.state[name] < 0);
				else if (this.state[name] === 1) {
					if (pending[name] === void 0) pending[name] = true;
				} else {
					this.state[name] = 1;
					hasAllNamespaces = false;
					if (pending[name] === void 0) pending[name] = true;
					if (toLoad[name] === void 0) toLoad[name] = true;
					if (toLoadNamespaces[ns] === void 0) toLoadNamespaces[ns] = true;
				}
			});
			if (!hasAllNamespaces) toLoadLanguages[lng] = true;
		});
		if (Object.keys(toLoad).length || Object.keys(pending).length) this.queue.push({
			pending,
			pendingCount: Object.keys(pending).length,
			loaded: {},
			errors: [],
			callback
		});
		return {
			toLoad: Object.keys(toLoad),
			pending: Object.keys(pending),
			toLoadLanguages: Object.keys(toLoadLanguages),
			toLoadNamespaces: Object.keys(toLoadNamespaces)
		};
	}
	loaded(name, err, data) {
		const s = name.split("|");
		const lng = s[0];
		const ns = s[1];
		if (err) this.emit("failedLoading", lng, ns, err);
		if (!err && data) this.store.addResourceBundle(lng, ns, data, void 0, void 0, { skipCopy: true });
		this.state[name] = err ? -1 : 2;
		if (err && data) this.state[name] = 0;
		const loaded = {};
		this.queue.forEach((q) => {
			pushPath(q.loaded, [lng], ns);
			removePending(q, name);
			if (err) q.errors.push(err);
			if (q.pendingCount === 0 && !q.done) {
				Object.keys(q.loaded).forEach((l) => {
					if (!loaded[l]) loaded[l] = {};
					const loadedKeys = q.loaded[l];
					if (loadedKeys.length) loadedKeys.forEach((n) => {
						if (loaded[l][n] === void 0) loaded[l][n] = true;
					});
				});
				q.done = true;
				if (q.errors.length) q.callback(q.errors);
				else q.callback();
			}
		});
		this.emit("loaded", loaded);
		this.queue = this.queue.filter((q) => !q.done);
	}
	read(lng, ns, fcName, tried = 0, wait = this.retryTimeout, callback) {
		if (!lng.length) return callback(null, {});
		if (this.readingCalls >= this.maxParallelReads) {
			this.waitingReads.push({
				lng,
				ns,
				fcName,
				tried,
				wait,
				callback
			});
			return;
		}
		this.readingCalls++;
		const resolver = (err, data) => {
			this.readingCalls--;
			if (this.waitingReads.length > 0) {
				const next = this.waitingReads.shift();
				this.read(next.lng, next.ns, next.fcName, next.tried, next.wait, next.callback);
			}
			if (err && data && tried < this.maxRetries) {
				setTimeout(() => {
					this.read(lng, ns, fcName, tried + 1, wait * 2, callback);
				}, wait);
				return;
			}
			callback(err, data);
		};
		const fc = this.backend[fcName].bind(this.backend);
		if (fc.length === 2) {
			try {
				const r = fc(lng, ns);
				if (r && typeof r.then === "function") r.then((data) => resolver(null, data)).catch(resolver);
				else resolver(null, r);
			} catch (err) {
				resolver(err);
			}
			return;
		}
		return fc(lng, ns, resolver);
	}
	prepareLoading(languages, namespaces, options = {}, callback) {
		if (!this.backend) {
			this.logger.warn("No backend was added via i18next.use. Will not load resources.");
			return callback && callback();
		}
		if (isString$1(languages)) languages = this.languageUtils.toResolveHierarchy(languages);
		if (isString$1(namespaces)) namespaces = [namespaces];
		const toLoad = this.queueLoad(languages, namespaces, options, callback);
		if (!toLoad.toLoad.length) {
			if (!toLoad.pending.length) callback();
			return null;
		}
		toLoad.toLoad.forEach((name) => {
			this.loadOne(name);
		});
	}
	load(languages, namespaces, callback) {
		this.prepareLoading(languages, namespaces, {}, callback);
	}
	reload(languages, namespaces, callback) {
		this.prepareLoading(languages, namespaces, { reload: true }, callback);
	}
	loadOne(name, prefix = "") {
		const s = name.split("|");
		const lng = s[0];
		const ns = s[1];
		this.read(lng, ns, "read", void 0, void 0, (err, data) => {
			if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
			if (!err && data) this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
			this.loaded(name, err, data);
		});
	}
	saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}, clb = () => {}) {
		if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(namespace)) {
			this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
			return;
		}
		if (key === void 0 || key === null || key === "") return;
		if (this.backend?.create) {
			const opts = {
				...options,
				isUpdate
			};
			const fc = this.backend.create.bind(this.backend);
			if (fc.length < 6) try {
				let r;
				if (fc.length === 5) r = fc(languages, namespace, key, fallbackValue, opts);
				else r = fc(languages, namespace, key, fallbackValue);
				if (r && typeof r.then === "function") r.then((data) => clb(null, data)).catch(clb);
				else clb(null, r);
			} catch (err) {
				clb(err);
			}
			else fc(languages, namespace, key, fallbackValue, clb, opts);
		}
		if (!languages || !languages[0]) return;
		this.store.addResource(languages[0], namespace, key, fallbackValue);
	}
};
var get = () => ({
	debug: false,
	initAsync: true,
	ns: ["translation"],
	defaultNS: ["translation"],
	fallbackLng: ["dev"],
	fallbackNS: false,
	supportedLngs: false,
	nonExplicitSupportedLngs: false,
	load: "all",
	preload: false,
	keySeparator: ".",
	nsSeparator: ":",
	pluralSeparator: "_",
	contextSeparator: "_",
	enableSelector: false,
	partialBundledLanguages: false,
	saveMissing: false,
	updateMissing: false,
	saveMissingTo: "fallback",
	saveMissingPlurals: true,
	missingKeyHandler: false,
	missingInterpolationHandler: false,
	postProcess: false,
	postProcessPassResolved: false,
	returnNull: false,
	returnEmptyString: true,
	returnObjects: false,
	joinArrays: false,
	returnedObjectHandler: false,
	parseMissingKeyHandler: false,
	appendNamespaceToMissingKey: false,
	appendNamespaceToCIMode: false,
	overloadTranslationOptionHandler: (args) => {
		let ret = {};
		if (typeof args[1] === "object") ret = args[1];
		if (isString$1(args[1])) ret.defaultValue = args[1];
		if (isString$1(args[2])) ret.tDescription = args[2];
		if (typeof args[2] === "object" || typeof args[3] === "object") {
			const options = args[3] || args[2];
			Object.keys(options).forEach((key) => {
				ret[key] = options[key];
			});
		}
		return ret;
	},
	interpolation: {
		escapeValue: true,
		prefix: "{{",
		suffix: "}}",
		formatSeparator: ",",
		unescapePrefix: "-",
		nestingPrefix: "$t(",
		nestingSuffix: ")",
		nestingOptionsSeparator: ",",
		maxReplaces: 1e3,
		skipOnVariables: true
	},
	cacheInBuiltFormats: true
});
var transformOptions = (options) => {
	if (isString$1(options.ns)) options.ns = [options.ns];
	if (isString$1(options.fallbackLng)) options.fallbackLng = [options.fallbackLng];
	if (isString$1(options.fallbackNS)) options.fallbackNS = [options.fallbackNS];
	if (options.supportedLngs && !options.supportedLngs.includes("cimode")) options.supportedLngs = options.supportedLngs.concat(["cimode"]);
	return options;
};
var noop$2 = () => {};
var bindMemberFunctions = (inst) => {
	Object.getOwnPropertyNames(Object.getPrototypeOf(inst)).forEach((mem) => {
		if (typeof inst[mem] === "function") inst[mem] = inst[mem].bind(inst);
	});
};
var instance = class I18n extends EventEmitter {
	constructor(options = {}, callback) {
		super();
		this.options = transformOptions(options);
		this.services = {};
		this.logger = baseLogger;
		this.modules = { external: [] };
		bindMemberFunctions(this);
		if (callback && !this.isInitialized && !options.isClone) {
			if (!this.options.initAsync) {
				this.init(options, callback);
				return this;
			}
			setTimeout(() => {
				this.init(options, callback);
			}, 0);
		}
	}
	init(options = {}, callback) {
		this.isInitializing = true;
		if (typeof options === "function") {
			callback = options;
			options = {};
		}
		if (options.defaultNS == null && options.ns) {
			if (isString$1(options.ns)) options.defaultNS = options.ns;
			else if (!options.ns.includes("translation")) options.defaultNS = options.ns[0];
		}
		const defOpts = get();
		this.options = {
			...defOpts,
			...this.options,
			...transformOptions(options)
		};
		this.options.interpolation = {
			...defOpts.interpolation,
			...this.options.interpolation
		};
		if (options.keySeparator !== void 0) this.options.userDefinedKeySeparator = options.keySeparator;
		if (options.nsSeparator !== void 0) this.options.userDefinedNsSeparator = options.nsSeparator;
		if (typeof this.options.overloadTranslationOptionHandler !== "function") this.options.overloadTranslationOptionHandler = defOpts.overloadTranslationOptionHandler;
		const createClassOnDemand = (ClassOrObject) => {
			if (!ClassOrObject) return null;
			if (typeof ClassOrObject === "function") return new ClassOrObject();
			return ClassOrObject;
		};
		if (!this.options.isClone) {
			if (this.modules.logger) baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
			else baseLogger.init(null, this.options);
			let formatter;
			if (this.modules.formatter) formatter = this.modules.formatter;
			else formatter = Formatter;
			const lu = new LanguageUtil(this.options);
			this.store = new ResourceStore(this.options.resources, this.options);
			const s = this.services;
			s.logger = baseLogger;
			s.resourceStore = this.store;
			s.languageUtils = lu;
			s.pluralResolver = new PluralResolver(lu, { prepend: this.options.pluralSeparator });
			if (formatter) {
				s.formatter = createClassOnDemand(formatter);
				if (s.formatter.init) s.formatter.init(s, this.options);
				this.options.interpolation.format = s.formatter.format.bind(s.formatter);
			}
			s.interpolator = new Interpolator(this.options);
			s.utils = { hasLoadedNamespace: this.hasLoadedNamespace.bind(this) };
			s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
			s.backendConnector.on("*", (event, ...args) => {
				this.emit(event, ...args);
			});
			if (this.modules.languageDetector) {
				s.languageDetector = createClassOnDemand(this.modules.languageDetector);
				if (s.languageDetector.init) s.languageDetector.init(s, this.options.detection, this.options);
			}
			if (this.modules.i18nFormat) {
				s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
				if (s.i18nFormat.init) s.i18nFormat.init(this);
			}
			this.translator = new Translator(this.services, this.options);
			this.translator.on("*", (event, ...args) => {
				this.emit(event, ...args);
			});
			this.modules.external.forEach((m) => {
				if (m.init) m.init(this);
			});
		}
		this.format = this.options.interpolation.format;
		if (!callback) callback = noop$2;
		if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
			const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
			if (codes.length > 0 && codes[0] !== "dev") this.options.lng = codes[0];
		}
		if (!this.services.languageDetector && !this.options.lng) this.logger.warn("init: no languageDetector is used and no lng is defined");
		[
			"getResource",
			"hasResourceBundle",
			"getResourceBundle",
			"getDataByLanguage"
		].forEach((fcName) => {
			this[fcName] = (...args) => this.store[fcName](...args);
		});
		[
			"addResource",
			"addResources",
			"addResourceBundle",
			"removeResourceBundle"
		].forEach((fcName) => {
			this[fcName] = (...args) => {
				this.store[fcName](...args);
				return this;
			};
		});
		const deferred = defer();
		const load = () => {
			const finish = (err, t) => {
				this.isInitializing = false;
				if (this.isInitialized && !this.initializedStoreOnce) this.logger.warn("init: i18next is already initialized. You should call init just once!");
				this.isInitialized = true;
				if (!this.options.isClone) this.logger.log("initialized", this.options);
				this.emit("initialized", this.options);
				deferred.resolve(t);
				callback(err, t);
			};
			if ((this.languages || this.isLanguageChangingTo) && !this.isInitialized) return finish(null, this.t.bind(this));
			this.changeLanguage(this.options.lng, finish);
		};
		if (this.options.resources || !this.options.initAsync) load();
		else setTimeout(load, 0);
		return deferred;
	}
	loadResources(language, callback = noop$2) {
		let usedCallback = callback;
		const usedLng = isString$1(language) ? language : this.language;
		if (typeof language === "function") usedCallback = language;
		if (!this.options.resources || this.options.partialBundledLanguages) {
			if (usedLng?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0)) return usedCallback();
			const toLoad = [];
			const append = (lng) => {
				if (!lng) return;
				if (lng === "cimode") return;
				this.services.languageUtils.toResolveHierarchy(lng).forEach((l) => {
					if (l === "cimode") return;
					if (!toLoad.includes(l)) toLoad.push(l);
				});
			};
			if (!usedLng) this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach((l) => append(l));
			else append(usedLng);
			this.options.preload?.forEach?.((l) => append(l));
			this.services.backendConnector.load(toLoad, this.options.ns, (e) => {
				if (!e && !this.resolvedLanguage && this.language) this.setResolvedLanguage(this.language);
				usedCallback(e);
			});
		} else usedCallback(null);
	}
	reloadResources(lngs, ns, callback) {
		const deferred = defer();
		if (typeof lngs === "function") {
			callback = lngs;
			lngs = void 0;
		}
		if (typeof ns === "function") {
			callback = ns;
			ns = void 0;
		}
		if (!lngs) lngs = this.languages;
		if (!ns) ns = this.options.ns;
		if (!callback) callback = noop$2;
		this.services.backendConnector.reload(lngs, ns, (err) => {
			deferred.resolve();
			callback(err);
		});
		return deferred;
	}
	use(module) {
		if (!module) throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
		if (!module.type) throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
		if (module.type === "backend") this.modules.backend = module;
		if (module.type === "logger" || module.log && module.warn && module.error) this.modules.logger = module;
		if (module.type === "languageDetector") this.modules.languageDetector = module;
		if (module.type === "i18nFormat") this.modules.i18nFormat = module;
		if (module.type === "postProcessor") postProcessor.addPostProcessor(module);
		if (module.type === "formatter") this.modules.formatter = module;
		if (module.type === "3rdParty") this.modules.external.push(module);
		return this;
	}
	setResolvedLanguage(l) {
		if (!l || !this.languages) return;
		if (["cimode", "dev"].includes(l)) return;
		for (let li = 0; li < this.languages.length; li++) {
			const lngInLngs = this.languages[li];
			if (["cimode", "dev"].includes(lngInLngs)) continue;
			if (this.store.hasLanguageSomeTranslations(lngInLngs)) {
				this.resolvedLanguage = lngInLngs;
				break;
			}
		}
		if (!this.resolvedLanguage && !this.languages.includes(l) && this.store.hasLanguageSomeTranslations(l)) {
			this.resolvedLanguage = l;
			this.languages.unshift(l);
		}
	}
	changeLanguage(lng, callback) {
		this.isLanguageChangingTo = lng;
		const deferred = defer();
		this.emit("languageChanging", lng);
		const setLngProps = (l) => {
			this.language = l;
			this.languages = this.services.languageUtils.toResolveHierarchy(l);
			this.resolvedLanguage = void 0;
			this.setResolvedLanguage(l);
		};
		const done = (err, l) => {
			if (l) {
				if (this.isLanguageChangingTo === lng) {
					setLngProps(l);
					this.translator.changeLanguage(l);
					this.isLanguageChangingTo = void 0;
					this.emit("languageChanged", l);
					this.logger.log("languageChanged", l);
				}
			} else this.isLanguageChangingTo = void 0;
			deferred.resolve((...args) => this.t(...args));
			if (callback) callback(err, (...args) => this.t(...args));
		};
		const setLng = (lngs) => {
			if (!lng && !lngs && this.services.languageDetector) lngs = [];
			const fl = isString$1(lngs) ? lngs : lngs && lngs[0];
			const l = this.store.hasLanguageSomeTranslations(fl) ? fl : this.services.languageUtils.getBestMatchFromCodes(isString$1(lngs) ? [lngs] : lngs);
			if (l) {
				if (!this.language) setLngProps(l);
				if (!this.translator.language) this.translator.changeLanguage(l);
				this.services.languageDetector?.cacheUserLanguage?.(l);
			}
			this.loadResources(l, (err) => {
				done(err, l);
			});
		};
		if (!lng && this.services.languageDetector && !this.services.languageDetector.async) setLng(this.services.languageDetector.detect());
		else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
			if (this.services.languageDetector.detect.length === 0) this.services.languageDetector.detect().then(setLng);
			else this.services.languageDetector.detect(setLng);
		} else setLng(lng);
		return deferred;
	}
	getFixedT(lng, ns, keyPrefix, fixedOpts) {
		const scopeNs = fixedOpts?.scopeNs;
		const fixedT = (key, opts, ...rest) => {
			let o;
			if (typeof opts !== "object") o = this.options.overloadTranslationOptionHandler([key, opts].concat(rest));
			else o = { ...opts };
			o.lng = o.lng || fixedT.lng;
			o.lngs = o.lngs || fixedT.lngs;
			const explicitCallNs = o.ns !== void 0 && o.ns !== null;
			o.ns = o.ns || fixedT.ns;
			if (o.keyPrefix !== "") o.keyPrefix = o.keyPrefix || keyPrefix || fixedT.keyPrefix;
			const selectorOpts = {
				...this.options,
				...o
			};
			if (Array.isArray(scopeNs) && !explicitCallNs) selectorOpts.ns = scopeNs;
			if (typeof o.keyPrefix === "function") o.keyPrefix = keysFromSelector(o.keyPrefix, selectorOpts);
			const keySeparator = this.options.keySeparator || ".";
			let resultKey;
			if (o.keyPrefix && Array.isArray(key)) resultKey = key.map((k) => {
				if (typeof k === "function") k = keysFromSelector(k, selectorOpts);
				return `${o.keyPrefix}${keySeparator}${k}`;
			});
			else {
				if (typeof key === "function") key = keysFromSelector(key, selectorOpts);
				resultKey = o.keyPrefix ? `${o.keyPrefix}${keySeparator}${key}` : key;
			}
			return this.t(resultKey, o);
		};
		if (isString$1(lng)) fixedT.lng = lng;
		else fixedT.lngs = lng;
		fixedT.ns = ns;
		fixedT.keyPrefix = keyPrefix;
		return fixedT;
	}
	t(...args) {
		return this.translator?.translate(...args);
	}
	exists(...args) {
		return this.translator?.exists(...args);
	}
	setDefaultNamespace(ns) {
		this.options.defaultNS = ns;
	}
	hasLoadedNamespace(ns, options = {}) {
		if (!this.isInitialized) {
			this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages);
			return false;
		}
		if (!this.languages || !this.languages.length) {
			this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages);
			return false;
		}
		const lng = options.lng || this.resolvedLanguage || this.languages[0];
		const fallbackLng = this.options ? this.options.fallbackLng : false;
		const lastLng = this.languages[this.languages.length - 1];
		if (lng.toLowerCase() === "cimode") return true;
		const loadNotPending = (l, n) => {
			const loadState = this.services.backendConnector.state[`${l}|${n}`];
			return loadState === -1 || loadState === 0 || loadState === 2;
		};
		if (options.precheck) {
			const preResult = options.precheck(this, loadNotPending);
			if (preResult !== void 0) return preResult;
		}
		if (this.hasResourceBundle(lng, ns)) return true;
		if (!this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages) return true;
		const { languageUtils } = this.services;
		const loadLng = !options.lng ? lng : languageUtils.isSupportedCode(lng) && languageUtils.toResolveHierarchy(lng, false)[0];
		if ((!loadLng || loadNotPending(loadLng, ns)) && (!fallbackLng || loadNotPending(lastLng, ns))) return true;
		return false;
	}
	loadNamespaces(ns, callback) {
		const deferred = defer();
		if (!this.options.ns) {
			if (callback) callback();
			return Promise.resolve();
		}
		if (isString$1(ns)) ns = [ns];
		ns.forEach((n) => {
			if (!this.options.ns.includes(n)) this.options.ns.push(n);
		});
		this.loadResources((err) => {
			deferred.resolve();
			if (callback) callback(err);
		});
		return deferred;
	}
	loadLanguages(lngs, callback) {
		const deferred = defer();
		if (isString$1(lngs)) lngs = [lngs];
		const preloaded = this.options.preload || [];
		const newLngs = lngs.filter((lng) => !preloaded.includes(lng) && this.services.languageUtils.isSupportedCode(lng));
		if (!newLngs.length) {
			if (callback) callback();
			return Promise.resolve();
		}
		this.options.preload = preloaded.concat(newLngs);
		this.loadResources((err) => {
			deferred.resolve();
			if (callback) callback(err);
		});
		return deferred;
	}
	dir(lng) {
		if (!lng) lng = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language);
		if (!lng) return "rtl";
		try {
			const l = new Intl.Locale(lng);
			if (l && l.getTextInfo) {
				const ti = l.getTextInfo();
				if (ti && ti.direction) return ti.direction;
			}
		} catch (e) {}
		const rtlLngs = [
			"ar",
			"shu",
			"sqr",
			"ssh",
			"xaa",
			"yhd",
			"yud",
			"aao",
			"abh",
			"abv",
			"acm",
			"acq",
			"acw",
			"acx",
			"acy",
			"adf",
			"ads",
			"aeb",
			"aec",
			"afb",
			"ajp",
			"apc",
			"apd",
			"arb",
			"arq",
			"ars",
			"ary",
			"arz",
			"auz",
			"avl",
			"ayh",
			"ayl",
			"ayn",
			"ayp",
			"bbz",
			"pga",
			"he",
			"iw",
			"ps",
			"pbt",
			"pbu",
			"pst",
			"prp",
			"prd",
			"ug",
			"ur",
			"ydd",
			"yds",
			"yih",
			"ji",
			"yi",
			"hbo",
			"men",
			"xmn",
			"fa",
			"jpr",
			"peo",
			"pes",
			"prs",
			"dv",
			"sam",
			"ckb"
		];
		const languageUtils = this.services?.languageUtils || new LanguageUtil(get());
		if (lng.toLowerCase().indexOf("-latn") > 1) return "ltr";
		return rtlLngs.includes(languageUtils.getLanguagePartFromCode(lng)) || lng.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
	}
	static createInstance(options = {}, callback) {
		const instance = new I18n(options, callback);
		instance.createInstance = I18n.createInstance;
		return instance;
	}
	cloneInstance(options = {}, callback = noop$2) {
		const forkResourceStore = options.forkResourceStore;
		if (forkResourceStore) delete options.forkResourceStore;
		const mergedOptions = {
			...this.options,
			preload: false,
			...options,
			isClone: true
		};
		const clone = new I18n(mergedOptions);
		if (options.debug !== void 0 || options.prefix !== void 0) clone.logger = clone.logger.clone(options);
		[
			"store",
			"services",
			"language"
		].forEach((m) => {
			clone[m] = this[m];
		});
		clone.services = { ...this.services };
		clone.services.utils = { hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone) };
		if (forkResourceStore) {
			clone.store = new ResourceStore(Object.keys(this.store.data).reduce((prev, l) => {
				prev[l] = { ...this.store.data[l] };
				prev[l] = Object.keys(prev[l]).reduce((acc, n) => {
					acc[n] = { ...prev[l][n] };
					return acc;
				}, prev[l]);
				return prev;
			}, {}), mergedOptions);
			clone.services.resourceStore = clone.store;
		}
		if (options.interpolation) {
			const mergedInterpolation = {
				...get().interpolation,
				...this.options.interpolation,
				...options.interpolation
			};
			const mergedForInterpolator = {
				...mergedOptions,
				interpolation: mergedInterpolation
			};
			clone.services.interpolator = new Interpolator(mergedForInterpolator);
		}
		clone.translator = new Translator(clone.services, mergedOptions);
		clone.translator.on("*", (event, ...args) => {
			clone.emit(event, ...args);
		});
		clone.init(mergedOptions, callback);
		clone.translator.options = mergedOptions;
		clone.translator.backendConnector.services.utils = { hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone) };
		return clone;
	}
	toJSON() {
		return {
			options: this.options,
			store: this.store,
			language: this.language,
			languages: this.languages,
			resolvedLanguage: this.resolvedLanguage
		};
	}
}.createInstance();
var createInstance$1 = instance.createInstance;
instance.dir;
instance.init;
instance.loadResources;
instance.reloadResources;
instance.use;
instance.changeLanguage;
instance.getFixedT;
instance.t;
instance.exists;
instance.setDefaultNamespace;
instance.hasLoadedNamespace;
instance.loadNamespaces;
instance.loadLanguages;
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/utils.js
var warn = (i18n, code, msg, rest) => {
	const args = [msg, {
		code,
		...rest || {}
	}];
	if (i18n?.services?.logger?.forward) return i18n.services.logger.forward(args, "warn", "react-i18next::", true);
	if (isString(args[0])) args[0] = `react-i18next:: ${args[0]}`;
	if (i18n?.services?.logger?.warn) i18n.services.logger.warn(...args);
	else if (console?.warn) console.warn(...args);
};
var alreadyWarned = {};
var warnOnce = (i18n, code, msg, rest) => {
	if (isString(msg) && alreadyWarned[msg]) return;
	if (isString(msg)) alreadyWarned[msg] = /* @__PURE__ */ new Date();
	warn(i18n, code, msg, rest);
};
var loadedClb = (i18n, cb) => () => {
	if (i18n.isInitialized) cb();
	else {
		const initialized = () => {
			setTimeout(() => {
				i18n.off("initialized", initialized);
			}, 0);
			cb();
		};
		i18n.on("initialized", initialized);
	}
};
var loadNamespaces = (i18n, ns, cb) => {
	i18n.loadNamespaces(ns, loadedClb(i18n, cb));
};
var loadLanguages = (i18n, lng, ns, cb) => {
	if (isString(ns)) ns = [ns];
	if (i18n.options.preload && i18n.options.preload.indexOf(lng) > -1) return loadNamespaces(i18n, ns, cb);
	ns.forEach((n) => {
		if (i18n.options.ns.indexOf(n) < 0) i18n.options.ns.push(n);
	});
	i18n.loadLanguages(lng, loadedClb(i18n, cb));
};
var hasLoadedNamespace = (ns, i18n, options = {}) => {
	if (!i18n.languages || !i18n.languages.length) {
		warnOnce(i18n, "NO_LANGUAGES", "i18n.languages were undefined or empty", { languages: i18n.languages });
		return true;
	}
	return i18n.hasLoadedNamespace(ns, {
		lng: options.lng,
		precheck: (i18nInstance, loadNotPending) => {
			if (options.bindI18n && options.bindI18n.indexOf("languageChanging") > -1 && i18nInstance.services.backendConnector.backend && i18nInstance.isLanguageChangingTo && !loadNotPending(i18nInstance.isLanguageChangingTo, ns)) return false;
		}
	});
};
var isString = (obj) => typeof obj === "string";
var isObject$1 = (obj) => typeof obj === "object" && obj !== null;
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/unescape.js
var matchHtmlEntity = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g;
var htmlEntities = {
	"&amp;": "&",
	"&#38;": "&",
	"&lt;": "<",
	"&#60;": "<",
	"&gt;": ">",
	"&#62;": ">",
	"&apos;": "'",
	"&#39;": "'",
	"&quot;": "\"",
	"&#34;": "\"",
	"&nbsp;": "\xA0",
	"&#160;": "\xA0",
	"&copy;": "©",
	"&#169;": "©",
	"&reg;": "®",
	"&#174;": "®",
	"&hellip;": "…",
	"&#8230;": "…",
	"&#x2F;": "/",
	"&#47;": "/"
};
var unescapeHtmlEntity = (m) => htmlEntities[m];
var unescape = (text) => text.replace(matchHtmlEntity, unescapeHtmlEntity);
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/defaults.js
var defaultOptions = {
	bindI18n: "languageChanged",
	bindI18nStore: "",
	transEmptyNodeValue: "",
	transSupportBasicHtmlNodes: true,
	transWrapTextNodes: "",
	transKeepBasicHtmlNodesFor: [
		"br",
		"strong",
		"i",
		"p"
	],
	useSuspense: true,
	unescape,
	transDefaultProps: void 0
};
var setDefaults = (options = {}) => {
	defaultOptions = {
		...defaultOptions,
		...options
	};
};
var getDefaults = () => defaultOptions;
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/i18nInstance.js
var i18nInstance;
var setI18n = (instance) => {
	i18nInstance = instance;
};
var getI18n = () => i18nInstance;
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/initReactI18next.js
var initReactI18next = {
	type: "3rdParty",
	init(instance) {
		setDefaults(instance.options.react);
		setI18n(instance);
	}
};
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/context.js
var I18nContext$1 = (0, import_react.createContext)();
var ReportNamespaces = class {
	constructor() {
		this.usedNamespaces = {};
	}
	addUsedNamespaces(namespaces) {
		namespaces.forEach((ns) => {
			if (!this.usedNamespaces[ns]) this.usedNamespaces[ns] = true;
		});
	}
	getUsedNamespaces() {
		return Object.keys(this.usedNamespaces);
	}
};
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/useTranslation.js
var notReadyT = (k, optsOrDefaultValue) => {
	if (isString(optsOrDefaultValue)) return optsOrDefaultValue;
	if (isObject$1(optsOrDefaultValue) && isString(optsOrDefaultValue.defaultValue)) return optsOrDefaultValue.defaultValue;
	if (typeof k === "function") return "";
	if (Array.isArray(k)) {
		const last = k[k.length - 1];
		return typeof last === "function" ? "" : last;
	}
	return k;
};
var notReadySnapshot = {
	t: notReadyT,
	ready: false
};
var dummySubscribe = () => () => {};
var useTranslation$1 = (ns, props = {}) => {
	const { i18n: i18nFromProps } = props;
	const { i18n: i18nFromContext, defaultNS: defaultNSFromContext } = (0, import_react.useContext)(I18nContext$1) || {};
	const i18n = i18nFromProps || i18nFromContext || getI18n();
	if (i18n && !i18n.reportNamespaces) i18n.reportNamespaces = new ReportNamespaces();
	if (!i18n) warnOnce(i18n, "NO_I18NEXT_INSTANCE", "useTranslation: You will need to pass in an i18next instance by using initReactI18next or by passing it via props or context. In monorepo setups, make sure there is only one instance of react-i18next.");
	const i18nOptions = (0, import_react.useMemo)(() => ({
		...getDefaults(),
		...i18n?.options?.react,
		...props
	}), [i18n, props]);
	const { useSuspense, keyPrefix, bindI18n, bindI18nStore } = i18nOptions;
	const nsOrContext = ns || defaultNSFromContext || i18n?.options?.defaultNS;
	const unstableNamespaces = isString(nsOrContext) ? [nsOrContext] : nsOrContext || ["translation"];
	const namespaces = (0, import_react.useMemo)(() => unstableNamespaces, unstableNamespaces);
	i18n?.reportNamespaces?.addUsedNamespaces?.(namespaces);
	const revisionRef = (0, import_react.useRef)(0);
	const subscribe = (0, import_react.useCallback)((callback) => {
		if (!i18n) return dummySubscribe;
		const wrappedCallback = () => {
			revisionRef.current += 1;
			callback();
		};
		if (bindI18n) i18n.on(bindI18n, wrappedCallback);
		if (bindI18nStore) i18n.store.on(bindI18nStore, wrappedCallback);
		return () => {
			if (bindI18n) bindI18n.split(" ").forEach((e) => i18n.off(e, wrappedCallback));
			if (bindI18nStore) bindI18nStore.split(" ").forEach((e) => i18n.store.off(e, wrappedCallback));
		};
	}, [
		i18n,
		bindI18n,
		bindI18nStore
	]);
	const snapshotRef = (0, import_react.useRef)();
	const getSnapshot = (0, import_react.useCallback)(() => {
		if (!i18n) return notReadySnapshot;
		const calculatedReady = !!(i18n.isInitialized || i18n.initializedStoreOnce) && namespaces.every((n) => hasLoadedNamespace(n, i18n, i18nOptions));
		const currentLng = props.lng || i18n.language;
		const currentRevision = revisionRef.current;
		const keyPrefixKey = typeof keyPrefix === "function" ? keysFromSelector(keyPrefix, {
			...i18n.options,
			ns: namespaces
		}) : keyPrefix;
		const lastSnapshot = snapshotRef.current;
		if (lastSnapshot && lastSnapshot.i18n === i18n && lastSnapshot.ready === calculatedReady && lastSnapshot.lng === currentLng && lastSnapshot.namespaces === namespaces && lastSnapshot.keyPrefix === keyPrefixKey && lastSnapshot.revision === currentRevision) return lastSnapshot;
		const newSnapshot = {
			t: i18n.getFixedT(currentLng, i18nOptions.nsMode === "fallback" ? namespaces : namespaces[0], keyPrefix, { scopeNs: namespaces }),
			i18n,
			ready: calculatedReady,
			lng: currentLng,
			namespaces,
			keyPrefix: keyPrefixKey,
			revision: currentRevision
		};
		snapshotRef.current = newSnapshot;
		return newSnapshot;
	}, [
		i18n,
		namespaces,
		keyPrefix,
		i18nOptions,
		props.lng
	]);
	const [loadCount, setLoadCount] = (0, import_react.useState)(0);
	let { t, ready } = (0, import_shim.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
	let pendingTranslationLoad;
	if (i18n && useSuspense && !ready) {
		pendingTranslationLoad = new Promise((resolve) => {
			const onLoaded = () => resolve();
			if (props.lng) loadLanguages(i18n, props.lng, namespaces, onLoaded);
			else loadNamespaces(i18n, namespaces, onLoaded);
		});
		({t, ready} = getSnapshot());
	}
	(0, import_react.useEffect)(() => {
		if (i18n && !ready && !useSuspense) {
			const onLoaded = () => setLoadCount((c) => c + 1);
			if (props.lng) loadLanguages(i18n, props.lng, namespaces, onLoaded);
			else loadNamespaces(i18n, namespaces, onLoaded);
		}
	}, [
		i18n,
		props.lng,
		namespaces,
		ready,
		useSuspense,
		loadCount
	]);
	const finalI18n = i18n || {};
	const wrapperRef = (0, import_react.useRef)(null);
	const wrapperLangRef = (0, import_react.useRef)();
	const languageKey = (inst) => `${inst.language}|${inst.resolvedLanguage}|${inst.languages?.join(",")}`;
	const createI18nWrapper = (original) => {
		const descriptors = Object.getOwnPropertyDescriptors(original);
		if (descriptors.__original) delete descriptors.__original;
		const wrapper = Object.create(Object.getPrototypeOf(original), descriptors);
		if (!Object.prototype.hasOwnProperty.call(wrapper, "__original")) try {
			Object.defineProperty(wrapper, "__original", {
				value: original,
				writable: false,
				enumerable: false,
				configurable: false
			});
		} catch (_) {}
		return wrapper;
	};
	const ret = (0, import_react.useMemo)(() => {
		const original = finalI18n;
		const lang = original && languageKey(original);
		let i18nWrapper = original;
		if (original) {
			if (wrapperRef.current && wrapperRef.current.__original === original) {
				if (wrapperLangRef.current !== lang) {
					i18nWrapper = createI18nWrapper(original);
					wrapperRef.current = i18nWrapper;
					wrapperLangRef.current = lang;
				} else i18nWrapper = wrapperRef.current;
			} else {
				i18nWrapper = createI18nWrapper(original);
				wrapperRef.current = i18nWrapper;
				wrapperLangRef.current = lang;
			}
		}
		const effectiveT = !ready && !useSuspense ? (...args) => {
			warnOnce(i18n, "USE_T_BEFORE_READY", "useTranslation: t was called before ready. When using useSuspense: false, make sure to check the ready flag before using t.");
			return t(...args);
		} : t;
		const arr = [
			effectiveT,
			i18nWrapper,
			ready
		];
		arr.t = effectiveT;
		arr.i18n = i18nWrapper;
		arr.ready = ready;
		return arr;
	}, [
		t,
		finalI18n,
		ready,
		finalI18n.resolvedLanguage,
		finalI18n.language,
		finalI18n.languages
	]);
	if (i18n && useSuspense && !ready) {
		let inDevelopment = false;
		try {
			inDevelopment = false;
		} catch (e) {}
		if (inDevelopment) warnOnce(i18n, "SUSPENDED_WHILE_LOADING", "useTranslation: suspended while translations are loading (useSuspense is true by default). Add a <Suspense> boundary above this component, or set react.useSuspense: false in the i18next init options. https://react.i18next.com/latest/usetranslation-hook");
		throw pendingTranslationLoad;
	}
	return ret;
};
//#endregion
//#region node_modules/.pnpm/react-i18next@17.0.20_i18ne_e9b29806252fcab20461092ec27c7240/node_modules/react-i18next/dist/es/I18nextProvider.js
function I18nextProvider({ i18n, defaultNS, children }) {
	const value = (0, import_react.useMemo)(() => ({
		i18n,
		defaultNS
	}), [i18n, defaultNS]);
	return (0, import_react.createElement)(I18nContext$1.Provider, { value }, children);
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-7VNVCHID.js
function translationsQueryKey(locale) {
	return ["translations", locale];
}
function storeTranslationsQueryKey(storeId, locale) {
	return [
		"translations",
		String(storeId),
		locale
	];
}
function isPlainObject$2(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function mergeMessages(base, overrides) {
	const merged = { ...base };
	for (const [key, value] of Object.entries(overrides)) {
		const existing = merged[key];
		merged[key] = isPlainObject$2(existing) && isPlainObject$2(value) ? mergeMessages(existing, value) : value;
	}
	return merged;
}
function cachedOverrides(queryClient, locale) {
	const entries = queryClient.getQueriesData({ queryKey: ["translations"] });
	for (const [key, data] of entries) if (key.length === 3 && key[2] === locale && isPlainObject$2(data)) return data;
}
function messagesForLocale(queryClient, locale) {
	const common = queryClient?.getQueryData(translationsQueryKey(locale));
	return composeMessages(common, queryClient ? cachedOverrides(queryClient, locale) : void 0, locale);
}
function composeMessages(common, overrides, locale) {
	if (!overrides || Object.keys(overrides).length === 0) return common ?? void 0;
	const base = common?.[`${locale}.trans`];
	return { [`${locale}.trans`]: mergeMessages(isPlainObject$2(base) ? base : {}, overrides) };
}
var SettingsError = class extends Error {
	constructor(message, details) {
		super(message ?? "Store settings could not be loaded.");
		this.name = "SettingsError";
		this.reason = details?.reason;
		this.status = details?.status;
	}
};
function createI18nInstance(locale, translations, themeTranslations) {
	const instance = createInstance$1();
	const transKey = `${locale}.trans`;
	instance.use(initReactI18next).init({
		lng: locale,
		fallbackLng: locale,
		ns: ["app", "theme"],
		defaultNS: "app",
		fallbackNS: "theme",
		resources: { [locale]: {
			app: translations?.[transKey] ?? {},
			theme: themeTranslations?.[transKey] ?? {}
		} },
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
		keySeparator: ".",
		nsSeparator: false
	});
	return instance;
}
var DEFAULT_DATA = {
	queryClient: null,
	settings: null,
	locale: "ar",
	routeId: "",
	location: {
		href: "",
		pathname: "",
		search: {},
		searchStr: "",
		state: {},
		hash: ""
	},
	authToken: null,
	scope: null,
	storeId: null,
	storeBase: null,
	storeBaseFollowsLocale: false,
	versionId: null,
	requestHost: null,
	nativeAppHeaders: null,
	i18n: void 0,
	page: void 0,
	maintenance: false,
	storeNotFound: false
};
function loadAsyncHooks() {
	const proc = globalThis.process;
	try {
		const builtin = proc?.getBuiltinModule?.("node:async_hooks");
		if (builtin?.AsyncLocalStorage) return builtin;
	} catch {}
	try {
		return __require("async_hooks");
	} catch {
		return null;
	}
}
var isServer$2 = typeof window === "undefined";
var ALS_KEY = /* @__PURE__ */ Symbol.for("salla.twilight.context.als");
var _als = null;
if (isServer$2) {
	const registry = globalThis;
	const hooks = registry[ALS_KEY] ? null : loadAsyncHooks();
	if (hooks) registry[ALS_KEY] = new hooks.AsyncLocalStorage();
	_als = registry[ALS_KEY] ?? null;
}
function assertRequestIsolation() {
	if (isServer$2 && !_als) throw new Error("[Twilight] AsyncLocalStorage is unavailable; refusing to share request state.");
}
var CLIENT_KEY = /* @__PURE__ */ Symbol.for("salla.twilight.context.client");
var clientRegistry = globalThis;
var clientShared = clientRegistry[CLIENT_KEY] ??= {
	store: { ...DEFAULT_DATA },
	listeners: /* @__PURE__ */ new Set()
};
var clientStore = clientShared.store;
function getTwilightStore() {
	assertRequestIsolation();
	if (_als) {
		const store = _als.getStore();
		if (!store) throw new Error("[Twilight] No request context. Wrap with runWithTwilightContext().");
		return store;
	}
	return clientStore;
}
function mergeIntoStore(store, partial) {
	if ("queryClient" in partial && partial.queryClient) store.queryClient = partial.queryClient;
	if ("settings" in partial && partial.settings != null) store.settings = partial.settings;
	if ("locale" in partial && partial.locale != null) store.locale = partial.locale;
	if ("routeId" in partial && partial.routeId != null) store.routeId = partial.routeId;
	if ("location" in partial && partial.location != null) store.location = {
		...store.location,
		...partial.location
	};
	if ("authToken" in partial && partial.authToken !== void 0) store.authToken = partial.authToken ?? null;
	if ("scope" in partial && partial.scope !== void 0) store.scope = partial.scope ?? null;
	else if ("scopeId" in partial && partial.scopeId !== void 0) store.scope = partial.scopeId == null ? null : { id: partial.scopeId };
	if ("storeId" in partial && partial.storeId !== void 0) store.storeId = partial.storeId ?? null;
	if ("storeBase" in partial && partial.storeBase !== void 0) store.storeBase = partial.storeBase ?? null;
	if ("storeBaseFollowsLocale" in partial && partial.storeBaseFollowsLocale !== void 0) store.storeBaseFollowsLocale = partial.storeBaseFollowsLocale === true;
	if ("versionId" in partial && partial.versionId !== void 0) store.versionId = partial.versionId ?? null;
	if ("requestHost" in partial && partial.requestHost !== void 0) store.requestHost = partial.requestHost ?? null;
	if ("nativeAppHeaders" in partial && partial.nativeAppHeaders !== void 0) store.nativeAppHeaders = partial.nativeAppHeaders ?? null;
	if ("i18n" in partial && partial.i18n != null) store.i18n = partial.i18n;
	if ("page" in partial) store.page = partial.page;
	if ("appsSnippets" in partial) store.appsSnippets = partial.appsSnippets;
	if ("appsSettings" in partial) store.appsSettings = partial.appsSettings;
	if ("maintenance" in partial) store.maintenance = partial.maintenance === true;
	if ("storeNotFound" in partial) store.storeNotFound = partial.storeNotFound === true;
	if ("extras" in partial) store.extras = partial.extras;
}
function runWithTwilightContext(partial, fn) {
	assertRequestIsolation();
	if (_als) {
		const data = { ...DEFAULT_DATA };
		mergeIntoStore(data, partial);
		return _als.run(data, fn);
	}
	mergeIntoStore(clientStore, partial);
	return fn();
}
var listeners$1 = clientShared.listeners;
function subscribeTwilight(listener) {
	listeners$1.add(listener);
	return () => {
		listeners$1.delete(listener);
	};
}
function updateTwilightContext(partial) {
	mergeIntoStore(getTwilightStore(), partial);
	if (typeof window !== "undefined") for (const listener of listeners$1) listener();
}
function hasTwilightSettings() {
	try {
		return getTwilightStore().settings != null;
	} catch {
		return false;
	}
}
function getRequestStore() {
	try {
		const data = getTwilightStore();
		return {
			storeId: data.storeId,
			storeBase: data.storeBase,
			storeBaseFollowsLocale: data.storeBaseFollowsLocale,
			versionId: data.versionId,
			requestHost: data.requestHost
		};
	} catch {
		return {
			storeId: null,
			storeBase: null,
			storeBaseFollowsLocale: false,
			versionId: null,
			requestHost: null
		};
	}
}
function getTwilightContext() {
	const data = getTwilightStore();
	return {
		get queryClient() {
			return data.queryClient;
		},
		get settings() {
			if (!data.settings) throw new SettingsError();
			return data.settings;
		},
		get locale() {
			return data.locale;
		},
		get routeId() {
			return data.routeId;
		},
		get location() {
			return data.location;
		},
		get authToken() {
			return data.authToken;
		},
		get scope() {
			return data.scope;
		},
		get scopeId() {
			return data.scope?.id ?? null;
		},
		get storeId() {
			return data.storeId;
		},
		get storeBase() {
			return data.storeBase;
		},
		get storeBaseFollowsLocale() {
			return data.storeBaseFollowsLocale;
		},
		get versionId() {
			return data.versionId;
		},
		get requestHost() {
			return data.requestHost;
		},
		get nativeAppHeaders() {
			return data.nativeAppHeaders;
		},
		get i18n() {
			if (!data.i18n) data.i18n = createI18nInstance(data.locale, messagesForLocale(data.queryClient, data.locale));
			return data.i18n;
		},
		get dir() {
			return getLanguageInfo(data.locale).dir;
		},
		get page() {
			return data.page;
		},
		get appsSnippets() {
			return data.appsSnippets;
		},
		get appsSettings() {
			return data.appsSettings;
		},
		get maintenance() {
			return data.maintenance;
		},
		get storeNotFound() {
			return data.storeNotFound;
		},
		get extras() {
			return data.extras;
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-FHU2MXZA.js
var AUTH_TOKEN_COOKIE_NAME = "token";
var SCOPE_COOKIE_NAME = "scope";
var CURRENCY_COOKIE_NAME = "s-curr";
var LANGUAGE_COOKIE_NAME = "s-lang";
var LANGUAGE_PARAM = "lang";
var LANGUAGE_COOKIE_MAX_AGE = 31536e3;
var STORE_ID_COOKIE_NAME = "salla_sid";
var STORE_ID_PARAM = "storeId";
var VERSION_ID_COOKIE_NAME = "salla_vid";
var VERSION_ID_PARAM = "versionId";
function parseRequestId(raw) {
	if (!raw) return null;
	return /^[1-9][0-9]{0,18}$/.test(raw) ? raw : null;
}
function parseStoreId(raw) {
	return parseRequestId(raw);
}
var STORE_ID_HOSTS = ["preview.salla.design"];
function hostnameOf(host) {
	const trimmed = host.trim().toLowerCase();
	if (trimmed.startsWith("[")) return trimmed.slice(0, trimmed.indexOf("]") + 1) || trimmed;
	const colon = trimmed.indexOf(":");
	return colon === -1 ? trimmed : trimmed.slice(0, colon);
}
function isLoopback(hostname) {
	return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname.endsWith(".localhost");
}
function allowsRequestStoreId(host) {
	if (!host) return false;
	const hostname = hostnameOf(host);
	return STORE_ID_HOSTS.includes(hostname) || isLoopback(hostname);
}
function hostIdentifiesStore(host) {
	return Boolean(host) && !allowsRequestStoreId(host);
}
function resolveRequestStoreId(url, cookieHeader, host) {
	return resolveRequestId(url, cookieHeader, host, STORE_ID_PARAM, STORE_ID_COOKIE_NAME);
}
var STORE_BASE_SEGMENT = /^[a-z0-9][a-z0-9._-]{0,62}$/i;
var ROOT_FILE = /\.(ico|txt|xml|json|webmanifest|html?|js|mjs|css|map|png|jpe?g|gif|svg|webp|avif|woff2?|ttf|otf|eot|pdf|mp4|webm|wasm)$/i;
function isStoreBaseSegment(value) {
	return typeof value === "string" && STORE_BASE_SEGMENT.test(value) && !ROOT_FILE.test(value) && !isLocale(value.toLowerCase());
}
function resolveRequestStoreBase(url, host) {
	if (!allowsRequestStoreId(host)) return null;
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}
	if (parsed.searchParams.has(STORE_ID_PARAM)) return null;
	const first = parsed.pathname.split("/")[1];
	return isStoreBaseSegment(first) ? first : null;
}
function resolveRequestStore(url, cookieHeader, host) {
	const storeBase = resolveRequestStoreBase(url, host);
	return {
		storeBase,
		storeId: storeBase ? null : resolveRequestStoreId(url, cookieHeader, host)
	};
}
var STORE_BASE_HEADER = "x-salla-store-base";
function resolveAddressedStore(url, cookieHeader, host, dispatchedStoreBase) {
	if (isStoreBaseSegment(dispatchedStoreBase)) return {
		storeBase: dispatchedStoreBase,
		storeId: null,
		storeBaseFollowsLocale: true
	};
	return {
		...resolveRequestStore(url, cookieHeader, host),
		storeBaseFollowsLocale: false
	};
}
function resolveRequestVersionId(url, cookieHeader, host) {
	return resolveRequestId(url, cookieHeader, host, VERSION_ID_PARAM, VERSION_ID_COOKIE_NAME);
}
function resolveRequestId(url, cookieHeader, host, param, cookieName) {
	if (!allowsRequestStoreId(host)) return null;
	let fromQuery = null;
	try {
		fromQuery = parseRequestId(new URL(url).searchParams.get(param));
	} catch {}
	return fromQuery ?? parseRequestId(extractTokenFromCookies(cookieHeader, cookieName));
}
function rememberDevStoreId(id) {
	if (typeof document === "undefined" || !isLoopback(window.location.hostname)) return;
	const storeId = parseStoreId(id == null ? null : String(id));
	if (storeId) document.cookie = `${STORE_ID_COOKIE_NAME}=${storeId}; path=/; SameSite=Lax`;
}
function clearAuthTokenCookie() {
	if (typeof document === "undefined") return;
	document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
function extractTokenFromCookies(cookieHeader, cookieName) {
	if (!cookieHeader) return null;
	const prefix = `${cookieName}=`;
	let start = 0;
	while (start < cookieHeader.length) {
		const idx = cookieHeader.indexOf(prefix, start);
		if (idx === -1) return null;
		const prevChar = idx > 0 ? cookieHeader[idx - 1] : "";
		if (prevChar === "" || prevChar === ";" || prevChar === " ") {
			let end = cookieHeader.indexOf(";", idx);
			if (end === -1) end = cookieHeader.length;
			const value = cookieHeader.slice(idx + prefix.length, end).trim();
			try {
				return decodeURIComponent(value) || null;
			} catch {
				return value || null;
			}
		}
		start = idx + prefix.length;
	}
	return null;
}
function normalizeScope(raw) {
	if (raw == null) return null;
	if (typeof raw !== "object") return { id: String(raw) };
	const s = raw;
	if (s.id == null) return null;
	const scope = { id: String(s.id) };
	if (s.type != null) scope.type = String(s.type);
	if (s.allocation_type != null) scope.allocation_type = String(s.allocation_type);
	if (s.allocation_id != null) scope.allocation_id = String(s.allocation_id);
	return scope;
}
function extractScopeFromCookies(cookieHeader) {
	const raw = extractTokenFromCookies(cookieHeader, SCOPE_COOKIE_NAME);
	if (!raw) return null;
	try {
		return normalizeScope(JSON.parse(raw));
	} catch {
		return null;
	}
}
function toCurrencyCode(value) {
	return value && /^[A-Z]{3}$/.test(value) ? value : null;
}
function extractCurrencyFromCookies(cookieHeader) {
	return toCurrencyCode(extractTokenFromCookies(cookieHeader, CURRENCY_COOKIE_NAME));
}
function readSdkScope() {
	const sdk = typeof window !== "undefined" ? window.salla : void 0;
	const storage = sdk?.storage;
	if (typeof storage?.get !== "function") return void 0;
	const status = sdk?.status;
	if (status !== void 0 && status !== "ready") return void 0;
	return normalizeScope(storage.get(SCOPE_COOKIE_NAME));
}
var MARKET_SCOPE_TYPE = "scope";
var ALLOCATION_TYPES = ["address", "branch"];
var ALLOCATION_ID = /^(?:[1-9][0-9]{0,18}|msa_[A-Za-z0-9+/=_-]{1,2048})$/;
function extractScopeFromUrl(url) {
	let params;
	try {
		params = new URL(url).searchParams;
	} catch {
		return null;
	}
	const id = parseRequestId(params.get("scope"));
	if (!id) return null;
	const scope = { id };
	const allocationType = params.get("allocation_type");
	const allocationId = params.get("allocation_id");
	if (allocationType && ALLOCATION_TYPES.includes(allocationType) && allocationId && ALLOCATION_ID.test(allocationId)) {
		scope.allocation_type = allocationType;
		scope.allocation_id = allocationId;
	}
	return scope;
}
function resolveRequestScope(url, cookieHeader) {
	const fromCookie = extractScopeFromCookies(cookieHeader);
	const fromUrl = extractScopeFromUrl(url);
	if (!fromUrl) return fromCookie;
	if (fromCookie?.id === fromUrl.id) return {
		...fromCookie,
		...fromUrl
	};
	return {
		...fromUrl,
		type: fromCookie?.type ?? MARKET_SCOPE_TYPE
	};
}
var SCOPE_COOKIE_MAX_AGE = 31536e3;
var sameScope = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function writeScopeCookie(scope) {
	if (typeof document === "undefined") return false;
	if (sameScope(extractScopeFromCookies(document.cookie), scope)) return false;
	if (scope == null) {
		document.cookie = `${SCOPE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
		return true;
	}
	const value = encodeURIComponent(JSON.stringify(scope));
	document.cookie = `${SCOPE_COOKIE_NAME}=${value}; path=/; max-age=${SCOPE_COOKIE_MAX_AGE}; samesite=lax`;
	return true;
}
function syncScopeCookie() {
	const scope = readSdkScope();
	return scope === void 0 ? false : writeScopeCookie(scope);
}
function escapeForInlineScript(value) {
	return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
var RUNTIME_ENV_KEY = "__SALLA_RUNTIME_ENV__";
function readEnv(key) {
	try {
		const vite = {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_STORE_DOMAIN": "1913184396",
			"VITE_TWILIGHT_URL": "https://cdn.assets.salla.network/dev/@salla.sa/twilight/9b1ad668bb386735f64a045e4c13b4c5508ad4c8/twilight.esm.js"
		}[key];
		if (vite) return vite;
	} catch {}
	return typeof process !== "undefined" ? process.env?.[key] : void 0;
}
function resolveRuntimeEnv() {
	const injected = getInjectedRuntimeEnv();
	const { storeId, storeBase, storeBaseFollowsLocale, versionId, requestHost } = getRequestStore();
	return {
		apiBase: injected.apiBase || readEnv("VITE_API_URL"),
		storeIdentifier: injected.storeIdentifier || storeId || storeBase || (hostIdentifiesStore(requestHost) ? requestHost : null) || readEnv("VITE_STORE_DOMAIN"),
		storeBase: injected.storeBase || storeBase || void 0,
		storeBaseFollowsLocale: injected.storeBaseFollowsLocale || (storeBase ? storeBaseFollowsLocale : false) || void 0,
		versionId: injected.versionId || versionId || void 0
	};
}
function getInjectedRuntimeEnv() {
	return globalThis[RUNTIME_ENV_KEY] ?? {};
}
function renderRuntimeEnvScript(env = resolveRuntimeEnv()) {
	const set = Object.entries(env).filter(([, value]) => Boolean(value));
	if (!set.length) return null;
	return `window.${RUNTIME_ENV_KEY}=${escapeForInlineScript(JSON.stringify(Object.fromEntries(set)))};`;
}
function knownLocale(value) {
	const code = value?.toLowerCase();
	return isLocale(code) ? code : null;
}
function safeDecode(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
function langParam(search) {
	for (const part of search.replace(/^\?/, "").split("&")) {
		const [key, value = ""] = part.split("=");
		if (safeDecode(key) === LANGUAGE_PARAM) return safeDecode(value);
	}
	return null;
}
function hasLanguageParam(search) {
	return langParam(search) !== null;
}
function languageFromCookies(cookieHeader) {
	return knownLocale(extractTokenFromCookies(cookieHeader, LANGUAGE_COOKIE_NAME));
}
function virtualLocale(search, cookieHeader) {
	return knownLocale(langParam(search)) ?? languageFromCookies(cookieHeader) ?? "ar";
}
function listedLocales(settings) {
	const codes = (settings.languages ?? []).map((language) => (language.iso_code ?? language.code)?.toLowerCase()).filter((code) => Boolean(code));
	return codes.length ? codes : null;
}
function isMultilingualStore(settings) {
	if (settings?.store?.settings?.is_multilingual === false) return false;
	return settings?.languages == null || settings.languages.length >= 2;
}
function defaultLanguage(settings) {
	const listed = listedLocales(settings);
	if (!listed) return null;
	const marked = settings.languages?.find((language) => Boolean(language.is_default));
	const markedCode = (marked?.iso_code ?? marked?.code)?.toLowerCase();
	if (markedCode) return markedCode;
	return listed.includes("ar") ? "ar" : listed[0];
}
function offeredLanguages(settings) {
	const listed = listedLocales(settings);
	if (!listed) return null;
	if (isMultilingualStore(settings)) return listed;
	const only = defaultLanguage(settings);
	return only ? [only] : listed;
}
function withLanguageParam(search, code) {
	const kept = search.replace(/^\?/, "").split("&").filter((part) => part && safeDecode(part.split("=")[0]) !== LANGUAGE_PARAM);
	if (code) kept.push(`${LANGUAGE_PARAM}=${encodeURIComponent(code)}`);
	return kept.length ? `?${kept.join("&")}` : "";
}
function decideSharedHostLanguage(args) {
	const { settings, locale, href, cookieHeader } = args;
	const offered = offeredLanguages(settings);
	const url = new URL(href, "http://shared-host.invalid");
	const withSearch = (search) => `${url.pathname}${search}${url.hash}`;
	const asked = langParam(url.search);
	if (asked !== null) {
		const wanted = knownLocale(asked);
		if (!wanted || offered && !offered.includes(wanted)) return {
			cookie: null,
			redirectTo: withSearch(withLanguageParam(url.search))
		};
		const remembered = languageFromCookies(cookieHeader);
		return {
			cookie: remembered === wanted ? null : wanted,
			redirectTo: remembered === wanted || wanted === "ar" ? withSearch(withLanguageParam(url.search)) : null
		};
	}
	if (offered && !offered.includes(locale)) {
		const fallback = defaultLanguage(settings);
		return {
			cookie: null,
			redirectTo: withSearch(withLanguageParam(url.search, fallback))
		};
	}
	return {
		cookie: null,
		redirectTo: null
	};
}
function stripStoreBase(pathname, base, followsLocale = false) {
	if (followsLocale) {
		const segments = pathname.split("/");
		if (isLocale(segments[1]) && segments[2] === base) {
			segments.splice(2, 1);
			return segments.join("/");
		}
	}
	const prefix = `/${base}`;
	if (pathname === prefix) return "/";
	return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}
function splitLeadingSegment(rooted) {
	if (!rooted.startsWith("/")) return {
		first: "",
		rest: ""
	};
	let end = 1;
	while (end < rooted.length && rooted[end] !== "/" && rooted[end] !== "?" && rooted[end] !== "#") end += 1;
	return {
		first: rooted.slice(1, end),
		rest: rooted.slice(end)
	};
}
function prefixStoreBase(path, base, followsLocale = false) {
	let rooted = path.startsWith("/") ? path : `/${path}`;
	if (followsLocale) {
		const { first, rest } = splitLeadingSegment(rooted);
		if (isLocale(first)) rooted = rest.startsWith("/") ? rest : `/${rest}`;
	}
	return `/${base}${rooted === "/" || rooted[1] === "?" || rooted[1] === "#" ? rooted.slice(1) : rooted}`;
}
function legacyLocaleRedirectHref(url, base) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		return null;
	}
	const segments = parsed.pathname.split("/");
	if (!isLocale(segments[1]) || segments[2] !== base) return null;
	return `${[
		"",
		base,
		...segments.slice(3)
	].join("/")}${parsed.searchParams.has("lang") ? parsed.search : withLanguageParam(parsed.search, segments[1])}`;
}
function withoutStoreUrlBase(pathname, storeUrlPathname, username) {
	const own = storeUrlSegment(storeUrlPathname, username);
	if (!own) return pathname;
	const segments = pathname.split("/");
	let at = -1;
	if (isLocale(segments[1]) && segments[2] === own) at = 2;
	else if (segments[1] === own) at = 1;
	if (at === -1) return pathname;
	segments.splice(at, 1);
	return segments.join("/") || "/";
}
function hasStoreUrlBase(pathname, storeUrlPathname, username) {
	const own = storeUrlSegment(storeUrlPathname, username);
	if (!own) return true;
	const segments = pathname.split("/");
	return segments[1] === own || isLocale(segments[1]) && segments[2] === own;
}
function storeUrlSegment(storeUrlPathname, username) {
	const last = storeUrlPathname.split("/").filter(Boolean).pop();
	if (!last) return null;
	if (username) return last === username ? last : null;
	return isLocale(last) ? null : last;
}
function storeBaseRedirectHref(args) {
	const { host, base, username, href } = args;
	if (!allowsRequestStoreId(host) || !isStoreBaseSegment(username) || username === base) return null;
	const url = new URL(href, "http://store-base.invalid");
	url.searchParams.delete(STORE_ID_PARAM);
	return `${prefixStoreBase(url.pathname, username)}${url.search}${url.hash}`;
}
function loginRedirectHref(args) {
	const { pathname, searchStr, origin, base, baseFollowsLocale = false } = args;
	const first = pathname.split("/")[1];
	const home = isLocale(first) ? `/${first}` : "/";
	if ((pathname.replace(/\/$/, "") || "/") === home) return null;
	const browserPath = (path) => base ? prefixStoreBase(path, base, baseFollowsLocale) : path;
	const intended = `${origin}${browserPath(pathname)}${searchStr}`;
	return `${browserPath(home)}?intended_to=${encodeURIComponent(intended)}`;
}
function resolveStoreIdentifier(explicit) {
	if (explicit) return explicit;
	const { storeId, requestHost } = getRequestStore();
	if (storeId) return storeId;
	const storeBase = resolveStoreBase();
	if (storeBase) return storeBase;
	const injected = getInjectedRuntimeEnv().storeIdentifier;
	if (injected) return injected;
	if (hostIdentifiesStore(requestHost)) return requestHost;
	const browserHost = typeof window !== "undefined" ? window.location.host : null;
	if (hostIdentifiesStore(browserHost)) return browserHost;
	return readEnv("VITE_STORE_DOMAIN") || readEnv("STORE_DOMAIN") || "";
}
function resolveStoreBase() {
	const { storeBase } = getRequestStore();
	if (storeBase) return storeBase;
	if (typeof window === "undefined") return null;
	const published = getInjectedRuntimeEnv();
	if (published.storeBase) return published.storeBase;
	if (Object.keys(published).length > 0) return null;
	return resolveRequestStoreBase(window.location.href, window.location.host);
}
function resolveStoreBaseFollowsLocale() {
	const { storeBase, storeBaseFollowsLocale } = getRequestStore();
	if (storeBase) return storeBaseFollowsLocale;
	if (typeof window === "undefined") return false;
	const published = getInjectedRuntimeEnv();
	return Boolean(published.storeBase && published.storeBaseFollowsLocale);
}
function resolveStoreBaseRedirect(username, href) {
	return storeBaseRedirectHref({
		host: getRequestStore().requestHost ?? (typeof window !== "undefined" ? window.location.host : null),
		base: resolveStoreBase(),
		username,
		href
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-GYXUYHKO.js
function requestedThemeVersionId() {
	const { versionId } = getRequestStore();
	if (versionId) return versionId;
	return getInjectedRuntimeEnv().versionId || null;
}
function answersScope(settings, activeScopeId) {
	const requestedScopeId = settings?.requestedScopeId ?? null;
	if (activeScopeId == null) return requestedScopeId == null;
	const answeredScopeId = settings?.store?.scope?.id;
	return (answeredScopeId != null ? String(answeredScopeId) : requestedScopeId) === activeScopeId;
}
function resolveThemeVersionId(activeScopeId = null) {
	const requested = requestedThemeVersionId();
	if (requested) return requested;
	try {
		const settings = getTwilightContext().settings;
		if (!answersScope(settings, activeScopeId)) return null;
		const profileId = settings?.theme?.profile?.id;
		return profileId != null ? String(profileId) : null;
	} catch {
		return null;
	}
}
var isBrowser$1 = typeof window !== "undefined";
function getStoreIdentifier(explicit) {
	return resolveStoreIdentifier(explicit);
}
function getSallaSDK() {
	if (!isBrowser$1) return void 0;
	return window.salla;
}
var SDK_CREATED_EVENT = "salla::created";
var noop$1 = () => {};
function isLoaded(sdk) {
	return typeof sdk?.init === "function" || typeof sdk?.event?.on === "function";
}
function hasEventBus(sdk) {
	return typeof sdk?.event?.on === "function";
}
function whenSallaLoaded(callback) {
	return whenSalla(isLoaded, callback);
}
function whenSalla(isUsable, callback) {
	if (!isBrowser$1) return noop$1;
	if (isUsable(window.salla)) {
		callback(window.salla);
		return noop$1;
	}
	let settled = false;
	const onCreated = () => {
		const sdk = window.salla;
		if (settled || !isUsable(sdk)) return;
		settled = true;
		window.removeEventListener(SDK_CREATED_EVENT, onCreated);
		callback(sdk);
	};
	window.addEventListener(SDK_CREATED_EVENT, onCreated);
	return () => {
		settled = true;
		window.removeEventListener(SDK_CREATED_EVENT, onCreated);
	};
}
function whenSallaReady(callback) {
	let cancelled = false;
	const cancel = whenSallaLoaded((sdk) => {
		new Promise((resolve) => resolve(sdk.onReady?.())).catch(noop$1).then(() => {
			if (!cancelled) callback(sdk);
		});
	});
	return () => {
		cancelled = true;
		cancel();
	};
}
function onSallaEvent(name, listener) {
	let bus;
	const cancel = whenSalla(hasEventBus, (sdk) => {
		bus = sdk.event;
		bus.on(name, listener);
	});
	return () => {
		cancel();
		bus?.off?.(name, listener);
	};
}
function syncSdkLocale(locale) {
	const sdk = getSallaSDK();
	if (!sdk || !locale) return;
	try {
		sdk.lang?.setLocale?.(locale);
		sdk.api?.setHeader?.("accept-language", locale);
		sdk.config?.set?.("user.language_code", locale);
	} catch {}
}
function sdkThemeVersionId(headers) {
	const versionId = requestedThemeVersionId() ?? headers?.["s-version-id"];
	return versionId != null ? String(versionId) : null;
}
function withSdkThemeVersion(settings) {
	const versionId = requestedThemeVersionId();
	if (!versionId) return settings;
	return {
		...settings,
		headers: {
			...settings.headers,
			"s-version-id": versionId
		}
	};
}
function syncSdkThemeVersion(headers) {
	const sdk = getSallaSDK();
	if (!sdk) return;
	const versionId = sdkThemeVersionId(headers);
	try {
		if (versionId != null) sdk.api?.setHeader?.("s-version-id", versionId);
		else delete sdk.api?.axios?.defaults?.headers?.common?.["s-version-id"];
	} catch {}
}
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/KyError.js
/**
Base class for all Ky-specific errors. `HTTPError`, `NetworkError`, `TimeoutError`, `ResponseSizeError`, and `ForceRetryError` extend this class.

You can use `instanceof KyError` to check if an error originated from Ky, or use the `isKyError()` type guard for cross-realm compatibility and TypeScript type narrowing.

Note: `SchemaValidationError` is intentionally not considered a Ky error. `KyError` covers failures in Ky's HTTP lifecycle (bad status, timeout, retry), while schema validation errors originate from the user-provided schema, not from Ky itself.
*/
var KyError = class extends Error {
	name = "KyError";
	get isKyError() {
		return true;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/HTTPError.js
/**
Error thrown when the response has a non-2xx status code and `throwHttpErrors` is enabled.

The error has a `response` property with the `Response` object, a `request` property with the `Request` object, an `options` property with the normalized options (either passed to `ky` when creating an instance with `ky.create()` or directly when performing the request), and a `data` property with the pre-parsed response body. For JSON responses (based on `Content-Type`), the body is parsed using the `parseJson` option if set, or `JSON.parse` by default. For other content types, it is set as plain text. If the body is empty, unreadable, too large, parsing fails, or the error-data read/parse timeout is reached, `data` will be `undefined`. To avoid hanging or excessive buffering, `error.data` body reads and async JSON parsing are bounded by the request timeout (or 10 seconds when `timeout` is disabled), any remaining `totalTimeout` budget, and a 10 MiB response body size limit. If `maxResponseSize` is exceeded while populating `error.data`, Ky throws `ResponseSizeError` instead of `HTTPError`. If `totalTimeout` expires while populating `error.data`, Ky throws `TimeoutError` instead of `HTTPError`. The `data` property is populated before `beforeError` hooks run, so hooks can access it.

The response body is automatically consumed when populating `error.data`, so `error.response.json()` and other body methods will not work. Use `error.data` instead. The `error.response` object is still available for headers, status, etc.

Be aware that some types of errors, such as network errors, inherently mean that a response was not received. In that case, the error will be an instance of `NetworkError` instead of `HTTPError` and will not contain a `response` property.
*/
var HTTPError = class extends KyError {
	name = "HTTPError";
	response;
	request;
	options;
	data;
	constructor(response, request, options) {
		const status = `${response.status || response.status === 0 ? response.status : ""} ${response.statusText ?? ""}`.trim();
		const reason = status ? `status code ${status}` : "an unknown error";
		super(`Request failed with ${reason}: ${request.method} ${request.url}`);
		this.response = response;
		this.request = request;
		this.options = options;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/NetworkError.js
/**
Error thrown when a network error occurs during the request (e.g., DNS failure, connection refused, offline). It has a `request` property with the `Request` object. The original error is available via the standard `cause` property.

Network errors are automatically retried (for retriable methods). A connection that drops while a Ky shortcut method like `.json()` is reading the response body is also wrapped in `NetworkError`, but it is not retried because the response has already been received.

Note: Network errors are detected using runtime-specific heuristics. Unrecognized runtimes may produce errors that are not wrapped in `NetworkError`. Use the `shouldRetry` option to handle such cases.
*/
var NetworkError = class extends KyError {
	name = "NetworkError";
	request;
	constructor(request, options) {
		super(`Request failed due to a network error: ${request.method} ${request.url}`, options);
		this.request = request;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/is.js
var isObject = (value) => value !== null && typeof value === "object";
var isNonArrayObject = (value) => isObject(value) && !Array.isArray(value);
var isNonNegativeNumber = (value) => typeof value === "number" && value >= 0;
var objectToString = Object.prototype.toString;
var isError = (value) => value instanceof Error || objectToString.call(value) === "[object Error]";
var isRequest = (value) => value instanceof globalThis.Request || objectToString.call(value) === "[object Request]";
var isResponse = (value) => value instanceof globalThis.Response || objectToString.call(value) === "[object Response]";
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/NonError.js
/**
Wrapper for non-Error values that were thrown.

In JavaScript, any value can be thrown (not just Error instances). This class wraps such values to ensure consistent error handling.
*/
var NonError = class NonError extends Error {
	/**
	Returns the value as-is when it is an `Error`, including one from another realm, and otherwise wraps it in a `NonError`.
	*/
	static wrap(value) {
		return isError(value) ? value : new NonError(value);
	}
	name = "NonError";
	value;
	constructor(value) {
		let message = "Non-error value was thrown";
		try {
			if (typeof value === "string") message = value;
			else if (value && typeof value === "object" && "message" in value && typeof value.message === "string") message = value.message;
		} catch {}
		super(message);
		this.value = value;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/ForceRetryError.js
/**
Error used to signal a forced retry from `afterResponse` hooks.

This is thrown when `ky.retry()` is returned from an `afterResponse` hook. It is observable in `beforeRetry` and `beforeError` hooks via the `isForceRetryError()` type guard.
*/
var ForceRetryError = class extends KyError {
	name = "ForceRetryError";
	customDelay;
	code;
	customRequest;
	constructor(options) {
		if (options === null) throw new TypeError("The `ky.retry()` options must be an object");
		const delay = options?.delay;
		if (delay !== void 0 && !isNonNegativeNumber(delay)) throw new TypeError("The `ky.retry()` `delay` option must be a non-negative number or `Infinity`");
		if (options?.code !== void 0 && typeof options.code !== "string") throw new TypeError("The `ky.retry()` `code` option must be a string");
		if (options?.request !== void 0 && !isRequest(options.request)) throw new TypeError("The `ky.retry()` `request` option must be a `Request`");
		const cause = options?.cause === void 0 ? void 0 : NonError.wrap(options.cause);
		super(options?.code === void 0 ? "Forced retry" : `Forced retry: ${options.code}`, cause ? { cause } : void 0);
		this.customDelay = options?.delay;
		this.code = options?.code;
		this.customRequest = options?.request;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/SchemaValidationError.js
/**
The error thrown when [Standard Schema](https://github.com/standard-schema/standard-schema) validation fails in `.json(schema)`. It has an `issues` property with the validation issues from the schema.

This error intentionally does not extend `KyError` because it does not represent a failure in Ky's HTTP lifecycle. The request succeeded; the user's schema rejected the data. As such, it is not matched by `isKyError()`.

@example
```
import ky, {SchemaValidationError} from 'ky';
import {z} from 'zod';

const userSchema = z.object({name: z.string()});

try {
const user = await ky('/api/user').json(userSchema);
console.log(user.name);
} catch (error) {
if (error instanceof SchemaValidationError) {
console.error(error.issues);
}
}
```
*/
var SchemaValidationError = class extends Error {
	name = "SchemaValidationError";
	issues;
	constructor(issues) {
		super("Response schema validation failed");
		this.issues = issues;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/TimeoutError.js
/**
Error thrown when the request times out. It has a `request` property with the `Request` object.
*/
var TimeoutError = class extends KyError {
	name = "TimeoutError";
	request;
	constructor(request) {
		super(`Request timed out: ${request.method} ${request.url}`);
		this.request = request;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/core/constants.js
var supportsRequestStreams = (() => {
	let duplexAccessed = false;
	let hasContentType = false;
	const supportsReadableStream = typeof globalThis.ReadableStream === "function";
	const supportsRequest = typeof globalThis.Request === "function";
	if (supportsReadableStream && supportsRequest) try {
		hasContentType = new globalThis.Request("https://empty.invalid", {
			body: new globalThis.ReadableStream(),
			method: "POST",
			get duplex() {
				duplexAccessed = true;
				return "half";
			}
		}).headers.has("Content-Type");
	} catch {
		return false;
	}
	const isBunOrDeno = "Bun" in globalThis || "Deno" in globalThis;
	return (duplexAccessed || isBunOrDeno) && !hasContentType;
})();
var supportsAbortController = typeof globalThis.AbortController === "function";
var supportsAbortSignal = typeof globalThis.AbortSignal === "function" && typeof globalThis.AbortSignal.any === "function";
var supportsResponseStreams = typeof globalThis.ReadableStream === "function";
var supportsFormData = typeof globalThis.FormData === "function";
var requestMethods = [
	"get",
	"post",
	"put",
	"patch",
	"head",
	"delete",
	"query"
];
var responseTypes = {
	json: "application/json",
	text: "text/*",
	formData: "multipart/form-data",
	arrayBuffer: "*/*",
	blob: "*/*",
	bytes: "*/*"
};
var getSupportedResponseTypes = () => Object.keys(responseTypes).filter((type) => type !== "bytes" || typeof globalThis.Response?.prototype?.bytes === "function");
var maxSafeTimeout = 2147483647;
/**
Symbol that can be returned by a `beforeRetry` hook to stop retrying without throwing an error.

Registered globally so that a hook written against a second copy of Ky, which happens with a duplicated dependency, still stops the retries. A plain `Symbol` is per module, so the copies would not recognise each other's symbol.
*/
var stop = Symbol.for("ky.stop");
/**
Marker returned by `ky.retry()` to signal a forced retry from `afterResponse` hooks.
*/
var RetryMarker = class {
	get isRetryMarker() {
		return true;
	}
	options;
	constructor(options) {
		this.options = options;
	}
};
var isRetryMarker = (value) => value instanceof RetryMarker || value?.isRetryMarker === true;
/**
Force a retry from an `afterResponse` hook.

This allows you to retry a request based on the response content, even if the response has a successful status code. The retry will respect the `retry.limit` option and skip the `shouldRetry` check. The forced retry is observable in `beforeRetry` hooks, where the error will be a `ForceRetryError`.

A marker returned by a second copy of Ky, which happens with a duplicated dependency, is still recognised, the same way the Ky error guards accept branded errors.

@param options - Optional configuration for the retry.

@example
```
import ky, {isForceRetryError} from 'ky';

const api = ky.extend({
hooks: {
afterResponse: [
async ({request, response}) => {
// Retry based on response body content
if (response.status === 200) {
const data = await response.json();

// Simple retry with default delay
if (data.error?.code === 'TEMPORARY_ERROR') {
return ky.retry();
}

// Retry with custom delay from API response
if (data.error?.code === 'RATE_LIMIT') {
return ky.retry({
delay: data.error.retryAfter * 1000,
code: 'RATE_LIMIT'
});
}

// Retry with a modified request (e.g., fallback endpoint)
if (data.error?.code === 'FALLBACK_TO_BACKUP') {
return ky.retry({
request: new Request('https://backup-api.com/endpoint', {
method: request.method,
headers: request.headers,
}),
code: 'BACKUP_ENDPOINT'
});
}

// Retry with refreshed authentication
if (data.error?.code === 'TOKEN_REFRESH' && data.newToken) {
return ky.retry({
request: new Request(request, {
headers: {
...Object.fromEntries(request.headers),
'Authorization': `Bearer ${data.newToken}`
}
}),
code: 'TOKEN_REFRESHED'
});
}

// Retry with cause to preserve error chain
try {
validateResponse(data);
} catch (error) {
return ky.retry({
code: 'VALIDATION_FAILED',
cause: error
});
}
}
}
],
beforeRetry: [
({error, retryCount}) => {
// Observable in beforeRetry hooks
if (isForceRetryError(error)) {
console.log(`Forced retry #${retryCount}: ${error.message}`);
// Example output: "Forced retry #1: Forced retry: RATE_LIMIT"
}
}
]
}
});

const response = await api.get('https://example.com/api');
```
*/
var retry = (options) => new RetryMarker(options);
var beforeRetryOptionKeys = [
	"onUploadProgress",
	"onDownloadProgress",
	"timeout",
	"fetch",
	"throwHttpErrors"
];
var kyOptionKeys = {
	json: true,
	parseJson: true,
	stringifyJson: true,
	searchParams: true,
	baseUrl: true,
	prefix: true,
	retry: true,
	timeout: true,
	totalTimeout: true,
	maxResponseSize: true,
	hooks: true,
	throwHttpErrors: true,
	onDownloadProgress: true,
	onUploadProgress: true,
	fetch: true,
	context: true
};
var requestOptionsRegistry = {
	method: true,
	headers: true,
	body: true,
	mode: true,
	credentials: true,
	cache: true,
	redirect: true,
	referrer: true,
	referrerPolicy: true,
	integrity: true,
	keepalive: true,
	signal: true,
	window: true,
	duplex: true
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/errors/ResponseSizeError.js
/**
Error thrown when the response body exceeds `maxResponseSize`. It has a `request` property with the `Request` object and a `maxResponseSize` property with the configured limit in bytes.

@example
```
import ky, {isResponseSizeError} from 'ky';

try {
await ky('https://example.com/data', {maxResponseSize: 1024}).json();
} catch (error) {
if (isResponseSizeError(error)) {
console.log(`Response exceeded ${error.maxResponseSize} bytes`);
}
}
```
*/
var ResponseSizeError = class extends KyError {
	name = "ResponseSizeError";
	request;
	maxResponseSize;
	constructor(request, maxResponseSize) {
		super(`Response body exceeded ${maxResponseSize} bytes: ${request.method} ${request.url}`);
		this.request = request;
		this.maxResponseSize = maxResponseSize;
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/body.js
var encoder = new TextEncoder();
var responseSizeErrors = /* @__PURE__ */ new WeakMap();
var nullBodyStatuses = /* @__PURE__ */ new Set([
	101,
	103,
	204,
	205,
	304
]);
/**
Cancels the body of a request or response that is no longer used, unless `keep` still reads the same stream.

Fire-and-forget: cancellation failures from already-locked or already-consumed streams are ignored, and the cancellation is not awaited since a clone leaves extra tee branches that keep the cancel promise pending per the Streams spec.
*/
var cancelBody = (value, keep) => {
	const body = value?.body;
	if (body && body !== keep?.body) body.cancel().catch(() => void 0);
};
var getContentLength = (headers) => Math.max(0, Number(headers.get("content-length")) || 0);
var normalizeLineBreaks = (value) => value.replaceAll(/\r\n|\r|\n/g, "\r\n");
var escapeFormDataName = (name) => name.replaceAll("\n", "%0A").replaceAll("\r", "%0D").replaceAll("\"", "%22");
var getBodySize = (body) => {
	if (!body) return 0;
	if (body instanceof FormData) {
		let size = 0;
		for (const [key, value] of body) {
			size += 44;
			size += encoder.encode(`Content-Disposition: form-data; name="${escapeFormDataName(normalizeLineBreaks(key))}"`).byteLength;
			if (value instanceof Blob) {
				size += encoder.encode(`; filename="${escapeFormDataName(value.name ?? "")}"`).byteLength;
				size += encoder.encode(`\r\nContent-Type: ${value.type || "application/octet-stream"}`).byteLength;
			}
			size += 4;
			size += typeof value === "string" ? encoder.encode(normalizeLineBreaks(value)).byteLength : value.size;
			size += 2;
		}
		return size === 0 ? 0 : size + 40 + 6;
	}
	if (body instanceof Blob) return body.size;
	if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return body.byteLength;
	if (typeof body === "string") return encoder.encode(body).byteLength;
	if (body instanceof URLSearchParams) return encoder.encode(body.toString()).byteLength;
	return 0;
};
var withProgress = (stream, totalBytes, onProgress) => {
	let previousChunk;
	let transferredBytes = 0;
	return stream.pipeThrough(new TransformStream({
		transform(currentChunk, controller) {
			controller.enqueue(currentChunk);
			if (previousChunk) {
				transferredBytes += previousChunk.byteLength;
				let percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
				if (percent >= 1) percent = 1 - Number.EPSILON;
				onProgress?.({
					percent,
					totalBytes: totalBytes === 0 ? 0 : Math.max(totalBytes, transferredBytes),
					transferredBytes
				}, previousChunk);
			}
			previousChunk = currentChunk;
		},
		flush() {
			const finalChunk = previousChunk ?? /* @__PURE__ */ new Uint8Array();
			transferredBytes += finalChunk.byteLength;
			onProgress?.({
				percent: 1,
				totalBytes: transferredBytes,
				transferredBytes
			}, finalChunk);
		}
	}));
};
var copyResponseMetadata = (response, originalResponse, getError = originalResponse.body ? responseSizeErrors.get(originalResponse.body) : void 0) => {
	const nativeClone = response.clone.bind(response);
	if (response.body && getError) {
		responseSizeErrors.set(response.body, getError);
		for (const type of Object.keys(responseTypes)) {
			if (typeof response[type] !== "function") continue;
			const nativeMethod = response[type].bind(response);
			Object.defineProperty(response, type, {
				async value() {
					try {
						return await nativeMethod();
					} catch (error) {
						throw getError() ?? error;
					}
				},
				writable: true,
				configurable: true
			});
		}
	}
	Object.defineProperties(response, {
		url: { value: originalResponse.url },
		redirected: { value: originalResponse.redirected },
		type: { value: originalResponse.type },
		headers: { value: originalResponse.headers },
		clone: {
			value() {
				const clone = nativeClone();
				if (response.body && getError) responseSizeErrors.set(response.body, getError);
				return copyResponseMetadata(clone, response);
			},
			writable: true,
			configurable: true
		}
	});
	return response;
};
var wrappableBody = (response) => {
	const { body } = response;
	if (!body || response.bodyUsed || body.locked || nullBodyStatuses.has(response.status)) return;
	return body;
};
var limitResponseSize = (response, request, maxResponseSize) => {
	const originalBody = wrappableBody(response);
	if (!originalBody || maxResponseSize === Number.POSITIVE_INFINITY) return response;
	let transferredBytes = 0;
	let sizeError;
	const getOriginalSizeError = responseSizeErrors.get(originalBody);
	const body = originalBody.pipeThrough(new TransformStream({ transform(chunk, controller) {
		transferredBytes += chunk.byteLength;
		if (transferredBytes > maxResponseSize) {
			sizeError = new ResponseSizeError(request, maxResponseSize);
			throw sizeError;
		}
		controller.enqueue(chunk);
	} }));
	return copyResponseMetadata(new Response(body, response), response, () => sizeError ?? getOriginalSizeError?.());
};
var streamResponse = (response, onDownloadProgress) => {
	const originalBody = wrappableBody(response);
	if (!originalBody) return response;
	const contentEncoding = response.headers.get("content-encoding")?.toLowerCase();
	const body = withProgress(originalBody, Boolean(contentEncoding) && contentEncoding !== "identity" ? 0 : getContentLength(response.headers), onDownloadProgress);
	return copyResponseMetadata(new Response(body, response), response);
};
var streamRequest = (request, onUploadProgress, originalBody) => {
	if (!request.body || request.bodyUsed || request.body.locked || request.keepalive || request.mode === "no-cors" || !(request instanceof globalThis.Request)) return request;
	const totalBytes = getBodySize(originalBody ?? request.body) || getContentLength(request.headers);
	return new Request(request, {
		duplex: "half",
		body: withProgress(request.body, totalBytes, onUploadProgress),
		headers: request.headers,
		referrer: request.referrer,
		referrerPolicy: request.referrerPolicy
	});
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/merge.js
var replaceSymbol = Symbol.for("ky.replaceOption");
var getReplaceState = (value) => isObject(value) && value[replaceSymbol] === true ? {
	isReplace: true,
	value: value.value
} : {
	isReplace: false,
	value
};
var validateAndMerge = (...sources) => {
	for (const source of sources) if (source !== void 0 && !isNonArrayObject(source)) throw new TypeError("The `options` argument must be an object");
	return deepMerge({}, ...sources);
};
var mergeHeaders = (source1 = {}, source2 = {}) => {
	const result = new globalThis.Headers(source1);
	for (const [key, value] of Object.entries(toHeaderObject(source2))) if (value === void 0) result.delete(key);
	else result.set(key, value);
	return result;
};
var isPlainObject$1 = (value) => {
	if (!isNonArrayObject(value)) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
};
var isMergeable = (value) => isPlainObject$1(value) || Array.isArray(value);
var cloneShallow = (value) => {
	if (value instanceof URLSearchParams) {
		const copy = new URLSearchParams(value);
		const deleted = value[deletedParametersSymbol];
		if (deleted) copy[deletedParametersSymbol] = new Set(deleted);
		return copy;
	}
	if (Array.isArray(value)) return [...value];
	if (isPlainObject$1(value)) return { ...value };
	return value;
};
var cloneSearchParameters = (value) => Array.isArray(value) ? value.map((parameter) => cloneShallow(parameter)) : cloneShallow(value);
var cloneDeep = (value, seen = /* @__PURE__ */ new WeakMap()) => {
	if (!isMergeable(value)) return value;
	const existingCopy = seen.get(value);
	if (existingCopy) return existingCopy;
	if (Array.isArray(value)) {
		const copy = [];
		seen.set(value, copy);
		for (const item of value) copy.push(cloneDeep(item, seen));
		return copy;
	}
	const copy = Object.getPrototypeOf(value) === null ? Object.create(null) : {};
	seen.set(value, copy);
	for (const key of Reflect.ownKeys(value)) {
		if (!Object.prototype.propertyIsEnumerable.call(value, key)) continue;
		Object.defineProperty(copy, key, {
			value: cloneDeep(value[key], seen),
			writable: true,
			enumerable: true,
			configurable: true
		});
	}
	return copy;
};
var toHeaderObject = (source) => {
	if (isPlainObject$1(source)) return source;
	const isHeadersInstance = source instanceof globalThis.Headers;
	const result = {};
	for (const [key, value] of new globalThis.Headers(source).entries()) result[key] = isHeadersInstance && value === "undefined" ? void 0 : value;
	return result;
};
var mergeHeaderContainers = (source1, source2) => {
	const result = /* @__PURE__ */ new Map();
	for (const [key, value] of [...Object.entries(toHeaderObject(source1)), ...Object.entries(toHeaderObject(source2))]) result.set(key.toLowerCase(), value);
	return Object.fromEntries(result);
};
function newHookValue(original, incoming, property) {
	if (Object.hasOwn(incoming, property) && incoming[property] === void 0) return [];
	const { isReplace, value } = getReplaceState(incoming[property]);
	if (value !== void 0 && (!Array.isArray(value) || !value.every((hook) => typeof hook === "function"))) throw new TypeError(`\`hooks.${property}\` must be an array of functions`);
	if (isReplace) return [...value ?? []];
	return deepMerge(original[property] ?? [], value ?? []);
}
var mergeHooks = (original = {}, incoming = {}) => {
	if (!isNonArrayObject(incoming)) throw new TypeError("The `hooks` option must be an object");
	return {
		init: newHookValue(original, incoming, "init"),
		beforeRequest: newHookValue(original, incoming, "beforeRequest"),
		beforeRetry: newHookValue(original, incoming, "beforeRetry"),
		beforeError: newHookValue(original, incoming, "beforeError"),
		afterResponse: newHookValue(original, incoming, "afterResponse")
	};
};
var deletedParametersSymbol = Symbol("deletedParameters");
var resolveItemMarkers = (value, resolveItem) => {
	let resolved;
	for (const [key, item] of Object.entries(value)) {
		const replacement = resolveItem(item);
		if (replacement !== item) {
			resolved ??= Array.isArray(value) ? [...value] : { ...value };
			resolved[key] = replacement;
		}
	}
	return resolved ?? value;
};
var userDataOptions = /* @__PURE__ */ new Set(["json", "context"]);
var resolveReplaceMarkers = (value, resolved) => {
	if (!isMergeable(value)) return value;
	if (resolved.has(value)) return resolved.get(value);
	resolved.set(value, value);
	const resolveItem = (item) => resolveReplaceMarkers(getReplaceState(item).value, resolved);
	const result = resolveItemMarkers(value, resolveItem);
	resolved.set(value, result);
	return result;
};
var appendSearchParameters = (target, source) => {
	const result = new URLSearchParams();
	const deleted = /* @__PURE__ */ new Set();
	for (const input of [target, source]) if (input instanceof URLSearchParams) {
		const inputDeleted = input[deletedParametersSymbol];
		if (inputDeleted) for (const key of inputDeleted) {
			result.delete(key);
			deleted.add(key);
		}
		for (const [key, value] of input.entries()) result.append(key, value);
	} else if (Array.isArray(input)) for (const pair of input) {
		if (!Array.isArray(pair) || pair.length !== 2) throw new TypeError("Array search parameters must be provided in [[key, value], ...] format");
		const key = String(pair[0]);
		const { isReplace, value } = getReplaceState(pair[1]);
		if (isReplace) result.delete(key);
		result.append(key, String(value));
	}
	else if (isObject(input)) for (const [key, value] of Object.entries(input)) {
		const { isReplace, value: entry } = getReplaceState(value);
		if (entry === void 0) {
			result.delete(key);
			deleted.add(key);
		} else {
			if (isReplace) result.delete(key);
			result.append(key, String(entry));
		}
	}
	else {
		const parameters = new URLSearchParams(input);
		for (const [key, value] of parameters.entries()) result.append(key, value);
	}
	if (deleted.size > 0) result[deletedParametersSymbol] = deleted;
	return result;
};
var deepMergeInternal = (isRoot, ...sources) => {
	let returnValue = {};
	let headers = {};
	let hooks = {};
	let searchParameters;
	const signals = [];
	for (const source of sources) if (Array.isArray(source)) {
		if (!Array.isArray(returnValue)) returnValue = [];
		returnValue = [...returnValue, ...source];
	} else if (isObject(source)) {
		for (let [key, value] of Object.entries(source)) {
			const replaceState = getReplaceState(value);
			const { isReplace } = replaceState;
			value = replaceState.value;
			const isRootSignal = isRoot && key === "signal";
			if (isRootSignal && (isReplace || value === void 0)) signals.length = 0;
			if (isRootSignal && value instanceof globalThis.AbortSignal) {
				signals.push(value);
				continue;
			}
			if (isRoot && key === "headers" && value === null) throw new TypeError("The `headers` option must not be `null`. Use `undefined` to clear it.");
			if (isRoot && key === "context") {
				if (value !== void 0 && !isNonArrayObject(value)) throw new TypeError("The `context` option must be an object");
				returnValue = {
					...returnValue,
					context: value === void 0 ? {} : isReplace ? { ...value } : {
						...returnValue.context,
						...value
					}
				};
				continue;
			}
			if (isRoot && key === "searchParams") {
				if (value === null) throw new TypeError("The `searchParams` option must not be `null`. Use `undefined` to clear it.");
				if (value === void 0) searchParameters = void 0;
				else if (isReplace || searchParameters === void 0) searchParameters = cloneSearchParameters(value);
				else searchParameters = appendSearchParameters(searchParameters, value);
				continue;
			}
			if (isRoot && key === "retry" && value !== void 0 && typeof value !== "number" && !isNonArrayObject(value)) throw new TypeError("`retry` must be a number or an object");
			if (isRoot && key === "retry" && !isReplace) {
				if (isObject(value) && typeof returnValue[key] === "number") returnValue = {
					...returnValue,
					[key]: { limit: returnValue[key] }
				};
				else if (typeof value === "number" && isObject(returnValue[key])) value = { limit: value };
			}
			if (isRoot && key === "retry" && isPlainObject$1(value) && (isReplace || !isMergeable(returnValue[key]))) value = deepMergeInternal(false, {}, value);
			else if (!isReplace && isMergeable(returnValue[key]) && isMergeable(value) && Array.isArray(returnValue[key]) === Array.isArray(value)) value = deepMergeInternal(false, returnValue[key], value);
			returnValue = {
				...returnValue,
				[key]: value
			};
		}
		if (isRoot && source.hooks !== void 0) {
			const { value: hookValue, isReplace } = getReplaceState(source.hooks);
			hooks = isReplace ? mergeHooks({}, hookValue) : mergeHooks(hooks, hookValue);
			returnValue.hooks = hooks;
		}
		if (isRoot && isObject(source.headers)) {
			const { value: headerValue, isReplace } = getReplaceState(source.headers);
			headers = mergeHeaderContainers(isReplace ? {} : headers, headerValue);
			returnValue.headers = headers;
		}
	}
	if (searchParameters !== void 0) returnValue.searchParams = searchParameters;
	if (signals.length > 0) {
		if (signals.length === 1) returnValue.signal = signals[0];
		else if (supportsAbortSignal) returnValue.signal = AbortSignal.any(signals);
		else returnValue.signal = signals.at(-1);
	}
	if (isRoot) {
		for (const [key, value] of Object.entries(returnValue)) if (!userDataOptions.has(key)) returnValue[key] = resolveReplaceMarkers(value, /* @__PURE__ */ new Map());
	}
	return returnValue;
};
var deepMerge = (...sources) => deepMergeInternal(true, ...sources);
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/normalize.js
var normalizeRequestMethod = (input) => requestMethods.includes(input.toLowerCase()) ? input.toUpperCase() : input;
var caseInsensitiveMethods = /* @__PURE__ */ new Set([
	...requestMethods,
	"options",
	"trace"
]);
/**
Normalizes common methods for retry matching while preserving case-sensitive custom methods.
*/
var normalizeRetryMethod = (method) => caseInsensitiveMethods.has(method.toLowerCase()) ? method.toLowerCase() : method;
var defaultRetryOptions = {
	limit: 2,
	methods: [
		"get",
		"put",
		"head",
		"delete",
		"options",
		"trace",
		"query"
	],
	statusCodes: [
		408,
		413,
		429,
		500,
		502,
		503,
		504
	],
	afterStatusCodes: [
		413,
		429,
		503
	],
	maxRetryAfter: Number.POSITIVE_INFINITY,
	backoffLimit: Number.POSITIVE_INFINITY,
	delay: (attemptCount) => .3 * 2 ** (attemptCount - 1) * 1e3,
	jitter: void 0,
	retryOnTimeout: false
};
var normalizeRetryOptions = (retry = {}) => {
	if (typeof retry === "number") retry = { limit: retry };
	if (!isNonArrayObject(retry)) throw new TypeError("`retry` must be a number or an object");
	const normalizedRetry = {
		...defaultRetryOptions,
		...Object.fromEntries(Object.entries(retry).filter(([, value]) => value !== void 0))
	};
	if (!Number.isInteger(normalizedRetry.limit) || normalizedRetry.limit < 0) throw new TypeError("`retry.limit` must be a finite, non-negative integer");
	for (const key of [
		"methods",
		"statusCodes",
		"afterStatusCodes"
	]) if (!Array.isArray(normalizedRetry[key])) throw new Error(`retry.${key} must be an array`);
	for (const [key, isValid] of [
		["methods", (value) => typeof value === "string"],
		["statusCodes", (value) => Number.isInteger(value)],
		["afterStatusCodes", (value) => Number.isInteger(value)]
	]) if (normalizedRetry[key].some((value) => !isValid(value))) throw new TypeError(`\`retry.${key}\` must only contain ${key === "methods" ? "strings" : "numbers"}`);
	for (const key of ["maxRetryAfter", "backoffLimit"]) if (!isNonNegativeNumber(normalizedRetry[key])) throw new TypeError(`\`retry.${key}\` must be a non-negative number or \`Infinity\``);
	for (const key of ["delay", "shouldRetry"]) if (normalizedRetry[key] !== void 0 && typeof normalizedRetry[key] !== "function") throw new TypeError(`\`retry.${key}\` must be a function`);
	if (normalizedRetry.jitter !== void 0 && typeof normalizedRetry.jitter !== "boolean" && typeof normalizedRetry.jitter !== "function") throw new TypeError("`retry.jitter` must be a boolean or a function");
	if (typeof normalizedRetry.retryOnTimeout !== "boolean") throw new TypeError("`retry.retryOnTimeout` must be a boolean");
	normalizedRetry.methods = normalizedRetry.methods.map((method) => normalizeRetryMethod(method));
	normalizedRetry.statusCodes = [...normalizedRetry.statusCodes];
	normalizedRetry.afterStatusCodes = [...normalizedRetry.afterStatusCodes];
	return normalizedRetry;
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/timeout.js
async function timeout$1(request, init, abortController, options) {
	let timeoutId;
	let timedOut = false;
	try {
		return await new Promise((resolve, reject) => {
			timeoutId = setTimeout(() => {
				timedOut = true;
				abortController?.abort();
				reject(new TimeoutError(request));
			}, options.timeout);
			const { fetch } = options;
			fetch(request, init).then((response) => {
				if (timedOut) {
					cancelBody(response);
					return;
				}
				resolve(response);
			}).catch(reject);
		});
	} finally {
		clearTimeout(timeoutId);
	}
}
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/delay.js
async function delay(ms, { signal }) {
	return new Promise((resolve, reject) => {
		if (signal) {
			signal.throwIfAborted();
			signal.addEventListener("abort", abortHandler, { once: true });
		}
		function abortHandler() {
			clearTimeout(timeoutId);
			reject(signal.reason);
		}
		const timeoutId = setTimeout(() => {
			signal?.removeEventListener("abort", abortHandler);
			resolve();
		}, ms);
	});
}
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/options.js
var findUnknownOptions = (options) => {
	const unknownOptions = {};
	for (const key of Object.keys(options)) if (!Object.hasOwn(requestOptionsRegistry, key) && !Object.hasOwn(kyOptionKeys, key)) Object.defineProperty(unknownOptions, key, {
		value: options[key],
		writable: true,
		enumerable: true,
		configurable: true
	});
	return unknownOptions;
};
var hasSearchParameters = (search) => {
	if (search === void 0) return false;
	if (search === null) throw new TypeError("The `searchParams` option must not be `null`. Use `undefined` to clear it.");
	if (Array.isArray(search)) return search.length > 0;
	if (search instanceof URLSearchParams) return search.size > 0 || Boolean(search[deletedParametersSymbol]?.size);
	if (typeof search === "object") return Object.keys(search).length > 0;
	if (typeof search === "string") return search.trim().length > 0;
	return Boolean(search);
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/is-network-error.js
var errorMessages = /* @__PURE__ */ new Set([
	"network error",
	"NetworkError when attempting to fetch resource.",
	"The Internet connection appears to be offline.",
	"Network request failed",
	"fetch failed",
	"terminated",
	" A network error occurred.",
	"Network connection lost"
]);
function isRawNetworkError(error) {
	if (!(error && isError(error) && error.name === "TypeError" && typeof error.message === "string")) return false;
	const { message, stack } = error;
	if (message === "Load failed" || message.startsWith("Load failed (") && message.endsWith(")")) return stack === void 0 || "__sentry_captured__" in error;
	if (message.startsWith("error sending request for url")) return true;
	if (message === "Failed to fetch" || message.startsWith("Failed to fetch (") && message.endsWith(")")) return true;
	return errorMessages.has(message);
}
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/utils/type-guards.js
var isErrorType = (error, cls) => error instanceof cls || error?.isKyError === true && error?.name === cls.name;
/**
Type guard to check if an error is an `HTTPError`.

@param error - The error to check
@returns `true` if the error is an `HTTPError`, `false` otherwise

@example
```
import ky, {isHTTPError} from 'ky';
try {
const response = await ky.get('/api/data');
} catch (error) {
if (isHTTPError(error)) {
console.log('HTTP error status:', error.response.status);
}
}
```
*/
function isHTTPError(error) {
	return isErrorType(error, HTTPError);
}
/**
Type guard to check if an error is a `NetworkError`.

@param error - The error to check
@returns `true` if the error is a `NetworkError`, `false` otherwise

@example
```
import ky, {isNetworkError} from 'ky';
try {
const response = await ky.get('/api/data');
} catch (error) {
if (isNetworkError(error)) {
console.log('Network error:', error.request.url);
}
}
```
*/
function isNetworkError(error) {
	return isErrorType(error, NetworkError);
}
/**
Type guard to check if an error is a `TimeoutError`.

@param error - The error to check
@returns `true` if the error is a `TimeoutError`, `false` otherwise

@example
```
import ky, {isTimeoutError} from 'ky';
try {
const response = await ky.get('/api/data', { timeout: 1000 });
} catch (error) {
if (isTimeoutError(error)) {
console.log('Request timed out:', error.request.url);
}
}
```
*/
function isTimeoutError(error) {
	return isErrorType(error, TimeoutError);
}
/**
Type guard to check if an error is a `ForceRetryError`.

@param error - The error to check
@returns `true` if the error is a `ForceRetryError`, `false` otherwise

@example
```
import ky, {isForceRetryError} from 'ky';

const api = ky.extend({
hooks: {
beforeRetry: [
({error, retryCount}) => {
if (isForceRetryError(error)) {
console.log(`Forced retry #${retryCount}: ${error.code}`);
}
}
]
}
});
```
*/
function isForceRetryError(error) {
	return isErrorType(error, ForceRetryError);
}
/**
Type guard to check if an error is a `ResponseSizeError`.

@param error - The error to check
@returns `true` if the error is a `ResponseSizeError`, `false` otherwise

@example
```
import ky, {isResponseSizeError} from 'ky';

try {
await ky('https://example.com/data', {maxResponseSize: 1024}).json();
} catch (error) {
if (isResponseSizeError(error)) {
console.log(`Response exceeded ${error.maxResponseSize} bytes`);
}
}
```
*/
function isResponseSizeError(error) {
	return isErrorType(error, ResponseSizeError);
}
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/core/retry-timing.js
var timestampThresholdSeconds = 1e9;
var delayPattern = /^\d+$/;
var months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
var imfDatePattern = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{2}):(\d{2}):(\d{2}) GMT$/;
var rfc850DatePattern = /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{2}):(\d{2}):(\d{2}) GMT$/;
var asctimeDatePattern = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{2}| \d) (\d{2}:\d{2}:\d{2}) (\d{4})$/;
var getRetryTimingHeader = (headers) => {
	const retryAfter = headers.get("Retry-After");
	if (retryAfter !== null) return {
		value: retryAfter,
		allowTimestamp: false
	};
	const rateLimitReset = headers.get("RateLimit-Reset");
	if (rateLimitReset !== null) return {
		value: rateLimitReset,
		allowTimestamp: true
	};
	const rateLimitRetryAfter = headers.get("X-RateLimit-Retry-After");
	if (rateLimitRetryAfter !== null) return {
		value: rateLimitRetryAfter,
		allowTimestamp: false
	};
	const rateLimitResetAlias = headers.get("X-RateLimit-Reset") ?? headers.get("X-Rate-Limit-Reset");
	if (rateLimitResetAlias !== null) return {
		value: rateLimitResetAlias,
		allowTimestamp: true
	};
};
var createTimestamp = ({ year, month, day, hours, minutes, seconds }) => {
	const monthIndex = months.indexOf(month);
	const dayNumber = Number(day);
	const hoursNumber = Number(hours);
	const minutesNumber = Number(minutes);
	const secondsNumber = Number(seconds);
	if (monthIndex === -1 || hoursNumber > 23 || minutesNumber > 59 || secondsNumber > 60) return;
	const normalizedSeconds = Math.min(secondsNumber, 59);
	const date = new Date(Date.UTC(year, monthIndex, dayNumber, hoursNumber, minutesNumber, normalizedSeconds));
	date.setUTCFullYear(year);
	const timestamp = date.getTime();
	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== monthIndex || date.getUTCDate() !== dayNumber || date.getUTCHours() !== hoursNumber || date.getUTCMinutes() !== minutesNumber || date.getUTCSeconds() !== normalizedSeconds) return;
	return secondsNumber === 60 ? timestamp + 1e3 : timestamp;
};
var getCapture = (match, index) => match[index];
var parseDate = (value) => {
	const imfDate = imfDatePattern.exec(value);
	if (imfDate) return createTimestamp({
		year: Number(getCapture(imfDate, 3)),
		month: getCapture(imfDate, 2),
		day: getCapture(imfDate, 1),
		hours: getCapture(imfDate, 4),
		minutes: getCapture(imfDate, 5),
		seconds: getCapture(imfDate, 6)
	});
	const rfc850Date = rfc850DatePattern.exec(value);
	if (rfc850Date) {
		const now = /* @__PURE__ */ new Date();
		const twoDigitYear = Number(getCapture(rfc850Date, 3));
		const currentCenturyYear = Math.floor(now.getUTCFullYear() / 100) * 100 + twoDigitYear;
		const fiftyYearsFromNow = Date.UTC(now.getUTCFullYear() + 50, now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
		let timestamp;
		for (const year of [
			currentCenturyYear - 100,
			currentCenturyYear,
			currentCenturyYear + 100
		]) {
			const candidateTimestamp = createTimestamp({
				year,
				month: getCapture(rfc850Date, 2),
				day: getCapture(rfc850Date, 1),
				hours: getCapture(rfc850Date, 4),
				minutes: getCapture(rfc850Date, 5),
				seconds: getCapture(rfc850Date, 6)
			});
			if (candidateTimestamp !== void 0 && candidateTimestamp <= fiftyYearsFromNow) timestamp = candidateTimestamp;
		}
		return timestamp;
	}
	const asctimeDate = asctimeDatePattern.exec(value);
	if (asctimeDate) {
		const [hours, minutes, seconds] = getCapture(asctimeDate, 4).split(":");
		return createTimestamp({
			year: Number(getCapture(asctimeDate, 5)),
			month: getCapture(asctimeDate, 2),
			day: getCapture(asctimeDate, 3).trim(),
			hours,
			minutes,
			seconds
		});
	}
};
var calculateRetryTimingDelay = ({ value, allowTimestamp }) => {
	if (delayPattern.test(value)) {
		let delay = Number(value) * 1e3;
		if (allowTimestamp && Number(value) >= timestampThresholdSeconds) delay -= Date.now();
		return Math.max(0, delay);
	}
	const timestamp = parseDate(value);
	if (timestamp === void 0) return;
	return Math.max(0, timestamp - Date.now());
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/core/Ky.js
var maxErrorResponseBodySize = 10485760;
var prefixUrlRenamedErrorMessage = "The `prefixUrl` option has been renamed `prefix` in v2 and enhanced to allow slashes in input. See also the new `baseUrl` option for improved flexibility with standard URL resolution: https://github.com/sindresorhus/ky#baseurl";
var timedOut = Symbol("timedOut");
var getCurrentTime = () => globalThis.performance?.now() ?? Date.now();
var raceWithTimeout = (promise, milliseconds) => Promise.race([promise, new Promise((resolve) => {
	const timeoutId = setTimeout(() => {
		resolve(timedOut);
	}, milliseconds);
	promise.finally(() => {
		clearTimeout(timeoutId);
	}).catch(() => void 0);
})]);
var cancelReturnedBody = (value) => {
	if (isResponse(value) || isRequest(value)) cancelBody(value);
};
var releaseWhenSettled = (operationPromise) => {
	operationPromise.then((value) => {
		cancelReturnedBody(value);
	}).catch(() => void 0);
};
var createTextDecoder = (contentType) => {
	const match = /;\s*charset\s*=\s*(?:"([^"]+)"|([^;,\s]+))/i.exec(contentType);
	const charset = match?.[1] ?? match?.[2];
	if (charset) try {
		return new TextDecoder(charset);
	} catch {}
	return new TextDecoder();
};
var isJsonContentType = (contentType) => {
	const mimeType = (contentType.split(";", 1)[0] ?? "").trim().toLowerCase();
	if (!mimeType.endsWith("json")) return false;
	const separator = mimeType.at(-5);
	if (separator === "/") return true;
	if (separator !== "." && separator !== "+" && separator !== "-") return false;
	return mimeType.includes("/");
};
var readResponseText = async (response, milliseconds) => {
	const { body } = response;
	if (!body) try {
		return await response.text();
	} catch {
		return;
	}
	let reader;
	try {
		reader = body.getReader();
	} catch {
		return;
	}
	const contentType = response.headers.get("content-type") ?? "";
	const decoder = isJsonContentType(contentType) ? new TextDecoder() : createTextDecoder(contentType);
	const chunks = [];
	let totalBytes = 0;
	const result = await raceWithTimeout((async () => {
		try {
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				totalBytes += value.byteLength;
				if (totalBytes > maxErrorResponseBodySize) {
					reader.cancel().catch(() => void 0);
					return;
				}
				chunks.push(decoder.decode(value, { stream: true }));
			}
		} catch (error) {
			if (isResponseSizeError(error)) throw error;
			return;
		}
		chunks.push(decoder.decode());
		return chunks.join("");
	})(), milliseconds);
	if (result === timedOut) reader.cancel().catch(() => void 0);
	return result;
};
var invalidSchemaMessage = "The `schema` argument must follow the Standard Schema specification";
var missingResponseMessage = "The request resolved without a response, so there is no body to read. This happens when a `beforeRetry` hook returns `ky.stop`. Throw from the hook instead of returning `ky.stop`.";
var validateTimeoutOption = (value, name) => {
	if (value === false) return;
	if (!isNonNegativeNumber(value)) throw new TypeError(`The \`${name}\` option must be a non-negative number or \`false\``);
	if (value > 2147483647) throw new RangeError(`The \`${name}\` option cannot be greater than ${maxSafeTimeout}`);
};
var withAttemptDefaults = ({ throwHttpErrors = true, timeout = 1e4, fetch = globalThis.fetch.bind(globalThis) }) => ({
	throwHttpErrors,
	timeout,
	fetch
});
var validateCallbackOptions = (options) => {
	for (const key of [
		"parseJson",
		"stringifyJson",
		"fetch",
		"onDownloadProgress",
		"onUploadProgress"
	]) if (options[key] !== void 0 && typeof options[key] !== "function") throw new TypeError(`The \`${key}\` option must be a function`);
	const { throwHttpErrors } = options;
	if (typeof throwHttpErrors !== "boolean" && typeof throwHttpErrors !== "function") throw new TypeError("The `throwHttpErrors` option must be a boolean or a function");
};
var leadingC0ControlOrSpacePattern = /^[\0-\u0020]+/g;
var asciiTabOrNewLinePattern = /[\t\n\r]/g;
var schemePattern = /^[a-z][\d+.a-z-]*:/i;
var malformedHttpProtocolPattern = /^https?:(?!\/\/)/i;
var isAbsoluteInput = (input) => schemePattern.test(input);
var normalizeInputForProtocolCheck = (input) => input.replaceAll(leadingC0ControlOrSpacePattern, "").replaceAll(asciiTabOrNewLinePattern, "");
var resolveInput = (input, prefix, baseUrl) => {
	if (typeof input !== "string") return input;
	if (prefix) input = `${prefix.replace(/\/+$/, "")}/${input.replace(/^\/+/, "")}`;
	if (baseUrl) {
		const normalizedInput = normalizeInputForProtocolCheck(input);
		if (malformedHttpProtocolPattern.test(normalizedInput)) throw new TypeError("`input` url protocol must be followed by `//` when using `baseUrl`");
		if (!isAbsoluteInput(normalizedInput)) return new URL(input, new Request(baseUrl).url);
	}
	return input;
};
var deleteSearchParameter = (url, key) => {
	if (url.searchParams.has(key)) url.searchParams.delete(key);
};
var applySearchParameters = (url, searchParameters) => {
	const deleted = searchParameters?.[deletedParametersSymbol];
	if (deleted) for (const key of deleted) deleteSearchParameter(url, key);
	if (typeof searchParameters === "string") {
		const stringSearchParameters = searchParameters.replace(/^\?/, "");
		if (stringSearchParameters !== "") url.search = url.search ? `${url.search}&${stringSearchParameters}` : `?${stringSearchParameters}`;
	} else if (isNonArrayObject(searchParameters) && !(searchParameters instanceof URLSearchParams)) for (const [key, value] of Object.entries(searchParameters)) if (value === void 0) deleteSearchParameter(url, key);
	else url.searchParams.append(key, value);
	else for (const [key, value] of new URLSearchParams(searchParameters)) url.searchParams.append(key, value);
};
function cloneInitHookOptions(options) {
	return {
		...options,
		headers: mergeHeaderContainers({}, options.headers ?? {}),
		context: { ...options.context },
		json: cloneDeep(options.json),
		searchParams: cloneSearchParameters(options.searchParams),
		retry: cloneDeep(options.retry)
	};
}
var validateJsonWithSchema = async (jsonValue, schema) => {
	const standardSchema = isObject(schema) || typeof schema === "function" ? schema["~standard"] : void 0;
	if (!isObject(standardSchema) || typeof standardSchema.validate !== "function") throw new TypeError(invalidSchemaMessage);
	const validationResult = await standardSchema.validate(jsonValue);
	if (validationResult.issues) throw new SchemaValidationError(validationResult.issues);
	return validationResult.value;
};
var Ky = class Ky {
	static create(input, options) {
		const initHooks = options.hooks?.init ?? [];
		const initHookOptions = initHooks.length > 0 ? cloneInitHookOptions(options) : options;
		for (const hook of initHooks) hook(initHookOptions);
		const ky = new Ky(input, initHookOptions);
		const result = (async () => {
			let response;
			try {
				response = await ky.#run();
				return response;
			} catch (error) {
				return await ky.#throwProcessedError(error);
			} finally {
				const originalRequest = ky.#originalRequest;
				cancelBody(originalRequest, response);
				if (originalRequest && ky.request !== originalRequest) cancelBody(ky.request, response);
			}
		})();
		for (const type of getSupportedResponseTypes()) {
			const mimeType = responseTypes[type];
			result[type] = async (schema) => {
				if (ky.request !== ky.#originalRequest) ky.request.headers.set("accept", ky.request.headers.get("accept") || mimeType);
				const response = await result;
				if (response === void 0) throw new TypeError(missingResponseMessage);
				if (type !== "json") return ky.#raceBodyRead(async () => response[type](), response);
				const text = await ky.#raceBodyRead(async () => response.text(), response);
				const request = ky.#getResponseRequest(response);
				let parsedResult;
				try {
					parsedResult = await ky.#raceWithTotalTimeout(async () => {
						const jsonValue = text === "" && schema !== void 0 && !ky.#options.parseJson ? void 0 : await ky.#parseJson(text, request, response);
						if (schema === void 0) return jsonValue;
						return await validateJsonWithSchema(jsonValue, schema);
					});
				} catch (error) {
					if (ky.#userProvidedAbortSignal?.aborted) await ky.#throwProcessedError(ky.#userProvidedAbortSignal.reason, request);
					throw error;
				}
				if (parsedResult === timedOut) await ky.#throwProcessedError(new TimeoutError(request), request);
				return parsedResult;
			};
		}
		return result;
	}
	request;
	#abortController;
	#retryCount = 0;
	#retryLimit;
	#options;
	#requestInput;
	#originalRequest;
	#requestBodyCanBeCancelled = false;
	#userProvidedAbortSignal;
	#beforeRetryHookErrors = /* @__PURE__ */ new WeakSet();
	#cachedNormalizedOptions;
	#deadline;
	#hookResponses = /* @__PURE__ */ new WeakSet();
	#responseRequests = /* @__PURE__ */ new WeakMap();
	#decoratedResponses = /* @__PURE__ */ new WeakSet();
	constructor(input, options = {}) {
		if (typeof input !== "string" && !(input instanceof URL || input instanceof globalThis.Request)) throw new TypeError("`input` must be a string, URL, or Request");
		const { maxResponseSize = Number.POSITIVE_INFINITY, totalTimeout = false } = options;
		if (Object.hasOwn(options, "prefixUrl")) throw new Error(prefixUrlRenamedErrorMessage);
		for (const key of [
			"headers",
			"method",
			"prefix",
			"baseUrl",
			"referrer",
			"referrerPolicy"
		]) if (options[key] === null) throw new TypeError(`The \`${key}\` option must not be \`null\`. Use \`undefined\` to clear it.`);
		if (options.context !== void 0 && !isNonArrayObject(options.context)) throw new TypeError("The `context` option must be an object");
		this.#options = {
			...options,
			headers: mergeHeaders(input.headers, options.headers),
			hooks: mergeHooks({}, options.hooks),
			method: normalizeRequestMethod(options.method ?? input.method ?? "GET"),
			referrer: options.referrer ?? input.referrer,
			referrerPolicy: options.referrerPolicy ?? input.referrerPolicy,
			prefix: String(options.prefix || ""),
			retry: normalizeRetryOptions(options.retry),
			...withAttemptDefaults(options),
			totalTimeout,
			maxResponseSize,
			context: options.context ?? {}
		};
		validateCallbackOptions(this.#options);
		validateTimeoutOption(this.#options.timeout, "timeout");
		validateTimeoutOption(totalTimeout, "totalTimeout");
		this.#retryLimit = this.#options.retry.limit;
		if (maxResponseSize !== Number.POSITIVE_INFINITY && (!Number.isSafeInteger(maxResponseSize) || maxResponseSize < 0)) throw new TypeError("The `maxResponseSize` option must be a non-negative safe integer or Infinity");
		this.#requestInput = input instanceof globalThis.Request ? input : void 0;
		input = resolveInput(input, this.#options.prefix, this.#options.baseUrl);
		if (supportsAbortController && supportsAbortSignal) {
			this.#userProvidedAbortSignal = this.#options.signal ?? this.#requestInput?.signal;
			this.#abortController = new globalThis.AbortController();
			this.#options.signal = this.#createManagedSignal();
		}
		if (supportsRequestStreams) this.#options.duplex = "half";
		const userProvidedContentType = options.headers !== void 0 && mergeHeaders({}, options.headers).has("content-type");
		if (this.#options.json !== void 0) {
			this.#options.body = this.#options.stringifyJson?.(this.#options.json) ?? JSON.stringify(this.#options.json);
			if (!userProvidedContentType) this.#options.headers.set("content-type", "application/json");
		}
		if (input instanceof globalThis.Request && (supportsFormData && this.#options.body instanceof globalThis.FormData || this.#options.body instanceof URLSearchParams) && !userProvidedContentType) this.#options.headers.delete("content-type");
		this.request = new globalThis.Request(input, this.#options);
		this.#requestBodyCanBeCancelled = typeof globalThis.ReadableStream === "function" && this.#options.body instanceof globalThis.ReadableStream;
		const { searchParams } = this.#options;
		if (hasSearchParameters(searchParams)) {
			const url = new URL(this.request.url);
			applySearchParameters(url, searchParams);
			if (url.href !== this.request.url) {
				const { body: inheritedBody, cache, credentials, integrity, keepalive, mode, redirect, referrer, referrerPolicy } = this.request;
				const canUseInheritedBody = supportsRequestStreams && !keepalive && mode !== "no-cors";
				this.request = new globalThis.Request(url, {
					...this.#options,
					cache,
					credentials,
					integrity,
					keepalive,
					mode,
					redirect,
					referrer,
					referrerPolicy,
					body: this.#options.body ?? (canUseInheritedBody ? inheritedBody : void 0)
				});
			}
		}
		this.#deadline = typeof totalTimeout === "number" ? getCurrentTime() + totalTimeout : Number.POSITIVE_INFINITY;
	}
	async #run() {
		await Promise.resolve();
		const beforeRequestResponse = await this.#runBeforeRequestHooks();
		if (beforeRequestResponse !== void 0) this.#retryLimit = normalizeRetryOptions(this.#options.retry).limit;
		let response = beforeRequestResponse ?? await this.#retry();
		for (;;) {
			if (response === void 0) return;
			const responseFromHook = this.#hookResponses.has(response);
			let retryError;
			try {
				response = await this.#runAfterResponseHooks(response);
			} catch (error) {
				if (!isForceRetryError(error)) throw error;
				retryError = error;
			}
			if (retryError === void 0) {
				const currentResponse = response;
				if (currentResponse.ok || currentResponse.type === "opaque" || !this.#shouldThrowHttpErrors(currentResponse)) break;
				const httpError = new HTTPError(currentResponse, this.#getResponseRequest(currentResponse), this.#getNormalizedOptions());
				httpError.data = await this.#getResponseData(currentResponse);
				this.#throwIfAbortedByUser();
				this.#throwIfTotalTimeoutExhausted();
				if (responseFromHook) throw httpError;
				retryError = httpError;
			}
			response = await this.#retryFromError(retryError);
		}
		this.#decorateResponse(response);
		if (this.#options.onDownloadProgress) {
			if (!supportsResponseStreams) throw new Error("Streams are not supported in your environment. `ReadableStream` is missing.");
			const progressResponse = streamResponse(response, this.#options.onDownloadProgress);
			this.#setResponseRequest(progressResponse, this.#getResponseRequest(response));
			return this.#decorateResponse(progressResponse);
		}
		return response;
	}
	#calculateDelay(retry, error) {
		const retryDelay = retry.delay(this.#retryCount + 1);
		if (!isNonNegativeNumber(retryDelay)) throw new TypeError("`retry.delay` must return a non-negative number or `Infinity`", { cause: error });
		let jitteredDelay = retryDelay;
		if (retry.jitter === true) jitteredDelay = Math.random() * retryDelay;
		else if (typeof retry.jitter === "function") {
			jitteredDelay = retry.jitter(retryDelay);
			if (!Number.isFinite(jitteredDelay) || jitteredDelay < 0) jitteredDelay = retryDelay;
		}
		return Math.min(retry.backoffLimit, jitteredDelay);
	}
	async #calculateRetryDelay(error) {
		const retry = normalizeRetryOptions(this.#options.retry);
		if (this.#retryCount >= Math.min(retry.limit, this.#retryLimit)) throw error;
		const errorObject = NonError.wrap(error);
		if (isForceRetryError(errorObject)) return errorObject.customDelay ?? this.#calculateDelay(retry, error);
		if (!retry.methods.includes(normalizeRetryMethod(this.request.method))) throw error;
		let shouldRetryOverride = false;
		const { shouldRetry } = retry;
		if (shouldRetry !== void 0) {
			const result = await this.#raceWithTotalTimeout(async () => shouldRetry({
				error: errorObject,
				retryCount: this.#retryCount + 1
			}));
			this.#throwIfAbortedByUser();
			if (result === timedOut) throw new TimeoutError(this.#sentRequest);
			if (result === false) throw error;
			shouldRetryOverride = result === true;
		}
		if (isTimeoutError(error)) {
			if (!shouldRetryOverride && !retry.retryOnTimeout) throw error;
			return this.#calculateDelay(retry, error);
		}
		if (isHTTPError(error)) {
			if (!shouldRetryOverride && !retry.statusCodes.includes(error.response.status)) throw error;
			const retryTimingHeader = getRetryTimingHeader(error.response.headers);
			if (retryTimingHeader && retry.afterStatusCodes.includes(error.response.status)) {
				const after = calculateRetryTimingDelay(retryTimingHeader);
				if (after === void 0) return this.#calculateDelay(retry, error);
				return Math.min(retry.maxRetryAfter, after);
			}
			if (!shouldRetryOverride && error.response.status === 413) throw error;
			return this.#calculateDelay(retry, error);
		}
		if (!shouldRetryOverride && !isNetworkError(error)) throw error;
		return this.#calculateDelay(retry, error);
	}
	#decorateResponse(response) {
		if (!this.#options.parseJson || this.#decoratedResponses.has(response)) return response;
		this.#decoratedResponses.add(response);
		const request = this.#getResponseRequest(response);
		response.json = async () => this.#parseJson(await response.text(), request, response);
		const nativeClone = response.clone.bind(response);
		response.clone = () => this.#decorateResponse(this.#setResponseRequest(nativeClone(), request));
		return response;
	}
	async #throwProcessedError(error, request = this.#sentRequest) {
		if (!isError(error)) throw error;
		if (this.#beforeRetryHookErrors.has(error)) throw error;
		let processedError = error;
		for (const hook of this.#options.hooks.beforeError) {
			const hookResult = await hook({
				request,
				options: this.#getNormalizedOptions(),
				error: processedError,
				retryCount: this.#retryCount
			});
			if (isError(hookResult)) processedError = hookResult;
		}
		throw processedError;
	}
	async #getResponseData(response) {
		const request = this.#getResponseRequest(response);
		const throwIfTotalTimeoutReached = ({ fromTotalTimeout }) => {
			if (fromTotalTimeout) throw new TimeoutError(request);
			this.#throwIfTotalTimeoutExhausted(request);
		};
		const readTimeout = this.#getErrorDataTimeout(request);
		const text = await readResponseText(response, readTimeout.milliseconds);
		if (text === timedOut) {
			throwIfTotalTimeoutReached(readTimeout);
			return;
		}
		if (!text) return;
		if (!isJsonContentType(response.headers.get("content-type") ?? "")) return text;
		const parseTimeout = this.#getErrorDataTimeout(request);
		const data = await raceWithTimeout(Promise.resolve().then(() => this.#parseJson(text, request, response)), parseTimeout.milliseconds).catch(() => void 0);
		if (data === timedOut) {
			throwIfTotalTimeoutReached(parseTimeout);
			return;
		}
		return data;
	}
	#getErrorDataTimeout(request) {
		const errorDataTimeout = this.#options.timeout === false ? 1e4 : this.#options.timeout;
		const remainingTotal = this.#getRemainingTotalTimeout();
		if (remainingTotal === 0) throw new TimeoutError(request);
		return {
			milliseconds: Math.min(errorDataTimeout, remainingTotal),
			fromTotalTimeout: remainingTotal <= errorDataTimeout
		};
	}
	#getEffectiveTimeout() {
		const remainingTotal = this.#getRemainingTotalTimeout();
		if (remainingTotal === 0) throw new TimeoutError(this.#sentRequest);
		const effectiveTimeout = Math.min(this.#options.timeout === false ? Number.POSITIVE_INFINITY : this.#options.timeout, remainingTotal);
		return effectiveTimeout === Number.POSITIVE_INFINITY ? void 0 : effectiveTimeout;
	}
	async #raceBodyRead(createBodyPromise, response) {
		const failedRequest = this.#getResponseRequest(response);
		let timeoutMilliseconds;
		try {
			timeoutMilliseconds = this.#getEffectiveTimeout();
		} catch (error) {
			await this.#throwProcessedError(error, failedRequest);
		}
		const bodyPromise = createBodyPromise();
		let result;
		try {
			result = timeoutMilliseconds === void 0 ? await bodyPromise : await raceWithTimeout(bodyPromise, timeoutMilliseconds);
		} catch (error) {
			if (this.#userProvidedAbortSignal?.aborted) await this.#throwProcessedError(this.#userProvidedAbortSignal.reason, failedRequest);
			if (this.#getRemainingTotalTimeout() !== 0) {
				if (isRawNetworkError(error)) await this.#throwProcessedError(new NetworkError(failedRequest, { cause: error }), failedRequest);
				await this.#throwProcessedError(error, failedRequest);
			}
			result = timedOut;
		}
		if (this.#userProvidedAbortSignal?.aborted) await this.#throwProcessedError(this.#userProvidedAbortSignal.reason, failedRequest);
		if (result === timedOut || this.#getRemainingTotalTimeout() === 0) {
			this.#abortController?.abort();
			await this.#throwProcessedError(new TimeoutError(failedRequest), failedRequest);
		}
		return result;
	}
	async #raceWithTotalTimeout(operation) {
		const abortSignal = this.#userProvidedAbortSignal;
		abortSignal?.throwIfAborted();
		const remainingTotal = this.#getRemainingTotalTimeout();
		if (remainingTotal === 0) {
			this.#abortController?.abort();
			return timedOut;
		}
		let timeoutId;
		let abortListener;
		let operationPromise;
		try {
			const abortPromise = new Promise((_resolve, reject) => {
				if (!abortSignal) return;
				abortListener = () => {
					reject(abortSignal.reason);
				};
				abortSignal.addEventListener("abort", abortListener, { once: true });
			});
			operationPromise = operation();
			if (remainingTotal === Number.POSITIVE_INFINITY) return await Promise.race([operationPromise, abortPromise]);
			const timeoutPromise = new Promise((resolve) => {
				timeoutId = setTimeout(() => {
					resolve(timedOut);
				}, remainingTotal);
			});
			const result = await Promise.race([
				operationPromise,
				timeoutPromise,
				abortPromise
			]);
			if (result === timedOut || this.#getRemainingTotalTimeout() === 0) {
				this.#abortController?.abort();
				if (result === timedOut) releaseWhenSettled(operationPromise);
				else cancelReturnedBody(result);
				return timedOut;
			}
			return result;
		} catch (error) {
			if (abortSignal?.aborted) {
				if (operationPromise) releaseWhenSettled(operationPromise);
				abortSignal.throwIfAborted();
			}
			if (this.#getRemainingTotalTimeout() === 0) {
				this.#abortController?.abort();
				return timedOut;
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
			if (abortListener) abortSignal?.removeEventListener("abort", abortListener);
		}
	}
	#parseJson(text, request, response) {
		const { parseJson } = this.#options;
		return parseJson ? parseJson(text, {
			request,
			response
		}) : JSON.parse(text);
	}
	#createManagedSignal() {
		return this.#userProvidedAbortSignal ? AbortSignal.any([this.#userProvidedAbortSignal, this.#abortController.signal]) : this.#abortController.signal;
	}
	#shouldThrowHttpErrors(response) {
		const { throwHttpErrors } = this.#options;
		try {
			return typeof throwHttpErrors === "function" ? throwHttpErrors(response.status) : throwHttpErrors;
		} catch (error) {
			cancelBody(response);
			throw error;
		}
	}
	get #sentRequest() {
		return this.#originalRequest ?? this.request;
	}
	#throwIfTotalTimeoutExhausted(request = this.#sentRequest) {
		if (this.#getRemainingTotalTimeout() === 0) throw new TimeoutError(request);
	}
	async #runBeforeRequestHooks() {
		for (const hook of this.#options.hooks.beforeRequest) {
			const result = await this.#raceWithTotalTimeout(async () => hook({
				request: this.request,
				options: this.#getNormalizedOptions(),
				retryCount: 0
			}));
			if (result === timedOut) throw new TimeoutError(this.#sentRequest);
			if (isRequest(result)) this.#assignRequest(this.#withManagedSignal(result));
			else if (isResponse(result)) {
				this.#hookResponses.add(result);
				return result;
			}
		}
	}
	async #runAfterResponseHooks(response) {
		const responseRequest = this.#getResponseRequest(response);
		response = this.#limitResponseSize(response);
		for (const hook of this.#options.hooks.afterResponse) {
			const hookResponse = this.#setResponseRequest(response.clone(), responseRequest);
			this.#decorateResponse(hookResponse);
			let modifiedResponse;
			try {
				modifiedResponse = await this.#raceWithTotalTimeout(async () => hook({
					request: this.request,
					options: this.#getNormalizedOptions(),
					response: hookResponse,
					retryCount: this.#retryCount
				}));
				if (modifiedResponse === timedOut) throw new TimeoutError(this.#sentRequest);
				if (isRetryMarker(modifiedResponse)) throw new ForceRetryError(modifiedResponse.options);
			} catch (error) {
				cancelBody(hookResponse);
				cancelBody(response);
				throw error;
			}
			const nextResponse = isResponse(modifiedResponse) ? this.#setResponseRequest(modifiedResponse, responseRequest) : response;
			cancelBody(hookResponse, nextResponse);
			cancelBody(response, nextResponse);
			if (nextResponse !== response) response = this.#limitResponseSize(nextResponse);
		}
		return response;
	}
	async #retry() {
		try {
			return await this.#fetch();
		} catch (error) {
			return this.#retryFromError(error);
		}
	}
	async #retryFromError(error) {
		this.#throwIfAbortedByUser();
		const retryDelay = Math.min(await this.#calculateRetryDelay(error), maxSafeTimeout);
		const delayOptions = { signal: this.#userProvidedAbortSignal };
		const remainingTimeout = this.#getRemainingTotalTimeout();
		if (remainingTimeout === 0) throw new TimeoutError(this.#sentRequest);
		if (retryDelay >= remainingTimeout) {
			await delay(remainingTimeout, delayOptions);
			throw new TimeoutError(this.#sentRequest);
		}
		await delay(retryDelay, delayOptions);
		this.#throwIfTotalTimeoutExhausted();
		if (this.#abortController?.signal.aborted) {
			this.#abortController = new globalThis.AbortController();
			this.#options.signal = this.#createManagedSignal();
			this.#assignRequest(this.#withManagedSignal(this.request), this.#requestBodyCanBeCancelled);
		}
		if (isForceRetryError(error) && error.customRequest) this.#assignRequest(this.#withManagedSignal(error.customRequest));
		for (const hook of this.#options.hooks.beforeRetry) {
			let hookResult;
			try {
				hookResult = await this.#raceWithTotalTimeout(async () => hook({
					request: this.request,
					options: this.#getNormalizedOptions(),
					error: NonError.wrap(error),
					retryCount: this.#retryCount + 1
				}));
			} catch (hookError) {
				this.#throwIfAbortedByUser();
				if (isError(hookError) && hookError !== error) this.#beforeRetryHookErrors.add(hookError);
				throw hookError;
			}
			if (hookResult === timedOut) throw new TimeoutError(this.#sentRequest);
			if (isRequest(hookResult)) {
				this.#assignRequest(this.#withManagedSignal(hookResult));
				break;
			}
			if (isResponse(hookResult)) {
				this.#hookResponses.add(hookResult);
				this.#retryCount++;
				return hookResult;
			}
			if (hookResult === stop) return;
			if (isNonArrayObject(hookResult)) this.#applyBeforeRetryOptions(hookResult.options);
		}
		this.#throwIfTotalTimeoutExhausted();
		this.#retryCount++;
		return this.#retry();
	}
	async #fetch() {
		cancelBody(this.#originalRequest, this.request);
		const nonRequestOptions = findUnknownOptions(this.#options);
		this.#retryLimit = normalizeRetryOptions(this.#options.retry).limit;
		const retryRequest = this.#retryLimit > 0 ? this.#withManagedSignal(this.request.clone()) : void 0;
		const request = this.#wrapRequestWithUploadProgress(this.request);
		this.#originalRequest = request;
		if (retryRequest) {
			this.request = retryRequest;
			this.#requestBodyCanBeCancelled = true;
		}
		try {
			const effectiveTimeout = this.#getEffectiveTimeout();
			const { fetch } = this.#options;
			const response = effectiveTimeout === void 0 ? await fetch(request, nonRequestOptions) : await timeout$1(request, nonRequestOptions, this.#abortController, {
				timeout: effectiveTimeout,
				fetch
			});
			if (!isResponse(response)) throw new TypeError("The `fetch` option must resolve with a `Response`");
			if (this.#getRemainingTotalTimeout() === 0) {
				this.#abortController?.abort();
				cancelBody(response);
				throw new TimeoutError(request);
			}
			return this.#setResponseRequest(response, request);
		} catch (error) {
			this.#throwIfAbortedByUser();
			if (this.#getRemainingTotalTimeout() === 0) {
				this.#abortController?.abort();
				throw new TimeoutError(request);
			}
			if (isRawNetworkError(error)) throw new NetworkError(request, { cause: error });
			throw error;
		}
	}
	#throwIfAbortedByUser() {
		this.#userProvidedAbortSignal?.throwIfAborted();
	}
	#getRemainingTotalTimeout() {
		return Math.max(0, this.#deadline - getCurrentTime());
	}
	#applyBeforeRetryOptions(options) {
		if (!isNonArrayObject(options)) throw new TypeError("The `options` returned from a `beforeRetry` hook must be an object");
		for (const key of Object.keys(options)) if (!beforeRetryOptionKeys.includes(key)) throw new TypeError(`The \`${key}\` option cannot be changed from a \`beforeRetry\` hook`);
		const mergedOptions = {
			...this.#options,
			...options
		};
		const updatedOptions = {
			...mergedOptions,
			...withAttemptDefaults(mergedOptions)
		};
		validateCallbackOptions(updatedOptions);
		validateTimeoutOption(updatedOptions.timeout, "timeout");
		Object.assign(this.#options, updatedOptions);
		this.#cachedNormalizedOptions = void 0;
	}
	#getNormalizedOptions() {
		if (!this.#cachedNormalizedOptions) {
			const { hooks, json, parseJson, stringifyJson, searchParams, timeout, totalTimeout, maxResponseSize, throwHttpErrors, fetch, ...normalizedOptions } = this.#options;
			this.#cachedNormalizedOptions = Object.freeze(normalizedOptions);
		}
		return this.#cachedNormalizedOptions;
	}
	#assignRequest(request, requestBodyCanBeCancelled = false) {
		if (this.#requestBodyCanBeCancelled) cancelBody(this.request, request);
		this.#cachedNormalizedOptions = void 0;
		this.request = request;
		this.#requestBodyCanBeCancelled = requestBodyCanBeCancelled;
	}
	#withManagedSignal(request) {
		if (!this.#options.signal || !(request instanceof globalThis.Request)) return request;
		return new globalThis.Request(request, {
			signal: this.#options.signal,
			referrer: request.referrer,
			referrerPolicy: request.referrerPolicy
		});
	}
	#getResponseRequest(response) {
		return this.#responseRequests.get(response) ?? this.#sentRequest;
	}
	#setResponseRequest(response, request) {
		this.#responseRequests.set(response, request);
		return response;
	}
	#limitResponseSize(response) {
		const request = this.#getResponseRequest(response);
		return this.#setResponseRequest(limitResponseSize(response, request, this.#options.maxResponseSize), request);
	}
	#wrapRequestWithUploadProgress(request) {
		if (!this.#options.onUploadProgress || !supportsRequestStreams || !request.body) return request;
		return streamRequest(request, this.#options.onUploadProgress, this.#options.body);
	}
};
//#endregion
//#region node_modules/.pnpm/ky@2.2.0/node_modules/ky/distribution/index.js
/*! MIT License © Sindre Sorhus */
var createRequest = (input, getOptions) => {
	try {
		return Ky.create(input, getOptions());
	} catch (error) {
		const result = Promise.reject(error);
		for (const type of getSupportedResponseTypes()) result[type] = async () => result;
		return result;
	}
};
var createInstance = (defaults) => {
	const ky = (input, options) => createRequest(input, () => validateAndMerge(defaults, options));
	for (const method of requestMethods) ky[method] = (input, options) => createRequest(input, () => validateAndMerge(defaults, options, { method }));
	ky.create = (newDefaults) => createInstance(validateAndMerge(newDefaults));
	ky.extend = (newDefaults) => {
		if (typeof newDefaults === "function") newDefaults = newDefaults(validateAndMerge(cloneDeep(defaults)));
		return createInstance(validateAndMerge(defaults, newDefaults));
	};
	ky.stop = stop;
	ky.retry = retry;
	return ky;
};
var ky = createInstance();
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-RQG44QD7.js
var ENGINE_VERSION = "1.0.133";
var DEV_SETTINGS_TTL_MS = 36e5;
var HIT_HEADER = "x-twilight-dev-cache";
var FETCHED_AT_HEADER = "x-twilight-dev-fetched-at";
function devSettingsFetchedAt(headers) {
	const at = Number(headers?.get(FETCHED_AT_HEADER));
	return Number.isFinite(at) && at > 0 ? at : void 0;
}
var DROPPED_HEADERS = /* @__PURE__ */ new Set(["content-encoding", "content-length"]);
function isSettingsRequest(request) {
	if (request.method !== "GET") return false;
	try {
		return new URL(request.url).pathname.endsWith("/store/settings");
	} catch {
		return false;
	}
}
function hasSettings(body) {
	try {
		return Boolean(JSON.parse(body)?.data);
	} catch {
		return false;
	}
}
function keyOf(request) {
	const headers = [...request.headers].map(([name, value]) => `${name}: ${value}`).join("\n");
	return `${request.method} ${request.url}
${headers}`;
}
function createDevSettingsCache(options) {
	const { enabled, refreshToken, now = Date.now, ttlMs = DEV_SETTINGS_TTL_MS, onFirstHit } = options;
	const entries = /* @__PURE__ */ new Map();
	let announced = false;
	const isFresh = (entry) => now() - entry.fetchedAt < ttlMs && entry.refresh === refreshToken();
	const answerOf = (entry, hit) => {
		const headers = new Headers(entry.headers);
		headers.set(FETCHED_AT_HEADER, String(entry.fetchedAt));
		if (hit) headers.set(HIT_HEADER, "hit");
		return new Response(entry.body, {
			status: entry.status,
			statusText: entry.statusText,
			headers
		});
	};
	const lookup = ({ request }) => {
		if (!enabled() || !isSettingsRequest(request)) return;
		const key = keyOf(request);
		const entry = entries.get(key);
		if (!entry) return;
		if (!isFresh(entry)) {
			entries.delete(key);
			return;
		}
		if (!announced) {
			announced = true;
			onFirstHit?.();
		}
		return answerOf(entry, true);
	};
	const store = async ({ request, response }) => {
		if (!enabled() || !isSettingsRequest(request) || !response.ok) return;
		if (response.headers.has(HIT_HEADER)) return;
		const body = await response.text();
		if (!hasSettings(body)) return;
		for (const [key, entry2] of entries) if (now() - entry2.fetchedAt >= ttlMs) entries.delete(key);
		const entry = {
			body,
			status: response.status,
			statusText: response.statusText,
			headers: [...response.headers].filter(([name]) => !DROPPED_HEADERS.has(name)),
			fetchedAt: now(),
			refresh: refreshToken()
		};
		entries.set(keyOf(request), entry);
		return answerOf(entry, false);
	};
	return {
		lookup,
		store,
		clear: () => entries.clear()
	};
}
var readRefreshCookie = () => {
	try {
		return getCookie("twilight_dev_refresh") ?? null;
	} catch {
		return null;
	}
};
var devSettingsCache = createDevSettingsCache({
	enabled: () => false,
	refreshToken: readRefreshCookie,
	onFirstHit: () => console.warn(`[twilight] Store settings are reused for up to ${DEV_SETTINGS_TTL_MS / 6e4} minutes while you develop, to stay under the Salla API's rate limit. To see a change you made in the dashboard, press "Fetch fresh store data" in the theme editor's side panel: it also says when they were last fetched.`)
});
var readFallbackToken = () => {
	try {
		return getCookie("token") ?? null;
	} catch {
		return null;
	}
};
var getAuthToken = () => getTwilightContext().authToken ?? readFallbackToken();
var readRequestCurrency = () => {
	try {
		return toCurrencyCode(getCookie(CURRENCY_COOKIE_NAME));
	} catch {
		return null;
	}
};
function getActiveCurrency(fallback = null) {
	return (typeof document !== "undefined" ? extractCurrencyFromCookies(document.cookie) : readRequestCurrency()) ?? fallback;
}
var API_HEADERS = {
	ACCEPT: "accept",
	ACCEPT_LANGUAGE: "accept-language",
	APP_OS: "s-app-os",
	APP_VERSION: "s-app-version",
	RAY: "s-ray",
	SOURCE: "s-source",
	THEME_TYPE: "s-theme-type",
	STORE_API_VERSION: "s-store-api-version",
	REQUESTED_WITH: "x-requested-with",
	CF_PROXY_WHITELIST: "s-cf-proxy-whitelist-id",
	STORE_IDENTIFIER: "store-identifier",
	CURRENCY: "currency",
	AUTHORIZATION: "Authorization",
	VERSION_ID: "s-version-id",
	SCOPE_ID: "s-scope-id",
	SCOPE_TYPE: "s-scope-type",
	SCOPE_ALLOCATION_TYPE: "s-scope-allocation-type",
	SCOPE_ALLOCATION_ID: "s-scope-allocation-id",
	USER_AGENT: "user-agent"
};
var STORE_IDENTIFIER_HEADER = API_HEADERS.STORE_IDENTIFIER;
var getActiveScope = () => {
	const fromStorage = readSdkScope();
	if (fromStorage !== void 0) return fromStorage;
	if (typeof document !== "undefined") {
		const fromCookie = extractScopeFromCookies(document.cookie);
		if (fromCookie != null) return fromCookie;
	}
	try {
		return getTwilightContext().scope;
	} catch {
		return null;
	}
};
var sharedHeaders = (locale) => ({
	[API_HEADERS.ACCEPT]: "application/json",
	[API_HEADERS.ACCEPT_LANGUAGE]: locale,
	[API_HEADERS.APP_OS]: "browser",
	[API_HEADERS.APP_VERSION]: "2.14.363",
	[API_HEADERS.RAY]: "50",
	[API_HEADERS.SOURCE]: "twilight",
	[API_HEADERS.THEME_TYPE]: "react",
	[API_HEADERS.STORE_API_VERSION]: "swoole",
	[API_HEADERS.REQUESTED_WITH]: "XMLHttpRequest",
	[API_HEADERS.CF_PROXY_WHITELIST]: "019a2f78-a64c-7edb-proxy-whitelist-id-9a3a-17afda90f03a"
});
var SERVER_USER_AGENT = `Salla-TwilightReact/${/^\d+(?:\.\d+)*/.exec("1.0.133")?.[0] ?? "0.0.0"} (production; ssr)`;
var STORE_API_BASE = getInjectedRuntimeEnv().apiBase || readEnv("VITE_API_URL") || "https://api.salla.dev/store/v1";
var api = ky.extend({
	prefix: STORE_API_BASE,
	timeout: 8e3,
	hooks: {
		beforeRequest: [({ request }) => {
			const { locale, authToken } = getTwilightContext();
			const headers = sharedHeaders(locale);
			for (const [key, value] of Object.entries(headers)) request.headers.set(key, value);
			if (!request.headers.get(API_HEADERS.STORE_IDENTIFIER)) request.headers.set(API_HEADERS.STORE_IDENTIFIER, getStoreIdentifier());
			if (typeof document === "undefined") request.headers.set(API_HEADERS.USER_AGENT, SERVER_USER_AGENT);
			const scope = getActiveScope();
			const versionId = resolveThemeVersionId(scope?.id ?? null);
			if (versionId) request.headers.set(API_HEADERS.VERSION_ID, versionId);
			const currency = getActiveCurrency();
			if (currency) request.headers.set(API_HEADERS.CURRENCY, currency);
			const token = authToken ?? readFallbackToken();
			if (token) request.headers.set(API_HEADERS.AUTHORIZATION, `Bearer ${token}`);
			if (scope) {
				request.headers.set(API_HEADERS.SCOPE_ID, scope.id);
				if (scope.type) request.headers.set(API_HEADERS.SCOPE_TYPE, scope.type);
				if (scope.allocation_type) request.headers.set(API_HEADERS.SCOPE_ALLOCATION_TYPE, scope.allocation_type);
				if (scope.allocation_id) request.headers.set(API_HEADERS.SCOPE_ALLOCATION_ID, scope.allocation_id);
			}
		}, devSettingsCache.lookup],
		afterResponse: [devSettingsCache.store]
	}
});
var cdn$1 = ky.extend({
	prefix: "https://cdn.salla.network",
	timeout: 5e3
});
var filesCdn = ky.extend({
	prefix: "https://cdn.files.salla.network",
	timeout: 5e3
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-2TLIULJZ.js
function isNativeApp() {
	return Boolean(getSallaSDK()?.mobile?.isEnabled?.());
}
function useIsNativeApp() {
	const [inApp, setInApp] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => whenSallaReady(() => setInApp(isNativeApp())), []);
	return inApp;
}
function openNativeBrowser(url) {
	if (!isNativeApp()) return false;
	const sdk = getSallaSDK();
	if (typeof sdk?.mobile?.openBrowser === "function") sdk.mobile.openBrowser(url);
	else sdk?.event.dispatch("mobile::browser.open", { url });
	return true;
}
function hapticImpact(impact) {
	getSallaSDK()?.mobile?.action?.("haptic.impact", { impact_type: impact });
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-DF6FBKDN.js
var TwilightContext = (0, import_react.createContext)(null);
function useTwilight() {
	const context = (0, import_react.useContext)(TwilightContext);
	if (!context) throw new Error("useTwilight must be used within a TwilightProvider");
	return context;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-4UEXSD7E.js
var RedirectError = class extends Error {
	constructor(path, replace = false) {
		super(`Redirect to ${path}`);
		this.path = path;
		this.replace = replace;
		this.name = "RedirectError";
	}
};
var NotFoundError = class extends Error {
	constructor(message) {
		super(message ?? "Not Found");
		this.name = "NotFoundError";
	}
};
var UnauthorizedError = class extends Error {
	constructor(message) {
		super(message ?? "Unauthorized");
		this.name = "UnauthorizedError";
	}
};
var defaultNavigate = (to, opts) => {
	if (opts?.replace) window.location.replace(to);
	else window.location.href = to;
};
var defaultRedirect = (path, opts) => {
	const replace = opts?.replace ?? false;
	if (typeof window !== "undefined") {
		if (replace) window.location.replace(path);
		else window.location.href = path;
	}
	throw new RedirectError(path, replace);
};
var defaultNotFound = (message) => {
	throw new NotFoundError(message);
};
var defaultUnauthorized = (message) => {
	throw new UnauthorizedError(message);
};
var HANDLERS_KEY = /* @__PURE__ */ Symbol.for("salla.twilight.navigation.handlers");
var registry$1 = globalThis;
var handlers = registry$1[HANDLERS_KEY] ??= {
	notFound: defaultNotFound,
	redirect: defaultRedirect,
	unauthorized: defaultUnauthorized
};
function notFound(message) {
	return handlers.notFound(message);
}
function unauthorized(message) {
	return handlers.unauthorized(message);
}
function redirect(path, opts) {
	return handlers.redirect(path, opts);
}
function configureNavigation(config) {
	if (config.notFound) handlers.notFound = config.notFound;
	if (config.redirect) handlers.redirect = config.redirect;
	if (config.unauthorized) handlers.unauthorized = config.unauthorized;
}
async function orThrow(promise) {
	try {
		return await promise;
	} catch (error) {
		console.debug("[loader error]", error);
		if (isMissingResource(error)) return notFound();
		throw error;
	}
}
function responseStatusOf(error) {
	const status = error?.response?.status;
	return typeof status === "number" ? status : void 0;
}
function isMissingResource(error) {
	const status = responseStatusOf(error);
	return status === 404 || status === 410;
}
async function orUnauthorized(promise) {
	try {
		return await promise;
	} catch (error) {
		const status = error?.response?.status;
		if (status === 401 || status === 403) throw unauthorized();
		throw error;
	}
}
var NavigationContext = (0, import_react.createContext)({ navigate: defaultNavigate });
function NavigationProvider({ navigate, children }) {
	return (0, import_react.createElement)(NavigationContext.Provider, { value: { navigate } }, children);
}
function useNavigate() {
	return (0, import_react.useContext)(NavigationContext).navigate;
}
function useRouteId() {
	return (0, import_react.useSyncExternalStore)(subscribeTwilight, () => getTwilightContext().routeId, () => getTwilightContext().routeId);
}
function useLocation() {
	useTwilight();
	return getTwilightContext().location;
}
function useIsHome() {
	return useRouteId() === RouteId.INDEX;
}
function useIsProduct() {
	return useRouteId() === RouteId.PRODUCT_SINGLE;
}
function NavigationInterceptor() {
	const navigate = useNavigate();
	const { store } = useTwilight();
	useNavigationInterceptor(navigate, store?.url, store?.username);
	return null;
}
function resolveRelativePath(href, storeUrl, username) {
	try {
		const target = new URL(href, window.location.href);
		const base = new URL(storeUrl);
		if (target.origin !== base.origin) return null;
		return withoutStoreUrlBase(target.pathname, base.pathname, username) + target.search + target.hash || "/";
	} catch {
		return null;
	}
}
var APP_PATH_PREFIXES = [
	"/checkout",
	"/payment",
	"/orders/digital",
	"/gifts",
	"/cart/booking",
	"/auth/jwt",
	"/auth/refresh"
];
var APP_PATH_PATTERNS = [/^\/account\/orders\/[^/]+\/print\/?$/];
function isAppPath(path) {
	let pathname = path.split(/[?#]/)[0];
	const first = pathname.split("/")[1];
	if (SUPPORTED_LOCALES.includes(first)) pathname = pathname.slice(first.length + 1) || "/";
	return APP_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) || APP_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}
var EXTERNAL_TARGETS = /* @__PURE__ */ new Set([
	"_blank",
	"_parent",
	"_top"
]);
function shouldIntercept(anchor, event) {
	if (event.defaultPrevented) return false;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
	const targetAttr = anchor.getAttribute("target");
	if (targetAttr && EXTERNAL_TARGETS.has(targetAttr)) return false;
	if (anchor.hasAttribute("download")) return false;
	if ((anchor.getAttribute("rel") ?? "").split(/\s+/).includes("external")) return false;
	const href = anchor.getAttribute("href") ?? "";
	if (!href) return false;
	try {
		if (new URL(href, window.location.href).protocol.startsWith("javascript:")) return false;
	} catch {
		return false;
	}
	return true;
}
function switchesScope(href) {
	let url;
	try {
		url = new URL(href, window.location.href);
	} catch {
		return false;
	}
	const requested = extractScopeFromUrl(url.href);
	if (!requested) return false;
	const active = getActiveScope();
	if (requested.id !== active?.id) return true;
	return requested.allocation_id != null && (requested.allocation_id !== active.allocation_id || requested.allocation_type !== active.allocation_type);
}
function leavesStore(anchor, event, storeUrl) {
	if (event.defaultPrevented || anchor.hasAttribute("download")) return false;
	if (anchor.hasAttribute("data-fslightbox")) return false;
	let url;
	try {
		url = new URL(anchor.getAttribute("href") ?? "", window.location.href);
	} catch {
		return false;
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") return false;
	if (url.origin === window.location.origin) return false;
	try {
		return !storeUrl || url.origin !== new URL(storeUrl).origin;
	} catch {
		return true;
	}
}
function isSamePage(href) {
	const url = new URL(href, window.location.href);
	return url.pathname === window.location.pathname && url.search === window.location.search;
}
function closeEnclosingModal(path) {
	path.find((el) => el instanceof HTMLElement && el.localName === "salla-modal")?.close?.();
}
function useNavigationInterceptor(navigate, storeUrl, username) {
	const storeUrlRef = (0, import_react.useRef)(storeUrl);
	const usernameRef = (0, import_react.useRef)(username);
	(0, import_react.useEffect)(() => {
		storeUrlRef.current = storeUrl;
		usernameRef.current = username;
	}, [storeUrl, username]);
	const tryNavigate = (0, import_react.useCallback)((href, replace = false) => {
		const currentStoreUrl = storeUrlRef.current;
		if (!currentStoreUrl || switchesScope(href)) return false;
		const relativePath = resolveRelativePath(href, currentStoreUrl, usernameRef.current);
		if (!relativePath || isAppPath(relativePath)) return false;
		navigate(relativePath, { replace });
		return true;
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		let pointerStartX = 0;
		let pointerStartY = 0;
		let pointerSwiped = false;
		const MOVE_THRESHOLD = 10;
		function handlePointerDown(event) {
			pointerStartX = event.clientX;
			pointerStartY = event.clientY;
			pointerSwiped = false;
		}
		function handlePointerUp(event) {
			const dx = Math.abs(event.clientX - pointerStartX);
			const dy = Math.abs(event.clientY - pointerStartY);
			pointerSwiped = dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD;
		}
		function handleClick(event) {
			if (pointerSwiped) {
				pointerSwiped = false;
				return;
			}
			const path = event.composedPath();
			const anchor = path.find((el) => el instanceof HTMLAnchorElement);
			if (anchor && leavesStore(anchor, event, storeUrlRef.current) && openNativeBrowser(anchor.href)) {
				event.preventDefault();
				return;
			}
			if (!anchor || !shouldIntercept(anchor, event)) return;
			const samePage = isSamePage(anchor.href);
			if (tryNavigate(anchor.href, false)) {
				event.preventDefault();
				if (!samePage) closeEnclosingModal(path);
			}
		}
		const origAssign = window.location.assign;
		function patchedAssign(url) {
			if (!tryNavigate(url, false)) origAssign.call(window.location, url);
		}
		const origReplace = window.location.replace;
		function patchedReplace(url) {
			if (!tryNavigate(url, true)) origReplace.call(window.location, url);
		}
		let assignPatched = false;
		let replacePatched = false;
		try {
			window.location.assign = patchedAssign;
			assignPatched = true;
		} catch {}
		try {
			window.location.replace = patchedReplace;
			replacePatched = true;
		} catch {}
		document.addEventListener("click", handleClick, { capture: true });
		document.addEventListener("pointerdown", handlePointerDown, { passive: true });
		document.addEventListener("pointerup", handlePointerUp, { passive: true });
		return () => {
			document.removeEventListener("click", handleClick, { capture: true });
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("pointerup", handlePointerUp);
			if (assignPatched) try {
				window.location.assign = origAssign;
			} catch {}
			if (replacePatched) try {
				window.location.replace = origReplace;
			} catch {}
		};
	}, [tryNavigate]);
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js
var QueryClientContext = import_react.createContext(void 0);
var useQueryClient = (queryClient) => {
	const client = import_react.useContext(QueryClientContext);
	if (queryClient) return queryClient;
	if (!client) throw new Error("No QueryClient set, use QueryClientProvider to set one");
	return client;
};
var QueryClientProvider = ({ client, children }) => {
	import_react.useEffect(() => {
		client.mount();
		return () => {
			client.unmount();
		};
	}, [client]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientContext.Provider, {
		value: client,
		children
	});
};
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/timeoutManager.js
var defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
/**
* Allows customization of how timeouts are created.
*
* @tanstack/query-core makes liberal use of timeouts to implement `staleTime`
* and `gcTime`. The default TimeoutManager provider uses the platform's global
* `setTimeout` implementation, which is known to have scalability issues with
* thousands of timeouts on the event loop.
*
* If you hit this limitation, consider providing a custom TimeoutProvider that
* coalesces timeouts.
*/
var TimeoutManager = class {
	#provider = defaultTimeoutProvider;
	#providerCalled = false;
	setTimeoutProvider(provider) {
		this.#provider = provider;
	}
	setTimeout(callback, delay) {
		return this.#provider.setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		this.#provider.clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		return this.#provider.setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		this.#provider.clearInterval(intervalId);
	}
};
var timeoutManager = new TimeoutManager();
/**
* In many cases code wants to delay to the next event loop tick; this is not
* mediated by {@link timeoutManager}.
*
* This function is provided to make auditing the `tanstack/query-core` for
* incorrect use of system `setTimeout` easier.
*/
function systemSetTimeoutZero(callback) {
	setTimeout(callback, 0);
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/utils.js
/** @deprecated
* use `environmentManager.isServer()` instead.
*/
var isServer$1 = typeof window === "undefined" || "Deno" in globalThis;
function noop() {}
function functionalUpdate(updater, input) {
	return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
	return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
	return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveQueryValue(value, query) {
	return typeof value === "function" ? value(query) : value;
}
function matchQuery(filters, query) {
	const { type = "all", exact, fetchStatus, predicate, queryKey, stale } = filters;
	if (queryKey) {
		if (exact) {
			if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) return false;
		} else if (!partialMatchKey(query.queryKey, queryKey)) return false;
	}
	if (type !== "all") {
		const isActive = query.isActive();
		if (type === "active" && !isActive) return false;
		if (type === "inactive" && isActive) return false;
	}
	if (typeof stale === "boolean" && query.isStale() !== stale) return false;
	if (fetchStatus && fetchStatus !== query.state.fetchStatus) return false;
	if (predicate && !predicate(query)) return false;
	return true;
}
function matchMutation(filters, mutation) {
	const { exact, status, predicate, mutationKey } = filters;
	if (mutationKey) {
		if (!mutation.options.mutationKey) return false;
		if (exact) {
			if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) return false;
		} else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) return false;
	}
	if (status && mutation.state.status !== status) return false;
	if (predicate && !predicate(mutation)) return false;
	return true;
}
function hashQueryKeyByOptions(queryKey, options) {
	return (options?.queryKeyHashFn || hashKey)(queryKey);
}
/**
* Default query & mutation keys hash function.
* Hashes the value into a stable hash.
*/
function hashKey(queryKey) {
	return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
		result[key] = val[key];
		return result;
	}, {}) : val);
}
function partialMatchKey(a, b) {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (a && b && typeof a === "object" && typeof b === "object") {
		if (Array.isArray(a) && Array.isArray(b)) {
			for (let i = 0; i < b.length; i++) if (!partialMatchKey(a[i], b[i])) return false;
			return true;
		}
		const bKeys = Object.keys(b);
		for (const key of bKeys) if (!partialMatchKey(a[key], b[key])) return false;
		return true;
	}
	return false;
}
var hasOwn = Object.prototype.hasOwnProperty;
function replaceEqualDeep(a, b, depth = 0) {
	if (a === b) return a;
	if (depth > 500) return b;
	const array = isPlainArray(a) && isPlainArray(b);
	if (!array && !(isPlainObject(a) && isPlainObject(b))) return b;
	const aSize = (array ? a : Object.keys(a)).length;
	const bItems = array ? b : Object.keys(b);
	const bSize = bItems.length;
	const copy = array ? new Array(bSize) : {};
	let equalItems = 0;
	for (let i = 0; i < bSize; i++) {
		const key = array ? i : bItems[i];
		const aItem = a[key];
		const bItem = b[key];
		if (aItem === bItem) {
			copy[key] = aItem;
			if (array ? i < aSize : hasOwn.call(a, key)) equalItems++;
			continue;
		}
		if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
			copy[key] = bItem;
			continue;
		}
		const v = replaceEqualDeep(aItem, bItem, depth + 1);
		copy[key] = v;
		if (v === aItem) equalItems++;
	}
	return aSize === bSize && equalItems === aSize ? a : copy;
}
/**
* Shallow compare objects.
*/
function shallowEqualObjects(a, b) {
	if (!b || Object.keys(a).length !== Object.keys(b).length) return false;
	for (const key in a) if (a[key] !== b[key]) return false;
	return true;
}
function isPlainArray(value) {
	return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
	if (!hasObjectPrototype(o)) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	const prot = ctor.prototype;
	if (!hasObjectPrototype(prot)) return false;
	if (!prot.hasOwnProperty("isPrototypeOf")) return false;
	if (Object.getPrototypeOf(o) !== Object.prototype) return false;
	return true;
}
function hasObjectPrototype(o) {
	return Object.prototype.toString.call(o) === "[object Object]";
}
function sleep(timeout) {
	return new Promise((resolve) => {
		timeoutManager.setTimeout(resolve, timeout);
	});
}
function replaceData(prevData, data, options) {
	if (typeof options.structuralSharing === "function") return options.structuralSharing(prevData, data);
	else if (options.structuralSharing !== false) return replaceEqualDeep(prevData, data);
	return data;
}
function addToEnd(items, item, max = 0) {
	const newItems = [...items, item];
	return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
	const newItems = [item, ...items];
	return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
var skipToken = Symbol();
function ensureQueryFn(options, fetchOptions) {
	if (!options.queryFn && fetchOptions?.initialPromise) return () => fetchOptions.initialPromise;
	if (!options.queryFn || options.queryFn === skipToken) return () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${options.queryHash}'`));
	return options.queryFn;
}
function shouldThrowError(throwOnError, params) {
	if (typeof throwOnError === "function") return throwOnError(...params);
	return !!throwOnError;
}
function addConsumeAwareSignal(object, getSignal, onCancelled) {
	let consumed = false;
	let signal;
	Object.defineProperty(object, "signal", {
		enumerable: true,
		get: () => {
			signal ??= getSignal();
			if (consumed) return signal;
			consumed = true;
			if (signal.aborted) onCancelled();
			else signal.addEventListener("abort", onCancelled, { once: true });
			return signal;
		}
	});
	return object;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/environmentManager.js
var isServerFn = () => isServer$1;
/**
* Returns whether the current runtime should be treated as a server environment.
*/
var isServer = () => isServerFn();
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/subscribable.js
var Subscribable = class {
	constructor() {
		this.listeners = /* @__PURE__ */ new Set();
		this.subscribe = this.subscribe.bind(this);
	}
	subscribe(listener) {
		this.listeners.add(listener);
		this.onSubscribe();
		return () => {
			this.listeners.delete(listener);
			this.onUnsubscribe();
		};
	}
	hasListeners() {
		return this.listeners.size > 0;
	}
	onSubscribe() {}
	onUnsubscribe() {}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/focusManager.js
var FocusManager = class extends Subscribable {
	#focused;
	#cleanup;
	#setup;
	constructor() {
		super();
		this.#setup = (onFocus) => {
			if (typeof window !== "undefined" && window.addEventListener) {
				const listener = () => onFocus();
				window.addEventListener("visibilitychange", listener, false);
				return () => {
					window.removeEventListener("visibilitychange", listener);
				};
			}
		};
	}
	onSubscribe() {
		if (!this.#cleanup) this.setEventListener(this.#setup);
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			this.#cleanup?.();
			this.#cleanup = void 0;
		}
	}
	setEventListener(setup) {
		this.#setup = setup;
		this.#cleanup?.();
		this.#cleanup = setup((focused) => {
			if (typeof focused === "boolean") this.setFocused(focused);
			else this.onFocus();
		});
	}
	setFocused(focused) {
		if (this.#focused !== focused) {
			this.#focused = focused;
			this.onFocus();
		}
	}
	onFocus() {
		const isFocused = this.isFocused();
		this.listeners.forEach((listener) => {
			listener(isFocused);
		});
	}
	isFocused() {
		if (typeof this.#focused === "boolean") return this.#focused;
		return globalThis.document?.visibilityState !== "hidden";
	}
};
var focusManager = new FocusManager();
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/hydration.js
function tryResolveSync(promise) {
	let data;
	promise.then((result) => {
		data = result;
		return result;
	}, noop)?.catch?.(noop);
	if (data !== void 0) return { data };
}
function dehydratePromise(query, serializeData, shouldRedactErrors) {
	const promise = query.promise?.then(serializeData).catch((error) => {
		if (shouldRedactErrors?.(error) === false) return Promise.reject(error);
		return Promise.reject(/* @__PURE__ */ new Error("redacted"));
	});
	promise?.catch(noop);
	return promise;
}
function dehydrateQuery(query, serializeData, shouldRedactErrors) {
	return {
		dehydratedAt: Date.now(),
		state: {
			...query.state,
			...query.state.data !== void 0 && { data: serializeData ? serializeData(query.state.data) : query.state.data }
		},
		queryKey: query.queryKey,
		queryHash: query.queryHash,
		...query.state.status === "pending" && { promise: dehydratePromise(query, serializeData, shouldRedactErrors) },
		...query.meta && { meta: query.meta },
		...query.queryType && { queryType: query.queryType }
	};
}
function defaultShouldDehydrateQuery(query) {
	return query.state.status === "success";
}
function hydrate(client, dehydratedState, options) {
	const mutationCache = client.getMutationCache();
	const queryCache = client.getQueryCache();
	const deserializeData = options?.defaultOptions?.deserializeData ?? client.getDefaultOptions().hydrate?.deserializeData;
	dehydratedState.mutations?.forEach(({ state, ...mutationOptions }) => {
		mutationCache.build(client, {
			...client.getDefaultOptions().hydrate?.mutations,
			...options?.defaultOptions?.mutations,
			...mutationOptions
		}, state);
	});
	dehydratedState.queries?.forEach(({ queryKey, state, queryHash, meta, promise, dehydratedAt, queryType }) => {
		const syncData = promise ? tryResolveSync(promise) : void 0;
		const rawData = state.data === void 0 ? syncData?.data : state.data;
		const data = rawData === void 0 ? rawData : deserializeData ? deserializeData(rawData) : rawData;
		let query = queryCache.get(queryHash);
		const existingQueryIsPending = query?.state.status === "pending";
		const existingQueryIsFetching = query?.state.fetchStatus === "fetching";
		if (query) {
			const hasNewerSyncData = syncData && dehydratedAt !== void 0 && dehydratedAt > query.state.dataUpdatedAt;
			if (state.dataUpdatedAt > query.state.dataUpdatedAt || hasNewerSyncData) {
				const { fetchStatus: _ignored, ...serializedState } = state;
				query.setState({
					...serializedState,
					data,
					...state.status === "pending" && data !== void 0 && {
						status: "success",
						dataUpdatedAt: dehydratedAt ?? Date.now(),
						...!existingQueryIsFetching && { fetchStatus: "idle" }
					}
				});
			}
		} else query = queryCache.build(client, {
			...client.getDefaultOptions().hydrate?.queries,
			...options?.defaultOptions?.queries,
			queryKey,
			queryHash,
			meta,
			_type: queryType
		}, {
			...state,
			data,
			fetchStatus: "idle",
			status: state.status === "pending" && data !== void 0 ? "success" : state.status,
			...state.status === "pending" && data !== void 0 && { dataUpdatedAt: dehydratedAt ?? Date.now() }
		});
		if (promise && !syncData && !existingQueryIsPending && !existingQueryIsFetching && (dehydratedAt === void 0 || dehydratedAt > query.state.dataUpdatedAt)) query.fetch(void 0, { initialPromise: Promise.resolve(promise).then(deserializeData) }).catch(noop);
	});
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/notifyManager.js
var defaultScheduler = systemSetTimeoutZero;
function createNotifyManager() {
	let queue = [];
	let transactions = 0;
	let notifyFn = (callback) => {
		callback();
	};
	let batchNotifyFn = (callback) => {
		callback();
	};
	let scheduleFn = defaultScheduler;
	const schedule = (callback) => {
		if (transactions) queue.push(callback);
		else scheduleFn(() => {
			notifyFn(callback);
		});
	};
	const flush = () => {
		const originalQueue = queue;
		queue = [];
		if (originalQueue.length) scheduleFn(() => {
			batchNotifyFn(() => {
				originalQueue.forEach((callback) => {
					notifyFn(callback);
				});
			});
		});
	};
	return {
		batch: (callback) => {
			let result;
			transactions++;
			try {
				result = callback();
			} finally {
				transactions--;
				if (!transactions) flush();
			}
			return result;
		},
		/**
		* All calls to the wrapped function will be batched.
		*/
		batchCalls: (callback) => {
			return (...args) => {
				schedule(() => {
					callback(...args);
				});
			};
		},
		schedule,
		/**
		* Use this method to set a custom notify function.
		* This can be used to for example wrap notifications with `React.act` while running tests.
		*/
		setNotifyFunction: (fn) => {
			notifyFn = fn;
		},
		/**
		* Use this method to set a custom function to batch notifications together into a single tick.
		* By default React Query will use the batch function provided by ReactDOM or React Native.
		*/
		setBatchNotifyFunction: (fn) => {
			batchNotifyFn = fn;
		},
		setScheduler: (fn) => {
			scheduleFn = fn;
		}
	};
}
var notifyManager = createNotifyManager();
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/onlineManager.js
var OnlineManager = class extends Subscribable {
	#online = true;
	#cleanup;
	#setup;
	constructor() {
		super();
		this.#setup = (onOnline) => {
			if (typeof window !== "undefined" && window.addEventListener) {
				const onlineListener = () => onOnline(true);
				const offlineListener = () => onOnline(false);
				window.addEventListener("online", onlineListener, false);
				window.addEventListener("offline", offlineListener, false);
				return () => {
					window.removeEventListener("online", onlineListener);
					window.removeEventListener("offline", offlineListener);
				};
			}
		};
	}
	onSubscribe() {
		if (!this.#cleanup) this.setEventListener(this.#setup);
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			this.#cleanup?.();
			this.#cleanup = void 0;
		}
	}
	setEventListener(setup) {
		this.#setup = setup;
		this.#cleanup?.();
		this.#cleanup = setup(this.setOnline.bind(this));
	}
	setOnline(online) {
		if (this.#online !== online) {
			this.#online = online;
			this.listeners.forEach((listener) => {
				listener(online);
			});
		}
	}
	isOnline() {
		return this.#online;
	}
};
var onlineManager = new OnlineManager();
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/retryer.js
function defaultRetryDelay(failureCount) {
	return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
	return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
var CancelledError = class extends Error {
	constructor(options) {
		super("CancelledError");
		this.revert = options?.revert;
		this.silent = options?.silent;
	}
};
function createRetryer(config) {
	let isRetryCancelled = false;
	let failureCount = 0;
	let continueFn;
	let status = "pending";
	let promiseResolve;
	let promiseReject;
	const promise = new Promise((resolve, reject) => {
		promiseResolve = resolve;
		promiseReject = reject;
	});
	promise.catch(noop);
	const isResolved = () => status !== "pending";
	const cancel = (cancelOptions) => {
		if (!isResolved()) {
			const error = new CancelledError(cancelOptions);
			reject(error);
			config.onCancel?.(error);
		}
	};
	const cancelRetry = () => {
		isRetryCancelled = true;
	};
	const continueRetry = () => {
		isRetryCancelled = false;
	};
	const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
	const canStart = () => canFetch(config.networkMode) && config.canRun();
	const resolve = (value) => {
		if (!isResolved()) {
			continueFn?.();
			status = "resolved";
			promiseResolve(value);
		}
	};
	const reject = (value) => {
		if (!isResolved()) {
			continueFn?.();
			status = "rejected";
			promiseReject(value);
		}
	};
	const pause = () => {
		return new Promise((continueResolve) => {
			continueFn = (value) => {
				if (isResolved() || canContinue()) continueResolve(value);
			};
			config.onPause?.();
		}).then(() => {
			continueFn = void 0;
			if (!isResolved()) config.onContinue?.();
		});
	};
	const run = () => {
		if (isResolved()) return;
		let promiseOrValue;
		const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
		try {
			promiseOrValue = initialPromise ?? config.fn();
		} catch (error) {
			promiseOrValue = Promise.reject(error);
		}
		Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
			if (isResolved()) return;
			const retry = config.retry ?? (isServer() ? 0 : 3);
			const retryDelay = config.retryDelay ?? defaultRetryDelay;
			const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
			const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
			if (isRetryCancelled || !shouldRetry) {
				reject(error);
				return;
			}
			failureCount++;
			config.onFail?.(failureCount, error);
			sleep(delay).then(() => {
				return canContinue() ? void 0 : pause();
			}).then(() => {
				if (isRetryCancelled) reject(error);
				else run();
			});
		});
	};
	return {
		promise,
		status: () => status,
		cancel,
		continue: () => {
			continueFn?.();
			return promise;
		},
		cancelRetry,
		continueRetry,
		canStart,
		start: () => {
			if (canStart()) run();
			else pause().then(run);
			return promise;
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/removable.js
var Removable = class {
	#gcTimeout;
	destroy() {
		this.clearGcTimeout();
	}
	scheduleGc() {
		this.clearGcTimeout();
		if (isValidTimeout(this.gcTime)) this.#gcTimeout = timeoutManager.setTimeout(() => {
			this.optionalRemove();
		}, this.gcTime);
	}
	updateGcTime(newGcTime) {
		this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? (isServer() ? Infinity : 3e5));
	}
	clearGcTimeout() {
		if (this.#gcTimeout !== void 0) {
			timeoutManager.clearTimeout(this.#gcTimeout);
			this.#gcTimeout = void 0;
		}
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js
function infiniteQueryBehavior(pages) {
	return { onFetch: (context, query) => {
		const options = context.options;
		const direction = context.fetchOptions?.meta?.fetchMore?.direction;
		const oldPages = context.state.data?.pages || [];
		const oldPageParams = context.state.data?.pageParams || [];
		let result = {
			pages: [],
			pageParams: []
		};
		let currentPage = 0;
		const fetchFn = async () => {
			let cancelled = false;
			const addSignalProperty = (object) => {
				addConsumeAwareSignal(object, () => context.signal, () => cancelled = true);
			};
			const queryFn = ensureQueryFn(context.options, context.fetchOptions);
			const fetchPage = async (data, param, previous) => {
				if (cancelled) return Promise.reject(context.signal.reason);
				if (param == null && data.pages.length) return Promise.resolve(data);
				const createQueryFnContext = () => {
					const queryFnContext = {
						client: context.client,
						queryKey: context.queryKey,
						pageParam: param,
						direction: previous ? "backward" : "forward",
						meta: context.options.meta
					};
					addSignalProperty(queryFnContext);
					return queryFnContext;
				};
				const queryFnContext = createQueryFnContext();
				const page = await queryFn(queryFnContext);
				const { maxPages } = context.options;
				const addTo = previous ? addToStart : addToEnd;
				return {
					pages: addTo(data.pages, page, maxPages),
					pageParams: addTo(data.pageParams, param, maxPages)
				};
			};
			if (direction && oldPages.length) {
				const previous = direction === "backward";
				const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
				const oldData = {
					pages: oldPages,
					pageParams: oldPageParams
				};
				result = await fetchPage(oldData, pageParamFn(options, oldData), previous);
			} else {
				const remainingPages = pages ?? oldPages.length;
				do {
					const param = currentPage === 0 ? oldPageParams[0] ?? options.initialPageParam : getNextPageParam(options, result);
					if (currentPage > 0 && param == null) break;
					result = await fetchPage(result, param);
					currentPage++;
				} while (currentPage < remainingPages);
			}
			return result;
		};
		if (context.options.persister) context.fetchFn = () => {
			return context.options.persister?.(fetchFn, {
				client: context.client,
				queryKey: context.queryKey,
				meta: context.options.meta,
				signal: context.signal
			}, query);
		};
		else context.fetchFn = fetchFn;
	} };
}
function getNextPageParam(options, { pages, pageParams }) {
	const lastIndex = pages.length - 1;
	return pages.length > 0 ? options.getNextPageParam(pages[lastIndex], pages, pageParams[lastIndex], pageParams) : void 0;
}
function getPreviousPageParam(options, { pages, pageParams }) {
	return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
}
/**
* Checks if there is a next page.
*/
function hasNextPage(options, data) {
	if (!data) return false;
	return getNextPageParam(options, data) != null;
}
/**
* Checks if there is a previous page.
*/
function hasPreviousPage(options, data) {
	if (!data || !options.getPreviousPageParam) return false;
	return getPreviousPageParam(options, data) != null;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/query.js
var Query = class extends Removable {
	#queryType;
	#initialState;
	#revertState;
	#cache;
	#client;
	#retryer;
	#defaultOptions;
	#abortSignalConsumed;
	constructor(config) {
		super();
		this.#abortSignalConsumed = false;
		this.#defaultOptions = config.defaultOptions;
		this.setOptions(config.options);
		this.observers = [];
		this.#client = config.client;
		this.#cache = this.#client.getQueryCache();
		this.queryKey = config.queryKey;
		this.queryHash = config.queryHash;
		this.#initialState = getDefaultState(this.options);
		this.state = config.state ?? this.#initialState;
		this.scheduleGc();
	}
	get meta() {
		return this.options.meta;
	}
	get queryType() {
		return this.#queryType;
	}
	get promise() {
		return this.#retryer?.promise;
	}
	setOptions(options) {
		this.options = {
			...this.#defaultOptions,
			...options
		};
		if (options?._type) this.#queryType = options._type;
		this.updateGcTime(this.options.gcTime);
		if (this.state && this.state.data === void 0) {
			const defaultState = getDefaultState(this.options);
			if (defaultState.data !== void 0) {
				this.setState(successState(defaultState.data, defaultState.dataUpdatedAt));
				this.#initialState = defaultState;
			}
		}
	}
	optionalRemove() {
		if (!this.observers.length && this.state.fetchStatus === "idle") this.#cache.remove(this);
	}
	setData(newData, options) {
		const data = replaceData(this.state.data, newData, this.options);
		this.#dispatch({
			data,
			type: "success",
			dataUpdatedAt: options?.updatedAt,
			manual: options?.manual
		});
		return data;
	}
	setState(state) {
		this.#dispatch({
			type: "setState",
			state
		});
	}
	cancel(options) {
		const promise = this.#retryer?.promise;
		this.#retryer?.cancel(options);
		return promise ? promise.then(noop).catch(noop) : Promise.resolve();
	}
	destroy() {
		super.destroy();
		this.cancel({ silent: true });
	}
	get resetState() {
		return this.#initialState;
	}
	reset() {
		this.destroy();
		this.setState(this.resetState);
	}
	isActive() {
		return this.observers.some((observer) => resolveQueryValue(observer.options.enabled, this) !== false);
	}
	isDisabled() {
		if (this.getObserversCount() > 0) return !this.isActive();
		return this.options.queryFn === skipToken || !this.isFetched();
	}
	isFetched() {
		return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
	}
	isStatic() {
		if (this.getObserversCount() > 0) return this.observers.some((observer) => resolveQueryValue(observer.options.staleTime, this) === "static");
		return false;
	}
	isStale() {
		if (this.getObserversCount() > 0) return this.observers.some((observer) => observer.getCurrentResult().isStale);
		return this.state.data === void 0 || this.state.isInvalidated;
	}
	isStaleByTime(staleTime = 0) {
		if (this.state.data === void 0) return true;
		if (staleTime === "static") return false;
		if (this.state.isInvalidated) return true;
		return !timeUntilStale(this.state.dataUpdatedAt, staleTime);
	}
	onFocus() {
		this.observers.find((x) => x.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: false });
		this.#retryer?.continue();
	}
	onOnline() {
		this.observers.find((x) => x.shouldFetchOnReconnect())?.refetch({ cancelRefetch: false });
		this.#retryer?.continue();
	}
	addObserver(observer) {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer);
			this.clearGcTimeout();
			this.#cache.notify({
				type: "observerAdded",
				query: this,
				observer
			});
		}
	}
	removeObserver(observer) {
		const index = this.observers.indexOf(observer);
		if (index !== -1) {
			this.observers.splice(index, 1);
			if (!this.observers.length) {
				if (this.#retryer) {
					if (this.#abortSignalConsumed || this.state.fetchStatus === "paused" && this.state.status === "pending") this.#retryer.cancel({ revert: true });
					else this.#retryer.cancelRetry();
				}
				this.scheduleGc();
			}
			this.#cache.notify({
				type: "observerRemoved",
				query: this,
				observer
			});
		}
	}
	getObserversCount() {
		return this.observers.length;
	}
	invalidate() {
		if (!this.state.isInvalidated) this.#dispatch({ type: "invalidate" });
	}
	async fetch(options, fetchOptions) {
		if (this.state.fetchStatus !== "idle" && this.#retryer?.status() !== "rejected") {
			if (this.state.data !== void 0 && fetchOptions?.cancelRefetch) this.cancel({ silent: true });
			else if (this.#retryer) {
				this.#retryer.continueRetry();
				return this.#retryer.promise;
			}
		}
		if (options) this.setOptions(options);
		if (!this.options.queryFn) {
			const observer = this.observers.find((x) => x.options.queryFn);
			if (observer) this.setOptions(observer.options);
		}
		const abortController = new AbortController();
		const addSignalProperty = (object) => {
			Object.defineProperty(object, "signal", {
				enumerable: true,
				get: () => {
					this.#abortSignalConsumed = true;
					return abortController.signal;
				}
			});
		};
		const fetchFn = () => {
			const queryFn = ensureQueryFn(this.options, fetchOptions);
			const createQueryFnContext = () => {
				const queryFnContext = {
					client: this.#client,
					queryKey: this.queryKey,
					meta: this.meta
				};
				addSignalProperty(queryFnContext);
				return queryFnContext;
			};
			const queryFnContext = createQueryFnContext();
			this.#abortSignalConsumed = false;
			if (this.options.persister) return this.options.persister(queryFn, queryFnContext, this);
			return queryFn(queryFnContext);
		};
		const createFetchContext = () => {
			const context = {
				fetchOptions,
				options: this.options,
				queryKey: this.queryKey,
				client: this.#client,
				state: this.state,
				fetchFn
			};
			addSignalProperty(context);
			return context;
		};
		const context = createFetchContext();
		(this.#queryType === "infinite" ? infiniteQueryBehavior(this.options.pages) : this.options.behavior)?.onFetch(context, this);
		this.#revertState = this.state;
		if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== context.fetchOptions?.meta) this.#dispatch({
			type: "fetch",
			meta: context.fetchOptions?.meta
		});
		const retryer = this.#retryer = createRetryer({
			initialPromise: fetchOptions?.initialPromise,
			fn: context.fetchFn,
			onCancel: (error) => {
				if (error instanceof CancelledError && error.revert) this.setState({
					...this.#revertState,
					fetchStatus: "idle"
				});
				abortController.abort();
			},
			onFail: (failureCount, error) => {
				this.#dispatch({
					type: "failed",
					failureCount,
					error
				});
			},
			onPause: () => {
				this.#dispatch({ type: "pause" });
			},
			onContinue: () => {
				this.#dispatch({ type: "continue" });
			},
			retry: context.options.retry,
			retryDelay: context.options.retryDelay,
			networkMode: context.options.networkMode,
			canRun: () => true
		});
		try {
			const data = await retryer.start();
			if (data === void 0) throw new Error(`${this.queryHash} data is undefined`);
			this.setData(data);
			this.#cache.config.onSuccess?.(data, this);
			this.#cache.config.onSettled?.(data, this.state.error, this);
			return data;
		} catch (error) {
			if (error instanceof CancelledError) {
				if (error.silent) return this.#retryer.promise;
				else if (error.revert) {
					if (this.state.data === void 0) throw error;
					return this.state.data;
				}
			}
			this.#dispatch({
				type: "error",
				error
			});
			this.#cache.config.onError?.(error, this);
			this.#cache.config.onSettled?.(this.state.data, error, this);
			throw error;
		} finally {
			if (this.#retryer === retryer) this.#retryer = void 0;
			this.scheduleGc();
		}
	}
	#dispatch(action) {
		const reducer = (state) => {
			switch (action.type) {
				case "failed": return {
					...state,
					fetchFailureCount: action.failureCount,
					fetchFailureReason: action.error
				};
				case "pause": return {
					...state,
					fetchStatus: "paused"
				};
				case "continue": return {
					...state,
					fetchStatus: "fetching"
				};
				case "fetch": return {
					...state,
					...fetchState(state.data, this.options),
					fetchMeta: action.meta ?? null
				};
				case "success":
					const newState = {
						...state,
						...successState(action.data, action.dataUpdatedAt),
						dataUpdateCount: state.dataUpdateCount + 1,
						...!action.manual && {
							fetchStatus: "idle",
							fetchFailureCount: 0,
							fetchFailureReason: null
						}
					};
					this.#revertState = action.manual ? newState : void 0;
					return newState;
				case "error":
					const error = action.error;
					return {
						...state,
						error,
						errorUpdateCount: state.errorUpdateCount + 1,
						errorUpdatedAt: Date.now(),
						fetchFailureCount: state.fetchFailureCount + 1,
						fetchFailureReason: error,
						fetchStatus: "idle",
						status: "error",
						isInvalidated: true
					};
				case "invalidate": return {
					...state,
					isInvalidated: true
				};
				case "setState": return {
					...state,
					...action.state
				};
			}
		};
		this.state = reducer(this.state);
		notifyManager.batch(() => {
			this.observers.slice().forEach((observer) => {
				observer.onQueryUpdate();
			});
			this.#cache.notify({
				query: this,
				type: "updated",
				action
			});
		});
	}
};
function fetchState(data, options) {
	return {
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
		...data === void 0 && {
			error: null,
			status: "pending"
		}
	};
}
function successState(data, dataUpdatedAt) {
	return {
		data,
		dataUpdatedAt: dataUpdatedAt ?? Date.now(),
		error: null,
		isInvalidated: false,
		status: "success"
	};
}
function getDefaultState(options) {
	const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
	const hasData = data !== void 0;
	const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
	return {
		data,
		dataUpdateCount: 0,
		dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
		error: null,
		errorUpdateCount: 0,
		errorUpdatedAt: 0,
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchMeta: null,
		isInvalidated: false,
		status: hasData ? "success" : "pending",
		fetchStatus: "idle"
	};
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/queryObserver.js
var QueryObserver = class extends Subscribable {
	#client;
	#currentQuery = void 0;
	#currentQueryInitialState = void 0;
	#currentResult = void 0;
	#currentResultState;
	#currentResultOptions;
	#selectError;
	#selectFn;
	#selectResult;
	#lastQueryWithDefinedData;
	#staleTimeoutId;
	#refetchIntervalId;
	#currentRefetchInterval;
	#trackedProps = /* @__PURE__ */ new Set();
	constructor(client, options) {
		super();
		this.options = options;
		this.#client = client;
		this.#selectError = null;
		this.bindMethods();
		this.setOptions(options);
	}
	bindMethods() {
		this.refetch = this.refetch.bind(this);
	}
	onSubscribe() {
		if (this.listeners.size === 1) {
			this.#currentQuery.addObserver(this);
			if (shouldFetchOnMount(this.#currentQuery, this.options)) this.#executeFetch();
			else this.updateResult();
			this.#updateTimers();
		}
	}
	onUnsubscribe() {
		if (!this.hasListeners()) this.destroy();
	}
	shouldFetchOnReconnect() {
		return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnReconnect);
	}
	shouldFetchOnWindowFocus() {
		return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnWindowFocus);
	}
	destroy() {
		this.listeners = /* @__PURE__ */ new Set();
		this.#clearStaleTimeout();
		this.#clearRefetchInterval();
		this.#currentQuery.removeObserver(this);
	}
	setOptions(options) {
		const prevOptions = this.options;
		const prevQuery = this.#currentQuery;
		this.options = this.#client.defaultQueryOptions(options);
		if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveQueryValue(this.options.enabled, this.#currentQuery) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
		this.#updateQuery();
		this.#currentQuery.setOptions(this.options);
		if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) this.#client.getQueryCache().notify({
			type: "observerOptionsUpdated",
			query: this.#currentQuery,
			observer: this
		});
		const mounted = this.hasListeners();
		if (mounted && shouldFetchOptionally(this.#currentQuery, prevQuery, this.options, prevOptions)) this.#executeFetch();
		this.updateResult();
		if (mounted && (this.#currentQuery !== prevQuery || resolveQueryValue(this.options.enabled, this.#currentQuery) !== resolveQueryValue(prevOptions.enabled, this.#currentQuery) || resolveQueryValue(this.options.staleTime, this.#currentQuery) !== resolveQueryValue(prevOptions.staleTime, this.#currentQuery))) this.#updateStaleTimeout();
		const nextRefetchInterval = this.#computeRefetchInterval();
		if (mounted && (this.#currentQuery !== prevQuery || resolveQueryValue(this.options.enabled, this.#currentQuery) !== resolveQueryValue(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) this.#updateRefetchInterval(nextRefetchInterval);
	}
	getOptimisticResult(options) {
		const query = this.#client.getQueryCache().build(this.#client, options);
		const result = this.createResult(query, options);
		if (!shallowEqualObjects(this.getCurrentResult(), result)) {
			this.#currentResult = result;
			this.#currentResultOptions = this.options;
			this.#currentResultState = this.#currentQuery.state;
		}
		return result;
	}
	getCurrentResult() {
		return this.#currentResult;
	}
	trackResult(result, onPropTracked) {
		return new Proxy(result, { get: (target, key) => {
			this.trackProp(key);
			onPropTracked?.(key);
			return Reflect.get(target, key);
		} });
	}
	trackProp(key) {
		this.#trackedProps.add(key);
	}
	getCurrentQuery() {
		return this.#currentQuery;
	}
	refetch({ ...options } = {}) {
		return this.fetch({ ...options });
	}
	fetchOptimistic(options) {
		const defaultedOptions = this.#client.defaultQueryOptions(options);
		const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
		let unsubscribe = () => {};
		let resolveEarly;
		const cachePromise = new Promise((resolve) => {
			resolveEarly = resolve;
			unsubscribe = this.#client.getQueryCache().subscribe((event) => {
				if (event.type === "updated" && event.query.queryHash === query.queryHash && query.state.data !== void 0) {
					unsubscribe();
					resolve(this.createResult(query, defaultedOptions));
				}
			});
		});
		return Promise.race([query.fetch().then(() => {
			const result = this.createResult(query, defaultedOptions);
			resolveEarly?.(result);
			return result;
		}).finally(() => {
			unsubscribe();
		}), cachePromise]);
	}
	fetch(fetchOptions) {
		return this.#executeFetch({
			...fetchOptions,
			cancelRefetch: fetchOptions.cancelRefetch ?? true
		}).then(() => {
			this.updateResult();
			return this.#currentResult;
		});
	}
	#executeFetch(fetchOptions) {
		this.#updateQuery();
		let promise = this.#currentQuery.fetch(this.options, fetchOptions);
		if (!fetchOptions?.throwOnError) promise = promise.catch(noop);
		return promise;
	}
	#shouldScheduleTimer(timeout) {
		return !isServer() && resolveQueryValue(this.options.enabled, this.#currentQuery) !== false && isValidTimeout(timeout);
	}
	#updateStaleTimeout() {
		this.#clearStaleTimeout();
		const staleTime = resolveQueryValue(this.options.staleTime, this.#currentQuery);
		if (this.#currentResult.isStale || !this.#shouldScheduleTimer(staleTime)) return;
		const timeout = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime) + 1;
		this.#staleTimeoutId = timeoutManager.setTimeout(() => {
			if (!this.#currentResult.isStale) this.updateResult();
		}, timeout);
	}
	#computeRefetchInterval() {
		return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
	}
	#updateRefetchInterval(nextInterval) {
		this.#clearRefetchInterval();
		this.#currentRefetchInterval = nextInterval;
		if (this.#currentRefetchInterval === 0 || !this.#shouldScheduleTimer(this.#currentRefetchInterval)) return;
		this.#refetchIntervalId = timeoutManager.setInterval(() => {
			if (this.options.refetchIntervalInBackground || focusManager.isFocused()) this.#executeFetch();
		}, this.#currentRefetchInterval);
	}
	#updateTimers() {
		this.#updateStaleTimeout();
		this.#updateRefetchInterval(this.#computeRefetchInterval());
	}
	#clearStaleTimeout() {
		if (this.#staleTimeoutId !== void 0) {
			timeoutManager.clearTimeout(this.#staleTimeoutId);
			this.#staleTimeoutId = void 0;
		}
	}
	#clearRefetchInterval() {
		if (this.#refetchIntervalId !== void 0) {
			timeoutManager.clearInterval(this.#refetchIntervalId);
			this.#refetchIntervalId = void 0;
		}
	}
	createResult(query, options) {
		const prevQuery = this.#currentQuery;
		const prevOptions = this.options;
		const prevResult = this.#currentResult;
		const prevResultState = this.#currentResultState;
		const prevResultOptions = this.#currentResultOptions;
		const queryInitialState = query !== prevQuery ? query.state : this.#currentQueryInitialState;
		const { state } = query;
		let newState = { ...state };
		let isPlaceholderData = false;
		let data;
		if (options._optimisticResults) {
			const mounted = this.hasListeners();
			const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
			const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
			if (fetchOnMount || fetchOptionally) newState = {
				...newState,
				...fetchState(state.data, query.options)
			};
			if (options._optimisticResults === "isRestoring") newState.fetchStatus = "idle";
		}
		let { error, errorUpdatedAt, status } = newState;
		data = newState.data;
		let skipSelect = false;
		if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
			let placeholderData;
			if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
				placeholderData = prevResult.data;
				skipSelect = true;
			} else placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(this.#lastQueryWithDefinedData?.state.data, this.#lastQueryWithDefinedData) : options.placeholderData;
			if (placeholderData !== void 0) {
				status = "success";
				data = replaceData(prevResult?.data, placeholderData, options);
				isPlaceholderData = true;
			}
		}
		if (options.select && data !== void 0 && !skipSelect) {
			if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) data = this.#selectResult;
			else try {
				this.#selectFn = options.select;
				data = options.select(data);
				data = replaceData(prevResult?.data, data, options);
				this.#selectResult = data;
				this.#selectError = null;
			} catch (selectError) {
				this.#selectError = selectError;
			}
		} else if (data === void 0) this.#selectError = null;
		if (this.#selectError) {
			error = this.#selectError;
			data = this.#selectResult;
			errorUpdatedAt = Date.now();
			status = "error";
			isPlaceholderData = false;
		}
		const isFetching = newState.fetchStatus === "fetching";
		const isPending = status === "pending";
		const isError = status === "error";
		const isLoading = isPending && isFetching;
		const hasData = data !== void 0;
		return {
			status,
			fetchStatus: newState.fetchStatus,
			isPending,
			isSuccess: status === "success",
			isError,
			isInitialLoading: isLoading,
			isLoading,
			data,
			dataUpdatedAt: newState.dataUpdatedAt,
			error,
			errorUpdatedAt,
			failureCount: newState.fetchFailureCount,
			failureReason: newState.fetchFailureReason,
			errorUpdateCount: newState.errorUpdateCount,
			isFetched: query.isFetched(),
			isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
			isFetching,
			isRefetching: isFetching && !isPending,
			isLoadingError: isError && !hasData,
			isPaused: newState.fetchStatus === "paused",
			isPlaceholderData,
			isRefetchError: isError && hasData,
			isStale: isStale(query, options),
			refetch: this.refetch,
			isEnabled: resolveQueryValue(options.enabled, query) !== false
		};
	}
	updateResult() {
		const prevResult = this.#currentResult;
		const nextResult = this.createResult(this.#currentQuery, this.options);
		this.#currentResultState = this.#currentQuery.state;
		this.#currentResultOptions = this.options;
		if (this.#currentResultState.data !== void 0) this.#lastQueryWithDefinedData = this.#currentQuery;
		if (shallowEqualObjects(nextResult, prevResult)) return;
		this.#currentResult = nextResult;
		const shouldNotifyListeners = () => {
			if (!prevResult) return true;
			const { notifyOnChangeProps } = this.options;
			const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
			if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) return true;
			const includedProps = new Set(notifyOnChangePropsValue ?? this.#trackedProps);
			if (this.options.throwOnError) includedProps.add("error");
			return Object.keys(this.#currentResult).some((key) => {
				const typedKey = key;
				return this.#currentResult[typedKey] !== prevResult[typedKey] && includedProps.has(typedKey);
			});
		};
		const notifyListeners = shouldNotifyListeners();
		notifyManager.batch(() => {
			if (notifyListeners) this.listeners.forEach((listener) => {
				listener(this.#currentResult);
			});
			this.#client.getQueryCache().notify({
				query: this.#currentQuery,
				type: "observerResultsUpdated"
			});
		});
	}
	#updateQuery() {
		const query = this.#client.getQueryCache().build(this.#client, this.options);
		if (query === this.#currentQuery) return;
		const prevQuery = this.#currentQuery;
		this.#currentQuery = query;
		this.#currentQueryInitialState = query.state;
		if (this.hasListeners()) {
			prevQuery?.removeObserver(this);
			query.addObserver(this);
		}
	}
	onQueryUpdate() {
		this.updateResult();
		if (this.hasListeners()) this.#updateTimers();
	}
};
function shouldLoadOnMount(query, options) {
	return resolveQueryValue(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && resolveQueryValue(options.retryOnMount, query) === false);
}
function shouldFetchOnMount(query, options) {
	return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
	if (resolveQueryValue(options.enabled, query) !== false && resolveQueryValue(options.staleTime, query) !== "static") {
		const value = typeof field === "function" ? field(query) : field;
		return value === "always" || value !== false && isStale(query, options);
	}
	return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
	return (query !== prevQuery || resolveQueryValue(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
	return resolveQueryValue(options.enabled, query) !== false && query.isStaleByTime(resolveQueryValue(options.staleTime, query));
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js
var IsRestoringContext = import_react.createContext(false);
var useIsRestoring = () => import_react.useContext(IsRestoringContext);
IsRestoringContext.Provider;
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
function createValue() {
	let isReset = false;
	return {
		clearReset: () => {
			isReset = false;
		},
		reset: () => {
			isReset = true;
		},
		isReset: () => {
			return isReset;
		}
	};
}
var QueryErrorResetBoundaryContext = import_react.createContext(createValue());
var useQueryErrorResetBoundary = () => import_react.useContext(QueryErrorResetBoundaryContext);
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
	const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
	if (options.suspense || throwOnError) {
		if (!errorResetBoundary.isReset()) options.retryOnMount = false;
	}
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
	import_react.useEffect(() => {
		errorResetBoundary.clearReset();
	}, [errorResetBoundary]);
};
var getHasError = ({ result, errorResetBoundary, throwOnError, query, suspense }) => {
	return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/suspense.js
var ensureSuspenseTimers = (defaultedOptions) => {
	if (defaultedOptions.suspense) {
		const MIN_SUSPENSE_TIME_MS = 1e3;
		const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
		const originalStaleTime = defaultedOptions.staleTime;
		defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
		if (typeof defaultedOptions.gcTime === "number") defaultedOptions.gcTime = Math.max(defaultedOptions.gcTime, MIN_SUSPENSE_TIME_MS);
	}
};
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
	errorResetBoundary.clearReset();
});
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
function useBaseQuery(options, Observer, queryClient) {
	const isRestoring = useIsRestoring();
	const errorResetBoundary = useQueryErrorResetBoundary();
	const client = useQueryClient(queryClient);
	const defaultedOptions = client.defaultQueryOptions(options);
	const query = client.getQueryCache().get(defaultedOptions.queryHash);
	const subscribed = options.subscribed !== false;
	defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
	ensureSuspenseTimers(defaultedOptions);
	ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
	useClearResetErrorBoundary(errorResetBoundary);
	const [observer] = import_react.useState(() => new Observer(client, defaultedOptions));
	const result = observer.getOptimisticResult(defaultedOptions);
	const shouldSubscribe = !isRestoring && subscribed;
	import_react.useSyncExternalStore(import_react.useCallback((onStoreChange) => {
		const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
		observer.updateResult();
		return unsubscribe;
	}, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
	import_react.useEffect(() => {
		observer.setOptions(defaultedOptions);
	}, [defaultedOptions, observer]);
	if (shouldSuspend(defaultedOptions, result)) throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
	if (getHasError({
		result,
		errorResetBoundary,
		throwOnError: defaultedOptions.throwOnError,
		query,
		suspense: defaultedOptions.suspense
	})) throw result.error;
	return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/useQuery.js
function useQuery(options, queryClient) {
	return useBaseQuery(options, QueryObserver, queryClient);
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-query@5.102.8_react@19.2.8/node_modules/@tanstack/react-query/build/modern/queryOptions.js
function queryOptions(options) {
	return options;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-XN77EK3X.js
function advertisementsFor(ads, pageSlug) {
	return ads.filter((ad) => Array.isArray(ad.pages) && (ad.pages.includes("all") || !!pageSlug && ad.pages.includes(pageSlug)));
}
var advertisement = {
	/** Every active ad, unfiltered: one request serves all pages, filtered with `advertisementsFor`. */
	list: async () => {
		const { data } = await api.get("advertisements", { timeout: 3e3 }).json();
		return Array.isArray(data) ? data : [];
	},
	queries: { list: () => queryOptions({
		queryKey: [
			"advertisements",
			getTwilightContext().locale,
			{ scope: getActiveScope() }
		],
		queryFn: () => advertisement.list(),
		staleTime: Infinity,
		retry: 0
	}) }
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-TYNZ5B2B.js
var I18nContext = (0, import_react.createContext)({
	locale: "ar",
	direction: "rtl",
	isRTL: true,
	isLTR: false,
	languageName: FALLBACK_LANGUAGE_NAME
});
function useTranslation(ns) {
	const ctx = (0, import_react.useContext)(I18nContext);
	const { t, i18n, ready } = useTranslation$1(ns);
	return {
		...ctx,
		t,
		i18n,
		ready
	};
}
function I18nProvider({ i18nInstance, themeTranslations, children }) {
	const i18n = (0, import_react.useMemo)(() => {
		if (themeTranslations) {
			const locale2 = i18nInstance.language;
			const themeResources = themeTranslations[`${locale2}.trans`] ?? {};
			if (Object.keys(themeResources).length > 0) i18nInstance.addResourceBundle(locale2, "theme", themeResources, true, true);
		}
		return i18nInstance;
	}, [i18nInstance, themeTranslations]);
	const locale = i18n.language;
	const info = (0, import_react.useMemo)(() => getLanguageInfo(locale), [locale]);
	const contextValue = (0, import_react.useMemo)(() => ({
		locale,
		direction: info.dir,
		isRTL: info.dir === "rtl",
		isLTR: info.dir === "ltr",
		languageName: info.name
	}), [locale, info]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const appTranslations = i18n.getResourceBundle(locale, "app") ?? {};
		window.translations = { [`${locale}.trans`]: appTranslations };
	}, [i18n, locale]);
	return import_react.createElement(I18nContext.Provider, { value: contextValue }, import_react.createElement(I18nextProvider, { i18n }, children));
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-KLJTNLZ5.js
var currentPageSlug = () => getTwilightContext().page?.slug;
var dismissedKey = (id) => `statusAd-${id}`;
var NO_ADS = [];
var HIDE_DISMISSED_SCRIPT = "(function(){try{if(window.self!==window.top)return;document.currentScript.parentNode.querySelectorAll('.s-advertisement[data-id]').forEach(function(e){if(localStorage.getItem('statusAd-'+e.getAttribute('data-id')))e.hidden=true})}catch(e){}})();";
function isDismissed(id) {
	try {
		return Boolean(window.localStorage.getItem(dismissedKey(id)));
	} catch {
		return false;
	}
}
function dismiss(id) {
	const storage = window.salla?.storage;
	if (typeof storage?.set === "function") storage.set(dismissedKey(id), "dismissed");
	else try {
		window.localStorage.setItem(dismissedKey(id), JSON.stringify("dismissed"));
	} catch {}
}
function PageAdvertisements() {
	const { t } = useTranslation();
	const pageSlug = (0, import_react.useSyncExternalStore)(subscribeTwilight, currentPageSlug, currentPageSlug);
	const { data: ads = NO_ADS } = useQuery({
		...advertisement.queries.list(),
		retry: 2
	});
	const [view, setView] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const dismissed = new Set(ads.filter((ad) => isDismissed(ad.id)).map((ad) => ad.id));
		setView({
			preview: window.self !== window.top,
			inApp: false,
			dismissed
		});
		return whenSallaReady((sdk) => {
			const config = sdk.config;
			const inApp = Boolean(config?.isMobileApp?.());
			const debug = Boolean(config?.isDebug?.());
			if (inApp || debug) setView((current) => current ? {
				...current,
				inApp,
				preview: current.preview || debug
			} : current);
		});
	}, [ads]);
	if (view?.inApp) return null;
	const shown = view?.preview ? ads : advertisementsFor(ads, pageSlug).filter((ad) => !view?.dismissed.has(ad.id));
	if (!shown.length) return null;
	const close = (id) => {
		dismiss(id);
		setView((current) => current ? {
			...current,
			dismissed: new Set(current.dismissed).add(id)
		} : current);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [shown.map((ad) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "s-advertisement",
		"data-id": ad.id,
		style: {
			backgroundColor: ad.colors?.bg,
			color: ad.colors?.text
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-advertisement-content container flex justify-between items-center py-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "s-advertisement-content-main flex-1 font-bold text-center text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `s-advertisement-content-icon inline-block align-middle me-2 text-base ${ad.icon ?? ""}` }), ad.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: ad.url,
					target: ad.target ?? void 0,
					rel: ad.target === "_blank" ? "noopener" : void 0,
					children: ad.description
				}) : ad.description]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "s-advertisement-action px-1",
				"aria-label": t("common.buttons.close", "Close"),
				onClick: () => close(ad.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-cancel inline-block" })
			})]
		})
	}, ad.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		suppressHydrationWarning: true,
		children: HIDE_DISMISSED_SCRIPT
	})] });
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-GCPEMNSU.js
var HookRegistry = class {
	constructor() {
		this.hooks = /* @__PURE__ */ new Map();
		this.subscribers = /* @__PURE__ */ new Map();
		this.nextId = 0;
	}
	register(name, handler, priority = 50) {
		const hookName = typeof name === "string" ? name : name;
		const handlers = this.hooks.get(hookName) || [];
		const id = this.nextId++;
		handlers.push({
			id,
			handler,
			priority
		});
		handlers.sort((a, b) => b.priority - a.priority);
		this.hooks.set(hookName, handlers);
		this.notify(hookName);
		return () => this.unregister(hookName, id);
	}
	/** Removes the single handler registered under `id`; other handlers on the slot are kept. */
	unregister(hookName, id) {
		const handlers = this.hooks.get(hookName);
		if (!handlers?.some((h) => h.id === id)) return;
		const remaining = handlers.filter((h) => h.id !== id);
		if (remaining.length) this.hooks.set(hookName, remaining);
		else this.hooks.delete(hookName);
		this.notify(hookName);
	}
	subscribe(name, callback) {
		const hookName = typeof name === "string" ? name : name;
		if (!this.subscribers.has(hookName)) this.subscribers.set(hookName, /* @__PURE__ */ new Set());
		this.subscribers.get(hookName).add(callback);
		return () => this.unsubscribe(hookName, callback);
	}
	unsubscribe(name, callback) {
		const hookName = typeof name === "string" ? name : name;
		this.subscribers.get(hookName)?.delete(callback);
	}
	notify(name) {
		this.subscribers.get(name)?.forEach((cb) => cb());
	}
	getHandlers(name) {
		const hookName = typeof name === "string" ? name : name;
		return this.hooks.get(hookName) || [];
	}
	has(name) {
		const hookName = typeof name === "string" ? name : name;
		return this.hooks.has(hookName) && this.hooks.get(hookName).length > 0;
	}
	clear(name) {
		const hookName = typeof name === "string" ? name : name;
		this.hooks.delete(hookName);
		this.notify(hookName);
	}
	clearAll() {
		this.hooks.clear();
		Array.from(this.subscribers.keys()).forEach((name) => this.notify(name));
	}
	list() {
		return Array.from(this.hooks.keys());
	}
};
var hookRegistry = new HookRegistry();
//#endregion
//#region node_modules/.pnpm/@lit+react@1.0.8_@types+react@19.3.0/node_modules/@lit/react/create-component.js
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var e = /* @__PURE__ */ new Set([
	"children",
	"localName",
	"ref",
	"style",
	"className"
]);
var n$1 = /* @__PURE__ */ new WeakMap();
var t = (e, t, o, l, a) => {
	const s = a?.[t];
	void 0 === s ? (e[t] = o, null == o && t in HTMLElement.prototype && e.removeAttribute(t)) : o !== l && ((e, t, o) => {
		let l = n$1.get(e);
		void 0 === l && n$1.set(e, l = /* @__PURE__ */ new Map());
		let a = l.get(t);
		void 0 !== o ? void 0 === a ? (l.set(t, a = { handleEvent: o }), e.addEventListener(t, a)) : a.handleEvent = o : void 0 !== a && (l.delete(t), e.removeEventListener(t, a));
	})(e, s, o);
};
var o = ({ react: n, tagName: o, elementClass: l, events: a, displayName: s }) => {
	const c = new Set(Object.keys(a ?? {})), r = n.forwardRef(((s, r) => {
		const i = n.useRef(/* @__PURE__ */ new Map()), d = n.useRef(null), f = {}, u = {};
		for (const [n, t] of Object.entries(s)) e.has(n) ? f["className" === n ? "class" : n] = t : c.has(n) || n in l.prototype ? u[n] = t : f[n] = t;
		return n.useLayoutEffect((() => {
			if (null === d.current) return;
			const e = /* @__PURE__ */ new Map();
			for (const n in u) t(d.current, n, s[n], i.current.get(n), a), i.current.delete(n), e.set(n, s[n]);
			for (const [e, n] of i.current) t(d.current, e, void 0, n, a);
			i.current = e;
		})), n.useLayoutEffect((() => {
			d.current?.removeAttribute("defer-hydration");
		}), []), f.suppressHydrationWarning = !0, n.createElement(o, {
			...f,
			ref: n.useCallback(((e) => {
				d.current = e, "function" == typeof r ? r(e) : null !== r && (r.current = e);
			}), [r])
		});
	}));
	return r.displayName = s ?? l.name, r;
};
//#endregion
//#region node_modules/.pnpm/@stencil+react-output-targe_ce0ab39ea14287581fffaa65d8b6c6ed/node_modules/@stencil/react-output-target/dist/create-component-ICzm58MY.js
var p = (s) => s ? s.split(/\s+/).filter(Boolean) : [];
var w = (s, r, l) => {
	const o = new Set(p(r)), f = new Set(p(l)), c = [];
	for (const e of s) o.has(e) ? (c.push(e), o.delete(e)) : f.has(e) || c.push(e);
	for (const e of o) c.push(e);
	return c.join(" ");
};
var g = typeof window < "u" ? import_react.useLayoutEffect : import_react.useEffect;
var L = ({ defineCustomElement: s, tagName: r, transformTag: l, ...o$1 }) => {
	typeof s < "u" && s();
	const f = l ? l(r) : r, c = o({
		...o$1,
		tagName: f
	}), e = import_react.forwardRef((N, a) => {
		const { className: C, class: d, ...y } = N, u = C ?? d ?? "", m = import_react.useRef(null), i = import_react.useRef("");
		g(() => {
			const t = m.current;
			t === null || u === i.current || (t.className = w(Array.from(t.classList), u, i.current), i.current = u);
		});
		const R = import_react.useCallback((t) => {
			m.current = t, typeof a == "function" ? a(t) : a != null && (a.current = t);
		}, [a]);
		return import_react.createElement(c, {
			...y,
			ref: R
		});
	});
	return e.displayName = o$1.displayName ?? f, e;
};
var observerMap = /* @__PURE__ */ new Map();
var RootIds = /* @__PURE__ */ new WeakMap();
var rootId = 0;
var unsupportedValue;
function getRootId(root) {
	if (!root) return "0";
	if (RootIds.has(root)) return RootIds.get(root);
	rootId += 1;
	RootIds.set(root, rootId.toString());
	return RootIds.get(root);
}
function optionsToId(options) {
	return Object.keys(options).sort().filter((key) => options[key] !== void 0).map((key) => {
		return `${key}_${key === "root" ? getRootId(options.root) : options[key]}`;
	}).toString();
}
function createObserver(options) {
	const id = optionsToId(options);
	let instance = observerMap.get(id);
	if (!instance) {
		const elements = /* @__PURE__ */ new Map();
		let thresholds;
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				var _a2;
				const inView = entry.isIntersecting && thresholds.some((threshold) => entry.intersectionRatio >= threshold);
				if (options.trackVisibility && typeof entry.isVisible === "undefined") entry.isVisible = inView;
				[...(_a2 = elements.get(entry.target)) != null ? _a2 : []].forEach((callback) => {
					callback(inView, entry);
				});
			});
		}, options);
		thresholds = observer.thresholds || (Array.isArray(options.threshold) ? options.threshold : [options.threshold || 0]);
		instance = {
			id,
			observer,
			elements
		};
		observerMap.set(id, instance);
	}
	return instance;
}
function observe(element, callback, options = {}, fallbackInView = unsupportedValue) {
	if (typeof window.IntersectionObserver === "undefined" && fallbackInView !== void 0) {
		const bounds = element.getBoundingClientRect();
		callback(fallbackInView, {
			isIntersecting: fallbackInView,
			target: element,
			intersectionRatio: typeof options.threshold === "number" ? options.threshold : 0,
			time: 0,
			boundingClientRect: bounds,
			intersectionRect: bounds,
			rootBounds: bounds
		});
		return () => {};
	}
	const { id, observer, elements } = createObserver(options);
	const callbacks = elements.get(element) || [];
	if (!elements.has(element)) elements.set(element, callbacks);
	callbacks.push(callback);
	observer.observe(element);
	return function unobserve() {
		callbacks.splice(callbacks.indexOf(callback), 1);
		if (callbacks.length === 0) {
			elements.delete(element);
			observer.unobserve(element);
		}
		if (elements.size === 0) {
			observer.disconnect();
			observerMap.delete(id);
		}
	};
}
import_react.Component;
function useInView({ threshold, delay, trackVisibility, rootMargin, scrollMargin, root, triggerOnce, skip, initialInView, fallbackInView, onChange } = {}) {
	var _a2;
	const [ref, setRef] = import_react.useState(null);
	const callback = import_react.useRef(onChange);
	const lastInViewRef = import_react.useRef(initialInView);
	const [state, setState] = import_react.useState({
		inView: !!initialInView,
		entry: void 0
	});
	callback.current = onChange;
	import_react.useEffect(() => {
		if (lastInViewRef.current === void 0) lastInViewRef.current = initialInView;
		if (skip || !ref) return;
		let unobserve;
		unobserve = observe(ref, (inView, entry) => {
			const previousInView = lastInViewRef.current;
			lastInViewRef.current = inView;
			if (previousInView === void 0 && !inView) return;
			setState({
				inView,
				entry
			});
			if (callback.current) callback.current(inView, entry);
			if (entry.isIntersecting && triggerOnce && unobserve) {
				unobserve();
				unobserve = void 0;
			}
		}, {
			root,
			rootMargin,
			scrollMargin,
			threshold,
			trackVisibility,
			delay
		}, fallbackInView);
		return () => {
			if (unobserve) unobserve();
		};
	}, [
		Array.isArray(threshold) ? threshold.toString() : threshold,
		ref,
		root,
		rootMargin,
		scrollMargin,
		triggerOnce,
		skip,
		trackVisibility,
		fallbackInView,
		delay
	]);
	const entryTarget = (_a2 = state.entry) == null ? void 0 : _a2.target;
	const previousEntryTarget = import_react.useRef(void 0);
	if (!ref && entryTarget && !triggerOnce && !skip && previousEntryTarget.current !== entryTarget) {
		previousEntryTarget.current = entryTarget;
		setState({
			inView: !!initialInView,
			entry: void 0
		});
		lastInViewRef.current = initialInView;
	}
	const result = [
		setRef,
		state.inView,
		state.entry
	];
	result.ref = result[0];
	result.inView = result[1];
	result.entry = result[2];
	return result;
}
var _a;
((_a = "useInsertionEffect" in import_react ? import_react.useInsertionEffect : void 0) != null ? _a : import_react.useLayoutEffect) != null || import_react.useEffect;
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/hydration/HydrationBoundary.js
var HydrationErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	componentDidCatch(error, info) {
		console.warn(`[HydrationBoundary:${this.props.name}]`, error.message, info.componentStack);
	}
	render() {
		if (this.state.hasError) return this.props.fallback;
		return this.props.children;
	}
};
var hbInstanceId = 0;
function HydrationBoundary({ children, fallback = null, eventTriggered = false, forceHydrate = false, rootMargin = "200px", _debugName = "unknown" }) {
	const [instanceId] = (0, import_react.useState)(() => ++hbInstanceId);
	const [shouldHydrate, setShouldHydrate] = (0, import_react.useState)(forceHydrate);
	const [isClient, setIsClient] = (0, import_react.useState)(false);
	const wrapperRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setIsClient(true);
	}, []);
	const { ref: inViewRef, inView } = useInView({
		rootMargin,
		triggerOnce: true,
		skip: eventTriggered || shouldHydrate
	});
	(0, import_react.useEffect)(() => {
		if (eventTriggered || forceHydrate) {
			setShouldHydrate(true);
			return;
		}
		if (!fallback) {
			setShouldHydrate(true);
			return;
		}
		if (inView) setShouldHydrate(true);
	}, [
		inView,
		forceHydrate,
		eventTriggered,
		fallback
	]);
	const setRefs = (0, import_react.useCallback)((node) => {
		wrapperRef.current = node;
		if (!shouldHydrate) inViewRef(node);
	}, [inViewRef, shouldHydrate]);
	if (eventTriggered) {
		if (!isClient) return null;
		return (0, import_jsx_runtime.jsx)(HydrationErrorBoundary, {
			fallback: null,
			name: _debugName,
			children
		});
	}
	return (0, import_jsx_runtime.jsx)("div", {
		ref: setRefs,
		suppressHydrationWarning: true,
		style: !shouldHydrate ? { width: "100%" } : void 0,
		children: shouldHydrate ? (0, import_jsx_runtime.jsx)(HydrationErrorBoundary, {
			fallback,
			name: _debugName,
			children: (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback,
				children
			})
		}) : fallback
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/skeletons/index.js
var Pulse = (0, import_react.memo)(function Pulse({ className, circle, style }) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-pulse ${circle ? "rounded-full" : "rounded-md"} ${className ?? ""}`,
		style
	});
});
function Skeleton({ type = "normal", width = "100%", height = "100%", className }) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-wrapper ${className || ""}`,
		style: {
			width,
			height
		},
		suppressHydrationWarning: true,
		children: (0, import_jsx_runtime.jsx)(Pulse, {
			circle: type === "circle",
			style: {
				width: "100%",
				height: "100%"
			}
		})
	});
}
function ButtonSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-button ${className || ""}`,
		style: { height: "44px" },
		suppressHydrationWarning: true,
		children: (0, import_jsx_runtime.jsx)(Skeleton, {
			height: "100%",
			width: "100%"
		})
	});
}
function ProductsSliderSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-products-slider ${className || ""}`,
		suppressHydrationWarning: true,
		children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-section-title" }), (0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-products-slider-grid",
			children: [
				1,
				2,
				3,
				4
			].map((i) => (0, import_jsx_runtime.jsx)(ProductCardSkeleton, {}, i))
		})]
	});
}
function FixedProductsSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `${className || ""}`,
		suppressHydrationWarning: true,
		children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-section-title" }), (0, import_jsx_runtime.jsx)(ProductsListSkeleton, {
			columns: 4,
			count: 4
		})]
	});
}
function ProductCardSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-product-card s-product-card-entry s-product-card-animated s-product-card-vertical ${className || ""}`,
		children: [(0, import_jsx_runtime.jsx)("div", {
			className: "s-product-card-image",
			children: (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-card-image" })
		}), (0, import_jsx_runtime.jsxs)("div", {
			className: "s-product-card-content s-skeleton-product-card-content",
			children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-lg" }), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-sm" })]
		})]
	});
}
function MenuSkeleton({ className, type = "rows", count = 3 } = {}) {
	return (0, import_jsx_runtime.jsx)("nav", {
		className: `${type === "columns" ? "s-skeleton-menu-columns" : "s-skeleton-menu-rows"} ${className || ""}`,
		suppressHydrationWarning: true,
		children: Array.from({ length: count }, (_, i) => (0, import_jsx_runtime.jsx)(Skeleton, {
			height: "18px",
			width: type === "columns" ? "100%" : `${60 + (i + 1) * 10}px`
		}, i))
	});
}
function MenuColumnSkeleton({ className, count = 3 } = {}) {
	return (0, import_jsx_runtime.jsx)(MenuSkeleton, {
		className,
		type: "columns",
		count
	});
}
function MenuIconSkeleton({ className, count = 5 } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-menu-icon ${className || ""}`,
		suppressHydrationWarning: true,
		children: Array.from({ length: count }, (_, i) => (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-menu-icon-item",
			style: {
				display: "flex",
				alignItems: "center",
				gap: "12px",
				padding: "10px 16px"
			},
			children: [(0, import_jsx_runtime.jsx)(Skeleton, {
				type: "circle",
				height: "20px",
				width: "20px"
			}), (0, import_jsx_runtime.jsx)(Skeleton, {
				height: "14px",
				width: "80%"
			})]
		}, i))
	});
}
function ProductsListSkeleton({ className, count = 6, columns } = {}) {
	const gridStyle = columns ? void 0 : { gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" };
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-products-list ${columns ? columns >= 4 ? "s-skeleton-products-list-grid-4" : columns >= 3 ? "s-skeleton-products-list-grid-3" : "s-skeleton-products-list-grid-2" : "s-skeleton-products-list-grid-2"} ${className || ""}`,
		style: gridStyle,
		suppressHydrationWarning: true,
		children: Array.from({ length: count }, (_, i) => (0, import_jsx_runtime.jsx)(ProductCardSkeleton, {}, i))
	});
}
function BulletDeliverySkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-bullet-delivery ${className || ""}`,
		suppressHydrationWarning: true,
		children: [
			1,
			2,
			3
		].map((i) => (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-bullet-item",
			children: [(0, import_jsx_runtime.jsx)(Skeleton, {
				type: "circle",
				height: "24px",
				width: "24px"
			}), (0, import_jsx_runtime.jsx)(Skeleton, {
				height: "14px",
				width: "70%"
			})]
		}, i))
	});
}
function CardSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-card ${className || ""}`,
		suppressHydrationWarning: true,
		children: [
			(0, import_jsx_runtime.jsx)(Skeleton, {
				height: "20px",
				width: "60%"
			}),
			(0, import_jsx_runtime.jsx)("div", {
				className: "s-skeleton-card-line-lg",
				children: (0, import_jsx_runtime.jsx)(Skeleton, {
					height: "14px",
					width: "100%"
				})
			}),
			(0, import_jsx_runtime.jsx)("div", {
				className: "s-skeleton-card-line",
				children: (0, import_jsx_runtime.jsx)(Skeleton, {
					height: "14px",
					width: "80%"
				})
			})
		]
	});
}
function ReviewItemSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-review ${className || ""}`,
		suppressHydrationWarning: true,
		children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-section-title" }), (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-review-body",
			children: [(0, import_jsx_runtime.jsx)(Skeleton, {
				type: "circle",
				height: "40px",
				width: "40px"
			}), (0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-body-fill",
				children: [
					(0, import_jsx_runtime.jsx)("div", {
						className: "s-skeleton-review-stars",
						children: [
							1,
							2,
							3,
							4,
							5
						].map((i) => (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-review-star" }, i))
					}),
					(0, import_jsx_runtime.jsx)(Skeleton, {
						height: "14px",
						width: "50%"
					}),
					(0, import_jsx_runtime.jsx)("div", {
						className: "s-skeleton-card-line",
						children: (0, import_jsx_runtime.jsx)(Skeleton, {
							height: "12px",
							width: "100%"
						})
					}),
					(0, import_jsx_runtime.jsx)("div", {
						className: "s-skeleton-card-line-sm",
						children: (0, import_jsx_runtime.jsx)(Skeleton, {
							height: "12px",
							width: "75%"
						})
					})
				]
			})]
		})]
	});
}
function CircleSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)(Skeleton, {
		type: "circle",
		height: "40px",
		width: "40px",
		className: className || "s-skeleton-circle-default"
	});
}
function ListSkeleton({ className, count = 4 } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-list ${className || ""}`,
		suppressHydrationWarning: true,
		children: Array.from({ length: count }, (_, i) => (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-list-item",
			children: [(0, import_jsx_runtime.jsx)(Skeleton, {
				height: "48px",
				width: "48px"
			}), (0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-body-fill",
				children: [(0, import_jsx_runtime.jsx)(Skeleton, {
					height: "14px",
					width: "60%"
				}), (0, import_jsx_runtime.jsx)("div", {
					className: "s-skeleton-card-line",
					children: (0, import_jsx_runtime.jsx)(Skeleton, {
						height: "12px",
						width: "80%"
					})
				})]
			})]
		}, i))
	});
}
function FormSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-form ${className || ""}`,
		suppressHydrationWarning: true,
		children: [1, 2].map((i) => (0, import_jsx_runtime.jsxs)("div", { children: [(0, import_jsx_runtime.jsx)(Skeleton, {
			height: "14px",
			width: "30%"
		}), (0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-card-line",
			children: (0, import_jsx_runtime.jsx)(Skeleton, {
				height: "38px",
				width: "100%"
			})
		})] }, i))
	});
}
function SearchSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-search ${className || ""}`,
		suppressHydrationWarning: true,
		children: [(0, import_jsx_runtime.jsx)(Skeleton, {
			type: "circle",
			height: "24px",
			width: "24px"
		}), (0, import_jsx_runtime.jsx)(Skeleton, {
			height: "20px",
			width: "100%"
		})]
	});
}
function FilterSectionSkeleton() {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-filter-section bg-white rounded-lg p-4 mb-4",
		children: [(0, import_jsx_runtime.jsx)(Skeleton, {
			height: "18px",
			width: "40%"
		}), (0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-filter-options flex flex-col gap-2 mt-3",
			children: [
				1,
				2,
				3,
				4,
				5
			].map((i) => (0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-filter-option flex items-center gap-2",
				children: [(0, import_jsx_runtime.jsx)(Skeleton, {
					type: "circle",
					height: "16px",
					width: "16px"
				}), (0, import_jsx_runtime.jsx)(Skeleton, {
					height: "14px",
					width: "120px"
				})]
			}, i))
		})]
	});
}
function FiltersSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-filters flex flex-col gap-4 ${className || ""}`,
		suppressHydrationWarning: true,
		children: [1, 2].map((i) => (0, import_jsx_runtime.jsx)(FilterSectionSkeleton, {}, i))
	});
}
function PaymentSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)("div", {
		className: `s-skeleton-payment ${className || ""}`,
		suppressHydrationWarning: true,
		children: [
			1,
			2,
			3,
			4
		].map((i) => (0, import_jsx_runtime.jsx)(Skeleton, {
			height: "32px",
			width: "48px"
		}, i))
	});
}
function InputSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsx)(Skeleton, {
		className: `s-skeleton-input ${className || ""}`,
		height: "38px",
		width: "50%"
	});
}
function SliderSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-slider ${className || ""}`,
		suppressHydrationWarning: true,
		children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-slider-image" }), (0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-slider-thumbs",
			children: Array.from({ length: 3 }, (_, i) => (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-slider-thumb" }, i))
		})]
	});
}
function BackgroundSliderSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-slider ${className || ""}`,
		suppressHydrationWarning: true,
		children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-slider-image" }), (0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-thumbs-centered",
			children: [
				1,
				2,
				3
			].map((i) => (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-bgslider-dot" }, i))
		})]
	});
}
function BreadcrumbSkeleton({ className } = {}) {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: `s-skeleton-breadcrumb ${className || ""}`,
		children: [
			(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-breadcrumb-item-sm" }),
			(0, import_jsx_runtime.jsx)(Pulse, {
				className: "s-skeleton-breadcrumb-sep",
				circle: true
			}),
			(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-breadcrumb-item-lg" })
		]
	});
}
var PageSkeleton = (0, import_react.memo)(function PageSkeleton({ children }) {
	if (children) return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-page",
		children: [(0, import_jsx_runtime.jsx)(BreadcrumbSkeleton, {}), (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-page-content",
			children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-section-title" }), (0, import_jsx_runtime.jsx)(ProductsListSkeleton, { columns: 4 })]
		})]
	});
});
var ProductDetailSkeleton = (0, import_react.memo)(function ProductDetailSkeleton() {
	return (0, import_jsx_runtime.jsx)("div", { children: (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-detail-container",
		children: [(0, import_jsx_runtime.jsx)(BreadcrumbSkeleton, {}), (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-detail-layout",
			children: [(0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-detail-images",
				children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-card-image" }), (0, import_jsx_runtime.jsx)("div", {
					className: "s-skeleton-slider-thumbs",
					children: Array.from({ length: 3 }, (_, i) => (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-slider-thumb" }, i))
				})]
			}), (0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-detail-content",
				children: [
					(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-title" }),
					(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-badge" }),
					(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-price" }),
					(0, import_jsx_runtime.jsxs)("div", {
						className: "s-skeleton-detail-description",
						children: [
							(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-full" }),
							(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-lg" }),
							(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-sm" })
						]
					}),
					(0, import_jsx_runtime.jsxs)("div", {
						className: "s-skeleton-detail-colors",
						children: [(0, import_jsx_runtime.jsx)(Pulse, {
							className: "s-skeleton-circle-md",
							circle: true
						}), (0, import_jsx_runtime.jsx)(Pulse, {
							className: "s-skeleton-circle-md",
							circle: true
						})]
					}),
					(0, import_jsx_runtime.jsxs)("div", {
						className: "s-skeleton-detail-price-bar",
						children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-bar-label" }), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-bar-value" })]
					}),
					(0, import_jsx_runtime.jsxs)("div", {
						className: "s-skeleton-detail-actions",
						children: [(0, import_jsx_runtime.jsxs)("div", {
							className: "s-skeleton-detail-actions-row",
							children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-actions-label" }), (0, import_jsx_runtime.jsxs)("div", {
								className: "s-skeleton-detail-size-selectors",
								children: [
									(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-rounded-md-sm" }),
									(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-size-rect" }),
									(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-rounded-md-sm" })
								]
							})]
						}), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-detail-add-btn" })]
					})
				]
			})]
		})]
	}) });
});
var BlogSkeleton = (0, import_react.memo)(function BlogSkeleton() {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-page",
		children: [
			(0, import_jsx_runtime.jsx)(BreadcrumbSkeleton, {}),
			(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-section-title" }),
			(0, import_jsx_runtime.jsx)("div", {
				className: "s-skeleton-blog-grid",
				children: Array.from({ length: 6 }, (_, i) => (0, import_jsx_runtime.jsxs)("div", {
					className: "s-skeleton-blog-card",
					children: [
						(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-blog-card-image" }),
						(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-blog-card-title" }),
						(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-full" }),
						(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-sm" })
					]
				}, i))
			})
		]
	});
});
function CartItemSkeleton() {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-cart-item",
		suppressHydrationWarning: true,
		children: [
			(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-item-image" }),
			(0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-cart-item-info",
				children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-item-title" }), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-item-price" })]
			}),
			(0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-cart-item-actions",
				children: [
					(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-item-qty" }),
					(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-item-total" }),
					(0, import_jsx_runtime.jsx)(Pulse, {
						className: "s-skeleton-cart-item-delete",
						circle: true
					})
				]
			})
		]
	});
}
function CartSummarySkeleton() {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-cart-summary",
		suppressHydrationWarning: true,
		children: [
			(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-title" }),
			(0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-cart-summary-row",
				children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-label" }), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-value" })]
			}),
			(0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-cart-summary-row",
				children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-label" }), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-value" })]
			}),
			(0, import_jsx_runtime.jsxs)("div", {
				className: "s-skeleton-cart-summary-row",
				children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-total-label" }), (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-total-value" })]
			}),
			(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-cart-summary-button" })
		]
	});
}
var CartSkeleton = (0, import_react.memo)(function CartSkeleton() {
	return (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-page",
		children: [(0, import_jsx_runtime.jsx)(BreadcrumbSkeleton, {}), (0, import_jsx_runtime.jsxs)("div", {
			className: "s-skeleton-cart-layout",
			children: [(0, import_jsx_runtime.jsx)("div", {
				className: "s-skeleton-cart-items",
				children: [
					1,
					2,
					3
				].map((i) => (0, import_jsx_runtime.jsx)(CartItemSkeleton, {}, i))
			}), (0, import_jsx_runtime.jsx)(CartSummarySkeleton, {})]
		})]
	});
});
var CustomerLayoutSkeleton = (0, import_react.memo)(function CustomerLayoutSkeleton() {
	return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("div", {
		className: "profile-header gradient-bg",
		children: (0, import_jsx_runtime.jsx)("div", {
			className: "container relative flex justify-between h-full items-center",
			children: (0, import_jsx_runtime.jsx)(BreadcrumbSkeleton, { className: "breadcrumbs w-full py-5 self-start" })
		})
	}), (0, import_jsx_runtime.jsx)("div", {
		className: "container lg:mb-24",
		children: (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start flex-col lg:flex-row justify-center",
			children: [(0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Sidebar",
				className: "shrink-0 lg:sticky top-24 lg:-mt-28 lg:shadow-default rounded-md lg:bg-white w-full lg:w-72 rtl:lg:ml-8 ltr:lg:mr-8 lg:pt-8 lg:pb-11 sidebar space-y-px",
				children: (0, import_jsx_runtime.jsx)(MenuIconSkeleton, { count: 5 })
			}), (0, import_jsx_runtime.jsx)("div", {
				className: "main-content w-full flex-1 lg:pt-10 max-w-3xl",
				children: (0, import_jsx_runtime.jsx)(CustomerPageSkeleton, {})
			})]
		})
	})] });
});
var CustomerPageSkeleton = (0, import_react.memo)(function CustomerPageSkeleton() {
	return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-section-title" }), (0, import_jsx_runtime.jsxs)("div", {
		className: "s-skeleton-card",
		children: [(0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-card-line-lg",
			children: (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-full" })
		}), (0, import_jsx_runtime.jsx)("div", {
			className: "s-skeleton-card-line",
			children: (0, import_jsx_runtime.jsx)(Pulse, { className: "s-skeleton-text-line-lg" })
		})]
	})] });
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/hydration/withDeferredHydration.js
var skeletonMap = {
	SliderSkeleton,
	ProductsSliderSkeleton,
	ProductCardSkeleton,
	MenuSkeleton,
	MenuColumnSkeleton,
	PaymentSkeleton,
	ProductsListSkeleton,
	BulletDeliverySkeleton,
	BackgroundSliderSkeleton,
	CardSkeleton,
	CircleSkeleton,
	ListSkeleton,
	FormSkeleton,
	SearchSkeleton,
	FiltersSkeleton,
	ButtonSkeleton,
	ReviewItemSkeleton,
	InputSkeleton,
	MenuIconSkeleton
};
var clientOnlyComponents = {
	"SallaLoginModal": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaLocalizationModal": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaOfferModal": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaRatingModal": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaMultipleBundleProductOptionsModal": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaScopes": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaGifting": {
		skeleton: null,
		eventTriggered: true
	},
	"SallaSlider": { skeleton: "BackgroundSliderSkeleton" },
	"SallaProductCard": { skeleton: "ProductCardSkeleton" },
	"SallaProductsSlider": { skeleton: "ProductsSliderSkeleton" },
	"SallaProductsList": { skeleton: "ProductsListSkeleton" },
	"SallaMenu": { skeleton: "MenuColumnSkeleton" },
	"SallaBulletDelivery": { skeleton: "BulletDeliverySkeleton" },
	"SallaSearch": { skeleton: "SearchSkeleton" },
	"SallaFilters": { skeleton: "FiltersSkeleton" },
	"SallaCartSummary": { skeleton: "CircleSkeleton" },
	"SallaCartItemOffers": { skeleton: "CardSkeleton" },
	"SallaOrderSummary": { skeleton: "CardSkeleton" },
	"SallaOrders": { skeleton: "ListSkeleton" },
	"SallaReviews": { skeleton: null },
	"SallaComments": { skeleton: "ReviewItemSkeleton" },
	"SallaNotifications": { skeleton: "ListSkeleton" },
	"SallaUserProfile": { skeleton: "CardSkeleton" },
	"SallaUserMenu": { skeleton: (props) => props.avatarOnly ? "CircleSkeleton" : "MenuIconSkeleton" },
	"SallaBreadcrumb": { skeleton: "MenuSkeleton" },
	"SallaProductOptions": { skeleton: "ProductCardSkeleton" },
	"SallaProductAvailability": { skeleton: "ProductCardSkeleton" },
	"SallaAddProductButton": { skeleton: "ButtonSkeleton" },
	"SallaQuickBuy": { skeleton: "ProductCardSkeleton" },
	"SallaOffer": { skeleton: "CardSkeleton" },
	"SallaTieredOffer": { skeleton: "CardSkeleton" },
	"SallaConditionalOffer": { skeleton: "CardSkeleton" },
	"SallaBookingField": { skeleton: "InputSkeleton" },
	"SallaCustomFields": { skeleton: "InputSkeleton" },
	"SallaFileUpload": { skeleton: "InputSkeleton" },
	"SallaDatetimePicker": { skeleton: "InputSkeleton" },
	"SallaTelInput": { skeleton: "InputSkeleton" },
	"SallaMetadata": { skeleton: null },
	"SallaAdvertisement": { skeleton: null },
	"SallaMap": { skeleton: null },
	"SallaBottomAlert": { skeleton: null },
	"SallaMaintenanceAlert": { skeleton: null },
	"SallaAppInstallAlert": { skeleton: null },
	"SallaCookiesBar": { skeleton: null },
	"SallaUserSettings": { skeleton: "FormSkeleton" },
	"SallaVerify": { skeleton: "FormSkeleton" },
	"SallaWallet": { skeleton: "CardSkeleton" },
	"SallaLoyalty": { skeleton: "CardSkeleton" },
	"SallaLoyaltyProgram": { skeleton: "CardSkeleton" },
	"SallaReviewsPage": { skeleton: "ReviewItemSkeleton" },
	"SallaReviewsSummary": { skeleton: "CardSkeleton" },
	"SallaCommentForm": { skeleton: "FormSkeleton" },
	"SallaPriceRange": { skeleton: "FormSkeleton" },
	"SallaFiltersWidget": { skeleton: "FormSkeleton" },
	"SallaInfiniteScroll": { skeleton: null },
	"SallaRatingStars": { skeleton: "CardSkeleton" },
	"SallaProductSizeGuide": { skeleton: null },
	"SallaMultipleBundleProduct": { skeleton: "CardSkeleton" },
	"SallaMultipleBundleProductCart": { skeleton: "CardSkeleton" },
	"SallaMultipleBundleProductDetails": { skeleton: "CardSkeleton" },
	"SallaMultipleBundleProductSlider": { skeleton: "ProductsSliderSkeleton" },
	"SallaOrderDetails": { skeleton: "CardSkeleton" },
	"SallaOrderDetailsMultipleBundleProduct": { skeleton: "CardSkeleton" },
	"SallaOrderDetailsOptions": { skeleton: "CardSkeleton" },
	"SallaOrderTotalsCard": { skeleton: "CardSkeleton" },
	"SallaPayments": { skeleton: "PaymentSkeleton" },
	"SallaInstallment": { skeleton: "CardSkeleton" },
	"SallaQuickOrder": { skeleton: "FormSkeleton" },
	"SallaCountDown": { skeleton: "CardSkeleton" },
	"SallaSocialShare": { skeleton: "CircleSkeleton" },
	"SallaSocial": { skeleton: "CircleSkeleton" },
	"SallaTrustBadges": { skeleton: null },
	"SallaConditionalFields": { skeleton: "FormSkeleton" },
	"SallaQuantityInput": { skeleton: "InputSkeleton" }
};
/**
* Error boundary that catches errors from Stencil web components during
* render and lifecycle (including disconnectedCallback errors on unmount).
* Prevents SDK errors from bubbling up to the router's CatchBoundaryImpl
* which would recreate the entire page tree.
*/
var WebComponentErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError() {
		return { hasError: true };
	}
	componentDidCatch(error, info) {}
	render() {
		if (this.state.hasError) return null;
		return this.props.children;
	}
};
function withDeferredHydration(Component, componentName, options) {
	const config = clientOnlyComponents[componentName];
	if (!config) return Component;
	const WrappedComponent = (props) => {
		const skeletonName = typeof config.skeleton === "function" ? config.skeleton(props) : config.skeleton;
		const SkeletonComponent = skeletonName ? skeletonMap[skeletonName] : null;
		const fallback = SkeletonComponent ? import_react.createElement(SkeletonComponent, config.skeletonProps) : null;
		return (0, import_jsx_runtime.jsx)(HydrationBoundary, {
			fallback,
			eventTriggered: config.eventTriggered,
			rootMargin: options?.rootMargin,
			_debugName: componentName,
			children: (0, import_jsx_runtime.jsx)(WebComponentErrorBoundary, {
				name: componentName,
				children: (0, import_jsx_runtime.jsx)(Component, { ...props })
			})
		});
	};
	WrappedComponent.displayName = `withDeferredHydration(${componentName})`;
	return WrappedComponent;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-hook.js
var SallaHookElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get mount() {
		return true;
	}
	get name() {
		return true;
	}
};
var defineSallaHook_runtime = () => {};
var SallaHookCore = /*@__PURE__*/ L({
	tagName: "salla-hook",
	elementClass: SallaHookElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaHook_runtime
});
SallaHookCore.displayName = "SallaHookCore";
var SallaHook$1 = withDeferredHydration(SallaHookCore, "SallaHook");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-5XDPAKF5.js
function useIsClient() {
	const [isClient, setIsClient] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setIsClient(true), []);
	return isClient;
}
function HookHandlerComponent({ handler, context }) {
	try {
		const result = handler(context);
		if (result === null || result === void 0) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: result });
	} catch (error) {
		return null;
	}
}
function SallaHook({ name }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaHook$1, { name });
}
function HookSlot({ name, context, fallback = null, ssr = false }) {
	const hookName = typeof name === "string" ? name : name;
	const [, forceUpdate] = (0, import_react.useState)(0);
	const twilight = useTwilight();
	const isClient = useIsClient();
	(0, import_react.useEffect)(() => {
		return hookRegistry.subscribe(hookName, () => forceUpdate((n) => n + 1));
	}, [hookName]);
	const fullContext = {
		...context,
		twilight
	};
	const handlers = hookRegistry.getHandlers(hookName);
	const reactHooks = handlers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: handlers.map((def) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookHandlerComponent, {
		handler: def.handler,
		context: fullContext
	}, def.id)) }) : fallback;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(ssr || isClient) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaHook, { name: hookName }), reactHooks] });
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-SKLEJJ6M.js
var CDN_HOSTS = [
	"cdn.salla.sa",
	"cdn.salla.network",
	"cdn.files.salla.network"
];
var CDN_TRANSFORM_PREFIX = "/cdn-cgi/image/";
function stripCdnTransforms(url) {
	try {
		const parsed = new URL(url);
		if (!parsed.pathname.startsWith(CDN_TRANSFORM_PREFIX)) return url;
		const after = parsed.pathname.slice(CDN_TRANSFORM_PREFIX.length);
		const pathStart = after.indexOf("/");
		if (pathStart === -1) return url;
		parsed.pathname = after.slice(pathStart);
		return parsed.toString();
	} catch {
		return url;
	}
}
function getCdnImageUrl(url, options = {}) {
	if (!url) return url;
	try {
		const parsedOriginal = new URL(url);
		if (!CDN_HOSTS.includes(parsedOriginal.hostname)) return url;
		const w = options.width ? Number(options.width) : void 0;
		const h = options.height ? Number(options.height) : void 0;
		if (!w && !h) return url;
		const parsed = new URL(stripCdnTransforms(url));
		const parts = [
			"fit=scale-down",
			"onerror=redirect",
			"format=auto"
		];
		if (options.quality != null) parts.unshift(`quality=${options.quality}`);
		if (w) parts.push(`width=${w}`);
		if (h) parts.push(`height=${h}`);
		return `${parsed.origin}${CDN_TRANSFORM_PREFIX}${parts.join(",")}${parsed.pathname}${parsed.search}`;
	} catch {
		return url;
	}
}
function getCdnImageSrcSet(url, widths, options = {}) {
	if (!url || widths.length === 0) return void 0;
	const entries = [];
	for (const width of widths) {
		const src = getCdnImageUrl(url, {
			...options,
			width
		});
		if (!src || src === url) return void 0;
		entries.push(`${src} ${width}w`);
	}
	return entries.join(", ");
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-add-product-button.js
var SallaAddProductButtonElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get amount() {
		return true;
	}
	get channels() {
		return true;
	}
	get donatingAmount() {
		return true;
	}
	get fill() {
		return true;
	}
	get hasPreOrder() {
		return true;
	}
	get isSubscribed() {
		return true;
	}
	get loaderPosition() {
		return true;
	}
	get notifyOptionsAvailability() {
		return true;
	}
	get productId() {
		return true;
	}
	get productStatus() {
		return true;
	}
	get productType() {
		return true;
	}
	get quantity() {
		return true;
	}
	get quickBuy() {
		return true;
	}
	get requiredShipping() {
		return true;
	}
	get subscribedOptions() {
		return true;
	}
	get supportStickyBar() {
		return true;
	}
	get type() {
		return true;
	}
	get width() {
		return true;
	}
};
var defineSallaAddProductButton_runtime = () => {};
var SallaAddProductButtonCore = /*@__PURE__*/ L({
	tagName: "salla-add-product-button",
	elementClass: SallaAddProductButtonElement_runtime,
	react: import_react.default,
	events: {
		onSuccess: "success",
		onFailed: "failed"
	},
	defineCustomElement: defineSallaAddProductButton_runtime
});
SallaAddProductButtonCore.displayName = "SallaAddProductButtonCore";
var SallaAddProductButton = withDeferredHydration(SallaAddProductButtonCore, "SallaAddProductButton");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-apps-icons.js
var SallaAppsIconsElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get apps() {
		return true;
	}
	get appsTitle() {
		return true;
	}
	get hideTitle() {
		return true;
	}
	get slotTemplate() {
		return true;
	}
	get vertical() {
		return true;
	}
};
var defineSallaAppsIcons_runtime = () => {};
var SallaAppsIcons = /*@__PURE__*/ L({
	tagName: "salla-apps-icons",
	elementClass: SallaAppsIconsElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaAppsIcons_runtime
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-cart-summary.js
var SallaCartSummaryElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get animateToCart() {
		return true;
	}
	get showCartLabel() {
		return true;
	}
};
var defineSallaCartSummary_runtime = () => {};
var SallaCartSummaryCore = /*@__PURE__*/ L({
	tagName: "salla-cart-summary",
	elementClass: SallaCartSummaryElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaCartSummary_runtime
});
SallaCartSummaryCore.displayName = "SallaCartSummaryCore";
var SallaCartSummary = withDeferredHydration(SallaCartSummaryCore, "SallaCartSummary");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-contacts.js
var SallaContactsElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get contacts() {
		return true;
	}
	get contactsTitle() {
		return true;
	}
	get hideTitle() {
		return true;
	}
	get horizontal() {
		return true;
	}
	get iconsOnly() {
		return true;
	}
	get isHeader() {
		return true;
	}
	get slotTemplate() {
		return true;
	}
};
var defineSallaContacts_runtime = () => {};
var SallaContacts = /*@__PURE__*/ L({
	tagName: "salla-contacts",
	elementClass: SallaContactsElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaContacts_runtime
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-localization-modal.js
var salla_localization_modal_exports = /* @__PURE__ */ __exportAll({
	SallaLocalizationModal: () => SallaLocalizationModal,
	SallaLocalizationModalCore: () => SallaLocalizationModalCore
});
var SallaLocalizationModalElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get close() {
		return true;
	}
	get currency() {
		return true;
	}
	get language() {
		return true;
	}
	get open() {
		return true;
	}
	get showTrigger() {
		return true;
	}
	get submit() {
		return true;
	}
};
var defineSallaLocalizationModal_runtime = () => {};
var SallaLocalizationModalCore = /*@__PURE__*/ L({
	tagName: "salla-localization-modal",
	elementClass: SallaLocalizationModalElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaLocalizationModal_runtime
});
SallaLocalizationModalCore.displayName = "SallaLocalizationModalCore";
var SallaLocalizationModal = withDeferredHydration(SallaLocalizationModalCore, "SallaLocalizationModal");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-menu.js
var SallaMenuElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get limit() {
		return true;
	}
	get source() {
		return true;
	}
	get sourceValue() {
		return true;
	}
	get topnav() {
		return true;
	}
	get useReactLink() {
		return true;
	}
	get withCookiePreferences() {
		return true;
	}
};
var defineSallaMenu_runtime = () => {};
var SallaMenuCore = /*@__PURE__*/ L({
	tagName: "salla-menu",
	elementClass: SallaMenuElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaMenu_runtime
});
SallaMenuCore.displayName = "SallaMenuCore";
var SallaMenu = withDeferredHydration(SallaMenuCore, "SallaMenu");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-payments.js
var SallaPaymentsElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get exclude() {
		return true;
	}
};
var defineSallaPayments_runtime = () => {};
var SallaPaymentsCore = /*@__PURE__*/ L({
	tagName: "salla-payments",
	elementClass: SallaPaymentsElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaPayments_runtime
});
SallaPaymentsCore.displayName = "SallaPaymentsCore";
var SallaPayments = withDeferredHydration(SallaPaymentsCore, "SallaPayments");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-search.js
var SallaSearchElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get height() {
		return true;
	}
	get inline() {
		return true;
	}
	get maxWords() {
		return true;
	}
	get oval() {
		return true;
	}
	get placeholder() {
		return true;
	}
	get showAction() {
		return true;
	}
};
var defineSallaSearch_runtime = () => {};
var SallaSearchCore = /*@__PURE__*/ L({
	tagName: "salla-search",
	elementClass: SallaSearchElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaSearch_runtime
});
SallaSearchCore.displayName = "SallaSearchCore";
var SallaSearch = withDeferredHydration(SallaSearchCore, "SallaSearch");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-slider.js
var SallaSliderElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get arrowsCentered() {
		return true;
	}
	get autoHeight() {
		return true;
	}
	get autoPlay() {
		return true;
	}
	get blockSubtitle() {
		return true;
	}
	get blockTitle() {
		return true;
	}
	get centered() {
		return true;
	}
	get controlsOuter() {
		return true;
	}
	get direction() {
		return true;
	}
	get displayAllTitle() {
		return true;
	}
	get displayAllUrl() {
		return true;
	}
	get getSlides() {
		return true;
	}
	get getThumbsSlides() {
		return true;
	}
	get getThumbsUpdateSize() {
		return true;
	}
	get gridThumbs() {
		return true;
	}
	get listenToThumbnailsOption() {
		return true;
	}
	get loop() {
		return true;
	}
	get pagination() {
		return true;
	}
	get showControls() {
		return true;
	}
	get showThumbsControls() {
		return true;
	}
	get slideNext() {
		return true;
	}
	get slideNextLoop() {
		return true;
	}
	get slidePrev() {
		return true;
	}
	get slidePrevLoop() {
		return true;
	}
	get slideReset() {
		return true;
	}
	get slideTo() {
		return true;
	}
	get slideToClosest() {
		return true;
	}
	get slideToLoop() {
		return true;
	}
	get sliderConfig() {
		return true;
	}
	get sliderInit() {
		return true;
	}
	get sliderInstance() {
		return true;
	}
	get slidesPerView() {
		return true;
	}
	get staticWhenSingle() {
		return true;
	}
	get thumbsConfig() {
		return true;
	}
	get thumbsSlideTo() {
		return true;
	}
	get thumbsSliderInit() {
		return true;
	}
	get thumbsSliderInstance() {
		return true;
	}
	get thumbsSliderUpdate() {
		return true;
	}
	get thumbsSliderUpdateSlides() {
		return true;
	}
	get type() {
		return true;
	}
	get update() {
		return true;
	}
	get updateAutoHeight() {
		return true;
	}
	get updateProgress() {
		return true;
	}
	get updateSize() {
		return true;
	}
	get updateSlides() {
		return true;
	}
	get updateSlidesClasses() {
		return true;
	}
	get vertical() {
		return true;
	}
	get verticalThumbs() {
		return true;
	}
};
var defineSallaSlider_runtime = () => {};
var SallaSliderCore = /*@__PURE__*/ L({
	tagName: "salla-slider",
	elementClass: SallaSliderElement_runtime,
	react: import_react.default,
	events: {
		onAfterInit: "afterInit",
		onSlideChange: "slideChange",
		onReachBeginning: "reachBeginning",
		onReachEnd: "reachEnd",
		onSlideChangeTransitionEnd: "slideChangeTransitionEnd",
		onSlideChangeTransitionStart: "slideChangeTransitionStart",
		onSlideNextTransitionEnd: "slideNextTransitionEnd",
		onSlideNextTransitionStart: "slideNextTransitionStart",
		onSlidePrevTransitionEnd: "slidePrevTransitionEnd",
		onSlidePrevTransitionStart: "slidePrevTransitionStart",
		onSliderMove: "sliderMove",
		onTouchSliderEnd: "touchSliderEnd",
		onTouchSliderMove: "touchSliderMove",
		onTouchSliderStart: "touchSliderStart",
		onSliderTransitionEnd: "sliderTransitionEnd",
		onSliderTransitionStart: "sliderTransitionStart"
	},
	defineCustomElement: defineSallaSlider_runtime
});
SallaSliderCore.displayName = "SallaSliderCore";
var SallaSlider = withDeferredHydration(SallaSliderCore, "SallaSlider");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-social.js
var SallaSocialElement_runtime = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
var defineSallaSocial_runtime = () => {};
var SallaSocialCore = /*@__PURE__*/ L({
	tagName: "salla-social",
	elementClass: SallaSocialElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaSocial_runtime
});
SallaSocialCore.displayName = "SallaSocialCore";
var SallaSocial = withDeferredHydration(SallaSocialCore, "SallaSocial");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-trust-badges.js
var SallaTrustBadgesElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get dark() {
		return true;
	}
};
var defineSallaTrustBadges_runtime = () => {};
var SallaTrustBadgesCore = /*@__PURE__*/ L({
	tagName: "salla-trust-badges",
	elementClass: SallaTrustBadgesElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaTrustBadges_runtime
});
SallaTrustBadgesCore.displayName = "SallaTrustBadgesCore";
var SallaTrustBadges = withDeferredHydration(SallaTrustBadgesCore, "SallaTrustBadges");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/components/salla-user-menu.js
var SallaUserMenuElement_runtime = class extends (typeof HTMLElement !== "undefined" ? HTMLElement : class {}) {
	get avatarOnly() {
		return true;
	}
	get inline() {
		return true;
	}
	get relativeDropdown() {
		return true;
	}
	get showHeader() {
		return true;
	}
	get showTrigger() {
		return true;
	}
};
var defineSallaUserMenu_runtime = () => {};
var SallaUserMenuCore = /*@__PURE__*/ L({
	tagName: "salla-user-menu",
	elementClass: SallaUserMenuElement_runtime,
	react: import_react.default,
	events: {},
	defineCustomElement: defineSallaUserMenu_runtime
});
SallaUserMenuCore.displayName = "SallaUserMenuCore";
var SallaUserMenu = withDeferredHydration(SallaUserMenuCore, "SallaUserMenu");
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-componen_867f4409ef2d28b93be239373a7a959e/node_modules/@salla.sa/twilight-components-react/dist/native/salla-button/SallaButton.js
var DEFAULT_SHAPE = "btn";
var DEFAULT_COLOR = "primary";
var DEFAULT_FILL = "solid";
var DEFAULT_SIZE = "medium";
var DEFAULT_WIDTH = "normal";
var DEFAULT_LOADER_POSITION = "after";
var DEFAULT_TYPE = "button";
function getButtonClasses(props, state) {
	const shape = props.shape ?? DEFAULT_SHAPE;
	const color = props.color ?? DEFAULT_COLOR;
	const fill = props.fill ?? DEFAULT_FILL;
	const size = props.size ?? DEFAULT_SIZE;
	const width = props.width ?? DEFAULT_WIDTH;
	const loaderPosition = props.loaderPosition ?? DEFAULT_LOADER_POSITION;
	return [
		"s-button-element",
		`s-button-${shape}`,
		fill === "none" ? "s-button-fill-none" : shape !== "link" || fill === "outline" ? `s-button-${fill}` : "",
		size !== "medium" ? `s-button-${size}` : "",
		width !== "normal" ? `s-button-${width}` : "",
		shape === "link" ? `s-button-${color}-link` : "",
		shape !== "link" && fill !== "outline" ? `s-button-${color}` : "",
		fill === "outline" ? `s-button-${color}-outline` : "",
		state.disabled ? "s-button-disabled" : "",
		shape === "icon" ? "s-button-loader-center" : `s-button-loader-${loaderPosition}`,
		props.className || ""
	].filter(Boolean).join(" ");
}
function LoadingSpinner({ position }) {
	return (0, import_jsx_runtime.jsx)("span", { className: "s-button-loader" });
}
function ButtonContent({ children, state, loaderPosition, showLoader, textRef }) {
	const hideText = state.loading && loaderPosition === "center";
	return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("span", {
		ref: textRef,
		className: `s-button-text${hideText ? " s-button-hide" : ""}`,
		children: state.textContent ? (0, import_jsx_runtime.jsx)("span", { dangerouslySetInnerHTML: { __html: state.textContent } }) : children
	}), showLoader && (0, import_jsx_runtime.jsx)(LoadingSpinner, { position: loaderPosition })] });
}
var SallaButton = (0, import_react.forwardRef)((props, ref) => {
	const { shape = DEFAULT_SHAPE, color = DEFAULT_COLOR, fill = DEFAULT_FILL, size = DEFAULT_SIZE, width = DEFAULT_WIDTH, loaderPosition = DEFAULT_LOADER_POSITION, type = DEFAULT_TYPE, href, disabled, loading, children, onClick, ariaLabel, ariaLabelledby, id, name, value, tabIndex, style } = props;
	const textRef = (0, import_react.useRef)(null);
	const [state, setState] = (0, import_react.useState)({
		loading: loading ?? false,
		disabled: disabled ?? false,
		textContent: ""
	});
	(0, import_react.useEffect)(() => {
		if (loading !== void 0) setState((prev) => ({
			...prev,
			loading
		}));
	}, [loading]);
	(0, import_react.useEffect)(() => {
		if (disabled !== void 0) setState((prev) => ({
			...prev,
			disabled
		}));
	}, [disabled]);
	(0, import_react.useImperativeHandle)(ref, () => ({
		load: () => {
			setState((prev) => ({
				...prev,
				loading: true
			}));
		},
		stop: () => {
			setState((prev) => ({
				...prev,
				loading: false
			}));
		},
		setText: (html) => {
			setState((prev) => ({
				...prev,
				textContent: html
			}));
		},
		disable: () => {
			setState((prev) => ({
				...prev,
				disabled: true
			}));
		},
		enable: () => {
			setState((prev) => ({
				...prev,
				disabled: false
			}));
		}
	}), []);
	const buttonClasses = (0, import_react.useMemo)(() => getButtonClasses(props, state), [props, state]);
	const showLoader = state.loading;
	const buttonProps = {
		className: buttonClasses,
		disabled: state.disabled,
		type: href ? void 0 : type,
		onClick,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		id,
		name,
		value,
		tabIndex,
		style
	};
	const renderButton = () => (0, import_jsx_runtime.jsx)("button", {
		...buttonProps,
		children: (0, import_jsx_runtime.jsx)(ButtonContent, {
			children,
			state,
			loaderPosition,
			showLoader,
			textRef
		})
	});
	if (href) return (0, import_jsx_runtime.jsx)("div", {
		className: "s-button-wrap",
		children: (0, import_jsx_runtime.jsx)("a", {
			href,
			className: buttonClasses,
			children: (0, import_jsx_runtime.jsx)(ButtonContent, {
				children,
				state,
				loaderPosition,
				showLoader,
				textRef
			})
		})
	});
	return (0, import_jsx_runtime.jsx)("div", {
		className: "s-button-wrap",
		children: renderButton()
	});
});
SallaButton.displayName = "SallaButton";
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-NVL6M25Q.js
var LazyBreadcrumb = (0, import_react.lazy)(() => import("./Breadcrumb-VFMPAWSR-CMWXQGHa.js").then((m) => ({ default: m.Breadcrumb })));
var LazyNoContent = (0, import_react.lazy)(() => import("./NoContent-63TMCPGY-CLusqor6.js").then((m) => ({ default: m.NoContent })));
var LazyRenderWhenVisible = (0, import_react.lazy)(() => import("./RenderWhenVisible-BQ7KVPHK-CjKV1nPw.js").then((m) => ({ default: m.RenderWhenVisible })));
var LazyCurrencySymbol = (0, import_react.lazy)(() => import("./CurrencySymbol-TARAYUOT-CsvKDIUw.js").then((m) => ({ default: m.CurrencySymbol })));
var LazyErrorPage = (0, import_react.lazy)(() => import("./ErrorPage-XGBROULF-B8A9orSy.js").then((m) => ({ default: m.ErrorPage })));
var Image = (0, import_react.memo)(function Image2({ src, alt, priority = false, aspectRatio, objectFit = "cover", mobileSrc, mobileBreakpoint = 768, noWrapper = false, className = "", style, width, height, sizes, srcSet: srcSetProp, srcSetWidths, ...rest }) {
	if (!src) return null;
	const generatedSrcSet = srcSetProp || (srcSetWidths?.length ? getCdnImageSrcSet(src, srcSetWidths) : void 0);
	const generatedMobileSrcSet = srcSetWidths?.length && mobileSrc ? getCdnImageSrcSet(mobileSrc, srcSetWidths) : void 0;
	const cdnWidth = srcSetWidths?.length ? width != null && srcSetWidths.includes(Number(width)) ? Number(width) : srcSetWidths[0] : width;
	const cdnOptions = generatedSrcSet ? { width: cdnWidth } : {
		width: cdnWidth,
		height
	};
	const optimizedSrc = getCdnImageUrl(src, cdnOptions);
	const optimizedMobileSrc = getCdnImageUrl(mobileSrc, cdnOptions);
	const imgClasses = [className, `object-${objectFit}`].filter(Boolean).join(" ");
	const loadingProps = priority ? {
		loading: "eager",
		fetchPriority: "high",
		decoding: "sync"
	} : {
		loading: "lazy",
		decoding: "async"
	};
	const hasWrapper = !noWrapper && !!aspectRatio;
	const img = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: optimizedSrc,
		alt,
		className: imgClasses,
		width,
		height,
		sizes,
		srcSet: generatedSrcSet,
		style: hasWrapper ? void 0 : style,
		...loadingProps,
		...rest
	});
	const imgElement = optimizedMobileSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("picture", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
		media: `(max-width: ${mobileBreakpoint}px)`,
		srcSet: generatedMobileSrcSet || optimizedMobileSrc,
		sizes: generatedMobileSrcSet ? sizes : void 0
	}), img] }) : img;
	if (!hasWrapper) return imgElement;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative overflow-hidden",
		style: {
			aspectRatio,
			...style
		},
		children: imgElement
	});
});
var DEFERRED_KEY = /* @__PURE__ */ Symbol.for("twilight.deferred");
(0, import_react.memo)(function DeferredRenderer2({ promise, children }) {
	const state = promise[DEFERRED_KEY];
	if (state?.status === "success") return children(state.value);
	if (state?.status === "error") throw state.error;
	return children((0, import_react.use)(promise));
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-IPICQKIF.js
var LazyMainMenu = (0, import_react.lazy)(() => import("./MainMenu-RX7PU77H-Di7KIueZ.js").then((m) => ({ default: m.MainMenu })));
var LazyMobileMenu = (0, import_react.lazy)(() => import("./MobileMenu-EQFL7JGB-CVXqRwYl.js").then((m) => ({ default: m.MobileMenu })));
function HeaderContacts() {
	const { store } = useTwilight();
	if (!useIsClient()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaContacts, {
		contacts: store?.contacts,
		contactsTitle: "N/A",
		isHeader: true
	});
}
function Header(_props) {
	const { currency, theme, store } = useTwilight();
	const { locale, languageName } = useTranslation();
	const settings = theme?.settings || {};
	const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, import_react.useState)(false);
	const StoreTitle = useIsHome() ? "h1" : "span";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "store-header",
		suppressHydrationWarning: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "header:start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "advertisement-slot",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageAdvertisements, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `top-navbar${settings.topnav_is_dark ? " top-navbar--dark" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 flex items-center gap-2",
						children: [
							settings.important_links && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaMenu, {
								source: "footer",
								topnav: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "header-buttons",
								children: (store?.settings?.is_multilingual || store?.settings?.currencies_enabled) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => window.salla?.event.dispatch("localization::open"),
									className: "btn--rounded-gray basis-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: languageName }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mx-1.5",
											children: "|"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `flag iti__flag  iti__${store?.country.toLowerCase()}` }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: store?.settings?.use_sar_symbol && currency?.code === "SAR" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-sar" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: currency?.symbol }) })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaLocalizationModal, {
									language: locale,
									currency: currency?.code || "SAR",
									suppressHydrationWarning: true
								})] })
							}),
							store?.scope && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn--rounded-gray",
								onClick: () => window.salla?.event.dispatch("scopes::open", { mode: "default" }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-location rtl:ml-1 ltr:mr-1" }), store.scope.name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "header-search flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSearch, {
									inline: true,
									oval: true,
									height: 36
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderContacts, {})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "mainnav",
				className: `main-nav-container shadow-default bg-white flex items-center relative z-50${settings.header_is_sticky ? " sticky top-0" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inner bg-inherit w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "container",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-stretch justify-between relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "lg:hidden mburger mburger--collapse leading-none rtl:ml-4 ltr:mr-4",
										href: "#mobile-menu",
										"aria-label": "Open-menu",
										onClick: (e) => {
											e.preventDefault();
											setIsMobileMenuOpen(true);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-menu text-primary text-2xl" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										className: "navbar-brand",
										href: store?.url || "/",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "logo-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
												src: store?.logo,
												alt: `${store?.name || "Store"} logo`,
												priority: true,
												width: 120,
												height: 48
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreTitle, {
											className: "sr-only",
											children: store?.name || "Store"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMainMenu, {})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end my-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaUserMenu, {
									avatarOnly: true,
									showHeader: true,
									className: "header-btn"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaCartSummary, {
									className: "ml-4 rtl:ml-[unset] rtl:mr-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
										slot: "icon",
										className: "header-btn__icon icon sicon-shopping-bag"
									})
								})]
							})]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMobileMenu, {
				isOpen: isMobileMenuOpen,
				onClose: () => setIsMobileMenuOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "header:end" })
		]
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-OQIIJRAS.js
function MadeWithSalla({ className }) {
	const { store } = useTwilight();
	const { t } = useTranslation();
	if (store.settings?.display_copyright === false) return null;
	const href = `https://salla.com/?utm_source=store&utm_medium=footer&utm_campaign=${encodeURIComponent(store.username ?? "")}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className,
		"data-testid": "store-footer-salla-badge",
		children: [
			t("blocks.footer.made_with_love", "Powered by"),
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				target: "_blank",
				rel: "noreferrer",
				className: "transition-opacity hover:opacity-75",
				children: t("store_app.trans.Salla", "Salla")
			})
		]
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-BYMOPN2S.js
var LinkContext = (0, import_react.createContext)(null);
var LinkProviderError = class extends Error {
	constructor() {
		super("Link component must be used within LinkProvider. Ensure TwilightProvider is configured with client.framework option.");
		this.name = "LinkProviderError";
	}
};
function useLinkAdapter() {
	const context = (0, import_react.useContext)(LinkContext);
	if (!context) throw new LinkProviderError();
	return context.adapter;
}
function LinkProvider({ adapter, children }) {
	return (0, import_react.createElement)(LinkContext.Provider, { value: { adapter } }, children);
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-AXW67SY7.js
var Link = (0, import_react.forwardRef)(({ to, href, children, ...props }, ref) => {
	const Adapter = useLinkAdapter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Adapter, {
		ref,
		to: to ?? href ?? "/",
		...props,
		"data-spa-link": "",
		children
	});
});
Link.displayName = "Link";
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-7V5HOZW4.js
var LazyImageModal = (0, import_react.lazy)(() => import("./ImageModal-4FNL5UC5-DoA_eYDC.js").then((m) => ({ default: m.ImageModal })));
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-HTV4KO7G.js
var TAX_ICON_URL = "https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=70,height=70,onerror=redirect,format=auto/images/tax.png?v=2.0.5";
function FooterTax({ dark }) {
	const { store } = useTwilight();
	const { t } = useTranslation();
	const [open, setOpen] = (0, import_react.useState)(false);
	const number = store.settings?.tax?.number;
	const certificate = store.settings?.tax?.certificate;
	if (!number) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "store-footer-tax",
		className: "store-footer__tax flex items-end gap-2 rtl:space-x-reverse",
		children: [certificate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"data-testid": "store-footer-tax-certificate",
			className: "store-footer__tax-cert shrink-0",
			"aria-label": t("common.elements.tax_certificate", "Tax Certificate"),
			"aria-haspopup": "dialog",
			onClick: () => setOpen(true),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: TAX_ICON_URL,
				alt: t("common.elements.tax_certificate", "Tax Certificate"),
				width: 40,
				height: 50,
				loading: "lazy",
				decoding: "async",
				className: "w-10 rounded-sm transition-opacity hover:opacity-80"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImageModal, {
			isOpen: open,
			onClose: () => setOpen(false),
			src: certificate,
			alt: t("common.elements.tax_certificate", "Tax Certificate"),
			title: t("common.elements.tax_certificate", "Tax Certificate")
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mb-1 text-sm opacity-70 ${dark ? "text-white" : ""}`,
			children: t("common.elements.tax_number", "Tax Number")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
			className: "text-sm",
			children: number
		})] })]
	});
}
var SBC_ICON_URL = "https://cdn.salla.network/images/sbc.png?v=2.0.5";
function FooterSbc({ dark }) {
	const { store } = useTwilight();
	const { t } = useTranslation();
	const id = store.settings?.certificate?.id;
	if (!id) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: `https://eauthenticate.saudibusiness.gov.sa/certificate-details/${encodeURIComponent(id)}`,
		target: "_blank",
		rel: "noopener noreferrer",
		"data-testid": "store-footer-sbc",
		className: "store-footer__sbc flex items-center gap-2.5 transition-opacity hover:opacity-75",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: SBC_ICON_URL,
			alt: `SBC ${id}`,
			width: 56,
			height: 40,
			loading: "lazy",
			decoding: "async",
			className: "h-10 w-14 rounded-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-xs opacity-70 ${dark ? "text-white" : ""}`,
			children: t("blocks.footer.sbc_trusted_by", "Trusted by")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
			className: "text-sm",
			children: t("blocks.footer.sbc_platform", "Business Platform")
		})] })]
	});
}
function FooterTrust({ dark, centered }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "store-footer-trust",
		className: `store-footer__trust flex flex-wrap items-end gap-x-6 gap-y-3${centered ? " justify-center" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterTax, { dark }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterSbc, { dark }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaTrustBadges, { ...dark ? { dark: true } : {} })
		]
	});
}
function FooterLinksMenu({ inSheet, className, heading, dark }) {
	if (inSheet) return null;
	const menu = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaMenu, {
		source: "footer",
		className,
		suppressHydrationWarning: true
	});
	if (!heading) return menu;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "store-footer__links",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: `mb-3 text-lg font-bold lg:mb-5 ${dark ? "text-white" : "text-gray-900"}`,
			children: heading
		}), menu]
	});
}
function FooterApps({ className }) {
	const { store } = useTwilight();
	const { t } = useTranslation();
	const isClient = useIsClient();
	if (!store.apps?.appstore && !store.apps?.googleplay) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-testid": "store-footer-apps",
		className: `store-footer__apps ${className}`,
		children: isClient && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaAppsIcons, {
			apps: store.apps,
			appsTitle: t("blocks.footer.download_apps", "Get our apps")
		})
	});
}
function FooterLogo({ className }) {
	const { store } = useTwilight();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: `store-footer__logo inline-flex items-center m-0 transition-opacity hover:opacity-75 ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
			src: store.logo,
			alt: store.name || "Store",
			width: 150,
			height: 44,
			objectFit: "contain",
			className: "h-11 w-auto max-w-[180px]"
		})
	});
}
function FooterDescription({ className }) {
	const { store } = useTwilight();
	if (!store.description) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `store-footer__desc opacity-80 ${className}`,
		dangerouslySetInnerHTML: { __html: store.description }
	});
}
function FooterContacts({ className }) {
	const { store } = useTwilight();
	const { t } = useTranslation();
	const isClient = useIsClient();
	if (!store.contacts?.phone && !store.contacts?.email) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `store-footer__contacts ${className}`,
		children: isClient && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaContacts, {
			contacts: store.contacts,
			contactsTitle: t("blocks.footer.social", "Contact us"),
			isHeader: true
		})
	});
}
function FooterCenteredBody({ inSheet, isDark }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container mx-auto flex max-w-2xl flex-col items-center gap-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterLogo, { className: "" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterDescription, { className: "" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterContacts, { className: "" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSocial, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterLinksMenu, {
				inSheet,
				className: "store-footer__menu store-footer__menu--inline",
				dark: isDark
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterTrust, {
				dark: isDark,
				centered: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterApps, { className: "flex flex-col items-center gap-3" })
		]
	});
}
function FooterColumnsBody({ inSheet, isDark }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "store-footer__brand rtl:lg:pl-16 ltr:lg:pr-16 sm:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterLogo, { className: "mb-5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterDescription, { className: "max-w-sm leading-6 my-5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterContacts, { className: "mb-6" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSocial, { className: "block mb-6" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterTrust, {
						dark: isDark,
						centered: false
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterLinksMenu, {
				inSheet,
				className: "store-footer__menu store-footer__menu--stacked",
				heading: t("blocks.footer.important_links", "Important links"),
				dark: isDark
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterApps, { className: "" })
		]
	});
}
function Footer({ inSheet = false } = {}) {
	const { store, theme } = useTwilight();
	const { t } = useTranslation();
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const isCentered = theme.settings?.footer_layout === "centered";
	const isDark = !!theme.settings?.footer_is_dark;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(inSheet ? "div" : "footer", {
		className: `store-footer store-footer--${isCentered ? "centered" : "columns"}${inSheet ? " store-footer--sheet" : ""} relative mt-8 sm:mt-16 ${isDark ? "bg-[#0E0F0F] text-white" : "bg-[#F4F7F2] text-gray-600"}`,
		suppressHydrationWarning: true,
		children: [
			!inSheet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "footer:start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-label": "footer",
				className: `store-footer__inner border-b py-8 lg:py-16 ${isDark ? "bg-[#1D1F1F] border-dashed border-white/10" : "bg-transparent border-gray-200"}`,
				children: isCentered ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterCenteredBody, {
					inSheet,
					isDark
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterColumnsBody, {
					inSheet,
					isDark
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "store-footer__bottom container md:flex items-center justify-between gap-4 py-4 lg:py-7 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `text-sm copyright-text ${isDark ? "text-gray-400" : "text-gray-700"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, {
						name: "copyright",
						context: { storeName: store.name },
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							t("blocks.footer.copyright", "All rights reserved"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "transition-opacity hover:opacity-75 hover:text-primary",
								children: store.name
							}),
							" ",
							"© ",
							year,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MadeWithSalla, { className: "ms-2" })
						] })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaPayments, {})]
			}),
			!inSheet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "footer:end" })
		]
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-JYV25VNZ.js
function readSettings(source) {
	const settings = source?.settings;
	return settings ? settings : void 0;
}
function readString(source, key) {
	const value = source?.[key];
	return typeof value === "string" && value ? value : void 0;
}
function readSnippets(source) {
	const snippets = source?.appsSnippets;
	return Array.isArray(snippets) ? snippets : void 0;
}
function readAppSettings(source) {
	const settings = source?.appsSettings;
	return settings && typeof settings === "object" && "apps" in settings ? settings : void 0;
}
function ensureTwilightContextFromMatches(matches) {
	if (hasTwilightSettings()) return true;
	const rootMatch = matches?.[0];
	if (!rootMatch) return false;
	const beforeLoadCtx = rootMatch.__beforeLoadContext;
	const matchCtx = rootMatch.context;
	const settings = readSettings(beforeLoadCtx) ?? readSettings(matchCtx);
	const locale = readString(beforeLoadCtx, "locale") ?? readString(matchCtx, "locale");
	if (!settings || !locale) return false;
	updateTwilightContext({
		settings,
		locale,
		authToken: readString(beforeLoadCtx, "authToken") ?? readString(matchCtx, "authToken") ?? null,
		appsSnippets: readSnippets(beforeLoadCtx) ?? readSnippets(matchCtx),
		appsSettings: readAppSettings(beforeLoadCtx) ?? readAppSettings(matchCtx),
		maintenance: (beforeLoadCtx?.maintenance ?? matchCtx?.maintenance) === true
	});
	return true;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-5FJFN3IW.js
var isBrowser = typeof window !== "undefined";
var createAppScopeFactory = (w, appCtx) => {
	const isAppKey = (key) => typeof key === "string" && key.indexOf("app.") === 0;
	const bucketKey = (key) => key.slice(4);
	const realSalla = () => w.salla || w.Salla || {};
	const realConfig = () => realSalla().config || {};
	const passthrough = (obj, prop) => {
		const member = obj[prop];
		return typeof member === "function" ? member.bind(obj) : member;
	};
	const createAppScope = (scopeId) => {
		const bucket = () => appCtx[scopeId] = appCtx[scopeId] || {};
		const getConfig = (key, fallback) => {
			if (isAppKey(key)) {
				const sub = bucketKey(key);
				const b = bucket();
				return sub in b ? b[sub] : fallback;
			}
			const cfg = realConfig();
			return typeof cfg.get === "function" ? cfg.get(key, fallback) : fallback;
		};
		const setConfig = (key, value) => {
			if (isAppKey(key)) {
				bucket()[bucketKey(key)] = value;
				return value;
			}
			const cfg = realConfig();
			return typeof cfg.set === "function" ? cfg.set(key, value) : value;
		};
		const hasConfig = (key) => isAppKey(key) ? bucketKey(key) in bucket() : key in realConfig();
		const configProxy = new Proxy({}, {
			get(_t, prop) {
				if (prop === "get") return getConfig;
				if (prop === "set") return setConfig;
				if (prop === "has") return hasConfig;
				if (isAppKey(prop)) return getConfig(prop);
				return passthrough(realConfig(), prop);
			},
			set(_t, prop, value) {
				setConfig(prop, value);
				return true;
			},
			has(_t, prop) {
				return hasConfig(prop);
			}
		});
		return new Proxy({}, {
			get(_t, prop) {
				return prop === "config" ? configProxy : passthrough(realSalla(), prop);
			},
			set(_t, prop, value) {
				if (prop === "config") return true;
				realSalla()[prop] = value;
				return true;
			}
		});
	};
	return createAppScope;
};
function appScopeBootstrap(contexts, makeFactory) {
	if (typeof window === "undefined") return;
	const w = window;
	const Salla = w.Salla = w.Salla || {};
	if (Salla.appScope) {
		if (Salla.__appScopeSeed) Salla.__appScopeSeed(contexts);
		return;
	}
	const appCtx = {};
	const base = {};
	const seeded = {};
	const seed = (next) => {
		const bags = next && next.apps || {};
		Object.keys(bags).forEach((scopeId) => {
			if (seeded[scopeId]) return;
			seeded[scopeId] = true;
			appCtx[scopeId] = Object.assign({}, appCtx[scopeId] || {}, bags[scopeId] || {});
			base[scopeId] = Object.assign({}, appCtx[scopeId]);
		});
	};
	seed(contexts);
	const createAppScope = makeFactory(w, appCtx);
	Salla.appScope = (scopeId) => createAppScope(scopeId);
	Salla.__appScopeSeed = (next) => seed(next);
	Salla.__appScopeMock = (scopeId, mocks) => {
		if (!(scopeId in base)) return false;
		appCtx[scopeId] = Object.assign({}, base[scopeId], mocks);
		return true;
	};
}
function renderAppScopeInstallScript(contexts) {
	const json = escapeForInlineScript(JSON.stringify(contexts));
	return `(${appScopeBootstrap.toString()})(${json},${createAppScopeFactory.toString()});`;
}
function installAppScope(contexts) {
	if (!isBrowser) return;
	appScopeBootstrap(contexts, createAppScopeFactory);
}
var registered = /* @__PURE__ */ new Set();
var retryArmed = false;
function pushSlots() {
	const slots = window.salla?.hooks?._themeSlots;
	if (!Array.isArray(slots)) return false;
	for (const name of registered) if (!slots.includes(name)) slots.push(name);
	return true;
}
function applyThemeHookSlots() {
	if (typeof window === "undefined" || registered.size === 0) return;
	if (pushSlots() || retryArmed) return;
	retryArmed = true;
	window.addEventListener("twilight::initiated", () => void pushSlots(), { once: true });
}
function getRegisteredThemeHookSlots() {
	return [...registered];
}
function renderThemeHookSlotsScript(names = getRegisteredThemeHookSlots()) {
	if (!names.length) return null;
	return `(function(names){var w=window;function push(){var h=w.salla&&w.salla.hooks;var slots=h&&h._themeSlots;if(!Array.isArray(slots))return false;for(var i=0;i<names.length;i++)if(slots.indexOf(names[i])<0)slots.push(names[i]);return true}if(push())return;w.addEventListener('twilight::initiated',function(){push()},{once:true})})(${escapeForInlineScript(JSON.stringify(names))});`;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-GD26FI4J.js
function mergeHead(base, extension) {
	const merged = {
		...base,
		...extension,
		meta: [...base.meta ?? [], ...extension.meta ?? []],
		links: [...base.links ?? [], ...extension.links ?? []],
		styles: [...base.styles ?? [], ...extension.styles ?? []],
		scripts: [...base.scripts ?? [], ...extension.scripts ?? []],
		importMap: [...base.importMap ?? [], ...extension.importMap ?? []],
		alternateLanguages: extension.alternateLanguages ?? base.alternateLanguages,
		jsonLd: extension.jsonLd ?? base.jsonLd
	};
	if (base.openGraph || extension.openGraph) merged.openGraph = {
		...base.openGraph,
		...extension.openGraph
	};
	if (base.twitter || extension.twitter) merged.twitter = {
		...base.twitter,
		...extension.twitter
	};
	return merged;
}
var activeAdapter = (d) => d;
function setHeadAdapter(adapter) {
	activeAdapter = adapter;
}
function resolveHead(descriptor) {
	return activeAdapter(descriptor);
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-OM2GRPDH.js
var LOCALE_OG_MAP = {
	ar: "ar_AR",
	en: "en_US"
};
function localeToOgLocale(locale) {
	if (!locale) return LOCALE_OG_MAP["ar"] ?? "ar_AR";
	const base = locale.split(/[-_]/)[0].toLowerCase();
	return LOCALE_OG_MAP[base] ?? `${base}_${base.toUpperCase()}`;
}
function pageSegmentsOfUrl(pathname, storePath) {
	const parts = pathname.split("/").filter(Boolean);
	const store = storePath.split("/").filter(Boolean);
	const storeAt = (index) => store.length > 0 && store.every((segment, i) => parts[index + i] === segment);
	const localeAt = (index) => parts[index]?.length === 2;
	if (storeAt(0)) return parts.slice(store.length + (localeAt(store.length) ? 1 : 0));
	if (localeAt(0) && storeAt(1)) return parts.slice(1 + store.length);
	return parts.slice(localeAt(0) ? 1 : 0);
}
function extractPath(urlOrPath, storePath = "") {
	if (!urlOrPath) return "/";
	try {
		return "/" + pageSegmentsOfUrl(new URL(urlOrPath).pathname, storePath).join("/");
	} catch {
		const pathParts = urlOrPath.split("/").filter(Boolean);
		if (pathParts.length > 0 && pathParts[0].length === 2) pathParts.shift();
		return "/" + pathParts.join("/");
	}
}
function extractBaseUrl(storeUrl) {
	try {
		const parsed = new URL(storeUrl);
		const segments = parsed.pathname.split("/").filter(Boolean);
		if (isLocale(segments[segments.length - 1])) segments.pop();
		return parsed.origin + segments.map((segment) => `/${segment}`).join("");
	} catch {
		return storeUrl.replace(/\/[a-z]{2}\/?$/i, "").replace(/\/$/, "");
	}
}
function storeRootUrl(storeUrl) {
	const base = resolveStoreBase();
	if (base && resolveStoreBaseFollowsLocale()) try {
		return `${new URL(storeUrl).origin}/${base}`;
	} catch {}
	return extractBaseUrl(storeUrl);
}
function languageInQuery() {
	return Boolean(resolveStoreBase() && resolveStoreBaseFollowsLocale());
}
function sharedHostPage(routerPath, fallbackLocale) {
	const { first, rest } = splitLeadingSegment(routerPath);
	const leading = isLocale(first);
	const remainder = leading ? rest : routerPath;
	const locale = leading ? first : fallbackLocale;
	return {
		path: remainder === "/" ? "" : remainder,
		search: locale ? `?lang=${encodeURIComponent(locale)}` : ""
	};
}
function storePageUrl(settings, path) {
	const storeUrl = settings?.store?.url;
	if (!storeUrl) return void 0;
	const base = storeRootUrl(storeUrl);
	const page = languageInQuery() ? sharedHostPage(path) : {
		path: path === "/" ? "" : path,
		search: ""
	};
	if (!page.path && !page.search) return base;
	try {
		return new URL(`${base}${page.path}${page.search}`).href;
	} catch {
		return `${base}${page.path}${page.search}`;
	}
}
function buildHreflangAlternates(settings, path) {
	const languages = settings?.languages;
	if (!languages?.length) return;
	const baseUrl = settings?.store?.url ? storeRootUrl(settings.store.url) : "";
	const extractedPath = extractPath(path, baseUrl.replace(/^https?:\/\/[^/]+/, ""));
	const defaultLang = languages.find((l) => l.code === "ar") ?? languages[0];
	const inQuery = languageInQuery();
	const buildUrl = (langCode) => {
		const pagePath = extractedPath === "/" ? "" : extractedPath;
		return inQuery ? `${baseUrl}${pagePath}?lang=${encodeURIComponent(langCode)}` : `${baseUrl}/${langCode}${pagePath}`;
	};
	return [{
		hreflang: "x-default",
		href: buildUrl(defaultLang.code)
	}, ...languages.map((lang) => ({
		hreflang: lang.code,
		href: buildUrl(lang.code)
	}))];
}
function buildBaseHead(settings, locale = "ar", path) {
	const store = settings?.store;
	if (!store) return {};
	const title = store.meta?.title || store.name;
	const description = store.meta?.description || store.description || void 0;
	const keywords = store.meta?.keywords || void 0;
	const baseUrl = store.url ? storeRootUrl(store.url) : void 0;
	const page = path && languageInQuery() ? sharedHostPage(path, locale) : null;
	const canonicalUrl = path && baseUrl ? page ? `${baseUrl}${page.path}${page.search}` : `${baseUrl}${path}` : void 0;
	const ogUrl = path && baseUrl ? page ? canonicalUrl : `${baseUrl}/${locale}${path === "/" ? "" : path}` : void 0;
	const twitterHandle = store.social?.twitter?.split("?")[0].replace(/\/+$/, "").split("/").pop()?.replace(/^@/, "");
	const twitterSite = twitterHandle ? `@${twitterHandle}` : void 0;
	return {
		title,
		...description ? { description } : {},
		...keywords ? { keywords } : {},
		...canonicalUrl ? { canonical: canonicalUrl } : {},
		openGraph: {
			type: "website",
			siteName: store.name,
			title,
			...description ? { description } : {},
			...ogUrl ? { url: ogUrl } : {},
			locale: localeToOgLocale(locale),
			...store.logo ? { images: store.logo } : {}
		},
		twitter: {
			card: "summary_large_image",
			title,
			...description ? { description } : {},
			...twitterSite ? { site: twitterSite } : {},
			...store.logo ? { images: store.logo } : {}
		},
		...path ? { alternateLanguages: buildHreflangAlternates(settings, path) } : {}
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-PCEKL6S3.js
var SALLA_ICONS_CSS_URL = "https://cdn.assets.salla.network/static/fonts/sallaicons.css?v=2.0.5";
var LIT_CDN_BASE = `https://cdn.assets.salla.network/static/lit/3.3.3`;
var LIT_IMPORTS = {
	lit: `${LIT_CDN_BASE}/lit.js`,
	"lit/": `${LIT_CDN_BASE}/`,
	"lit-html": `${LIT_CDN_BASE}/lit-html/lit-html.js`,
	"lit-html/": `${LIT_CDN_BASE}/lit-html/`,
	"lit-element": `${LIT_CDN_BASE}/lit-element/lit-element.js`,
	"lit-element/": `${LIT_CDN_BASE}/lit-element/`,
	"@lit/reactive-element": `${LIT_CDN_BASE}/reactive-element/reactive-element.js`,
	"@lit/reactive-element/": `${LIT_CDN_BASE}/reactive-element/`
};
var TWILIGHT_RELEASE_CDN = "https://cdn.salla.network/js/twilight";
var TWILIGHT_DEV_CDN = "https://cdn.assets.salla.network/dev/@salla.sa/twilight";
var MIN_TWILIGHT_VERSION = "2.14.538";
var DEFAULT_TWILIGHT_VERSION = "2.14.584";
var releaseUrl = (version) => `${TWILIGHT_RELEASE_CDN}/${version}/twilight.esm.js`;
var warnedPins = /* @__PURE__ */ new Set();
function belowMinimum(version) {
	return /^\d+\.\d+\.\d+$/.test(version) && version.localeCompare(MIN_TWILIGHT_VERSION, void 0, { numeric: true }) < 0;
}
function releaseVersionInUrl(url) {
	const match = url.match(/\/(\d+\.\d+\.\d+)\/twilight\.esm\.js(?:[?#]|$)/);
	return match ? match[1] : null;
}
function resolveTwilightSdkUrl(settings) {
	const urlOverride = readEnv("VITE_TWILIGHT_URL");
	if (urlOverride) {
		if (releaseVersionInUrl(urlOverride));
		return urlOverride;
	}
	const versionOverride = readEnv("VITE_TWILIGHT_VERSION");
	if (versionOverride) return `${TWILIGHT_DEV_CDN}/${versionOverride}/twilight.esm.js`;
	const pinnedVersion = settings?.theme?.twilight?.version;
	if (pinnedVersion && belowMinimum(pinnedVersion)) {
		if (!warnedPins.has(pinnedVersion)) {
			warnedPins.add(pinnedVersion);
			console.warn(`[twilight] theme.twilight.version ${pinnedVersion} is below the engine minimum ${MIN_TWILIGHT_VERSION}; loading ${DEFAULT_TWILIGHT_VERSION} instead`);
		}
		return releaseUrl(DEFAULT_TWILIGHT_VERSION);
	}
	if (pinnedVersion) return releaseUrl(pinnedVersion);
	return releaseUrl(DEFAULT_TWILIGHT_VERSION);
}
var MEDIA_SWAP_SCRIPT = `
(function(){var d=document,s=function(l){if(l.sheet||"all"===l.media)l.media="all";else l.onload=function(){this.media="all"}},f=d.getElementById("salla-theme-font"),i=d.getElementById("salla-icons-css");f&&s(f);if(!i)return;if(!d.querySelector('link[rel="preload"][as="image"]'))return s(i);var g=function(){g=function(){};s(i)},p=function(){requestAnimationFrame(function(){setTimeout(function(){g()})});setTimeout(function(){g()},100)};d.addEventListener("DOMContentLoaded",function(){var m=[].filter.call(d.querySelectorAll('img[fetchpriority="high"]'),function(x){return!x.complete}),n=m.length;if(!n)return p();m.forEach(function(x){var o=function(){--n||p()};x.addEventListener("load",o,{once:!0});x.addEventListener("error",o,{once:!0})});setTimeout(function(){g()},2500)})})();
`.trim();
var LOADING_CSS = `
.loading-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#fff;z-index:9999}
.loading-spinner{animation:spin 1s linear infinite;border-radius:9999px;height:3rem;width:3rem;border-bottom:2px solid var(--color-primary,#000)}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
html,body{margin:0;padding:0;height:100%}
`.trim();
var SALLA_INIT_SCRIPT = `
window.salla = window.Salla = window.Salla || window.salla || {};
window.Salla.onReady = window.Salla.onReady || function(callback) {
  return new Promise(function(resolve) {
    if (window.Salla.status === 'ready') {
      var config = window.salla && window.salla.config && window.salla.config.all();
      resolve(callback ? callback(config) : config);
    } else {
      window.addEventListener('twilight::initiated', function(event) {
        resolve(callback ? callback(event.detail) : event.detail);
      }, { once: true });
    }
  });
};
`.trim();
function snippetPreconnectOrigins(snippets) {
	if (!snippets?.length) return [];
	const origins = /* @__PURE__ */ new Set();
	for (const app of snippets) {
		if (app.status !== "enabled") continue;
		for (const s of app.snippets) {
			if (!s.url) continue;
			try {
				origins.add(new URL(s.url).origin);
			} catch {}
			if (origins.size >= 4) return [...origins];
		}
	}
	return [...origins];
}
function rootHead(ctx) {
	ensureTwilightContextFromMatches(ctx.matches);
	let settings;
	try {
		settings = getTwilightContext().settings;
	} catch (e) {
		if (e instanceof SettingsError) return resolveHead({ title: "Store Unavailable" });
		throw e;
	}
	const locale = ctx.params.locale || "ar";
	const parts = deriveHeadParts(settings);
	return resolveHead(mergeHead(buildBaseHead(settings, locale), {
		meta: buildRootMeta(parts),
		links: buildRootLinks(parts),
		styles: buildRootStyles(parts),
		importMap: [{ imports: LIT_IMPORTS }],
		scripts: buildRootScripts(parts)
	}));
}
function deriveFontParts(theme) {
	const font = theme?.font;
	const fontUrl = font?.url || font?.path;
	const isGoogleFont = fontUrl?.includes("fonts.googleapis.com");
	const needsDisplay = Boolean(isGoogleFont && fontUrl && !fontUrl.includes("display="));
	const separator = fontUrl?.includes("?") ? "&" : "?";
	return {
		fontUrl,
		isGoogleFont,
		fontFamilyName: font?.family_name,
		fontUrlWithDisplay: needsDisplay ? `${fontUrl}${separator}display=swap` : fontUrl
	};
}
function deriveCustomizationParts(theme) {
	const customization = theme?.customization;
	const customJs = customization?.js?.trim();
	const customCss = customization?.css?.trim();
	const isUrl = (value) => Boolean(value?.startsWith("http") || value?.startsWith("//"));
	return {
		customJs,
		customCss,
		isCustomCssUrl: isUrl(customCss),
		isCustomJsUrl: isUrl(customJs)
	};
}
function deriveHeadParts(settings) {
	const store = settings?.store;
	return {
		store,
		favicon: store?.icon,
		primaryColor: settings?.theme?.color?.primary,
		...deriveFontParts(settings?.theme),
		...deriveCustomizationParts(settings?.theme),
		twilightSdkUrl: resolveTwilightSdkUrl(settings),
		maintenance: getTwilightContext().maintenance,
		snippetPreconnects: snippetPreconnectOrigins(getTwilightContext().appsSnippets).map((href) => ({
			rel: "preconnect",
			href
		})),
		appScopeInstallScript: renderAppScopeInstallScript(getTwilightContext().appsSettings ?? { apps: {} }),
		themeHookSlotsScript: renderThemeHookSlotsScript(),
		runtimeEnvScript: renderRuntimeEnvScript()
	};
}
function buildRootMeta(p) {
	return [
		{
			name: "robots",
			content: "index, follow"
		},
		{
			name: "msapplication-TileColor",
			content: "#ffffff"
		},
		...p.favicon ? [{
			name: "msapplication-TileImage",
			content: p.favicon
		}] : [],
		...p.primaryColor ? [
			{
				name: "theme-color",
				content: p.primaryColor
			},
			{
				name: "msapplication-navbutton-color",
				content: p.primaryColor
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: p.primaryColor
			}
		] : []
	];
}
function buildRootLinks(p) {
	return [
		{
			rel: "preconnect",
			href: "https://api.salla.dev"
		},
		{
			rel: "preconnect",
			href: "https://cdn.salla.sa"
		},
		{
			rel: "preconnect",
			href: "https://cdn.assets.salla.network",
			crossOrigin: "anonymous"
		},
		...p.maintenance ? [] : p.snippetPreconnects,
		...p.isGoogleFont ? [{
			rel: "preconnect",
			href: "https://fonts.gstatic.com",
			crossOrigin: "anonymous"
		}] : [],
		...p.maintenance ? [] : [{
			rel: "modulepreload",
			href: p.twilightSdkUrl
		}],
		...p.fontUrlWithDisplay ? [{
			id: "salla-theme-font",
			rel: "stylesheet",
			href: p.fontUrlWithDisplay,
			media: "print"
		}] : [],
		...p.fontUrlWithDisplay && !p.isGoogleFont && p.fontFamilyName ? [{
			id: "salla-font-display-override",
			rel: "preload",
			as: "style",
			href: p.fontUrlWithDisplay
		}] : [],
		...p.favicon ? [{
			rel: "icon",
			href: p.favicon
		}] : [],
		...p.favicon ? [{
			id: "salla-apple-icon",
			rel: "apple-touch-icon-precomposed",
			href: p.favicon
		}] : [],
		...p.isCustomCssUrl && p.customCss ? [{
			id: "salla-custom-css",
			rel: "stylesheet",
			href: p.customCss
		}] : [],
		{
			id: "salla-icons-css",
			rel: "stylesheet",
			href: SALLA_ICONS_CSS_URL,
			media: "print"
		},
		...p.isCustomJsUrl && p.customJs ? [{
			id: "salla-custom-js-preload",
			rel: "preload",
			as: "script",
			href: p.customJs
		}] : []
	];
}
var hoisted = (id, children) => ({
	id,
	href: id,
	precedence: "default",
	children
});
function buildRootStyles(p) {
	return [
		hoisted("twilight-loading", LOADING_CSS),
		...!p.isGoogleFont && p.fontFamilyName ? [hoisted("salla-font-display-swap", `@font-face{font-family:"${p.fontFamilyName}";font-display:swap;src:local("${p.fontFamilyName}")}`)] : [],
		...!p.isCustomCssUrl && p.customCss ? [hoisted("salla-custom-css", p.customCss)] : []
	];
}
function buildRootScripts(p) {
	return [
		...p.runtimeEnvScript ? [{
			id: "salla-runtime-env",
			children: p.runtimeEnvScript
		}] : [],
		{
			id: "twilight-init",
			children: SALLA_INIT_SCRIPT
		},
		{
			id: "salla-app-scope",
			children: p.appScopeInstallScript
		},
		...p.themeHookSlotsScript ? [{
			id: "salla-theme-hook-slots",
			children: p.themeHookSlotsScript
		}] : [],
		{
			id: "salla-async-css",
			children: MEDIA_SWAP_SCRIPT
		},
		...p.customJs ? [buildCustomJsScript(p.customJs, Boolean(p.isCustomJsUrl))] : []
	];
}
function buildCustomJsScript(customJs, isUrl) {
	return {
		id: "salla-custom-js",
		children: isUrl ? `window.addEventListener('twilight::initiated',function(){var s=document.createElement('script');s.src=${escapeForInlineScript(JSON.stringify(customJs))};s.async=true;document.head.appendChild(s)},{once:true});` : `try { ${customJs} } catch(e) { console.warn("[ThemeCustomization] Custom JS error:", e); }`
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-WBPOWM74.js
var useDevSettingsOverrides = () => EMPTY_PREVIEW_STATE;
var useDevHomeBlocks = (components) => components;
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-JUFJV4AK.js
var apps = {
	/**
	* Installed apps' snippets (scripts/HTML to inject). Timeout-bounded because it's awaited in
	* rootBeforeLoad (SSR/TTFB): a slow response degrades to no CDN tags, never stalls the page.
	*/
	snippets: async () => {
		const { data } = await api.get("apps/snippets", { timeout: 2500 }).json();
		return data ?? [];
	},
	/**
	* Per-app public `app.*` buckets, keyed by encoded app id. Timeout-bounded (SSR-awaited):
	* a slow response degrades to empty buckets (fail-open), never strands injection.
	*/
	settings: async () => {
		const { data } = await api.get("apps/snippets/settings", { timeout: 2500 }).json();
		return { apps: data?.apps ?? {} };
	},
	queries: {
		snippets: () => queryOptions({
			queryKey: ["apps", "snippets"],
			queryFn: () => apps.snippets(),
			staleTime: Infinity,
			retry: 0
		}),
		settings: () => queryOptions({
			queryKey: ["apps", "settings"],
			queryFn: () => apps.settings(),
			staleTime: Infinity,
			retry: 0
		})
	}
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-VVZNW5CB.js
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return {
		r: 0,
		g: 0,
		b: 0
	};
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	};
}
function rgbToHex(r, g, b) {
	return "#" + [
		r,
		g,
		b
	].map((x) => {
		const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	}).join("");
}
function color(primary) {
	const { r, g, b } = hexToRgb(primary);
	const isDark = (.299 * r + .587 * g + .114 * b) / 255 < .5;
	return {
		/** Primary color hex */
		primary,
		/** Contrast text color (black or white) */
		text: isDark ? "#FFFFFF" : "#000000",
		/** Whether primary is a dark color */
		isDark,
		/** Darken the color by amount (0-1) */
		darken: (amount) => {
			const factor = 1 - Math.max(0, Math.min(1, amount));
			return rgbToHex(r * factor, g * factor, b * factor);
		},
		/** Lighten the color by amount (0-1) */
		lighten: (amount) => {
			const factor = Math.max(0, Math.min(1, amount));
			return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
		},
		/** Invert the color */
		invert: () => rgbToHex(255 - r, 255 - g, 255 - b),
		/** Get RGB values */
		rgb: () => ({
			r,
			g,
			b
		})
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-FID76MUV.js
var VIEW_AS_OWNER_COOKIE_NAME = "salla_view_as";
var OWNER_SOURCES = ["dashboard", "portal"];
function storeIdOf(settings) {
	const id = settings?.store?.id;
	return id == null ? null : String(id);
}
function ownerLinkMatches(href, settings) {
	const storeId = storeIdOf(settings);
	if (!storeId) return false;
	let params;
	try {
		params = new URL(href, "http://localhost").searchParams;
	} catch {
		return false;
	}
	const source = params.get("utm_source");
	return source != null && OWNER_SOURCES.includes(source) && params.get("identifier") === storeId;
}
function ownerCookieMatches(cookieHeader, settings) {
	const storeId = storeIdOf(settings);
	return !!storeId && extractTokenFromCookies(cookieHeader, "salla_view_as") === storeId;
}
function showsMaintenancePage(settings, viewAsOwner) {
	return settings?.maintenance === true && !viewAsOwner && settings.theme?.mode !== "preview";
}
var MAINTENANCE_EVIDENCE_HEADER = "x-twilight-maintenance";
function maintenanceEvidence(settings) {
	const evidence = {};
	if (!settings) return evidence;
	for (const [key, read] of EVIDENCE) {
		const value = read(settings);
		if (value != null && value !== "") evidence[key] = String(value);
	}
	return evidence;
}
var EVIDENCE = [
	["store", (s) => s.store?.id],
	["scope", (s) => s.store?.scope?.id],
	["requested-scope", (s) => s.requestedScopeId],
	["mode", (s) => s.theme?.mode],
	["request-id", (s) => s.answer?.requestId],
	["trace", (s) => s.answer?.traceId],
	["cache", (s) => s.answer?.cacheStatus],
	["age", (s) => s.answer?.age]
];
function maintenanceEvidenceHeader(evidence) {
	return Object.entries(evidence).map(([key, value]) => `${key}=${value.replace(/[^\x21-\x7e]/g, "")}`).join("; ");
}
var DASHBOARD_URL = "https://s.salla.sa";
var MAINTENANCE_SETTINGS_URL = `${DASHBOARD_URL}/channel/settings?legacy=0#maintenance-mode`;
function isNotLaunchedNotice(details) {
	return details?.button_url?.replace(/\/+$/, "") === DASHBOARD_URL;
}
function withOwnerMaintenanceButton(settings, buttonTitle) {
	const details = settings.maintenance_details;
	if (settings.maintenance !== true || details?.button_title) return settings;
	return {
		...settings,
		maintenance_details: {
			...details,
			button_title: buttonTitle,
			button_full_title: buttonTitle,
			button_url: MAINTENANCE_SETTINGS_URL
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-TLOA4BJF.js
var user = {
	get: async () => {
		try {
			return await api.get("auth/user").json().then((r) => ({
				...r.data,
				type: "user"
			}));
		} catch (error) {
			console.debug("[user.get] Failed:", error);
			return null;
		}
	},
	queries: { current: () => queryOptions({
		queryKey: ["user", "current"],
		queryFn: user.get
	}) }
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-Z2K2O3DI.js
function useUser() {
	const token = getTwilightContext().authToken;
	return {
		...useQuery({
			...user.queries.current(),
			enabled: !!token,
			placeholderData: null
		}),
		isLoggedIn: !!token
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-CW625T2E.js
function normalizeClasses(input) {
	if (!input) return [];
	return (Array.isArray(input) ? input : [input]).flatMap((c) => c.split(/\s+/)).filter(Boolean);
}
function mergeElementAttrs(descriptors) {
	const result = {};
	const classSet = /* @__PURE__ */ new Set();
	for (const d of descriptors) for (const [key, value] of Object.entries(d)) {
		if (value === void 0) continue;
		if (key === "class") for (const c of normalizeClasses(value)) classSet.add(c);
		else if (typeof value === "string" && value !== "") result[key] = value;
	}
	if (classSet.size > 0) result["class"] = [...classSet].join(" ");
	return result;
}
function syncAttrsToElement(element, next) {
	let prev = {};
	try {
		const raw = element.getAttribute("data-de-managed");
		if (raw) prev = JSON.parse(raw);
	} catch {}
	const prevClasses = (prev["class"] ?? "").split(" ").filter(Boolean);
	for (const c of prevClasses) element.classList.remove(c);
	for (const key of Object.keys(prev)) if (key !== "class") element.removeAttribute(key);
	const nextClasses = (next["class"] ?? "").split(" ").filter(Boolean);
	for (const c of nextClasses) element.classList.add(c);
	for (const [key, value] of Object.entries(next)) if (key !== "class") element.setAttribute(key, value);
	if (Object.keys(next).length > 0) element.setAttribute("data-de-managed", JSON.stringify(next));
	else element.removeAttribute("data-de-managed");
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-JWXJPJBO.js
function createDocumentElementStore() {
	const map = /* @__PURE__ */ new Map();
	const listeners = /* @__PURE__ */ new Set();
	let snapshot = new Map(map);
	const notify = () => {
		snapshot = new Map(map);
		for (const l of listeners) l();
	};
	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot: () => snapshot,
		getServerSnapshot: () => snapshot,
		register: (id, descriptor) => {
			map.set(id, descriptor);
			notify();
		},
		unregister: (id) => {
			if (map.delete(id)) notify();
		}
	};
}
var DocumentClassContext = (0, import_react.createContext)(null);
function useDocumentClassContext() {
	return (0, import_react.useContext)(DocumentClassContext);
}
function DocumentClassProvider({ children }) {
	const storeRef = (0, import_react.useRef)(null);
	if (!storeRef.current) storeRef.current = createDocumentElementStore();
	const value = (0, import_react.useMemo)(() => ({ store: storeRef.current }), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DocumentClassContext.Provider, {
		value,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentElementDOMSync, { store: storeRef.current })]
	});
}
function DocumentElementDOMSync({ store }) {
	const registrations = (0, import_react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getServerSnapshot);
	(0, import_react.useEffect)(() => {
		if (typeof document === "undefined") return;
		const bodyAttrs = mergeElementAttrs([...registrations.values()].map((d) => d.body ?? {}));
		const htmlAttrs = mergeElementAttrs([...registrations.values()].map((d) => d.html ?? {}));
		syncAttrsToElement(document.body, bodyAttrs);
		syncAttrsToElement(document.documentElement, htmlAttrs);
	}, [registrations]);
	return null;
}
function useDocumentClass(descriptor) {
	const id = (0, import_react.useId)();
	const ctx = useDocumentClassContext();
	const descriptorRef = (0, import_react.useRef)(descriptor);
	descriptorRef.current = descriptor;
	const descriptorKey = (0, import_react.useMemo)(() => JSON.stringify(descriptor), [JSON.stringify(descriptor)]);
	(0, import_react.useEffect)(() => {
		if (ctx) {
			ctx.store.register(id, descriptorRef.current);
			return () => ctx.store.unregister(id);
		}
		if (typeof document === "undefined") return;
		const bodyAttrs = mergeElementAttrs([descriptorRef.current.body ?? {}]);
		const htmlAttrs = mergeElementAttrs([descriptorRef.current.html ?? {}]);
		syncAttrsToElement(document.body, bodyAttrs);
		syncAttrsToElement(document.documentElement, htmlAttrs);
		return () => {
			syncAttrsToElement(document.body, {});
			syncAttrsToElement(document.documentElement, {});
		};
	}, [
		id,
		ctx,
		descriptorKey
	]);
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-V2ZDTY6H.js
function pushEqualHeightConfig(settings) {
	const isEnabled = settings["products::card.equal-height.enabled"];
	if (isEnabled === void 0 || isEnabled === null) return;
	window.dataLayer = window.dataLayer ?? [];
	window.dataLayer.push({ equalHeight: {
		isEnabled: Boolean(isEnabled),
		max: Number(settings["products::card.equal-height.max-pixel"] ?? 300),
		classType: String(settings["products::card.equal-height.type"] ?? "min")
	} });
}
function WidgetHead() {
	const { store } = useTwilight();
	(0, import_react.useEffect)(() => {
		pushEqualHeightConfig(store.settings ?? {});
	}, [store.id, store.settings]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, {
			name: "head:start",
			ssr: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, {
			name: "head",
			ssr: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, {
			name: "head:end",
			ssr: true
		})
	] });
}
//#endregion
//#region node_modules/.pnpm/sonner@2.0.8_@types+react@1_919e9036f48c64786ce2f890b5542f07/node_modules/sonner/dist/index.mjs
function __insertCSS(code) {
	if (!code || typeof document == "undefined") return;
	let head = document.head || document.getElementsByTagName("head")[0];
	let style = document.createElement("style");
	style.type = "text/css";
	head.appendChild(style);
	style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
}
var getAsset = (type) => {
	switch (type) {
		case "success": return SuccessIcon;
		case "info": return InfoIcon;
		case "warning": return WarningIcon;
		case "error": return ErrorIcon;
		default: return null;
	}
};
var bars = Array(12).fill(0);
var Loader = ({ visible, className }) => {
	return /*#__PURE__*/ import_react.createElement("div", {
		className: ["sonner-loading-wrapper", className].filter(Boolean).join(" "),
		"data-visible": visible
	}, /*#__PURE__*/ import_react.createElement("div", { className: "sonner-spinner" }, bars.map((_, i) => /*#__PURE__*/ import_react.createElement("div", {
		className: "sonner-loading-bar",
		key: `spinner-bar-${i}`
	}))));
};
var SuccessIcon = /*#__PURE__*/ import_react.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 20 20",
	fill: "currentColor",
	height: "20",
	width: "20",
	"aria-hidden": "true"
}, /*#__PURE__*/ import_react.createElement("path", {
	fillRule: "evenodd",
	d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
	clipRule: "evenodd"
}));
var WarningIcon = /*#__PURE__*/ import_react.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	fill: "currentColor",
	height: "20",
	width: "20",
	"aria-hidden": "true"
}, /*#__PURE__*/ import_react.createElement("path", {
	fillRule: "evenodd",
	d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
	clipRule: "evenodd"
}));
var InfoIcon = /*#__PURE__*/ import_react.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 20 20",
	fill: "currentColor",
	height: "20",
	width: "20",
	"aria-hidden": "true"
}, /*#__PURE__*/ import_react.createElement("path", {
	fillRule: "evenodd",
	d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
	clipRule: "evenodd"
}));
var ErrorIcon = /*#__PURE__*/ import_react.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 20 20",
	fill: "currentColor",
	height: "20",
	width: "20",
	"aria-hidden": "true"
}, /*#__PURE__*/ import_react.createElement("path", {
	fillRule: "evenodd",
	d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
	clipRule: "evenodd"
}));
var CloseIcon$1 = /*#__PURE__*/ import_react.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: "12",
	height: "12",
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "1.5",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true"
}, /*#__PURE__*/ import_react.createElement("line", {
	x1: "18",
	y1: "6",
	x2: "6",
	y2: "18"
}), /*#__PURE__*/ import_react.createElement("line", {
	x1: "6",
	y1: "6",
	x2: "18",
	y2: "18"
}));
var useIsDocumentHidden = () => {
	const [isDocumentHidden, setIsDocumentHidden] = import_react.useState(document.hidden);
	import_react.useEffect(() => {
		const callback = () => {
			setIsDocumentHidden(document.hidden);
		};
		document.addEventListener("visibilitychange", callback);
		return () => document.removeEventListener("visibilitychange", callback);
	}, []);
	return isDocumentHidden;
};
var toastsCounter = 1;
var MAX_HISTORY_SIZE = 100;
var getToastId = (data) => {
	var _data_id;
	return typeof (data == null ? void 0 : data.id) === "number" || (data == null ? void 0 : (_data_id = data.id) == null ? void 0 : _data_id.length) > 0 ? data.id : toastsCounter++;
};
var Observer = class {
	constructor() {
		this.subscribe = (subscriber) => {
			this.subscribers.push(subscriber);
			this.getActiveToasts().forEach((toast) => subscriber(toast));
			return () => {
				const index = this.subscribers.indexOf(subscriber);
				this.subscribers.splice(index, 1);
			};
		};
		this.publish = (data) => {
			this.subscribers.forEach((subscriber) => subscriber(data));
		};
		this.addToast = (data) => {
			this.publish(data);
			this.toasts = [...this.toasts, data];
			this.trimHistory();
		};
		this.trimHistory = () => {
			let toRemove = this.toasts.length - MAX_HISTORY_SIZE;
			if (toRemove <= 0) return;
			this.toasts = this.toasts.filter((toast) => {
				if (toRemove > 0 && this.dismissedToasts.has(toast.id)) {
					this.dismissedToasts.delete(toast.id);
					toRemove--;
					return false;
				}
				return true;
			});
		};
		this.create = (data) => {
			const { message, ...rest } = data;
			const id = getToastId(data);
			const pendingDismissal = this.pendingDismissals.get(id);
			if (pendingDismissal !== void 0) {
				cancelAnimationFrame(pendingDismissal);
				this.pendingDismissals.delete(id);
				this.dismissedToasts.delete(id);
			}
			const wasDismissed = this.dismissedToasts.has(id);
			const dismissible = data.dismissible === void 0 ? true : data.dismissible;
			if (wasDismissed) {
				this.dismissedToasts.delete(id);
				this.toasts = this.toasts.filter((toast) => toast.id !== id);
			}
			if (wasDismissed ? void 0 : this.toasts.find((toast) => {
				return toast.id === id;
			})) this.toasts = this.toasts.map((toast) => {
				if (toast.id === id) {
					this.publish({
						...toast,
						...data,
						id,
						title: message
					});
					return {
						...toast,
						...data,
						id,
						dismissible,
						title: message
					};
				}
				return toast;
			});
			else this.addToast({
				title: message,
				...rest,
				dismissible,
				id
			});
			return id;
		};
		this.dismiss = (id) => {
			if (id === void 0 || id === null) {
				this.getActiveToasts().forEach((toast) => {
					this.dismissedToasts.add(toast.id);
					this.subscribers.forEach((subscriber) => subscriber({
						id: toast.id,
						dismiss: true
					}));
				});
				return id;
			}
			this.dismissedToasts.add(id);
			const alreadyPending = this.pendingDismissals.get(id);
			if (alreadyPending !== void 0) cancelAnimationFrame(alreadyPending);
			this.pendingDismissals.set(id, requestAnimationFrame(() => {
				this.pendingDismissals.delete(id);
				this.subscribers.forEach((subscriber) => subscriber({
					id,
					dismiss: true
				}));
			}));
			return id;
		};
		this.message = (message, data) => {
			return this.create({
				...data,
				message,
				type: void 0
			});
		};
		this.error = (message, data) => {
			return this.create({
				...data,
				message,
				type: "error"
			});
		};
		this.success = (message, data) => {
			return this.create({
				...data,
				type: "success",
				message
			});
		};
		this.info = (message, data) => {
			return this.create({
				...data,
				type: "info",
				message
			});
		};
		this.warning = (message, data) => {
			return this.create({
				...data,
				type: "warning",
				message
			});
		};
		this.loading = (message, data) => {
			return this.create({
				...data,
				type: "loading",
				message
			});
		};
		this.promise = (promise, data) => {
			if (!data) return;
			let id = void 0;
			if (data.loading !== void 0) id = this.create({
				...data,
				promise,
				type: "loading",
				message: data.loading,
				description: typeof data.description !== "function" ? data.description : void 0
			});
			const p = Promise.resolve(promise instanceof Function ? promise() : promise);
			let shouldDismiss = id !== void 0;
			let result;
			const originalPromise = p.then(async (response) => {
				result = ["resolve", response];
				if (import_react.isValidElement(response)) {
					shouldDismiss = false;
					this.create({
						id,
						type: "default",
						message: response
					});
				} else if (isHttpResponse(response) && !response.ok) {
					shouldDismiss = false;
					const promiseData = typeof data.error === "function" ? await data.error(`HTTP error! status: ${response.status}`) : data.error;
					const description = typeof data.description === "function" ? await data.description(`HTTP error! status: ${response.status}`) : data.description;
					const toastSettings = typeof promiseData === "object" && !import_react.isValidElement(promiseData) ? promiseData : { message: promiseData };
					this.create({
						id,
						type: "error",
						description,
						...toastSettings
					});
				} else if (response instanceof Error) {
					shouldDismiss = false;
					const promiseData = typeof data.error === "function" ? await data.error(response) : data.error;
					const description = typeof data.description === "function" ? await data.description(response) : data.description;
					const toastSettings = typeof promiseData === "object" && !import_react.isValidElement(promiseData) ? promiseData : { message: promiseData };
					this.create({
						id,
						type: "error",
						description,
						...toastSettings
					});
				} else if (data.success !== void 0) {
					shouldDismiss = false;
					const promiseData = typeof data.success === "function" ? await data.success(response) : data.success;
					const description = typeof data.description === "function" ? await data.description(response) : data.description;
					const toastSettings = typeof promiseData === "object" && !import_react.isValidElement(promiseData) ? promiseData : { message: promiseData };
					this.create({
						id,
						type: "success",
						description,
						...toastSettings
					});
				}
			}).catch(async (error) => {
				result = ["reject", error];
				if (data.error !== void 0) {
					shouldDismiss = false;
					const promiseData = typeof data.error === "function" ? await data.error(error) : data.error;
					const description = typeof data.description === "function" ? await data.description(error) : data.description;
					const toastSettings = typeof promiseData === "object" && !import_react.isValidElement(promiseData) ? promiseData : { message: promiseData };
					this.create({
						id,
						type: "error",
						description,
						...toastSettings
					});
				}
			}).finally(() => {
				if (shouldDismiss) {
					this.dismiss(id);
					id = void 0;
				}
				data.finally == null || data.finally.call(data);
			});
			const unwrap = () => new Promise((resolve, reject) => originalPromise.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
			if (typeof id !== "string" && typeof id !== "number") return { unwrap };
			else return Object.assign(id, { unwrap });
		};
		this.custom = (jsx, data) => {
			const id = getToastId(data);
			this.create({
				...data,
				jsx: jsx(id),
				id,
				type: void 0
			});
			return id;
		};
		this.getActiveToasts = () => {
			return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
		};
		this.subscribers = [];
		this.toasts = [];
		this.dismissedToasts = /* @__PURE__ */ new Set();
		this.pendingDismissals = /* @__PURE__ */ new Map();
	}
};
var ToastState = new Observer();
var toastFunction = (message, data) => {
	return ToastState.message(message, data);
};
var isHttpResponse = (data) => {
	return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
};
var basicToast = toastFunction;
var getHistory = () => ToastState.toasts;
var getToasts = () => ToastState.getActiveToasts();
var toast = Object.assign(basicToast, {
	success: ToastState.success,
	info: ToastState.info,
	warning: ToastState.warning,
	error: ToastState.error,
	custom: ToastState.custom,
	message: ToastState.message,
	promise: ToastState.promise,
	dismiss: ToastState.dismiss,
	loading: ToastState.loading
}, {
	getHistory,
	getToasts
});
__insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--normal-text);background:var(--normal-bg);border:1px solid var(--normal-border);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{-webkit-user-select:none;user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");
function isAction(action) {
	return action.label !== void 0;
}
var VISIBLE_TOASTS_AMOUNT = 3;
var VIEWPORT_OFFSET = "24px";
var MOBILE_VIEWPORT_OFFSET = "16px";
var TOAST_LIFETIME = 4e3;
var TOAST_WIDTH = 356;
var GAP = 14;
var SWIPE_THRESHOLD = 45;
var TIME_BEFORE_UNMOUNT = 200;
function cn(...classes) {
	return classes.filter(Boolean).join(" ");
}
function getDefaultSwipeDirections(position) {
	const [y, x] = position.split("-");
	const directions = [];
	if (y) directions.push(y);
	if (x) directions.push(x);
	return directions;
}
var Toast = (props) => {
	var _toast_classNames, _toast_classNames1, _toast_classNames2, _toast_classNames3, _toast_classNames4, _toast_classNames5, _toast_classNames6, _toast_classNames7, _toast_classNames8;
	const { invert: ToasterInvert, toast, unstyled, interacting, setHeights, visibleToasts, heights, index, toasts, expanded, removeToast, defaultRichColors, closeButton: closeButtonFromToaster, style, cancelButtonStyle, actionButtonStyle, className = "", descriptionClassName = "", duration: durationFromToaster, position, gap, expandByDefault, classNames, icons, closeButtonAriaLabel = "Close toast" } = props;
	const [swipeDirection, setSwipeDirection] = import_react.useState(null);
	const [swipeOutDirection, setSwipeOutDirection] = import_react.useState(null);
	const [mounted, setMounted] = import_react.useState(false);
	const [removed, setRemoved] = import_react.useState(false);
	const [swiping, setSwiping] = import_react.useState(false);
	const [swipeOut, setSwipeOut] = import_react.useState(false);
	const [isSwiped, setIsSwiped] = import_react.useState(false);
	const [offsetBeforeRemove, setOffsetBeforeRemove] = import_react.useState(0);
	const [initialHeight, setInitialHeight] = import_react.useState(0);
	const remainingTime = import_react.useRef(toast.duration || durationFromToaster || TOAST_LIFETIME);
	const dragStartTime = import_react.useRef(null);
	const toastRef = import_react.useRef(null);
	const isFront = index === 0;
	const isVisible = index + 1 <= visibleToasts;
	const toastType = toast.type;
	const toastTypeKey = toastType != null ? toastType : "default";
	const dismissible = toast.dismissible !== false;
	const toastClassname = toast.className || "";
	const toastDescriptionClassname = toast.descriptionClassName || "";
	const heightIndex = import_react.useMemo(() => heights.findIndex((height) => height.toastId === toast.id) || 0, [heights, toast.id]);
	const closeButton = import_react.useMemo(() => {
		var _toast_closeButton;
		return (_toast_closeButton = toast.closeButton) != null ? _toast_closeButton : closeButtonFromToaster;
	}, [toast.closeButton, closeButtonFromToaster]);
	const duration = import_react.useMemo(() => toast.duration || durationFromToaster || TOAST_LIFETIME, [toast.duration, durationFromToaster]);
	const closeTimerStartTimeRef = import_react.useRef(0);
	const offset = import_react.useRef(0);
	const lastCloseTimerStartTimeRef = import_react.useRef(0);
	const pointerStartRef = import_react.useRef(null);
	const [y, x] = position.split("-");
	const toastsHeightBefore = import_react.useMemo(() => {
		return heights.reduce((prev, curr, reducerIndex) => {
			if (reducerIndex >= heightIndex) return prev;
			return prev + curr.height;
		}, 0);
	}, [heights, heightIndex]);
	const isDocumentHidden = useIsDocumentHidden();
	const swipeDirections = import_react.useMemo(() => {
		var _props_swipeDirections;
		return (_props_swipeDirections = props.swipeDirections) != null ? _props_swipeDirections : getDefaultSwipeDirections(position);
	}, [props.swipeDirections, position]);
	const invert = toast.invert || ToasterInvert;
	const disabled = toastType === "loading";
	offset.current = import_react.useMemo(() => heightIndex * gap + toastsHeightBefore, [heightIndex, toastsHeightBefore]);
	import_react.useEffect(() => {
		remainingTime.current = duration;
	}, [duration]);
	import_react.useEffect(() => {
		setMounted(true);
	}, []);
	import_react.useEffect(() => {
		const toastNode = toastRef.current;
		if (toastNode) {
			const height = toastNode.getBoundingClientRect().height;
			setInitialHeight(height);
			setHeights((h) => [{
				toastId: toast.id,
				height,
				position: toast.position
			}, ...h]);
			return () => setHeights((h) => h.filter((height) => height.toastId !== toast.id));
		}
	}, [setHeights, toast.id]);
	import_react.useLayoutEffect(() => {
		if (!mounted) return;
		const toastNode = toastRef.current;
		const originalHeight = toastNode.style.height;
		toastNode.style.height = "auto";
		const newHeight = toastNode.getBoundingClientRect().height;
		toastNode.style.height = originalHeight;
		setInitialHeight(newHeight);
		setHeights((heights) => {
			if (!heights.find((height) => height.toastId === toast.id)) return [{
				toastId: toast.id,
				height: newHeight,
				position: toast.position
			}, ...heights];
			else return heights.map((height) => height.toastId === toast.id ? {
				...height,
				height: newHeight
			} : height);
		});
	}, [
		mounted,
		toast.title,
		toast.description,
		setHeights,
		toast.id,
		toast.jsx,
		toast.action,
		toast.cancel
	]);
	const deleteToast = import_react.useCallback(() => {
		setRemoved(true);
		setOffsetBeforeRemove(offset.current);
		setHeights((h) => h.filter((height) => height.toastId !== toast.id));
		setTimeout(() => {
			removeToast(toast);
		}, TIME_BEFORE_UNMOUNT);
	}, [
		toast,
		removeToast,
		setHeights,
		offset
	]);
	import_react.useEffect(() => {
		if (toast.promise && toastType === "loading" || toast.duration === Infinity || toast.type === "loading") return;
		let timeoutId;
		const pauseTimer = () => {
			if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
				const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef.current;
				remainingTime.current = remainingTime.current - elapsedTime;
			}
			lastCloseTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
		};
		const startTimer = () => {
			if (remainingTime.current === Infinity) return;
			closeTimerStartTimeRef.current = (/* @__PURE__ */ new Date()).getTime();
			timeoutId = setTimeout(() => {
				toast.onAutoClose == null || toast.onAutoClose.call(toast, toast);
				deleteToast();
			}, remainingTime.current);
		};
		if (expanded || interacting || isDocumentHidden) pauseTimer();
		else startTimer();
		return () => clearTimeout(timeoutId);
	}, [
		expanded,
		interacting,
		toast,
		toastType,
		isDocumentHidden,
		deleteToast
	]);
	import_react.useEffect(() => {
		if (toast.delete) {
			deleteToast();
			toast.onDismiss == null || toast.onDismiss.call(toast, toast);
		}
	}, [deleteToast, toast.delete]);
	function getLoadingIcon() {
		var _toast_classNames;
		if (icons == null ? void 0 : icons.loading) {
			var _toast_classNames1;
			return /*#__PURE__*/ import_react.createElement("div", {
				className: cn(classNames == null ? void 0 : classNames.loader, toast == null ? void 0 : (_toast_classNames1 = toast.classNames) == null ? void 0 : _toast_classNames1.loader, "sonner-loader"),
				"data-visible": toastType === "loading"
			}, icons.loading);
		}
		return /*#__PURE__*/ import_react.createElement(Loader, {
			className: cn(classNames == null ? void 0 : classNames.loader, toast == null ? void 0 : (_toast_classNames = toast.classNames) == null ? void 0 : _toast_classNames.loader),
			visible: toastType === "loading"
		});
	}
	const icon = toast.icon || (icons == null ? void 0 : icons[toastType]) || getAsset(toastType);
	var _toast_richColors, _icons_close;
	return /*#__PURE__*/ import_react.createElement("li", {
		tabIndex: 0,
		ref: toastRef,
		className: cn(className, toastClassname, classNames == null ? void 0 : classNames.toast, toast == null ? void 0 : (_toast_classNames = toast.classNames) == null ? void 0 : _toast_classNames.toast, classNames == null ? void 0 : classNames[toastTypeKey], toast == null ? void 0 : (_toast_classNames1 = toast.classNames) == null ? void 0 : _toast_classNames1[toastTypeKey]),
		"data-sonner-toast": "",
		"data-rich-colors": (_toast_richColors = toast.richColors) != null ? _toast_richColors : defaultRichColors,
		"data-styled": !Boolean(toast.jsx || toast.unstyled || unstyled),
		"data-mounted": mounted,
		"data-promise": Boolean(toast.promise),
		"data-swiped": isSwiped,
		"data-removed": removed,
		"data-visible": isVisible,
		"data-y-position": y,
		"data-x-position": x,
		"data-index": index,
		"data-front": isFront,
		"data-swiping": swiping,
		"data-dismissible": dismissible,
		"data-type": toastType,
		"data-invert": invert,
		"data-swipe-out": swipeOut,
		"data-swipe-direction": swipeOutDirection,
		"data-expanded": Boolean(expanded || expandByDefault && mounted),
		"data-testid": toast.testId,
		style: {
			"--index": index,
			"--toasts-before": index,
			"--z-index": toasts.length - index,
			"--offset": `${removed ? offsetBeforeRemove : offset.current}px`,
			"--initial-height": expandByDefault ? "auto" : `${initialHeight}px`,
			...style,
			...toast.style
		},
		onDragEnd: () => {
			setSwiping(false);
			setSwipeDirection(null);
			pointerStartRef.current = null;
		},
		onPointerDown: (event) => {
			if (event.button === 2) return;
			if (disabled || !dismissible) return;
			dragStartTime.current = /* @__PURE__ */ new Date();
			setOffsetBeforeRemove(offset.current);
			event.target.setPointerCapture(event.pointerId);
			if (event.target.tagName === "BUTTON") return;
			setSwiping(true);
			pointerStartRef.current = {
				x: event.clientX,
				y: event.clientY
			};
		},
		onPointerUp: () => {
			var _toastRef_current, _toastRef_current1, _dragStartTime_current;
			if (swipeOut || !dismissible) return;
			pointerStartRef.current = null;
			const swipeAmountX = Number(((_toastRef_current = toastRef.current) == null ? void 0 : _toastRef_current.style.getPropertyValue("--swipe-amount-x").replace("px", "")) || 0);
			const swipeAmountY = Number(((_toastRef_current1 = toastRef.current) == null ? void 0 : _toastRef_current1.style.getPropertyValue("--swipe-amount-y").replace("px", "")) || 0);
			const timeTaken = (/* @__PURE__ */ new Date()).getTime() - ((_dragStartTime_current = dragStartTime.current) == null ? void 0 : _dragStartTime_current.getTime());
			const swipeAmount = swipeDirection === "x" ? swipeAmountX : swipeAmountY;
			const velocity = Math.abs(swipeAmount) / timeTaken;
			if ((swipeDirection === "x" ? swipeDirections.includes(swipeAmountX > 0 ? "right" : "left") : swipeDirections.includes(swipeAmountY > 0 ? "bottom" : "top")) && (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > .11)) {
				setOffsetBeforeRemove(offset.current);
				toast.onDismiss == null || toast.onDismiss.call(toast, toast);
				if (swipeDirection === "x") setSwipeOutDirection(swipeAmountX > 0 ? "right" : "left");
				else setSwipeOutDirection(swipeAmountY > 0 ? "down" : "up");
				deleteToast();
				setSwipeOut(true);
				return;
			} else {
				var _toastRef_current2, _toastRef_current3;
				(_toastRef_current2 = toastRef.current) == null || _toastRef_current2.style.setProperty("--swipe-amount-x", `0px`);
				(_toastRef_current3 = toastRef.current) == null || _toastRef_current3.style.setProperty("--swipe-amount-y", `0px`);
			}
			setIsSwiped(false);
			setSwiping(false);
			setSwipeDirection(null);
		},
		onPointerMove: (event) => {
			var _window_getSelection, _toastRef_current, _toastRef_current1;
			if (!pointerStartRef.current || !dismissible) return;
			if (((_window_getSelection = window.getSelection()) == null ? void 0 : _window_getSelection.toString().length) > 0) return;
			const yDelta = event.clientY - pointerStartRef.current.y;
			const xDelta = event.clientX - pointerStartRef.current.x;
			if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) setSwipeDirection(Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y");
			let swipeAmount = {
				x: 0,
				y: 0
			};
			const getDampening = (delta) => {
				return 1 / (1.5 + Math.abs(delta) / 20);
			};
			if (swipeDirection === "y") {
				if (swipeDirections.includes("top") || swipeDirections.includes("bottom")) {
					if (swipeDirections.includes("top") && yDelta < 0 || swipeDirections.includes("bottom") && yDelta > 0) swipeAmount.y = yDelta;
					else {
						const dampenedDelta = yDelta * getDampening(yDelta);
						swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
					}
				}
			} else if (swipeDirection === "x") {
				if (swipeDirections.includes("left") || swipeDirections.includes("right")) {
					if (swipeDirections.includes("left") && xDelta < 0 || swipeDirections.includes("right") && xDelta > 0) swipeAmount.x = xDelta;
					else {
						const dampenedDelta = xDelta * getDampening(xDelta);
						swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
					}
				}
			}
			if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) setIsSwiped(true);
			(_toastRef_current = toastRef.current) == null || _toastRef_current.style.setProperty("--swipe-amount-x", `${swipeAmount.x}px`);
			(_toastRef_current1 = toastRef.current) == null || _toastRef_current1.style.setProperty("--swipe-amount-y", `${swipeAmount.y}px`);
		}
	}, closeButton && !toast.jsx && toastType !== "loading" ? /*#__PURE__*/ import_react.createElement("button", {
		"aria-label": closeButtonAriaLabel,
		"data-disabled": disabled,
		"data-close-button": true,
		onClick: disabled || !dismissible ? () => {} : () => {
			deleteToast();
			toast.onDismiss == null || toast.onDismiss.call(toast, toast);
		},
		className: cn(classNames == null ? void 0 : classNames.closeButton, toast == null ? void 0 : (_toast_classNames2 = toast.classNames) == null ? void 0 : _toast_classNames2.closeButton)
	}, (_icons_close = icons == null ? void 0 : icons.close) != null ? _icons_close : CloseIcon$1) : null, (toastType || toast.icon || toast.promise) && toast.icon !== null && ((icons == null ? void 0 : icons[toastType]) !== null || toast.icon) ? /*#__PURE__*/ import_react.createElement("div", {
		"data-icon": "",
		className: cn(classNames == null ? void 0 : classNames.icon, toast == null ? void 0 : (_toast_classNames3 = toast.classNames) == null ? void 0 : _toast_classNames3.icon)
	}, toastType === "loading" ? toast.icon || getLoadingIcon() : toast.promise ? getLoadingIcon() : null, toastType !== "loading" ? icon : null) : null, /*#__PURE__*/ import_react.createElement("div", {
		"data-content": "",
		className: cn(classNames == null ? void 0 : classNames.content, toast == null ? void 0 : (_toast_classNames4 = toast.classNames) == null ? void 0 : _toast_classNames4.content)
	}, /*#__PURE__*/ import_react.createElement("div", {
		"data-title": "",
		className: cn(classNames == null ? void 0 : classNames.title, toast == null ? void 0 : (_toast_classNames5 = toast.classNames) == null ? void 0 : _toast_classNames5.title)
	}, toast.jsx ? toast.jsx : typeof toast.title === "function" ? toast.title() : toast.title), toast.description ? /*#__PURE__*/ import_react.createElement("div", {
		"data-description": "",
		className: cn(descriptionClassName, toastDescriptionClassname, classNames == null ? void 0 : classNames.description, toast == null ? void 0 : (_toast_classNames6 = toast.classNames) == null ? void 0 : _toast_classNames6.description)
	}, typeof toast.description === "function" ? toast.description() : toast.description) : null), /*#__PURE__*/ import_react.isValidElement(toast.cancel) ? toast.cancel : toast.cancel && isAction(toast.cancel) ? /*#__PURE__*/ import_react.createElement("button", {
		"data-button": true,
		"data-cancel": true,
		style: toast.cancelButtonStyle || cancelButtonStyle,
		onClick: (event) => {
			if (!isAction(toast.cancel)) return;
			if (!dismissible) return;
			toast.cancel.onClick == null || toast.cancel.onClick.call(toast.cancel, event);
			deleteToast();
		},
		className: cn(classNames == null ? void 0 : classNames.cancelButton, toast == null ? void 0 : (_toast_classNames7 = toast.classNames) == null ? void 0 : _toast_classNames7.cancelButton)
	}, toast.cancel.label) : null, /*#__PURE__*/ import_react.isValidElement(toast.action) ? toast.action : toast.action && isAction(toast.action) ? /*#__PURE__*/ import_react.createElement("button", {
		"data-button": true,
		"data-action": true,
		style: toast.actionButtonStyle || actionButtonStyle,
		onClick: (event) => {
			if (!isAction(toast.action)) return;
			toast.action.onClick == null || toast.action.onClick.call(toast.action, event);
			if (event.defaultPrevented) return;
			deleteToast();
		},
		className: cn(classNames == null ? void 0 : classNames.actionButton, toast == null ? void 0 : (_toast_classNames8 = toast.classNames) == null ? void 0 : _toast_classNames8.actionButton)
	}, toast.action.label) : null);
};
function getDocumentDirection() {
	if (typeof window === "undefined") return "ltr";
	if (typeof document === "undefined") return "ltr";
	const dirAttribute = document.documentElement.getAttribute("dir");
	if (dirAttribute === "auto" || !dirAttribute) return window.getComputedStyle(document.documentElement).direction;
	return dirAttribute;
}
function assignOffset(defaultOffset, mobileOffset) {
	const styles = {};
	[defaultOffset, mobileOffset].forEach((offset, index) => {
		const isMobile = index === 1;
		const prefix = isMobile ? "--mobile-offset" : "--offset";
		const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;
		function assignAll(offset) {
			[
				"top",
				"right",
				"bottom",
				"left"
			].forEach((key) => {
				styles[`${prefix}-${key}`] = typeof offset === "number" ? `${offset}px` : offset;
			});
		}
		if (typeof offset === "number" || typeof offset === "string") assignAll(offset);
		else if (typeof offset === "object") [
			"top",
			"right",
			"bottom",
			"left"
		].forEach((key) => {
			if (offset[key] === void 0) styles[`${prefix}-${key}`] = defaultValue;
			else styles[`${prefix}-${key}`] = typeof offset[key] === "number" ? `${offset[key]}px` : offset[key];
		});
		else assignAll(defaultValue);
	});
	return styles;
}
var Toaster$1 = /*#__PURE__*/ import_react.forwardRef(function Toaster(props, ref) {
	const { id, invert, position = "bottom-right", hotkey = ["altKey", "KeyT"], expand, closeButton, className, offset, mobileOffset, theme = "light", richColors, duration, style, visibleToasts = VISIBLE_TOASTS_AMOUNT, toastOptions, dir = getDocumentDirection(), gap = GAP, icons, customAriaLabel, containerAriaLabel = "Notifications" } = props;
	const [toasts, setToasts] = import_react.useState([]);
	const filteredToasts = import_react.useMemo(() => {
		if (id) return toasts.filter((toast) => toast.toasterId === id);
		return toasts.filter((toast) => !toast.toasterId);
	}, [toasts, id]);
	const possiblePositions = import_react.useMemo(() => {
		return Array.from(new Set([position].concat(filteredToasts.filter((toast) => toast.position).map((toast) => toast.position))));
	}, [filteredToasts, position]);
	const [heights, setHeights] = import_react.useState([]);
	const [expanded, setExpanded] = import_react.useState(false);
	const [interacting, setInteracting] = import_react.useState(false);
	const [actualTheme, setActualTheme] = import_react.useState(theme !== "system" ? theme : typeof window !== "undefined" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light");
	const listRef = import_react.useRef(null);
	const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
	const lastFocusedElementRef = import_react.useRef(null);
	const isFocusWithinRef = import_react.useRef(false);
	const removeToast = import_react.useCallback((toastToRemove) => {
		setToasts((toasts) => {
			var _toasts_find;
			if (!((_toasts_find = toasts.find((toast) => toast.id === toastToRemove.id)) == null ? void 0 : _toasts_find.delete)) ToastState.dismiss(toastToRemove.id);
			return toasts.filter(({ id }) => id !== toastToRemove.id);
		});
	}, []);
	import_react.useEffect(() => {
		return ToastState.subscribe((toast) => {
			if (toast.dismiss) {
				requestAnimationFrame(() => {
					setToasts((toasts) => toasts.map((t) => t.id === toast.id ? {
						...t,
						delete: true
					} : t));
				});
				return;
			}
			setTimeout(() => {
				import_react_dom.flushSync(() => {
					setToasts((toasts) => {
						const indexOfExistingToast = toasts.findIndex((t) => t.id === toast.id);
						if (indexOfExistingToast !== -1) return [
							...toasts.slice(0, indexOfExistingToast),
							{
								...toasts[indexOfExistingToast],
								...toast
							},
							...toasts.slice(indexOfExistingToast + 1)
						];
						return [toast, ...toasts];
					});
				});
			});
		});
	}, []);
	import_react.useEffect(() => {
		if (theme !== "system") {
			setActualTheme(theme);
			return;
		}
		if (theme === "system") {
			if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) setActualTheme("dark");
			else setActualTheme("light");
		}
		if (typeof window === "undefined") return;
		const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		try {
			darkMediaQuery.addEventListener("change", ({ matches }) => {
				if (matches) setActualTheme("dark");
				else setActualTheme("light");
			});
		} catch (error) {
			darkMediaQuery.addListener(({ matches }) => {
				try {
					if (matches) setActualTheme("dark");
					else setActualTheme("light");
				} catch (e) {
					console.error(e);
				}
			});
		}
	}, [theme]);
	import_react.useEffect(() => {
		if (toasts.length <= 1) setExpanded(false);
	}, [toasts]);
	import_react.useEffect(() => {
		const handleKeyDown = (event) => {
			var _listRef_current;
			if (hotkey.length > 0 && hotkey.every((key) => event[key] || event.code === key)) {
				var _listRef_current1;
				setExpanded(true);
				(_listRef_current1 = listRef.current) == null || _listRef_current1.focus();
			}
			if (event.code === "Escape" && (document.activeElement === listRef.current || ((_listRef_current = listRef.current) == null ? void 0 : _listRef_current.contains(document.activeElement)))) setExpanded(false);
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [hotkey]);
	import_react.useEffect(() => {
		if (listRef.current) return () => {
			if (lastFocusedElementRef.current) {
				lastFocusedElementRef.current.focus({ preventScroll: true });
				lastFocusedElementRef.current = null;
				isFocusWithinRef.current = false;
			}
		};
	}, [listRef.current]);
	return /*#__PURE__*/ import_react.createElement("section", {
		ref,
		"aria-label": customAriaLabel != null ? customAriaLabel : `${containerAriaLabel} ${hotkeyLabel}`,
		tabIndex: -1,
		"aria-live": "polite",
		"aria-relevant": "additions text",
		"aria-atomic": "false",
		suppressHydrationWarning: true,
		"data-react-aria-top-layer": true
	}, possiblePositions.map((position, index) => {
		var _heights_;
		const [y, x] = position.split("-");
		if (!filteredToasts.length) return null;
		return /*#__PURE__*/ import_react.createElement("ol", {
			key: position,
			dir: dir === "auto" ? getDocumentDirection() : dir,
			tabIndex: -1,
			ref: listRef,
			className,
			"data-sonner-toaster": true,
			"data-sonner-theme": actualTheme,
			"data-y-position": y,
			"data-x-position": x,
			style: {
				"--front-toast-height": `${((_heights_ = heights[0]) == null ? void 0 : _heights_.height) || 0}px`,
				"--width": `${TOAST_WIDTH}px`,
				"--gap": `${gap}px`,
				...style,
				...assignOffset(offset, mobileOffset)
			},
			onBlur: (event) => {
				if (isFocusWithinRef.current && !event.currentTarget.contains(event.relatedTarget)) {
					isFocusWithinRef.current = false;
					if (lastFocusedElementRef.current) {
						lastFocusedElementRef.current.focus({ preventScroll: true });
						lastFocusedElementRef.current = null;
					}
				}
			},
			onFocus: (event) => {
				if (event.target instanceof HTMLElement && event.target.dataset.dismissible === "false") return;
				if (!isFocusWithinRef.current) {
					isFocusWithinRef.current = true;
					lastFocusedElementRef.current = event.relatedTarget;
				}
			},
			onMouseEnter: () => setExpanded(true),
			onMouseMove: () => setExpanded(true),
			onMouseLeave: () => {
				if (!interacting) setExpanded(false);
			},
			onDragEnd: () => setExpanded(false),
			onPointerDown: (event) => {
				if (event.target instanceof HTMLElement && event.target.dataset.dismissible === "false") return;
				setInteracting(true);
			},
			onPointerUp: () => setInteracting(false)
		}, filteredToasts.filter((toast) => !toast.position && index === 0 || toast.position === position).map((toast, index) => {
			var _toastOptions_duration, _toastOptions_closeButton;
			return /*#__PURE__*/ import_react.createElement(Toast, {
				key: toast.id,
				icons,
				index,
				toast,
				defaultRichColors: richColors,
				duration: (_toastOptions_duration = toastOptions == null ? void 0 : toastOptions.duration) != null ? _toastOptions_duration : duration,
				className: toastOptions == null ? void 0 : toastOptions.className,
				descriptionClassName: toastOptions == null ? void 0 : toastOptions.descriptionClassName,
				invert,
				visibleToasts,
				closeButton: (_toastOptions_closeButton = toastOptions == null ? void 0 : toastOptions.closeButton) != null ? _toastOptions_closeButton : closeButton,
				interacting,
				position,
				style: toastOptions == null ? void 0 : toastOptions.style,
				unstyled: toastOptions == null ? void 0 : toastOptions.unstyled,
				classNames: toastOptions == null ? void 0 : toastOptions.classNames,
				cancelButtonStyle: toastOptions == null ? void 0 : toastOptions.cancelButtonStyle,
				actionButtonStyle: toastOptions == null ? void 0 : toastOptions.actionButtonStyle,
				closeButtonAriaLabel: toastOptions == null ? void 0 : toastOptions.closeButtonAriaLabel,
				removeToast,
				toasts: filteredToasts.filter((t) => t.position == toast.position),
				heights: heights.filter((h) => h.position == toast.position),
				setHeights,
				expandByDefault: expand,
				gap,
				expanded,
				swipeDirections: props.swipeDirections
			});
		}));
	}));
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-V2M5YNZQ.js
var toastClassNames = {
	toast: "group bg-white border-2 rounded-xl shadow-2xl p-4 font-primary",
	title: "text-base font-bold",
	description: "text-sm mt-1 text-gray-600",
	actionButton: "bg-primary text-white px-3 py-1 rounded",
	cancelButton: "bg-gray-100 px-3 py-1 rounded",
	success: "border-green-500 [&_svg]:text-green-500 [&_aside]:text-green-700",
	error: "border-red-500 [&_svg]:text-red-500 [&_aside]:text-red-700",
	warning: "border-yellow-500 [&_svg]:text-yellow-500 [&_aside]:text-yellow-700",
	info: "border-blue-500 [&_svg]:text-blue-500 [&_aside]:text-blue-700",
	loading: "border-gray-400"
};
var MOBILE_BREAKPOINT = 768;
var NATIVE_ALERT_EVENT = "ui::alert";
function dispatchNativeAlert(type, message, title) {
	const salla = window.salla;
	if (!isNativeApp() || !salla?.event?.dispatch) return false;
	salla.event.dispatch(NATIVE_ALERT_EVENT, {
		type,
		message
	});
	return true;
}
function Toaster({ mobilePosition = "bottom-center", addToCartToast = true }) {
	const { theme } = useTwilight();
	const themeRef = (0, import_react.useRef)(theme);
	themeRef.current = theme;
	const flashShownRef = (0, import_react.useRef)(false);
	const desktopPosition = theme.is_rtl ? "top-left" : "top-right";
	const [position, setPosition] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return desktopPosition;
		return window.innerWidth < MOBILE_BREAKPOINT ? mobilePosition : desktopPosition;
	});
	(0, import_react.useEffect)(() => {
		const handleResize = () => {
			setPosition(window.innerWidth < MOBILE_BREAKPOINT ? mobilePosition : desktopPosition);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [desktopPosition, mobilePosition]);
	(0, import_react.useEffect)(() => {
		const salla = window.salla;
		if (!salla) return;
		let active = true;
		const handleNotify = (message, type, data) => {
			const eventData = data;
			const shouldSuppressAddToCartToast = (!addToCartToast || themeRef.current.settings?.enable_add_product_toast) && eventData?.data?.googleTags?.event === "addToCart";
			let title;
			let toastType;
			if (typeof message === "object" && message !== null) {
				title = message.title || message.text || "";
				toastType = message.icon || type || "info";
			} else {
				title = message;
				toastType = type || "info";
			}
			if (shouldSuppressAddToCartToast) return;
			if (dispatchNativeAlert(toastType, title)) return;
			if (toastType === "success") toast.success(title, { duration: 3e3 });
			else if (toastType === "error") toast.error(title, { duration: 3e3 });
			else if (toastType === "warning") toast.warning(title, { duration: 3e3 });
			else toast.info(title, { duration: 3e3 });
		};
		(async () => {
			try {
				await salla.onReady?.();
			} catch {}
			if (active) salla.notify?.setNotifier?.(handleNotify);
		})();
		return () => {
			active = false;
			salla.notify?.setNotifier?.(() => {});
		};
	}, [addToCartToast]);
	(0, import_react.useEffect)(() => {
		if (flashShownRef.current || typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const successMsg = params.get("success");
		const dangerMsg = params.get("danger");
		if (!successMsg && !dangerMsg) return;
		flashShownRef.current = true;
		const message = successMsg || dangerMsg || "";
		const toastType = dangerMsg ? "error" : "success";
		const url = new URL(window.location.href);
		url.searchParams.delete("success");
		url.searchParams.delete("danger");
		window.history.replaceState({}, "", url.toString());
		const timer = setTimeout(() => {
			if (dispatchNativeAlert(toastType, message)) return;
			if (toastType === "success") toast.success(message, { duration: 3e3 });
			else toast.error(message, { duration: 3e3 });
		}, 100);
		return () => clearTimeout(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
		position,
		offset: { top: "calc(var(--app-safe-area-top, 0px) + 24px)" },
		mobileOffset: { top: "calc(var(--app-safe-area-top, 0px) + 16px)" },
		toastOptions: {
			classNames: toastClassNames,
			style: { fontFamily: "var(--font-main, inherit)" }
		},
		style: { fontFamily: "var(--font-main, inherit)" }
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-N4YBKFJM.js
function themeCssVars(theme) {
	const vars = [];
	const fontName = theme.font?.name;
	if (fontName) {
		const family = (suffix = "") => JSON.stringify(`${fontName}${suffix}`);
		vars.push(["--font-main", family()], ["--font-light", family()], ["--font-regular", family()], ["--font-medium", family("-Medium")], ["--font-bold", family("-Bold")]);
	}
	const { color: color2 } = theme;
	if (color2) {
		vars.push(["--color-text", "#222222"]);
		if (color2.primary) {
			const c = color(color2.primary);
			vars.push(["--color-primary", color2.primary], ["--color-primary-dark", c.darken(.15)], ["--color-primary-light", c.lighten(.15)], ["--color-title", color2.primary], ["--color-secondary", color2.primary]);
		}
		if (color2.reverse_text) vars.push(["--color-primary-reverse", color2.reverse_text], ["--color-text-reverse", color2.reverse_text], ["--color-reverse-text", color2.reverse_text]);
		if (color2.reverse_primary) vars.push(["--color-reverse-primary", color2.reverse_primary]);
	}
	vars.push(["--page-height", "100%"]);
	return vars;
}
var applied = /* @__PURE__ */ new Set();
function applyTheme(theme) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const vars = themeCssVars(theme);
	const next = new Set(vars.map(([prop]) => prop));
	for (const prop of applied) if (!next.has(prop)) root.style.removeProperty(prop);
	for (const [prop, val] of vars) root.style.setProperty(prop, val);
	applied = next;
}
function fontToClass(name) {
	if (!name) return null;
	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	return slug ? `font-${slug}` : null;
}
function themeBodyClasses(theme, direction, isMobileWebview) {
	return [
		theme.name ? `salla-${theme.name}` : null,
		`color-mode-${theme.color?.is_dark ? "dark" : "light"}`,
		direction,
		theme.mode === "preview" ? "preview-mode" : null,
		fontToClass(theme.font?.name),
		isMobileWebview ? "mobile-webview" : null,
		theme.settings?.footer_is_dark ? "footer-is-dark" : "footer-is-light",
		theme.settings?.topnav_is_dark ? "topnav-is-dark" : null,
		theme.settings?.sticky_add_to_cart ? "is-sticky-product-bar" : null
	].filter(Boolean);
}
function themeSyncScript(vars, bodyClasses) {
	const json = (value) => escapeForInlineScript(JSON.stringify(value));
	return `(function(d){var s=d.documentElement.style;${json(vars)}.forEach(function(v){s.setProperty(v[0],v[1])});d.body.classList.add.apply(d.body.classList,${json(bodyClasses)})})(document);`;
}
function ThemeDocumentSync({ theme, locale, direction, isMobileWebview }) {
	const bodyClasses = themeBodyClasses(theme, direction, isMobileWebview);
	useDocumentClass({
		html: {
			lang: locale,
			dir: direction
		},
		body: { class: bodyClasses }
	});
	(0, import_react.useEffect)(() => {
		applyTheme(theme);
	}, [theme]);
	return (0, import_react.createElement)("script", {
		id: "salla-theme-sync",
		suppressHydrationWarning: true
	}, themeSyncScript(themeCssVars(theme), bodyClasses));
}
function getSalla() {
	if (typeof window === "undefined") return void 0;
	return window.salla;
}
var SDK_GUEST_CURRENCY = "SAR";
function userLanguage(sdk, locale, stored) {
	return locale || (sdk.cookie?.get?.("s-lang") ?? stored);
}
function withCookieLocale(sdk, stored, locale) {
	return {
		...stored,
		language_code: userLanguage(sdk, locale, stored.language_code),
		currency_code: sdk.cookie?.get?.("s-curr") ?? stored.currency_code ?? SDK_GUEST_CURRENCY
	};
}
function withSettingsUser(sdk, settings, locale) {
	if (!settings) return settings;
	const { user: guest, ...rest } = settings;
	const stored = sdk.storage?.get?.("user");
	if (stored) return {
		...rest,
		user: withCookieLocale(sdk, stored, locale)
	};
	const { currency_code: _currency, country_code: _country, default_geo_location: _geo, ...visitor } = guest ?? { type: "guest" };
	return {
		...rest,
		user: {
			...visitor,
			language_code: userLanguage(sdk, locale, visitor.language_code),
			currency_code: sdk.cookie?.get?.("s-curr") ?? SDK_GUEST_CURRENCY
		}
	};
}
var PLACEHOLDER_IMAGE = "https://cdn.salla.network/images/placeholder.png";
function withPlaceholder(settings) {
	const theme = settings.theme;
	if (!theme || theme.settings?.placeholder) return settings;
	return {
		...settings,
		theme: {
			...theme,
			settings: {
				...theme.settings,
				placeholder: PLACEHOLDER_IMAGE
			}
		}
	};
}
function disableMaintenanceLabel(ctx, locale) {
	const defaultValue = locale.startsWith("ar") ? "تنشيط المتجر" : "Disable Maintenance";
	return ctx.i18n?.t?.("pages.maintenance.disable_button", { defaultValue }) ?? defaultValue;
}
function seedSdkTranslations(sdk, settings, locale) {
	const localeKey = `${locale}.trans`;
	const messages = window.translations?.[localeKey];
	const hash = settings?.theme?.translations_hash ?? settings?.store?.id;
	if (!messages || !Object.keys(messages).length || !hash) return;
	try {
		if (sdk.storage.get(`s_translations.${hash}`)?.[localeKey]) return;
		sdk.storage.set("s_translations", { [hash]: { [localeKey]: messages } });
	} catch {}
}
var initializedSdks = /* @__PURE__ */ new WeakSet();
var EMPTY_STORE = {};
function useTwilightInit({ debug: _debug, initialData, onReady, onError: _onError, initialLocale }) {
	const isBrowser = typeof window !== "undefined";
	const initialLanguage = getLanguageInfo(initialLocale);
	const settingsData = initialData;
	const [isReady, setReady] = (0, import_react.useState)(() => !!settingsData);
	const settingsStore = settingsData?.store ?? EMPTY_STORE;
	const [storePatch, setStorePatch] = (0, import_react.useState)(null);
	const patch = storePatch?.base === settingsStore ? storePatch.patch : null;
	const storeData = (0, import_react.useMemo)(() => patch ? {
		...settingsStore,
		...patch
	} : settingsStore, [settingsStore, patch]);
	const setStoreData = (0, import_react.useCallback)((action) => setStorePatch((prev) => {
		const prevPatch = prev?.base === settingsStore ? prev.patch : null;
		return {
			base: settingsStore,
			patch: typeof action === "function" ? action({
				...settingsStore,
				...prevPatch
			}) : action
		};
	}), [settingsStore]);
	const settingsTheme = settingsData?.theme;
	const baseTheme = (0, import_react.useMemo)(() => {
		if (settingsTheme) return {
			...settingsTheme,
			is_rtl: settingsTheme.is_rtl ?? initialLanguage.dir === "rtl"
		};
		return { is_rtl: initialLanguage.dir === "rtl" };
	}, [settingsTheme, initialLanguage.dir]);
	const devOverrides = useDevSettingsOverrides();
	settingsData?.devFetchedAt;
	const themeData = (0, import_react.useMemo)(() => {
		return baseTheme;
	}, [baseTheme, devOverrides]);
	const [currency] = (0, import_react.useState)(() => {
		const code = getActiveCurrency();
		const active = code ? settingsData?.currencies?.[code] : void 0;
		return active ? {
			code: active.code,
			name: active.name,
			symbol: active.symbol
		} : null;
	});
	const [isMobileWebview] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!isBrowser || !themeData) return;
		getSalla()?.config?.set?.("theme.is_rtl", themeData.is_rtl ?? false);
		window.enable_more_menu = String(themeData.settings?.enable_more_menu ?? true);
	}, [themeData, isBrowser]);
	(0, import_react.useEffect)(() => {
		return whenSallaLoaded((sdk) => {
			const sdkWithVersions = sdk;
			sdkWithVersions.versions = {
				...sdkWithVersions.versions,
				engine: ENGINE_VERSION
			};
			if (initialLocale) syncSdkLocale(initialLocale);
			if (typeof sdk.init !== "function") return;
			const ctx = getTwilightContext();
			const pageCtx = ctx.page;
			const userData = withSettingsUser(sdk, settingsData, initialLocale);
			const baseData = userData && withSdkThemeVersion(withOwnerMaintenanceButton(withPlaceholder(userData), disableMaintenanceLabel(ctx, initialLocale)));
			const initData = pageCtx ? {
				...baseData,
				page: {
					...pageCtx,
					url: pageCtx.url ?? ctx.location.pathname + ctx.location.searchStr
				}
			} : baseData;
			if (!initializedSdks.has(sdk)) {
				initializedSdks.add(sdk);
				seedSdkTranslations(sdk, settingsData, initialLocale);
				sdk.init(initData);
			}
			const initSdk = async () => {
				try {
					await sdk.onReady();
				} catch {}
				syncSdkLocale(initialLocale);
				syncScopeCookie();
				setReady(true);
				document.dispatchEvent(new CustomEvent("theme::ready"));
				onReady?.({
					store: storeData,
					theme: themeData
				});
			};
			initSdk();
		});
	}, [initialLocale]);
	return {
		isReady,
		storeData,
		setStoreData,
		themeData,
		currency,
		isMobileWebview
	};
}
var SAFE_AREA_EVENT = "mobile::ui.safearea";
var CSS_VARS = {
	top: "--app-safe-area-top",
	bottom: "--app-safe-area-bottom"
};
function useNativeSafeArea() {
	(0, import_react.useEffect)(() => {
		let off;
		const cancel = whenSallaReady(() => {
			if (isNativeApp()) off = onSallaEvent(SAFE_AREA_EVENT, applySafeArea);
		});
		return () => {
			cancel();
			off?.();
		};
	}, []);
}
function applySafeArea(data) {
	const raw = data;
	const payload = raw?.details && typeof raw.details === "object" ? raw.details : raw;
	for (const side of ["top", "bottom"]) {
		const px = Number(side === "top" ? payload?.top ?? payload?.value : payload?.bottom);
		if (Number.isFinite(px)) document.documentElement.style.setProperty(CSS_VARS[side], `${px}px`);
	}
}
var SPA_WEBVIEW_FLAG = "theme.is_spa_webview";
function useNativeSpaWebview() {
	(0, import_react.useEffect)(() => whenSallaReady(() => {
		if (!isNativeApp()) return;
		const config = getSallaSDK()?.config;
		if (config && config.get(SPA_WEBVIEW_FLAG) == null) config.set(SPA_WEBVIEW_FLAG, true);
	}), []);
}
var navigationSetups = {
	tanstack: (0, import_react.lazy)(() => import("./navigation-DT6HXCUG-B-R0WY9w.js").then((m) => ({ default: m.NavigationSetup }))),
	nextjs: (0, import_react.lazy)(() => import("./navigation-FTU3OC4V-C88oO_VF.js").then((m) => ({ default: m.NavigationSetup })))
};
var routeDocumentSyncs = { tanstack: (0, import_react.lazy)(() => import("./document-class-4DT4LTK5-Dm8uynV0.js").then((m) => ({ default: m.TanStackDocumentSync }))) };
function normalizeDate(input) {
	if (!input) return /* @__PURE__ */ new Date();
	if (input instanceof Date) return input;
	if (typeof input === "number") return new Date(input);
	if (typeof input === "object" && "date" in input) return new Date(input.date);
	return new Date(input);
}
function useDate() {
	const { locale } = useTranslation();
	const format = (date, formatType = "medium") => {
		const dateObj = normalizeDate(date);
		const formatOptionsMap = {
			full: {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric"
			},
			long: {
				year: "numeric",
				month: "long",
				day: "numeric"
			},
			medium: {
				year: "numeric",
				month: "long",
				day: "numeric"
			},
			short: {
				year: "numeric",
				month: "short",
				day: "numeric"
			},
			time: {
				hour: "2-digit",
				minute: "2-digit"
			}
		};
		try {
			return new Intl.DateTimeFormat(locale, formatOptionsMap[formatType]).format(dateObj);
		} catch {
			return dateObj.toLocaleDateString(locale);
		}
	};
	const ago = (date) => {
		const dateObj = normalizeDate(date);
		const diffInSeconds = Math.floor((Date.now() - dateObj.getTime()) / 1e3);
		for (const { unit, threshold, divisor } of [
			{
				unit: "year",
				threshold: 31536e3,
				divisor: 31536e3
			},
			{
				unit: "month",
				threshold: 2592e3,
				divisor: 2592e3
			},
			{
				unit: "week",
				threshold: 604800,
				divisor: 604800
			},
			{
				unit: "day",
				threshold: 86400,
				divisor: 86400
			},
			{
				unit: "hour",
				threshold: 3600,
				divisor: 3600
			},
			{
				unit: "minute",
				threshold: 60,
				divisor: 60
			},
			{
				unit: "second",
				threshold: 1,
				divisor: 1
			}
		]) if (diffInSeconds >= threshold) {
			const value = Math.floor(diffInSeconds / divisor);
			try {
				return new Intl.RelativeTimeFormat(locale, {
					numeric: "auto",
					style: "long"
				}).format(-value, unit);
			} catch {
				return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-value, unit);
			}
		}
		return locale.startsWith("ar") ? "الآن" : "just now";
	};
	return {
		format,
		ago,
		now: /* @__PURE__ */ new Date()
	};
}
var ARABIC_NUMERALS = [
	"٠",
	"١",
	"٢",
	"٣",
	"٤",
	"٥",
	"٦",
	"٧",
	"٨",
	"٩"
];
var toArabic = (input) => {
	return String(input).replace(/[0-9]/g, (d) => ARABIC_NUMERALS[parseInt(d)]);
};
function useNumber() {
	const { store } = useTwilight();
	const useArabicNumerals = store?.settings?.arabic_numbers_enabled ?? false;
	const format = (number) => {
		return useArabicNumerals ? toArabic(number) : String(number);
	};
	return {
		/** Format number with store settings */
		format,
		/** Convert to Arabic numerals */
		toArabic,
		/** Whether Arabic numerals are enabled */
		useArabicNumerals
	};
}
var ARABIC_NUMERALS2 = [
	"٠",
	"١",
	"٢",
	"٣",
	"٤",
	"٥",
	"٦",
	"٧",
	"٨",
	"٩"
];
function toArabicNumerals(input) {
	return String(input).replace(/[0-9]/g, (d) => ARABIC_NUMERALS2[parseInt(d)]);
}
var SAR_SYMBOLS = ["SAR", "ر.س"];
var parse = (moneyString) => {
	const normalized = moneyString.replace(/[^\d.,٬٫]/g, "").replace(/٬/g, "").replace(/٫/g, ".");
	const parts = normalized.split(/[.,]/);
	if (parts.length > 2) return parseFloat(`${parts.slice(0, -1).join("")}.${parts[parts.length - 1]}`);
	return parseFloat(normalized.replace(/,/g, ""));
};
var isValid = (value) => {
	if (typeof value === "number" && !isNaN(value) && isFinite(value)) return true;
	if (typeof value === "string") {
		const parsed = parseFloat(value);
		return !isNaN(parsed) && isFinite(parsed);
	}
	return false;
};
function useMoney() {
	const { store, settings, currency: active } = useTwilight();
	const useArabicNumerals = store?.settings?.arabic_numbers_enabled ?? false;
	const useSarSymbol = store?.settings?.use_sar_symbol ?? false;
	const format = (amount, options) => {
		const currency = options?.currency ?? active?.code ?? "SAR";
		const type = options?.type ?? "product";
		if (amount == null || amount === "") return (type === "product" ? store?.settings?.product?.show_price_as_dash : false) ? "-" : "";
		if (typeof amount === "string" && amount === "-") return amount;
		if (isNaN(typeof amount === "string" ? parseFloat(amount) : amount)) return String(amount);
		const number = useArabicNumerals ? toArabicNumerals(amount).replace(".", "٫") : String(amount);
		const symbol = settings?.currencies?.[currency]?.symbol ?? currency;
		if (useSarSymbol && SAR_SYMBOLS.includes(symbol)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			number,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-sar" })
		] });
		return `${number} ${symbol}`;
	};
	return {
		format,
		parse,
		isValid
	};
}
var DAYS = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday"
];
var DAY_NAMES = {
	monday: "common.days.monday",
	tuesday: "common.days.tuesday",
	wednesday: "common.days.wednesday",
	thursday: "common.days.thursday",
	friday: "common.days.friday",
	saturday: "common.days.saturday",
	sunday: "common.days.sunday"
};
var TIME_NAMES = {
	AM: "common.time.am",
	PM: "common.time.pm"
};
function parseTime(timeStr) {
	const match = timeStr.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/);
	if (!match) return 0;
	let hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	const meridiem = match[3];
	if (meridiem === "pm" && hours < 12) hours += 12;
	else if (meridiem === "am" && hours === 12) hours = 0;
	return hours * 60 + minutes;
}
function parseRanges(ranges) {
	return ranges.map((range) => {
		const parts = range.split("-").map((s) => s.trim());
		if (parts.length !== 2) return null;
		return {
			start: parseTime(parts[0]),
			end: parseTime(parts[1])
		};
	}).filter((r) => r !== null && r.start < r.end);
}
function indexToDay(index) {
	return DAYS[index % 7];
}
function getDayIndex(date) {
	const jsDay = date.getDay();
	return jsDay === 0 ? 6 : jsDay - 1;
}
function getTimeInMinutes(date) {
	return date.getHours() * 60 + date.getMinutes();
}
function isInRanges(time, ranges) {
	return ranges.some((range) => time >= range.start && time < range.end);
}
function findNextRange(time, ranges) {
	return [...ranges].sort((a, b) => a.start - b.start).find((range) => range.start > time) ?? null;
}
function useOpeningHours(settings) {
	const { t } = useTranslation();
	return (0, import_react.useMemo)(() => {
		if (!settings?.enabled || !settings?.hours) return {
			isOpen: true,
			isEnabled: false,
			nextOpen: null,
			nextOpenFormatted: ""
		};
		const hours = settings.hours;
		const now = /* @__PURE__ */ new Date();
		const currentDayIndex = getDayIndex(now);
		const currentTime = getTimeInMinutes(now);
		const schedule = {};
		for (const day of DAYS) {
			const dayRanges = hours[day];
			schedule[day] = { ranges: dayRanges ? parseRanges(dayRanges) : [] };
		}
		const todaySchedule = schedule[indexToDay(currentDayIndex)];
		if (isInRanges(currentTime, todaySchedule.ranges)) return {
			isOpen: true,
			isEnabled: true,
			nextOpen: null,
			nextOpenFormatted: ""
		};
		const nextRangeToday = findNextRange(currentTime, todaySchedule.ranges);
		if (nextRangeToday) {
			const nextOpen = new Date(now);
			nextOpen.setHours(Math.floor(nextRangeToday.start / 60), nextRangeToday.start % 60, 0, 0);
			return {
				isOpen: false,
				isEnabled: true,
				nextOpen,
				nextOpenFormatted: formatNextOpen(nextOpen, t)
			};
		}
		for (let i = 1; i <= 7; i++) {
			const nextDaySchedule = schedule[indexToDay((currentDayIndex + i) % 7)];
			if (nextDaySchedule.ranges.length > 0) {
				const firstRange = [...nextDaySchedule.ranges].sort((a, b) => a.start - b.start)[0];
				const nextOpen = new Date(now);
				nextOpen.setDate(nextOpen.getDate() + i);
				nextOpen.setHours(Math.floor(firstRange.start / 60), firstRange.start % 60, 0, 0);
				return {
					isOpen: false,
					isEnabled: true,
					nextOpen,
					nextOpenFormatted: formatNextOpen(nextOpen, t)
				};
			}
		}
		return {
			isOpen: true,
			isEnabled: true,
			nextOpen: null,
			nextOpenFormatted: ""
		};
	}, [settings, t]);
}
function formatNextOpen(date, t) {
	const dayName = t(DAY_NAMES[indexToDay(getDayIndex(date))]);
	const hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const isPM = hours >= 12;
	return `${dayName} ${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}:${minutes} ${t(TIME_NAMES[isPM ? "PM" : "AM"])}`;
}
function usePageConfig(pageData) {
	const pageDataRef = (0, import_react.useRef)(pageData);
	pageDataRef.current = pageData;
	(0, import_react.useEffect)(() => whenSallaLoaded((salla) => {
		if (!salla.config?.set) return;
		const current = pageDataRef.current;
		if (!current) return;
		const url = current.url ?? window.location.pathname + window.location.search;
		salla.config.set("page", {
			...current,
			url
		});
	}), []);
}
var BREADCRUMB_REFERRER_KEY = "breadcrumb-referrer";
function getBreadcrumbReferrer() {
	try {
		const raw = sessionStorage.getItem(BREADCRUMB_REFERRER_KEY);
		if (!raw) return null;
		const { name, url } = JSON.parse(raw);
		return typeof name === "string" && typeof url === "string" ? {
			name,
			url
		} : null;
	} catch {
		return null;
	}
}
function setBreadcrumbReferrer(breadcrumb) {
	try {
		sessionStorage.setItem(BREADCRUMB_REFERRER_KEY, JSON.stringify(breadcrumb));
	} catch {}
}
function useBreadcrumbs(page) {
	const location = useLocation();
	const isHome = useIsHome();
	const { t } = useTranslation();
	const [referrerCrumb, setReferrerCrumb] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (page?.slug === "product.single") {
			const ref = getBreadcrumbReferrer();
			if (ref) setReferrerCrumb(ref);
			return;
		}
		setReferrerCrumb(null);
		if (!isHome && page) setBreadcrumbReferrer({
			name: page.title,
			url: location.pathname + location.searchStr
		});
	}, [
		page,
		isHome,
		location.pathname,
		location.searchStr
	]);
	return (0, import_react.useMemo)(() => {
		if (!page) return [];
		if (page.breadcrumbs?.length) {
			if (page.slug === "product.single" && referrerCrumb) {
				const last = page.breadcrumbs.at(-1);
				return last ? [
					page.breadcrumbs[0],
					referrerCrumb,
					last
				] : page.breadcrumbs;
			}
			return page.breadcrumbs;
		}
		if (isHome) return [];
		return [{
			name: t("common.titles.home"),
			url: "/"
		}, {
			name: page.title,
			url: location.pathname
		}];
	}, [
		isHome,
		location.pathname,
		page,
		t,
		referrerCrumb
	]);
}
var FAST_CHECKOUT_SCRIPT_ID = "fast-checkout-js";
var FAST_CHECKOUT_SCRIPT_URL = "https://cdn.assets.salla.network/prod/@salla.sa/fast-checkout-widget/v0.0.47/widget.esm.js";
var fastCheckoutScript = () => ({
	type: "module",
	src: FAST_CHECKOUT_SCRIPT_URL
});
function injectFastCheckoutScript() {
	if (document.querySelector(`script[src="${FAST_CHECKOUT_SCRIPT_URL}"]`)) return;
	const s = document.createElement("script");
	Object.assign(s, fastCheckoutScript());
	document.head.appendChild(s);
}
var GoogleTagBody = (0, import_react.lazy)(() => import("./GoogleTag-Y6N4BOCW-DcbcxS07.js").then((m) => ({ default: m.GoogleTagBody })));
var TwilightBundles = (0, import_react.lazy)(() => import("./TwilightBundles-G6GHWBID-CDuPT8xP.js").then((m) => ({ default: m.TwilightBundles })));
var LazySiftSnippet = (0, import_react.lazy)(() => import("./SiftSnippet-5FCU6TR6-XDG612fO.js").then((m) => ({ default: m.SiftSnippet })));
var LazyStoreClosedNotification = (0, import_react.lazy)(() => import("./StoreClosedNotification-3FYHHAIP-DyT2nTff.js").then((m) => ({ default: m.StoreClosedNotification })));
var LazyPriceQuoteButton = (0, import_react.lazy)(() => import("./PriceQuoteButton-CGRNHY3E-B2dMm0ZJ.js").then((m) => ({ default: m.PriceQuoteButton })));
var LazyPreOrderNotification = (0, import_react.lazy)(() => import("./PreOrderNotification-OP57EA6F-C9p9s_Iu.js").then((m) => ({ default: m.PreOrderNotification })));
function gtmHandler({ twilight }) {
	if (!twilight?.store?.settings?.keys?.gtm?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleTagBody, { gtmIds: twilight.store.settings.keys.gtm })
	});
}
function useSiftHandler({ twilight }) {
	const { data: user } = useUser();
	if (!twilight?.store?.settings?.keys?.sift) return null;
	const customerId = user?.type === "user" && user.id ? String(user.id) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazySiftSnippet, {
			beaconKey: twilight.store.settings.keys.sift,
			customerId
		})
	});
}
function storeClosedHandler({ twilight }) {
	if (!twilight?.store?.settings?.opening_hours?.enabled) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyStoreClosedNotification, {})
	});
}
function FastCheckoutTag() {
	(0, import_react.useEffect)(() => {
		if (typeof window.requestIdleCallback === "function") {
			const id2 = window.requestIdleCallback(injectFastCheckoutScript);
			return () => window.cancelIdleCallback(id2);
		}
		const id = window.setTimeout(injectFastCheckoutScript, 2e3);
		return () => window.clearTimeout(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		id: FAST_CHECKOUT_SCRIPT_ID,
		type: "module"
	});
}
function fastCheckoutHandler({ twilight }) {
	if (!twilight?.store?.settings?.buy_now) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastCheckoutTag, {});
}
function bundlesHandler() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TwilightBundles, {})
	});
}
function priceQuoteHandler({ twilight }) {
	if (!twilight?.store?.settings?.features?.price_quote) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyPriceQuoteButton, {})
	});
}
function preOrderNotificationHandler({ twilight, cartItems }) {
	if (!twilight?.store?.settings?.features?.["pre-order-campaigns"]) return null;
	if (!cartItems?.some((item) => !item.parent_id && item.has_pre_order_campaign)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyPreOrderNotification, {})
	});
}
function registerDefaultHooks() {
	hookRegistry.register("body:start", gtmHandler, 100);
	hookRegistry.register("body:start", useSiftHandler, 90);
	hookRegistry.register("body:start", storeClosedHandler, 80);
	hookRegistry.register("body:end", bundlesHandler, 100);
	hookRegistry.register("body:end", fastCheckoutHandler, 90);
	hookRegistry.register("cart:submit.start", priceQuoteHandler, 100);
	hookRegistry.register("cart:items.start", preOrderNotificationHandler, 100);
}
registerDefaultHooks();
var SallaLoginModal = (0, import_react.lazy)(() => import("./salla-login-modal-xfelt2zr.js").then((m) => ({ default: m.SallaLoginModal })));
var SallaScopes = (0, import_react.lazy)(() => import("./salla-scopes-CdyYzsG_.js").then((m) => ({ default: m.SallaScopes })));
var SallaOfferModal = (0, import_react.lazy)(() => import("./salla-offer-modal-0tr9EEqL.js").then((m) => ({ default: m.SallaOfferModal })));
function MasterLayout({ children }) {
	const { store } = useTwilight();
	const { isLoggedIn } = useUser();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "app-inner flex flex-col min-h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					id: "main-content",
					role: "main",
					className: "flex-1",
					children
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaOfferModal, {}) }),
		!isLoggedIn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaLoginModal, {
			isEmailAllowed: store?.settings?.auth?.email_allowed,
			isMobileAllowed: store?.settings?.auth?.mobile_allowed,
			suppressHydrationWarning: true
		}) }),
		store?.scope && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaScopes, {
			selection: store?.scope?.display_as === "popup" ? "mandatory" : "optional",
			suppressHydrationWarning: true
		}) })
	] });
}
var READY_TIMEOUT_MS = 2500;
var injected = false;
function injectHtml(html, target) {
	const tpl = document.createElement("template");
	tpl.innerHTML = html;
	tpl.content.querySelectorAll("script").forEach((inert) => {
		if (inert.type === "importmap") {
			inert.remove();
			return;
		}
		const script = document.createElement("script");
		for (const attr of Array.from(inert.attributes)) script.setAttribute(attr.name, attr.value);
		script.text = inert.text;
		inert.replaceWith(script);
	});
	target.appendChild(tpl.content);
}
function resolveCustomerParams(content, params) {
	if (!params?.length) return content;
	for (const param of params) {
		if (!param.startsWith("customer.")) continue;
		const value = String(window.salla?.config?.get(param.replace(/^customer\./, "user.")) ?? "");
		const escaped = param.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const placeholder = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "g");
		content = content.replace(placeholder, () => value);
	}
	return content;
}
var timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var waitForSdk = () => {
	const ready = window.salla?.onReady();
	return ready ? Promise.race([ready, timeout(READY_TIMEOUT_MS)]) : Promise.resolve();
};
function withDeferredOnReady(inject) {
	const sdk = window.salla;
	const onReady = sdk?.onReady;
	if (!sdk || typeof onReady !== "function") return inject();
	const queued = [];
	sdk.onReady = (callback) => new Promise((resolve, reject) => {
		queued.push(() => onReady.call(sdk, callback).then(resolve, reject));
	});
	try {
		inject();
	} finally {
		sdk.onReady = onReady;
	}
	queued.forEach((run) => run());
}
function mountSnippets(owned, clientSnippets, buckets) {
	applyThemeHookSlots();
	installAppScope({ apps: buckets });
	const unresolved = /* @__PURE__ */ new Set();
	for (const s of owned) if (s.url && !(s.appScopeId in buckets)) unresolved.add(s.appScopeId);
	withDeferredOnReady(() => {
		for (const snippet of clientSnippets) {
			const target = snippet.place?.includes("head") ? document.head : document.body;
			try {
				injectHtml(resolveCustomerParams(snippet.content, snippet.customer_parameters), target);
			} catch (error) {
				console.error(`[salla] failed to inject snippet for app ${snippet.appScopeId}`, error);
			}
		}
	});
	if (unresolved.size) console.warn(`[salla] app settings missing for ${unresolved.size} app(s); their snippets ran without app.* config`, [...unresolved]);
}
function AppsSnippets() {
	const ssrSnippets = getTwilightContext().appsSnippets;
	const { data: fallbackSnippets } = useQuery({
		...apps.queries.snippets(),
		enabled: !ssrSnippets,
		retry: 2
	});
	const data = ssrSnippets ?? fallbackSnippets;
	const { data: settings, isSuccess, isError } = useQuery({
		...apps.queries.settings(),
		retry: 2
	});
	const settingsSettled = isSuccess || isError;
	const owned = (0, import_react.useMemo)(() => (data ?? []).filter((app) => app.status === "enabled").flatMap((app) => app.snippets.map((s) => ({
		...s,
		appScopeId: app.id ?? `unresolved-${app.app_id}`
	}))), [data]);
	const ssrCdnScripts = (0, import_react.useMemo)(() => owned.filter((s) => s.url).map((s, i) => ({
		key: `${s.appScopeId}:${s.id ?? i}`,
		url: s.url,
		snippetId: s.id,
		appScopeId: s.appScopeId
	})), [owned]);
	(0, import_react.useEffect)(() => {
		if (injected || !data || !settingsSettled) return;
		injected = true;
		const clientSnippets = owned.filter((s) => !s.url);
		waitForSdk().then(() => mountSnippets(owned, clientSnippets, settings?.apps ?? {}));
	}, [
		data,
		owned,
		settings,
		settingsSettled
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: ssrCdnScripts.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		src: s.url,
		defer: true,
		"data-scope-id": s.appScopeId,
		"data-snippet-id": s.snippetId != null ? String(s.snippetId) : ""
	}, s.key)) });
}
function SallaSdkScripts({ settings }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		id: "salla-sdk",
		type: "module",
		src: resolveTwilightSdkUrl(settings)
	}), settings?.store?.settings?.ticketing_system_enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
		id: "salla-ticketing-script",
		type: "module",
		src: "https://cdn.assets.salla.network/latest/@salla.sa/ui-store-ticketing-system/ticketing-system.es.js"
	})] });
}
(0, import_react.lazy)(() => import("./StoreClosedNotification-3FYHHAIP-DyT2nTff.js").then((m) => ({ default: m.StoreClosedNotification })));
var LazyMaintenancePage = (0, import_react.lazy)(() => import("./MaintenancePage-A7CNHM7B-CyfvRP2-.js").then((m) => ({ default: m.MaintenancePage })));
var LazyLiveEditorBar = (0, import_react.lazy)(() => import("./LiveEditorBar-4AWOAJYX-_2HEH_VG.js").then((m) => ({ default: m.LiveEditorBar })));
function LiveEditor() {
	const [frame, setFrame] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const found = editorFrame();
		if (!found) return;
		setFrame(found);
		if (found.dev) return;
		const announce = () => postToEditor(found.origin, FRAME_LOADED_ACTION);
		if (document.readyState === "complete") {
			announce();
			return;
		}
		window.addEventListener("load", announce, { once: true });
		return () => window.removeEventListener("load", announce);
	}, []);
	if (!frame) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: null,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyLiveEditorBar, {
			origin: frame.origin,
			dev: frame.dev
		})
	});
}
var getSalla2 = () => typeof window !== "undefined" ? window.salla : void 0;
var TWILIGHT_LOG_STYLES = {
	header: "background: linear-gradient(90deg, #7c3aed, #6366f1); color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;",
	error: "background: #dc2626; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
	warn: "background: #f59e0b; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
	info: "background: #3b82f6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;",
	label: "color: #7c3aed; font-weight: bold;",
	value: "color: inherit;"
};
function currentSettings() {
	return hasTwilightSettings() ? getTwilightContext().settings : void 0;
}
function currentMaintenance() {
	return hasTwilightSettings() && getTwilightContext().maintenance;
}
function TwilightProvider({ children, debug = false, skeleton, translations: themeTranslations, onReady, onError, client = {
	framework: "tanstack",
	interceptLinks: true
}, toast = true, toastMobilePosition = "bottom-center", addToCartToast = true, routeClass = true, layout: LayoutComponent = MasterLayout, maintenancePage: MaintenancePageComponent = LazyMaintenancePage }) {
	const ctx = getTwilightContext();
	const initialLocale = ctx.locale || "ar";
	const initialData = (0, import_react.useSyncExternalStore)(subscribeTwilight, currentSettings, currentSettings);
	const maintenance = (0, import_react.useSyncExternalStore)(subscribeTwilight, currentMaintenance, currentMaintenance);
	const [authToken, setAuthToken] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") return ctx.authToken ?? window.localStorage.getItem("token");
		return null;
	});
	useNativeSafeArea();
	useNativeSpaWebview();
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		let unbind;
		const cancel = whenSallaLoaded((sdk) => {
			const writeAuthCookie = (token) => {
				document.cookie = `${AUTH_TOKEN_COOKIE_NAME}=${token}; path=/; max-age=2592000; SameSite=Lax; Secure`;
			};
			const clearAuthCookie = clearAuthTokenCookie;
			const setSdkUserType = (type) => {
				sdk.config?.set?.("user.type", type);
			};
			const handleLogin = () => {
				const newToken = sdk.storage.get(AUTH_TOKEN_COOKIE_NAME);
				if (!newToken) return;
				setAuthToken(newToken);
				updateTwilightContext({ authToken: newToken });
				setSdkUserType("user");
			};
			const handleTokenFetched = (token) => {
				if (typeof token !== "string" || !token) return;
				setAuthToken(token);
				updateTwilightContext({ authToken: token });
				writeAuthCookie(token);
				setSdkUserType("user");
			};
			const handleLogout = () => {
				const wasLoggedIn = Boolean(getTwilightContext().authToken);
				setAuthToken(null);
				updateTwilightContext({ authToken: null });
				setSdkUserType("guest");
				try {
					clearAuthCookie();
				} catch {}
				if (wasLoggedIn) window.setTimeout(() => window.location.reload(), 3500);
			};
			const handleTokenInvalid = () => {
				setAuthToken(null);
				updateTwilightContext({ authToken: null });
				setSdkUserType("guest");
				try {
					window.localStorage.removeItem(AUTH_TOKEN_COOKIE_NAME);
					sdk.storage.remove?.(AUTH_TOKEN_COOKIE_NAME);
					clearAuthCookie();
				} catch {}
			};
			const listeners = [
				["auth::logged.in", handleLogin],
				["auth::logged.out", handleLogout],
				["auth::token.invalid", handleTokenInvalid],
				["auth::token.fetched", handleTokenFetched],
				["api::token.injected", handleTokenFetched]
			];
			listeners.forEach(([name, listener]) => sdk.event.on(name, listener));
			unbind = () => listeners.forEach(([name, listener]) => sdk.event.off(name, listener));
		});
		return () => {
			cancel();
			unbind?.();
		};
	}, []);
	const { isReady, storeData, setStoreData, themeData, currency, isMobileWebview } = useTwilightInit({
		debug,
		initialData,
		onReady,
		onError,
		initialLocale
	});
	const [inEditor, setInEditor] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setInEditor(editorFrame() !== null), []);
	const theme = (0, import_react.useMemo)(() => inEditor ? previewTheme(themeData) : themeData, [inEditor, themeData]);
	const storeId = storeData?.id;
	(0, import_react.useEffect)(() => rememberDevStoreId(storeId), [storeId]);
	const config = (0, import_react.useMemo)(() => ({ debug }), [debug]);
	const log = (0, import_react.useMemo)(() => ({
		groupCollapsed: (title) => console.groupCollapsed(`%c \u26A1 Twilight: ${title} `, TWILIGHT_LOG_STYLES.header),
		group: (title) => console.group(`%c${title}`, TWILIGHT_LOG_STYLES.label),
		groupEnd: () => console.groupEnd(),
		error: (label, value) => console.log(`%c[${label}]%c`, TWILIGHT_LOG_STYLES.error, TWILIGHT_LOG_STYLES.value, value),
		warn: (label, value) => console.log(`%c[${label}]%c`, TWILIGHT_LOG_STYLES.warn, TWILIGHT_LOG_STYLES.value, value),
		info: (label, value) => console.log(`%c[${label}]%c`, TWILIGHT_LOG_STYLES.info, TWILIGHT_LOG_STYLES.value, value),
		label: (label, value) => console.log(`%c[${label}]%c`, TWILIGHT_LOG_STYLES.label, TWILIGHT_LOG_STYLES.value, value),
		dir: (label, value) => {
			console.log(`%c${label}`, TWILIGHT_LOG_STYLES.label);
			console.dir(value);
		},
		trace: (label, trace) => {
			console.log(`%c${label}`, TWILIGHT_LOG_STYLES.label);
			console.error(trace);
		}
	}), []);
	const contextValue = (0, import_react.useMemo)(() => ({
		isReady,
		store: storeData,
		_setStore: setStoreData,
		theme,
		currency,
		config,
		log,
		get salla() {
			return getSalla2();
		},
		get settings() {
			return getTwilightContext().settings;
		},
		get locale() {
			return getTwilightContext().locale;
		},
		get routeId() {
			return getTwilightContext().routeId;
		},
		get location() {
			return getTwilightContext().location;
		},
		get authToken() {
			return authToken;
		},
		get i18n() {
			return getTwilightContext().i18n;
		},
		get dir() {
			return getTwilightContext().dir;
		},
		get extras() {
			return getTwilightContext().extras;
		}
	}), [
		isReady,
		storeData,
		setStoreData,
		theme,
		currency,
		config,
		log,
		authToken
	]);
	const framework = client !== false ? client?.framework ?? "tanstack" : null;
	const LazyNavSetup = framework ? navigationSetups[framework] : null;
	const LazyDocumentSync = routeClass && framework ? routeDocumentSyncs[framework] : null;
	const interceptLinks = client !== false && (client?.interceptLinks ?? true);
	const documentSyncElement = (0, import_react.useMemo)(() => LazyDocumentSync ? import_react.createElement(LazyDocumentSync) : null, [LazyDocumentSync]);
	const readyShell = (0, import_react.useMemo)(() => {
		if (!isReady) return null;
		return {
			LayoutComponent,
			MaintenancePageComponent,
			LazyNavSetup,
			toast,
			toastMobilePosition,
			addToCartToast,
			interceptLinks
		};
	}, [
		isReady,
		LazyNavSetup,
		LayoutComponent,
		MaintenancePageComponent,
		toast,
		toastMobilePosition,
		addToCartToast,
		interceptLinks
	]);
	const readyContent = (0, import_react.useMemo)(() => {
		if (!readyShell) return null;
		if (maintenance) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(readyShell.MaintenancePageComponent, {})
		}), false] });
		const inner = readyShell.LayoutComponent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(readyShell.LayoutComponent, { children }) : children;
		const wrapped = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetHead, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "body:start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
				fallback: null,
				children: [readyShell.toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					mobilePosition: readyShell.toastMobilePosition,
					addToCartToast: readyShell.addToCartToast
				}), readyShell.interceptLinks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationInterceptor, {})]
			}),
			inner,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaSdkScripts, { settings: initialData }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppsSnippets, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "body:end" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveEditor, {})
		] });
		if (readyShell.LazyNavSetup) return import_react.createElement(readyShell.LazyNavSetup, null, wrapped);
		return wrapped;
	}, [readyShell, maintenance]);
	const i18nInstance = (0, import_react.useMemo)(() => getTwilightContext().i18n, [initialLocale]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentClassProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TwilightContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(I18nProvider, {
			i18nInstance,
			themeTranslations,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeDocumentSync, {
					theme,
					locale: initialLocale,
					direction: getTwilightContext().dir,
					isMobileWebview
				}),
				documentSyncElement,
				!isReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "loading-overlay",
					children: skeleton || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "loading-spinner" })
				}),
				readyContent
			]
		})
	}) });
}
function useStore() {
	const { store, _setStore, salla } = useTwilight();
	const refresh = (0, import_react.useCallback)(async () => {
		if (!salla) return;
		try {
			const data = salla.config.all();
			if (data?.store && typeof data.store === "object") _setStore((prev) => ({
				...prev,
				...data.store
			}));
		} catch {}
	}, [salla, _setStore]);
	return {
		...store,
		refresh
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-BK5TBUGG.js
function useComments() {
	const [commentsKey, setCommentsKey] = (0, import_react.useState)(0);
	const refresh = (0, import_react.useCallback)(() => {
		setCommentsKey((prev) => prev + 1);
	}, []);
	(0, import_react.useEffect)(() => {
		const handleCommentAdded = () => {
			setCommentsKey((prev) => prev + 1);
		};
		return onSallaEvent("comment::added", handleCommentAdded);
	}, []);
	return {
		commentsKey,
		refresh
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-MVT5AF2A.js
var HookName = /* @__PURE__ */ ((HookName2) => {
	HookName2["BODY_START"] = "body:start";
	HookName2["BODY_END"] = "body:end";
	HookName2["BODY_INNER"] = "body:inner";
	HookName2["HEAD_START"] = "head:start";
	HookName2["HEAD_END"] = "head:end";
	HookName2["HEAD_INNER"] = "head:inner";
	HookName2["HEADER_START"] = "header:start";
	HookName2["HEADER_END"] = "header:end";
	HookName2["FOOTER_START"] = "footer:start";
	HookName2["FOOTER_END"] = "footer:end";
	HookName2["PRODUCT_DESCRIPTION_START"] = "product:single.description.start";
	HookName2["PRODUCT_DESCRIPTION"] = "product:single.description";
	HookName2["PRODUCT_DESCRIPTION_END"] = "product:single.description.end";
	HookName2["PRODUCT_FORM_START"] = "product:single.form.start";
	HookName2["PRODUCT_FORM_END"] = "product:single.form.end";
	HookName2["CART_ITEMS_START"] = "cart:items.start";
	HookName2["CART_ITEMS_END"] = "cart:items.end";
	HookName2["CART_SUMMARY_START"] = "cart:summary.start";
	HookName2["CART_SUMMARY_END"] = "cart:summary.end";
	HookName2["SEARCH_START"] = "search:start";
	HookName2["SEARCH_ITEMS_START"] = "search:items.start";
	HookName2["SEARCH_ITEMS_END"] = "search:items.end";
	HookName2["SEARCH_END"] = "search:end";
	HookName2["HOMEPAGE_SLIDER"] = "homepage:slider";
	HookName2["HOMEPAGE_BANNERS"] = "homepage:banners";
	HookName2["HOMEPAGE_FEATURED"] = "homepage:featured";
	HookName2["HEAD"] = "head";
	HookName2["COPYRIGHT"] = "copyright";
	HookName2["HOME_START"] = "home:start";
	HookName2["HOME_CONTENT"] = "home:content";
	HookName2["HOME_END"] = "home:end";
	HookName2["NOTFOUND_START"] = "notfound:start";
	HookName2["NOTFOUND_CONTENT"] = "notfound:content";
	HookName2["NOTFOUND_END"] = "notfound:end";
	HookName2["PRODUCT_START"] = "product:start";
	HookName2["PRODUCT_DETAILS_START"] = "product:details.start";
	HookName2["PRODUCT_DETAILS_END"] = "product:details.end";
	HookName2["PRODUCT_RELATED_START"] = "product:related.start";
	HookName2["PRODUCT_RELATED_END"] = "product:related.end";
	HookName2["PRODUCT_END"] = "product:end";
	HookName2["PRODUCT_LIST_START"] = "product:list.start";
	HookName2["PRODUCT_LIST_ITEMS_START"] = "product:list.items.start";
	HookName2["PRODUCT_LIST_ITEMS_END"] = "product:list.items.end";
	HookName2["PRODUCT_LIST_END"] = "product:list.end";
	HookName2["CART_START"] = "cart:start";
	HookName2["CART_END"] = "cart:end";
	HookName2["CART_SUBMIT_START"] = "cart:submit.start";
	HookName2["CART_SUBMIT_END"] = "cart:submit.end";
	HookName2["THANK_YOU_START"] = "thank-you:start";
	HookName2["THANK_YOU_ITEMS_START"] = "thank-you:items.start";
	HookName2["THANK_YOU_ITEMS_END"] = "thank-you:items.end";
	HookName2["THANK_YOU_END"] = "thank-you:end";
	HookName2["BRANDS_INDEX_ITEMS_START"] = "brands:index.items.start";
	HookName2["BRANDS_INDEX_ITEMS_END"] = "brands:index.items.end";
	HookName2["BLOG_START"] = "blog:start";
	HookName2["BLOG_ITEMS_START"] = "blog:items.start";
	HookName2["BLOG_ITEMS_END"] = "blog:items.end";
	HookName2["BLOG_END"] = "blog:end";
	HookName2["BLOG_SINGLE_START"] = "blog:single.start";
	HookName2["BLOG_SINGLE_END"] = "blog:single.end";
	HookName2["BLOG_SINGLE_RELATED_START"] = "blog:single.related.start";
	HookName2["BLOG_SINGLE_RELATED_END"] = "blog:single.related.end";
	HookName2["BLOG_CATEGORY_START"] = "blog:category.start";
	HookName2["BLOG_CATEGORY_END"] = "blog:category.end";
	HookName2["BLOG_TAG_START"] = "blog:tag.start";
	HookName2["BLOG_TAG_END"] = "blog:tag.end";
	HookName2["BLOG_AUTHOR_START"] = "blog:author.start";
	HookName2["BLOG_AUTHOR_END"] = "blog:author.end";
	HookName2["CUSTOMER_PROFILE_START"] = "customer:profile.start";
	HookName2["CUSTOMER_PROFILE_FORM_START"] = "customer:profile.form.start";
	HookName2["CUSTOMER_PROFILE_FORM_END"] = "customer:profile.form.end";
	HookName2["CUSTOMER_PROFILE_END"] = "customer:profile.end";
	HookName2["CUSTOMER_SETTINGS_START"] = "customer:settings.start";
	HookName2["CUSTOMER_SETTINGS_END"] = "customer:settings.end";
	HookName2["CUSTOMER_ORDERS_ITEMS_START"] = "customer:orders.index.items.start";
	HookName2["CUSTOMER_ORDERS_ITEMS_END"] = "customer:orders.index.items.end";
	HookName2["CUSTOMER_ORDER_DETAILS_START"] = "customer:orders.single.details.start";
	HookName2["CUSTOMER_ORDER_DETAILS_END"] = "customer:orders.single.details.end";
	HookName2["CUSTOMER_WALLET_TRANSACTIONS_START"] = "customer:wallet.transactions.start";
	HookName2["CUSTOMER_WALLET_TRANSACTIONS_END"] = "customer:wallet.transactions.end";
	HookName2["CUSTOMER_WISHLIST_ITEMS_START"] = "customer:wishlist.items.start";
	HookName2["CUSTOMER_WISHLIST_ITEMS_END"] = "customer:wishlist.items.end";
	HookName2["CUSTOMER_NOTIFICATIONS_ITEMS_START"] = "customer:notifications.items.start";
	HookName2["CUSTOMER_NOTIFICATIONS_ITEMS_END"] = "customer:notifications.items.end";
	HookName2["LOYALTY_START"] = "loyalty:start";
	HookName2["LOYALTY_END"] = "loyalty:end";
	return HookName2;
})(HookName || {});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-ZCH7W7DZ.js
var CDN_BASE = "https://cdn.assets.salla.network";
function cdn(url, width, height) {
	if (!url) return CDN_BASE;
	if (url.startsWith("https://")) return url;
	const cleanPath = url.replace(/^\/+/, "");
	if (!width && !height) return `${CDN_BASE}/${cleanPath}`;
	const transforms = ["fit=scale-down"];
	if (width) transforms.push(`width=${width}`);
	if (height) transforms.push(`height=${height}`);
	transforms.push("onerror=redirect", "format=auto");
	return `${CDN_BASE}/cdn-cgi/image/${transforms.join(",")}/${cleanPath}`;
}
function asset(path) {
	return `/assets/${path.replace(/^\/+/, "")}`;
}
function isPlaceholder(url) {
	return false;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-Z653O7MX.js
function useAsset() {
	return {
		asset,
		cdn,
		isPlaceholder
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-L4TQBWR7.js
function useProduct(initialProduct, options) {
	const [product, setProduct] = (0, import_react.useState)(initialProduct);
	const initialProductRef = (0, import_react.useRef)(initialProduct);
	(0, import_react.useEffect)(() => {
		initialProductRef.current = initialProduct;
	});
	const reload = (0, import_react.useCallback)(async () => {
		const salla = window.salla;
		if (!salla?.api?.product?.getDetails) return;
		try {
			const response = await salla.api.product.getDetails(String(product.id), ["images", "category"]);
			if (response?.success && response.data) setProduct(response.data);
		} catch {}
	}, [product.id]);
	(0, import_react.useEffect)(() => {
		setProduct(initialProductRef.current);
	}, [initialProduct.id, options?.isPreview]);
	(0, import_react.useEffect)(() => onSallaEvent("product:options.updated", reload), [reload]);
	(0, import_react.useEffect)(() => {
		const handlePriceUpdated = (res) => {
			const data = res.data;
			if (!data) return;
			setProduct((prev) => {
				const price = data.price ?? prev.price;
				const regularPrice = data.regular_price ?? prev.regular_price;
				const isOnSale = Boolean(data.has_sale_price) && regularPrice > price;
				return {
					...prev,
					price,
					sale_price: isOnSale ? price : prev.sale_price,
					regular_price: regularPrice,
					is_on_sale: isOnSale,
					starting_price: null,
					weight: data.weight || "",
					sku: data.sku === void 0 ? prev.sku : data.sku || "",
					barcode: data.barcode === void 0 ? prev.barcode : data.barcode || "",
					is_out_of_stock: false
				};
			});
		};
		return onSallaEvent("product::price.updated", handlePriceUpdated);
	}, []);
	(0, import_react.useEffect)(() => {
		const handlePriceFailed = () => {
			setProduct((prev) => ({
				...prev,
				is_out_of_stock: true
			}));
		};
		return onSallaEvent("product::price.updated.failed", handlePriceFailed);
	}, []);
	return {
		product,
		reload
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-7V36I5GT.js
var toAttribute = (value) => {
	if (value === null || value === void 0 || value === false) return null;
	return value === true ? "" : String(value);
};
function useHostAttributes(attributes) {
	const serialized = JSON.stringify(Object.entries(attributes).map(([name, value]) => [name, toAttribute(value)]));
	return (0, import_react.useCallback)((element) => {
		if (!element) return;
		for (const [name, value] of JSON.parse(serialized)) if (value === null) element.removeAttribute(name);
		else element.setAttribute(name, value);
	}, [serialized]);
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-6BZ5TKEV.js
function useMountedState() {
	const mountedRef = (0, import_react.useRef)(false);
	const get = (0, import_react.useCallback)(() => mountedRef.current, []);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);
	return get;
}
function useAsyncFn(fn, deps = [], initialState = { loading: false }) {
	const lastCallId = (0, import_react.useRef)(0);
	const isMounted = useMountedState();
	const [state, set] = (0, import_react.useState)(initialState);
	return [state, (0, import_react.useCallback)((...args) => {
		const callId = ++lastCallId.current;
		if (!state.loading) set((prevState) => ({
			...prevState,
			loading: true
		}));
		return fn(...args).then((value) => {
			if (isMounted() && callId === lastCallId.current) set({
				value,
				loading: false
			});
			return value;
		}, (error) => {
			if (isMounted() && callId === lastCallId.current) set({
				error,
				loading: false
			});
			return error;
		});
	}, deps)];
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-6WI7R2BD.js
function couponError(error, fallback) {
	if (!error) return null;
	const { response } = error;
	if (!response) return error.message;
	return response.data?.error?.message || fallback;
}
function useCoupon() {
	const { t } = useTranslation();
	const [value, setValue] = (0, import_react.useState)(null);
	const [applyState, applyFn] = useAsyncFn(async (code) => {
		if (!code.trim()) throw new Error("Please enter a coupon code");
		await window.salla?.cart.addCoupon(code.trim());
		setValue(code.trim());
	}, []);
	const [removeState, removeFn] = useAsyncFn(async () => {
		await window.salla?.cart.deleteCoupon();
		setValue(null);
	}, []);
	return {
		value,
		loading: applyState.loading || removeState.loading,
		error: couponError(applyState.error ?? removeState.error, t("pages.cart.coupon_application_error", "Could not apply the coupon")),
		apply: async (code) => !(await applyFn(code) instanceof Error),
		remove: async () => !(await removeFn() instanceof Error)
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-JGVEGQHJ.js
var WISHLIST_STORAGE_KEY = "salla::wishlist";
var ids = [];
var listeners = /* @__PURE__ */ new Set();
var subscribed = false;
function emitChange() {
	for (const listener of listeners) listener();
}
function subscribe(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function getSnapshot() {
	return ids;
}
var getServerSnapshot = () => [];
function persistIds() {
	try {
		localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
	} catch {}
}
function initFromStorage() {
	try {
		const sdkWishlist = window.salla?.storage?.get(WISHLIST_STORAGE_KEY, []);
		const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		ids = Array.isArray(sdkWishlist) && sdkWishlist.length > 0 ? sdkWishlist : parsed;
	} catch {}
}
function reloadFromStorage() {
	initFromStorage();
	emitChange();
}
function ensureSubscribed() {
	if (subscribed || typeof window === "undefined") return;
	subscribed = true;
	initFromStorage();
	whenSallaLoaded((salla) => {
		reloadFromStorage();
		if (!salla.wishlist?.event) return;
		salla.wishlist.event.onAdded((_event, id) => {
			if (ids.includes(id)) return;
			ids = [...ids, id];
			persistIds();
			emitChange();
		});
		salla.wishlist.event.onRemoved((_response, id) => {
			ids = ids.filter((itemId) => itemId !== id);
			persistIds();
			emitChange();
		});
	});
	onSallaEvent("wishlist::storage.synced", reloadFromStorage);
}
function toError(reason, fallback) {
	if (reason instanceof Error) return reason;
	if (typeof reason === "string") return new Error(reason);
	const message = reason?.message;
	return new Error(typeof message === "string" ? message : fallback);
}
function useWishlist() {
	ensureSubscribed();
	const storedIds = (0, import_react.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
	const { t } = useTranslation();
	const failed = t("common.errors.error_occurred", "Something went wrong");
	const [addState, addFn] = useAsyncFn(async (productId) => {
		const salla = window.salla;
		try {
			await salla?.wishlist.add(productId);
		} catch (reason) {
			throw toError(reason, failed);
		}
		if (!ids.includes(productId)) {
			ids = [...ids, productId];
			persistIds();
			emitChange();
		}
	}, [failed]);
	const [removeState, removeFn] = useAsyncFn(async (productId) => {
		const salla = window.salla;
		try {
			await salla?.wishlist.remove(productId);
		} catch (reason) {
			throw toError(reason, failed);
		}
		ids = ids.filter((id) => id !== productId);
		persistIds();
		emitChange();
	}, [failed]);
	const has = (0, import_react.useCallback)((productId) => storedIds.includes(productId), [storedIds]);
	const add = async (productId) => !(await addFn(productId) instanceof Error);
	const remove = async (productId) => !(await removeFn(productId) instanceof Error);
	const toggle = (0, import_react.useCallback)((productId) => has(productId) ? remove(productId) : add(productId), [
		has,
		addFn,
		removeFn
	]);
	return {
		ids: storedIds,
		count: storedIds.length,
		has,
		add,
		remove,
		toggle,
		loading: addState.loading || removeState.loading,
		error: (addState.error ?? removeState.error)?.message ?? null
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-OAMIDZKW.js
var LIKED_BLOGS_KEY = "liked_blogs";
function useBlogLike(blogId, initialCount = 0) {
	const [likedBlogs, setLikedBlogs] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const stored = localStorage.getItem(LIKED_BLOGS_KEY);
			if (stored) setLikedBlogs(JSON.parse(stored));
		} catch (_error) {}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(LIKED_BLOGS_KEY, JSON.stringify(likedBlogs));
		} catch (_error) {}
	}, [likedBlogs]);
	const [count, setCount] = (0, import_react.useState)(initialCount);
	const { t } = useTranslation();
	const active = likedBlogs.includes(blogId);
	const [addState, addFn] = useAsyncFn(async () => {
		const salla = window.salla;
		if (salla?.config?.isGuest?.()) {
			salla.notify.error(t("common.messages.must_login", "Please login first"));
			return;
		}
		await salla?.api.request(`blogs/${blogId}/like`, {}, "put");
		setLikedBlogs((prev) => prev.includes(blogId) ? prev : [...prev, blogId]);
		setCount((prev) => prev + 1);
	}, [blogId, setLikedBlogs]);
	const [removeState, removeFn] = useAsyncFn(async () => {
		await window.salla?.api.request(`blogs/${blogId}/unlike`, {}, "delete");
		setLikedBlogs((prev) => prev.filter((id) => id !== blogId));
		setCount((prev) => Math.max(0, prev - 1));
	}, [blogId, setLikedBlogs]);
	const add = async () => !(await addFn() instanceof Error);
	const remove = async () => !(await removeFn() instanceof Error);
	return {
		active,
		count,
		add,
		remove,
		toggle: (0, import_react.useCallback)(() => active ? remove() : add(), [
			active,
			addFn,
			removeFn
		]),
		loading: addState.loading || removeState.loading,
		error: (addState.error ?? removeState.error)?.message ?? null
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-YA6ABQB7.js
var sizeClasses = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	full: "max-w-full mx-4"
};
var positionClasses = {
	center: "items-center",
	top: "items-start pt-10"
};
function Modal({ isOpen, onClose, children, closeOnBackdropClick = true, closeOnEscape = true, preventBodyScroll = true, size = "md", position = "center", className }) {
	const modalRef = (0, import_react.useRef)(null);
	const previousActiveElement = (0, import_react.useRef)(null);
	const handleKeyDown = (0, import_react.useCallback)((event) => {
		if (event.key === "Escape" && closeOnEscape) onClose();
	}, [closeOnEscape, onClose]);
	const handleBackdropClick = (0, import_react.useCallback)((event) => {
		if (closeOnBackdropClick && event.target === event.currentTarget) onClose();
	}, [closeOnBackdropClick, onClose]);
	(0, import_react.useEffect)(() => {
		if (isOpen) {
			previousActiveElement.current = document.activeElement;
			modalRef.current?.focus();
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
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `fixed inset-0 z-50 flex justify-center ${positionClasses[position]}`,
		"aria-modal": "true",
		role: "dialog",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-black/50 transition-opacity",
			role: "presentation",
			onClick: handleBackdropClick,
			onKeyDown: (e) => {
				if ((e.key === "Enter" || e.key === " ") && closeOnBackdropClick) {
					e.preventDefault();
					onClose();
				}
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: modalRef,
			tabIndex: -1,
			className: `relative z-10 w-full rounded-lg bg-white shadow-xl transform transition-all duration-200 ease-out ${sizeClasses[size]} ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"} ${className || ""}`,
			children
		})]
	}), document.body);
}
Modal.Header = function ModalHeader({ children, showCloseButton = true, onClose, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center justify-between border-b border-gray-200 px-6 py-4 ${className || ""}`,
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold text-gray-900",
			children
		}), showCloseButton && onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onClose,
			className: "rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500",
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
Modal.Body = function ModalBody({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `px-6 py-4 ${className || ""}`,
		...props,
		children
	});
};
Modal.Footer = function ModalFooter({ children, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 ${className || ""}`,
		...props,
		children
	});
};
//#endregion
//#region app/components/icons.tsx
/**
* Line icons used across the theme chrome. Each is a plain function component
* that spreads `props` onto the `<svg>`, so callers can pass `className`,
* `width`/`height`, `aria-*`, `slot`, etc. Colour follows `currentColor`.
*
* Style: 24×24 viewBox, 1.5 stroke, round caps/joins, no fill — keep new
* icons matching so the set stays visually consistent.
*/
var base = {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	width: 24,
	height: 24,
	fill: "none",
	color: "currentColor"
};
var stroke = {
	stroke: "currentColor",
	strokeWidth: 1.5,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
var SearchIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M17.5 17.5L22 22",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z",
		...stroke
	})]
});
var ShoppingBagIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M8 7H16C17.8856 7 18.8284 7 19.4142 7.58579C20 8.17157 20 9.11438 20 11V15C20 18.2998 20 19.9497 18.9749 20.9749C17.9497 22 16.2998 22 13 22H11C7.70017 22 6.05025 22 5.02513 20.9749C4 19.9497 4 18.2998 4 15V11C4 9.11438 4 8.17157 4.58579 7.58579C5.17157 7 6.11438 7 8 7Z",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M16 9.5C16 5.63401 14.2091 2 12 2C9.79086 2 8 5.63401 8 9.5",
		...stroke
	})]
});
var ArrowRightIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	...base,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18",
		...stroke
	})
});
var ArrowLeftIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	...base,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18",
		...stroke
	})
});
var StarIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	...base,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z",
		...stroke
	})
});
var CloseIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M6 6L18 18",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M18 6L6 18",
		...stroke
	})]
});
var PlusIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M12 5V19",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M5 12H19",
		...stroke
	})]
});
var MinusIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	...base,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M5 12H19",
		...stroke
	})
});
var FilterHorizontalIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3 7H6",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3 17H9",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M18 17L21 17",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M15 7L21 7",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z",
			stroke: "currentColor",
			strokeWidth: 1.5
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z",
			stroke: "currentColor",
			strokeWidth: 1.5
		})
	]
});
var DashboardSquare01Icon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M13.6903 19.4567C13.5 18.9973 13.5 18.4149 13.5 17.25C13.5 16.0851 13.5 15.5027 13.6903 15.0433C13.944 14.4307 14.4307 13.944 15.0433 13.6903C15.5027 13.5 16.0851 13.5 17.25 13.5C18.4149 13.5 18.9973 13.5 19.4567 13.6903C20.0693 13.944 20.556 14.4307 20.8097 15.0433C21 15.5027 21 16.0851 21 17.25C21 18.4149 21 18.9973 20.8097 19.4567C20.556 20.0693 20.0693 20.556 19.4567 20.8097C18.9973 21 18.4149 21 17.25 21C16.0851 21 15.5027 21 15.0433 20.8097C14.4307 20.556 13.944 20.0693 13.6903 19.4567Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "square",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M13.6903 8.95671C13.5 8.49728 13.5 7.91485 13.5 6.75C13.5 5.58515 13.5 5.00272 13.6903 4.54329C13.944 3.93072 14.4307 3.44404 15.0433 3.1903C15.5027 3 16.0851 3 17.25 3C18.4149 3 18.9973 3 19.4567 3.1903C20.0693 3.44404 20.556 3.93072 20.8097 4.54329C21 5.00272 21 5.58515 21 6.75C21 7.91485 21 8.49728 20.8097 8.95671C20.556 9.56928 20.0693 10.056 19.4567 10.3097C18.9973 10.5 18.4149 10.5 17.25 10.5C16.0851 10.5 15.5027 10.5 15.0433 10.3097C14.4307 10.056 13.944 9.56928 13.6903 8.95671Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "square",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3.1903 19.4567C3 18.9973 3 18.4149 3 17.25C3 16.0851 3 15.5027 3.1903 15.0433C3.44404 14.4307 3.93072 13.944 4.54329 13.6903C5.00272 13.5 5.58515 13.5 6.75 13.5C7.91485 13.5 8.49728 13.5 8.95671 13.6903C9.56928 13.944 10.056 14.4307 10.3097 15.0433C10.5 15.5027 10.5 16.0851 10.5 17.25C10.5 18.4149 10.5 18.9973 10.3097 19.4567C10.056 20.0693 9.56928 20.556 8.95671 20.8097C8.49728 21 7.91485 21 6.75 21C5.58515 21 5.00272 21 4.54329 20.8097C3.93072 20.556 3.44404 20.0693 3.1903 19.4567Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "square",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3.1903 8.95671C3 8.49728 3 7.91485 3 6.75C3 5.58515 3 5.00272 3.1903 4.54329C3.44404 3.93072 3.93072 3.44404 4.54329 3.1903C5.00272 3 5.58515 3 6.75 3C7.91485 3 8.49728 3 8.95671 3.1903C9.56928 3.44404 10.056 3.93072 10.3097 4.54329C10.5 5.00272 10.5 5.58515 10.5 6.75C10.5 7.91485 10.5 8.49728 10.3097 8.95671C10.056 9.56928 9.56928 10.056 8.95671 10.3097C8.49728 10.5 7.91485 10.5 6.75 10.5C5.58515 10.5 5.00272 10.5 4.54329 10.3097C3.93072 10.056 3.44404 9.56928 3.1903 8.95671Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "square",
			strokeLinejoin: "round"
		})
	]
});
var RightToLeftListBulletIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3.87949 5.5L15.8795 5.5",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			opacity: "0.4",
			d: "M3.87949 12.5L15.8795 12.5",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3.87949 19.5L15.8795 19.5",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			opacity: "0.4",
			d: "M20.0045 5.5H19.8795M20.1295 5.5C20.1295 5.63807 20.0176 5.75 19.8795 5.75C19.7414 5.75 19.6295 5.63807 19.6295 5.5C19.6295 5.36193 19.7414 5.25 19.8795 5.25C20.0176 5.25 20.1295 5.36193 20.1295 5.5Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			opacity: "0.4",
			d: "M20.0045 12.5H19.8795M20.1295 12.5C20.1295 12.6381 20.0176 12.75 19.8795 12.75C19.7414 12.75 19.6295 12.6381 19.6295 12.5C19.6295 12.3619 19.7414 12.25 19.8795 12.25C20.0176 12.25 20.1295 12.3619 20.1295 12.5Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			opacity: "0.4",
			d: "M20.0045 19.5H19.8795M20.1295 19.5C20.1295 19.6381 20.0176 19.75 19.8795 19.75C19.7414 19.75 19.6295 19.6381 19.6295 19.5C19.6295 19.3619 19.7414 19.25 19.8795 19.25C20.0176 19.25 20.1295 19.3619 20.1295 19.5Z",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	]
});
var ChevronDownIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
	...base,
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M6 9L12 15L18 9",
		...stroke
	})
});
var Delete01Icon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5",
		...stroke
	})]
});
var LanguagesIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M3.49744 5H7.99744M7.99744 5H13.4974M7.99744 5V3.5",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M4.99744 13.5C7.49744 11.5 10.4974 7.5 10.9974 5",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M6.49744 7.5C6.99744 9 8.99744 11.5 9.99744 12",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M11.4974 20.5005L14.1591 14.2898C14.9451 12.456 15.338 11.5391 15.9974 11.5391C16.6568 11.5391 17.0498 12.456 17.8357 14.2898L20.4974 20.5005",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M13.4974 16.5H18.4974",
			...stroke
		})
	]
});
var MapPinIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M20 10.5C20 14.4879 16.2611 18.6156 13.8747 20.9066C13.3546 21.4059 12.6941 21.6667 12 21.6667C11.3059 21.6667 10.6454 21.4059 10.1253 20.9066C7.73889 18.6156 4 14.4879 4 10.5C4 6.35786 7.58172 3 12 3C16.4183 3 20 6.35786 20 10.5Z",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M14.5 10C14.5 11.3807 13.3807 12.5 12 12.5C10.6193 12.5 9.5 11.3807 9.5 10C9.5 8.61929 10.6193 7.5 12 7.5C13.3807 7.5 14.5 8.61929 14.5 10Z",
		...stroke
	})]
});
var Money01Icon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M2.01733 15C4.2169 15 6.00001 16.7831 6.00001 18.9827",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M18 18.9827V18.8908C18 16.742 19.742 15 21.8908 15",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M6.00001 5.01733C6.00001 7.2169 4.2169 9.00001 2.01733 9.00001",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M18 5.01733C18 7.19765 19.769 8.96876 21.9423 8.9996",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M16 5H8C5.17157 5 3.75736 5 2.87868 5.87868C2 6.75736 2 8.17157 2 11V13C2 15.8284 2 17.2426 2.87868 18.1213C3.75736 19 5.17157 19 8 19H16C18.8284 19 20.2426 19 21.1213 18.1213C22 17.2426 22 15.8284 22 13V11C22 8.17157 22 6.75736 21.1213 5.87868C20.2426 5 18.8284 5 16 5Z",
			...stroke
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z",
			...stroke
		})
	]
});
var HomeIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M3 11.9896V14.5C3 17.7998 3 19.4497 4.02513 20.4749C5.05025 21.5 6.70017 21.5 10 21.5H14C17.2998 21.5 18.9497 21.5 19.9749 20.4749C21 19.4497 21 17.7998 21 14.5V11.9896C21 10.3083 21 9.46773 20.6441 8.74005C20.2882 8.01237 19.6247 7.49628 18.2976 6.46411L16.2976 4.90855C14.2331 3.30285 13.2009 2.5 12 2.5C10.7991 2.5 9.76689 3.30285 7.70242 4.90855L5.70241 6.46411C4.37533 7.49628 3.71179 8.01237 3.3559 8.74005C3 9.46773 3 10.3083 3 11.9896Z",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M15 21.5V16.5C15 15.0858 15 14.3787 14.5607 13.9393C14.1213 13.5 13.4142 13.5 12 13.5C10.5858 13.5 9.87868 13.5 9.43934 13.9393C9 14.3787 9 15.0858 9 16.5V21.5",
		...stroke
	})]
});
var UserIcon = (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
	...base,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M6.578 15.482C5.163 16.324 1.453 18.044 3.713 20.197C4.816 21.248 6.045 22 7.591 22H16.409C17.955 22 19.184 21.248 20.287 20.197C22.547 18.044 18.837 16.324 17.422 15.482C14.105 13.506 9.895 13.506 6.578 15.482Z",
		...stroke
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
		d: "M16.5 6.5C16.5 8.985 14.485 11 12 11C9.515 11 7.5 8.985 7.5 6.5C7.5 4.015 9.515 2 12 2C14.485 2 16.5 4.015 16.5 6.5Z",
		...stroke
	})]
});
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-BYLNAYIZ.js
function queryClientOrNull() {
	try {
		const queryClient = getTwilightContext().queryClient;
		return queryClient && typeof queryClient.setQueryData === "function" ? queryClient : null;
	} catch {
		return null;
	}
}
function productPreviewQueryKey(id) {
	return [
		"products",
		"preview",
		String(id),
		{ scope: getActiveScope() }
	];
}
function productDetailQueryKey(id) {
	return [
		"products",
		"detail",
		id,
		{ scope: getActiveScope() }
	];
}
function isProductPreviewQuery(query) {
	return query.queryKey[0] === "products" && query.queryKey[1] === "preview";
}
function shouldDehydrateQuery(query) {
	return !isProductPreviewQuery(query) && (defaultShouldDehydrateQuery(query) || query.state.status === "pending");
}
function rememberProductPreview(product2) {
	const queryClient = queryClientOrNull();
	if (!queryClient || product2?.id == null) return;
	const id = String(product2.id);
	if (queryClient.getQueryState(productDetailQueryKey(id))?.status === "success") return;
	queryClient.setQueryData(productPreviewQueryKey(id), product2);
}
function scopeFromQueryKey(queryKey) {
	const last = queryKey[queryKey.length - 1];
	if (last == null || typeof last !== "object" || !("scope" in last)) return void 0;
	return last.scope;
}
function isSameScope(a, b) {
	if (a === void 0) return false;
	if (a === b) return true;
	if (a == null || b == null) return a == null && b == null;
	return a.id === b.id && a.type === b.type && a.allocation_id === b.allocation_id && a.allocation_type === b.allocation_type;
}
var LIST_QUERY_PREFIXES = [["products", "list"], ["wishlist", "list"]];
function findProductInScopedLists(queryClient, id) {
	const scope = getActiveScope();
	let found;
	for (const prefix of LIST_QUERY_PREFIXES) for (const [queryKey, data] of queryClient.getQueriesData({ queryKey: prefix })) {
		if (!isSameScope(scopeFromQueryKey(queryKey), scope)) continue;
		for (const item of data?.items ?? []) {
			if (item?.id == null) continue;
			rememberProductPreview(item);
			if (!found && String(item.id) === id) found = item;
		}
	}
	return found;
}
function getProductPreview(id) {
	const queryClient = queryClientOrNull();
	if (!queryClient) return void 0;
	const key = String(id);
	return queryClient.getQueryData(productPreviewQueryKey(key)) ?? findProductInScopedLists(queryClient, key);
}
function rememberProductPreviews(items) {
	for (const item of items) rememberProductPreview(item);
}
function appendSourceParams(searchParams, { source, sourceValue, keyword }) {
	if (source === "search") {
		const words = keyword ?? sourceValue;
		if (words !== void 0) searchParams.set("keyword", String(words));
	} else if (Array.isArray(sourceValue)) sourceValue.forEach((val) => searchParams.append("source_value[]", String(val)));
	else if (sourceValue !== void 0) searchParams.append("source_value[]", String(sourceValue));
}
function appendFilterParams(searchParams, filters, parentKey = "filters") {
	if (!filters) return;
	for (const [key, value] of Object.entries(filters)) {
		const fullKey = `${parentKey}[${key}]`;
		if (Array.isArray(value)) value.forEach((item) => searchParams.append(`${fullKey}[]`, String(item)));
		else if (value !== null && typeof value === "object") appendFilterParams(searchParams, value, fullKey);
		else if (value !== void 0 && value !== null) searchParams.append(fullKey, String(value));
	}
}
var FILTER_TITLES = {
	category_id: ["common.titles.categories", "Categories"],
	brand_id: ["common.titles.brands", "Brands"],
	price: ["pages.categories.filter_price", "Price"],
	rating: ["pages.categories.filter_rating", "Rating"]
};
function titledFilters(filters) {
	const t = getTwilightContext().i18n?.t;
	if (!filters || !t) return filters;
	return filters.map((filter) => {
		const title = filter.key && FILTER_TITLES[filter.key];
		return title ? {
			...filter,
			label: t(title[0], title[1])
		} : filter;
	});
}
function categoryFilterIds(filters) {
	const raw = filters?.category_id;
	if (raw === void 0 || raw === null) return null;
	return (Array.isArray(raw) ? raw : typeof raw === "object" ? Object.values(raw) : [raw]).map(Number);
}
function parseNextPageToken(nextUrl) {
	if (!nextUrl) return {};
	const cursorMatch = nextUrl.match(/[?&]cursor=([^&]+)/);
	if (cursorMatch) return { cursor: decodeURIComponent(cursorMatch[1]) };
	const pageMatch = nextUrl.match(/[?&]page=([^&]+)/);
	if (pageMatch) {
		const page = Number(decodeURIComponent(pageMatch[1]));
		if (Number.isFinite(page)) return { page };
	}
	return { cursor: nextUrl };
}
var product = {
	find: async (id) => {
		const endpoint = `products/${id}/details?with[]=images&with[]=category&with[]=rating&with[]=notify_availability&with[]=tags&with[]=brand&with[]=options&with[]=skus&with[]=skus_availability&with[]=included_products&with[]=bundle&with[]=sold_quantity`;
		const { data } = await api.get(endpoint).json();
		return data;
	},
	findOrThrow: (id) => orThrow(product.find(id)),
	/** A tag's name. The list endpoint returns every product for an unknown tag; this one answers 410. */
	tag: async (id) => {
		const { tag } = await api.get(`products/tags/${id}`).json();
		return tag;
	},
	/**
	* Fetch products list with pagination support
	* Used by native ProductsList component for SSR loaders
	*
	* API pattern: GET /products?source=wishlist&page=1
	*/
	list: async (params) => {
		const { source, sourceValue, keyword, page, cursor, perPage = 16, sort, filterable, filters, signal } = params;
		const searchParams = new URLSearchParams();
		searchParams.set("source", source);
		if (page !== void 0) searchParams.set("page", String(page));
		searchParams.set("per_page", String(perPage));
		appendSourceParams(searchParams, {
			source,
			sourceValue: source === "categories" && categoryFilterIds(filters) || sourceValue,
			keyword
		});
		appendFilterParams(searchParams, filters);
		if (filterable !== void 0) searchParams.set("filterable", filterable ? "1" : "0");
		if (sort) searchParams.set("sort", sort);
		if (cursor) searchParams.set("cursor", cursor);
		const options = {};
		if (signal) options.signal = signal;
		const response = await api.get(`products?${searchParams.toString()}`, options).json();
		const items = response.data ?? [];
		rememberProductPreviews(items);
		return {
			items,
			next: response.cursor?.next ?? null,
			filters: titledFilters(response.filters)
		};
	},
	queries: {
		detail: (id) => queryOptions({
			queryKey: productDetailQueryKey(id),
			queryFn: () => product.find(id),
			placeholderData: () => getProductPreview(id)
		}),
		tag: (id) => queryOptions({
			queryKey: [
				"products",
				"tag",
				id
			],
			queryFn: () => product.tag(id)
		}),
		list: (params) => queryOptions({
			queryKey: [
				"products",
				"list",
				params,
				{
					scope: getActiveScope(),
					locale: getTwilightContext().locale
				}
			],
			queryFn: ({ signal }) => product.list({
				...params,
				signal
			})
		})
	}
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-Y32RHCOH.js
var ComponentRegistry = class {
	constructor() {
		this.components = /* @__PURE__ */ new Map();
	}
	register(name, component) {
		this.components.set(name, {
			component,
			displayName: name
		});
	}
	override(name, component) {
		const existing = this.components.get(name);
		if (existing) this.components.set(name, {
			component,
			displayName: name,
			original: existing
		});
		else this.register(name, component);
	}
	resolve(name) {
		return this.components.get(name)?.component ?? null;
	}
	getOriginal(name) {
		return this.components.get(name)?.original?.component ?? null;
	}
	has(name) {
		return this.components.has(name);
	}
	list() {
		return Array.from(this.components.keys());
	}
	listByPrefix(prefix) {
		return this.list().filter((name) => name.startsWith(prefix));
	}
	clear() {
		this.components.clear();
	}
	remove(name) {
		return this.components.delete(name);
	}
};
var registry = new ComponentRegistry();
var COMPONENT_KEYS = {
	PRODUCT_CARD: "product:card",
	PRODUCT_GALLERY: "product:gallery",
	PRODUCT_LIST_PAGE: "product:list-page",
	PRODUCT_LIST_SKELETON: "product:list-skeleton"
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-QGKARX6O.js
var LazyProductDetails = (0, import_react.lazy)(() => import("./ProductDetails-JHZ2ZJAA-she_Qe71.js").then((m) => ({ default: m.ProductDetails })));
var LazyAddToCartForm = (0, import_react.lazy)(() => import("./AddToCartForm-2BD3R4BH-q58z8v_9.js").then((m) => ({ default: m.AddToCartForm })));
var PRODUCT_CARD_KEY = "product:card";
var PRODUCT_IMAGE_SRCSET_WIDTHS = [
	150,
	300,
	450,
	600
];
var PRODUCT_IMAGE_SIZES = "(min-width: 768px) 25vw, 50vw";
var PRODUCT_WIDE_IMAGE_SIZES = "(min-width: 1024px) 50vw, 100vw";
var ProductCardContent = (0, import_react.memo)(function ProductCardContent2({ product, layout = "vertical", className = "", withShadow = false, withQuantity = false, withoutAddButton = false, index = 0, imagePriority = false, sizes }) {
	const { format } = useMoney();
	const { t } = useTranslation();
	const { store, theme } = useTwilight();
	const wishlist = useWishlist();
	const { isPlaceholder } = useAsset();
	const { format: formatNumber } = useNumber();
	const addButtonStatus = theme?.settings?.notify_when_available_in_card !== false && product.is_out_of_stock && product.type !== "donating" && product.type !== "financial_support" ? "out-and-notify" : product.status;
	const addButtonRef = useHostAttributes({
		fill: "outline",
		width: "wide"
	});
	const isVertical = layout === "vertical";
	const isHorizontal = layout === "horizontal";
	const isFullImage = layout === "fullImage";
	const isMinimal = layout === "minimal";
	const isSpecial = layout === "special";
	const productInWishlist = wishlist.has(Number(product.id));
	const handleWishlistToggle = (0, import_react.useCallback)(() => {
		wishlist.toggle(Number(product.id));
	}, [wishlist, product.id]);
	const fitImageHeight = store?.settings?.product?.fit_type;
	const getProductBadge = () => {
		if (product?.preorder?.label && typeof product.preorder.label === "string") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-product-card-promotion-title",
			children: product.preorder.label
		});
		if (product.promotion_title) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-product-card-promotion-title",
			children: product.promotion_title
		});
		if (withQuantity && product?.quantity) {
			const formattedQty = formatNumber(product.quantity);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "s-product-card-quantity",
				children: [
					t("pages.products.remained", "Remained"),
					" ",
					formattedQty
				]
			});
		}
		if (withQuantity && product?.is_out_of_stock) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "s-product-card-out-badge",
			children: t("pages.products.out_of_stock", "Out of Stock")
		});
		return null;
	};
	const getProductPrice = () => {
		if (product.is_on_sale && product.sale_price) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-product-card-sale-price",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: format(product.sale_price) }), product.regular_price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: format(product.regular_price) })]
		});
		if (product.starting_price) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-product-card-starting-price",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("pages.products.starting_price", "Starting from") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: format(product.starting_price) })]
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
			className: "s-product-card-price",
			children: format(product.price)
		});
	};
	const cardClassName = [
		"s-product-card",
		"s-product-card-entry",
		isVertical ? "s-product-card-vertical" : "",
		isHorizontal ? "s-product-card-horizontal" : "",
		fitImageHeight && isVertical ? `s-product-card-fit-height` : "",
		isSpecial ? "s-product-card-special" : "",
		isFullImage ? "s-product-card-full-image" : "",
		isMinimal ? "s-product-card-minimal" : "",
		product?.donation ? "s-product-card-donation" : "",
		withShadow ? "s-product-card-shadow" : "",
		product?.is_out_of_stock ? "s-product-card-out-of-stock" : "",
		className
	].filter(Boolean).join(" ");
	const imageFitClass = isPlaceholder(product.image?.url) ? "contain" : fitImageHeight || "cover";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: `product-card-${product.id}`,
		className: cardClassName,
		"data-product-id": product.id,
		style: { animationDelay: `${index * 100}ms` },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: isFullImage ? "s-product-card-image-full" : "s-product-card-image",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: product.url,
					"aria-label": product.image?.alt || product.name,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
						className: `s-product-card-image-${imageFitClass}`,
						src: product.image?.url,
						alt: product.image?.alt ?? product.name,
						width: 300,
						height: 300,
						sizes: sizes ?? (isFullImage || isMinimal ? PRODUCT_WIDE_IMAGE_SIZES : PRODUCT_IMAGE_SIZES),
						srcSetWidths: PRODUCT_IMAGE_SRCSET_WIDTHS,
						aspectRatio: "1/1",
						priority: imagePriority
					}), !isFullImage && !isMinimal && getProductBadge()]
				}),
				isFullImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: product.url,
					"aria-label": product.name,
					className: "s-product-card-overlay"
				}),
				!isHorizontal && !isFullImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
					shape: "icon",
					fill: "outline",
					color: "light",
					ariaLabel: t("pages.wishlist.toggle", "Add or remove to wishlist"),
					className: `s-product-card-wishlist-btn animated ${productInWishlist ? "s-product-card-wishlist-added pulse-anime" : "not-added un-favorited"}`,
					onClick: handleWishlistToggle,
					"data-id": product.id,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-heart" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-product-card-content",
			children: [
				isSpecial && product?.quantity && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-product-card-content-pie",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: formatNumber(product.quantity) }), t("pages.products.remained", "Remained")] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						xmlns: "http://www.w3.org/2000/svg",
						viewBox: "-2 -1 36 34",
						className: "s-product-card-content-pie-svg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "16",
							cy: "16",
							r: "15.9155",
							className: "s-product-card-content-pie-svg-base"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "16",
							cy: "16",
							r: "15.9155",
							className: "s-product-card-content-pie-svg-bar"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `s-product-card-content-main ${isSpecial ? "s-product-card-content-extra-padding" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "s-product-card-content-title",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: product.url,
							children: product.name
						})
					}), product.subtitle && !isMinimal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "s-product-card-content-subtitle opacity-80",
						children: product.subtitle
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `s-product-card-content-sub ${isSpecial ? "s-product-card-content-extra-padding" : ""}`,
					children: [!product?.donation?.can_donate && getProductPrice(), product.rating?.stars && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "s-product-card-rating",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-star2 text-orange-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: product.rating.stars })]
					})]
				}),
				!withoutAddButton && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-product-card-content-footer gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaAddProductButton, {
						ref: addButtonRef,
						fill: "outline",
						width: "wide",
						productId: product.id,
						productStatus: addButtonStatus,
						productType: product.type,
						hasPreOrder: product.has_preorder_campaign
					}), (isHorizontal || isFullImage) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SallaButton, {
						shape: "icon",
						fill: "outline",
						color: "light",
						ariaLabel: t("pages.wishlist.toggle", "Add or remove to wishlist"),
						className: `s-product-card-wishlist-btn animated ${productInWishlist ? "s-product-card-wishlist-added pulse-anime" : "not-added un-favorited"}`,
						onClick: handleWishlistToggle,
						"data-id": product.id,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sicon-heart" })
					})]
				})
			]
		})]
	});
});
var ProductCard$1 = (0, import_react.memo)(function ProductCard2(props) {
	const Component = (0, import_react.useMemo)(() => {
		if (registry.getOriginal(PRODUCT_CARD_KEY) !== null) return registry.resolve(PRODUCT_CARD_KEY);
		return null;
	}, []);
	if (Component) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCardContent, { ...props });
});
var PRODUCT_GALLERY_KEY = "product:gallery";
function legacyGalleryMedia(images) {
	return images.flatMap((image) => {
		if (image.three_d_image_url) return [{
			url: image.three_d_image_url,
			type: "3d-image"
		}];
		if (image.video_url) return [{
			url: image.video_url,
			type: "video"
		}];
		return image.url ? [{
			url: image.url,
			type: "image"
		}] : [];
	});
}
function ProductGalleryContent({ product }) {
	const { t } = useTranslation();
	const { theme } = useTwilight();
	const sliderId = `details-slider-${product.id}`;
	const objectFit = theme.settings.slider_background_size ?? "cover";
	const [preview, setPreview] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const raf = requestAnimationFrame(() => {
			const el = document.getElementById(sliderId);
			if (!el?.parentElement) return;
			const { parentElement, nextSibling } = el;
			parentElement.removeChild(el);
			parentElement.insertBefore(el, nextSibling);
		});
		return () => cancelAnimationFrame(raf);
	}, [sliderId]);
	const images = product.images && product.images.length > 0 ? product.images : product.image?.url ? [product.image] : [];
	const hasManyImages = images.length > 1;
	const openNativeGallery = (selected) => {
		if (!isNativeApp()) return false;
		if (window.salla?.mobile?.openGallery?.(images, selected)) return true;
		window.salla?.event.dispatch("mobile::gallery.open", { images: legacyGalleryMedia(images) });
		return true;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "sidebar md:sticky top-24 w-full md:!w-2/4 rtl:ml-8 ltr:mr-8 pb-8 md:pb-16 overflow-hidden shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SallaSlider, {
			id: sliderId,
			className: "details-slider rounded-md image-slider",
			type: "thumbs",
			loop: false,
			autoHeight: true,
			listenToThumbnailsOption: true,
			showThumbsControls: false,
			sliderConfig: {
				watchOverflow: true,
				autoHeight: true
			},
			children: [
				product.promotion_title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "promotion-title",
					children: product.promotion_title
				}),
				product.calories && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute z-[2] top-4 rtl:left-4 ltr:right-4 bg-white shadow-sm flex flex-col justify-center items-center rounded-full w-20 h-20 md:w-24 md:h-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-red-500 text-xl leading-none font-bold",
						children: product.calories
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-gray-500",
						children: t("pages.products.calories", "Calories")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					slot: "items",
					children: images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageSlide, {
						image,
						product,
						index,
						objectFit,
						onPreview: setPreview,
						onNativeOpen: openNativeGallery
					}, image.id ?? image.three_d_image_url ?? image.video_url ?? image.url))
				}),
				hasManyImages && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					slot: "thumbs",
					children: images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbSlide, {
						image,
						index
					}, image.id ?? image.three_d_image_url ?? image.video_url ?? image.url))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImageModal, {
				isOpen: !!preview,
				onClose: () => setPreview(null),
				src: preview?.src ?? "",
				alt: preview?.alt
			})
		})]
	});
}
function ProductGallery(props) {
	const Component = (0, import_react.useMemo)(() => {
		const resolved = registry.resolve(PRODUCT_GALLERY_KEY);
		return resolved === ProductGallery ? null : resolved;
	}, []);
	if (Component) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { ...props });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductGalleryContent, { ...props });
}
function ImageSlide({ image, product, index, objectFit, onPreview, onNativeOpen }) {
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	const isVideo = Boolean(image.video_url);
	if (image.three_d_image_url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("model-viewer", {
		style: { minHeight: "500px" },
		className: "swiper-slide model-entry w-full h-full",
		loading: "lazy",
		"camera-controls": true,
		"touch-action": "pan-y",
		"auto-rotate": true,
		poster: image.url || void 0,
		src: image.three_d_image_url,
		"shadow-intensity": "1",
		alt: image.alt,
		onClick: () => onNativeOpen(image)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		"data-fslightbox": `product_${product.id}`,
		"data-img-id": image.id,
		"data-slid-index": index,
		...image.video_url ? { "data-video-src": image.video_url } : {},
		"data-caption": image.alt,
		"data-infinite": "false",
		"data-type": image.video_url ? "youtube" : "image",
		href: image.video_url || image.url,
		...isVideo ? {
			target: "_blank",
			rel: "noopener noreferrer"
		} : {},
		onClick: (event) => {
			if (onNativeOpen(image)) {
				event.preventDefault();
				return;
			}
			if (isVideo || !image.url) return;
			event.preventDefault();
			onPreview({
				src: image.url,
				alt: image.alt || product.name
			});
		},
		"aria-label": product.name,
		className: `swiper-slide magnify-wrapper homeslider__slide ${image.video_url ? "video-entry" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `w-full ${loaded ? "" : "aspect-square bg-gray-100 animate-pulse"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				id: String(image.id),
				src: image.url,
				alt: image.alt || product.name,
				className: `h-full w-full object-${objectFit}`,
				aspectRatio: "1/1",
				priority: index === 0,
				noWrapper: true,
				onLoad: () => setLoaded(true)
			})
		})
	});
}
function ThumbSlide({ image, index }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `slide--one-fourth ${image.video_url ? "video-entry" : ""} ${image.three_d_image_url ? "model-entry" : ""}`,
		"data-caption": image.alt,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
			src: image.url,
			alt: image.alt || "",
			className: "object-cover w-full h-full bg-gray-100 rounded-md overflow-hidden",
			title: image.alt,
			priority: index < 5,
			noWrapper: true
		})
	});
}
//#endregion
//#region app/lib/curtainSlots.ts
/** Salla supports exactly TWO category levels, so the curtain's third column
* cannot be taxonomy — it is one `curtain_slots` row per category carrying a
* featured product OR an image (old rule 12). */
/** Every candidate key a picker/`items` field may carry, in the order the
* value wins: `value` leads (the url), then free-text fallbacks. */
var PICKER_KEYS = [
	"value",
	"url",
	"link",
	"id",
	"label",
	"title",
	"name"
];
/** Row fields are keyed by the SHORT name, with the prefixed id as fallback
* (old rule 15 — `main-links.twig` is the proof). */
var ROW_KEYS = [
	"category",
	"curtain_slots.category",
	"type",
	"curtain_slots.type",
	"product",
	"curtain_slots.product",
	"image",
	"curtain_slots.image",
	"title",
	"curtain_slots.title"
];
/** Normalised url key: protocol, `www.`, query/hash and trailing slash gone. */
var slotKey = (url) => {
	if (!url) return "";
	let value = String(url).trim();
	value = value.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
	value = value.split(/[?#]/)[0];
	return value.replace(/\/+$/, "").toLowerCase();
};
/** The last numeric run in a url path is the category id, and the id survives
* any locale or slug-shape disagreement the picker and the menu payload have */
var idFromUrl = (url) => {
	const runs = String(url ?? "").split(/[?#]/)[0].match(/\d+/g);
	return runs && runs.length ? runs[runs.length - 1] : "";
};
/** A picker does NOT store a bare string — it stores `{label, value, key}`,
* usually inside an array (old rule 22). Flatten every shape to its texts,
* recursing into array ELEMENTS; walking PICKER_KEYS against the array itself
* was the original silent-empty-map bug. */
var pickerValue = (value) => {
	const out = [];
	const push = (input) => {
		if (input === null || input === void 0) return;
		if (Array.isArray(input)) {
			input.forEach(push);
			return;
		}
		if (typeof input === "object") {
			const obj = input;
			PICKER_KEYS.forEach((key) => push(obj[key]));
			return;
		}
		const text = String(input).trim();
		if (text && !out.includes(text)) out.push(text);
	};
	push(value);
	return out;
};
/** First flattened text of a normaliser chain. */
var scalar = (value) => pickerValue(value)[0] ?? "";
/** ONE picker value can be a url, a bare id, or a category NAME — so the row
* is keyed under every shape it could plausibly take (old rule 13):
* `url` + `tail:<last segment>` + `id:<n>` + the normalised text itself. */
var keysFromText = (text) => {
	const keys = [];
	const value = String(text ?? "").trim();
	if (!value) return keys;
	const url = slotKey(value);
	if (url) keys.push(url);
	if (url.includes("/")) {
		const tail = url.split("/").filter(Boolean).pop();
		if (tail) keys.push(`tail:${tail}`);
	}
	if (/^\d+$/.test(value)) {
		const key = `id:${value}`;
		if (!keys.includes(key)) keys.push(key);
	}
	const id = idFromUrl(value);
	if (id) {
		const key = `id:${id}`;
		if (!keys.includes(key)) keys.push(key);
	}
	return keys;
};
var slotKeys = (value) => {
	const keys = [];
	pickerValue(value).forEach((text) => {
		keysFromText(text).forEach((key) => {
			if (!keys.includes(key)) keys.push(key);
		});
	});
	return keys;
};
/** Image settings arrive as a plain url, a `{url, small_url, alt}` object, or
* wrapped in a picker array — all three resolve here, not at the call. */
var imgSrc = (value) => {
	if (!value) return "";
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return imgSrc(value[0]);
	const obj = value;
	return obj.url || obj.small_url || obj.value || obj.src || "";
};
/** A collection need not arrive as an array (old rule 15b) — accepting only
* arrays is a SILENT failure, so every observed shape is accepted. */
var rowsFrom = (value) => {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	if (typeof value === "string") try {
		return rowsFrom(JSON.parse(value));
	} catch {
		return [];
	}
	if (typeof value !== "object") return [];
	const obj = value;
	if (ROW_KEYS.some((key) => Object.prototype.hasOwnProperty.call(obj, key))) return [obj];
	const keys = Object.keys(obj);
	if (keys.length === 1 && Array.isArray(obj[keys[0]])) return obj[keys[0]];
	if (keys.length && keys.every((key) => obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key]))) return keys.map((key) => obj[key]);
	return [];
};
/** Short field name first; the prefixed id only as a fallback (rule 15). */
var field = (row, name) => {
	if (!row) return void 0;
	if (row[name] !== void 0 && row[name] !== null) return row[name];
	return row[`curtain_slots.${name}`];
};
/** Full rows → keyed map. First row wins, so a duplicated category cannot
* make the panel flicker between two slots; one row is filed under EVERY
* candidate key, so the count is `new Set(map.values()).size`, never
* `map.size`. */
var readSlots = (setting) => {
	const map = /* @__PURE__ */ new Map();
	rowsFrom(setting).forEach((row) => {
		if (!row) return;
		const keys = slotKeys(field(row, "category"));
		if (!keys.length) return;
		if (keys.some((key) => map.has(key))) return;
		const slot = {
			type: scalar(field(row, "type")).toLowerCase().includes("image") ? "image" : "product",
			product: scalar(field(row, "product")),
			image: imgSrc(scalar(field(row, "image"))),
			title: scalar(field(row, "title"))
		};
		keys.forEach((key) => map.set(key, slot));
	});
	return map;
};
/** Candidate keys one node can answer to (id → urls → NAME). */
var nodeKeys = (node) => [
	`id:${String(node.id)}`,
	...slotKeys(node.url),
	...slotKeys(node.title)
];
/** A slot resolves on the DEEPEST node in focus and falls back up the chain:
* focused subcategory → the main category itself → one of its children (rule
* 26's predecessor; the setting promises "this category or its branches"). */
var activeSlot = (map, menu, focus) => {
	if (!map?.size) return null;
	const find = (node) => {
		if (!node) return null;
		for (const key of nodeKeys(node)) {
			const hit = map.get(key);
			if (hit) return hit;
		}
		return null;
	};
	const byFocus = find(focus);
	if (byFocus) return byFocus;
	const byMain = find(menu);
	if (byMain) return byMain;
	const kids = menu.children ?? [];
	for (const kid of kids) {
		const byChild = find(kid);
		if (byChild) return byChild;
	}
	return null;
};
/** Whether a row can render at all (an image with a source, or a product with
* an id) — a malformed row must not win a fallback draw and print a broken
* pane. */
var slotRenderable = (slot) => slot.type === "image" ? !!slot.image : !!productIdFromUrl(slot.product);
/** A missing slot falls back to a RANDOM one — the merchant's rule beats
* "never a stray slot" (rule 26). Renderable rows only; `null` when no row can
* render, and the honest empty state stands. Kept separate from `activeSlot`
* so the precise resolver keeps returning `null` for unmatched categories. */
var fallbackSlot = (map, seed) => {
	if (!map?.size) return null;
	const renderable = [...new Set(map.values())].filter(slotRenderable);
	if (!renderable.length) return null;
	if (seed === void 0) return renderable[Math.floor(Math.random() * renderable.length)];
	let hash = 2166136261;
	for (let i = 0; i < seed.length; i += 1) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return renderable[(hash >>> 0) % renderable.length];
};
/** The product picker returns a url whose id is the `/p<digits>` run — the
* only thing a selected-source product list needs. */
var productIdFromUrl = (url) => {
	const match = /\/p(\d+)(?:[\/?#]|$)/.exec(String(url ?? ""));
	return match ? match[1] : "";
};
/** The REAL category id of a menu node, read from its url's `/c<digits>` run.
*
* A menu node's OWN `id` is a menu-ROW id, not a category id: sending it as
* `source_value` to the products API answers **422** and the curtain's featured
* rectangle stays empty for every category without merchant picks. Measured
* against the live store (`store-identifier: dev-vgckq3fssfhjewwi`):
* `source=categories` with the row id `1060795665` → 422, with the
* `c1265994686` carried in the node's url → 200. The url is therefore the only
* trustworthy carrier, and a node that is not a category page at all (no
* `/c<digits>`) has no id to fall back to. */
var categoryIdFromUrl = (url) => {
	const match = /\/c(\d+)(?:[\/?#]|$)/.exec(String(url ?? ""));
	return match ? match[1] : "";
};
//#endregion
//#region app/lib/homeBlock.ts
var clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
/** Top-level settings arrive short (`title`) or prefixed (`block_title`).
*
* The PREFIXED form wins, because that is the real field id — the one the
* merchant's editor writes. The short alias is only a convenience for seed
* data and for direct props, and reading it first is a silent trap: a block
* whose seed data carries `image` next to the merchant's `second_skin_image`
* keeps rendering the seed image forever, so "I changed the image in the
* settings and nothing happened". Presence (even empty) is authoritative, so
* clearing a field in the editor actually clears it instead of falling back
* to the seed text. */
function readValue(data, key, prefix) {
	if (!data) return void 0;
	const present = (value) => value !== void 0 && value !== null;
	const underscored = data[`${prefix}_${key}`];
	if (present(underscored)) return underscored;
	const dotted = data[`${prefix}.${key}`];
	if (present(dotted)) return dotted;
	return data[key];
}
function readText(data, key, prefix, fallback = "") {
	return scalar(readValue(data, key, prefix)) || fallback;
}
/** `readText`, except an explicitly EMPTY value stays empty.
*
* `readText` treats `''` as "not set" and returns the fallback. That is right
* for a field whose fallback is `''`, and wrong for copy that ships with a
* default: the merchant clears the field in the editor and the seed text comes
* straight back, so the control looks broken. Here "absent" means "use the
* default" and "cleared" means "show nothing" — the distinction the merchant
* is actually making. */
function readTextOr(data, key, prefix, fallback = "") {
	const raw = readValue(data, key, prefix);
	if (raw === void 0 || raw === null) return fallback;
	return scalar(raw);
}
function readNumber(data, key, prefix, fallback) {
	const raw = readValue(data, key, prefix);
	if (raw === void 0 || raw === null || raw === "") return fallback;
	const value = Number(scalar(raw));
	return Number.isFinite(value) ? value : fallback;
}
function readBoolean(data, key, prefix, fallback = false) {
	const value = readValue(data, key, prefix);
	if (value === void 0 || value === null || value === "") return fallback;
	return value === true || value === 1 || value === "1" || value === "true";
}
function readRows(data, key, prefix) {
	return rowsFrom(readValue(data, key, prefix));
}
function rowValue(row, key, prefix) {
	if (row[key] !== void 0 && row[key] !== null) return row[key];
	return row[`${prefix}.${key}`] ?? row[`${prefix}_${key}`];
}
function rowText(row, key, prefix, fallback = "") {
	return scalar(rowValue(row, key, prefix)) || fallback;
}
function rowImage(row, key, prefix, fallback = "") {
	return imgSrc(rowValue(row, key, prefix)) || fallback;
}
function prefersReducedMotion() {
	return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
/** Tracks a scoped block's scroll progress without React state (0 → 1). */
function useScrollProgress(ref, onProgress) {
	const callback = (0, import_react.useRef)(onProgress);
	callback.current = onProgress;
	(0, import_react.useEffect)(() => {
		const element = ref.current;
		if (!element) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const rect = element.getBoundingClientRect();
			const distance = Math.max(1, rect.height - window.innerHeight);
			const progress = clamp(-rect.top / distance);
			element.style.setProperty("--block-progress", progress.toFixed(4));
			callback.current?.(progress);
		};
		const schedule = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, [ref]);
}
/** Adds `.is-visible` to `[data-reveal]` descendants when they enter view. */
function useReveal(ref) {
	(0, import_react.useEffect)(() => {
		const root = ref.current;
		if (!root) return;
		const nodes = Array.from(root.querySelectorAll("[data-reveal]"));
		if (!nodes.length) return;
		if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
			nodes.forEach((node) => node.classList.add("is-visible"));
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		}, {
			rootMargin: "0px 0px -12% 0px",
			threshold: .12
		});
		nodes.forEach((node) => observer.observe(node));
		return () => observer.disconnect();
	}, [ref]);
}
//#endregion
//#region app/lib/storeSettings.ts
var PREFIX$1 = "global";
/**
* The state a store is in before it ever touches this panel — and the state
* every existing store is in right now. Every field resolves to "use what is
* already there".
*/
var GLOBAL_SETTINGS_DEFAULTS = {
	accentMode: "salla",
	accent: "",
	radius: "theme",
	container: "theme",
	gutter: "theme",
	sectionGap: "theme",
	surfacePreset: "theme",
	textTone: "theme",
	borderStrength: "theme",
	typeScale: "theme",
	lineHeight: "theme",
	headingFont: "theme",
	headingWeight: "theme",
	density: "theme",
	buttonShape: "theme",
	shadow: "theme",
	buttonHeight: "theme",
	buttonSize: "theme",
	buttonWeight: "theme",
	mediaRadius: "theme",
	iconSize: "theme",
	motionSpeed: "theme",
	motionEasing: "theme",
	overlay: "theme",
	scrollReveal: true,
	cardBorder: true,
	reduceMotion: false
};
/** The pixel each choice stands for. `theme` is absent on purpose: it means
*  "emit nothing", not "emit 0". */
var RADIUS_PX = {
	"0": 0,
	"8": 8,
	"12": 12,
	"18": 18,
	"22": 22
};
var CONTAINER_PX = {
	"1200": 1200,
	"1280": 1280,
	"1440": 1440,
	"1600": 1600
};
var GUTTER_PX = {
	"16": 16,
	"24": 24,
	"32": 32,
	"40": 40
};
var SECTION_GAP_PX = {
	"24": 24,
	"48": 48,
	"80": 80
};
var SURFACE_PRESETS = {
	warm: {
		canvas: "#faf7f2",
		s1: "#fffdf8",
		s2: "#f4efe6",
		s3: "#eae3d6",
		ink3: "#736c63",
		night: {
			canvas: "#17120d",
			s1: "#1d1812",
			s2: "#241e17",
			s3: "#2e271e",
			ink3: "#a89e8e"
		}
	},
	cool: {
		canvas: "#f2f4f8",
		s1: "#ffffff",
		s2: "#f4f6fa",
		s3: "#e7ecf3",
		ink3: "#6f757d",
		night: {
			canvas: "#0d1117",
			s1: "#131820",
			s2: "#19202a",
			s3: "#222b37",
			ink3: "#8d95a2"
		}
	},
	neutral: {
		canvas: "#f7f7f4",
		s1: "#ffffff",
		s2: "#f3f3ef",
		s3: "#e8e8e2",
		ink3: "#75756f",
		night: {
			canvas: "#121310",
			s1: "#181a16",
			s2: "#1f211c",
			s3: "#282b25",
			ink3: "#9a9b92"
		}
	}
};
/**
* Text tone re-points the two inks that carry reading text.
*
* It deliberately does NOT own `ink-3`: the muted ink is a property of the
* surface family (see above), so two settings can never fight over one
* variable. Every tone here stays above 4.5:1 on every preset's `s2`, and its
* `night` pair stays above the theme's own night ratio for the same role.
*/
var TEXT_TONES = {
	strong: {
		ink1: "#14161a",
		ink2: "#2f363d",
		night: {
			ink1: "#ffffff",
			ink2: "#ccd1d9"
		}
	},
	soft: {
		ink1: "#3d434a",
		ink2: "#5f676e",
		night: {
			ink1: "#dfe3e8",
			ink2: "#aab2bd"
		}
	},
	warm: {
		ink1: "#2b2519",
		ink2: "#5c5245",
		night: {
			ink1: "#f5efe4",
			ink2: "#c9bfae"
		}
	}
};
/**
* Border strength changes the WEIGHT of the hairlines, not their hue: the same
* ink the palette uses, at a different alpha, so it composites correctly over
* whatever surface the preset chose.
*
* At night the ink flips to white — the day values are a dark ink at low alpha,
* which on a `#0b0e14` canvas is invisible. The night alphas are the theme's
* own night hairlines (`0.09` / `0.18`) stretched in the same proportion.
*/
var BORDER_STRENGTHS = {
	soft: {
		line1: "rgba(20, 20, 30, 0.05)",
		line2: "rgba(20, 20, 30, 0.10)",
		night: {
			line1: "rgba(255, 255, 255, 0.06)",
			line2: "rgba(255, 255, 255, 0.12)"
		}
	},
	strong: {
		line1: "rgba(20, 20, 30, 0.16)",
		line2: "rgba(20, 20, 30, 0.30)",
		night: {
			line1: "rgba(255, 255, 255, 0.20)",
			line2: "rgba(255, 255, 255, 0.36)"
		}
	}
};
/** A multiplier the Tailwind config and the token layer both read. */
var TYPE_SCALES = {
	"90": .9,
	"95": .95,
	"105": 1.05,
	"110": 1.1,
	"115": 1.15
};
var LINE_HEIGHTS = {
	tight: .94,
	normal: 1,
	relaxed: 1.08
};
var HEADING_FONTS = {
	main: "var(--font-main, system-ui, sans-serif)",
	display: "var(--font-display, Georgia, serif)"
};
var HEADING_WEIGHTS = {
	"600": 600,
	"700": 700,
	"800": 800
};
var DENSITIES = {
	compact: .82,
	normal: 1,
	relaxed: 1.18
};
var BUTTON_SHAPES = {
	pill: "var(--radius-full)",
	rounded: "var(--radius-lg)",
	square: "0px"
};
var SHADOWS = {
	none: {
		xs: "0 0 #0000",
		sm: "0 0 #0000",
		md: "0 0 #0000",
		lg: "0 0 #0000",
		card: "0 0 #0000",
		night: "0 0 #0000"
	},
	soft: {
		xs: "0 1px 2px -1px color-mix(in srgb, var(--ink-1) 12%, transparent)",
		sm: "0 2px 8px -6px color-mix(in srgb, var(--ink-1) 26%, transparent)",
		md: "0 8px 18px -14px color-mix(in srgb, var(--ink-1) 34%, transparent)",
		lg: "0 14px 30px -24px color-mix(in srgb, var(--ink-1) 44%, transparent)",
		card: "0 4px 18px -6px color-mix(in srgb, var(--ink-1) 12%, transparent)",
		night: "0 10px 24px -18px rgba(0, 0, 0, 0.5)"
	},
	medium: {
		xs: "0 1px 2px -1px color-mix(in srgb, var(--ink-1) 18%, transparent)",
		sm: "0 4px 12px -8px color-mix(in srgb, var(--ink-1) 45%, transparent)",
		md: "0 14px 30px -22px color-mix(in srgb, var(--ink-1) 55%, transparent)",
		lg: "0 22px 44px -34px color-mix(in srgb, var(--ink-1) 70%, transparent)",
		card: "5px 10px 30px #2b2d340d",
		night: "0 18px 40px -22px rgba(0, 0, 0, 0.7)"
	},
	strong: {
		xs: "0 2px 4px -1px color-mix(in srgb, var(--ink-1) 26%, transparent)",
		sm: "0 8px 18px -10px color-mix(in srgb, var(--ink-1) 55%, transparent)",
		md: "0 20px 40px -26px color-mix(in srgb, var(--ink-1) 68%, transparent)",
		lg: "0 32px 60px -40px color-mix(in srgb, var(--ink-1) 82%, transparent)",
		card: "0 10px 36px -8px color-mix(in srgb, var(--ink-1) 22%, transparent)",
		night: "0 26px 56px -24px rgba(0, 0, 0, 0.85)"
	}
};
var BUTTON_HEIGHTS = {
	"36": 36,
	"40": 40,
	"44": 44,
	"48": 48,
	"52": 52
};
var BUTTON_SIZES = {
	sm: "0.8125rem",
	md: "0.875rem",
	lg: "0.9375rem"
};
var BUTTON_WEIGHTS = {
	"500": 500,
	"600": 600,
	"700": 700,
	"800": 800
};
var MEDIA_RADII = {
	none: "0px",
	small: "var(--radius-sm)",
	medium: "var(--radius-md)",
	large: "var(--radius-lg)",
	round: "var(--radius-full)"
};
var ICON_SIZES = {
	"14": 14,
	"16": 16,
	"18": 18,
	"20": 20,
	"24": 24
};
/** `off` is not `0ms`: a 0ms transition still fires `transitionend` and still
*  costs a style recalc. `1ms` is the value the reduced-motion layer already
*  uses for the same reason. */
var MOTION_SPEEDS = {
	off: .001,
	calm: .72,
	lively: 1.35
};
var MOTION_EASINGS = {
	soft: "cubic-bezier(0.22, 0.61, 0.36, 1)",
	snappy: "cubic-bezier(0.2, 1.35, 0.4, 1)",
	linear: "linear"
};
/** The alpha of the veil behind a modal, a drawer or the mega menu. */
var OVERLAYS = {
	light: .42,
	dark: .78
};
var oneOf$1 = (raw, allowed, fallback) => allowed.includes(raw) ? raw : fallback;
var RADIUS_KEYS = [
	"theme",
	"0",
	"8",
	"12",
	"18",
	"22"
];
var CONTAINER_KEYS = [
	"theme",
	"1200",
	"1280",
	"1440",
	"1600"
];
var GUTTER_KEYS = [
	"theme",
	"16",
	"24",
	"32",
	"40"
];
var GAP_KEYS = [
	"theme",
	"24",
	"48",
	"80"
];
var SURFACE_KEYS = [
	"theme",
	"warm",
	"cool",
	"neutral"
];
var TONE_KEYS = [
	"theme",
	"strong",
	"soft",
	"warm"
];
var BORDER_KEYS = [
	"theme",
	"soft",
	"strong"
];
var TYPE_SCALE_KEYS = [
	"theme",
	"90",
	"95",
	"105",
	"110",
	"115"
];
var LH_KEYS = [
	"theme",
	"tight",
	"normal",
	"relaxed"
];
var HEADING_FONT_KEYS = [
	"theme",
	"main",
	"display"
];
var HEADING_WEIGHT_KEYS = [
	"theme",
	"600",
	"700",
	"800"
];
var DENSITY_KEYS = [
	"theme",
	"compact",
	"normal",
	"relaxed"
];
var BUTTON_SHAPE_KEYS = [
	"theme",
	"pill",
	"rounded",
	"square"
];
var SHADOW_KEYS = [
	"theme",
	"none",
	"soft",
	"medium",
	"strong"
];
var BUTTON_HEIGHT_KEYS = [
	"theme",
	"36",
	"40",
	"44",
	"48",
	"52"
];
var BUTTON_SIZE_KEYS = [
	"theme",
	"sm",
	"md",
	"lg"
];
var BUTTON_WEIGHT_KEYS = [
	"theme",
	"500",
	"600",
	"700",
	"800"
];
var MEDIA_RADIUS_KEYS = [
	"theme",
	"none",
	"small",
	"medium",
	"large",
	"round"
];
var ICON_SIZE_KEYS = [
	"theme",
	"14",
	"16",
	"18",
	"20",
	"24"
];
var MOTION_SPEED_KEYS = [
	"theme",
	"off",
	"calm",
	"lively"
];
var MOTION_EASING_KEYS = [
	"theme",
	"soft",
	"snappy",
	"linear"
];
var OVERLAY_KEYS = [
	"theme",
	"light",
	"dark"
];
/**
* A value that is safe to put in a `style` attribute.
*
* The field is a colour picker, but a settings payload is not a trusted
* channel — the same reason `MapLocation.mapSrc()` exists. Anything that is
* not a hex colour or a plain `rgb()/hsl()` call is dropped, so a pasted
* `url(…)` or `;background:red` cannot escape into the stylesheet.
*/
function isCssColor(value) {
	const text = value.trim();
	if (!text) return false;
	if (/^#[0-9a-f]{3,8}$/i.test(text)) return true;
	return /^(rgb|hsl)a?\(\s*[0-9.,%\s/]+\)$/i.test(text);
}
function readGlobalSettings(settings) {
	const d = GLOBAL_SETTINGS_DEFAULTS;
	const read = (key, allowed, fallback) => oneOf$1(readText(settings, key, PREFIX$1, fallback), allowed, fallback);
	return {
		accentMode: read("accent_mode", ["salla", "custom"], d.accentMode),
		accent: readText(settings, "accent_color", PREFIX$1, d.accent),
		radius: read("radius", RADIUS_KEYS, d.radius),
		container: read("container", CONTAINER_KEYS, d.container),
		gutter: read("gutter", GUTTER_KEYS, d.gutter),
		sectionGap: read("section_gap", GAP_KEYS, d.sectionGap),
		surfacePreset: read("surface_preset", SURFACE_KEYS, d.surfacePreset),
		textTone: read("text_tone", TONE_KEYS, d.textTone),
		borderStrength: read("border_strength", BORDER_KEYS, d.borderStrength),
		typeScale: read("type_scale", TYPE_SCALE_KEYS, d.typeScale),
		lineHeight: read("line_height", LH_KEYS, d.lineHeight),
		headingFont: read("heading_font", HEADING_FONT_KEYS, d.headingFont),
		headingWeight: read("heading_weight", HEADING_WEIGHT_KEYS, d.headingWeight),
		density: read("density", DENSITY_KEYS, d.density),
		buttonShape: read("button_shape", BUTTON_SHAPE_KEYS, d.buttonShape),
		shadow: read("shadow", SHADOW_KEYS, d.shadow),
		buttonHeight: read("button_height", BUTTON_HEIGHT_KEYS, d.buttonHeight),
		buttonSize: read("button_size", BUTTON_SIZE_KEYS, d.buttonSize),
		buttonWeight: read("button_weight", BUTTON_WEIGHT_KEYS, d.buttonWeight),
		mediaRadius: read("media_radius", MEDIA_RADIUS_KEYS, d.mediaRadius),
		iconSize: read("icon_size", ICON_SIZE_KEYS, d.iconSize),
		motionSpeed: read("motion_speed", MOTION_SPEED_KEYS, d.motionSpeed),
		motionEasing: read("motion_easing", MOTION_EASING_KEYS, d.motionEasing),
		overlay: read("overlay", OVERLAY_KEYS, d.overlay),
		scrollReveal: readBoolean(settings, "enable_scroll_reveal", PREFIX$1, d.scrollReveal),
		cardBorder: readBoolean(settings, "card_border", PREFIX$1, d.cardBorder),
		reduceMotion: readBoolean(settings, "reduce_motion", PREFIX$1, d.reduceMotion)
	};
}
/**
* The custom properties for `<html>` — only the ones the merchant set.
*
* Written by the server-rendered document shell, so a block never paints one
* frame of the old design while a client effect catches up.
*
* The names are mostly the TOKEN names (`--shadow-sm`, `--type-scale`) rather
* than a parallel `--gs-*` namespace: the value is a plain replacement for a
* token `:root` already declares, so writing it inline on `<html>` is the
* whole bridge and there is no copy to drift. Only the palette keeps the
* `--gs-` prefix, because it has to be re-pointed from a `:not(.dark)`
* stylesheet rule (see the module header).
*/
function globalVars(g) {
	const vars = {};
	if (g.accentMode === "custom" && isCssColor(g.accent)) vars["--gs-accent"] = g.accent.trim();
	const radius = RADIUS_PX[g.radius];
	if (radius !== void 0) {
		vars["--gs-radius"] = `${radius}px`;
		vars["--radius-scale"] = String(Number((radius / 22).toFixed(4)));
	}
	const container = CONTAINER_PX[g.container];
	if (container !== void 0) {
		vars["--gs-container"] = `${container}px`;
		vars["--container-max"] = `${container}px`;
	}
	const gutter = GUTTER_PX[g.gutter];
	if (gutter !== void 0) vars["--gs-gutter"] = `${gutter}px`;
	const gap = SECTION_GAP_PX[g.sectionGap];
	if (gap !== void 0) vars["--gs-section-gap"] = `${gap}px`;
	const surface = SURFACE_PRESETS[g.surfacePreset];
	if (surface) {
		vars["--gs-canvas"] = surface.canvas;
		vars["--gs-surface-1"] = surface.s1;
		vars["--gs-surface-2"] = surface.s2;
		vars["--gs-surface-3"] = surface.s3;
		vars["--gs-ink-3"] = surface.ink3;
		vars["--gs-card-surface"] = "var(--gs-surface-1)";
		vars["--gs-card-image-day"] = surface.s2;
		vars["--gs-card-image-night"] = surface.night.s2;
		vars["--gs-canvas-night"] = surface.night.canvas;
		vars["--gs-surface-1-night"] = surface.night.s1;
		vars["--gs-surface-2-night"] = surface.night.s2;
		vars["--gs-surface-3-night"] = surface.night.s3;
		vars["--gs-ink-3-night"] = surface.night.ink3;
	}
	const tone = TEXT_TONES[g.textTone];
	if (tone) {
		vars["--gs-ink-1"] = tone.ink1;
		vars["--gs-ink-2"] = tone.ink2;
		vars["--gs-ink-1-night"] = tone.night.ink1;
		vars["--gs-ink-2-night"] = tone.night.ink2;
	}
	const border = BORDER_STRENGTHS[g.borderStrength];
	if (border) {
		vars["--gs-line-1"] = border.line1;
		vars["--gs-line-2"] = border.line2;
		vars["--gs-line-1-night"] = border.night.line1;
		vars["--gs-line-2-night"] = border.night.line2;
	}
	const scale = TYPE_SCALES[g.typeScale];
	if (scale !== void 0) vars["--type-scale"] = String(scale);
	const lh = LINE_HEIGHTS[g.lineHeight];
	if (lh !== void 0) vars["--line-scale"] = String(lh);
	const headingFont = HEADING_FONTS[g.headingFont];
	if (headingFont) vars["--font-heading"] = headingFont;
	const headingWeight = HEADING_WEIGHTS[g.headingWeight];
	if (headingWeight !== void 0) vars["--fw-heading"] = String(headingWeight);
	const density = DENSITIES[g.density];
	if (density !== void 0) vars["--density"] = String(density);
	const shape = BUTTON_SHAPES[g.buttonShape];
	if (shape) vars["--radius-button"] = shape;
	const media = MEDIA_RADII[g.mediaRadius];
	if (media) vars["--radius-media"] = media;
	const shadows = SHADOWS[g.shadow];
	if (shadows) {
		vars["--shadow-xs"] = shadows.xs;
		vars["--shadow-sm"] = shadows.sm;
		vars["--shadow-md"] = shadows.md;
		vars["--shadow-lg"] = shadows.lg;
		vars["--shadow-card"] = shadows.card;
		vars["--shadow-night"] = shadows.night;
	}
	const buttonHeight = BUTTON_HEIGHTS[g.buttonHeight];
	if (buttonHeight !== void 0) vars["--btn-h"] = `${buttonHeight}px`;
	const buttonSize = BUTTON_SIZES[g.buttonSize];
	if (buttonSize) vars["--btn-fs"] = buttonSize;
	const buttonWeight = BUTTON_WEIGHTS[g.buttonWeight];
	if (buttonWeight !== void 0) vars["--btn-fw"] = String(buttonWeight);
	const icon = ICON_SIZES[g.iconSize];
	if (icon !== void 0) vars["--icon-size"] = `${icon}px`;
	const speed = MOTION_SPEEDS[g.motionSpeed];
	if (speed !== void 0) vars["--motion-scale"] = String(speed);
	const easing = MOTION_EASINGS[g.motionEasing];
	if (easing) {
		vars["--ease-out"] = easing;
		vars["--ease-in-out"] = easing;
		vars["--ease-utility-out"] = easing;
		vars["--ease-utility-in-out"] = easing;
	}
	const overlay = OVERLAYS[g.overlay];
	if (overlay !== void 0) vars["--overlay-alpha"] = String(overlay);
	return vars;
}
/**
* Every custom property `globalVars()` can emit.
*
* Exists so {@link applyGlobalSettings} can CLEAR a property the merchant has
* just set back to `theme`: `style.removeProperty` needs the name, and a
* leftover inline declaration would pin the old value forever (inline beats
* every stylesheet rule, so the token could never come back). Listing them
* here also gives `tests/settings/global-effects.test.ts` something to hold
* `globalVars()` against — a property emitted but not listed would never be
* cleared, and one listed but never emitted would be dead weight.
*/
var GLOBAL_VAR_NAMES = [
	"--gs-accent",
	"--gs-canvas",
	"--gs-card-surface",
	"--gs-card-image-day",
	"--gs-card-image-night",
	"--gs-surface-1",
	"--gs-surface-2",
	"--gs-surface-3",
	"--gs-ink-1",
	"--gs-ink-2",
	"--gs-ink-3",
	"--gs-line-1",
	"--gs-line-2",
	"--gs-canvas-night",
	"--gs-surface-1-night",
	"--gs-surface-2-night",
	"--gs-surface-3-night",
	"--gs-ink-1-night",
	"--gs-ink-2-night",
	"--gs-ink-3-night",
	"--gs-line-1-night",
	"--gs-line-2-night",
	"--gs-radius",
	"--radius-scale",
	"--gs-container",
	"--container-max",
	"--gs-gutter",
	"--gs-section-gap",
	"--density",
	"--radius-button",
	"--radius-media",
	"--type-scale",
	"--line-scale",
	"--font-heading",
	"--fw-heading",
	"--shadow-xs",
	"--shadow-sm",
	"--shadow-md",
	"--shadow-lg",
	"--shadow-card",
	"--shadow-night",
	"--btn-h",
	"--btn-fs",
	"--btn-fw",
	"--icon-size",
	"--motion-scale",
	"--ease-out",
	"--ease-in-out",
	"--ease-utility-out",
	"--ease-utility-in-out",
	"--overlay-alpha"
];
/** Every `data-` attribute {@link globalAttributes} can emit. */
var GLOBAL_ATTR_NAMES = [
	"data-gs-media",
	"data-gs-btn",
	"data-gs-icon",
	"data-gs-card-border",
	"data-gs-shadow",
	"data-gs-heading-weight",
	"data-gs-container",
	"data-reduce-motion"
];
/**
* The switches that are not a scale.
*
* `cardBorder` and `reduceMotion` cannot be a custom property: one has to beat
* a component's own single-class rule and the other has to beat twenty
* `prefers-reduced-motion` blocks, so both are expressed as a `data-` attribute
* on `<html>` and styled from `global-settings.scss`. They live here so
* `__root.tsx` derives the whole surface from one object and a new switch has
* one obvious place to be added.
*/
function globalAttributes(g) {
	const attrs = {};
	if (g.mediaRadius !== "theme") attrs["data-gs-media"] = "1";
	if (g.buttonShape !== "theme") attrs["data-gs-btn"] = "1";
	if (g.iconSize !== "theme") attrs["data-gs-icon"] = "1";
	if (!g.cardBorder) attrs["data-gs-card-border"] = "off";
	if (g.shadow !== "theme") attrs["data-gs-shadow"] = g.shadow;
	if (g.headingWeight !== "theme") attrs["data-gs-heading-weight"] = g.headingWeight;
	if (g.container !== "theme") attrs["data-gs-container"] = "1";
	if (g.reduceMotion) attrs["data-reduce-motion"] = "1";
	return attrs;
}
/**
* Write the whole surface onto `<html>` from the browser — the SAME two
* emitters the server render uses, so there is no second source of truth.
*
* Why this exists at all: the server render covers the merchant's SAVED
* values, and that is the channel a storefront needs. It does not cover a
* value that changes after the first byte — the theme editor's live preview
* merges its state into `theme.settings` on the client only
* (`TwilightProvider` spreads `useDevSettingsOverrides()`), so without this
* writer a merchant dragging the radius slider would see nothing until a
* reload. Production and preview therefore go through one code path.
*
* Clearing is part of the job: setting a control back to "theme" has to
* RESTORE the token, and an inline declaration out-ranks every stylesheet
* rule, so a leftover property would pin the old value for good. The names
* come from {@link GLOBAL_VAR_NAMES}, never from the element, so unrelated
* inline properties are never touched.
*/
function applyGlobalSettings(g, el) {
	if (typeof document === "undefined") return;
	const root = el ?? document.documentElement;
	if (!root) return;
	const vars = globalVars(g);
	for (const name of GLOBAL_VAR_NAMES) {
		const value = vars[name];
		if (value === void 0) root.style.removeProperty(name);
		else root.style.setProperty(name, value);
	}
	const attrs = globalAttributes(g);
	for (const name of GLOBAL_ATTR_NAMES) {
		const value = attrs[name];
		if (value === void 0) root.removeAttribute(name);
		else root.setAttribute(name, value);
	}
}
/**
* Handed down as context so a block can make a decision CSS cannot (show a
* badge, pick a layout) without calling `useTwilight()` itself — the same
* contract `ProductCardSettingsContext` follows, and for the same reason: a
* block must survive being rendered alone in a test or the editor.
*/
var GlobalSettingsContext = (0, import_react.createContext)(GLOBAL_SETTINGS_DEFAULTS);
//#endregion
//#region app/lib/productCardSettings.ts
/**
* The image-ratio geometry each choice stands for, as TWO derived values of ONE
* setting — never two sources of truth:
*
* - `pad` is the `padding-bottom` percentage the store card's ratio block uses
*   (the engine's own `<Image>` wrapper carries an inline `aspect-ratio` that
*   has to be beaten with `!important`, so the card keeps the padding
*   technique). `100%` = square, `75%` = landscape, `133.3333%` = portrait.
* - `num` is the `aspect-ratio` number the mega menu's media plate reads — the
*   curtain card is theme markup with no engine internals inside it, so it can
*   take the plain property.
*
* A component override re-declares the same two values on its own subtree, so
* the ratio now inherits by default and overrides per component, exactly like
* every other `--pc-*` property.
*/
var RATIO_GEOMETRY = {
	square: {
		num: "1",
		pad: "100%"
	},
	landscape: {
		num: "1.3333",
		pad: "75%"
	},
	portrait: {
		num: "0.75",
		pad: "133.3333%"
	}
};
/**
* The two motions one hover choice stands for, as the values the stylesheets
* interpolate — again ONE setting, two derived variables, so the store card and
* the mega card cannot answer "what happens on hover" differently.
*
* `lift` is the tile's rise; `zoom` is the photo's scale inside its plate. They
* stay separate because they are different layers: folding the zoom into the
* tile's transform would scale the title, the badge and the price with it.
*/
var HOVER_GEOMETRY = {
	both: {
		lift: "-4px",
		zoom: "1.045"
	},
	lift: {
		lift: "-4px",
		zoom: "1"
	},
	zoom: {
		lift: "0px",
		zoom: "1.045"
	},
	none: {
		lift: "0px",
		zoom: "1"
	}
};
var PREFIX = "product_card";
var oneOf = (raw, allowed, fallback) => allowed.includes(raw) ? raw : fallback;
/** Defaults are the reference design's own numbers, so a store that never
*  opens the panel still gets the card the merchant asked for. */
var PRODUCT_CARD_DEFAULTS = {
	badge: true,
	rating: true,
	ratingCount: true,
	ratingEmpty: true,
	desc: true,
	descLines: 2,
	wishlist: true,
	gallery: true,
	cart: "circle",
	radius: 22,
	bg: "#fdfaf3",
	imageBg: "#f4ebdc",
	ink: "#2b2519",
	shadow: "soft",
	font: "main",
	ratio: "square",
	imgFit: "cover",
	imgPosition: "center",
	hover: "both"
};
/**
* The settings travel down from the layout as CONTEXT; the card does not read
* `useTwilight()` itself.
*
* The engine's `useTwilight()` throws when there is no `TwilightProvider`, and
* a card is a leaf that can legitimately be rendered on its own — a unit test,
* an editor preview, a block's static HTML. Making the card depend on that
* provider meant one isolated render took down the whole tree. A context whose
* initial value is the reference defaults keeps that case a real card, and it
* also means the merchant's settings are read ONCE (in `ThemeLayout`) instead
* of once per card in a grid of forty.
*/
var ProductCardSettingsContext = (0, import_react.createContext)(PRODUCT_CARD_DEFAULTS);
function useProductCardSettings() {
	return (0, import_react.useContext)(ProductCardSettingsContext);
}
function readProductCardSettings(settings) {
	const d = PRODUCT_CARD_DEFAULTS;
	return {
		badge: readBoolean(settings, "badge", PREFIX, d.badge),
		rating: readBoolean(settings, "rating", PREFIX, d.rating),
		ratingCount: readBoolean(settings, "rating_count", PREFIX, d.ratingCount),
		ratingEmpty: readBoolean(settings, "rating_empty", PREFIX, d.ratingEmpty),
		desc: readBoolean(settings, "desc", PREFIX, d.desc),
		descLines: Math.min(4, Math.max(1, Math.round(readNumber(settings, "desc_lines", PREFIX, d.descLines)))),
		wishlist: readBoolean(settings, "wishlist", PREFIX, d.wishlist),
		gallery: readBoolean(settings, "gallery", PREFIX, d.gallery),
		cart: oneOf(readText(settings, "cart_style", PREFIX, d.cart), ["circle", "bar"], d.cart),
		radius: Math.min(44, Math.max(0, Math.round(readNumber(settings, "radius", PREFIX, d.radius)))),
		bg: readText(settings, "bg", PREFIX, d.bg),
		imageBg: readText(settings, "image_bg", PREFIX, d.imageBg),
		ink: readText(settings, "ink", PREFIX, d.ink),
		shadow: oneOf(readText(settings, "shadow", PREFIX, d.shadow), [
			"none",
			"soft",
			"lift"
		], d.shadow),
		font: oneOf(readText(settings, "title_font", PREFIX, d.font), ["main", "serif"], d.font),
		ratio: oneOf(readText(settings, "img_ratio", PREFIX, d.ratio), [
			"square",
			"landscape",
			"portrait"
		], d.ratio),
		imgFit: oneOf(readText(settings, "img_fit", PREFIX, d.imgFit), ["cover", "contain"], d.imgFit),
		imgPosition: oneOf(readText(settings, "img_position", PREFIX, d.imgPosition), [
			"center",
			"top",
			"bottom"
		], d.imgPosition),
		hover: oneOf(readText(settings, "hover", PREFIX, d.hover), [
			"both",
			"lift",
			"zoom",
			"none"
		], d.hover)
	};
}
/**
* The settings as the custom properties the stylesheet reads.
*
* Written on `.app-inner` (which already carries `product-card-img--<ratio>`)
* rather than per card: the card is re-rendered by every list, and a variable
* that only exists after a component mounts paints one frame of the old
* design. The layout is server-rendered, so these land with the first byte.
*
* Values are plain strings; React writes them verbatim for `--*` keys.
*
* WHY TWO OF THEM ARE A REFERENCE AND NOT A NUMBER
* ------------------------------------------------
* The card is the largest surface on the storefront, and its corner and panel
* used to be pinned to `22px` / `#fdfaf3` no matter what the store settings
* said — so `global_radius` and `global_surface_preset` moved every element on
* the page except the one the customer is looking at. (A value written inline
* on `.app-inner` out-ranks the stylesheet, so the card's own `:root` default
* could never be re-pointed.)
*
* The fix keeps the card's own setting authoritative — pick any other corner
* or colour in the card panel and it is written as a literal, exactly as
* before — and makes the DEFAULT a reference to the store's role, with the
* card's designed value as the fallback:
*
*   `var(--radius-card, 22px)`  →  22px unless the store radius moved
*   `var(--gs-card-surface, #fdfaf3)` → ivory unless a surface preset was chosen
*
* At night neither matters: `02-generic/dark.scss` paints `.s-product-card`
* from `--surface-1`, which the night bridge already re-points.
*/
function productCardVars(s) {
	const d = PRODUCT_CARD_DEFAULTS;
	return {
		"--pc-radius": s.radius === d.radius ? "var(--radius-card, 22px)" : `${s.radius}px`,
		"--pc-bg": s.bg === d.bg ? "var(--gs-card-surface, #fdfaf3)" : s.bg,
		"--pc-image-bg": s.imageBg === d.imageBg ? "var(--surface-media, #f4ebdc)" : s.imageBg,
		"--pc-ink": s.ink,
		"--pc-desc-lines": String(s.descLines),
		"--pc-ar-num": RATIO_GEOMETRY[s.ratio].num,
		"--pc-ar-pad": RATIO_GEOMETRY[s.ratio].pad,
		"--pc-img-fit": s.imgFit,
		"--pc-img-pos": s.imgPosition,
		"--pc-hover-lift": HOVER_GEOMETRY[s.hover].lift,
		"--pc-img-zoom": HOVER_GEOMETRY[s.hover].zoom
	};
}
/** The switches that change *which elements exist*, as data attributes — CSS
*  reads them, so the markup stays the engine's and nothing re-renders. */
function productCardFlags(s) {
	return {
		"data-pc-badge": s.badge ? "1" : "0",
		"data-pc-rating": s.rating ? "1" : "0",
		"data-pc-rating-count": s.ratingCount ? "1" : "0",
		"data-pc-rating-empty": s.ratingEmpty ? "1" : "0",
		"data-pc-desc": s.desc ? "1" : "0",
		"data-pc-desc-lines": String(s.descLines),
		"data-pc-wish": s.wishlist ? "1" : "0",
		"data-pc-gallery": s.gallery ? "1" : "0",
		"data-pc-cart": s.cart,
		"data-pc-shadow": s.shadow,
		"data-pc-font": s.font
	};
}
/**
* The prefix a component's override fields are saved under.
*
* It is a PARAMETER, not a constant, because the second layer belongs to the
* system rather than to the mega menu: a new component that renders products
* calls `readProductCardOverrides(data, 'featured_card')` and gets the same
* gate, the same per-property inheritance and the same writers — without a
* second copy of this file and without re-deciding what a card is.
*
* `mega_card` is the shipped instance and stays the default, so every value
* already saved in a store keeps resolving exactly as before.
*/
var PRODUCT_CARD_OVERRIDE_PREFIX = "mega_card";
/** The state a component is in before its panel is ever opened — and the
*  state the master gate restores, whatever stale values remain saved. */
var PRODUCT_CARD_OVERRIDES_INHERIT = {
	customize: false,
	ratio: "inherit",
	radius: "inherit",
	shadow: "inherit",
	font: "inherit",
	cart: "inherit",
	imgFit: "inherit",
	imgPosition: "inherit",
	hover: "inherit",
	bg: "",
	imageBg: "",
	ink: "",
	badge: "inherit",
	wishlist: "inherit",
	desc: "inherit",
	rating: "inherit"
};
/** The radius choices the override panel offers. They are the global panel's
*  own steps (an integer there, a list here because a list can say `inherit`). */
var RADIUS_CHOICES = [
	"inherit",
	"0",
	"8",
	"12",
	"18",
	"22",
	"28",
	"34",
	"44"
];
/** A colour override: only a real CSS colour, and never the global default
*  (that value is how "back to inherit" looks in a picker that cannot be
*  empty — the `headerVars` rule). */
function colourOverride(value, globalDefault) {
	const colour = value.trim();
	if (!colour || colour === globalDefault) return "";
	return isCssColor(colour) ? colour : "";
}
function readProductCardOverrides(settings, prefix = PRODUCT_CARD_OVERRIDE_PREFIX) {
	if (!readBoolean(settings, "customize", prefix, false)) return PRODUCT_CARD_OVERRIDES_INHERIT;
	const d = PRODUCT_CARD_DEFAULTS;
	const choice = (key) => readText(settings, key, prefix, "inherit");
	const rawRadius = readText(settings, "radius", prefix, "inherit");
	const radius = RADIUS_CHOICES.includes(rawRadius) ? rawRadius === "inherit" ? "inherit" : Number(rawRadius) : "inherit";
	const tri = (key) => {
		const raw = choice(key);
		return raw === "on" || raw === "off" ? raw : "inherit";
	};
	const oneOf = (raw, allowed, fallback) => allowed.includes(raw) ? raw : fallback;
	return {
		customize: true,
		ratio: oneOf(choice("ratio"), [
			"inherit",
			"square",
			"landscape",
			"portrait"
		], "inherit"),
		radius,
		shadow: oneOf(choice("shadow"), [
			"inherit",
			"none",
			"soft",
			"lift"
		], "inherit"),
		font: oneOf(choice("font"), [
			"inherit",
			"main",
			"serif"
		], "inherit"),
		cart: oneOf(choice("cart"), [
			"inherit",
			"circle",
			"bar"
		], "inherit"),
		imgFit: oneOf(choice("img_fit"), [
			"inherit",
			"cover",
			"contain"
		], "inherit"),
		imgPosition: oneOf(choice("img_position"), [
			"inherit",
			"center",
			"top",
			"bottom"
		], "inherit"),
		hover: oneOf(choice("hover"), [
			"inherit",
			"both",
			"lift",
			"zoom",
			"none"
		], "inherit"),
		bg: colourOverride(readText(settings, "bg", prefix, ""), d.bg),
		imageBg: colourOverride(readText(settings, "image_bg", prefix, ""), d.imageBg),
		ink: colourOverride(readText(settings, "ink", prefix, ""), d.ink),
		badge: tri("badge"),
		wishlist: tri("wishlist"),
		desc: tri("desc"),
		rating: tri("rating")
	};
}
/**
* The resolved settings a component's cards actually render with.
*
* Per property: the override when there is one, the global value when there is
* not. Everything the component cannot override (the gallery, the review
* count, the line count, the cart style) passes the global value through — a
* mega card has no gallery by design, and the properties with no local
* rendering in a component are deliberately not overridable there.
*/
function resolveProductCardSettings(global, ov) {
	const from = (local, base) => local === "inherit" ? base : local === "on";
	return {
		...global,
		badge: from(ov.badge, global.badge),
		wishlist: from(ov.wishlist, global.wishlist),
		desc: from(ov.desc, global.desc),
		rating: from(ov.rating, global.rating),
		ratio: ov.ratio === "inherit" ? global.ratio : ov.ratio,
		radius: ov.radius === "inherit" ? global.radius : ov.radius,
		shadow: ov.shadow === "inherit" ? global.shadow : ov.shadow,
		font: ov.font === "inherit" ? global.font : ov.font,
		cart: ov.cart === "inherit" ? global.cart : ov.cart,
		imgFit: ov.imgFit === "inherit" ? global.imgFit : ov.imgFit,
		imgPosition: ov.imgPosition === "inherit" ? global.imgPosition : ov.imgPosition,
		hover: ov.hover === "inherit" ? global.hover : ov.hover,
		bg: ov.bg || global.bg,
		imageBg: ov.imageBg || global.imageBg,
		ink: ov.ink || global.ink
	};
}
/**
* The custom properties an override writes on the component's subtree root —
* **only the overridden ones**. Inheritance is the absence of a declaration,
* so an untouched property never carries a copy of the global value that
* could rot. `--bg-card` is re-pointed beside `--pc-bg` because the mega
* card's panel reads the chain's card level (`--bg-card`), which is computed
* on `.app-inner`; the night block re-points both ON the card itself, so a
* colour override stays a day-only decision exactly like the global colours.
*/
function productCardOverrideVars(ov) {
	const vars = {};
	if (ov.ratio !== "inherit") {
		vars["--pc-ar-num"] = RATIO_GEOMETRY[ov.ratio].num;
		vars["--pc-ar-pad"] = RATIO_GEOMETRY[ov.ratio].pad;
	}
	if (ov.radius !== "inherit") vars["--pc-radius"] = `${ov.radius}px`;
	if (ov.imgFit !== "inherit") vars["--pc-img-fit"] = ov.imgFit;
	if (ov.imgPosition !== "inherit") vars["--pc-img-pos"] = ov.imgPosition;
	if (ov.hover !== "inherit") {
		vars["--pc-hover-lift"] = HOVER_GEOMETRY[ov.hover].lift;
		vars["--pc-img-zoom"] = HOVER_GEOMETRY[ov.hover].zoom;
	}
	if (ov.bg) {
		vars["--pc-bg"] = ov.bg;
		vars["--bg-card"] = ov.bg;
	}
	if (ov.imageBg) vars["--pc-image-bg"] = ov.imageBg;
	if (ov.ink) vars["--pc-ink"] = ov.ink;
	return vars;
}
/**
* The data attributes an override writes on the component's subtree root.
*
* Shadow and title font are attribute-driven in the stylesheet (the card's
* own rules key off `[data-pc-shadow]` / `[data-pc-font]`), and an attribute
* on a nearer ancestor does not beat a same-specificity rule on a farther
* one — so the stylesheet carries explicitly scoped rules for the override
* host. The switches (badge / wishlist / desc / rating) need no attribute:
* the curtain's cards are React markup reading the resolved context.
*/
function productCardOverrideAttrs(ov) {
	const attrs = {};
	if (ov.shadow !== "inherit") attrs["data-pc-shadow"] = ov.shadow;
	if (ov.font !== "inherit") attrs["data-pc-font"] = ov.font;
	if (ov.cart !== "inherit") attrs["data-pc-cart"] = ov.cart;
	return attrs;
}
//#endregion
//#region app/lib/productBadge.ts
var OUT_STATUSES = ["out", "out-and-notify"];
/**
* The price a discount is measured against — and the one the struck line must
* print.
*
* Two payload shapes reach the cards: a list row whose `price` is already the
* payable figure (with the gross in `regular_price`), and a row whose `price`
* IS the gross. `regular_price ?? price` covers both, and it is the only
* expression that can be right in both — printing `price` alone printed «١٨٨»
* struck beside a live «١٨٨» on the real store. Both the percentage and the
* struck line read this one function, so they can never describe two different
* reductions.
*/
function originalPrice(product) {
	const gross = Number(product.regular_price ?? product.price ?? NaN);
	return Number.isFinite(gross) && gross > 0 ? gross : null;
}
/** The whole-number discount, or `0` when there is no real discount. */
function discountPercent(product) {
	if (!product.is_on_sale) return 0;
	const gross = originalPrice(product);
	const net = Number(product.sale_price ?? NaN);
	if (gross == null || !Number.isFinite(net)) return 0;
	if (net <= 0 || net >= gross) return 0;
	return Math.round((1 - net / gross) * 100);
}
function productBadge(product, outOfStockLabel, options = {}) {
	if (!product) return null;
	if (OUT_STATUSES.includes(product.status ?? "")) return {
		text: outOfStockLabel,
		out: true
	};
	const promo = (product.promotion_title ?? "").trim();
	if (promo && !options.skipPromotion) return {
		text: /^[-\d]/.test(promo) ? `\u2066${promo}\u2069` : promo,
		out: false
	};
	const cut = discountPercent(product);
	if (cut > 0) return {
		text: `\u2066-${cut}%\u2069`,
		out: false
	};
	return null;
}
//#endregion
//#region app/components/product/ProductCardGallery.tsx
function ProductCardGallery({ images, name, anchor, content, dotsHost }) {
	const { t } = useTranslation();
	const trackRef = (0, import_react.useRef)(null);
	const dotsRef = (0, import_react.useRef)(null);
	const [index, setIndex] = (0, import_react.useState)(0);
	const count = images.length;
	const dotsTarget = dotsHost ?? content;
	(0, import_react.useEffect)(() => {
		const picture = anchor.firstElementChild;
		if (!picture) return;
		const previous = picture.style.display;
		picture.style.display = "none";
		return () => {
			picture.style.display = previous;
		};
	}, [anchor]);
	(0, import_react.useEffect)(() => {
		let startX = 0;
		let startY = 0;
		let dragged = false;
		const down = (event) => {
			startX = event.clientX;
			startY = event.clientY;
			dragged = false;
		};
		const move = (event) => {
			if (dragged) return;
			if (Math.abs(event.clientX - startX) > 8 || Math.abs(event.clientY - startY) > 8) dragged = true;
		};
		const click = (event) => {
			if (!dragged) return;
			dragged = false;
			event.preventDefault();
			event.stopPropagation();
		};
		anchor.addEventListener("pointerdown", down);
		anchor.addEventListener("pointermove", move);
		anchor.addEventListener("click", click, true);
		return () => {
			anchor.removeEventListener("pointerdown", down);
			anchor.removeEventListener("pointermove", move);
			anchor.removeEventListener("click", click, true);
		};
	}, [anchor]);
	(0, import_react.useEffect)(() => {
		const track = trackRef.current;
		if (!track) return;
		let frame = 0;
		const read = () => {
			frame = 0;
			const width = track.clientWidth || 1;
			const next = Math.min(count - 1, Math.max(0, Math.round(Math.abs(track.scrollLeft) / width)));
			setIndex((previous) => previous === next ? previous : next);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(read);
		};
		track.addEventListener("scroll", onScroll, { passive: true });
		read();
		return () => {
			track.removeEventListener("scroll", onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [count]);
	const goTo = (0, import_react.useCallback)((target) => {
		(trackRef.current?.children[target])?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "center"
		});
	}, []);
	const onKeyDown = (event) => {
		const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
		if (!step) return;
		event.preventDefault();
		const next = (index + step + count) % count;
		goTo(next);
		(dotsRef.current?.querySelectorAll(".pc-dots__dot"))?.[next]?.focus();
	};
	const label = (position) => t("pages.products.card_image", "الصورة {n} من {total}").replace("{n}", String(position)).replace("{total}", String(count));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pc-gallery",
		ref: trackRef,
		children: images.map((image, position) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pc-gallery__slide",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: image.url,
				alt: position === 0 ? image.alt ?? name : "",
				loading: position === 0 ? "eager" : "lazy",
				decoding: "async",
				draggable: false
			})
		}, `${image.url}-${position}`))
	}), anchor), count > 1 && dotsTarget && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pc-dots",
		role: "group",
		"aria-label": name,
		ref: dotsRef,
		onKeyDown,
		children: images.map((image, position) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "pc-dots__dot",
			"aria-label": label(position + 1),
			"aria-current": position === index ? "true" : void 0,
			tabIndex: position === index ? 0 : -1,
			onClick: () => goTo(position)
		}, `dot-${image.url}-${position}`))
	}), dotsTarget)] });
}
//#endregion
//#region app/components/product/ProductCard.tsx
/** How long a fetched detail stays fresh. A card only needs the gallery and the
*  rating from it, and both change rarely — this keeps a scroll back up the
*  page from re-requesting every product it passes. */
var DETAIL_STALE_MS = 6e5;
/**
* The store's product card.
*
* The design is a **theme setting group** («إعدادات كارت المنتج»), applied as
* custom properties + data attributes on `.app-inner` by `ThemeLayout` — see
* `app/lib/productCardSettings.ts` and `04-components/product-card.scss`. This
* file is only the part CSS cannot do: the content the engine card does not
* render.
*
* 1. **The short line.** The reference card carries a sentence under the name.
*    The engine prints `product.subtitle` there and nothing else, and a Salla
*    list response almost never has one — so the card would be name → price,
*    with the design's middle missing. A product's `description` is present,
*    but it is HTML and often a paragraph: {@link shortLine} strips it and cuts
*    it at a word. A real subtitle always wins, so a merchant who writes one
*    still controls the line.
*
*    Done by *rewriting the prop*, not by injecting DOM after mount: the engine
*    renders the subtitle server-side, so the line is in the first paint and
*    nothing shifts when the card hydrates.
*
* 2. **The review count.** The engine prints the average (`4.8`) and stops.
*    The reference prints `4.8 (120)`. `data-count` on the rating row lets the
*    stylesheet append it with `attr()` — no extra node, no re-render, and the
*    row's height never changes.
*
*    The row itself only exists when the product has stars (`rating?.stars && …`
*    in the engine), so a store with unreviewed products gets cards with the
*    star row and cards without it, in the same grid. {@link ProductCard} fills
*    the empty case with «لا تقييمات» — the merchant's switch, and never a
*    made-up average.
*
* 3. **The gallery.** A product has several photos; a list response carries
*    only the first (`image`), and the type says so: `images` is "detail
*    responses only". So the card fetches its own detail — once, lazily, when
*    it scrolls into view — and hands the photos to {@link ProductCardGallery}.
*    The same fetch fills in `rating`, which some list endpoints omit
*    entirely: without it a card can show stars that the store does have, and
*    the merchant reads that as "the rating is broken".
*
*    Both are behind the `product_card_gallery` switch: a catalogue of ten
*    thousand products should be able to say "no extra requests per card".
*
* Deliberately **not** here: the wishlist button. The engine already renders it
* on the image corner for vertical cards — the design wants exactly that — so
* the old "hide it and portal a copy into the footer" dance is gone. The corner
* button is also the one the engine keeps in sync with `useWishlist` on every
* render, which a portaled copy never could.
*/
function ProductCard(props) {
	const ref = (0, import_react.useRef)(null);
	const settings = useProductCardSettings();
	const { t } = useTranslation();
	const [inView, setInView] = (0, import_react.useState)(false);
	const [hosts, setHosts] = (0, import_react.useState)({
		anchor: null,
		content: null,
		plate: null
	});
	const productId = props.product?.id == null ? "" : String(props.product.id);
	const ownImages = props.product?.images?.length ? props.product.images : null;
	const wantsDetail = settings.gallery && !ownImages && !!productId;
	(0, import_react.useEffect)(() => {
		if (!wantsDetail) return;
		const root = ref.current;
		if (!root) return;
		if (typeof IntersectionObserver === "undefined") {
			setInView(true);
			return;
		}
		const target = root.querySelector(".s-product-card") ?? root.firstElementChild;
		if (!target) {
			setInView(true);
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			setInView(true);
			observer.disconnect();
		}, { rootMargin: "200px" });
		observer.observe(target);
		return () => observer.disconnect();
	}, [wantsDetail]);
	const detail = useQuery({
		...product.queries.detail(productId),
		enabled: wantsDetail && inView,
		staleTime: DETAIL_STALE_MS
	});
	const images = ownImages ?? detail.data?.images ?? [];
	const rating = props.product?.rating ?? detail.data?.rating;
	const reviewCount = Number(rating?.count ?? 0);
	const hasStars = Number(rating?.stars ?? 0) > 0;
	const product$1 = (0, import_react.useMemo)(() => withCardData(props.product, rating), [props.product, rating]);
	(0, import_react.useEffect)(() => {
		const root = ref.current;
		if (!root) return;
		const sync = () => {
			root.querySelectorAll("salla-add-product-button").forEach((el) => {
				el.setAttribute("fill", "solid");
				el.setAttribute("loader-position", "center");
			});
			if (reviewCount > 0) root.querySelector(".s-product-card-rating")?.setAttribute("data-count", String(reviewCount));
			const anchor = root.querySelector(".s-product-card-image > a");
			const content = root.querySelector(".s-product-card-content");
			const plate = root.querySelector(".s-product-card-image");
			setHosts((previous) => previous.anchor === anchor && previous.content === content && previous.plate === plate ? previous : {
				anchor,
				content,
				plate
			});
		};
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(root, {
			childList: true,
			subtree: true
		});
		return () => observer.disconnect();
	}, [reviewCount]);
	const gallery = settings.gallery && images.length > 1 && hosts.anchor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCardGallery, {
		images,
		name: product$1.name,
		anchor: hosts.anchor,
		content: hosts.content,
		dotsHost: hosts.plate
	}) : null;
	const emptyRating = settings.rating && settings.ratingEmpty && !hasStars && hosts.content ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pc-rating",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
			className: "sicon-star2",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("pages.products.no_ratings", "لا تقييمات") })]
	}), hosts.content) : null;
	const badge = settings.badge ? productBadge(product$1, t("pages.products.out_of_stock", "نفدت الكمية"), { skipPromotion: true }) : null;
	const discountBadge = badge && hosts.plate ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `pc-badge${badge.out ? " pc-badge--out" : ""}`,
		children: badge.text
	}), hosts.plate) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		style: { display: "contents" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard$1, {
				...props,
				product: product$1
			}),
			gallery,
			emptyRating,
			discountBadge
		]
	});
}
/** Long enough for two lines at a card's width, short enough that the cut is
*  never mid-sentence in a place the eye notices. */
var SHORT_LINE_MAX = 150;
/** Block-level tags become line breaks before the tags are stripped — without
*  this, a `<ul>` of size rows collapses into one run (`36الطول:130`) and the
*  card prints a spec table as if it were a sentence. */
var BLOCK_TAGS = /<\/(?:p|li|div|h[1-6]|tr|td|th|blockquote|figcaption)>|<br\s*\/?>/gi;
function decodeEntities(html) {
	return html.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&nbsp;/g, " ").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
/** HTML → one line of text, block boundaries kept as `\n`.
*
*  Order matters: a description can arrive escaped (`&lt;p class="…"&gt;`),
*  and stripping tags BEFORE decoding leaves the markup on the card as visible
*  text — the store printed `p class="ql-direction-rtl"> <span …` under a
*  product name. So decode, strip, and repeat while decoding keeps revealing
*  tags; the loop settles on plain prose in one or two passes for a normal
*  description and stops immediately when there is nothing to decode. */
function plainText(html) {
	let text = html;
	for (let pass = 0; pass < 4; pass += 1) {
		const next = decodeEntities(text.replace(BLOCK_TAGS, "\n").replace(/<[^>]*>/g, " "));
		if (next === text) break;
		text = next;
	}
	return text.split("\n").map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
}
/**
* The one line of a product description that belongs on a card.
*
* A Salla description is often not prose: this store's are size tables
* (`المقاس:36 الطول:130 الكم:5.5`). Cutting the first 150 characters of that
* prints a column of numbers under the product name, which reads as a bug.
*
* So the text is split into fragments and the first one that *reads like a
* sentence* wins — at least five words, and fewer than one character in five
* being a digit. A product whose description is nothing but a spec table
* returns `''`, and the card simply has no line: an absent sentence is better
* than a false one.
*/
function descriptionLine(html) {
	if (!html) return "";
	const fragments = plainText(html).split(/\n+|(?<=[.!؟?])\s+/);
	for (const fragment of fragments) {
		const text = fragment.trim();
		if (!text) continue;
		const words = text.split(/\s+/).length;
		const digits = (text.match(/[\d٠-٩]/g) ?? []).length;
		if (words >= 5 && digits / text.length < .18) return text;
	}
	return "";
}
/** The card's short line: the merchant's subtitle if there is one, otherwise
*  the first real sentence of the description, cut at a word boundary.
*  Returns `''` when the product has neither — the stylesheet then drops the
*  row entirely instead of reserving an empty one. */
function shortLine(product) {
	if (!product) return "";
	const subtitle = (product.subtitle ?? "").trim();
	if (subtitle) return subtitle;
	const text = descriptionLine(product.description);
	if (!text || text.length <= SHORT_LINE_MAX) return text;
	const cut = text.slice(0, SHORT_LINE_MAX);
	const space = cut.lastIndexOf(" ");
	return `${(space > 60 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
/**
* The product as the engine card should receive it: a short line where the
* list left none, and a rating the list may have dropped.
*
* Returns the SAME object when neither applies — the engine card is memoised
* and a needless new identity re-renders every card in the list.
*/
function withCardData(product, rating) {
	const line = (product?.subtitle ?? "").trim() ? "" : shortLine(product);
	const needsRating = !!rating && !product?.rating;
	if (!line && !needsRating) return product;
	return {
		...product,
		...line ? { subtitle: line } : null,
		...needsRating ? { rating } : null
	};
}
//#endregion
//#region app/hooks/useDragScroll.ts
var DRAG_THRESHOLD = 3;
/**
* Click-and-drag horizontal scrolling for mouse / pen (touch keeps its native
* momentum). Spread the returned handlers onto the scroll container.
*
* The pointer is captured only once the drag passes {@link DRAG_THRESHOLD}px.
* Capturing on `pointerdown` retargets the follow-up `click` to the container,
* so a click on a link / button inside a slide would never reach it — the
* "similar products" cards became unclickable. Once a real drag happens,
* `onClickCapture` swallows the trailing click so it doesn't activate a slide.
*/
function useDragScroll(ref) {
	const state = (0, import_react.useRef)({
		active: false,
		startX: 0,
		startScroll: 0,
		moved: false,
		pointerId: -1
	});
	const onPointerDown = (event) => {
		const el = ref.current;
		if (!el || event.pointerType === "touch" || event.button !== 0) return;
		state.current = {
			active: true,
			startX: event.clientX,
			startScroll: el.scrollLeft,
			moved: false,
			pointerId: event.pointerId
		};
	};
	const onPointerMove = (event) => {
		const el = ref.current;
		if (!el || !state.current.active) return;
		const delta = event.clientX - state.current.startX;
		if (!state.current.moved) {
			if (Math.abs(delta) <= DRAG_THRESHOLD) return;
			state.current.moved = true;
			el.setPointerCapture?.(state.current.pointerId);
			el.classList.add("is-dragging");
		}
		el.scrollLeft = state.current.startScroll - delta;
	};
	const endDrag = () => {
		const el = ref.current;
		if (!state.current.active) return;
		state.current.active = false;
		try {
			el?.releasePointerCapture?.(state.current.pointerId);
		} catch {}
		el?.classList.remove("is-dragging");
	};
	const onClickCapture = (event) => {
		if (!state.current.moved) return;
		state.current.moved = false;
		event.preventDefault();
		event.stopPropagation();
	};
	const onDragStart = (event) => event.preventDefault();
	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: endDrag,
		onPointerCancel: endDrag,
		onClickCapture,
		onDragStart
	};
}
//#endregion
//#region app/lib/blockLimit.ts
/**
* A product block's `limit` (how many products the merchant chose to show), as
* the home blocks API sends it: a number, or the same as a string. Undefined
* when it isn't a positive whole number, so the block falls back to the API's
* own page size.
*/
function blockLimit(value) {
	const limit = typeof value === "string" ? Number(value.trim()) : value;
	return typeof limit === "number" && Number.isInteger(limit) && limit > 0 ? limit : void 0;
}
//#endregion
//#region app/components/common/ScrollCarousel.tsx
/**
* Horizontal scroller with a progress bar and prev/next arrows — the shared
* mechanism behind the testimonials and products carousels. Mouse drag, native
* touch momentum, RTL-aware progress.
*/
function ScrollCarousel({ children, className = "", prevLabel, nextLabel }) {
	const { isRTL } = useTranslation();
	const track = (0, import_react.useRef)(null);
	const drag = useDragScroll(track);
	const [pos, setPos] = (0, import_react.useState)(0);
	const [thumb, setThumb] = (0, import_react.useState)(1);
	const sync = (0, import_react.useCallback)(() => {
		const el = track.current;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		setThumb(el.scrollWidth ? el.clientWidth / el.scrollWidth : 1);
		setPos(max > 0 ? Math.min(1, Math.abs(el.scrollLeft) / max) : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const el = track.current;
		if (!el) return;
		if (typeof ResizeObserver === "undefined") {
			sync();
			return;
		}
		const observer = new ResizeObserver(sync);
		observer.observe(el);
		return () => observer.disconnect();
	}, [sync, children]);
	/** One step, expressed as travel toward the END of the row (`forward` = +1)
	* or the START (-1); the layout direction turns that into a scroll delta. */
	const step = (forward) => {
		const el = track.current;
		if (!el) return;
		const amount = (el.firstElementChild?.offsetWidth || el.clientWidth * .8) + 24;
		el.scrollBy({
			left: (isRTL ? -1 : 1) * forward * amount,
			behavior: "smooth"
		});
	};
	const thumbWidth = Math.max(8, thumb * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scroll-carousel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: track,
			className: `scroll-carousel__track hide-scroll ${className}`.trim(),
			onScroll: sync,
			...drag,
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "scroll-carousel__controls",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scroll-carousel__progress",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "scroll-carousel__progress-thumb",
					style: {
						width: `${thumbWidth}%`,
						insetInlineStart: `${pos * (100 - thumbWidth)}%`
					}
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scroll-carousel__nav",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": prevLabel,
					onClick: () => step(-1),
					children: isRTL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightIcon, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftIcon, { "aria-hidden": "true" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": nextLabel,
					onClick: () => step(1),
					children: isRTL ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftIcon, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightIcon, { "aria-hidden": "true" })
				})]
			})]
		})]
	});
}
//#endregion
//#region app/components/home/ProductsSlider.tsx
/**
* `products-slider` home block + the product page's "similar products" block
* (rendered as `best-offers-<n>-slider` by the engine).
*
* Replaces the engine's Swiper (`<salla-products-slider suppressHydrationWarning>`) with the theme's
* {@link ScrollCarousel} — a native scroll row with a progress bar + arrows,
* matching the homepage testimonials. Styling: `04-components/home-blocks.scss`.
*/
function ProductsSlider({ data, onResolve }) {
	const { t } = useTranslation();
	const source = data.products?.source;
	const sourceValue = data.products?.source_value ?? void 0;
	const limit = blockLimit(data.limit);
	const { data: result, isSuccess, isError } = useQuery({
		...product.queries.list({
			source,
			sourceValue,
			perPage: limit
		}),
		enabled: !!source
	});
	const items = result?.items?.slice(0, limit);
	const onResolveRef = (0, import_react.useRef)(onResolve);
	(0, import_react.useEffect)(() => {
		onResolveRef.current = onResolve;
	});
	(0, import_react.useEffect)(() => {
		if (isSuccess) onResolveRef.current?.(items?.length ?? 0);
	}, [isSuccess, items?.length]);
	if (!source) return null;
	if (isError || isSuccess && items?.length === 0) return null;
	const { title } = data;
	const displayAll = data.display_all_url;
	const displayAllUrl = displayAll && displayAll !== "" && displayAll !== "#" ? displayAll : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "s-products-carousel",
		children: [(title || displayAllUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "s-products-carousel__head",
			children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "s-products-carousel__title",
				children: title
			}), displayAllUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: displayAllUrl,
				className: "s-block__display-all",
				children: [t("blocks.home.display_all", "View All"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
					className: "sicon-arrow-left",
					"aria-hidden": "true"
				})]
			})]
		}), !isSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsListSkeleton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollCarousel, {
			prevLabel: t("blocks.home.reviews_prev", "Previous"),
			nextLabel: t("blocks.home.reviews_next", "Next"),
			children: (items ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "s-products-carousel__slide",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: item })
			}, item.id))
		})]
	});
}
//#endregion
export { parseNextPageToken as $, targetOf as $i, Query as $n, isTimeoutError as $r, apps as $t, readTextOr as A, resolveStoreIdentifier as Ai, CartSkeleton as An, orUnauthorized as Ar, useComments as At, idFromUrl as B, getTwilightContext as Bi, ProductsSliderSkeleton as Bn, hapticImpact as Br, useStore as Bt, readGlobalSettings as C, prefixStoreBase as Ci, SallaAddProductButton as Cn, RedirectError as Cr, useWishlist as Ct, readNumber as D, resolveStoreBase as Di, BackgroundSliderSkeleton as Dn, isMissingResource as Dr, useProduct as Dt, readBoolean as E, resolveRequestVersionId as Ei, withDeferredHydration as En, defaultNavigate as Er, useHostAttributes as Et, useReveal as F, withLanguageParam as Fi, ListSkeleton as Fn, useIsProduct as Fr, useDate as Ft, rowsFrom as G, translationsQueryKey as Gi, L as Gn, cdn$1 as Gr, MAINTENANCE_EVIDENCE_HEADER as Gt, pickerValue as H, messagesForLocale as Hi, ReviewItemSkeleton as Hn, useIsNativeApp as Hr, pushEqualHeightConfig as Ht, useScrollProgress as I, SettingsError as Ii, PageSkeleton as In, useLocation as Ir, useMoney as It, LazyProductDetails as J, isLocale as Ji, advertisement as Jn, getActiveCurrency as Jr, maintenanceEvidence as Jt, scalar as K, updateTwilightContext as Ki, hookRegistry as Kn, devSettingsFetchedAt as Kr, VIEW_AS_OWNER_COOKIE_NAME as Kt, activeSlot as L, composeMessages as Li, ProductCardSkeleton as Ln, useNavigate as Lr, useNumber as Lt, rowImage as M, stripStoreBase as Mi, CustomerPageSkeleton as Mn, resolveRelativePath as Mr, TwilightProvider as Mt, rowText as N, syncScopeCookie as Ni, FiltersSkeleton as Nn, responseStatusOf as Nr, fastCheckoutScript as Nt, readRows as O, resolveStoreBaseFollowsLocale as Oi, BlogSkeleton as On, notFound as Or, useAsset as Ot, rowValue as P, virtualLocale as Pi, FixedProductsSkeleton as Pn, unauthorized as Pr, useBreadcrumbs as Pt, registry as Q, postToEditor as Qi, QueryObserver as Qn, isNetworkError as Qr, showsMaintenancePage as Qt, categoryIdFromUrl as R, createI18nInstance as Ri, ProductDetailSkeleton as Rn, TwilightContext as Rr, useOpeningHours as Rt, isCssColor as S, parseStoreId as Si, SallaCartSummary as Sn, NotFoundError as Sr, useBlogLike as St, prefersReducedMotion as T, resolveRequestScope as Ti, useIsClient as Tn, configureNavigation as Tr, useAsyncFn as Tt, productIdFromUrl as U, runWithTwilightContext as Ui, SliderSkeleton as Un, STORE_IDENTIFIER_HEADER as Ur, useDocumentClass as Ut, imgSrc as V, isPlainObject$2 as Vi, Pulse as Vn, isNativeApp as Vr, WidgetHead as Vt, readSlots as W, storeTranslationsQueryKey as Wi, useInView as Wn, api as Wr, useUser as Wt, ProductGallery as X, BLOCK_ATTRIBUTE as Xi, useQuery as Xn, getAuthToken as Xr, ownerCookieMatches as Xt, ProductCard$1 as Y, RouteId as Yi, queryOptions as Yn, getActiveScope as Yr, maintenanceEvidenceHeader as Yt, COMPONENT_KEYS as Z, areaOf as Zi, useBaseQuery as Zn, isHTTPError as Zr, ownerLinkMatches as Zt, useProductCardSettings as _, hasLanguageParam as _i, SallaUserMenu as _n, resolveQueryValue as _r, SearchIcon as _t, ProductCard as a, requestHandler as aa, whenSallaLoaded as ai, ensureTwilightContextFromMatches as an, notifyManager as ar, ChevronDownIcon as at, globalAttributes as b, legacyLocaleRedirectHref as bi, SallaMenu as bn, useQueryClient as br, UserIcon as bt, productBadge as c, require_shim as ca, LANGUAGE_COOKIE_NAME as ci, LinkProvider as cn, focusManager as cr, Delete01Icon as ct, productCardOverrideAttrs as d, STORE_BASE_HEADER as di, LazyBreadcrumb as dn, hashKey as dr, LanguagesIcon as dt, DEV_LOOKUP_BUDGET_MS as ea, getSallaSDK as ei, useDevHomeBlocks as en, hasNextPage as er, product as et, productCardOverrideVars as f, clearAuthTokenCookie as fi, LazyCurrencySymbol as fn, hashQueryKeyByOptions as fr, MapPinIcon as ft, resolveProductCardSettings as g, extractTokenFromCookies as gi, SallaButton as gn, partialMatchKey as gr, RightToLeftListBulletIcon as gt, readProductCardSettings as h, extractScopeFromUrl as hi, LazyRenderWhenVisible as hn, noop as hr, PlusIcon as ht, useDragScroll as i, getResponse as ia, syncSdkThemeVersion as ii, setHeadAdapter as in, onlineManager as ir, ArrowRightIcon as it, readValue as j, sameScope as ji, CustomerLayoutSkeleton as jn, redirect as jr, MasterLayout as jt, readText as k, resolveStoreBaseRedirect as ki, BulletDeliverySkeleton as kn, orThrow as kr, HookName as kt, ProductCardSettingsContext as l, require_jsx_runtime as la, SCOPE_COOKIE_MAX_AGE as li, Header as ln, Subscribable as lr, FilterHorizontalIcon as lt, readProductCardOverrides as m, extractScopeFromCookies as mi, LazyNoContent as mn, matchQuery as mr, Money01Icon as mt, ScrollCarousel as n, getRequestHeader as na, requestedThemeVersionId as ni, buildHreflangAlternates as nn, Removable as nr, shouldDehydrateQuery as nt, discountPercent as o, setCookie as oa, AUTH_TOKEN_COOKIE_NAME as oi, Footer as on, dehydrateQuery as or, CloseIcon as ot, productCardVars as p, decideSharedHostLanguage as pi, LazyErrorPage as pn, matchMutation as pr, MinusIcon as pt, LazyAddToCartForm as q, getLanguageInfo as qi, useTranslation as qn, filesCdn as qr, isNotLaunchedNotice as qt, blockLimit as r, getRequestUrl as ra, syncSdkLocale as ri, storePageUrl as rn, createRetryer as rr, ArrowLeftIcon as rt, originalPrice as s, require_react_dom as sa, LANGUAGE_COOKIE_MAX_AGE as si, Link as sn, hydrate as sr, DashboardSquare01Icon as st, ProductsSlider as t, getCookie as ta, onSallaEvent as ti, rootHead as tn, hasPreviousPage as tr, rememberProductPreview as tt, productCardFlags as u, require_react as ua, SCOPE_COOKIE_NAME as ui, Image as un, functionalUpdate as ur, HomeIcon as ut, GlobalSettingsContext as v, hasStoreUrlBase as vi, SallaSocial as vn, skipToken as vr, ShoppingBagIcon as vt, clamp as w, resolveAddressedStore as wi, HookSlot as wn, UnauthorizedError as wr, useCoupon as wt, globalVars as x, loginRedirectHref as xi, salla_localization_modal_exports as xn, NavigationProvider as xr, Modal as xt, applyGlobalSettings as y, isLoopback as yi, SallaSlider as yn, QueryClientProvider as yr, StarIcon as yt, fallbackSlot as z, getRequestStore as zi, ProductsListSkeleton as zn, useTwilight as zr, usePageConfig as zt };

//# sourceMappingURL=shared-home-CSJrMlCW.js.map