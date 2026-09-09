import {
  ClipboardList,
  Clock3,
  PackageCheck,
  IndianRupee,
} from "lucide-react";

const PurchaseOrderStats = ({ orders = [] }) => {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "Pending"
  ).length;

  const receivedOrders = orders.filter(
    (order) =>
      order.status === "Received"
  ).length;

  const totalValue = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      description: "All purchase orders",
      icon: ClipboardList,
    },
    {
      label: "Pending",
      value: pendingOrders,
      description: "Awaiting delivery",
      icon: Clock3,
    },
    {
      label: "Received",
      value: receivedOrders,
      description: "Completed orders",
      icon: PackageCheck,
    },
    {
      label: "Purchase Value",
      value: `₹${totalValue.toLocaleString(
        "en-IN"
      )}`,
      description: "Total order value",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <Icon
                  size={20}
                  className="text-slate-600"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseOrderStats;