import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const AdminUserSecurityCard = ({ user }) => {
  const isActive = user?.status !== "disabled";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <LockKeyhole size={15} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Security
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Security state of this user account.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <KeyRound size={16} className="text-slate-500" />

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Password
              </p>
              <p className="text-[10px] text-slate-400">
                Stored securely
              </p>
            </div>
          </div>

          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
            Protected
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-slate-500" />

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Account Access
              </p>
              <p className="text-[10px] text-slate-400">
                Current account status
              </p>
            </div>
          </div>

          <span
            className={`rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isActive ? "Allowed" : "Blocked"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default AdminUserSecurityCard;