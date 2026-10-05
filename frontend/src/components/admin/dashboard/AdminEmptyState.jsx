import { Activity } from "lucide-react";

const AdminEmptyState = ({
  icon: Icon = Activity,
  title,
  description,
}) => {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
};

export default AdminEmptyState;