import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  PackageX,
} from "lucide-react";

const alerts = [
  {
    title: "8 products are out of stock",
    description: "Immediate replenishment required.",
    icon: PackageX,
  },
  {
    title: "Demand increased by 24%",
    description: "Wireless accessories category.",
    icon: TrendingUp,
  },
  {
    title: "Potential overstock detected",
    description: "12 products have excess inventory.",
    icon: TrendingDown,
  },
];

const InventoryAlerts = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
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
          Important inventory insights
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {alerts.map((alert) => {
          const Icon = alert.icon;

          return (
            <div
              key={alert.title}
              className="flex gap-3 px-5 py-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Icon size={15} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  {alert.title}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {alert.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryAlerts; 