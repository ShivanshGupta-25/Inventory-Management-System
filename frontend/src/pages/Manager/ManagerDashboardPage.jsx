import { useEffect, useState } from "react";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";

import DashboardStats from "../../components/manager/dashboard/DashboardStats";
import InventoryOverview from "../../components/manager/dashboard/InventoryOverview";
import StockLevelChart from "../../components/manager/dashboard/StockLevelChart";
import SalesOverview from "../../components/manager/dashboard/SalesOverview";
import LowStockProducts from "../../components/manager/dashboard/LowStockProducts";
import RecentTransactions from "../../components/manager/dashboard/RecentTransactions";
import InventoryAlerts from "../../components/manager/dashboard/InventoryAlerts";
import QuickActions from "../../components/manager/dashboard/QuickActions";

import { getDashboard } from "../../services/dashboardApi";

const ManagerDashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboard();

      setDashboard(data);
    } catch (err) {
      console.error(
        "Failed to load dashboard:",
        err
      );

      setError(
        err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatLastUpdated = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed(
            !sidebarCollapsed
          )
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

      {/* Main */}
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

            {/* Heading */}
            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Overview
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Dashboard
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Here's what's happening with
                    your inventory today.
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">
                    Last updated
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {formatLastUpdated(
                      dashboard?.lastUpdated
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-medium text-slate-700">
                  Loading dashboard...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest inventory,
                  sales and purchase data.
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Dashboard */}
            {!loading &&
              !error &&
              dashboard && (
                <>
                  {/* Statistics */}
                  <DashboardStats
                    data={dashboard.stats}
                  />

                  {/* Analytics Overview */}
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">

                    {/* Stock Level */}
                    <div className="lg:col-span-5">
                      <StockLevelChart
                        data={dashboard.inventory}
                      />
                    </div>

                    {/* Inventory Overview */}
                    <div className="lg:col-span-3">
                      <InventoryOverview
                        data={dashboard.inventory}
                      />
                    </div>

                    {/* Sales Overview */}
                    <div className="lg:col-span-4">
                      <SalesOverview
                        data={dashboard.sales}
                      />
                    </div>
                  </div>

                  {/* Alerts / Low Stock */}
                  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <LowStockProducts
                      data={
                        dashboard.lowStockProducts
                      }
                    />

                    <InventoryAlerts
                      data={dashboard.alerts}
                    />
                  </div>

                  {/* Transactions / Actions */}
                  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                      <RecentTransactions
                        data={
                          dashboard.recentTransactions
                        }
                      />
                    </div>

                    <QuickActions />
                  </div>
                </>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
