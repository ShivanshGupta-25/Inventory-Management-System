import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

const SalesFilters = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              onChange("search", e.target.value)
            }
            placeholder="Search sale number or customer..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />

          <select
            value={filters.status}
            onChange={(e) =>
              onChange("status", e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>

        {/* Payment Status */}
        <select
          value={filters.paymentStatus}
          onChange={(e) =>
            onChange("paymentStatus", e.target.value)
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partial">Partial</option>
          <option value="Refunded">Refunded</option>
        </select>

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default SalesFilters;