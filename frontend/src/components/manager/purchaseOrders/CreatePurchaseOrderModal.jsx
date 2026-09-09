import { useEffect, useMemo, useState } from "react";
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

const CreatePurchaseOrderModal = ({
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [expectedDate, setExpectedDate] = useState("");
  const [tax, setTax] = useState("");
  const [notes, setNotes] = useState("");

  // Inventory products
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  // IMPORTANT:
  // This is completely independent from supplier state.
  const [search, setSearch] = useState("");

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [error, setError] = useState("");

  /*
   * Load active inventory products
   */
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError("");

        const response = await getInventory();

        if (!mounted) return;

        const inventoryData = Array.isArray(
          response
        )
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        const activeProducts = inventoryData.filter(
            (product) => product.status === "Active"
            );

        setProducts(activeProducts);
      } catch (error) {
        console.error(
          "Failed to load inventory products:",
          error
        );

        if (mounted) {
          setProducts([]);
          setError(
            error.response?.data?.message ||
              "Failed to load products from inventory."
          );
        }
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Search inventory
   */
  const filteredProducts = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim();

    if (!value) {
      return products;
    }

    return products.filter((product) => {
      const productName =
        product.productName
          ?.toLowerCase() || "";

      const sku =
        product.sku?.toLowerCase() || "";

      return (
        productName.includes(value) ||
        sku.includes(value)
      );
    });
  }, [products, search]);

  /*
   * Supplier fields
   */
  const handleSupplierChange = (e) => {
    const { name, value } = e.target;

    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * Add inventory product to PO
   */
  const addProduct = (product) => {
    const alreadyAdded = items.some(
      (item) =>
        item.inventory === product._id
    );

    if (alreadyAdded) {
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        // IMPORTANT:
        // This is the Inventory document ID.
        inventory: product._id,

        // Snapshot product information
        productName:
          product.productName,

        sku: product.sku,

        quantity: 1,

        unitPrice:
          Number(product.purchasePrice) || 0,
      },
    ]);

    // Clear product search after selection
    setSearch("");
  };

  /*
   * Remove product
   */
  const removeProduct = (inventoryId) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          item.inventory !== inventoryId
      )
    );
  };

  /*
   * Update quantity / price
   */
  const updateItem = (
    inventoryId,
    field,
    value
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.inventory === inventoryId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  /*
   * Subtotal
   */
  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => {
        const quantity =
          Number(item.quantity) || 0;

        const unitPrice =
          Number(item.unitPrice) || 0;

        return (
          sum + quantity * unitPrice
        );
      },
      0
    );
  }, [items]);

  /*
   * Tax is currently treated as a fixed amount.
   */
  const numericTax =
    Number(tax) || 0;

  const totalAmount =
    subtotal + numericTax;

  /*
   * Submit Draft
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!supplier.name.trim()) {
      setError(
        "Supplier name is required."
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Add at least one product to the order."
      );
      return;
    }

    for (const item of items) {
      const quantity =
        Number(item.quantity);

      const unitPrice =
        Number(item.unitPrice);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        setError(
          `Enter a valid whole-number quantity for ${item.productName}.`
        );
        return;
      }

      if (
        Number.isNaN(unitPrice) ||
        unitPrice < 0
      ) {
        setError(
          `Enter a valid price for ${item.productName}.`
        );
        return;
      }
    }

    if (
      Number.isNaN(numericTax) ||
      numericTax < 0
    ) {
      setError(
        "Enter a valid tax amount."
      );
      return;
    }

    /*
     * IMPORTANT:
     * Creating the PO does NOT change inventory.
     *
     * Inventory will be updated only when
     * this PO is received.
     */
    await onSubmit({
      supplier: {
        name: supplier.name.trim(),
        email: supplier.email.trim(),
        phone: supplier.phone.trim(),
      },

      items: items.map((item) => ({
        inventory: item.inventory,
        quantity: Number(item.quantity),
        unitPrice: Number(
          item.unitPrice
        ),
      })),

      tax: numericTax,

      expectedDate:
        expectedDate || null,

      notes: notes.trim(),

      status: "Draft",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Create Purchase Order
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add supplier and products for the
              incoming purchase.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Supplier */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Supplier Information
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Supplier Name *
                  </label>

                  <input
                    name="name"
                    value={supplier.name}
                    onChange={
                      handleSupplierChange
                    }
                    placeholder="ABC Suppliers"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={supplier.email}
                    onChange={
                      handleSupplierChange
                    }
                    placeholder="supplier@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={supplier.phone}
                    onChange={
                      handleSupplierChange
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

              </div>
            </div>

            {/* Products */}
            <div className="mt-7">

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Order Items
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Select products from your inventory.
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              {/* Search */}
              <div className="relative mt-3">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search inventory products by name or SKU..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />

                {/* Search Results */}
                {search.trim() && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">

                    {loadingProducts ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-slate-500">
                        <RefreshCw
                          size={16}
                          className="animate-spin"
                        />
                        Loading products...
                      </div>
                    ) : filteredProducts.length ===
                      0 ? (
                      <div className="px-4 py-5 text-center text-sm text-slate-400">
                        No products found.
                      </div>
                    ) : (
                      filteredProducts.map(
                        (product) => {
                          const alreadyAdded =
                            items.some(
                              (item) =>
                                item.inventory ===
                                product._id
                            );

                          return (
                            <button
                              key={
                                product._id
                              }
                              type="button"
                              disabled={
                                alreadyAdded
                              }
                              onClick={() =>
                                addProduct(
                                  product
                                )
                              }
                              className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                  <Package
                                    size={17}
                                    className="text-slate-500"
                                  />
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {
                                      product.productName
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    SKU:{" "}
                                    {
                                      product.sku
                                    }
                                  </p>
                                </div>

                              </div>

                              <div className="text-right">
                                <p className="text-xs text-slate-400">
                                  Current Stock
                                </p>

                                <p className="text-sm font-medium text-slate-700">
                                  {Number(
                                    product.currentStock ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              </div>

                            </button>
                          );
                        }
                      )
                    )}

                  </div>
                )}
              </div>

              {/* Selected Items */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">

                {items.length === 0 ? (
                  <div className="px-5 py-10 text-center">

                    <Package
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No products added
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Search above to add products.
                    </p>

                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[700px] text-left">

                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">

                          <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Product
                          </th>

                          <th className="w-32 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Quantity
                          </th>

                          <th className="w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Unit Price
                          </th>

                          <th className="w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Total
                          </th>

                          <th className="w-14 px-4 py-3" />

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {items.map((item) => (
                          <tr
                            key={
                              item.inventory
                            }
                          >

                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-slate-700">
                                {
                                  item.productName
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {item.sku}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={
                                  item.quantity
                                }
                                onChange={(e) =>
                                  updateItem(
                                    item.inventory,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  item.unitPrice
                                }
                                onChange={(e) =>
                                  updateItem(
                                    item.inventory,
                                    "unitPrice",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-slate-700">
                                ₹
                                {(
                                  Number(
                                    item.quantity ||
                                      0
                                  ) *
                                  Number(
                                    item.unitPrice ||
                                      0
                                  )
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  removeProduct(
                                    item.inventory
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">

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
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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
                    setTax(
                      e.target.value
                    )
                  }
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

            </div>

            {/* Notes */}
            <div className="mt-4">

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                rows="3"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Add delivery instructions or other notes..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

            </div>

            {/* Summary */}
            <div className="mt-6 ml-auto max-w-sm rounded-2xl bg-slate-50 p-5">

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-slate-700">
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

                <span className="font-medium text-slate-700">
                  ₹
                  {numericTax.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="my-4 border-t border-slate-200" />

              <div className="flex justify-between">

                <span className="font-semibold text-slate-800">
                  Total
                </span>

                <span className="text-lg font-bold text-slate-900">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </span>

              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingProducts
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Draft
                </>
              )}

            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;