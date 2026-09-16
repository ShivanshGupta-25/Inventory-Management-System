
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  PackageX,
  Search,
  ShoppingCart,
  X,
  XCircle,
} from "lucide-react";

const InventoryAlerts = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const getAlertConfig = (alert) => {
    switch (alert.type) {
      case "OUT_OF_STOCK":
        return {
          label: "Out of Stock",
          severity: "CRITICAL",
          icon: PackageX,
          iconContainer: "bg-red-50 text-red-600",
          badge: "bg-red-50 text-red-600",
          border: "border-l-red-500",
        };

      case "LOW_STOCK":
        return {
          label: "Low Stock",
          severity: "WARNING",
          icon: AlertTriangle,
          iconContainer: "bg-amber-50 text-amber-600",
          badge: "bg-amber-50 text-amber-600",
          border: "border-l-amber-500",
        };

      case "PENDING_PURCHASE":
        return {
          label: "Pending Purchase",
          severity: "INFO",
          icon: ShoppingCart,
          iconContainer: "bg-blue-50 text-blue-600",
          badge: "bg-blue-50 text-blue-600",
          border: "border-l-blue-500",
        };

      default:
        return {
          label: alert.type || "System Alert",
          severity: "INFO",
          icon: Info,
          iconContainer: "bg-slate-50 text-slate-600",
          badge: "bg-slate-50 text-slate-600",
          border: "border-l-slate-400",
        };
    }
  };

  const getAlertId = (alert, index) => {
    return (
      alert._id ||
      alert.id ||
      alert.productId ||
      alert.orderId ||
      `${alert.type || "ALERT"}-${index}`
    );
  };

  const formatTime = (date) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    const difference = Date.now() - parsedDate.getTime();
    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const activeAlerts = useMemo(() => {
    return data
      .map((alert, index) => ({
        ...alert,
        internalId: getAlertId(alert, index),
      }))
      .filter((alert) => !dismissedAlerts.includes(alert.internalId));
  }, [data, dismissedAlerts]);

  const filteredAlerts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return activeAlerts.filter((alert) => {
      const config = getAlertConfig(alert);

      const searchableText = [
        alert.title,
        alert.message,
        alert.type,
        alert.productName,
        alert.product?.productName,
        alert.sku,
        alert.product?.sku,
        config.label,
        config.severity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

      const matchesSeverity =
        severityFilter === "ALL" ||
        config.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [activeAlerts, searchTerm, severityFilter]);

  const severityCounts = useMemo(() => {
    return activeAlerts.reduce(
      (counts, alert) => {
        const severity = getAlertConfig(alert).severity;

        counts[severity] = (counts[severity] || 0) + 1;

        return counts;
      },
      {
        CRITICAL: 0,
        WARNING: 0,
        INFO: 0,
      }
    );
  }, [activeAlerts]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts((previous) => [
      ...previous,
      alertId,
    ]);
  };

  const restoreAlerts = () => {
    setDismissedAlerts([]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSeverityFilter("ALL");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || severityFilter !== "ALL";

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle size={16} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Inventory Alerts
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {activeAlerts.length}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Monitor important inventory notifications
                </p>
              </div>
            </div>

            {dismissedAlerts.length > 0 && (
              <button
                type="button"
                onClick={restoreAlerts}
                className="shrink-0 text-[11px] font-medium text-blue-600 transition hover:text-blue-700"
              >
                Restore
              </button>
            )}
          </div>

          {/* Severity Summary */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSeverityFilter("CRITICAL")}
              className={`rounded-lg border px-2 py-2 text-left transition ${
                severityFilter === "CRITICAL"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-100 bg-slate-50 hover:border-red-100"
              }`}
            >
              <p className="text-[10px] font-medium text-slate-400">
                Critical
              </p>

              <p className="mt-1 text-base font-semibold text-red-600">
                {severityCounts.CRITICAL}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSeverityFilter("WARNING")}
              className={`rounded-lg border px-2 py-2 text-left transition ${
                severityFilter === "WARNING"
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-100 bg-slate-50 hover:border-amber-100"
              }`}
            >
              <p className="text-[10px] font-medium text-slate-400">
                Warning
              </p>

              <p className="mt-1 text-base font-semibold text-amber-600">
                {severityCounts.WARNING}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSeverityFilter("INFO")}
              className={`rounded-lg border px-2 py-2 text-left transition ${
                severityFilter === "INFO"
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-100 bg-slate-50 hover:border-blue-100"
              }`}
            >
              <p className="text-[10px] font-medium text-slate-400">
                Info
              </p>

              <p className="mt-1 text-base font-semibold text-blue-600">
                {severityCounts.INFO}
              </p>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search alerts..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear alert search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Alerts</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Content */}
      {activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            No active alerts
          </p>

          <p className="mt-1 max-w-[250px] text-xs leading-5 text-slate-400">
            Your inventory currently looks healthy. New
            notifications will appear here.
          </p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-500">
            <Search size={19} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            No matching alerts
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try changing your search or severity filter.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="max-h-[470px] divide-y divide-slate-100 overflow-y-auto">
          {filteredAlerts.map((alert) => {
            const {
              label,
              severity,
              icon: Icon,
              iconContainer,
              badge,
              border,
            } = getAlertConfig(alert);

            return (
              <div
                key={alert.internalId}
                className={`group border-l-4 ${border} px-4 py-4 transition hover:bg-slate-50/70 sm:px-5`}
              >
                <div className="flex items-start gap-3">
                  {/* Alert Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconContainer}`}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Alert Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold leading-5 text-slate-800">
                        {alert.title || label}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          dismissAlert(alert.internalId)
                        }
                        aria-label="Dismiss alert"
                        className="shrink-0 rounded-md p-1 text-slate-300 opacity-100 transition hover:bg-slate-200 hover:text-slate-600 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {alert.message ||
                        "An inventory event requires your attention."}
                    </p>

                    {/* Metadata */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-semibold ${badge}`}
                      >
                        {label}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock3 size={11} />
                        {formatTime(
                          alert.createdAt ||
                            alert.updatedAt ||
                            alert.timestamp
                        )}
                      </span>

                      {alert.sku && (
                        <span className="text-[10px] text-slate-400">
                          SKU: {alert.sku}
                        </span>
                      )}

                      {alert.product?.sku && (
                        <span className="text-[10px] text-slate-400">
                          SKU: {alert.product.sku}
                        </span>
                      )}
                    </div>

                    {/* Product Information */}
                    {(alert.productName ||
                      alert.product?.productName) && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <PackageX size={11} />

                        <span className="truncate">
                          {alert.productName ||
                            alert.product.productName}
                        </span>
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
      {activeAlerts.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-[10px] text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filteredAlerts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {activeAlerts.length}
            </span>{" "}
            alerts
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;