import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  Shield,
  ShieldAlert,
} from "lucide-react";

import { normalizeStatus } from "./SystemHealthOverview";

// ------------------------------------------------------------
// CONFIG + HELPERS (defined once, outside the component)
// ------------------------------------------------------------

// Failed logins in the window at or above this count are flagged as a warning.
const FAILED_LOGIN_WARNING = 10;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

const formatCount = (value) =>
  isNumber(value) ? value.toLocaleString("en-IN") : "Not collected";

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    iconContainer: "bg-emerald-50 text-emerald-600",
  },
  warning: {
    label: "Warning",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: AlertTriangle,
    iconContainer: "bg-amber-50 text-amber-600",
  },
  critical: {
    label: "Critical",
    badge: "border-red-100 bg-red-50 text-red-700",
    dot: "bg-red-500",
    icon: ShieldAlert,
    iconContainer: "bg-red-50 text-red-600",
  },
  unknown: {
    label: "Unknown",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
    icon: Shield,
    iconContainer: "bg-slate-50 text-slate-500",
  },
};

// Rate limiting reports words like "configured" or "active", which the shared
// normalizer doesn't know. Treat those as healthy instead of "Unknown".
const HEALTHY_WORDS = new Set(["configured", "active", "enabled"]);

const toStatus = (value) => {
  const key = String(value ?? "").trim().toLowerCase();
  return HEALTHY_WORDS.has(key) ? "healthy" : normalizeStatus(key);
};

// "some_value" -> "Some value" so unexpected backend words stay readable.
const humanize = (value) => {
  const text = String(value ?? "").replace(/[_-]+/g, " ").trim().toLowerCase();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Unknown";
};

// Worst known status wins. Unknown checks are ignored unless nothing is known.
const worstStatus = (statuses) => {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warning")) return "warning";
  if (statuses.includes("healthy")) return "healthy";
  return "unknown";
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

/**
 * security: {
 *   authentication, authenticationSecretConfigured, rateLimiting,
 *   failedLogins, suspiciousEvents, status,
 *   // optional: text for the time windows the counts cover
 *   failedLoginsWindow = "Last 24 hours",
 *   suspiciousEventsWindow = "Last 15 minutes"
 * }
 */
const SystemHealthSecurity = ({ security = {} }) => {
  const {
    authentication = "unknown",
    authenticationSecretConfigured = false,
    rateLimiting = "unknown",
    failedLogins = null,
    suspiciousEvents = null,
    status = "unknown",
    failedLoginsWindow = "Last 24 hours",
    suspiciousEventsWindow = "Last 15 minutes",
  } = security;

  // Each check carries its own verdict, so the summary can't drift from the rows.
  const checks = [
    {
      key: "authentication",
      label: "JWT authentication",
      description: "Token-based authentication service",
      status: toStatus(authentication),
    },
    {
      key: "secret",
      label: "JWT secret",
      description: "Required signing secret configuration",
      status: authenticationSecretConfigured ? "healthy" : "critical",
      value: authenticationSecretConfigured ? "Configured" : "Missing",
      hint: authenticationSecretConfigured
        ? null
        : "Set the JWT signing secret in the server environment variables.",
    },
    {
      key: "rateLimiting",
      label: "Rate limiting",
      description: "API request protection",
      status: toStatus(rateLimiting),
      value: humanize(rateLimiting),
    },
    {
      key: "failedLogins",
      label: "Failed logins",
      description: "Unusual volume of failed sign-in attempts",
      status: !isNumber(failedLogins)
        ? "unknown"
        : failedLogins >= FAILED_LOGIN_WARNING
        ? "warning"
        : "healthy",
      value: !isNumber(failedLogins)
        ? "Not collected"
        : failedLogins >= FAILED_LOGIN_WARNING
        ? `${failedLogins.toLocaleString("en-IN")} elevated`
        : "Normal",
    },
    {
      key: "suspicious",
      label: "Suspicious activity",
      description: "Repeated failed authentication detection",
      status: !isNumber(suspiciousEvents)
        ? "unknown"
        : suspiciousEvents > 0
        ? "warning"
        : "healthy",
      value: !isNumber(suspiciousEvents)
        ? "Not collected"
        : suspiciousEvents > 0
        ? `${suspiciousEvents.toLocaleString("en-IN")} detected`
        : "None detected",
    },
  ];

  const passing = checks.filter((check) => check.status === "healthy").length;
  const notCollected = checks.filter((check) => check.status === "unknown").length;

  // Trust the backend's verdict; derive one from the checks if it has none.
  const backendStatus = toStatus(status);
  const overallStatus =
    backendStatus !== "unknown"
      ? backendStatus
      : worstStatus(checks.map((check) => check.status));

  const statusConfig = STATUS_CONFIG[overallStatus];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Shield size={17} aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Security health
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Authentication and security monitoring status.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusConfig.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
              aria-hidden="true"
            />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-3">
        <SecurityMetric
          icon={ListChecks}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Checks passing"
          value={`${passing} of ${checks.length}`}
          description={
            notCollected > 0 ? `${notCollected} not collected` : "All checks reporting"
          }
        />

        <SecurityMetric
          icon={Activity}
          iconClass="bg-sky-50 text-sky-600"
          label="Failed logins"
          value={formatCount(failedLogins)}
          description={isNumber(failedLogins) ? failedLoginsWindow : null}
        />

        <SecurityMetric
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600"
          label="Suspicious events"
          value={formatCount(suspiciousEvents)}
          description={isNumber(suspiciousEvents) ? suspiciousEventsWindow : null}
        />
      </div>

      {/* Security checks */}
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert size={15} className="text-slate-500" aria-hidden="true" />
          <h3 className="text-xs font-bold text-slate-800">Security controls</h3>
        </div>

        <ul className="space-y-3">
          {checks.map((check) => (
            <SecurityRow key={check.key} {...check} />
          ))}
        </ul>
      </div>
    </section>
  );
};

// ------------------------------------------------------------
// SMALL COMPONENTS
// ------------------------------------------------------------

const SecurityMetric = ({
  icon: Icon,
  iconClass,
  label,
  value,
  description = null,
}) => (
  <div className="bg-white p-4 sm:p-5">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
    >
      <Icon size={16} aria-hidden="true" />
    </div>

    <p className="mt-4 text-xs font-semibold text-slate-400">{label}</p>

    <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">{value}</p>

    {description && <p className="mt-1 text-[11px] text-slate-400">{description}</p>}
  </div>
);

const SecurityRow = ({ label, description, status, value, hint = null }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconContainer}`}
        >
          <Icon size={14} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800">{label}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>

          {hint && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{hint}</p>
          )}
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${config.badge}`}
      >
        {value || config.label}
      </span>
    </li>
  );
};

export default SystemHealthSecurity;