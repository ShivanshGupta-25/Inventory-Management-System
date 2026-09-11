import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  History,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/staff/dashboard",
  },
  {
    label: "Inventory",
    icon: Boxes,
    path: "/staff/inventory",
  },
  {
    label: "Stock In",
    icon: ArrowDownToLine,
    path: "/staff/stock-in",
  },
  {
    label: "Stock Out",
    icon: ArrowUpFromLine,
    path: "/staff/stock-out",
  },
  {
    label: "Purchase Requests",
    icon: ClipboardList,
    path: "/staff/purchase-requests",
  },
  {
    label: "Stock History",
    icon: History,
    path: "/staff/stock-history",
  },
  {
    label: "Alerts",
    icon: Bell,
    path: "/staff/alerts",
  },
];

const accountItems = [
  {
    label: "Profile",
    icon: UserCircle,
    path: "/staff/profile",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/staff/settings",
  },
];

const StaffSidebar = ({
  collapsed = false,
  mobileOpen = false,
  onCollapse,
  onMobileClose,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/auth/login");
  };

  return (
    <>
      {/* =====================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Logo />

          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <SidebarContent
          collapsed={false}
          menuItems={menuItems}
          accountItems={accountItems}
          handleLogout={handleLogout}
          onMobileClose={onMobileClose}
        />
      </aside>

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex ${
          collapsed
            ? "w-20"
            : "w-64"
        }`}
      >
        {/* Logo */}

        <div
          className={`flex h-16 items-center border-b border-slate-200 ${
            collapsed
              ? "justify-center px-3"
              : "px-5"
          }`}
        >
          <Logo collapsed={collapsed} />
        </div>

        <SidebarContent
          collapsed={collapsed}
          menuItems={menuItems}
          accountItems={accountItems}
          handleLogout={handleLogout}
        />

        {/* Collapse */}

        <button
          type="button"
          onClick={onCollapse}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-900"
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </aside>
    </>
  );
};


/* =========================================================
   LOGO
========================================================= */

const Logo = ({ collapsed = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
        <Package
          size={19}
          strokeWidth={2.2}
        />
      </div>

      {!collapsed && (
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">
            InventoryFlow
          </h1>

          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Staff Panel
          </p>
        </div>
      )}
    </div>
  );
};


/* =========================================================
   SIDEBAR CONTENT
========================================================= */

const SidebarContent = ({
  collapsed,
  menuItems,
  accountItems,
  handleLogout,
  onMobileClose,
}) => {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-3 py-5">
      
      {/* Workspace */}

      <div>
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
        )}

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${
                    collapsed
                      ? "justify-center"
                      : ""
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>


      {/* Account */}

      <div className="mt-8">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>
        )}

        <nav className="space-y-1">
          {accountItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${
                    collapsed
                      ? "justify-center"
                      : ""
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.9}
                />

                {!collapsed && (
                  <span>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>


      {/* Logout */}

      <div className="mt-auto border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={handleLogout}
          title={
            collapsed
              ? "Logout"
              : undefined
          }
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
            collapsed
              ? "justify-center"
              : ""
          }`}
        >
          <LogOut size={18} />

          {!collapsed && (
            <span>
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default StaffSidebar;