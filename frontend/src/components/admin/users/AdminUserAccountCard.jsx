import {
  CalendarDays,
  Clock3,
  Fingerprint,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminUserAccountCard = ({ user }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          Account Information
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Account lifecycle and identification details.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Fingerprint size={16} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              User ID
            </p>
            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {user?._id || "Not available"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <CalendarDays size={16} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Created
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Clock3 size={16} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Last Updated
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatDate(user?.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminUserAccountCard;