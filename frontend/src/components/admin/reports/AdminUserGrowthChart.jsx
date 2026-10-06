import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AdminUserGrowthChart = ({ data = [] }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            User Growth
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            User population over the selected period.
          </p>
        </div>
      </div>

      <div className="h-[320px] p-4 sm:p-6">
        {data.length === 0 ? (
          <EmptyChart message="No user growth data available." />
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

              <Area
                type="monotone"
                dataKey="users"
                stroke="#7c3aed"
                fill="#ede9fe"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

const EmptyChart = ({ message }) => (
  <div className="flex h-full items-center justify-center">
    <p className="text-xs text-slate-400">{message}</p>
  </div>
);

export default AdminUserGrowthChart;