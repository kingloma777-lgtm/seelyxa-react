import { Wr as api, Yn as queryOptions, kr as orThrow } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-G3UTLR3D.js
var brand = {
	list: async (page) => {
		const { data, cursor } = await api.get(page ? `brands?page=${page}` : "brands").json();
		return {
			items: data ?? [],
			next: cursor?.next ?? null
		};
	},
	find: async (id) => {
		const { data } = await api.get(`brands/${id}`).json();
		return data;
	},
	findOrThrow: (id) => orThrow(brand.find(id)),
	queries: {
		list: (page) => queryOptions({
			queryKey: [
				"brands",
				"list",
				page ?? 1
			],
			queryFn: () => brand.list(page)
		}),
		detail: (id) => queryOptions({
			queryKey: [
				"brands",
				"detail",
				id
			],
			queryFn: () => brand.find(id)
		})
	}
};
//#endregion
export { brand as t };

//# sourceMappingURL=chunk-G3UTLR3D-BnwaVoVY.js.map