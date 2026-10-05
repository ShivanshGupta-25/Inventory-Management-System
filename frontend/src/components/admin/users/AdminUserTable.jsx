import {
  CalendarDays,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import AdminUserActions from "./AdminUserActions";

// --------------------------------------------------
// ROLE CONFIGURATION
// --------------------------------------------------

const roleConfig = {
  admin: {
    label: "Administrator",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },

  manager: {
    label: "Manager",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },

  staff: {
    label: "Staff",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

// --------------------------------------------------
// STATUS CONFIGURATION
// --------------------------------------------------

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },

  disabled: {
    label: "Disabled",
    className: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getInitials = (name = "") => {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "U";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --------------------------------------------------
// ADMIN USER TABLE
// --------------------------------------------------

const AdminUserTable = ({
  users = [],
  currentUser = null,

  onView,
  onEdit,
  onRoleChange,
  onStatusChange,
  onDelete,
}) => {
  // ------------------------------------------------
  // EMPTY STATE
  // ------------------------------------------------

  if (!users.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <UserRound
              size={24}
              className="text-slate-400"
            />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No users found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            There are no users matching the current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ==================================================
          DESKTOP TABLE
      ================================================== */}

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px]">
          {/* TABLE HEADER */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                User
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Created
              </th>

              <th className="w-16 px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const role =
                roleConfig[user.role] || roleConfig.staff;

              const status =
                statusConfig[user.status] ||
                statusConfig.active;

              return (
                <tr
                  key={user._id || user.id}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  {/* USER */}
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onView?.(user)}
                      className="flex items-center gap-3 text-left"
                    >
                      {/* AVATAR */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                        {getInitials(user.name)}
                      </div>

                      {/* DETAILS */}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-slate-700">
                          {user.name || "Unnamed User"}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                          <Mail
                            size={13}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="max-w-[260px] truncate text-xs text-slate-500">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </button>
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${role.className}`}
                    >
                      {user.role === "admin" ? (
                        <ShieldCheck size={13} />
                      ) : (
                        <UserRound size={13} />
                      )}

                      {role.label}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />

                      {status.label}
                    </span>
                  </td>

                  {/* CREATED */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays
                        size={15}
                        className="text-slate-400"
                      />

                      {formatDate(user.createdAt)}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4 text-right">
                    <AdminUserActions
                      user={user}
                      currentUser={currentUser}
                      onView={onView}
                      onEdit={onEdit}
                      onRoleChange={onRoleChange}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ==================================================
          MOBILE / TABLET CARDS
      ================================================== */}

      <div className="divide-y divide-slate-100 lg:hidden">
        {users.map((user) => {
          const role =
            roleConfig[user.role] || roleConfig.staff;

          const status =
            statusConfig[user.status] ||
            statusConfig.active;

          return (
            <div
              key={user._id || user.id}
              className="p-4 transition-colors hover:bg-slate-50/50 sm:p-5"
            >
              {/* TOP ROW */}
              <div className="flex items-start justify-between gap-4">
                {/* USER */}
                <button
                  type="button"
                  onClick={() => onView?.(user)}
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  {/* AVATAR */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {getInitials(user.name)}
                  </div>

                  {/* DETAILS */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.name || "Unnamed User"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.email || "No email"}
                    </p>
                  </div>
                </button>

                {/* ACTIONS */}
                <AdminUserActions
                  user={user}
                  currentUser={currentUser}
                  onView={onView}
                  onEdit={onEdit}
                  onRoleChange={onRoleChange}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              </div>

              {/* META */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {/* ROLE */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${role.className}`}
                >
                  {user.role === "admin" ? (
                    <ShieldCheck size={13} />
                  ) : (
                    <UserRound size={13} />
                  )}

                  {role.label}
                </span>

                {/* STATUS */}
                <span
                  className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                  />

                  {status.label}
                </span>

                {/* CREATED */}
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarDays size={13} />

                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUserTable;