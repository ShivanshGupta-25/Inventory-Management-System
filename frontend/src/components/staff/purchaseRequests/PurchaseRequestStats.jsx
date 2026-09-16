import {
  FileText,
  Clock3,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

const PurchaseRequestStats = ({ requests = [] }) => {
  const total = requests.length;

  const pending = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const partiallyReceived = requests.filter(
    (request) =>
      request.status === "Partially Received"
  ).length;

  const received = requests.filter(
    (request) => request.status === "Received"
  ).length;

  const stats = [
    {
      title: "Total Requests",
      value: total,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Partially Received",
      value: partiallyReceived,
      icon: PackageCheck,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Received",
      value: received,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {stat.value}
                </h3>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.iconBg}`}
              >
                <Icon
                  size={21}
                  className={stat.iconColor}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseRequestStats;