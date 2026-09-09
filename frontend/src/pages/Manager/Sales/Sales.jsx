import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import SalesStats from "../../../components/sales/SalesStats";
import SalesFilters from "../../../components/sales/SalesFilters";
import SalesTable from "../../../components/sales/SalesTable";

import {
  getSales,
  getSalesStats,
} from "../../../services/salesApi";

const Sales = () => {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [sales, setSales] = useState([]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    itemsSold: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        salesResponse,
        statsResponse,
      ] = await Promise.all([
        getSales({
          search,
          status,
          paymentStatus,
        }),
        getSalesStats(),
      ]);

      setSales(salesResponse.data || []);

      setStats(
        statsResponse.data || {
          totalRevenue: 0,
          totalOrders: 0,
          itemsSold: 0,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load sales"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [
    search,
    status,
    paymentStatus,
  ]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
  };

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

            {/* Page Heading */}

            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Management
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Sales
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage sales transactions and monitor their impact on inventory.
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs text-slate-400">
                    Last updated
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {new Date().toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>

              </div>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Statistics */}

            <SalesStats stats={stats} />

            {/* Filters / Actions */}

            <div className="mt-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex-1">
                  <SalesFilters
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                    paymentStatus={paymentStatus}
                    setPaymentStatus={
                      setPaymentStatus
                    }
                    onReset={handleReset}
                  />
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={loadSales}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "/manager/sales/create"
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <Plus size={17} />
                    Record Sale
                  </button>

                </div>

              </div>
            </div>

            {/* Sales Table */}

            <div className="mt-5">

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading sales...
                  </p>

                </div>
              ) : (
                <SalesTable
                  sales={sales}
                  loading={loading}
                />
              )}

            </div>

          </div>
        </main>

      </div>

    </div>
  );
};

export default Sales;