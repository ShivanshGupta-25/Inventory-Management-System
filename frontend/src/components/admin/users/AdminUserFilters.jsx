import {
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const AdminUserFilters = ({
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters = false,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Filter size={16} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              User Filters
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              Search and refine the user list
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.6fr)_repeat(3,minmax(150px,1fr))]">
        {/* SEARCH */}
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={filters.search}
            onChange={(event) =>
              onFilterChange(
                "search",
                event.target.value
              )
            }
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />

          {filters.search && (
            <button
              type="button"
              onClick={() =>
                onFilterChange("search", "")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ROLE */}
        <select
          value={filters.role}
          onChange={(event) =>
            onFilterChange("role", event.target.value)
          }
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>

        {/* STATUS */}
        <select
          value={filters.status}
          onChange={(event) =>
            onFilterChange(
              "status",
              event.target.value
            )
          }
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>

        {/* SORT */}
        <select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(event) => {
            const [sortBy, sortOrder] =
              event.target.value.split(":");

            onFilterChange("sortBy", sortBy);
            onFilterChange(
              "sortOrder",
              sortOrder
            );
          }}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
        >
          <option value="createdAt:desc">
            Newest First
          </option>

          <option value="createdAt:asc">
            Oldest First
          </option>

          {/* <option value="name:asc">
            Name A–Z
          </option>

          <option value="name:desc">
            Name Z–A
          </option>

          <option value="email:asc">
            Email A–Z
          </option>

          <option value="email:desc">
            Email Z–A
          </option>

          <option value="role:asc">
            Role A–Z
          </option>

          <option value="status:asc">
            Status A–Z
          </option> */}
        </select>
      </div>
    </div>
  );
};

export default AdminUserFilters;