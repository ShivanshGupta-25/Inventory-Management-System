import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  X,
} from "lucide-react";

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] =
    useState(false);

  const admin = {
    name: "Admin User",
    email: "admin@inventoryflow.com",
    role: "System Administrator",
    initials: "AU",
  };

  const notifications = [
    {
      id: 1,
      title: "Low stock alert",
      message: "12 products are below their minimum stock level.",
      time: "5 min ago",
      type: "warning",
      unread: true,
    },
    {
      id: 2,
      title: "New user registered",
      message: "A new staff account requires attention.",
      time: "18 min ago",
      type: "info",
      unread: true,
    },
    {
      id: 3,
      title: "Purchase order received",
      message: "PO-1048 has been successfully received.",
      time: "42 min ago",
      type: "success",
      unread: false,
    },
  ];

  const pageTitles = {
    "/admin/dashboard": {
      title: "Dashboard",
      subtitle: "System overview",
    },
    "/admin/users": {
      title: "Users",
      subtitle: "Manage system users",
    },
    "/admin/users/managers": {
      title: "Managers",
      subtitle: "Manage manager accounts",
    },
    "/admin/users/staff": {
      title: "Staff",
      subtitle: "Manage staff accounts",
    },
    "/admin/users/roles": {
      title: "Roles & Permissions",
      subtitle: "Manage access control",
    },
    "/admin/organization/warehouses": {
      title: "Warehouses",
      subtitle: "Manage warehouse locations",
    },
    "/admin/organization/categories": {
      title: "Categories",
      subtitle: "Manage product categories",
    },
    "/admin/organization/brands": {
      title: "Brands",
      subtitle: "Manage product brands",
    },
    "/admin/organization/units": {
      title: "Units",
      subtitle: "Manage inventory units",
    },
    "/admin/organization/suppliers": {
      title: "Suppliers",
      subtitle: "Manage supplier information",
    },
    "/admin/inventory": {
      title: "Inventory",
      subtitle: "Global inventory overview",
    },
    "/admin/inventory/stock-overview": {
      title: "Stock Overview",
      subtitle: "Monitor stock across warehouses",
    },
    "/admin/inventory/adjustments": {
      title: "Stock Adjustments",
      subtitle: "Review inventory adjustments",
    },
    "/admin/sales": {
      title: "Sales",
      subtitle: "Global sales overview",
    },
    "/admin/purchases": {
      title: "Purchases",
      subtitle: "Manage purchase activity",
    },
    "/admin/stock-movements": {
      title: "Stock Movements",
      subtitle: "Track inventory movements",
    },
    "/admin/returns": {
      title: "Returns",
      subtitle: "Manage product returns",
    },
    "/admin/alerts": {
      title: "Alerts",
      subtitle: "System alerts and notifications",
    },
    "/admin/activity": {
      title: "Activity Logs",
      subtitle: "Monitor system activity",
    },
    "/admin/audit-logs": {
      title: "Audit Logs",
      subtitle: "Review administrative changes",
    },
    "/admin/system-health": {
      title: "System Health",
      subtitle: "Monitor system services",
    },
    "/admin/reports": {
      title: "Reports",
      subtitle: "Business and system reports",
    },
    "/admin/profile": {
      title: "Profile",
      subtitle: "Manage your administrator profile",
    },
    "/admin/settings": {
      title: "Settings",
      subtitle: "Configure system preferences",
    },
  };

  const getPageContext = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }

    const matchingPath = Object.keys(pageTitles)
      .filter((path) => location.pathname.startsWith(`${path}/`))
      .sort((a, b) => b.length - a.length)[0];

    return (
      pageTitles[matchingPath] || {
        title: "Admin Panel",
        subtitle: "InventoryFlow administration",
      }
    );
  };

  const { title, subtitle } = getPageContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) return;

    // Global search will later be connected to the backend.
    // For now, route the user to the users page.
    navigate(`/admin/users?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);

    // Existing authentication/logout logic will be connected here.
    navigate("/login");
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu size={21} />
          </button>

          {/* Page Context */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Center Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden max-w-xl flex-1 md:block"
        >
          <div className="relative mx-auto w-full max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(event.target.value)
              }
              placeholder="Search users, products, orders..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />

            <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:flex">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </div>
        </form>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Mobile Search */}
          <button
            type="button"
            onClick={() => {
              // Search modal can be introduced later for mobile.
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Help */}
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(
                  (previous) => !previous
                );
                setIsProfileOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>
                    <p className="text-xs text-slate-500">
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 ${
                        notification.unread
                          ? "bg-amber-50/30"
                          : ""
                      }`}
                    >
                      <div
                        className={`
                          mt-0.5 flex h-8 w-8 shrink-0 items-center
                          justify-center rounded-lg
                          ${
                            notification.type === "warning"
                              ? "bg-amber-100 text-amber-600"
                              : notification.type === "success"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-blue-100 text-blue-600"
                          }
                        `}
                      >
                        {notification.type === "warning" ? (
                          <Bell size={15} />
                        ) : notification.type === "success" ? (
                          <ShieldCheck size={15} />
                        ) : (
                          <Bell size={15} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">
                            {notification.title}
                          </p>

                          {notification.unread && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                          )}
                        </div>

                        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {notification.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <NavLink
                  to="/admin/alerts"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="flex items-center justify-center border-t border-slate-100 px-4 py-3 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                  View all notifications
                </NavLink>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(
                  (previous) => !previous
                );
                setIsNotificationsACOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                {admin.initials}
              </div>

              <div className="hidden min-w-0 text-left lg:block">
                <p className="max-w-[130px] truncate text-xs font-bold text-slate-800">
                  {admin.name}
                </p>

                <p className="max-w-[130px] truncate text-[10px] text-slate-400">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`hidden text-slate-400 transition-transform lg:block ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                {/* Profile Summary */}
                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                      {admin.initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {admin.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    <ShieldCheck size={13} />
                    <span>{admin.role}</span>
                  </div>
                </div>

                {/* Account Links */}
                <div className="p-2">
                  <NavLink
                    to="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <UserCircle size={18} />
                    Profile
                  </NavLink>

                  <NavLink
                    to="/admin/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Settings size={18} />
                    Settings
                  </NavLink>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={18} />
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
