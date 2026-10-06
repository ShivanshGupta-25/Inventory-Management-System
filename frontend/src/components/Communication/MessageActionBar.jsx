import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
  CheckSquare,
  Reply,
} from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const BAR_GAP = 6; // gap between message and bar
const MENU_GAP = 8; // gap between bar and menu
const EDGE = 8; // min distance from viewport / scroller edges
const MENU_WIDTH = 224; // w-56
const MENU_FALLBACK_HEIGHT = 240;

const TONES = {
  default: "text-slate-700 hover:bg-slate-50",
  danger: "text-red-600 hover:bg-red-50",
  muted: "text-slate-500 hover:bg-slate-50",
};

const MenuButton = ({
  icon,
  label,
  onClick,
  disabled,
  tone = "default",
  ...rest
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick?.();
    }}
    disabled={disabled}
    className={`
      flex w-full items-center gap-3 rounded-xl px-3 py-2.5
      text-left text-sm font-medium transition
      disabled:cursor-not-allowed disabled:opacity-50
      ${TONES[tone]}
    `}
    {...rest}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/*
 * Renders in a portal on document.body with position: fixed, so it is
 * never clipped by the scrolling message list. Position is recomputed
 * from the anchor (the message shell) on open, scroll and resize, and
 * flips above/below depending on available space.
 *
 * Props added:
 * - anchorRef : ref to the message shell element
 * - layerId   : message id, used by the parent's outside-click check
 */
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

  anchorRef,
  layerId,

  onReaction,
  onReply,
  onMore,
  onSelect,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
}) => {
  const open = mobileOpen || menuOpen;
  const deleting = deletingForMe || deletingForEveryone;

  const barRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  const hasReacted = (reaction) =>
    Boolean(
      reaction?.userIds?.some((id) => String(id) === String(userId))
    );

  const reposition = useCallback(() => {
    const anchor = anchorRef?.current;
    const bar = barRef.current;

    if (!anchor || !bar) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Visible region of the message list (fallback: viewport)
    const scroller = anchor.closest(".overflow-y-auto");
    const bounds = scroller
      ? scroller.getBoundingClientRect()
      : { top: 0, bottom: vh };

    const minTop = Math.max(bounds.top, 0) + EDGE;
    const maxBottom = Math.min(bounds.bottom, vh) - EDGE;

    const barW = bar.offsetWidth;
    const barH = bar.offsetHeight;

    /* ----- BAR: above the message, else below ----- */

    let barTop = rect.top - barH - BAR_GAP;

    if (barTop < minTop) {
      barTop = rect.bottom + BAR_GAP;
    }

    barTop = Math.min(
      Math.max(barTop, minTop),
      Math.max(minTop, maxBottom - barH)
    );

    let barLeft = own ? rect.right - barW : rect.left;
    barLeft = Math.min(
      Math.max(barLeft, EDGE),
      Math.max(EDGE, vw - barW - EDGE)
    );

    /* ----- MENU: below the bar, else above ----- */

    let menuTop = 0;
    let menuLeft = 0;
    let menuMaxHeight = vh - EDGE * 2;

    if (menuOpen) {
      const menuH = menuRef.current?.offsetHeight || MENU_FALLBACK_HEIGHT;

      const belowTop = barTop + barH + MENU_GAP;
      const aboveTop = barTop - menuH - MENU_GAP;

      if (belowTop + menuH <= maxBottom) {
        menuTop = belowTop;
      } else if (aboveTop >= minTop) {
        menuTop = aboveTop;
      } else {
        // Neither fits inside the list: use whichever has more
        // room, and clamp to the viewport.
        const roomBelow = vh - EDGE - belowTop;
        const roomAbove = barTop - MENU_GAP - EDGE;

        menuTop =
          roomBelow >= roomAbove
            ? belowTop
            : Math.max(EDGE, aboveTop);
      }

      menuTop = Math.min(
        Math.max(menuTop, EDGE),
        Math.max(EDGE, vh - EDGE - Math.min(menuH, menuMaxHeight))
      );

      menuLeft = own ? barLeft + barW - MENU_WIDTH : barLeft;
      menuLeft = Math.min(
        Math.max(menuLeft, EDGE),
        Math.max(EDGE, vw - MENU_WIDTH - EDGE)
      );
    }

    setPos((prev) => {
      const next = {
        barTop,
        barLeft,
        menuTop,
        menuLeft,
        menuMaxHeight,
      };

      if (
        prev &&
        Object.keys(next).every((key) => prev[key] === next[key])
      ) {
        return prev;
      }

      return next;
    });
  }, [anchorRef, own, menuOpen]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return undefined;
    }

    reposition();

    // Menu height is only known after it renders; measure again
    const frame = requestAnimationFrame(reposition);

    window.addEventListener("resize", reposition);
    // capture: true catches scrolling of any ancestor
    window.addEventListener("scroll", reposition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, menuOpen, reposition]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const stop = (event) => event.stopPropagation();

  const layerProps = {
    "data-action-layer": String(layerId ?? ""),
    onPointerDown: stop,
    onClick: stop,
  };

  const hidden = !pos;

  return createPortal(
    <>
      {/* ================= ACTION BAR ================= */}

      <div
        ref={barRef}
        {...layerProps}
        style={{
          position: "fixed",
          top: pos?.barTop ?? 0,
          left: pos?.barLeft ?? 0,
          visibility: hidden ? "hidden" : "visible",
        }}
        className="
          z-[9980]
          flex
          w-max
          max-w-[calc(100vw-16px)]
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
        {canReact &&
          QUICK_REACTIONS.map((emoji) => {
            const selected = reactions.some(
              (reaction) =>
                reaction?.emoji === emoji && hasReacted(reaction)
            );

            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onReaction?.(emoji)}
                disabled={reacting || deleting}
                aria-label={`React ${emoji}`}
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center
                  rounded-full text-lg transition-all duration-150
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

        <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

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
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-full text-slate-500 transition-all duration-150
            hover:bg-slate-100 hover:text-slate-900 active:scale-95
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      {/* ================= THREE DOT MENU ================= */}

      {menuOpen && (
        <div
          ref={menuRef}
          {...layerProps}
          style={{
            position: "fixed",
            top: pos?.menuTop ?? 0,
            left: pos?.menuLeft ?? 0,
            width: MENU_WIDTH,
            maxHeight: pos?.menuMaxHeight,
            visibility: hidden ? "hidden" : "visible",
          }}
          className="
            z-[9990]
            overflow-y-auto
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-1
            shadow-[0_12px_40px_rgba(15,23,42,0.18)]
          "
        >
          {canReply && (
            <MenuButton
              icon={<Reply size={17} className="text-slate-500" />}
              label="Reply"
              onClick={onReply}
              disabled={deleting}
              aria-label="Reply to message"
              title="Reply"
            />
          )}

          <MenuButton
            icon={<CheckSquare size={17} className="text-slate-500" />}
            label="Select"
            onClick={onSelect}
            disabled={deleting}
          />

          <MenuButton
            icon={
              deletingForMe ? (
                <Loader2
                  size={17}
                  className="animate-spin text-slate-500"
                />
              ) : (
                <Trash2 size={17} className="text-slate-500" />
              )
            }
            label="Delete for me"
            onClick={onDeleteForMe}
            disabled={deleting}
          />

          {own && (
            <MenuButton
              tone="danger"
              icon={
                deletingForEveryone ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )
              }
              label="Delete for everyone"
              onClick={onDeleteForEveryone}
              disabled={deleting}
            />
          )}

          <div className="my-1 border-t border-slate-100" />

          <MenuButton
            tone="muted"
            icon={<X size={17} />}
            label="Cancel"
            onClick={onCancel}
            disabled={deleting}
          />
        </div>
      )}
    </>,
    document.body
  );
};

export default MessageActionBar;