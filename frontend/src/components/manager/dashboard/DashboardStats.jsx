import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "1,248",
    change: "+8.2%",
    description: "vs. last month",
    icon: Package,
    trend: "up",
  },
  {
    title: "Total Stock",
    value: "18,420",
    change: "+5.4%",
    description: "units in inventory",
    icon: Boxes,
    trend: "up",
  },
  {
    title: "Low Stock",
    value: "32",
    change: "+4",
    description: "needs attention",
    icon: AlertTriangle,
    trend: "down",
  },
  {
    title: "Out of Stock",
    value: "8",
    change: "-12.5%",
    description: "vs. last month",
    icon: XCircle,
    trend: "up",
  },
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon =
          stat.trend === "up" ? TrendingUp : TrendingDown;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
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

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={19} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span
                className={`flex items-center gap-1 font-semibold ${
                  stat.trend === "up"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                <TrendIcon size={13} />
                {stat.change}
              </span>

              <span className="text-slate-400">
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