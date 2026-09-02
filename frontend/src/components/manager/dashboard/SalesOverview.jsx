import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 48000 },
  { month: "Mar", sales: 45000 },
  { month: "Apr", sales: 57000 },
  { month: "May", sales: 61000 },
  { month: "Jun", sales: 68000 },
];

const SalesOverview = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Sales Overview
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Revenue performance
          </p>
        </div>

        <span className="text-sm font-semibold text-emerald-600">
          +14.8%
        </span>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#94a3b8",
              }}
            />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#2563eb"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverview;