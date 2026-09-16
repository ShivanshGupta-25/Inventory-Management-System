import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import StaffHeader from "../../../components/staff/StaffHeader";
import StaffSidebar from "../../../components/staff/StaffSidebar";

import {
  getStaffSales,
  getStaffSaleById,
} from "../../../services/staffSalesApi";

import {
  processStaffReturn,
} from "../../../services/staffReturnsApi";

const ProcessReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const saleId = searchParams.get("saleId");

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [sales, setSales] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] =
    useState(null);

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------
        // DIRECT RETURN FLOW
        // /staff/returns/process?saleId=<id>
        // --------------------------------------------------
        if (saleId) {
          const response =
            await getStaffSaleById(saleId);

          const loadedSale =
            response?.sale ||
            response?.data ||
            response;

          if (!loadedSale?._id) {
            throw new Error(
              "Sale could not be found."
            );
          }

          // Return is only allowed for:
          // Completed + Paid
          if (
            loadedSale.status !== "Completed" ||
            loadedSale.paymentStatus !== "Paid"
          ) {
            setError(
              "This sale is not eligible for return. Only completed and fully paid sales can be returned."
            );

            setSelectedSale(null);
            return;
          }

          setSelectedSale(loadedSale);
          return;
        }

        // --------------------------------------------------
        // NORMAL RETURN FLOW
        // Load all Completed + Paid sales
        // --------------------------------------------------
        const response =
          await getStaffSales({
            status: "Completed",
            paymentStatus: "Paid",
          });

        const availableSales =
          response?.sales ||
          response?.data ||
          [];

        setSales(availableSales);
      } catch (err) {
        console.error(
          "Failed to load return data:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load return information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [saleId]);

  const filteredSales = sales.filter(
    (sale) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return true;

      return (
        sale.saleNumber
          ?.toLowerCase()
          .includes(query) ||
        sale.customerName
          ?.toLowerCase()
          .includes(query)
      );
    }
  );

  const handleProcessReturn = async () => {
    if (!selectedSale) {
      setError("Select a sale first.");
      return;
    }

    if (
      selectedSale.status !== "Completed" ||
      selectedSale.paymentStatus !== "Paid"
    ) {
      setError(
        "Only completed and fully paid sales can be returned."
      );
      return;
    }

    if (!reason.trim()) {
      setError("Enter a return reason.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await processStaffReturn(
        selectedSale._id,
        {
          reason: reason.trim(),
        }
      );

      navigate(
        `/staff/returns/${selectedSale._id}`
      );
    } catch (err) {
      console.error(
        "Failed to process return:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to process return."
      );
    } finally {
      setProcessing(false);
    }
  };

  const refundAmount = Number(
    selectedSale?.paidAmount || 0
  );

  const totalAmount = Number(
    selectedSale?.totalAmount || 0
  );

  const itemCount =
    selectedSale?.items?.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    ) || 0;

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

        <div className="mx-auto max-w-[1100px] p-4 sm:p-6">
          {/* Back */}
          <button
            type="button"
            onClick={() =>
              navigate("/staff/returns")
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Process Return
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Process a full return and refund for a completed paid sale.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          <div
            className={`grid grid-cols-1 gap-6 ${
              saleId
                ? "lg:grid-cols-1"
                : "lg:grid-cols-2"
            }`}
          >
            {/* =====================================================
                SALE SELECTOR
                Only shown when saleId is NOT provided
            ====================================================== */}
            {!saleId && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Select Sale
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Only completed and fully paid sales are eligible.
                  </p>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search sale or customer..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Sales */}
                <div className="mt-4 max-h-[450px] space-y-2 overflow-y-auto">
                  {loading ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      Loading sales...
                    </p>
                  ) : filteredSales.length ===
                    0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No eligible sales found.
                    </p>
                  ) : (
                    filteredSales.map(
                      (sale) => (
                        <button
                          key={sale._id}
                          type="button"
                          onClick={() => {
                            setSelectedSale(
                              sale
                            );
                            setError("");
                          }}
                          className={`w-full rounded-lg border p-4 text-left transition ${
                            selectedSale?._id ===
                            sale._id
                              ? "border-slate-400 bg-slate-50"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-slate-900">
                              {sale.saleNumber}
                            </span>

                            <span className="text-sm font-semibold text-slate-900">
                              ₹
                              {Number(
                                sale.totalAmount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-600">
                            {sale.customerName ||
                              "Walk-in Customer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {sale.createdAt
                              ? new Date(
                                  sale.createdAt
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"}
                          </p>
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
            )}

            {/* =====================================================
                RETURN INFORMATION
            ====================================================== */}
            <div
              className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
                saleId
                  ? "mx-auto w-full max-w-[850px]"
                  : ""
              }`}
            >
              <div>
                <h2 className="font-semibold text-slate-900">
                  Return Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review the sale and provide a reason before processing.
                </p>
              </div>

              {loading ? (
                <div className="mt-8 rounded-lg bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    Loading return information...
                  </p>
                </div>
              ) : !selectedSale ? (
                <div className="mt-8 rounded-lg bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-500">
                    Select a sale to continue.
                  </p>
                </div>
              ) : (
                <>
                  {/* Sale Summary */}
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">
                          Sale Number
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {selectedSale.saleNumber}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Customer
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {selectedSale.customerName ||
                            "Walk-in Customer"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Items
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {itemCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Payment
                        </p>

                        <p className="mt-1 text-sm font-medium text-emerald-700">
                          Paid
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  {selectedSale.items?.length >
                    0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Items Being Returned
                      </h3>

                      <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                        {selectedSale.items.map(
                          (item, index) => (
                            <div
                              key={
                                item._id ||
                                `${item.inventory}-${index}`
                              }
                              className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {item.productName}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {item.sku} · Qty{" "}
                                  {item.quantity}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-semibold text-slate-900">
                                ₹
                                {Number(
                                  item.totalPrice ||
                                    Number(
                                      item.quantity ||
                                        0
                                    ) *
                                      Number(
                                        item.sellingPrice ||
                                          0
                                      )
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Refund Summary */}
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-800">
                        Refund Summary
                      </h3>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                          Sale Total
                        </span>

                        <span className="text-sm font-medium text-slate-800">
                          ₹
                          {totalAmount.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">
                          Amount Paid
                        </span>

                        <span className="text-sm font-medium text-slate-800">
                          ₹
                          {refundAmount.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-sm font-semibold text-slate-700">
                          Refund Amount
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                          ₹
                          {refundAmount.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Return Reason */}
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Return Reason
                    </label>

                    <textarea
                      rows={5}
                      value={reason}
                      onChange={(e) => {
                        setReason(
                          e.target.value
                        );
                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder="Enter the reason for the return..."
                      className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  {/* Warning */}
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Please confirm this return
                        </p>

                        <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-800">
                          <li>
                            • The entire sale will be marked as Returned.
                          </li>

                          <li>
                            • All sale item quantities will be restored to inventory.
                          </li>

                          <li>
                            • A refund of ₹
                            {refundAmount.toLocaleString(
                              "en-IN"
                            )} will be recorded.
                          </li>

                          <li>
                            • Inventory return movements will be created.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/staff/returns"
                        )
                      }
                      disabled={processing}
                      className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleProcessReturn
                      }
                      disabled={processing}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />

                      {processing
                        ? "Processing Return..."
                        : "Process Return & Refund"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProcessReturn;