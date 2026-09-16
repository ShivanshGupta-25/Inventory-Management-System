import {
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import StaffHeader from "../../../components/staff/StaffHeader";
import StaffSidebar from "../../../components/staff/StaffSidebar";

import SalesStats from "../../../components/staff/sales/SalesStats";
import SalesFilters from "../../../components/staff/sales/SalesFilters";
import SalesTable from "../../../components/staff/sales/SalesTable";

import {
  getStaffSales,
  getStaffSalesStats,
} from "../../../services/staffSalesApi";

const StaffSales = () => {
  const navigate = useNavigate();

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  /* =====================================================
     SALES
  ===================================================== */

  const [sales, setSales] =
    useState([]);

  const [stats, setStats] =
    useState({
      salesValue: 0,
      orders: 0,
      itemsSold: 0,
      outstanding: 0,
    });

  /* =====================================================
     FILTERS
  ===================================================== */

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      paymentStatus: "",
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
     LOAD SALES
  ===================================================== */

  const loadSales = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {};

        if (filters.search.trim()) {
          params.search =
            filters.search.trim();
        }

        if (filters.status) {
          params.status =
            filters.status;
        }

        if (
          filters.paymentStatus
        ) {
          params.paymentStatus =
            filters.paymentStatus;
        }

        const [
          salesResponse,
          statsResponse,
        ] = await Promise.all([
          getStaffSales(params),
          getStaffSalesStats(),
        ]);

        /* ---------------------------------------------
           SALES
        --------------------------------------------- */

        setSales(
          salesResponse?.sales ||
            salesResponse?.data ||
            []
        );

        /* ---------------------------------------------
           STATS
        --------------------------------------------- */

        setStats(
          statsResponse?.stats ||
            statsResponse?.data ||
            {
              salesValue: 0,
              orders: 0,
              itemsSold: 0,
              outstanding: 0,
            }
        );
      } catch (err) {
        console.error(
          "Failed to load staff sales:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load sales."
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
    loadSales();
  }, [loadSales]);

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
      status: "",
      paymentStatus: "",
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
        collapsed={
          sidebarCollapsed
        }
        mobileOpen={
          mobileOpen
        }
        onCollapse={() =>
          setSidebarCollapsed(
            (prev) => !prev
          )
        }
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
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

        {/* HEADER */}

        <StaffHeader
          onMenuClick={() =>
            setMobileOpen(true)
          }
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
                Sales
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage daily sales and customer transactions.
              </p>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap items-center gap-2">

              {/* REFRESH */}

              <button
                type="button"
                onClick={() =>
                  loadSales(true)
                }
                disabled={
                  refreshing
                }
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

              {/* NEW SALE */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/staff/sales/create"
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />

                New Sale
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
                    Unable to load sales
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadSales()
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
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
            <SalesStats
              stats={stats}
            />
          )}

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="mt-6">
            <SalesFilters
              filters={filters}
              onChange={
                handleFilterChange
              }
              onReset={
                handleReset
              }
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
                  Loading sales...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest sales and transaction information.
                </p>

              </div>
            ) : (
              <SalesTable
                sales={sales}
                loading={loading}
              />
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default StaffSales;