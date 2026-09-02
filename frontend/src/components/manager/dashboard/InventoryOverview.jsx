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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Inventory Overview
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Current stock distribution
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <Boxes size={18} />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {inventoryData.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                {item.label}
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {item.value}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            Total inventory units
          </span>

          <span className="font-semibold text-slate-700">
            18,420
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;