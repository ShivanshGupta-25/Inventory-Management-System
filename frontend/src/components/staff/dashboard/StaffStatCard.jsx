const StaffStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  alert = false,
  danger = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p
            className={`mt-1 text-[11px] ${
              danger
                ? "text-red-500"
                : alert
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-50 text-red-600"
              : alert
              ? "bg-amber-50 text-amber-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

export default StaffStatCard;