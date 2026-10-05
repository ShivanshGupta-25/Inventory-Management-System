import { AlertCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminUser,
  updateAdminUser,
  updateAdminUserStatus,
} from "../../services/adminService";

import AdminUserDetailsHeader from "../../components/admin/users/AdminUserDetailsHeader";
import AdminUserOverview from "../../components/admin/users/AdminUserOverview";
import AdminUserAccountCard from "../../components/admin/users/AdminUserAccountCard";
import AdminUserSecurityCard from "../../components/admin/users/AdminUserSecurityCard";
import AdminUserActionsCard from "../../components/admin/users/AdminUserActionsCard";
import AdminUserDetailsSkeleton from "../../components/admin/users/AdminUserDetailsSkeleton";
import AdminEditUserModal from "../../components/admin/users/AdminEditUserModal";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ------------------------------------------------------------
  // USER STATE
  // ------------------------------------------------------------

  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ------------------------------------------------------------
  // PAGE STATE
  // ------------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ------------------------------------------------------------
  // EDIT STATE
  // ------------------------------------------------------------

  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // ------------------------------------------------------------
  // STATUS STATE
  // ------------------------------------------------------------

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ------------------------------------------------------------
  // LOAD USER
  // ------------------------------------------------------------

  const loadUser = useCallback(async () => {
    if (!id) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAdminUser(id);

      const userData =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

      setUser(userData || null);

      /*
       * If the backend returns the currently authenticated user,
       * use it for self-account protection.
       */
      if (response?.currentUser) {
        setCurrentUser(response.currentUser);
      } else if (response?.data?.currentUser) {
        setCurrentUser(response.data.currentUser);
      }
    } catch (err) {
      console.error("Failed to load admin user:", err);

      setUser(null);

      setError(
        err?.message ||
          "Unable to load the requested user."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ------------------------------------------------------------
  // LOAD CURRENT USER FROM LOCAL STORAGE
  // ------------------------------------------------------------

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser) {
        setCurrentUser(parsedUser);
      }
    } catch (err) {
      console.warn(
        "Unable to read current user from localStorage:",
        err
      );
    }
  }, []);

  // ------------------------------------------------------------
  // BACK TO USERS
  // ------------------------------------------------------------

  const handleBack = () => {
    navigate("/admin/users");
  };

  // ------------------------------------------------------------
  // OPEN EDIT MODAL
  // ------------------------------------------------------------

  const handleEdit = () => {
    setError("");
    setSuccess("");
    setEditOpen(true);
  };

  // ------------------------------------------------------------
  // CLOSE EDIT MODAL
  // ------------------------------------------------------------

  const handleCloseEdit = () => {
    if (savingEdit) {
      return;
    }

    setEditOpen(false);
  };

  // ------------------------------------------------------------
  // SAVE EDITED USER
  // ------------------------------------------------------------

  const handleSaveEdit = async (updates) => {
    if (!user?._id || savingEdit) {
        return;
    }

    try {
        setSavingEdit(true);
        setError("");
        setSuccess("");

        const isAdminAccount =
        String(user?.role || "").toLowerCase() === "admin";

        /*
        * Never allow the admin account's role to be changed.
        */
        const safeUpdates = {
        ...updates,
        };

        if (isAdminAccount) {
        delete safeUpdates.role;
        }

        const response = await updateAdminUser(
        user._id,
        safeUpdates
        );

        const updatedUser =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

        setUser((previous) => ({
        ...previous,
        ...(updatedUser || {}),
        ...(Object.keys(updatedUser || {}).length === 0
            ? safeUpdates
            : {}),
        }));

        setEditOpen(false);

        setSuccess(
        "User details have been updated successfully."
        );

        window.setTimeout(() => {
        setSuccess("");
        }, 3500);
    } catch (err) {
        console.error(
        "Failed to update user details:",
        err
        );

        throw new Error(
        err?.message ||
            "Unable to update user details."
        );
    } finally {
        setSavingEdit(false);
    }
    };

  // ------------------------------------------------------------
  // CHANGE ACCOUNT STATUS
  // ------------------------------------------------------------

    const handleStatusChange = async () => {
    if (!user?._id || updatingStatus) {
        return;
    }

    const isAdminAccount =
        String(user?.role || "").toLowerCase() === "admin";

    /*
    * Administrator accounts are protected system accounts.
    */
    if (isAdminAccount) {
        setError(
        "Administrator accounts cannot be disabled or enabled."
        );

        return;
    }

    const isActive = user.status !== "disabled";

    const isCurrentUser =
        String(user?._id || "") ===
        String(currentUser?._id || "");

    if (isCurrentUser) {
        setError(
        "You cannot disable or enable your own administrator account."
        );

        return;
    }

    const confirmed = window.confirm(
        isActive
        ? `Disable ${user.name}'s account?`
        : `Enable ${user.name}'s account?`
    );

    if (!confirmed) {
        return;
    }

    try {
        setUpdatingStatus(true);
        setError("");
        setSuccess("");

        const nextStatus = isActive
        ? "disabled"
        : "active";

        const response = await updateAdminUserStatus(
        user._id,
        nextStatus
        );

        const updatedUser =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

        setUser((previous) => ({
        ...previous,
        ...(updatedUser || {}),
        status:
            updatedUser?.status ||
            nextStatus,
        }));

        setSuccess(
        nextStatus === "disabled"
            ? "User account has been disabled."
            : "User account has been enabled."
        );

        window.setTimeout(() => {
        setSuccess("");
        }, 3500);
    } catch (err) {
        console.error(
        "Failed to update user status:",
        err
        );

        setError(
        err?.message ||
            "Unable to update the account status."
        );
    } finally {
        setUpdatingStatus(false);
    }
    };

  // ------------------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------------------

  if (loading) {
    return <AdminUserDetailsSkeleton />;
  }

  // ------------------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------------------

  if (error && !user) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <div className="mx-auto max-w-md text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </div>

              <h1 className="mt-4 text-lg font-bold text-slate-900">
                Unable to load user
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
              </p>

              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={loadUser}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Users
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ------------------------------------------------------------
  // MAIN PAGE
  // ------------------------------------------------------------

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* ======================================================
            USER HEADER
        ====================================================== */}

        <AdminUserDetailsHeader
          user={user}
          onBack={handleBack}
          onEdit={handleEdit}
        />

        {/* ======================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

            <span>{success}</span>
          </div>
        )}

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle
              size={16}
              className="shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">

          {/* ====================================================
              LEFT COLUMN
          ==================================================== */}

          <div className="space-y-6">

            <AdminUserOverview
              user={user}
            />

            <AdminUserAccountCard
              user={user}
            />

          </div>

          {/* ====================================================
              RIGHT COLUMN
          ==================================================== */}

          <div className="space-y-6">

            <AdminUserSecurityCard
              user={user}
            />

            <AdminUserActionsCard
              user={user}
              currentUser={currentUser}
              onEdit={handleEdit}
              onStatusChange={handleStatusChange}
            />

          </div>
        </div>

        {/* ======================================================
            STATUS UPDATE INDICATOR
        ====================================================== */}

        {updatingStatus && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-600 shadow-lg">
            <RefreshCw
              size={14}
              className="animate-spin"
            />

            <span>
              Updating account status...
            </span>
          </div>
        )}

        {/* ======================================================
            EDIT USER MODAL
        ====================================================== */}

        <AdminEditUserModal
          user={user}
          open={editOpen}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
          saving={savingEdit}
        />

      </div>
    </div>
  );
};

export default AdminUserDetails;