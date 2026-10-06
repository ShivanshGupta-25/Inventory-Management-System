import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AdminSecurityChart = ({ data = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          Security & Login Activity
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Authentication and security events over time.
        </p>
      </div>

      <div className="h-[320px] p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-slate-400">
              No security activity data available.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />

              <Tooltip />

              <Legend />

              <Area
                type="monotone"
                dataKey="successfulLogins"
                name="Successful Logins"
                stroke="#10b981"
                fill="#d1fae5"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="failedLogins"
                name="Failed Logins"
                stroke="#ef4444"
                fill="#fee2e2"
                strokeWidth={2}
              />

              <Area
                type="monotone"
                dataKey="suspiciousEvents"
                name="Suspicious Events"
                stroke="#f59e0b"
                fill="#fef3c7"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

export default AdminSecurityChart;