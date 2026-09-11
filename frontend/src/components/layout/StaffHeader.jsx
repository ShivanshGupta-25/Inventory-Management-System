import { useState } from "react";
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
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const StaffHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const notifications = [
    {
      icon: AlertTriangle,
      title: "Low stock detected",
      description: "8 products need replenishment.",
      time: "10 min ago",
    },
    {
      icon: ClipboardList,
      title: "Purchase request approved",
      description: "PR-1024 has been approved.",
      time: "35 min ago",
    },
    {
      icon: Package,
      title: "Stock updated",
      description: "42 units added to inventory.",
      time: "1 hr ago",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* =====================================================
          LEFT
      ====================================================== */}

      <div className="flex items-center gap-3">
        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Search */}

        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search
            size={16}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search inventory..."
            className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-64"
          />

          <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
            /
          </span>
        </div>

        {/* Mobile Search */}

        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 md:hidden"
        >
          <Search size={19} />
        </button>
      </div>

      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div className="flex items-center gap-2 sm:gap-3">

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(
                !notificationsOpen
              );

              setProfileOpen(false);
            }}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell size={19} />

            {/* Notification indicator */}

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="text-[11px] text-slate-400">
                    Recent inventory activity
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                  3 new
                </span>
              </div>

              {/* Notifications */}

              <div className="divide-y divide-slate-100">
                {notifications.map(
                  (notification, index) => {
                    const Icon =
                      notification.icon;

                    return (
                      <button
                        type="button"
                        key={index}
                        className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <Icon size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700">
                            {notification.title}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {
                              notification.description
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {/* View All */}

              <button
                type="button"
                onClick={() =>
                  navigate("/staff/alerts")
                }
                className="w-full border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-blue-600 transition hover:bg-slate-50"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        {/* =================================================
            PROFILE
        ================================================== */}

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              S
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800">
                Staff User
              </p>

              <p className="text-[10px] text-slate-400">
                Staff
              </p>
            </div>

            <ChevronDown
              size={15}
              className="hidden text-slate-400 sm:block"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

              {/* User Info */}

              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  Staff User
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  staff@example.com
                </p>
              </div>

              <div className="p-2">

                {/* Profile */}

                <Link
                  to="/staff/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <User size={16} />
                  Profile
                </Link>

                {/* Settings */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/staff/settings")
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Logout */}

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
    </header>
  );
};

export default StaffHeader;