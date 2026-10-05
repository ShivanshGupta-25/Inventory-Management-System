import {
  Mail,
  Shield,
  UserRound,
  Activity,
} from "lucide-react";

const AdminUserOverview = ({ user }) => {
  const isActive = user?.status !== "disabled";

  const items = [
    {
      label: "Full Name",
      value: user?.name || "—",
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user?.email || "—",
      icon: Mail,
    },
    {
      label: "Role",
      value: user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "—",
      icon: Shield,
    },
    {
      label: "Account Status",
      value: isActive ? "Active" : "Disabled",
      icon: Activity,
      valueClass: isActive
        ? "text-emerald-600"
        : "text-red-600",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          User Overview
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Basic information associated with this account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Icon size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </p>

                  <p
                    className={`mt-1 truncate text-sm font-semibold ${
                      item.valueClass || "text-slate-800"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AdminUserOverview;