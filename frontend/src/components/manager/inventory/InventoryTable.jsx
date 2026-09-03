import InventoryActionMenu from "./InventoryActionMenu";
import StockStatusBadge from "./StockStatusBadge";

const InventoryTable = ({ inventory }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Product
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Category
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Warehouse
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Stock
            </th>

            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Status
            </th>

            <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {inventory.length > 0 ? (
            inventory.map((product) => (
              <tr
                key={product.id}
                className="transition hover:bg-slate-50/60"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {product.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      SKU: {product.sku}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                  {product.category}
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                  {product.warehouse}
                </td>

                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {product.stock}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Min: {product.minimumStock}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <StockStatusBadge status={product.status} />
                </td>

                <td className="px-5 py-4 text-right">
                  <InventoryActionMenu product={product} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="px-5 py-12 text-center text-sm text-slate-400"
              >
                No inventory items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;