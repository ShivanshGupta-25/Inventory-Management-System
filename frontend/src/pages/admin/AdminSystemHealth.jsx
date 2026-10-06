import {
  Activity,
  AlertTriangle,
  Database,
  KeyRound,
  Pause,
  Play,
  RefreshCw,
  Server,
  WifiOff,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getAdminSystemHealth } from "../../services/adminService";

import SystemHealthOverview from "../../components/admin/systemHealth/SystemHealthOverview";
import SystemHealthStatCard from "../../components/admin/systemHealth/SystemHealthStatCard";
import SystemHealthServices from "../../components/admin/systemHealth/SystemHealthServices";
import SystemHealthDatabase from "../../components/admin/systemHealth/SystemHealthDatabase";
import SystemHealthSecurity from "../../components/admin/systemHealth/SystemHealthSecurity";
import SystemHealthEvents from "../../components/admin/systemHealth/SystemHealthEvents";
import SystemHealthSkeleton from "../../components/admin/systemHealth/SystemHealthSkeleton";
import SystemHealthError from "../../components/admin/systemHealth/SystemHealthError";
import SystemHealthInfrastructure from "../../components/admin/systemHealth/SystemHealthInfrastructure";

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const REFRESH_OPTIONS = [
  { label: "0.5 seconds", value: 500 },
  { label: "1 seconds", value: 1000 },
  { label: "5 seconds", value: 5000 },
  { label: "10 seconds", value: 10000 },
  { label: "1 minute", value: 60000 },
];

const DEFAULT_REFRESH_INTERVAL = 1000;
const HISTORY_LIMIT = 30;
const MAX_BACKOFF_MULTIPLIER = 8;
const STORAGE_KEY = "adminSystemHealth:prefs";

// ------------------------------------------------------------
// PURE HELPERS
// ------------------------------------------------------------

const formatDateTime = (value) => {
  if (!value) return "Not available";

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
  if (seconds === null || seconds === undefined) {
    return "Not available";
  }

  const totalSeconds = Math.floor(seconds);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
};

const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined || bytes <= 0) {
    return "—";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.max(
    0,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );

  const safeIndex = Math.min(index, units.length - 1);

  return `${(
    bytes / Math.pow(1024, safeIndex)
  ).toFixed(1)} ${units[safeIndex]}`;
};

const formatRelative = (date) => {
  if (!date) return "never";

  const seconds = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m ago`;

  return `${Math.floor(minutes / 60)}h ago`;
};

const readPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writePrefs = (prefs) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(prefs)
    );
  } catch {
    // Storage can be unavailable.
    // Preferences are optional.
  }
};

const average = (values) =>
  values.length
    ? Math.round(
        values.reduce((sum, v) => sum + v, 0) /
          values.length
      )
    : null;

// ------------------------------------------------------------
// PAGE
// ------------------------------------------------------------

const AdminSystemHealth = () => {
  const initialPrefs = useMemo(readPrefs, []);

  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [autoRefresh, setAutoRefresh] = useState(
    initialPrefs.autoRefresh ?? true
  );

  const [refreshInterval, setRefreshInterval] = useState(
    initialPrefs.refreshInterval ??
      DEFAULT_REFRESH_INTERVAL
  );

  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiLatency, setApiLatency] = useState(null);
  const [history, setHistory] = useState([]);
  const [failures, setFailures] = useState(0);

  const mountedRef = useRef(false);
  const inFlightRef = useRef(false);
  const failuresRef = useRef(0);

  // ------------------------------------------------------------
  // LOAD SYSTEM HEALTH
  // ------------------------------------------------------------

  const loadHealth = useCallback(
    async ({ initial = false, silent = false } = {}) => {
      // One request at a time, whether it comes from
      // the timer or a click.
      if (inFlightRef.current) return;

      inFlightRef.current = true;

      if (initial) {
        setLoading(true);
      } else if (!silent) {
        setRefreshing(true);
      }

      const startedAt = performance.now();

      try {
        const response = await getAdminSystemHealth();

        const healthData =
          response?.health ||
          response?.data?.health ||
          response?.data ||
          response;

        if (!mountedRef.current) return;

        const roundTrip = Math.round(
          performance.now() - startedAt
        );

        failuresRef.current = 0;

        setFailures(0);
        setError("");

        setHealth(healthData || null);
        setLastUpdated(new Date());
        setApiLatency(roundTrip);

        setHistory((previous) =>
          [
            ...previous,
            {
              time: Date.now(),
              api: roundTrip,
              db:
                healthData?.database?.latency ??
                null,
            },
          ].slice(-HISTORY_LIMIT)
        );
      } catch (err) {
        console.error(
          "Failed to load system health:",
          err
        );

        if (!mountedRef.current) return;

        failuresRef.current += 1;

        setFailures(failuresRef.current);

        setError(
          err?.message ||
            "Unable to retrieve system health."
        );
      } finally {
        inFlightRef.current = false;

        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  // ------------------------------------------------------------
  // INITIAL LOAD + MOUNT TRACKING
  // ------------------------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    loadHealth({ initial: true });

    return () => {
      mountedRef.current = false;
    };
  }, [loadHealth]);

  // ------------------------------------------------------------
  // AUTO REFRESH
  //
  // - user-selectable interval
  // - skips requests while tab is hidden
  // - refreshes on return
  // - backs off when API keeps failing
  // ------------------------------------------------------------

  useEffect(() => {
    if (!autoRefresh) return undefined;

    let timer = null;
    let cancelled = false;

    const schedule = () => {
      const backoff = Math.min(
        2 ** failuresRef.current,
        MAX_BACKOFF_MULTIPLIER
      );

      timer = setTimeout(
        tick,
        refreshInterval * backoff
      );
    };

    const tick = async () => {
      if (cancelled) return;

      if (!document.hidden) {
        await loadHealth({ silent: true });
      }

      if (!cancelled) {
        schedule();
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && !cancelled) {
        clearTimeout(timer);
        tick();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    schedule();

    return () => {
      cancelled = true;

      clearTimeout(timer);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    autoRefresh,
    refreshInterval,
    loadHealth,
  ]);

  // ------------------------------------------------------------
  // PERSIST PREFERENCES
  // ------------------------------------------------------------

  useEffect(() => {
    writePrefs({
      autoRefresh,
      refreshInterval,
    });
  }, [autoRefresh, refreshInterval]);

  // ------------------------------------------------------------
  // SERVICE DATA
  // ------------------------------------------------------------

  const services = useMemo(() => {
    if (!health) return [];

    return [
      {
        key: "api",
        name: "API Server",
        description: "Node.js / Express API",
        status:
          health?.server?.status || "unknown",
        responseTime: apiLatency,
      },
      {
        key: "database",
        name: "MongoDB",
        description: "Application database",
        status:
          health?.database?.status || "unknown",
        responseTime:
          health?.database?.latency ?? null,
      },
      {
        key: "authentication",
        name: "Authentication",
        description: "JWT authentication service",
        status:
          health?.authentication?.status ||
          "unknown",
        responseTime: null,
      },
      {
        key: "frontend",
        name: "Frontend",
        description: "React application",
        status: "healthy",
        responseTime: null,
      },
    ];
  }, [health, apiLatency]);

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------

  const summary = useMemo(() => {
    const find = (key) =>
      services.find(
        (service) => service.key === key
      );

    return {
      api: find("api"),
      database: find("database"),
      authentication: find("authentication"),
    };
  }, [services]);

  // ------------------------------------------------------------
  // SECURITY DATA
  // ------------------------------------------------------------

  const security = useMemo(
    () => ({
      authentication:
        health?.authentication?.status ||
        "unknown",

      authenticationSecretConfigured: Boolean(
        health?.authentication?.secretConfigured
      ),

      rateLimiting:
        health?.rateLimiting?.status ||
        "unknown",

      failedLogins:
        health?.security?.failedLogins ?? null,

      suspiciousEvents:
        health?.security?.suspiciousEvents ??
        null,

      status:
        health?.security?.status || "unknown",

      recentEvents:
        health?.security?.recentEvents || [],
    }),
    [health]
  );

  // ------------------------------------------------------------
  // MEMORY
  // ------------------------------------------------------------

  const memory = useMemo(() => {
    const used =
      health?.server?.memory?.heapUsed ?? null;

    const total =
      health?.server?.memory?.heapTotal ?? null;

    const rss =
      health?.server?.memory?.rss ?? null;

    const percent =
      used != null &&
      total != null &&
      total > 0
        ? Math.min(
            100,
            Math.round((used / total) * 100)
          )
        : null;

    return {
      used,
      total,
      rss,
      percent,
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
              loadHealth({ initial: true })
            }
          />
        </div>
      </div>
    );
  }

  const isStale =
    failures > 0 && Boolean(health);

  // ------------------------------------------------------------
  // MAIN PAGE
  // ------------------------------------------------------------

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ----------------------------------------------------
            CONNECTION STATUS
        ---------------------------------------------------- */}

        {isStale && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
          >
            <WifiOff
              size={16}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Can't reach the API. Showing data from{" "}
                {formatRelative(lastUpdated)}.
              </p>

              <p className="mt-1">
                {failures} failed{" "}
                {failures === 1
                  ? "attempt"
                  : "attempts"}{" "}
                in a row.

                {autoRefresh
                  ? " Retries are spaced further apart until the connection returns."
                  : " Select Refresh to try again."}
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            REFRESH CONTROLS
        ---------------------------------------------------- */}

        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">

          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() =>
              setAutoRefresh((value) => !value)
            }
            aria-pressed={autoRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {autoRefresh ? (
              <Pause size={14} />
            ) : (
              <Play size={14} />
            )}

            {autoRefresh
              ? "Pause auto-refresh"
              : "Resume auto-refresh"}
          </button>

          {/* Refresh interval */}
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Refresh every

            <select
              value={refreshInterval}
              onChange={(event) =>
                setRefreshInterval(
                  Number(event.target.value)
                )
              }
              disabled={!autoRefresh}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              {REFRESH_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {/* Last updated + Refresh */}
          <div className="ml-auto flex items-center gap-4">
            <LastUpdated
              date={lastUpdated}
              paused={!autoRefresh}
            />

            {/* Refresh replaces Download Snapshot */}
            <button
              type="button"
              onClick={() =>
                loadHealth({ initial: false })
              }
              disabled={refreshing}
              aria-busy={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin motion-reduce:animate-none"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing…"
                : "Refresh"}
            </button>
          </div>
        </section>

        {/* ----------------------------------------------------
            SYSTEM OVERVIEW
        ---------------------------------------------------- */}

        <SystemHealthOverview
          status={health?.status || "unknown"}
          lastChecked={formatDateTime(
            health?.checkedAt
          )}
        />

        {/* ----------------------------------------------------
            TOP STATISTICS
        ---------------------------------------------------- */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SystemHealthStatCard
            title="API Server"
            value={
              summary.api?.status === "healthy"
                ? "Healthy"
                : "Unavailable"
            }
            description={
              health?.server?.nodeVersion
                ? `Node ${health.server.nodeVersion.replace(
                    "v",
                    ""
                  )}${
                    apiLatency != null
                      ? ` · ${apiLatency} ms`
                      : ""
                  }`
                : "Node.js / Express"
            }
            icon={Server}
            iconClass="bg-sky-50 text-sky-600"
            status={
              summary.api?.status === "healthy"
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
              summary.authentication?.status ===
              "healthy"
                ? "Healthy"
                : "Unavailable"
            }
            description="JWT authentication"
            icon={KeyRound}
            iconClass="bg-violet-50 text-violet-600"
            status={
              summary.authentication?.status ===
              "healthy"
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

        {/* ----------------------------------------------------
            RESPONSE TIME TREND
        ---------------------------------------------------- */}

        <ResponseTrend history={history} />

        {/* ----------------------------------------------------
            SERVICES + DATABASE
        ---------------------------------------------------- */}

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

              state:
                health?.database?.state ?? null,

              databaseName:
                health?.database?.databaseName ||
                null,

              collections:
                health?.database?.collections ??
                null,

              dataSize:
                health?.database?.dataSize ??
                null,

              storageSize:
                health?.database?.storageSize ??
                null,
            }}
          />

        </div>

        {/* ----------------------------------------------------
            INFRASTRUCTURE
        ---------------------------------------------------- */}

        <SystemHealthInfrastructure
          server={health?.server}
        />

        {/* ----------------------------------------------------
            SECURITY + SERVER INFORMATION
        ---------------------------------------------------- */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <SystemHealthSecurity
            security={security}
          />

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
                label="Heap Used"
                value={formatBytes(
                  memory.used
                )}
              />

              <ServerMetric
                label="Heap Total"
                value={formatBytes(
                  memory.total
                )}
              />

              <ServerMetric
                label="Resident Memory"
                value={formatBytes(
                  memory.rss
                )}
              />

            </div>

            {memory.percent != null && (
              <div className="border-t border-slate-100 px-5 py-4 sm:px-6">

                <div className="flex items-center justify-between text-xs">

                  <span className="font-medium text-slate-600">
                    Heap usage
                  </span>

                  <span className="font-bold text-slate-800">
                    {memory.percent}%
                  </span>

                </div>

                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={memory.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Heap usage"
                >
                  <div
                    className={`h-full rounded-full transition-all ${
                      memory.percent >= 90
                        ? "bg-red-500"
                        : memory.percent >= 75
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{
                      width: `${memory.percent}%`,
                    }}
                  />
                </div>

                {memory.percent >= 75 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">

                    <AlertTriangle size={12} />

                    Heap usage is high. Watch for a memory leak if it keeps climbing.

                  </p>
                )}

              </div>
            )}

          </section>

        </div>

        {/* ----------------------------------------------------
            SECURITY EVENTS
        ---------------------------------------------------- */}

        <SystemHealthEvents
          events={security.recentEvents}
        />

      </div>
    </div>
  );
};

