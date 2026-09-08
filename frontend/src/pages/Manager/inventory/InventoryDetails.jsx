// import { useEffect, useState } from "react";
// import {
//   ArrowLeft,
//   Package,
// } from "lucide-react";

// import {
//   getInventoryById,
//   getStockMovements,
// } from "../../../services/inventoryService";

// import StockStatus from "../../../components/manager/inventory/StockStatus";
// import StockMovementTable from "../../../components/manager/inventory/StockMovementTable";

// const InventoryDetails = () => {
//   const id =
//     window.location.pathname.split("/").pop();

//   const [item, setItem] = useState(null);
//   const [movements, setMovements] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [
//           inventoryResponse,
//           movementsResponse,
//         ] = await Promise.all([
//           getInventoryById(id),
//           getStockMovements(id),
//         ]);

//         setItem(inventoryResponse.data);
//         setMovements(
//           movementsResponse.data || []
//         );
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="p-6">
//         Loading inventory details...
//       </div>
//     );
//   }

//   if (!item) {
//     return (
//       <div className="p-6">
//         Inventory item not found.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <button
//         onClick={() =>
//           (window.location.href =
//             "/manager/inventory")
//         }
//         className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
//       >
//         <ArrowLeft size={17} />
//         Back to Inventory
//       </button>

//       <div className="rounded-2xl border border-gray-200 bg-white p-6">
//         <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
//           <div className="flex items-center gap-4">
//             <div className="rounded-2xl bg-gray-100 p-4">
//               <Package size={28} />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {item.productName}
//               </h1>

//               <p className="mt-1 text-sm text-gray-500">
//                 SKU: {item.sku}
//               </p>
//             </div>
//           </div>

//           <StockStatus
//             status={item.stockStatus}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//         <div className="rounded-2xl border border-gray-200 bg-white p-5">
//           <p className="text-sm text-gray-500">
//             Current Stock
//           </p>

//           <p className="mt-2 text-2xl font-bold">
//             {item.currentStock}
//           </p>
//         </div>

//         <div className="rounded-2xl border border-gray-200 bg-white p-5">
//           <p className="text-sm text-gray-500">
//             Reserved
//           </p>

//           <p className="mt-2 text-2xl font-bold">
//             {item.reservedStock}
//           </p>
//         </div>

//         <div className="rounded-2xl border border-gray-200 bg-white p-5">
//           <p className="text-sm text-gray-500">
//             Available
//           </p>

//           <p className="mt-2 text-2xl font-bold">
//             {item.availableStock}
//           </p>
//         </div>

//         <div className="rounded-2xl border border-gray-200 bg-white p-5">
//           <p className="text-sm text-gray-500">
//             Minimum Stock
//           </p>

//           <p className="mt-2 text-2xl font-bold">
//             {item.minStock}
//           </p>
//         </div>
//       </div>

//       <div className="rounded-2xl border border-gray-200 bg-white p-6">
//         <h2 className="mb-5 text-lg font-semibold">
//           Product Information
//         </h2>

//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           <div>
//             <p className="text-xs text-gray-500">
//               Category
//             </p>

//             <p className="mt-1 font-medium">
//               {item.category}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Brand
//             </p>

//             <p className="mt-1 font-medium">
//               {item.brand || "—"}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Purchase Price
//             </p>

//             <p className="mt-1 font-medium">
//               ₹
//               {item.purchasePrice.toLocaleString(
//                 "en-IN"
//               )}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Selling Price
//             </p>

//             <p className="mt-1 font-medium">
//               ₹
//               {item.sellingPrice.toLocaleString(
//                 "en-IN"
//               )}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Unit
//             </p>

//             <p className="mt-1 font-medium">
//               {item.unit}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Maximum Stock
//             </p>

//             <p className="mt-1 font-medium">
//               {item.maxStock}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Warehouse
//             </p>

//             <p className="mt-1 font-medium">
//               {item.warehouse}
//             </p>
//           </div>

//           <div>
//             <p className="text-xs text-gray-500">
//               Status
//             </p>

//             <p className="mt-1 font-medium">
//               {item.status}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="rounded-2xl border border-gray-200 bg-white p-6">
//         <div className="mb-5">
//           <h2 className="text-lg font-semibold">
//             Stock Movement History
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             Complete history of stock changes.
//           </p>
//         </div>

//         <StockMovementTable
//           movements={movements}
//         />
//       </div>
//     </div>
//   );
// };

// export default InventoryDetails;


import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  RefreshCw,
  Warehouse,
  Tag,
  DollarSign,
  Boxes,
  Activity,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import {
  getInventoryById,
  getStockMovements,
} from "../../../services/inventoryService";

import StockStatus from "../../../components/manager/inventory/StockStatus";
import StockMovementTable from "../../../components/manager/inventory/StockMovementTable";

