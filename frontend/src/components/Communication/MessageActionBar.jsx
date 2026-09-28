import {
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
  CheckSquare,
  Reply
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
  reactions = [],
  userId,
  reacting = false,

  mobileOpen = false,
  menuOpen = false,

  deletingForMe = false,
  deletingForEveryone = false,

  canReply = true,
  
  canReact = true,

  onReaction,
  onReply,
  onMore,
  onSelect,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
}) => {
  const hasReacted = (reaction) =>
    Boolean(
      reaction?.userIds?.some(
        (id) => String(id) === String(userId)
      )
    );

  const deleting =
    deletingForMe || deletingForEveryone;

  return (
    <div
      className={`
        absolute
        ${own ? "right-0" : "left-0"}
        -top-12
        z-[60]
        flex
        w-max
        max-w-[calc(100vw-32px)]
        flex-col
        items-${own ? "end" : "start"}
        pointer-events-none
        transition-all
        duration-150
        ease-out
        ${
          mobileOpen || menuOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0"
        }
      `}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {/* =====================================================
          ACTION BAR
      ====================================================== */}

      <div
        className="
          pointer-events-auto
          flex
          w-max
          items-center
          gap-1
          rounded-2xl
          border
          border-slate-200/80
          bg-white/95
          px-2
          py-1.5
          shadow-[0_8px_30px_rgba(15,23,42,0.14)]
          backdrop-blur-md
        "
      >
        {/* QUICK REACTIONS */}

        {canReact &&
          QUICK_REACTIONS.map((emoji) => {
            const selected = reactions.some(
              (reaction) =>
                reaction?.emoji === emoji &&
                hasReacted(reaction)
            );

            return (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  onReaction?.(emoji)
                }
                disabled={
                  reacting || deleting
                }
                aria-label={`React ${emoji}`}
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-lg
                  transition-all
                  duration-150

                  ${
                    selected
                      ? "scale-105 bg-blue-50 ring-2 ring-blue-400"
                      : "hover:scale-105 hover:bg-slate-100"
                  }

                  ${
                    reacting || deleting
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }
                `}
              >
                {emoji}
              </button>
            );
          })}

        <div
          className="
            mx-1
            h-6
            w-px
            shrink-0
            bg-slate-200
          "
        />

        {/* MORE */}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onMore?.();
          }}
          disabled={deleting}
          aria-label="More message actions"
          aria-expanded={menuOpen}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            text-slate-500
            transition-all
            duration-150
            hover:bg-slate-100
            hover:text-slate-900
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* =====================================================
          THREE DOT MENU
      ====================================================== */}

      {menuOpen && (
        <div
          className={`
            pointer-events-auto
            absolute
            top-full
            mt-2
            w-56
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-1
            shadow-[0_12px_40px_rgba(15,23,42,0.18)]
            ${
              own
                ? "right-0"
                : "left-0"
            }
          `}
        >

          {/* REPLY */}

          {canReply && (
            <>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  onReply?.();
                }}
                disabled={deleting}
                aria-label="Reply to message"
                title="Reply"
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Reply size={15} />

                <span>Reply</span>
              </button>
            </>
          )}
          {/* SELECT */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect?.();
            }}
            disabled={deleting}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckSquare
              size={17}
              className="text-slate-500"
            />

            <span>Select</span>
          </button>

          {/* DELETE FOR ME */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDeleteForMe?.();
            }}
            disabled={deleting}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {deletingForMe ? (
              <Loader2
                size={17}
                className="animate-spin text-slate-500"
              />
            ) : (
              <Trash2
                size={17}
                className="text-slate-500"
              />
            )}

            <span>Delete for me</span>
          </button>

          {/* DELETE FOR EVERYONE */}

          {own && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDeleteForEveryone?.();
              }}
              disabled={deleting}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-left
                text-sm
                font-medium
                text-red-600
                transition
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {deletingForEveryone ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={17} />
              )}

              <span>
                Delete for everyone
              </span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          {/* CANCEL */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCancel?.();
            }}
            disabled={deleting}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-slate-500
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={17} />

            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageActionBar;