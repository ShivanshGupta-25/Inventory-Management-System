import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  Plus,
  RefreshCw,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import PurchaseOrderStats from "../../../components/manager/purchaseOrders/PurchaseOrderStats";
import PurchaseOrderFilters from "../../../components/manager/purchaseOrders/PurchaseOrderFilters";
import PurchaseOrderTable from "../../../components/manager/purchaseOrders/PurchaseOrderTable";
import CreatePurchaseOrderModal from "../../../components/manager/purchaseOrders/CreatePurchaseOrderModal";
import ReceivePurchaseOrderModal from "../../../components/manager/purchaseOrders/ReceivePurchaseOrderModal";
import EditPurchaseOrderModal from "../../../components/manager/purchaseOrders/EditPurchaseOrderModal";

import {
  getPurchaseOrders,
  createPurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  updatePurchaseOrder,
} from "../../../services/purchaseOrderService";

const PurchaseOrders = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const navigate = useNavigate();

  const [createOrderOpen, setCreateOrderOpen] =
    useState(false);

  const [createOrderLoading, setCreateOrderLoading] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [editOrderOpen, setEditOrderOpen] =
  useState(false);

  const [editOrderLoading, setEditOrderLoading] =
  useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [selectedOrder, setSelectedOrder] =
  useState(null);

  const [receiveModalOpen, setReceiveModalOpen] =
  useState(false);

  const [receiveLoading, setReceiveLoading] =
  useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const loadOrders = async (
    showRefresh = false
  ) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await getPurchaseOrders();

      setOrders(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load purchase orders:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load purchase orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const searchValue =
        search.toLowerCase().trim();

      result = result.filter(
        (order) =>
          order.orderNumber
            ?.toLowerCase()
            .includes(searchValue) ||
          order.supplier?.name
            ?.toLowerCase()
            .includes(searchValue)
      );
    }

    if (status) {
      result = result.filter(
        (order) =>
          order.status === status
      );
    }

    return result;
  }, [orders, search, status]);

  const handleReset = () => {
    setSearch("");
    setStatus("");
  };

  const handleViewOrder = (order) => {
    navigate(
        `/manager/purchase-orders/${order._id}`
    );
  };

  const handleEditOrder = (order) => {
    if (order.status !== "Draft") {
        alert(
        "Only draft purchase orders can be edited."
        );
        return;
    }

    setSelectedOrder(order);
    setEditOrderOpen(true);
  };

  const handleUpdateOrder = async (data) => {
    if (!selectedOrder) return;

    try {
        setEditOrderLoading(true);

        await updatePurchaseOrder(
        selectedOrder._id,
        data
        );

        setEditOrderOpen(false);
        setSelectedOrder(null);

        await loadOrders();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to update purchase order"
        );
    } finally {
        setEditOrderLoading(false);
    }
    };

  const handleConfirmOrder = async (
    order
    ) => {
    const confirmed = window.confirm(
        `Confirm purchase order ${order.orderNumber}?`
    );

    if (!confirmed) return;

    try {
        await confirmPurchaseOrder(
        order._id
        );

        await loadOrders();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to confirm purchase order"
        );
    }
  };

  const handleReceiveOrder = (order) => {
    setSelectedOrder(order);
    setReceiveModalOpen(true);
  };

  const handleCancelOrder = async (
    order
    ) => {
    const confirmed = window.confirm(
        `Cancel purchase order ${order.orderNumber}?`
    );

    if (!confirmed) return;

    try {
        await cancelPurchaseOrder(
        order._id
        );

        await loadOrders();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to cancel purchase order"
        );
    }
  };

  const handleReceiveItems = async (
    data
    ) => {
    if (!selectedOrder) return;

    try {
        setReceiveLoading(true);

        await receivePurchaseOrder(
        selectedOrder._id,
        data
        );

        setReceiveModalOpen(false);
        setSelectedOrder(null);

        await loadOrders();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to receive purchase order"
        );
    } finally {
        setReceiveLoading(false);
    }
  };

  const handleCreate = () => {
    setCreateOrderOpen(true);
    };

  const handleCreateOrder = async (data) => {
    try {
        setCreateOrderLoading(true);

        await createPurchaseOrder(data);

        setCreateOrderOpen(false);

        await loadOrders();
    } catch (error) {
        alert(
        error.response?.data?.message ||
            "Failed to create purchase order"
        );
    } finally {
        setCreateOrderLoading(false);
    }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
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

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
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
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <RefreshCw
                    size={24}
                    className="mx-auto animate-spin text-slate-400"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    Loading purchase orders...
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
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

      {/* Main */}
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
            {/* Heading */}
            <div className="mb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Management / Purchase Orders
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Purchase Orders
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage suppliers, incoming stock,
                    and purchase orders.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      loadOrders(true)
                    }
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />

                    <span className="hidden sm:inline">
                      Refresh
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <Plus size={17} />

                    <span>
                      Create Order
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Stats */}
            <PurchaseOrderStats
              orders={orders}
            />

            {/* Filters */}
            <div className="mt-5">
              <PurchaseOrderFilters
                search={search}
                status={status}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onReset={handleReset}
              />
            </div>

            {/* Table */}
            <div className="mt-5">
              <PurchaseOrderTable
                orders={filteredOrders}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onConfirm={handleConfirmOrder}
                onReceive={handleReceiveOrder}
                onCancel={handleCancelOrder}
                />
            </div>
          </div>
        </main>

        {/* Create Order Modal */}
        {createOrderOpen && (
            <CreatePurchaseOrderModal
                onClose={() =>
                setCreateOrderOpen(false)
                }
                onSubmit={handleCreateOrder}
                loading={createOrderLoading}
            />
            )}

        {/* Receive Order Modal */}
        {receiveModalOpen && (
            <ReceivePurchaseOrderModal
                order={selectedOrder}
                onClose={() => {
                setReceiveModalOpen(false);
                setSelectedOrder(null);
                }}
                onSubmit={handleReceiveItems}
                loading={receiveLoading}
            />
            )}

        {/* Edit Order Modal */}
        {editOrderOpen && selectedOrder && (
            <EditPurchaseOrderModal
                order={selectedOrder}
                onClose={() => {
                setEditOrderOpen(false);
                setSelectedOrder(null);
                }}
                onSubmit={handleUpdateOrder}
                loading={editOrderLoading}
            />
            )}
      </div>
    </div>
  );
};



export default PurchaseOrders;