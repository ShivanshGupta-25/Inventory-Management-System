import {
  CheckCircle2,
  CircleAlert,
  WifiOff,
  XCircle,
} from "lucide-react";

// ------------------------------------------------------------
// CONFIG (defined once, outside the component)
// ------------------------------------------------------------

const STATUS_CONFIG = {
  healthy: {
    label: "All systems operational",
    description: "InventoryFlow services are operating normally.",
    icon: CheckCircle2,
    container: "border-emerald-200 bg-emerald-50",
    iconContainer: "bg-emerald-100 text-emerald-600",
    title: "text-emerald-900",
    text: "text-emerald-700",
    badge: "Healthy",
  },

  warning: {
    label: "System degraded",
    description:
      "One or more services or infrastructure resources require attention.",
    icon: CircleAlert,
    container: "border-amber-200 bg-amber-50",
    iconContainer: "bg-amber-100 text-amber-600",
    title: "text-amber-900",
    text: "text-amber-700",
    badge: "Degraded",
  },

  critical: {
    label: "System critical",
    description:
      "One or more critical services or infrastructure resources require immediate attention.",
    icon: XCircle,
    container: "border-red-200 bg-red-50",
    iconContainer: "bg-red-100 text-red-600",
    title: "text-red-900",
    text: "text-red-700",
    badge: "Critical",
  },

  unknown: {
    label: "Monitoring unavailable",
    description: "System health data could not be fully determined.",
    icon: CircleAlert,
    container: "border-slate-200 bg-slate-100",
    iconContainer: "bg-slate-200 text-slate-600",
    title: "text-slate-900",
    text: "text-slate-600",
    badge: "Unknown",
  },
};

// Backends rarely agree on status words. Map the common ones.
const STATUS_ALIASES = {
  healthy: "healthy",
  ok: "healthy",
  up: "healthy",
  operational: "healthy",
  connected: "healthy",

  warning: "warning",
  degraded: "warning",
  partial: "warning",

  critical: "critical",
  down: "critical",
  error: "critical",
  unhealthy: "critical",
  disconnected: "critical",
  failed: "critical",
};

export const normalizeStatus = (status) => {
  const key = String(status ?? "").trim().toLowerCase();
  return STATUS_ALIASES[key] || "unknown";
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

/**
 * Props
 * - status:        overall status string (any common spelling)
 * - lastChecked:   already-formatted "last checked" text
 * - stale:         true when the latest refresh failed and old data is shown
 * - issues:        optional [{ name, status }] of services that are not healthy
 * - healthyCount:  optional number of healthy services
 * - totalCount:    optional total number of services
 */
const SystemHealthOverview = ({
  status = "healthy",
  lastChecked,
  stale = false,
  issues = [],
  healthyCount,
  totalCount,
}) => {
  const normalized = normalizeStatus(status);
  const current = STATUS_CONFIG[normalized];
  const Icon = current.icon;

  const hasCounts =
    Number.isFinite(healthyCount) && Number.isFinite(totalCount) && totalCount > 0;

  return (
    <section
      role="status"
      aria-live="polite"
      className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${current.container}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${current.iconContainer}`}
          >
            <Icon size={24} strokeWidth={2} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={`text-base font-bold ${current.title}`}>
                {current.label}
              </h2>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold ${current.text}`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
                {current.badge}
              </span>

              {stale && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold text-amber-700">
                  <WifiOff size={11} aria-hidden="true" />
                  Last known status
                </span>
              )}
            </div>

            <p className={`mt-1 text-xs leading-5 ${current.text}`}>
              {current.description}
            </p>

            {hasCounts && (
              <p className={`mt-1 text-xs font-medium ${current.text}`}>
                {healthyCount} of {totalCount} services healthy
              </p>
            )}

            {issues.length > 0 && (
              <ul
                className="mt-3 flex flex-wrap gap-2"
                aria-label="Services that need attention"
              >
                {issues.map((issue) => {
                  const issueStatus = normalizeStatus(issue.status);

                  return (
                    <li
                      key={issue.name}
                      className={`rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold ${STATUS_CONFIG[issueStatus].text}`}
                    >
                      {issue.name}: {STATUS_CONFIG[issueStatus].badge}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs font-semibold text-slate-500">Last checked</p>

          <p className="mt-1 text-xs font-medium text-slate-700">
            {lastChecked || "Not checked yet"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SystemHealthOverview;