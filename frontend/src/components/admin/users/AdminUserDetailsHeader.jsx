import {
  ArrowLeft,
  Edit3,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const AdminUserDetailsHeader = ({
  user,
  onBack,
  onEdit,
}) => {
  const isActive = user?.status !== "disabled";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        {/* Breadcrumb / back */}
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || <UserRound size={22} />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                  {user?.name || "User"}
                </h1>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  {isActive ? "Active" : "Disabled"}
                </span>
              </div>

              <p className="mt-1 truncate text-sm text-slate-500">
                {user?.email || "No email available"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  <ShieldCheck size={12} />
                  {user?.role || "staff"}
                </span>

                {user?._id && (
                  <span className="max-w-[220px] truncate text-[10px] text-slate-400">
                    ID: {user._id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Edit3 size={16} />
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsHeader;