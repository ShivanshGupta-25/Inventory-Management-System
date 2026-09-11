import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Trash2,
  Package,
  User,
  CreditCard,
  FileText,
  Save,
  ShoppingCart,
} from "lucide-react";

import { getInventory } from "../../../services/inventoryService";

const createEmptyItem = () => ({
  inventory: "",
  productName: "",
  sku: "",
  quantity: 1,
  sellingPrice: 0,
  totalPrice: 0,
});

const normalizeItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [createEmptyItem()];
  }

  return items.map((item) => ({
    inventory:
      item.inventory?._id ||
      item.inventory ||
      "",

    productName:
      item.productName || "",

    sku:
      item.sku || "",

    quantity:
      Number(item.quantity || 1),

    sellingPrice:
      Number(item.sellingPrice || 0),

    totalPrice:
      Number(item.totalPrice || 0),
  }));
};

const SaleForm = ({
  mode = "create",
  initialData = {},
  inventory: inventoryProp,
  onSubmit,
  loading = false,
  submitLabel = "Create Sale",
}) => {
  /* =====================================================
     INVENTORY
  ===================================================== */

  const [inventory, setInventory] = useState(
    Array.isArray(inventoryProp)
      ? inventoryProp
      : []
  );

  const [inventoryLoading, setInventoryLoading] =
    useState(false);

  const [inventoryError, setInventoryError] =
    useState("");

  /*
   * If inventory is passed by parent,
   * use it.
   */
  useEffect(() => {
    if (Array.isArray(inventoryProp)) {
      setInventory(inventoryProp);
    }
  }, [inventoryProp]);

  /*
   * Fetch inventory ONCE when the form mounts.
   *
   * This is intentionally [].
   * Do NOT add inventoryProp here.
   */
  useEffect(() => {
    /*
     * Parent already provided inventory.
     */
    if (
      Array.isArray(inventoryProp) &&
      inventoryProp.length > 0
    ) {
      return;
    }

    let cancelled = false;

    const loadInventory = async () => {
      try {
        setInventoryLoading(true);
        setInventoryError("");

        const response =
          await getInventory();

        if (cancelled) {
          return;
        }

        const products =
          Array.isArray(response?.data)
            ? response.data
            : [];

        setInventory(products);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load inventory:",
          error
        );

        setInventoryError(
          error.response?.data?.message ||
            "Failed to load inventory products"
        );
      } finally {
        if (!cancelled) {
          setInventoryLoading(false);
        }
      }
    };

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     CUSTOMER
  ===================================================== */

  const [customerName, setCustomerName] =
    useState(
      initialData.customerName ||
        "Walk-in Customer"
    );

  const [customerContact, setCustomerContact] =
    useState(
      initialData.customerContact || ""
    );

  /* =====================================================
     FINANCIAL
  ===================================================== */

  const [discount, setDiscount] =
    useState(
      Number(initialData.discount || 0)
    );

  const [tax, setTax] =
    useState(
      Number(initialData.tax || 0)
    );

  const [paidAmount, setPaidAmount] =
    useState(
      Number(initialData.paidAmount || 0)
    );

  const [paymentMethod, setPaymentMethod] =
    useState(
      initialData.paymentMethod ||
        "Cash"
    );

  const [notes, setNotes] =
    useState(
      initialData.notes || ""
    );

  /* =====================================================
     ITEMS
  ===================================================== */

  const [items, setItems] =
    useState(
      normalizeItems(
        initialData.items
      )
    );

  /*
   * Keep original items only for edit mode.
   */
  const originalItems =
    initialData.items || [];

  /* =====================================================
     PRODUCT HELPERS
  ===================================================== */

  const getProduct = (id) => {
    if (!id) {
      return null;
    }

    return inventory.find(
      (product) =>
        String(product._id) ===
        String(id)
    );
  };

  const getOriginalQuantity = (
    productId
  ) => {
    if (mode !== "edit") {
      return 0;
    }

    const original =
      originalItems.find(
        (item) =>
          String(
            item.inventory?._id ||
              item.inventory
          ) ===
          String(productId)
      );

    return Number(
      original?.quantity || 0
    );
  };

  const getAvailableQuantity = (
    product
  ) => {
    if (!product) {
      return 0;
    }

    const currentStock =
      Number(
        product.currentStock || 0
      );

    const reservedStock =
      Number(
        product.reservedStock || 0
      );

    let available =
      currentStock -
      reservedStock;

    /*
     * In edit mode, return the original
     * quantity to available stock.
     */
    if (mode === "edit") {
      available +=
        getOriginalQuantity(
          product._id
        );
    }

    return Math.max(
      0,
      available
    );
  };

  /* =====================================================
     SUBTOTAL
  ===================================================== */

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => {
        const product =
          getProduct(
            item.inventory
          );

        if (!product) {
          return total;
        }

        return (
          total +
          Number(
            product.sellingPrice || 0
          ) *
            Number(
              item.quantity || 0
            )
        );
      },
      0
    );
  }, [items, inventory]);

  /* =====================================================
     TOTAL
  ===================================================== */

  const totalAmount =
    Math.max(
      0,
      subtotal -
        Number(discount || 0) +
        Number(tax || 0)
    );

  const outstandingAmount =
    Math.max(
      0,
      totalAmount -
        Number(paidAmount || 0)
    );

  /* =====================================================
     PAYMENT STATUS
  ===================================================== */

  const paymentStatus =
    Number(paidAmount || 0) <= 0
      ? "Pending"
      : Number(paidAmount || 0) >=
        totalAmount
      ? "Paid"
      : "Partial";

  /* =====================================================
     ADD ITEM
  ===================================================== */

  const addItem = () => {
    setItems((current) => [
      ...current,
      createEmptyItem(),
    ]);
  };

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =====================================================
     PRODUCT SELECTION
  ===================================================== */

  const handleProductChange = (
    index,
    productId
  ) => {
    const product =
      getProduct(productId);

    if (!productId || !product) {
      setItems((current) =>
        current.map(
          (item, i) =>
            i === index
              ? createEmptyItem()
              : item
        )
      );

      return;
    }

    const available =
      getAvailableQuantity(
        product
      );

    if (available <= 0) {
      return;
    }

    setItems((current) =>
      current.map(
        (item, i) => {
          if (i !== index) {
            return item;
          }

          const quantity = Math.min(
            Math.max(
              1,
              Number(
                item.quantity || 1
              )
            ),
            available
          );

          const sellingPrice =
            Number(
              product.sellingPrice ||
                0
            );

          return {
            ...item,

            inventory:
              product._id,

            productName:
              product.productName,

            sku:
              product.sku,

            quantity,

            sellingPrice,

            totalPrice:
              sellingPrice *
              quantity,
          };
        }
      )
    );
  };

  /* =====================================================
     QUANTITY CHANGE
  ===================================================== */

  const handleQuantityChange = (
    index,
    value
  ) => {
    const product =
      getProduct(
        items[index]?.inventory
      );

    if (!product) {
      return;
    }

    const available =
      getAvailableQuantity(
        product
      );

    let quantity =
      Number(value);

    if (!Number.isFinite(quantity)) {
      quantity = 1;
    }

    quantity = Math.max(
      1,
      Math.floor(quantity)
    );

    quantity = Math.min(
      quantity,
      available
    );

    setItems((current) =>
      current.map(
        (item, i) =>
          i === index
            ? {
                ...item,
                quantity,
                totalPrice:
                  Number(
                    product.sellingPrice ||
                      0
                  ) * quantity,
              }
            : item
      )
    );
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    /* ---------------------------------------------
       Validate products
    --------------------------------------------- */

    if (
      !items.length ||
      items.some(
        (item) =>
          !item.inventory
      )
    ) {
      setInventoryError(
        "Please select a product for every sale item."
      );

      return;
    }

    /* ---------------------------------------------
       Validate quantities
    --------------------------------------------- */

    for (const item of items) {
      const product =
        getProduct(
          item.inventory
        );

      if (!product) {
        setInventoryError(
          `Product ${item.sku || ""} is no longer available.`
        );

        return;
      }

      const available =
        getAvailableQuantity(
          product
        );

      if (
        Number(item.quantity) >
        available
      ) {
        setInventoryError(
          `${product.productName} has only ${available} units available.`
        );

        return;
      }
    }

    /* ---------------------------------------------
       Validate discount
    --------------------------------------------- */

    if (
      Number(discount || 0) >
      subtotal
    ) {
      setInventoryError(
        "Discount cannot be greater than subtotal."
      );

      return;
    }

    /* ---------------------------------------------
       Validate paid amount
    --------------------------------------------- */

    if (
      Number(paidAmount || 0) >
      totalAmount
    ) {
      setInventoryError(
        "Paid amount cannot be greater than the total amount."
      );

      return;
    }

    setInventoryError("");

    /* ---------------------------------------------
       Build backend payload
    --------------------------------------------- */

    const cleanItems =
      items.map((item) => {
        const product =
          getProduct(
            item.inventory
          );

        const quantity =
          Number(
            item.quantity
          );

        const sellingPrice =
          Number(
            product.sellingPrice
          );

        return {
          inventory:
            product._id,

          productName:
            product.productName,

          sku:
            product.sku,

          quantity,

          sellingPrice,

          totalPrice:
            sellingPrice *
            quantity,
        };
      });

    onSubmit({
      customerName:
        customerName.trim() ||
        "Walk-in Customer",

      customerContact:
        customerContact.trim(),

      discount:
        Number(discount || 0),

      tax:
        Number(tax || 0),

      paidAmount:
        Number(
          paidAmount || 0
        ),

      paymentMethod,

      notes:
        notes.trim(),

      items: cleanItems,
    });
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* =================================================
          CUSTOMER
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <User
                size={18}
                className="text-slate-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Customer Information
              </h2>

              <p className="text-xs text-slate-500">
                Enter customer details for this sale
              </p>
            </div>

          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              placeholder="Walk-in Customer"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Contact Number
            </label>

            <input
              type="tel"
              value={customerContact}
              onChange={(e) =>
                setCustomerContact(
                  e.target.value
                )
              }
              placeholder="Customer phone number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

        </div>
      </section>

      {/* =================================================
          SALE ITEMS
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <ShoppingCart
                size={18}
                className="text-slate-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Sale Items
              </h2>

              <p className="text-xs text-slate-500">
                Select products and quantities
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={addItem}
            disabled={
              inventoryLoading ||
              inventory.length === 0
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add Item
          </button>

        </div>

        {/* Error */}

        {inventoryError && (
          <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {inventoryError}
          </div>
        )}

        {/* Loading */}

        {inventoryLoading && (
          <div className="mx-5 mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Loading inventory products...
          </div>
        )}

        {/* No products */}

        {!inventoryLoading &&
          !inventoryError &&
          inventory.length === 0 && (
            <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No inventory products are available.
            </div>
          )}

        <div className="space-y-4 p-5">

          {items.map(
            (item, index) => {
              const product =
                getProduct(
                  item.inventory
                );

              const available =
                getAvailableQuantity(
                  product
                );

              const lineTotal =
                product
                  ? Number(
                      product.sellingPrice ||
                        0
                    ) *
                    Number(
                      item.quantity ||
                        0
                    )
                  : 0;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >

                  {/* Main row */}

                  <div className="grid gap-4 md:grid-cols-[1fr_170px_150px_44px] md:items-end">

                    {/* PRODUCT */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Product
                      </label>

                      <select
                        value={
                          item.inventory
                        }
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            e.target.value
                          )
                        }
                        disabled={
                          inventoryLoading
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                      >

                        <option value="">
                          {inventoryLoading
                            ? "Loading products..."
                            : "Select product"}
                        </option>

                        {inventory.map(
                          (product) => {
                            const available =
                              getAvailableQuantity(
                                product
                              );

                            const selected =
                              String(
                                product._id
                              ) ===
                              String(
                                item.inventory
                              );

                            return (
                              <option
                                key={
                                  product._id
                                }
                                value={
                                  product._id
                                }
                                disabled={
                                  available <=
                                    0 &&
                                  !selected
                                }
                              >
                                {
                                  product.productName
                                }{" "}
                                —{" "}
                                {
                                  product.sku
                                }{" "}
                                — ₹
                                {Number(
                                  product.sellingPrice ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                — Stock:{" "}
                                {
                                  available
                                }
                              </option>
                            );
                          }
                        )}

                      </select>

                    </div>

                    {/* QUANTITY */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        max={
                          product
                            ? available
                            : undefined
                        }
                        value={
                          item.quantity
                        }
                        disabled={
                          !product
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-100"
                      />

                      {product && (
                        <p className="mt-1 text-xs text-slate-400">
                          Available:{" "}
                          {
                            available
                          }
                        </p>
                      )}

                    </div>

                    {/* UNIT PRICE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Unit Price
                      </label>

                      <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                        ₹
                        {Number(
                          product?.sellingPrice ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      disabled={
                        items.length ===
                        1
                      }
                      title="Remove item"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>

                  </div>

                  {/* PRODUCT DETAILS */}

                  {product && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Product
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {
                              product.productName
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            SKU
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {
                              product.sku
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Category
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {
                              product.category ||
                              "—"
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Available Stock
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {
                              available
                            }
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                        <span className="text-sm text-slate-500">
                          Line Total
                        </span>

                        <span className="text-base font-bold text-slate-900">
                          ₹
                          {lineTotal.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>
      </section>

      {/* =================================================
          PAYMENT
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <CreditCard
                size={18}
                className="text-slate-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Payment
              </h2>

              <p className="text-xs text-slate-500">
                Record payment received for this sale
              </p>
            </div>

          </div>

        </div>

        <div className="grid gap-5 p-5 md:grid-cols-3">

          {/* Amount Paid */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amount Paid
            </label>

            <input
              type="number"
              min="0"
              max={totalAmount}
              value={
                paidAmount
              }
              disabled={
                mode === "edit"
              }
              onChange={(e) =>
                setPaidAmount(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:bg-slate-100"
            />

          </div>

          {/* Payment Method */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Method
            </label>

            <select
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            >

              <option value="Cash">
                Cash
              </option>

              <option value="Card">
                Card
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* Payment Status */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Status
            </label>

            <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              {
                paymentStatus
              }
            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          ADJUSTMENTS & NOTES
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <FileText
                size={18}
                className="text-slate-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Adjustments & Notes
              </h2>
            </div>

          </div>

        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">

          {/* Discount */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Discount
            </label>

            <input
              type="number"
              min="0"
              value={
                discount
              }
              onChange={(e) =>
                setDiscount(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />

          </div>

          {/* Tax */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tax
            </label>

            <input
              type="number"
              min="0"
              value={
                tax
              }
              onChange={(e) =>
                setTax(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />

          </div>

          {/* Notes */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes
            </label>

            <textarea
              rows="3"
              value={
                notes
              }
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Add any notes about this sale..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />

          </div>

        </div>
      </section>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">

          <div className="flex items-start gap-3 text-sm text-slate-500">

            <Package
              size={18}
              className="mt-0.5"
            />

            <div>

              <p className="font-medium text-slate-700">
                Inventory will be updated automatically
              </p>

              <p className="mt-1">
                The system will validate stock again on the server before saving the sale.
              </p>

            </div>

          </div>

          <div className="rounded-xl bg-slate-50 p-5">

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-slate-800">
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="font-medium text-slate-800">
                  - ₹
                  {Number(
                    discount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Tax
                </span>

                <span className="font-medium text-slate-800">
                  ₹
                  {Number(
                    tax || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">

                <div className="flex justify-between">

                  <span className="font-semibold text-slate-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Paid
                </span>

                <span className="font-medium text-emerald-600">
                  ₹
                  {Number(
                    paidAmount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Outstanding
                </span>

                <span className="font-semibold text-amber-600">
                  ₹
                  {outstandingAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Submit */}

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">

          <button
            type="submit"
            disabled={
              loading ||
              inventoryLoading ||
              inventory.length === 0
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Save size={17} />

            {loading
              ? "Saving..."
              : submitLabel}

          </button>

        </div>

      </section>

    </form>
  );
};

export default SaleForm;