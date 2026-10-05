import {
  Activity,
  RefreshCw,
} from "lucide-react";

const SystemHealthHeader = ({
  onRefresh,
  refreshing = false,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>Administration</span>

          <span className="text-slate-300">
            /
          </span>

          <span>System Health</span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Activity size={19} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              System Health
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor the availability and health of
              InventoryFlow services.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          size={15}
          className={
            refreshing
              ? "animate-spin"
              : ""
          }
        />

        {refreshing
          ? "Refreshing..."
          : "Refresh"}
      </button>
    </div>
  );
};

export default SystemHealthHeader;