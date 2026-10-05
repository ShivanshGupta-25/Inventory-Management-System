import {
  Mail,
  ShieldCheck,
} from "lucide-react";

const getInitials = (name = "") => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "A";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const AdminProfileHeader = ({ user = {} }) => {
  const name = user?.name || "Administrator";
  const email = user?.email || "—";
  const initials = getInitials(name);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Cover */}
      <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700" />

      {/* Profile Content */}
      <div className="px-6 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-slate-950 text-2xl font-bold text-white shadow-lg">
              {initials}
            </div>

            {/* Identity */}
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {name}
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  <ShieldCheck size={13} />
                  Administrator
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Mail size={15} />
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>

          {/* Account status */}
          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:self-end">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {user?.status === "disabled" ? "Disabled" : "Active"}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminProfileHeader;