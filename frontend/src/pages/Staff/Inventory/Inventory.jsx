import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Package,
  Plus,
  Minus,
  Eye,
  RefreshCw,
  ChevronDown,
  Boxes,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StaffSidebar from "../../../components/layout/StaffSidebar";
import StaffHeader from "../../../components/layout/StaffHeader";

import { getInventory } from "../../../services/inventoryService";

const Inventory = () => {
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("all");

  const [stockStatus, setStockStatus] =
    useState("all");

  const [showFilters, setShowFilters] =
    useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getInventory();

      /*
       * Supports both:
       *   getInventory() -> array
       *   getInventory() -> { data: [...] }
       */

      const inventoryData = Array.isArray(response)
        ? response
        : response?.data || [];

      setProducts(inventoryData);
    } catch (err) {
      console.error(
        "Failed to load inventory:",
        err
      );

      setError(
        err.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["all", ...new Set(values)];
  }, [products]);

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const productName =
        product.productName ||
        product.name ||
        "";

      const sku = product.sku || "";

      const matchesSearch =
        !query ||
        productName
          .toLowerCase()
          .includes(query) ||
        sku
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "all" ||
        product.category === category;

      const currentStock =
        Number(product.currentStock) || 0;

      const minimumStock =
        Number(product.minStock) || 0;

      let matchesStatus = true;

      if (stockStatus === "in-stock") {
        matchesStatus =
          currentStock > minimumStock;
      }

      if (stockStatus === "low-stock") {
        matchesStatus =
          currentStock > 0 &&
          currentStock <= minimumStock;
      }

      if (stockStatus === "out-of-stock") {
        matchesStatus =
          currentStock <= 0;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    category,
    stockStatus,
  ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalProducts = products.length;

  const lowStockCount = products.filter(
    (product) => {
      const stock =
        Number(product.currentStock) || 0;

      const minimum =
        Number(product.minStock) || 0;

      return stock > 0 && stock <= minimum;
    }
  ).length;

  const outOfStockCount = products.filter(
    (product) =>
      (Number(product.currentStock) || 0) <= 0
  ).length;

  const totalUnits = products.reduce(
    (total, product) =>
      total +
      (Number(product.currentStock) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <StaffSidebar
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

      {/* Mobile overlay */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        <StaffHeader
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px]">

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Inventory
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  View and manage available
                  inventory stock.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchInventory}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

              <SummaryCard
                label="Products"
                value={totalProducts}
                icon={Boxes}
              />

              <SummaryCard
                label="Total Units"
                value={totalUnits}
                icon={Package}
              />

              <SummaryCard
                label="Low Stock"
                value={lowStockCount}
                icon={SlidersHorizontal}
                warning
              />

              <SummaryCard
                label="Out of Stock"
                value={outOfStockCount}
                icon={Package}
                danger
              />

            </div>


            {/* =================================================
                SEARCH + FILTERS
            ================================================== */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-3 lg:flex-row">

                {/* Search */}

                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search by product name or SKU..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50"
                  />
                </div>

                {/* Mobile filters */}

                <button
                  type="button"
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 lg:hidden"
                >
                  <SlidersHorizontal
                    size={16}
                  />

                  Filters
                </button>

                {/* Desktop filters */}

                <div
                  className={`flex flex-col gap-3 sm:flex-row ${
                    showFilters
                      ? "flex"
                      : "hidden lg:flex"
                  }`}
                >

                  {/* Category */}

                  <FilterSelect
                    value={category}
                    onChange={(event) =>
                      setCategory(
                        event.target.value
                      )
                    }
                    options={categories}
                    labelMap={{
                      all: "All Categories",
                    }}
                  />

                  {/* Stock status */}

                  <FilterSelect
                    value={stockStatus}
                    onChange={(event) =>
                      setStockStatus(
                        event.target.value
                      )
                    }
                    options={[
                      "all",
                      "in-stock",
                      "low-stock",
                      "out-of-stock",
                    ]}
                    labelMap={{
                      all: "All Stock",
                      "in-stock": "In Stock",
                      "low-stock": "Low Stock",
                      "out-of-stock":
                        "Out of Stock",
                    }}
                  />

                </div>
              </div>

              {/* Result count */}

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {products.length}
                  </span>{" "}
                  products
                </p>

                {(search ||
                  category !== "all" ||
                  stockStatus !==
                    "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                      setStockStatus("all");
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}

              </div>
            </div>


            {/* =================================================
                ERROR
            ================================================== */}

            {!loading && error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="text-sm font-semibold text-red-800">
                      Unable to load inventory
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchInventory}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Try Again
                  </button>

                </div>
              </div>
            )}


            {/* =================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                <p className="text-sm font-medium text-slate-700">
                  Loading inventory...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fetching the latest stock
                  information.
                </p>

              </div>
            )}


            {/* =================================================
                INVENTORY TABLE
            ================================================== */}

            {!loading &&
              !error && (
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  {/* Desktop */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left">

                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70">

                          <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Product
                          </th>

                          <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Category
                          </th>

                          <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Current Stock
                          </th>

                          <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Minimum
                          </th>

                          <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Status
                          </th>

                          <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Actions
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredProducts.length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-16"
                            >
                              <EmptyInventory />
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map(
                            (product) => (
                              <InventoryRow
                                key={
                                  product._id ||
                                  product.id
                                }
                                product={
                                  product
                                }
                                navigate={
                                  navigate
                                }
                              />
                            )
                          )
                        )}

                      </tbody>
                    </table>
                  </div>


                  {/* Mobile */}

                  <div className="divide-y divide-slate-100 md:hidden">

                    {filteredProducts.length ===
                    0 ? (
                      <EmptyInventory />
                    ) : (
                      filteredProducts.map(
                        (product) => (
                          <MobileInventoryCard
                            key={
                              product._id ||
                              product.id
                            }
                            product={
                              product
                            }
                            navigate={
                              navigate
                            }
                          />
                        )
                      )
                    )}

                  </div>

                </div>
              )}

          </div>
        </main>
      </div>
    </div>
  );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  warning = false,
  danger = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="flex items-center justify-between gap-3">

        <div>
          <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-50 text-red-600"
              : warning
              ? "bg-amber-50 text-amber-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={17} />
        </div>

      </div>
    </div>
  );
};


/* =========================================================
   FILTER SELECT
========================================================= */

const FilterSelect = ({
  value,
  onChange,
  options,
  labelMap = {},
}) => {
  return (
    <div className="relative min-w-[170px]">

      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-600 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {labelMap[option] ||
              formatLabel(option)}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

    </div>
  );
};


/* =========================================================
   DESKTOP INVENTORY ROW
========================================================= */

const InventoryRow = ({
  product,
  navigate,
}) => {
  const name =
    product.productName ||
    product.name ||
    "Unnamed Product";

  const sku =
    product.sku || "No SKU";

  const stock =
    Number(product.currentStock) || 0;

  const minimum =
    Number(product.minStock) || 0;

  const status = getStockStatus(
    stock,
    minimum
  );

  return (
    <tr className="transition hover:bg-slate-50/70">

      {/* Product */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Package size={17} />
          </div>

          <div className="min-w-0">
            <p className="max-w-[230px] truncate text-sm font-semibold text-slate-800">
              {name}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              SKU: {sku}
            </p>
          </div>

        </div>

      </td>

      {/* Category */}

      <td className="px-5 py-4">
        <span className="text-xs text-slate-600">
          {product.category ||
            "Uncategorized"}
        </span>
      </td>

      {/* Current stock */}

      <td className="px-5 py-4">
        <span className="text-sm font-semibold text-slate-800">
          {stock}
        </span>

        <span className="ml-1 text-[11px] text-slate-400">
          {product.unit || "units"}
        </span>
      </td>

      {/* Minimum */}

      <td className="px-5 py-4">
        <span className="text-xs text-slate-600">
          {minimum}
        </span>
      </td>

      {/* Status */}

      <td className="px-5 py-4">
        <StockBadge status={status} />
      </td>

      {/* Actions */}

      <td className="px-5 py-4">

        <div className="flex items-center justify-end gap-1">

          <button
            type="button"
            title="View product"
            onClick={() =>
              navigate(
                `/staff/inventory/${
                  product._id ||
                  product.id
                }`
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            title="Stock in"
            onClick={() =>
              navigate(
                `/staff/stock-in?product=${
                  product._id ||
                  product.id
                }`
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            title="Stock out"
            onClick={() =>
              navigate(
                `/staff/stock-out?product=${
                  product._id ||
                  product.id
                }`
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Minus size={16} />
          </button>

        </div>

      </td>

    </tr>
  );
};


/* =========================================================
   MOBILE CARD
========================================================= */

const MobileInventoryCard = ({
  product,
  navigate,
}) => {
  const name =
    product.productName ||
    product.name ||
    "Unnamed Product";

  const sku =
    product.sku || "No SKU";

  const stock =
    Number(product.currentStock) || 0;

  const minimum =
    Number(product.minStock) || 0;

  const status = getStockStatus(
    stock,
    minimum
  );

  const id =
    product._id || product.id;

  return (
    <div className="p-4">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Package size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {name}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              SKU: {sku}
            </p>
          </div>

        </div>

        <StockBadge status={status} />

      </div>


      <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3">

        <div>
          <p className="text-[10px] text-slate-400">
            Stock
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {stock}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400">
            Minimum
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {minimum}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-400">
            Category
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {product.category ||
              "—"}
          </p>
        </div>

      </div>


      <div className="mt-3 grid grid-cols-3 gap-2">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/staff/inventory/${id}`
            )
          }
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Eye size={14} />
          View
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/staff/stock-in?product=${id}`
            )
          }
          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100"
        >
          <Plus size={14} />
          Stock In
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/staff/stock-out?product=${id}`
            )
          }
          className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
        >
          <Minus size={14} />
          Stock Out
        </button>

      </div>

    </div>
  );
};


/* =========================================================
   STOCK BADGE
========================================================= */

const StockBadge = ({ status }) => {
  const config = {
    "in-stock": {
      label: "In Stock",
      className:
        "bg-emerald-50 text-emerald-600",
    },

    "low-stock": {
      label: "Low Stock",
      className:
        "bg-amber-50 text-amber-600",
    },

    "out-of-stock": {
      label: "Out of Stock",
      className:
        "bg-red-50 text-red-600",
    },
  };

  const current =
    config[status] ||
    config["in-stock"];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
};


/* =========================================================
   STOCK STATUS
========================================================= */

const getStockStatus = (
  stock,
  minimum
) => {
  if (stock <= 0) {
    return "out-of-stock";
  }

  if (stock <= minimum) {
    return "low-stock";
  }

  return "in-stock";
};


/* =========================================================
   EMPTY INVENTORY
========================================================= */

const EmptyInventory = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Boxes size={21} />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        No products found
      </p>

      <p className="mt-1 max-w-sm text-xs text-slate-400">
        Try changing your search or
        filter criteria.
      </p>

    </div>
  );
};


/* =========================================================
   FORMAT LABEL
========================================================= */

const formatLabel = (value) => {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

export default Inventory;