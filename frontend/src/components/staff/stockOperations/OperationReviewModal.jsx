import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
} from "lucide-react";

const OperationReviewModal = ({
  open,
  operationType,
  product,
  quantity,
  reason,
  notes,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open || !product) return null;

  const currentStock =
    Number(product.currentStock) || 0;

  const numericQuantity =
    Number(quantity) || 0;

  const newStock =
    operationType === "IN"
      ? currentStock + numericQuantity
      : currentStock - numericQuantity;

  const invalid =
    operationType === "OUT" &&
    numericQuantity > currentStock;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Review Operation
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Confirm the stock change before continuing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {invalid && (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertTriangle
                size={17}
                className="shrink-0 text-red-600"
              />

              <p className="text-xs text-red-700">
                The requested Stock Out quantity
                exceeds the available stock.
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Product
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {product.productName}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              SKU: {product.sku || "—"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400">
                Current
              </p>

              <p className="mt-1 text-sm font-bold text-slate-700">
                {currentStock}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400">
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

                <span className="text-sm font-bold text-slate-700">
                  {operationType === "IN"
                    ? "+"
                    : "-"}
                  {numericQuantity}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400">
                New Stock
              </p>

              <p
                className={`mt-1 text-sm font-bold ${
                  invalid
                    ? "text-red-600"
                    : "text-slate-700"
                }`}
              >
                {newStock}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Reason
            </p>

            <p className="mt-1 text-xs font-medium text-slate-600">
              {reason}
            </p>
          </div>

          {notes && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Notes
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || invalid}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Confirm Operation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperationReviewModal;