import {
  AlertTriangle,
  KeyRound,
  ShieldCheck,
  UserX,
} from "lucide-react";

const SystemHealthSecurity = ({
  security,
}) => {
  const authenticationHealthy =
    security?.authentication === "healthy";

  const rateLimitingActive =
    security?.rateLimiting === "active";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck size={16} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Security Health
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Authentication and security monitoring.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <SecurityItem
          icon={KeyRound}
          title="Authentication"
          description="JWT authentication service"
          value={
            authenticationHealthy
              ? "Healthy"
              : "Unknown"
          }
          healthy={authenticationHealthy}
        />

        <SecurityItem
          icon={ShieldCheck}
          title="Rate Limiting"
          description="API request protection"
          value={
            rateLimitingActive
              ? "Active"
              : "Unknown"
          }
          healthy={rateLimitingActive}
        />

        <SecurityItem
          icon={UserX}
          title="Failed Logins"
          description="Recent authentication failures"
          value={
            security?.failedLogins != null
              ? security.failedLogins
              : "—"
          }
        />

        <SecurityItem
          icon={AlertTriangle}
          title="Suspicious Events"
          description="Events requiring attention"
          value={
            security?.suspiciousEvents != null
              ? security.suspiciousEvents
              : "—"
          }
        />
      </div>
    </section>
  );
};

const SecurityItem = ({
  icon: Icon,
  title,
  description,
  value,
  healthy,
}) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        <Icon size={14} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="truncate text-[10px] text-slate-400">
          {description}
        </p>
      </div>
    </div>

    <span
      className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
        healthy === true
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {value}
    </span>
  </div>
);

export default SystemHealthSecurity;