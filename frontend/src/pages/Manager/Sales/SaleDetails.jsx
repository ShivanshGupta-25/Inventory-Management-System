// import { useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   User,
//   Phone,
//   Calendar,
// } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";

// import ManagerSidebar from "../../../components/layout/ManagerSidebar";
// import ManagerHeader from "../../../components/layout/ManagerHeader";

// import SaleStatus from "../../../components/sales/SaleStatus";
// import SaleActionMenu from "../../../components/sales/SaleActionMenu";

// import { getSaleById } from "../../../services/salesApi";

// const SaleDetails = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   /* Sidebar */

//   const [sidebarCollapsed, setSidebarCollapsed] =
//     useState(false);

//   const [mobileSidebarOpen, setMobileSidebarOpen] =
//     useState(false);

//   /* Sale */

//   const [sale, setSale] = useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   /* Sale Actions */

//   const [paymentModalOpen, setPaymentModalOpen] =
//     useState(false);

//   const [actionModal, setActionModal] =
//     useState(null);

//   /* Fetch sale */

//   useEffect(() => {
//     const fetchSale = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response =
//           await getSaleById(id);

//         setSale(response.data);
//       } catch (error) {
//         console.error(error);

//         setError(
//           error.response?.data?.message ||
//             error.message ||
//             "Failed to load sale"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSale();
//   }, [id]);

//   /* Edit */

//   const handleEdit = () => {
//     navigate(
//       `/manager/sales/${sale._id}/edit`
//     );
//   };

//   /* Payment */

//   const handlePayment = () => {
//     setPaymentModalOpen(true);
//   };

//   /* Cancel */

//   const handleCancel = () => {
//     setActionModal("cancel");
//   };

//   /* Return */

//   const handleReturn = () => {
//     setActionModal("return");
//   };

//   /* Loading */

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50">

//         <ManagerSidebar
//           collapsed={sidebarCollapsed}
//           mobileOpen={mobileSidebarOpen}
//           onCollapse={() =>
//             setSidebarCollapsed(
//               !sidebarCollapsed
//             )
//           }
//           onMobileClose={() =>
//             setMobileSidebarOpen(false)
//           }
//         />

//         {mobileSidebarOpen && (
//           <div
//             className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
//             onClick={() =>
//               setMobileSidebarOpen(false)
//             }
//           />
//         )}

//         <div
//           className={`transition-all duration-300 ${
//             sidebarCollapsed
//               ? "lg:pl-20"
//               : "lg:pl-64"
//           }`}
//         >
//           <ManagerHeader
//             onMenuClick={() =>
//               setMobileSidebarOpen(true)
//             }
//           />

//           <main className="p-4 sm:p-6">
//             <div className="mx-auto max-w-[1600px]">

//               <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

//                 <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

//                 <p className="mt-4 text-sm text-slate-500">
//                   Loading sale...
//                 </p>

//               </div>

//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   /* Error */

//   if (error || !sale) {
//     return (
//       <div className="min-h-screen bg-slate-50">

//         <ManagerSidebar
//           collapsed={sidebarCollapsed}
//           mobileOpen={mobileSidebarOpen}
//           onCollapse={() =>
//             setSidebarCollapsed(
//               !sidebarCollapsed
//             )
//           }
//           onMobileClose={() =>
//             setMobileSidebarOpen(false)
//           }
//         />

//         {mobileSidebarOpen && (
//           <div
//             className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
//             onClick={() =>
//               setMobileSidebarOpen(false)
//             }
//           />
//         )}

//         <div
//           className={`transition-all duration-300 ${
//             sidebarCollapsed
//               ? "lg:pl-20"
//               : "lg:pl-64"
//           }`}
//         >
//           <ManagerHeader
//             onMenuClick={() =>
//               setMobileSidebarOpen(true)
//             }
//           />

//           <main className="p-4 sm:p-6">
//             <div className="mx-auto max-w-[1600px]">

