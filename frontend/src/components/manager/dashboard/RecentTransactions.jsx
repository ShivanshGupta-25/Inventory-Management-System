import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const transactions = [
  {
    id: "#TRX-10482",
    product: "Wireless Mouse",
    type: "Sale",
    quantity: "-12",
    date: "Today, 10:42 AM",
  },
  {
    id: "#TRX-10481",
    product: "USB-C Hub",
    type: "Purchase",
    quantity: "+50",
    date: "Today, 09:15 AM",
  },
  {
    id: "#TRX-10480",
    product: "Laptop Stand",
    type: "Sale",
    quantity: "-8",
    date: "Yesterday, 04:30 PM",
  },
  {
    id: "#TRX-10479",
    product: "Mechanical Keyboard",
    type: "Purchase",
    quantity: "+35",
    date: "Yesterday, 02:18 PM",
  },
];

const RecentTransactions = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Transactions
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Latest inventory movements
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Transaction
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Product
              </th>

              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Type
              </th>

              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Quantity
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const isPurchase = transaction.type === "Purchase";

              return (
                <tr
                  key={transaction.id}
                  className="transition hover:bg-slate-50/60"
                >
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-700">
                      {transaction.id}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {transaction.date}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {transaction.product}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                        isPurchase
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isPurchase ? (
                        <ArrowDownLeft size={11} />
                      ) : (
                        <ArrowUpRight size={11} />
                      )}

                      {transaction.type}
                    </span>
                  </td>

                  <td
                    className={`px-5 py-4 text-right text-sm font-semibold ${
                      isPurchase
                        ? "text-emerald-600"
                        : "text-slate-700"
                    }`}
                  >
                    {transaction.quantity}
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

export default RecentTransactions;