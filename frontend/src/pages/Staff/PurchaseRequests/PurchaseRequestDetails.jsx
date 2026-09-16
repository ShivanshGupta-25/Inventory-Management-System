import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  Pencil,
  RefreshCw,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import StaffSidebar from "../../../components/staff/StaffSidebar";
import StaffHeader from "../../../components/staff/StaffHeader";

import PurchaseRequestStatus from "../../../components/staff/purchaseRequests/PurchaseRequestStatus";

import {
  getStaffPurchaseRequestById,
  submitStaffPurchaseRequest,
  cancelStaffPurchaseRequest,
} from "../../../services/staffPurchaseRequestApi";

const PurchaseRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getStaffPurchaseRequestById(id);

      const data =
        response?.data ||
        response?.purchaseOrder ||
        response?.order;

      setRequest(data || null);
    } catch (err) {
      console.error(
        "Failed to load purchase request:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load purchase request."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const handleSubmit = async () => {
    if (!request) return;

    const confirmed = window.confirm(
      `Submit purchase request ${request.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await submitStaffPurchaseRequest(
        request._id
      );

      await loadRequest();
    } catch (err) {
      console.error(
        "Failed to submit purchase request:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to submit purchase request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!request) return;

    const confirmed = window.confirm(
      `Cancel purchase request ${request.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await cancelStaffPurchaseRequest(
        request._id
      );

      await loadRequest();
    } catch (err) {
      console.error(
        "Failed to cancel purchase request:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to cancel purchase request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const totalRequested = request?.items?.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar />

        <div className="lg:pl-64">
          <StaffHeader />

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <RefreshCw
                  size={26}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading purchase request...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar />

        <div className="lg:pl-64">
          <StaffHeader />

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
                <XCircle
                  size={30}
                  className="mx-auto text-red-500"
                />

                <h2 className="mt-3 text-lg font-semibold text-red-800">
                  Purchase request not found
                </h2>

                <p className="mt-1 text-sm text-red-600">
                  {error ||
                    "The requested purchase request could not be found."}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/staff/purchase-requests"
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <ArrowLeft size={17} />
                  Back to Requests
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isDraft =
    request.status === "Draft";

  const isPending =
    request.status === "Pending";

  const isApproved =
    request.status === "Approved";

  const isRejected =
    request.status === "Rejected";

  const isPartiallyReceived =
    request.status ===
    "Partially Received";

  const isReceived =
    request.status === "Received";

  const isCancelled =
    request.status === "Cancelled";

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar />

      <div className="lg:pl-64">
        <StaffHeader />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/staff/purchase-requests"
                  )
                }
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft size={17} />
                Back to Purchase Requests
              </button>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {request.orderNumber}
                    </h1>

                    <PurchaseRequestStatus
                      status={request.status}
                    />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Purchase request created on{" "}
                    {formatDate(request.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {isDraft && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/staff/purchase-requests/${request._id}/edit`
                          )
                        }
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Pencil size={17} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle size={17} />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send size={17} />

                        {actionLoading
                          ? "Submitting..."
                          : "Submit Request"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Status Banner */}
            {isPending && (
              <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <Clock3
                  size={21}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Waiting for manager review
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    Your purchase request has been
                    submitted and is waiting for
                    management action.
                  </p>
                </div>
              </div>
            )}

            {isApproved && (
              <div className="mb-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Request approved
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    This request has been approved by
                    management and can proceed to
                    purchasing.
                  </p>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <XCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Request rejected
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    This purchase request was rejected
                    during manager review.
                  </p>
                </div>
              </div>
            )}

            {isPartiallyReceived && (
              <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <Package
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Stock partially received
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    Some of the requested stock has
                    been received.
                  </p>
                </div>
              </div>
            )}

            {isReceived && (
              <div className="mb-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2
                  size={21}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Stock received
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    The requested stock has been received
                    and added to inventory.
                  </p>
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="mb-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-100 p-4">
                <XCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Request cancelled
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    This request is no longer active.
                  </p>
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Products */}
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Requested Products
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {request.items?.length || 0}{" "}
                      product(s),{" "}
                      {totalRequested || 0} total unit(s)
                    </p>
                  </div>

                  <Package
                    size={20}
                    className="text-slate-400"
                  />
                </div>

                <div className="divide-y divide-slate-100">
                  {request.items?.map(
                    (item, index) => {
                      const inventory =
                        item.inventory;

                      const requested =
                        Number(
                          item.quantity || 0
                        );

                      const received =
                        Number(
                          item.receivedQuantity ||
                            0
                        );

                      return (
                        <div
                          key={
                            item._id || index
                          }
                          className="p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <Package
                                  size={19}
                                  className="text-blue-600"
                                />
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {item.productName ||
                                    inventory?.productName ||
                                    "Product"}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  SKU:{" "}
                                  {item.sku ||
                                    inventory?.sku ||
                                    "—"}
                                </p>

                                {inventory?.category && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Category:{" "}
                                    {
                                      inventory.category
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-slate-500">
                                  Requested
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {requested}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  Received
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {received}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-slate-500">
                                  Current Stock
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                  {inventory?.currentStock ??
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {requested > 0 && (
                            <div className="mt-4">
                              <div className="mb-1 flex justify-between text-xs text-slate-500">
                                <span>
                                  Received progress
                                </span>

                                <span>
                                  {Math.min(
                                    100,
                                    Math.round(
                                      (received /
                                        requested) *
                                        100
                                    )
                                  )}
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (received /
                                        requested) *
                                        100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* Request Information */}
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Request Information
                  </h2>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex gap-3">
                    <FileText
                      size={18}
                      className="mt-0.5 text-slate-400"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Request Number
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {request.orderNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <User
                      size={18}
                      className="mt-0.5 text-slate-400"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Requested By
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {request.createdBy?.name ||
                          "You"}
                      </p>

                      {request.createdBy?.email && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            request.createdBy.email
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CalendarDays
                      size={18}
                      className="mt-0.5 text-slate-400"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Required By
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(
                          request.expectedDate
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock3
                      size={18}
                      className="mt-0.5 text-slate-400"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Created
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(
                          request.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Priority
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        request.priority ===
                        "Urgent"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : request.priority ===
                            "High"
                          ? "border-orange-200 bg-orange-50 text-orange-700"
                          : request.priority ===
                            "Low"
                          ? "border-slate-200 bg-slate-100 text-slate-600"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      }`}
                    >
                      {request.priority ||
                        "Medium"}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Notes */}
            {request.notes && (
              <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Request Notes
                  </h2>
                </div>

                <div className="p-5">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {request.notes}
                  </p>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PurchaseRequestDetails;