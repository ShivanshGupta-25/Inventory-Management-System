import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LockKeyhole,
  Settings as SettingsIcon,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";

import EditProfileModal from "../../components/profile/EditProfileModal";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";
import TwoFactorSettings from "../../components/security/TwoFactorSettings";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const Settings = () => {
  // --------------------------------------------------
  // User State
  // --------------------------------------------------

  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

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

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  // --------------------------------------------------
  // Success Message
  // --------------------------------------------------

  const [success, setSuccess] =
    useState("");

  // --------------------------------------------------
  // Notification Preferences
  // --------------------------------------------------

  const [notifications, setNotifications] =
    useState({
      lowStock: true,
      overstock: true,
      purchaseOrders: true,
      sales: true,
    });

  const [
    savedNotifications,
    setSavedNotifications,
  ] = useState(notifications);

  // --------------------------------------------------
  // Load User
  // --------------------------------------------------

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        if (!token) {
          throw new Error(
            "Authentication token not found."
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

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load user information."
          );
        }

        const currentUser =
          data.user || data.data;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.error(
          "Settings user loading error:",
          error
        );

        // --------------------------------------------
        // Fallback to localStorage
        // --------------------------------------------

        try {
          const storedUser =
            localStorage.getItem("user");

          if (storedUser) {
            setUser(
              JSON.parse(storedUser)
            );
          }
        } catch (storageError) {
          console.error(
            "Failed to load stored user:",
            storageError
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // --------------------------------------------------
  // Load Notification Preferences
  // --------------------------------------------------

  useEffect(() => {
    try {
      const storedNotifications =
        localStorage.getItem(
          "notificationPreferences"
        );

      if (storedNotifications) {
        const parsed =
          JSON.parse(
            storedNotifications
          );

        setNotifications(parsed);
        setSavedNotifications(parsed);
      }
    } catch (error) {
      console.error(
        "Failed to load notification preferences:",
        error
      );
    }
  }, []);

  // --------------------------------------------------
  // Profile Updated
  // --------------------------------------------------

  const handleProfileUpdated = (
    updatedUser
  ) => {
    if (!updatedUser) {
      return;
    }

    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditProfileOpen(false);
  };

  // --------------------------------------------------
  // TWO-FACTOR UPDATED
  // --------------------------------------------------

  const handleTwoFactorUpdated = (
    updatedUser
  ) => {
    if (!updatedUser) {
      return;
    }

    setUser((currentUser) => {
      const mergedUser = {
        ...currentUser,
        ...updatedUser,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(mergedUser)
      );

      return mergedUser;
    });

    setSuccess(
      updatedUser.twoFactorEnabled
        ? "Two-factor authentication enabled successfully."
        : "Two-factor authentication disabled successfully."
    );

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  // --------------------------------------------------
  // Notification Toggle
  // --------------------------------------------------

  const toggleNotification = (key) => {
    setNotifications(
      (previous) => ({
        ...previous,
        [key]: !previous[key],
      })
    );
  };

  // --------------------------------------------------
  // Save Notifications
  // --------------------------------------------------

  const saveNotifications = () => {
    localStorage.setItem(
      "notificationPreferences",
      JSON.stringify(notifications)
    );

    setSavedNotifications(
      notifications
    );

    setNotificationOpen(false);

    setSuccess(
      "Notification preferences saved successfully."
    );

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  // --------------------------------------------------
  // Cancel Notifications
  // --------------------------------------------------

  const cancelNotifications = () => {
    setNotifications(
      savedNotifications
    );

    setNotificationOpen(false);
  };

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        {/* Sidebar */}

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

        {/* Mobile Overlay */}

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          />
        )}

        {/* Main */}

        <div
          className={`min-h-screen transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <ManagerHeader
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
          />

          <main className="p-4 sm:p-6">
            <div className="mx-auto flex min-h-[500px] w-full max-w-[1600px] items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <Loader2
                  size={28}
                  className="animate-spin text-slate-500"
                />

                <p className="text-sm text-slate-500">
                  Loading settings...
                </p>

              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <>
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
            MAIN CONTENT
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
              CONTENT
          ================================================== */}

          <main className="p-4 sm:p-6">

            <div className="mx-auto w-full max-w-[1600px]">

              {/* =================================================
                  PAGE HEADER
              ================================================== */}

              <div className="mb-6">

                {/* Breadcrumb */}

                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">

                  <Link
                    to="/manager/profile"
                    className="transition hover:text-slate-600"
                  >
                    Profile
                  </Link>

                  <ChevronRight
                    size={14}
                  />

                  <span className="text-slate-600">
                    Settings
                  </span>

                </div>

                {/* Heading */}

                <div className="flex items-end justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-2">

                      <SettingsIcon
                        size={20}
                        className="text-slate-500"
                      />

                      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Settings
                      </h1>

                    </div>

                    <p className="mt-1 max-w-xl text-sm text-slate-500">
                      Manage your account, security
                      and notification preferences.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  SUCCESS MESSAGE
              ================================================== */}

              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                  />

                  <span>
                    {success}
                  </span>

                </div>
              )}

              {/* =================================================
                  SETTINGS CONTENT
              ================================================== */}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* =================================================
                    LEFT COLUMN
                ================================================== */}

                <div className="min-w-0 space-y-6 lg:col-span-2">

                  {/* =================================================
                      ACCOUNT
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Header */}

                    <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                        <User size={19} />

                      </div>

                      <div>

                        <h2 className="text-base font-semibold text-slate-900">
                          Account
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Manage your personal information
                          and account details.
                        </p>

                      </div>

                    </div>

                    {/* Personal Information */}

                    <button
                      type="button"
                      onClick={() =>
                        setEditProfileOpen(
                          true
                        )
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                    >

                      <div>

                        <h3 className="text-sm font-medium text-slate-900">
                          Personal Information
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Update your name and
                          email address.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">

                          {user?.name && (
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {user.name}
                            </span>
                          )}

                          {user?.email && (
                            <span className="max-w-full truncate rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {user.email}
                            </span>
                          )}

                        </div>

                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-slate-400"
                      />

                    </button>

                  </section>

                  {/* =================================================
                      SECURITY
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Header */}

                    <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                        <LockKeyhole
                          size={19}
                        />

                      </div>

                      <div>

                        <h2 className="text-base font-semibold text-slate-900">
                          Security
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Manage your password and
                          account security.
                        </p>

                      </div>

                    </div>

                    {/* Password */}

                    <button
                      type="button"
                      onClick={() =>
                        setChangePasswordOpen(
                          true
                        )
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                    >

                      <div>

                        <h3 className="text-sm font-medium text-slate-900">
                          Password & Security
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Change your account password
                          and keep your account protected.
                        </p>

                        <div className="mt-3 flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-emerald-500" />

                          <span className="text-xs font-medium text-emerald-600">
                            Password protected
                          </span>

                        </div>

                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-slate-400"
                      />

                    </button>

                    {/* TWO-FACTOR AUTHENTICATION */}

                    <TwoFactorSettings
                      user={user}
                      onUpdated={
                        handleTwoFactorUpdated
                      }
                    />

                  </section>

                  {/* =================================================
                      NOTIFICATIONS
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Header */}

                    <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                        <Bell size={19} />

                      </div>

                      <div>

                        <h2 className="text-base font-semibold text-slate-900">
                          Notifications
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Control the inventory and
                          system alerts you receive.
                        </p>

                      </div>

                    </div>

                    {/* Notification Preferences */}

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationOpen(
                          true
                        )
                      }
                      className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                    >

                      <div>

                        <h3 className="text-sm font-medium text-slate-900">
                          Notification Preferences
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Configure low-stock, overstock,
                          purchase order and sales alerts.
                        </p>

                        <div className="mt-3 flex items-center gap-2">

                          <span className="text-xs text-slate-500">

                            {
                              Object.values(
                                savedNotifications
                              ).filter(Boolean).length
                            }{" "}

                            of{" "}

                            {
                              Object.keys(
                                savedNotifications
                              ).length
                            }{" "}

                            enabled

                          </span>

                        </div>

                      </div>

                      <ChevronRight
                        size={18}
                        className="shrink-0 text-slate-400"
                      />

                    </button>

                  </section>

                </div>

                {/* =================================================
                    RIGHT COLUMN
                ================================================== */}

                <div className="min-w-0 space-y-6">

                  {/* =================================================
                      ACCOUNT OVERVIEW
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                      <h2 className="text-base font-semibold text-slate-900">
                        Account Overview
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Current account information.
                      </p>

                    </div>

                    <div className="space-y-5 p-6">

                      {/* Name */}

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Name
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {user?.name ||
                            "Not available"}
                        </p>

                      </div>

                      {/* Email */}

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm font-medium text-slate-900">
                          {user?.email ||
                            "Not available"}
                        </p>

                      </div>

                      {/* Role */}

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Role
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                          {user?.role ||
                            "User"}
                        </span>

                      </div>

                      {/* Account Status */}

                      <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Account Status
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-emerald-500" />

                          <span className="text-sm font-medium text-slate-900">
                            Active
                          </span>

                        </div>

                      </div>

                    </div>

                  </section>

                  {/* =================================================
                      QUICK NAVIGATION
                  ================================================== */}

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                      <h2 className="text-base font-semibold text-slate-900">
                        Quick Navigation
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Manage your account from here.
                      </p>

                    </div>

                    <div>

                      <Link
                        to="/manager/profile"
                        className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
                      >

                        <div className="flex items-center gap-3">

                          <User
                            size={17}
                            className="text-slate-500"
                          />

                          <span className="text-sm font-medium text-slate-700">
                            View Profile
                          </span>

                        </div>

                        <ChevronRight
                          size={17}
                          className="text-slate-400"
                        />

                      </Link>

                    </div>

                  </section>

                </div>

              </div>

              {/* =================================================
                  FOOTER
              ================================================== */}

              <div className="mt-8 border-t border-slate-200 py-5">

                <div className="flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">

                  <p>
                    Account settings are securely
                    managed by your organization.
                  </p>

                  <p>
                    Inventory Management System
                  </p>

                </div>

              </div>

            </div>

          </main>

        </div>
      </div>

      {/* =================================================
          EDIT PROFILE MODAL
      ================================================== */}

      {editProfileOpen && user && (
        <EditProfileModal
          user={user}
          onClose={() =>
            setEditProfileOpen(false)
          }
          onUpdated={
            handleProfileUpdated
          }
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

      {/* =================================================
          NOTIFICATION MODAL
      ================================================== */}

      {notificationOpen && (
        <NotificationPreferencesModal
          notifications={notifications}
          onToggle={toggleNotification}
          onSave={saveNotifications}
          onClose={cancelNotifications}
        />
      )}
    </>
  );
};

// ======================================================
// NOTIFICATION PREFERENCES MODAL
// ======================================================

const NotificationPreferencesModal = ({
  notifications,
  onToggle,
  onSave,
  onClose,
}) => {
  const notificationItems = [
    {
      key: "lowStock",
      title: "Low Stock Alerts",
      description:
        "Get notified when products reach their minimum stock level.",
    },
    {
      key: "overstock",
      title: "Overstock Alerts",
      description:
        "Get notified when inventory exceeds the recommended maximum level.",
    },
    {
      key: "purchaseOrders",
      title: "Purchase Order Updates",
      description:
        "Receive updates about purchase orders and supplier activity.",
    },
    {
      key: "sales",
      title: "Sales Notifications",
      description:
        "Receive notifications about sales and inventory movement.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">

      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

              <Bell size={19} />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Notification Preferences
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose which alerts you want to receive.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>

        </div>

        {/* Notification Options */}

        <div className="divide-y divide-slate-100">

          {notificationItems.map(
            (item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 px-6 py-5"
              >

                <div className="min-w-0">

                  <h3 className="text-sm font-medium text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>

                </div>

                {/* Toggle */}

                <button
                  type="button"
                  onClick={() =>
                    onToggle(item.key)
                  }
                  aria-label={`Toggle ${item.title}`}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    notifications[item.key]
                      ? "bg-slate-900"
                      : "bg-slate-200"
                  }`}
                >

                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      notifications[
                        item.key
                      ]
                        ? "left-6"
                        : "left-1"
                    }`}
                  />

                </button>

              </div>
            )
          )}

        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Check size={16} />
            Save Preferences
          </button>

        </div>

      </div>

    </div>
  );
};

export default Settings;