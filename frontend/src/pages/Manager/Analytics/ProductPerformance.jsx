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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const ProductPerformance = ({ data = [] }) => {
  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      name:
        item.productName?.length > 18
          ? `${item.productName.substring(0, 18)}...`
          : item.productName,
    }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Product Performance
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Top products based on revenue generated.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              No product sales available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Product performance will appear after completed sales.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 15,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#94a3b8",
                  }}
                  tickFormatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatCurrency(value),
                    "Revenue",
                  ]}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 4px 12px rgba(15,23,42,0.08)",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  fill="#475569"
                  radius={[0, 5, 5, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product details */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-3 gap-3 text-xs font-medium text-slate-400">
              <span>Product</span>
              <span className="text-center">
                Units
              </span>
              <span className="text-right">
                Revenue
              </span>
            </div>

            <div className="mt-2 space-y-2">
              {chartData.slice(0, 5).map((item) => (
                <div
                  key={
                    item._id ||
                    item.sku ||
                    item.productName
                  }
                  className="grid grid-cols-3 items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">
                      {item.productName}
                    </p>

                    {item.sku && (
                      <p className="text-[11px] text-slate-400">
                        {item.sku}
                      </p>
                    )}
                  </div>

                  <p className="text-center text-slate-600">
                    {item.unitsSold}
                  </p>

                  <p className="text-right font-medium text-slate-700">
                    {formatCurrency(
                      item.revenue
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPerformance;