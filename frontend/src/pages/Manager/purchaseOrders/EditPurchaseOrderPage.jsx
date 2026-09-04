import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import SupplierSelect from "../../../components/manager/purchaseOrders/SupplierSelect";

import { purchaseOrderData } from "../../../data/purchaseOrderData";

const EditPurchaseOrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const order = purchaseOrderData.find(
    (purchaseOrder) =>
      purchaseOrder.id === id
  );

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [supplier, setSupplier] = useState(
    order?.supplier || ""
  );

  const [items, setItems] = useState([
    {
      id: 1,
      product: "Wireless Keyboard",
      sku: "KB-2048",
      quantity: 50,
      unitCost: 1800,
    },
    {
      id: 2,
      product: "Wireless Mouse",
      sku: "MS-1024",
      quantity: 60,
      unitCost: 1100,
    },
    {
      id: 3,
      product: "USB-C Hub",
      sku: "UC-3018",
      quantity: 35,
      unitCost: 2500,
    },
  ]);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">
              Purchase Order Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The purchase order you're trying to edit does not exist.
            </p>

            <button
              onClick={() =>
                navigate("/manager/purchase-orders")
              }
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Back to Purchase Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        product: "",
        sku: "",
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

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.unitCost || 0),
    0
  );

  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleSave = () => {
    order.supplier = supplier;
    order.items = items.length;
    order.quantity = items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );
    order.total = total;

    navigate(`/manager/purchase-orders/${order.id}`);
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

            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() =>
                  navigate(
                    `/manager/purchase-orders/${order.id}`
                  )
                }
                className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Purchase Order
              </button>

              <p className="text-xs font-medium text-slate-400">
                Procurement Management
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Edit Purchase Order
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update supplier and order item information.
              </p>
            </div>

            {/* PO Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <p className="text-xs text-slate-400">
                    Purchase Order
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {order.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Current Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {order.status}
                  </p>
                </div>

              </div>
            </div>

            {/* Supplier */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Supplier Information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Update the supplier for this purchase order.
              </p>

              <div className="mt-5 max-w-md">
                <SupplierSelect
                  value={supplier}
                  onChange={setSupplier}
                />
              </div>
            </div>

            {/* Items */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Modify products, quantities and unit costs.
                  </p>
                </div>

                <button
                  onClick={addItem}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus size={15} />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Unit Cost
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Total
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0"
                      >

                        <td className="px-5 py-4">
                          <input
                            value={item.product}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "product",
                                e.target.value
                              )
                            }
                            placeholder="Product name"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            value={item.sku}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "sku",
                                e.target.value
                              )
                            }
                            placeholder="SKU"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                              ₹
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "unitCost",
                                  e.target.value
                                )
                              }
                              className="w-32 rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                            />
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                          ₹
                          {(
                            Number(item.quantity || 0) *
                            Number(item.unitCost || 0)
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.id)
                            }
                            disabled={items.length === 1}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-5 flex justify-end">
              <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:w-96">

                <h3 className="text-sm font-semibold text-slate-900">
                  Updated Order Summary
                </h3>

                <div className="mt-5 space-y-3">

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

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      GST (18%)
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {tax.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
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

                <button
                  onClick={handleSave}
                  disabled={!supplier}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  Save Changes
                </button>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default EditPurchaseOrderPage;