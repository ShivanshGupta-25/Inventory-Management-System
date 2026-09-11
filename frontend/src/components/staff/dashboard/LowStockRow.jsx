import { Package } from "lucide-react";

const LowStockRow = ({ product }) => {
  const name =
    product.productName ||
    product.name ||
    "Product";

  const stock =
    product.currentStock ??
    product.stock ??
    0;

  const minimum =
    product.minStock ??
    product.minimumStock ??
    0;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Package size={15} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700">
            {name}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Minimum: {minimum}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600">
        {stock} left
      </span>
    </div>
  );
};

export default LowStockRow;