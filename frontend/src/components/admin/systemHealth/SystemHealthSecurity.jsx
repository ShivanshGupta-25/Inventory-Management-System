import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from "lucide-react";

const SystemHealthSecurity = ({
  security = {},
}) => {
  const {
    authentication = "unknown",
    authenticationSecretConfigured = false,
    rateLimiting = "unknown",
    failedLogins = null,
    suspiciousEvents = null,
    status = "unknown",
  } = security;

  const statusConfig =
    getSecurityStatusConfig(status);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Shield size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Security Health
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Authentication and security monitoring status.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusConfig.badge}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
            />

            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* =========================================================
          SECURITY METRICS
      ========================================================= */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 xl:grid-cols-4">
        <SecurityMetric
          icon={ShieldCheck}
          iconClass="bg-emerald-50 text-emerald-600"
          label="Authentication"
          value={formatStatus(
            authentication
          )}
        />

        <SecurityMetric
          icon={KeyRound}
          iconClass="bg-violet-50 text-violet-600"
          label="JWT Secret"
          value={
            authenticationSecretConfigured
              ? "Configured"
              : "Not configured"
          }
        />

        <SecurityMetric
          icon={Activity}
          iconClass="bg-sky-50 text-sky-600"
          label="Failed Logins"
          value={
            failedLogins !== null
              ? failedLogins
              : "Not collected"
          }
          description={
            failedLogins !== null
              ? "Last 24 hours"
              : null
          }
        />

        <SecurityMetric
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600"
          label="Suspicious Events"
          value={
            suspiciousEvents !== null
              ? suspiciousEvents
              : "Not collected"
          }
          description={
            suspiciousEvents !== null
              ? "Last 15 minutes"
              : null
          }
        />
      </div>

      {/* =========================================================
          SECURITY CONTROLS
      ========================================================= */}
      <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert
            size={15}
            className="text-slate-500"
          />

          <h3 className="text-xs font-bold text-slate-800">
            Security Controls
          </h3>
        </div>

        <div className="space-y-3">
          <SecurityRow
            label="JWT Authentication"
            description="Token-based authentication service"
            status={authentication}
          />

          <SecurityRow
            label="JWT Secret"
            description="Required signing secret configuration"
            status={
              authenticationSecretConfigured
                ? "healthy"
                : "critical"
            }
            value={
              authenticationSecretConfigured
                ? "Configured"
                : "Missing"
            }
          />

          <SecurityRow
            label="Rate Limiting"
            description="API request protection"
            status={rateLimiting}
            value={formatRateLimitStatus(
              rateLimiting
            )}
          />

          <SecurityRow
            label="Suspicious Activity"
            description="Repeated failed authentication detection"
            status={
              suspiciousEvents > 0
                ? "warning"
                : "healthy"
            }
            value={
              suspiciousEvents !== null
                ? suspiciousEvents > 0
                  ? `${suspiciousEvents} detected`
                  : "None detected"
                : "Not collected"
            }
          />
        </div>
      </div>
    </section>
  );
};

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
      <Icon size={16} />
    </div>

    <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
      {value}
    </p>

    {description && (
      <p className="mt-1 text-[10px] text-slate-400">
        {description}
      </p>
    )}
  </div>
);

const SecurityRow = ({
  label,
  description,
  status,
  value,
}) => {
  const config =
    getSecurityStatusConfig(status);

  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconContainer}`}
        >
          <Icon size={14} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${config.badge}`}
      >
        {value || config.label}
      </span>
    </div>
  );
};

const getSecurityStatusConfig = (
  status
) => {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        badge:
          "border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
        icon: CheckCircle2,
        iconContainer:
          "bg-emerald-50 text-emerald-600",
      };

    case "warning":
      return {
        label: "Warning",
        badge:
          "border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
        icon: AlertTriangle,
        iconContainer:
          "bg-amber-50 text-amber-600",
      };

    case "critical":
      return {
        label: "Critical",
        badge:
          "border-red-100 bg-red-50 text-red-700",
        dot: "bg-red-500",
        icon: ShieldAlert,
        iconContainer:
          "bg-red-50 text-red-600",
      };

    default:
      return {
        label: "Unknown",
        badge:
          "border-slate-200 bg-slate-50 text-slate-600",
        dot: "bg-slate-400",
        icon: Shield,
        iconContainer:
          "bg-slate-50 text-slate-500",
      };
  }
};

const formatStatus = (
  status
) => {
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

const formatRateLimitStatus = (
  status
) => {
  const labels = {
    configured: "Configured",
    active: "Active",
    warning: "Warning",
    critical: "Critical",
    unknown: "Unknown",
  };

  return (
    labels[status] ||
    "Unknown"
  );
};

export default SystemHealthSecurity;