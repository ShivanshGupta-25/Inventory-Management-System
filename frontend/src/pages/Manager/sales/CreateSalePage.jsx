import { useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import SaleForm from "../../../components/manager/sales/SaleForm";

const CreateSalePage = () => {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const handleSubmit = (sale) => {
    console.log("New sale:", sale);

    navigate("/manager/sales");
  };

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
          <div className="mx-auto max-w-[1200px]">
            <button
              onClick={() => navigate("/manager/sales")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Sales
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingCart size={19} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create Sale
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new customer sale and record the transaction.
                </p>
              </div>
            </div>

            <SaleForm
              onSubmit={handleSubmit}
              onCancel={() => navigate("/manager/sales")}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateSalePage;