import {
  ArrowLeft,
  CalendarDays,
  Package,
  RotateCcw,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import StaffHeader from "../../../components/staff/StaffHeader";
import StaffSidebar from "../../../components/staff/StaffSidebar";
import ReturnStatus from "../../../components/staff/returns/ReturnStatus";

import {
  getStaffReturnById,
  getStaffReturnMovements,
} from "../../../services/staffReturnsApi";

const ReturnDetails = () => {
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

  const [error, setError] = useState("");

  useEffect(() => {
    const loadReturn = async () => {
      try {
        setLoading(true);

        const [
          saleResponse,
          movementResponse,
        ] = await Promise.all([
          getStaffReturnById(id),
          getStaffReturnMovements(id),
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
          "Failed to load return details:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load return details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReturn();
  }, [id]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main
          className={`min-h-screen ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <div className="flex min-h-[70vh] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading return...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main
          className={`min-h-screen ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">
                {error ||
                  "Return not found."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={setSidebarCollapsed}
        onMobileClose={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
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
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
          <button
            onClick={() =>
              navigate("/staff/returns")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </button>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Return — {sale.saleNumber}
                </h1>

                <ReturnStatus
                  status={sale.status}
                />
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Return and refund details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Customer */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-500" />

                  <h2 className="font-semibold text-slate-900">
                    Customer
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      Returned At
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      {sale.returnedAt
                        ? new Date(
                            sale.returnedAt
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-slate-500" />

                    <h2 className="font-semibold text-slate-900">
                      Returned Items
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
                          Quantity
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                          Amount
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
                            <td className="px-5 py-4 text-sm font-medium text-slate-800">
                              {
                                item.productName
                              }
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

              {/* Inventory */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <RotateCcw className="h-5 w-5 text-slate-500" />
                  Inventory Restored
                </h2>

                <div className="space-y-3">
                  {movements
                    .filter(
                      (movement) =>
                        movement.type ===
                        "RETURN"
                    )
                    .map(
                      (movement) => (
                        <div
                          key={movement._id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {movement.inventory
                                ?.productName ||
                                "Product"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Stock restored
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-emerald-600">
                            +{" "}
                            {
                              movement.quantity
                            }
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-5 font-semibold text-slate-900">
                  Refund Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Original Total
                    </span>

                    <span className="text-sm font-medium text-slate-800">
                      {formatCurrency(
                        sale.totalAmount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Paid Amount
                    </span>

                    <span className="text-sm font-medium text-slate-800">
                      {formatCurrency(
                        sale.paidAmount
                      )}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">
                        Refunded
                      </span>

                      <span className="text-xl font-bold text-amber-600">
                        {formatCurrency(
                          sale.refundedAmount
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Payment Status
                    </span>

                    <span className="text-sm font-medium text-slate-800">
                      {sale.paymentStatus ||
                        "-"}
                    </span>
                  </div>
                </div>
              </div>

              {sale.returnReason && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 font-semibold text-slate-900">
                    Return Reason
                  </h2>

                  <p className="text-sm leading-6 text-slate-600">
                    {sale.returnReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReturnDetails;