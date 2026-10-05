import {
  Plus,
  RefreshCw,
  UsersRound,
} from "lucide-react";

const AdminUsersHeader = ({
  onRefresh,
  refreshing = false,
  onAddUser,
}) => {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT */}

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 shadow-sm">
          <UsersRound
            size={25}
            className="text-white"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">
            Administration
          </p>

          <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-slate-950">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage platform users, roles, and account
            access from one place.
          </p>
        </div>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-2">
        {/* REFRESH */}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          <span>
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>

        {/* ADD USER */}

        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          <Plus size={17} />

          <span>Add User</span>
        </button>
      </div>
    </div>
  );
};

export default AdminUsersHeader;