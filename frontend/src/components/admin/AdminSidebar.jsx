import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
  ServerCog,
  ScrollText,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const AdminSidebar = ({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const isControlled = controlledCollapsed !== undefined;

  const isCollapsed = isControlled
    ? controlledCollapsed
    : internalCollapsed;

  const setCollapsed = (value) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };


  const navigation = [
    {
      section: "MAIN",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
        },
      ],
    },

    {
      section: "MANAGEMENT",
      items: [
        {
          label: "Users",
          icon: Users,
          path: "/admin/users",
        },
        // {  
        //   label: "Roles & Permissions",
        //   icon: ShieldCheck,
        //   path: "/admin/users/roles", 
        // },
      ],
    },

    {
      section: "MONITORING",
      items: [
        // {
        //   label: "Alerts",
        //   icon: AlertTriangle,
        //   path: "/admin/alerts",
        // },
        // {
        //   label: "Activity Logs",
        //   icon: Activity,
        //   path: "/admin/activity",
        // },
        {
          label: "Audit Logs",
          icon: ScrollText,
          path: "/admin/audit-logs",
        },
      ],
    },
    {
      section: "Communication ",
      items: [
        // {
        //   label: "Alerts",
        //   icon: AlertTriangle,
        //   path: "/admin/alerts",
        // },
        // {
        //   label: "Activity Logs",
        //   icon: Activity,
        //   path: "/admin/activity",
        // },
        {
          label: "chat",
          icon: ScrollText,
          path: "/admin/communication",
        },
      ],
    },

    {
      section: "REPORTS",
      items: [
        {
          label: "Reports",
          icon: FileBarChart,
          path: "/admin/reports",
        },
      ],
    },

    {
      section: "SYSTEM",
      items: [
        {
          label: "System Health",
          icon: ServerCog,
          path: "/admin/system-health",
        },
      ],
    },
  ];

  const accountNavigation = [
    {
      label: "Profile",
      icon: UserCog,
      path: "/admin/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  /*
   * ============================================================
   * ROUTE HELPERS
   * ============================================================
   */

  const isPathActive = (path) => {
    if (path === "/admin/dashboard") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/" ||
        location.pathname === "/admin/dashboard"
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const isParentActive = (item) => {
    if (!item.children) {
      return isPathActive(item.path);
    }

    return item.children.some((child) =>
      isPathActive(child.path)
    );
  };

  /*
   * Automatically open the parent menu containing
   * the currently active route.
   */
  useEffect(() => {
    const activeMenus = {};

    navigation.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children && isParentActive(item)) {
          activeMenus[item.label] = true;
        }
      });
    });

    setOpenMenus((previous) => ({
      ...previous,
      ...activeMenus,
    }));
  }, [location.pathname]);

  const toggleMenu = (label) => {
    setOpenMenus((previous) => ({
      ...previous,
      [label]: !previous[label],
    }));
  };

  const handleNavigation = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });

    if (onMobileClose) {
      onMobileClose();
    }
  };

  /*
   * ============================================================
   * NAVIGATION ITEM
   * ============================================================
   */

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const hasChildren = item.children?.length > 0;
    const active = isParentActive(item);
    const isOpen = openMenus[item.label];

    /*
     * Parent item with submenu
     */
    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setCollapsed(false);
              }

              toggleMenu(item.label);
            }}
            title={isCollapsed ? item.label : undefined}
            className={`
              group flex w-full items-center rounded-xl px-3 py-2.5
              text-sm font-medium transition-all duration-200
              ${
                active
                  ? "bg-amber-50 text-amber-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }
              ${isCollapsed ? "justify-center" : "justify-between"}
            `}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Icon
                size={19}
                strokeWidth={active ? 2.2 : 1.9}
                className="shrink-0"
              />

              {!isCollapsed && (
                <span className="truncate">
                  {item.label}
                </span>
              )}
            </span>

            {!isCollapsed &&
              (isOpen ? (
                <ChevronDown
                  size={16}
                  className="shrink-0"
                />
              ) : (
                <ChevronRight
                  size={16}
                  className="shrink-0"
                />
              ))}
          </button>

          {!isCollapsed && isOpen && (
            <div className="ml-5 mt-1 border-l border-slate-200 pl-3">
              {item.children.map((child) => {
                const childActive = isPathActive(child.path);

                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={handleNavigation}
                    className={`
                      relative mb-1 flex items-center rounded-lg
                      px-3 py-2 text-[13px] transition-all duration-200
                      ${
                        childActive
                          ? "bg-amber-50 font-semibold text-amber-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }
                    `}
                  >
                    {childActive && (
                      <span
                        className="
                          absolute -left-[17px]
                          h-5 w-0.5 rounded-full
                          bg-amber-500
                        "
                      />
                    )}

                    {child.label}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    /*
     * Normal navigation item
     */
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={handleNavigation}
        title={isCollapsed ? item.label : undefined}
        className={`
          group mb-1 flex items-center rounded-xl px-3 py-2.5
          text-sm font-medium transition-all duration-200
          ${
            active
              ? "bg-amber-50 text-amber-700 shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
          ${isCollapsed ? "justify-center" : "gap-3"}
        `}
      >
        <Icon
          size={19}
          strokeWidth={active ? 2.2 : 1.9}
          className="shrink-0"
        />

        {!isCollapsed && (
          <span className="truncate">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={onMobileClose}
          className="
            fixed inset-0 z-40
            bg-slate-950/40
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-200 bg-white
          transition-all duration-300 ease-in-out

          ${isCollapsed ? "w-[78px]" : "w-[270px]"}

          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ====================================================
            BRAND
        ==================================================== */}

        <div
          className={`
            flex h-[72px] shrink-0 items-center
            border-b border-slate-200

            ${
              isCollapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }
          `}
        >
          <NavLink
            to="/admin/dashboard"
            onClick={handleNavigation}
            className="flex items-center gap-3"
          >
            {/* Logo */}
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-amber-500
                shadow-sm
              "
            >
              <ShieldCheck
                size={22}
                className="text-white"
                strokeWidth={2.2}
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p
                  className="
                    truncate text-[17px]
                    font-bold tracking-tight
                    text-slate-900
                  "
                >
                  InventoryFlow
                </p>

                <p
                  className="
                    text-[10px] font-semibold
                    uppercase tracking-[0.16em]
                    text-amber-600
                  "
                >
                  Admin Panel
                </p>
              </div>
            )}
          </NavLink>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="
              rounded-lg p-2
              text-slate-500
              hover:bg-slate-100
              hover:text-slate-900
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* ====================================================
            MAIN NAVIGATION
        ==================================================== */}

        <div
          className="
            flex-1 overflow-y-auto
            px-3 py-5
            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-slate-200
          "
        >
          {navigation.map((group) => (
            <div
              key={group.section}
              className="mb-6 last:mb-0"
            >
              {/* Section title */}
              {!isCollapsed && (
                <div className="mb-2 px-3">
                  <p
                    className="
                      text-[10px] font-bold
                      tracking-[0.16em]
                      text-slate-400
                    "
                  >
                    {group.section}
                  </p>
                </div>
              )}

              {/* Collapsed separator */}
              {isCollapsed && (
                <div className="mb-3 h-px bg-slate-100" />
              )}

              {group.items.map(renderNavItem)}
            </div>
          ))}
        </div>

        {/* ====================================================
            ACCOUNT
        ==================================================== */}

        <div
          className="
            shrink-0
            border-t border-slate-200
            p-3
          "
        >
          {!isCollapsed && (
            <p
              className="
                mb-2 px-3
                text-[10px] font-bold
                tracking-[0.16em]
                text-slate-400
              "
            >
              ACCOUNT
            </p>
          )}

          {accountNavigation.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavigation}
                title={isCollapsed ? item.label : undefined}
                className={`
                  mb-1 flex items-center
                  rounded-xl px-3 py-2.5
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                  ${isCollapsed ? "justify-center" : "gap-3"}
                `}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.9}
                  className="shrink-0"
                />

                {!isCollapsed && (
                  <span>{item.label}</span>
                )}
              </NavLink>
            );
          })}

          {/* Logout */}
          <button
            type="button"
            title={isCollapsed ? "Logout" : undefined}
            onClick={handleLogout}
            className={`
              mt-1 flex w-full
              items-center rounded-xl
              px-3 py-2.5
              text-sm font-medium
              text-slate-600
              transition-all duration-200
              hover:bg-red-50
              hover:text-red-600
              ${isCollapsed ? "justify-center" : "gap-3"}
            `}
          >
            <LogOut
              size={19}
              strokeWidth={1.9}
            />

            {!isCollapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>

        {/* ====================================================
            DESKTOP COLLAPSE
        ==================================================== */}

        <div
          className="
            hidden border-t border-slate-200
            p-3 lg:block
          "
        >
          <button
            type="button"
            onClick={() => setCollapsed(!isCollapsed)}
            className={`
              flex w-full
              items-center rounded-xl
              px-3 py-2.5
              text-sm font-medium
              text-slate-500
              transition-colors
              hover:bg-slate-50
              hover:text-slate-900
              ${isCollapsed ? "justify-center" : "gap-3"}
            `}
            title={
              isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {isCollapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <>
                <PanelLeftClose size={19} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;