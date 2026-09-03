import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", stock: 14200 },
  { day: "Tue", stock: 15100 },
  { day: "Wed", stock: 14800 },
  { day: "Thu", stock: 16200 },
  { day: "Fri", stock: 15800 },
  { day: "Sat", stock: 17400 },
  { day: "Sun", stock: 18420 },
];

const formatStock = (value) => {
  if (value >= 1000) {
    return `${value / 1000}K`;
  }

  return value;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {payload[0].value.toLocaleString("en-IN")} units
      </p>
    </div>
  );
};

const StockLevelChart = () => {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Stock Level
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Inventory movement over the past week
          </p>
        </div>

        <select className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
        </select>
      </div>

      {/* Chart */}
      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: -15,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="day"
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
              tickFormatter={formatStock}
              width={38}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#cbd5e1" }}
            />

            <Area
              type="monotone"
              dataKey="stock"
              stroke="#2563eb"
              fill="#dbeafe"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockLevelChart;