import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getAdminProfile,
  updateAdminProfile,
} from "../../services/adminService";

import AdminProfileSkeleton from "../../components/admin/profile/AdminProfileSkeleton";

const AdminProfile = () => {
  // ==================================================
  // STATE
  // ==================================================

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editOpen, setEditOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
  });

  // ==================================================
  // HELPERS
  // ==================================================

  const getInitials = (name) => {
    if (!name?.trim()) return "A";

    const parts = name.trim().split(/\s+/);

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // DERIVED STATE
  // ==================================================

  const isActive =
    !user?.status ||
    user?.status === "active";

  const initials = useMemo(
    () => getInitials(user?.name),
    [user?.name]
  );

  // ==================================================
  // LOAD PROFILE
  // ==================================================

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProfile();

      const profile =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

      if (!profile) {
        throw new Error(
          "Administrator profile was not returned."
        );
      }

      setUser(profile);

      setFormData({
        name: profile.name || "",
      });

      // Keep local authenticated user data synchronized.
      localStorage.setItem(
        "user",
        JSON.stringify(profile)
      );
    } catch (err) {
      console.error(
        "Failed to load admin profile:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ==================================================
  // EDIT PROFILE
  // ==================================================

  const openEditProfile = () => {
    setFormData({
      name: user?.name || "",
    });

    setError("");
    setSuccess("");

    setEditOpen(true);
  };

  const closeEditProfile = () => {
    if (saving) return;

    setFormData({
      name: user?.name || "",
    });

    setEditOpen(false);
  };

  // ==================================================
  // SAVE PROFILE
  // ==================================================

  const handleSave = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      setError("Full name is required.");
      return;
    }

    if (name.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await updateAdminProfile({
          name,
        });

      const updatedUser =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

      if (!updatedUser) {
        throw new Error(
          "Profile update did not return user information."
        );
      }

      const mergedUser = {
        ...user,
        ...updatedUser,
      };

      setUser(mergedUser);

      setFormData({
        name: mergedUser.name || name,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(mergedUser)
      );

      setEditOpen(false);

      setSuccess(
        "Profile updated successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error(
        "Failed to update admin profile:",
        err
      );

      setError(
        err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AdminProfileSkeleton />
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error && !user) {
    return (
      <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[520px] max-w-7xl items-center justify-center">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={22} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-full bg-slate-50">

      {/* ==================================================
          PAGE CONTENT

          AdminHeader already provides:
          - InventoryFlow / Administration
          - Profile page context
          - Notifications
          - Admin account menu

          Therefore no duplicate page header is rendered here.
      ================================================== */}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

            <CheckCircle2
              size={18}
              className="shrink-0"
            />

            <span>{success}</span>

          </div>
        )}

        {/* ==================================================
            INLINE ERROR
        ================================================== */}

        {error && user && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">

            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* ==================================================
            PROFILE IDENTITY
        ================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            {/* Identity */}

            <div className="flex min-w-0 items-center gap-4">

              <div className="relative shrink-0">

                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-sm">
                  {initials}
                </div>

                <span
                  className={`absolute bottom-0 right-0 h-5 w-5 translate-x-1 translate-y-1 rounded-full border-2 border-white ${
                    isActive
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />

              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="truncate text-xl font-semibold text-slate-900">
                    {user?.name || "Administrator"}
                  </h1>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Administrator
                  </span>

                </div>

                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">

                  <Mail
                    size={14}
                    className="shrink-0"
                  />

                  {user?.email || "Not available"}

                </p>

                <div className="mt-2 flex items-center gap-2 text-xs font-medium">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  <span
                    className={
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }
                  >
                    {isActive
                      ? "Active account"
                      : "Disabled account"}
                  </span>

                </div>

              </div>
            </div>

            {/* Actions */}

            <div className="flex flex-wrap gap-3">

              <Link
                to="/admin/settings"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Settings size={16} />
                Settings
              </Link>

              <button
                type="button"
                onClick={openEditProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                <Pencil size={16} />
                Edit Profile
              </button>

            </div>

          </div>
        </section>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div className="space-y-6 xl:col-span-2">

            {/* ==================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                <h2 className="text-sm font-semibold text-slate-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Basic information associated with your administrator account.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">

                {/* Full Name */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <UserRound size={17} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Full Name
                      </p>

                      <p className="mt-2 truncate text-sm font-medium text-slate-900">
                        {user?.name || "Not available"}
                      </p>

                    </div>

                  </div>
                </div>

                {/* Email */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <Mail size={17} />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Email Address
                      </p>

                      <p className="mt-2 truncate text-sm font-medium text-slate-900">
                        {user?.email || "Not available"}
                      </p>

                    </div>

                  </div>
                </div>

                {/* Role */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <ShieldCheck size={17} />
                    </div>

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Role
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        Administrator
                      </span>

                    </div>

                  </div>
                </div>

                {/* Access Level */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <ShieldCheck size={17} />
                    </div>

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Access Level
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-900">
                        Full System Access
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Administrative workspace
                      </p>

                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* ==================================================
                PASSWORD & SECURITY
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                <h2 className="text-sm font-semibold text-slate-900">
                  Password & Security
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your administrator account secure by managing your login credentials.
                </p>

              </div>

              <div className="p-5 sm:p-6">

                <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <KeyRound size={18} />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        Account Password
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your administrator account is protected by an authenticated password.
                      </p>

                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <ShieldCheck size={14} />
                        Password protected
                      </div>

                    </div>

                  </div>

                  <Link
                    to="/admin/settings"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <KeyRound size={15} />
                    Security Settings
                  </Link>

                </div>

              </div>
            </section>

          </div>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <div className="space-y-6">

            {/* ==================================================
                ACCOUNT
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-5">

                <h2 className="text-sm font-semibold text-slate-900">
                  Account
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Account status and access information.
                </p>

              </div>

              <div className="divide-y divide-slate-100">

                {/* Account Status */}

                <div className="p-5">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Account Status
                  </p>

                  <div className="mt-3 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={17} />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        {isActive
                          ? "Active"
                          : "Disabled"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {isActive
                          ? "Account is in good standing"
                          : "Account access is restricted"}
                      </p>

                    </div>

                  </div>
                </div>

                {/* Access Level */}

                <div className="p-5">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Access Level
                  </p>

                  <div className="mt-3 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <ShieldCheck size={17} />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        Administrator
                      </p>

                      <p className="text-xs text-slate-400">
                        Full system-level access
                      </p>

                    </div>

                  </div>
                </div>

                {/* Account Type */}

                <div className="p-5">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Account Type
                  </p>

                  <div className="mt-3 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <UserRound size={17} />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        Administrator Account
                      </p>

                      <p className="text-xs text-slate-400">
                        Role-based workspace access
                      </p>

                    </div>

                  </div>
                </div>

                {/* Session */}

                <div className="p-5">

                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Session
                  </p>

                  <div className="mt-3 flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Clock3 size={17} />
                    </div>

                    <div>

                      <p className="text-sm font-medium text-slate-900">
                        Currently signed in
                      </p>

                      <p className="text-xs text-slate-400">
                        Secure authenticated session
                      </p>

                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* ==================================================
                ACCOUNT INFORMATION
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-5">

                <h2 className="text-sm font-semibold text-slate-900">
                  Account Information
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Important account metadata.
                </p>

              </div>

              <div className="space-y-4 p-5">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    Account created
                  </span>

                  <span className="text-xs font-medium text-slate-900">
                    {formatDate(user?.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    Last updated
                  </span>

                  <span className="text-xs font-medium text-slate-900">
                    {formatDate(user?.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    Account role
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    Administrator
                  </span>
                </div>

              </div>
            </section>

          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 py-5">

          <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              Administrator account information is securely managed by InventoryFlow.
            </p>

            <Link
              to="/admin/settings"
              className="font-medium transition hover:text-slate-600"
            >
              Security & Settings
            </Link>

          </div>

        </div>

      </div>

      {/* ==================================================
          EDIT PROFILE MODAL
      ================================================== */}

      {editOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditProfile();
            }
          }}
        >

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Header */}

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-base font-semibold text-slate-900">
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Update your administrator profile information.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeEditProfile}
                  disabled={saving}
                  className="rounded-lg p-1.5 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSave}
              className="p-6"
            >

              <div className="space-y-5">

                {/* Name */}

                <div>

                  <label
                    htmlFor="admin-profile-name"
                    className="mb-2 block text-xs font-semibold text-slate-600"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="admin-profile-name"
                      type="text"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          name: event.target.value,
                        })
                      }
                      disabled={saving}
                      autoFocus
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    This name is displayed across the administrator workspace.
                  </p>

                </div>

                {/* Email */}

                <div>

                  <label
                    htmlFor="admin-profile-email"
                    className="mb-2 block text-xs font-semibold text-slate-600"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="admin-profile-email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-500"
                    />

                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Email address cannot be changed from the profile page.
                  </p>

                </div>

                {/* Role */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Role
                  </label>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                        <ShieldCheck size={16} />
                      </div>

                      <div>

                        <p className="text-sm font-medium text-slate-800">
                          Administrator
                        </p>

                        <p className="text-[11px] text-slate-400">
                          System administrator
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white">
                      Admin
                    </span>

                  </div>

                </div>

              </div>

              {/* Actions */}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeEditProfile}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />

                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;