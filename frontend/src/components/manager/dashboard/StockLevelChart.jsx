import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatStock = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value;
};

const formatDate = (date) => {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "short",
  });
};

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const value = payload[0]?.value || 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400">
        {new Date(
          `${label}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value.toLocaleString("en-IN")} units
      </p>
    </div>
  );
};

const StockLevelChart = ({ data }) => {
  if (!data) {
    return null;
  }

  const stockTrend = data.stockTrend || [];

  const chartData = stockTrend.map(
    (item) => ({
      ...item,
      day: formatDate(item.date),
    })
  );

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Stock Level
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Inventory level over the past week
          </p>
        </div>

        <select
          disabled
          className="cursor-not-allowed rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500 outline-none"
        >
          <option>Last 7 days</option>
        </select>
      </div>

      {/* Empty State */}
      {chartData.length === 0 ? (
        <div className="flex h-52 items-center justify-center">
          <p className="text-sm text-slate-400">
            No stock movement data available.
          </p>
        </div>
      ) : (
        /* Chart */
        <div className="mt-4 h-52">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
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
                width={42}
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
                cursor={{
                  stroke: "#cbd5e1",
                }}
              />

              <Area
                type="monotone"
                dataKey="stock"
                stroke="#2563eb"
                fill="#dbeafe"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Current Stock */}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Current stock
          </span>

          <span className="text-xs font-semibold text-slate-700">
            {(
              data.totalStock || 0
            ).toLocaleString("en-IN")}{" "}
            units
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockLevelChart;
