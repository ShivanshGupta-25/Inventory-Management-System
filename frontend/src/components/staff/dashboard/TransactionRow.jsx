import { Minus, Plus } from "lucide-react";

const TransactionRow = ({ transaction }) => {
  const productName =
    transaction.productName ||
    transaction.product?.productName ||
    transaction.product ||
    "Product";

  const type =
    transaction.type ||
    transaction.transactionType ||
    transaction.action ||
    "Movement";

  const quantity =
    transaction.quantity ??
    transaction.qty ??
    0;

  const normalizedType = String(type).toLowerCase();

  const isIn =
    normalizedType.includes("in") ||
    normalizedType.includes("receive") ||
    normalizedType.includes("add");

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isIn
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isIn ? (
            <Plus size={15} />
          ) : (
            <Minus size={15} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700">
            {productName}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {type}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-xs font-semibold ${
            isIn
              ? "text-emerald-600"
              : "text-slate-700"
          }`}
        >
          {isIn ? "+" : "-"}
          {quantity}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          units
        </p>
      </div>
    </div>
  );
};

export default TransactionRow;