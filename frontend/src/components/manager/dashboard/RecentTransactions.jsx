
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  AlertTriangle,
  SlidersHorizontal,
  Search,
  X,
} from "lucide-react";

const RecentTransactions = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getTransactionInfo = (transaction) => {
    switch (transaction.type) {
      case "IN":
        return {
          label: "Purchase",
          icon: ArrowDownLeft,
          badge: "bg-emerald-50 text-emerald-600",
          quantity: `+${transaction.quantity}`,
          quantityStyle: "text-emerald-600",
        };

      case "OUT":
        return {
          label: "Sale",
          icon: ArrowUpRight,
          badge: "bg-blue-50 text-blue-600",
          quantity: `-${transaction.quantity}`,
          quantityStyle: "text-slate-700",
        };

      case "RETURN":
        return {
          label: "Return",
          icon: RotateCcw,
          badge: "bg-violet-50 text-violet-600",
          quantity: `+${transaction.quantity}`,
          quantityStyle: "text-violet-600",
        };

      case "DAMAGE":
        return {
          label: "Damage",
          icon: AlertTriangle,
          badge: "bg-red-50 text-red-600",
          quantity: `-${transaction.quantity}`,
          quantityStyle: "text-red-600",
        };

      case "ADJUSTMENT":
        return {
          label: "Adjustment",
          icon: SlidersHorizontal,
          badge: "bg-amber-50 text-amber-600",
          quantity: transaction.quantity,
          quantityStyle: "text-amber-600",
        };

      default:
        return {
          label: transaction.type || "Movement",
          icon: SlidersHorizontal,
          badge: "bg-slate-50 text-slate-600",
          quantity: transaction.quantity,
          quantityStyle: "text-slate-700",
        };
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTransactionId = (transaction) => {
    return transaction.referenceId
      ? `#${String(transaction.referenceId)
          .slice(-8)
          .toUpperCase()}`
      : `#MOV-${String(transaction._id || "")
          .slice(-6)
          .toUpperCase()}`;
  };

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return data;
    }

    return data.filter((transaction) => {
      const transactionId = getTransactionId(transaction);

      const productName =
        transaction.product?.productName || "";

      const sku = transaction.product?.sku || "";

      const type = transaction.type || "";

      const transactionLabel =
        getTransactionInfo(transaction).label;

      const quantity = String(transaction.quantity ?? "");

      const date = formatDate(transaction.createdAt);

      const searchableText = [
        transactionId,
        productName,
        sku,
        type,
        transactionLabel,
        quantity,
        date,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [data, searchTerm]);

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Transactions
            </h2>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {filteredTransactions.length}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Latest inventory movements
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500">
            <SlidersHorizontal size={18} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            No recent transactions
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Inventory movements will appear here.
          </p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500">
            <Search size={18} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            No matching transactions
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try searching with a different keyword.
          </p>

          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /*
         * Scrollable table container.
         * Change max-h-[420px] to adjust the visible height.
         */
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Transaction
                </th>

                <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Product
                </th>

                <th className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Type
                </th>

                <th className="whitespace-nowrap px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Quantity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction, index) => {
                const {
                  label,
                  icon: Icon,
                  badge,
                  quantity,
                  quantityStyle,
                } = getTransactionInfo(transaction);

                const transactionId =
                  getTransactionId(transaction);

                return (
                  <tr
                    key={
                      transaction._id ||
                      transaction.referenceId ||
                      index
                    }
                    className="transition hover:bg-slate-50/60"
                  >
                    {/* Transaction */}
                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-xs font-semibold text-slate-700">
                        {transactionId}
                      </p>

                      <p className="mt-1 whitespace-nowrap text-[10px] text-slate-400">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4">
                      <p className="max-w-[220px] truncate text-sm text-slate-700">
                        {transaction.product?.productName ||
                          "Unknown Product"}
                      </p>

                      {transaction.product?.sku && (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          SKU: {transaction.product.sku}
                        </p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${badge}`}
                      >
                        <Icon size={11} />
                        {label}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td
                      className={`whitespace-nowrap px-5 py-4 text-right text-sm font-semibold ${quantityStyle}`}
                    >
                      {quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {data.length > 0 && filteredTransactions.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-[11px] text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filteredTransactions.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {data.length}
            </span>{" "}
            transactions
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;