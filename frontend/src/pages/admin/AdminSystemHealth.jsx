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

  const loadHealth = useCallback(
    async ({ initial = false } = {}) => {
      try {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        /*
         * Phase 1:
         * UI is ready for the real system-health endpoint.
         *
         * We intentionally don't manufacture CPU, memory,
         * uptime, latency or error-rate values here.
         *
         * Once the backend endpoint exists, this section
         * should call:
         *
         * getSystemHealth()
         */

        const now = new Date();

        setHealth({
          status: "unknown",

          lastChecked: now.toLocaleString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          ),

          services: [
            {
              key: "api",
              name: "API Server",
              description:
                "Node.js / Express API",
              status: "unknown",
              responseTime: null,
            },
            {
              key: "database",
              name: "MongoDB",
              description:
                "Application database",
              status: "unknown",
              responseTime: null,
            },
            {
              key: "authentication",
              name: "Authentication",
              description:
                "JWT authentication service",
              status: "unknown",
              responseTime: null,
            },
            {
              key: "frontend",
              name: "Frontend",
              description:
                "React application",
              status: "unknown",
              responseTime: null,
            },
          ],

          database: {
            status: "unknown",
            latency: null,
            collections: null,
            size: null,
          },

          security: {
            authentication: "unknown",
            rateLimiting: "unknown",
            failedLogins: null,
            suspiciousEvents: null,
          },

          events: [],
        });
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

  useEffect(() => {
    loadHealth({ initial: true });
  }, [loadHealth]);

  const summary = useMemo(() => {
    if (!health?.services) {
      return {
        api: null,
        database: null,
        authentication: null,
        overall: "unknown",
      };
    }

    const findService = (key) =>
      health.services.find(
        (service) => service.key === key
      );

    return {
      api: findService("api"),
      database: findService("database"),
      authentication:
        findService("authentication"),
      overall:
        health.status || "unknown",
    };
  }, [health]);

  if (loading) {
    return <SystemHealthSkeleton />;
  }

  if (error && !health) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SystemHealthError
            message={error}
            onRetry={() =>
              loadHealth({ initial: true })
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <SystemHealthHeader
          onRefresh={() =>
            loadHealth({ initial: false })
          }
          refreshing={refreshing}
        />

        {/* Overall status */}
        <SystemHealthOverview
          status={health?.status || "unknown"}
          lastChecked={health?.lastChecked}
        />

        {/* Top statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SystemHealthStatCard
            title="API Server"
            value={
              summary.api?.status === "healthy"
                ? "Healthy"
                : "Unknown"
            }
            description={
              summary.api?.responseTime != null
                ? `${summary.api.responseTime} ms response`
                : "Monitoring unavailable"
            }
            icon={Server}
            iconClass="bg-sky-50 text-sky-600"
            status={
              summary.api?.status ===
              "healthy"
                ? "healthy"
                : "neutral"
            }
          />

          <SystemHealthStatCard
            title="Database"
            value={
              summary.database?.status ===
              "healthy"
                ? "Connected"
                : "Unknown"
            }
            description={
              health?.database?.latency != null
                ? `${health.database.latency} ms latency`
                : "Monitoring unavailable"
            }
            icon={Database}
            iconClass="bg-emerald-50 text-emerald-600"
            status={
              summary.database?.status ===
              "healthy"
                ? "healthy"
                : "neutral"
            }
          />

          <SystemHealthStatCard
            title="Authentication"
            value={
              summary.authentication?.status ===
              "healthy"
                ? "Healthy"
                : "Unknown"
            }
            description="JWT authentication service"
            icon={KeyRound}
            iconClass="bg-violet-50 text-violet-600"
            status={
              summary.authentication?.status ===
              "healthy"
                ? "healthy"
                : "neutral"
            }
          />

          <SystemHealthStatCard
            title="Frontend"
            value="Available"
            description="React application"
            icon={Globe}
            iconClass="bg-amber-50 text-amber-600"
            status="neutral"
          />
        </div>

        {/* Service + database */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">

          <SystemHealthServices
            services={health?.services || []}
          />

          <SystemHealthDatabase
            database={health?.database}
          />

        </div>

        {/* Security + Events */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <SystemHealthSecurity
            security={health?.security}
          />

          <SystemHealthEvents
            events={health?.events || []}
          />

        </div>

        {/* Monitoring notice */}
        {health?.status === "unknown" && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Activity
                size={17}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  System monitoring is not connected yet
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  The System Health interface is ready.
                  Connect the backend health endpoint to
                  display live API, MongoDB, authentication,
                  infrastructure and security metrics.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSystemHealth;