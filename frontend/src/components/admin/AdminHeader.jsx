import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const notificationRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);

  /*
   * ============================================================
   * ADMIN IDENTITY
   * ============================================================
   */

  const adminName = user?.name || "Administrator";
  const adminEmail = user?.email || "admin@inventoryflow.com";

  const getInitials = (name) => {
    if (!name) return "AD";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const adminInitials = getInitials(adminName);

  /*
   * ============================================================
   * PAGE CONTEXT
   * ============================================================
   *
   * The header identifies where the administrator currently is.
   * Navigation itself remains completely inside the sidebar.
   */

  const pageTitles = {
    "/admin": {
      title: "Dashboard",
      section: "Overview",
    },

    "/admin/dashboard": {
      title: "Dashboard",
      section: "Overview",
    },

    // User Management
    "/admin/users": {
      title: "Users",
      section: "User Management",
    },

    "/admin/users/managers": {
      title: "Managers",
      section: "User Management",
    },

    "/admin/users/staff": {
      title: "Staff",
      section: "User Management",
    },

    "/admin/users/roles": {
      title: "Roles & Permissions",
      section: "User Management",
    },

    "/admin/users/create": {
      title: "Create User",
      section: "User Management",
    },

    // Monitoring
    "/admin/alerts": {
      title: "Alerts",
      section: "Monitoring",
    },

    "/admin/activity": {
      title: "Activity Logs",
      section: "Monitoring",
    },

    "/admin/audit-logs": {
      title: "Audit Logs",
      section: "Monitoring",
    },

    // Reports
    "/admin/reports": {
      title: "Reports",
      section: "Reports",
    },

    // System
    "/admin/system-health": {
      title: "System Health",
      section: "System",
    },

    // Account
    "/admin/profile": {
      title: "Profile",
      section: "Account",
    },

    "/admin/settings": {
      title: "Settings",
      section: "Account",
    },
  };

  const getPageContext = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }

    /*
     * Supports nested routes such as:
     *
     * /admin/users/:id
     * /admin/users/:id/edit
     */

    const matchingPath = Object.keys(pageTitles)
      .filter((path) =>
        location.pathname.startsWith(`${path}/`)
      )
      .sort((a, b) => b.length - a.length)[0];

    return (
      pageTitles[matchingPath] || {
        title: "Admin Panel",
        section: "Administration",
      }
    );
  };

  const { title, section } = getPageContext();

  /*
   * ============================================================
   * ADMIN NOTIFICATIONS
   * ============================================================
   *
   * These are administrative/system notifications only.
   *
   * Operational inventory notifications do NOT belong here.
   */

  const notifications = [
    {
      id: 1,
      title: "New user registered",
      message:
        "A new staff account has been created.",
      time: "18 min ago",
      type: "info",
      unread: true,
    },
    {
      id: 2,
      title: "Account status changed",
      message:
        "A user account was recently disabled.",
      time: "32 min ago",
      type: "warning",
      unread: true,
    },
    {
      id: 3,
      title: "Administrative activity",
      message:
        "A system administration event was recorded.",
      time: "1 hr ago",
      type: "system",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  /*
   * ============================================================
   * OUTSIDE CLICK
   * ============================================================
   */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
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

  /*
   * Close notification dropdown when route changes.
   */

  useEffect(() => {
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   *
   * Search remains in the header because it is a global utility,
   * not navigation.
   */

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    navigate(
      `/admin/users?search=${encodeURIComponent(query)}`
    );
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-[72px] items-center
        border-b border-slate-200
        bg-white/95
        px-4 backdrop-blur
        md:px-6
      "
    >
      <div className="flex w-full items-center gap-4">
        {/* ====================================================
            LEFT
        ==================================================== */}

        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Sidebar Trigger */}

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open admin navigation"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              text-slate-600
              transition-colors
              hover:bg-slate-100
              hover:text-slate-900
              lg:hidden
            "
          >
            <Menu size={21} />
          </button>

          {/* Page Context */}

          <div className="min-w-0">
            {/* Breadcrumb */}

            <div
              className="
                hidden items-center gap-1.5
                text-[11px]
                font-medium
                text-slate-400
                sm:flex
              "
            >
              <span>Admin</span>

              <span className="text-slate-300">
                /
              </span>

              <span>{section}</span>
            </div>

            {/* Page Title */}

            <h1
              className="
                truncate
                text-lg
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              {title}
            </h1>
          </div>
        </div>

        {/* ====================================================
            CENTER — GLOBAL SEARCH
        ==================================================== */}

        <form
          onSubmit={handleSearchSubmit}
          className="
            hidden
            flex-1
            md:block
          "
        >
          <div className="mx-auto w-full max-w-md">
            <div className="relative">
              <Search
                size={17}
                className="
                  pointer-events-none
                  absolute left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="search"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                placeholder="Search users..."
                aria-label="Search users"
                className="
                  h-10 w-full
                  rounded-xl
                  border border-slate-200
                  bg-slate-50
                  pl-10 pr-14
                  text-sm
                  text-slate-800
                  outline-none
                  transition-all

                  placeholder:text-slate-400

                  focus:border-amber-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-amber-100
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute right-3
                  top-1/2
                  hidden
                  -translate-y-1/2
                  items-center gap-1
                  rounded-md
                  border border-slate-200
                  bg-white
                  px-1.5 py-0.5
                  text-[10px]
                  font-medium
                  text-slate-400
                  lg:flex
                "
              >
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </div>
          </div>
        </form>

        {/* ====================================================
            RIGHT
        ==================================================== */}

        <div
          className="
            ml-auto
            flex shrink-0
            items-center
            gap-2
          "
        >
          {/* ==================================================
              MOBILE SEARCH
          ================================================== */}

          <button
            type="button"
            onClick={() => {
              /*
               * Mobile search modal can be added later.
               * No duplicate navigation is introduced here.
               */
            }}
            aria-label="Search users"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-900
              md:hidden
            "
          >
            <Search size={19} />
          </button>

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(
                  (previous) => !previous
                );
              }}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              className="
                relative
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                text-slate-500
                transition-colors
                hover:bg-slate-100
                hover:text-slate-900
              "
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    right-1.5
                    top-1.5
                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-500
                    px-1
                    text-[9px]
                    font-bold
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}

            {isNotificationsOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-[340px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                  shadow-slate-900/10
                "
              >
                {/* Header */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    px-4
                    py-3.5
                  "
                >
                  <div>
                    <h3
                      className="
                        text-sm
                        font-bold
                        text-slate-900
                      "
                    >
                      Notifications
                    </h3>

                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      {unreadCount} unread
                    </p>
                  </div>

                  <button
                    type="button"
                    className="
                      text-xs
                      font-semibold
                      text-amber-600
                      transition-colors
                      hover:text-amber-700
                    "
                  >
                    Mark all read
                  </button>
                </div>

                {/* List */}

                <div
                  className="
                    max-h-[360px]
                    overflow-y-auto
                  "
                >
                  {notifications.map(
                    (notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`
                          flex
                          w-full
                          gap-3
                          border-b
                          border-slate-100
                          px-4
                          py-3.5
                          text-left
                          transition-colors
                          hover:bg-slate-50

                          ${
                            notification.unread
                              ? "bg-amber-50/30"
                              : ""
                          }
                        `}
                      >
                        {/* Notification Icon */}

                        <div
                          className={`
                            mt-0.5
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg

                            ${
                              notification.type ===
                              "warning"
                                ? "bg-amber-100 text-amber-600"
                                : notification.type ===
                                  "system"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-blue-100 text-blue-600"
                            }
                          `}
                        >
                          <Bell size={14} />
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-2
                            "
                          >
                            <p
                              className="
                                text-xs
                                font-semibold
                                text-slate-800
                              "
                            >
                              {notification.title}
                            </p>

                            {notification.unread && (
                              <span
                                className="
                                  mt-1
                                  h-1.5
                                  w-1.5
                                  shrink-0
                                  rounded-full
                                  bg-amber-500
                                "
                              />
                            )}
                          </div>

                          <p
                            className="
                              mt-0.5
                              line-clamp-2
                              text-xs
                              leading-5
                              text-slate-500
                            "
                          >
                            {notification.message}
                          </p>

                          <p
                            className="
                              mt-1.5
                              text-[10px]
                              text-slate-400
                            "
                          >
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>

                {/* Footer */}

                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate("/admin/alerts");
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    border-t
                    border-slate-100
                    px-4
                    py-3
                    text-xs
                    font-semibold
                    text-amber-600
                    transition-colors
                    hover:bg-amber-50
                    hover:text-amber-700
                  "
                >
                  View all alerts
                </button>
              </div>
            )}
          </div>

          {/* ==================================================
              DIVIDER
          ================================================== */}

          <div
            className="
              hidden
              h-8
              w-px
              bg-slate-200
              sm:block
            "
          />

          {/* ==================================================
              ADMIN IDENTITY
          ==================================================
          
          Intentionally NOT a dropdown.

          Profile / Settings / Logout already belong to
          the sidebar Account section.
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              px-1.5
              py-1
            "
          >
            {/* Avatar */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-slate-900
                text-xs
                font-bold
                text-white
              "
              title={adminName}
            >
              {adminInitials}
            </div>

            {/* Identity */}

            <div
              className="
                hidden
                min-w-0
                text-left
                lg:block
              "
            >
              <p
                className="
                  max-w-[130px]
                  truncate
                  text-xs
                  font-bold
                  text-slate-800
                "
              >
                {adminName}
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-1
                  text-[10px]
                  text-slate-400
                "
              >
                <ShieldCheck
                  size={11}
                  className="text-amber-500"
                />

                <span>Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;