//               <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
//                 {error || "Sale not found"}
//               </div>

//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {/* Sidebar */}

//       <ManagerSidebar
//         collapsed={sidebarCollapsed}
//         mobileOpen={mobileSidebarOpen}
//         onCollapse={() =>
//           setSidebarCollapsed(
//             !sidebarCollapsed
//           )
//         }
//         onMobileClose={() =>
//           setMobileSidebarOpen(false)
//         }
//       />

//       {/* Mobile Overlay */}

//       {mobileSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
//           onClick={() =>
//             setMobileSidebarOpen(false)
//           }
//         />
//       )}

//       {/* Main */}

//       <div
//         className={`transition-all duration-300 ${
//           sidebarCollapsed
//             ? "lg:pl-20"
//             : "lg:pl-64"
//         }`}
//       >

//         {/* Header */}

//         <ManagerHeader
//           onMenuClick={() =>
//             setMobileSidebarOpen(true)
//           }
//         />

//         <main className="p-4 sm:p-6">
//           <div className="mx-auto max-w-[1600px]">

//             {/* Page Heading */}

//             <div className="mb-6">

//               <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

//                 <div>

//                   <p className="text-xs font-medium text-slate-400">
//                     Management / Sales
//                   </p>

//                   <div className="mt-1 flex items-center gap-3">

//                     <button
//                       type="button"
//                       onClick={() =>
//                         navigate(
//                           "/manager/sales"
//                         )
//                       }
//                       className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
//                     >
//                       <ArrowLeft size={18} />
//                     </button>

//                     <div>
//                       <h1 className="text-2xl font-bold tracking-tight text-slate-900">
//                         {sale.saleNumber}
//                       </h1>

//                       <p className="mt-1 text-sm text-slate-500">
//                         Sale details and transaction information.
//                       </p>
//                     </div>

//                   </div>

//                 </div>

//                 {/* Status + Action Menu */}

//                 <div className="flex flex-wrap items-center gap-2 lg:justify-end">

//                   <SaleStatus
//                     status={sale.status}
//                   />

//                   <SaleStatus
//                     status={
//                       sale.paymentStatus
//                     }
//                   />

//                   <SaleActionMenu
//                     sale={sale}

//                     onView={() => {}}

//                     onEdit={handleEdit}

//                     onPayment={
//                       handlePayment
//                     }

//                     onCancel={
//                       handleCancel
//                     }

//                     onReturn={
//                       handleReturn
//                     }
//                   />

//                 </div>

//               </div>

//             </div>

//             {/* Customer + Payment */}

//             <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

//               {/* Customer Information */}

//               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

//                 <div className="flex items-center gap-3">

//                   <div className="rounded-xl bg-slate-100 p-2.5">
//                     <User
//                       size={19}
//                       className="text-slate-600"
//                     />
//                   </div>

//                   <div>

//                     <p className="text-xs text-slate-400">
//                       Customer
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-900">
//                       {sale.customerName ||
//                         "Walk-in Customer"}
//                     </p>

//                   </div>

//                 </div>

//                 {sale.customerContact && (
//                   <div className="mt-5 flex items-center gap-3">

//                     <Phone
//                       size={17}
//                       className="text-slate-400"
//                     />

//                     <span className="text-sm text-slate-600">
//                       {sale.customerContact}
//                     </span>

//                   </div>
//                 )}

//                 <div className="mt-5 flex items-center gap-3">

//                   <Calendar
//                     size={17}
//                     className="text-slate-400"
//                   />

//                   <div>

//                     <p className="text-xs text-slate-400">
//                       Sale Date
//                     </p>

//                     <p className="mt-1 text-sm text-slate-600">
//                       {new Date(
//                         sale.createdAt
//                       ).toLocaleString(
//                         "en-IN"
//                       )}
//                     </p>

//                   </div>

//                 </div>

//               </div>

//               {/* Payment Summary */}

