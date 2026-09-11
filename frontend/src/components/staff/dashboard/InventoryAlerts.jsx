import { Bell, ChevronRight } from "lucide-react";

import AlertItem from "./AlertItem";
import EmptyState from "./EmptyState";

const InventoryAlerts = ({
  alerts = [],
  onViewAll,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Inventory Alerts
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Items requiring attention
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="p-4">
        {alerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            message="No active inventory alerts"
          />
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <AlertItem
                key={alert._id || alert.id || index}
                alert={alert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAlerts;