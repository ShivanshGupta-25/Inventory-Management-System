import { useEffect, useState } from "react";
import {
  Calendar,
  Package,
  Trash2,
  X,
  Save,
  Search,
  RefreshCw,
} from "lucide-react";

import { getInventory } from "../../../services/inventoryService";

const EditPurchaseOrderModal = ({
  order,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [supplierName, setSupplierName] =
    useState("");

  const [supplierEmail, setSupplierEmail] =
    useState("");

  const [supplierPhone, setSupplierPhone] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [inventory, setInventory] =
    useState([]);

  const [inventoryLoading, setInventoryLoading] =
    useState(true);

  const [items, setItems] = useState([]);

  const [expectedDate, setExpectedDate] =
    useState("");

  const [tax, setTax] = useState("");

  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;

    setSupplierName(order.supplier?.name || "");
    setSupplierEmail(order.supplier?.email || "");
    setSupplierPhone(order.supplier?.phone || "");

    setExpectedDate(
      order.expectedDate
        ? new Date(order.expectedDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setTax(order.tax ?? "");
    setNotes(order.notes || "");

    setItems(
      (order.items || []).map((item) => ({
        inventory: item.inventory?._id || item.inventory,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    );
  }, [order]);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setInventoryLoading(true);

        const response = await getInventory({
          status: "Active",
        });

        setInventory(response.data || []);
      } catch (error) {
        console.error(
          "Failed to load inventory:",
          error
        );
      } finally {
        setInventoryLoading(false);
      }
    };

    loadInventory();
  }, []);

  const filteredInventory = inventory.filter(
    (product) => {
      const search =
        productSearch.toLowerCase().trim();

      if (!search) return true;

      return (
        product.productName
          .toLowerCase()
          .includes(search) ||
        product.sku
          .toLowerCase()
          .includes(search)
      );
    }
  );

  const isAlreadyAdded = (id) => {
    return items.some(
      (item) => item.inventory === id
    );
  };

  const handleAddProduct = (product) => {
    if (isAlreadyAdded(product._id)) {
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        inventory: product._id,
        productName: product.productName,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.purchasePrice || 0,
      },
    ]);

    setProductSearch("");
  };

  const handleRemoveProduct = (inventoryId) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.inventory !== inventoryId
      )
    );
  };

  const handleQuantityChange = (
    inventoryId,
    value
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.inventory === inventoryId
          ? {
              ...item,
              quantity: value,
            }
          : item
      )
    );
  };

  const handlePriceChange = (
    inventoryId,
    value
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.inventory === inventoryId
          ? {
              ...item,
              unitPrice: value,
            }
          : item
      )
    );
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.unitPrice || 0),
    0
  );

  const numericTax = Number(tax) || 0;

  const total = subtotal + numericTax;

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (items.length === 0) {
      setError(
        "Add at least one product to the order."
      );
      return;
    }

    if (!supplierName.trim()) {
      setError("Supplier name is required.");
      return;
    }

    for (const item of items) {
      if (Number(item.quantity) < 1) {
        setError(
          "Product quantity must be at least 1."
        );
        return;
      }

      if (Number(item.unitPrice) < 0) {
        setError(
          "Product price cannot be negative."
        );
        return;
      }
    }

    onSubmit({
      supplier: {
        name: supplierName.trim(),
        email: supplierEmail.trim(),
        phone: supplierPhone.trim(),
      },

      items: items.map((item) => ({
        inventory: item.inventory,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),

      tax: numericTax,

      expectedDate:
        expectedDate || null,

      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Edit Purchase Order
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update {order.orderNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto p-6">

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Supplier */}
            <section>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Supplier Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Supplier Name *
                  </label>

                  <input
                    value={supplierName}
                    onChange={(e) =>
                      setSupplierName(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={supplierEmail}
                    onChange={(e) =>
                      setSupplierEmail(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    value={supplierPhone}
                    onChange={(e) =>
                      setSupplierPhone(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

              </div>
            </section>

            {/* Products */}
            <section className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Add or modify products in this draft.
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {items.length} items
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) =>
                    setProductSearch(e.target.value)
                  }
                  placeholder="Search products by name or SKU..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {/* Search results */}
              {productSearch.trim() && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">

                  {inventoryLoading ? (
                    <div className="flex items-center justify-center gap-2 p-5 text-sm text-slate-500">
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Loading products...
                    </div>
                  ) : filteredInventory.length === 0 ? (
                    <div className="p-5 text-center text-sm text-slate-400">
                      No products found.
                    </div>
                  ) : (
                    filteredInventory.map(
                      (product) => (
                        <button
                          key={product._id}
                          type="button"
                          disabled={isAlreadyAdded(
                            product._id
                          )}
                          onClick={() =>
                            handleAddProduct(product)
                          }
                          className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {product.productName}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              SKU: {product.sku}
                            </p>
                          </div>

                          <span className="text-xs text-slate-400">
                            Stock:{" "}
                            {product.currentStock}
                          </span>
                        </button>
                      )
                    )
                  )}
                </div>
              )}

              {/* Items */}
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.inventory}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="rounded-lg bg-slate-100 p-2.5">
                          <Package
                            size={18}
                            className="text-slate-500"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.productName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.sku}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                        <div>
                          <label className="mb-1 block text-xs text-slate-500">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.inventory,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs text-slate-500">
                            Unit Price
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handlePriceChange(
                                item.inventory,
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProduct(
                                item.inventory
                              )
                            }
                            className="flex h-[38px] w-full items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
                    <Package
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No products added
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Additional Information */}
            <section className="mt-7">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Expected Delivery
                  </label>

                  <div className="relative">
                    <Calendar
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) =>
                        setExpectedDate(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Additional Tax
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) =>
                      setTax(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Add notes about this purchase order..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </section>

            {/* Summary */}
            <div className="mt-7 flex justify-end">
              <div className="w-full max-w-sm rounded-xl bg-slate-50 p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Tax
                  </span>

                  <span className="font-medium text-slate-900">
                    ₹
                    {numericTax.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>

                <div className="mt-3 border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-lg font-bold text-slate-900">
                      ₹
                      {total.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseOrderModal;