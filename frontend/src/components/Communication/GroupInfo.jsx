import {
  Check,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { useCommunication } from "../../context/CommunicationContext";

const GroupInfo = ({
  conversation,
  currentUserId,
  onClose,
//   onExitGroup,
}) => {
  const {
    users,
    searchUsers,
    addGroupMembers,
    exitGroup,
  } = useCommunication();

  const [
    showAddMembers,
    setShowAddMembers,
  ] = useState(false);

  const [
    selectedMemberIds,
    setSelectedMemberIds,
  ] = useState(new Set());

  const [
    memberSearch,
    setMemberSearch,
  ] = useState("");

  const [
    loadingUsers,
    setLoadingUsers,
  ] = useState(false);

  const [
    addingMembers,
    setAddingMembers,
  ] = useState(false);

  const [
    exitingGroup,
    setExitingGroup,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    confirmExit,
    setConfirmExit,
  ] = useState(false);

  if (!conversation) {
    return null;
  }

  const participants = Array.isArray(
    conversation.participants
  )
    ? conversation.participants
    : [];

  const currentParticipant =
    participants.find(
      (participant) =>
        String(participant.id) ===
        String(currentUserId)
    );

  const isAdmin =
    currentParticipant?.participantRole ===
    "admin";

  const admins = participants.filter(
    (participant) =>
      participant.participantRole ===
      "admin"
  );

  const groupName =
    conversation.name ||
    conversation.title ||
    "Unnamed Group";

  /*
   * IDs of people already in this group.
   */
  const existingMemberIds =
    useMemo(
      () =>
        new Set(
          participants.map(
            (participant) =>
              String(participant.id)
          )
        ),
      [participants]
    );

  /*
   * Only users who are not already members
   * should appear in Add Members.
   */
  const availableUsers =
    useMemo(() => {
      const query =
        memberSearch
          .trim()
          .toLowerCase();

      return (users || [])
        .filter(
          (user) =>
            !existingMemberIds.has(
              String(
                user.id ||
                  user._id
              )
            )
        )
        .filter((user) => {
          if (!query) {
            return true;
          }

          const name =
            user.name ||
            user.fullName ||
            "";

          const email =
            user.email || "";

          return (
            name
              .toLowerCase()
              .includes(query) ||
            email
              .toLowerCase()
              .includes(query)
          );
        });
    }, [
      users,
      existingMemberIds,
      memberSearch,
    ]);

  /*
   * Load users when Add Members opens.
   */
  useEffect(() => {
    if (!showAddMembers) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoadingUsers(true);
        setError("");

        await searchUsers("");

        if (cancelled) {
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Failed to load users."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    showAddMembers,
    searchUsers,
  ]);

  const toggleMember = (
    userId
  ) => {
    const id = String(userId);

    setSelectedMemberIds(
      (current) => {
        const next =
          new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      }
    );
  };

  const handleAddMembers = async () => {
    if (
      !conversation.id ||
      !selectedMemberIds.size
    ) {
      return;
    }

    try {
      setAddingMembers(true);
      setError("");

      await addGroupMembers(
        conversation.id,
        Array.from(
          selectedMemberIds
        )
      );

      setSelectedMemberIds(
        new Set()
      );

      setMemberSearch("");
      setShowAddMembers(false);
    } catch (err) {
      setError(
        err?.message ||
          "Failed to add members."
      );
    } finally {
      setAddingMembers(false);
    }
  };

  const handleExitGroup = async () => {
    if (!conversation.id) {
      return;
    }

    try {
      setExitingGroup(true);
      setError("");

      await exitGroup(
        conversation.id
      );

      setConfirmExit(false);
      onClose?.();
    //   onExitGroup?.();
    } catch (err) {
      setError(
        err?.message ||
          "Failed to exit group."
      );
    } finally {
      setExitingGroup(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex
        justify-end
        bg-slate-900/40
        backdrop-blur-[1px]
      "
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <aside
        className="
          relative
          flex
          h-full
          w-full
          max-w-[420px]
          flex-col
          bg-white
          shadow-2xl
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
            border-b
            border-slate-200
            px-4
            py-4
          "
        >
          <div
            className="
              flex h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-blue-500
              to-indigo-600
              text-white
            "
          >
            <Users size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-slate-900">
              Group Info
            </h2>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {participants.length}{" "}
              {participants.length === 1
                ? "member"
                : "members"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* GROUP */}

        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-14 w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                text-lg
                font-semibold
                text-white
              "
            >
              {groupName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {groupName}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Group conversation
              </p>
            </div>
          </div>
        </div>

        {/* MEMBERS */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users
                  size={16}
                  className="text-slate-400"
                />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Members
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {participants.length}
              </span>
            </div>

            <div className="space-y-1">
              {participants.map(
                (participant) => {
                  const isCurrentUser =
                    String(
                      participant.id
                    ) ===
                    String(
                      currentUserId
                    );

                  const name =
                    participant.name ||
                    participant.fullName ||
                    participant.email ||
                    "Unknown user";

                  return (
                    <div
                      key={
                        participant.id
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3 py-3
                        hover:bg-slate-50
                      "
                    >
                      <div
                        className="
                          flex h-9 w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-100
                          text-xs
                          font-semibold
                          text-slate-600
                        "
                      >
                        {name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {name}
                          </p>

                          {isCurrentUser && (
                            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {participant.email ||
                            "Member"}
                        </p>
                      </div>

                      {participant.participantRole ===
                        "admin" && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                          <ShieldCheck
                            size={12}
                          />
                          Admin
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* ACTIONS */}

        <div
          className="
            shrink-0
            border-t
            border-slate-200
            p-4
          "
        >
          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                setShowAddMembers(true)
              }
              className="
                flex w-full
                items-center
                gap-3
                rounded-xl
                px-3 py-3
                text-left
                text-sm
                font-medium
                text-slate-700
                hover:bg-slate-50
              "
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <UserPlus size={17} />
              </span>

              <span>
                <span className="block">
                  Add Members
                </span>

                <span className="mt-0.5 block text-[11px] font-normal text-slate-400">
                  Add people to this group
                </span>
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setConfirmExit(true)
            }
            className="
              mt-1
              flex w-full
              items-center
              gap-3
              rounded-xl
              px-3 py-3
              text-left
              text-sm
              font-medium
              text-red-600
              hover:bg-red-50
            "
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <LogOut size={17} />
            </span>

            <span>
              <span className="block">
                Exit Group
              </span>

              <span className="mt-0.5 block text-[11px] font-normal text-red-400">
                Leave this conversation
              </span>
            </span>
          </button>

          {isAdmin &&
            admins.length === 1 && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-700">
                You are the only admin.
                Promote another member
                before leaving the group.
              </p>
            )}
        </div>

        {/* =========================================
            ADD MEMBERS MODAL
        ========================================= */}

        {showAddMembers && (
          <div
            className="
              absolute inset-0
              z-[210]
              flex
              flex-col
              bg-white
            "
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-4">
              <button
                type="button"
                onClick={() =>
                  setShowAddMembers(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900">
                  Add Members
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  Select people to add
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600">
                {selectedMemberIds.size}
              </span>
            </div>

            {/* SEARCH */}

            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search
                  size={16}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  value={memberSearch}
                  onChange={(event) =>
                    setMemberSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search users..."
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    text-sm
                    text-slate-800
                    outline-none
                    placeholder:text-slate-400
                  "
                />
              </div>
            </div>

            {/* USERS */}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {loadingUsers ? (
                <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Loading users...
                </div>
              ) : availableUsers.length ===
                0 ? (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Users
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      No users available
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Everyone may already be
                      in this group.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {availableUsers.map(
                    (user) => {
                      const id = String(
                        user.id ||
                          user._id
                      );

                      const selected =
                        selectedMemberIds.has(
                          id
                        );

                      const name =
                        user.name ||
                        user.fullName ||
                        user.email ||
                        "Unknown user";

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            toggleMember(
                              id
                            )
                          }
                          className={`
                            flex w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3 py-3
                            text-left
                            transition
                            ${
                              selected
                                ? "bg-blue-50"
                                : "hover:bg-slate-50"
                            }
                          `}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {name}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {user.email ||
                                user.role ||
                                "User"}
                            </p>
                          </div>

                          <span
                            className={`
                              flex h-6 w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 text-transparent"
                              }
                            `}
                          >
                            <Check
                              size={14}
                            />
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* ADD */}

            <div className="shrink-0 border-t border-slate-200 p-4">
              <button
                type="button"
                disabled={
                  !selectedMemberIds.size ||
                  addingMembers
                }
                onClick={
                  handleAddMembers
                }
                className="
                  flex w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4 py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {addingMembers ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus
                      size={17}
                    />
                    Add{" "}
                    {selectedMemberIds.size
                      ? `${selectedMemberIds.size} `
                      : ""}
                    {selectedMemberIds.size ===
                    1
                      ? "Member"
                      : "Members"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================
            EXIT CONFIRMATION
        ========================================= */}

        {confirmExit && (
          <div
            className="
              absolute inset-0
              z-[220]
              flex
              items-center
              justify-center
              bg-slate-900/40
              p-5
            "
          >
            <div
              className="
                w-full
                max-w-[340px]
                rounded-2xl
                bg-white
                p-5
                shadow-2xl
              "
            >
              <h3 className="text-base font-semibold text-slate-900">
                Leave Group?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You will no longer receive
                messages from this group.
              </p>

              {isAdmin &&
                admins.length === 1 && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700">
                    You are the only admin.
                    Promote another member
                    before leaving.
                  </div>
                )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={exitingGroup}
                  onClick={() =>
                    setConfirmExit(false)
                  }
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    px-4 py-2.5
                    text-sm
                    font-medium
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    exitingGroup ||
                    (isAdmin &&
                      admins.length ===
                        1)
                  }
                  onClick={
                    handleExitGroup
                  }
                  className="
                    flex-1
                    rounded-xl
                    bg-red-600
                    px-4 py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {exitingGroup
                    ? "Leaving..."
                    : "Exit Group"}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default GroupInfo;