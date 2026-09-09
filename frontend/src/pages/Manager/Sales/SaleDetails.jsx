import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import SaleStatus from "../../../components/sales/SaleStatus";
import { getSaleById } from "../../../services/salesApi";

const SaleDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  /* Sidebar */

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /* Sale */

  const [sale, setSale] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* Fetch sale */

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getSaleById(id);

        setSale(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Failed to load sale"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  /* Loading */

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

              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading sale...
                </p>

              </div>

            </div>
          </main>

        </div>

      </div>
    );
  }

  /* Error */

  if (error || !sale) {
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

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {error || "Sale not found"}
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

              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Management / Sales
                  </p>

                  <div className="mt-1 flex items-center gap-3">

                    <button
                      onClick={() =>
                        navigate(
                          "/manager/sales"
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {sale.saleNumber}
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        Sale details and transaction information.
                      </p>
                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">

                  <SaleStatus
                    status={sale.status}
                  />

                  <SaleStatus
                    status={
                      sale.paymentStatus
                    }
                  />

                </div>

              </div>

            </div>

            {/* Customer + Payment */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

              {/* Customer Information */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-slate-100 p-2.5">
                    <User
                      size={19}
                      className="text-slate-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {sale.customerName ||
                        "Walk-in Customer"}
                    </p>

                  </div>

                </div>

                {sale.customerContact && (
                  <div className="mt-5 flex items-center gap-3">

                    <Phone
                      size={17}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-600">
                      {sale.customerContact}
                    </span>

                  </div>
                )}

                <div className="mt-5 flex items-center gap-3">

                  <Calendar
                    size={17}
                    className="text-slate-400"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Sale Date
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(
                        sale.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                </div>

              </div>

              {/* Payment Summary */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Payment Summary
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Breakdown of this transaction.
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400">
                      Total Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      ₹
                      {Number(
                        sale.totalAmount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Subtotal
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      ₹
                      {Number(
                        sale.subtotal || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Discount
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      - ₹
                      {Number(
                        sale.discount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Tax
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      + ₹
                      {Number(
                        sale.tax || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Sale Items */}

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                  <div>

                    <h2 className="text-base font-semibold text-slate-900">
                      Sale Items
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Products included in this transaction.
                    </p>

                  </div>

                  <p className="text-sm text-slate-500">
                    {sale.items?.length || 0}{" "}
                    product
                    {sale.items?.length === 1
                      ? ""
                      : "s"}
                  </p>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        SKU
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Quantity
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Price
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {sale.items?.map(
                      (item) => (
                        <tr
                          key={item._id}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <p className="font-semibold text-slate-900">
                              {
                                item.productName
                              }
                            </p>

                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {item.sku}
                          </td>

                          <td className="px-6 py-4 text-slate-700">
                            {item.quantity}
                          </td>

                          <td className="px-6 py-4 text-slate-700">
                            ₹
                            {Number(
                              item.sellingPrice ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-6 py-4 text-right font-semibold text-slate-900">
                            ₹
                            {Number(
                              item.totalPrice ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* Bottom Total */}

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs text-slate-400">
                  Transaction Total
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {sale.items?.reduce(
                    (total, item) =>
                      total +
                      item.quantity,
                    0
                  ) || 0}{" "}
                  total units sold
                </p>

              </div>

              <div className="sm:text-right">

                <p className="text-xs text-slate-400">
                  Total Amount
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  ₹
                  {Number(
                    sale.totalAmount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

            </div>

          </div>
        </main>

      </div>

    </div>
  );
};

export default SaleDetails;