//               <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

//                 <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

//                   <div>
//                     <h2 className="text-base font-semibold text-slate-900">
//                       Payment Summary
//                     </h2>

//                     <p className="mt-1 text-xs text-slate-400">
//                       Breakdown of this transaction.
//                     </p>
//                   </div>

//                   <div className="text-left sm:text-right">

//                     <p className="text-xs text-slate-400">
//                       Total Amount
//                     </p>

//                     <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
//                       ₹
//                       {Number(
//                         sale.totalAmount || 0
//                       ).toLocaleString(
//                         "en-IN"
//                       )}
//                     </p>

//                   </div>

//                 </div>

//                 <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

//                   <div className="rounded-xl bg-slate-50 p-4">

//                     <p className="text-xs text-slate-400">
//                       Subtotal
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-900">
//                       ₹
//                       {Number(
//                         sale.subtotal || 0
//                       ).toLocaleString(
//                         "en-IN"
//                       )}
//                     </p>

//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">

//                     <p className="text-xs text-slate-400">
//                       Discount
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-900">
//                       - ₹
//                       {Number(
//                         sale.discount || 0
//                       ).toLocaleString(
//                         "en-IN"
//                       )}
//                     </p>

//                   </div>

//                   <div className="rounded-xl bg-slate-50 p-4">

//                     <p className="text-xs text-slate-400">
//                       Tax
//                     </p>

//                     <p className="mt-1 font-semibold text-slate-900">
//                       + ₹
//                       {Number(
//                         sale.tax || 0
//                       ).toLocaleString(
//                         "en-IN"
//                       )}
//                     </p>

//                   </div>

//                 </div>

//               </div>

//             </div>

//             {/* Sale Items */}

//             <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//               <div className="border-b border-slate-200 p-6">

//                 <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

//                   <div>

//                     <h2 className="text-base font-semibold text-slate-900">
//                       Sale Items
//                     </h2>

//                     <p className="mt-1 text-xs text-slate-400">
//                       Products included in this transaction.
//                     </p>

//                   </div>

//                   <p className="text-sm text-slate-500">
//                     {sale.items?.length || 0}{" "}
//                     product
//                     {sale.items?.length === 1
//                       ? ""
//                       : "s"}
//                   </p>

//                 </div>

//               </div>

//               <div className="overflow-x-auto">

//                 <table className="w-full text-left text-sm">

//                   <thead className="border-b border-slate-200 bg-slate-50">

//                     <tr>

//                       <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
//                         Product
//                       </th>

//                       <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
//                         SKU
//                       </th>

//                       <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
//                         Quantity
//                       </th>

//                       <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
//                         Price
//                       </th>

//                       <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
//                         Total
//                       </th>

//                     </tr>

//                   </thead>

//                   <tbody className="divide-y divide-slate-100">

//                     {sale.items?.map(
//                       (item) => (
//                         <tr
//                           key={item._id}
//                           className="transition hover:bg-slate-50"
//                         >

//                           <td className="px-6 py-4">
//                             <p className="font-semibold text-slate-900">
//                               {
//                                 item.productName
//                               }
//                             </p>
//                           </td>

//                           <td className="px-6 py-4 text-slate-500">
//                             {item.sku}
//                           </td>

//                           <td className="px-6 py-4 text-slate-700">
//                             {item.quantity}
//                           </td>

//                           <td className="px-6 py-4 text-slate-700">
//                             ₹
//                             {Number(
//                               item.sellingPrice ||
//                                 0
//                             ).toLocaleString(
//                               "en-IN"
//                             )}
//                           </td>

//                           <td className="px-6 py-4 text-right font-semibold text-slate-900">
//                             ₹
//                             {Number(
//                               item.totalPrice ||
//                                 0
//                             ).toLocaleString(
//                               "en-IN"
//                             )}
//                           </td>

//                         </tr>
//                       )
//                     )}

//                   </tbody>

