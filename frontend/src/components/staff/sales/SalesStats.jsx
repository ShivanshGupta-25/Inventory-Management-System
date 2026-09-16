import {
  IndianRupee,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";

const SalesStats = ({ stats = {} }) => {
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${Number(stats.salesValue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: Number(stats.orders || 0).toLocaleString("en-IN"),
      icon: ShoppingCart,
    },
    {
      title: "Items Sold",
      value: Number(stats.itemsSold || 0).toLocaleString("en-IN"),
      icon: Package,
    },
    {
      title: "Outstanding",
      value: `₹${Number(stats.outstanding || 0).toLocaleString("en-IN")}`,
      icon: Wallet,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {card.value}
                </h3>
              </div>

              <div className="rounded-lg bg-slate-100 p-3">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SalesStats;