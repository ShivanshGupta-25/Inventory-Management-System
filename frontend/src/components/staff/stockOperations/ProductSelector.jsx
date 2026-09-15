import { Package, Search } from "lucide-react";

const ProductSelector = ({
  products = [],
  selectedProduct,
  onChange,
  search,
  onSearchChange,
}) => {
  return (
    <div>
      {/* PRODUCT LABEL */}
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        Product
      </label>

      {/* SEARCH */}
      <div className="relative mb-3">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Search product or SKU..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* PRODUCT LIST */}
      <div
        className="
          max-h-[360px]
          overflow-y-auto
          rounded-lg
          border
          border-slate-200
          bg-white
          overscroll-contain
          scrollbar-thin
          scrollbar-track-slate-50
          scrollbar-thumb-slate-300
          hover:scrollbar-thumb-slate-400
        "
      >
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package
              size={22}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-xs font-medium text-slate-500">
              No products found
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Try searching with another product
              name or SKU.
            </p>
          </div>
        ) : (
          products.map((product) => {
            const isSelected =
              String(
                selectedProduct?._id
              ) ===
              String(product._id);

            return (
              <button
                key={product._id}
                type="button"
                onClick={() =>
                  onChange(product)
                }
                className={`flex w-full items-center justify-between border-b border-slate-100 px-4 py-3.5 text-left transition last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                {/* PRODUCT INFO */}
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-semibold ${
                      isSelected
                        ? "text-blue-700"
                        : "text-slate-700"
                    }`}
                  >
                    {product.productName}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    SKU:{" "}
                    {product.sku || "—"}
                  </p>
                </div>

                {/* STOCK */}
                <div className="ml-4 shrink-0 text-right">
                  <p
                    className={`text-xs font-semibold ${
                      Number(
                        product.currentStock ?? 0
                      ) === 0
                        ? "text-red-600"
                        : "text-slate-700"
                    }`}
                  >
                    {product.currentStock ??
                      0}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    {product.unit ||
                      "units"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductSelector;