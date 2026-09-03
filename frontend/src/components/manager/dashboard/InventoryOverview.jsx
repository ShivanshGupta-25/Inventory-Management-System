import { Boxes } from "lucide-react";

const inventoryData = [
  {
    label: "In Stock",
    value: "14,820",
    percentage: 80,
  },
  {
    label: "Low Stock",
    value: "2,940",
    percentage: 16,
  },
  {
    label: "Out of Stock",
    value: "660",
    percentage: 4,
  },
];

const InventoryOverview = () => {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Inventory Overview
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Current stock distribution
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <Boxes size={16} />
        </div>
      </div>

      {/* Inventory Bars */}
      <div className="mt-5 space-y-4">
        {inventoryData.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                {item.label}
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {item.value}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${item.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-5 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total inventory units
          </span>

          <span className="text-xs font-semibold text-slate-700">
            18,420
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;