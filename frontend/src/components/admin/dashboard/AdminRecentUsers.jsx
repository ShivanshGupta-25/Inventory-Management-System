import {
  ChevronRight,
  UserPlus,
} from "lucide-react";

import AdminSectionHeader from "./AdminSectionHeader";
import AdminEmptyState from "./AdminEmptyState";

const getRoleLabel = (role) => {
  if (!role) {
    return "Unknown";
  }

  return (
    role.charAt(0).toUpperCase() +
    role.slice(1)
  );
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

const AdminRecentUsers = ({
  users = [],
  onNavigate,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-5">
      <AdminSectionHeader
        title="Recently Added Users"
        description="Latest accounts added to InventoryFlow"
        actionLabel="View all"
        onAction={() => onNavigate("/admin/users")}
      />

      {users.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {users.map((user) => {
            const userId = user._id || user.id;

            return (
              <button
                key={userId}
                type="button"
                onClick={() =>
                  onNavigate(`/admin/users/${userId}`)
                }
                className="group flex w-full items-center gap-3 py-3.5 text-left first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user.name || "Unnamed user"}
                  </p>

                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="truncate text-[11px] text-slate-400">
                      {user.email}
                    </p>

                    <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:inline-flex">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-slate-400">
                    {formatRelativeTime(user.createdAt)}
                  </p>

                  <ChevronRight
                    size={14}
                    className="ml-auto mt-1 text-slate-300 transition-colors group-hover:text-slate-600"
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState
          icon={UserPlus}
          title="No users yet"
          description="Newly created users will appear in this section."
        />
      )}
    </div>
  );
};

export default AdminRecentUsers;