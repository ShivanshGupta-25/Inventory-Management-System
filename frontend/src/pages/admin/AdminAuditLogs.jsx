import {
  AlertCircle,
  FileClock,
  RefreshCw,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAdminAuditLogs,
} from "../../services/adminService";

import AdminAuditHeader from "../../components/admin/audit/AdminAuditHeader";
import AdminAuditFilters from "../../components/admin/audit/AdminAuditFilters";
import AdminAuditTable from "../../components/admin/audit/AdminAuditTable";
import AdminAuditMobileList from "../../components/admin/audit/AdminAuditMobileList";
import AdminAuditDetailDrawer from "../../components/admin/audit/AdminAuditDetailDrawer";
import AdminAuditPagination from "../../components/admin/audit/AdminAuditPagination";
import AdminAuditSkeleton from "../../components/admin/audit/AdminAuditSkeleton";

const PAGE_LIMIT = 20;

const AdminAuditLogs = () => {
  const [logs, setLogs] =
    useState([]);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: PAGE_LIMIT,
      totalLogs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [page, setPage] =
    useState(1);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [action, setAction] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedLog, setSelectedLog] =
    useState(null);

  // --------------------------------------------------
  // FETCH LOGS
  // --------------------------------------------------

  const loadLogs = useCallback(
    async ({
      requestedPage = page,
      silent = false,
      requestedSearch = search,
      requestedAction = action,
    } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminAuditLogs({
            page: requestedPage,
            limit: PAGE_LIMIT,
            search: requestedSearch,
            action: requestedAction,
          });

        const data =
          response?.data ||
          response;

        const returnedLogs =
          Array.isArray(
            data?.logs
          )
            ? data.logs
            : [];

        const returnedPagination =
          data?.pagination || {
            page: requestedPage,
            limit: PAGE_LIMIT,
            totalLogs: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          };

        setLogs(
          returnedLogs
        );

        setPagination(
          returnedPagination
        );

        setPage(
          returnedPagination.page ||
            requestedPage
        );
      } catch (err) {
        console.error(
          "Failed to load admin audit logs:",
          err
        );

        setError(
          err?.message ||
            "Unable to load audit logs."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      action,
    ]
  );

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadLogs({
      requestedPage: 1,
      requestedSearch: "",
      requestedAction: "",
    });
  }, []);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearchChange = (
    value
  ) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = (
    event
  ) => {
    event?.preventDefault?.();

    const nextSearch =
      searchInput.trim();

    setSearch(
      nextSearch
    );

    loadLogs({
      requestedPage: 1,
      requestedSearch:
        nextSearch,
      requestedAction: action,
    });
  };

  // --------------------------------------------------
  // ACTION FILTER
  // --------------------------------------------------

  const handleActionChange = (
    nextAction
  ) => {
    setAction(
      nextAction
    );

    loadLogs({
      requestedPage: 1,
      requestedSearch: search,
      requestedAction:
        nextAction,
    });
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = () => {
    setSearchInput("");
    setSearch("");
    setAction("");

    loadLogs({
      requestedPage: 1,
      requestedSearch: "",
      requestedAction: "",
    });
  };

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const handlePrevious = () => {
    if (
      !pagination.hasPreviousPage
    ) {
      return;
    }

    const nextPage =
      page - 1;

    loadLogs({
      requestedPage: nextPage,
    });
  };

  const handleNext = () => {
    if (
      !pagination.hasNextPage
    ) {
      return;
    }

    const nextPage =
      page + 1;

    loadLogs({
      requestedPage: nextPage,
    });
  };

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const handleRefresh = () => {
    loadLogs({
      requestedPage: page,
      silent: true,
    });
  };

  // --------------------------------------------------
  // HAS FILTERS
  // --------------------------------------------------

  const hasFilters =
    Boolean(
      search ||
        action
    );

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <>
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* HEADER */}

          <AdminAuditHeader
            totalLogs={
              pagination.totalLogs
            }
            onRefresh={
              handleRefresh
            }
            refreshing={
              refreshing
            }
          />

          {/* FILTERS */}

          <form
            onSubmit={
              handleSearchSubmit
            }
          >
            <AdminAuditFilters
              search={
                searchInput
              }
              action={
                action
              }
              onSearchChange={
                handleSearchChange
              }
              onActionChange={
                handleActionChange
              }
              onReset={
                handleReset
              }
              hasFilters={
                hasFilters
              }
            />
          </form>

          {/* ERROR */}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  Unable to load audit logs
                </p>

                <p className="mt-1 text-xs leading-5">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
              >
                <RefreshCw
                  size={13}
                />

                Retry
              </button>
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <AdminAuditSkeleton />
          ) : logs.length === 0 ? (
            <EmptyState
              hasFilters={
                hasFilters
              }
              onReset={
                handleReset
              }
            />
          ) : (
            <>
              {/* DESKTOP */}

              <AdminAuditTable
                logs={logs}
                onView={
                  setSelectedLog
                }
              />

              {/* MOBILE */}

              <AdminAuditMobileList
                logs={logs}
                onView={
                  setSelectedLog
                }
              />

              {/* PAGINATION */}

              <AdminAuditPagination
                pagination={
                  pagination
                }
                onPrevious={
                  handlePrevious
                }
                onNext={
                  handleNext
                }
              />
            </>
          )}
        </div>
      </div>

      {/* DETAIL DRAWER */}

      {selectedLog && (
        <AdminAuditDetailDrawer
          log={
            selectedLog
          }
          onClose={() =>
            setSelectedLog(
              null
            )
          }
        />
      )}
    </>
  );
};

// ==================================================
// EMPTY STATE
// ==================================================

const EmptyState = ({
  hasFilters,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <FileClock size={21} />
      </div>

      <h2 className="mt-4 text-base font-semibold text-slate-900">
        {hasFilters
          ? "No matching audit events"
          : "No audit events yet"}
      </h2>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try adjusting your search or action filter to find the activity you're looking for."
          : "Administrative activity will appear here as actions are recorded."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={
            onReset
          }
          className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default AdminAuditLogs;