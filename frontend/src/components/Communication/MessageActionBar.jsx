import {
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";

const QUICK_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🙏",
];

const MessageActionBar = ({
  own,
  reactions,
  userId,
  reacting,
  mobileOpen,
  menuOpen,
  deletingForMe,
  deletingForEveryone,
  canReact = true,
  onReaction,
  onMore,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
}) => {
  const hasReacted = (reaction) => {
    return Boolean(
      reaction?.userIds?.some(
        (id) =>
          String(id) === String(userId)
      )
    );
  };

  const deleting =
    deletingForMe ||
    deletingForEveryone;

  return (
    <div
      className={`absolute ${
        own ? "right-0" : "left-0"
      } -top-12 z-50 transition-all duration-150 ${
        mobileOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
      }`}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {/* =================================================
          ACTION BAR
      ================================================== */}

      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-xl">
        {canReact &&
          QUICK_REACTIONS.map((emoji) => {
            const selected =
              reactions.some(
                (reaction) =>
                  reaction.emoji === emoji &&
                  hasReacted(reaction)
              );

            return (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  onReaction(emoji)
                }
                disabled={reacting || deleting}
                aria-label={`React ${emoji}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-lg transition ${
                  selected
                    ? "bg-blue-100 ring-2 ring-blue-400"
                    : "hover:bg-slate-100"
                } ${
                  reacting || deleting
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                {emoji}
              </button>
            );
          })}

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <button
          type="button"
          onClick={onMore}
          disabled={deleting}
          aria-label="More message actions"
          aria-expanded={menuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* =================================================
          THREE-DOT MENU
      ================================================== */}

      {menuOpen && (
        <div
          className={`absolute top-full mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-2xl ${
            own
              ? "right-0"
              : "left-0"
          }`}
        >
          <button
            type="button"
            onClick={onDeleteForMe}
            disabled={deleting}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingForMe ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            <span>
              Delete for me
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />

            <span>
              Cancel
            </span>
          </button>

          {own && (
            <button
              type="button"
              onClick={
                onDeleteForEveryone
              }
              disabled={deleting}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingForEveryone ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={16} />
              )}

              <span>
                Delete for everyone
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageActionBar;