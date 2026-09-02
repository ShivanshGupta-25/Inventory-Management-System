import {
  Plus,
  ClipboardEdit,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    title: "Add Product",
    icon: Plus,
    path: "/manager/products/add",
  },
  {
    title: "Adjust Stock",
    icon: ClipboardEdit,
    path: "/manager/inventory/adjust",
  },
  {
    title: "Create Purchase Order",
    icon: ShoppingCart,
    path: "/manager/purchase-orders/create",
  },
  {
    title: "View Reports",
    icon: FileText,
    path: "/manager/reports",
  },
];

const QuickActions = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">
        Quick Actions
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        Frequently used actions
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.path}
              className="group rounded-lg border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                <Icon size={16} />
              </div>

              <p className="mt-3 text-xs font-semibold leading-5 text-slate-700">
                {action.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;