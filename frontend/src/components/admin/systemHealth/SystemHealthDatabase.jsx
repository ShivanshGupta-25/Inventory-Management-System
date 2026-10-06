import {
  CheckCircle2,
  Database,
  HardDrive,
  Layers3,
  Clock3,
  Server,
} from "lucide-react";

const SystemHealthDatabase = ({
  database,
}) => {
  const status =
    database?.status || "unknown";

  const latency =
    database?.latency ?? null;

  const state =
    database?.state ?? null;

  const databaseName =
    database?.databaseName || null;

  const collections =
    database?.collections ?? null;

  const dataSize =
    database?.dataSize ?? null;

  const storageSize =
    database?.storageSize ?? null;

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

    const index = Math.min(
      Math.floor(
        Math.log(bytes) /
          Math.log(1024)
      ),
      units.length - 1
    );

    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(1)} ${units[index]}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case "healthy":
        return {
          label: "Healthy",
          icon: CheckCircle2,
          badge:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
          iconContainer:
            "bg-emerald-100 text-emerald-600",
        };

      case "warning":
        return {
          label: "Attention Required",
          icon: Clock3,
          badge:
            "border-amber-100 bg-amber-50 text-amber-700",
          iconContainer:
            "bg-amber-100 text-amber-600",
        };

      case "critical":
        return {
          label: "Unavailable",
          icon: Server,
          badge:
            "border-red-100 bg-red-50 text-red-700",
          iconContainer:
            "bg-red-100 text-red-600",
        };

      default:
        return {
          label: "Unknown",
          icon: Database,
          badge:
            "border-slate-200 bg-slate-50 text-slate-600",
          iconContainer:
            "bg-slate-100 text-slate-500",
        };
    }
  };

  const statusConfig =
    getStatusConfig();

  const StatusIcon =
    statusConfig.icon;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ================================================================
          HEADER
      ================================================================ */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Database size={17} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Database Health
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                MongoDB connection and storage information.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusConfig.badge}`}
          >
            <StatusIcon size={11} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* ================================================================
          PRIMARY METRICS
      ================================================================ */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 xl:grid-cols-4">
        <DatabaseMetric
          icon={Clock3}
          iconClass="bg-sky-50 text-sky-600"
          label="Ping Latency"
          value={
            latency !== null
              ? `${latency} ms`
              : "—"
          }
        />

        <DatabaseMetric
          icon={Layers3}
          iconClass="bg-violet-50 text-violet-600"
          label="Collections"
          value={
            collections !== null
              ? collections.toLocaleString()
              : "—"
          }
        />

        <DatabaseMetric
          icon={HardDrive}
          iconClass="bg-amber-50 text-amber-600"
          label="Data Size"
          value={formatBytes(dataSize)}
        />

        <DatabaseMetric
          icon={Database}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Storage Size"
          value={formatBytes(storageSize)}
        />
      </div>

      {/* ================================================================
          CONNECTION INFORMATION
      ================================================================ */}
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <Database
            size={15}
            className="text-slate-500"
          />

          <h3 className="text-xs font-bold text-slate-800">
            Connection Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoItem
            label="Database"
            value={databaseName || "—"}
          />

          <InfoItem
            label="Connection State"
            value={formatConnectionState(state)}
          />

          <InfoItem
            label="Health Status"
            value={statusLabel(status)}
          />
        </div>
      </div>
    </section>
  );
};

const DatabaseMetric = ({
  icon: Icon,
  iconClass,
  label,
  value,
}) => (
  <div className="bg-white p-4 sm:p-5">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
    >
      <Icon size={16} />
    </div>

    <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
      {value}
    </p>
  </div>
);

const InfoItem = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xs font-bold text-slate-800">
      {value}
    </p>
  </div>
);

const formatConnectionState = (
  state
) => {
  const states = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  return (
    states[state] ||
    "Unknown"
  );
};

const statusLabel = (status) => {
  const labels = {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    unknown: "Unknown",
  };

  return (
    labels[status] ||
    "Unknown"
  );
};

export default SystemHealthDatabase;