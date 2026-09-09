import {
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const SecurityCard = ({ onChangePassword }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Password & Security
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Keep your account secure by managing your login credentials.
        </p>
      </div>

      <div className="p-6">

        <div className="flex flex-col gap-5 rounded-xl border border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
              <LockKeyhole size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Account Password
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Update your password regularly to keep your account protected.
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <ShieldCheck size={14} />
                Password protected
              </div>
            </div>
          </div>

          <button
            onClick={onChangePassword}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <KeyRound size={15} />
            Change Password
          </button>
        </div>
      </div>
    </section>
  );
};

export default SecurityCard;