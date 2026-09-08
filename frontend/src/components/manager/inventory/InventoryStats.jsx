import {
  Package,
  Boxes,
  AlertTriangle,
  CircleX,
} from "lucide-react";

const InventoryStats = ({ stats }) => {
  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: "Products in inventory",
    },

    {
      title: "Total Stock",
      value: stats.totalStock,
      icon: Boxes,
      description: "Total available units",
    },

    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      description: "Products need attention",
    },

    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: CircleX,
      description: "Products unavailable",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {card.value}
                </h3>
              </div>

              <div className="rounded-xl bg-gray-100 p-3">
                <Icon
                  size={22}
                  className="text-gray-700"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryStats;