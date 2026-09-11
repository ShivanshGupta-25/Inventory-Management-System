import { ChevronRight, Package } from "lucide-react";

import EmptyState from "./EmptyState";
import LowStockRow from "./LowStockRow";

const LowStockProducts = ({
  products = [],
  onViewInventory,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Low Stock Products
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Products that may require replenishment
          </p>
        </div>

        <button
          type="button"
          onClick={onViewInventory}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View inventory
          <ChevronRight size={14} />
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          message="No low-stock products"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {products.slice(0, 5).map(
            (product, index) => (
              <LowStockRow
                key={
                  product._id ||
                  product.id ||
                  index
                }
                product={product}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LowStockProducts;