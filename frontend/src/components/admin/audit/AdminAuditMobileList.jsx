import {
  Activity,
  ChevronRight,
  Clock3,
  KeyRound,
  Settings2,
  UserCheck,
  UserPlus,
  UserRoundX,
} from "lucide-react";

// ==================================================
// ADMIN AUDIT MOBILE LIST
// ==================================================

const AdminAuditMobileList = ({
  logs,
  onView,
}) => {
  return (
    <div className="space-y-3 lg:hidden">
      {logs.map((log) => {
        const config =
          getActionConfig(log?.action);

        return (
          <button
            key={
              log?._id ||
              log?.id
            }
            type="button"
            onClick={() =>
              onView(log)
            }
            className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              {/* ACTION ICON */}

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBackground} ${config.iconColor}`}
              >
                <config.icon size={17} />
              </div>

              {/* CONTENT */}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {config.label}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${config.badgeBackground} ${config.badgeColor}`}
                    >
                      {formatAction(
                        log?.action
                      )}
                    </span>
                  </div>

                  <ChevronRight
                    size={17}
                    className="shrink-0 text-slate-300 transition group-hover:text-slate-600"
                  />
                </div>

                {/* DESCRIPTION */}

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {log?.description ||
                    "Administrative action recorded."}
                </p>

                {/* META */}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                  {/* ACTOR */}

                  <span>
                    By{" "}
                    <span className="font-medium text-slate-600">
                      {log?.actor?.name ||
                        "System"}
                    </span>
                  </span>

                  {/* TARGET */}

                  {log?.targetUser && (
                    <span>
                      Target{" "}
                      <span className="font-medium text-slate-600">
                        {
                          log
                            .targetUser
                            .name
                        }
                      </span>
                    </span>
                  )}

                  {/* DATE */}

                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={10} />

                    {formatDate(
                      log?.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ==================================================
// ACTION CONFIG
// ==================================================

const getActionConfig = (
  action
) => {
  switch (action) {
    case "USER_CREATED":
      return {
        label: "User created",
        icon: UserPlus,
        iconBackground:
          "bg-emerald-50",
        iconColor:
          "text-emerald-600",
        badgeBackground:
          "bg-emerald-50",
        badgeColor:
          "text-emerald-700",
      };

    case "USER_UPDATED":
      return {
        label: "User updated",
        icon: Activity,
        iconBackground:
          "bg-sky-50",
        iconColor:
          "text-sky-600",
        badgeBackground:
          "bg-sky-50",
        badgeColor:
          "text-sky-700",
      };

    case "PROFILE_UPDATED":
      return {
        label: "Profile updated",
        icon: UserCheck,
        iconBackground:
          "bg-violet-50",
        iconColor:
          "text-violet-600",
        badgeBackground:
          "bg-violet-50",
        badgeColor:
          "text-violet-700",
      };

    case "ROLE_CHANGED":
      return {
        label: "Role changed",
        icon: Settings2,
        iconBackground:
          "bg-amber-50",
        iconColor:
          "text-amber-600",
        badgeBackground:
          "bg-amber-50",
        badgeColor:
          "text-amber-700",
      };

    case "STATUS_CHANGED":
      return {
        label: "Status changed",
        icon: UserCheck,
        iconBackground:
          "bg-blue-50",
        iconColor:
          "text-blue-600",
        badgeBackground:
          "bg-blue-50",
        badgeColor:
          "text-blue-700",
      };

    case "USER_DELETED":
      return {
        label: "User deleted",
        icon: UserRoundX,
        iconBackground:
          "bg-red-50",
        iconColor:
          "text-red-600",
        badgeBackground:
          "bg-red-50",
        badgeColor:
          "text-red-700",
      };

    case "PASSWORD_CHANGED":
      return {
        label: "Password changed",
        icon: KeyRound,
        iconBackground:
          "bg-indigo-50",
        iconColor:
          "text-indigo-600",
        badgeBackground:
          "bg-indigo-50",
        badgeColor:
          "text-indigo-700",
      };

    default:
      return {
        label: "Administrative activity",
        icon: Activity,
        iconBackground:
          "bg-slate-100",
        iconColor:
          "text-slate-600",
        badgeBackground:
          "bg-slate-100",
        badgeColor:
          "text-slate-600",
      };
  }
};

// ==================================================
// FORMAT ACTION
// ==================================================

const formatAction = (
  action
) => {
  if (!action) {
    return "activity";
  }

  return action
    .replaceAll("_", " ")
    .toLowerCase();
};

// ==================================================
// FORMAT DATE
// ==================================================

const formatDate = (
  value
) => {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default AdminAuditMobileList;