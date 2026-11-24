import { Pr as orThrow, Yr as api, ei as getActiveScope, er as queryOptions } from "./shared-home-CcULkdy1.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-MBSWV56J.js
var category = {
	find: async (id) => {
		const { data } = await api.get(`categories/${id}`).json();
		return data;
	},
	findOrThrow: (id) => orThrow(category.find(id)),
	list: async () => {
		const { data } = await api.get("categories").json();
		return data ?? [];
	},
	queries: {
		detail: (id) => queryOptions({
			queryKey: [
				"categories",
				"detail",
				id
			],
			queryFn: () => category.find(id)
		}),
		list: () => queryOptions({
			queryKey: [
				"categories",
				"list",
				{ scope: getActiveScope() }
			],
			queryFn: () => category.list()
		})
	}
};
//#endregion
export { category as t };

//# sourceMappingURL=chunk-MBSWV56J-B5-N4ih1.js.map