import { ChevronRight, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

import EmptyState from "./EmptyState";
import TransactionRow from "./TransactionRow";

const RecentStockActivity = ({
  transactions = [],
  }) => {
    const navigate = useNavigate();
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Stock Activity
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Latest inventory movements
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
                navigate("/staff/stock-history")
            }
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View history
          <ChevronRight size={14} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={History}
          message="No recent stock activity"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map(
            (transaction, index) => (
              <TransactionRow
                key={
                  transaction._id ||
                  transaction.id ||
                  index
                }
                transaction={transaction}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default RecentStockActivity;