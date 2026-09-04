import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  PackageCheck,
} from "lucide-react";

const PurchaseOrderSummaryCard = ({
  orders = [],
}) => {
  const total = orders.length;

  const pending = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const approved = orders.filter(
    (order) => order.status === "Approved"
  ).length;

  const received = orders.filter(
    (order) => order.status === "Received"
  ).length;

  const cards = [
    {
      title: "Total Orders",
      value: total,
      description: "All purchase orders",
      icon: ClipboardList,
      style: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pending,
      description: "Awaiting approval",
      icon: Clock3,
      style: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved",
      value: approved,
      description: "Orders in progress",
      icon: CheckCircle2,
      style: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Received",
      value: received,
      description: "Successfully received",
      icon: PackageCheck,
      style: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.style}`}
              >
                <Icon size={20} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseOrderSummaryCard;