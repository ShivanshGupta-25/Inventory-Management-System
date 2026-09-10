// import { useEffect, useState } from "react";
// import {
//   TrendingUp,
//   ShoppingCart,
//   Package,
//   IndianRupee,
//   AlertTriangle,
//   RefreshCw,
// } from "lucide-react";

// import ManagerSidebar from "../../../components/layout/ManagerSidebar";
// import ManagerHeader from "../../../components/layout/ManagerHeader";

// import {
//   getAnalyticsOverview,
//   getSalesTrend,
//   getProductPerformance,
//   getCategoryPerformance,
//   getInventoryAnalytics,
// } from "../../../services/analyticsService";

// const Analytics = () => {
//   /* -------------------------------------------------------------------------- */
//   /* Layout State                                                               */
//   /* -------------------------------------------------------------------------- */

//   const [sidebarCollapsed, setSidebarCollapsed] =
//     useState(false);

//   const [mobileSidebarOpen, setMobileSidebarOpen] =
//     useState(false);

//   /* -------------------------------------------------------------------------- */
//   /* Analytics State                                                            */
//   /* -------------------------------------------------------------------------- */

//   const [period, setPeriod] = useState("30d");

//   const [overview, setOverview] = useState(null);
//   const [salesTrend, setSalesTrend] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [inventory, setInventory] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   /* -------------------------------------------------------------------------- */
//   /* Fetch Analytics                                                            */
//   /* -------------------------------------------------------------------------- */

//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [
//         overviewResponse,
//         salesTrendResponse,
//         productsResponse,
//         categoriesResponse,
//         inventoryResponse,
//       ] = await Promise.all([
//         getAnalyticsOverview(period),
//         getSalesTrend(period),
//         getProductPerformance(period),
//         getCategoryPerformance(period),
//         getInventoryAnalytics(),
//       ]);

//       setOverview(
//         overviewResponse?.data || null
//       );

//       setSalesTrend(
//         salesTrendResponse?.data || []
//       );

//       setProducts(
//         productsResponse?.data || []
//       );

//       setCategories(
//         categoriesResponse?.data || []
//       );

//       setInventory(
//         inventoryResponse?.data || null
//       );
//     } catch (err) {
//       console.error(
//         "Analytics fetch error:",
//         err
//       );

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to load analytics"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [period]);

//   /* -------------------------------------------------------------------------- */
//   /* Formatters                                                                 */
//   /* -------------------------------------------------------------------------- */

//   const formatCurrency = (value = 0) => {
//     return `₹${Number(value || 0).toLocaleString(
//       "en-IN",
//       {
//         maximumFractionDigits: 0,
//       }
//     )}`;
//   };

//   const formatNumber = (value = 0) => {
//     return Number(value || 0).toLocaleString(
//       "en-IN"
//     );
//   };

//   /* -------------------------------------------------------------------------- */
//   /* Derived Data                                                               */
//   /* -------------------------------------------------------------------------- */

//   const sales = overview?.sales || {};

//   const inventoryOverview =
//     overview?.inventory || {};

//   const purchases =
//     overview?.purchases || {};

//   /* -------------------------------------------------------------------------- */
//   /* Main Layout                                                                */
//   /* -------------------------------------------------------------------------- */

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {/* -------------------------------------------------------------------- */}
//       {/* Sidebar                                                              */}
//       {/* -------------------------------------------------------------------- */}

//       <ManagerSidebar
//         collapsed={sidebarCollapsed}
//         mobileOpen={mobileSidebarOpen}
//         onCollapse={() =>
//           setSidebarCollapsed(
//             !sidebarCollapsed
//           )
//         }
//         onMobileClose={() =>
//           setMobileSidebarOpen(false)
//         }
//       />

//       {/* -------------------------------------------------------------------- */}
//       {/* Mobile Overlay                                                       */}
//       {/* -------------------------------------------------------------------- */}

//       {mobileSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
//           onClick={() =>
//             setMobileSidebarOpen(false)
//           }
//         />
//       )}

//       {/* -------------------------------------------------------------------- */}
//       {/* Main Content                                                         */}
//       {/* -------------------------------------------------------------------- */}

//       <div
//         className={`transition-all duration-300 ${
//           sidebarCollapsed
//             ? "lg:pl-20"
//             : "lg:pl-64"
//         }`}
//       >

//         {/* ---------------------------------------------------------------- */}
//         {/* Header                                                            */}
//         {/* ---------------------------------------------------------------- */}

//         <ManagerHeader
//           onMenuClick={() =>
//             setMobileSidebarOpen(true)
//           }
//         />

//         {/* ---------------------------------------------------------------- */}
//         {/* Page                                                              */}
//         {/* ---------------------------------------------------------------- */}

//         <main className="p-4 sm:p-6">
//           <div className="mx-auto max-w-[1600px]">

//             {/* ============================================================ */}
//             {/* Page Heading                                                  */}
//             {/* ============================================================ */}

//             <div className="mb-6">
//               <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

//                 {/* Title */}
//                 <div>
//                   <p className="text-xs font-medium text-slate-400">
//                     Management
//                   </p>

//                   <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
//                     Analytics
//                   </h1>

//                   <p className="mt-1 text-sm text-slate-500">
//                     Monitor sales, inventory and purchasing performance.
//                   </p>
//                 </div>

//                 {/* Period + Refresh */}
//                 <div className="flex items-center gap-2">

//                   <select
//                     value={period}
//                     onChange={(e) =>
//                       setPeriod(e.target.value)
//                     }
//                     className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
//                   >
//                     <option value="7d">
//                       Last 7 Days
//                     </option>

//                     <option value="30d">
//                       Last 30 Days
//                     </option>

//                     <option value="90d">
//                       Last 90 Days
//                     </option>

//                     <option value="6m">
//                       Last 6 Months
//                     </option>

//                     <option value="1y">
//                       Last Year
//                     </option>
//                   </select>

//                   <button
//                     onClick={fetchAnalytics}
//                     disabled={loading}
//                     title="Refresh analytics"
//                     className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     <RefreshCw
//                       size={17}
//                       className={
//                         loading
//                           ? "animate-spin"
//                           : ""
//                       }
//                     />
//                   </button>

//                 </div>
//               </div>
//             </div>

//             {/* ============================================================ */}
//             {/* Error                                                         */}
//             {/* ============================================================ */}

//             {error && (
//               <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

//                 <div className="flex items-start gap-3">
//                   <AlertTriangle
//                     size={20}
//                     className="mt-0.5 shrink-0 text-red-500"
//                   />

//                   <div>
//                     <p className="text-sm font-medium text-red-700">
//                       Failed to load analytics
//                     </p>

//                     <p className="mt-1 text-sm text-red-600">
//                       {error}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   onClick={fetchAnalytics}
//                   className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             )}

//             {/* ============================================================ */}
//             {/* Loading                                                        */}
//             {/* ============================================================ */}

//             {loading ? (
//               <AnalyticsLoading />
//             ) : !error ? (
//               <>
//                 {/* ======================================================== */}
//                 {/* KPI Cards                                                  */}
//                 {/* ======================================================== */}

//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//                   <StatCard
//                     title="Revenue"
//                     value={formatCurrency(
//                       sales.revenue
//                     )}
//                     subtitle={`${formatNumber(
//                       sales.orders
//                     )} orders`}
//                     icon={IndianRupee}
//                   />

//                   <StatCard
//                     title="Items Sold"
//                     value={formatNumber(
//                       sales.itemsSold
//                     )}
//                     subtitle={`Avg order ${formatCurrency(
//                       sales.averageOrderValue
//                     )}`}
//                     icon={ShoppingCart}
//                   />

//                   <StatCard
//                     title="Inventory Value"
//                     value={formatCurrency(
//                       inventoryOverview.inventoryValue
//                     )}
//                     subtitle={`${formatNumber(
//                       inventoryOverview.totalStock
//                     )} units`}
//                     icon={Package}
//                   />

//                   <StatCard
//                     title="Purchase Value"
//                     value={formatCurrency(
//                       purchases.totalOrderedValue
//                     )}
//                     subtitle={`${formatNumber(
//                       purchases.totalOrders
//                     )} purchase orders`}
//                     icon={TrendingUp}
//                   />

//                 </div>

//                 {/* ======================================================== */}
//                 {/* Sales + Inventory                                         */}
//                 {/* ======================================================== */}

//                 <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">

//                   {/* Sales Performance */}
//                   <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

//                     <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
//                       <div>
//                         <h2 className="font-semibold text-slate-900">
//                           Sales Performance
//                         </h2>

//                         <p className="mt-1 text-xs text-slate-500">
//                           Revenue and sales activity over the selected period.
//                         </p>
//                       </div>

//                       <span className="w-fit rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
//                         {periodLabel(period)}
//                       </span>
//                     </div>

//                     <SalesTrendChart
//                       data={salesTrend}
//                     />
//                   </div>

//                   {/* Inventory Health */}
//                   <InventoryHealth
//                     inventory={inventory}
//                   />

//                 </div>

//                 {/* ======================================================== */}
//                 {/* Products + Categories                                     */}
//                 {/* ======================================================== */}

//                 <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

//                   <ProductPerformance
//                     products={products}
//                     formatCurrency={
//                       formatCurrency
//                     }
//                     formatNumber={
//                       formatNumber
//                     }
//                   />

//                   <CategoryPerformance
//                     categories={categories}
//                     formatCurrency={
//                       formatCurrency
//                     }
//                   />

//                 </div>

//                 {/* ======================================================== */}
//                 {/* Purchase Overview                                          */}
//                 {/* ======================================================== */}

//                 <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//                   <div className="mb-5">
//                     <h2 className="font-semibold text-slate-900">
//                       Purchase Overview
//                     </h2>

//                     <p className="mt-1 text-xs text-slate-500">
//                       Purchase order status for the selected period.
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

//                     <PurchaseStat
//                       label="Total Orders"
//                       value={
//                         purchases.totalOrders
//                       }
//                     />

//                     <PurchaseStat
//                       label="Received"
//                       value={
//                         purchases.receivedOrders
//                       }
//                     />

//                     <PurchaseStat
//                       label="Partially Received"
//                       value={
//                         purchases.partiallyReceivedOrders
//                       }
//                     />

//                     <PurchaseStat
//                       label="Pending"
//                       value={
//                         purchases.pendingOrders
//                       }
//                     />

//                   </div>
//                 </div>

//                 {/* ======================================================== */}
//                 {/* Footer / Last Updated                                     */}
//                 {/* ======================================================== */}

//                 <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row">
//                   <p>
//                     Analytics are based on recorded sales, inventory and purchase data.
//                   </p>

//                   <p>
//                     Last updated{" "}
//                     {new Date().toLocaleTimeString(
//                       "en-IN",
//                       {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       }
//                     )}
//                   </p>
//                 </div>
//               </>
//             ) : null}

//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// /* ========================================================================== */
// /* Analytics Loading                                                          */
// /* ========================================================================== */

// const AnalyticsLoading = () => {
//   return (
//     <div className="space-y-5">

//       {/* KPI skeletons */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {[1, 2, 3, 4].map((item) => (
//           <div
//             key={item}
//             className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
//           />
//         ))}
//       </div>

//       {/* Main skeleton */}
//       <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
//         <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-2" />

//         <div className="h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
//       </div>

//       {/* Bottom skeletons */}
//       <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
//         <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />

//         <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
//       </div>

//     </div>
//   );
// };

// /* ========================================================================== */
// /* Period Label                                                               */
// /* ========================================================================== */

// const periodLabel = (period) => {
//   const labels = {
//     "7d": "Last 7 Days",
//     "30d": "Last 30 Days",
//     "90d": "Last 90 Days",
//     "6m": "Last 6 Months",
//     "1y": "Last Year",
//   };

//   return labels[period] || "Selected Period";
// };

// /* ========================================================================== */
// /* Stat Card                                                                  */
// /* ========================================================================== */

// const StatCard = ({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
// }) => {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

//       <div className="flex items-start justify-between gap-4">

//         <div className="min-w-0">
//           <p className="text-sm text-slate-500">
//             {title}
//           </p>

//           <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900">
//             {value}
//           </p>

//           <p className="mt-1 truncate text-xs text-slate-400">
//             {subtitle}
//           </p>
//         </div>

//         <div className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-600">
//           <Icon size={20} />
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ========================================================================== */
// /* Sales Trend Chart                                                          */
// /* ========================================================================== */

// const SalesTrendChart = ({
//   data = [],
// }) => {
//   if (!data.length) {
//     return (
//       <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50">
//         <div className="text-center">

//           <TrendingUp
//             size={28}
//             className="mx-auto mb-2 text-slate-300"
//           />

//           <p className="text-sm font-medium text-slate-500">
//             No sales data available
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Sales data will appear here once transactions are recorded.
//           </p>

//         </div>
//       </div>
//     );
//   }

//   const maxRevenue = Math.max(
//     ...data.map(
//       (item) => Number(item.revenue) || 0
//     )
//   );

//   return (
//     <div className="space-y-4">

//       {data.map((item) => {
//         const revenue =
//           Number(item.revenue) || 0;

//         const percentage =
//           maxRevenue > 0
//             ? (revenue / maxRevenue) * 100
//             : 0;

//         return (
//           <div
//             key={item.date}
//             className="grid grid-cols-[75px_minmax(0,1fr)_100px] items-center gap-3 sm:grid-cols-[90px_minmax(0,1fr)_110px]"
//           >

//             <span className="truncate text-xs text-slate-500">
//               {item.date}
//             </span>

//             <div className="h-8 overflow-hidden rounded-lg bg-slate-100">
//               <div
//                 className="h-full rounded-lg bg-slate-700 transition-all duration-500"
//                 style={{
//                   width: `${percentage}%`,
//                 }}
//               />
//             </div>

//             <span className="text-right text-xs font-medium text-slate-700">
//               ₹
//               {revenue.toLocaleString(
//                 "en-IN"
//               )}
//             </span>

//           </div>
//         );
//       })}
//     </div>
//   );
// };

// /* ========================================================================== */
// /* Inventory Health                                                           */
// /* ========================================================================== */

// const InventoryHealth = ({
//   inventory,
// }) => {
//   const health =
//     inventory?.health || {};

//   const items = [
//     {
//       label: "In Stock",
//       value: health.inStock || 0,
//     },
//     {
//       label: "Low Stock",
//       value: health.lowStock || 0,
//     },
//     {
//       label: "Out of Stock",
//       value: health.outOfStock || 0,
//     },
//     {
//       label: "Overstock",
//       value: health.overstock || 0,
//     },
//   ];

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//       <div className="mb-5">
//         <h2 className="font-semibold text-slate-900">
//           Inventory Health
//         </h2>

//         <p className="mt-1 text-xs text-slate-500">
//           Current inventory status.
//         </p>
//       </div>

//       <div className="space-y-3">

//         {items.map((item) => (
//           <div
//             key={item.label}
//             className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
//           >
//             <span className="text-sm text-slate-600">
//               {item.label}
//             </span>

//             <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm">
//               {item.value}
//             </span>
//           </div>
//         ))}

//       </div>

//       <div className="mt-5 border-t border-slate-100 pt-4">

//         <div className="flex items-center justify-between">
//           <span className="text-sm text-slate-500">
//             Total Products
//           </span>

//           <span className="text-sm font-semibold text-slate-800">
//             {health.totalProducts || 0}
//           </span>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* ========================================================================== */
// /* Product Performance                                                       */
// /* ========================================================================== */

// const ProductPerformance = ({
//   products,
//   formatCurrency,
//   formatNumber,
// }) => {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//       <div className="mb-5">
//         <h2 className="font-semibold text-slate-900">
//           Top Products
//         </h2>

//         <p className="mt-1 text-xs text-slate-500">
//           Products ranked by revenue.
//         </p>
//       </div>

//       {!products.length ? (
//         <EmptyState
//           message="No product sales data available."
//         />
//       ) : (
//         <div className="space-y-3">

//           {products
//             .slice(0, 5)
//             .map((product, index) => (
//               <div
//                 key={
//                   product.productId ||
//                   product._id ||
//                   index
//                 }
//                 className="flex items-center justify-between gap-4 rounded-xl px-2 py-2 transition hover:bg-slate-50"
//               >

//                 <div className="flex min-w-0 items-center gap-3">

//                   <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
//                     {index + 1}
//                   </span>

//                   <div className="min-w-0">
//                     <p className="truncate text-sm font-medium text-slate-800">
//                       {product.productName}
//                     </p>

//                     <p className="mt-0.5 text-xs text-slate-400">
//                       {product.sku}
//                     </p>
//                   </div>

//                 </div>

//                 <div className="shrink-0 text-right">

//                   <p className="text-sm font-semibold text-slate-800">
//                     {formatCurrency(
//                       product.revenue
//                     )}
//                   </p>

//                   <p className="mt-0.5 text-xs text-slate-400">
//                     {formatNumber(
//                       product.unitsSold
//                     )}{" "}
//                     units
//                   </p>

//                 </div>

//               </div>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ========================================================================== */
// /* Category Performance                                                       */
// /* ========================================================================== */

// const CategoryPerformance = ({
//   categories,
//   formatCurrency,
// }) => {
//   const maxRevenue = categories.length
//     ? Math.max(
//         ...categories.map(
//           (item) =>
//             Number(item.revenue) || 0
//         )
//       )
//     : 0;

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

//       <div className="mb-5">
//         <h2 className="font-semibold text-slate-900">
//           Sales by Category
//         </h2>

//         <p className="mt-1 text-xs text-slate-500">
//           Revenue contribution by category.
//         </p>
//       </div>

//       {!categories.length ? (
//         <EmptyState
//           message="No category sales data available."
//         />
//       ) : (
//         <div className="space-y-5">

//           {categories
//             .slice(0, 6)
//             .map((category, index) => {
//               const revenue =
//                 Number(category.revenue) || 0;

