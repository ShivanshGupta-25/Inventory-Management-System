import {
  FileClock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const AdminAuditHeader = ({
  totalLogs = 0,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Administration</span>

          <span>/</span>

          <span>Monitoring</span>

          <span>/</span>

          <span className="text-slate-600">
            Audit Logs
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <FileClock size={21} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Audit Logs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review administrative actions and account
              security activity across InventoryFlow.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <ShieldCheck size={14} />

          Audit trail active
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
          {totalLogs.toLocaleString()} events
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>
    </div>
  );
};

export default AdminAuditHeader;