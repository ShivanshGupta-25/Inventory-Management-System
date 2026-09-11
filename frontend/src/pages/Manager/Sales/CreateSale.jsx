import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import SaleForm from "../../../components/manager/sales/SaleForm";

import { createSale } from "../../../services/salesApi";

const CreateSale = () => {
  const navigate = useNavigate();

  /* =====================================================
     LAYOUT
  ===================================================== */

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /* =====================================================
     SUBMIT STATE
  ===================================================== */

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     CREATE SALE
  ===================================================== */

  const handleCreateSale = async (data) => {
    try {
      setLoading(true);
      setError("");

      const response =
        await createSale(data);

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to create sale"
        );
      }

      /*
       * Sale successfully created.
       * Return to Sales page.
       */

      navigate("/manager/sales");
    } catch (error) {
      console.error(
        "Create sale error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create sale"
      );

      /*
       * Scroll to the error so the user
       * can immediately see what went wrong.
       */

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          SIDEBAR
      ================================================= */}

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

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

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
          <div className="mx-auto max-w-[1400px]">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/manager/sales"
                  )
                }
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft
                  size={17}
                />

                Back to Sales
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Sales Management
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Create Sale
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new sale and update inventory automatically.
                </p>
              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                <div>
                  <p className="font-medium">
                    Unable to create sale
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="text-red-500 hover:text-red-700"
                  aria-label="Dismiss error"
                >
                  ×
                </button>

              </div>
            )}

            {/* =================================================
                SALE FORM
            ================================================= */}

            <SaleForm
              mode="create"
              initialData={{
                customerName:
                  "Walk-in Customer",
                customerContact:
                  "",
                discount: 0,
                tax: 0,
                paidAmount: 0,
                paymentMethod:
                  "Cash",
                notes: "",
                items: [
                  {
                    inventory: "",
                    quantity: 1,
                  },
                ],
              }}
              onSubmit={
                handleCreateSale
              }
              loading={loading}
              submitLabel="Create Sale"
            />

          </div>
        </main>

      </div>
    </div>
  );
};

export default CreateSale;