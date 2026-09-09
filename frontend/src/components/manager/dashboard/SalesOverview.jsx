import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${value}`;
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

  const revenue = payload[0]?.value || 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-slate-500">
        {new Date(
          `${label}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        ₹{revenue.toLocaleString("en-IN")}
      </p>
    </div>
  );
};

const SalesOverview = ({ data }) => {
  if (!data) {
    return null;
  }

  const trend = data.trend || [];

  const chartData = trend.map((item) => ({
    ...item,
    day: formatDate(item.date),
  }));

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Sales Overview
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Revenue performance · Last 7 days
          </p>
        </div>

        {/* Current Revenue */}
        <div className="rounded-md bg-emerald-50 px-2 py-1 text-right">
          <p className="text-[10px] text-emerald-600">
            Revenue
          </p>

          <span className="text-xs font-semibold text-emerald-700">
            {formatCurrency(
              data.totalRevenue || 0
            )}
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="flex h-52 items-center justify-center">
          <p className="text-sm text-slate-400">
            No sales data available.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-52">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
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
                tickFormatter={formatCurrency}
                width={45}
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
                cursor={{
                  fill: "#f8fafc",
                }}
              />

              <Bar
                dataKey="revenue"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400">
              Total sales
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {(
                data.totalSales || 0
              ).toLocaleString("en-IN")}{" "}
              orders
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400">
              Today
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {formatCurrency(
                data.todayRevenue || 0
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;