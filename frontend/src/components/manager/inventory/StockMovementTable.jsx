const StockMovementTable = ({
  movements,
}) => {
  if (!movements.length) {
    return (
      <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
        No stock movements found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Type
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                Quantity
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                Previous
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                New Stock
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Reason
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {movements.map((movement) => (
              <tr key={movement._id}>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold ${
                      movement.type === "IN"
                        ? "text-emerald-600"
                        : movement.type === "OUT"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {movement.type}
                  </span>
                </td>

                <td className="px-4 py-3 text-right text-sm font-medium">
                  {movement.quantity}
                </td>

                <td className="px-4 py-3 text-right text-sm text-gray-600">
                  {movement.previousStock}
                </td>

                <td className="px-4 py-3 text-right text-sm font-medium">
                  {movement.newStock}
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {movement.reason}
                </td>

                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(
                    movement.createdAt
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementTable;