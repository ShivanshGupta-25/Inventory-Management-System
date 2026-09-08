import { useState } from "react";
import { X, Package } from "lucide-react";

const initialForm = {
  productName: "",
  sku: "",
  category: "",
  brand: "",
  unit: "pcs",
  purchasePrice: "",
  sellingPrice: "",
  currentStock: "",
  minStock: "",
  maxStock: "",
  warehouse: "Main Warehouse",
};

const AddProductModal = ({
  onClose,
  onSubmit,
  loading,
}) => {
  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.productName.trim()) {
      newErrors.productName =
        "Product name is required";
    }

    if (!form.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!form.category) {
      newErrors.category =
        "Category is required";
    }

    if (
      form.purchasePrice === "" ||
      Number(form.purchasePrice) < 0
    ) {
      newErrors.purchasePrice =
        "Enter a valid purchase price";
    }

    if (
      form.sellingPrice === "" ||
      Number(form.sellingPrice) < 0
    ) {
      newErrors.sellingPrice =
        "Enter a valid selling price";
    }

    if (
      form.currentStock !== "" &&
      Number(form.currentStock) < 0
    ) {
      newErrors.currentStock =
        "Stock cannot be negative";
    }

    if (
      form.minStock !== "" &&
      Number(form.minStock) < 0
    ) {
      newErrors.minStock =
        "Minimum stock cannot be negative";
    }

    if (
      form.maxStock !== "" &&
      Number(form.maxStock) < 0
    ) {
      newErrors.maxStock =
        "Maximum stock cannot be negative";
    }

    if (
      form.minStock !== "" &&
      form.maxStock !== "" &&
      Number(form.maxStock) <
        Number(form.minStock)
    ) {
      newErrors.maxStock =
        "Maximum stock must be greater than minimum stock";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      ...form,
      productName: form.productName.trim(),
      sku: form.sku.trim().toUpperCase(),
      currentStock:
        Number(form.currentStock) || 0,
      minStock:
        Number(form.minStock) || 10,
      maxStock:
        Number(form.maxStock) || 100,
      purchasePrice:
        Number(form.purchasePrice),
      sellingPrice:
        Number(form.sellingPrice),
    });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5">
              <Package
                size={21}
                className="text-slate-700"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add Product
              </h2>

              <p className="text-sm text-slate-500">
                Add a new product to your inventory.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Product Name */}

            <div>
              <label className={labelClass}>
                Product Name *
              </label>

              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                placeholder="e.g. Laptop Pro 15"
                className={inputClass}
              />

              {errors.productName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.productName}
                </p>
              )}
            </div>

            {/* SKU */}

            <div>
              <label className={labelClass}>
                SKU *
              </label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. LP-009"
                className={inputClass}
              />

              {errors.sku && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.sku}
                </p>
              )}
            </div>

            {/* Category */}

            <div>
              <label className={labelClass}>
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select category
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Accessories">
                  Accessories
                </option>

                <option value="Office">
                  Office
                </option>

                <option value="Storage">
                  Storage
                </option>
              </select>

              {errors.category && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Brand */}

            <div>
              <label className={labelClass}>
                Brand
              </label>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. TechPro"
                className={inputClass}
              />
            </div>

            {/* Unit */}

            <div>
              <label className={labelClass}>
                Unit
              </label>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="pcs">
                  Pieces
                </option>

                <option value="box">
                  Box
                </option>

                <option value="kg">
                  Kilogram
                </option>

                <option value="liter">
                  Liter
                </option>
              </select>
            </div>

            {/* Warehouse */}

            <div>
              <label className={labelClass}>
                Warehouse
              </label>

              <input
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Purchase Price */}

            <div>
              <label className={labelClass}>
                Purchase Price *
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="purchasePrice"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass} pl-8`}
                />
              </div>

              {errors.purchasePrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.purchasePrice}
                </p>
              )}
            </div>

            {/* Selling Price */}

            <div>
              <label className={labelClass}>
                Selling Price *
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass} pl-8`}
                />
              </div>

              {errors.sellingPrice && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.sellingPrice}
                </p>
              )}
            </div>

            {/* Initial Stock */}

            <div>
              <label className={labelClass}>
                Initial Stock
              </label>

              <input
                type="number"
                min="0"
                name="currentStock"
                value={form.currentStock}
                onChange={handleChange}
                placeholder="0"
                className={inputClass}
              />

              {errors.currentStock && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.currentStock}
                </p>
              )}
            </div>

            {/* Minimum Stock */}

            <div>
              <label className={labelClass}>
                Minimum Stock
              </label>

              <input
                type="number"
                min="0"
                name="minStock"
                value={form.minStock}
                onChange={handleChange}
                placeholder="10"
                className={inputClass}
              />

              {errors.minStock && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.minStock}
                </p>
              )}
            </div>

            {/* Maximum Stock */}

            <div>
              <label className={labelClass}>
                Maximum Stock
              </label>

              <input
                type="number"
                min="0"
                name="maxStock"
                value={form.maxStock}
                onChange={handleChange}
                placeholder="100"
                className={inputClass}
              />

              {errors.maxStock && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.maxStock}
                </p>
              )}
            </div>

          </div>

          {/* Footer */}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Adding Product..."
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;