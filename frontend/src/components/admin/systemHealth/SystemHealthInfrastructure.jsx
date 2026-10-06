import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Server,
} from "lucide-react";

const SystemHealthInfrastructure = ({
  server,
}) => {
  const resources = server?.resources;

  const resourceStatus =
    resources?.status || "unknown";

  const memory = resources?.memory;
  const cpu = resources?.cpu;
  const processMemory = server?.memory;

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
        Math.log(bytes) / Math.log(1024)
      ),
      units.length - 1
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(1)} ${units[index]}`;
  };

  const formatPercentage = (value) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "—";
    }

    return `${Number(value).toFixed(1)}%`;
  };

  const getStatusConfig = () => {
    switch (resourceStatus) {
      case "healthy":
        return {
          label: "Healthy",
          container:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
          dot: "bg-emerald-500",
        };

      case "warning":
        return {
          label: "Attention Required",
          container:
            "bg-amber-50 text-amber-700 border-amber-100",
          dot: "bg-amber-500",
        };

      case "critical":
        return {
          label: "Critical",
          container:
            "bg-red-50 text-red-700 border-red-100",
          dot: "bg-red-500",
        };

      default:
        return {
          label: "Unknown",
          container:
            "bg-slate-50 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const isWindows =
    server?.platform === "win32";

  const loadAverage =
    cpu?.loadAverage || [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ================================================================
          HEADER
      ================================================================ */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Activity size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Infrastructure Health
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Monitor server resources and runtime usage.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusConfig.container}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
            />

            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* ================================================================
          RESOURCE METRICS
      ================================================================ */}
      <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
        {/* --------------------------------------------------------------
            MEMORY
        -------------------------------------------------------------- */}
        <MetricCard
          icon={MemoryStick}
          iconClass="bg-sky-50 text-sky-600"
          label="System Memory"
          value={formatPercentage(
            memory?.percentage
          )}
          description={
            memory
              ? `${formatBytes(memory.used)} used of ${formatBytes(
                  memory.total
                )}`
              : "System memory unavailable"
          }
        />

        {/* --------------------------------------------------------------
            CPU CORES
        -------------------------------------------------------------- */}
        <MetricCard
          icon={Cpu}
          iconClass="bg-violet-50 text-violet-600"
          label="CPU Cores"
          value={cpu?.cores ?? "—"}
          description="Available processor cores"
        />

        {/* --------------------------------------------------------------
            PROCESS RSS
        -------------------------------------------------------------- */}
        <MetricCard
          icon={Server}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Process Memory"
          value={formatBytes(
            processMemory?.rss
          )}
          description="Node.js resident memory"
        />

        {/* --------------------------------------------------------------
            NODE HEAP
        -------------------------------------------------------------- */}
        <MetricCard
          icon={HardDrive}
          iconClass="bg-amber-50 text-amber-600"
          label="Node Heap"
          value={formatBytes(
            processMemory?.heapUsed
          )}
          description={
            processMemory?.heapTotal
              ? `of ${formatBytes(
                  processMemory.heapTotal
                )} allocated`
              : "Heap usage unavailable"
          }
        />
      </div>

      {/* ================================================================
          DETAILED RESOURCE INFORMATION
      ================================================================ */}
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 xl:grid-cols-2">
        {/* --------------------------------------------------------------
            MEMORY DETAILS
        -------------------------------------------------------------- */}
        <div className="rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <MemoryStick
                size={15}
                className="text-slate-500"
              />

              <h3 className="text-xs font-bold text-slate-800">
                Memory Details
              </h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow
              label="Total Memory"
              value={formatBytes(
                memory?.total
              )}
            />

            <DetailRow
              label="Used Memory"
              value={formatBytes(
                memory?.used
              )}
            />

            <DetailRow
              label="Free Memory"
              value={formatBytes(
                memory?.free
              )}
            />

            <DetailRow
              label="Utilization"
              value={formatPercentage(
                memory?.percentage
              )}
              emphasize
            />
          </div>
        </div>

        {/* --------------------------------------------------------------
            CPU DETAILS
        -------------------------------------------------------------- */}
        <div className="rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Cpu
                size={15}
                className="text-slate-500"
              />

              <h3 className="text-xs font-bold text-slate-800">
                CPU Details
              </h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow
              label="CPU Cores"
              value={cpu?.cores ?? "—"}
            />

            <DetailRow
              label="1 Minute Load"
              value={
                isWindows
                  ? "Not available"
                  : loadAverage[0] ?? "—"
              }
            />

            <DetailRow
              label="5 Minute Load"
              value={
                isWindows
                  ? "Not available"
                  : loadAverage[1] ?? "—"
              }
            />

            <DetailRow
              label="15 Minute Load"
              value={
                isWindows
                  ? "Not available"
                  : loadAverage[2] ?? "—"
              }
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          PROCESS DETAILS
      ================================================================ */}
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <Server
            size={15}
            className="text-slate-500"
          />

          <h3 className="text-xs font-bold text-slate-800">
            Runtime Information
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <RuntimeItem
            label="Node Version"
            value={
              server?.nodeVersion || "—"
            }
          />

          <RuntimeItem
            label="Environment"
            value={
              server?.environment || "—"
            }
          />

          <RuntimeItem
            label="Platform"
            value={
              server?.platform || "—"
            }
          />

          <RuntimeItem
            label="Architecture"
            value={
              server?.architecture || "—"
            }
          />
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  iconClass,
  label,
  value,
  description,
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

    <p className="mt-1 text-[10px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

const DetailRow = ({
  label,
  value,
  emphasize = false,
}) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3">
    <span className="text-[11px] font-medium text-slate-500">
      {label}
    </span>

    <span
      className={`text-xs ${
        emphasize
          ? "font-bold text-slate-900"
          : "font-semibold text-slate-700"
      }`}
    >
      {value}
    </span>
  </div>
);

const RuntimeItem = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3">
    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xs font-bold text-slate-800">
      {value}
    </p>
  </div>
);

export default SystemHealthInfrastructure;