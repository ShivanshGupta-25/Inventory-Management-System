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

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 mt-4">

              {/* Stock Level */}
              <div className="lg:col-span-5">
                <StockLevelChart />
              </div>

              {/* Inventory Overview */}
              <div className="lg:col-span-3">
                <InventoryOverview />
              </div>

              {/* Sales Overview */}
              <div className="lg:col-span-4">
                <SalesOverview />
              </div>

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