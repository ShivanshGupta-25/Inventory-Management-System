import {
  ShieldCheck,
  UserCheck,
  UserCog,
  UserRoundCog,
  UserRoundX,
  Users,
} from "lucide-react";

import AdminStatCard from "./AdminStatCard";

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
};

const AdminStatsGrid = ({
  stats = {},
  onNavigate,
}) => {
  return (
    <section>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <AdminStatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          description="All registered accounts"
          icon={Users}
          iconClass="bg-blue-50 text-blue-600"
          onClick={() => onNavigate("/admin/users")}
        />

        <AdminStatCard
          title="Administrators"
          value={formatNumber(stats.totalAdmins)}
          description="System administrators"
          icon={ShieldCheck}
          iconClass="bg-slate-100 text-slate-700"
          onClick={() =>
            onNavigate("/admin/users?role=admin")
          }
        />

        <AdminStatCard
          title="Managers"
          value={formatNumber(stats.totalManagers)}
          description="Manager accounts"
          icon={UserRoundCog}
          iconClass="bg-amber-50 text-amber-600"
          onClick={() =>
            onNavigate("/admin/users?role=manager")
          }
        />

        <AdminStatCard
          title="Staff"
          value={formatNumber(stats.totalStaff)}
          description="Staff accounts"
          icon={UserCog}
          iconClass="bg-violet-50 text-violet-600"
          onClick={() =>
            onNavigate("/admin/users?role=staff")
          }
        />

        <AdminStatCard
          title="Active Users"
          value={formatNumber(stats.activeUsers)}
          description="Currently enabled"
          icon={UserCheck}
          iconClass="bg-emerald-50 text-emerald-600"
          onClick={() =>
            onNavigate("/admin/users?status=active")
          }
        />

        <AdminStatCard
          title="Disabled Users"
          value={formatNumber(stats.disabledUsers)}
          description="Accounts requiring review"
          icon={UserRoundX}
          iconClass="bg-red-50 text-red-600"
          onClick={() =>
            onNavigate("/admin/users?status=disabled")
          }
        />
      </div>
    </section>
  );
};

export default AdminStatsGrid;