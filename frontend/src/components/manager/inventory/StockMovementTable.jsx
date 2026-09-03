import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCcw,
} from "lucide-react";

const StockMovementTable = ({ movements = [] }) => {
  const getMovementStyle = (type) => {
    if (type === "Purchase") {
      return {
        icon: ArrowDownLeft,
        className: "bg-emerald-50 text-emerald-700",
      };
    }

    if (type === "Sale") {
      return {
        icon: ArrowUpRight,
        className: "bg-blue-50 text-blue-700",
      };
    }

    return {
      icon: RefreshCcw,
      className: "bg-amber-50 text-amber-700",
    };
  };

  if (!movements.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          No stock movements found
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Stock activity for this product will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Stock Movement History
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Recent inventory activity for this product.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Type
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Quantity
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Reference
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                Date
              </th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                User
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {movements.map((movement) => {
              const style = getMovementStyle(movement.type);
              const Icon = style.icon;

              return (
                <tr
                  key={movement.id}
                  className="transition hover:bg-slate-50/60"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.className}`}
                      >
                        <Icon size={15} />
                      </span>

                      <span className="text-sm font-medium text-slate-700">
                        {movement.type}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        movement.quantity > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-slate-700">
                    {movement.reference}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {movement.date}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {movement.user}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementTable;