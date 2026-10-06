import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AdminSystemHealthChart = ({ data = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          System Health Trend
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Historical infrastructure and database health measurements.
        </p>
      </div>

      <div className="h-[320px] p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-600">
                Historical health data is not available yet.
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Health snapshots will populate this report once historical
                monitoring is enabled.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fill: "#94a3b8",
                }}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="memoryUsage"
                name="Memory Usage %"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="cpuUsage"
                name="CPU Usage %"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="databaseHealth"
                name="Database Health %"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

export default AdminSystemHealthChart;