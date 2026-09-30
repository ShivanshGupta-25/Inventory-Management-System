import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  const handleMobileMenuOpen = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleMobileMenuClose}
      />

      {/* Main Application Area */}
      <div
        className={`
          min-h-screen transition-[padding] duration-300
          ${isSidebarCollapsed ? "lg:pl-[78px]" : "lg:pl-[270px]"}
        `}
      >
        {/* Header */}
        <AdminHeader onMenuClick={handleMobileMenuOpen} />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-5 lg:p-6 xl:p-7">
          <div className="mx-auto w-full max-w-[1800px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
