import { useEffect, useState } from "react";

import {
  Activity,
  Download,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";

// ------------------------------------------------------------
// CONFIG + HELPERS
// ------------------------------------------------------------

const DEFAULT_INTERVAL_OPTIONS = [
  { label: "5 seconds", value: 5000 },
  { label: "10 seconds", value: 10000 },
  { label: "30 seconds", value: 30000 },
  { label: "1 minute", value: 60000 },
  { label: "5 minutes", value: 300000 },
];

const formatRelative = (date) => {
  if (!date) return "never";

  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  return `${Math.floor(minutes / 60)}h ago`;
};

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1";

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

/**
 * Props
 * - onRefresh, refreshing:            manual refresh (as before)
 * - lastUpdated:                      Date of the last successful refresh
 * - autoRefresh, onToggleAutoRefresh: pause/resume button (hidden if no handler)
 * - refreshInterval, onIntervalChange, intervalOptions: interval picker
 *                                     (hidden if no onIntervalChange)
 * - onExport, canExport:              download button (hidden if no handler)
 */
const SystemHealthHeader = ({
  onRefresh,
  refreshing = false,
  lastUpdated = null,
  autoRefresh = true,
  onToggleAutoRefresh,
  refreshInterval,
  onIntervalChange,
  intervalOptions = DEFAULT_INTERVAL_OPTIONS,
  onExport,
  canExport = true,
}) => {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <li>Administration</li>
            <li className="text-slate-300" aria-hidden="true">
              /
            </li>
            <li aria-current="page">System health</li>
          </ol>
        </nav>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Activity size={19} aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              System health
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor the availability and health of InventoryFlow services.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:items-end">
        {lastUpdated !== undefined && (
          <LastUpdated
            date={lastUpdated}
            paused={Boolean(onToggleAutoRefresh) && !autoRefresh}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {onIntervalChange && (
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span className="sr-only sm:not-sr-only">Refresh every</span>

              <select
                value={refreshInterval}
                onChange={(event) => onIntervalChange(Number(event.target.value))}
                disabled={!autoRefresh}
                className={`rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 disabled:opacity-50 ${focusRing}`}
              >
                {intervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {onToggleAutoRefresh && (
            <button
              type="button"
              onClick={onToggleAutoRefresh}
              aria-pressed={autoRefresh}
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${focusRing}`}
            >
              {autoRefresh ? (
                <Pause size={15} aria-hidden="true" />
              ) : (
                <Play size={15} aria-hidden="true" />
              )}
              {autoRefresh ? "Pause" : "Resume"}
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              disabled={!canExport}
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              <Download size={15} aria-hidden="true" />
              Download snapshot
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin motion-reduce:animate-none" : ""}
              aria-hidden="true"
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
};

// Ticks on its own so the rest of the page doesn't re-render every second.
const LastUpdated = ({ date, paused }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-xs text-slate-500">
      Updated{" "}
      <span className="font-semibold text-slate-700">
        {formatRelative(date)}
      </span>
      {paused && (
        <span className="ml-2 font-medium text-amber-600">
          Auto-refresh paused
        </span>
      )}
    </p>
  );
};

export default SystemHealthHeader;