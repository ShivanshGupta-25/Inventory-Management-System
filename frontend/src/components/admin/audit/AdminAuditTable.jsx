import {
  Activity,
  Clock3,
  Eye,
  KeyRound,
  Settings2,
  UserCheck,
  UserPlus,
  UserRoundX,
} from "lucide-react";

const AdminAuditTable = ({
  logs,
  onView,
}) => {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Activity
              </th>

              <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Performed By
              </th>

              <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target
              </th>

              <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Date & Time
              </th>

              <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => {
              const config =
                getActionConfig(
                  log.action
                );

              return (
                <tr
                  key={
                    log._id ||
                    log.id
                  }
                  className="group transition hover:bg-slate-50/60"
                >
                  {/* Activity */}

                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBackground} ${config.iconColor}`}
                      >
                        <config.icon
                          size={16}
                        />
                      </div>

                      <div className="min-w-0 max-w-md">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {config.label}
                          </p>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${config.badgeBackground} ${config.badgeColor}`}
                          >
                            {formatAction(
                              log.action
                            )}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {log.description ||
                            "Administrative action recorded."}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Actor */}

                  <td className="px-5 py-4">
                    <Person
                      user={
                        log.actor
                      }
                    />
                  </td>

                  {/* Target */}

                  <td className="px-5 py-4">
                    {log.targetUser ? (
                      <Person
                        user={
                          log.targetUser
                        }
                        compact
                      />
                    ) : (
                      <span className="text-xs text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Date */}

                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3
                        size={13}
                        className="text-slate-400"
                      />

                      {formatDate(
                        log.createdAt
                      )}
                    </div>
                  </td>

                  {/* Action */}

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onView(log)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 opacity-80 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 group-hover:opacity-100"
                    >
                      <Eye size={14} />

                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==================================================
// PERSON
// ==================================================

const Person = ({
  user,
  compact = false,
}) => {
  if (!user) {
    return (
      <span className="text-xs text-slate-400">
        System
      </span>
    );
  }

  const initials = getInitials(
    user.name
  );

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-600 ${
          compact
            ? "h-8 w-8 text-[10px]"
            : "h-9 w-9 text-[11px]"
        }`}
      >
        {initials}
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-800">
          {user.name || "Unknown user"}
        </p>

        {!compact && user.email && (
          <p className="mt-0.5 truncate text-[10px] text-slate-400">
            {user.email}
          </p>
        )}

        {user.role && (
          <p className="mt-0.5 text-[10px] capitalize text-slate-400">
            {user.role}
          </p>
        )}
      </div>
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

const formatAction = (
  action
) => {
  if (!action) {
    return "Activity";
  }

  return action
    .replaceAll("_", " ")
    .toLowerCase();
};

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

const getInitials = (
  name = ""
) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

export default AdminAuditTable;