const InventoryDetails = () => {
  const id = window.location.pathname.split("/").pop();

  const [item, setItem] = useState(null);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const loadData = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        inventoryResponse,
        movementsResponse,
      ] = await Promise.all([
        getInventoryById(id),
        getStockMovements(id),
      ]);

      setItem(inventoryResponse.data);

      setMovements(
        movementsResponse.data || []
      );
    } catch (error) {
      console.error(
        "Failed to load inventory details:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load inventory details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleBack = () => {
    window.location.href =
      "/manager/inventory";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
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

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          />
        )}

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
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <RefreshCw
                      size={22}
                      className="animate-spin text-slate-500"
                    />
                  </div>

                  <p className="text-sm font-medium text-slate-700">
                    Loading inventory details...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Please wait a moment
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50">
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

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          />
        )}

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
              <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <Package
                    size={24}
                    className="text-red-500"
                  />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Inventory item not found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {error ||
                    "The requested inventory item could not be found."}
                </p>

                <button
                  onClick={handleBack}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <ArrowLeft size={16} />
                  Back to Inventory
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <ManagerHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">
            {/* Page Header */}
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                Back to Inventory
              </button>

              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Management / Inventory / Details
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Inventory Details
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    View product information, stock levels,
                    and complete stock movement history.
                  </p>
                </div>

                <button
                  onClick={() => loadData(true)}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </button>
              </div>
            </div>

            {/* Product Summary */}
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                      <Package
                        size={27}
                        className="text-slate-700"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                          {item.productName}
                        </h2>

                        <StockStatus
                          status={item.stockStatus}
                        />
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span>
                          SKU:{" "}
                          <span className="font-medium text-slate-700">
                            {item.sku}
                          </span>
                        </span>

                        <span className="hidden sm:inline">
                          •
                        </span>

                        <span>
                          {item.category}
                        </span>

                        {item.brand && (
                          <>
                            <span className="hidden sm:inline">
                              •
                            </span>

                            <span>
                              {item.brand}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3 md:min-w-[180px]">
                    <p className="text-xs font-medium text-slate-400">
                      Warehouse
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Warehouse
                        size={16}
                        className="text-slate-500"
                      />

                      <p className="text-sm font-semibold text-slate-700">
                        {item.warehouse}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Overview */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Current Stock */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Current Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {item.currentStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.unit} in inventory
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Boxes
                      size={20}
                      className="text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Reserved */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Reserved
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {item.reservedStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Units reserved
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Package
                      size={20}
                      className="text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Available */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Available
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {item.availableStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Ready for sale
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Activity
                      size={20}
                      className="text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Minimum Stock */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Minimum Stock
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {item.minStock}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Reorder threshold
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Tag
                      size={20}
                      className="text-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-slate-900">
                  Product Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  General information and pricing details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Tag
                      size={14}
                      className="text-slate-400"
                    />

                    <p className="text-xs font-medium text-slate-400">
                      Category
                    </p>
                  </div>

                  <p className="font-medium text-slate-800">
                    {item.category}
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Package
                      size={14}
                      className="text-slate-400"
                    />

                    <p className="text-xs font-medium text-slate-400">
                      Brand
                    </p>
                  </div>

                  <p className="font-medium text-slate-800">
                    {item.brand || "—"}
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <DollarSign
                      size={14}
                      className="text-slate-400"
                    />

                    <p className="text-xs font-medium text-slate-400">
                      Purchase Price
                    </p>
                  </div>

                  <p className="font-medium text-slate-800">
                    ₹
                    {Number(
                      item.purchasePrice || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <DollarSign
                      size={14}
                      className="text-slate-400"
                    />

                    <p className="text-xs font-medium text-slate-400">
                      Selling Price
                    </p>
                  </div>

                  <p className="font-medium text-slate-800">
                    ₹
                    {Number(
                      item.sellingPrice || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-400">
                    Unit
                  </p>

                  <p className="font-medium text-slate-800">
                    {item.unit}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-400">
                    Maximum Stock
                  </p>

                  <p className="font-medium text-slate-800">
                    {item.maxStock}
                  </p>
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Warehouse
                      size={14}
                      className="text-slate-400"
                    />

                    <p className="text-xs font-medium text-slate-400">
                      Warehouse
                    </p>
                  </div>

                  <p className="font-medium text-slate-800">
                    {item.warehouse}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-400">
                    Product Status
                  </p>

                  <p className="font-medium text-slate-800">
                    {item.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Movement History */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Stock Movement History
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Complete history of stock changes for this item.
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {movements.length}{" "}
                    {movements.length === 1
                      ? "movement"
                      : "movements"}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <StockMovementTable
                  movements={movements}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryDetails;