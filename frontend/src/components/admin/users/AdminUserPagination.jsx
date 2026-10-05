import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminUserPagination = ({
  pagination,
  onPageChange,
}) => {
  const {
    page = 1,
    limit = 10,
    totalUsers = 0,
    totalPages = 0,
    hasNextPage = false,
    hasPreviousPage = false,
  } = pagination;

  if (totalUsers === 0) {
    return null;
  }

  const start =
    (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    totalUsers
  );

  const pages = [];

  for (let index = 1; index <= totalPages; index++) {
    if (
      index === 1 ||
      index === totalPages ||
      Math.abs(index - page) <= 1
    ) {
      pages.push(index);
    } else if (
      pages[pages.length - 1] !== "ellipsis"
    ) {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-slate-500 sm:text-sm">
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
          {totalUsers}
        </span>{" "}
        users
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((pageNumber, index) => {
            if (pageNumber === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-8 items-center justify-center text-sm text-slate-400"
                >
                  …
                </span>
              );
            }

            const active =
              pageNumber === page;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() =>
                  onPageChange(pageNumber)
                }
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminUserPagination;