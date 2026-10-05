import { ArrowUpRight } from "lucide-react";

const AdminSectionHeader = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-600 transition-colors hover:text-amber-700"
        >
          {actionLabel}
          <ArrowUpRight size={13} />
        </button>
      )}
    </div>
  );
};

export default AdminSectionHeader;