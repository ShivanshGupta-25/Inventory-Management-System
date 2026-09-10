import {
  IndianRupee,
  ShoppingCart,
  Package,
  Boxes,
} from "lucide-react";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const AnalyticsKpiCards = ({ data }) => {
  const cards = [
    {
      title: "Revenue",
      value: formatCurrency(data.sales.revenue),
      description: `${data.sales.orders} completed orders`,
      icon: IndianRupee,
    },
    {
      title: "Items Sold",
      value: data.sales.itemsSold,
      description: `Avg. order ${formatCurrency(
        data.sales.averageOrderValue
      )}`,
      icon: ShoppingCart,
    },
    {
      title: "Inventory Value",
      value: formatCurrency(
        data.inventory.inventoryValue
      ),
      description: `${data.inventory.totalProducts} active products`,
      icon: Package,
    },
    {
      title: "Purchase Orders",
      value: data.purchases.totalOrders,
      description: formatCurrency(
        data.purchases.totalOrderedValue
      ),
      icon: Boxes,
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
                <p className="text-xs font-medium text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-2.5">
                <Icon
                  size={19}
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

export default AnalyticsKpiCards;