import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  PackageX,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { getSmartAlerts } from "../../../services/analyticsService";

const SmartAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getSmartAlerts();

      setAlerts(result.data || []);
    } catch (err) {
      console.error("Smart alerts error:", err);

      setError(
        err.message || "Failed to load smart alerts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case "OUT_OF_STOCK":
        return <PackageX size={18} />;

      case "STOCKOUT_RISK":
        return <AlertTriangle size={18} />;

      case "HIGH_DEMAND":
        return <TrendingUp size={18} />;

      case "LOW_STOCK":
        return <AlertTriangle size={18} />;

      default:
        return <Info size={18} />;
    }
  };

  const getAlertStyle = (severity) => {
    switch (severity) {
      case "critical":
        return {
          container:
            "border-red-200 bg-red-50",
          icon:
            "bg-red-100 text-red-600",
          title:
            "text-red-800",
          badge:
            "bg-red-100 text-red-700",
        };

      case "warning":
        return {
          container:
            "border-amber-200 bg-amber-50",
          icon:
            "bg-amber-100 text-amber-600",
          title:
            "text-amber-800",
          badge:
            "bg-amber-100 text-amber-700",
        };

      default:
        return {
          container:
            "border-slate-200 bg-slate-50",
          icon:
            "bg-slate-200 text-slate-600",
          title:
            "text-slate-800",
          badge:
            "bg-slate-200 text-slate-600",
        };
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <Bell
              size={18}
              className="text-slate-700"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Smart Alerts
            </h2>

            <p className="text-sm text-slate-500">
              Inventory conditions that need your attention
            </p>
          </div>
        </div>

        <button
          onClick={loadAlerts}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[220px] items-center justify-center">
          <p className="text-sm text-slate-500">
            Analyzing inventory conditions...
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

      {/* No alerts */}
      {!loading && !error && alerts.length === 0 && (
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              size={24}
              className="text-emerald-600"
            />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            Everything looks good
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            No inventory alerts require attention right now.
          </p>
        </div>
      )}

      {/* Alerts */}
      {!loading && !error && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const styles = getAlertStyle(
              alert.severity
            );

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 ${styles.container}`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3
                          className={`text-sm font-semibold ${styles.title}`}
                        >
                          {alert.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {alert.message}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${styles.badge}`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    {/* Product */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        Product:{" "}
                        <span className="font-medium text-slate-700">
                          {alert.productName}
                        </span>
                      </span>

                      <span>
                        SKU:{" "}
                        <span className="font-medium text-slate-700">
                          {alert.sku}
                        </span>
                      </span>

                      {alert.currentStock !==
                        undefined && (
                        <span>
                          Stock:{" "}
                          <span className="font-medium text-slate-700">
                            {alert.currentStock}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    {alert.recommendedAction && (
                      <div className="mt-3 border-t border-slate-200/70 pt-3">
                        <p className="text-xs text-slate-500">
                          Recommended action:{" "}
                          <span className="font-semibold text-slate-700">
                            {alert.recommendedAction}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!loading && !error && alerts.length > 0 && (
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            {alerts.length} alert
            {alerts.length !== 1 ? "s" : ""} detected
          </p>

          <p className="text-xs text-slate-400">
            Based on current inventory and recent demand
          </p>
        </div>
      )}
    </section>
  );
};

export default SmartAlerts;