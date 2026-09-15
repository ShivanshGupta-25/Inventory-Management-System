import { FileText } from "lucide-react";

import ProductSelector from "./ProductSelector";
import StockSummary from "./StockSummary";

const STOCK_IN_REASONS = [
  "Purchase Received",
  "Customer Return",
  "Transfer In",
  "Other",
];

const STOCK_OUT_REASONS = [
  "Sale / Issue",
  "Damaged",
  "Expired",
  "Transfer Out",
  "Internal Use",
  "Other",
];

const StockOperationForm = ({
  operationType,
  products,
  selectedProduct,
  onProductChange,
  search,
  onSearchChange,
  quantity,
  onQuantityChange,
  reason,
  onReasonChange,
  notes,
  onNotesChange,
  onReview,
}) => {
  const reasons =
    operationType === "IN"
      ? STOCK_IN_REASONS
      : STOCK_OUT_REASONS;

  return (
    <div className="space-y-5">

      {/* Product */}

      <ProductSelector
        products={products}
        selectedProduct={
          selectedProduct
        }
        onChange={
          onProductChange
        }
        search={search}
        onSearchChange={
          onSearchChange
        }
      />

      {/* Product-dependent fields */}

      {selectedProduct && (
        <>

          {/* Stock Summary */}

          <StockSummary
            product={
              selectedProduct
            }
            quantity={
              quantity
            }
            operationType={
              operationType
            }
          />

          {/* Quantity */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) =>
                onQuantityChange(
                  e.target.value
                )
              }
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Reason */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Reason
            </label>

            <select
              value={reason}
              onChange={(e) =>
                onReasonChange(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select reason
              </option>

              {reasons.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Notes */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Notes

              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <div className="relative">

              <FileText
                size={15}
                className="absolute left-3 top-3 text-slate-400"
              />

              <textarea
                value={notes}
                onChange={(e) =>
                  onNotesChange(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Add additional notes..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

            </div>
          </div>

          {/* Review */}

          <button
            type="button"
            onClick={onReview}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Review Operation
          </button>

        </>
      )}

    </div>
  );
};

export default StockOperationForm;