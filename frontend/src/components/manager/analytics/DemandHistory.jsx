import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  BarChart3,
  Package,
  TrendingUp,
} from "lucide-react";

import { getDemandHistory } from "../../../services/analyticsService";

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(
    value || 0
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const DemandHistory = ({
  period = "30d",
  products = [],
}) => {
  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [data, setData] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const fetchDemandHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await getDemandHistory(
          period,
          selectedProduct
        );

      setData(result.data || []);
    } catch (err) {
      console.error(
        "Failed to load demand history:",
        err
      );

      setError(
        err.message ||
          "Unable to load demand history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandHistory();
  }, [period, selectedProduct]);

  /*
   * When no product is selected, the API returns
   * multiple products. For the chart we aggregate
   * them into total daily demand.
   */
  const chartData = useMemo(() => {
    if (selectedProduct) {
      return data.map((item) => ({
        date: item.date,
        unitsSold: item.unitsSold,
        revenue: item.revenue,
      }));
    }

    const grouped = {};

    data.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = {
          date: item.date,
          unitsSold: 0,
          revenue: 0,
        };
      }

      grouped[item.date].unitsSold +=
        item.unitsSold || 0;

      grouped[item.date].revenue +=
        item.revenue || 0;
    });

    return Object.values(grouped).sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );
  }, [data, selectedProduct]);

  const summary = useMemo(() => {
    return chartData.reduce(
      (result, item) => {
        result.unitsSold +=
          item.unitsSold || 0;

        result.revenue +=
          item.revenue || 0;

        return result;
      },
      {
        unitsSold: 0,
        revenue: 0,
      }
    );
  }, [chartData]);

  const selectedProductData =
    data[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-100 p-2.5">
            <BarChart3
              size={18}
              className="text-slate-600"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Demand History
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Daily product demand based on completed sales.
            </p>
          </div>
        </div>

        {/* Product Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400">
            Product
          </label>

          <select
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value
              )
            }
            className="min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="">
              All Products
            </option>

            {products.map((product) => (
              <option
                key={
                  product.productId ||
                  product.sku
                }
                value={
                  product.productId
                }
              >
                {product.productName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product info */}
      {selectedProduct &&
        selectedProductData && (
          <div className="mt-4 flex items-center gap-2">
            <Package
              size={14}
              className="text-slate-400"
            />

            <span className="text-xs text-slate-500">
              {selectedProductData.productName}
            </span>

            <span className="text-xs text-slate-300">
              •
            </span>

            <span className="text-xs text-slate-400">
              {selectedProductData.sku}
            </span>
          </div>
        )}

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDemandHistory}
            className="mt-2 text-xs font-medium text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex h-[340px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

            <p className="text-sm font-medium text-slate-600">
              Loading demand history...
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading &&
        !error &&
        chartData.length > 0 && (
          <>
            {/* Summary */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Units Sold
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {formatNumber(
                    summary.unitsSold
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Item Revenue
                </p>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {formatCurrency(
                    summary.revenue
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Avg. Daily Demand
                  </p>

                  <TrendingUp
                    size={14}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-1 text-xl font-bold text-slate-800">
                  {(
                    summary.unitsSold /
                    chartData.length
                  ).toFixed(1)}
                </p>

                <p className="text-[11px] text-slate-400">
                  units / day
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="mt-5 h-[330px] w-full">
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
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                    tickFormatter={(value) =>
                      new Date(
                        value
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )
                    }
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                  />

                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(
                        value
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    }
                    formatter={(value, name) => {
                      if (
                        name ===
                        "unitsSold"
                      ) {
                        return [
                          `${value} units`,
                          "Demand",
                        ];
                      }

                      return [
                        formatCurrency(value),
                        "Revenue",
                      ];
                    }}
                    contentStyle={{
                      borderRadius: 10,
                      border:
                        "1px solid #e2e8f0",
                      boxShadow:
                        "0 4px 12px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="unitsSold"
                    stroke="#475569"
                    fill="#e2e8f0"
                    strokeWidth={2}
                    activeDot={{
                      r: 5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

      {/* Empty */}
      {!loading &&
        !error &&
        chartData.length === 0 && (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <Package
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No demand data available
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Completed sales will appear here.
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default DemandHistory;