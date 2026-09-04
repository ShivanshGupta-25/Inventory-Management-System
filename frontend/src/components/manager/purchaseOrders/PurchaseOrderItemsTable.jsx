import { Trash2 } from "lucide-react";

const PurchaseOrderItemsTable = ({
  items,
  updateItem,
  removeItem,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Product
            </th>

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quantity
            </th>

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Unit Cost
            </th>

            <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total
            </th>

            <th className="px-5 py-3" />
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const total =
              Number(item.quantity || 0) *
              Number(item.unitCost || 0);

            return (
              <tr
                key={item.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-5 py-4">
                  <input
                    type="text"
                    value={item.product}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "product",
                        e.target.value
                      )
                    }
                    placeholder="Product name / SKU"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </td>

                <td className="px-5 py-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unitCost",
                          e.target.value
                        )
                      }
                      className="w-32 rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                  ₹{total.toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderItemsTable;