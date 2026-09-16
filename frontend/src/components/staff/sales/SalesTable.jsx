// import { Eye } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// import SaleStatus from "./SalesStatus";

// const SalesTable = ({ sales = [] }) => {
//   const navigate = useNavigate();

//   if (!sales.length) {
//     return (
//       <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
//         <p className="text-sm font-medium text-slate-700">
//           No sales found
//         </p>

//         <p className="mt-1 text-sm text-slate-500">
//           Sales will appear here once a sale is recorded.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//       <div className="overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="border-b border-slate-200 bg-slate-50">
//             <tr>
//               <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Sale
//               </th>

//               <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Customer
//               </th>

//               <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Items
//               </th>

//               <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Amount
//               </th>

//               <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Payment
//               </th>

//               <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Status
//               </th>

//               <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
//                 Action
//               </th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-slate-100">
//             {sales.map((sale) => {
//               const itemCount =
//                 sale.items?.reduce(
//                   (total, item) =>
//                     total + Number(item.quantity || 0),
//                   0
//                 ) || 0;

//               return (
//                 <tr
//                   key={sale._id}
//                   className="transition hover:bg-slate-50"
//                 >
//                   <td className="whitespace-nowrap px-5 py-4">
//                     <p className="text-sm font-semibold text-slate-900">
//                       {sale.saleNumber}
//                     </p>

//                     <p className="mt-1 text-xs text-slate-500">
//                       {sale.createdAt
//                         ? new Date(
//                             sale.createdAt
//                           ).toLocaleDateString("en-IN")
//                         : "-"}
//                     </p>
//                   </td>

//                   <td className="px-5 py-4">
//                     <p className="text-sm font-medium text-slate-800">
//                       {sale.customerName ||
//                         "Walk-in Customer"}
//                     </p>

//                     {sale.customerContact && (
//                       <p className="mt-1 text-xs text-slate-500">
//                         {sale.customerContact}
//                       </p>
//                     )}
//                   </td>

//                   <td className="px-5 py-4 text-sm text-slate-600">
//                     {itemCount}
//                   </td>

//                   <td className="whitespace-nowrap px-5 py-4">
//                     <p className="text-sm font-semibold text-slate-900">
//                       ₹
//                       {Number(
//                         sale.totalAmount || 0
//                       ).toLocaleString("en-IN")}
//                     </p>
//                   </td>

//                   <td className="px-5 py-4">
//                     <p className="text-sm text-slate-700">
//                       {sale.paymentMethod || "-"}
//                     </p>

//                     <p className="mt-1 text-xs text-slate-500">
//                       {sale.paymentStatus || "-"}
//                     </p>
//                   </td>

//                   <td className="px-5 py-4">
//                     <SaleStatus status={sale.status} />
//                   </td>

//                   <td className="px-5 py-4 text-right">
//                     <button
//                       type="button"
//                       onClick={() =>
//                         navigate(
//                           `/staff/sales/${sale._id}`
//                         )
//                       }
//                       className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
//                     >
//                       <Eye className="h-3.5 w-3.5" />
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default SalesTable;







import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Eye,
} from "lucide-react";
import SaleStatus from "./SalesStatus";
import SaleActionMenu from "./SaleActionMenu";

const SalesTable = ({
  sales = [],
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
            {sales.map((sale) => {
              const itemCount =
                sale.items?.reduce(
                  (total, item) =>
                    total + Number(item.quantity || 0),
                  0
                ) || 0;

              return (
                <tr
                  key={sale._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {sale.saleNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {sale.createdAt
                        ? new Date(
                            sale.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}
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
                    {itemCount}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      ₹
                      {Number(
                        sale.totalAmount || 0
                      ).toLocaleString("en-IN")}
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
                        navigate(
                          `/staff/sales/${sale._id}`
                        )
                      }
                      onEdit={() =>
                        navigate(
                          `/staff/sales/${sale._id}/edit`
                        )
                      }
                      onPayment={() =>
                        navigate(
                          `/staff/sales/${sale._id}`
                        )
                      }
                      onCancel={() =>
                        navigate(
                          `/staff/sales/${sale._id}`
                        )
                      }
                      onReturn={() =>
                        navigate(
                          `/staff/sales/${sale._id}`
                        )
                      }
                    />
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

export default SalesTable;



