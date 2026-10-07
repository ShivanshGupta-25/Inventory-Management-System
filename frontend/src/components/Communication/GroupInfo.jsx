import {
  Check,
  ChevronRight,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCommunication } from "../../context/CommunicationContext";

const GroupInfo = ({
  conversation,
  currentUserId,
  onClose,
  initialAction = null,
}) => {
  const {
    users,
    searchUsers,
    addGroupMembers,
    exitGroup,
    deleteConversationForMe,
  } = useCommunication();

  /* =====================================================
     STATE
  ====================================================== */

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

  const [
    confirmExitAndDelete,
    setConfirmExitAndDelete,
  ] = useState(false);

  /* =====================================================
     SAFETY
  ====================================================== */

  if (!conversation) {
    return null;
  }

  /* =====================================================
     HELPERS
  ====================================================== */

  const conversationId =
    conversation?.id ||
    conversation?._id ||
    null;

  const participants = Array.isArray(
    conversation.participants
  )
    ? conversation.participants
    : [];

  const currentParticipant =
    participants.find(
      (participant) =>
        String(
          participant?.id ||
            participant?._id ||
            participant?.userId ||
            participant?.user?._id ||
            participant?.user?.id
        ) === String(currentUserId)
    );

  const isAdmin =
    currentParticipant?.participantRole ===
      "admin" ||
    currentParticipant?.role === "admin";

  const admins = participants.filter(
    (participant) =>
      participant?.participantRole ===
        "admin" ||
      participant?.role === "admin"
  );

  const groupName =
    conversation.name ||
    conversation.title ||
    "Unnamed Group";

  const groupInitial =
    groupName.charAt(0).toUpperCase();

  /* =====================================================
     MEMBER IDS
  ====================================================== */

  const existingMemberIds = useMemo(
    () =>
      new Set(
        participants.map((participant) =>
          String(
            participant?.id ||
              participant?._id ||
              participant?.userId ||
              participant?.user?._id ||
              participant?.user?.id
          )
        )
      ),
    [participants]
  );

  /* =====================================================
     AVAILABLE USERS
  ====================================================== */

  const availableUsers = useMemo(() => {
    const query =
      memberSearch
        .trim()
        .toLowerCase();

    return (users || [])
      .filter(
        (user) =>
          !existingMemberIds.has(
            String(
              user?.id ||
                user?._id
            )
          )
      )
      .filter((user) => {
        if (!query) {
          return true;
        }

        const name =
          user?.name ||
          user?.fullName ||
          "";

        const email =
          user?.email || "";

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

  /* =====================================================
     LOAD USERS
  ====================================================== */

  useEffect(() => {
    if (!showAddMembers) {
      return;
    }

    let cancelled = false;

    const loadUsers = async () => {
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

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [
    showAddMembers,
    searchUsers,
  ]);

  /* =====================================================
     INITIAL ACTION
  ====================================================== */

  useEffect(() => {
    if (
      initialAction ===
      "exit-delete"
    ) {
      /*
       * Open the confirmation after
       * GroupInfo has mounted.
       */
      setError("");
      setConfirmExitAndDelete(true);
    }
  }, [initialAction]);

  /* =====================================================
     MEMBER SELECTION
  ====================================================== */

  const toggleMember = (userId) => {
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

  /* =====================================================
     ADD MEMBERS
  ====================================================== */

  const handleAddMembers = async () => {
    if (
      !conversationId ||
      !selectedMemberIds.size
    ) {
      return;
    }

    try {
      setAddingMembers(true);
      setError("");

      await addGroupMembers(
        conversationId,
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

  /* =====================================================
     EXIT GROUP
  ====================================================== */

  const handleExitGroup = async () => {
    if (!conversationId) {
      return;
    }

    /*
     * Do not allow the sole admin to
     * leave without promoting another
     * member first.
     */
    if (
      isAdmin &&
      admins.length === 1
    ) {
      setError(
        "You are the only admin. Promote another member to admin before leaving the group."
      );

      return;
    }

    try {
      setExitingGroup(true);
      setError("");

      await exitGroup(
        conversationId
      );

      setConfirmExit(false);

      onClose?.();
    } catch (err) {
      setError(
        err?.message ||
          "Failed to exit group."
      );
    } finally {
      setExitingGroup(false);
    }
  };

  /* =====================================================
     EXIT + DELETE
  ====================================================== */

  const handleExitAndDeleteGroup =
    async () => {
      if (!conversationId) {
        return;
      }

      /*
       * Do not allow the sole admin to
       * leave/delete the group.
       */
      if (
        isAdmin &&
        admins.length === 1
      ) {
        setError(
          "You are the only admin. Promote another member to admin before leaving the group."
        );

        return;
      }

      try {
        setExitingGroup(true);
        setError("");

        /*
         * Step 1:
         * Leave the group.
         *
         * The current backend exposes
         * exitGroup separately.
         */
        await exitGroup(
          conversationId
        );

        /*
         * Step 2:
         * Remove the conversation from
         * the current user's list.
         *
         * This uses the existing
         * deleteConversationForMe flow.
         */
        await deleteConversationForMe(
          conversationId
        );

        setConfirmExitAndDelete(
          false
        );

        onClose?.();
      } catch (err) {
        setError(
          err?.message ||
            "Failed to exit and delete group."
        );
      } finally {
        setExitingGroup(false);
      }
    };

  /* =====================================================
     CLOSE OVERLAYS
  ====================================================== */

  const closeAddMembers = () => {
    if (addingMembers) {
      return;
    }

    setShowAddMembers(false);
    setSelectedMemberIds(
      new Set()
    );
    setMemberSearch("");
  };

  const closeExitConfirmation = () => {
    if (exitingGroup) {
      return;
    }

    setConfirmExit(false);
  };

  const closeExitAndDeleteConfirmation =
    () => {
      if (exitingGroup) {
        return;
      }

      setConfirmExitAndDelete(false);
    };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-slate-950/40
        p-3
        backdrop-blur-[3px]
        sm:p-5
        md:p-6
      "
      role="dialog"
      aria-modal="true"
      aria-label="Group information"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <aside
        className="
          relative
          flex
          h-[calc(100vh-24px)]
          max-h-[900px]
          w-full
          max-w-[720px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.25)]
          sm:h-[calc(100vh-40px)]
          sm:rounded-2xl
          md:h-[min(900px,calc(100vh-48px))]
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
            border-b
            border-slate-200
            bg-white
            px-5
            py-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
          >
            <Users size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-slate-900">
              Group Info
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
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
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close group information"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            GROUP PROFILE
        ================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-slate-200
            px-5
            py-6
          "
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                text-2xl
                font-bold
                text-white
                shadow-lg
                shadow-blue-500/20
              "
            >
              {groupInitial}
            </div>

            <h3 className="mt-4 max-w-full truncate px-4 text-lg font-semibold text-slate-900">
              {groupName}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Group conversation
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                {participants.length}{" "}
                {participants.length === 1
                  ? "member"
                  : "members"}
              </span>

              {isAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                  <ShieldCheck
                    size={11}
                  />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* MEMBERS */}

          <div className="px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Members
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  People in this group
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                {participants.length}
              </span>
            </div>

            <div className="space-y-1">
              {participants.map(
                (participant) => {
                  const participantId =
                    participant?.id ||
                    participant?._id ||
                    participant?.userId ||
                    participant?.user?._id ||
                    participant?.user?.id;

                  const isCurrentUser =
                    String(
                      participantId
                    ) ===
                    String(
                      currentUserId
                    );

                  const name =
                    participant?.name ||
                    participant?.fullName ||
                    participant?.user?.name ||
                    participant?.email ||
                    participant?.user?.email ||
                    "Unknown user";

                  const email =
                    participant?.email ||
                    participant?.user?.email ||
                    "";

                  const role =
                    participant?.participantRole ||
                    participant?.role;

                  return (
                    <div
                      key={participantId}
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        transition
                        hover:bg-slate-50
                      "
                    >
                      {/* Avatar */}

                      <div
                        className="
                          flex
                          h-10
                          w-10
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

                      {/* User */}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {name}
                          </p>

                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600">
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {email ||
                            "Group member"}
                        </p>
                      </div>

                      {/* Role */}

                      {role === "admin" && (
                        <span
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-1
                            rounded-full
                            bg-blue-50
                            px-2
                            py-1
                            text-[10px]
                            font-semibold
                            text-blue-600
                          "
                        >
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

          {/* ERROR */}

          {error && (
            <div className="mx-5 mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-200
            bg-white
            p-4
          "
        >
          {/* ADD MEMBERS */}

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setShowAddMembers(true);
              }}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition
                hover:bg-slate-50
              "
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <UserPlus size={17} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-700">
                  Add Members
                </span>

                <span className="mt-0.5 block text-[11px] text-slate-400">
                  Add people to this group
                </span>
              </span>

              <ChevronRight
                size={17}
                className="text-slate-300"
              />
            </button>
          )}

          {/* DIVIDER */}

          <div className="my-2 border-t border-slate-100" />

          {/* EXIT GROUP */}

          <button
            type="button"
            onClick={() => {
              setError("");
              setConfirmExit(true);
            }}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-left
              transition
              hover:bg-red-50
            "
          >
            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <LogOut size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-red-600">
                Exit Group
              </span>

              <span className="mt-0.5 block text-[11px] text-red-400">
                Leave this conversation
              </span>
            </span>

            <ChevronRight
              size={17}
              className="text-red-200"
            />
          </button>

          {/* EXIT + DELETE */}

          <button
            type="button"
            onClick={() => {
              setError("");
              setConfirmExitAndDelete(
                true
              );
            }}
            className="
              mt-1
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              text-left
              transition
              hover:bg-red-50
            "
          >
            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <Trash2 size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-red-600">
                Exit & Delete Group
              </span>

              <span className="mt-0.5 block text-[11px] text-red-400">
                Leave and remove from your conversations
              </span>
            </span>

            <ChevronRight
              size={17}
              className="text-red-200"
            />
          </button>

          {/* ADMIN WARNING */}

          {isAdmin &&
            admins.length === 1 && (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-700">
                <strong>
                  You are the only admin.
                </strong>{" "}
                Promote another member to
                admin before leaving the group.
              </div>
            )}
        </div>

        {/* =================================================
            ADD MEMBERS MODAL
        ================================================== */}

        {showAddMembers && (
          <div
            className="
              absolute
              inset-0
              z-[210]
              flex
              flex-col
              bg-white
            "
          >
            {/* Header */}

            <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-4">
              <button
                type="button"
                onClick={closeAddMembers}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-slate-500
                  transition
                  hover:bg-slate-100
                "
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

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                {selectedMemberIds.size}
              </span>
            </div>

            {/* Search */}

            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <Search
                  size={16}
                  className="shrink-0 text-slate-400"
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

                {memberSearch && (
                  <button
                    type="button"
                    onClick={() =>
                      setMemberSearch("")
                    }
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Users */}

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
                      Everyone may already
                      be in this group.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {availableUsers.map(
                    (user) => {
                      const id =
                        String(
                          user?.id ||
                            user?._id
                        );

                      const selected =
                        selectedMemberIds.has(
                          id
                        );

                      const name =
                        user?.name ||
                        user?.fullName ||
                        user?.email ||
                        "Unknown user";

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            toggleMember(id)
                          }
                          className={`
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-3
                            text-left
                            transition
                            ${
                              selected
                                ? "bg-blue-50"
                                : "hover:bg-slate-50"
                            }
                          `}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                            {name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {name}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {user?.email ||
                                user?.role ||
                                "User"}
                            </p>
                          </div>

                          <span
                            className={`
                              flex
                              h-6
                              w-6
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

            {/* Add */}

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
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-3
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

        {/* =================================================
            EXIT CONFIRMATION
        ================================================== */}

        {confirmExit && (
          <div
            className="
              absolute
              inset-0
              z-[220]
              flex
              items-center
              justify-center
              bg-slate-950/40
              p-5
            "
          >
            <div
              className="
                w-full
                max-w-[360px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
              "
            >
              <div className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <LogOut size={19} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Exit Group?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You will leave{" "}
                  <strong className="font-medium text-slate-700">
                    {groupName}
                  </strong>{" "}
                  and stop receiving new
                  messages from this group.
                </p>

                {isAdmin &&
                  admins.length === 1 && (
                    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700">
                      You are the only admin.
                      Promote another member
                      before leaving.
                    </div>
                  )}

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    disabled={exitingGroup}
                    onClick={
                      closeExitConfirmation
                    }
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-600
                      transition
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
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
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
          </div>
        )}

        {/* =================================================
            EXIT + DELETE CONFIRMATION
        ================================================== */}

        {confirmExitAndDelete && (
          <div
            className="
              absolute
              inset-0
              z-[230]
              flex
              items-center
              justify-center
              bg-slate-950/50
              p-5
            "
          >
            <div
              className="
                w-full
                max-w-[380px]
                overflow-hidden
                rounded-2xl
                border
                border-red-100
                bg-white
                shadow-2xl
              "
            >
              <div className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 size={19} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  Exit & Delete Group?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You will leave{" "}
                  <strong className="font-medium text-slate-700">
                    {groupName}
                  </strong>{" "}
                  and remove it from your
                  conversations.
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Other group members will not
                  be removed. This only affects
                  your membership and conversation
                  list.
                </p>

                {isAdmin &&
                  admins.length === 1 && (
                    <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700">
                      You are the only admin.
                      Promote another member
                      before leaving the group.
                    </div>
                  )}

                {error && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-600">
                    {error}
                  </div>
                )}

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    disabled={exitingGroup}
                    onClick={
                      closeExitAndDeleteConfirmation
                    }
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-slate-600
                      transition
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
                      handleExitAndDeleteGroup
                    }
                    className="
                      flex-1
                      rounded-xl
                      bg-red-600
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {exitingGroup
                      ? "Processing..."
                      : "Exit & Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default GroupInfo;