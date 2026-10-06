import {
  Activity,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

const AdminReportSummary = ({ summary = {} }) => {
  const cards = [
    {
      title: "Total Users",
      value: formatNumber(summary.totalUsers),
      description: "Users in the platform",
      icon: Users,
      iconClass: "bg-sky-50 text-sky-600",
    },
    {
      title: "New Users",
      value: formatNumber(summary.newUsers),
      description: "Created during this period",
      icon: UserPlus,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      title: "Active Users",
      value: formatNumber(summary.activeUsers),
      description: "Currently active accounts",
      icon: UserCheck,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Disabled Users",
      value: formatNumber(summary.disabledUsers),
      description: "Currently disabled accounts",
      icon: UserX,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Admin Actions",
      value: formatNumber(summary.adminActions),
      description: "Administrative events",
      icon: Activity,
      iconClass: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Security Events",
      value: formatNumber(summary.securityEvents),
      description: "Recorded security activity",
      icon: ShieldAlert,
      iconClass: "bg-red-50 text-red-600",
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>

                <span className="rounded-full bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Report
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium text-slate-500">
                  {card.title}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return Number(value).toLocaleString("en-IN");
};

export default AdminReportSummary;