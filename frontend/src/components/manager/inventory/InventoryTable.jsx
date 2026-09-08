import { useState } from "react";

import StockStatus from "./StockStatus";
import ActionMenu from "./ActionMenu";

const InventoryTable = ({
  inventory,
  onView,
  onAdjust,
  onEdit,
  onHistory,
  onDelete,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (!inventory.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm font-medium text-gray-700">
          No inventory found
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Product
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                SKU
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Current
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Reserved
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Available
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {inventory.map((item) => (
              <tr
                key={item._id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.brand || "No brand"}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm font-medium text-gray-700">
                  {item.sku}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {item.category}
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                  {item.currentStock}
                </td>

                <td className="px-5 py-4 text-right text-sm text-gray-600">
                  {item.reservedStock}
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                  {item.availableStock}
                </td>

                <td className="px-5 py-4">
                  <StockStatus
                    status={item.stockStatus}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <ActionMenu
                      product={item}
                      open={openMenuId === item._id}
                      onToggle={() =>
                        setOpenMenuId(
                          openMenuId === item._id
                            ? null
                            : item._id
                        )
                      }
                      onView={onView}
                      onAdjust={onAdjust}
                      onEdit={onEdit}
                      onHistory={onHistory}
                      onDelete={onDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-3">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {inventory.length}
          </span>{" "}
          inventory items
        </p>
      </div>
    </div>
  );
};

export default InventoryTable;