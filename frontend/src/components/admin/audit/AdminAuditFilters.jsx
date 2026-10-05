import {
  Filter,
  Search,
  X,
} from "lucide-react";

const ACTION_OPTIONS = [
  {
    value: "",
    label: "All actions",
  },
  {
    value: "USER_CREATED",
    label: "User created",
  },
  {
    value: "USER_UPDATED",
    label: "User updated",
  },
  {
    value: "PROFILE_UPDATED",
    label: "Profile updated",
  },
  {
    value: "ROLE_CHANGED",
    label: "Role changed",
  },
  {
    value: "STATUS_CHANGED",
    label: "Status changed",
  },
  {
    value: "USER_DELETED",
    label: "User deleted",
  },
  {
    value: "PASSWORD_CHANGED",
    label: "Password changed",
  },
];

const AdminAuditFilters = ({
  search,
  action,
  onSearchChange,
  onActionChange,
  onReset,
  hasFilters,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        {/* Search */}

        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search by actor, target user, or activity..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                onSearchChange("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action */}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Filter
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={action}
              onChange={(event) =>
                onActionChange(
                  event.target.value
                )
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 sm:w-56"
            >
              {ACTION_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              ▾
            </span>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            Active filters:
          </span>

          {search && (
            <FilterBadge>
              Search: {search}
            </FilterBadge>
          )}

          {action && (
            <FilterBadge>
              Action:{" "}
              {
                ACTION_OPTIONS.find(
                  (item) =>
                    item.value === action
                )?.label
              }
            </FilterBadge>
          )}
        </div>
      )}
    </section>
  );
};

const FilterBadge = ({
  children,
}) => (
  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
    {children}
  </span>
);

export default AdminAuditFilters;