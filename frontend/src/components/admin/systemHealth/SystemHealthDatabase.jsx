import {
  Activity,
  Database,
  HardDrive,
  Server,
} from "lucide-react";

const SystemHealthDatabase = ({
  database,
}) => {
  const connected =
    database?.status === "healthy";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Database size={16} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Database Health
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              MongoDB connection and database status.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100">
        <Metric
          icon={Database}
          label="Connection"
          value={
            connected
              ? "Connected"
              : "Unknown"
          }
          valueClass={
            connected
              ? "text-emerald-600"
              : "text-slate-500"
          }
        />

        <Metric
          icon={Activity}
          label="Latency"
          value={
            database?.latency != null
              ? `${database.latency} ms`
              : "—"
          }
        />

        <Metric
          icon={Server}
          label="Collections"
          value={
            database?.collections != null
              ? database.collections
              : "—"
          }
        />

        <Metric
          icon={HardDrive}
          label="Database Size"
          value={
            database?.size || "—"
          }
        />
      </div>
    </section>
  );
};

const Metric = ({
  icon: Icon,
  label,
  value,
  valueClass = "text-slate-800",
}) => (
  <div className="bg-white p-4 sm:p-5">
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className="text-slate-400"
      />

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>

    <p
      className={`mt-2 text-sm font-bold ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

export default SystemHealthDatabase;