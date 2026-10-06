import { useEffect, useRef, useState } from "react";
import { Check, MessageCircle, Reply } from "lucide-react";

import { useCommunication } from "../../context/CommunicationContext";
import { useAuth } from "../../context/AuthContext";

import MessageActionBar from "./MessageActionBar";
import MessageReplyQuote from "./MessageReplyQuote";
import MessageAttachments from "./MessageAttachments";
import MessagePreviewModals from "./MessagePreviewModals";

/* =========================================================
   MAIN MESSAGE ITEM

   Supports:
   - Reply / swipe to reply
   - Long press action bar
   - More -> Select
   - Reactions
   - Delete for me / for everyone
   - Attachments, reply previews, threads
   - Delayed hover actions
   - Only ONE open action menu across all messages

   Props added for single-open-menu behaviour:
   - activeMenuMessageId : id of the message whose menu is open (or null)
   - onMenuOpenChange    : MUST be the parent's useState setter
                           (setActiveMenuMessageId). It is called with
                           either an id or a functional updater.
========================================================= */

const SWIPE_TRIGGER_DISTANCE = 56;
const SWIPE_MAX_DISTANCE = 88;
const LONG_PRESS_DURATION = 500;

const MessageItem = ({
  message,
  own,
  onReply,
  onOpenThread,

  selectionMode = false,
  selected = false,
  onToggleSelect,
  onEnterSelectionMode,
  onClearSelection,

  // NEW
  activeMenuMessageId = null,
  onMenuOpenChange,
}) => {
  /* ---------------- LOCAL UI STATE ---------------- */

  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  const [showActionBar, setShowActionBar] = useState(false);
  const [actionBarPlacement, setActionBarPlacement] = useState("top");
  const [showActionMenu, setShowActionMenu] = useState(false);

  const [reacting, setReacting] = useState(false);
  const [deletingForMe, setDeletingForMe] = useState(false);
  const [deletingForEveryone, setDeletingForEveryone] = useState(false);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  /* ---------------- CONTEXT ---------------- */

  const {
    toggleMessageReaction,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useCommunication();

  const { user } = useAuth();

  /* ---------------- REFS ---------------- */

  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    tracking: false,
    lockedAxis: null,
  });

  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef(null);

  const hoverTimerRef = useRef(null);
  const hoverCloseTimerRef = useRef(null);
  const messageShellRef = useRef(null);

  // Always-current copy of showActionMenu for use inside timeouts
  const showActionMenuRef = useRef(false);
  showActionMenuRef.current = showActionMenu;

  /* ---------------- DATA ---------------- */

  const messageId = message?.id || message?._id;

  const text = message?.text || message?.content || "";

  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : [];

  const reactions = Array.isArray(message?.reactions)
    ? message.reactions
    : [];

  const hasText = Boolean(text.trim());
  const hasAttachments = attachments.length > 0;
  const repliedMessage = message?.replyTo || null;
  const deletedForEveryone = Boolean(message?.deletedForEveryone);

  const senderName =
    message?.sender?.name ||
    message?.sender?.fullName ||
    message?.senderName ||
    "Unknown user";

  const time = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const senderInitial = senderName.charAt(0).toUpperCase();

  /*
   * True when a DIFFERENT message currently owns the open menu.
   * While true, this message must not open its own action bar.
   */
  const anotherMenuOpen =
    activeMenuMessageId !== null &&
    activeMenuMessageId !== undefined &&
    String(activeMenuMessageId) !== String(messageId);

  /* =======================================================
     SINGLE OPEN MENU SYNC
  ======================================================== */

  // Report this message's menu open/close state to the parent
  useEffect(() => {
    if (!onMenuOpenChange || !messageId) {
      return;
    }

    if (showActionMenu) {
      onMenuOpenChange(messageId);
    } else {
      // Only clear if WE were the owner
      onMenuOpenChange((current) =>
        current !== null &&
        current !== undefined &&
        String(current) === String(messageId)
          ? null
          : current
      );
    }
  }, [showActionMenu, messageId, onMenuOpenChange]);

  // Release ownership on unmount (e.g. message deleted while menu open)
  useEffect(() => {
    return () => {
      onMenuOpenChange?.((current) =>
        current !== null &&
        current !== undefined &&
        String(current) === String(messageId)
          ? null
          : current
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close any lingering hover bar when another message opens its menu
  useEffect(() => {
    if (!anotherMenuOpen) {
      return;
    }

    clearTimeout(hoverTimerRef.current);
    clearTimeout(hoverCloseTimerRef.current);
    clearTimeout(longPressTimerRef.current);

    setShowActionBar(false);
    setShowActionMenu(false);
  }, [anotherMenuOpen]);

  /* =======================================================
     HOVER HANDLERS
  ======================================================== */

  const updateActionBarPlacement = () => {
    const shell = messageShellRef.current;

    if (!shell) {
      return;
    }

    const scrollContainer = shell.closest(".overflow-y-auto");

    if (!scrollContainer) {
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    const ACTION_BAR_HEIGHT = 58;
    const TOP_SAFE_SPACE = 8;

    const availableAbove = shellRect.top - containerRect.top;

    if (availableAbove < ACTION_BAR_HEIGHT + TOP_SAFE_SPACE) {
      setActionBarPlacement("bottom");
    } else {
      setActionBarPlacement("top");
    }
  };

  const handleMessageMouseEnter = () => {
    if (selectionMode || anotherMenuOpen) {
      return;
    }

    clearTimeout(hoverCloseTimerRef.current);
    clearTimeout(hoverTimerRef.current);

    updateActionBarPlacement();

    hoverTimerRef.current = setTimeout(() => {
      updateActionBarPlacement();
      setShowActionBar(true);
    }, 120);
  };

  const handleMessageMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(hoverCloseTimerRef.current);

    hoverCloseTimerRef.current = setTimeout(() => {
      if (!showActionMenuRef.current) {
        setShowActionBar(false);
      }
    }, 220);
  };

  const handleReply = (targetMessage) => {
    if (selectionMode) {
      return;
    }

    onReply?.(targetMessage);
  };

  /* =======================================================
     SELECTION
  ======================================================== */

  const handleToggleSelection = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (!messageId) {
      return;
    }

    onToggleSelect?.(message);
  };

  const enterSelectionMode = () => {
    if (!messageId) {
      return;
    }

    clearTimeout(hoverTimerRef.current);
    clearTimeout(hoverCloseTimerRef.current);

    setShowActionBar(false);
    setShowActionMenu(false);

    onEnterSelectionMode?.(message);
  };

  // Lets the parent clear selection when composing starts
  // eslint-disable-next-line no-unused-vars
  const clearSelectionFromMessage = () => {
    onClearSelection?.();
  };

  /* =======================================================
     LONG PRESS
  ======================================================== */

  const showActionBarForTouch = () => {
    clearTimeout(longPressTimerRef.current);

    // Another message owns the open menu: ignore
    if (anotherMenuOpen) {
      return;
    }

    longPressTriggeredRef.current = true;
    suppressClickRef.current = true;

    updateActionBarPlacement();

    setShowActionBar(true);
    setShowActionMenu(false);

    if (typeof window !== "undefined" && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }

    clearTimeout(suppressClickTimerRef.current);

    suppressClickTimerRef.current = setTimeout(() => {
      suppressClickRef.current = false;
    }, 800);
  };

  /* =======================================================
     TOUCH
  ======================================================== */

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];

    if (!touch) {
      return;
    }

    // In selection mode, or while another message's menu is open,
    // do not track swipe / long press.
    if (selectionMode || anotherMenuOpen) {
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        tracking: false,
        lockedAxis: null,
      };

      return;
    }

    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      tracking: true,
      lockedAxis: null,
    };

    longPressTriggeredRef.current = false;

    clearTimeout(longPressTimerRef.current);

    longPressTimerRef.current = setTimeout(
      showActionBarForTouch,
      LONG_PRESS_DURATION
    );
  };

  const handleTouchMove = (event) => {
    const state = touchStateRef.current;

    if (!state.tracking) {
      return;
    }

    if (selectionMode || anotherMenuOpen) {
      clearTimeout(longPressTimerRef.current);
      return;
    }

    const touch = event.touches?.[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    if (!state.lockedAxis) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        state.lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
      }
    }

    if (state.lockedAxis === "y") {
      clearTimeout(longPressTimerRef.current);
      return;
    }

    if (state.lockedAxis === "x") {
      clearTimeout(longPressTimerRef.current);

      const directional = own
        ? Math.min(deltaX, 0)
        : Math.max(deltaX, 0);

      const clamped = Math.max(
        -SWIPE_MAX_DISTANCE,
        Math.min(SWIPE_MAX_DISTANCE, directional)
      );

      setIsSwiping(true);
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = (event) => {
    clearTimeout(longPressTimerRef.current);

    if (selectionMode || anotherMenuOpen) {
      touchStateRef.current.tracking = false;

      setIsSwiping(false);
      setSwipeOffset(0);

      return;
    }

    if (longPressTriggeredRef.current) {
      event?.preventDefault?.();

      touchStateRef.current.tracking = false;

      setIsSwiping(false);
      setSwipeOffset(0);

      return;
    }

    if (Math.abs(swipeOffset) >= SWIPE_TRIGGER_DISTANCE) {
      event?.preventDefault?.();

      suppressClickRef.current = true;

      clearTimeout(suppressClickTimerRef.current);

      suppressClickTimerRef.current = setTimeout(() => {
        suppressClickRef.current = false;
      }, 800);

      handleReply(message);

      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
    }

    touchStateRef.current.tracking = false;

    setIsSwiping(false);
    setSwipeOffset(0);
  };

  /* =======================================================
     CLICK
  ======================================================== */

  const handleMessageClick = (event) => {
    if (selectionMode) {
      handleToggleSelection(event);
      return;
    }

    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();

      suppressClickRef.current = false;

      clearTimeout(suppressClickTimerRef.current);
    }
  };

  /* =======================================================
     CLEANUP
  ======================================================== */

  useEffect(() => {
    return () => {
      clearTimeout(longPressTimerRef.current);
      clearTimeout(suppressClickTimerRef.current);
      clearTimeout(hoverTimerRef.current);
      clearTimeout(hoverCloseTimerRef.current);
    };
  }, []);

  /* =======================================================
     ACTION HELPERS
  ======================================================== */

  const closeActions = () => {
    clearTimeout(hoverTimerRef.current);
    clearTimeout(hoverCloseTimerRef.current);

    setShowActionBar(false);
    setShowActionMenu(false);
  };

  const hasReacted = (reaction) =>
    Boolean(
      reaction?.userIds?.some((id) => String(id) === String(user?.id))
    );

  /* =======================================================
     REACTION
  ======================================================== */

  const handleReaction = async (emoji) => {
    if (
      !messageId ||
      !emoji ||
      reacting ||
      deletedForEveryone ||
      selectionMode
    ) {
      return;
    }

    try {
      setReacting(true);

      await toggleMessageReaction(messageId, emoji);

      closeActions();
    } catch (error) {
      console.error("Failed to update reaction:", error);
    } finally {
      setReacting(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================== */

  const handleDeleteForMe = async () => {
    if (!messageId || deletingForMe || deletingForEveryone) {
      return;
    }

    try {
      setDeletingForMe(true);

      await deleteMessageForMe(messageId);

      closeActions();
    } catch (error) {
      console.error("Failed to delete message for me:", error);
    } finally {
      setDeletingForMe(false);
    }
  };

  const handleDeleteForEveryone = async () => {
    if (
      !messageId ||
      !own ||
      deletingForMe ||
      deletingForEveryone ||
      deletedForEveryone
    ) {
      return;
    }

    try {
      setDeletingForEveryone(true);

      await deleteMessageForEveryone(messageId);

      closeActions();
    } catch (error) {
      console.error("Failed to delete message for everyone:", error);
    } finally {
      setDeletingForEveryone(false);
    }
  };

  /* =======================================================
     CONTEXT MENU (right click)
  ======================================================== */

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (anotherMenuOpen) {
      return;
    }

    updateActionBarPlacement();
    setShowActionBar(true);
    setShowActionMenu(false);
  };

  /* =======================================================
     OUTSIDE CLICK / ESCAPE
  ======================================================== */

  useEffect(() => {
    if (!showActionBar && !showActionMenu) {
      return;
    }

    const handleOutsidePointer = (event) => {
      const target = event.target;

      // Inside the message itself
      if (messageShellRef.current?.contains(target)) {
        return;
      }

      // Inside this message's portal layer (action bar / menu)
      const layer = target?.closest?.("[data-action-layer]");

      if (
        layer &&
        layer.getAttribute("data-action-layer") === String(messageId)
      ) {
        return;
      }

      closeActions();
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeActions();
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showActionBar, showActionMenu, messageId]);

  /* =======================================================
     JUMP TO ORIGINAL MESSAGE
  ======================================================== */

  const scrollToMessage = (targetId) => {
    if (!targetId) {
      return;
    }

    const target = document.getElementById(`message-${targetId}`);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target.classList.add("ring-2", "ring-blue-400", "ring-offset-2");

    setTimeout(() => {
      target.classList.remove("ring-2", "ring-blue-400", "ring-offset-2");
    }, 1200);
  };

  /* =======================================================
     RENDER
  ======================================================== */

  const rowElevated = showActionBar || showActionMenu;

  return (
    <>
      <div
        className={`
          relative
          flex
          min-w-0
          w-full
          rounded-xl
          px-2
          py-1
          transition-all
          duration-200
          ${rowElevated ? "z-50" : "z-0"}
          ${
            selected
              ? "bg-blue-50/75 ring-1 ring-inset ring-blue-100"
              : "bg-transparent"
          }
          ${own ? "justify-end" : "justify-start"}
        `}
      >
        <div
          ref={messageShellRef}
          onMouseEnter={handleMessageMouseEnter}
          onMouseLeave={handleMessageMouseLeave}
          onContextMenu={handleContextMenu}
          className={`
            group
            relative
            flex
            min-w-0
            w-fit
            max-w-[min(90%,520px)]
            flex-col
            ${own ? "items-end" : "items-start"}
            sm:max-w-[min(75%,520px)]
          `}
        >
          {/* SELECTION INDICATOR */}

          {selectionMode && (
            <button
              type="button"
              onClick={handleToggleSelection}
              aria-label={selected ? "Deselect message" : "Select message"}
              className={`
                absolute
                top-1/2
                z-30
                flex
                h-6
                w-6
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border-2
                shadow-sm
                transition-all
                duration-150
                ${own ? "-left-8" : "-right-8"}
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-transparent hover:border-blue-400"
                }
              `}
            >
              {selected && <Check size={14} />}
            </button>
          )}

          {/* ACTION BAR */}

          {!selectionMode && (
            <MessageActionBar
              own={own}
              reactions={reactions}
              userId={user?.id}
              reacting={reacting}
              mobileOpen={showActionBar}
              menuOpen={showActionMenu}
              deletingForMe={deletingForMe}
              deletingForEveryone={deletingForEveryone}
              canReact={!deletedForEveryone}
              canReply={!deletedForEveryone}
              onReaction={handleReaction}
              onReply={() => {
                handleReply(message);
              }}
              onMore={() => {
                clearTimeout(hoverCloseTimerRef.current);

                if (anotherMenuOpen) {
                  return;
                }

                updateActionBarPlacement();
                setShowActionBar(true);
                setShowActionMenu((current) => !current);
              }}
              onDeleteForMe={handleDeleteForMe}
              onDeleteForEveryone={handleDeleteForEveryone}
              onSelect={enterSelectionMode}
              onCancel={closeActions}
              placement={actionBarPlacement}
              anchorRef={messageShellRef}
              layerId={messageId}
            />
          )}

          {/* SWIPE REPLY INDICATOR */}

          {!selectionMode && (
            <div
              className={`
                pointer-events-none
                absolute
                top-1/2
                z-10
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-blue-100
                text-blue-600
                transition-opacity
                ${own ? "right-0" : "left-0"}
              `}
              style={{
                opacity: Math.min(
                  Math.abs(swipeOffset) / SWIPE_TRIGGER_DISTANCE,
                  1
                ),
              }}
            >
              <Reply size={15} />
            </div>
          )}

          {/* MESSAGE CARD */}

          <div
            id={`message-${messageId}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onClick={handleMessageClick}
            style={{
              transform: selectionMode
                ? "translateX(0)"
                : `translateX(${swipeOffset}px)`,
              transition: isSwiping
                ? "none"
                : "transform 200ms ease-out",
              touchAction: selectionMode ? "manipulation" : "pan-y",
            }}
            className={`
              relative
              min-w-0
              select-none
              overflow-visible
              rounded-xl
              border
              px-3
              py-2
              shadow-sm
              transition-all
              duration-200

              ${
                selected
                  ? `
                    border-blue-400
                    bg-gradient-to-br
                    from-blue-50
                    via-indigo-50
                    to-slate-50
                    text-slate-900
                    shadow-[0_4px_18px_rgba(59,130,246,0.16)]
                    ring-1
                    ring-blue-300
                  `
                  : own
                    ? `
                      border-blue-500/80
                      bg-gradient-to-br
                      from-blue-600
                      to-indigo-600
                      text-white
                      shadow-[0_2px_10px_rgba(37,99,235,0.20)]
                      hover:border-blue-500
                      hover:shadow-[0_4px_14px_rgba(37,99,235,0.24)]
                    `
                    : `
                      border-slate-300
                      bg-white
                      text-slate-900
                      shadow-[0_2px_10px_rgba(15,23,42,0.08)]
                      hover:border-slate-400
                      hover:shadow-md
                    `
              }
            `}
          >
            {/* MESSAGE HEADER */}

            <div
              className={`
                mb-1.5
                flex
                items-center
                gap-2
                ${own ? "justify-end" : "justify-between"}
              `}
            >
              {!own && (
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-blue-500
                      to-indigo-600
                      text-[9px]
                      font-semibold
                      text-white
                    "
                  >
                    {senderInitial}
                  </div>

                  <span
                    className="
                      max-w-[160px]
                      truncate
                      text-[11px]
                      font-semibold
                      text-slate-700
                    "
                  >
                    {senderName}
                  </span>
                </div>
              )}

              <span
                className={`
                  shrink-0
                  text-[9px]
                  font-medium
                  ${own ? "text-blue-100" : "text-slate-500"}
                `}
              >
                {time}
              </span>
            </div>

            {/* MESSAGE CONTENT */}

            {deletedForEveryone ? (
              <div className="flex items-center gap-2 py-1">
                <span
                  className={`
                    text-sm
                    italic
                    ${own ? "text-blue-100" : "text-slate-500"}
                  `}
                >
                  This message was deleted
                </span>
              </div>
            ) : (
              <>
                {/* REPLY QUOTE */}

                {repliedMessage && (
                  <div
                    className={`
                      mb-1.5
                      overflow-hidden
                      rounded-lg
                      border
                      border-l-2
                      p-1.5
                      ${
                        own
                          ? "border-blue-300/60 bg-blue-950/25"
                          : "border-slate-200 bg-slate-100"
                      }
                    `}
                  >
                    <MessageReplyQuote
                      repliedMessage={repliedMessage}
                      own={own}
                      onJump={scrollToMessage}
                    />
                  </div>
                )}

                {/* TEXT */}

                {hasText && (
                  <p
                    className={`
                      whitespace-pre-wrap
                      break-words
                      text-[13px]
                      leading-5
                      ${
                        own
                          ? "font-medium text-white"
                          : "font-medium text-slate-800"
                      }
                    `}
                  >
                    {text}
                  </p>
                )}

                {/* ATTACHMENTS */}

                {hasAttachments && (
                  <div className={hasText ? "mt-2" : ""}>
                    <MessageAttachments
                      attachments={attachments}
                      hasText={hasText}
                      repliedMessage={repliedMessage}
                      onOpenImage={setPreviewAttachment}
                      onOpenDocument={setPreviewDocument}
                    />
                  </div>
                )}

                {/* EMPTY MESSAGE */}

                {!hasText && !hasAttachments && (
                  <p
                    className={`
                      text-[12px]
                      italic
                      ${own ? "text-blue-100" : "text-slate-500"}
                    `}
                  >
                    Empty message
                  </p>
                )}
              </>
            )}
          </div>

          {/* REACTIONS */}

          {!deletedForEveryone && reactions.length > 0 && (
            <div
              className={`
                mt-1.5
                flex
                flex-wrap
                gap-1
                px-1
                ${own ? "justify-end" : "justify-start"}
              `}
            >
              {reactions.map((reaction) => {
                const selectedReaction = hasReacted(reaction);

                return (
                  <button
                    key={reaction.emoji}
                    type="button"
                    onClick={() => handleReaction(reaction.emoji)}
                    disabled={
                      reacting ||
                      deletingForMe ||
                      deletingForEveryone ||
                      selectionMode
                    }
                    className={`
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      border
                      px-2
                      py-0.5
                      text-xs
                      shadow-sm
                      transition-all
                      duration-150
                      ${
                        selectedReaction
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    `}
                  >
                    <span>{reaction.emoji}</span>

                    <span className="font-medium text-slate-600">
                      {reaction.userIds?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* REPLY / THREAD */}

          {!selectionMode && (
            <div
              className={`
                mt-1
                flex
                min-h-[24px]
                items-center
                gap-3
                px-1
                ${own ? "justify-end" : "justify-start"}
              `}
            >
              {Number(message?.replyCount || 0) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!deletedForEveryone && !selectionMode) {
                      onOpenThread?.(message);
                    }
                  }}
                  disabled={deletedForEveryone || selectionMode}
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    px-2
                    py-1
                    text-xs
                    font-medium
                    transition
                    ${
                      deletedForEveryone || selectionMode
                        ? "cursor-default text-slate-400"
                        : "cursor-pointer text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    }
                  `}
                >
                  <MessageCircle size={14} />

                  <span>
                    {message.replyCount}{" "}
                    {Number(message.replyCount) === 1 ? "reply" : "replies"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODALS */}

      <MessagePreviewModals
        previewAttachment={previewAttachment}
        previewDocument={previewDocument}
        onCloseImage={() => setPreviewAttachment(null)}
        onCloseDocument={() => setPreviewDocument(null)}
      />
    </>
  );
};

export default MessageItem;