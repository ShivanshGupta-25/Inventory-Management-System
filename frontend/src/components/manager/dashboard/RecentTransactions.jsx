import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";

const RecentTransactions = ({
  data = [],
}) => {
  const getTransactionInfo = (transaction) => {
    switch (transaction.type) {
      case "IN":
        return {
          label: "Purchase",
          icon: ArrowDownLeft,
          badge:
            "bg-emerald-50 text-emerald-600",
          quantity:
            `+${transaction.quantity}`,
          quantityStyle:
            "text-emerald-600",
        };

      case "OUT":
        return {
          label: "Sale",
          icon: ArrowUpRight,
          badge:
            "bg-blue-50 text-blue-600",
          quantity:
            `-${transaction.quantity}`,
          quantityStyle:
            "text-slate-700",
        };

      case "RETURN":
        return {
          label: "Return",
          icon: RotateCcw,
          badge:
            "bg-violet-50 text-violet-600",
          quantity:
            `+${transaction.quantity}`,
          quantityStyle:
            "text-violet-600",
        };

      case "DAMAGE":
        return {
          label: "Damage",
          icon: AlertTriangle,
          badge:
            "bg-red-50 text-red-600",
          quantity:
            `-${transaction.quantity}`,
          quantityStyle:
            "text-red-600",
        };

      case "ADJUSTMENT":
        return {
          label: "Adjustment",
          icon: SlidersHorizontal,
          badge:
            "bg-amber-50 text-amber-600",
          quantity:
            transaction.quantity,
          quantityStyle:
            "text-amber-600",
        };

      default:
        return {
          label: transaction.type || "Movement",
          icon: SlidersHorizontal,
          badge:
            "bg-slate-50 text-slate-600",
          quantity:
            transaction.quantity,
          quantityStyle:
            "text-slate-700",
        };
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Transactions
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Latest inventory movements
        </p>
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Transaction
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Product
                </th>

                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Type
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Quantity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data.map((transaction) => {
                const {
                  label,
                  icon: Icon,
                  badge,
                  quantity,
                  quantityStyle,
                } =
                  getTransactionInfo(
                    transaction
                  );

                const transactionId =
                  transaction.referenceId
                    ? `#${transaction.referenceId
                        .slice(-8)
                        .toUpperCase()}`
                    : `#MOV-${String(
                        transaction._id
                      )
                        .slice(-6)
                        .toUpperCase()}`;

                return (
                  <tr
                    key={transaction._id}
                    className="transition hover:bg-slate-50/60"
                  >
                    {/* Transaction */}
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-700">
                        {transactionId}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDate(
                          transaction.createdAt
                        )}
                      </p>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">
                        {transaction.product
                          ?.productName ||
                          "Unknown Product"}
                      </p>

                      {transaction.product
                        ?.sku && (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          SKU:{" "}
                          {
                            transaction
                              .product.sku
                          }
                        </p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${badge}`}
                      >
                        <Icon size={11} />
                        {label}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td
                      className={`px-5 py-4 text-right text-sm font-semibold ${quantityStyle}`}
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
    </div>
  );
};

export default RecentTransactions;