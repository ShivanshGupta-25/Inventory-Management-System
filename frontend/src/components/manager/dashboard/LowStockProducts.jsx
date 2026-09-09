import {
  ArrowRight,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const LowStockProducts = ({ data = [] }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Low Stock Products
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Products requiring attention
          </p>
        </div>

        <Link
          to="/manager/inventory"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Products */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <AlertTriangle size={18} />
          </div>

          <p className="mt-3 text-sm font-medium text-slate-700">
            Stock levels look good
          </p>

          <p className="mt-1 text-xs text-slate-400">
            No products currently require
            restocking.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.map((product) => {
            const isOutOfStock =
              product.currentStock <= 0;

            return (
              <div
                key={product._id || product.sku}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isOutOfStock
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {isOutOfStock ? (
                      <XCircle size={17} />
                    ) : (
                      <AlertTriangle size={17} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {product.productName}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isOutOfStock
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {product.currentStock}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Min: {product.minStock}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LowStockProducts;