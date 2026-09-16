import {
  Plus,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import StaffHeader from "../../../components/staff/StaffHeader";
import StaffSidebar from "../../../components/staff/StaffSidebar";

import ReturnFilters from "../../../components/staff/returns/ReturnFilters";
import ReturnsTable from "../../../components/staff/returns/ReturnsTable";

import {
  getStaffReturns,
} from "../../../services/staffReturnsApi";

const Returns = () => {
  const navigate = useNavigate();

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /* =====================================================
     RETURNS
  ===================================================== */

  const [returns, setReturns] =
    useState([]);

  const [filters, setFilters] =
    useState({
      search: "",
    });

  /* =====================================================
     UI STATE
  ===================================================== */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD RETURNS
  ===================================================== */

  const loadReturns = useCallback(
    async (refresh = false) => {
      try {
        setError("");

        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {};

        if (filters.search.trim()) {
          params.search =
            filters.search.trim();
        }

        const response =
          await getStaffReturns(params);

        setReturns(
          response?.sales ||
            response?.data ||
            []
        );
      } catch (err) {
        console.error(
          "Failed to load staff returns:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load returns."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  /* =====================================================
     INITIAL LOAD / FILTER CHANGE
  ===================================================== */

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  /* =====================================================
     FILTER HANDLERS
  ===================================================== */

  const handleFilterChange = (
    key,
    value
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
    });
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
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed(
            (prev) => !prev
          )
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* =================================================
          MAIN
      ================================================= */}

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >

        {/* HEADER */}

        <StaffHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Workspace
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Returns & Refunds
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Review processed returns and customer refunds.
                  </p>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-2">

                  {/* Refresh */}

                  <button
                    type="button"
                    onClick={() =>
                      loadReturns(true)
                    }
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

                  {/* Process Return */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/staff/returns/process"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />

                    Process Return
                  </button>

                </div>
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
                      Unable to load returns
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      loadReturns()
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>

                </div>
              </div>
            )}

            {/* =================================================
                FILTERS
            ================================================= */}

            <ReturnFilters
              filters={filters}
              onChange={
                handleFilterChange
              }
              onReset={handleReset}
            />

            {/* =================================================
                RETURNS TABLE
            ================================================= */}

            <div className="mt-6">

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                  <p className="text-sm font-medium text-slate-700">
                    Loading returns...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Fetching returned sales and refund information.
                  </p>

                </div>
              ) : (
                <ReturnsTable
                  returns={returns}
                />
              )}

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Returns;