// ------------------------------------------------------------
// SMALL COMPONENTS
// ------------------------------------------------------------

const ServerMetric = ({ label, value }) => (
  <div className="bg-white p-4 sm:p-5">

    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-sm font-bold text-slate-800">
      {value}
    </p>

  </div>
);

// ------------------------------------------------------------
// LAST UPDATED
// ------------------------------------------------------------

// Ticks on its own so the whole page doesn't
// re-render every second.
const LastUpdated = ({ date, paused }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () =>
        setTick((value) => value + 1),
      1000
    );

    return () => clearInterval(id);
  }, []);

  return (
    <p
      className="text-xs text-slate-500"
      aria-live="off"
    >
      Updated{" "}
      <span className="font-semibold text-slate-700">
        {formatRelative(date)}
      </span>

      {paused && (
        <span className="ml-2 text-amber-600">
          Auto-refresh paused
        </span>
      )}
    </p>
  );
};

// ------------------------------------------------------------
// SPARKLINE
// ------------------------------------------------------------

const Sparkline = ({
  values,
  stroke,
}) => {
  const points = values.filter(
    (v) => v != null
  );

  if (points.length < 2) {
    return (
      <div className="flex h-12 items-center text-xs text-slate-400">
        Collecting data…
      </div>
    );
  }

  const width = 240;
  const height = 48;
  const pad = 3;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const path = points
    .map((value, index) => {
      const x =
        pad +
        (index / (points.length - 1)) *
          (width - pad * 2);

      const y =
        height -
        pad -
        ((value - min) / range) *
          (height - pad * 2);

      return `${
        index === 0 ? "M" : "L"
      }${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// ------------------------------------------------------------
// TREND PANEL
// ------------------------------------------------------------

const TrendPanel = ({
  title,
  values,
  stroke,
}) => {
  const points = values.filter(
    (v) => v != null
  );

  const latest = points.length
    ? points[points.length - 1]
    : null;

  return (
    <div className="p-4 sm:p-5">

      <div className="flex items-baseline justify-between">

        <p className="text-xs font-semibold text-slate-600">
          {title}
        </p>

        <p className="text-sm font-bold text-slate-900">
          {latest != null
            ? `${latest} ms`
            : "—"}
        </p>

      </div>

      <Sparkline
        values={values}
        stroke={stroke}
      />

      <div className="mt-1 flex justify-between text-[11px] text-slate-500">

        <span>
          Avg{" "}
          {points.length
            ? `${average(points)} ms`
            : "—"}
        </span>

        <span>
          Peak{" "}
          {points.length
            ? `${Math.max(...points)} ms`
            : "—"}
        </span>

      </div>

    </div>
  );
};

// ------------------------------------------------------------
// RESPONSE TREND
// ------------------------------------------------------------

const ResponseTrend = ({
  history,
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">

      <h2 className="text-sm font-bold text-slate-900">
        Response time
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Last {HISTORY_LIMIT} checks from this browser session.
      </p>

    </div>

    <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

      <TrendPanel
        title="API round trip"
        values={history.map(
          (h) => h.api
        )}
        stroke="#0284c7"
      />

      <TrendPanel
        title="Database latency"
        values={history.map(
          (h) => h.db
        )}
        stroke="#059669"
      />

    </div>

  </section>
);

export default AdminSystemHealth;