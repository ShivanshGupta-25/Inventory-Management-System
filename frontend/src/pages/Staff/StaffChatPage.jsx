import { useState } from "react";

import StaffSidebar from "../../components/staff/StaffSidebar";
import StaffHeader from "../../components/staff/StaffHeader";

import ChatLayout from "../../components/chat/ChatLayout";
import ChatProvider from "../../context/ChatContext";

const StaffChatPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
          MOBILE OVERLAY
      ===================================================== */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

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

        <StaffHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Workspace
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Team Chat
                  </h1>

                  <p className="mt-1 max-w-xl text-sm text-slate-500">
                    Communicate with your inventory team
                    and stay updated on daily stock
                    activities.
                  </p>
                </div>

                {/* Workspace status */}
                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">
                    Collaboration
                  </p>

                  <div className="mt-1 flex items-center gap-2 sm:justify-end">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>

                    <p className="text-sm font-medium text-slate-600">
                      Team communication
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                CHAT WORKSPACE
            ================================================= */}

            <section
              aria-label="Team chat workspace"
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <ChatProvider>
                <ChatLayout />
              </ChatProvider>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffChatPage;
