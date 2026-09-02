// import { useState } from "react";
// import {
//   BarChart3,
//   Bell,
//   Boxes,
//   ChevronDown,
//   ClipboardList,
//   LayoutDashboard,
//   Menu,
//   Package,
//   Search,
//   Settings,
//   ShoppingCart,
//   Truck,
//   Users,
//   X,
//   AlertTriangle,
//   ArrowDownToLine,
//   ArrowUpFromLine,
//   TrendingUp,
//   CircleUserRound,
// } from "lucide-react";
// import { Link } from "react-router-dom";

// const ManagerDashboardPage = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const stats = [
//     {
//       title: "Total Products",
//       value: "1,248",
//       change: "+8.2%",
//       description: "from last month",
//       icon: Package,
//       iconBg: "bg-blue-50",
//       iconColor: "text-blue-600",
//       positive: true,
//     },
//     {
//       title: "Total Stock",
//       value: "8,642",
//       change: "+5.4%",
//       description: "units available",
//       icon: Boxes,
//       iconBg: "bg-indigo-50",
//       iconColor: "text-indigo-600",
//       positive: true,
//     },
//     {
//       title: "Pending Orders",
//       value: "36",
//       change: "-12.5%",
//       description: "from last week",
//       icon: ShoppingCart,
//       iconBg: "bg-amber-50",
//       iconColor: "text-amber-600",
//       positive: true,
//     },
//     {
//       title: "Low Stock Items",
//       value: "18",
//       change: "+3",
//       description: "need attention",
//       icon: AlertTriangle,
//       iconBg: "bg-red-50",
//       iconColor: "text-red-600",
//       positive: false,
//     },
//   ];

//   const transactions = [
//     {
//       product: "Wireless Mouse",
//       type: "Stock In",
//       quantity: "+120",
//       date: "Today, 10:42 AM",
//       status: "Completed",
//     },
//     {
//       product: "Mechanical Keyboard",
//       type: "Stock Out",
//       quantity: "-35",
//       date: "Today, 09:18 AM",
//       status: "Completed",
//     },
//     {
//       product: "USB-C Hub",
//       type: "Stock In",
//       quantity: "+80",
//       date: "Yesterday, 04:35 PM",
//       status: "Completed",
//     },
//     {
//       product: "Laptop Stand",
//       type: "Stock Out",
//       quantity: "-24",
//       date: "Yesterday, 02:12 PM",
//       status: "Completed",
//     },
//     {
//       product: "Webcam",
//       type: "Stock In",
//       quantity: "+50",
//       date: "Aug 31, 11:25 AM",
//       status: "Completed",
//     },
//   ];

//   const lowStockItems = [
//     {
//       product: "Wireless Headphones",
//       sku: "WH-2048",
//       stock: 7,
//       minimum: 20,
//     },
//     {
//       product: "Bluetooth Speaker",
//       sku: "BS-1082",
//       stock: 11,
//       minimum: 25,
//     },
//     {
//       product: "USB-C Cable",
//       sku: "UC-3091",
//       stock: 14,
//       minimum: 30,
//     },
//     {
//       product: "Laptop Stand",
//       sku: "LS-4412",
//       stock: 8,
//       minimum: 15,
//     },
//   ];

//   const navigation = [
//     {
//       name: "Dashboard",
//       icon: LayoutDashboard,
//       active: true,
//     },
//     {
//       name: "Products",
//       icon: Package,
//     },
//     {
//       name: "Inventory",
//       icon: Boxes,
//     },
//     {
//       name: "Suppliers",
//       icon: Truck,
//     },
//     {
//       name: "Orders",
//       icon: ShoppingCart,
//     },
//     {
//       name: "Analytics",
//       icon: BarChart3,
//     },
//     {
//       name: "Users",
//       icon: Users,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
//           sidebarOpen
//             ? "translate-x-0"
//             : "-translate-x-full"
//         }`}
//       >

//         {/* Logo */}
//         <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">

//           <Link
//             to="/"
//             className="flex items-center gap-3"
//           >
//             <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
//               <Package size={19} />
//             </div>

//             <div className="leading-tight">
//               <p className="text-base font-bold text-slate-900">
//                 Inventory<span className="text-blue-600">Flow</span>
//               </p>

//               <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
//                 Management
//               </p>
//             </div>
//           </Link>

//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
//           >
//             <X size={20} />
//           </button>

//         </div>

//         {/* Navigation */}
//         <div className="flex-1 overflow-y-auto px-4 py-6">

//           <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//             Main Menu
//           </p>

//           <nav className="space-y-1">

//             {navigation.map((item) => {
//               const Icon = item.icon;

//               return (
//                 <button
//                   key={item.name}
//                   className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
//                     item.active
//                       ? "bg-blue-50 text-blue-600"
//                       : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                   }`}
//                 >
//                   <Icon size={18} />
//                   {item.name}
//                 </button>
//               );
//             })}

//           </nav>

//           <div className="my-6 border-t border-slate-100" />

//           <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
//             System
//           </p>

//           <nav>
//             <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
//               <Bell size={18} />
//               Notifications

//               <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-50 px-1.5 text-[10px] font-bold text-red-600">
//                 12
//               </span>
//             </button>

//             <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
//               <Settings size={18} />
//               Settings
//             </button>
//           </nav>

//         </div>

//         {/* User */}
//         <div className="border-t border-slate-100 p-4">

//           <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
//               <CircleUserRound size={19} />
//             </div>

//             <div className="min-w-0 flex-1">
//               <p className="truncate text-sm font-semibold text-slate-900">
//                 Manager
//               </p>

//               <p className="truncate text-xs text-slate-400">
//                 manager@inventoryflow.com
//               </p>
//             </div>

//             <ChevronDown
//               size={16}
//               className="text-slate-400"
//             />

//           </div>

//         </div>

//       </aside>

//       {/* Main Content */}
//       <div className="lg:pl-64">

//         {/* Header */}
//         <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-7">

//           <div className="flex items-center gap-3">

//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
//             >
//               <Menu size={21} />
//             </button>

//             <div>
//               <h1 className="text-lg font-bold text-slate-900">
//                 Dashboard
//               </h1>

//               <p className="hidden text-xs text-slate-400 sm:block">
//                 Overview of your inventory operations
//               </p>
//             </div>

//           </div>

//           <div className="flex items-center gap-2 sm:gap-4">

//             {/* Search */}
//             <button className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
//               <Search size={19} />
//             </button>

//             {/* Notification */}
//             <button className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
//               <Bell size={19} />

//               <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
//             </button>

//             {/* Profile */}
//             <div className="hidden h-8 w-px bg-slate-200 sm:block" />

//             <button className="flex items-center gap-2">

//               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
//                 <CircleUserRound size={19} />
//               </div>

//               <div className="hidden text-left md:block">
//                 <p className="text-xs font-semibold text-slate-900">
//                   Manager
//                 </p>

//                 <p className="text-[10px] text-slate-400">
//                   Administrator
//                 </p>
//               </div>

//               <ChevronDown
//                 size={15}
//                 className="hidden text-slate-400 md:block"
//               />

//             </button>

//           </div>

//         </header>

//         {/* Dashboard Content */}
//         <main className="mx-auto max-w-7xl px-5 py-7 sm:px-7">

//           {/* Welcome */}
//           <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

//             <div>
//               <p className="text-sm font-medium text-blue-600">
//                 Good morning, Manager
//               </p>

//               <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
//                 Here's your inventory overview
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Monitor stock, orders, and inventory activity from one place.
//               </p>
//             </div>

//             <div className="flex gap-3">

//               <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
//                 <ArrowDownToLine size={16} />
//                 Stock In
//               </button>

//               <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
//                 <ArrowUpFromLine size={16} />
//                 Stock Out
//               </button>

//             </div>

//           </div>

//           {/* Stats */}
//           <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

//             {stats.map((stat) => {
//               const Icon = stat.icon;

//               return (
//                 <div
//                   key={stat.title}
//                   className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
//                 >

//                   <div className="flex items-start justify-between">

//                     <div>
//                       <p className="text-sm font-medium text-slate-500">
//                         {stat.title}
//                       </p>

//                       <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
//                         {stat.value}
//                       </p>
//                     </div>

//                     <div
//                       className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
//                     >
//                       <Icon size={19} />
//                     </div>

//                   </div>

//                   <div className="mt-4 flex items-center gap-2 text-xs">

//                     <span
//                       className={`font-semibold ${
//                         stat.positive
//                           ? "text-green-600"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {stat.change}
//                     </span>

//                     <span className="text-slate-400">
//                       {stat.description}
//                     </span>

//                   </div>

//                 </div>
//               );
//             })}

//           </div>

//           {/* Main Grid */}
//           <div className="mt-6 grid gap-6 xl:grid-cols-3">

//             {/* Inventory Chart */}
//             <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

//               <div className="flex items-start justify-between">

//                 <div>
//                   <h3 className="text-base font-bold text-slate-900">
//                     Inventory Overview
//                   </h3>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Stock movement over the last 7 days
//                   </p>
//                 </div>

//                 <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
//                   Last 7 days
//                   <ChevronDown
//                     size={13}
//                     className="ml-1 inline"
//                   />
//                 </button>

//               </div>

//               {/* Chart */}
//               <div className="mt-8">

//                 <div className="flex h-56 items-end gap-3 border-b border-l border-slate-100 px-3">

//                   {[48, 62, 54, 76, 67, 88, 73].map(
//                     (height, index) => (
//                       <div
//                         key={index}
//                         className="flex h-full flex-1 items-end justify-center"
//                       >
//                         <div
//                           className="w-full max-w-12 rounded-t-lg bg-blue-100 transition hover:bg-blue-200"
//                           style={{
//                             height: `${height}%`,
//                           }}
//                         />
//                       </div>
//                     )
//                   )}

//                 </div>

//                 <div className="mt-3 flex justify-between pl-3 text-[10px] text-slate-400">

//                   <span>Mon</span>
//                   <span>Tue</span>
//                   <span>Wed</span>
//                   <span>Thu</span>
//                   <span>Fri</span>
//                   <span>Sat</span>
//                   <span>Sun</span>

//                 </div>

//               </div>

//               <div className="mt-6 flex items-center gap-5 border-t border-slate-100 pt-5">

//                 <div className="flex items-center gap-2 text-xs text-slate-500">
//                   <span className="h-2.5 w-2.5 rounded-full bg-blue-200" />
//                   Stock movement
//                 </div>

//                 <div className="flex items-center gap-2 text-xs text-slate-500">
//                   <TrendingUp
//                     size={14}
//                     className="text-green-500"
//                   />
//                   12.4% increase
//                 </div>

//               </div>

//             </div>

//             {/* Stock Status */}
//             <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

//               <div className="flex items-start justify-between">

//                 <div>
//                   <h3 className="text-base font-bold text-slate-900">
//                     Stock Status
//                   </h3>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Current inventory health
//                   </p>
//                 </div>

//                 <Boxes
//                   size={19}
//                   className="text-blue-600"
//                 />

//               </div>

//               {/* Donut-style visual */}
//               <div className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full border-[18px] border-blue-100 border-t-blue-600 border-r-blue-400">

//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-slate-900">
//                     86%
//                   </p>

//                   <p className="text-[10px] text-slate-400">
//                     Healthy
//                   </p>
//                 </div>

//               </div>

//               <div className="mt-7 space-y-3">

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
//                     <span className="text-xs text-slate-500">
//                       Healthy
//                     </span>
//                   </div>

//                   <span className="text-xs font-semibold text-slate-700">
//                     86%
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="h-2.5 w-2.5 rounded-full bg-blue-300" />
//                     <span className="text-xs text-slate-500">
//                       Medium
//                     </span>
//                   </div>

//                   <span className="text-xs font-semibold text-slate-700">
//                     9%
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
//                     <span className="text-xs text-slate-500">
//                       Critical
//                     </span>
//                   </div>

//                   <span className="text-xs font-semibold text-slate-700">
//                     5%
//                   </span>
//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* Bottom Grid */}
//           <div className="mt-6 grid gap-6 xl:grid-cols-5">

//             {/* Recent Transactions */}
//             <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-3">

//               <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

//                 <div>
//                   <h3 className="text-base font-bold text-slate-900">
//                     Recent Transactions
//                   </h3>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Latest inventory movements
//                   </p>
//                 </div>

//                 <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
//                   View all
//                 </button>

//               </div>

//               <div className="overflow-x-auto">

//                 <table className="w-full min-w-[600px]">

//                   <thead>
//                     <tr className="border-b border-slate-100 text-left">

//                       <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                         Product
//                       </th>

//                       <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                         Type
//                       </th>

//                       <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                         Quantity
//                       </th>

//                       <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
//                         Date
//                       </th>

//                     </tr>
//                   </thead>

//                   <tbody>

//                     {transactions.map((transaction) => (
//                       <tr
//                         key={`${transaction.product}-${transaction.date}`}
//                         className="border-b border-slate-50 last:border-0"
//                       >

//                         <td className="px-5 py-4">

//                           <div className="flex items-center gap-3">

//                             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
//                               <Package size={15} />
//                             </div>

//                             <span className="text-sm font-medium text-slate-700">
//                               {transaction.product}
//                             </span>

//                           </div>

//                         </td>

//                         <td className="px-5 py-4">

//                           <span
//                             className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
//                               transaction.type === "Stock In"
//                                 ? "bg-green-50 text-green-600"
//                                 : "bg-blue-50 text-blue-600"
//                             }`}
//                           >
//                             {transaction.type}
//                           </span>

//                         </td>

//                         <td className="px-5 py-4">

//                           <span
//                             className={`text-sm font-semibold ${
//                               transaction.quantity.startsWith("+")
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {transaction.quantity}
//                           </span>

//                         </td>

//                         <td className="px-5 py-4 text-xs text-slate-400">
//                           {transaction.date}
//                         </td>

//                       </tr>
//                     ))}

//                   </tbody>

//                 </table>

//               </div>

//             </div>

//             {/* Low Stock */}
//             <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

//               <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

//                 <div>
//                   <h3 className="text-base font-bold text-slate-900">
//                     Low Stock Alerts
//                   </h3>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Products requiring attention
//                   </p>
//                 </div>

//                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
//                   <AlertTriangle size={16} />
//                 </div>

//               </div>

//               <div className="divide-y divide-slate-100">

//                 {lowStockItems.map((item) => (
//                   <div
//                     key={item.sku}
//                     className="flex items-center gap-3 px-5 py-4"
//                   >

//                     <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
//                       <Package size={16} />
//                     </div>

//                     <div className="min-w-0 flex-1">

//                       <p className="truncate text-sm font-semibold text-slate-700">
//                         {item.product}
//                       </p>

//                       <p className="mt-0.5 text-[10px] text-slate-400">
//                         SKU: {item.sku}
//                       </p>

//                     </div>

//                     <div className="text-right">

//                       <p className="text-sm font-bold text-red-600">
//                         {item.stock}
//                       </p>

//                       <p className="text-[10px] text-slate-400">
//                         Min: {item.minimum}
//                       </p>

//                     </div>

//                   </div>
//                 ))}

//               </div>

//               <div className="border-t border-slate-100 px-5 py-4">
//                 <button className="w-full rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
//                   View All Alerts
//                 </button>
//               </div>

//             </div>

//           </div>

//           {/* Quick Actions */}
//           <div className="mt-6">

//             <h3 className="text-base font-bold text-slate-900">
//               Quick Actions
//             </h3>

//             <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

//               <button className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
//                   <Package size={19} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-slate-800">
//                     Add Product
//                   </p>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Create a new product
//                   </p>
//                 </div>

//               </button>

//               <button className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-green-200 hover:shadow-md">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
//                   <ArrowDownToLine size={19} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-slate-800">
//                     Add Stock
//                   </p>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Record incoming stock
//                   </p>
//                 </div>

//               </button>

//               <button className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white">
//                   <Truck size={19} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-slate-800">
//                     Add Supplier
//                   </p>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Manage suppliers
//                   </p>
//                 </div>

//               </button>

//               <button className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
//                   <ClipboardList size={19} />
//                 </div>

//                 <div>
//                   <p className="text-sm font-semibold text-slate-800">
//                     Create Order
//                   </p>

//                   <p className="mt-1 text-xs text-slate-400">
//                     Create purchase order
//                   </p>
//                 </div>

//               </button>

//             </div>

//           </div>

//         </main>

//       </div>

//     </div>
//   );
// };

// export default ManagerDashboardPage;

import { useState } from "react";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";

import DashboardStats from "../../components/manager/dashboard/DashboardStats";
import InventoryOverview from "../../components/manager/dashboard/InventoryOverview";
import StockLevelChart from "../../components/manager/dashboard/StockLevelChart";
import SalesOverview from "../../components/manager/dashboard/SalesOverview";
import LowStockProducts from "../../components/manager/dashboard/LowStockProducts";
import RecentTransactions from "../../components/manager/dashboard/RecentTransactions";
import InventoryAlerts from "../../components/manager/dashboard/InventoryAlerts";
import QuickActions from "../../components/manager/dashboard/QuickActions";

const ManagerDashboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed(!sidebarCollapsed)
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">
            {/* Heading */}
            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Overview
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Dashboard
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Here's what's happening with your inventory today.
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">
                    Last updated
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Today, 10:45 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <DashboardStats />

            {/* Inventory + Stock */}
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <StockLevelChart />
              </div>

              <InventoryOverview />
            </div>

            {/* Sales */}
            <div className="mt-5">
              <SalesOverview />
            </div>

            {/* Alerts / Low Stock */}
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <LowStockProducts />
              <InventoryAlerts />
            </div>

            {/* Transactions / Actions */}
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <RecentTransactions />
              </div>

              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;