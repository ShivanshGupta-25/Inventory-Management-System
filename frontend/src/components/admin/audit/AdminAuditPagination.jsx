import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminAuditPagination = ({
  pagination,
  onPrevious,
  onNext,
}) => {
  const {
    page = 1,
    totalPages = 0,
    totalLogs = 0,
    limit = 20,
    hasNextPage = false,
    hasPreviousPage = false,
  } = pagination || {};

  const start =
    totalLogs === 0
      ? 0
      : (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    totalLogs
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {start}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-700">
          {end}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {totalLogs}
        </span>{" "}
        events
      </p>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">
          Page{" "}
          <span className="font-semibold text-slate-600">
            {page}
          </span>
          {totalPages > 0 && (
            <>
              {" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {totalPages}
              </span>
            </>
          )}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!hasPreviousPage}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNextPage}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditPagination;