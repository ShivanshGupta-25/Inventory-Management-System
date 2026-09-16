import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Package,
  Pencil,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import StaffHeader from "../../../components/staff/StaffHeader";
import StaffSidebar from "../../../components/staff/StaffSidebar";
import SaleStatus from "../../../components/staff/sales/SalesStatus";

import {
  getStaffSaleById,
  getStaffSaleMovements,
  updateStaffSalePayment,
  cancelStaffSale,
} from "../../../services/staffSalesApi";

const StaffSaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [sale, setSale] = useState(null);
  const [movements, setMovements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Cash");

  const [reason, setReason] =
    useState("");

  /* =====================================================
     LOAD SALE
  ===================================================== */

  const loadSale = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        saleResponse,
        movementResponse,
      ] = await Promise.all([
        getStaffSaleById(id),
        getStaffSaleMovements(id),
      ]);

      setSale(
        saleResponse?.sale ||
          saleResponse?.data ||
          null
      );

      setMovements(
        movementResponse?.movements ||
          movementResponse?.data ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to load staff sale:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load sale details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSale();
  }, [id]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  /* =====================================================
     PAYMENT
  ===================================================== */

  const handlePayment = async () => {
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      setError(
        "Enter a valid payment amount."
      );
      return;
    }

    if (amount > outstanding) {
      setError(
        `Payment cannot exceed the outstanding amount of ${formatCurrency(
          outstanding
        )}.`
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateStaffSalePayment(
        id,
        {
          paidAmount: amount,
          paymentMethod,
        }
      );

      setShowPaymentModal(false);
      setPaymentAmount("");

      await loadSale();
    } catch (err) {
      console.error(
        "Payment update failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update payment."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     CANCEL
  ===================================================== */

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError(
        "Please provide a cancellation reason."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await cancelStaffSale(id, {
        reason: reason.trim(),
      });

      setShowCancelModal(false);
      setReason("");

      await loadSale();
    } catch (err) {
      console.error(
        "Sale cancellation failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to cancel sale."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <main
          className={`min-h-screen transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <div className="flex min-h-[70vh] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading sale details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     SALE NOT FOUND
  ===================================================== */

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <main
          className={`min-h-screen transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() =>
              setMobileOpen(true)
            }
          />

          <div className="p-6">
            <button
              onClick={() =>
                navigate("/staff/sales")
              }
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sales
            </button>

            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">
                {error ||
                  "Sale not found."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     SALE CALCULATIONS
  ===================================================== */

  const totalAmount =
    Number(sale.totalAmount || 0);

  const paidAmount =
    Number(sale.paidAmount || 0);

  const outstanding =
    Math.max(
      totalAmount - paidAmount,
      0
    );

  const paymentProgress =
    totalAmount > 0
      ? Math.min(
          (paidAmount / totalAmount) *
            100,
          100
        )
      : 0;

  /* =====================================================
     ACTION PERMISSIONS
  ===================================================== */

  // Sale can be edited only when it is completed
  // and no payment has been received.
  const canEdit =
    sale.status === "Completed" &&
    paidAmount === 0;

  // Payment can be received while there is
  // an outstanding amount.
  const canReceivePayment =
    sale.status === "Completed" &&
    sale.paymentStatus !== "Refunded" &&
    outstanding > 0;

  // Full cancellation is allowed only when
  // no payment has been received.
  const canCancel =
    sale.status === "Completed" &&
    paidAmount === 0;

  // Current backend supports full returns.
  // Therefore, only fully paid sales can be returned.
  const canReturn =
    sale.status === "Completed" &&
    sale.paymentStatus === "Paid";

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={setSidebarCollapsed}
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <StaffHeader
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-6">
            <button
              onClick={() =>
                navigate("/staff/sales")
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sales
            </button>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {sale.saleNumber}
                  </h1>

                  <SaleStatus
                    status={sale.status}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Sale details and transaction history
                </p>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-2">

                {/* EDIT */}

                {canEdit && (
                  <button
                    onClick={() =>
                      navigate(
                        `/staff/sales/${id}/edit`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Sale
                  </button>
                )}

                {/* RECEIVE PAYMENT */}

                {canReceivePayment && (
                  <button
                    onClick={() => {
                      setError("");

                      setPaymentAmount(
                        String(outstanding)
                      );

                      setPaymentMethod(
                        sale.paymentMethod ||
                          "Cash"
                      );

                      setShowPaymentModal(
                        true
                      );
                    }}
                    className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Receive Payment
                  </button>
                )}

                {/* RETURN */}

                {canReturn && (
                  <button
                    onClick={() =>
                      navigate(
                        `/staff/returns/process?saleId=${sale._id}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Return
                  </button>
                )}

                {/* CANCEL */}

                {canCancel && (
                  <button
                    onClick={() => {
                      setError("");
                      setReason("");
                      setShowCancelModal(
                        true
                      );
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =====================================================
              PAYMENT SUMMARY
          ===================================================== */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Sale Total
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCurrency(
                    totalAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Paid
                </p>

                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {formatCurrency(
                    paidAmount
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Outstanding
                </p>

                <p className="mt-1 text-xl font-bold text-amber-600">
                  {formatCurrency(
                    outstanding
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Payment Progress
                </span>

                <span className="text-xs font-semibold text-slate-700">
                  {Math.round(
                    paymentProgress
                  )}
                  %
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${paymentProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              MAIN GRID
          ===================================================== */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* ===================================================
                LEFT
            =================================================== */}

            <div className="space-y-6 xl:col-span-2">

              {/* CUSTOMER */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-500" />

                  <h2 className="font-semibold text-slate-900">
                    Customer
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-slate-500">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {sale.customerName ||
                        "Walk-in Customer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Contact
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {sale.customerContact ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Sale Date
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      {sale.createdAt
                        ? new Date(
                            sale.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Payment Method
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <CreditCard className="h-4 w-4 text-slate-400" />

                      {sale.paymentMethod ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SALE ITEMS */}

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-slate-500" />

                    <h2 className="font-semibold text-slate-900">
                      Sale Items
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          Product
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                          SKU
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                          Qty
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                          Price
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {sale.items?.map(
                        (item, index) => (
                          <tr
                            key={
                              item._id ||
                              index
                            }
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-slate-800">
                                {
                                  item.productName
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {item.sku ||
                                "-"}
                            </td>

                            <td className="px-5 py-4 text-right text-sm text-slate-700">
                              {
                                item.quantity
                              }
                            </td>

                            <td className="px-5 py-4 text-right text-sm text-slate-700">
                              {formatCurrency(
                                item.sellingPrice
                              )}
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                item.totalPrice
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INVENTORY IMPACT */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                  Inventory Impact
                </h2>

                {movements.length ===
                0 ? (
                  <p className="text-sm text-slate-500">
                    No inventory movements found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {movements.map(
                      (movement) => (
                        <div
                          key={
                            movement._id
                          }
                          className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {movement
                                .inventory
                                ?.productName ||
                                "Product"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                movement.reason
                              }
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {movement.type ===
                              "RETURN"
                                ? "+"
                                : "-"}
                              {
                                movement.quantity
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                movement.previousStock
                              }
                              {" → "}
                              {
                                movement.newStock
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ===================================================
                RIGHT
            =================================================== */}

            <div className="space-y-6">

              {/* FINANCIAL SUMMARY */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 font-semibold text-slate-900">
                  Financial Summary
                </h2>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatCurrency(
                        sale.subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-medium text-slate-800">
                      -
                      {formatCurrency(
                        sale.discount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Tax
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatCurrency(
                        sale.tax
                      )}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">
                        Total
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        {formatCurrency(
                          sale.totalAmount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    Payment
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {sale.paymentStatus ||
                      "-"}
                  </span>
                </div>

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Paid
                    </span>

                    <span className="font-medium text-emerald-600">
                      {formatCurrency(
                        paidAmount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Outstanding
                    </span>

                    <span className="font-medium text-amber-600">
                      {formatCurrency(
                        outstanding
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Payment Method
                    </span>

                    <span className="font-medium text-slate-800">
                      {sale.paymentMethod ||
                        "-"}
                    </span>
                  </div>
                </div>

                {canReceivePayment && (
                  <button
                    onClick={() => {
                      setError("");

                      setPaymentAmount(
                        String(outstanding)
                      );

                      setPaymentMethod(
                        sale.paymentMethod ||
                          "Cash"
                      );

                      setShowPaymentModal(
                        true
                      );
                    }}
                    className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Receive Payment
                  </button>
                )}
              </div>

              {/* NOTES */}

              {sale.notes && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 font-semibold text-slate-900">
                    Notes
                  </h2>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {sale.notes}
                  </p>
                </div>
              )}

              {/* ACTIVITY */}

              {sale.activityLog
                ?.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 font-semibold text-slate-900">
                    Activity
                  </h2>

                  <div className="space-y-4">
                    {sale.activityLog
                      .slice()
                      .reverse()
                      .map(
                        (
                          activity,
                          index
                        ) => (
                          <div
                            key={
                              activity._id ||
                              index
                            }
                            className="border-l-2 border-slate-200 pl-4"
                          >
                            <p className="text-sm font-medium text-slate-800">
                              {activity.action ===
                              "PAYMENT_UPDATED"
                                ? "Payment received"
                                : activity.action ===
                                  "CREATED"
                                ? "Sale created"
                                : activity.action ===
                                  "EDITED"
                                ? "Sale updated"
                                : activity.action ===
                                  "CANCELLED"
                                ? "Sale cancelled"
                                : activity.action ===
                                  "RETURNED"
                                ? "Sale returned"
                                : activity.action}
                            </p>

                            {activity.description && (
                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  activity.description
                                }
                              </p>
                            )}

                            {activity.createdAt && (
                              <p className="mt-1 text-xs text-slate-400">
                                {new Date(
                                  activity.createdAt
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            )}
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="text-lg font-semibold text-slate-900">
              Receive Payment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record a payment against this sale.
            </p>

            {/* PAYMENT SUMMARY */}

            <div className="mt-4 rounded-lg bg-slate-50 p-4">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Sale Total
                </span>

                <span className="font-medium text-slate-800">
                  {formatCurrency(
                    totalAmount
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500">
                  Already Paid
                </span>

                <span className="font-medium text-emerald-600">
                  {formatCurrency(
                    paidAmount
                  )}
                </span>
              </div>

              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-medium text-slate-700">
                  Outstanding
                </span>

                <span className="font-semibold text-amber-600">
                  {formatCurrency(
                    outstanding
                  )}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-4">

              {/* AMOUNT */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  max={outstanding}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    if (value === "") {
                      setPaymentAmount("");
                      setError("");
                      return;
                    }

                    const amount =
                      Number(value);

                    if (amount >= 0) {
                      setPaymentAmount(
                        value
                      );
                      setError("");
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Maximum:{" "}
                  {formatCurrency(
                    outstanding
                  )}
                </p>
              </div>

              {/* PAYMENT METHOD */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option>
                    Cash
                  </option>

                  <option>
                    Card
                  </option>

                  <option>
                    UPI
                  </option>

                  <option>
                    Bank Transfer
                  </option>

                  <option>
                    Other
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() => {
                  setShowPaymentModal(
                    false
                  );
                  setError("");
                }}
                disabled={
                  actionLoading
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handlePayment}
                disabled={
                  actionLoading ||
                  !paymentAmount
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading
                  ? "Processing..."
                  : paymentAmount
                  ? `Receive ${formatCurrency(
                      paymentAmount
                    )}`
                  : "Receive Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">

            <h2 className="text-lg font-semibold text-slate-900">
              Cancel Sale
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              This will restore the sold inventory.
            </p>

            <textarea
              value={reason}
              onChange={(e) => {
                setReason(
                  e.target.value
                );
                setError("");
              }}
              rows={4}
              placeholder="Enter cancellation reason..."
              className="mt-5 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() => {
                  setShowCancelModal(
                    false
                  );
                  setReason("");
                  setError("");
                }}
                disabled={
                  actionLoading
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCancel}
                disabled={
                  actionLoading ||
                  !reason.trim()
                }
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading
                  ? "Cancelling..."
                  : "Cancel Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSaleDetails;