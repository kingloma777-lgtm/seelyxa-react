import { Wr as api, Xr as getAuthToken, Yn as queryOptions, kr as orThrow } from "./shared-home-CR99BuTM.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-37O7OVPL.js
var loyalty = {
	get: async () => {
		const { data } = await api.get("loyalty").json();
		return data;
	},
	getOrThrow: () => orThrow(loyalty.get()),
	getPointsBalance: async () => {
		return (await api.get("balance/points").json()).balance;
	},
	queries: {
		detail: () => queryOptions({
			queryKey: ["loyalty"],
			queryFn: () => loyalty.get()
		}),
		points: () => queryOptions({
			queryKey: ["loyalty", "points"],
			queryFn: () => loyalty.getPointsBalance(),
			enabled: !!getAuthToken(),
			staleTime: 3e4
		})
	}
};
//#endregion
export { loyalty as t };

//# sourceMappingURL=chunk-37O7OVPL-zqaDX1SL.js.map