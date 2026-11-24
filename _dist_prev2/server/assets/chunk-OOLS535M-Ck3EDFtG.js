import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { $n as Query, $r as isTimeoutError, $t as apps, Ai as resolveStoreIdentifier, Bi as getTwilightContext, Ci as prefixStoreBase, Cr as RedirectError, Di as resolveStoreBase, Dr as isMissingResource, Fi as withLanguageParam, Gi as translationsQueryKey, Gr as cdn, Hi as messagesForLocale, Hr as useIsNativeApp, Ii as SettingsError, In as PageSkeleton, Ji as isLocale, Jn as advertisement, Ki as updateTwilightContext, Kr as devSettingsFetchedAt, Kt as VIEW_AS_OWNER_COOKIE_NAME, Li as composeMessages, Mi as stripStoreBase, Mr as resolveRelativePath, Ni as syncScopeCookie, Nr as responseStatusOf, Oi as resolveStoreBaseFollowsLocale, Pi as virtualLocale, Qr as isNetworkError, Qt as showsMaintenancePage, Ri as createI18nInstance, Si as parseStoreId, Sr as NotFoundError, Ti as resolveRequestScope, Tr as configureNavigation, Ur as STORE_IDENTIFIER_HEADER, Ut as useDocumentClass, Vi as isPlainObject, Wi as storeTranslationsQueryKey, Wr as api, Xt as ownerCookieMatches, Yi as RouteId, Yn as queryOptions, Yr as getActiveScope, Zr as isHTTPError, Zt as ownerLinkMatches, _i as hasLanguageParam, _r as resolveQueryValue, an as ensureTwilightContextFromMatches, ar as notifyManager, ci as LANGUAGE_COOKIE_NAME, cn as LinkProvider, cr as focusManager, dr as hashKey, fr as hashQueryKeyByOptions, gi as extractTokenFromCookies, gr as partialMatchKey, hi as extractScopeFromUrl, hr as noop, ii as syncSdkThemeVersion, in as setHeadAdapter, ir as onlineManager, ji as sameScope, ki as resolveStoreBaseRedirect, la as require_jsx_runtime, li as SCOPE_COOKIE_MAX_AGE, lr as Subscribable, mi as extractScopeFromCookies, mr as matchQuery, na as getRequestHeader, ni as requestedThemeVersionId, nr as Removable, nt as shouldDehydrateQuery, oa as setCookie, oi as AUTH_TOKEN_COOKIE_NAME, or as dehydrateQuery, pi as decideSharedHostLanguage, pr as matchMutation, qi as getLanguageInfo, qn as useTranslation, qr as filesCdn, qt as isNotLaunchedNotice, ra as getRequestUrl, ri as syncSdkLocale, rn as storePageUrl, rr as createRetryer, si as LANGUAGE_COOKIE_MAX_AGE, ta as getCookie, ti as onSallaEvent, tn as rootHead, ua as require_react, ui as SCOPE_COOKIE_NAME, ur as functionalUpdate, vi as hasStoreUrlBase, vr as skipToken, wr as UnauthorizedError, xi as loginRedirectHref, xr as NavigationProvider, yi as isLoopback, yr as QueryClientProvider, zi as getRequestStore, zr as useTwilight } from "./shared-home-CR99BuTM.js";
import { C as useNavigate, S as Link, T as useRouter, U as defaultStringifySearch, Z as redirect, et as notFound, g as createRouter$1, m as useRouterState, w as useParams, x as createRootRouteWithContext } from "./vendor-router-C6m68NiI.js";
import { d as dispatchRouteChanged, u as dispatchProductViewed } from "./shared-product-N_AOhgpy.js";
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/mutation.js
var Mutation = class extends Removable {
	#client;
	#observers;
	#mutationCache;
	#retryer;
	constructor(config) {
		super();
		this.#client = config.client;
		this.mutationId = config.mutationId;
		this.#mutationCache = config.mutationCache;
		this.#observers = [];
		this.state = config.state || getDefaultState();
		this.setOptions(config.options);
		this.scheduleGc();
	}
	setOptions(options) {
		this.options = options;
		this.updateGcTime(this.options.gcTime);
	}
	get meta() {
		return this.options.meta;
	}
	addObserver(observer) {
		if (!this.#observers.includes(observer)) {
			this.#observers.push(observer);
			this.clearGcTimeout();
			this.#mutationCache.notify({
				type: "observerAdded",
				mutation: this,
				observer
			});
		}
	}
	removeObserver(observer) {
		this.#observers = this.#observers.filter((x) => x !== observer);
		this.scheduleGc();
		this.#mutationCache.notify({
			type: "observerRemoved",
			mutation: this,
			observer
		});
	}
	optionalRemove() {
		if (!this.#observers.length) {
			if (this.state.status === "pending") this.scheduleGc();
			else this.#mutationCache.remove(this);
		}
	}
	continue() {
		return this.#retryer?.continue() ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
	}
	async execute(variables) {
		const onContinue = () => {
			this.#dispatch({ type: "continue" });
		};
		const mutationFnContext = {
			client: this.#client,
			meta: this.options.meta,
			mutationKey: this.options.mutationKey
		};
		const retryer = this.#retryer = createRetryer({
			fn: () => {
				if (!this.options.mutationFn) return Promise.reject(/* @__PURE__ */ new Error("No mutationFn found"));
				return this.options.mutationFn(variables, mutationFnContext);
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
			onContinue,
			retry: this.options.retry ?? 0,
			retryDelay: this.options.retryDelay,
			networkMode: this.options.networkMode,
			canRun: () => this.#mutationCache.canRun(this)
		});
		const restored = this.state.status === "pending";
		const isPaused = !retryer.canStart();
		try {
			if (restored) onContinue();
			else {
				this.#dispatch({
					type: "pending",
					variables,
					isPaused
				});
				if (this.#mutationCache.config.onMutate) await this.#mutationCache.config.onMutate(variables, this, mutationFnContext);
				const context = await this.options.onMutate?.(variables, mutationFnContext);
				if (context !== this.state.context) this.#dispatch({
					type: "pending",
					context,
					variables,
					isPaused
				});
			}
			const data = await retryer.start();
			await this.#mutationCache.config.onSuccess?.(data, variables, this.state.context, this, mutationFnContext);
			await this.options.onSuccess?.(data, variables, this.state.context, mutationFnContext);
			await this.#mutationCache.config.onSettled?.(data, null, this.state.variables, this.state.context, this, mutationFnContext);
			await this.options.onSettled?.(data, null, variables, this.state.context, mutationFnContext);
			this.#dispatch({
				type: "success",
				data
			});
			return data;
		} catch (error) {
			try {
				await this.#mutationCache.config.onError?.(error, variables, this.state.context, this, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.options.onError?.(error, variables, this.state.context, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.#mutationCache.config.onSettled?.(void 0, error, this.state.variables, this.state.context, this, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			try {
				await this.options.onSettled?.(void 0, error, variables, this.state.context, mutationFnContext);
			} catch (e) {
				Promise.reject(e);
			}
			this.#dispatch({
				type: "error",
				error
			});
			throw error;
		} finally {
			if (this.#retryer === retryer) this.#retryer = void 0;
			this.#mutationCache.runNext(this);
		}
	}
	#dispatch(action) {
		const reducer = (state) => {
			switch (action.type) {
				case "failed": return {
					...state,
					failureCount: action.failureCount,
					failureReason: action.error
				};
				case "pause": return {
					...state,
					isPaused: true
				};
				case "continue": return {
					...state,
					isPaused: false
				};
				case "pending": return {
					...state,
					context: action.context,
					data: void 0,
					failureCount: 0,
					failureReason: null,
					error: null,
					isPaused: action.isPaused,
					status: "pending",
					variables: action.variables,
					submittedAt: Date.now()
				};
				case "success": return {
					...state,
					data: action.data,
					failureCount: 0,
					failureReason: null,
					error: null,
					status: "success",
					isPaused: false
				};
				case "error": return {
					...state,
					data: void 0,
					error: action.error,
					failureCount: state.failureCount + 1,
					failureReason: action.error,
					isPaused: false,
					status: "error"
				};
			}
		};
		this.state = reducer(this.state);
		notifyManager.batch(() => {
			this.#observers.forEach((observer) => {
				observer.onMutationUpdate(action);
			});
			this.#mutationCache.notify({
				mutation: this,
				type: "updated",
				action
			});
		});
	}
};
function getDefaultState() {
	return {
		context: void 0,
		data: void 0,
		error: null,
		failureCount: 0,
		failureReason: null,
		isPaused: false,
		status: "idle",
		variables: void 0,
		submittedAt: 0
	};
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/mutationCache.js
var MutationCache = class extends Subscribable {
	#mutations;
	#scopes;
	#mutationId;
	constructor(config = {}) {
		super();
		this.config = config;
		this.#mutations = /* @__PURE__ */ new Set();
		this.#scopes = /* @__PURE__ */ new Map();
		this.#mutationId = 0;
	}
	build(client, options, state) {
		const mutation = new Mutation({
			client,
			mutationCache: this,
			mutationId: ++this.#mutationId,
			options: client.defaultMutationOptions(options),
			state
		});
		this.add(mutation);
		return mutation;
	}
	add(mutation) {
		this.#mutations.add(mutation);
		const scope = scopeFor(mutation);
		if (typeof scope === "string") {
			const scopedMutations = this.#scopes.get(scope);
			if (scopedMutations) scopedMutations.push(mutation);
			else this.#scopes.set(scope, [mutation]);
		}
		this.notify({
			type: "added",
			mutation
		});
	}
	remove(mutation) {
		if (this.#mutations.delete(mutation)) {
			const scope = scopeFor(mutation);
			if (typeof scope === "string") {
				const scopedMutations = this.#scopes.get(scope);
				if (scopedMutations) {
					if (scopedMutations.length > 1) {
						const index = scopedMutations.indexOf(mutation);
						if (index !== -1) scopedMutations.splice(index, 1);
					} else if (scopedMutations[0] === mutation) this.#scopes.delete(scope);
				}
			}
		}
		this.notify({
			type: "removed",
			mutation
		});
	}
	canRun(mutation) {
		const scope = scopeFor(mutation);
		if (typeof scope === "string") {
			const firstPendingMutation = this.#scopes.get(scope)?.find((m) => m.state.status === "pending");
			return !firstPendingMutation || firstPendingMutation === mutation;
		} else return true;
	}
	runNext(mutation) {
		const scope = scopeFor(mutation);
		if (typeof scope === "string") return (this.#scopes.get(scope)?.find((m) => m !== mutation && m.state.isPaused))?.continue() ?? Promise.resolve();
		else return Promise.resolve();
	}
	clear() {
		notifyManager.batch(() => {
			this.#mutations.forEach((mutation) => {
				this.notify({
					type: "removed",
					mutation
				});
			});
			this.#mutations.clear();
			this.#scopes.clear();
		});
	}
	getAll() {
		return Array.from(this.#mutations);
	}
	find(filters) {
		const defaultedFilters = {
			exact: true,
			...filters
		};
		return this.getAll().find((mutation) => matchMutation(defaultedFilters, mutation));
	}
	findAll(filters = {}) {
		return this.getAll().filter((mutation) => matchMutation(filters, mutation));
	}
	notify(event) {
		notifyManager.batch(() => {
			this.listeners.forEach((listener) => {
				listener(event);
			});
		});
	}
	resumePausedMutations() {
		const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
		return notifyManager.batch(() => Promise.all(pausedMutations.map((mutation) => mutation.continue().catch(noop))));
	}
};
function scopeFor(mutation) {
	return mutation.options.scope?.id;
}
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/queryCache.js
var QueryCache = class extends Subscribable {
	#queries;
	constructor(config = {}) {
		super();
		this.config = config;
		this.#queries = /* @__PURE__ */ new Map();
	}
	build(client, options, state) {
		const queryKey = options.queryKey;
		const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
		let query = this.get(queryHash);
		if (!query) {
			query = new Query({
				client,
				queryKey,
				queryHash,
				options: client.defaultQueryOptions(options),
				state,
				defaultOptions: client.getQueryDefaults(queryKey)
			});
			this.add(query);
		}
		return query;
	}
	add(query) {
		if (!this.#queries.has(query.queryHash)) {
			this.#queries.set(query.queryHash, query);
			this.notify({
				type: "added",
				query
			});
		}
	}
	remove(query) {
		const queryInMap = this.#queries.get(query.queryHash);
		if (queryInMap) {
			query.destroy();
			if (queryInMap === query) this.#queries.delete(query.queryHash);
			this.notify({
				type: "removed",
				query
			});
		}
	}
	clear() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				this.remove(query);
			});
		});
	}
	get(queryHash) {
		return this.#queries.get(queryHash);
	}
	getAll() {
		return [...this.#queries.values()];
	}
	find(filters) {
		const defaultedFilters = {
			exact: true,
			...filters
		};
		return this.getAll().find((query) => matchQuery(defaultedFilters, query));
	}
	findAll(filters = {}) {
		const queries = this.getAll();
		return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
	}
	notify(event) {
		notifyManager.batch(() => {
			this.listeners.forEach((listener) => {
				listener(event);
			});
		});
	}
	onFocus() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onFocus();
			});
		});
	}
	onOnline() {
		notifyManager.batch(() => {
			this.getAll().forEach((query) => {
				query.onOnline();
			});
		});
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/queryClient.js
var QueryClient = class {
	#queryCache;
	#mutationCache;
	#defaultOptions;
	#queryDefaults;
	#mutationDefaults;
	#mountCount;
	#unsubscribeFocus;
	#unsubscribeOnline;
	constructor(config = {}) {
		this.#queryCache = config.queryCache || new QueryCache();
		this.#mutationCache = config.mutationCache || new MutationCache();
		this.#defaultOptions = config.defaultOptions || {};
		this.#queryDefaults = /* @__PURE__ */ new Map();
		this.#mutationDefaults = /* @__PURE__ */ new Map();
		this.#mountCount = 0;
	}
	mount() {
		this.#mountCount++;
		if (this.#mountCount !== 1) return;
		this.#unsubscribeFocus = focusManager.subscribe(async (focused) => {
			if (focused) {
				await this.resumePausedMutations();
				this.#queryCache.onFocus();
			}
		});
		this.#unsubscribeOnline = onlineManager.subscribe(async (online) => {
			if (online) {
				await this.resumePausedMutations();
				this.#queryCache.onOnline();
			}
		});
	}
	unmount() {
		this.#mountCount--;
		if (this.#mountCount !== 0) return;
		this.#unsubscribeFocus?.();
		this.#unsubscribeFocus = void 0;
		this.#unsubscribeOnline?.();
		this.#unsubscribeOnline = void 0;
	}
	isFetching(filters) {
		return this.#queryCache.findAll({
			...filters,
			fetchStatus: "fetching"
		}).length;
	}
	isMutating(filters) {
		return this.#mutationCache.findAll({
			...filters,
			status: "pending"
		}).length;
	}
	/**
	* Imperative (non-reactive) way to retrieve data for a QueryKey.
	* Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
	*
	* Hint: Do not use this function inside a component, because it won't receive updates.
	* Use `useQuery` to create a `QueryObserver` that subscribes to changes.
	*/
	getQueryData(queryKey) {
		const options = this.defaultQueryOptions({ queryKey });
		return this.#queryCache.get(options.queryHash)?.state.data;
	}
	/**
	* @deprecated Use queryClient.query({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
	*/
	ensureQueryData(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		const query = this.#queryCache.build(this, defaultedOptions);
		const cachedData = query.state.data;
		if (cachedData === void 0) return this.fetchQuery(options);
		if (options.revalidateIfStale && query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query))) this.prefetchQuery(defaultedOptions);
		return Promise.resolve(cachedData);
	}
	getQueriesData(filters) {
		return this.#queryCache.findAll(filters).map(({ queryKey, state }) => {
			return [queryKey, state.data];
		});
	}
	setQueryData(queryKey, updater, options) {
		const defaultedOptions = this.defaultQueryOptions({ queryKey });
		const prevData = this.#queryCache.get(defaultedOptions.queryHash)?.state.data;
		const data = functionalUpdate(updater, prevData);
		if (data === void 0) return;
		return this.#queryCache.build(this, defaultedOptions).setData(data, {
			...options,
			manual: true
		});
	}
	setQueriesData(filters, updater, options) {
		return notifyManager.batch(() => this.#queryCache.findAll(filters).map(({ queryKey }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
	}
	getQueryState(queryKey) {
		const options = this.defaultQueryOptions({ queryKey });
		return this.#queryCache.get(options.queryHash)?.state;
	}
	removeQueries(filters) {
		const queryCache = this.#queryCache;
		notifyManager.batch(() => {
			queryCache.findAll(filters).forEach((query) => {
				queryCache.remove(query);
			});
		});
	}
	resetQueries(filters, options) {
		const queryCache = this.#queryCache;
		return notifyManager.batch(() => {
			const matched = queryCache.findAll(filters);
			const queriesToRefetch = new Set(matched);
			matched.forEach((query) => {
				query.reset();
			});
			return this.refetchQueries({
				type: "active",
				predicate: (query) => queriesToRefetch.has(query)
			}, options);
		});
	}
	cancelQueries(filters, cancelOptions = {}) {
		const defaultedCancelOptions = {
			revert: true,
			...cancelOptions
		};
		const promises = notifyManager.batch(() => this.#queryCache.findAll(filters).map((query) => query.cancel(defaultedCancelOptions)));
		return Promise.all(promises).then(noop).catch(noop);
	}
	invalidateQueries(filters, options = {}) {
		return notifyManager.batch(() => {
			this.#queryCache.findAll(filters).forEach((query) => {
				query.invalidate();
			});
			if (filters?.refetchType === "none") return Promise.resolve();
			return this.refetchQueries({
				...filters,
				type: filters?.refetchType ?? filters?.type ?? "active"
			}, options);
		});
	}
	refetchQueries(filters, options = {}) {
		const fetchOptions = {
			...options,
			cancelRefetch: options.cancelRefetch ?? true
		};
		const promises = notifyManager.batch(() => this.#queryCache.findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
			let promise = query.fetch(void 0, fetchOptions);
			if (!fetchOptions.throwOnError) promise = promise.catch(noop);
			return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
		}));
		return Promise.all(promises).then(noop);
	}
	async query(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
		const query = this.#queryCache.build(this, defaultedOptions);
		const queryData = query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? await query.fetch(defaultedOptions) : query.state.data;
		const select = defaultedOptions.select;
		if (select) return select(queryData);
		return queryData;
	}
	/**
	* @deprecated Use queryClient.query(options) instead. This method will be removed in the next major version.
	*/
	fetchQuery(options) {
		const defaultedOptions = this.defaultQueryOptions(options);
		if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
		const query = this.#queryCache.build(this, defaultedOptions);
		return query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
	}
	/**
	* @deprecated Use queryClient.query(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
	*/
	prefetchQuery(options) {
		return this.fetchQuery(options).then(noop).catch(noop);
	}
	infiniteQuery(options) {
		options._type = "infinite";
		return this.query(options);
	}
	/**
	* @deprecated Use queryClient.infiniteQuery(options) instead. This method will be removed in the next major version.
	*/
	fetchInfiniteQuery(options) {
		options._type = "infinite";
		return this.fetchQuery(options);
	}
	/**
	* @deprecated Use queryClient.infiniteQuery(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
	*/
	prefetchInfiniteQuery(options) {
		return this.fetchInfiniteQuery(options).then(noop).catch(noop);
	}
	/**
	* @deprecated Use queryClient.infiniteQuery({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
	*/
	ensureInfiniteQueryData(options) {
		options._type = "infinite";
		return this.ensureQueryData(options);
	}
	resumePausedMutations() {
		if (onlineManager.isOnline()) return this.#mutationCache.resumePausedMutations();
		return Promise.resolve();
	}
	getQueryCache() {
		return this.#queryCache;
	}
	getMutationCache() {
		return this.#mutationCache;
	}
	getDefaultOptions() {
		return this.#defaultOptions;
	}
	setDefaultOptions(options) {
		this.#defaultOptions = options;
	}
	setQueryDefaults(queryKey, options) {
		this.#queryDefaults.set(hashKey(queryKey), {
			queryKey,
			defaultOptions: options
		});
	}
	getQueryDefaults(queryKey) {
		const defaults = [...this.#queryDefaults.values()];
		const result = {};
		defaults.forEach((queryDefault) => {
			if (partialMatchKey(queryKey, queryDefault.queryKey)) Object.assign(result, queryDefault.defaultOptions);
		});
		return result;
	}
	setMutationDefaults(mutationKey, options) {
		this.#mutationDefaults.set(hashKey(mutationKey), {
			mutationKey,
			defaultOptions: options
		});
	}
	getMutationDefaults(mutationKey) {
		const defaults = [...this.#mutationDefaults.values()];
		const result = {};
		defaults.forEach((queryDefault) => {
			if (partialMatchKey(mutationKey, queryDefault.mutationKey)) Object.assign(result, queryDefault.defaultOptions);
		});
		return result;
	}
	defaultQueryOptions(options) {
		if (options._defaulted) return options;
		const defaultedOptions = {
			...this.#defaultOptions.queries,
			...this.getQueryDefaults(options.queryKey),
			...options,
			_defaulted: true
		};
		if (!defaultedOptions.queryHash) defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
		if (defaultedOptions.refetchOnReconnect === void 0) defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
		if (defaultedOptions.throwOnError === void 0) defaultedOptions.throwOnError = !!defaultedOptions.suspense;
		if (!defaultedOptions.networkMode && defaultedOptions.persister) defaultedOptions.networkMode = "offlineFirst";
		if (defaultedOptions.queryFn === skipToken) defaultedOptions.enabled = false;
		return defaultedOptions;
	}
	defaultMutationOptions(options) {
		if (options?._defaulted) return options;
		return {
			...this.#defaultOptions.mutations,
			...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
			...options,
			_defaulted: true
		};
	}
	clear() {
		this.#queryCache.clear();
		this.#mutationCache.clear();
	}
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-Z4Y55HWX.js
var import_jsx_runtime = require_jsx_runtime();
var LINK_STYLE = {
	backgroundColor: "var(--color-primary)",
	color: "var(--color-primary-reverse, #ffffff)"
};
function ErrorPage({ code, title, message, actionText, actionHref = "/", showAction = true, LinkComponent, children }) {
	const { t } = useTranslation();
	const resolvedTitle = title ?? t(`common.errors.${code}`) ?? "Error";
	const resolvedMessage = message ?? t("common.errors.error_occurred") ?? "An unexpected error occurred.";
	const resolvedActionText = actionText ?? t("common.elements.back_home") ?? "Back to Home";
	const linkClassName = "inline-flex items-center px-6 py-3 rounded-lg transition-opacity hover:opacity-90";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container py-16 text-center",
		children: [
			code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-6xl font-bold text-gray-300 mb-4",
				"data-testid": "error-code",
				children: code
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold text-gray-700 mb-4",
				children: resolvedTitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-gray-500 mb-8",
				children: resolvedMessage
			}),
			children,
			showAction && (LinkComponent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkComponent, {
				to: actionHref,
				className: linkClassName,
				style: LINK_STYLE,
				children: resolvedActionText
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: actionHref,
				className: linkClassName,
				style: LINK_STYLE,
				children: resolvedActionText
			}))
		]
	});
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-EHTLXK5F.js
function normalizeOgImages(images) {
	if (!images) return [];
	return (Array.isArray(images) ? images : [images]).map((img) => typeof img === "string" ? { url: img } : img);
}
function plainText(html) {
	return html.replace(/<br\s*\/?>|<\/(?:p|div|li|h[1-6])>/gi, " ").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function tanstackHeadAdapter(descriptor) {
	const meta = [];
	const links = [];
	const scripts = [];
	const styles = [];
	if (descriptor.title) meta.push({ title: descriptor.title });
	if (descriptor.description) meta.push({
		name: "description",
		content: plainText(descriptor.description)
	});
	if (descriptor.keywords) {
		const kw = Array.isArray(descriptor.keywords) ? descriptor.keywords.join(", ") : descriptor.keywords;
		meta.push({
			name: "keywords",
			content: kw
		});
	}
	if (descriptor.robots) meta.push({
		name: "robots",
		content: descriptor.robots
	});
	const og = descriptor.openGraph;
	if (og) {
		if (og.siteName) meta.push({
			property: "og:site_name",
			content: og.siteName
		});
		if (og.type) meta.push({
			property: "og:type",
			content: og.type
		});
		if (og.title) meta.push({
			property: "og:title",
			content: og.title
		});
		if (og.description) meta.push({
			property: "og:description",
			content: plainText(og.description)
		});
		if (og.url) meta.push({
			property: "og:url",
			content: og.url
		});
		if (og.locale) meta.push({
			property: "og:locale",
			content: og.locale
		});
		for (const alt of og.alternateLocale ?? []) meta.push({
			property: "og:locale:alternate",
			content: alt
		});
		for (const img of normalizeOgImages(og.images)) {
			meta.push({
				property: "og:image",
				content: img.url
			});
			if (img.width != null) meta.push({
				property: "og:image:width",
				content: String(img.width)
			});
			if (img.height != null) meta.push({
				property: "og:image:height",
				content: String(img.height)
			});
			if (img.alt) meta.push({
				property: "og:image:alt",
				content: img.alt
			});
		}
		if (og.publishedTime) meta.push({
			property: "article:published_time",
			content: og.publishedTime
		});
		if (og.modifiedTime) meta.push({
			property: "article:modified_time",
			content: og.modifiedTime
		});
	}
	const tw = descriptor.twitter;
	if (tw) {
		if (tw.card) meta.push({
			name: "twitter:card",
			content: tw.card
		});
		if (tw.title) meta.push({
			name: "twitter:title",
			content: tw.title
		});
		if (tw.description) meta.push({
			name: "twitter:description",
			content: plainText(tw.description)
		});
		if (tw.site) meta.push({
			name: "twitter:site",
			content: tw.site
		});
		if (tw.creator) meta.push({
			name: "twitter:creator",
			content: tw.creator
		});
		if (tw.url) meta.push({
			name: "twitter:url",
			content: tw.url
		});
		const twImages = tw.images ? Array.isArray(tw.images) ? tw.images : [tw.images] : [];
		for (const img of twImages) meta.push({
			name: "twitter:image",
			content: img
		});
	}
	if (descriptor.canonical) links.push({
		rel: "canonical",
		href: descriptor.canonical
	});
	for (const alt of descriptor.alternateLanguages ?? []) links.push({
		rel: "alternate",
		hrefLang: alt.hreflang,
		href: alt.href
	});
	if (descriptor.jsonLd) scripts.push({
		type: "application/ld+json",
		children: JSON.stringify(descriptor.jsonLd)
	});
	for (const m of descriptor.meta ?? []) {
		const { httpEquiv, ...rest } = m;
		meta.push(httpEquiv ? {
			httpEquiv,
			...rest
		} : rest);
	}
	for (const l of descriptor.links ?? []) links.push(l);
	for (const s of descriptor.styles ?? []) styles.push(s);
	for (const im of descriptor.importMap ?? []) scripts.push({
		type: "importmap",
		children: JSON.stringify(im)
	});
	for (const s of descriptor.scripts ?? []) scripts.push(s);
	return {
		meta,
		links,
		styles,
		scripts
	};
}
function appendStoreTitle(descriptor, settings) {
	const store = settings?.store;
	const storeTitle = store?.meta?.title || store?.name;
	const pageTitle = descriptor.title;
	if (!pageTitle || !storeTitle || descriptor.appendStoreTitle === false) return descriptor;
	if (pageTitle === storeTitle) return descriptor;
	const title = `${pageTitle} - ${storeTitle}`;
	const shareTitle = (current) => !current || current === pageTitle ? title : current;
	return {
		...descriptor,
		title,
		openGraph: {
			...descriptor.openGraph,
			title: shareTitle(descriptor.openGraph?.title)
		},
		twitter: {
			...descriptor.twitter,
			title: shareTitle(descriptor.twitter?.title)
		}
	};
}
function withPageUrl(descriptor, ctx) {
	const pathname = ctx.location?.pathname;
	const canonical = descriptor.canonical ?? (pathname ? storePageUrl(ctx.settings, pathname) : void 0);
	if (!canonical) return descriptor;
	return {
		...descriptor,
		canonical,
		openGraph: {
			...descriptor.openGraph,
			url: descriptor.openGraph?.url ?? canonical
		},
		twitter: {
			...descriptor.twitter,
			url: descriptor.twitter?.url ?? canonical
		}
	};
}
function withHead(route, extend) {
	return (ctx) => {
		const loaderData = ctx.loaderData;
		if (!loaderData) return {};
		ensureTwilightContextFromMatches(ctx.matches);
		try {
			const context = getTwilightContext();
			const result = route.head(context, loaderData);
			return tanstackHeadAdapter(withPageUrl(appendStoreTitle(extend ? extend(result, context, loaderData) : result, context.settings), context));
		} catch (error) {
			if (error instanceof SettingsError) return {};
			throw error;
		}
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-F5BU7T6H.js
var NATIVE_APP_HEADERS = [
	"s-app-os",
	"s-app-version",
	"s-app-full-version",
	"s-app-os-version"
];
function readNativeAppHeaders(headers) {
	const os = headers.get("s-app-os")?.toLowerCase();
	if (os !== "ios" && os !== "android") return null;
	const found = {};
	for (const name of NATIVE_APP_HEADERS) {
		const value = headers.get(name);
		if (value) found[name] = value;
	}
	return found;
}
var DEFAULT_INCLUDE_ITEMS = [
	"store",
	"settings",
	"theme",
	"theme_settings",
	"external_services",
	"currencies",
	"languages",
	"payments",
	"product_widgets",
	"rating",
	"ratings",
	"user"
];
var ANSWER_HEADERS = {
	requestId: "s-request-id",
	traceId: "x-trace-id",
	cacheStatus: "cf-cache-status",
	age: "age"
};
function settingsAnswerOf(headers) {
	if (!headers) return void 0;
	const answer = {};
	for (const [field, name] of Object.entries(ANSWER_HEADERS)) {
		const value = headers.get(name);
		if (value) answer[field] = value;
	}
	return Object.keys(answer).length ? answer : void 0;
}
function languagesToArray(languages) {
	if (!languages) return void 0;
	return Object.values(languages).map((lang) => ({
		iso_code: lang.code,
		...lang
	}));
}
function withNativeAppHeaders(jitsu) {
	if (!jitsu || typeof window !== "undefined") return jitsu;
	let appHeaders = null;
	try {
		appHeaders = getTwilightContext().nativeAppHeaders;
	} catch {
		return jitsu;
	}
	if (!appHeaders) return jitsu;
	const extra = jitsu.context?.extra;
	const headers = { ...extra?.headers };
	for (const name of NATIVE_APP_HEADERS) delete headers[name];
	return {
		...jitsu,
		context: {
			...jitsu.context,
			extra: {
				...extra,
				headers: {
					...headers,
					...appHeaders
				}
			}
		}
	};
}
var SETTINGS_TIMEOUT_MS = 5e3;
async function requestSettings(identifier) {
	const includeParams = DEFAULT_INCLUDE_ITEMS.map((i) => `include[]=${i}`).join("&");
	const scope = getActiveScope();
	const params = scope != null ? `${includeParams}&scope=${scope.id}` : includeParams;
	const request = api.get(`store/settings?${params}`, {
		timeout: SETTINGS_TIMEOUT_MS,
		headers: { [STORE_IDENTIFIER_HEADER]: identifier }
	});
	const json = await request.json();
	const headers = (await request)?.headers;
	const answer = settingsAnswerOf(headers);
	const devFetchedAt = devSettingsFetchedAt(headers);
	const data = json?.data;
	if (!data) throw new SettingsError(`The Salla API answered the settings request for store "${identifier}" without settings.`, { reason: "empty" });
	const languages = languagesToArray(data.languages);
	return {
		store: data.store,
		theme: data.theme,
		languages,
		currencies: data.currencies,
		external_services: data.external_services,
		headers: data.headers,
		login: data.login,
		affiliate: data.affiliate,
		policy_url: data.policy_url,
		user: data.user,
		swoole: data.swoole,
		jitsu: withNativeAppHeaders(data.jitsu),
		maintenance: data.maintenance,
		maintenance_details: data.maintenance_details,
		...data.maintenance === true && isNotLaunchedNotice(data.maintenance_details) && { launched: false },
		...scope && { requestedScopeId: scope.id },
		...answer && { answer },
		...devFetchedAt && { devFetchedAt }
	};
}
function apiErrorMessage(data) {
	const message = data?.error?.message;
	return typeof message === "string" && message.length > 0 && message.length <= 200 ? message : void 0;
}
var STORE_NOT_FOUND_MESSAGE = "المتجر غير موجود";
function isStoreNotFound(identifier, status, said) {
	if (status === 410) return parseStoreId(identifier) !== null;
	return status === 422 && said === STORE_NOT_FOUND_MESSAGE;
}
function describeSettingsFailure(identifier, error) {
	if (error instanceof SettingsError) return error;
	const request = `the settings request for store "${identifier}"`;
	if (isTimeoutError(error)) return new SettingsError(`The Salla API did not answer ${request} within ${SETTINGS_TIMEOUT_MS} ms.`, { reason: "timeout" });
	if (isHTTPError(error)) {
		const { status } = error.response;
		const said = apiErrorMessage(error.data);
		return new SettingsError(`The Salla API answered ${request} with HTTP ${status}${said ? `: ${said}` : ""}.`, {
			reason: isStoreNotFound(identifier, status, said) ? "not-found" : "http",
			status
		});
	}
	if (isNetworkError(error)) return new SettingsError(`The Salla API could not be reached for ${request}.`, { reason: "network" });
	const detail = error instanceof Error ? `: ${error.message}` : "";
	return new SettingsError(`The settings request for store "${identifier}" failed${detail}.`);
}
async function fetchSettings(storeIdentifier) {
	const identifier = storeIdentifier ?? resolveStoreIdentifier();
	if (!identifier) {
		const error = new SettingsError("No store is named for this request: add `?storeId=` on the preview host, or set VITE_STORE_DOMAIN in local development.", { reason: "no-store" });
		console.warn("[store.settings]", error.message);
		throw error;
	}
	try {
		return await requestSettings(identifier);
	} catch (cause) {
		const error = describeSettingsFailure(identifier, cause);
		console.error("[store.settings]", error.message, ...cause === error ? [] : [cause]);
		throw error;
	}
}
var store = {
	settings: async (storeIdentifier) => {
		try {
			return await fetchSettings(storeIdentifier);
		} catch {
			return null;
		}
	},
	queries: { settings: (storeIdentifier) => queryOptions({
		queryKey: [
			"store",
			"settings",
			storeIdentifier,
			getTwilightContext().locale,
			getActiveScope(),
			requestedThemeVersionId()
		],
		queryFn: () => fetchSettings(storeIdentifier),
		retry: 0
	}) }
};
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-33UM6VQJ.js
var LEGACY_GLOBAL_FILE = "js/translations.json";
function commonTranslationsPath(locale) {
	return `translations/common/${locale}.json`;
}
function storeTranslationsPath(storeId, locale) {
	return `translations/${storeId}/${locale}.json`;
}
async function readLocaleFile(path, { failLoudly = false } = {}) {
	const unreadable = (reason, cause) => {
		if (failLoudly) throw new Error(`[translations] ${path}: ${reason}`, { cause });
		console.warn("[translations]", reason, path, cause ?? "");
		return null;
	};
	try {
		const response = await filesCdn.get(path, {
			throwHttpErrors: false,
			timeout: 5e3
		});
		if (response.status === 404) return null;
		if (!response.ok) return unreadable(`answered ${response.status}`);
		const data = await response.json();
		if (!isPlainObject(data)) return unreadable("is not a JSON object");
		return data;
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("[translations]")) throw error;
		return unreadable("could not be read", error);
	}
}
async function readLegacyGlobal(locale) {
	try {
		const forLocale = (await cdn.get(LEGACY_GLOBAL_FILE, { timeout: 5e3 }).json())?.[`${locale}.trans`];
		return isPlainObject(forLocale) ? forLocale : null;
	} catch {
		console.warn("[translations] the legacy global file could not be read either");
		return null;
	}
}
var translations = {
	/**
	* The platform's copy for `locale`.
	*
	* One file, so one request. See the file comment for why the merchant's own
	* wording is not merged in here yet and what it is waiting on.
	*/
	get: async (locale) => {
		const base = await readLocaleFile(commonTranslationsPath(locale)) ?? await readLegacyGlobal(locale);
		if (!base) return null;
		return { [`${locale}.trans`]: base };
	},
	/**
	* This merchant's own wording for `locale`, or `null` if they have none.
	*
	* Only worth calling when `settings.languages[<ISO>].has_custom_translations`
	* says there is something to get. Most stores have never customised a word,
	* and a miss here is an uncached round trip — `cf-cache-status: DYNAMIC` on a
	* 404 — on the critical path of an SSR render. The flag is what makes this
	* free for everyone who does not use it.
	*
	* Returned unwrapped, unlike {@link translations.get}: this is merged into
	* that one's messages rather than handed to i18next on its own.
	*/
	forStore: async (storeId, locale) => readLocaleFile(storeTranslationsPath(storeId, locale), { failLoudly: true }),
	/**
	* The platform's copy for `locale` with this merchant's wording laid over it.
	*
	* Takes the two as values rather than fetching them, so the caller decides
	* whether the second request happens at all and both stay separately cached.
	*/
	/**
	* The platform's copy for `locale` with this merchant's wording over it.
	*
	* Delegates to `composeMessages`, which every other reader of these two
	* entries also uses — see `api/messages.ts` for why there is exactly one.
	*/
	merge: (common, overrides, locale) => composeMessages(common, overrides, locale) ?? null,
	queries: {
		/**
		* @param locale taken as an argument rather than read from the twilight
		* context, and that is load-bearing. This key is built on the server, on
		* hydration, and again lazily from the context accessor; if any of the
		* three read a locale the others had not been given yet, the hydrated page
		* would miss the dehydrated entry and refetch both files it was just
		* handed. Every caller already has the locale in hand.
		*
		* The store is deliberately **not** in the key. One document serves one
		* store — a request that names a different one is redirected with
		* `reloadDocument`, so the client never changes store under a live cache —
		* and adding a value that resolves from the request on the server and from
		* the injected env on the client is how a key stops matching across
		* hydration.
		*/
		byLocale: (locale) => queryOptions({
			queryKey: translationsQueryKey(locale),
			queryFn: () => translations.get(locale)
		}),
		/**
		* This merchant's overrides, cached apart from the platform's copy.
		*
		* Its own entry rather than a wider `byLocale` key, so the common file is
		* fetched and dehydrated once per language whatever the store does, and a
		* store with no overrides never has an entry at all. Both sides compute the
		* key from the settings payload, so the hydrated page finds what the server
		* dehydrated instead of refetching it.
		*/
		byStore: (storeId, locale) => queryOptions({
			queryKey: storeTranslationsQueryKey(storeId, locale),
			queryFn: () => translations.forStore(storeId, locale)
		})
	}
};
//#endregion
//#region node_modules/.pnpm/@tanstack+router-ssr-query-_ceb0fd566d5a8a1af3c7f57a052f44bb/node_modules/@tanstack/router-ssr-query-core/dist/esm/index.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var shouldDehydrateAllQueries = () => true;
function setupCoreRouterSsrQueryIntegration({ router, queryClient, dehydrateOptions, hydrateOptions, handleRedirects = true }) {
	{
		const originalDehydrate = router.options.dehydrate;
		let streamState;
		let cleanedUp = false;
		const finalizeQueryStream = (failure) => {
			const state = streamState;
			streamState = void 0;
			if (!state) return;
			state.unsubscribe();
			try {
				if (failure) state.controller.error(failure.error);
				else state.controller.close();
			} catch {}
		};
		const teardown = () => {
			cleanedUp = true;
			finalizeQueryStream();
			queryClient.clear();
		};
		router.serverSsrLifecycle = {
			...router.serverSsrLifecycle,
			onServerSsrAttach: [...router.serverSsrLifecycle?.onServerSsrAttach ?? [], (serverSsr) => serverSsr.onCleanup(teardown)]
		};
		router.options.dehydrate = async () => {
			let originalDehydrated;
			try {
				originalDehydrated = await originalDehydrate?.();
			} finally {
				if (cleanedUp) queryClient.clear();
			}
			if (cleanedUp) return;
			const currentDehydrateOptions = queryClient.getDefaultOptions().dehydrate;
			const shouldDehydrateQuery = dehydrateOptions?.shouldDehydrateQuery ?? currentDehydrateOptions?.shouldDehydrateQuery ?? shouldDehydrateAllQueries;
			const serializeData = dehydrateOptions?.serializeData ?? currentDehydrateOptions?.serializeData;
			const shouldRedactErrors = dehydrateOptions?.shouldRedactErrors ?? currentDehydrateOptions?.shouldRedactErrors;
			const initialQueries = new Array();
			const sentQueries = /* @__PURE__ */ new Set();
			for (const query of queryClient.getQueryCache().getAll()) if (shouldDehydrateQuery(query)) {
				initialQueries.push(dehydrateQuery(query, serializeData, shouldRedactErrors));
				sentQueries.add(query.queryHash);
			}
			let controller;
			const stream = new ReadableStream({ start(value) {
				controller = value;
			} });
			const flushPendingQueries = () => {
				const state = streamState;
				const queries = state?.pendingQueries;
				if (!state || !queries) return;
				state.pendingQueries = void 0;
				const dehydratedQueries = new Array();
				for (const query of queries.values()) {
					if (state.sentQueries.has(query.queryHash) || !shouldDehydrateQuery(query)) continue;
					dehydratedQueries.push(dehydrateQuery(query, serializeData, shouldRedactErrors));
					state.sentQueries.add(query.queryHash);
				}
				if (dehydratedQueries.length > 0) state.controller.enqueue(dehydratedQueries);
			};
			const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
				const state = streamState;
				if (!state) return;
				if (state.sentQueries.has(event.query.queryHash) || !event.query.promise) return;
				if (!state.pendingQueries) {
					state.pendingQueries = /* @__PURE__ */ new Map();
					queueMicrotask(() => {
						try {
							flushPendingQueries();
						} catch (error) {
							finalizeQueryStream({ error });
						}
					});
				}
				state.pendingQueries.set(event.query.queryHash, event.query);
			});
			streamState = {
				controller,
				sentQueries,
				unsubscribe
			};
			const finishRendering = () => {
				try {
					flushPendingQueries();
				} catch (error) {
					finalizeQueryStream({ error });
					return;
				}
				finalizeQueryStream();
			};
			router.serverSsr.onRenderFinished(finishRendering);
			return {
				...originalDehydrated,
				query: {
					...initialQueries.length > 0 && { initial: initialQueries },
					stream
				}
			};
		};
		return;
	}
}
//#endregion
//#region node_modules/.pnpm/@tanstack+react-router-ssr-_02288c46e307069815842e66b0e94ed5/node_modules/@tanstack/react-router-ssr-query/dist/esm/index.js
function setupRouterSsrQueryIntegration(opts) {
	setupCoreRouterSsrQueryIntegration(opts);
	if (opts.wrapQueryClient === false) return;
	const OGWrap = opts.router.options.Wrap || import_react.Fragment;
	opts.router.options.Wrap = ({ children }) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
			client: opts.queryClient,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OGWrap, { children })
		});
	};
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-4SM6UKLE.js
var isList = ([key, value]) => key.endsWith("[]") && Array.isArray(value);
function stringifySearch(search) {
	const entries = Object.entries(search);
	const lists = entries.filter(isList);
	if (!lists.length) return defaultStringifySearch(search);
	const rest = defaultStringifySearch(Object.fromEntries(entries.filter((entry) => !isList(entry))));
	const repeated = lists.flatMap(([key, values]) => values.map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(typeof value === "string" ? value : JSON.stringify(value))}`));
	return `${rest || "?"}${rest ? "&" : ""}${repeated.join("&")}`;
}
var readServerCookieHeader = () => {
	try {
		return getRequestHeader("cookie") ?? null;
	} catch {
		return null;
	}
};
var writeServerLanguageCookie = (code) => {
	try {
		setCookie(LANGUAGE_COOKIE_NAME, code, {
			path: "/",
			maxAge: LANGUAGE_COOKIE_MAX_AGE,
			sameSite: "lax"
		});
	} catch {}
};
var readServerSearch = () => {
	try {
		return getRequestUrl().search;
	} catch {
		return "";
	}
};
function readPageSearch() {
	return readServerSearch() || (typeof window !== "undefined" ? window.location.search : "");
}
function readCookieHeader() {
	return readServerCookieHeader() ?? (typeof document !== "undefined" ? document.cookie : null);
}
function persistLanguageCookie(code) {
	writeServerLanguageCookie(code);
	if (typeof document !== "undefined") document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`;
}
var readServerCookieToken = () => {
	try {
		return getCookie("token") ?? null;
	} catch {
		return null;
	}
};
function scopeCookieUpdate(url, cookieHeader, settings) {
	if (!extractScopeFromUrl(url)) return null;
	const scope = resolveRequestScope(url, cookieHeader);
	const answered = settings.store?.scope;
	if (!scope || answered?.id == null || String(answered.id) !== scope.id) return null;
	const typed = answered.type ? {
		...scope,
		type: answered.type
	} : scope;
	return sameScope(extractScopeFromCookies(cookieHeader), typed) ? null : typed;
}
function alignRequestScopeType(queryClient, settings) {
	let scope;
	try {
		scope = getTwilightContext().scope;
	} catch {
		return;
	}
	const answered = settings.store?.scope;
	if (!scope || !answered?.type || String(answered.id) !== scope.id) return;
	if (answered.type === scope.type) return;
	const assumedKey = store.queries.settings().queryKey;
	const assumedAdsKey = advertisement.queries.list().queryKey;
	updateTwilightContext({ scope: {
		...scope,
		type: answered.type
	} });
	queryClient.setQueryData(store.queries.settings().queryKey, settings);
	queryClient.removeQueries({
		queryKey: assumedKey,
		exact: true
	});
	const ads = queryClient.getQueryData(assumedAdsKey);
	if (ads) queryClient.setQueryData(advertisement.queries.list().queryKey, ads);
	queryClient.removeQueries({
		queryKey: assumedAdsKey,
		exact: true
	});
}
var persistRequestScope = (settings) => {
	let scope;
	try {
		scope = scopeCookieUpdate(String(getRequestUrl()), getRequestHeader("cookie") ?? null, settings);
	} catch {
		return;
	}
	if (!scope) return;
	setCookie(SCOPE_COOKIE_NAME, JSON.stringify(scope), {
		path: "/",
		maxAge: SCOPE_COOKIE_MAX_AGE,
		sameSite: "lax"
	});
};
var requestCookies = () => {
	try {
		return getRequestHeader("cookie") ?? null;
	} catch {
		return null;
	}
};
var rememberOwnerView = (storeId) => {
	try {
		setCookie(VIEW_AS_OWNER_COOKIE_NAME, storeId, {
			path: "/",
			sameSite: "lax"
		});
	} catch {}
};
function resolveMaintenance(href, settings) {
	const fromLink = ownerLinkMatches(href, settings);
	const storeId = settings.store?.id;
	if (fromLink && storeId != null) rememberOwnerView(String(storeId));
	const viewAsOwner = fromLink || ownerCookieMatches(requestCookies(), settings);
	return showsMaintenancePage(settings, viewAsOwner);
}
function settleRequestScope(queryClient, settings) {
	if (typeof window !== "undefined") return;
	alignRequestScopeType(queryClient, settings);
	persistRequestScope(settings);
}
function settleSharedHostLanguage(settings, locale, location) {
	const base = resolveStoreBase();
	if (!base || !resolveStoreBaseFollowsLocale()) return;
	const url = new URL(location.href, "http://shared-host.invalid");
	const decision = decideSharedHostLanguage({
		settings,
		locale,
		href: `${prefixStoreBase(url.pathname, base, true)}${url.search}${url.hash}`,
		cookieHeader: readCookieHeader()
	});
	if (decision.cookie) persistLanguageCookie(decision.cookie);
	if (decision.redirectTo) throw redirect({
		href: decision.redirectTo,
		reloadDocument: true,
		replace: true
	});
}
async function withMerchantTranslations(queryClient, settings, locale, common) {
	const wanted = locale.toLowerCase();
	const language = settings.languages?.find((entry) => (entry.iso_code ?? entry.code)?.toLowerCase() === wanted);
	const storeId = settings.store?.id;
	if (!language?.has_custom_translations || !storeId) return common;
	try {
		const overrides = await queryClient.ensureQueryData(translations.queries.byStore(storeId, locale));
		return translations.merge(common, overrides, locale);
	} catch (error) {
		console.warn("[salla] merchant translations could not be read; using the platform copy", error);
		return common;
	}
}
function settingsFailureToThrow(failure) {
	if (!(failure instanceof SettingsError)) return new SettingsError();
	if (failure.reason === "not-found") updateTwilightContext({ storeNotFound: true });
	return failure;
}
async function rootBeforeLoad(ctx) {
	const locale = ctx.params.locale || "ar";
	const { dir } = getLanguageInfo(locale);
	if (ctx.context.setLocation) ctx.context.setLocation(ctx.location);
	updateTwilightContext({ locale });
	syncSdkLocale(locale);
	syncScopeCookie();
	let settingsFailure;
	const [settingsResult, translationsResult, snippetsResult, appSettingsResult] = await Promise.all([
		ctx.context.queryClient.ensureQueryData(store.queries.settings()).catch((error) => {
			settingsFailure = error;
			return null;
		}),
		ctx.context.queryClient.ensureQueryData(translations.queries.byLocale(locale)),
		ctx.context.queryClient.ensureQueryData(apps.queries.snippets()).catch((error) => {
			console.warn("[salla] apps/snippets prefetch failed; rendering no CDN snippet tags", error);
		}),
		ctx.context.queryClient.ensureQueryData(apps.queries.settings()).catch((error) => {
			console.warn("[salla] apps/snippets/settings prefetch failed; appScope buckets unseeded", error);
		}),
		ctx.context.queryClient.ensureQueryData(advertisement.queries.list()).catch((error) => {
			console.warn("[salla] advertisements prefetch failed; the ad bar loads late", error);
		})
	]);
	if (!settingsResult) throw settingsFailureToThrow(settingsFailure);
	syncSdkThemeVersion(settingsResult.headers);
	settleRequestScope(ctx.context.queryClient, settingsResult);
	const storeBaseHref = resolveStoreBaseRedirect(settingsResult.store?.username, ctx.location.href);
	if (storeBaseHref) throw redirect({
		href: storeBaseHref,
		reloadDocument: true,
		replace: true
	});
	settleSharedHostLanguage(settingsResult, locale, ctx.location);
	const maintenance = resolveMaintenance(ctx.location.href, settingsResult);
	const messages = await withMerchantTranslations(ctx.context.queryClient, settingsResult, locale, translationsResult);
	const i18n = createI18nInstance(locale, messages ?? void 0);
	let existingToken = null;
	try {
		existingToken = getTwilightContext().authToken;
	} catch {
		existingToken = null;
	}
	const cookieToken = typeof document !== "undefined" ? extractTokenFromCookies(document.cookie, AUTH_TOKEN_COOKIE_NAME) : null;
	const sallaToken = typeof window !== "undefined" && typeof window.salla?.storage?.get === "function" ? window.salla.storage.get(AUTH_TOKEN_COOKIE_NAME) : null;
	const serverCookieToken = readServerCookieToken();
	const authToken = ctx.serverContext?.authToken ?? serverCookieToken ?? existingToken ?? cookieToken ?? sallaToken ?? null;
	updateTwilightContext({
		queryClient: ctx.context.queryClient,
		settings: settingsResult,
		locale,
		location: ctx.location,
		i18n,
		authToken,
		appsSnippets: snippetsResult,
		appsSettings: appSettingsResult,
		maintenance
	});
	return {
		settings: settingsResult,
		locale,
		storeBaseFollowsLocale: resolveStoreBaseFollowsLocale(),
		dir,
		authToken,
		appsSnippets: snippetsResult,
		appsSettings: appSettingsResult,
		maintenance
	};
}
function storeBaseRewrite(base, followsLocale = false) {
	return {
		input: ({ url }) => {
			if (!followsLocale) {
				url.pathname = stripStoreBase(url.pathname, base);
				return url;
			}
			const [, first, second] = url.pathname.split("/");
			if (isLocale(first) && second === base) {
				url.pathname = stripStoreBase(url.pathname, base, true);
				return url;
			}
			const stripped = stripStoreBase(url.pathname, base);
			if (stripped === url.pathname) return url;
			const locale = virtualLocale(url.search, readCookieHeader());
			url.pathname = stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
			return url;
		},
		output: ({ url }) => {
			if (!followsLocale) {
				url.pathname = prefixStoreBase(url.pathname, base);
				return url;
			}
			const [, leading] = url.pathname.split("/");
			url.pathname = prefixStoreBase(url.pathname, base, true);
			const page = readPageSearch();
			if (hasLanguageParam(page) && !hasLanguageParam(url.search)) url.search = withLanguageParam(url.search, isLocale(leading) ? leading : virtualLocale(page, null));
			return url;
		}
	};
}
var TANSTACK_ROUTE_ID_MAP = {
	"/{-$locale}/": RouteId.INDEX,
	"/{-$locale}/cart": RouteId.CART,
	"/{-$locale}/search": RouteId.SEARCH,
	"/{-$locale}/latest-products": RouteId.PRODUCT_INDEX_LATEST,
	"/{-$locale}/most-sales-products": RouteId.PRODUCT_INDEX_SALES,
	"/{-$locale}/offers": RouteId.PRODUCT_INDEX_OFFERS,
	"/{-$locale}/products": RouteId.PRODUCT_INDEX,
	"/{-$locale}/$slug/c{$id}": RouteId.PRODUCT_INDEX,
	"/{-$locale}/$slug/p{$id}": RouteId.PRODUCT_SINGLE,
	"/{-$locale}/$slug/brand-{$id}": RouteId.BRANDS_SINGLE,
	"/{-$locale}/$slug/tag-{$id}": RouteId.PRODUCT_INDEX_TAG,
	"/{-$locale}/$slug/page-{$id}": RouteId.PAGE_SINGLE,
	"/{-$locale}/blog": RouteId.BLOG_INDEX,
	"/{-$locale}/blog/$slug/a-{$id}": RouteId.BLOG_SINGLE,
	"/{-$locale}/blog/$slug/c-{$id}": RouteId.BLOG_INDEX_CATEGORY,
	"/{-$locale}/blog/$slug/tag-{$id}": RouteId.BLOG_INDEX_TAG,
	"/{-$locale}/blog/author/$id": RouteId.BLOG_INDEX_AUTHOR,
	"/{-$locale}/brands": RouteId.BRANDS_INDEX,
	"/{-$locale}/brands/$id": RouteId.BRANDS_SINGLE,
	"/{-$locale}/tags/$id": RouteId.PRODUCT_INDEX_TAG,
	"/{-$locale}/profile": RouteId.CUSTOMER_PROFILE,
	"/{-$locale}/wishlist": RouteId.CUSTOMER_WISHLIST,
	"/{-$locale}/wallet": RouteId.CUSTOMER_WALLET,
	"/{-$locale}/notifications": RouteId.CUSTOMER_NOTIFICATIONS,
	"/{-$locale}/settings": RouteId.CUSTOMER_SETTINGS,
	"/{-$locale}/orders": RouteId.CUSTOMER_ORDERS_INDEX,
	"/{-$locale}/order/$id": RouteId.CUSTOMER_ORDERS_SINGLE,
	"/{-$locale}/pending-orders": RouteId.CUSTOMER_ORDERS_INDEX_PENDING,
	"/{-$locale}/account/pending_orders": RouteId.CUSTOMER_ORDERS_INDEX_PENDING,
	"/{-$locale}/account/rating": RouteId.CUSTOMER_ORDERS_INDEX,
	"/{-$locale}/logout": RouteId.LOGOUT,
	"/{-$locale}/loyalty": RouteId.LOYALTY,
	"/{-$locale}/loyalty_points": RouteId.CUSTOMER_LOYALTY_POINTS,
	"/{-$locale}/testimonials": RouteId.TESTIMONIALS,
	"/{-$locale}/reviews": RouteId.REVIEWS,
	"/{-$locale}/thankyou/$orderId": RouteId.THANK_YOU
};
function resolveRouteId(tanstackId) {
	return TANSTACK_ROUTE_ID_MAP[tanstackId] ?? tanstackId;
}
var LazyNotFoundPage = (0, import_react.lazy)(() => import("./not-found-BVJSPRMZ-CRX2dYAU.js").then((m) => ({ default: m.NotFoundPage })));
function StoreUnavailablePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			background: "#f9fafb"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				textAlign: "center",
				padding: "2rem"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					style: {
						fontSize: "1.5rem",
						marginBottom: "0.5rem"
					},
					children: "Store is temporarily unavailable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: { color: "#6b7280" },
					children: "We're having trouble loading the store. Please try again in a moment."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => window.location.reload(),
					style: {
						marginTop: "1rem",
						padding: "0.75rem 1.5rem",
						fontSize: "1rem",
						border: "none",
						borderRadius: "0.5rem",
						background: "#111827",
						color: "#fff",
						cursor: "pointer"
					},
					children: "Retry"
				})
			]
		})
	}) });
}
function RootErrorComponent({ error: _error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "ar",
		dir: "rtl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", { charSet: "UTF-8" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: "Store Unavailable" })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("body", {
			style: {
				margin: 0,
				fontFamily: "sans-serif"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreUnavailablePage, {})
		})]
	});
}
function createTwilightRootRoute() {
	const factory = createRootRouteWithContext();
	return (options) => factory({
		beforeLoad: rootBeforeLoad,
		head: rootHead,
		errorComponent: RootErrorComponent,
		...options
	});
}
function DefaultErrorComponent({ error }) {
	if (error instanceof RedirectError) return null;
	if (error instanceof NotFoundError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorPage, {
		code: 404,
		message: error.message
	});
	if (error instanceof UnauthorizedError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorPage, {
		code: 401,
		message: error.message,
		showAction: false
	});
	const message = error instanceof Error ? error.message : error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : void 0;
	if (error && typeof error === "object" && "response" in error) return responseErrorPage(error, message);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorPage, {
		code: 500,
		message
	});
}
function responseErrorPage(error, message) {
	if (isMissingResource(error)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorPage, { code: 404 });
	if (isHttpError(error)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorPage, { code: (responseStatusOf(error) ?? 500) >= 500 ? 500 : 400 });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorPage, {
		code: 400,
		message
	});
}
function isHttpError(error) {
	return error.name === "HTTPError";
}
var MISSING_AS_NOT_FOUND = /* @__PURE__ */ Symbol.for("salla.twilight.missingResourceAsNotFound");
function answerMissingResourcesWithNotFound(router) {
	for (const route of Object.values(router.routesById)) {
		if (route.isRoot) continue;
		const own = route.options.onError;
		if (own?.[MISSING_AS_NOT_FOUND]) continue;
		const onError = (error) => {
			own?.(error);
			if (isMissingResource(error)) throw notFound();
		};
		onError[MISSING_AS_NOT_FOUND] = true;
		route.options.onError = onError;
	}
}
function setupTwilightSsrIntegration(router, queryClient) {
	if (typeof window === "undefined") return;
	const ogHydrate = router.options.hydrate;
	router.options.hydrate = async (dehydratedData) => {
		await ogHydrate?.(dehydratedData);
		hydrateTwilightContext(router, queryClient);
	};
}
function routerLocation(router) {
	const loc = router.state?.location;
	if (!loc) return void 0;
	return {
		href: loc.href,
		pathname: loc.pathname,
		search: loc.search,
		searchStr: loc.searchStr,
		state: loc.state,
		hash: loc.hash
	};
}
function hydrateTwilightContext(router, queryClient) {
	const location = routerLocation(router);
	if (location) updateTwilightContext({ location });
	const rootMatch = router.state?.matches?.[0];
	if (!rootMatch) return;
	const beforeLoadCtx = rootMatch.__beforeLoadContext;
	const matchCtx = rootMatch.context;
	const settings = beforeLoadCtx?.settings ?? matchCtx?.settings;
	const locale = beforeLoadCtx?.locale ?? matchCtx?.locale;
	const authToken = beforeLoadCtx?.authToken ?? matchCtx?.authToken;
	const appsSnippets = beforeLoadCtx?.appsSnippets ?? matchCtx?.appsSnippets;
	const appsSettings = beforeLoadCtx?.appsSettings ?? matchCtx?.appsSettings;
	const maintenance = (beforeLoadCtx?.maintenance ?? matchCtx?.maintenance) === true;
	if (!settings || !locale) return;
	const i18n = createI18nInstance(locale, messagesForLocale(queryClient, locale));
	const matches = router.state?.matches;
	const page = matches?.reduceRight((found, m) => found ?? (m.loaderData?.page ? m.loaderData.page : null), null);
	const leafMatch = matches?.[matches.length - 1];
	const routeId = leafMatch?.routeId ? resolveRouteId(leafMatch.routeId) : void 0;
	updateTwilightContext({
		queryClient,
		settings,
		locale,
		i18n,
		authToken,
		location,
		page,
		routeId,
		appsSnippets,
		appsSettings,
		maintenance
	});
}
var lastProductView;
function syncPageFromMatches(router) {
	const matches = router.state?.matches;
	if (!matches) return;
	const data = matches.reduceRight((found, m) => {
		const loaderData = m.loaderData;
		return found ?? (loaderData?.page ? loaderData : null);
	}, null);
	const page = data?.page;
	if (!page) return;
	updateTwilightContext({ page });
	const sdkPage = {
		...page,
		url: page.url ?? router.state.location.pathname + router.state.location.searchStr
	};
	const push = () => window.salla?.config?.set?.("page", sdkPage);
	if (window.salla?.config?.set) push();
	else window.addEventListener("salla::created", push, { once: true });
	const view = router.state.location.state?.key ?? router.state.location.href;
	if (page.slug !== RouteId.PRODUCT_SINGLE || !data.product) lastProductView = void 0;
	else if (view !== lastProductView) {
		lastProductView = view;
		dispatchProductViewed(data.product);
	}
}
function createRouter(routeTree, options) {
	setHeadAdapter(tanstackHeadAdapter);
	const { defaultPendingComponent: pendingOpt, defaultPendingMs = 100, defaultPendingMinMs = 200, defaultStaleTime = Infinity, history } = options ?? {};
	const pendingComponent = pendingOpt === false ? void 0 : pendingOpt ?? (() => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {}));
	const queryClient = new QueryClient({ defaultOptions: {
		queries: {
			staleTime: 6e4,
			gcTime: 3e5,
			retry: 1,
			refetchOnWindowFocus: false
		},
		mutations: { retry: 0 },
		dehydrate: { shouldDehydrateQuery }
	} });
	updateTwilightContext({ queryClient });
	const storeBase = resolveStoreBase();
	const router = createRouter$1({
		routeTree,
		...history ? { history } : {},
		...storeBase ? { rewrite: storeBaseRewrite(storeBase, resolveStoreBaseFollowsLocale()) } : {},
		context: {
			queryClient,
			setLocation: (location) => {
				updateTwilightContext({ location });
			}
		},
		defaultPreload: "intent",
		scrollRestoration: true,
		scrollRestorationBehavior: "instant",
		trailingSlash: "never",
		stringifySearch,
		defaultStaleTime,
		defaultNotFoundComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeleton, {}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNotFoundPage, {})
		}),
		defaultPendingComponent: pendingComponent,
		defaultPendingMs,
		defaultPendingMinMs,
		defaultErrorComponent: DefaultErrorComponent
	});
	answerMissingResourcesWithNotFound(router);
	setupRouterSsrQueryIntegration({
		router,
		queryClient
	});
	setupTwilightSsrIntegration(router, queryClient);
	function syncNavigationState() {
		const state = router?.state;
		if (!state?.location) return;
		const loc = state.location;
		updateTwilightContext({ location: {
			href: loc.href,
			pathname: loc.pathname,
			search: loc.search,
			searchStr: loc.searchStr,
			state: loc.state,
			hash: loc.hash
		} });
		const matches = state.matches;
		const leafMatch = matches[matches.length - 1];
		if (leafMatch?.routeId) {
			const semanticId = resolveRouteId(leafMatch.routeId);
			updateTwilightContext({ routeId: semanticId });
		}
		const rootMatch = state.matches[0];
		if (rootMatch?.context) {
			const ctx = rootMatch.context;
			if (ctx?.settings) updateTwilightContext({
				settings: ctx.settings,
				locale: ctx.locale
			});
		}
	}
	router.subscribe("onLoad", () => syncPageFromMatches(router));
	router.subscribe("onRendered", () => syncPageFromMatches(router));
	router.subscribe("onResolved", () => {
		syncNavigationState();
		dispatchRouteChanged();
	});
	return router;
}
var ROUTE_CLASS_MAP = {
	"/{-$locale}/": "index",
	"/{-$locale}/cart": "cart",
	"/{-$locale}/$slug/c{$id}": "product-index",
	"/{-$locale}/offers": "product-index-offers",
	"/{-$locale}/products": "product-index",
	"/{-$locale}/latest-products": "product-index-latest",
	"/{-$locale}/most-sales-products": "product-index-sales",
	"/{-$locale}/search": "product-index-search",
	"/{-$locale}/$slug/tag-{$id}": "product-index-tag",
	"/{-$locale}/tags/$id": "product-index-tag",
	"/{-$locale}/$slug/p{$id}": "product-single",
	"/{-$locale}/$slug/page-{$id}": "page-single",
	"/{-$locale}/page/$slug": "page-single",
	"/{-$locale}/p/$slug": "page-single",
	"/{-$locale}/thankyou/$orderId": "thank-you",
	"/{-$locale}/orders": "customer-orders-index",
	"/{-$locale}/pending-orders": "customer-orders-index-pending",
	"/{-$locale}/account/pending_orders": "customer-orders-index-pending",
	"/{-$locale}/account/rating": "customer-orders-index",
	"/{-$locale}/order/$id": "customer-orders-single",
	"/{-$locale}/profile": "customer-profile",
	"/{-$locale}/wallet": "customer-wallet",
	"/{-$locale}/wishlist": "customer-wishlist",
	"/{-$locale}/notifications": "customer-notifications",
	"/{-$locale}/testimonials": "testimonials",
	"/{-$locale}/reviews": "reviews",
	"/{-$locale}/brands": "brands-index",
	"/{-$locale}/brands/$id": "brands-single",
	"/{-$locale}/$slug/brand-{$id}": "brands-single",
	"/{-$locale}/blog": "blog-index",
	"/{-$locale}/blog/$slug/a-{$id}": "blog-single",
	"/{-$locale}/blog/$slug/c-{$id}": "blog-index-category",
	"/{-$locale}/blog/$slug/tag-{$id}": "blog-index-tag",
	"/{-$locale}/blog/author/$id": "blog-index-author",
	"/{-$locale}/loyalty": "loyalty",
	"/{-$locale}/loyalty_points": "customer-loyalty-points"
};
var PRODUCTS_SOURCE_CLASS = {
	latest: "product-index-latest",
	sales: "product-index-sales",
	offers: "product-index-offers"
};
function routeClassOf(matches) {
	for (let i = matches.length - 1; i >= 0; i--) {
		const { routeId, search } = matches[i];
		if (routeId === "/{-$locale}/products") {
			const source = search?.source;
			return typeof source === "string" && Object.hasOwn(PRODUCTS_SOURCE_CLASS, source) ? PRODUCTS_SOURCE_CLASS[source] : "product-index";
		}
		if (routeId in ROUTE_CLASS_MAP) return ROUTE_CLASS_MAP[routeId];
	}
	return null;
}
function TanStackDocumentSync() {
	const matches = useRouterState({ select: (s) => s.matches }) || [];
	if (typeof window === "undefined") {
		const leaf = matches[matches.length - 1];
		if (leaf?.routeId) updateTwilightContext({ routeId: resolveRouteId(leaf.routeId) });
		const page = matches.reduceRight((found, match) => found ?? match.loaderData?.page, void 0);
		if (page) updateTwilightContext({ page });
	}
	const routeClass = routeClassOf(matches);
	useDocumentClass(routeClass ? { body: { class: routeClass } } : {});
	return null;
}
//#endregion
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-OOLS535M.js
function localizeDestination(destination, locale) {
	if (!locale || !destination.startsWith("/") || destination.startsWith("//")) return destination;
	const firstSegment = destination.split("/")[1]?.split(/[?#]/)[0];
	if (isLocale(firstSegment)) return destination;
	return destination === "/" ? `/${locale}` : `/${locale}${destination}`;
}
var TanStackLinkAdapter = (0, import_react.forwardRef)(({ to, href, children, className, style, title, target, rel, onClick, preload, replace, "aria-label": ariaLabel, ...rest }, ref) => {
	const { locale } = useParams({ strict: false });
	const destination = localizeDestination(to ?? href ?? "/", locale);
	return (0, import_react.createElement)(Link, {
		ref,
		to: destination,
		className,
		style,
		title,
		target,
		rel,
		onClick,
		preload: preload === "intent" || preload === false ? preload : void 0,
		replace,
		"aria-label": ariaLabel,
		...rest
	}, children);
});
TanStackLinkAdapter.displayName = "TanStackLinkAdapter";
var UI_UPDATE_EVENT = "mobile::ui.update";
var OPEN_ORDER_EVENT = "mobile::open.order";
var NAVIGATE_TO_EVENT = "mobile::navigate.to";
function NativeAppEvents({ locale }) {
	return useIsNativeApp() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Listeners, { locale }) : null;
}
function Listeners({ locale }) {
	useNativeAppEvents(locale);
	return null;
}
function useNativeAppEvents(locale) {
	const router = useRouter();
	const { store } = useTwilight();
	const storeUrl = store?.url;
	const username = store?.username;
	(0, import_react.useEffect)(() => {
		const open = (path) => void router.navigate({ href: localizeDestination(path, locale) });
		const refresh = () => {
			Promise.allSettled([router.invalidate(), getTwilightContext().queryClient?.refetchQueries({ type: "active" })]);
		};
		const openOrder = (data) => {
			const rawId = data?.id;
			if (typeof rawId !== "string" && typeof rawId !== "number") return;
			const id = String(rawId).trim();
			if (!id) return;
			getTwilightContext().queryClient?.invalidateQueries({ queryKey: ["cart"] });
			open(`/account/orders/${encodeURIComponent(id)}`);
		};
		const navigateTo = (data) => {
			const url = data?.url;
			if (typeof url !== "string" || !url.trim() || !storeUrl) return;
			const path = deepLinkPath(url.trim(), storeUrl, username);
			if (path) router.navigate({ href: inLocale(path, locale) });
		};
		const offs = [
			onSallaEvent(UI_UPDATE_EVENT, refresh),
			onSallaEvent(OPEN_ORDER_EVENT, openOrder),
			onSallaEvent(NAVIGATE_TO_EVENT, navigateTo)
		];
		return () => offs.forEach((off) => off());
	}, [
		router,
		locale,
		storeUrl,
		username
	]);
}
function isAbsoluteUrl(url) {
	if (url.startsWith("//")) return true;
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}
function deepLinkPath(url, storeUrl, username) {
	const path = resolveRelativePath(url, storeUrl, username);
	if (!path || !isAbsoluteUrl(url)) return path;
	const { pathname } = new URL(url, window.location.href);
	return hasStoreUrlBase(pathname, new URL(storeUrl).pathname, username) ? path : null;
}
function inLocale(path, locale) {
	const first = path.split("/")[1]?.split(/[?#]/)[0];
	const own = isLocale(first) ? path.slice(first.length + 1) : path;
	const rest = own.startsWith("/") ? own : `/${own}`;
	if (!locale) return rest;
	return rest === "/" ? `/${locale}` : `/${locale}${rest}`;
}
function requestHostOf(request) {
	try {
		const fromUrl = new URL(request.url).host;
		if (fromUrl) return fromUrl;
	} catch {}
	return request.headers.get("Host")?.trim() || null;
}
function requestOriginOf(host) {
	return `${isLoopback(host.replace(/:\d+$/, "")) ? "http" : "https"}://${host}`;
}
function currentOrigin() {
	if (typeof window !== "undefined") return window.location.origin;
	const host = getRequestStore().requestHost;
	return host ? requestOriginOf(host) : null;
}
configureNavigation({
	notFound: (message) => {
		throw notFound({ data: message });
	},
	redirect: (path, opts) => {
		throw redirect({
			to: path,
			replace: opts?.replace,
			statusCode: opts?.statusCode
		});
	},
	unauthorized: (message) => {
		const origin = currentOrigin();
		const { pathname, searchStr } = getTwilightContext().location;
		const href = origin && loginRedirectHref({
			pathname,
			searchStr,
			origin,
			base: resolveStoreBase(),
			baseFollowsLocale: resolveStoreBaseFollowsLocale()
		});
		if (href) throw redirect({
			href,
			reloadDocument: true,
			replace: true
		});
		throw new UnauthorizedError(message);
	}
});
function NavigationSetup({ children }) {
	const navigate = useNavigate();
	const { locale } = useParams({ strict: false });
	const navigateFn = (0, import_react.useCallback)((to, opts) => navigate({
		to: localizeDestination(to, locale),
		replace: opts?.replace
	}), [navigate, locale]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavigationProvider, {
		navigate: navigateFn,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeAppEvents, { locale }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkProvider, {
			adapter: TanStackLinkAdapter,
			children
		})]
	});
}
//#endregion
export { createTwilightRootRoute as a, withHead as c, createRouter as i, ErrorPage as l, requestHostOf as n, readNativeAppHeaders as o, TanStackDocumentSync as r, store as s, NavigationSetup as t };

//# sourceMappingURL=chunk-OOLS535M-Ck3EDFtG.js.map