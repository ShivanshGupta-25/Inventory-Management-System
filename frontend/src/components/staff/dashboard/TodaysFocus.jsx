import {
  AlertTriangle,
  ClipboardList,
  Clock,
} from "lucide-react";

import FocusItem from "./FocusItem";

const TodaysFocus = ({ onNavigate }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Today's Focus
        </h2>

        <p className="mt-0.5 text-xs text-slate-400">
          Recommended operational tasks
        </p>
      </div>

      <div className="space-y-3 p-5">
        <FocusItem
          icon={AlertTriangle}
          title="Check low-stock items"
          description="Review products below their minimum stock level."
          onClick={() =>
            onNavigate("/staff/inventory")
          }
        />

        <FocusItem
          icon={ClipboardList}
          title="Review purchase requests"
          description="Check requests waiting for action."
          onClick={() =>
            onNavigate("/staff/purchase-requests")
          }
        />

        <FocusItem
          icon={Clock}
          title="Review recent activity"
          description="Verify today's stock movements."
          onClick={() =>
            onNavigate("/staff/stock-history")
          }
        />
      </div>
    </div>
  );
};

export default TodaysFocus;