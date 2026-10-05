import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  KeyRound,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserRoundX,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getAdminAuditLogs,
} from "../../../services/adminService";

const PAGE_LIMIT = 8;

const AdminAuditLogModal = ({
  onClose,
}) => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: PAGE_LIMIT,
      totalLogs: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // --------------------------------------------------
  // LOAD LOGS
  // --------------------------------------------------

  const loadLogs = useCallback(
    async ({
      requestedPage = page,
      silent = false,
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
          });

        const data =
          response?.data ||
          response;

        setLogs(
          Array.isArray(data?.logs)
            ? data.logs
            : []
        );

        setPagination(
          data?.pagination || {
            page: requestedPage,
            limit: PAGE_LIMIT,
            totalLogs: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );

        setPage(
          data?.pagination?.page ||
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
    [page]
  );

  useEffect(() => {
    loadLogs({
      requestedPage: 1,
    });
  }, []);

  // --------------------------------------------------
  // ESCAPE KEY
  // --------------------------------------------------

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const handlePrevious = () => {
    if (!pagination.hasPreviousPage) {
      return;
    }

    const nextPage = page - 1;

    loadLogs({
      requestedPage: nextPage,
    });
  };

  const handleNext = () => {
    if (!pagination.hasNextPage) {
      return;
    }

    const nextPage = page + 1;

    loadLogs({
      requestedPage: nextPage,
    });
  };

  // --------------------------------------------------
  // FULL AUDIT LOG PAGE
  // --------------------------------------------------

  const handleViewAll = () => {
    onClose();

    navigate("/admin/audit-logs");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[min(760px,calc(100vh-32px))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <FileText size={19} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">
                Audit Logs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent administrative activity and
                security events.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close audit logs"
          >
            <X size={18} />
          </button>
        </div>

        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <Activity size={13} />

              {pagination.totalLogs || 0} total events
            </span>

            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:inline-flex">
              <ShieldCheck size={13} />

              Audit trail active
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              loadLogs({
                requestedPage: page,
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <AuditLogSkeleton />
          ) : error ? (
            <AuditLogError
              message={error}
              onRetry={() =>
                loadLogs({
                  requestedPage: page,
                })
              }
            />
          ) : logs.length === 0 ? (
            <AuditLogEmpty />
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <AuditLogItem
                  key={
                    log._id ||
                    log.id
                  }
                  log={log}
                />
              ))}
            </div>
          )}
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            View complete audit logs

            <ArrowRight size={15} />
          </button>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs text-slate-400">
              Page {pagination.page || 1}
              {pagination.totalPages
                ? ` of ${pagination.totalPages}`
                : ""}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={
                  !pagination.hasPreviousPage ||
                  loading
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  !pagination.hasNextPage ||
                  loading
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================================================
// AUDIT LOG ITEM
// ==================================================

const AuditLogItem = ({
  log,
}) => {
  const action = getActionConfig(
    log?.action
  );

  const actorName =
    log?.actor?.name ||
    "System administrator";

  const actorRole =
    log?.actor?.role;

  const targetName =
    log?.targetUser?.name;

  return (
    <div className="px-5 py-4 transition hover:bg-slate-50/70 sm:px-6">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* ICON */}

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconBackground} ${action.iconColor}`}
        >
          <action.icon size={17} />
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {action.label}
            </p>

            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${action.badgeBackground} ${action.badgeColor}`}
            >
              {formatAction(
                log?.action
              )}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            {log?.description ||
              "Administrative action recorded."}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <UserPlus size={11} />

              {actorName}

              {actorRole && (
                <>
                  <span>·</span>
                  <span className="capitalize">
                    {actorRole}
                  </span>
                </>
              )}
            </span>

            {targetName && (
              <>
                <span className="hidden sm:inline">
                  →
                </span>

                <span>
                  Target:{" "}
                  <span className="font-medium text-slate-500">
                    {targetName}
                  </span>
                </span>
              </>
            )}

            <span className="inline-flex items-center gap-1">
              <Clock3 size={11} />

              {formatDate(
                log?.createdAt
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================================================
// ACTION CONFIG
// ==================================================

const getActionConfig = (
  action
) => {
  switch (action) {
    case "USER_CREATED":
      return {
        label: "User created",
        icon: UserPlus,
        iconBackground: "bg-emerald-50",
        iconColor: "text-emerald-600",
        badgeBackground: "bg-emerald-50",
        badgeColor: "text-emerald-700",
      };

    case "USER_UPDATED":
      return {
        label: "User updated",
        icon: Activity,
        iconBackground: "bg-sky-50",
        iconColor: "text-sky-600",
        badgeBackground: "bg-sky-50",
        badgeColor: "text-sky-700",
      };

    case "PROFILE_UPDATED":
      return {
        label: "Profile updated",
        icon: UserCheck,
        iconBackground: "bg-violet-50",
        iconColor: "text-violet-600",
        badgeBackground: "bg-violet-50",
        badgeColor: "text-violet-700",
      };

    case "ROLE_CHANGED":
      return {
        label: "Role changed",
        icon: Settings2,
        iconBackground: "bg-amber-50",
        iconColor: "text-amber-600",
        badgeBackground: "bg-amber-50",
        badgeColor: "text-amber-700",
      };

    case "STATUS_CHANGED":
      return {
        label: "Account status changed",
        icon: UserCheck,
        iconBackground: "bg-blue-50",
        iconColor: "text-blue-600",
        badgeBackground: "bg-blue-50",
        badgeColor: "text-blue-700",
      };

    case "USER_DELETED":
      return {
        label: "User deleted",
        icon: UserRoundX,
        iconBackground: "bg-red-50",
        iconColor: "text-red-600",
        badgeBackground: "bg-red-50",
        badgeColor: "text-red-700",
      };

    case "PASSWORD_CHANGED":
      return {
        label: "Password changed",
        icon: KeyRound,
        iconBackground: "bg-indigo-50",
        iconColor: "text-indigo-600",
        badgeBackground: "bg-indigo-50",
        badgeColor: "text-indigo-700",
      };

    default:
      return {
        label: "Administrative activity",
        icon: Activity,
        iconBackground: "bg-slate-100",
        iconColor: "text-slate-600",
        badgeBackground: "bg-slate-100",
        badgeColor: "text-slate-600",
      };
  }
};

// ==================================================
// FORMAT ACTION
// ==================================================

const formatAction = (
  action
) => {
  if (!action) {
    return "Activity";
  }

  return action
    .replaceAll("_", " ")
    .toLowerCase();
};

// ==================================================
// FORMAT DATE
// ==================================================

const formatDate = (
  value
) => {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown time";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

// ==================================================
// SKELETON
// ==================================================

const AuditLogSkeleton = () => {
  return (
    <div className="divide-y divide-slate-100 animate-pulse">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 px-5 py-5 sm:px-6"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-slate-200" />

            <div className="h-3 w-full max-w-lg rounded bg-slate-200" />

            <div className="h-3 w-64 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================================================
// ERROR
// ==================================================

const AuditLogError = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <AlertCircle size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        Unable to load audit logs
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
      >
        <RefreshCw size={14} />
        Try Again
      </button>
    </div>
  );
};

// ==================================================
// EMPTY
// ==================================================

const AuditLogEmpty = () => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <FileText size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        No audit activity yet
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Administrative changes and security events
        will appear here when they are recorded.
      </p>
    </div>
  );
};

export default AdminAuditLogModal;