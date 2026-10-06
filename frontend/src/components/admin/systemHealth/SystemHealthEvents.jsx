import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

const SystemHealthEvents = ({
  events = [],
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Recent System Events
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recent authentication and security activity.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center px-5 py-8">
          <div className="text-center">
            <CheckCircle2
              size={20}
              className="mx-auto text-emerald-500"
            />

            <p className="mt-2 text-xs font-semibold text-slate-700">
              No recent security events
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              No authentication activity requires attention.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {events.map((event) => {
            const config =
              getEventConfig(event.type);

            const Icon =
              config.icon;

            return (
              <div
                key={event._id}
                className="flex items-start gap-3 px-5 py-4 sm:px-6"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconContainer}`}
                >
                  <Icon size={14} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-slate-800">
                      {config.label}
                    </p>

                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${getSeverityClass(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    {event.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-slate-400">
                    {event.email && (
                      <span>
                        {event.email}
                      </span>
                    )}

                    {event.ipAddress && (
                      <span>
                        IP {event.ipAddress}
                      </span>
                    )}

                    <span>
                      {formatEventTime(
                        event.createdAt
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const getEventConfig = (
  type
) => {
  switch (type) {
    case "LOGIN_SUCCESS":
      return {
        label: "Successful Login",
        icon: UserCheck,
        iconContainer:
          "bg-emerald-50 text-emerald-600",
      };

    case "LOGIN_FAILED":
      return {
        label: "Failed Login",
        icon: AlertTriangle,
        iconContainer:
          "bg-amber-50 text-amber-600",
      };

    case "SUSPICIOUS_ACTIVITY":
      return {
        label: "Suspicious Activity",
        icon: ShieldAlert,
        iconContainer:
          "bg-red-50 text-red-600",
      };

    case "RATE_LIMIT_TRIGGERED":
      return {
        label: "Rate Limit Triggered",
        icon: ShieldAlert,
        iconContainer:
          "bg-violet-50 text-violet-600",
      };

    default:
      return {
        label: "Security Event",
        icon: Clock3,
        iconContainer:
          "bg-slate-100 text-slate-600",
      };
  }
};

const getSeverityClass = (
  severity
) => {
  switch (severity) {
    case "critical":
      return "border-red-100 bg-red-50 text-red-700";

    case "warning":
      return "border-amber-100 bg-amber-50 text-amber-700";

    case "info":
      return "border-sky-100 bg-sky-50 text-sky-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const formatEventTime = (
  value
) => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default SystemHealthEvents;