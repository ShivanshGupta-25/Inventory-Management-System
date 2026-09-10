import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Package,
  ShieldAlert,
} from "lucide-react";

import { getStockoutRisk } from "../../../services/analyticsService";

const StockoutRisk = ({ products = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(
    products?.[0]?.productId || ""
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedProduct) {
      setData(null);
      return;
    }

    const loadRisk = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getStockoutRisk(
          selectedProduct,
          30
        );

        setData(result.data);
      } catch (err) {
        console.error("Stockout risk error:", err);
        setError(
          err.message || "Failed to load stockout risk"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRisk();
  }, [selectedProduct]);

  const riskLevel = data?.risk?.level || "Safe";

  const getRiskIcon = () => {
    if (riskLevel === "Critical") {
      return (
        <ShieldAlert
          size={20}
          className="text-red-600"
        />
      );
    }

    if (riskLevel === "Warning") {
      return (
        <AlertTriangle
          size={20}
          className="text-amber-600"
        />
      );
    }

    return (
      <CheckCircle2
        size={20}
        className="text-emerald-600"
      />
    );
  };

  const getRiskStyles = () => {
    if (riskLevel === "Critical") {
      return {
        container:
          "border-red-200 bg-red-50",
        badge:
          "bg-red-100 text-red-700",
      };
    }

    if (riskLevel === "Warning") {
      return {
        container:
          "border-amber-200 bg-amber-50",
        badge:
          "bg-amber-100 text-amber-700",
      };
    }

    return {
      container:
        "border-emerald-200 bg-emerald-50",
      badge:
        "bg-emerald-100 text-emerald-700",
    };
  };

  const styles = getRiskStyles();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <ShieldAlert
                size={18}
                className="text-slate-700"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Stockout Risk
              </h2>

              <p className="text-sm text-slate-500">
                Identify products at risk of running out
              </p>
            </div>
          </div>
        </div>

        <select
          value={selectedProduct}
          onChange={(e) =>
            setSelectedProduct(e.target.value)
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {products.length === 0 ? (
            <option value="">
              No products available
            </option>
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
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[260px] items-center justify-center">
          <p className="text-sm text-slate-500">
            Calculating stockout risk...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Data */}
      {!loading && !error && data && (
        <div className="space-y-5">
          {/* Risk banner */}
          <div
            className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${styles.container}`}
          >
            <div className="flex items-center gap-3">
              {getRiskIcon()}

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Stockout Risk
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {riskLevel}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
            >
              {riskLevel === "Critical"
                ? "Immediate attention"
                : riskLevel === "Warning"
                ? "Monitor closely"
                : "Stock level is healthy"}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Package size={15} />
                Available Stock
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {data.stock?.availableStock ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                after reservations
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Clock3 size={15} />
                Days Remaining
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {data.risk?.daysUntilStockout === null
                  ? "—"
                  : `${data.risk.daysUntilStockout}`}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                estimated
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 text-xs font-medium text-slate-500">
                Avg. Daily Demand
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {Number(
                  data.demand?.averageDailyDemand || 0
                ).toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                units / day
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 text-xs font-medium text-slate-500">
                Projected Stock
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {data.risk?.projectedStock ?? 0}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                after 30 days
              </p>
            </div>
          </div>

          {/* Product details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-slate-400">
                  Product
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {data.product?.productName}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  SKU
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {data.product?.sku}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Minimum Stock
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {data.stock?.minStock}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Units Sold — 30d
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {data.demand?.unitsSold}
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-semibold text-slate-700">
                How this works:
              </span>{" "}
              stockout risk is estimated using available stock
              and the product's recent average daily demand.
              Products with fewer than 14 days of estimated
              stock remaining are flagged for attention.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="flex min-h-[250px] items-center justify-center">
          <p className="text-sm text-slate-500">
            Select a product to calculate stockout risk.
          </p>
        </div>
      )}
    </section>
  );
};

export default StockoutRisk;