import { useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

// ------------------------------------------------------------
// CONFIG (defined once, outside the component)
// ------------------------------------------------------------

const PAGE_SIZE = 8;

const EVENT_TYPES = {
  LOGIN_SUCCESS: {
    label: "Successful login",
    icon: UserCheck,
    iconContainer: "bg-emerald-50 text-emerald-600",
  },
  LOGIN_FAILED: {
    label: "Failed login",
    icon: AlertTriangle,
    iconContainer: "bg-amber-50 text-amber-600",
  },
  SUSPICIOUS_ACTIVITY: {
    label: "Suspicious activity",
    icon: ShieldAlert,
    iconContainer: "bg-red-50 text-red-600",
  },
  RATE_LIMIT_TRIGGERED: {
    label: "Rate limit triggered",
    icon: ShieldAlert,
    iconContainer: "bg-violet-50 text-violet-600",
  },
};

const SEVERITIES = [
  { key: "critical", label: "Critical", badge: "border-red-100 bg-red-50 text-red-700" },
  { key: "warning", label: "Warning", badge: "border-amber-100 bg-amber-50 text-amber-700" },
  { key: "info", label: "Info", badge: "border-sky-100 bg-sky-50 text-sky-700" },
];

const FALLBACK_BADGE = "border-slate-200 bg-slate-50 text-slate-600";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

// "SOME_NEW_EVENT" -> "Some new event", so unknown types stay readable.
const humanize = (value) => {
  if (!value || typeof value !== "string") return "Security event";

  const text = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const getEventConfig = (type) =>
  EVENT_TYPES[String(type ?? "").toUpperCase()] || {
    label: humanize(type),
    icon: Clock3,
    iconContainer: "bg-slate-100 text-slate-600",
  };

const normalizeSeverity = (severity) =>
  String(severity ?? "").trim().toLowerCase();

const getSeverityBadge = (severity) =>
  SEVERITIES.find((item) => item.key === normalizeSeverity(severity))?.badge ||
  FALLBACK_BADGE;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatAbsolute = (date) =>
  date
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Unknown time";

const formatEventTime = (date) => {
  if (!date) return "Unknown time";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleString("en-IN", { day: "2-digit", month: "short" });
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

const SystemHealthEvents = ({ events = [] }) => {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  // Newest first, with dates parsed once and stable keys.
  const normalized = useMemo(
    () =>
      (Array.isArray(events) ? events : [])
        .map((event, index) => {
          const date = toDate(event.createdAt);

          return {
            ...event,
            date,
            severityKey: normalizeSeverity(event.severity),
            key:
              event._id ??
              event.id ??
              `${event.type}-${event.createdAt}-${index}`,
          };
        })
        .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)),
    [events]
  );

  const counts = useMemo(() => {
    const result = {};
    normalized.forEach((event) => {
      result[event.severityKey] = (result[event.severityKey] || 0) + 1;
    });
    return result;
  }, [normalized]);

  const availableFilters = SEVERITIES.filter((item) => counts[item.key] > 0);

  // If a filter's events age out of the list, fall back to showing everything.
  const activeFilter =
    filter === "all" || counts[filter] ? filter : "all";

  const filtered =
    activeFilter === "all"
      ? normalized
      : normalized.filter((event) => event.severityKey === activeFilter);

  const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE);
  const hiddenCount = filtered.length - visible.length;

  const selectFilter = (key) => {
    setFilter(key);
    setExpanded(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recent system events
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Recent authentication and security activity, newest first.
            </p>
          </div>

          {availableFilters.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter events by severity"
            >
              <FilterChip
                active={activeFilter === "all"}
                onClick={() => selectFilter("all")}
              >
                All ({normalized.length})
              </FilterChip>

              {availableFilters.map((item) => (
                <FilterChip
                  key={item.key}
                  active={activeFilter === item.key}
                  onClick={() => selectFilter(item.key)}
                >
                  {item.label} ({counts[item.key]})
                </FilterChip>
              ))}
            </div>
          )}
        </div>
      </div>

      {normalized.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center px-5 py-8">
          <div className="text-center">
            <CheckCircle2
              size={20}
              className="mx-auto text-emerald-500"
              aria-hidden="true"
            />

            <p className="mt-2 text-xs font-semibold text-slate-700">
              No recent security events
            </p>

            <p className="mt-1 text-xs text-slate-400">
              No authentication activity requires attention.
            </p>
          </div>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100">
            {visible.map((event) => {
              const config = getEventConfig(event.type);
              const Icon = config.icon;

              return (
                <li
                  key={event.key}
                  className="flex items-start gap-3 px-5 py-4 sm:px-6"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconContainer}`}
                  >
                    <Icon size={14} aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-slate-800">
                        {config.label}
                      </p>

                      {event.severityKey && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${getSeverityBadge(
                            event.severityKey
                          )}`}
                        >
                          {event.severityKey}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                        {event.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      {event.email && (
                        <span className="break-all">{event.email}</span>
                      )}

                      {event.ipAddress && <span>IP {event.ipAddress}</span>}

                      <time
                        dateTime={event.date?.toISOString()}
                        title={formatAbsolute(event.date)}
                      >
                        {formatEventTime(event.date)}
                      </time>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center sm:px-6">
              <p className="text-xs font-semibold text-slate-700">
                No events match this filter.
              </p>

              <button
                type="button"
                onClick={() => selectFilter("all")}
                className="mt-2 text-xs font-semibold text-sky-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                Show all events
              </button>
            </div>
          )}

          {(hiddenCount > 0 || (expanded && filtered.length > PAGE_SIZE)) && (
            <div className="border-t border-slate-100 px-5 py-3 text-center sm:px-6">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="text-xs font-semibold text-sky-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {expanded ? "Show fewer events" : `Show ${hiddenCount} more`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

const FilterChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
      active
        ? "border-slate-800 bg-slate-800 text-white"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);

export default SystemHealthEvents;