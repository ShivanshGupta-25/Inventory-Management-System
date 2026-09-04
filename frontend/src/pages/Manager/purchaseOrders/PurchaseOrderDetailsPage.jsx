import { useState } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import PurchaseOrderStatusBadge from "../../../components/manager/purchaseOrders/PurchaseOrderStatusBadge";

import { purchaseOrderData } from "../../../data/purchaseOrderData";


const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);


  /*
   * Find the selected purchase order.
   * For now, the detailed item information is mocked.
   * Later this will come from the backend.
   */
  const order =
    purchaseOrderData.find(
      (purchaseOrder) =>
        purchaseOrder.id === id
    ) || purchaseOrderData[0];


  const orderItems = [
    {
      id: 1,
      name: "Wireless Keyboard",
      sku: "KB-2048",
      quantity: 50,
      unitCost: 1800,
    },
    {
      id: 2,
      name: "Wireless Mouse",
      sku: "MS-1024",
      quantity: 60,
      unitCost: 1100,
    },
    {
      id: 3,
      name: "USB-C Hub",
      sku: "UC-3018",
      quantity: 35,
      unitCost: 2500,
    },
  ];


  const subtotal = orderItems.reduce(
    (sum, item) =>
      sum +
      item.quantity * item.unitCost,
    0
  );

  const tax = subtotal * 0.18;

  const total = subtotal + tax;


  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

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


      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

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

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">

              <Link
                to="/manager/purchase-orders"
                className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-800"
              >
                <ArrowLeft size={15} />
                Back to Purchase Orders
              </Link>


              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {order.id}
                    </h1>

                    <PurchaseOrderStatusBadge
                      status={order.status}
                    />

                  </div>


                  <p className="mt-1 text-sm text-slate-500">
                    Purchase order details and item information.
                  </p>

                </div>


                {/* Actions */}

                <div className="flex flex-wrap items-center gap-2">

                  {order.status === "Pending" && (
                    <button
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      <CheckCircle2 size={15} />
                      Approve Order
                    </button>
                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                ORDER INFORMATION
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* Supplier */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Truck size={19} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-slate-400">
                      Supplier
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {order.supplier}
                    </p>

                  </div>

                </div>

              </div>


              {/* Order Date */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarDays size={19} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {order.orderDate}
                    </p>

                  </div>

                </div>

              </div>


              {/* Expected Delivery */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Clock3 size={19} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Expected Delivery
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {order.expectedDate}
                    </p>

                  </div>

                </div>

              </div>


              {/* Total */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Package size={19} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Order Total
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                SUPPLIER DETAILS
            ================================================= */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-sm font-semibold text-slate-900">
                  Supplier Information
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Contact and delivery information for this supplier.
                </p>

              </div>


              <div className="grid gap-5 md:grid-cols-3">

                <div>
                  <p className="text-xs text-slate-400">
                    Company
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {order.supplier}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-400">
                    Contact Person
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    Rajesh Kumar
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-400">
                    Contact Number
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    +91 98765 43210
                  </p>
                </div>


                <div className="md:col-span-3">

                  <div className="flex items-start gap-2">

                    <MapPin
                      size={16}
                      className="mt-0.5 text-slate-400"
                    />

                    <div>

                      <p className="text-xs text-slate-400">
                        Delivery Address
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Warehouse No. 1, Industrial Area,
                        Mumbai, Maharashtra
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                ORDER ITEMS
            ================================================= */}

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-5">

                <h2 className="text-sm font-semibold text-slate-900">
                  Ordered Items
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Products included in this purchase order.
                </p>

              </div>


              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

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

                    </tr>

                  </thead>


                  <tbody>

                    {orderItems.map((item) => (

                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Package size={16} />
                            </div>

                            <span className="text-sm font-semibold text-slate-800">
                              {item.name}
                            </span>

                          </div>

                        </td>


                        <td className="px-5 py-4 text-xs text-slate-500">
                          {item.sku}
                        </td>


                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {item.quantity}
                        </td>


                        <td className="px-5 py-4 text-sm text-slate-600">
                          ₹{item.unitCost.toLocaleString("en-IN")}
                        </td>


                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          ₹
                          {(
                            item.quantity *
                            item.unitCost
                          ).toLocaleString("en-IN")}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              {/* =================================================
                  ORDER SUMMARY
              ================================================= */}

              <div className="border-t border-slate-100 p-5">

                <div className="ml-auto w-full space-y-3 sm:w-80">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹{subtotal.toLocaleString("en-IN")}
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


                  <div className="flex justify-between border-t border-slate-100 pt-3">

                    <span className="text-sm font-semibold text-slate-800">
                      Grand Total
                    </span>

                    <span className="text-lg font-bold text-slate-900">
                      ₹
                      {total.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                ORDER STATUS
            ================================================= */}

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Order Status
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current status of this purchase order.
                  </p>

                </div>


                <PurchaseOrderStatusBadge
                  status={order.status}
                />

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default PurchaseOrderDetailsPage;