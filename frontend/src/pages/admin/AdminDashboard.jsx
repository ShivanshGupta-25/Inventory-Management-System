import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getAdminDashboard,
} from "../../services/adminService";

import AdminUserStats from "../../components/admin/users/AdminUserStats";

import AdminUserGrowthChart from "../../components/admin/dashboard/AdminUserGrowthChart";
import AdminRoleDistribution from "../../components/admin/dashboard/AdminRoleDistribution";
import AdminRecentUsers from "../../components/admin/dashboard/AdminRecentUsers";
import AdminRecentActivity from "../../components/admin/dashboard/AdminRecentActivity";
import AdminQuickActions from "../../components/admin/dashboard/AdminQuickActions";
import AdminSystemStatus from "../../components/admin/dashboard/AdminSystemStatus";
import AdminDashboardSkeleton from "../../components/admin/dashboard/AdminDashboardSkeleton";
import AdminDashboardError from "../../components/admin/dashboard/AdminDashboardError";

// --------------------------------------------------
// FORMAT DATE / TIME
// --------------------------------------------------

const formatDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --------------------------------------------------
  // DASHBOARD STATE
  // --------------------------------------------------

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  // --------------------------------------------------
  // LOAD DASHBOARD
  // --------------------------------------------------

  const loadDashboard =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
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

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // --------------------------------------------------
  // NORMALIZE API DATA
  // --------------------------------------------------

  const stats =
    dashboard?.stats || {};

  const userGrowth =
    dashboard?.userGrowth || [];

  const roleDistribution =
    dashboard?.roleDistribution || [];

  const recentUsers =
    dashboard?.recentUsers || [];

  const recentActivity =
    dashboard?.recentActivity || [];

  // --------------------------------------------------
  // USER GROWTH CHART DATA
  // --------------------------------------------------

  const userGrowthChartData =
    useMemo(() => {
      return userGrowth.map(
        (item) => {
          const date = new Date(
            `${item._id}T00:00:00`
          );

          return {
            date: item._id,

            label:
              Number.isNaN(
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

            users:
              Number(item.count) || 0,
          };
        }
      );
    }, [userGrowth]);

  // --------------------------------------------------
  // ROLE DISTRIBUTION CHART DATA
  // --------------------------------------------------

  const roleChartData =
    useMemo(() => {
      return roleDistribution.map(
        (item) => ({
          name: item?._id
            ? item._id
                .charAt(0)
                .toUpperCase() +
              item._id.slice(1)
            : "Unknown",

          value:
            Number(item.count) || 0,

          role: item._id,
        })
      );
    }, [roleDistribution]);

  // --------------------------------------------------
  // LAST UPDATED
  // --------------------------------------------------

  const lastUpdated =
    dashboard?.lastUpdated
      ? formatDateTime(
          dashboard.lastUpdated
        )
      : "--";

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <AdminDashboardSkeleton />
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error && !dashboard) {
    return (
      <AdminDashboardError
        error={error}
        onRetry={() =>
          loadDashboard()
        }
      />
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* ============================================
          PAGE HEADER
      ============================================ */}

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
              Monitor users, access,
              administrative activity,
              and the overall state
              of your InventoryFlow
              system.
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

      {/* ============================================
          SOFT ERROR
      ============================================ */}

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

      {/* ============================================
          ADMIN USER STATISTICS
      ============================================ */}

      <AdminUserStats
        stats={stats}
        loading={false}
        onNavigate={navigate}
      />

      {/* ============================================
          CHARTS
      ============================================ */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        <AdminUserGrowthChart
          data={userGrowthChartData}
          onNavigate={navigate}
        />

        <AdminRoleDistribution
          data={roleChartData}
          onNavigate={navigate}
        />

      </section>

      {/* ============================================
          RECENT USERS + ACTIVITY
      ============================================ */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        <AdminRecentUsers
          users={recentUsers}
          onNavigate={navigate}
        />

        <AdminRecentActivity
          activities={recentActivity}
          onNavigate={navigate}
        />

      </section>

      {/* ============================================
          QUICK ACTIONS
      ============================================ */}

      <AdminQuickActions
        onNavigate={navigate}
      />

      {/* ============================================
          ADMIN STATUS
      ============================================ */}

      <AdminSystemStatus
        onNavigate={navigate}
      />

    </div>
  );
};

export default AdminDashboard;