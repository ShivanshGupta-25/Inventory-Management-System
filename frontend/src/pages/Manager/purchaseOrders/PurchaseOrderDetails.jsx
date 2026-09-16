
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import {
  getPurchaseOrderById,
  receivePurchaseOrder,
} from "../../../services/purchaseOrderService";

import PurchaseOrderStatus from "../../../components/manager/purchaseOrders/PurchaseOrderStatus";

import ReceivePurchaseOrderModal from "../../../components/manager/purchaseOrders/ReceivePurchaseOrderModal";

const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);

  // Load purchase order
  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPurchaseOrderById(id);

      setOrder(response?.data || response);
    } catch (err) {
      console.error(
        "Failed to load purchase order:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load purchase order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate order quantities
  const totalItems = order?.items?.length || 0;

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

  const canReceive =
    order &&
    (order.status === "Pending" ||
      order.status === "Partially Received") &&
    totalRemainingUnits > 0;

  // Open receive modal
  const handleReceiveOrder = () => {
    setReceiveModalOpen(true);
  };

  // Submit received items
  const handleReceiveItems = async (data) => {
    if (!order) return;

    try {
      setReceiveLoading(true);

      await receivePurchaseOrder(order._id, data);

      setReceiveModalOpen(false);

      // Reload updated purchase order details
      await loadOrder();
    } catch (error) {
      console.error(
        "Failed to receive purchase order:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to receive purchase order."
      );
    } finally {
      setReceiveLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapse={() =>
            setSidebarCollapsed((previous) => !previous)
          }
          onMobileClose={() =>
            setMobileSidebarOpen(false)
          }
        />

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

          <main className="flex min-h-[70vh] items-center justify-center p-6">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2
                size={18}
                className="animate-spin"
              />

              Loading purchase order...
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapse={() =>
            setSidebarCollapsed((previous) => !previous)
          }
          onMobileClose={() =>
            setMobileSidebarOpen(false)
          }
        />

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

          <main className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />

                {error || "Purchase order not found."}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/manager/purchase-orders")
                }
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Back to Purchase Orders
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed((previous) => !previous)
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* Main Content */}
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
            {/* Back Button */}
            <button
              type="button"
              onClick={() =>
                navigate("/manager/purchase-orders")
              }
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              <ArrowLeft size={18} />

              Back to Purchase Orders
            </button>

            {/* Header */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                    Created on {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {order.status === "Draft" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/manager/purchase-orders/${order._id}/edit`
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit Order
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/manager/purchase-orders/${order._id}/confirm`
                          )
                        }
                        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Confirm Order
                      </button>
                    </>
                  )}

                  {/* Receive Items */}
                  {canReceive && (
                    <button
                      type="button"
                      onClick={handleReceiveOrder}
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Receive Items
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Total Items */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-2.5">
                  <Package
                    size={20}
                    className="text-slate-600"
                  />
                </div>

                <p className="text-sm text-slate-500">
                  Total Items
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalItems}
                </p>
              </div>

              {/* Ordered Units */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-2.5">
                  <Package
                    size={20}
                    className="text-blue-600"
                  />
                </div>

                <p className="text-sm text-slate-500">
                  Ordered Units
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalOrderedUnits}
                </p>
              </div>

              {/* Received Units */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-emerald-50 p-2.5">
                  <Package
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

                <p className="text-sm text-slate-500">
                  Received Units
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalReceivedUnits}
                </p>
              </div>

              {/* Remaining Units */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-amber-50 p-2.5">
                  <Package
                    size={20}
                    className="text-amber-600"
                  />
                </div>

                <p className="text-sm text-slate-500">
                  Remaining Units
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {totalRemainingUnits}
                </p>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <User
                  size={20}
                  className="text-slate-600"
                />

                <h2 className="font-semibold text-slate-900">
                  Supplier Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Supplier Name
                  </p>

                  <p className="mt-1 font-medium text-slate-800">
                    {order.supplier?.name || "—"}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <Mail size={14} />

                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {order.supplier?.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <Phone size={14} />

                    Phone
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {order.supplier?.phone || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-slate-900">
                Order Information
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Created Date
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                    <Calendar size={16} />

                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Expected Delivery
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                    <Calendar size={16} />

                    {formatDate(order.expectedDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Remaining Units
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {totalRemainingUnits}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Order Items
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Products included in this purchase order.
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
                      const ordered =
                        Number(item.quantity) || 0;

                      const received =
                        Number(item.receivedQuantity) || 0;

                      const remaining =
                        ordered - received;

                      const totalPrice =
                        Number(item.totalPrice) ||
                        ordered *
                          (Number(item.unitPrice) || 0);

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-800">
                              {item.productName || "—"}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {item.sku || "—"}
                          </td>

                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {ordered}
                          </td>

                          <td className="px-6 py-4 text-right text-sm text-emerald-600">
                            {received}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-medium text-amber-600">
                            {remaining}
                          </td>

                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(item.unitPrice)}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                            {formatCurrency(totalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="ml-auto max-w-sm space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Tax
                  </span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(order.tax)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <FileText
                    size={18}
                    className="text-slate-600"
                  />

                  <h2 className="font-semibold text-slate-900">
                    Notes
                  </h2>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Receive Purchase Order Modal */}
        {receiveModalOpen && (
          <ReceivePurchaseOrderModal
            order={order}
            onClose={() => setReceiveModalOpen(false)}
            onSubmit={handleReceiveItems}
            loading={receiveLoading}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderDetails;