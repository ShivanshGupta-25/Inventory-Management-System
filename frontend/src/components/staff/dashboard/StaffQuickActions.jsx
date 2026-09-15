import {
  ArrowLeftRight,
  Package,
  Bell,
  History,
} from "lucide-react";

import QuickAction from "./QuickAction";

const StaffQuickActions = ({
  onNavigate,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* HEADER */}

      <div className="mb-5">
        <h2 className="text-sm font-bold text-slate-800">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Quickly access common inventory operations.
        </p>
      </div>

      {/* ACTIONS */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        <QuickAction
          icon={ArrowLeftRight}
          title="Stock Operation"
          description="Manage stock in and stock out."
          onClick={() =>
            onNavigate(
              "/staff/stock-operations"
            )
          }
        />

        <QuickAction
          icon={Package}
          title="View Inventory"
          description="Browse current inventory and products."
          onClick={() =>
            onNavigate(
              "/staff/inventory"
            )
          }
        />

        <QuickAction
          icon={Bell}
          title="View Alerts"
          description="Check low stock and inventory alerts."
          onClick={() =>
            onNavigate(
              "/staff/alerts"
            )
          }
        />

        <QuickAction
          icon={History}
          title="View History"
          description="Review recent stock activities."
          onClick={() =>
            onNavigate(
              "/staff/stock-history"
            )
          }
        />

      </div>
    </div>
  );
};

export default StaffQuickActions;