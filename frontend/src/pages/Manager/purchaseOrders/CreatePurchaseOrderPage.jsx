import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import SupplierSelect from "../../../components/manager/purchaseOrders/SupplierSelect";
import PurchaseOrderItemsTable from "../../../components/manager/purchaseOrders/PurchaseOrderItemsTable";

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState("");

  const [items, setItems] = useState([
    {
      id: 1,
      product: "",
      quantity: 1,
      unitCost: 0,
    },
  ]);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  // Success notification
  const [showSuccess, setShowSuccess] =
    useState(false);

  const [createdOrderId, setCreatedOrderId] =
    useState("");

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: "",
        quantity: 1,
        unitCost: 0,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.unitCost || 0),
    0
  );

  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  // Create Purchase Order
  const handleCreateOrder = () => {
    // Generate temporary PO number
    // Backend will generate the real ID later
    const newOrderId = `PO-2026-${String(
      Math.floor(Math.random() * 90000) + 10000
    )}`;

    setCreatedOrderId(newOrderId);
    setShowSuccess(true);

    // Automatically navigate after notification
    setTimeout(() => {
      navigate("/manager/purchase-orders");
    }, 2500);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
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
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* Main Content */}
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

            {/* Page Header */}
            <div className="mb-6">

              <button
                onClick={() =>
                  navigate(
                    "/manager/purchase-orders"
                  )
                }
                className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Purchase Orders
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Procurement Management
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  Create Purchase Order
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new purchase order for your supplier.
                </p>
              </div>

            </div>

            {/* Supplier Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Supplier Information
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Select the supplier for this purchase order.
                </p>
              </div>

              <div className="mt-5 max-w-md">
                <SupplierSelect
                  value={supplier}
                  onChange={setSupplier}
                />
              </div>

            </div>

            {/* Order Items */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Add products and quantities to this order.
                  </p>
                </div>

                <button
                  onClick={addItem}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus size={15} />
                  Add Item
                </button>

              </div>

              <PurchaseOrderItemsTable
                items={items}
                updateItem={updateItem}
                removeItem={removeItem}
              />

            </div>

            {/* Order Summary */}
            <div className="mt-5 flex justify-end">

              <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:w-96">

                <h3 className="text-sm font-semibold text-slate-900">
                  Order Summary
                </h3>

                <div className="mt-5 space-y-3">

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  {/* GST */}
                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      GST (18%)
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {tax.toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </span>

                  </div>

                  {/* Total */}
                  <div className="border-t border-slate-100 pt-3">

                    <div className="flex items-center justify-between">

                      <span className="text-sm font-semibold text-slate-800">
                        Total
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        ₹
                        {total.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 0,
                          }
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateOrder}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Save size={17} />
                  Create Purchase Order
                </button>

              </div>

            </div>

          </div>
        </main>
      </div>

      {/* ================================================= */}
      {/* SUCCESS NOTIFICATION */}
      {/* ================================================= */}

      {showSuccess && (
        <div className="fixed bottom-5 right-5 z-[200] w-[calc(100%-2rem)] max-w-sm animate-[slideIn_0.3s_ease-out]">

          <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-xl">

            <div className="flex items-start gap-3">

              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-3">

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Purchase Order Created
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your purchase order has been
                      created successfully.
                    </p>
                  </div>

                  {/* Close */}
                  <button
                    type="button"
                    onClick={closeSuccess}
                    className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>

                </div>

                {/* PO Number */}
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">

                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Purchase Order
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-blue-600">
                    {createdOrderId}
                  </p>

                </div>

              </div>

            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full origin-left animate-[shrink_2.5s_linear] rounded-full bg-emerald-500" />
            </div>

          </div>

        </div>
      )}

      {/* Toast Animations */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shrink {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}
      </style>

    </div>
  );
};

export default CreatePurchaseOrderPage;