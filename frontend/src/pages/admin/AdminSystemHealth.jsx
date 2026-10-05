import {
  Activity,
  Database,
  Globe,
  KeyRound,
  Server,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminSystemHealth,
} from "../../services/adminService";

import SystemHealthHeader from "../../components/admin/systemHealth/SystemHealthHeader";
import SystemHealthOverview from "../../components/admin/systemHealth/SystemHealthOverview";
import SystemHealthStatCard from "../../components/admin/systemHealth/SystemHealthStatCard";
import SystemHealthServices from "../../components/admin/systemHealth/SystemHealthServices";
import SystemHealthDatabase from "../../components/admin/systemHealth/SystemHealthDatabase";
import SystemHealthSecurity from "../../components/admin/systemHealth/SystemHealthSecurity";
import SystemHealthEvents from "../../components/admin/systemHealth/SystemHealthEvents";
import SystemHealthSkeleton from "../../components/admin/systemHealth/SystemHealthSkeleton";
import SystemHealthError from "../../components/admin/systemHealth/SystemHealthError";

const AdminSystemHealth = () => {
  const [health, setHealth] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // LOAD REAL SYSTEM HEALTH
  // ------------------------------------------------------------

  const loadHealth = useCallback(
    async ({ initial = false } = {}) => {
      try {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response =
          await getAdminSystemHealth();

        const healthData =
          response?.health ||
          response?.data?.health ||
          response?.data ||
          response;

        setHealth(healthData || null);
      } catch (err) {
        console.error(
          "Failed to load system health:",
          err
        );

        setError(
          err?.message ||
            "Unable to retrieve system health."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ------------------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------------------

  useEffect(() => {
    loadHealth({ initial: true });
  }, [loadHealth]);

  // ------------------------------------------------------------
  // FORMAT HELPERS
  // ------------------------------------------------------------

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatUptime = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "Not available";
    }

    const totalSeconds = Math.floor(seconds);

    const days = Math.floor(
      totalSeconds / 86400
    );

    const hours = Math.floor(
      (totalSeconds % 86400) / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (
      bytes === null ||
      bytes === undefined ||
      bytes <= 0
    ) {
      return "—";
    }

    const units = [
      "B",
      "KB",
      "MB",
      "GB",
      "TB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    );

    const safeIndex = Math.min(
      index,
      units.length - 1
    );

    return `${(
      bytes /
      Math.pow(1024, safeIndex)
    ).toFixed(1)} ${units[safeIndex]}`;
  };

  // ------------------------------------------------------------
  // SERVICE DATA
  // ------------------------------------------------------------

  const services = useMemo(() => {
    if (!health) {
      return [];
    }

    return [
      {
        key: "api",
        name: "API Server",
        description:
          "Node.js / Express API",
        status:
          health?.server?.status ||
          "unknown",
        responseTime: null,
      },

      {
        key: "database",
        name: "MongoDB",
        description:
          "Application database",
        status:
          health?.database?.status ||
          "unknown",
        responseTime:
          health?.database?.latency ??
          null,
      },

      {
        key: "authentication",
        name: "Authentication",
        description:
          "JWT authentication service",
        status:
          health?.authentication?.status ||
          "unknown",
        responseTime: null,
      },

      {
        key: "frontend",
        name: "Frontend",
        description:
          "React application",
        status: "healthy",
        responseTime: null,
      },
    ];
  }, [health]);

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------

  const summary = useMemo(() => {
    const findService = (key) =>
      services.find(
        (service) =>
          service.key === key
      );

    return {
      api: findService("api"),
      database: findService("database"),
      authentication:
        findService("authentication"),
    };
  }, [services]);

  // ------------------------------------------------------------
  // SECURITY DATA
  // ------------------------------------------------------------

  const security = useMemo(() => {
    return {
      authentication:
        health?.authentication?.status ||
        "unknown",

      rateLimiting:
        health?.rateLimiting?.status ||
        "unknown",

      failedLogins: null,

      suspiciousEvents: null,
    };
  }, [health]);

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------

  if (loading) {
    return <SystemHealthSkeleton />;
  }

  // ------------------------------------------------------------
  // ERROR
  // ------------------------------------------------------------

  if (error && !health) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SystemHealthError
            message={error}
            onRetry={() =>
              loadHealth({
                initial: true,
              })
            }
          />
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // MAIN PAGE
  // ------------------------------------------------------------

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <SystemHealthHeader
          onRefresh={() =>
            loadHealth({
              initial: false,
            })
          }
          refreshing={refreshing}
        />

        {/* ====================================================
            OVERALL STATUS
        ==================================================== */}

        <SystemHealthOverview
          status={
            health?.status ||
            "unknown"
          }
          lastChecked={formatDateTime(
            health?.checkedAt
          )}
        />

        {/* ====================================================
            TOP STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SystemHealthStatCard
            title="API Server"
            value={
              summary.api?.status ===
              "healthy"
                ? "Healthy"
                : "Unavailable"
            }
            description={
              health?.server?.nodeVersion
                ? `Node ${health.server.nodeVersion.replace(
                    "v",
                    ""
                  )}`
                : "Node.js / Express"
            }
            icon={Server}
            iconClass="bg-sky-50 text-sky-600"
            status={
              summary.api?.status ===
              "healthy"
                ? "healthy"
                : "critical"
            }
          />

          <SystemHealthStatCard
            title="Database"
            value={
              summary.database?.status ===
              "healthy"
                ? "Connected"
                : "Unavailable"
            }
            description={
              health?.database?.latency != null
                ? `${health.database.latency} ms latency`
                : "MongoDB"
            }
            icon={Database}
            iconClass="bg-emerald-50 text-emerald-600"
            status={
              summary.database?.status ===
              "healthy"
                ? "healthy"
                : "critical"
            }
          />

          <SystemHealthStatCard
            title="Authentication"
            value={
              summary.authentication
                ?.status === "healthy"
                ? "Healthy"
                : "Unavailable"
            }
            description="JWT authentication"
            icon={KeyRound}
            iconClass="bg-violet-50 text-violet-600"
            status={
              summary.authentication
                ?.status === "healthy"
                ? "healthy"
                : "critical"
            }
          />

          <SystemHealthStatCard
            title="Server Uptime"
            value={formatUptime(
              health?.server?.uptime
            )}
            description={
              health?.server?.environment
                ? `${health.server.environment} environment`
                : "Application uptime"
            }
            icon={Activity}
            iconClass="bg-amber-50 text-amber-600"
            status="neutral"
          />

        </div>

        {/* ====================================================
            SERVICE + DATABASE
        ==================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">

          <SystemHealthServices
            services={services}
          />

          <SystemHealthDatabase
            database={{
              status:
                health?.database?.status ||
                "unknown",

              latency:
                health?.database?.latency ??
                null,

              collections: null,

              size: null,
            }}
          />

        </div>

        {/* ====================================================
            SECURITY + SERVER INFORMATION
        ==================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <SystemHealthSecurity
            security={security}
          />

          {/* Server Information */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Server size={16} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Server Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Runtime information from the API server.
                  </p>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-slate-100">

              <ServerMetric
                label="Node Version"
                value={
                  health?.server?.nodeVersion ||
                  "—"
                }
              />

              <ServerMetric
                label="Environment"
                value={
                  health?.server?.environment ||
                  "—"
                }
              />

              <ServerMetric
                label="Process Uptime"
                value={formatUptime(
                  health?.server?.uptime
                )}
              />

              <ServerMetric
                label="Memory Used"
                value={formatBytes(
                  health?.server?.memory
                    ?.heapUsed
                )}
              />

            </div>
          </section>

        </div>

        {/* ====================================================
            SYSTEM EVENTS
        ==================================================== */}

        <SystemHealthEvents
          events={[]}
        />

        {/* ====================================================
            ERROR AFTER SUCCESSFUL LOAD
        ==================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

const ServerMetric = ({
  label,
  value,
}) => (
  <div className="bg-white p-4 sm:p-5">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-sm font-bold text-slate-800">
      {value}
    </p>
  </div>
);

export default AdminSystemHealth;