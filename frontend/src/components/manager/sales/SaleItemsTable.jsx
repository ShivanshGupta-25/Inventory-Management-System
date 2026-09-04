import { Trash2 } from "lucide-react";

const SaleItemsTable = ({ items, onQuantityChange, onRemove }) => {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-600">
          No products added
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Add products to create this sale.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Product
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Available
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Quantity
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Unit Price
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Total
              </th>

              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.productId}>
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.sku}
                  </p>
                </td>

                <td className="px-4 py-4 text-sm text-slate-500">
                  {item.availableStock}
                </td>

                <td className="px-4 py-4">
                  <input
                    type="number"
                    min="1"
                    max={item.availableStock}
                    value={item.quantity}
                    onChange={(e) =>
                      onQuantityChange(
                        item.productId,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  ₹{item.price.toLocaleString("en-IN")}
                </td>

                <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                  ₹
                  {(item.price * item.quantity).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Remove product"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SaleItemsTable;