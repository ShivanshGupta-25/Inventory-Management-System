import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ManagerSidebar from "../../../components/layout/ManagerSidebar";
import ManagerHeader from "../../../components/layout/ManagerHeader";

import { getInventory } from "../../../services/inventoryService";

import { getStaffPurchaseRequestById } from "../../../services/staffPurchaseRequestApi";

import {
  createPurchaseOrderFromRequest,
} from "../../../services/managerPurchaseRequestApi";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();

  // Read requestId from:
  // /manager/purchase-requests/:requestId/create-order
  const { requestId } = useParams();

  const searchContainerRef = useRef(null);

  const [request, setRequest] = useState(null);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [inventoryError, setInventoryError] = useState("");

  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [tax, setTax] = useState(0);
  const [expectedDate, setExpectedDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");

  /*
   * Load inventory products
   */
  useEffect(() => {
    let mounted = true;

    const loadInventoryProducts = async () => {
      try {
        setLoadingProducts(true);
        setInventoryError("");

        const response = await getInventory();

        if (!mounted) return;

        console.log("Inventory API response:", response);

        const inventoryData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.inventory)
          ? response.inventory
          : Array.isArray(response?.products)
          ? response.products
          : [];

        const activeProducts = inventoryData.filter(
          (product) =>
            product &&
            (product.status === "Active" ||
              product.status === "active" ||
              !product.status)
        );

        setProducts(activeProducts);
      } catch (err) {
        console.error("Failed to load inventory products:", err);

        if (mounted) {
          setProducts([]);

          setInventoryError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load inventory products."
          );
        }
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadInventoryProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Load purchase request
   */
  useEffect(() => {
    let mounted = true;

    const loadRequest = async () => {
      if (!requestId) {
        setError("Purchase request ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getStaffPurchaseRequestById(requestId);

        if (!mounted) return;

        const requestData = response?.data || response;

        if (!requestData) {
          throw new Error("Purchase request not found.");
        }

        if (hasExistingPurchaseOrder(requestData)) {
          throw new Error(
            "A purchase order already exists for this purchase request. Duplicate orders are not allowed."
          );
        }

        if (
          String(requestData.status || "").toLowerCase() !==
          "approved"
        ) {
          throw new Error(
            "Only approved purchase requests can be converted into purchase orders."
          );
        }

        setRequest(requestData);

        const requestItems = Array.isArray(requestData.items)
          ? requestData.items
          : [];

        setItems(
          requestItems.map((item) => ({
            inventory:
              item.inventory?._id ||
              item.inventory?.id ||
              item.inventory,

            productName:
              item.productName ||
              item.inventory?.productName ||
              item.inventory?.name ||
              "Unnamed Product",

            sku:
              item.sku ||
              item.inventory?.sku ||
              "N/A",

            quantity: Number(item.quantity) || 1,

            unitPrice:
              item.unitPrice ??
              item.inventory?.purchasePrice ??
              item.inventory?.costPrice ??
              "",

            isRequested: true,
          }))
        );

        setPriority(requestData.priority || "Medium");
        setNotes(requestData.notes || "");

        // Prefill supplier information when available
        setSupplier({
          name:
            requestData.supplier?.name ||
            requestData.supplierName ||
            "",

          email:
            requestData.supplier?.email ||
            requestData.supplierEmail ||
            "",

          phone:
            requestData.supplier?.phone ||
            requestData.supplierPhone ||
            "",
        });
      } catch (err) {
        console.error("Failed to load purchase request:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load purchase request."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRequest();

    return () => {
      mounted = false;
    };
  }, [requestId]);

  /*
   * Close search dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * Filter products
   */
  const filteredProducts = useMemo(() => {
    const searchValue = String(search || "")
      .toLowerCase()
      .trim();

    if (!searchValue) {
      return products;
    }

    return products.filter((product) => {
      const productName = String(
        product.productName || product.name || ""
      ).toLowerCase();

      const sku = String(product.sku || "").toLowerCase();

      const category = String(
        product.category || ""
      ).toLowerCase();

      return (
        productName.includes(searchValue) ||
        sku.includes(searchValue) ||
        category.includes(searchValue)
      );
    });
  }, [products, search]);

  /*
   * Currency formatter
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  // Supports the common backend field names used to link a request to a PO.
  const hasExistingPurchaseOrder = (purchaseRequest) =>
    Boolean(
      purchaseRequest?.purchaseOrder ||
        purchaseRequest?.purchaseOrderId ||
        purchaseRequest?.convertedToPurchaseOrder ||
        purchaseRequest?.convertedToPurchaseOrderId
    );

  /*
   * Supplier field changes
   */
  const handleSupplierChange = (event) => {
    const { name, value } = event.target;

    setSupplier((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Add inventory product
   */
  const addProduct = (product) => {
    if (!product?._id) {
      setError("Invalid inventory product selected.");
      return;
    }

    const alreadyAdded = items.some(
      (item) => item.inventory === product._id
    );

    if (alreadyAdded) {
      return;
    }

    setItems((previousItems) => [
      ...previousItems,
      {
        inventory: product._id,
        productName:
          product.productName || product.name || "Unnamed Product",
        sku: product.sku || "N/A",
        quantity: 1,
        unitPrice:
          Number(
            product.purchasePrice ?? product.costPrice ?? 0
          ) || 0,
        isRequested: false,
      },
    ]);

    setSearch("");
    setSearchFocused(false);
    setError("");
  };

  /*
   * Remove only additional products
   */
  const removeProduct = (inventoryId) => {
    setItems((previousItems) =>
      previousItems.filter(
        (item) =>
          item.inventory !== inventoryId ||
          item.isRequested
      )
    );
  };

  /*
   * Update quantity of additional products
   */
  const updateItemQuantity = (inventoryId, value) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.inventory === inventoryId && !item.isRequested
          ? {
              ...item,
              quantity: value,
            }
          : item
      )
    );
  };

  /*
   * Update item price
   */
  const updateItemPrice = (index, value) => {
    setItems((previousItems) =>
      previousItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              unitPrice: value,
            }
          : item
      )
    );
  };

  /*
   * Financial calculations
   */
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;

      return sum + quantity * unitPrice;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return (subtotal * (Number(tax) || 0)) / 100;
  }, [subtotal, tax]);

  const totalAmount = subtotal + taxAmount;

  /*
   * Submit purchase order
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!requestId) {
      setError("Purchase request ID is missing.");
      return;
    }

    if (hasExistingPurchaseOrder(request)) {
      setError(
        "A purchase order already exists for this request. Duplicate orders are not allowed."
      );
      return;
    }

    if (!supplier.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    if (items.length === 0) {
      setError("At least one product is required.");
      return;
    }

    const invalidQuantityItem = items.find((item) => {
      const quantity = Number(item.quantity);

      return (
        !Number.isInteger(quantity) ||
        quantity <= 0
      );
    });

    if (invalidQuantityItem) {
      setError(
        `Enter a valid whole-number quantity for ${invalidQuantityItem.productName}.`
      );
      return;
    }

    const invalidPriceItem = items.find((item) => {
      const price = Number(item.unitPrice);

      return (
        item.unitPrice === "" ||
        !Number.isFinite(price) ||
        price < 0
      );
    });

    if (invalidPriceItem) {
      setError(
        `Enter a valid unit price for ${invalidPriceItem.productName}.`
      );
      return;
    }

    const numericTax = Number(tax);

    if (
      !Number.isFinite(numericTax) ||
      numericTax < 0
    ) {
      setError("Enter a valid tax percentage.");
      return;
    }

    try {
      setSaving(true);

      await createPurchaseOrderFromRequest(requestId, {
        supplier: {
          name: supplier.name.trim(),
          email: supplier.email.trim(),
          phone: supplier.phone.trim(),
        },

        items: items.map((item) => ({
          inventory: item.inventory,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),

        tax: numericTax,
        expectedDate: expectedDate || null,
        priority,
        notes: notes.trim(),
      });

      navigate("/manager/purchase-requests", {
        replace: true,
        state: {
          successMessage:
            "Purchase Order created successfully.",
        },
      });
    } catch (err) {
      console.error("Failed to create purchase order:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create purchase order."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <ManagerSidebar />

        <main className="min-w-0 flex-1">
          <ManagerHeader />

          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <RefreshCw
                size={18}
                className="animate-spin"
              />
              Loading purchase request...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ManagerSidebar />

      <main className="min-w-0 flex-1">
        <ManagerHeader />

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">

            {/* Back Navigation */}
            <button
              type="button"
              onClick={() =>
                navigate("/manager/purchase-requests")
              }
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              <ArrowLeft size={18} />
              Back to Purchase Requests
            </button>

            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <ShoppingCart size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Create Purchase Order
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Convert an approved purchase request into a purchase order.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                Manager Panel
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <X
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {hasExistingPurchaseOrder(request) && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Purchase order already created</p>
                  <p className="mt-1">This request cannot be converted again. Return to Purchase Requests to view the existing order.</p>
                </div>
              </div>
            )}

            {/* Request Summary */}
            {request && (
              <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Purchase Request
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {request.orderNumber ||
                        request.requestNumber ||
                        request._id}
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    {request.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      Requested By
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {request.createdBy?.name ||
                        request.requestedBy?.name ||
                        "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Priority
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {request.priority || "Medium"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Requested Items
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {request.items?.length || 0}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Supplier Information */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Supplier Information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the supplier details for this purchase order.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Supplier Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      required
                      value={supplier.name}
                      onChange={handleSupplierChange}
                      placeholder="Enter supplier name"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Supplier Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={supplier.email}
                      onChange={handleSupplierChange}
                      placeholder="supplier@example.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Supplier Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={supplier.phone}
                      onChange={handleSupplierChange}
                      placeholder="Enter phone number"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </section>

              {/* Products */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package
                        size={20}
                        className="text-indigo-600"
                      />

                      <h2 className="text-lg font-semibold text-slate-900">
                        Order Items
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Approved items are prefilled. Additional inventory products can be added.
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {items.length}{" "}
                    {items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* Inventory Search */}
                <div
                  ref={searchContainerRef}
                  className="relative"
                >
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setSearchFocused(true);
                      }}
                      onFocus={() => setSearchFocused(true)}
                      placeholder="Search by product name, SKU, or category..."
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <ChevronDown
                      size={17}
                      className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition ${
                        searchFocused ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Search Dropdown */}
                  {searchFocused && (
                    <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                      {loadingProducts ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-500">
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Loading inventory...
                        </div>
                      ) : inventoryError ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-red-500">
                            {inventoryError}
                          </p>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <Package
                            size={22}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-2 text-sm font-medium text-slate-600">
                            No products found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Try another product name or SKU.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Inventory Products
                            </p>
                          </div>

                          {filteredProducts.map((product) => {
                            const alreadyAdded = items.some(
                              (item) =>
                                item.inventory === product._id
                            );

                            const availableStock = Math.max(
                              0,
                              Number(product.currentStock || 0) -
                                Number(product.reservedStock || 0)
                            );

                            return (
                              <button
                                key={product._id}
                                type="button"
                                disabled={alreadyAdded}
                                onClick={() => addProduct(product)}
                                className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50"
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                    <Package
                                      size={18}
                                      className="text-slate-500"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                      {product.productName ||
                                        product.name ||
                                        "Unnamed Product"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                      SKU: {product.sku || "N/A"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      {product.category ||
                                        "Uncategorized"}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <p className="text-xs text-slate-400">
                                    Available
                                  </p>

                                  <p
                                    className={`text-sm font-semibold ${
                                      availableStock === 0
                                        ? "text-red-500"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {availableStock.toLocaleString("en-IN")}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    {alreadyAdded
                                      ? "Already added"
                                      : "Click to add"}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Items */}
                <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                  {items.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <Package
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No products added
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Search inventory above to add products.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[850px] text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Product
                            </th>

                            <th className="w-32 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Quantity
                            </th>

                            <th className="w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Unit Price
                            </th>

                            <th className="w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Total
                            </th>

                            <th className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Type
                            </th>

                            <th className="w-14 px-4 py-3" />
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {items.map((item, index) => {
                            const itemTotal =
                              (Number(item.quantity) || 0) *
                              (Number(item.unitPrice) || 0);

                            return (
                              <tr
                                key={`${item.inventory}-${index}`}
                                className="transition hover:bg-slate-50"
                              >
                                <td className="px-4 py-4">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.productName}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    SKU: {item.sku}
                                  </p>
                                </td>

                                <td className="px-4 py-4">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={item.quantity}
                                    readOnly={item.isRequested}
                                    onChange={(event) =>
                                      updateItemQuantity(
                                        item.inventory,
                                        event.target.value
                                      )
                                    }
                                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                                      item.isRequested
                                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600"
                                        : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    }`}
                                  />
                                </td>

                                <td className="px-4 py-4">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={item.unitPrice}
                                    onChange={(event) =>
                                      updateItemPrice(
                                        index,
                                        event.target.value
                                      )
                                    }
                                    placeholder="0.00"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                  />
                                </td>

                                <td className="px-4 py-4">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {formatCurrency(itemTotal)}
                                  </p>
                                </td>

                                <td className="px-4 py-4">
                                  {item.isRequested ? (
                                    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                      Requested
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                      Added
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-4 text-right">
                                  {item.isRequested ? (
                                    <span className="text-xs text-slate-300">
                                      Fixed
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeProduct(item.inventory)
                                      }
                                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                      aria-label={`Remove ${item.productName}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
                  <Plus
                    size={14}
                    className="mt-0.5 shrink-0 text-indigo-500"
                  />

                  <p>
                    Approved request items are locked. Additional products can be added or removed.
                  </p>
                </div>
              </section>

              {/* Order Details */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-5 text-lg font-semibold text-slate-900">
                  Order Details
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tax (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={(event) =>
                        setTax(event.target.value)
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Expected Delivery Date
                    </label>

                    <div className="relative">
                      <Calendar
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        value={expectedDate}
                        onChange={(event) =>
                          setExpectedDate(event.target.value)
                        }
                        min={new Date()
                          .toISOString()
                          .split("T")[0]}
                        className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Priority
                    </label>

                    <select
                      value={priority}
                      onChange={(event) =>
                        setPriority(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value)
                    }
                    placeholder="Add purchase order notes..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </section>

              {/* Financial Summary */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="ml-auto max-w-sm space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>

                    <span className="font-medium text-slate-800">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-600">
                    <span>
                      Tax ({Number(tax) || 0}%)
                    </span>

                    <span className="font-medium text-slate-800">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-900">
                        Total Amount
                      </span>

                      <span className="text-xl font-bold text-indigo-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer Actions */}
              <div className="flex flex-col-reverse justify-end gap-3 pb-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/manager/purchase-requests")
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingProducts ||
                    items.length === 0 ||
                    hasExistingPurchaseOrder(request)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Create Purchase Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePurchaseOrder;