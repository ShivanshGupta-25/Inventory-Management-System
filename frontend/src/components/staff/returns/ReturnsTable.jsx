import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ReturnStatus from "./ReturnStatus";

const ReturnsTable = ({ returns = [] }) => {
  const navigate = useNavigate();

  if (!returns.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">
          No returns found
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Processed returns will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sale
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Items
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Refund
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {returns.map((sale) => {
              const itemCount =
                sale.items?.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                ) || 0;

              return (
                <tr
                  key={sale._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {sale.saleNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {sale.returnedAt
                        ? new Date(
                            sale.returnedAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : sale.createdAt
                        ? new Date(
                            sale.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {sale.customerName ||
                        "Walk-in Customer"}
                    </p>

                    {sale.customerContact && (
                      <p className="mt-1 text-xs text-slate-500">
                        {sale.customerContact}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {itemCount}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      ₹
                      {Number(
                        sale.refundedAmount || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {sale.paymentMethod || "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {sale.paymentStatus || "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <ReturnStatus
                      status={sale.status}
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/staff/returns/${sale._id}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnsTable;