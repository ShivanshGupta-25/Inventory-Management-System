import {
  CalendarDays,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const AdminAccountInfo = ({ user = {} }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <h2 className="text-base font-semibold text-slate-900">
          Account Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Important information about your administrator account.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* Created */}
        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarDays size={16} />

            <span className="text-xs font-semibold uppercase tracking-wide">
              Account Created
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatDate(user?.createdAt)}
          </p>
        </div>

        {/* Updated */}
        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock3 size={16} />

            <span className="text-xs font-semibold uppercase tracking-wide">
              Last Updated
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatDate(user?.updatedAt)}
          </p>
        </div>

        {/* Role */}
        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={16} />

            <span className="text-xs font-semibold uppercase tracking-wide">
              Account Role
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            Administrator
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdminAccountInfo;