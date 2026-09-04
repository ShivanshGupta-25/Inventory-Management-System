import { useMemo, useState } from "react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import SalesStats from "../../../components/manager/sales/SalesStats";
import SalesToolbar from "../../../components/manager/sales/SalesToolbar";
import SalesTable from "../../../components/manager/sales/SalesTable";

import {
  salesData,
  saleStatuses,
  paymentStatuses,
} from "../../../data/salesData";

const SalesPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState("All Status");

  const [paymentStatus, setPaymentStatus] =
    useState("All Payments");

  const filteredSales = useMemo(() => {
    return salesData.filter((sale) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        sale.saleId.toLowerCase().includes(searchValue) ||
        sale.customer.toLowerCase().includes(searchValue) ||
        sale.customerEmail
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === "All Status" ||
        sale.status === status;

      const matchesPayment =
        paymentStatus === "All Payments" ||
        sale.paymentStatus === paymentStatus;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [search, status, paymentStatus]);

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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-400">
                Transactions
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Sales
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track sales, payments and customer
                transactions.
              </p>
            </div>

            <SalesStats sales={salesData} />

            <div className="mt-5">
              <SalesToolbar
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                paymentStatus={paymentStatus}
                onPaymentStatusChange={
                  setPaymentStatus
                }
                statuses={saleStatuses}
                paymentStatuses={paymentStatuses}
              />
            </div>

            <div className="mt-4">
              <SalesTable sales={filteredSales} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SalesPage;