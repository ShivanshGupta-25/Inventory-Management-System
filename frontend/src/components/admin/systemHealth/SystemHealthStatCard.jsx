import { ArrowUpRight } from "lucide-react";

const SystemHealthStatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "bg-slate-100 text-slate-600",
  status = "neutral",
  onClick,
}) => {
  const statusClasses = {
    healthy: "text-emerald-600",
    warning: "text-amber-600",
    critical: "text-red-600",
    neutral: "text-slate-900",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>

        {onClick && (
          <ArrowUpRight
            size={16}
            className="text-slate-300 transition-colors group-hover:text-slate-600"
          />
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <p
          className={`mt-1 text-xl font-bold tracking-tight ${
            statusClasses[status] || statusClasses.neutral
          }`}
        >
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </button>
  );
};

export default SystemHealthStatCard;