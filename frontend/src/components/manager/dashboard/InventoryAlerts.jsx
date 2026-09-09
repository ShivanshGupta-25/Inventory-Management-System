import {
  AlertTriangle,
  Info,
  PackageX,
  ShoppingCart,
} from "lucide-react";

const InventoryAlerts = ({ data = [] }) => {
  const getAlertConfig = (alert) => {
    switch (alert.type) {
      case "OUT_OF_STOCK":
        return {
          icon: PackageX,
          container:
            "bg-red-50 text-red-600",
        };

      case "LOW_STOCK":
        return {
          icon: AlertTriangle,
          container:
            "bg-amber-50 text-amber-600",
        };

      case "PENDING_PURCHASE":
        return {
          icon: ShoppingCart,
          container:
            "bg-blue-50 text-blue-600",
        };

      default:
        return {
          icon: Info,
          container:
            "bg-slate-50 text-slate-600",
        };
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={17}
            className="text-amber-500"
          />

          <h2 className="text-sm font-semibold text-slate-900">
            Inventory Alerts
          </h2>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          Important inventory notifications
        </p>
      </div>

      {/* Alerts */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Info size={18} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            No active alerts
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Your inventory currently looks healthy.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.map((alert, index) => {
            const {
              icon: Icon,
              container,
            } = getAlertConfig(alert);

            return (
              <div
                key={
                  alert.productId ||
                  alert.orderId ||
                  `${alert.type}-${index}`
                }
                className="flex gap-3 px-5 py-4"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${container}`}
                >
                  <Icon size={15} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700">
                    {alert.title}
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-400">
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
