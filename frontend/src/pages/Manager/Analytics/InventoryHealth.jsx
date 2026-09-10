import {
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const InventoryHealth = ({ data }) => {
  const health = data?.health || {};

  const cards = [
    {
      label: "In Stock",
      value: health.inStock ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Low Stock",
      value: health.lowStock ?? 0,
      icon: AlertTriangle,
    },
    {
      label: "Out of Stock",
      value: health.outOfStock ?? 0,
      icon: XCircle,
    },
    {
      label: "Overstock",
      value: health.overstock ?? 0,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Inventory Health
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Current stock condition across your inventory.
          </p>
        </div>

        <div className="rounded-lg bg-slate-100 p-2">
          <Package
            size={18}
            className="text-slate-600"
          />
        </div>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {card.label}
                </p>

                <Icon
                  size={15}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-2 text-xl font-bold text-slate-800">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Inventory Summary */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Inventory Value
          </span>

          <span className="text-sm font-semibold text-slate-700">
            {formatCurrency(
              health.inventoryValue
            )}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total Products
          </span>

          <span className="text-sm font-semibold text-slate-700">
            {health.totalProducts ?? 0}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total Stock
          </span>

          <span className="text-sm font-semibold text-slate-700">
            {health.totalUnits ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryHealth;