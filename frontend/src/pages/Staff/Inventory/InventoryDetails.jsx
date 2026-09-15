import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import StaffSidebar from "../../../components/staff/StaffSidebar";
import StaffHeader from "../../../components/staff/StaffHeader";

import {
  getInventoryById,
} from "../../../services/inventoryService";

import {
  getStockHistory,
} from "../../../services/staffActivityApi";

const InventoryDetails = () => {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [product, setProduct] =
    useState(null);

  const [movements, setMovements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        productResponse,
        historyResponse,
      ] = await Promise.all([
        getInventoryById(id),
        getStockHistory({
          limit: 100,
          search: "",
        }),
      ]);

      const productData =
        productResponse?.data ||
        productResponse;

      if (!productData) {
        throw new Error(
          "Product not found"
        );
      }

      setProduct(productData);

      const history =
        historyResponse?.data ||
        historyResponse ||
        [];

      const productMovements =
        history.filter(
          (movement) =>
            String(
              movement.product?._id
            ) === String(id)
        );

      setMovements(
        productMovements
      );
    } catch (err) {
      console.error(
        "Failed to load product details:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load product details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const getStatus = () => {
    if (!product) {
      return "In Stock";
    }

    const stock =
      Number(
        product.currentStock
      ) || 0;

    const minimum =
      Number(
        product.minStock
      ) || 0;

    const maximum =
      Number(
        product.maxStock
      ) || 0;

    if (stock <= 0) {
      return "Out of Stock";
    }

    if (stock <= minimum) {
      return "Low Stock";
    }

    if (
      maximum > 0 &&
      stock > maximum
    ) {
      return "Overstock";
    }

    return "In Stock";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <StaffSidebar
          collapsed={
            sidebarCollapsed
          }
          mobileOpen={
            mobileSidebarOpen
          }
          onCollapse={() =>
            setSidebarCollapsed(
              !sidebarCollapsed
            )
          }
          onMobileClose={() =>
            setMobileSidebarOpen(
              false
            )
          }
        />

        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
          />

          <main className="p-4 sm:p-6">
            <div className="mx-auto max-w-[1500px]">

              <div className="flex min-h-[60vh] items-center justify-center">

                <div className="text-center">

                  <RefreshCw
                    size={25}
                    className="mx-auto animate-spin text-slate-400"
                  />

                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Loading product details...
                  </p>

                </div>

              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50">

        <StaffSidebar
          collapsed={
            sidebarCollapsed
          }
          mobileOpen={
            mobileSidebarOpen
          }
          onCollapse={() =>
            setSidebarCollapsed(
              !sidebarCollapsed
            )
          }
          onMobileClose={() =>
            setMobileSidebarOpen(
              false
            )
          }
        />

        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-20"
              : "lg:pl-64"
          }`}
        >
          <StaffHeader
            onMenuClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
          />

          <main className="p-4 sm:p-6">
            <div className="mx-auto max-w-[1500px]">

              <div className="flex min-h-[60vh] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Package
                      size={22}
                      className="text-slate-400"
                    />
                  </div>

                  <h1 className="mt-4 text-lg font-semibold text-slate-900">
                    Product not found
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    {error ||
                      "The inventory item you're looking for doesn't exist."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/staff/inventory"
                      )
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <ArrowLeft
                      size={16}
                    />

                    Back to Inventory
                  </button>

                </div>

              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  const stock =
    Number(
      product.currentStock
    ) || 0;

  const minimum =
    Number(
      product.minStock
    ) || 0;

  const maximum =
    Number(
      product.maxStock
    ) || 0;

  const reserved =
    Number(
      product.reservedStock
    ) || 0;

  const available =
    Math.max(
      stock - reserved,
      0
    );

  const purchasePrice =
    Number(
      product.purchasePrice
    ) || 0;

  const inventoryValue =
    stock * purchasePrice;

  const stockPercentage =
    maximum > 0
      ? Math.min(
          100,
          Math.round(
            (stock /
              maximum) *
              100
          )
        )
      : 0;

  const status =
    getStatus();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}

      <StaffSidebar
        collapsed={
          sidebarCollapsed
        }
        mobileOpen={
          mobileSidebarOpen
        }
        onCollapse={() =>
          setSidebarCollapsed(
            !sidebarCollapsed
          )
        }
        onMobileClose={() =>
          setMobileSidebarOpen(
            false
          )
        }
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(
              false
            )
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

        <StaffHeader
          onMenuClick={() =>
            setMobileSidebarOpen(
              true
            )
          }
        />

        <main className="p-4 sm:p-6">

          <div className="mx-auto max-w-[1500px]">

            {/* Header */}

            <div className="mb-5">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/staff/inventory"
                  )
                }
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft
                  size={16}
                />

                Back to Inventory
              </button>

              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {
                        product.productName
                      }
                    </h1>

                    <StatusBadge
                      status={
                        status
                      }
                    />

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    SKU:{" "}
                    {product.sku ||
                      "—"}{" "}
                    ·{" "}
                    {product.category ||
                      "Uncategorized"}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/staff/stock-operations?product=${product._id}`
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <Boxes
                    size={16}
                  />

                  Stock Operation
                </button>

              </div>

            </div>

            {/* Main stock card */}

            <div className="grid gap-5 lg:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Current Stock
                    </p>

                    <div className="mt-2 flex items-end gap-2">

                      <span className="text-4xl font-bold tracking-tight text-slate-900">
                        {stock}
                      </span>

                      <span className="mb-1 text-sm text-slate-400">
                        {
                          product.unit ||
                          "units"
                        }
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {available}{" "}
                      available ·{" "}
                      {reserved}{" "}
                      reserved
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Package
                      size={20}
                    />
                  </div>

                </div>

                {/* Stock progress */}

                <div className="mt-6">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-xs font-medium text-slate-500">
                      Capacity usage
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {
                        stockPercentage
                      }%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-slate-700 transition-all"
                      style={{
                        width: `${stockPercentage}%`,
                      }}
                    />

                  </div>

                </div>

                {/* Product information */}

                <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                  <InfoItem
                    label="Brand"
                    value={
                      product.brand ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Unit"
                    value={
                      product.unit ||
                      "pcs"
                    }
                  />

                  <InfoItem
                    label="Warehouse"
                    value={
                      product.warehouse ||
                      "Main Warehouse"
                    }
                  />

                  <InfoItem
                    label="Status"
                    value={
                      product.status ||
                      "Active"
                    }
                  />

                </div>

              </div>

              {/* Pricing */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Pricing
                </p>

                <div className="mt-5 space-y-5">

                  <InfoItem
                    label="Purchase Price"
                    value={`₹${purchasePrice.toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  <InfoItem
                    label="Selling Price"
                    value={`₹${Number(
                      product.sellingPrice ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  <div className="border-t border-slate-100 pt-5">

                    <p className="text-xs text-slate-400">
                      Inventory Value
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      ₹
                      {inventoryValue.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Stock thresholds */}

            <div className="mt-5 grid gap-5 sm:grid-cols-3">

              <MetricCard
                icon={TrendingUp}
                label="Maximum Capacity"
                value={
                  maximum
                }
                unit={
                  product.unit ||
                  "units"
                }
                type="success"
              />

              <MetricCard
                icon={TrendingDown}
                label="Reorder Level"
                value={
                  minimum
                }
                unit={
                  product.unit ||
                  "units"
                }
                type="warning"
              />

              <MetricCard
                icon={ShoppingCart}
                label="Available Stock"
                value={
                  available
                }
                unit={
                  product.unit ||
                  "units"
                }
                type="info"
              />

            </div>

            {/* Stock History */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <h2 className="text-sm font-semibold text-slate-900">
                      Stock History
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Recent stock movements for this product
                    </p>

                  </div>

                  <span className="text-xs text-slate-400">
                    {
                      movements.length
                    }{" "}
                    movements
                  </span>

                </div>

              </div>

              {movements.length ===
              0 ? (
                <div className="p-10 text-center">

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Boxes
                      size={18}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No stock movements yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Stock activity for this product will appear here.
                  </p>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">

                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Operation
                        </th>

                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Quantity
                        </th>

                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Stock Change
                        </th>

                        <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Performed By
                        </th>

                        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Date
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {movements.map(
                        (movement) => (
                          <StockMovementRow
                            key={
                              movement._id
                            }
                            movement={
                              movement
                            }
                          />
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};


/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status,
}) => {
  const styles = {
    "In Stock":
      "bg-emerald-50 text-emerald-600",

    "Low Stock":
      "bg-amber-50 text-amber-600",

    "Out of Stock":
      "bg-red-50 text-red-600",

    Overstock:
      "bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
};


/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div>

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
};


/* =========================================================
   METRIC CARD
========================================================= */

const MetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  type,
}) => {
  const iconStyles = {
    success:
      "bg-emerald-50 text-emerald-600",

    warning:
      "bg-amber-50 text-amber-600",

    info:
      "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-center gap-3">

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            iconStyles[type]
          }`}
        >
          <Icon size={17} />
        </span>

        <div>

          <p className="text-xs text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {value}
            <span className="ml-1 text-xs font-normal text-slate-400">
              {unit}
            </span>
          </p>

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   STOCK MOVEMENT ROW
========================================================= */

const StockMovementRow = ({
  movement,
}) => {
  const isIn =
    movement.type === "IN";

  const isReturn =
    movement.type ===
    "RETURN";

  const isOut =
    movement.type ===
    "OUT";

  const typeLabel =
    isIn
      ? "Stock In"
      : isReturn
      ? "Return"
      : isOut
      ? "Stock Out"
      : movement.type ||
        "Adjustment";

  return (
    <tr className="transition hover:bg-slate-50/60">

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isIn
                ? "bg-emerald-50 text-emerald-600"
                : isReturn
                ? "bg-blue-50 text-blue-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isIn ? (
              <TrendingUp
                size={15}
              />
            ) : (
              <TrendingDown
                size={15}
              />
            )}
          </div>

          <div>

            <p className="text-xs font-semibold text-slate-700">
              {typeLabel}
            </p>

            <p className="mt-0.5 max-w-[250px] truncate text-[10px] text-slate-400">
              {movement.reason ||
                "—"}
            </p>

          </div>

        </div>

      </td>

      <td className="px-5 py-4">

        <span className="text-sm font-semibold text-slate-700">
          {movement.quantity}
        </span>

      </td>

      <td className="px-5 py-4">

        <span className="text-xs text-slate-500">
          {movement.previousStock}
          {" → "}
          <span className="font-semibold text-slate-700">
            {movement.newStock}
          </span>
        </span>

      </td>

      <td className="px-5 py-4">

        <div>

          <p className="text-xs font-medium text-slate-700">
            {movement.performedBy
              ?.name ||
              "Unknown"}
          </p>

          {movement.performedBy
            ?.role && (
            <p className="mt-0.5 text-[10px] text-slate-400">
              {movement.performedBy.role}
            </p>
          )}

        </div>

      </td>

      <td className="px-5 py-4 text-right">

        <span className="text-[11px] text-slate-400">
          {movement.createdAt
            ? new Date(
                movement.createdAt
              ).toLocaleString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : "—"}
        </span>

      </td>

    </tr>
  );
};

export default InventoryDetails;