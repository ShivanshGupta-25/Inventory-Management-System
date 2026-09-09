import { useEffect, useState } from "react";
import {
  PackageCheck,
  X,
  RefreshCw,
} from "lucide-react";

const ReceivePurchaseOrderModal = ({
  order,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [quantities, setQuantities] =
    useState({});

  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;

    const initial = {};

    order.items.forEach((item) => {
      initial[item._id] = 0;
    });

    setQuantities(initial);
  }, [order]);

  if (!order) return null;

  const updateQuantity = (
    itemId,
    value
  ) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const receivedItems = [];

    for (const item of order.items) {
      const quantity = Number(
        quantities[item._id] || 0
      );

      const remaining =
        item.quantity -
        item.receivedQuantity;

      if (quantity < 0) {
        setError(
          "Received quantity cannot be negative."
        );
        return;
      }

      if (quantity > remaining) {
        setError(
          `You cannot receive more than ${remaining} units of ${item.productName}.`
        );
        return;
      }

      if (quantity > 0) {
        receivedItems.push({
          itemId: item._id,
          quantity,
        });
      }
    }

    if (receivedItems.length === 0) {
      setError(
        "Enter a received quantity for at least one item."
      );
      return;
    }

    await onSubmit({
      items: receivedItems,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <PackageCheck
                size={20}
                className="text-slate-700"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Receive Purchase Order
              </h2>

              <p className="text-xs text-slate-500">
                {order.orderNumber} ·{" "}
                {order.supplier?.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs leading-5 text-slate-500">
                Enter the quantity actually received for
                each product. Inventory stock will increase
                only by these quantities.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Ordered
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Received
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Remaining
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Receive
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {order.items.map(
                      (item) => {
                        const remaining =
                          item.quantity -
                          item.receivedQuantity;

                        return (
                          <tr
                            key={item._id}
                          >
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium text-slate-700">
                                {
                                  item.productName
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {item.sku}
                              </p>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {
                                item.receivedQuantity
                              }
                            </td>

                            <td className="px-4 py-4">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {remaining}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                value={
                                  quantities[
                                    item._id
                                  ] || ""
                                }
                                disabled={
                                  remaining ===
                                  0
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateQuantity(
                                    item._id,
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="0"
                                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Receiving...
                </>
              ) : (
                <>
                  <PackageCheck size={16} />
                  Receive Items
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivePurchaseOrderModal;