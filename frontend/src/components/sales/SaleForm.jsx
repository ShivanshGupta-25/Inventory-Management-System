import { Plus, Trash2 } from "lucide-react";

const SaleForm = ({
  inventory,
  items,
  setItems,
  customerName,
  setCustomerName,
  customerContact,
  setCustomerContact,
  discount,
  setDiscount,
  tax,
  setTax,
  paymentStatus,
  setPaymentStatus,
}) => {
  const addItem = () => {
    setItems([
      ...items,
      {
        inventory: "",
        quantity: 1,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
  };

  const getInventory = (id) => {
    return inventory.find(
      (product) => product._id === id
    );
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Customer Information
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              placeholder="Walk-in Customer"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Contact
            </label>

            <input
              type="text"
              value={customerContact}
              onChange={(e) =>
                setCustomerContact(e.target.value)
              }
              placeholder="Customer contact"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select products from current inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={17} />
            Add Product
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {items.map((item, index) => {
            const product = getInventory(
              item.inventory
            );

            const availableStock = product
              ? Math.max(
                  0,
                  product.currentStock -
                    product.reservedStock
                )
              : 0;

            const lineTotal = product
              ? product.sellingPrice *
                Number(item.quantity || 0)
              : 0;

            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_140px_140px_40px] md:items-end">
                  {/* Product */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Product
                    </label>

                    <select
                      value={item.inventory}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "inventory",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
                    >
                      <option value="">
                        Select product
                      </option>

                      {inventory.map((product) => {
                        const available =
                          product.currentStock -
                          product.reservedStock;

                        return (
                          <option
                            key={product._id}
                            value={product._id}
                            disabled={available <= 0}
                          >
                            {product.productName} (
                            {product.sku}) — Stock:{" "}
                            {Math.max(0, available)}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={availableStock || undefined}
                      value={item.quantity}
                      disabled={!product}
                      onChange={(e) => {
                        let value =
                          Number(e.target.value);

                        if (value < 1) value = 1;

                        if (
                          product &&
                          value > availableStock
                        ) {
                          value = availableStock;
                        }

                        updateItem(
                          index,
                          "quantity",
                          value
                        );
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500 disabled:bg-gray-50"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Line Total
                    </label>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-900">
                      ₹
                      {lineTotal.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                    className="mb-0.5 rounded-lg p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {product && (
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>
                      SKU:{" "}
                      <strong className="text-gray-700">
                        {product.sku}
                      </strong>
                    </span>

                    <span>
                      Selling Price:{" "}
                      <strong className="text-gray-700">
                        ₹
                        {product.sellingPrice.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </span>

                    <span>
                      Available Stock:{" "}
                      <strong className="text-gray-700">
                        {availableStock}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Payment
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Discount
            </label>

            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tax
            </label>

            <input
              type="number"
              min="0"
              value={tax}
              onChange={(e) =>
                setTax(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleForm;