import {
  CheckCircle2,
  ShieldCheck,
  UserRound,
  MonitorCheck,
} from "lucide-react";

const AdminSecurityOverview = ({ user }) => {
  const isActive =
    !user?.status ||
    user.status === "active";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-slate-900">
            Security Overview
          </h2>

          <p className="text-sm text-slate-500">
            A quick overview of your administrator
            account security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={21} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Account Security
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              Protected
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Authentication enabled
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <UserRound size={21} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Access
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              Administrator
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Full system access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <MonitorCheck size={21} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Current Session
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-sm font-semibold text-slate-900">
                {isActive
                  ? "Active"
                  : "Restricted"}
              </p>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Secure authenticated session
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminSecurityOverview;