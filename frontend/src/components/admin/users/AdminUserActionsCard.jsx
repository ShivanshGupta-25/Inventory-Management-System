import {
  Edit3,
  ShieldAlert,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

const AdminUserActionsCard = ({
  user,
  currentUser,
  onEdit,
  onStatusChange,
}) => {
  const isAdminAccount =
    String(user?.role || "").toLowerCase() === "admin";

  const isCurrentUser =
    String(user?._id || "") ===
    String(currentUser?._id || "");

  const isActive = user?.status !== "disabled";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900">
          Account Actions
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Administrative controls for this account.
        </p>
      </div>

      <div className="space-y-2 p-5 sm:p-6">

        {/* ===================================================
            EDIT USER
        =================================================== */}

        <button
          type="button"
          onClick={onEdit}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Edit3 size={16} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800">
              Edit User
            </p>

            <p className="text-[10px] text-slate-400">
              Update account information
            </p>
          </div>
        </button>

        {/* ===================================================
            ADMIN PROTECTION
        =================================================== */}

        {isAdminAccount && (
          <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-violet-600"
            />

            <div>
              <p className="text-xs font-semibold text-violet-800">
                Protected Administrator Account
              </p>

              <p className="mt-1 text-[10px] leading-5 text-violet-700">
                Administrator accounts are system-level
                accounts and cannot have their role changed
                or be disabled.
              </p>
            </div>
          </div>
        )}

        {/* ===================================================
            STATUS ACTION
        =================================================== */}

        {!isAdminAccount && !isCurrentUser && (
          <button
            type="button"
            onClick={onStatusChange}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
              isActive
                ? "border-red-100 hover:border-red-200 hover:bg-red-50"
                : "border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isActive
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isActive ? (
                <UserRoundX size={16} />
              ) : (
                <UserRoundCheck size={16} />
              )}
            </div>

            <div>
              <p
                className={`text-xs font-semibold ${
                  isActive
                    ? "text-red-700"
                    : "text-emerald-700"
                }`}
              >
                {isActive
                  ? "Disable Account"
                  : "Enable Account"}
              </p>

              <p className="text-[10px] text-slate-400">
                {isActive
                  ? "Prevent this user from accessing the system"
                  : "Restore account access"}
              </p>
            </div>
          </button>
        )}

        {/* ===================================================
            CURRENT ADMIN PROTECTION
        =================================================== */}

        {!isAdminAccount && isCurrentUser && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <ShieldAlert
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-[10px] leading-5 text-amber-700">
              You cannot disable or change the access status
              of your own administrator account.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminUserActionsCard;