import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  Settings,
  Loader2,
  AlertCircle,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";

import ProfileInfoCard from "../../components/profile/ProfileInfoCard";
import AccountCard from "../../components/profile/AccountCard";
import SecurityCard from "../../components/profile/SecurityCard";
import ActivityCard from "../../components/profile/ActivityCard";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const Profile = () => {
  // --------------------------------------------------
  // User State
  // --------------------------------------------------

  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Modal State
  // --------------------------------------------------

  const [
    editProfileOpen,
    setEditProfileOpen,
  ] = useState(false);

  const [
    changePasswordOpen,
    setChangePasswordOpen,
  ] = useState(false);

  // --------------------------------------------------
  // Dashboard Layout State
  // --------------------------------------------------

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  // --------------------------------------------------
  // Helper: Format Role
  // --------------------------------------------------

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
  };

  // --------------------------------------------------
  // Helper: Get Initials
  // --------------------------------------------------

  const getInitials = (name) => {
    if (!name?.trim()) {
      return "U";
    }

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // --------------------------------------------------
  // Load Current Authenticated User
  // --------------------------------------------------

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from the server."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load profile."
        );
      }

      const currentUser =
        data.user || data.data;

      if (!currentUser) {
        throw new Error(
          "User information was not returned."
        );
      }

      setUser(currentUser);

      // Keep localStorage synchronized
      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );
    } catch (err) {
      console.error(
        "Profile loading error:",
        err
      );

      // --------------------------------------------
      // Fallback to localStorage
      // --------------------------------------------

      try {
        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          const parsedUser =
            JSON.parse(storedUser);

          if (parsedUser) {
            setUser(parsedUser);
            return;
          }
        }
      } catch (storageError) {
        console.error(
          "Failed to read stored user:",
          storageError
        );
      }

      setError(
        err.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // --------------------------------------------------
  // Profile Updated
  // --------------------------------------------------

  const handleProfileUpdated = (
    updatedUser
  ) => {
    if (!updatedUser) {
      return;
    }

    setUser((previousUser) => ({
      ...previousUser,
      ...updatedUser,
    }));

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditProfileOpen(false);
  };

  // --------------------------------------------------
  // User Details
  // --------------------------------------------------

  const initials = getInitials(user?.name);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <>
      {/* =================================================
          DASHBOARD SHELL
      ================================================== */}

      <div className="min-h-screen bg-slate-50">

        {/* =================================================
            SIDEBAR
        ================================================== */}

        <ManagerSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapse={() =>
            setSidebarCollapsed(
              (previous) => !previous
            )
          }
          onMobileClose={() =>
            setMobileSidebarOpen(false)
          }
        />

        {/* =================================================
            MOBILE OVERLAY
        ================================================== */}

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          />
        )}

        {/* =================================================
            MAIN CONTENT AREA
        ================================================== */}

        <div
          className={`min-h-screen transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >

          {/* =================================================
              HEADER
          ================================================== */}

          <ManagerHeader
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
          />

          {/* =================================================
              PAGE CONTENT
          ================================================== */}

          <main className="p-4 sm:p-6">
            <div className="mx-auto w-full max-w-[1600px]">

              {/* =================================================
                  LOADING STATE
              ================================================== */}

              {loading && !user && (
                <div className="flex min-h-[500px] items-center justify-center">

                  <div className="flex flex-col items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

                      <Loader2
                        size={24}
                        className="animate-spin text-slate-600"
                      />

                    </div>

                    <p className="text-sm font-medium text-slate-500">
                      Loading profile...
                    </p>

                  </div>

                </div>
              )}

              {/* =================================================
                  ERROR STATE
              ================================================== */}

              {!loading && error && !user && (
                <div className="flex min-h-[500px] items-center justify-center">

                  <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <AlertCircle size={22} />
                      </div>

                      <h2 className="mt-4 text-lg font-semibold text-slate-900">
                        Unable to load profile
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={loadUser}
                        disabled={loading}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw size={15} />
                        Try Again
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  PROFILE CONTENT
              ================================================== */}

              {!loading && user && (
                <>

                  {/* =================================================
                      PAGE HEADER
                  ================================================== */}

                  <div className="mb-6">

                    {/* Breadcrumb */}

                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">

                      <Link
                        to="/manager/dashboard"
                        className="transition hover:text-slate-700"
                      >
                        Home
                      </Link>

                      <ChevronRight size={14} />

                      <span className="text-slate-600">
                        Profile
                      </span>

                    </div>

                    {/* Title + Settings */}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                      <div>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                          Profile
                        </h1>

                        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                          Manage your personal information,
                          account access and security.
                        </p>

                      </div>

                      <Link
                        to="/manager/settings"
                        className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
                      >
                        <Settings size={16} />

                        Account Settings

                        <ChevronRight
                          size={14}
                          className="text-slate-400"
                        />
                      </Link>

                    </div>

                  </div>

                  {/* =================================================
                      PROFILE HEADER CARD
                  ================================================== */}

                  <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* User Information */}

                      <div className="flex min-w-0 items-center gap-4">

                        {/* Avatar */}

                        <div className="relative shrink-0">

                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xl font-semibold text-slate-700 ring-1 ring-slate-200">
                            {initials}
                          </div>

                          {/* Active Indicator */}

                          <span className="absolute bottom-0 right-0 flex h-5 w-5 translate-x-1 translate-y-1 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          </span>

                        </div>

                        {/* Name + Details */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                              {user?.name ||
                                "User"}
                            </h2>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {formatRole(
                                user?.role
                              )}
                            </span>

                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {user?.email ||
                              "Not available"}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">

                            <span className="h-2 w-2 rounded-full bg-emerald-500" />

                            Active account

                          </div>

                        </div>

                      </div>

                      {/* Actions */}

                      <div className="flex flex-wrap items-center gap-3">

                        <Link
                          to="/manager/settings"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Settings size={16} />

                          Settings
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setEditProfileOpen(
                              true
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                        >
                          <Pencil size={16} />

                          Edit Profile
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PROFILE CONTENT
                  ================================================== */}

                  <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* =================================================
                        LEFT COLUMN
                    ================================================== */}

                    <div className="min-w-0 space-y-6 lg:col-span-2">

                      <ProfileInfoCard
                        user={user}
                      />

                      <SecurityCard
                        onChangePassword={() =>
                          setChangePasswordOpen(
                            true
                          )
                        }
                      />

                    </div>

                    {/* =================================================
                        RIGHT COLUMN
                    ================================================== */}

                    <div className="min-w-0 space-y-6">

                      <AccountCard
                        user={user}
                      />

                      <ActivityCard
                        user={user}
                      />

                    </div>

                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================== */}

                  <div className="mt-8 border-t border-slate-200 py-5">

                    <div className="flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">

                      <p>
                        Account information is
                        securely managed by your
                        organization.
                      </p>

                      <p>
                        Inventory Management System
                      </p>

                    </div>

                  </div>

                </>
              )}

            </div>
          </main>

        </div>
      </div>

      {/* =================================================
          EDIT PROFILE MODAL
      ================================================== */}

      {editProfileOpen && (
        <EditProfileModal
          user={user}
          onClose={() =>
            setEditProfileOpen(false)
          }
          onUpdated={handleProfileUpdated}
        />
      )}

      {/* =================================================
          CHANGE PASSWORD MODAL
      ================================================== */}

      {changePasswordOpen && (
        <ChangePasswordModal
          onClose={() =>
            setChangePasswordOpen(false)
          }
        />
      )}
    </>
  );
};

export default Profile;