import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
};

const UserSelector = ({
  users = [],
  selectedUsers = [],
  onToggle,
  loading,
}) => {
  const [search, setSearch] =
    useState("");

  const filteredUsers =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return users;
      }

      return users.filter((user) => {
        return (
          user.name
            ?.toLowerCase()
            .includes(value) ||
          user.email
            ?.toLowerCase()
            .includes(value)
        );
      });
    }, [users, search]);

  return (
    <div>

      {/* Search */}

      <div className="relative">

        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search users..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* User count */}

      <div className="mt-4 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <Users
            size={15}
            className="text-slate-400"
          />

          <span className="text-xs font-medium text-slate-500">
            Available users
          </span>
        </div>

        <span className="text-xs text-slate-400">
          {selectedUsers.length} selected
        </span>
      </div>

      {/* Users */}

      <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200">

        {loading ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

            <p className="mt-2 text-xs text-slate-400">
              Loading users...
            </p>
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              No users found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try another search.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const userId =
              user._id || user.id;

            const selected =
              selectedUsers.some(
                (id) =>
                  String(id) ===
                  String(userId)
              );

            return (
              <button
                type="button"
                key={userId}
                onClick={() =>
                  onToggle(userId)
                }
                className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 ${
                  selected
                    ? "bg-blue-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    selected
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {getInitials(
                    user.name ||
                      user.email ||
                      "User"
                  )}
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium text-slate-800">
                    {user.name ||
                      "Unknown user"}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {user.email || ""}
                  </p>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selected && (
                    <span className="text-xs font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserSelector;