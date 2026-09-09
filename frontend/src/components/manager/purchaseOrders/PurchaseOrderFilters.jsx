import {
  Search,
  RotateCcw,
} from "lucide-react";

const PurchaseOrderFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search */}
        <div className="relative md:col-span-6">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            placeholder="Search order number or supplier..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        {/* Status */}
        <div className="md:col-span-4">
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="">
              All Statuses
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Partially Received">
              Partially Received
            </option>

            <option value="Received">
              Received
            </option>

            <option value="Cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {/* Reset */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderFilters;