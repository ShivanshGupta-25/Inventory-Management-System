import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import InventoryStats from "../../../components/manager/inventory/InventoryStats";
import InventoryFilters from "../../../components/manager/inventory/InventoryFilters";
import InventoryTable from "../../../components/manager/inventory/InventoryTable";
import StockAdjustmentModal from "../../../components/manager/inventory/StockAdjustmentModal";
import AddProductModal from "../../../components/manager/inventory/AddProductModal";

import EditProductModal from "../../../components/manager/inventory/EditProductModal";
import DeleteProductModal from "../../../components/manager/inventory/DeleteProductModal";

import {
  getInventory,
  getInventoryStats,
  adjustStock,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../../../services/inventoryService";

const Inventory = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [inventory, setInventory] = useState([]);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalAvailableStock: 0,
    lowStock: 0,
    outOfStock: 0,
    overstock: 0,
    inStock: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [adjustmentLoading, setAdjustmentLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [addProductOpen, setAddProductOpen] =
  useState(false);

  const [addProductLoading, setAddProductLoading] =
  useState(false);

  const [editProduct, setEditProduct] =
  useState(null);

  const [editProductLoading, setEditProductLoading] =
    useState(false);

  const [deleteProduct, setDeleteProduct] =
    useState(null);

  const [deleteProductLoading, setDeleteProductLoading] =
    useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        inventoryResponse,
        statsResponse,
      ] = await Promise.all([
        getInventory({
          search,
          category,
          status,
        }),
        getInventoryStats(),
      ]);

      setInventory(inventoryResponse.data || []);

      setStats(
        statsResponse.data || {
          totalProducts: 0,
          totalStock: 0,
          totalAvailableStock: 0,
          lowStock: 0,
          outOfStock: 0,
          overstock: 0,
          inStock: 0,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [search, category, status]);

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setStatus("");
  };

  const handleUpdateProduct = async (data) => {
    if (!editProduct) return;

    try {
        setEditProductLoading(true);

        await updateInventory(
        editProduct._id,
        data
        );

        setEditProduct(null);

        await loadInventory();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to update product"
        );
    } finally {
        setEditProductLoading(false);
    }
  };

    const handleConfirmDelete = async () => {
        if (!deleteProduct) return;

        try {
            setDeleteProductLoading(true);

            await deleteInventory(
            deleteProduct._id
            );

            setDeleteProduct(null);

            await loadInventory();
        } catch (error) {
            alert(
            error.response?.data?.message ||
                "Failed to delete product"
            );
        } finally {
            setDeleteProductLoading(false);
        }
    };

    const handleEdit = (item) => {
        setEditProduct(item);
    };

    const handleHistory = (id) => {
        window.location.href =
        `/manager/inventory/${id}`;
    };

    const handleDelete = (item) => {
        setDeleteProduct(item);
    };

  const handleAdjust = async (data) => {
    if (!selectedItem) return;

    try {
      setAdjustmentLoading(true);

      await adjustStock(
        selectedItem._id,
        data
      );

      setSelectedItem(null);

      await loadInventory();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to adjust stock"
      );
    } finally {
      setAdjustmentLoading(false);
    }
  };
  

  const handleAddProduct = async (data) => {
    try {
        setAddProductLoading(true);

        await createInventory(data);

        setAddProductOpen(false);

        await loadInventory();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to add product"
        );
    } finally {
        setAddProductLoading(false);
    }
    };

  const handleView = (id) => {
    window.location.href =
      `/manager/inventory/${id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}

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
                    Inventory
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Monitor and manage your current stock levels.
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

            <InventoryStats stats={stats} />

            {/* Filters / Actions */}

            <div className="mt-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex-1">
                  <InventoryFilters
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    status={status}
                    setStatus={setStatus}
                    onReset={handleReset}
                  />
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={loadInventory}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>

                  <button
                    onClick={() => setAddProductOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                    >
                    <Plus size={17} />
                    Add Product
                  </button>

                </div>

              </div>
            </div>

            {/* Inventory Table */}

            <div className="mt-5">

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                  <p className="mt-4 text-sm text-slate-500">
                    Loading inventory...
                  </p>

                </div>
              ) : (
                <InventoryTable
                  inventory={inventory}
                  onView={handleView}
                  onAdjust={setSelectedItem}
                  onEdit={handleEdit}
                  onHistory={handleHistory}
                  onDelete={handleDelete}
                />
              )}

            </div>

          </div>
        </main>

      </div>

      {/* Stock Adjustment */}

      {selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={() =>
            setSelectedItem(null)
          }
          onSubmit={handleAdjust}
          loading={adjustmentLoading}
        />
      )}

      {/* Add Product Modal */}
      {addProductOpen && (
        <AddProductModal
            onClose={() => setAddProductOpen(false)}
            onSubmit={handleAddProduct}
            loading={addProductLoading}
        />
        )}

        {/* Edit Product Modal */}
        {editProduct && (
          <EditProductModal
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSubmit={handleUpdateProduct}
            loading={editProductLoading}
          />
        )}

        {/* Delete Product Modal */}
        {deleteProduct && (
          <DeleteProductModal
            product={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            onConfirm={handleConfirmDelete}
            loading={deleteProductLoading}
          />
        )}

    </div>
  );
};

export default Inventory;