import { ClipboardList, Minus, Plus } from "lucide-react";

import QuickAction from "./QuickAction";

const StaffQuickActions = ({ onNavigate }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-0.5 text-xs text-slate-400">
          Common inventory operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <QuickAction
          icon={Plus}
          title="Stock In"
          description="Add stock"
          onClick={() => onNavigate("/staff/stock-in")}
        />

        <QuickAction
          icon={Minus}
          title="Stock Out"
          description="Issue stock"
          onClick={() => onNavigate("/staff/stock-out")}
        />

        <QuickAction
          icon={ClipboardList}
          title="Request Stock"
          description="Create request"
          onClick={() =>
            onNavigate("/staff/purchase-requests/create")
          }
        />
      </div>
    </div>
  );
};

export default StaffQuickActions;