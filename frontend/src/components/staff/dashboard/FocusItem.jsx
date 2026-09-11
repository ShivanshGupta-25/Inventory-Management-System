import { ChevronRight } from "lucide-react";

const FocusItem = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition hover:border-blue-100 hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className="shrink-0 text-slate-300 group-hover:text-blue-500"
      />
    </button>
  );
};

export default FocusItem;