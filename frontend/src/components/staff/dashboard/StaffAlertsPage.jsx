import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  PackageX,
  RefreshCw,
} from "lucide-react";

import StaffSidebar from "../StaffSidebar";
import StaffHeader from "../StaffHeader";

import { getStaffAlerts } from "../../../services/staffActivityApi";

const StaffAlertsPage = () => {
  // =========================================================
  // SIDEBAR STATE
  // =========================================================

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  // =========================================================
  // ALERT STATE
  // =========================================================

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH ALERTS
  // =========================================================

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStaffAlerts();

      setAlerts(data || []);
    } catch (err) {
      console.error(
        "Failed to load alerts:",
        err
      );

      setError(
        err?.message ||
          "Unable to load alerts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // =========================================================
  // RENDER
  // =========================================================

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

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >

        {/* Header */}
        <StaffHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1200px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">
              <p className="text-xs font-medium text-slate-400">
                Workspace
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Inventory Alerts
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review products that require attention.
              </p>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <RefreshCw
                  size={22}
                  className="mx-auto animate-spin text-slate-400"
                />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Loading alerts...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest inventory alerts.
                </p>

              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="text-sm font-semibold text-red-800">
                      Unable to load alerts
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchAlerts}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!loading &&
              !error &&
              alerts.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Bell size={24} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No active alerts
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your inventory is currently in good shape.
                  </p>

                </div>
              )}

            {/* =================================================
                ALERT LIST
            ================================================= */}

            {!loading &&
              !error &&
              alerts.length > 0 && (
                <div className="space-y-3">

                  {alerts.map((alert, index) => {

                    const critical =
                      alert.severity === "critical";

                    return (
                      <div
                        key={
                          `${alert.type}-${
                            alert.productId ||
                            index
                          }`
                        }
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >

                        <div className="flex items-start gap-4">

                          {/* Alert Icon */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                              critical
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {critical ? (
                              <PackageX size={18} />
                            ) : (
                              <AlertTriangle size={18} />
                            )}
                          </div>

                          {/* Alert Content */}
                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center justify-between gap-2">

                              <h2 className="text-sm font-semibold text-slate-800">
                                {alert.title}
                              </h2>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                  critical
                                    ? "bg-red-50 text-red-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {critical
                                  ? "Critical"
                                  : "Attention"}
                              </span>

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {alert.message}
                            </p>

                            {alert.sku && (
                              <p className="mt-2 text-xs text-slate-400">
                                SKU: {alert.sku}
                              </p>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffAlertsPage;