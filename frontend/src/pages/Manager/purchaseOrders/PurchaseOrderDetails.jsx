import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  FileText,
  IndianRupee,
  Loader2,
  AlertCircle,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import { getPurchaseOrderById } from "../../../services/purchaseOrderService";
import PurchaseOrderStatus from "../../../components/manager/purchaseOrders/PurchaseOrderStatus";

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPurchaseOrderById(id);

        setOrder(response.data || response);
      } catch (error) {
        console.error("Failed to load purchase order:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load purchase order."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalItems =
    order?.items?.length || 0;

  const totalOrderedUnits =
    order?.items?.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    ) || 0;

  const totalReceivedUnits =
    order?.items?.reduce(
      (sum, item) =>
        sum + Number(item.receivedQuantity || 0),
      0
    ) || 0;

  const totalRemainingUnits =
    totalOrderedUnits - totalReceivedUnits;

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed(!sidebarCollapsed)
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">

            {/* Back */}
            <button
              type="button"
              onClick={() =>
                navigate("/manager/purchase-orders")
              }
              className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={18} />
              Back to Purchase Orders
            </button>

            {/* Loading */}
            {loading && (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                  <Loader2
                    size={22}
                    className="animate-spin"
                  />
                  Loading purchase order...
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle size={22} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && !error && order && (
              <div className="space-y-6">

                {/* Header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">
                          {order.orderNumber}
                        </h1>

                        <PurchaseOrderStatus
                          status={order.status}
                        />
                      </div>

                      <p className="text-sm text-slate-500">
                        Created on{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* Actions - we'll make these functional next */}
                    <div className="flex flex-wrap gap-3">
                      {order.status === "Draft" && (
                        <>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit Order
                          </button>

                          <button
                            type="button"
                            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                          >
                            Confirm Order
                          </button>
                        </>
                      )}

                      {(order.status === "Pending" ||
                        order.status ===
                          "Partially Received") && (
                        <button
                          type="button"
                          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          Receive Items
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-slate-100 p-2.5">
                        <Package
                          size={20}
                          className="text-slate-600"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">
                      Total Items
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {totalItems}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-blue-50 p-2.5">
                        <Package
                          size={20}
                          className="text-blue-600"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">
                      Ordered Units
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {totalOrderedUnits}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-emerald-50 p-2.5">
                        <Package
                          size={20}
                          className="text-emerald-600"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">
                      Received Units
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {totalReceivedUnits}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-amber-50 p-2.5">
                        <IndianRupee
                          size={20}
                          className="text-amber-600"
                        />
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        order.totalAmount
                      )}
                    </p>
                  </div>
                </div>

                {/* Supplier + Order Information */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                  {/* Supplier */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2.5">
                        <User
                          size={20}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Supplier Information
                        </h2>

                        <p className="text-sm text-slate-500">
                          Supplier contact details
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Supplier Name
                        </p>

                        <p className="mt-1 font-medium text-slate-900">
                          {order.supplier?.name ||
                            "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail
                          size={17}
                          className="text-slate-400"
                        />

                        <span className="text-sm text-slate-600">
                          {order.supplier?.email ||
                            "No email provided"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone
                          size={17}
                          className="text-slate-400"
                        />

                        <span className="text-sm text-slate-600">
                          {order.supplier?.phone ||
                            "No phone provided"}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2.5">
                        <FileText
                          size={20}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Order Information
                        </h2>

                        <p className="text-sm text-slate-500">
                          Purchase order details
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Order Number
                        </p>

                        <p className="mt-1 font-medium text-slate-900">
                          {order.orderNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Status
                        </p>

                        <div className="mt-2">
                          <PurchaseOrderStatus
                            status={order.status}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Expected Delivery
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Calendar size={16} />
                          {formatDate(
                            order.expectedDate
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Remaining Units
                        </p>

                        <p className="mt-1 font-medium text-slate-900">
                          {totalRemainingUnits}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="font-semibold text-slate-900">
                      Order Items
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Products included in this purchase
                      order.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">

                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Product
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            SKU
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Ordered
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Received
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Remaining
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Unit Price
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {order.items?.map((item) => {
                          const remaining =
                            Number(item.quantity || 0) -
                            Number(
                              item.receivedQuantity || 0
                            );

                          return (
                            <tr
                              key={item._id}
                              className="hover:bg-slate-50/70"
                            >
                              <td className="px-6 py-4">
                                <p className="font-medium text-slate-900">
                                  {item.productName}
                                </p>
                              </td>

                              <td className="px-6 py-4 text-sm text-slate-500">
                                {item.sku}
                              </td>

                              <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                                {item.quantity}
                              </td>

                              <td className="px-6 py-4 text-right text-sm font-medium text-emerald-600">
                                {item.receivedQuantity ||
                                  0}
                              </td>

                              <td className="px-6 py-4 text-right text-sm font-medium text-amber-600">
                                {remaining}
                              </td>

                              <td className="px-6 py-4 text-right text-sm text-slate-600">
                                {formatCurrency(
                                  item.unitPrice
                                )}
                              </td>

                              <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                {formatCurrency(
                                  item.totalPrice
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end">
                  <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[420px]">

                    <h2 className="mb-5 font-semibold text-slate-900">
                      Payment Summary
                    </h2>

                    <div className="space-y-3">

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-medium text-slate-900">
                          {formatCurrency(
                            order.subtotal
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Tax
                        </span>

                        <span className="font-medium text-slate-900">
                          {formatCurrency(
                            order.tax
                          )}
                        </span>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-900">
                            Total
                          </span>

                          <span className="text-xl font-bold text-slate-900">
                            {formatCurrency(
                              order.totalAmount
                            )}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-2 font-semibold text-slate-900">
                      Notes
                    </h2>

                    <p className="text-sm leading-6 text-slate-600">
                      {order.notes}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;