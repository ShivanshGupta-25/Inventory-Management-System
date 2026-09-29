import { useState } from "react";
import {
  MessageSquare,
  Users,
  X,
} from "lucide-react";

import UserSelector from "./UserSelector";

const NewConversation = ({
  users,
  loadingUsers,
  onClose,
  onCreateDirect,
  onCreateGroup,
  currentUserRole,
}) => {
  const isStaff =
    String(currentUserRole || "").toLowerCase() ===
    "staff";

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

  /* =========================================================
     USER SELECTION
  ========================================================= */

  const toggleUser = (userId) => {
    setSelectedUsers((current) => {
      const exists = current.some(
        (id) =>
          String(id) ===
          String(userId)
      );

      /*
       * DIRECT CONVERSATION
       *
       * Only one user can be selected.
       *
       * Clicking the currently selected user
       * will unselect them.
       *
       * Clicking another user replaces the
       * previous selection.
       */
      if (mode === "direct") {
        if (exists) {
          return [];
        }

        return [userId];
      }

      /*
       * GROUP CONVERSATION
       *
       * Multiple users can be selected.
       */
      if (exists) {
        return current.filter(
          (id) =>
            String(id) !==
            String(userId)
        );
      }

      return [...current, userId];
    });

    /*
     * Clear any previous validation error
     * once the user changes the selection.
     */
    setError("");
  };

  /* =========================================================
     CHANGE MODE
  ========================================================= */

  const changeMode = (nextMode) => {
    /*
     * Staff cannot switch to group mode.
     */
    if (
      isStaff &&
      nextMode === "group"
    ) {
      return;
    }

    setMode(nextMode);
    setError("");

    /*
     * When switching to direct mode,
     * only keep one selected user.
     */
    if (
      nextMode === "direct"
    ) {
      setSelectedUsers((current) =>
        current.length > 0
          ? [current[0]]
          : []
      );

      setGroupName("");

      return;
    }

    /*
     * When switching to group mode,
     * start with no selected users.
     */
    setSelectedUsers([]);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const submit = async () => {
    setError("");

    /*
     * Extra frontend protection.
     */
    if (
      isStaff &&
      mode === "group"
    ) {
      setError(
        "Staff members cannot create group conversations."
      );

      return;
    }

    /* =====================================================
       DIRECT VALIDATION
    ===================================================== */

    if (
      mode === "direct" &&
      selectedUsers.length !== 1
    ) {
      setError(
        "Select one user for a direct conversation."
      );

      return;
    }

    /* =====================================================
       GROUP VALIDATION
    ===================================================== */

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

    /* =====================================================
       CREATE
    ===================================================== */

    try {
      setCreating(true);

      if (
        mode === "direct"
      ) {
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">

      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <MessageSquare
                size={17}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                New conversation
              </h2>

              <p className="text-xs text-slate-400">
                Start a conversation with your team
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>

        </div>

        {/* =================================================
            BODY
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">

          {/* =================================================
              MODE
          ================================================== */}

          <div
            className={`mb-5 grid gap-1 rounded-xl bg-slate-100 p-1 ${
              isStaff
                ? "grid-cols-1"
                : "grid-cols-2"
            }`}
          >

            {/* DIRECT */}

            <button
              type="button"
              onClick={() =>
                changeMode("direct")
              }
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                mode === "direct"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquare
                size={15}
              />

              Direct
            </button>

            {/* GROUP */}

            {!isStaff && (
              <button
                type="button"
                onClick={() =>
                  changeMode("group")
                }
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  mode === "group"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Users
                  size={15}
                />

                Group
              </button>
            )}

          </div>

          {/* =================================================
              GROUP NAME
          ================================================== */}

          {mode === "group" &&
            !isStaff && (
              <div className="mb-4">

                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Group name
                </label>

                <input
                  value={groupName}
                  onChange={(event) =>
                    setGroupName(
                      event.target.value
                    )
                  }
                  maxLength={100}
                  placeholder="e.g. Management Team"
                  disabled={creating}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>
            )}

          {/* =================================================
              USER SELECTOR
          ================================================== */}

          <UserSelector
            users={users}
            selectedUsers={
              selectedUsers
            }
            onToggle={
              toggleUser
            }
            loading={
              loadingUsers
            }
          />

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-5 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={creating}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create conversation"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default NewConversation;