import { Yr as api, ei as getActiveScope, er as queryOptions, ot as rememberProductPreview } from "./shared-home-CcULkdy1.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-QIJJTWW6.js
var wishlist = {
	list: async (params = {}) => {
		const { page = 1, perPage = 15, filterable, signal } = params;
		const searchParams = new URLSearchParams();
		searchParams.set("source", "wishlist");
		searchParams.set("page", String(page));
		searchParams.set("per_page", String(perPage));
		if (filterable !== void 0) searchParams.set("filterable", filterable ? "1" : "0");
		const options = {};
		if (signal) options.signal = signal;
		const response = await api.get(`products?${searchParams.toString()}`, options).json();
		const items = response.data ?? [];
		for (const item of items) rememberProductPreview(item);
		return {
			items,
			next: response.cursor?.next ?? null
		};
	},
	queries: { list: (params) => queryOptions({
		queryKey: [
			"wishlist",
			"list",
			params,
			{ scope: getActiveScope() }
		],
		queryFn: ({ signal }) => wishlist.list({
			...params,
			signal
		})
	}) }
};
//#endregion
export { wishlist as t };

//# sourceMappingURL=chunk-QIJJTWW6-D47C-RwN.js.map