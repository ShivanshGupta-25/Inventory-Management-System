import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import StaffSidebar from "../../../components/staff/StaffSidebar";
import StaffHeader from "../../../components/staff/StaffHeader";
import SaleForm from "../../../components/staff/sales/SaleForm";

import { createStaffSale } from "../../../services/staffSalesApi";

const StaffCreateSale = () => {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialData = {
    customerName: "Walk-in Customer",
    customerContact: "",
    discount: 0,
    tax: 0,
    paidAmount: 0,
    paymentMethod: "Cash",
    notes: "",
    items: [
      {
        inventory: "",
        quantity: 1,
      },
    ],
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      await createStaffSale(data);

      navigate("/staff/sales");
    } catch (err) {
      console.error("Create staff sale failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create sale."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onCollapse={setSidebarCollapsed}
        onMobileClose={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <StaffHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate("/staff/sales")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sales
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              New Sale
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Record a customer sale and update inventory automatically.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <SaleForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default StaffCreateSale;