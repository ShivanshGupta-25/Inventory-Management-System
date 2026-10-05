import {
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserCog,
} from "lucide-react";

const AdminAccountSecurity = ({
  user,
}) => {
  const isActive =
    !user?.status ||
    user.status === "active";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-900">
          Account Security
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Security information associated with your account.
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        <SecurityRow
          icon={Mail}
          label="Email Address"
          value={user?.email || "—"}
          description="Primary administrator identity"
        />

        <SecurityRow
          icon={CheckCircle2}
          label="Account Status"
          value={
            isActive
              ? "Active"
              : "Disabled"
          }
          description={
            isActive
              ? "Account is in good standing"
              : "Account access is restricted"
          }
          valueClass={
            isActive
              ? "text-emerald-600"
              : "text-red-600"
          }
        />

        <SecurityRow
          icon={ShieldCheck}
          label="Access Level"
          value="Administrator"
          description="Full system-level access"
        />

        <SecurityRow
          icon={UserCog}
          label="Role Protection"
          value="Protected"
          description="Role cannot be changed from this page"
        />
      </div>
    </section>
  );
};

const SecurityRow = ({
  icon: Icon,
  label,
  value,
  description,
  valueClass = "text-slate-900",
}) => (
  <div className="flex items-center gap-4 px-6 py-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200">
      <Icon size={18} />
    </div>

    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-0.5 text-xs text-slate-500">
        {description}
      </p>
    </div>
  </div>
);

export default AdminAccountSecurity;