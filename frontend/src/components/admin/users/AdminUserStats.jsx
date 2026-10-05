import {
  ShieldCheck,
  UserCheck,
  UserCog,
  UserRoundX,
  Users,
  UserRoundCog,
} from "lucide-react";

import AdminStatCard from "../dashboard/AdminStatCard";

// --------------------------------------------------
// NUMBER FORMATTER
// --------------------------------------------------

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
};

// --------------------------------------------------
// USER STAT CONFIGURATION
// --------------------------------------------------

const statConfig = [
  {
    key: "totalUsers",
    title: "Total Users",
    description: "All registered accounts",
    icon: Users,
    iconClass:
      "bg-blue-50 text-blue-600",
    route: "/admin/users",
  },

  {
    key: "totalAdmins",
    title: "Administrators",
    description: "System administrators",
    icon: ShieldCheck,
    iconClass:
      "bg-slate-100 text-slate-700",
    route: "/admin/users?role=admin",
  },

  {
    key: "totalManagers",
    title: "Managers",
    description: "Manager accounts",
    icon: UserRoundCog,
    iconClass:
      "bg-amber-50 text-amber-600",
    route: "/admin/users?role=manager",
  },

  {
    key: "totalStaff",
    title: "Staff",
    description: "Staff accounts",
    icon: UserCog,
    iconClass:
      "bg-violet-50 text-violet-600",
    route: "/admin/users?role=staff",
  },

  {
    key: "activeUsers",
    title: "Active Users",
    description: "Currently enabled",
    icon: UserCheck,
    iconClass:
      "bg-emerald-50 text-emerald-600",
    route: "/admin/users?status=active",
  },

  {
    key: "disabledUsers",
    title: "Disabled Users",
    description: "Accounts requiring review",
    icon: UserRoundX,
    iconClass:
      "bg-red-50 text-red-600",
    route: "/admin/users?status=disabled",
  },
];

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const AdminUserStats = ({
  stats = {},
  loading = false,
  onNavigate,
}) => {
  const handleNavigate = (route) => {
    if (
      typeof onNavigate === "function"
    ) {
      onNavigate(route);
    }
  };

  return (
    <section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statConfig.map((item) => {
          const Icon = item.icon;

          // ------------------------------------------
          // LOADING STATE
          // ------------------------------------------

          if (loading) {
            return (
              <div
                key={item.key}
                className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-100" />

                  <div className="h-4 w-4 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="mt-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />

                  <div className="mt-2 h-8 w-12 animate-pulse rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            );
          }

          // ------------------------------------------
          // STAT CARD
          // ------------------------------------------

          return (
            <AdminStatCard
              key={item.key}
              title={item.title}
              value={formatNumber(
                stats?.[item.key]
              )}
              description={
                item.description
              }
              icon={Icon}
              iconClass={
                item.iconClass
              }
              onClick={() =>
                handleNavigate(
                  item.route
                )
              }
            />
          );
        })}
      </div>
    </section>
  );
};

export default AdminUserStats;