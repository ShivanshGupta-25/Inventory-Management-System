import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const CategoryPerformance = ({ data = [] }) => {
  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const totalRevenue = chartData.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Category Performance
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Item revenue distribution across product categories.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              No category data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Categories will appear after completed sales.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Donut */}
            <div className="h-[250px] w-full sm:w-1/2">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${210 + index * 18}, 25%, ${
                          35 + index * 5
                        }%)`}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: 10,
                      border:
                        "1px solid #e2e8f0",
                      boxShadow:
                        "0 4px 12px rgba(15,23,42,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Total */}
            <div className="text-center sm:w-1/2">
              <p className="text-xs text-slate-400">
                Item Revenue
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(totalRevenue)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {chartData.length} categories
              </p>
            </div>
          </div>

          {/* Category list */}
          <div className="mt-3 border-t border-slate-100 pt-4">
            <div className="space-y-2">
              {chartData.map((item, index) => {
                const percentage =
                  totalRevenue > 0
                    ? (item.revenue /
                        totalRevenue) *
                      100
                    : 0;

                return (
                  <div
                    key={
                      item.category ||
                      index
                    }
                    className="flex items-center gap-3"
                  >
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `hsl(${
                          210 + index * 18
                        }, 25%, ${
                          35 + index * 5
                        }%)`,
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate text-xs font-medium text-slate-600">
                          {item.category}
                        </p>

                        <p className="shrink-0 text-xs text-slate-400">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-400"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="w-24 text-right text-xs font-medium text-slate-700">
                      {formatCurrency(
                        item.revenue
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryPerformance;