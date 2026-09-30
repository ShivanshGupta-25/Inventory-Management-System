import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Database,
  FileBarChart,
  FileClock,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  Truck,
  UserCog,
  Users,
  Warehouse,
  X,
} from "lucide-react";

const AdminSidebar = ({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const location = useLocation();

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
          children: [
            {
              label: "All Users",
              path: "/admin/users",
            },
            {
              label: "Admins",
              path: "/admin/admins",
            },
            {
              label: "Managers",
              path: "/admin/users/managers",
            },
            {
              label: "Staff",
              path: "/admin/users/staff",
            },
            {
              label: "Roles & Permissions",
              path: "/admin/users/roles",
            },
          ],
        },

        // {
        //   label: "Organization",
        //   icon: Warehouse,
        //   children: [
        //     {
        //       label: "Warehouses",
        //       path: "/admin/organization/warehouses",
        //     },
        //     {
        //       label: "Categories",
        //       path: "/admin/organization/categories",
        //     },
        //     {
        //       label: "Brands",
        //       path: "/admin/organization/brands",
        //     },
        //     {
        //       label: "Units",
        //       path: "/admin/organization/units",
        //     },
        //     {
        //       label: "Suppliers",
        //       path: "/admin/organization/suppliers",
        //     },
        //   ],
        // },
      ],
    },

    {
      section: "INVENTORY",
      items: [
        {
          label: "Inventory",
          icon: Boxes,
          children: [
            {
              label: "All Inventory",
              path: "/admin/inventory",
            },
            // {
            //   label: "Stock Overview",
            //   path: "/admin/inventory/stock-overview",
            // },
            // {
            //   label: "Stock Adjustments",
            //   path: "/admin/inventory/adjustments",
            // },
          ],
        },
      ],
    },

    // {
    //   section: "OPERATIONS",
    //   items: [
    //     {
    //       label: "Sales",
    //       icon: ShoppingCart,
    //       path: "/admin/sales",
    //     },
    //     {
    //       label: "Purchases",
    //       icon: ClipboardList,
    //       path: "/admin/purchases",
    //     },
    //     {
    //       label: "Stock Movements",
    //       icon: SlidersHorizontal,
    //       path: "/admin/stock-movements",
    //     },
    //     {
    //       label: "Returns",
    //       icon: Package,
    //       path: "/admin/returns",
    //     },
    //   ],
    // },

    {
      section: "MONITORING",
      items: [
        {
          label: "Alerts",
          icon: AlertTriangle,
          path: "/admin/alerts",
        },
        {
          label: "Activity Logs",
          icon: Activity,
          path: "/admin/activity",
        },
        // {
        //   label: "Audit Logs",
        //   icon: FileClock,
        //   path: "/admin/audit-logs",
        // },
        // {
        //   label: "System Health",
        //   icon: Database,
        //   path: "/admin/system-health",
        // },
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

  const isPathActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
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

    return item.children.some((child) => isPathActive(child.path));
  };

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

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const hasChildren = item.children?.length > 0;
    const active = isParentActive(item);
    const isOpen = openMenus[item.label];

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
                <span className="truncate">{item.label}</span>
              )}
            </span>

            {!isCollapsed &&
              (isOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
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
                      <span className="absolute -left-[17px] h-5 w-0.5 rounded-full bg-amber-500" />
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
          <span className="truncate">{item.label}</span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

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
        {/* Brand */}
        <div
          className={`
            flex h-[72px] shrink-0 items-center border-b border-slate-200
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-sm">
              <Boxes
                size={22}
                className="text-white"
                strokeWidth={2.2}
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-[17px] font-bold tracking-tight text-slate-900">
                  InventoryFlow
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-600">
                  Admin Panel
                </p>
              </div>
            )}
          </NavLink>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {navigation.map((group) => (
            <div key={group.section} className="mb-6 last:mb-0">
              {!isCollapsed && (
                <div className="mb-2 px-3">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">
                    {group.section}
                  </p>
                </div>
              )}

              {isCollapsed && (
                <div className="mb-3 h-px bg-slate-100" />
              )}

              {group.items.map(renderNavItem)}
            </div>
          ))}
        </div>

        {/* Bottom Area */}
        <div className="shrink-0 border-t border-slate-200 p-3">
          {!isCollapsed && (
            <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
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
                  mb-1 flex items-center rounded-xl px-3 py-2.5
                  text-sm font-medium transition-all duration-200
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

                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          <button
            type="button"
            title={isCollapsed ? "Logout" : undefined}
            className={`
              mt-1 flex w-full items-center rounded-xl px-3 py-2.5
              text-sm font-medium text-slate-600 transition-all
              hover:bg-red-50 hover:text-red-600
              ${isCollapsed ? "justify-center" : "gap-3"}
            `}
            onClick={() => {
              // Logout logic will be connected to the existing auth
              // service when the Admin authentication flow is wired.
            }}
          >
            <LogOut size={19} strokeWidth={1.9} />

            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Button - Desktop */}
        <div className="hidden border-t border-slate-200 p-3 lg:block">
          <button
            type="button"
            onClick={() => setCollapsed(!isCollapsed)}
            className={`
              flex w-full items-center rounded-xl px-3 py-2.5
              text-sm font-medium text-slate-500
              transition-colors hover:bg-slate-50 hover:text-slate-900
              ${isCollapsed ? "justify-center" : "gap-3"}
            `}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
