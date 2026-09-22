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
      <div className="h-screen overflow-hidden bg-slate-50">
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
        ====================================================== */}

        <div
          className={`
            flex
            h-screen
            min-h-0
            flex-col
            overflow-hidden
            transition-all
            duration-300
            ${
              sidebarCollapsed
                ? "lg:pl-20"
                : "lg:pl-64"
            }
          `}
        >
          {/* =================================================
              DASHBOARD HEADER
          ================================================= */}

          <div className="shrink-0">
            <ManagerHeader
              onMenuClick={() =>
                setMobileSidebarOpen(true)
              }
            />
          </div>

          {/* =================================================
              COMMUNICATION CONTENT

              This area takes the remaining height
              below the ManagerHeader.
          ================================================= */}

          <main className="min-h-0 flex-1 overflow-hidden">
            <CommunicationLayout />
          </main>
        </div>
      </div>
    </CommunicationProvider>
  );
};

export default ManagerCommunicationPage;