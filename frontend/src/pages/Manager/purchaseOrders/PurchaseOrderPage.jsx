import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import PurchaseOrderSummaryCard from "../../../components/manager/purchaseOrders/PurchaseOrderSummaryCard";
import PurchaseOrderSearch from "../../../components/manager/purchaseOrders/PurchaseOrderSearch";
import PurchaseOrderFilters from "../../../components/manager/purchaseOrders/PurchaseOrderFilters";
import PurchaseOrderTable from "../../../components/manager/purchaseOrders/PurchaseOrderTable";

import { purchaseOrderData } from "../../../data/purchaseOrderData";


const PurchaseOrderPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [supplier, setSupplier] =
    useState("All Suppliers");

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);


  const filteredOrders = useMemo(() => {
    return purchaseOrderData.filter((order) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        order.id
          .toLowerCase()
          .includes(searchValue) ||
        order.supplier
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === "All Statuses" ||
        order.status === status;

      const matchesSupplier =
        supplier === "All Suppliers" ||
        order.supplier === supplier;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSupplier
      );
    });
  }, [search, status, supplier]);


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
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}


      {/* Main Content */}
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
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Procurement Management
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Purchase Orders
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create, track and manage purchase orders from suppliers.
                </p>
              </div>


              <div className="flex flex-wrap items-center gap-2">

                <Link
                  to="/manager/purchase-orders/create"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Plus size={15} />
                  Create Purchase Order
                </Link>

              </div>

            </div>


            {/* Summary Cards */}
            <PurchaseOrderSummaryCard
              orders={purchaseOrderData}
            />


            {/* Purchase Order Table */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* Search + Filters */}
              <div className="border-b border-slate-100 p-5">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* Search */}
                  <div className="w-full lg:max-w-sm">
                    <PurchaseOrderSearch
                      value={search}
                      onChange={setSearch}
                    />
                  </div>


                  {/* Filters */}
                  <PurchaseOrderFilters
                    status={status}
                    supplier={supplier}
                    onStatusChange={setStatus}
                    onSupplierChange={setSupplier}
                  />

                </div>

              </div>


              {/* Table */}
              <PurchaseOrderTable
                orders={filteredOrders}
              />


              {/* Footer */}
              {/* <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">

                <p className="text-xs text-slate-400">

                  Showing{" "}

                  <span className="font-semibold text-slate-600">
                    {filteredOrders.length}
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-slate-600">
                    {purchaseOrderData.length}
                  </span>{" "}

                  purchase orders

                </p>

              </div> */}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};


export default PurchaseOrderPage;