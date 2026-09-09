import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import SaleStatus from "./SaleStatus";
import SaleActionMenu from "./SaleActionMenu";

const SalesTable = ({
  sales,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return null;
  }

  if (!sales.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-700">
          No sales found.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Record your first sale to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full text-left text-sm">

          <thead className="border-b border-slate-200 bg-slate-50">

            <tr>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Sale
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Items
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Payment
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                Actions
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {sales.map((sale) => (

              <tr
                key={sale._id}
                className="transition hover:bg-slate-50"
              >

                <td className="px-5 py-4">

                  <p className="font-semibold text-slate-900">
                    {sale.saleNumber}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(
                      sale.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>

                </td>

                <td className="px-5 py-4">

                  <p className="font-medium text-slate-800">
                    {sale.customerName ||
                      "Walk-in Customer"}
                  </p>

                  {sale.customerContact && (
                    <p className="mt-1 text-xs text-slate-400">
                      {sale.customerContact}
                    </p>
                  )}

                </td>

                <td className="px-5 py-4 text-slate-700">
                  {sale.items?.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  ) || 0}
                </td>

                <td className="px-5 py-4">

                  <p className="font-semibold text-slate-900">
                    ₹
                    {Number(
                      sale.totalAmount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </td>

                <td className="px-5 py-4">
                  <SaleStatus
                    status={
                      sale.paymentStatus
                    }
                  />
                </td>

                <td className="px-5 py-4">
                  <SaleStatus
                    status={sale.status}
                  />
                </td>

                <td className="px-6 py-4 text-right">
                    <SaleActionMenu
                        sale={sale}
                        onView={() =>
                        navigate(`/manager/sales/${sale._id}`)
                        }
                        onEdit={() =>
                        navigate(`/manager/sales/${sale._id}/edit`)
                        }
                        onPayment={() =>
                        navigate(`/manager/sales/${sale._id}`)
                        }
                        onCancel={() =>
                        navigate(`/manager/sales/${sale._id}`)
                        }
                        onReturn={() =>
                        navigate(`/manager/sales/${sale._id}`)
                        }
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

export default SalesTable;