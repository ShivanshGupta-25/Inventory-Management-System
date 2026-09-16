import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import StaffHeader from "../../../components/staff/StaffHeader";
import StaffSidebar from "../../../components/staff/StaffSidebar";
import SaleForm from "../../../components/staff/sales/SaleForm";

import {
  getStaffSaleById,
  updateStaffSale,
} from "../../../services/staffSalesApi";

const StaffEditSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSale = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getStaffSaleById(id);

        setSale(
          response?.sale ||
            response?.data ||
            null
        );
      } catch (err) {
        console.error(
          "Failed to load sale:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load sale."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      await updateStaffSale(id, data);

      navigate(`/staff/sales/${id}`);
    } catch (err) {
      console.error(
        "Failed to update staff sale:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update sale."
      );
    } finally {
      setSaving(false);
    }
  };

  const getInitialData = () => {
    if (!sale) {
      return null;
    }

    return {
      customerName:
        sale.customerName ||
        "Walk-in Customer",

      customerContact:
        sale.customerContact || "",

      discount: sale.discount || 0,

      tax: sale.tax || 0,

      paidAmount: sale.paidAmount || 0,

      paymentMethod:
        sale.paymentMethod || "Cash",

      notes: sale.notes || "",

      items:
        sale.items?.map((item) => ({
          inventory:
            item.inventory?._id ||
            item.inventory ||
            "",

          quantity: item.quantity || 1,
        })) || [],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main
          className={`min-h-screen ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <div className="flex min-h-[70vh] items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading sale...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main
          className={`min-h-screen ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">
                {error || "Sale not found."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Editing is allowed only for completed,
  // unpaid sales according to the existing
  // sales business rules.
  const canEdit =
    sale.status === "Completed" &&
    Number(sale.paidAmount || 0) === 0;

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StaffSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onCollapse={setSidebarCollapsed}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main
          className={`min-h-screen ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <div className="mx-auto max-w-[1400px] p-6">
            <button
              onClick={() =>
                navigate(`/staff/sales/${id}`)
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sale
            </button>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-900">
                Sale cannot be edited
              </h2>

              <p className="mt-1 text-sm text-amber-700">
                Only completed sales with no payment
                received can be edited.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <button
            onClick={() =>
              navigate(`/staff/sales/${id}`)
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sale
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Sale
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update {sale.saleNumber} and adjust
              the associated inventory.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <SaleForm
            initialData={getInitialData()}
            onSubmit={handleSubmit}
            loading={saving}
            isEdit
            sale={sale}
          />
        </div>
      </main>
    </div>
  );
};

export default StaffEditSale;