import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import StaffSidebar from "../../../components/staff/StaffSidebar";
import StaffHeader from "../../../components/staff/StaffHeader";

import PurchaseRequestStats from "../../../components/staff/purchaseRequests/PurchaseRequestStats";
import PurchaseRequestFilters from "../../../components/staff/purchaseRequests/PurchaseRequestFilters";
import PurchaseRequestTable from "../../../components/staff/purchaseRequests/PurchaseRequestTable";

import {
  getStaffPurchaseRequests,
  submitStaffPurchaseRequest,
  cancelStaffPurchaseRequest,
} from "../../../services/staffPurchaseRequestApi";

const PurchaseRequests = () => {
  const navigate = useNavigate();

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =====================================================
     PURCHASE REQUESTS
  ===================================================== */

  const [requests, setRequests] = useState([]);

  /* =====================================================
     FILTERS
  ===================================================== */

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  /* =====================================================
     UI STATE
  ===================================================== */

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD PURCHASE REQUESTS
  ===================================================== */

  const loadRequests = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (status) {
          params.status = status;
        }

        const response = await getStaffPurchaseRequests(params);

        const data =
          response?.data ||
          response?.purchaseOrders ||
          response?.orders ||
          [];

        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Failed to load purchase requests:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load purchase requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status]
  );

  /* =====================================================
     INITIAL LOAD / FILTER CHANGE
  ===================================================== */

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
  };

  /* =====================================================
     SUBMIT REQUEST
  ===================================================== */

  const handleSubmit = async (request) => {
    const confirmed = window.confirm(
      `Submit purchase request ${request.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await submitStaffPurchaseRequest(request._id);

      await loadRequests();
    } catch (err) {
      console.error(
        "Failed to submit purchase request:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit purchase request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     CANCEL REQUEST
  ===================================================== */

  const handleCancel = async (request) => {
    const confirmed = window.confirm(
      `Cancel purchase request ${request.orderNumber}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await cancelStaffPurchaseRequest(request._id);

      await loadRequests();
    } catch (err) {
      console.error(
        "Failed to cancel purchase request:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel purchase request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <StaffSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={() =>
          setSidebarCollapsed((prev) => !prev)
        }
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <StaffHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-medium text-slate-400">
                Workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Purchase Requests
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and track purchase requests for required inventory.
              </p>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap items-center gap-2">

              {/* REFRESH */}

              <button
                type="button"
                onClick={() => loadRequests(true)}
                disabled={refreshing || actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

              {/* NEW REQUEST */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/staff/purchase-requests/create"
                  )
                }
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />

                New Request
              </button>
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Unable to load purchase requests
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadRequests()}
                  disabled={actionLoading}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Try Again
                </button>

              </div>
            </div>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          {!loading && (
            <PurchaseRequestStats
              requests={requests}
            />
          )}

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="mt-6">
            <PurchaseRequestFilters
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onClear={handleClearFilters}
            />
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="mt-6">

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-medium text-slate-700">
                  Loading purchase requests...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest purchase request information.
                </p>

              </div>
            ) : (
              <PurchaseRequestTable
                requests={requests}
                onView={(id) =>
                  navigate(
                    `/staff/purchase-requests/${id}`
                  )
                }
                onEdit={(id) =>
                  navigate(
                    `/staff/purchase-requests/${id}/edit`
                  )
                }
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                actionLoading={actionLoading}
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseRequests;