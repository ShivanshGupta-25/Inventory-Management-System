import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserRoundX,
  Users as UsersIcon,
  X,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminService";

/* ==========================================================================
   HELPERS
   ========================================================================== */

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);

  if (!parts.length || !parts[0]) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getRoleLabel = (role) => {
  if (!role) return "Unknown";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getRoleClasses = (role) => {
  switch (role) {
    case "admin":
      return "bg-slate-100 text-slate-700";

    case "manager":
      return "bg-amber-50 text-amber-700";

    case "staff":
      return "bg-violet-50 text-violet-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
};

const getStatusClasses = (status) => {
  if (status === "disabled") {
    return "bg-red-50 text-red-600";
  }

  return "bg-emerald-50 text-emerald-700";
};

/* ==========================================================================
   USER ACTION MENU
   ========================================================================== */

const UserActionMenu = ({
  user,
  onStatusChange,
  onRoleChange,
  onDelete,
}) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const isAdmin = user.role === "admin";
  const isDisabled = user.status === "disabled";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Actions for ${user.name}`}
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close action menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(
                  `/admin/users/${user._id || user.id}`
                );
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <UserCog size={14} />
              View details
            </button>

            {!isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onRoleChange(user);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <ShieldCheck size={14} />
                  Change role
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onStatusChange(
                      user,
                      isDisabled
                        ? "active"
                        : "disabled"
                    );
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  {isDisabled ? (
                    <UserCheck size={14} />
                  ) : (
                    <UserRoundX size={14} />
                  )}

                  {isDisabled
                    ? "Enable account"
                    : "Disable account"}
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onDelete(user);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <UserRoundX size={14} />
                  Delete user
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ==========================================================================
   FILTER BAR
   ========================================================================== */

const UserFilters = ({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}) => {
  const hasFilters =
    Boolean(search) ||
    Boolean(role) ||
    Boolean(status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}

        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role */}

        <select
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All roles</option>
          <option value="admin">Administrators</option>
          <option value="manager">Managers</option>
          <option value="staff">Staff</option>
        </select>

        {/* Status */}

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>

        {/* Clear */}

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Filter size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   MAIN PAGE
   ========================================================================== */

const Users = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const searchFromUrl =
    searchParams.get("search") || "";

  const roleFromUrl =
    searchParams.get("role") || "";

  const statusFromUrl =
    searchParams.get("status") || "";

  const pageFromUrl =
    Number(searchParams.get("page")) || 1;

  const [search, setSearch] =
    useState(searchFromUrl);

  const [role, setRole] =
    useState(roleFromUrl);

  const [status, setStatus] =
    useState(statusFromUrl);

  const [page, setPage] =
    useState(pageFromUrl);

  const [users, setUsers] =
    useState([]);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      totalUsers: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  /* ------------------------------------------------------------------------
     FETCH USERS
  ------------------------------------------------------------------------ */

  const loadUsers = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminUsers({
            page,
            limit: 10,
            search: search.trim(),
            role,
            status,
            sortBy: "createdAt",
            sortOrder: "desc",
          });

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Unable to load users"
          );
        }

        const data = response.data || {};

        setUsers(data.users || []);

        setPagination({
          page:
            data.pagination?.page ||
            page,
          limit:
            data.pagination?.limit ||
            10,
          totalUsers:
            data.pagination?.totalUsers ||
            0,
          totalPages:
            data.pagination?.totalPages ||
            0,
          hasNextPage:
            Boolean(
              data.pagination?.hasNextPage
            ),
          hasPreviousPage:
            Boolean(
              data.pagination
                ?.hasPreviousPage
            ),
        });
      } catch (err) {
        console.error(
          "Admin users error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load users."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, role, search, status]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, search ? 350 : 0);

    return () => clearTimeout(timer);
  }, [
    loadUsers,
    search,
    role,
    status,
    page,
  ]);

  /* ------------------------------------------------------------------------
     URL SYNC
  ------------------------------------------------------------------------ */

  const syncUrl = useCallback(
    ({
      nextSearch = search,
      nextRole = role,
      nextStatus = status,
      nextPage = 1,
    } = {}) => {
      const params = new URLSearchParams();

      if (nextSearch.trim()) {
        params.set(
          "search",
          nextSearch.trim()
        );
      }

      if (nextRole) {
        params.set("role", nextRole);
      }

      if (nextStatus) {
        params.set("status", nextStatus);
      }

      if (nextPage > 1) {
        params.set(
          "page",
          String(nextPage)
        );
      }

      setSearchParams(params);
    },
    [
      role,
      search,
      setSearchParams,
      status,
    ]
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);

    syncUrl({
      nextSearch: value,
      nextPage: 1,
    });
  };

//   const handleRoleChange = (value) => {
//     setRole(value);
//     setPage(1);

//     syncUrl({
//       nextRole: value,
//       nextPage: 1,
//     });
//   };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);

    syncUrl({
      nextStatus: value,
      nextPage: 1,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);

    setSearchParams({});
  };

  /* ------------------------------------------------------------------------
     STATUS CHANGE
  ------------------------------------------------------------------------ */

  const handleStatusChangeAction = async (
    user,
    nextStatus
  ) => {
    const action =
      nextStatus === "disabled"
        ? "disable"
        : "enable";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateAdminUserStatus(
        user._id || user.id,
        nextStatus
      );

      await loadUsers({
        silent: true,
      });
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update account status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ------------------------------------------------------------------------
     ROLE CHANGE
  ------------------------------------------------------------------------ */

  const handleRoleChange = async (
    user
  ) => {
    const nextRole = window.prompt(
      `Change role for ${user.name}.\n\nEnter: admin, manager, or staff`,
      user.role
    );

    if (!nextRole) {
      return;
    }

    const normalizedRole =
      nextRole.trim().toLowerCase();

    if (
      ![
        "admin",
        "manager",
        "staff",
      ].includes(normalizedRole)
    ) {
      setError(
        "Invalid role. Use admin, manager, or staff."
      );

      return;
    }

    if (
      normalizedRole === user.role
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await updateAdminUserRole(
        user._id || user.id,
        normalizedRole
      );

      await loadUsers({
        silent: true,
      });
    } catch (err) {
      console.error(
        "Role update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update user role."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ------------------------------------------------------------------------
     DELETE USER
  ------------------------------------------------------------------------ */

  const handleDelete = async (
    user
  ) => {
    const confirmed = window.confirm(
      `Delete ${user.name}'s account?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await deleteAdminUser(
        user._id || user.id
      );

      if (
        users.length === 1 &&
        page > 1
      ) {
        const previousPage =
          page - 1;

        setPage(previousPage);

        syncUrl({
          nextPage: previousPage,
        });
      } else {
        await loadUsers({
          silent: true,
        });
      }
    } catch (err) {
      console.error(
        "Delete user error:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ------------------------------------------------------------------------
     SUMMARY
  ------------------------------------------------------------------------ */

  const showingFrom =
    pagination.totalUsers === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1;

  const showingTo = Math.min(
    pagination.page *
      pagination.limit,
    pagination.totalUsers
  );

  const pageTitle = useMemo(() => {
    if (role === "manager") {
      return "Managers";
    }

    if (role === "staff") {
      return "Staff";
    }

    if (role === "admin") {
      return "Administrators";
    }

    return "Users";
  }, [role]);

  /* ------------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------------ */

  return (
    <div className="space-y-5">
      {/* ====================================================================
          PAGE HEADER
      ==================================================================== */}

      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              User Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {pageTitle}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Manage system accounts, roles,
              and account access across
              InventoryFlow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                loadUsers({
                  silent: true,
                })
              }
              disabled={
                refreshing ||
                actionLoading
              }
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/users/create"
                )
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={15} />
              Add user
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          ERROR
      ==================================================================== */}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="min-w-0 truncate text-xs font-medium text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-red-400 hover:text-red-700"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ====================================================================
          FILTERS
      ==================================================================== */}

      <UserFilters
        search={search}
        role={role}
        status={status}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onClear={clearFilters}
      />

      {/* ====================================================================
          USER TABLE
      ==================================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              System Users
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {pagination.totalUsers.toLocaleString(
                "en-IN"
              )}{" "}
              total account
              {pagination.totalUsers === 1
                ? ""
                : "s"}
            </p>
          </div>

          {(search ||
            role ||
            status) && (
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                  Search: {search}
                </span>
              )}

              {role && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                  Role:{" "}
                  {getRoleLabel(role)}
                </span>
              )}

              {status && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  Status:{" "}
                  {getRoleLabel(status)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Role
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Joined
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({
                  length: 6,
                }).map((_, index) => (
                  <tr key={index}>
                    <td
                      colSpan={5}
                      className="px-5 py-4"
                    >
                      <div className="h-12 animate-pulse rounded-xl bg-slate-50" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <UsersIcon size={20} />
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try adjusting your search
                      or filters.
                    </p>

                    {(search ||
                      role ||
                      status) && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 text-xs font-semibold text-amber-600 hover:text-amber-700"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userId =
                    user._id || user.id;

                  const isDisabled =
                    user.status ===
                    "disabled";

                  return (
                    <tr
                      key={userId}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/users/${userId}`
                            )
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                            {getInitials(
                              user.name
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-slate-950">
                              {user.name ||
                                "Unnamed user"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getRoleClasses(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(
                            user.role
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${getStatusClasses(
                            user.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />

                          {isDisabled
                            ? "Disabled"
                            : "Active"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end">
                          <UserActionMenu
                            user={user}
                            onStatusChange={
                              handleStatusChangeAction
                            }
                            onRoleChange={
                              handleRoleChange
                            }
                            onDelete={
                              handleDelete
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}

        <div className="divide-y divide-slate-100 md:hidden">
          {loading ? (
            Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="p-4"
              >
                <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UsersIcon size={20} />
              </div>

              <p className="mt-3 text-sm font-bold text-slate-700">
                No users found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            users.map((user) => {
              const userId =
                user._id || user.id;

              const isDisabled =
                user.status ===
                "disabled";

              return (
                <div
                  key={userId}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                      {getInitials(
                        user.name
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/users/${userId}`
                          )
                        }
                        className="text-left"
                      >
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user.name ||
                            "Unnamed user"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </button>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${getRoleClasses(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(
                            user.role
                          )}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-bold ${getStatusClasses(
                            user.status
                          )}`}
                        >
                          {isDisabled
                            ? "Disabled"
                            : "Active"}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {formatDate(
                            user.createdAt
                          )}
                        </span>
                      </div>
                    </div>

                    <UserActionMenu
                      user={user}
                      onStatusChange={
                        handleStatusChangeAction
                      }
                      onRoleChange={
                        handleRoleChange
                      }
                      onDelete={
                        handleDelete
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ==================================================================
            PAGINATION
        ================================================================== */}

        {pagination.totalUsers > 0 && (
          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {showingFrom}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-600">
                {showingTo}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {pagination.totalUsers}
              </span>{" "}
              users
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage ||
                  actionLoading
                }
                onClick={() => {
                  const nextPage =
                    Math.max(
                      1,
                      page - 1
                    );

                  setPage(nextPage);

                  syncUrl({
                    nextPage,
                  });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-900 px-2 text-[11px] font-bold text-white">
                {pagination.page}
              </span>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage ||
                  actionLoading
                }
                onClick={() => {
                  const nextPage =
                    page + 1;

                  setPage(nextPage);

                  syncUrl({
                    nextPage,
                  });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Users;