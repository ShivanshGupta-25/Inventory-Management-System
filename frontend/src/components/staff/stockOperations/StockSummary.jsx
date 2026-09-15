import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
} from "lucide-react";

const StockSummary = ({
  product,
  quantity,
  operationType,
}) => {
  if (!product) return null;

  const currentStock =
    Number(product.currentStock) || 0;

  const numericQuantity =
    Number(quantity) || 0;

  const newStock =
    operationType === "IN"
      ? currentStock + numericQuantity
      : currentStock - numericQuantity;

  const isInvalid =
    operationType === "OUT" &&
    numericQuantity > currentStock;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <Package size={17} />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700">
            {product.productName}
          </p>

          <p className="text-[11px] text-slate-400">
            SKU: {product.sku || "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white p-3">
          <p className="text-[10px] font-medium text-slate-400">
            Current
          </p>

          <p className="mt-1 text-sm font-bold text-slate-700">
            {currentStock}
          </p>
        </div>

        <div className="rounded-lg bg-white p-3">
          <p className="text-[10px] font-medium text-slate-400">
            Change
          </p>

          <div className="mt-1 flex items-center gap-1">
            {operationType === "IN" ? (
              <ArrowDownToLine
                size={13}
                className="text-emerald-600"
              />
            ) : (
              <ArrowUpFromLine
                size={13}
                className="text-slate-500"
              />
            )}

            <span
              className={`text-sm font-bold ${
                operationType === "IN"
                  ? "text-emerald-600"
                  : "text-slate-700"
              }`}
            >
              {operationType === "IN"
                ? "+"
                : "-"}
              {numericQuantity}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-3">
          <p className="text-[10px] font-medium text-slate-400">
            New Stock
          </p>

          <p
            className={`mt-1 text-sm font-bold ${
              isInvalid
                ? "text-red-600"
                : "text-slate-700"
            }`}
          >
            {newStock}
          </p>
        </div>
      </div>

      {isInvalid && (
        <p className="mt-3 text-xs font-medium text-red-600">
          Requested quantity exceeds available stock.
        </p>
      )}
    </div>
  );
};

export default StockSummary;