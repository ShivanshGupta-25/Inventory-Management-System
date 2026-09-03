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

const formatCurrency = (value) => {
  if (value >= 100000) return `₹${value / 100000}L`;
  if (value >= 1000) return `₹${value / 1000}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const SalesOverview = () => {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Sales Overview
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Revenue performance · Last 6 months
          </p>
        </div>

        <div className="rounded-md bg-emerald-50 px-2 py-1">
          <span className="text-xs font-semibold text-emerald-600">
            +14.8%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: -15,
              bottom: 0,
            }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "#94a3b8",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "#94a3b8",
              }}
              tickFormatter={formatCurrency}
              width={45}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f8fafc" }}
            />

            <Bar
              dataKey="sales"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverview;