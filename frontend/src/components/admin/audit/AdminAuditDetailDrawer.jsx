import {
  Clock3,
  FileText,
  Hash,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

const AdminAuditDetailDrawer = ({
  log,
  onClose,
}) => {
  if (!log) {
    return null;
  }

  const config =
    getActionConfig(
      log.action
    );

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/35 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.iconBackground} ${config.iconColor}`}
            >
              <config.icon
                size={19}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">
                  {config.label}
                </h2>

                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${config.badgeBackground} ${config.badgeColor}`}
                >
                  {formatAction(
                    log.action
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Audit event details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {/* DESCRIPTION */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <FileText size={14} />

              Description
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {log.description ||
                "No description available."}
            </p>
          </div>

          {/* EVENT INFORMATION */}

          <div className="mt-6">
            <SectionTitle>
              Event Information
            </SectionTitle>

            <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <InfoRow
                icon={Hash}
                label="Event ID"
                value={
                  log._id ||
                  log.id ||
                  "—"
                }
              />

              <InfoRow
                icon={Clock3}
                label="Created"
                value={formatDateTime(
                  log.createdAt
                )}
              />

              <InfoRow
                icon={ShieldCheck}
                label="Action"
                value={
                  formatAction(
                    log.action
                  )
                }
              />
            </div>
          </div>

          {/* ACTOR */}

          <div className="mt-6">
            <SectionTitle>
              Performed By
            </SectionTitle>

            <div className="mt-3 rounded-2xl border border-slate-200 p-4">
              <UserCard
                user={log.actor}
              />
            </div>
          </div>

          {/* TARGET */}

          <div className="mt-6">
            <SectionTitle>
              Target Account
            </SectionTitle>

            {log.targetUser ? (
              <div className="mt-3 rounded-2xl border border-slate-200 p-4">
                <UserCard
                  user={
                    log.targetUser
                  }
                />
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
                This event does not have a target
                account.
              </div>
            )}
          </div>

          {/* METADATA */}

          {log.metadata &&
            Object.keys(
              log.metadata
            ).length > 0 && (
              <div className="mt-6">
                <SectionTitle>
                  Event Metadata
                </SectionTitle>

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <pre className="max-h-64 overflow-auto p-4 text-xs leading-5 text-slate-600">
                    {JSON.stringify(
                      log.metadata,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
        </div>

        {/* FOOTER */}

        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck
              size={14}
              className="text-emerald-500"
            />

            This event is part of the administrator
            audit trail.
          </div>
        </div>
      </aside>
    </div>
  );
};

const SectionTitle = ({
  children,
}) => (
  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
    {children}
  </h3>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 px-4 py-3.5">
    <Icon
      size={16}
      className="shrink-0 text-slate-400"
    />

    <span className="w-28 shrink-0 text-xs font-medium text-slate-500">
      {label}
    </span>

    <span className="min-w-0 break-all text-xs font-semibold text-slate-800">
      {value}
    </span>
  </div>
);

const UserCard = ({
  user,
}) => {
  if (!user) {
    return (
      <p className="text-sm text-slate-400">
        Unknown user
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
        {getInitials(
          user.name
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {user.name ||
            "Unknown user"}
        </p>

        {user.email && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <Mail size={11} />

            {user.email}
          </p>
        )}

        {user.role && (
          <p className="mt-1 flex items-center gap-1 text-[10px] font-medium capitalize text-slate-400">
            <UserRound size={10} />

            {user.role}
          </p>
        )}
      </div>
    </div>
  );
};

const getActionConfig = (
  action
) => {
  switch (action) {
    case "USER_CREATED":
      return {
        label: "User created",
        icon: UserRound,
        iconBackground:
          "bg-emerald-50",
        iconColor:
          "text-emerald-600",
        badgeBackground:
          "bg-emerald-50",
        badgeColor:
          "text-emerald-700",
      };

    case "PASSWORD_CHANGED":
      return {
        label: "Password changed",
        icon: ShieldCheck,
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
        label:
          "Administrative activity",
        icon: FileText,
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
) =>
  action
    ? action
        .replaceAll("_", " ")
        .toLowerCase()
    : "activity";

const formatDateTime = (
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
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

export default AdminAuditDetailDrawer;