import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import StockSummaryCards from "../../../components/manager/inventory/StockSummaryCards";
import InventorySearch from "../../../components/manager/inventory/InventorySearch";
import InventoryFilters from "../../../components/manager/inventory/InventoryFilters";
import InventoryTable from "../../../components/manager/inventory/InventoryTable";
import WarehouseSelector from "../../../components/manager/inventory/WarehouseSelector";

import { inventoryData } from "../../../data/inventoryData";

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [warehouse, setWarehouse] =
    useState("All Warehouses");
  const [status, setStatus] = useState("All Statuses");

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const filteredInventory = useMemo(() => {
    return inventoryData.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.sku
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesWarehouse =
        warehouse === "All Warehouses" ||
        product.warehouse === warehouse;

      const matchesStatus =
        status === "All Statuses" ||
        product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus
      );
    });
  }, [search, category, warehouse, status]);

  return (
    <div className="min-h-screen bg-slate-50">
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

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

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
            {/* Header */}
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Inventory Management
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor stock levels and manage inventory across warehouses.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
                  <Download size={15} />
                  Export
                </button>

                <Link
                  to="/manager/products/add"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Plus size={15} />
                  Add Product
                </Link>
              </div>
            </div>

            {/* Summary */}
            <StockSummaryCards
              inventory={inventoryData}
            />

            {/* Inventory Table */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <WarehouseSelector
                      value={warehouse}
                      onChange={setWarehouse}
                  />

                  <div className="w-full lg:max-w-sm">
                    <InventorySearch
                      value={search}
                      onChange={setSearch}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <InventoryFilters
                    category={category}
                    status={status}
                    onCategoryChange={setCategory}
                    onStatusChange={setStatus}
                    />
                </div>
              </div>

              <InventoryTable
                inventory={filteredInventory}
              />

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredInventory.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {inventoryData.length}
                  </span>{" "}
                  products
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryPage;