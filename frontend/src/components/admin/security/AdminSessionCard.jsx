import {
  Clock3,
  LogOut,
  Monitor,
  ShieldCheck,
} from "lucide-react";

const AdminSessionCard = ({
  onLogout,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-900">
          Current Session
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Information about your current authenticated session.
        </p>
      </div>

      <div className="p-6">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <Monitor size={18} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <p className="text-sm font-semibold text-slate-900">
                  Currently signed in
                </p>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This browser session is authenticated
                as an administrator.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoItem
            icon={ShieldCheck}
            title="Authentication"
            value="Protected"
          />

          <InfoItem
            icon={Clock3}
            title="Session"
            value="Current session"
          />
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            <LogOut size={16} />
            Sign out
          </button>
        )}
      </div>
    </section>
  );
};

const InfoItem = ({
  icon: Icon,
  title,
  value,
}) => (
  <div className="rounded-xl border border-slate-200 px-4 py-3">
    <div className="flex items-center gap-2 text-slate-500">
      <Icon size={15} />

      <span className="text-xs font-medium">
        {title}
      </span>
    </div>

    <p className="mt-1 text-sm font-semibold text-slate-900">
      {value}
    </p>
  </div>
);

export default AdminSessionCard;