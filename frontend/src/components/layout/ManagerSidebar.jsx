// import {
//   LayoutDashboard,
//   Package,
//   Boxes,
//   Truck,
//   ShoppingCart,
//   Receipt,
//   Bell,
//   BarChart3,
//   FileText,
//   Settings,
//   UserCircle,
//   LogOut,
//   ChevronLeft,
// } from "lucide-react";
// import { NavLink, useNavigate } from "react-router-dom";

// const menuItems = [
//   {
//     label: "Dashboard",
//     icon: LayoutDashboard,
//     path: "/manager/dashboard",
//   },
//   {
//     label: "Inventory",
//     icon: Boxes,
//     path: "/manager/inventory",
//   },
//   {
//     label: "Products",
//     icon: Package,
//     path: "/manager/products",
//   },
//   {
//     label: "Suppliers",
//     icon: Truck,
//     path: "/manager/suppliers",
//   },
//   {
//     label: "Purchase Orders",
//     icon: ShoppingCart,
//     path: "/manager/purchase-orders",
//   },
//   {
//     label: "Sales",
//     icon: Receipt,
//     path: "/manager/sales",
//   },
//   {
//     label: "Alerts",
//     icon: Bell,
//     path: "/manager/alerts",
//   },
//   {
//     label: "Analytics",
//     icon: BarChart3,
//     path: "/manager/analytics",
//   },
//   {
//     label: "Reports",
//     icon: FileText,
//     path: "/manager/reports",
//   },
// ];

// const bottomItems = [
//   {
//     label: "Profile",
//     icon: UserCircle,
//     path: "/manager/profile",
//   },
//   {
//     label: "Settings",
//     icon: Settings,
//     path: "/manager/settings",
//   },
// ];

// const ManagerSidebar = ({ collapsed = false }) => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     navigate("/auth/login");
//   };

//   return (
//     <aside
//       className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
//         collapsed ? "w-20" : "w-64"
//       }`}
//     >
//       {/* Logo */}
//       <div className="flex h-16 items-center border-b border-slate-200 px-5">
//         <div className="flex items-center gap-3">
//           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
//             <Package size={19} strokeWidth={2.2} />
//           </div>

//           {!collapsed && (
//             <div>
//               <h1 className="text-sm font-bold tracking-tight text-slate-900">
//                 InventoryFlow
//               </h1>

//               <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
//                 Management
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main Navigation */}
//       <div className="flex-1 overflow-y-auto px-3 py-5">
//         <p
//           className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${
//             collapsed ? "text-center" : ""
//           }`}
//         >
//           {!collapsed && "Workspace"}
//         </p>

//         <nav className="space-y-1">
//           {menuItems.map((item) => {
//             const Icon = item.icon;

//             return (
//               <NavLink
//                 key={item.path}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
//                     isActive
//                       ? "bg-blue-50 text-blue-700"
//                       : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                   } ${collapsed ? "justify-center" : ""}`
//                 }
//                 title={collapsed ? item.label : ""}
//               >
//                 <Icon
//                   size={18}
//                   strokeWidth={1.9}
//                   className="shrink-0"
//                 />

//                 {!collapsed && <span>{item.label}</span>}
//               </NavLink>
//             );
//           })}
//         </nav>

//         {/* Account */}
//         <div className="mt-8">
//           <p
//             className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${
//               collapsed ? "text-center" : ""
//             }`}
//           >
//             {!collapsed && "Account"}
//           </p>

//           <nav className="space-y-1">
//             {bottomItems.map((item) => {
//               const Icon = item.icon;

//               return (
//                 <NavLink
//                   key={item.path}
//                   to={item.path}
//                   className={({ isActive }) =>
//                     `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
//                       isActive
//                         ? "bg-blue-50 text-blue-700"
//                         : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                     } ${collapsed ? "justify-center" : ""}`
//                   }
//                   title={collapsed ? item.label : ""}
//                 >
//                   <Icon size={18} strokeWidth={1.9} />

//                   {!collapsed && <span>{item.label}</span>}
//                 </NavLink>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Logout */}
//       <div className="border-t border-slate-200 p-3">
//         <button
//           onClick={handleLogout}
//           className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
//             collapsed ? "justify-center" : ""
//           }`}
//           title={collapsed ? "Logout" : ""}
//         >
//           <LogOut size={18} />

//           {!collapsed && <span>Logout</span>}
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default ManagerSidebar;




import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  Bell,
  BarChart3,
  FileText,
  Settings,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/manager/dashboard",
  },
  {
    label: "Inventory",
    icon: Boxes,
    path: "/manager/inventory",
  },
//   {
//     label: "Suppliers",
//     icon: Truck,
//     path: "/manager/suppliers",
//   },
  {
    label: "Purchase Orders",
    icon: ShoppingCart,
    path: "/manager/purchase-orders",
  },
  {
    label: "Sales",
    icon: Receipt,
    path: "/manager/sales",
  },
//   {
//     label: "Alerts",
//     icon: Bell,
//     path: "/manager/alerts",
//   },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/manager/analytics",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/manager/reports",
  },
];

const accountItems = [
//   {
//     label: "Profile",
//     icon: UserCircle,
//     path: "/manager/profile",
//   },
//   {
//     label: "Settings",
//     icon: Settings,
//     path: "/manager/settings",
//   },
];

const ManagerSidebar = ({
  collapsed,
  mobileOpen,
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
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Package size={19} />
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-900">
                InventoryFlow
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Management
              </p>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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

      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex h-16 items-center border-b border-slate-200 ${
            collapsed ? "justify-center px-3" : "px-5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Package size={19} />
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-sm font-bold text-slate-900">
                  InventoryFlow
                </h1>

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Management
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarContent
          collapsed={collapsed}
          menuItems={menuItems}
          accountItems={accountItems}
          handleLogout={handleLogout}
        />

        {/* Collapse Button */}
        <button
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
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.9} />

                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Account */}
      {/* <div className="mt-8">
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
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.9} />

                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div> */}

      <div className="mt-auto border-t border-slate-100 pt-3">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default ManagerSidebar;