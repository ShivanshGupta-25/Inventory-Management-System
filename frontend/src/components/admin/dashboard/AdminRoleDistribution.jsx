import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Users } from "lucide-react";

import AdminSectionHeader from "./AdminSectionHeader";
import AdminEmptyState from "./AdminEmptyState";

const ROLE_COLORS = {
  admin: "#0f172a",
  manager: "#f59e0b",
  staff: "#94a3b8",
};

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "0";
  }

  return Number(value).toLocaleString("en-IN");
};

const AdminRoleDistribution = ({
  data = [],
  onNavigate,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">
      <AdminSectionHeader
        title="Role Distribution"
        description="Current accounts by role"
        actionLabel="Users"
        onAction={() => onNavigate("/admin/users")}
      />

      {data.length > 0 ? (
        <>
          <div className="h-[220px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.role}
                      fill={
                        ROLE_COLORS[entry.role] ||
                        "#cbd5e1"
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 30px rgba(15,23,42,0.08)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {data.map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        ROLE_COLORS[item.role] ||
                        "#cbd5e1",
                    }}
                  />

                  <span className="text-xs font-medium text-slate-600">
                    {item.name}
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-800">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <AdminEmptyState
          icon={Users}
          title="No role data"
          description="Role distribution will appear when users are available."
        />
      )}
    </div>
  );
};

export default AdminRoleDistribution;