//                 </table>

//               </div>

//             </div>

//             {/* Bottom Total */}

//             <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

//               <div>

//                 <p className="text-xs text-slate-400">
//                   Transaction Total
//                 </p>

//                 <p className="mt-1 text-sm text-slate-600">
//                   {sale.items?.reduce(
//                     (total, item) =>
//                       total +
//                       item.quantity,
//                     0
//                   ) || 0}{" "}
//                   total units sold
//                 </p>

//               </div>

//               <div className="sm:text-right">

//                 <p className="text-xs text-slate-400">
//                   Total Amount
//                 </p>

//                 <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
//                   ₹
//                   {Number(
//                     sale.totalAmount || 0
//                   ).toLocaleString(
//                     "en-IN"
//                   )}
//                 </p>

//               </div>

//             </div>

//           </div>
//         </main>

//       </div>

//     </div>
//   );
// };

// export default SaleDetails;





import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Package,
  Phone,
  User,
  X,
  CheckCircle2,
  Clock3,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import SaleActionMenu from "../../../components/sales/SaleActionMenu";

import {
  getSaleById,
  getSaleMovements,
  updateSalePayment,
  cancelSale,
  returnSale,
} from "../../../services/salesApi";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusClasses = {
  Completed:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled:
    "bg-red-50 text-red-700 border-red-200",
  Returned:
    "bg-amber-50 text-amber-700 border-amber-200",
};

const paymentClasses = {
  Pending:
    "bg-slate-100 text-slate-700 border-slate-200",
  Partial:
    "bg-amber-50 text-amber-700 border-amber-200",
  Paid:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Refunded:
    "bg-purple-50 text-purple-700 border-purple-200",
};

const SaleDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [sale, setSale] = useState(null);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [paymentModal, setPaymentModal] =
    useState(false);

  const [actionModal, setActionModal] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [reason, setReason] = useState("");

  const loadSale = async () => {
    try {
      setLoading(true);
      setError("");

      const [saleResponse, movementResponse] =
        await Promise.all([
          getSaleById(id),
          getSaleMovements(id),
        ]);

      setSale(
        saleResponse.data || saleResponse
      );

      setMovements(
        movementResponse.data ||
          movementResponse ||
          []
      );
    } catch (err) {
      setError(
        err.message || "Failed to load sale"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSale();
  }, [id]);

  const openPaymentModal = () => {
    setPaymentAmount("");
    setPaymentMethod(
      sale?.paymentMethod || "Cash"
    );
    setPaymentModal(true);
  };

  const handlePayment = async () => {
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    const outstanding =
      Number(sale.totalAmount || 0) -
      Number(sale.paidAmount || 0);

    if (amount > outstanding) {
      setError(
        "Payment cannot exceed the outstanding amount."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateSalePayment(id, {
        paidAmount:
          Number(sale.paidAmount || 0) +
          amount,
        paymentMethod,
      });

      setPaymentModal(false);

      await loadSale();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update payment"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusAction = async () => {
    if (!reason.trim()) {
      setError(
        `Please provide a ${
          actionModal === "cancel"
            ? "cancellation"
            : "return"
        } reason.`
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      if (actionModal === "cancel") {
        await cancelSale(
          id,
          reason.trim()
        );
      }

      if (actionModal === "return") {
        await returnSale(
          id,
          reason.trim()
        );
      }

      setActionModal(null);
      setReason("");

      await loadSale();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update sale status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCollapse={() =>
            setCollapsed((prev) => !prev)
          }
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <main
          className={`transition-all duration-300 ${
            collapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <ManagerHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <div className="flex min-h-[70vh] items-center justify-center text-sm text-slate-500">
            Loading sale details...
          </div>
        </main>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error || "Sale not found."}
        </div>
      </div>
    );
  }

  const outstanding = Math.max(
    0,
    Number(sale.totalAmount || 0) -
      Number(sale.paidAmount || 0)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() =>
          setCollapsed((prev) => !prev)
        }
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      <main
        className={`transition-all duration-300 ${
          collapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <div className="mx-auto max-w-[1600px] p-4 sm:p-6">

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() =>
                navigate("/manager/sales")
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Sales
            </button>

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm text-slate-500">
                  Management / Sales / Details
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {sale.saleNumber}
                  </h1>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusClasses[
                        sale.status
                      ] ||
                      statusClasses.Completed
                    }`}
                  >
                    {sale.status}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      paymentClasses[
                        sale.paymentStatus
                      ] ||
                      paymentClasses.Pending
                    }`}
                  >
                    {sale.paymentStatus}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Created {formatDate(sale.createdAt)}
                </p>
              </div>

              <SaleActionMenu
                sale={sale}
                onView={() => {}}
                onEdit={() =>
                  navigate(
                    `/manager/sales/${sale._id}/edit`
                  )
                }
                onPayment={openPaymentModal}
                onCancel={() =>
                  setActionModal("cancel")
                }
                onReturn={() =>
                  setActionModal("return")
                }
              />
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Customer + Payment */}
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Customer */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Customer Information
                </h2>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <User size={14} />
                    Customer
                  </div>

                  <p className="font-medium text-slate-800">
                    {sale.customerName ||
                      "Walk-in Customer"}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <Phone size={14} />
                    Contact
                  </div>

                  <p className="font-medium text-slate-800">
                    {sale.customerContact ||
                      "Not provided"}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <Calendar size={14} />
                    Sale Date
                  </div>

                  <p className="font-medium text-slate-800">
                    {formatDate(sale.createdAt)}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <FileText size={14} />
                    Last Updated
                  </div>

                  <p className="font-medium text-slate-800">
                    {formatDate(sale.updatedAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    Payment Information
                  </h2>

                  {sale.paymentStatus !==
                    "Paid" &&
                    sale.status ===
                      "Completed" && (
                      <button
                        onClick={
                          openPaymentModal
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        <CreditCard
                          size={15}
                        />
                        Add Payment
                      </button>
                    )}
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">
                    Payment Method
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {sale.paymentMethod ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Payment Status
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {sale.paymentStatus}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Amount Paid
                  </p>

                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {money(sale.paidAmount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Outstanding
                  </p>

                  <p className="mt-1 text-lg font-bold text-amber-600">
                    {money(outstanding)}
                  </p>
                </div>

                {Number(
                  sale.refundedAmount || 0
                ) > 0 && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-400">
                      Refunded
                    </p>

                    <p className="mt-1 font-semibold text-purple-600">
                      {money(
                        sale.refundedAmount
                      )}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Items */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <Package
                  size={18}
                  className="text-slate-500"
                />

                <h2 className="font-semibold text-slate-900">
                  Sale Items
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Product
                    </th>
                    <th className="px-5 py-3">
                      SKU
                    </th>
                    <th className="px-5 py-3 text-right">
                      Quantity
                    </th>
                    <th className="px-5 py-3 text-right">
                      Unit Price
                    </th>
                    <th className="px-5 py-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sale.items?.map((item) => (
                    <tr key={item._id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {item.productName}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.sku}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-700">
                        {item.quantity}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-700">
                        {money(
                          item.sellingPrice
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-slate-800">
                        {money(
                          item.totalPrice
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Financial Summary */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Financial Summary
              </h2>
            </div>

            <div className="ml-auto max-w-md space-y-3 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium">
                  {money(sale.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="font-medium">
                  - {money(sale.discount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Tax
                </span>

                <span className="font-medium">
                  {money(sale.tax)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    {money(sale.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Inventory movements */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Inventory Impact
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Stock changes generated by this sale
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Date
                    </th>
                    <th className="px-5 py-3">
                      Product
                    </th>
                    <th className="px-5 py-3">
                      Movement
                    </th>
                    <th className="px-5 py-3 text-right">
                      Quantity
                    </th>
                    <th className="px-5 py-3 text-right">
                      Previous
                    </th>
                    <th className="px-5 py-3 text-right">
                      New Stock
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {movements.length ? (
                    movements.map(
                      (movement) => (
                        <tr
                          key={movement._id}
                        >
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(
                              movement.createdAt
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">
                              {
                                movement
                                  .inventory
                                  ?.productName
                              }
                            </div>

                            <div className="text-xs text-slate-400">
                              {
                                movement
                                  .inventory?.sku
                              }
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                movement.type ===
                                "OUT"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {movement.type}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-medium">
                            {movement.quantity}
                          </td>

                          <td className="px-5 py-4 text-right text-sm text-slate-500">
                            {
                              movement.previousStock
                            }
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                            {movement.newStock}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-8 text-center text-sm text-slate-400"
                      >
                        No inventory movements
                        found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Activity */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Sale Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Complete status and transaction history
              </p>
            </div>

            <div className="p-5">
              {sale.activityLog?.length ? (
                <div className="relative space-y-6">
                  {sale.activityLog
                    .slice()
                    .reverse()
                    .map((activity) => (
                      <div
                        key={activity._id}
                        className="relative flex gap-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          {activity.action ===
                          "CREATED" ? (
                            <CheckCircle2
                              size={17}
                              className="text-emerald-600"
                            />
                          ) : activity.action ===
                            "PAYMENT_UPDATED" ? (
                            <CreditCard
                              size={17}
                              className="text-blue-600"
                            />
                          ) : activity.action ===
                            "RETURNED" ? (
                            <RotateCcw
                              size={17}
                              className="text-amber-600"
                            />
                          ) : activity.action ===
                            "CANCELLED" ? (
                            <X
                              size={17}
                              className="text-red-600"
                            />
                          ) : (
                            <Clock3
                              size={17}
                              className="text-slate-500"
                            />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {activity.message}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(
                              activity.createdAt
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No activity history available.
                </p>
              )}
            </div>
          </section>

          {/* Notes */}
          {sale.notes && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Notes
                </h2>
              </div>

              <div className="p-5 text-sm leading-6 text-slate-600">
                {sale.notes}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Update Payment
              </h2>

              <button
                onClick={() =>
                  setPaymentModal(false)
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Outstanding
                  </span>

                  <span className="font-bold text-amber-600">
                    {money(outstanding)}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Amount
                </label>

                <input
                  type="number"
                  min="1"
                  max={outstanding}
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="Cash">
                    Cash
                  </option>
                  <option value="Card">
                    Card
                  </option>
                  <option value="UPI">
                    UPI
                  </option>
                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setPaymentModal(false)
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePayment}
                  disabled={actionLoading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {actionLoading
                    ? "Saving..."
                    : "Record Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel / Return Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  {actionModal === "cancel"
                    ? "Cancel Sale"
                    : "Return Sale"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  This action will update inventory.
                </p>
              </div>

              <button
                onClick={() =>
                  setActionModal(null)
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div
                className={`rounded-xl p-4 text-sm ${
                  actionModal === "cancel"
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {actionModal === "cancel"
                  ? "The sold quantities will be returned to inventory."
                  : "The sold quantities will be restored to inventory and the recorded payment will be marked as refunded."}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason
                </label>

                <textarea
                  rows="4"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                  placeholder={
                    actionModal === "cancel"
                      ? "Why is this sale being cancelled?"
                      : "Why is this sale being returned?"
                  }
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setReason("");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Keep Sale
                </button>

                <button
                  onClick={handleStatusAction}
                  disabled={actionLoading}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    actionModal === "cancel"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  } disabled:opacity-50`}
                >
                  {actionLoading
                    ? "Processing..."
                    : actionModal === "cancel"
                    ? "Cancel Sale"
                    : "Return Sale"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleDetails;