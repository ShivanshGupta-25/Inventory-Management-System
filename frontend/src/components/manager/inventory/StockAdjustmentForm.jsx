import { useState } from "react";
import { ArrowDown, ArrowUp, RefreshCcw } from "lucide-react";

const StockAdjustmentForm = ({
  product,
  onSubmit,
  onCancel,
}) => {
  const [type, setType] = useState("Increase");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!parsedQuantity || parsedQuantity <= 0) {
      return;
    }

    onSubmit({
      type,
      quantity:
        type === "Decrease" ? -parsedQuantity : parsedQuantity,
      reason,
      reference,
    });
  };

  const adjustmentTypes = [
    {
      value: "Increase",
      label: "Increase Stock",
      description: "Add units to current inventory",
      icon: ArrowUp,
    },
    {
      value: "Decrease",
      label: "Decrease Stock",
      description: "Remove units from current inventory",
      icon: ArrowDown,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Adjustment Type
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {adjustmentTypes.map((item) => {
            const Icon = item.icon;
            const active = type === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={17} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Current stock</span>
          <span className="text-lg font-bold text-slate-900">
            {product.stock} units
          </span>
        </div>

        {quantity && Number(quantity) > 0 && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm text-slate-500">
              Stock after adjustment
            </span>

            <span className="text-lg font-bold text-blue-600">
              {Math.max(
                0,
                product.stock +
                  (type === "Decrease"
                    ? -Number(quantity)
                    : Number(quantity))
              )}{" "}
              units
            </span>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Reason
        </label>

        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          required
        >
          <option value="">Select reason</option>
          <option value="Damaged">Damaged stock</option>
          <option value="Lost">Lost stock</option>
          <option value="Found">Found stock</option>
          <option value="Manual Correction">Manual correction</option>
          <option value="Cycle Count">Cycle count</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="reference"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Reference / Note
        </label>

        <input
          id="reference"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Optional reference or note"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <RefreshCcw size={15} />
          Apply Adjustment
        </button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;