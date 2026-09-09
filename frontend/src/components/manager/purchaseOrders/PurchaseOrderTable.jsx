import { useState } from "react";

import {
  MoreHorizontal,
  Package,
} from "lucide-react";

import PurchaseOrderStatus from "./PurchaseOrderStatus";
import PurchaseOrderActionMenu from "./PurchaseOrderActionMenu";


const PurchaseOrderTable = ({
  orders = [],
  onView,
  onEdit,
  onConfirm,
  onReceive,
  onCancel,
}) => {
  const [openMenuId, setOpenMenuId] =
    useState(null);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Package
            size={22}
            className="text-slate-500"
          />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          No purchase orders found
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Purchase Orders
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage incoming inventory purchases.
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            {orders.length}{" "}
            {orders.length === 1
              ? "order"
              : "orders"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Order
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Supplier
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Items
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Expected
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Amount
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="transition hover:bg-slate-50/60"
              >
                {/* Order */}
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {order.orderNumber}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </td>

                {/* Supplier */}
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {order.supplier?.name ||
                      "—"}
                  </p>

                  {order.supplier?.phone && (
                    <p className="mt-1 text-xs text-slate-400">
                      {order.supplier.phone}
                    </p>
                  )}
                </td>

                {/* Items */}
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {order.items?.length || 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {order.items
                      ?.reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item.quantity ||
                              0
                          ),
                        0
                      ) || 0}{" "}
                    units
                  </p>
                </td>

                {/* Expected */}
                <td className="px-5 py-4">
                  <p className="text-sm text-slate-600">
                    {order.expectedDate
                      ? new Date(
                          order.expectedDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "—"}
                  </p>
                </td>

                {/* Amount */}
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    ₹
                    {Number(
                      order.totalAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <PurchaseOrderStatus
                    status={order.status}
                  />
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  <PurchaseOrderActionMenu
                    order={order}
                    open={openMenuId === order._id}
                    onToggle={() =>
                        setOpenMenuId(
                        openMenuId === order._id
                            ? null
                            : order._id
                        )
                    }
                    onView={onView}
                    onEdit={onEdit}
                    onConfirm={onConfirm}
                    onReceive={onReceive}
                    onCancel={onCancel}
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderTable;