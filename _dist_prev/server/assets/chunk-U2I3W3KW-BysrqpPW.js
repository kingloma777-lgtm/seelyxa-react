import { Jn as queryOptions, Ur as api, zi as getTwilightContext } from "./shared-home-CDptNpzP.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/chunk-U2I3W3KW.js
var menu = {
	header: async () => {
		const { locale } = getTwilightContext();
		const { data } = await api.get(`menus/header?lang=${locale}`).json();
		return data || [];
	},
	footer: async () => {
		const { locale } = getTwilightContext();
		const { data } = await api.get(`menus/footer?lang=${locale}`).json();
		return data || [];
	},
	queries: { header: () => queryOptions({
		queryKey: [
			"menus",
			"header",
			getTwilightContext().locale
		],
		queryFn: () => menu.header(),
		staleTime: 3e5
	}) }
};
//#endregion
export { menu as t };

//# sourceMappingURL=chunk-U2I3W3KW-BysrqpPW.js.map