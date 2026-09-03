import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Boxes,
  Edit3,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import StockStatusBadge from "../../../components/manager/inventory/StockStatusBadge";
import StockMovementTable from "../../../components/manager/inventory/StockMovementTable";

import {
  inventoryData,
  stockMovements,
} from "../../../data/inventoryData";

const StockDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const product = inventoryData.find(
    (item) => String(item.id) === String(id)
  );

  const movements = useMemo(
    () =>
      stockMovements.filter(
        (movement) => String(movement.productId) === String(id)
      ),
    [id]
  );

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Package className="text-slate-400" size={22} />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Product not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            The inventory item you're looking for doesn't exist.
          </p>

          <Link
            to="/manager/inventory"
            className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const stockPercentage = Math.min(
    100,
    Math.round((product.stock / product.maxStock) * 100)
  );

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
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-5">
              <button
                onClick={() => navigate("/manager/inventory")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft size={16} />
                Back to Inventory
              </button>

              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {product.name}
                    </h1>

                    <StockStatusBadge status={product.status} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    SKU: {product.sku} · {product.category}
                  </p>
                </div>

                <Link
                  to={`/manager/inventory/${product.id}/adjust`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Edit3 size={16} />
                  Adjust Stock
                </Link>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Current Stock
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-bold tracking-tight text-slate-900">
                        {product.stock}
                      </span>

                      <span className="pb-1 text-sm text-slate-500">
                        units
                      </span>
                    </div>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Boxes size={21} />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Stock level
                    </span>

                    <span className="font-medium text-slate-700">
                      {stockPercentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        product.status === "Out of Stock"
                          ? "bg-red-500"
                          : product.status === "Low Stock"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>Minimum: {product.minStock}</span>
                    <span>Maximum: {product.maxStock}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Product Information
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">Warehouse</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {product.warehouse}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Unit Price</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Supplier</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {product.supplier}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Last Updated</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {product.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp size={17} />
                  </span>

                  <div>
                    <p className="text-xs text-slate-400">
                      Maximum Capacity
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">
                      {product.maxStock}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <TrendingDown size={17} />
                  </span>

                  <div>
                    <p className="text-xs text-slate-400">
                      Reorder Level
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">
                      {product.minStock}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ShoppingCart size={17} />
                  </span>

                  <div>
                    <p className="text-xs text-slate-400">
                      Inventory Value
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">
                      ₹
                      {(product.stock * product.price).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <StockMovementTable movements={movements} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StockDetailsPage;