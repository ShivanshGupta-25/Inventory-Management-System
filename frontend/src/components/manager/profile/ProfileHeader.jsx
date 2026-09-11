import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  ShieldCheck,
} from "lucide-react";

const formatRole = (role) => {
  if (!role) return "User";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const formatDate = (date) => {
  if (!date) return "Recently";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ProfileHeader = ({ user, onEdit }) => {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Cover */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700 sm:h-36">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border border-white/10" />
        <div className="absolute right-20 top-8 h-32 w-32 rounded-full border border-white/5" />

        <div className="absolute bottom-4 left-6 text-xs font-medium tracking-wide text-white/50">
          INVENTORY MANAGEMENT SYSTEM
        </div>
      </div>

      {/* Profile body */}
      <div className="px-5 pb-5 sm:px-6">
        <div className="-mt-11 flex flex-col gap-5 sm:-mt-10 sm:flex-row sm:items-end sm:justify-between">

          {/* Identity */}
          <div className="flex items-end gap-4">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-xl font-semibold text-slate-700 shadow-md sm:h-24 sm:w-24">
                {initials}
              </div>

              <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                <CheckCircle2
                  size={11}
                  className="text-white"
                />
              </span>
            </div>

            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {user?.name || "User"}
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  <ShieldCheck size={12} />
                  {formatRole(user?.role)}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {user?.email || "No email available"}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={13} />
                Member since {formatDate(user?.createdAt)}
              </div>
            </div>
          </div>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Pencil size={15} />
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;