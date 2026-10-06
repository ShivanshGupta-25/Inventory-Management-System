import {
  Activity,
  AlertTriangle,
  Cpu,
  HardDrive,
  MemoryStick,
  Server,
} from "lucide-react";

import { normalizeStatus } from "./SystemHealthOverview";

// ------------------------------------------------------------
// CONFIG + HELPERS (defined once, outside the component)
// ------------------------------------------------------------

const MEMORY_WARNING = 75;
const MEMORY_CRITICAL = 90;
const LOAD_WARNING = 1; // load per core
const LOAD_CRITICAL = 1.5;

const isNumber = (value) =>
  value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));

const formatBytes = (bytes) => {
  if (!isNumber(bytes) || Number(bytes) <= 0) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

const formatPercentage = (value) =>
  isNumber(value) ? `${Number(value).toFixed(1)}%` : "—";

const formatLoad = (value) => (isNumber(value) ? Number(value).toFixed(2) : "—");

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    container: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Needs attention",
    container: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  critical: {
    label: "Critical",
    container: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
  unknown: {
    label: "Unknown",
    container: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

const memoryBarClass = (percent) =>
  percent >= MEMORY_CRITICAL
    ? "bg-red-500"
    : percent >= MEMORY_WARNING
    ? "bg-amber-500"
    : "bg-emerald-500";

const loadRating = (perCore) => {
  if (perCore === null) return null;
  if (perCore >= LOAD_CRITICAL)
    return { label: "Overloaded", text: "text-red-600", bar: "bg-red-500" };
  if (perCore >= LOAD_WARNING)
    return { label: "Busy", text: "text-amber-600", bar: "bg-amber-500" };
  return { label: "Normal", text: "text-emerald-600", bar: "bg-emerald-500" };
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

const SystemHealthInfrastructure = ({ server }) => {
  const resources = server?.resources;
  const memory = resources?.memory;
  const cpu = resources?.cpu;
  const processMemory = server?.memory;

  const isWindows = server?.platform === "win32";
  const loadAverage = Array.isArray(cpu?.loadAverage) ? cpu.loadAverage : [];
  const cores = isNumber(cpu?.cores) && Number(cpu.cores) > 0 ? Number(cpu.cores) : null;

  // System memory percent: trust the backend, otherwise work it out.
  const memoryPercent = isNumber(memory?.percentage)
    ? Number(memory.percentage)
    : isNumber(memory?.used) && isNumber(memory?.total) && Number(memory.total) > 0
    ? (Number(memory.used) / Number(memory.total)) * 100
    : null;

  // Load per core (5-minute average): >= 1 means more work than cores.
  const loadPerCore =
    !isWindows && cores && isNumber(loadAverage[1])
      ? Number(loadAverage[1]) / cores
      : null;

  const rating = loadRating(loadPerCore);

  const heapPercent =
    isNumber(processMemory?.heapUsed) &&
    isNumber(processMemory?.heapTotal) &&
    Number(processMemory.heapTotal) > 0
      ? Math.min(
          100,
          Math.round((processMemory.heapUsed / processMemory.heapTotal) * 100)
        )
      : null;

  // Use the backend's verdict; if it has none, derive one from the numbers.
  let status = normalizeStatus(resources?.status);

  if (status === "unknown" && (memoryPercent !== null || loadPerCore !== null)) {
    if (memoryPercent >= MEMORY_CRITICAL || loadPerCore >= LOAD_CRITICAL) {
      status = "critical";
    } else if (memoryPercent >= MEMORY_WARNING || loadPerCore >= LOAD_WARNING) {
      status = "warning";
    } else {
      status = "healthy";
    }
  }

  const statusConfig = STATUS_CONFIG[status];

  const advisories = [];

  if (memoryPercent !== null && memoryPercent >= MEMORY_CRITICAL) {
    advisories.push(
      "System memory is almost full. Free up memory or add capacity before the server starts swapping or crashing."
    );
  } else if (memoryPercent !== null && memoryPercent >= MEMORY_WARNING) {
    advisories.push("System memory use is high. Keep an eye on it if it keeps climbing.");
  }

  if (loadPerCore !== null && loadPerCore >= LOAD_WARNING) {
    advisories.push(
      `CPU load (${formatLoad(loadAverage[1])} over 5 minutes) is above the ${cores} available ${
        cores === 1 ? "core" : "cores"
      }, so requests may be queuing.`
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Activity size={17} aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Infrastructure health
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Monitor server resources and runtime usage.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusConfig.container}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
              aria-hidden="true"
            />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Advisories */}
      {advisories.length > 0 && (
        <div
          role="status"
          className="space-y-1 border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-800 sm:px-6"
        >
          {advisories.map((message) => (
            <p key={message} className="flex items-start gap-2">
              <AlertTriangle
                size={14}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              {message}
            </p>
          ))}
        </div>
      )}

      {/* Resource metrics */}
      <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={MemoryStick}
          iconClass="bg-sky-50 text-sky-600"
          label="System memory"
          value={formatPercentage(memoryPercent)}
          description={
            memory
              ? `${formatBytes(memory.used)} used of ${formatBytes(memory.total)}`
              : "System memory unavailable"
          }
          percent={memoryPercent !== null ? Math.min(100, Math.round(memoryPercent)) : null}
          barClass={memoryPercent !== null ? memoryBarClass(memoryPercent) : ""}
        />

        <MetricCard
          icon={Cpu}
          iconClass="bg-violet-50 text-violet-600"
          label="CPU load"
          value={
            loadPerCore !== null
              ? `${Math.round(loadPerCore * 100)}%`
              : cores ?? "—"
          }
          hint={rating?.label}
          hintClass={rating?.text}
          description={
            loadPerCore !== null
              ? `5-minute load across ${cores} ${cores === 1 ? "core" : "cores"}`
              : isWindows
              ? `${cores ?? "—"} cores. Load average isn't available on Windows.`
              : "Available processor cores"
          }
          percent={loadPerCore !== null ? Math.min(100, Math.round(loadPerCore * 100)) : null}
          barClass={rating?.bar || ""}
        />

        <MetricCard
          icon={Server}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Process memory"
          value={formatBytes(processMemory?.rss)}
          description="Node.js resident memory"
        />

        <MetricCard
          icon={HardDrive}
          iconClass="bg-amber-50 text-amber-600"
          label="Node heap"
          value={formatBytes(processMemory?.heapUsed)}
          description={
            processMemory?.heapTotal
              ? `of ${formatBytes(processMemory.heapTotal)} allocated`
              : "Heap usage unavailable"
          }
          percent={heapPercent}
          barClass="bg-sky-500"
        />
      </div>

      {/* Detailed resource information */}
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 xl:grid-cols-2">
        <DetailPanel icon={MemoryStick} title="Memory details">
          <DetailRow label="Total memory" value={formatBytes(memory?.total)} />
          <DetailRow label="Used memory" value={formatBytes(memory?.used)} />
          <DetailRow label="Free memory" value={formatBytes(memory?.free)} />
          <DetailRow
            label="Utilization"
            value={formatPercentage(memoryPercent)}
            emphasize
          />
        </DetailPanel>

        <DetailPanel icon={Cpu} title="CPU details">
          <DetailRow label="CPU cores" value={cores ?? "—"} />

          {isWindows ? (
            <div className="px-4 py-3 text-xs text-slate-500">
              Windows doesn't report load averages, so only the core count is
              shown.
            </div>
          ) : (
            <>
              <DetailRow label="1 minute load" value={formatLoad(loadAverage[0])} />
              <DetailRow label="5 minute load" value={formatLoad(loadAverage[1])} />
              <DetailRow label="15 minute load" value={formatLoad(loadAverage[2])} />
            </>
          )}
        </DetailPanel>
      </div>

      {/* Runtime information */}
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <Server size={15} className="text-slate-500" aria-hidden="true" />
          <h3 className="text-xs font-bold text-slate-800">
            Runtime information
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <RuntimeItem label="Node version" value={server?.nodeVersion || "—"} />
          <RuntimeItem label="Environment" value={server?.environment || "—"} />
          <RuntimeItem label="Platform" value={server?.platform || "—"} />
          <RuntimeItem label="Architecture" value={server?.architecture || "—"} />
        </div>
      </div>
    </section>
  );
};

// ------------------------------------------------------------
// SMALL COMPONENTS
// ------------------------------------------------------------

const MetricCard = ({
  icon: Icon,
  iconClass,
  label,
  value,
  description,
  hint,
  hintClass = "text-slate-500",
  percent = null,
  barClass = "",
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

    {percent !== null && (
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
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
    )}

    <p className="mt-2 text-[11px] leading-4 text-slate-400">{description}</p>
  </div>
);

const DetailPanel = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl border border-slate-200">
    <div className="border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-slate-500" aria-hidden="true" />
        <h3 className="text-xs font-bold text-slate-800">{title}</h3>
      </div>
    </div>

    <div className="divide-y divide-slate-100">{children}</div>
  </div>
);

const DetailRow = ({ label, value, emphasize = false }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3">
    <span className="text-xs font-medium text-slate-500">{label}</span>

    <span
      className={`text-xs ${
        emphasize ? "font-bold text-slate-900" : "font-semibold text-slate-700"
      }`}
    >
      {value}
    </span>
  </div>
);

const RuntimeItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3">
    <p className="text-[11px] font-semibold text-slate-400">{label}</p>
    <p className="mt-1 break-words text-xs font-bold text-slate-800">{value}</p>
  </div>
);

export default SystemHealthInfrastructure;