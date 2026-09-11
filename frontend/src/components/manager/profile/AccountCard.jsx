import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const formatRole = (role) => {
  if (!role) return "User";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const AccountCard = ({ user }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Account
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Account status and access information.
        </p>
      </div>

      <div className="space-y-5 p-6">

        {/* Status */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Account Status
          </p>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={15} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Active
              </p>

              <p className="text-xs text-slate-400">
                Account is in good standing
              </p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Access Level
          </p>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ShieldCheck size={15} />
            </span>

            <p className="text-sm font-semibold text-slate-900">
              {formatRole(user?.role)}
            </p>
          </div>
        </div>

        {/* Session */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Session
          </p>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Clock3 size={15} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Currently signed in
              </p>

              <p className="text-xs text-slate-400">
                Secure authenticated session
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountCard;