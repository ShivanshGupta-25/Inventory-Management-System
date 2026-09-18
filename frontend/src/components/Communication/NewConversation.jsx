import { useEffect, useState } from "react";
import UserSelector from "./UserSelector";

const NewConversation = ({
  users,
  loadingUsers,
  onClose,
  onCreateDirect,
  onCreateGroup,
}) => {
  const [mode, setMode] =
    useState("direct");

  const [selectedUsers, setSelectedUsers] =
    useState([]);

  const [groupName, setGroupName] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const toggleUser = (userId) => {
    setSelectedUsers((current) => {
      const exists = current.some(
        (id) =>
          String(id) ===
          String(userId)
      );

      if (exists) {
        return current.filter(
          (id) =>
            String(id) !==
            String(userId)
        );
      }

      return [...current, userId];
    });
  };

  const submit = async () => {
    setError("");

    if (
      mode === "direct" &&
      selectedUsers.length !== 1
    ) {
      setError(
        "Select one user for a direct conversation."
      );

      return;
    }

    if (
      mode === "group" &&
      selectedUsers.length < 2
    ) {
      setError(
        "Select at least two other users for a group."
      );

      return;
    }

    if (
      mode === "group" &&
      !groupName.trim()
    ) {
      setError(
        "Enter a group name."
      );

      return;
    }

    try {
      setCreating(true);

      if (mode === "direct") {
        await onCreateDirect(
          selectedUsers[0]
        );
      } else {
        await onCreateGroup(
          groupName.trim(),
          selectedUsers
        );
      }

      onClose();
    } catch (requestError) {
      setError(
        requestError?.response
          ?.data?.message ||
          requestError?.message ||
          "Failed to create conversation."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            New conversation
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() =>
                setMode("direct")
              }
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                mode === "direct"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Direct
            </button>

            <button
              type="button"
              onClick={() =>
                setMode("group")
              }
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                mode === "group"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Group
            </button>
          </div>

          {mode === "group" && (
            <input
              value={groupName}
              onChange={(event) =>
                setGroupName(
                  event.target.value
                )
              }
              maxLength={100}
              placeholder="Group name"
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          )}

          <UserSelector
            users={users}
            selectedUsers={
              selectedUsers
            }
            onToggle={toggleUser}
            loading={loadingUsers}
          />

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={creating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversation;