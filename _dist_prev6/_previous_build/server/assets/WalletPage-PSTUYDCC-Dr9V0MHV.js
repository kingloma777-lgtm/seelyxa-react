import { i as __toESM } from "./rolldown-runtime-DbVrKiKs.js";
import { It as useMoney, la as require_jsx_runtime, mn as LazyNoContent, qn as useTranslation, ua as require_react, wn as HookSlot } from "./shared-home-CSJrMlCW.js";
import { t as ItemsList } from "./ItemsList-C8nO-_SN.js";
import { t as wallet } from "./chunk-ETQFCKGR-DAzjFIIz.js";
//#region node_modules/.pnpm/@salla.sa+twilight-theme-en_694ffbb2c89057476140784e8f957e86/node_modules/@salla.sa/twilight-theme-engine/dist/WalletPage-PSTUYDCC.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TransactionRow = (0, import_react.memo)(function TransactionRow2({ transaction }) {
	const { t, locale } = useTranslation();
	const { format: formatMoney } = useMoney();
	const formatTimestamp = (ts) => {
		if (!ts) return "";
		return (/* @__PURE__ */ new Date(ts * 1e3)).toLocaleDateString(locale, {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric"
		});
	};
	const actionTypeClass = transaction.action_type === "cashback" ? "s-wallet-table-transaction-status-cashback" : transaction.action_type === "refund" ? "s-wallet-table-transaction-status-refund" : transaction.action_type === "purchase_by_wallet" ? "s-wallet-table-transaction-status-purchase" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "s-wallet-table-tbody-tr s-wallet-table-tbody-tr-shadow animated",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "s-wallet-table-tbody-tr-td",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-wallet-table-tbody-tr-td-content",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "s-wallet-mobile-title",
							children: [t("pages.wallet.transaction_number"), ":"]
						}),
						transaction.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden md:inline-block",
							children: ["#", transaction.id]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center md:hidden",
							children: transaction.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["#", transaction.id] })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "s-wallet-table-tbody-tr-td",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-wallet-table-tbody-tr-td-content",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "s-wallet-mobile-title",
						children: [t("pages.wallet.amount"), ":"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: formatMoney(transaction.amount, { type: "general" }) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "s-wallet-table-tbody-tr-td",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-wallet-table-tbody-tr-td-content",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "s-wallet-mobile-title",
						children: [t("pages.wallet.date"), ":"]
					}), transaction.created_at ? formatTimestamp(transaction.created_at) : ""]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "s-wallet-table-tbody-tr-td",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-wallet-table-tbody-tr-td-content",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "s-wallet-mobile-title",
						children: [t("pages.wallet.order_no"), ":"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rtl:mr-auto ltr:ml-auto md:mx-0",
						children: transaction.order_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["#", transaction.order_id] })
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "s-wallet-table-tbody-tr-td",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-wallet-table-tbody-tr-td-content",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "s-wallet-mobile-title",
						children: [t("pages.wallet.expiry_date"), ":"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: transaction.expired_at ? formatTimestamp(transaction.expired_at) : "" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "s-wallet-table-tbody-tr-td",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "s-wallet-table-tbody-tr-td-content",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "s-wallet-mobile-title",
						children: [t("pages.wallet.transaction_type"), ":"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `s-wallet-table-transaction-status-default ${actionTypeClass}`,
						children: [!!transaction.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							id: transaction.id.toString(),
							className: "sicon-information text-lg rtl:ml-4 ltr:mr-4 s-wallet-table-transaction-status-icon-success"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("salla-tooltip", {
							text: transaction.description,
							targetId: transaction.id.toString()
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: transaction.title })]
					})]
				})
			})
		]
	});
});
function WalletPage({ query, transactions, balance, pagination }) {
	const { t } = useTranslation();
	const { format: formatMoney } = useMoney();
	const nextPageRef = (0, import_react.useRef)(query.page + 1);
	const loader = (0, import_react.useCallback)(async () => {
		const pageToLoad = nextPageRef.current;
		const result = await wallet.list({ page: pageToLoad });
		nextPageRef.current = pageToLoad + 1;
		return {
			items: result.items,
			next: result.next
		};
	}, []);
	if (transactions.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:wallet.transactions.start" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyNoContent, {
			icon: "sicon-full-wallet",
			message: `${t("pages.wallet.no_transactions")}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:wallet.transactions.end" })
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:wallet.transactions.start" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
			className: "s-wallet-table",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "s-wallet-table-tbody",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: "s-table__tr",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "s-wallet-table-balance-container",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "s-wallet-table-balance-icon sicon-wallet" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: formatMoney(balance, { type: "general" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-normal text-gray-400",
							children: t("pages.wallet.balance")
						})] })]
					}) })
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-8",
			children: t("pages.wallet.title")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "s-wallet-table",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "s-wallet-table-head",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "s-wallet-table-head-tr",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							children: t("pages.wallet.transaction_number")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "s-wallet-table-head-tr-th",
							children: t("pages.wallet.amount")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "s-wallet-table-head-tr-th",
							children: t("pages.wallet.date")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "s-wallet-table-head-tr-th",
							children: t("pages.wallet.order_no")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "s-wallet-table-head-tr-th",
							children: t("pages.wallet.expiry_date")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "s-wallet-table-head-tr-th",
							children: t("pages.wallet.transaction_type")
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
				className: "s-wallet-table-tbody",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemsList, {
					items: transactions,
					loader,
					mode: pagination.next ? "infinite" : "static",
					itemsAs: "Fragment",
					t: (key, fallback) => t(key, fallback || key),
					children: (items) => items.map((transaction) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionRow, { transaction }, transaction.id))
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HookSlot, { name: "customer:wallet.transactions.end" })
	] });
}
//#endregion
export { WalletPage };

//# sourceMappingURL=WalletPage-PSTUYDCC-Dr9V0MHV.js.map