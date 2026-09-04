import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CreditCard,
  Package,
  Receipt,
  User,
} from "lucide-react";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import SaleStatusBadge from "../../../components/manager/sales/SaleStatusBadge";

import {
  salesData,
  calculateSaleTotal,
} from "../../../data/salesData";

const SaleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const sale = salesData.find(
    (item) => String(item.id) === String(id)
  );

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-center">
        <Receipt
          size={30}
          className="mx-auto text-slate-300"
        />

        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          Sale not found
        </h1>

        <Link
          to="/manager/sales"
          className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to Sales
        </Link>
      </div>
    );
  }

  const total = calculateSaleTotal(sale);

  const totalItems = sale.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
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

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
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
          <div className="mx-auto max-w-[1200px]">
            <button
              onClick={() => navigate("/manager/sales")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Sales
            </button>

            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {sale.saleId}
                  </h1>

                  <SaleStatusBadge
                    status={sale.status}
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Created {sale.date}
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Customer */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User size={17} />
                  </div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Customer
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {sale.customer}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {sale.customerEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {sale.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <CreditCard size={17} />
                  </div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Payment
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Method
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {sale.paymentMethod}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Payment Status
                    </p>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        sale.paymentStatus === "Paid"
                          ? "text-emerald-600"
                          : sale.paymentStatus === "Refunded"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {sale.paymentStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Transaction Date
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {sale.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Receipt size={17} />
                  </div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Summary
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Products
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {sale.items.length}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">
                      Units
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {totalItems}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Total
                      </span>

                      <span className="text-xl font-bold text-slate-900">
                        ₹{total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Package
                    size={18}
                    className="text-slate-500"
                  />

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Sale Items
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Products included in this transaction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        SKU
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        Unit Price
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {sale.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {item.product}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {item.sku}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                          ₹
                          {(
                            item.price * item.quantity
                          ).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-4">
                <div className="ml-auto max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-700">
                      Total
                    </span>

                    <span className="text-lg font-bold text-slate-900">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock impact */}
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="flex items-start gap-3">
                <Package
                  size={18}
                  className="mt-0.5 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Inventory Impact
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    Once this transaction is processed, the
                    sold quantities will be deducted from
                    the corresponding inventory records and
                    recorded as stock movements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SaleDetailsPage;