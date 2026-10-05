import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { RefreshCw } from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
  deleteAdminUser,
} from "../../services/adminService";

import { useAuth } from "../../context/AuthContext";

import AdminUsersHeader from "../../components/admin/users/AdminUsersHeader";
import AdminUserStats from "../../components/admin/users/AdminUserStats";
import AdminUserFilters from "../../components/admin/users/AdminUserFilters";
import AdminUserTable from "../../components/admin/users/AdminUserTable";
import AdminUserPagination from "../../components/admin/users/AdminUserPagination";
import AdminUserSkeleton from "../../components/admin/users/AdminUserSkeleton";
import AdminUserEmptyState from "../../components/admin/users/AdminUserEmptyState";

import AdminUserForm from "../../components/admin/users/AdminUserForm";
import AdminChangeRoleModal from "../../components/admin/users/AdminChangeRoleModal";
import AdminUserStatusModal from "../../components/admin/users/AdminUserStatusModal";
import AdminDeleteUserModal from "../../components/admin/users/AdminDeleteUserModal";

// --------------------------------------------------
// DEFAULTS
// --------------------------------------------------

const DEFAULT_FILTERS = {
  search: "",
  role: "",
  status: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  totalUsers: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const DEFAULT_STATS = {
  totalUsers: 0,
  totalAdmins: 0,
  totalManagers: 0,
  totalStaff: 0,
  activeUsers: 0,
  disabledUsers: 0,
};

// --------------------------------------------------
// VALID URL FILTER VALUES
// --------------------------------------------------

const VALID_ROLES = [
  "admin",
  "manager",
  "staff",
];

const VALID_STATUSES = [
  "active",
  "disabled",
];

const VALID_SORT_FIELDS = [
  "createdAt",
  "name",
  "email",
  "role",
  "status",
];

const VALID_SORT_ORDERS = [
  "asc",
  "desc",
];

// --------------------------------------------------
// URL → FILTERS
// --------------------------------------------------

const getFiltersFromSearchParams = (
  searchParams
) => {
  const search =
    searchParams.get("search") || "";

  const role =
    searchParams.get("role") || "";

  const status =
    searchParams.get("status") || "";

  const sortBy =
    searchParams.get("sortBy") ||
    DEFAULT_FILTERS.sortBy;

  const sortOrder =
    searchParams.get("sortOrder") ||
    DEFAULT_FILTERS.sortOrder;

  return {
    search,

    role: VALID_ROLES.includes(role)
      ? role
      : "",

    status: VALID_STATUSES.includes(status)
      ? status
      : "",

    sortBy: VALID_SORT_FIELDS.includes(
      sortBy
    )
      ? sortBy
      : DEFAULT_FILTERS.sortBy,

    sortOrder:
      VALID_SORT_ORDERS.includes(sortOrder)
        ? sortOrder
        : DEFAULT_FILTERS.sortOrder,
  };
};

// --------------------------------------------------
// FILTERS → URL
// --------------------------------------------------

const buildSearchParamsFromFilters = (
  filters
) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set(
      "search",
      filters.search.trim()
    );
  }

  if (filters.role) {
    params.set(
      "role",
      filters.role
    );
  }

  if (filters.status) {
    params.set(
      "status",
      filters.status
    );
  }

  const isDefaultSort =
    filters.sortBy === "createdAt" &&
    filters.sortOrder === "desc";

  if (!isDefaultSort) {
    params.set(
      "sortBy",
      filters.sortBy
    );

    params.set(
      "sortOrder",
      filters.sortOrder
    );
  }

  return params;
};

// --------------------------------------------------
// RESPONSE HELPER
// --------------------------------------------------

/*
 * Supports both:
 *
 * {
 *   success: true,
 *   users: [...]
 * }
 *
 * and:
 *
 * {
 *   success: true,
 *   data: {
 *     users: [...]
 *   }
 * }
 */

