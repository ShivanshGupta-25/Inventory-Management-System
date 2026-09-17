import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRound,
} from "lucide-react";

/* -----------------------------
   Format Role
------------------------------ */
const formatRole = (role) => {
  if (!role) return "User";

  return role
    .split(/[\s_-]+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
};

/* -----------------------------
   Get Access Description
------------------------------ */
const getAccessDescription = (role) => {
  switch (role?.toLowerCase()) {
    case "admin":
      return "Administrative access";

    case "manager":
      return "Manager-level access";

    case "staff":
      return "Staff-level access";

    default:
      return "Standard user access";
  }
};

/* -----------------------------
   Account Card
------------------------------ */
const AccountCard = ({
  user,
  accountStatus = "Active",
  isAuthenticated = true,
}) => {
  const isActive = accountStatus.toLowerCase() === "active";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="font-semibold text-slate-900">
          Account
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Account status and access information.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-5 p-6">
        {/* Account Status */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Account Status
          </p>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <CheckCircle2 size={15} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {accountStatus}
              </p>

              <p className="text-xs text-slate-400">
                {isActive
                  ? "Account is in good standing"
                  : "Please contact your administrator"}
              </p>
            </div>
          </div>
        </div>

        {/* Access Level */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Access Level
          </p>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ShieldCheck size={15} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {formatRole(user?.role)}
              </p>

              <p className="text-xs text-slate-400">
                {getAccessDescription(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Account Type */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Account Type
          </p>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <UserRound size={15} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {formatRole(user?.role)} Account
              </p>

              <p className="text-xs text-slate-400">
                Role-based workspace access
              </p>
            </div>
          </div>
        </div>

        {/* Session */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Session
          </p>

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Clock3 size={15} />
            </span>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                {isAuthenticated
                  ? "Currently signed in"
                  : "Session unavailable"}
              </p>

              <p className="text-xs text-slate-400">
                {isAuthenticated
                  ? "Secure authenticated session"
                  : "Please sign in again"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountCard;