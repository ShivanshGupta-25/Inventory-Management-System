import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  IndianRupee,
} from "lucide-react";

const DashboardStats = ({ data }) => {
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

  const stats = [
    {
      title: "Total Products",
      value: formatNumber(data.totalProducts),
      description: "active products",
      icon: Package,
      iconStyle:
        "bg-blue-50 text-blue-600",
    },

    {
      title: "Total Stock",
      value: formatNumber(data.totalStock),
      description: "units in inventory",
      icon: Boxes,
      iconStyle:
        "bg-indigo-50 text-indigo-600",
    },

    {
      title: "Low Stock",
      value: formatNumber(
        data.lowStockProducts
      ),
      description: "needs attention",
      icon: AlertTriangle,
      iconStyle:
        "bg-amber-50 text-amber-600",
    },

    {
      title: "Out of Stock",
      value: formatNumber(
        data.outOfStockProducts
      ),
      description: "products unavailable",
      icon: XCircle,
      iconStyle:
        "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {stat.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconStyle}`}
              >
                <Icon size={19} />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs text-slate-400">
                {stat.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;