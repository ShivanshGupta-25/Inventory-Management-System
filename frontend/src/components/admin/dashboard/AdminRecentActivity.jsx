import {
  Activity,
  Clock3,
  Settings2,
  UserCheck,
  UserPlus,
  UserRoundX,
} from "lucide-react";

import AdminSectionHeader from "./AdminSectionHeader";
import AdminEmptyState from "./AdminEmptyState";

const getActionLabel = (action) => {
  const labels = {
    USER_CREATED: "User created",
    USER_UPDATED: "User updated",
    ROLE_CHANGED: "Role changed",
    STATUS_CHANGED: "Account status changed",
    USER_DELETED: "User deleted",
  };

  return labels[action] || "Administrative activity";
};

const formatRelativeTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  const now = new Date();

  const difference = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (difference < 60) {
    return "Just now";
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const ActivityIcon = ({ action }) => {
  if (action === "USER_CREATED") {
    return <UserPlus size={17} />;
  }

  if (action === "ROLE_CHANGED") {
    return <Settings2 size={17} />;
  }

  if (action === "STATUS_CHANGED") {
    return <UserCheck size={17} />;
  }

  if (action === "USER_DELETED") {
    return <UserRoundX size={17} />;
  }

  return <Activity size={17} />;
};

const AdminRecentActivity = ({
  activities = [],
  onNavigate,
}) => {
  const visibleActivities = activities.slice(0, 6);

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-7">
      <AdminSectionHeader
        title="Recent Administrative Activity"
        description="Latest actions recorded in the admin audit trail"
        actionLabel="View audit logs"
        onAction={() =>
          onNavigate("/admin/audit-logs")
        }
      />

      {visibleActivities.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {visibleActivities.map((activity) => {
            const actor = activity.actor;
            const target = activity.targetUser;

            return (
              <div
                key={activity._id || activity.id}
                className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <ActivityIcon
                    action={activity.action}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {getActionLabel(activity.action)}
                    </p>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      {activity.action?.replace(
                        /_/g,
                        " "
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {activity.description}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    {actor?.name && (
                      <span>
                        By{" "}
                        <span className="font-semibold text-slate-500">
                          {actor.name}
                        </span>
                      </span>
                    )}

                    {target?.name && (
                      <>
                        <span>•</span>

                        <span>
                          Target:{" "}
                          <span className="font-semibold text-slate-500">
                            {target.name}
                          </span>
                        </span>
                      </>
                    )}

                    <span>•</span>

                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={10} />
                      {formatRelativeTime(
                        activity.createdAt
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState
          icon={Activity}
          title="No administrative activity"
          description="Administrative actions such as user creation, role changes, and account status changes will appear here."
        />
      )}
    </div>
  );
};

export default AdminRecentActivity;