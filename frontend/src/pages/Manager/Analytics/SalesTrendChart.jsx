import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
};

const SalesTrendChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    ...item,
    label: new Date(
      item.date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Sales Trend
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Revenue and order activity over the selected period.
          </p>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              No sales data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Completed sales will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
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
                tickFormatter={formatCurrency}
              />

              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") {
                    return [
                      formatCurrency(value),
                      "Revenue",
                    ];
                  }

                  return [value, "Orders"];
                }}
                labelStyle={{
                  color: "#0f172a",
                  fontSize: 12,
                }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow:
                    "0 4px 12px rgba(15,23,42,0.08)",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#334155"
                fill="#e2e8f0"
                strokeWidth={2}
                activeDot={{
                  r: 5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SalesTrendChart;