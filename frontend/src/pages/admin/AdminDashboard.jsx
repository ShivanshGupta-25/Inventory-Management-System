import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  UserRoundCog,
  UserRoundX,
  UserCheck,
  UserCog,
  BarChart3,
  Settings2,
  ChevronRight,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router-dom";

import { getAdminDashboard } from "../../services/adminService";

/* ==========================================================================
   HELPERS
   ========================================================================== */

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
};

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatRelativeTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const now = new Date();
  const difference = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (difference < 60) {
    return "Just now";
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getRoleLabel = (role) => {
  if (!role) {
    return "Unknown";
  }

  return (
    role.charAt(0).toUpperCase() +
    role.slice(1)
  );
};

const getActionLabel = (action) => {
  const labels = {
    USER_CREATED: "User created",
    USER_UPDATED: "User updated",
    ROLE_CHANGED: "Role changed",
    STATUS_CHANGED: "Account status changed",
    USER_DELETED: "User deleted",
  };

  return labels[action] || "Administrative activity";
};

/* ==========================================================================
   STAT CARD
   ========================================================================== */

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        <ArrowUpRight
          size={16}
          className="text-slate-300 transition-colors group-hover:text-slate-600"
        />
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
};

/* ==========================================================================
   SECTION HEADER
   ========================================================================== */

const SectionHeader = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
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
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          {actionLabel}
          <ArrowUpRight size={13} />
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */

