import {
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const OperationRow = ({
  movement,
}) => {
  const isIn =
    movement.type === "IN";

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isIn
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isIn ? (
            <ArrowDownToLine size={15} />
          ) : (
            <ArrowUpFromLine size={15} />
          )}
        </div>

        <div className="min-w-0">
          {/* Product name */}
          <p className="truncate text-xs font-semibold text-slate-700">
            {movement.product?.productName ||
              "Unknown Product"}
          </p>

          {/* Operation type + reason */}
          <p className="mt-1 text-[10px] text-slate-400">
            {movement.type} ·{" "}
            {movement.reason}
          </p>

          {/* Performed by */}
          {movement.performedBy?.name && (
            <p className="mt-1 text-[10px] text-slate-400">
              By {movement.performedBy.name}
            </p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="shrink-0 text-right">
        {/* Quantity */}
        <p
          className={`text-xs font-bold ${
            isIn
              ? "text-emerald-600"
              : "text-slate-700"
          }`}
        >
          {isIn ? "+" : "-"}
          {movement.quantity}
        </p>

        {/* Date */}
        <p className="mt-1 text-[10px] text-slate-400">
          {new Date(
            movement.createdAt
          ).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
};

export default OperationRow;