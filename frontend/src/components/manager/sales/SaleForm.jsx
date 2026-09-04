import { useMemo, useState } from "react";
import {
  CreditCard,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { productData } from "../../../data/productData";
import SaleItemsTable from "./SaleItemsTable";

const SaleForm = ({ onSubmit, onCancel }) => {
  const [customer, setCustomer] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [items, setItems] = useState([]);

  const availableProducts = productData.filter(
    (product) =>
      product.status === "Active" &&
      product.stock > 0 &&
      !items.some(
        (item) => item.productId === product.id
      )
  );

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [items]);

  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Number(discount) || 0)
  );

  const taxableAmount = subtotal - discountAmount;

  const taxAmount =
    taxableAmount * ((Number(tax) || 0) / 100);

  const grandTotal = taxableAmount + taxAmount;

  const addProduct = () => {
    if (!selectedProduct) return;

    const product = productData.find(
      (item) => String(item.id) === String(selectedProduct)
    );

    if (!product) return;

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        availableStock: product.stock,
        quantity: 1,
      },
    ]);

    setSelectedProduct("");
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const safeQuantity = Math.max(
          1,
          Math.min(
            quantity || 1,
            item.availableStock
          )
        );

        return {
          ...item,
          quantity: safeQuantity,
        };
      })
    );
  };

  const removeProduct = (productId) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.productId !== productId
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customer.trim() || !items.length) {
      return;
    }

    onSubmit({
      customer,
      customerEmail,
      customerPhone,
      paymentMethod,
      paymentStatus:
        paymentMethod === "Cash"
          ? "Pending"
          : "Paid",
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Customer */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Customer Information
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Enter the customer details for this sale.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Customer / Company
            </label>

            <input
              value={customer}
              onChange={(e) =>
                setCustomer(e.target.value)
              }
              placeholder="Enter customer name"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={customerEmail}
              onChange={(e) =>
                setCustomerEmail(e.target.value)
              }
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value)
              }
              placeholder="+91 XXXXX XXXXX"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Sale Items
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select the products being sold.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedProduct}
              onChange={(e) =>
                setSelectedProduct(e.target.value)
              }
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select a product
              </option>

              {availableProducts.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} — ₹
                  {product.price.toLocaleString("en-IN")} (
                  {product.stock} available)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={addProduct}
              disabled={!selectedProduct}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          <div className="mt-4">
            <SaleItemsTable
              items={items}
              onQuantityChange={updateQuantity}
              onRemove={removeProduct}
            />
          </div>
        </div>
      </div>

      {/* Payment & totals */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <CreditCard size={17} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Payment
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select the payment method.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>UPI</option>
              <option>Card</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Order Summary
            </h2>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-medium text-slate-800">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-slate-500">
                Discount
              </label>

              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value)
                }
                className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-right text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-sm text-slate-500">
                Tax (%)
              </label>

              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) =>
                  setTax(e.target.value)
                }
                className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-right text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Total
                </span>

                <span className="text-xl font-bold text-slate-900">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!customer.trim() || !items.length}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={16} />
          Create Sale
        </button>
      </div>
    </form>
  );
};

export default SaleForm;