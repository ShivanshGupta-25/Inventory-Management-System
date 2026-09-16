
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  PackageCheck,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import {
  getManagerPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
} from "../../../services/managerPurchaseRequestApi";

const statusStyles = {
  Draft: "border-slate-200 bg-slate-100 text-slate-600",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-500",
};

const priorityStyles = {
  Low: "text-slate-500",
  Medium: "text-blue-600",
  High: "text-orange-600",
  Urgent: "text-red-600",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ManagerPurchaseRequests = () => {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [requests, setRequests] = useState([]);
  const [statistics, setStatistics] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [managerNote, setManagerNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadRequests = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getManagerPurchaseRequests();

      setRequests(response?.data || []);
      setStatistics(response?.statistics || {});
    } catch (err) {
      console.error("Failed to load purchase requests:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load purchase requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !searchValue ||
        request.orderNumber?.toLowerCase().includes(searchValue) ||
        request.createdBy?.name?.toLowerCase().includes(searchValue) ||
        request.createdBy?.email?.toLowerCase().includes(searchValue) ||
        request.notes?.toLowerCase().includes(searchValue);

      const matchesStatus =
        !status || request.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, status]);

  const openReviewModal = (request, action) => {
    setSelectedRequest(request);
    setReviewModal(action);
    setManagerNote("");
    setActionError("");
  };

  const closeReviewModal = () => {
    if (actionLoading) return;

    setReviewModal(null);
    setManagerNote("");
    setActionError("");
  };

  const closeDetailsModal = () => {
    if (actionLoading) return;

    setSelectedRequest(null);
  };

  const handleDecision = async () => {
    if (!selectedRequest || !reviewModal) return;

    if (reviewModal === "reject" && !managerNote.trim()) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      if (reviewModal === "approve") {
        await approvePurchaseRequest(
          selectedRequest._id,
          managerNote.trim()
        );

        // Approval only changes the request status.
        // The same request is then opened for PO details.
        const approvedRequestId = selectedRequest._id;

        setReviewModal(null);
        setSelectedRequest(null);
        setManagerNote("");

        navigate(
          `/manager/purchase-requests/${approvedRequestId}/create-order`
        );

        return;
      }

      await rejectPurchaseRequest(
        selectedRequest._id,
        managerNote.trim()
      );

      setReviewModal(null);
      setSelectedRequest(null);
      setManagerNote("");

      await loadRequests();
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Failed to update purchase request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateOrderPage = (request) => {
    if (!request?._id) {
      setError("Invalid purchase request.");
      return;
    }

    if (request.status !== "Approved") {
      setError("Only approved requests can create purchase orders.");
      return;
    }

    navigate(
      `/manager/purchase-requests/${request._id}/create-order`
    );
  };

  const statCards = [
    {
      label: "Total Requests",
      value: statistics.total || 0,
      description: "All submitted requests",
      icon: FileText,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending Review",
      value: statistics.pending || 0,
      description: "Awaiting your decision",
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved",
      value: statistics.approved || 0,
      description: "Ready for purchase order",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Rejected",
      value: statistics.rejected || 0,
      description: "Requests declined",
      icon: XCircle,
      iconStyle: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() => setSidebarCollapsed((value) => !value)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <span>Management</span>
                  <ChevronRight size={15} />
                  <span className="font-medium text-slate-700">
                    Purchase Requests
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Purchase Requests
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Review staff requests, approve purchasing needs,
                  and create purchase orders from approved requests.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadRequests(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Statistics */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.label}
                        </p>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                          {stat.value}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {stat.description}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${stat.iconStyle}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Workspace */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Toolbar */}
              <div className="border-b border-slate-200 p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Request Management
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {filteredRequests.length} request(s) displayed
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-0 sm:w-80">
                      <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Search requests or staff..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>

                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value)
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    >
                      <option value="">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr>
                      {[
                        "Request",
                        "Requested By",
                        "Products",
                        "Priority",
                        "Status",
                        "Submitted",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-20 text-center">
                          <RefreshCw
                            size={25}
                            className="mx-auto animate-spin text-indigo-500"
                          />

                          <p className="mt-3 text-sm text-slate-500">
                            Loading purchase requests...
                          </p>
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-5 py-20 text-center">
                          <FileText
                            size={35}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No purchase requests found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or status filter.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr
                          key={request._id}
                          className="group transition hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-slate-900">
                              {request.orderNumber}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Purchase Request
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-800">
                              {request.createdBy?.name || "Unknown"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {request.createdBy?.email || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                                <PackageCheck size={15} />
                              </div>

                              <span className="text-sm font-medium text-slate-700">
                                {request.items?.length || 0} product(s)
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`text-sm font-bold ${
                                priorityStyles[request.priority] ||
                                priorityStyles.Medium
                              }`}
                            >
                              {request.priority || "Medium"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                                statusStyles[request.status] ||
                                statusStyles.Draft
                              }`}
                            >
                              {request.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatDate(request.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedRequest(request)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>

                              {request.status === "Pending" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openReviewModal(
                                        request,
                                        "approve"
                                      )
                                    }
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                                    title="Approve request"
                                  >
                                    <CheckCircle2 size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openReviewModal(
                                        request,
                                        "reject"
                                      )
                                    }
                                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                    title="Reject request"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}

                              {request.status === "Approved" &&
                                !request.purchaseOrder && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCreateOrderPage(request)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                                  >
                                    Create PO
                                    <ChevronRight size={14} />
                                  </button>
                                )}

                              {request.purchaseOrder && (
                                <span className="text-xs font-semibold text-emerald-600">
                                  PO Created
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && !reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                  Purchase Request
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedRequest.orderNumber}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Requested By
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {selectedRequest.createdBy?.name || "Unknown"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedRequest.createdBy?.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                      statusStyles[selectedRequest.status] ||
                      statusStyles.Draft
                    }`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Priority
                  </p>

                  <p
                    className={`mt-1 text-sm font-bold ${
                      priorityStyles[selectedRequest.priority] ||
                      priorityStyles.Medium
                    }`}
                  >
                    {selectedRequest.priority || "Medium"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Submitted On
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Requested Products
                </h3>

                <div className="space-y-2">
                  {selectedRequest.items?.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {item.productName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          SKU: {item.sku}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                        Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Staff Notes
                  </h3>

                  <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}

              {selectedRequest.managerNote && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Manager Note
                  </h3>

                  <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {selectedRequest.managerNote}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {selectedRequest.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        openReviewModal(
                          selectedRequest,
                          "reject"
                        )
                      }
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Reject Request
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openReviewModal(
                          selectedRequest,
                          "approve"
                        )
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      Approve Request
                    </button>
                  </>
                )}

                {selectedRequest.status === "Approved" &&
                  !selectedRequest.purchaseOrder && (
                    <button
                      type="button"
                      onClick={() =>
                        openCreateOrderPage(selectedRequest)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      Create Purchase Order
                      <ChevronRight size={16} />
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject Modal */}
      {reviewModal && selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {reviewModal === "approve"
                    ? "Approve Request"
                    : "Reject Request"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedRequest.orderNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={actionLoading}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div
                className={`rounded-xl p-4 text-sm ${
                  reviewModal === "approve"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {reviewModal === "approve"
                  ? "Approving this request will allow you to create a Purchase Order."
                  : "This request will be rejected and the reason will be visible to the requester."}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  {reviewModal === "approve"
                    ? "Manager Note (Optional)"
                    : "Rejection Reason *"}
                </label>

                <textarea
                  rows={4}
                  value={managerNote}
                  onChange={(event) =>
                    setManagerNote(event.target.value)
                  }
                  placeholder={
                    reviewModal === "approve"
                      ? "Add an optional approval note..."
                      : "Explain the reason for rejecting this request..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDecision}
                  disabled={actionLoading}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    reviewModal === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionLoading
                    ? "Processing..."
                    : reviewModal === "approve"
                    ? "Approve Request"
                    : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPurchaseRequests;