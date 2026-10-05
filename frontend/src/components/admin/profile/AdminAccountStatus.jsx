import {
  CheckCircle2,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

const AdminAccountStatus = ({ user = {} }) => {
  const isActive = user?.status !== "disabled";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Account Overview
        </p>

        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Account Status
        </h2>
      </div>

      <div className="mt-6 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isActive
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Account Status
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Current account state
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isActive
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            />

            {isActive ? "Active" : "Disabled"}
          </span>
        </div>

        {/* Role */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <ShieldCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Administrator
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              System administrator role
            </p>
          </div>
        </div>

        {/* Access */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
            <UserRoundCheck size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Access Level
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Full administrator access
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminAccountStatus;