import { useState } from "react";
import { X, Package } from "lucide-react";

const StockAdjustmentModal = ({
  item,
  onClose,
  onSubmit,
  loading,
}) => {
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] =
    useState("");
  const [reason, setReason] = useState("");

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      type,
      quantity: Number(quantity),
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Adjust Stock
            </h2>

            <p className="text-sm text-gray-500">
              Update inventory quantity
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-2">
                <Package size={20} />
              </div>

              <div>
                <p className="font-medium text-gray-900">
                  {item.productName}
                </p>

                <p className="text-xs text-gray-500">
                  {item.sku}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">
                  Current Stock
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {item.currentStock}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Available
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {item.availableStock}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Adjustment Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
            >
              <option value="IN">
                Add Stock
              </option>

              <option value="OUT">
                Remove Stock
              </option>

              <option value="ADJUSTMENT">
                Set Exact Stock
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              placeholder="Enter quantity"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
            />

            {type === "ADJUSTMENT" && (
              <p className="mt-1 text-xs text-gray-500">
                This will set the stock to exactly
                this quantity.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Why is the stock being adjusted?"
              required
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating..."
                : "Update Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;