import { AlertTriangle, Trash2, X } from "lucide-react";

const DeleteProductModal = ({
  product,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle
                size={22}
                className="text-red-500"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Delete Product?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You are about to permanently delete{" "}
            <span className="font-semibold text-slate-700">
              {product.productName}
            </span>{" "}
            from your inventory.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500">
                SKU
              </span>

              <span className="font-medium text-slate-700">
                {product.sku}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-4 text-sm">
              <span className="text-slate-500">
                Current Stock
              </span>

              <span className="font-medium text-slate-700">
                {product.currentStock}{" "}
                {product.unit}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs leading-5 text-red-600">
              This action cannot be undone. The inventory
              record will be removed from the database.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />

              {loading
                ? "Deleting..."
                : "Delete Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;