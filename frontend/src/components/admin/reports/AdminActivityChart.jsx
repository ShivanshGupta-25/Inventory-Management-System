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

const AdminActivityChart = ({ data = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          Administrative Activity
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Administrative actions recorded during the selected period.
        </p>
      </div>

      <div className="h-[320px] p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-slate-400">
              No administrative activity data available.
            </p>
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
                dataKey="created"
                name="Created"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="updated"
                name="Updated"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="statusChanged"
                name="Status Changes"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="roleChanged"
                name="Role Changes"
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

export default AdminActivityChart;