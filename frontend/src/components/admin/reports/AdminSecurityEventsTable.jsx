import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const EVENT_CONFIG = {
  LOGIN_SUCCESS: {
    label: "Successful Login",
    icon: UserCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
  },

  LOGIN_FAILED: {
    label: "Failed Login",
    icon: AlertTriangle,
    iconClass: "bg-amber-50 text-amber-600",
  },

  SUSPICIOUS_ACTIVITY: {
    label: "Suspicious Activity",
    icon: ShieldAlert,
    iconClass: "bg-red-50 text-red-600",
  },

  RATE_LIMIT_TRIGGERED: {
    label: "Rate Limit Triggered",
    icon: ShieldAlert,
    iconClass: "bg-violet-50 text-violet-600",
  },
};

const SEVERITY_CONFIG = {
  info: {
    label: "Info",
    className:
      "border-sky-200 bg-sky-50 text-sky-700",
  },

  warning: {
    label: "Warning",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  critical: {
    label: "Critical",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
};

const AdminSecurityEventsTable = ({
  events = [],
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                className="text-violet-600"
              />

              <h2 className="text-sm font-bold text-slate-900">
                Detailed Security Events
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Authentication and security events recorded during the
              selected reporting period.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
            {events.length}{" "}
            {events.length === 1
              ? "Event"
              : "Events"}
          </span>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="whitespace-nowrap px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:px-6">
                    Event
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Severity
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    IP Address
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <SecurityEventRow
                    key={event._id}
                    event={event}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {events.map((event) => (
              <SecurityEventMobileCard
                key={event._id}
                event={event}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

const SecurityEventRow = ({
  event,
}) => {
  const config =
    EVENT_CONFIG[event.type] ||
    {
      label: formatEventType(event.type),
      icon: Clock3,
      iconClass:
        "bg-slate-100 text-slate-600",
    };

  const Icon = config.icon;

  const severity =
    SEVERITY_CONFIG[event.severity] ||
    {
      label: event.severity || "Unknown",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.iconClass}`}
          >
            <Icon size={14} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800">
              {config.label}
            </p>

            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-400">
              {event.type}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${severity.className}`}
        >
          {severity.label}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-xs font-medium text-slate-700">
          {event.email || "Unknown user"}
        </p>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Globe2 size={12} />
          {event.ipAddress || "Not available"}
        </div>
      </td>

      <td className="max-w-xs px-5 py-4">
        <p className="truncate text-xs text-slate-500">
          {event.description || "—"}
        </p>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-xs font-medium text-slate-700">
          {formatDateTime(event.createdAt)}
        </p>
      </td>
    </tr>
  );
};

const SecurityEventMobileCard = ({
  event,
}) => {
  const config =
    EVENT_CONFIG[event.type] ||
    {
      label: formatEventType(event.type),
      icon: Clock3,
      iconClass:
        "bg-slate-100 text-slate-600",
    };

  const Icon = config.icon;

  const severity =
    SEVERITY_CONFIG[event.severity] ||
    {
      label: event.severity || "Unknown",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
        >
          <Icon size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-slate-800">
              {config.label}
            </p>

            <span
              className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${severity.className}`}
            >
              {severity.label}
            </span>
          </div>

          <p className="mt-1 text-[10px] text-slate-500">
            {event.description || "No description available."}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <DetailItem
          icon={KeyRound}
          label="User"
          value={event.email || "Unknown"}
        />

        <DetailItem
          icon={Globe2}
          label="IP Address"
          value={event.ipAddress || "Not available"}
        />

        <DetailItem
          icon={Clock3}
          label="Time"
          value={formatDateTime(event.createdAt)}
        />
      </div>
    </div>
  );
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
    <div className="flex items-center gap-1.5">
      <Icon size={11} className="text-slate-400" />

      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>

    <p className="mt-1 break-all text-[10px] font-medium text-slate-700">
      {value}
    </p>
  </div>
);

const EmptyState = () => (
  <div className="flex min-h-40 items-center justify-center px-5 py-8">
    <div className="text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 size={18} />
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-700">
        No security events
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        No security events were recorded during this period.
      </p>
    </div>
  </div>
);

const formatEventType = (type) => {
  if (!type) return "Security Event";

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const formatDateTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default AdminSecurityEventsTable;