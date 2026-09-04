import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";

import { calculateSaleTotal } from "../../../data/salesData";

const SalesStats = ({ sales }) => {
  const totalSales = sales.length;

  const completedSales = sales.filter(
    (sale) => sale.status === "Completed"
  ).length;

  const pendingSales = sales.filter(
    (sale) => sale.status === "Pending"
  ).length;

  const revenue = sales
    .filter((sale) => sale.status === "Completed")
    .reduce(
      (total, sale) => total + calculateSaleTotal(sale),
      0
    );

  const stats = [
    {
      label: "Total Sales",
      value: totalSales,
      icon: ShoppingCart,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Revenue",
      value: `₹${revenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Completed",
      value: completedSales,
      icon: CheckCircle2,
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Pending",
      value: pendingSales,
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconClass}`}
              >
                <Icon size={19} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SalesStats;