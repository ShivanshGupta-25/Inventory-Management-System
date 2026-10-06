import {
  CheckCircle2,
  CircleAlert,
  XCircle,
} from "lucide-react";

const SystemHealthOverview = ({
  status = "healthy",
  lastChecked,
}) => {
  const config = {
    healthy: {
      label: "All Systems Operational",
      description:
        "InventoryFlow services are operating normally.",
      icon: CheckCircle2,
      container:
        "border-emerald-200 bg-emerald-50",
      iconContainer:
        "bg-emerald-100 text-emerald-600",
      title: "text-emerald-900",
      text: "text-emerald-700",
    },

    warning: {
      label: "System Degraded",
      description:
        "One or more services or infrastructure resources require attention.",
      icon: CircleAlert,
      container:
        "border-amber-200 bg-amber-50",
      iconContainer:
        "bg-amber-100 text-amber-600",
      title: "text-amber-900",
      text: "text-amber-700",
    },

    critical: {
        label: "System Critical",
        description:
            "One or more critical services or infrastructure resources require immediate attention.",
        icon: XCircle,
        container:
            "border-red-200 bg-red-50",
        iconContainer:
            "bg-red-100 text-red-600",
        title: "text-red-900",
        text: "text-red-700",
        },

    unknown: {
      label: "Monitoring Unavailable",
      description:
        "System health data could not be fully determined.",
      icon: CircleAlert,
      container:
        "border-slate-200 bg-slate-100",
      iconContainer:
        "bg-slate-200 text-slate-600",
      title: "text-slate-900",
      text: "text-slate-600",
    },
  };

  const current =
    config[status] || config.unknown;

  const Icon = current.icon;

  return (
    <section
    //   className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${current.container}`}
    >
      {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${current.iconContainer}`}
          >
            <Icon size={24} strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`text-base font-bold ${current.title}`}
              >
                {current.label}
              </h2>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${current.text}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {status}
              </span>
            </div>

            <p
              className={`mt-1 text-xs leading-5 ${current.text}`}
            >
              {current.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Last checked
          </p>

          <p className="mt-1 text-xs font-medium text-slate-700">
            {lastChecked || "Not checked yet"}
          </p>
        </div>
      </div> */}
    </section>
  );
};

export default SystemHealthOverview;