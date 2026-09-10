import {
  ShoppingBag,
  Clock3,
  PackageCheck,
  AlertTriangle,
} from "lucide-react";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const PurchaseOverview = ({ data }) => {
  if (!data) {
    return null;
  }

  const stats = [
    {
      label: "Total Orders",
      value: data.totalOrders ?? 0,
      icon: ShoppingBag,
    },
    {
      label: "Pending",
      value: data.pendingOrders ?? 0,
      icon: Clock3,
    },
    {
      label: "Partially Received",
      value:
        data.partiallyReceivedOrders ?? 0,
      icon: AlertTriangle,
    },
    {
      label: "Received",
      value: data.receivedOrders ?? 0,
      icon: PackageCheck,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Purchase Overview
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Current purchase order activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {item.label}
                </p>

                <Icon
                  size={15}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-2 text-xl font-bold text-slate-800">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Ordered Value
          </span>

          <span className="text-sm font-semibold text-slate-700">
            {formatCurrency(
              data.totalOrderedValue
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOverview;