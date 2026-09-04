import { Receipt } from "lucide-react";

import SaleStatusBadge from "./SaleStatusBadge";
import SaleActionMenu from "./SaleActionMenu";

import { calculateSaleTotal } from "../../../data/salesData";

const SalesTable = ({ sales }) => {
  if (!sales.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <Receipt
          size={28}
          className="mx-auto text-slate-300"
        />

        <h3 className="mt-3 text-sm font-semibold text-slate-800">
          No sales found
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Sale ID
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Customer
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Items
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Amount
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Payment
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Date
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="transition hover:bg-slate-50/60"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {sale.saleId}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {sale.customer}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {sale.customerEmail}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {sale.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                  ₹
                  {calculateSaleTotal(sale).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      {sale.paymentMethod}
                    </p>

                    <p
                      className={`mt-0.5 text-xs font-medium ${
                        sale.paymentStatus === "Paid"
                          ? "text-emerald-600"
                          : sale.paymentStatus === "Refunded"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {sale.paymentStatus}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <SaleStatusBadge status={sale.status} />
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {sale.date}
                </td>

                <td className="px-5 py-4">
                  <SaleActionMenu sale={sale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <p className="text-xs text-slate-400">
          Showing {sales.length} sale
          {sales.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

export default SalesTable;