const EmptyState = ({
  icon: Icon = Activity,
  title,
  description,
}) => {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ==========================================================================
   ROLE DISTRIBUTION COLORS
   ========================================================================== */

const ROLE_COLORS = {
  admin: "#0f172a",
  manager: "#f59e0b",
  staff: "#94a3b8",
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  /* ------------------------------------------------------------------------
     LOAD DASHBOARD
  ------------------------------------------------------------------------ */

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminDashboard();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load admin dashboard"
          );
        }

        setDashboard(
          response.data || null
        );
      } catch (err) {
        console.error(
          "Admin dashboard error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load the admin dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ------------------------------------------------------------------------
     DATA NORMALIZATION
  ------------------------------------------------------------------------ */

  const stats = dashboard?.stats || {};

  const userGrowth =
    dashboard?.userGrowth || [];

  const roleDistribution =
    dashboard?.roleDistribution || [];

  const recentUsers =
    dashboard?.recentUsers || [];

  const recentActivity =
    dashboard?.recentActivity || [];

  /* ------------------------------------------------------------------------
     ROLE CHART DATA
  ------------------------------------------------------------------------ */

  const roleChartData = useMemo(() => {
    return roleDistribution.map(
      (item) => ({
        name: getRoleLabel(item._id),
        value: Number(item.count) || 0,
        role: item._id,
      })
    );
  }, [roleDistribution]);

  /* ------------------------------------------------------------------------
     USER GROWTH DATA
  ------------------------------------------------------------------------ */

  const userGrowthChartData = useMemo(() => {
    return userGrowth.map((item) => {
      const date = new Date(
        `${item._id}T00:00:00`
      );

      return {
        date: item._id,
        label: Number.isNaN(
          date.getTime()
        )
          ? item._id
          : date.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            ),
        users: Number(item.count) || 0,
      };
    });
  }, [userGrowth]);

  /* ------------------------------------------------------------------------
     PAGE LAST UPDATED
  ------------------------------------------------------------------------ */

  const lastUpdated = dashboard?.lastUpdated
    ? formatDateTime(
        dashboard.lastUpdated
      )
    : "--";

  /* ------------------------------------------------------------------------
     LOADING STATE
  ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-9 w-52 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="h-14 w-48 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            )
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-8" />

          <div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-4" />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------
     ERROR STATE
  ------------------------------------------------------------------------ */

  if (error && !dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={23} />
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadDashboard()
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ====================================================================
          PAGE HEADER
      ==================================================================== */}

      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor users, access, administrative
              activity, and the overall state of your
              InventoryFlow system.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right sm:block">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Last updated
              </p>

              <p className="mt-0.5 text-xs font-semibold text-slate-700">
                {lastUpdated}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadDashboard({
                  silent: true,
                })
              }
              disabled={refreshing}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
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
      </section>

      {/* ====================================================================
          SOFT ERROR / STALE DATA
      ==================================================================== */}

      {error && dashboard && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <AlertCircle
              size={17}
              className="shrink-0 text-amber-600"
            />

            <p className="truncate text-xs font-medium text-amber-800">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadDashboard({
                silent: true,
              })
            }
            className="shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ====================================================================
          ADMIN STATISTICS
      ==================================================================== */}

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatCard
            title="Total Users"
            value={formatNumber(
              stats.totalUsers
            )}
            description="All registered accounts"
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
            onClick={() =>
              navigate("/admin/users")
            }
          />

          <StatCard
            title="Administrators"
            value={formatNumber(
              stats.totalAdmins
            )}
            description="System administrators"
            icon={ShieldCheck}
            iconClass="bg-slate-100 text-slate-700"
            onClick={() =>
              navigate("/admin/users?role=admin")
            }
          />

          <StatCard
            title="Managers"
            value={formatNumber(
              stats.totalManagers
            )}
            description="Manager accounts"
            icon={UserRoundCog}
            iconClass="bg-amber-50 text-amber-600"
            onClick={() =>
              navigate(
                "/admin/users?role=manager"
              )
            }
          />

          <StatCard
            title="Staff"
            value={formatNumber(
              stats.totalStaff
            )}
            description="Staff accounts"
            icon={UserCog}
            iconClass="bg-violet-50 text-violet-600"
            onClick={() =>
              navigate(
                "/admin/users?role=staff"
              )
            }
          />

          <StatCard
            title="Active Users"
            value={formatNumber(
              stats.activeUsers
            )}
            description="Currently enabled"
            icon={UserCheck}
            iconClass="bg-emerald-50 text-emerald-600"
            onClick={() =>
              navigate(
                "/admin/users?status=active"
              )
            }
          />

          <StatCard
            title="Disabled Users"
            value={formatNumber(
              stats.disabledUsers
            )}
            description="Accounts requiring review"
            icon={UserRoundX}
            iconClass="bg-red-50 text-red-600"
            onClick={() =>
              navigate(
                "/admin/users?status=disabled"
              )
            }
          />
        </div>
      </section>

      {/* ====================================================================
          CHARTS
      ==================================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* User Growth */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">
          <SectionHeader
            title="User Growth"
            description="New accounts created over the last 30 days"
            actionLabel="Manage users"
            onAction={() =>
              navigate("/admin/users")
            }
          />

          {userGrowthChartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    userGrowthChartData
                  }
                  margin={{
                    top: 10,
                    right: 8,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="adminUserGrowthGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#0f172a"
                        stopOpacity={0.16}
                      />

                      <stop
                        offset="100%"
                        stopColor="#0f172a"
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
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
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
                      border:
                        "1px solid #e2e8f0",
                      boxShadow:
                        "0 10px 30px rgba(15,23,42,0.08)",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `${value} users`,
                      "New users",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fill="url(#adminUserGrowthGradient)"
                    activeDot={{
                      r: 5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No growth data yet"
              description="User growth information will appear here as new accounts are created."
            />
          )}
        </div>

        {/* Role Distribution */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">
          <SectionHeader
            title="Role Distribution"
            description="Current accounts by role"
            actionLabel="Users"
            onAction={() =>
              navigate("/admin/users")
            }
          />

          {roleChartData.length > 0 ? (
            <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={roleChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {roleChartData.map(
                        (entry) => (
                          <Cell
                            key={entry.role}
                            fill={
                              ROLE_COLORS[
                                entry.role
                              ] ||
                              "#cbd5e1"
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border:
                          "1px solid #e2e8f0",
                        boxShadow:
                          "0 10px 30px rgba(15,23,42,0.08)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {roleChartData.map(
                  (item) => (
                    <div
                      key={item.role}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              ROLE_COLORS[
                                item.role
                              ] ||
                              "#cbd5e1",
                          }}
                        />

                        <span className="text-xs font-medium text-slate-600">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-800">
                        {formatNumber(
                          item.value
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="No role data"
              description="Role distribution will appear when users are available."
            />
          )}
        </div>
      </section>

      {/* ====================================================================
          RECENT USERS + ADMIN ACTIVITY
      ==================================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Recent Users */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-5">
          <SectionHeader
            title="Recently Added Users"
            description="Latest accounts added to InventoryFlow"
            actionLabel="View all"
            onAction={() =>
              navigate("/admin/users")
            }
          />

          {recentUsers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentUsers.map(
                (user) => (
                  <button
                    key={user._id || user.id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/users/${
                          user._id || user.id
                        }`
                      )
                    }
                    className="group flex w-full items-center gap-3 py-3.5 text-left first:pt-0 last:pb-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                      {user.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {user.name ||
                          "Unnamed user"}
                      </p>

                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="truncate text-[11px] text-slate-400">
                          {user.email}
                        </p>

                        <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:inline-flex">
                          {getRoleLabel(
                            user.role
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-slate-400">
                        {formatRelativeTime(
                          user.createdAt
                        )}
                      </p>

                      <ChevronRight
                        size={14}
                        className="ml-auto mt-1 text-slate-300 transition-colors group-hover:text-slate-600"
                      />
                    </div>
                  </button>
                )
              )}
            </div>
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No users yet"
              description="Newly created users will appear in this section."
            />
          )}
        </div>

        {/* Administrative Activity */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-7">
          <SectionHeader
            title="Recent Administrative Activity"
            description="Latest actions recorded in the admin audit trail"
            actionLabel="View audit logs"
            onAction={() =>
              navigate(
                "/admin/audit-logs"
              )
            }
          />

          {recentActivity.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentActivity
                .slice(0, 6)
                .map((activity) => {
                  const actor =
                    activity.actor;

                  const target =
                    activity.targetUser;

                  return (
                    <div
                      key={
                        activity._id ||
                        activity.id
                      }
                      className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        {activity.action ===
                        "USER_CREATED" ? (
                          <UserPlus
                            size={17}
                          />
                        ) : activity.action ===
                          "ROLE_CHANGED" ? (
                          <Settings2
                            size={17}
                          />
                        ) : activity.action ===
                          "STATUS_CHANGED" ? (
                          <UserCheck
                            size={17}
                          />
                        ) : activity.action ===
                          "USER_DELETED" ? (
                          <UserRoundX
                            size={17}
                          />
                        ) : (
                          <Activity
                            size={17}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {getActionLabel(
                              activity.action
                            )}
                          </p>

                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                            {activity.action?.replace(
                              /_/g,
                              " "
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {activity.description}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                          {actor?.name && (
                            <span>
                              By{" "}
                              <span className="font-semibold text-slate-500">
                                {actor.name}
                              </span>
                            </span>
                          )}

                          {target?.name && (
                            <>
                              <span>•</span>

                              <span>
                                Target:{" "}
                                <span className="font-semibold text-slate-500">
                                  {target.name}
                                </span>
                              </span>
                            </>
                          )}

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3
                              size={10}
                            />

                            {formatRelativeTime(
                              activity.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No administrative activity"
              description="Administrative actions such as user creation, role changes, and account status changes will appear here."
            />
          )}
        </div>
      </section>

      {/* ====================================================================
          ADMIN QUICK ACTIONS
      ==================================================================== */}

      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Quick Actions"
            description="Common administrative tasks"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/users")
              }
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Manage Users
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Search and manage accounts
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-slate-300 transition-colors group-hover:text-blue-600"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/users/create")
              }
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserPlus size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Add User
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Create a manager or staff account
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-slate-300 transition-colors group-hover:text-emerald-600"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/audit-logs"
                )
              }
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Activity size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  Audit Logs
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Review administrative actions
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-slate-300 transition-colors group-hover:text-violet-600"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/system-health"
                )
              }
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-amber-200 hover:bg-amber-50/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CheckCircle2 size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">
                  System Health
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Check system services
                </p>
              </div>

              <ChevronRight
                size={15}
                className="text-slate-300 transition-colors group-hover:text-amber-600"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          ADMIN STATUS
      ==================================================================== */}

      <section>
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-xs font-bold text-emerald-800">
                Administrative controls active
              </p>

              <p className="mt-0.5 text-[10px] text-emerald-700/70">
                User management and audit tracking are available.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/system-health"
              )
            }
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            System health
            <ArrowUpRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;