import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BarChart3 } from "lucide-react";

import AdminSectionHeader from "./AdminSectionHeader";
import AdminEmptyState from "./AdminEmptyState";

const AdminUserGrowthChart = ({
  data = [],
  onNavigate,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">
      <AdminSectionHeader
        title="User Growth"
        description="New accounts created over the last 30 days"
        actionLabel="Manage users"
        onAction={() => onNavigate("/admin/users")}
      />

      {data.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 8,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="adminUserGrowthGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#0f172a"
                    stopOpacity={0.16}
                  />

                  <stop
                    offset="100%"
                    stopColor="#0f172a"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "#cbd5e1",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 10px 30px rgba(15,23,42,0.08)",
                  fontSize: "12px",
                }}
                formatter={(value) => [
                  `${value} users`,
                  "New users",
                ]}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke="#0f172a"
                strokeWidth={2}
                fill="url(#adminUserGrowthGradient)"
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <AdminEmptyState
          icon={BarChart3}
          title="No growth data yet"
          description="User growth information will appear here as new accounts are created."
        />
      )}
    </div>
  );
};

export default AdminUserGrowthChart;