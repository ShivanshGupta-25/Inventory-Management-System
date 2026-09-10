import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Brain,
  Package,
  TrendingUp,
} from "lucide-react";

import { getDemandForecast } from "../../../services/analyticsService";

const DemandForecast = ({ products = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(
    products?.[0]?.productId || ""
  );

  const [forecastDays, setForecastDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedProduct) {
      setData(null);
      return;
    }

    const loadForecast = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getDemandForecast(
          selectedProduct,
          "30d",
          forecastDays
        );

        setData(result.data);
      } catch (err) {
        console.error("Forecast error:", err);
        setError(err.message || "Failed to load demand forecast");
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [selectedProduct, forecastDays]);

  const chartData = useMemo(() => {
    if (!data) return [];

    const history = (data.history || []).map((item) => ({
      date: item.date,
      actual: item.unitsSold,
      forecast: null,
      type: "Historical",
    }));

    const forecast = (data.forecast || []).map((item) => ({
      date: item.date,
      actual: null,
      forecast: item.forecastedUnits,
      type: "Forecast",
    }));

    return [...history, ...forecast];
  }, [data]);

  const formatDate = (date) => {
    if (!date) return "";

    const parsed = new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const demandLevel = data?.demandLevel || "Low";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Brain size={18} className="text-slate-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Demand Forecast
              </h2>

              <p className="text-sm text-slate-500">
                Baseline demand prediction for inventory planning
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            {products.length === 0 ? (
              <option value="">No products available</option>
            ) : (
              products.map((product) => (
                <option
                  key={product.productId}
                  value={product.productId}
                >
                  {product.productName}
                </option>
              ))
            )}
          </select>

          <select
            value={forecastDays}
            onChange={(e) => setForecastDays(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-sm text-slate-500">
            Calculating demand forecast...
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <AlertTriangle
              className="mx-auto mb-2 text-red-500"
              size={22}
            />

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          {/* KPI cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Package size={15} />
                Current Stock
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {data.inventory?.currentStock ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {data.inventory?.unit || "units"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <TrendingUp size={15} />
                Avg. Daily Demand
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {Number(data.baseline?.averageDailyDemand || 0).toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                units / day
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Brain size={15} />
                Forecasted Demand
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {Number(data.totalForecast || 0).toFixed(1)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                next {forecastDays} days
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <AlertTriangle size={15} />
                Demand Level
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {demandLevel}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                baseline classification
              </p>
            </div>
          </div>

          {/* Product information */}
          <div className="mb-5 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {data.product?.productName}
              </p>

              <p className="text-xs text-slate-500">
                SKU: {data.product?.sku}
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Forecast method:{" "}
              <span className="font-medium text-slate-700">
                {data.baseline?.method || "Moving Average"}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Historical Demand vs Forecast
              </h3>

              <p className="text-xs text-slate-400">
                Actual sales history followed by projected demand
              </p>
            </div>

            <div className="h-[330px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    labelFormatter={(label) => formatDate(label)}
                    formatter={(value, name) => [
                      value,
                      name === "actual"
                        ? "Actual Demand"
                        : "Forecast",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="actual"
                    strokeWidth={2}
                    fillOpacity={0.12}
                    name="actual"
                  />

                  <Area
                    type="monotone"
                    dataKey="forecast"
                    strokeWidth={2}
                    fillOpacity={0.12}
                    name="forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-semibold text-slate-700">
                Forecast note:
              </span>{" "}
              This is currently a baseline moving-average forecast.
              It is being used as a benchmark before introducing the
              trained ML forecasting model.
            </p>
          </div>
        </>
      )}

      {/* Empty */}
      {!loading && !error && !data && (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-sm text-slate-500">
            Select a product to view its demand forecast.
          </p>
        </div>
      )}
    </section>
  );
};

export default DemandForecast;