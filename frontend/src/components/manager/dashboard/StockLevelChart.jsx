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

const StockLevelChart = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Stock Level
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Inventory movement over the past week
          </p>
        </div>

        <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 outline-none">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
        </select>
      </div>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="day"
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