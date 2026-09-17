import {
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

/* -----------------------------
   Format Role
------------------------------ */
const formatRole = (role) => {
  if (!role) return "User";

  return role
    .split(/[\s_-]+/)
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};

/* -----------------------------
   Access Level
------------------------------ */
const getAccessLevel = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "Administrative Access";

    case "manager":
      return "Manager Workspace";

    case "staff":
      return "Staff Workspace";

    default:
      return "Standard Access";
  }
};

/* -----------------------------
   Information Item
------------------------------ */
const InfoItem = ({
  icon: Icon,
  label,
  value,
  children,
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      {/* Label */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <Icon size={16} />
        </div>

        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      {/* Value */}
      {children || (
        <p className="truncate text-sm font-semibold text-slate-900">
          {value || "Not available"}
        </p>
      )}
    </div>
  );
};

/* -----------------------------
   Profile Information Card
------------------------------ */
const ProfileInfoCard = ({ user }) => {
  const role = user?.role;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Personal Information
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Basic information associated with your account.
        </p>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {/* Full Name */}
        <InfoItem
          icon={User}
          label="Full Name"
          value={user?.name}
        />

        {/* Email */}
        <InfoItem
          icon={Mail}
          label="Email Address"
          value={user?.email}
        />

        {/* Role */}
        <InfoItem
          icon={ShieldCheck}
          label="Role"
        >
          <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            {formatRole(role)}
          </span>
        </InfoItem>

        {/* Access Level */}
        <InfoItem
          icon={ShieldCheck}
          label="Access Level"
          value={getAccessLevel(role)}
        />
      </div>
    </section>
  );
};

export default ProfileInfoCard;