import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";
import SaleForm from "../../../components/sales/SaleForm";

import { createSale } from "../../../services/salesApi";

const INVENTORY_API =
  "http://localhost:5000/api/inventory";

const CreateSale = () => {
  const navigate = useNavigate();

  /* Sidebar */

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /* Inventory */

  const [inventory, setInventory] = useState([]);

  /* Sale */

  const [items, setItems] = useState([
    {
      inventory: "",
      quantity: 1,
    },
  ]);

  const [customerName, setCustomerName] =
    useState("");

  const [customerContact, setCustomerContact] =
    useState("");

  const [discount, setDiscount] = useState(0);

  const [tax, setTax] = useState(0);

  /*
   * Payment
   *
   * Backend derives paymentStatus from paidAmount.
   */
  const [paidAmount, setPaidAmount] =
    useState(0);

  /* Loading / Error */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* Fetch inventory */

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          INVENTORY_API
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch inventory"
          );
        }

        setInventory(data.data || []);
      } catch (error) {
        console.error(error);

        setError(
          error.message ||
            "Failed to load inventory"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  /* Calculate subtotal */

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = inventory.find(
        (product) =>
          product._id === item.inventory
      );

      if (!product) {
        return total;
      }

      return (
        total +
        product.sellingPrice *
          Number(item.quantity || 0)
      );
    }, 0);
  }, [items, inventory]);

  /* Calculate total */

  const totalAmount = Math.max(
    0,
    subtotal -
      Number(discount || 0) +
      Number(tax || 0)
  );

  /* Submit */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!items.length) {
        throw new Error(
          "Add at least one product"
        );
      }

      /* Validate items */

      for (const item of items) {
        if (!item.inventory) {
          throw new Error(
            "Please select a product for every item"
          );
        }

        if (
          !Number.isInteger(
            Number(item.quantity)
          ) ||
          Number(item.quantity) <= 0
        ) {
          throw new Error(
            "Quantity must be a positive integer"
          );
        }

        const product = inventory.find(
          (product) =>
            product._id === item.inventory
        );

        if (!product) {
          throw new Error(
            "Selected product no longer exists"
          );
        }

        const availableStock =
          product.currentStock -
          product.reservedStock;

        if (
          Number(item.quantity) >
          availableStock
        ) {
          throw new Error(
            `Insufficient stock for ${product.productName}. Available stock: ${availableStock}`
          );
        }
      }

      /* Validate discount / tax */

      if (
        Number(discount) < 0 ||
        Number(tax) < 0
      ) {
        throw new Error(
          "Discount and tax cannot be negative"
        );
      }

      if (Number(discount) > subtotal) {
        throw new Error(
          "Discount cannot be greater than subtotal"
        );
      }

      /* Validate paid amount */

      const numericPaidAmount = Number(
        paidAmount || 0
      );

      if (numericPaidAmount < 0) {
        throw new Error(
          "Paid amount cannot be negative"
        );
      }

      if (numericPaidAmount > totalAmount) {
        throw new Error(
          "Paid amount cannot be greater than total amount"
        );
      }

      /* Create sale */

      const response = await createSale({
        customerName,
        customerContact,

        discount: Number(
          discount || 0
        ),

        tax: Number(tax || 0),

        paidAmount: numericPaidAmount,

        items: items.map((item) => ({
          inventory: item.inventory,
          quantity: Number(
            item.quantity
          ),
        })),
      });

      navigate(
        `/manager/sales/${response.data._id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create sale"
      );
    } finally {
      setSaving(false);
    }
  };

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
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Management / Sales
                  </p>

                  <div className="mt-1 flex items-center gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/manager/sales"
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                    >
                      <ArrowLeft
                        size={18}
                      />
                    </button>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Record Sale
                    </h1>

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Create a new sale using available inventory.
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

            {/* Loading */}

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading inventory...
                </p>

              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                {/* Sale Form */}

                <SaleForm
                  inventory={inventory}
                  items={items}
                  setItems={setItems}

                  customerName={customerName}
                  setCustomerName={
                    setCustomerName
                  }

                  customerContact={
                    customerContact
                  }
                  setCustomerContact={
                    setCustomerContact
                  }

                  discount={discount}
                  setDiscount={setDiscount}

                  tax={tax}
                  setTax={setTax}

                  paidAmount={paidAmount}
                  setPaidAmount={
                    setPaidAmount
                  }
                />

                {/* Summary */}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Sale Summary
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Review the transaction before completing the sale.
                      </p>
                    </div>

                    <div className="w-full max-w-md space-y-3">

                      {/* Subtotal */}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Subtotal
                        </span>

                        <span className="font-medium text-slate-900">
                          ₹
                          {subtotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {/* Discount */}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Discount
                        </span>

                        <span className="font-medium text-slate-900">
                          - ₹
                          {Number(
                            discount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {/* Tax */}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Tax
                        </span>

                        <span className="font-medium text-slate-900">
                          + ₹
                          {Number(
                            tax || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {/* Paid Amount */}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Paid Amount
                        </span>

                        <span className="font-medium text-slate-900">
                          ₹
                          {Number(
                            paidAmount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {/* Balance */}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Balance
                        </span>

                        <span className="font-medium text-slate-900">
                          ₹
                          {Math.max(
                            0,
                            totalAmount -
                              Number(
                                paidAmount ||
                                  0
                              )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>

                      {/* Total */}

                      <div className="border-t border-slate-200 pt-3">

                        <div className="flex items-center justify-between">

                          <span className="font-semibold text-slate-900">
                            Total Amount
                          </span>

                          <span className="text-xl font-bold tracking-tight text-slate-900">
                            ₹
                            {totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Bottom Actions */}

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/manager/sales"
                      )
                    }
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving || loading
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={17} />

                    {saving
                      ? "Creating Sale..."
                      : "Complete Sale"}
                  </button>

                </div>

              </form>
            )}

          </div>
        </main>

      </div>

    </div>
  );
};

export default CreateSale;