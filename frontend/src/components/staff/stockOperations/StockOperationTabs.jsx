import {
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const StockOperationTabs = ({
  operationType,
  onChange,
}) => {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() =>
          onChange("IN")
        }
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition ${
          operationType === "IN"
            ? "bg-white text-emerald-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <ArrowDownToLine
          size={15}
        />

        Stock In
      </button>

      <button
        type="button"
        onClick={() =>
          onChange("OUT")
        }
        className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition ${
          operationType === "OUT"
            ? "bg-white text-slate-700 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <ArrowUpFromLine
          size={15}
        />

        Stock Out
      </button>
    </div>
  );
};

export default StockOperationTabs;