//               const percentage =
//                 maxRevenue > 0
//                   ? (revenue / maxRevenue) *
//                     100
//                   : 0;

//               return (
//                 <div
//                   key={
//                     category.category ||
//                     index
//                   }
//                 >

//                   <div className="mb-2 flex items-center justify-between gap-4">

//                     <span className="truncate text-sm text-slate-600">
//                       {category.category}
//                     </span>

//                     <span className="shrink-0 text-sm font-medium text-slate-800">
//                       {formatCurrency(
//                         revenue
//                       )}
//                     </span>

//                   </div>

//                   <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//                     <div
//                       className="h-full rounded-full bg-slate-700 transition-all duration-500"
//                       style={{
//                         width: `${Math.min(
//                           100,
//                           percentage
//                         )}%`,
//                       }}
//                     />
//                   </div>

//                 </div>
//               );
//             })}

//         </div>
//       )}
//     </div>
//   );
// };

// /* ========================================================================== */
// /* Purchase Stat                                                              */
// /* ========================================================================== */

// const PurchaseStat = ({
//   label,
//   value,
// }) => {
//   return (
//     <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100">

//       <p className="text-xs font-medium text-slate-500">
//         {label}
//       </p>

//       <p className="mt-1 text-xl font-semibold text-slate-900">
//         {value || 0}
//       </p>

//     </div>
//   );
// };

// /* ========================================================================== */
// /* Empty State                                                                */
// /* ========================================================================== */

// const EmptyState = ({
//   message,
// }) => {
//   return (
//     <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 text-center">
//       <p className="text-sm text-slate-400">
//         {message}
//       </p>
//     </div>
//   );
// };

// export default Analytics;









import { useEffect, useState } from "react";
import {
  RefreshCw,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import {
  getAnalyticsOverview,
  getSalesTrend,
  getProductPerformance,
  getCategoryPerformance,
  getInventoryAnalytics,
} from "../../../services/analyticsService";

import AnalyticsKpiCards from "./AnalyticsKpiCards";
import SalesTrendChart from "./SalesTrendChart";
import ProductPerformance from "./ProductPerformance";
import CategoryPerformance from "./CategoryPerformance";
import InventoryHealth from "./InventoryHealth";
import PurchaseOverview from "./PurchaseOverview";

const Analytics = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [period, setPeriod] = useState("30d");

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        overview,
        salesTrend,
        products,
        categories,
        inventory,
      ] = await Promise.all([
        getAnalyticsOverview(period),
        getSalesTrend(period),
        getProductPerformance(period),
        getCategoryPerformance(period),
        getInventoryAnalytics(),
      ]);

      setAnalytics({
        overview: overview.data,
        salesTrend: salesTrend.data,
        products: products.data,
        categories: categories.data,
        inventory: inventory.data,
      });
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(
        err.message ||
          "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() =>
          setSidebarCollapsed(
            !sidebarCollapsed
          )
        }
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* Main */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Manager
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Analytics
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Analyze sales, inventory,
                    products and purchasing
                    performance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Period */}
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <CalendarDays
                      size={16}
                      className="text-slate-400"
                    />

                    <select
                      value={period}
                      onChange={(e) =>
                        setPeriod(e.target.value)
                      }
                      className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                    >
                      <option value="7d">
                        Last 7 days
                      </option>

                      <option value="30d">
                        Last 30 days
                      </option>

                      <option value="90d">
                        Last 90 days
                      </option>

                      <option value="6m">
                        Last 6 months
                      </option>

                      <option value="1y">
                        Last year
                      </option>
                    </select>
                  </div>

                  {/* Refresh */}
                  <button
                    type="button"
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    <span className="hidden sm:inline">
                      Refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

                <p className="text-sm font-semibold text-slate-700">
                  Loading analytics...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Analyzing your sales, inventory
                  and purchasing data.
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 text-red-500"
                  />

                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-red-800">
                      Unable to load analytics
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={fetchAnalytics}
                      className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics */}
            {!loading &&
              !error &&
              analytics && (
                <div className="space-y-5">
                  {/* KPI Cards */}
                  <AnalyticsKpiCards
                    data={analytics.overview}
                  />

                  {/* Sales */}
                  <SalesTrendChart
                    data={analytics.salesTrend}
                  />

                  {/* Products / Categories */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <ProductPerformance
                      data={analytics.products}
                    />

                    <CategoryPerformance
                      data={analytics.categories}
                    />
                  </div>

                  {/* Inventory / Purchases */}
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <InventoryHealth
                      data={analytics.inventory}
                    />

                    <PurchaseOverview
                      data={analytics.overview.purchases}
                    />
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;