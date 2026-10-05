import {
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const AdminSystemStatus = ({
  onNavigate,
}) => {
  return (
    <section>
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-xs font-bold text-emerald-800">
              Administrative controls active
            </p>

            <p className="mt-0.5 text-[10px] text-emerald-700/70">
              User management and audit tracking are
              available.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate("/admin/system-health")
          }
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          System health
          <ArrowUpRight size={14} />
        </button>
      </div>
    </section>
  );
};

export default AdminSystemStatus;