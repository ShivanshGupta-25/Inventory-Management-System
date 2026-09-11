import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  ArrowLeftRight,
  Plus,
  Minus,
  ClipboardList,
  Clock,
  ChevronRight,
  Bell,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StaffSidebar from "../../components/layout/StaffSidebar";
import StaffHeader from "../../components/layout/StaffHeader";

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

  /*
   * These values are intentionally derived from
   * the existing dashboard response where possible.
   * We'll connect them to dedicated staff APIs
   * when we build the stock-operation modules.
   */

  const stats = dashboard?.stats || {};

  const inventory = dashboard?.inventory || {};

  const lowStockProducts =
    dashboard?.lowStockProducts || [];

  const recentTransactions =
    dashboard?.recentTransactions || [];

  const alerts = dashboard?.alerts || [];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <StaffSidebar
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

      {/* =====================================================
          MAIN
      ====================================================== */}

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

            {/* =================================================
                PAGE HEADING
            ================================================== */}

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
                    Manage daily inventory
                    operations and stock
                    activities.
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

            {/* =================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-medium text-slate-700">
                  Loading dashboard...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest inventory
                  information.
                </p>

              </div>
            )}

            {/* =================================================
                ERROR
            ================================================== */}

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

            {/* =================================================
                DASHBOARD
            ================================================== */}

            {!loading &&
              !error &&
              dashboard && (
                <>

                  {/* =================================================
                      STATISTICS
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StaffStatCard
                      title="Total Products"
                      value={
                        stats.totalProducts ??
                        inventory.totalProducts ??
                        0
                      }
                      icon={Package}
                      description="Products in inventory"
                    />

                    <StaffStatCard
                      title="Low Stock"
                      value={
                        stats.lowStockProducts ??
                        stats.lowStock ??
                        lowStockProducts.length
                      }
                      icon={AlertTriangle}
                      description="Need attention"
                      alert
                    />

                    <StaffStatCard
                      title="Out of Stock"
                      value={
                        stats.outOfStockProducts ??
                        stats.outOfStock ??
                        0
                      }
                      icon={XCircle}
                      description="Currently unavailable"
                      danger
                    />

                    <StaffStatCard
                      title="Stock Activities"
                      value={
                        stats.todayTransactions ??
                        stats.totalTransactions ??
                        recentTransactions.length
                      }
                      icon={ArrowLeftRight}
                      description="Recent movements"
                    />

                  </div>


                  {/* =================================================
                      QUICK ACTIONS + ALERTS
                  ================================================== */}

                  <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {/* Quick Actions */}

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-slate-900">
                          Quick Actions
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Common inventory operations
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">

                        <QuickAction
                          icon={Plus}
                          title="Stock In"
                          description="Add stock"
                          onClick={() =>
                            navigate(
                              "/staff/stock-in"
                            )
                          }
                        />

                        <QuickAction
                          icon={Minus}
                          title="Stock Out"
                          description="Issue stock"
                          onClick={() =>
                            navigate(
                              "/staff/stock-out"
                            )
                          }
                        />

                        <QuickAction
                          icon={ClipboardList}
                          title="Request Stock"
                          description="Create request"
                          onClick={() =>
                            navigate(
                              "/staff/purchase-requests/create"
                            )
                          }
                        />

                      </div>
                    </div>


                    {/* Alerts */}

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Inventory Alerts
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Items requiring attention
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/staff/alerts"
                            )
                          }
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View all
                          <ChevronRight size={14} />
                        </button>

                      </div>

                      <div className="p-4">

                        {alerts.length === 0 ? (
                          <EmptyState
                            icon={BellIcon}
                            message="No active inventory alerts"
                          />
                        ) : (
                          <div className="space-y-2">
                            {alerts
                              .slice(0, 3)
                              .map(
                                (
                                  alert,
                                  index
                                ) => (
                                  <AlertItem
                                    key={
                                      alert._id ||
                                      alert.id ||
                                      index
                                    }
                                    alert={
                                      alert
                                    }
                                  />
                                )
                              )}
                          </div>
                        )}

                      </div>
                    </div>

                  </div>


                  {/* =================================================
                      RECENT TRANSACTIONS
                  ================================================== */}

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                      <div>
                        <h2 className="text-sm font-semibold text-slate-900">
                          Recent Stock Activity
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Latest inventory movements
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/staff/stock-history"
                          )
                        }
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View history
                        <ChevronRight size={14} />
                      </button>

                    </div>

                    {recentTransactions.length ===
                    0 ? (
                      <EmptyState
                        icon={HistoryIcon}
                        message="No recent stock activity"
                      />
                    ) : (
                      <div className="divide-y divide-slate-100">

                        {recentTransactions
                          .slice(0, 5)
                          .map(
                            (
                              transaction,
                              index
                            ) => (
                              <TransactionRow
                                key={
                                  transaction._id ||
                                  transaction.id ||
                                  index
                                }
                                transaction={
                                  transaction
                                }
                              />
                            )
                          )}

                      </div>
                    )}

                  </div>


                  {/* =================================================
                      LOW STOCK + REQUESTS
                  ================================================== */}

                  <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

                    {/* Low Stock */}

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">
                            Low Stock Products
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Products that may require
                            replenishment
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/staff/inventory"
                            )
                          }
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          View inventory
                          <ChevronRight size={14} />
                        </button>

                      </div>

                      {lowStockProducts.length ===
                      0 ? (
                        <EmptyState
                          icon={
                            Package
                          }
                          message="No low-stock products"
                        />
                      ) : (
                        <div className="divide-y divide-slate-100">

                          {lowStockProducts
                            .slice(0, 5)
                            .map(
                              (
                                product,
                                index
                              ) => (
                                <LowStockRow
                                  key={
                                    product._id ||
                                    product.id ||
                                    index
                                  }
                                  product={
                                    product
                                  }
                                />
                              )
                            )}

                        </div>
                      )}

                    </div>


                    {/* Staff Reminder */}

                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                      <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-slate-900">
                          Today's Focus
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Recommended operational tasks
                        </p>
                      </div>

                      <div className="space-y-3 p-5">

                        <FocusItem
                          icon={AlertTriangle}
                          title="Check low-stock items"
                          description="Review products below their minimum stock level."
                          onClick={() =>
                            navigate(
                              "/staff/inventory"
                            )
                          }
                        />

                        <FocusItem
                          icon={ClipboardList}
                          title="Review purchase requests"
                          description="Check requests waiting for action."
                          onClick={() =>
                            navigate(
                              "/staff/purchase-requests"
                            )
                          }
                        />

                        <FocusItem
                          icon={Clock}
                          title="Review recent activity"
                          description="Verify today's stock movements."
                          onClick={() =>
                            navigate(
                              "/staff/stock-history"
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                </>
              )}

          </div>
        </main>
      </div>
    </div>
  );
};


