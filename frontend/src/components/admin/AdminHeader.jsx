import { useEffect, useRef, useState } from "react";

import {
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Search,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { getAdminAuditLogs } from "../../services/adminService";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const formatRelativeTime = (value) => {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const seconds = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 5) return "Just now";

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getActionLabel = (action) => {
  const labels = {
    USER_CREATED: "User created",
    USER_UPDATED: "User updated",
    ROLE_CHANGED: "Role changed",
    STATUS_CHANGED: "Status changed",
    USER_DELETED: "User deleted",
    PROFILE_UPDATED: "Profile updated",
  };

  return (
    labels[action] ||
    action
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (char) =>
        char.toUpperCase()
      ) ||
    "Administrative activity"
  );
};

const getNotificationType = (action) => {
  switch (action) {
    case "USER_DELETED":
      return "warning";

    case "STATUS_CHANGED":
      return "warning";

    case "ROLE_CHANGED":
      return "info";

    case "USER_CREATED":
      return "success";

    case "USER_UPDATED":
      return "info";

    case "PROFILE_UPDATED":
      return "info";

    default:
      return "info";
  }
};

// ------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------

const AdminHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  // ----------------------------------------------------------
  // AUDIT NOTIFICATIONS
  // ----------------------------------------------------------

  const [notifications, setNotifications] =
    useState([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] =
    useState("");

  const [readNotificationIds, setReadNotificationIds] =
    useState(() => {
      try {
        const stored = localStorage.getItem(
          "adminHeaderReadAuditIds"
        );

        return stored
          ? JSON.parse(stored)
          : [];
      } catch {
        return [];
      }
    });

  // ----------------------------------------------------------
  // PAGE INFORMATION
  // ----------------------------------------------------------

  const pageTitles = {
    "/admin/dashboard": {
      title: "Dashboard",
      subtitle:
        "System overview and administration",
    },

    "/admin/users": {
      title: "Users",
      subtitle:
        "Manage system users and accounts",
    },

    "/admin/users/managers": {
      title: "Managers",
      subtitle:
        "Manage manager accounts",
    },

    "/admin/users/staff": {
      title: "Staff",
      subtitle:
        "Manage staff accounts",
    },

    "/admin/users/roles": {
      title: "Roles & Permissions",
      subtitle:
        "Manage access control and permissions",
    },

    "/admin/alerts": {
      title: "Alerts",
      subtitle:
        "Review system alerts and notifications",
    },

    "/admin/activity": {
      title: "Activity Logs",
      subtitle:
        "Monitor recent system activity",
    },

    "/admin/audit-logs": {
      title: "Audit Logs",
      subtitle:
        "Review administrative actions",
    },

    "/admin/reports": {
      title: "Reports",
      subtitle:
        "Review administrative reports",
    },

    "/admin/system-health": {
      title: "System Health",
      subtitle:
        "Monitor system status and services",
    },

    "/admin/profile": {
      title: "Profile",
      subtitle:
        "Manage your administrator profile",
    },

    "/admin/settings": {
      title: "Settings",
      subtitle:
        "Manage account and system preferences",
    },
  };

  const getPageContext = () => {
    const currentPath = location.pathname;

    if (pageTitles[currentPath]) {
      return pageTitles[currentPath];
    }

    const matchingPath = Object.keys(pageTitles)
      .filter((path) =>
        currentPath.startsWith(`${path}/`)
      )
      .sort((a, b) => b.length - a.length)[0];

    return (
      pageTitles[matchingPath] || {
        title: "Admin Panel",
        subtitle:
          "InventoryFlow administration",
      }
    );
  };

  const { title, subtitle } =
    getPageContext();

  // ----------------------------------------------------------
  // CURRENT ADMINISTRATOR
  // ----------------------------------------------------------

  const adminName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Administrator";

  const adminEmail = user?.email || "";

  const adminRole = user?.role
    ? user.role === "admin"
      ? "System Administrator"
      : user.role.charAt(0).toUpperCase() +
        user.role.slice(1)
    : "Administrator";

  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "AD";

  // ----------------------------------------------------------
  // LOAD RECENT AUDITS
  // ----------------------------------------------------------

  const loadRecentAudits = async ({
    silent = false,
  } = {}) => {
    try {
      if (!silent) {
        setNotificationsLoading(true);
      }

      setNotificationsError("");

      const response =
        await getAdminAuditLogs({
          page: 1,
          limit: 5,
        });

      const logs =
        response?.logs ||
        response?.data?.logs ||
        response?.data ||
        [];

      const normalizedNotifications =
        Array.isArray(logs)
          ? logs.map((audit) => ({
              id:
                audit._id ||
                audit.id,

              icon:
                Activity,

              title:
                getActionLabel(
                  audit.action
                ),

              description:
                audit.description ||
                "Administrative action recorded.",

              time:
                formatRelativeTime(
                  audit.createdAt
                ),

              unread:
                !readNotificationIds.includes(
                  String(
                    audit._id ||
                      audit.id
                  )
                ),

              type:
                getNotificationType(
                  audit.action
                ),

              link:
                "/admin/audit-logs",

              audit,
            }))
          : [];

      setNotifications(
        normalizedNotifications
      );
    } catch (error) {
      console.error(
        "Failed to load recent audit notifications:",
        error
      );

      setNotificationsError(
        error?.message ||
          "Unable to load recent activity."
      );
    } finally {
      if (!silent) {
        setNotificationsLoading(false);
      }
    }
  };

  // ----------------------------------------------------------
  // INITIAL AUDIT LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadRecentAudits();

    const interval = setInterval(() => {
      loadRecentAudits({
        silent: true,
      });
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [readNotificationIds]);

  // ----------------------------------------------------------
  // UNREAD COUNT
  // ----------------------------------------------------------

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length;

  // ----------------------------------------------------------
  // CLOSE DROPDOWNS OUTSIDE
  // ----------------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(
          event.target
        )
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ----------------------------------------------------------
  // CLOSE DROPDOWNS ON NAVIGATION
  // ----------------------------------------------------------

  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  // ----------------------------------------------------------
  // MARK ALL READ
  // ----------------------------------------------------------

  const handleMarkAllRead = () => {
    const ids = notifications.map(
      (notification) =>
        String(notification.id)
    );

    setReadNotificationIds((current) => {
      const next = Array.from(
        new Set([
          ...current,
          ...ids,
        ])
      );

      try {
        localStorage.setItem(
          "adminHeaderReadAuditIds",
          JSON.stringify(next)
        );
      } catch {
        // Ignore storage failures.
      }

      return next;
    });

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  // ----------------------------------------------------------
  // NOTIFICATION CLICK
  // ----------------------------------------------------------

  const handleNotificationClick = (
    notification
  ) => {
    const notificationId = String(
      notification.id
    );

    setReadNotificationIds((current) => {
      const next = Array.from(
        new Set([
          ...current,
          notificationId,
        ])
      );

      try {
        localStorage.setItem(
          "adminHeaderReadAuditIds",
          JSON.stringify(next)
        );
      } catch {
        // Ignore storage failures.
      }

      return next;
    });

    setNotifications((current) =>
      current.map((item) =>
        String(item.id) ===
        notificationId
          ? {
              ...item,
              unread: false,
            }
          : item
      )
    );

    setNotificationsOpen(false);

    navigate(
      notification.link ||
        "/admin/audit-logs"
    );
  };

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout = async () => {
    setProfileOpen(false);
    setNotificationsOpen(false);

    try {
      if (typeof logout === "function") {
        await logout();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem(
          "authToken"
        );
        localStorage.removeItem(
          "accessToken"
        );
      }

      navigate("/auth/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <header className="sticky top-0 z-30 flex h-[72px] min-h-[72px] w-full items-center border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex h-full w-full min-w-0 items-center justify-between gap-3">

        {/* ==================================================
            LEFT SECTION
        ================================================== */}

        <div className="flex min-w-0 flex-1 items-center gap-3">

          {/* Mobile Sidebar Toggle */}

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu size={20} />
          </button>

          {/* Current Page Context */}

          <div className="flex min-w-0 flex-1 flex-col justify-center">

            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600 sm:text-[11px]">
              InventoryFlow

              <span className="mx-1.5 text-slate-300">
                /
              </span>

              Administration
            </p>

            <div className="mt-0.5 flex min-w-0 items-center gap-2">

              <h1 className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                {title}
              </h1>

              <span className="hidden text-slate-300 sm:inline">
                /
              </span>

              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {subtitle}
              </p>

            </div>
          </div>
        </div>

        {/* ==================================================
            RIGHT SECTION
        ================================================== */}

        <div className="flex h-full shrink-0 items-center gap-2 sm:gap-3">

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <div
            ref={notificationsRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(
                  (previous) =>
                    !previous
                );

                setProfileOpen(false);

                if (!notificationsOpen) {
                  loadRecentAudits({
                    silent: true,
                  });
                }
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Notifications"
              aria-expanded={
                notificationsOpen
              }
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[min(90vw,360px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

                {/* Notification Header */}

                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Recent activity
                    </h3>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Latest administrative audit events
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllRead
                      }
                      className="shrink-0 text-[11px] font-semibold text-amber-600 transition hover:text-amber-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}

                <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">

                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />

                      <p className="mt-3 text-xs text-slate-400">
                        Loading recent activity…
                      </p>
                    </div>
                  ) : notificationsError ? (
                    <div className="px-4 py-8 text-center">
                      <Activity
                        size={24}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-2 text-sm font-medium text-slate-600">
                        Unable to load activity
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {notificationsError}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          loadRecentAudits()
                        }
                        className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-700"
                      >
                        Try again
                      </button>
                    </div>
                  ) : notifications.length >
                    0 ? (
                    notifications.map(
                      (notification) => {
                        const Icon =
                          notification.icon;

                        const iconStyle =
                          notification.type ===
                          "warning"
                            ? "bg-amber-50 text-amber-600"
                            : notification.type ===
                              "success"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600";

                        return (
                          <button
                            type="button"
                            key={
                              notification.id
                            }
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                              notification.unread
                                ? "bg-amber-50/30"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p className="text-xs font-semibold text-slate-800">
                                  {
                                    notification.title
                                  }
                                </p>

                                {notification.unread && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                )}

                              </div>

                              <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                {
                                  notification.description
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {
                                  notification.time
                                }
                              </p>

                            </div>
                          </button>
                        );
                      }
                    )
                  ) : (
                    <div className="px-4 py-8 text-center">

                      <CheckCircle2
                        size={24}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-2 text-sm font-medium text-slate-600">
                        You're all caught up
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        No recent audit activity.
                      </p>

                    </div>
                  )}

                </div>

                {/* Notification Footer */}

                <Link
                  to="/admin/audit-logs"
                  onClick={() =>
                    setNotificationsOpen(
                      false
                    )
                  }
                  className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-amber-600 transition hover:bg-amber-50"
                >
                  View all audit logs
                </Link>

              </div>
            )}
          </div>

          {/* Divider */}

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setProfileOpen(
                  (previous) =>
                    !previous
                );

                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
              aria-label="Open administrator profile menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                {initials}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-32 truncate text-xs font-semibold text-slate-800">
                  {adminName}
                </p>

                <p className="max-w-32 truncate text-[10px] text-slate-400">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden shrink-0 text-slate-400 transition-transform sm:block ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

                {/* Profile Summary */}

                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
                      {initials}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {adminName}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {adminEmail ||
                          "Administrator account"}
                      </p>

                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                    <ShieldCheck
                      size={13}
                    />

                    <span>
                      {adminRole}
                    </span>
                  </div>
                </div>

                {/* Account Links */}

                <div className="p-2">

                  <Link
                    to="/admin/profile"
                    onClick={() =>
                      setProfileOpen(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  <Link
                    to="/admin/settings"
                    onClick={() =>
                      setProfileOpen(
                        false
                      )
                    }
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                </div>

                {/* Logout */}

                <div className="border-t border-slate-100 p-2">

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;