
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
  Package,
  AlertTriangle,
  ClipboardList,
  X,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const StaffHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  const headerRef = useRef(null);

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load staff user:", error);
    }
  }, []);

  // =====================================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK / ESCAPE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =====================================================
  // USER HELPERS
  // =====================================================

  const userName = user?.name || "Staff User";
  const userEmail = user?.email || "staff@example.com";
  const userRole = user?.role || "staff";

  const formattedRole = useMemo(() => {
    return userRole
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [userRole]);

  const userInitials = useMemo(() => {
    const nameParts = userName.trim().split(/\s+/);

    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }

    return userName.slice(0, 2).toUpperCase();
  }, [userName]);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const notifications = [
    {
      id: 1,
      icon: AlertTriangle,
      title: "Low stock detected",
      description: "8 products need replenishment.",
      time: "10 min ago",
      type: "warning",
    },
    {
      id: 2,
      icon: ClipboardList,
      title: "Purchase request approved",
      description: "PR-1024 has been approved.",
      time: "35 min ago",
      type: "success",
    },
    {
      id: 3,
      icon: Package,
      title: "Stock updated",
      description: "42 units added to inventory.",
      time: "1 hr ago",
      type: "info",
    },
  ];

  // =====================================================
  // SEARCH HANDLER
  // =====================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    navigate(
      `/staff/inventory?search=${encodeURIComponent(
        trimmedQuery
      )}`
    );

    setSearchQuery("");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setProfileOpen(false);
    setNotificationsOpen(false);

    navigate("/auth/login", { replace: true });
  };

  // =====================================================
  // TOGGLE HELPERS
  // =====================================================

  const toggleProfile = () => {
    setProfileOpen((previous) => !previous);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen((previous) => !previous);
    setProfileOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6"
    >
      {/* =====================================================
          LEFT SECTION
      ===================================================== */}

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Search */}

        <form
          onSubmit={handleSearch}
          className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 md:flex"
        >
          <Search
            size={16}
            className="shrink-0 text-slate-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search inventory..."
            aria-label="Search inventory"
            className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-64"
          />

          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">
            /
          </span>
        </form>

        {/* Mobile Search */}

        <button
          type="button"
          onClick={() => navigate("/staff/inventory")}
          aria-label="Open inventory search"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
        >
          <Search size={19} />
        </button>
      </div>

      {/* =====================================================
          RIGHT SECTION
      ===================================================== */}

      <div className="flex items-center gap-2 sm:gap-3">
        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
            className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell size={19} />

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* Notification Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Recent inventory activity
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Notification List */}

              <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {notifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/staff/alerts");
                      }}
                      className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                          {notification.description}
                        </p>

                        <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View All */}

              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate("/staff/alerts");
                }}
                className="w-full border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* =================================================
            PROFILE DROPDOWN
        ================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={toggleProfile}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
          >
            {/* Avatar */}

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 ring-2 ring-blue-50">
              {userInitials}
            </div>

            {/* User Details */}

            <div className="hidden max-w-32 text-left sm:block">
              <p className="truncate text-xs font-semibold text-slate-800">
                {userName}
              </p>

              <p className="truncate text-[10px] text-slate-400">
                {formattedRole}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* User Information */}

              <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {userInitials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {userName}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {userEmail}
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-blue-700">
                      {formattedRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}

              <div className="p-2">
                <Link
                  to="/staff/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/staff/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StaffHeader;