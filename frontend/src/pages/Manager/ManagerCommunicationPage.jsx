import { useState } from "react";

import ManagerSidebar from "../../components/layout/ManagerSidebar";
import ManagerHeader from "../../components/layout/ManagerHeader";

import CommunicationLayout from "../../components/Communication/CommunicationLayout";
import { CommunicationProvider } from "../../context/CommunicationContext";

const ManagerCommunicationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <CommunicationProvider>
      <div className="min-h-screen bg-slate-50">
        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <ManagerSidebar
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
            MAIN APPLICATION AREA

            Same structure as ManagerDashboardPage
        ====================================================== */}

        <div
          className={`min-h-screen transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <ManagerHeader
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
          />

          {/* =================================================
              COMMUNICATION CONTENT
          ================================================= */}

          <main className="min-h-0 overflow-x-hidden">
            <CommunicationLayout />
          </main>
        </div>
      </div>
    </CommunicationProvider>
  );
};

export default ManagerCommunicationPage;