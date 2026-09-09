import {
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

const formatRole = (role) => {
  if (!role) return "User";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const InfoItem = ({ icon: Icon, label, value, children }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <Icon size={16} />
        </div>

        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      {children || (
        <p className="truncate text-sm font-semibold text-slate-900">
          {value || "Not available"}
        </p>
      )}
    </div>
  );
};

const ProfileInfoCard = ({ user }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Personal Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Basic information associated with your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">

        <InfoItem
          icon={User}
          label="Full Name"
          value={user?.name}
        />

        <InfoItem
          icon={Mail}
          label="Email Address"
          value={user?.email}
        />

        <InfoItem
          icon={ShieldCheck}
          label="Role"
        >
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            {formatRole(user?.role)}
          </span>
        </InfoItem>

        <InfoItem
          icon={ShieldCheck}
          label="Access Level"
          value={formatRole(user?.role)}
        />
      </div>
    </section>
  );
};

export default ProfileInfoCard;