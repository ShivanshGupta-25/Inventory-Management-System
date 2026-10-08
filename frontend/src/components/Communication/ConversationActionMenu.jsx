import {
  Check,
  Pin,
  BellOff,
  Bell,
  Trash2,
  X,
  LogOut,
  Users,
} from "lucide-react";

import { useState } from "react";

const ConversationActionMenu = ({
  conversation,
  currentUserId,

  x = 0,
  y = 0,

  mobile = false,

  pinned = false,
  muted = false,

  onMarkUnread,
  onTogglePin,
  onToggleMute,
  onDelete,

  /*
   * Opens GroupInfo.
   *
   * options:
   * {
   *   openExitDelete: true
   * }
   */
  onOpenGroupInfo,

  onClose,
}) => {
  const [
    showGroupDeleteWarning,
    setShowGroupDeleteWarning,
  ] = useState(false);

  if (!conversation) {
    return null;
  }

  const conversationId =
    conversation?.id ||
    conversation?._id ||
    null;

  /* =====================================================
     DETERMINE CONVERSATION TYPE
  ====================================================== */

  const isGroup =
    conversation?.type === "group";

  /* =====================================================
     CURRENT USER PARTICIPANT
  ====================================================== */

  const currentParticipant =
    conversation?.participants?.find(
      (participant) => {
        const participantUserId =
          participant?.id ||
          participant?._id ||
          participant?.userId ||
          participant?.user?._id ||
          participant?.user?.id;

        return (
          String(participantUserId) ===
          String(currentUserId)
        );
      }
    );

  /* =====================================================
     CHECK WHETHER USER LEFT THE GROUP
  ====================================================== */

  const hasLeftGroup =
    isGroup &&
    (
      conversation?.isLeft === true ||
      Boolean(
        currentParticipant?.deletedAt
      ) ||
      currentParticipant?.isActive === false
    );

  /*
   * Direct conversations can be deleted
   * immediately.
   *
   * A group can only be directly deleted
   * after the current user has already left.
   */
  const canDirectlyDelete =
    !isGroup || hasLeftGroup;

  /* =====================================================
     DELETE / EXIT HANDLER
  ====================================================== */

  const handleDelete = () => {
    if (!conversationId) {
      console.error(
        "Cannot delete conversation: missing conversation ID",
        conversation
      );

      return;
    }

    /*
     * Direct conversation
     * OR
     * group that has already been left.
     */
    if (canDirectlyDelete) {
      onDelete?.(conversationId);
      onClose?.();

      return;
    }

    /*
     * Active group member.
     *
     * The user must leave the group first.
     * Open GroupInfo so the user can choose:
     *
     * - Exit Group
     * - Exit & Delete Group
     */
    setShowGroupDeleteWarning(true);
  };

  /* =====================================================
     GROUP DELETE WARNING
  ====================================================== */

  const groupDeleteWarning =
    showGroupDeleteWarning && (
      <div
        className="
          fixed
          inset-0
          z-[220]
          flex
          items-center
          justify-center
          bg-slate-900/40
          p-5
        "
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            setShowGroupDeleteWarning(false);
          }
        }}
      >
        <div
          className="
            w-full
            max-w-[380px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
          "
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          {/* =================================================
              HEADER
          ================================================== */}

          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <LogOut size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900">
                Exit group first
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                You are still a member of this
                group. To remove this group from
                your conversations, you need to
                leave it first.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowGroupDeleteWarning(false)
              }
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
              "
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="p-4">
            <button
              type="button"
              onClick={() => {
                setShowGroupDeleteWarning(false);

                /*
                 * Close the context menu first.
                 */
                onClose?.();

                /*
                 * Open GroupInfo and tell it
                 * to immediately show the
                 * Exit & Delete confirmation.
                 */
                onOpenGroupInfo?.({
                  openExitDelete: true,
                });
              }}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                bg-blue-600
                px-4
                py-3
                text-left
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-700
              "
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Users size={17} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block">
                  Open Group Info
                </span>

                <span className="mt-0.5 block text-[11px] font-normal text-blue-100">
                  Exit or exit and delete the group
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setShowGroupDeleteWarning(false)
              }
              className="
                mt-2
                w-full
                rounded-xl
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
          </div>
        </div>
      </div>
    );

  /* =====================================================
     MOBILE ACTION SHEET
  ====================================================== */

  if (mobile) {
    return (
      <>
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-end
            bg-slate-900/30
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              onClose?.();
            }
          }}
        >
          <div
            className="
              w-full
              rounded-t-2xl
              border-t
              border-slate-200
              bg-white
              p-4
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Drag handle */}

            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

            {/* Header */}

            <div className="mb-3 px-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                Manage conversation
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                Choose an action
              </p>
            </div>

            <div className="space-y-1">
              {/* =================================================
                  MARK UNREAD
              ================================================== */}

              {/* <button
                type="button"
                onClick={() => {
                  onMarkUnread?.(
                    conversation
                  );

                  onClose?.();
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
                  text-sm
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <Check
                  size={17}
                  className="text-slate-500"
                />

                <span>
                  Mark as unread
                </span>
              </button> */}

              {/* =================================================
                  PIN
              ================================================== */}

              {/* <button
                type="button"
                onClick={() => {
                  onTogglePin?.(
                    conversation
                  );

                  onClose?.();
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
                  text-sm
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <Pin
                  size={17}
                  className="text-slate-500"
                />

                <span>
                  {pinned
                    ? "Unpin conversation"
                    : "Pin conversation"}
                </span>
              </button> */}

              {/* =================================================
                  MUTE
              ================================================== */}

              {/* <button
                type="button"
                onClick={() => {
                  onToggleMute?.(
                    conversation
                  );

                  onClose?.();
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
                  text-sm
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                {muted ? (
                  <Bell
                    size={17}
                    className="text-slate-500"
                  />
                ) : (
                  <BellOff
                    size={17}
                    className="text-slate-500"
                  />
                )}

                <span>
                  {muted
                    ? "Unmute notifications"
                    : "Mute notifications"}
                </span>
              </button> */}

              <div className="my-2 border-t border-slate-100" />

              {/* =================================================
                  DELETE / EXIT & DELETE
              ================================================== */}

              <button
                type="button"
                onClick={handleDelete}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-3
                  text-left
                  text-sm
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >
                {isGroup &&
                !canDirectlyDelete ? (
                  <LogOut size={17} />
                ) : (
                  <Trash2 size={17} />
                )}

                <span>
                  {isGroup &&
                  !canDirectlyDelete
                    ? "Exit & delete group"
                    : "Delete conversation"}
                </span>
              </button>
            </div>

            {/* =================================================
                CANCEL
            ================================================== */}

            <button
              type="button"
              onClick={onClose}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-slate-100
                px-3
                py-3
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-200
              "
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>

        {groupDeleteWarning}
      </>
    );
  }

  /* =====================================================
     DESKTOP CONTEXT MENU
  ====================================================== */

  const menuWidth = 220;
  const menuHeight = 230;
  const padding = 8;

  const left = Math.min(
    x,
    window.innerWidth -
      menuWidth -
      padding
  );

  const top = Math.min(
    y,
    window.innerHeight -
      menuHeight -
      padding
  );

  return (
    <>
      <div
        className="
          fixed
          z-[100]
          w-[220px]
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          py-1
          shadow-xl
        "
        style={{
          left: Math.max(
            padding,
            left
          ),
          top: Math.max(
            padding,
            top
          ),
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            MARK UNREAD
        ================================================== */}

        {/* <button
          type="button"
          onClick={() => {
            onMarkUnread?.(
              conversation
            );

            onClose?.();
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            px-3
            py-2.5
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-50
          "
        >
          <Check
            size={16}
            className="text-slate-500"
          />

          <span>
            Mark as unread
          </span>
        </button> */}

        {/* =================================================
            PIN
        ================================================== */}

        {/* <button
          type="button"
          onClick={() => {
            onTogglePin?.(
              conversation
            );

            onClose?.();
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            px-3
            py-2.5
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-50
          "
        >
          <Pin
            size={16}
            className="text-slate-500"
          />

          <span>
            {pinned
              ? "Unpin conversation"
              : "Pin conversation"}
          </span>
        </button> */}

        {/* =================================================
            MUTE
        ================================================== */}

        {/* <button
          type="button"
          onClick={() => {
            onToggleMute?.(
              conversation
            );

            onClose?.();
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            px-3
            py-2.5
            text-left
            text-sm
            text-slate-700
            transition
            hover:bg-slate-50
          "
        >
          {muted ? (
            <Bell
              size={16}
              className="text-slate-500"
            />
          ) : (
            <BellOff
              size={16}
              className="text-slate-500"
            />
          )}

          <span>
            {muted
              ? "Unmute notifications"
              : "Mute notifications"}
          </span>
        </button> */}

        <div className="my-1 border-t border-slate-100" />

        {/* =================================================
            DELETE / EXIT & DELETE
        ================================================== */}

        <button
          type="button"
          onClick={handleDelete}
          className="
            flex
            w-full
            items-center
            gap-3
            px-3
            py-2.5
            text-left
            text-sm
            text-red-600
            transition
            hover:bg-red-50
          "
        >
          {isGroup &&
          !canDirectlyDelete ? (
            <LogOut size={16} />
          ) : (
            <Trash2 size={16} />
          )}

          <span>
            {isGroup &&
            !canDirectlyDelete
              ? "Exit & delete group"
              : "Delete conversation"}
          </span>
        </button>
      </div>

      {groupDeleteWarning}
    </>
  );
};

export default ConversationActionMenu;