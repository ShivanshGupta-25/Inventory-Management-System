import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

const AdminPasswordCard = ({
  onChangePassword,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-900">
          Password & Authentication
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Keep your administrator credentials secure.
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
              <KeyRound size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">
                Account Password
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your password protects administrator
                access to InventoryFlow.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
                <CheckCircle2 size={15} />
                Password protected
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onChangePassword}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Change Password
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SecurityRule
            icon={ShieldCheck}
            title="8+ characters"
          />

          <SecurityRule
            icon={ShieldCheck}
            title="Upper & lowercase"
          />

          <SecurityRule
            icon={ShieldCheck}
            title="At least one number"
          />
        </div>
      </div>
    </section>
  );
};

const SecurityRule = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
    <Icon
      size={15}
      className="text-emerald-500"
    />

    <span className="text-xs font-medium text-slate-600">
      {title}
    </span>
  </div>
);

export default AdminPasswordCard;