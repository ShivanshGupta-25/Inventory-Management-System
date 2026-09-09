import {
  IndianRupee,
  ShoppingCart,
  Package,
} from "lucide-react";

const SalesStats = ({ stats }) => {
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${Number(
        stats?.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      description: "Revenue from completed sales",
      icon: IndianRupee,
    },

    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      description: "Completed sales transactions",
      icon: ShoppingCart,
    },

    {
      title: "Items Sold",
      value: stats?.itemsSold || 0,
      description: "Total units sold",
      icon: Package,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <Icon
                  size={22}
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

export default SalesStats;