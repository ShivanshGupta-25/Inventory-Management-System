import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Globe,
  KeyRound,
  Server,
  XCircle,
} from "lucide-react";

const getStatusConfig = (status) => {
  switch (status) {
    case "healthy":
      return {
        label: "Healthy",
        icon: CheckCircle2,
        iconClass: "text-emerald-600",
        badgeClass:
          "bg-emerald-50 text-emerald-700",
      };

    case "warning":
      return {
        label: "Degraded",
        icon: CircleAlert,
        iconClass: "text-amber-600",
        badgeClass:
          "bg-amber-50 text-amber-700",
      };

    case "critical":
      return {
        label: "Unavailable",
        icon: XCircle,
        iconClass: "text-red-600",
        badgeClass:
          "bg-red-50 text-red-700",
      };

    default:
      return {
        label: "Unknown",
        icon: CircleAlert,
        iconClass: "text-slate-400",
        badgeClass:
          "bg-slate-100 text-slate-600",
      };
  }
};

const serviceIcons = {
  api: Server,
  database: Database,
  authentication: KeyRound,
  frontend: Globe,
};

const SystemHealthServices = ({ services = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          Service Health
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Availability and response status of core services.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="p-8 text-center">
          <Server
            size={22}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-medium text-slate-600">
            No service health data available
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Service monitoring has not been configured yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {services.map((service) => {
            const config = getStatusConfig(
              service.status
            );

            const StatusIcon = config.icon;

            const ServiceIcon =
              serviceIcons[service.key] || Server;

            return (
              <div
                key={service.key || service.name}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <ServiceIcon size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {service.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {service.description ||
                        "Core InventoryFlow service"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0">
                  <div className="hidden items-center gap-1.5 text-[10px] text-slate-400 sm:flex">
                    <Clock3 size={11} />

                    {service.responseTime != null
                      ? `${service.responseTime} ms`
                      : "—"}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${config.badgeClass}`}
                  >
                    <StatusIcon
                      size={11}
                      className={config.iconClass}
                    />

                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SystemHealthServices;