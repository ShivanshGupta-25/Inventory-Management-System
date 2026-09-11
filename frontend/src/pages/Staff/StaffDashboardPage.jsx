import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Package,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

import StaffStatCard from "../../components/staff/dashboard/StaffStatCard";
import StaffQuickActions from "../../components/staff/dashboard/StaffQuickActions";
import InventoryAlerts from "../../components/staff/dashboard/InventoryAlerts";
import RecentStockActivity from "../../components/staff/dashboard/RecentStockActivity";
import LowStockProducts from "../../components/staff/dashboard/LowStockProducts";
import TodaysFocus from "../../components/staff/dashboard/TodaysFocus";

import { getDashboard } from "../../services/dashboardApi";

const StaffDashboardPage = () => {
  const navigate = useNavigate();

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
        "Failed to load staff dashboard:",
        err
      );

      setError(
        err?.message ||
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

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const stats = dashboard?.stats || {};

  const lowStockProducts =
    dashboard?.lowStockProducts || [];

  const recentTransactions =
    dashboard?.recentTransactions || [];

  const alerts = dashboard?.alerts || [];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* SIDEBAR */}

      <StaffSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed((prev) => !prev)
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* MAIN */}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >

        <StaffHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">

            {/* HEADER */}

            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Workspace
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Staff Dashboard
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage daily inventory operations
                    and stock activities.
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

            {/* LOADING */}

            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-medium text-slate-700">
                  Loading dashboard...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest inventory information.
                </p>

              </div>
            )}

            {/* ERROR */}

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

            {/* DASHBOARD */}

            {!loading &&
              !error &&
              dashboard && (
                <>

                  {/* STATISTICS */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StaffStatCard
                      title="Total Products"
                      value={
                        stats.totalProducts ?? 0
                      }
                      icon={Package}
                      description="Products in inventory"
                    />

                    <StaffStatCard
                      title="Low Stock"
                      value={
                        stats.lowStockProducts ??
                        0
                      }
                      icon={AlertTriangle}
                      description="Need attention"
                      alert
                    />

                    <StaffStatCard
                      title="Out of Stock"
                      value={
                        stats.outOfStockProducts ??
                        0
                      }
                      icon={XCircle}
                      description="Currently unavailable"
                      danger
                    />

                    <StaffStatCard
                      title="Stock Activities"
                      value={stats.todayTransactions ?? 0}
                      icon={ArrowLeftRight}
                      description="Recent movements"
                    />

                  </div>

                  {/* QUICK ACTIONS + ALERTS */}

                  <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

                    <StaffQuickActions
                      onNavigate={navigate}
                    />

                    <InventoryAlerts
                      alerts={alerts}
                      onViewAll={() =>
                        navigate("/staff/alerts")
                      }
                    />

                  </div>

                  {/* RECENT ACTIVITY */}

                  <RecentStockActivity
                    transactions={recentTransactions}
                    onViewHistory={() =>
                      navigate(
                        "/staff/stock-history"
                      )
                    }
                  />

                  {/* LOW STOCK + FOCUS */}

                  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

                    <LowStockProducts
                      products={lowStockProducts}
                      onViewInventory={() =>
                        navigate(
                          "/staff/inventory"
                        )
                      }
                    />

                    <TodaysFocus
                      onNavigate={navigate}
                    />

                  </div>

                </>
              )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboardPage;