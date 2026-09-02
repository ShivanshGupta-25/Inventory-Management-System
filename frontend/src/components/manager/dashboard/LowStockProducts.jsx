import { ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    name: "Wireless Keyboard",
    sku: "KB-1042",
    stock: 8,
    minimum: 20,
  },
  {
    name: "USB-C Hub",
    sku: "USB-2081",
    stock: 12,
    minimum: 25,
  },
  {
    name: "Laptop Stand",
    sku: "LS-3014",
    stock: 15,
    minimum: 30,
  },
  {
    name: "Wireless Mouse",
    sku: "WM-4102",
    stock: 18,
    minimum: 35,
  },
];

const LowStockProducts = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
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

      <div className="divide-y divide-slate-100">
        {products.map((product) => (
          <div
            key={product.sku}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle size={17} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">
                  {product.name}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  SKU: {product.sku}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-red-600">
                {product.stock}
              </p>

              <p className="text-[10px] text-slate-400">
                Min: {product.minimum}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockProducts;    