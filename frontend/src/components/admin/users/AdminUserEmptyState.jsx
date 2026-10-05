import {
  RotateCcw,
  SearchX,
  UsersRound,
} from "lucide-react";

const AdminUserEmptyState = ({
  hasFilters = false,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        {hasFilters ? (
          <SearchX size={25} />
        ) : (
          <UsersRound size={25} />
        )}
      </div>

      <h3 className="mt-5 text-base font-semibold text-slate-900">
        {hasFilters
          ? "No users found"
          : "No users available"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "No users match the current search or filter criteria. Try adjusting your filters."
          : "There are currently no users to display."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RotateCcw size={15} />
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default AdminUserEmptyState;