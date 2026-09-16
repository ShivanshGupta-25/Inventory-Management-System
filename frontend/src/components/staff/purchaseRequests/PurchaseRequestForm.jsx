import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Package,
} from "lucide-react";

const emptyItem = {
  inventory: "",
  quantity: 1,
};

const PurchaseRequestForm = ({
  inventories = [],
  initialData = null,
  onSubmit,
  loading = false,
}) => {
  const [expectedDate, setExpectedDate] =
    useState("");

  const [priority, setPriority] =
    useState("Medium");

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { ...emptyItem },
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initialData) return;

    setExpectedDate(
      initialData.expectedDate
        ? new Date(initialData.expectedDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setPriority(
      initialData.priority || "Medium"
    );

    setNotes(initialData.notes || "");

    if (initialData.items?.length) {
      setItems(
        initialData.items.map((item) => ({
          inventory:
            item.inventory?._id ||
            item.inventory ||
            "",
          quantity: item.quantity || 1,
        }))
      );
    }
  }, [initialData]);

  const getInventory = (id) =>
    inventories.find(
      (inventory) => inventory._id === id
    );

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      { ...emptyItem },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    setItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!items.length) {
      newErrors.items =
        "Add at least one product.";
    }

    items.forEach((item, index) => {
      if (!item.inventory) {
        newErrors[`item-${index}`] =
          "Select a product.";
      }

      if (
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        newErrors[`quantity-${index}`] =
          "Enter a valid quantity.";
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit({
      items: items.map((item) => ({
        inventory: item.inventory,
        quantity: Number(item.quantity),
      })),

      expectedDate:
        expectedDate || null,

      priority,

      notes: notes.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Request Information */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Request Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provide the reason and urgency for the
            requested stock.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          {/* Priority */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Urgent">
                Urgent
              </option>
            </select>
          </div>

          {/* Expected Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Required By
            </label>

            <input
              type="date"
              value={expectedDate}
              onChange={(event) =>
                setExpectedDate(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason / Notes
            </label>

            <textarea
              rows="4"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Explain why the stock is required..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Requested Products */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Requested Products
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the products and quantities that
              need to be replenished.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
          >
            <Plus size={17} />
            Add Product
          </button>
        </div>

        <div className="space-y-4 p-5">
          {items.map((item, index) => {
            const inventory = getInventory(
              item.inventory
            );

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_auto] lg:items-end">
                  {/* Product */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Product *
                    </label>

                    <select
                      value={item.inventory}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "inventory",
                          event.target.value
                        )
                      }
                      className={`w-full rounded-lg border ${
                        errors[`item-${index}`]
                          ? "border-red-300"
                          : "border-slate-200"
                      } bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                    >
                      <option value="">
                        Select inventory product
                      </option>

                      {inventories.map(
                        (inventory) => (
                          <option
                            key={inventory._id}
                            value={inventory._id}
                          >
                            {inventory.productName} —{" "}
                            {inventory.sku}
                          </option>
                        )
                      )}
                    </select>

                    {inventory && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          Current stock:{" "}
                          <strong className="text-slate-700">
                            {inventory.currentStock}{" "}
                            {inventory.unit || "pcs"}
                          </strong>
                        </span>

                        {inventory.minStock !==
                          undefined && (
                          <span>
                            Minimum:{" "}
                            <strong className="text-slate-700">
                              {inventory.minStock}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}

                    {errors[`item-${index}`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`item-${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Requested Quantity *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    {errors[
                      `quantity-${index}`
                    ] && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors[
                            `quantity-${index}`
                          ]
                        }
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remove product"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}

          {errors.items && (
            <p className="text-sm text-red-600">
              {errors.items}
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Package size={18} />

          {loading
            ? "Saving..."
            : "Save as Draft"}
        </button>
      </div>
    </form>
  );
};

export default PurchaseRequestForm;