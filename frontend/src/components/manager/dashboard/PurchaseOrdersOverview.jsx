import {
  ShoppingCart,
  Clock3,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseOrdersOverview = ({ data }) => {
  if (!data) {
    return null;
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
      value || 0
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const orderStats = [
    {
      label: "Total",
      value: data.totalOrders,
      icon: ShoppingCart,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: data.pendingOrders,
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      label: "Received",
      value: data.receivedOrders,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Partial",
      value: data.partiallyReceivedOrders,
      icon: PackageCheck,
      iconStyle: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Purchase Orders
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Current purchase order status
          </p>
        </div>

        <Link
          to="/manager/purchase-orders"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-4 divide-x divide-slate-100">
        {orderStats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center px-2 py-4 text-center"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconStyle}`}
              >
                <Icon size={15} />
              </div>

              <p className="mt-2 text-lg font-bold leading-none text-slate-900">
                {formatNumber(item.value)}
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total Purchase Value */}
      <div className="mx-5 mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[10px] text-slate-400">
            Total purchase value
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {formatCurrency(data.totalValue)}
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400">
          <ShoppingCart size={16} />
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersOverview;