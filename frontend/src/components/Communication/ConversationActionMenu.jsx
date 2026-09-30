import {
  Check,
  Pin,
  BellOff,
  Bell,
  Trash2,
  X,
} from "lucide-react";

const ConversationActionMenu = ({
  conversation,
  x = 0,
  y = 0,
  mobile = false,
  pinned = false,
  muted = false,
  onMarkUnread,
  onTogglePin,
  onToggleMute,
  onDelete,
  onClose,
}) => {
  if (!conversation) {
    return null;
  }

  /*
   * Resolve the actual conversation ID.
   *
   * Conversation objects may use either
   * `id` or `_id` depending on whether they
   * came from the frontend state or MongoDB.
   */
  const conversationId =
    conversation?.id ||
    conversation?._id ||
    null;

  /*
   * MOBILE
   *
   * Use a bottom sheet instead of a
   * cursor-based context menu.
   */
  if (mobile) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-end bg-slate-900/30"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <div
          className="w-full rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              Manage conversation
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              Choose an action
            </p>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onMarkUnread?.(conversation);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <Check
                size={17}
                className="text-slate-500"
              />

              <span>
                Mark as unread
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onTogglePin?.(conversation);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
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
            </button>

            <button
              type="button"
              onClick={() => {
                onToggleMute?.(conversation);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
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
            </button>

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                if (!conversationId) {
                  console.error(
                    "Cannot delete conversation: missing conversation ID",
                    conversation
                  );

                  return;
                }

                onDelete?.(
                  conversationId
                );

                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={17} />

              <span>
                Delete conversation
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <X size={16} />

            Cancel
          </button>
        </div>
      </div>
    );
  }

  /*
   * DESKTOP CONTEXT MENU
   */
  const menuWidth = 220;
  const menuHeight = 230;
  const padding = 8;

  const left =
    Math.min(
      x,
      window.innerWidth -
        menuWidth -
        padding
    );

  const top =
    Math.min(
      y,
      window.innerHeight -
        menuHeight -
        padding
    );

  return (
    <div
      className="fixed z-[100] w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
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
      {/* <button
        type="button"
        onClick={() => {
          onMarkUnread?.(conversation);
          onClose();
        }}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <Check
          size={16}
          className="text-slate-500"
        />

        <span>
          Mark as unread
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          onTogglePin?.(conversation);
          onClose();
        }}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
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
      </button>

      <button
        type="button"
        onClick={() => {
          onToggleMute?.(conversation);
          onClose();
        }}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
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

      <button
        type="button"
        onClick={() => {
          if (!conversationId) {
            console.error(
              "Cannot delete conversation: missing conversation ID",
              conversation
            );

            return;
          }

          onDelete?.(
            conversationId
          );

          onClose();
        }}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={16} />

        <span>
          Delete conversation
        </span>
      </button>
    </div>
  );
};

export default ConversationActionMenu;