import { useEffect, useState } from "react";
import {
  RefreshCw,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import {
  getAnalyticsOverview,
  getSalesTrend,
  getProductPerformance,
  getCategoryPerformance,
  getInventoryAnalytics,
} from "../../../services/analyticsService";

import AnalyticsKpiCards from "../../../components/manager/analytics/AnalyticsKpiCards";
import SalesTrendChart from "../../../components/manager/analytics/SalesTrendChart";
import ProductPerformance from "../../../components/manager/analytics/ProductPerformance";
import CategoryPerformance from "../../../components/manager/analytics/CategoryPerformance";
import InventoryHealth from "../../../components/manager/analytics/InventoryHealth";
import PurchaseOverview from "../../../components/manager/analytics/PurchaseOverview";
import DemandHistory from "../../../components/manager/analytics/DemandHistory";
import DemandForecast from "../../../components/manager/analytics/DemandForecast";
import StockoutRisk from "../../../components/manager/analytics/StockoutRisk";

const Analytics = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [period, setPeriod] = useState("30d");

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        overview,
        salesTrend,
        products,
        categories,
        inventory,
      ] = await Promise.all([
        getAnalyticsOverview(period),
        getSalesTrend(period),
        getProductPerformance(period),
        getCategoryPerformance(period),
        getInventoryAnalytics(),
      ]);

      setAnalytics({
        overview: overview.data,
        salesTrend: salesTrend.data,
        products: products.data,
        categories: categories.data,
        inventory: inventory.data,
      });
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(
        err.message ||
          "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

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
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Manager
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Analytics
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Analyze sales, inventory,
                    products and purchasing
                    performance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Period */}
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <CalendarDays
                      size={16}
                      className="text-slate-400"
                    />

                    <select
                      value={period}
                      onChange={(e) =>
                        setPeriod(e.target.value)
                      }
                      className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                    >
                      <option value="7d">
                        Last 7 days
                      </option>

                      <option value="30d">
                        Last 30 days
                      </option>

                      <option value="90d">
                        Last 90 days
                      </option>

                      <option value="6m">
                        Last 6 months
                      </option>

                      <option value="1y">
                        Last year
                      </option>
                    </select>
                  </div>

                  {/* Refresh */}
                  <button
                    type="button"
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    <span className="hidden sm:inline">
                      Refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-semibold text-slate-700">
                  Loading analytics...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Analyzing your sales, inventory
                  and purchasing data.
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 text-red-500"
                  />

                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-red-800">
                      Unable to load analytics
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={fetchAnalytics}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics */}
            {!loading &&
              !error &&
              analytics && (
                <div className="space-y-5">
                  {/* KPI Cards */}
                  <AnalyticsKpiCards
                    data={analytics.overview}
                  />

                  {/* Sales Trend and Stockout Risk */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <SalesTrendChart
                      data={analytics.salesTrend}
                    />

                    <StockoutRisk
                      products={analytics.products}
                    />
                  </div>

                  {/* Products / Categories */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <ProductPerformance
                      data={analytics.products}
                    />

                    <CategoryPerformance
                      data={analytics.categories}
                    />
                  </div>

                  {/* Inventory / Purchases */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <InventoryHealth
                      data={analytics.inventory}
                    />

                    <PurchaseOverview
                      data={analytics.overview.purchases}
                    />
                  </div>

                  {/* Demand */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <DemandHistory
                      period={period}
                      products={analytics.products}
                    />

                    <DemandForecast
                      products={analytics.products}
                    />
                  </div>

                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;