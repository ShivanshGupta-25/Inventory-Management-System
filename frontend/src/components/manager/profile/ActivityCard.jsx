import {
  CheckCircle2,
  LogIn,
  ShieldCheck,
} from "lucide-react";

const ActivityCard = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Account Activity
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Recent account events.
        </p>
      </div>

      <div className="divide-y divide-slate-100">

        <div className="flex gap-3 p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <LogIn size={15} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              Successful sign in
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Your account is currently authenticated.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <CheckCircle2 size={15} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              Account active
            </p>

            <p className="mt-1 text-xs text-slate-400">
              No account restrictions detected.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ShieldCheck size={15} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              Security enabled
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Authentication protection is enabled.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ActivityCard;