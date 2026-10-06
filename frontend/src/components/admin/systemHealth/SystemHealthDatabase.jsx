import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  HardDrive,
  Layers3,
  Network,
  Server,
} from "lucide-react";

import { normalizeStatus } from "./SystemHealthOverview";

// ------------------------------------------------------------
// HELPERS (defined once, outside the component)
// ------------------------------------------------------------

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const formatBytes = (bytes) => {
  if (!isNumber(bytes) || bytes <= 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

const formatNumber = (value) =>
  isNumber(value) ? value.toLocaleString("en-IN") : "—";

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  warning: {
    label: "Needs attention",
    icon: Clock3,
    badge: "border-amber-100 bg-amber-50 text-amber-700",
  },
  critical: {
    label: "Unavailable",
    icon: Server,
    badge: "border-red-100 bg-red-50 text-red-700",
  },
  unknown: {
    label: "Unknown",
    icon: Database,
    badge: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

// Mongoose readyState numbers, plus the string forms some APIs send.
const CONNECTION_STATES = {
  0: { label: "Disconnected", dot: "bg-red-500", ok: false },
  1: { label: "Connected", dot: "bg-emerald-500", ok: true },
  2: { label: "Connecting", dot: "bg-amber-500", ok: false },
  3: { label: "Disconnecting", dot: "bg-amber-500", ok: false },
};

const STATE_ALIASES = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
};

const getConnectionState = (state) => {
  const key =
    typeof state === "string" ? STATE_ALIASES[state.trim().toLowerCase()] : state;

  return (
    CONNECTION_STATES[key] || {
      label: "Unknown",
      dot: "bg-slate-400",
      ok: null,
    }
  );
};

// Rates ping latency so a number like "180 ms" carries meaning.
const getLatencyRating = (latency) => {
  if (!isNumber(latency)) return null;
  if (latency < 50) return { label: "Fast", text: "text-emerald-600" };
  if (latency < 200) return { label: "Moderate", text: "text-amber-600" };
  return { label: "Slow", text: "text-red-600" };
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

/**
 * database: {
 *   status, latency, state, databaseName, collections, dataSize, storageSize,
 *   // optional extras, shown only when the backend sends them:
 *   indexSize, documents, connections: { current, available }
 * }
 */
const SystemHealthDatabase = ({ database }) => {
  const status = normalizeStatus(database?.status);
  const latency = database?.latency ?? null;
  const databaseName = database?.databaseName || null;
  const collections = database?.collections ?? null;
  const dataSize = database?.dataSize ?? null;
  const storageSize = database?.storageSize ?? null;
  const indexSize = database?.indexSize ?? null;
  const documents = database?.documents ?? null;
  const connections = database?.connections ?? null;

  const connection = getConnectionState(database?.state);
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const latencyRating = getLatencyRating(latency);

  const disconnected = status === "critical" || connection.ok === false;

  const storageUsage =
    isNumber(dataSize) && isNumber(storageSize) && storageSize > 0
      ? Math.min(100, Math.round((dataSize / storageSize) * 100))
      : null;

  const hasConnections =
    isNumber(connections?.current) && isNumber(connections?.available);

  const connectionUsage = hasConnections
    ? Math.min(
        100,
        Math.round(
          (connections.current / (connections.current + connections.available)) *
            100
        )
      )
    : null;

  const hasExtras =
    isNumber(indexSize) || isNumber(documents) || hasConnections;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Database size={17} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Database health
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                MongoDB connection and storage information.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusConfig.badge}`}
          >
            <StatusIcon size={11} aria-hidden="true" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Outage notice */}
      {disconnected && (
        <div
          role="alert"
          className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-5 py-3 text-xs text-red-700 sm:px-6"
        >
          <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            The API can't reach MongoDB right now. Check that the database
            service is running and that the connection string is correct.
          </p>
        </div>
      )}

      {/* Primary metrics */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 xl:grid-cols-4">
        <DatabaseMetric
          icon={Clock3}
          iconClass="bg-sky-50 text-sky-600"
          label="Ping latency"
          value={isNumber(latency) ? `${latency} ms` : "—"}
          hint={latencyRating?.label}
          hintClass={latencyRating?.text}
        />

        <DatabaseMetric
          icon={Layers3}
          iconClass="bg-violet-50 text-violet-600"
          label="Collections"
          value={formatNumber(collections)}
        />

        <DatabaseMetric
          icon={HardDrive}
          iconClass="bg-amber-50 text-amber-600"
          label="Data size"
          value={formatBytes(dataSize)}
        />

        <DatabaseMetric
          icon={Database}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Storage size"
          value={formatBytes(storageSize)}
        />
      </div>

      {/* Storage usage */}
      {storageUsage !== null && (
        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <UsageBar
            label="Data as share of allocated storage"
            percent={storageUsage}
            barClass="bg-sky-500"
          />
        </div>
      )}

      {/* Optional extras */}
      {hasExtras && (
        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 px-5 py-5 sm:grid-cols-3 sm:px-6">
          {isNumber(documents) && (
            <InfoItem
              icon={FileText}
              label="Documents"
              value={formatNumber(documents)}
            />
          )}

          {isNumber(indexSize) && (
            <InfoItem
              icon={Layers3}
              label="Index size"
              value={formatBytes(indexSize)}
            />
          )}

          {hasConnections && (
            <InfoItem
              icon={Network}
              label="Open connections"
              value={`${formatNumber(connections.current)} of ${formatNumber(
                connections.current + connections.available
              )}`}
              footer={
                <UsageBar
                  label="Connection pool in use"
                  percent={connectionUsage}
                  barClass={
                    connectionUsage >= 90
                      ? "bg-red-500"
                      : connectionUsage >= 75
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }
                  compact
                />
              }
            />
          )}
        </div>
      )}

      {/* Connection information */}
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <Database size={15} className="text-slate-500" aria-hidden="true" />
          <h3 className="text-xs font-bold text-slate-800">
            Connection information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoItem label="Database" value={databaseName || "—"} />

          <InfoItem
            label="Connection state"
            value={
              <span className="inline-flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${connection.dot}`}
                  aria-hidden="true"
                />
                {connection.label}
              </span>
            }
          />

          <InfoItem label="Health status" value={STATUS_CONFIG[status].label} />
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------
// SMALL COMPONENTS
// ------------------------------------------------------------

const DatabaseMetric = ({
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
  hintClass = "text-slate-500",
}) => (
  <div className="bg-white p-4 sm:p-5">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
    >
      <Icon size={16} aria-hidden="true" />
    </div>

    <p className="mt-4 text-xs font-semibold text-slate-400">{label}</p>

    <div className="mt-1 flex items-baseline gap-2">
      <p className="text-lg font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <span className={`text-xs font-semibold ${hintClass}`}>{hint}</span>}
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, footer }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label}
    </p>

    <p className="mt-1 text-xs font-bold text-slate-800">{value}</p>

    {footer && <div className="mt-2">{footer}</div>}
  </div>
);

const UsageBar = ({ label, percent, barClass, compact = false }) => (
  <div>
    {!compact && (
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{percent}%</span>
      </div>
    )}

    <div
      className={`overflow-hidden rounded-full bg-slate-100 ${
        compact ? "h-1.5" : "mt-2 h-2"
      }`}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-all ${barClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

export default SystemHealthDatabase;