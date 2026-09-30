import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router-dom";

/* ==========================================================================
   MOCK DATA
   ========================================================================== */

const dashboardStats = [
  {
    title: "Total Users",
    value: "--",
    change: "--",
    description: "vs. last month",
    icon: Users,
    trend: "up",
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    title: "Total Products",
    value: "--",
    change: "--",
    description: "vs. last month",
    icon: Boxes,
    trend: "up",
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    title: "Warehouses",
    value: "--",
    change: "--",
    description: "this month",
    icon: Warehouse,
    trend: "up",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Inventory Value",
    value: "--",
    change: "--",
    description: "vs. last month",
    icon: TrendingUp,
    trend: "up",
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    title: "Low Stock Items",
    value: "--",
    change: "--",
    description: "vs. last month",
    icon: AlertTriangle,
    trend: "down",
    iconClass: "bg-orange-50 text-orange-600",
  },
  {
    title: "Active Alerts",
    value: "--",
    change: "--",
    description: "need attention",
    icon: Activity,
    trend: "warning",
    iconClass: "bg-red-50 text-red-600",
  },
];

const inventoryMovementData = [
  { day: "Mon", stockIn: 10, stockOut: 15 },
  { day: "Tue", stockIn: 18, stockOut: 15 },
  { day: "Wed", stockIn: 10, stockOut: 18 },
  { day: "Thu", stockIn: 18, stockOut: 15 },
  { day: "Fri", stockIn: 10, stockOut: 18 },
  { day: "Sat", stockIn: 18, stockOut: 15 },
  { day: "Sun", stockIn: 10, stockOut: 18 },
];

const stockHealth = [
  {
    label: "Healthy Stock",
    value: 0,
    count: "--",
    className: "bg-emerald-500",
  },
  {
    label: "Low Stock",
    value: 0,
    count: "--",
    className: "bg-amber-500",
  },
  {
    label: "Out of Stock",
    value: 0,
    count: "--",
    className: "bg-red-500",
  },
  {
    label: "Overstock",
    value: 0,
    count: "--",
    className: "bg-violet-500",
  },
];

const recentActivity = [
  {
    id: 1,
    title: "New manager account created",
    description: "- - -",
    time: "5 min ago",
    icon: UserPlus,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    title: "Purchase order received",
    description: "PO-1048 was marked as received.",
    time: "18 min ago",
    icon: ClipboardList,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: 3,
    title: "Stock adjustment recorded",
    description: "SKU-2048 inventory was adjusted by 25 units.",
    time: "34 min ago",
    icon: RefreshCw,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: 4,
    title: "New staff account created",
    description: "A new staff member joined the system.",
    time: "1 hour ago",
    icon: Users,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    id: 5,
    title: "Warehouse configuration updated",
    description: "- -",
    time: "2 hours ago",
    icon: Warehouse,
    iconClass: "bg-slate-100 text-slate-600",
  },
];

const alerts = [
  {
    id: 1,
    title: "Critical stock shortage",
    description: "12 products have reached critical stock levels.",
    time: "5 min ago",
    severity: "critical",
  },
  {
    id: 2,
    title: "Purchase approval pending",
    description: "4 purchase orders are awaiting manager approval.",
    time: "22 min ago",
    severity: "warning",
  },
  {
    id: 3,
    title: "Warehouse capacity warning",
    description: "Indore warehouse has reached 87% capacity.",
    time: "1 hour ago",
    severity: "warning",
  },
];

const quickActions = [
  {
    label: "Add User",
    description: "Create a new system user",
    icon: UserPlus,
    path: "/admin/users",
  },
  {
    label: "View Inventory",
    description: "Inspect global inventory",
    icon: Package,
    path: "/admin/inventory",
  },
  {
    label: "View Purchases",
    description: "Review purchase activity",
    icon: ShoppingCart,
    path: "/admin/purchases",
  },
  {
    label: "View Reports",
    description: "Open system reports",
    icon: TrendingUp,
    path: "/admin/reports",
  },
];

/* ==========================================================================
   HELPER COMPONENTS
   ========================================================================== */

