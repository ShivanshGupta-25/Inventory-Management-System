import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

const DeleteProductModal = ({
  product,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!product) return null;

  const productName =
    product.productName || "this product";

  const sku =
    product.sku || "N/A";

  const currentStock =
    Number(product.currentStock) || 0;

  const unit =
    product.unit || "units";

  const handleConfirm = () => {
    if (loading) return;

    if (typeof onConfirm !== "function") {
      console.error(
        "DeleteProductModal: onConfirm callback is missing."
      );
      return;
    }

    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-title"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <AlertTriangle size={22} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close delete product dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>

        </div>

        {/* Content */}
        <div className="p-6">

          <h2
            id="delete-product-title"
            className="text-lg font-semibold text-slate-900"
          >
            Delete Product?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You are about to permanently delete{" "}
            <span className="font-semibold text-slate-700">
              {productName}
            </span>{" "}
            from your inventory.
          </p>

          {/* Product Information */}
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">
                SKU
              </span>

              <span className="font-medium text-slate-700">
                {sku}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">
                Current Stock
              </span>

              <span className="font-medium text-slate-700">
                {currentStock} {unit}
              </span>
            </div>

          </div>

          {/* Warning */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-xs leading-5 text-red-600">
              This action cannot be undone. The inventory
              record will be permanently removed from the
              database.
            </p>

          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />

                  Delete Product
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;