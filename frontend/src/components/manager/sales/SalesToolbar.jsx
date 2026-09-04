import { Link } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";

const SalesToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
  statuses,
  paymentStatuses,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sale ID or customer..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(e) =>
              onPaymentStatusChange(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {paymentStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <Link
          to="/manager/sales/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={16} />
          Create Sale
        </Link>
      </div>
    </div>
  );
};

export default SalesToolbar;