const StatCard = ({ stat }) => {
  const Icon = stat.icon;

  const trendClasses =
    stat.trend === "down"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-emerald-50 text-emerald-600";

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconClass}`}
        >
          <Icon size={21} strokeWidth={2} />
        </div>

        {stat.trend === "warning" ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
            Attention
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendClasses}`}
          >
            {stat.trend === "up" ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}

            {stat.change}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">
          {stat.title}
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {stat.value}
          </h3>

          <span className="pb-0.5 text-[11px] text-slate-400">
            {stat.description}
          </span>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading] = useState(false);
  const [error] = useState("");

  const lastUpdated = useMemo(() => {
    return new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* ====================================================================
          PAGE HEADING
      ==================================================================== */}

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
              Here's what's happening across your InventoryFlow
              system today.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:min-w-[220px] sm:text-right">
            <p className="text-xs font-medium text-slate-400">
              Last updated
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          LOADING STATE
      ==================================================================== */}

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

          <p className="text-sm font-semibold text-slate-700">
            Loading dashboard...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching the latest system and inventory data.
          </p>
        </div>
      )}

      {/* ====================================================================
          ERROR STATE
      ==================================================================== */}

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
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          DASHBOARD CONTENT
      ==================================================================== */}

      {!loading && !error && (
        <div className="space-y-5">
          {/* ==================================================================
              STATISTICS
          ================================================================== */}

          <section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {dashboardStats.map((stat) => (
                <StatCard key={stat.title} stat={stat} />
              ))}
            </div>
          </section>

          {/* ==================================================================
              ANALYTICS OVERVIEW
          ================================================================== */}

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            {/* Inventory Movement */}

            <div className="min-w-0 xl:col-span-8">
              <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Inventory Movement"
                  description="Stock movement across the system"
                  actionLabel="View history"
                  onAction={() =>
                    navigate("/admin/stock-movements")
                  }
                />

                <div className="mb-5 flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />

                    <span className="text-xs font-medium text-slate-500">
                      Stock In
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />

                    <span className="text-xs font-medium text-slate-500">
                      Stock Out
                    </span>
                  </div>

                  <div className="ml-auto rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                    Last 7 days
                  </div>
                </div>

                <div className="h-[290px] w-full">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart
                      data={inventoryMovementData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="stockInGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0f172a"
                            stopOpacity={0.18}
                          />

                          <stop
                            offset="100%"
                            stopColor="#0f172a"
                            stopOpacity={0}
                          />
                        </linearGradient>

                        <linearGradient
                          id="stockOutGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#94a3b8"
                            stopOpacity={0.18}
                          />

                          <stop
                            offset="100%"
                            stopColor="#94a3b8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />

                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#94a3b8",
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 11,
                          fill: "#94a3b8",
                        }}
                      />

                      <Tooltip
                        cursor={{
                          stroke: "#cbd5e1",
                          strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 30px rgba(15,23,42,0.08)",
                          fontSize: "12px",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="stockIn"
                        stroke="#0f172a"
                        strokeWidth={2}
                        fill="url(#stockInGradient)"
                      />

                      <Area
                        type="monotone"
                        dataKey="stockOut"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        fill="url(#stockOutGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stock Health */}

            <div className="min-w-0 xl:col-span-4">
              <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Stock Health"
                  description="Current inventory distribution"
                  actionLabel="View inventory"
                  onAction={() => navigate("/admin/inventory")}
                />

                <div className="flex flex-col items-center">
                  <div
                    className="relative flex h-48 w-48 items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(#10b981 0% 64%, #f59e0b 64% 85%, #ef4444 85% 94%, #8b5cf6 94% 100%)",
                    }}
                  >
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-2xl font-bold text-slate-900">
                        --
                      </span>

                      <span className="text-xs text-slate-400">
                        Total Products
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 w-full space-y-3">
                    {stockHealth.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.className}`}
                          />

                          <span className="truncate text-xs font-medium text-slate-600">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {item.value}%
                          </span>

                          <span className="hidden text-[10px] text-slate-400 sm:inline">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================================
              ACTIVITY AND ALERTS
          ================================================================== */}

          <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
            {/* Recent Activity */}

            <div className="min-w-0 xl:col-span-7">
              <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Recent Activity"
                  description="Latest activity across your system"
                  actionLabel="View all"
                  onAction={() => navigate("/admin/activity")}
                />

                <div className="divide-y divide-slate-100">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activity.iconClass}`}
                        >
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {activity.title}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {activity.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                          <Clock3 size={11} />
                          {activity.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alerts */}

            <div className="min-w-0 xl:col-span-5">
              <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  title="Needs Attention"
                  description="Issues requiring administrative review"
                  actionLabel="View alerts"
                  onAction={() => navigate("/admin/alerts")}
                />

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <button
                      type="button"
                      key={alert.id}
                      onClick={() => navigate("/admin/alerts")}
                      className="flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-left transition-all hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          alert.severity === "critical"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <AlertTriangle size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800">
                            {alert.title}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                              alert.severity === "critical"
                                ? "bg-red-100 text-red-600"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                          {alert.description}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {alert.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/admin/alerts")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <AlertTriangle size={14} />
                  Review all alerts
                </button>
              </div>
            </div>
          </section>

          {/* ==================================================================
              QUICK ACTIONS
          ================================================================== */}

          <section>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                title="Quick Actions"
                description="Common administrative tasks"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      type="button"
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition-all hover:border-amber-200 hover:bg-amber-50/40 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">
                          {action.label}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {action.description}
                        </p>
                      </div>

                      <Plus
                        size={15}
                        className="text-slate-300 transition-colors group-hover:text-amber-600"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ==================================================================
              SYSTEM STATUS
          ================================================================== */}

          <section>
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    All core services operational
                  </p>

                  <p className="mt-0.5 text-[10px] text-emerald-700/70">
                    Last system check completed just now
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/system-health")}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                System health
                <ArrowUpRight size={14} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;