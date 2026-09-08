import { useEffect, useState } from "react";
import { X, Save, Package } from "lucide-react";

const EditProductModal = ({
  product,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [form, setForm] = useState({
    productName: "",
    sku: "",
    category: "",
    brand: "",
    unit: "pcs",
    purchasePrice: "",
    sellingPrice: "",
    minStock: "",
    maxStock: "",
    warehouse: "",
    status: "Active",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!product) return;

    setForm({
      productName: product.productName || "",
      sku: product.sku || "",
      category: product.category || "",
      brand: product.brand || "",
      unit: product.unit || "pcs",
      purchasePrice: product.purchasePrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      minStock: product.minStock ?? "",
      maxStock: product.maxStock ?? "",
      warehouse:
        product.warehouse || "Main Warehouse",
      status: product.status || "Active",
    });
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !form.productName.trim() ||
      !form.sku.trim() ||
      !form.category.trim()
    ) {
      setError(
        "Product name, SKU and category are required."
      );
      return;
    }

    const purchasePrice = Number(
      form.purchasePrice
    );

    const sellingPrice = Number(
      form.sellingPrice
    );

    const minStock = Number(form.minStock);
    const maxStock = Number(form.maxStock);

    if (
      Number.isNaN(purchasePrice) ||
      purchasePrice < 0
    ) {
      setError("Enter a valid purchase price.");
      return;
    }

    if (
      Number.isNaN(sellingPrice) ||
      sellingPrice < 0
    ) {
      setError("Enter a valid selling price.");
      return;
    }

    if (
      Number.isNaN(minStock) ||
      minStock < 0
    ) {
      setError("Enter a valid minimum stock.");
      return;
    }

    if (
      Number.isNaN(maxStock) ||
      maxStock < minStock
    ) {
      setError(
        "Maximum stock must be greater than or equal to minimum stock."
      );
      return;
    }

    await onSubmit({
      productName: form.productName.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      unit: form.unit,
      purchasePrice,
      sellingPrice,
      minStock,
      maxStock,
      warehouse: form.warehouse.trim(),
      status: form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Package
                size={20}
                className="text-slate-700"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Edit Product
              </h2>

              <p className="text-xs text-slate-500">
                Update product information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Product Name
              </label>

              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                SKU
              </label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU-001"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                SKU can be updated, but must remain unique.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Category
              </label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Electronics"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Brand
              </label>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand name"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Unit
              </label>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilogram</option>
                <option value="g">Gram</option>
                <option value="l">Liter</option>
                <option value="ml">Milliliter</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Purchase Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="purchasePrice"
                value={form.purchasePrice}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Selling Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Minimum Stock */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Minimum Stock
              </label>

              <input
                type="number"
                min="0"
                name="minStock"
                value={form.minStock}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Maximum Stock */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Maximum Stock
              </label>

              <input
                type="number"
                min="0"
                name="maxStock"
                value={form.maxStock}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Warehouse
              </label>

              <input
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {/* Notice */}
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs leading-5 text-slate-500">
              Current stock is not editable here. Use
              <span className="font-semibold text-slate-700">
                {" "}
                Adjust Stock{" "}
              </span>
              to record stock changes and maintain the movement history.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;