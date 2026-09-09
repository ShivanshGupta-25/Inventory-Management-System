import { useEffect, useState } from "react";
import {
  ChevronRight,
  Settings,
  Loader2,
  AlertCircle,
  Pencil,
} from "lucide-react";

import { Link } from "react-router-dom";

import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileInfoCard from "../../components/profile/ProfileInfoCard";
import AccountCard from "../../components/profile/AccountCard";
import SecurityCard from "../../components/profile/SecurityCard";
import ActivityCard from "../../components/profile/ActivityCard";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // --------------------------------------------------
  // Helper: Format Role
  // --------------------------------------------------

  const formatRole = (role) => {
    if (!role) return "User";

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // --------------------------------------------------
  // Load Current Authenticated User
  // --------------------------------------------------

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load profile."
          );
        }

        const currentUser = data.user || data.data;

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

        // Fallback to localStorage
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
    };

    loadUser();
  }, []);

  // --------------------------------------------------
  // Profile Updated
  // --------------------------------------------------

  const handleProfileUpdated = (updatedUser) => {
    if (!updatedUser) return;

    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditProfileOpen(false);
  };

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={28}
              className="animate-spin text-slate-500"
            />

            <p className="text-sm text-slate-500">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error State
  // --------------------------------------------------

  if (error && !user) {
    return (
      <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertCircle size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Unable to load profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {error}
                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Initials
  // --------------------------------------------------

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen w-full overflow-visible bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

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

              <p className="mt-1 text-sm text-slate-500">
                Manage your personal information,
                account access and security.
              </p>
            </div>

            {/* Account Settings */}
            <Link
              to="/manager/settings"
              className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 sm:self-auto"
            >
              <Settings size={15} />

              <span>Account Settings</span>
            </Link>
          </div>
        </div>

        {/* =================================================
            PROFILE HEADER
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">

            {/* User Information */}
            <div className="flex items-center gap-4">

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
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {user?.name || "User"}
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {formatRole(user?.role)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email || "Not available"}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span>
                    Active account
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Settings */}
              <Link
                to="/manager/settings"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Settings size={16} />

                Settings
              </Link>

              {/* Edit Profile */}
              <button
                type="button"
                onClick={() =>
                  setEditProfileOpen(true)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Pencil size={16} />

                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        <div className="mt-6 grid w-full grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left Column */}
          <div className="min-w-0 space-y-6 lg:col-span-2">

            <ProfileInfoCard
              user={user}
            />

            <SecurityCard
              onChangePassword={() =>
                setChangePasswordOpen(true)
              }
            />
          </div>

          {/* Right Column */}
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
              Account information is securely managed
              by your organization.
            </p>

            <p>
              Inventory Management System
            </p>
          </div>
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
    </div>
  );
};

export default Profile;