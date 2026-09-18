import { useEffect, useState } from "react";

const UserSelector = ({
  users,
  selectedUsers,
  onToggle,
  loading,
}) => {
  const [search, setSearch] =
    useState("");

  const filtered = users.filter(
    (user) => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return true;
      }

      return `${user.name} ${user.email}`
        .toLowerCase()
        .includes(value);
    }
  );

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search users..."
        className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />

      <div className="max-h-64 overflow-y-auto rounded-lg border">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No users found.
          </div>
        ) : (
          filtered.map((user) => {
            const selected =
              selectedUsers.some(
                (id) =>
                  String(id) ===
                  String(user.id)
              );

            return (
              <button
                key={user.id}
                type="button"
                onClick={() =>
                  onToggle(user.id)
                }
                className="flex w-full items-center gap-3 border-b px-3 py-3 text-left last:border-b-0 hover:bg-gray-50"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {user.name
                    ?.slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {selected
                    ? "✓"
                    : ""}
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