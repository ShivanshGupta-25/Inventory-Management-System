import { useCallback, useEffect, useState } from "react";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";

import DashboardStats from "../../components/manager/dashboard/DashboardStats";
import InventoryOverview from "../../components/manager/dashboard/InventoryOverview";
import PurchaseOrdersOverview from "../../components/manager/dashboard/PurchaseOrdersOverview";
import StockLevelChart from "../../components/manager/dashboard/StockLevelChart";
import SalesOverview from "../../components/manager/dashboard/SalesOverview";
import LowStockProducts from "../../components/manager/dashboard/LowStockProducts";
import RecentTransactions from "../../components/manager/dashboard/RecentTransactions";
import InventoryAlerts from "../../components/manager/dashboard/InventoryAlerts";
import QuickActions from "../../components/manager/dashboard/QuickActions";
import PendingPurchaseRequests from "../../components/manager/dashboard/PendingPurchaseRequests";

import { getDashboard } from "../../services/dashboardApi";

const ManagerDashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH DASHBOARD
  ===================================================== */

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboard();

      setDashboard(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =====================================================
     FORMAT LAST UPDATED
  ===================================================== */

  const formatLastUpdated = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
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

      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed((prev) => !prev)
        }
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <ManagerHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* =================================================
                PAGE HEADING
            ================================================= */}

            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Overview
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Dashboard
                  </h1>

                  <p className="mt-1 max-w-xl text-sm text-slate-500">
                    Here's what's happening with your inventory
                    today.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:min-w-[210px] sm:text-right">
                  <p className="text-xs font-medium text-slate-400">
                    Last updated
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatLastUpdated(
                      dashboard?.lastUpdated
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING STATE
            ================================================= */}

            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-semibold text-slate-700">
                  Loading dashboard...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest inventory, sales, and
                  purchase data.
                </p>
              </div>
            )}

            {/* =================================================
                ERROR STATE
            ================================================= */}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-red-800">
                      Unable to load dashboard
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchDashboard}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                DASHBOARD CONTENT
            ================================================= */}

            {!loading && !error && dashboard && (
              <div className="space-y-5">
                {/* =================================================
                    STATISTICS
                ================================================= */}

                <DashboardStats data={dashboard.stats} />

                {/* =================================================
                    ANALYTICS OVERVIEW
                ================================================= */}

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  {/* Stock Level Chart */}

                  <div className="min-w-0 lg:col-span-5">
                    <StockLevelChart
                      data={dashboard.inventory}
                    />
                  </div>

                  {/* Inventory Overview */}

                  <div className="min-w-0 lg:col-span-3">
                    <InventoryOverview
                      data={dashboard.inventory}
                    />
                  </div>

                  {/* Sales Overview */}

                  <div className="min-w-0 lg:col-span-4">
                    <SalesOverview
                      data={dashboard.sales}
                    />
                  </div>
                </section>

                {/* =================================================
                    INVENTORY AND PURCHASE OVERVIEW
                ================================================= */}

                <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3">
                  {/* Low Stock and Pending Requests */}

                  <div className="flex min-w-0 flex-col gap-5">
                    <div className="min-h-0">
                      <LowStockProducts
                        data={dashboard.lowStockProducts}
                      />
                    </div>

                    <div className="min-h-0">
                      <PendingPurchaseRequests />
                    </div>
                  </div>

                  {/* Purchase Orders */}

                  <div className="min-w-0">
                    <PurchaseOrdersOverview
                      data={dashboard.purchases}
                    />
                  </div>

                  {/* Inventory Alerts */}

                  <div className="min-w-0">
                    <InventoryAlerts
                      data={dashboard.alerts}
                    />
                  </div>
                </section>

                {/* =================================================
                    TRANSACTIONS AND QUICK ACTIONS
                ================================================= */}

                <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3">
                  {/* Recent Transactions */}

                  <div className="min-w-0 xl:col-span-2">
                    <RecentTransactions
                      data={dashboard.recentTransactions}
                    />
                  </div>

                  {/* Quick Actions */}

                  <div className="min-w-0">
                    <QuickActions />
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;