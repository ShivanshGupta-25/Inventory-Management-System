import { useState } from "react";

import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

import CommunicationLayout from "../../components/Communication/CommunicationLayout";
import { CommunicationProvider } from "../../context/CommunicationContext";

const StaffCommunicationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <CommunicationProvider>
      <div className="h-screen overflow-hidden bg-slate-50">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapse={() =>
            setSidebarCollapsed((prev) => !prev)
          }
          onMobileClose={() =>
            setMobileSidebarOpen(false)
          }
        />

        {/* =====================================================
            MOBILE SIDEBAR OVERLAY
        ====================================================== */}

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          />
        )}

        {/* =====================================================
            MAIN APPLICATION
        ====================================================== */}

        <div
          className={`flex h-screen min-h-0 flex-col overflow-hidden transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="shrink-0">
            <StaffHeader
              onMenuClick={() =>
                setMobileSidebarOpen(true)
              }
            />
          </div>

          {/* =================================================
              COMMUNICATION PAGE
          ================================================= */}

          <main className="min-h-0 flex-1 overflow-hidden">
            <CommunicationLayout />
          </main>

        </div>
      </div>
    </CommunicationProvider>
  );
};

export default StaffCommunicationPage;