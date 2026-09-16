import {
  Clock3,
  CheckCircle2,
  XCircle,
  PackageCheck,
} from "lucide-react";

const statusConfig = {
  Draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock3,
  },
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  "Partially Received": {
    label: "Partially Received",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: PackageCheck,
  },
  Received: {
    label: "Received",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

const PurchaseRequestStatus = ({ status }) => {
  const config =
    statusConfig[status] || statusConfig.Draft;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
};

export default PurchaseRequestStatus;