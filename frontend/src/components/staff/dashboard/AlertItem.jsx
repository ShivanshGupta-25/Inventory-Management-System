import { AlertTriangle } from "lucide-react";

const AlertItem = ({ alert }) => {
  const title =
    alert.title ||
    alert.message ||
    alert.type ||
    "Inventory alert";

  const description =
    alert.description ||
    alert.productName ||
    "Inventory requires attention.";

  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
        <AlertTriangle size={15} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default AlertItem;