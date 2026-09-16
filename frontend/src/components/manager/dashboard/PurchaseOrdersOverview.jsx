
import {
  ShoppingCart,
  Clock3,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  Truck,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseOrdersOverview = ({ data }) => {
  if (!data) {
    return null;
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
      Number(value) || 0
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderStatus = (order) => {
    const status = String(
      order.status ||
        order.orderStatus ||
        order.purchaseOrderStatus ||
        "PENDING"
    ).toUpperCase();

    switch (status) {
      case "RECEIVED":
      case "COMPLETED":
      case "DELIVERED":
        return {
          label: "Received",
          style: "bg-emerald-50 text-emerald-600",
          icon: CheckCircle2,
        };

      case "PARTIALLY_RECEIVED":
      case "PARTIAL":
        return {
          label: "Partial",
          style: "bg-violet-50 text-violet-600",
          icon: PackageCheck,
        };

      case "CANCELLED":
      case "CANCELED":
        return {
          label: "Cancelled",
          style: "bg-red-50 text-red-600",
          icon: FileText,
        };

      case "SHIPPED":
      case "IN_TRANSIT":
        return {
          label: "In Transit",
          style: "bg-blue-50 text-blue-600",
          icon: Truck,
        };

      default:
        return {
          label: "Pending",
          style: "bg-amber-50 text-amber-600",
          icon: Clock3,
        };
    }
  };

  const getOrderId = (order) => {
    return (
      order.orderNumber ||
      order.poNumber ||
      order.purchaseOrderNumber ||
      order.referenceId ||
      (order._id
        ? `#PO-${String(order._id).slice(-6).toUpperCase()}`
        : "N/A")
    );
  };

  const getSupplierName = (order) => {
    if (typeof order.supplier === "string") {
      return order.supplier;
    }

    return (
      order.supplier?.name ||
      order.supplier?.supplierName ||
      order.supplierName ||
      "Unknown Supplier"
    );
  };

  const getOrderValue = (order) => {
    return (
      order.totalAmount ??
      order.totalValue ??
      order.grandTotal ??
      order.amount ??
      order.total ??
      0
    );
  };

  const getOrderDate = (order) => {
    return (
      order.createdAt ||
      order.orderDate ||
      order.createdDate ||
      order.updatedAt
    );
  };

  const totalOrders = Number(data.totalOrders) || 0;
  const pendingOrders = Number(data.pendingOrders) || 0;
  const receivedOrders = Number(data.receivedOrders) || 0;
  const partialOrders =
    Number(data.partiallyReceivedOrders) || 0;

  const getPercentage = (value) => {
    if (totalOrders === 0) {
      return 0;
    }

    return Math.min((value / totalOrders) * 100, 100);
  };

  const orderStats = [
    {
      label: "Total",
      value: totalOrders,
      icon: ShoppingCart,
      iconStyle: "bg-blue-50 text-blue-600",
      valueStyle: "text-slate-900",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock3,
      iconStyle: "bg-amber-50 text-amber-600",
      valueStyle: "text-amber-600",
    },
    {
      label: "Received",
      value: receivedOrders,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
      valueStyle: "text-emerald-600",
    },
    {
      label: "Partial",
      value: partialOrders,
      icon: PackageCheck,
      iconStyle: "bg-violet-50 text-violet-600",
      valueStyle: "text-violet-600",
    },
  ];

  /*
   * Supports multiple possible backend response keys.
   *
   * Recommended backend property:
   * data.recentOrders
   */
  const recentOrders =
    data.recentOrders ||
    data.recentPurchaseOrders ||
    data.orders ||
    [];

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart size={16} />
            </div>

            <h2 className="text-sm font-semibold text-slate-900">
              Purchase Orders
            </h2>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Purchase order status and recent activity
          </p>
        </div>

        <Link
          to="/manager/purchase-orders"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          View all
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        {orderStats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex min-w-0 flex-col rounded-lg border border-slate-100 bg-slate-50/60 p-3"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconStyle}`}
              >
                <Icon size={15} />
              </div>

              <p
                className={`mt-3 truncate text-xl font-bold leading-none ${item.valueStyle}`}
              >
                {formatNumber(item.value)}
              </p>

              <p className="mt-2 text-[10px] font-medium text-slate-400">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Order Distribution */}
      <div className="px-5 pb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">
            Order distribution
          </p>

          <span className="text-[10px] text-slate-400">
            {formatNumber(totalOrders)} total
          </span>
        </div>

        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          {receivedOrders > 0 && (
            <div
              className="bg-emerald-500 transition-all"
              style={{
                width: `${getPercentage(receivedOrders)}%`,
              }}
              title="Received orders"
            />
          )}

          {pendingOrders > 0 && (
            <div
              className="bg-amber-400 transition-all"
              style={{
                width: `${getPercentage(pendingOrders)}%`,
              }}
              title="Pending orders"
            />
          )}

          {partialOrders > 0 && (
            <div
              className="bg-violet-500 transition-all"
              style={{
                width: `${getPercentage(partialOrders)}%`,
              }}
              title="Partially received orders"
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-slate-400">
              Received
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-400">
              Pending
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            <span className="text-[10px] text-slate-400">
              Partial
            </span>
          </div>
        </div>
      </div>

      {/* Total Purchase Value */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <TrendingUp
                size={13}
                className="text-slate-400"
              />

              <p className="text-[10px] font-medium text-slate-400">
                Total purchase value
              </p>
            </div>

            <p className="mt-1 truncate text-lg font-bold text-slate-800">
              {formatCurrency(data.totalValue)}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
            <ShoppingCart size={16} />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="border-t border-slate-100">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-800">
              Recent Orders
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Latest purchase order activity
            </p>
          </div>

          <Link
            to="/manager/purchase-orders"
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 pb-5">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                <FileText size={16} />
              </div>

              <p className="mt-3 text-xs font-medium text-slate-600">
                No recent orders
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                New purchase orders will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto">
            {recentOrders.map((order, index) => {
              const status = getOrderStatus(order);
              const StatusIcon = status.icon;

              const orderId = getOrderId(order);
              const supplierName = getSupplierName(order);
              const orderValue = getOrderValue(order);
              const orderDate = getOrderDate(order);

              return (
                <div
                  key={order._id || order.id || `${orderId}-${index}`}
                  className="px-5 py-4 transition hover:bg-slate-50/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-700">
                        {orderId}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {supplierName}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${status.style}`}
                    >
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">
                        Order date
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium text-slate-600">
                        {formatDate(orderDate)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">
                        Order value
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {formatCurrency(orderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
        <p className="text-[10px] text-slate-400">
          Purchase order summary
        </p>

        <Link
          to="/manager/purchase-orders"
          className="text-[10px] font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Manage orders
        </Link>
      </div>
    </div>
  );
};

export default PurchaseOrdersOverview;