/* =========================================================
   STAT CARD
========================================================= */

const StaffStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  alert = false,
  danger = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p
            className={`mt-1 text-[11px] ${
              danger
                ? "text-red-500"
                : alert
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-50 text-red-600"
              : alert
              ? "bg-amber-50 text-amber-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={19} />
        </div>

      </div>
    </div>
  );
};


/* =========================================================
   QUICK ACTION
========================================================= */

const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        <Icon size={17} />
      </div>

      <p className="text-xs font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </button>
  );
};


/* =========================================================
   ALERT ITEM
========================================================= */

const AlertItem = ({ alert }) => {
  const title =
    alert.title ||
    alert.message ||
    alert.type ||
    "Inventory alert";

  const description =
    alert.description ||
    alert.productName ||
    "Inventory requires attention.";

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <AlertTriangle size={15} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>

    </div>
  );
};


/* =========================================================
   TRANSACTION ROW
========================================================= */

const TransactionRow = ({
  transaction,
}) => {
  const productName =
    transaction.productName ||
    transaction.product?.productName ||
    transaction.product ||
    "Product";

  const type =
    transaction.type ||
    transaction.transactionType ||
    transaction.action ||
    "Movement";

  const quantity =
    transaction.quantity ??
    transaction.qty ??
    0;

  const isIn =
    type.toLowerCase().includes("in") ||
    type.toLowerCase().includes("receive") ||
    type.toLowerCase().includes("add");

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isIn
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isIn ? (
            <Plus size={15} />
          ) : (
            <Minus size={15} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700">
            {productName}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {type}
          </p>
        </div>

      </div>

      <div className="shrink-0 text-right">

        <p
          className={`text-xs font-semibold ${
            isIn
              ? "text-emerald-600"
              : "text-slate-700"
          }`}
        >
          {isIn ? "+" : "-"}
          {quantity}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-400">
          units
        </p>

      </div>

    </div>
  );
};


/* =========================================================
   LOW STOCK ROW
========================================================= */

const LowStockRow = ({
  product,
}) => {
  const name =
    product.productName ||
    product.name ||
    "Product";

  const stock =
    product.currentStock ??
    product.stock ??
    0;

  const minimum =
    product.minStock ??
    product.minimumStock ??
    0;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">

      <div className="flex min-w-0 items-center gap-3">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Package size={15} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700">
            {name}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Minimum: {minimum}
          </p>
        </div>

      </div>

      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
        {stock} left
      </span>

    </div>
  );
};


/* =========================================================
   FOCUS ITEM
========================================================= */

const FocusItem = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-100 hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className="shrink-0 text-slate-300 group-hover:text-blue-500"
      />
    </button>
  );
};


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  icon: Icon,
  message,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
        <Icon size={18} />
      </div>

      <p className="text-xs font-medium text-slate-500">
        {message}
      </p>

    </div>
  );
};


/* =========================================================
   FALLBACK ICONS
========================================================= */

const BellIcon = Bell;
const HistoryIcon = History;

export default StaffDashboardPage;