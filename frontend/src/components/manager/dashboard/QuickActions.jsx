import {
  Plus,
  ClipboardEdit,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    title: "Add Product",
    description: "Add a new inventory item",
    icon: Plus,
    path: "/manager/inventory",
    iconStyle:
      "bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700",
  },
  {
    title: "Alerts",
    description: "Update inventory quantity",
    icon: ClipboardEdit,
    path: "/manager/analytics",
    iconStyle:
      "bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:text-amber-700",
  },
  {
    title: "Purchase Order",
    description: "Create a new purchase order",
    icon: ShoppingCart,
    path: "/manager/purchase-orders",
    iconStyle:
      "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700",
  },
  {
    title: "Create Sale",
    description: "Record a new sale",
    icon: Receipt,
    path: "/manager/sales/create",
    iconStyle:
      "bg-violet-50 text-violet-600 group-hover:bg-violet-100 group-hover:text-violet-700",
  },
];

const QuickActions = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Frequently used actions
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.path}
              className="group rounded-lg border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {/* Icon */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${action.iconStyle}`}
              >
                <Icon size={16} />
              </div>

              {/* Content */}
              <p className="mt-3 text-xs font-semibold leading-4 text-slate-700">
                {action.title}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;