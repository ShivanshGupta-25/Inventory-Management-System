import {
  Boxes,
  PackageCheck,
  AlertTriangle,
  PackageX,
} from "lucide-react";

const StockSummaryCards = ({ inventory }) => {
  const total = inventory.length;

  const inStock = inventory.filter(
    (item) => item.status === "In Stock"
  ).length;

  const lowStock = inventory.filter(
    (item) => item.status === "Low Stock"
  ).length;

  const outOfStock = inventory.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  const cards = [
    {
      title: "Total Products",
      value: total,
      icon: Boxes,
      description: "Products tracked",
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "In Stock",
      value: inStock,
      icon: PackageCheck,
      description: "Healthy stock levels",
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Low Stock",
      value: lowStock,
      icon: AlertTriangle,
      description: "Needs attention",
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Out of Stock",
      value: outOfStock,
      icon: PackageX,
      description: "Requires replenishment",
      iconStyle: "bg-red-50 text-red-600",
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
                <p className="text-xs font-medium text-slate-500">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {card.value}
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconStyle}`}
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

export default StockSummaryCards;