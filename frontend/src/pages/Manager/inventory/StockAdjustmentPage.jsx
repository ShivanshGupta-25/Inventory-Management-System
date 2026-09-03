import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  RefreshCcw,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import StockAdjustmentForm from "../../../components/manager/inventory/StockAdjustmentForm";

import { inventoryData } from "../../../data/inventoryData";

const StockAdjustmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const product = inventoryData.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <Package className="mx-auto text-slate-400" size={30} />

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Product not found
          </h1>

          <Link
            to="/manager/inventory"
            className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const handleAdjustment = (adjustment) => {
    console.log("Stock adjustment:", {
      product,
      adjustment,
    });

    setSuccess(true);

    setTimeout(() => {
      navigate(`/manager/inventory/${product.id}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <ManagerHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <button
              onClick={() =>
                navigate(`/manager/inventory/${product.id}`)
              }
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Stock Details
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <RefreshCcw size={19} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Adjust Stock
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Update inventory quantity for {product.name}.
                  </p>
                </div>
              </div>
            </div>

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <RefreshCcw size={22} />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-emerald-900">
                  Stock adjustment applied
                </h2>

                <p className="mt-1 text-sm text-emerald-700">
                  Returning to stock details...
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      SKU: {product.sku} · {product.warehouse}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      Current Stock
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {product.stock}
                    </p>
                  </div>
                </div>

                <StockAdjustmentForm
                  product={product}
                  onSubmit={handleAdjustment}
                  onCancel={() =>
                    navigate(`/manager/inventory/${product.id}`)
                  }
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StockAdjustmentPage;