const getResponsePayload = (response) => {
  if (!response) {
    return {};
  }

  return response.data || response;
};

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const AdminUsers = () => {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    user: authenticatedUser,
  } = useAuth();

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const [users, setUsers] = useState([]);

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const [stats, setStats] =
    useState(DEFAULT_STATS);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [filters, setFilters] =
    useState(() =>
      getFiltersFromSearchParams(
        searchParams
      )
    );

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const [pagination, setPagination] =
    useState(DEFAULT_PAGINATION);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  // --------------------------------------------------
  // ERRORS
  // --------------------------------------------------

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  // --------------------------------------------------
  // USER FORM MODAL
  // --------------------------------------------------

  const [formModal, setFormModal] =
    useState({
      open: false,
      mode: "create",
      user: null,
    });

  // --------------------------------------------------
  // ROLE MODAL
  // --------------------------------------------------

  const [roleUser, setRoleUser] =
    useState(null);

  // --------------------------------------------------
  // STATUS MODAL
  // --------------------------------------------------

  const [statusUser, setStatusUser] =
    useState(null);

  // --------------------------------------------------
  // DELETE MODAL
  // --------------------------------------------------

  const [deleteUser, setDeleteUser] =
    useState(null);

  // --------------------------------------------------
  // FETCH USERS
  // --------------------------------------------------

  const fetchUsers = useCallback(
    async ({
      targetPage = 1,
      showLoader = true,
    } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminUsers({
            page: targetPage,
            limit: pagination.limit,
            search: filters.search.trim(),
            role: filters.role,
            status: filters.status,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          });

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load users"
          );
        }

        // ------------------------------------------
        // SUPPORT BOTH RESPONSE SHAPES
        // ------------------------------------------

        const payload =
          getResponsePayload(response);

        const nextUsers =
          Array.isArray(payload.users)
            ? payload.users
            : [];

        const nextPagination =
          payload.pagination ||
          DEFAULT_PAGINATION;

        setUsers(nextUsers);

        setPagination((previous) => ({
          ...previous,
          ...nextPagination,
          page:
            nextPagination.page ??
            targetPage,
        }));
      } catch (err) {
        console.error(
          "Admin users fetch error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load users. Please try again."
        );

        setUsers([]);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [
      filters.search,
      filters.role,
      filters.status,
      filters.sortBy,
      filters.sortOrder,
      pagination.limit,
    ]
  );

  // --------------------------------------------------
  // FETCH STATISTICS
  // --------------------------------------------------

  const fetchStats = useCallback(
    async () => {
      try {
        setStatsLoading(true);

        const response =
          await getAdminDashboard();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load user statistics"
          );
        }

        const payload =
          getResponsePayload(response);

        setStats({
          ...DEFAULT_STATS,
          ...(payload.stats || {}),
        });
      } catch (err) {
        console.error(
          "Admin user stats error:",
          err
        );

        setStats(DEFAULT_STATS);
      } finally {
        setStatsLoading(false);
      }
    },
    []
  );

  // --------------------------------------------------
  // INITIAL STATISTICS LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // --------------------------------------------------
  // SYNC FILTERS FROM URL
  //
  // This handles:
  // /admin/users?role=manager
  // /admin/users?status=active
  //
  // It also supports browser back/forward navigation.
  // --------------------------------------------------

  useEffect(() => {
    const urlFilters =
      getFiltersFromSearchParams(
        searchParams
      );

    setFilters((previous) => {
      const isSame =
        previous.search ===
          urlFilters.search &&
        previous.role ===
          urlFilters.role &&
        previous.status ===
          urlFilters.status &&
        previous.sortBy ===
          urlFilters.sortBy &&
        previous.sortOrder ===
          urlFilters.sortOrder;

      if (isSame) {
        return previous;
      }

      return urlFilters;
    });
  }, [searchParams]);

  // --------------------------------------------------
  // LOAD USERS WHEN FILTERS CHANGE
  // --------------------------------------------------

  useEffect(() => {
    fetchUsers({
      targetPage: 1,
      showLoader: true,
    });
  }, [
    filters.search,
    filters.role,
    filters.status,
    filters.sortBy,
    filters.sortOrder,
    fetchUsers,
  ]);

  // --------------------------------------------------
  // PAGE CHANGE
  // --------------------------------------------------

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages
    ) {
      return;
    }

    fetchUsers({
      targetPage: page,
      showLoader: true,
    });
  };

  // --------------------------------------------------
  // FILTER CHANGE
  // --------------------------------------------------

  const handleFilterChange = (
    key,
    value
  ) => {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);

    // ----------------------------------------------
    // Keep URL synchronized with filters
    // ----------------------------------------------

    const nextParams =
      buildSearchParamsFromFilters(
        nextFilters
      );

    setSearchParams(
      nextParams,
      {
        replace: true,
      }
    );
  };

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);

    setSearchParams(
      {},
      {
        replace: true,
      }
    );
  };

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      setError("");

      await Promise.all([
        fetchUsers({
          targetPage: pagination.page,
          showLoader: false,
        }),

        fetchStats(),
      ]);
    } catch (err) {
      console.error(
        "Admin users refresh error:",
        err
      );
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------
  // VIEW USER
  // --------------------------------------------------

  const handleViewUser = (user) => {
    const userId =
      user?._id || user?.id;

    if (!userId) {
      return;
    }

    navigate(
      `/admin/users/${userId}`
    );
  };

  // --------------------------------------------------
  // OPEN CREATE USER
  // --------------------------------------------------

  const handleCreateUser = () => {
    setActionError("");

    setFormModal({
      open: true,
      mode: "create",
      user: null,
    });
  };

  // --------------------------------------------------
  // OPEN EDIT USER
  // --------------------------------------------------

  const handleEditUser = (user) => {
    if (!user) {
      return;
    }

    setActionError("");

    setFormModal({
      open: true,
      mode: "edit",
      user,
    });
  };

  // --------------------------------------------------
  // OPEN ROLE MODAL
  // --------------------------------------------------

  const handleRoleChange = (user) => {
    if (!user) {
      return;
    }

    setActionError("");

    setRoleUser(user);
  };

  // --------------------------------------------------
  // OPEN STATUS MODAL
  // --------------------------------------------------

  const handleStatusChange = (user) => {
    if (!user) {
      return;
    }

    setActionError("");

    setStatusUser(user);
  };

  // --------------------------------------------------
  // OPEN DELETE MODAL
  // --------------------------------------------------

  const handleDeleteUser = (user) => {
    if (!user) {
      return;
    }

    setActionError("");

    setDeleteUser(user);
  };

  // --------------------------------------------------
  // CREATE / EDIT USER
  // --------------------------------------------------

  const handleFormSubmit = async (
    formData
  ) => {
    try {
      setActionLoading(true);
      setActionError("");

      if (
        formModal.mode === "create"
      ) {
        await createAdminUser(
          formData
        );
      } else {
        const userId =
          formModal.user?._id ||
          formModal.user?.id;

        if (!userId) {
          throw new Error(
            "User ID is missing."
          );
        }

        await updateAdminUser(
          userId,
          formData
        );
      }

      setFormModal({
        open: false,
        mode: "create",
        user: null,
      });

      await Promise.all([
        fetchUsers({
          targetPage: pagination.page,
          showLoader: false,
        }),

        fetchStats(),
      ]);
    } catch (err) {
      console.error(
        "Admin user save error:",
        err
      );

      setActionError(
        err?.message ||
          "Unable to save user. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // CHANGE USER ROLE
  // --------------------------------------------------

  const handleRoleSubmit = async (
    role
  ) => {
    const userId =
      roleUser?._id ||
      roleUser?.id;

    if (!userId) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await updateAdminUserRole(
        userId,
        role
      );

      setRoleUser(null);

      await Promise.all([
        fetchUsers({
          targetPage: pagination.page,
          showLoader: false,
        }),

        fetchStats(),
      ]);
    } catch (err) {
      console.error(
        "Admin user role update error:",
        err
      );

      setActionError(
        err?.message ||
          "Unable to change user role."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // CHANGE USER STATUS
  // --------------------------------------------------

  const handleStatusSubmit = async (
    status
  ) => {
    const userId =
      statusUser?._id ||
      statusUser?.id;

    if (!userId) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await updateAdminUserStatus(
        userId,
        status
      );

      setStatusUser(null);

      await Promise.all([
        fetchUsers({
          targetPage: pagination.page,
          showLoader: false,
        }),

        fetchStats(),
      ]);
    } catch (err) {
      console.error(
        "Admin user status update error:",
        err
      );

      setActionError(
        err?.message ||
          "Unable to update account status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // DELETE USER
  // --------------------------------------------------

  const handleDeleteSubmit =
    async () => {
      const userId =
        deleteUser?._id ||
        deleteUser?.id;

      if (!userId) {
        return;
      }

      try {
        setActionLoading(true);
        setActionError("");

        await deleteAdminUser(
          userId
        );

        setDeleteUser(null);

        const shouldGoBack =
          users.length === 1 &&
          pagination.page > 1;

        const nextPage =
          shouldGoBack
            ? pagination.page - 1
            : pagination.page;

        await Promise.all([
          fetchUsers({
            targetPage: nextPage,
            showLoader: false,
          }),

          fetchStats(),
        ]);
      } catch (err) {
        console.error(
          "Admin user deletion error:",
          err
        );

        setActionError(
          err?.message ||
            "Unable to delete user."
        );
      } finally {
        setActionLoading(false);
      }
    };

  // --------------------------------------------------
  // CLOSE ALL MODALS
  // --------------------------------------------------

  const closeAllModals = () => {
    if (actionLoading) {
      return;
    }

    setFormModal({
      open: false,
      mode: "create",
      user: null,
    });

    setRoleUser(null);
    setStatusUser(null);
    setDeleteUser(null);

    setActionError("");
  };

  // --------------------------------------------------
  // ACTIVE FILTER STATE
  // --------------------------------------------------

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.role) ||
    Boolean(filters.status) ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* PAGE HEADER */}

        <AdminUsersHeader
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onAddUser={handleCreateUser}
        />

        {/* STATISTICS */}

        <AdminUserStats
          stats={stats}
          loading={statsLoading}
          onNavigate={navigate}
        />

        {/* FILTERS */}

        <AdminUserFilters
          filters={filters}
          onFilterChange={
            handleFilterChange
          }
          onReset={handleResetFilters}
          hasActiveFilters={
            hasActiveFilters
          }
        />

        {/* ACTION ERROR */}

        {actionError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Action could not be completed
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {actionError}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActionError("")
                }
                className="text-xs font-semibold text-red-700 hover:text-red-900"
              >
                Dismiss
              </button>

            </div>
          </div>
        )}

        {/* FETCH ERROR */}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load users
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchUsers({
                    targetPage:
                      pagination.page,
                    showLoader: true,
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <RefreshCw size={15} />

                Try Again
              </button>

            </div>
          </div>
        )}

        {/* USERS TABLE */}

        {loading ? (
          <AdminUserSkeleton />
        ) : users.length > 0 ? (
          <AdminUserTable
            users={users}
            currentUser={
              authenticatedUser
            }
            onView={handleViewUser}
            onEdit={handleEditUser}
            onRoleChange={
              handleRoleChange
            }
            onStatusChange={
              handleStatusChange
            }
            onDelete={
              handleDeleteUser
            }
          />
        ) : (
          <AdminUserEmptyState
            hasFilters={
              hasActiveFilters
            }
            onReset={
              handleResetFilters
            }
          />
        )}

        {/* PAGINATION */}

        {!loading &&
          users.length > 0 && (
            <AdminUserPagination
              pagination={pagination}
              onPageChange={
                handlePageChange
              }
            />
          )}

        {/* ==================================================
            MODALS
        ================================================== */}

        {/* CREATE / EDIT */}

        {formModal.open && (
          <AdminUserForm
            mode={formModal.mode}
            user={formModal.user}
            loading={actionLoading}
            onClose={
              closeAllModals
            }
            onSubmit={
              handleFormSubmit
            }
          />
        )}

        {/* ROLE */}

        {roleUser && (
          <AdminChangeRoleModal
            user={roleUser}
            loading={actionLoading}
            onClose={
              closeAllModals
            }
            onSubmit={
              handleRoleSubmit
            }
          />
        )}

        {/* STATUS */}

        {statusUser && (
          <AdminUserStatusModal
            user={statusUser}
            loading={actionLoading}
            onClose={
              closeAllModals
            }
            onSubmit={
              handleStatusSubmit
            }
          />
        )}

        {/* DELETE */}

        {deleteUser && (
          <AdminDeleteUserModal
            user={deleteUser}
            loading={actionLoading}
            onClose={
              closeAllModals
            }
            onSubmit={
              handleDeleteSubmit
            }
          />
        )}

      </div>
    </div>
  );
};

export default AdminUsers;