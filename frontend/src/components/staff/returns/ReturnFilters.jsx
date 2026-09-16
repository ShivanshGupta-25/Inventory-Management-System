import {
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const ReturnFilters = ({
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              onChange(
                "search",
                e.target.value
              )
            }
            placeholder="Search sale number or customer..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RotateCcw className="h-4 w-4" />
          Returned sales
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default ReturnFilters;