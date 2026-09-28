import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  Reply,
} from "lucide-react";

import {
  useCommunication,
} from "../../context/CommunicationContext";

import {
  useAuth,
} from "../../context/AuthContext";

import MessageActionBar from "./MessageActionBar";
import MessageReplyQuote from "./MessageReplyQuote";
import MessageAttachments from "./MessageAttachments";
import MessagePreviewModals from "./MessagePreviewModals";

/* =========================================================
   MAIN MESSAGE ITEM

   Supports:
   - Reply
   - Swipe to reply
   - Long press selection
   - More → Select
   - Reactions
   - Delete for me
   - Delete for everyone
   - Attachments
   - Reply previews
   - Message selection
   - Delayed hover actions
========================================================= */

const MessageItem = ({
  message,
  own,
  onReply,

  selectionMode = false,
  selected = false,
  onToggleSelect,
  onEnterSelectionMode,

  // NEW:
  // Parent component uses this to exit selection mode
  // when the user starts composing a message.
  onClearSelection,
}) => {
  /* =======================================================
     LOCAL UI STATE
  ======================================================== */

  const [
    previewAttachment,
    setPreviewAttachment,
  ] = useState(null);

  const [
    previewDocument,
    setPreviewDocument,
  ] = useState(null);

  const [
    showActionBar,
    setShowActionBar,
  ] = useState(false);

  const [
    actionBarPlacement,
    setActionBarPlacement,
  ] = useState("top");

  const [
    showActionMenu,
    setShowActionMenu,
  ] = useState(false);

  const [reacting, setReacting] =
    useState(false);

  const [
    deletingForMe,
    setDeletingForMe,
  ] = useState(false);

  const [
    deletingForEveryone,
    setDeletingForEveryone,
  ] = useState(false);

  /* =======================================================
     COMMUNICATION
  ======================================================== */

  const {
    toggleMessageReaction,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useCommunication();

  const { user } = useAuth();

  /* =======================================================
     SWIPE / LONG PRESS
  ======================================================== */

  const SWIPE_TRIGGER_DISTANCE = 56;
  const SWIPE_MAX_DISTANCE = 88;
  const LONG_PRESS_DURATION = 500;

  const [
    swipeOffset,
    setSwipeOffset,
  ] = useState(0);

  const [
    isSwiping,
    setIsSwiping,
  ] = useState(false);

  const touchStateRef = useRef({
    startX: 0,
    startY: 0,
    tracking: false,
    lockedAxis: null,
  });

  const longPressTimerRef =
    useRef(null);

  const longPressTriggeredRef =
    useRef(false);

  const suppressClickRef =
    useRef(false);

  const suppressClickTimerRef =
    useRef(null);

  /* =======================================================
     HOVER
  ======================================================== */

  const hoverTimerRef =
    useRef(null);

  const hoverCloseTimerRef =
    useRef(null);

  const messageShellRef =
    useRef(null);

  /* =======================================================
     DATA
  ======================================================== */

  const messageId =
    message?.id ||
    message?._id;

  const text =
    message?.text ||
    message?.content ||
    "";

  const attachments =
    Array.isArray(message?.attachments)
      ? message.attachments
      : [];

  const reactions =
    Array.isArray(message?.reactions)
      ? message.reactions
      : [];

  const hasText =
    Boolean(text.trim());

  const hasAttachments =
    attachments.length > 0;

  const repliedMessage =
    message?.replyTo ||
    null;

  const deletedForEveryone =
    Boolean(message?.deletedForEveryone);

  const senderName =
    message?.sender?.name ||
    message?.sender?.fullName ||
    message?.senderName ||
    "Unknown user";

  const time =
    message?.createdAt
      ? new Date(
          message.createdAt
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const senderInitial =
    senderName
      .charAt(0)
      .toUpperCase();

  /* =======================================================
     HOVER HANDLERS
  ======================================================== */

  const updateActionBarPlacement = () => {
    const shell = messageShellRef.current;

    if (!shell) {
      return;
    }

    const scrollContainer =
      shell.closest(".overflow-y-auto");

    if (!scrollContainer) {
      return;
    }

    const shellRect =
      shell.getBoundingClientRect();

    const containerRect =
      scrollContainer.getBoundingClientRect();

    const ACTION_BAR_HEIGHT = 58;
    const TOP_SAFE_SPACE = 8;

    const availableAbove =
      shellRect.top - containerRect.top;

    if (
      availableAbove <
      ACTION_BAR_HEIGHT + TOP_SAFE_SPACE
    ) {
      setActionBarPlacement("bottom");
    } else {
      setActionBarPlacement("top");
    }
  };

  const handleMessageMouseEnter = () => {
    if (selectionMode) {
      return;
    }

    clearTimeout(
      hoverCloseTimerRef.current
    );

    clearTimeout(
      hoverTimerRef.current
    );

    updateActionBarPlacement();

    hoverTimerRef.current =
      setTimeout(() => {
        updateActionBarPlacement();
        setShowActionBar(true);
      }, 120);
  };

  const handleMessageMouseLeave = () => {
    clearTimeout(
      hoverTimerRef.current
    );

    clearTimeout(
      hoverCloseTimerRef.current
    );

    hoverCloseTimerRef.current =
      setTimeout(() => {
        if (!showActionMenu) {
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

  const handleToggleSelection = (
    event
  ) => {
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

    clearTimeout(
      hoverTimerRef.current
    );

    clearTimeout(
      hoverCloseTimerRef.current
    );

    setShowActionBar(false);
    setShowActionMenu(false);

    onEnterSelectionMode?.(
      message
    );
  };

  /*
   * NEW:
   * Allows the parent ConversationWindow to clear
   * all selected messages when composition starts.
   *
   * This function intentionally does NOT modify the
   * message itself or the composer text.
   */
  const clearSelectionFromMessage = () => {
    onClearSelection?.();
  };

  /* =======================================================
     LONG PRESS
  ======================================================== */

  const showActionBarForTouch = () => {
    clearTimeout(
      longPressTimerRef.current
    );

    longPressTriggeredRef.current =
      true;

    suppressClickRef.current =
      true;

    /*
     * Long press on mobile:
     *
     *   Long press
     *      ↓
     *   Reaction bar + More
     *      ↓
     *   React immediately OR More → Select
     *
     * Do not automatically enter selection mode.
     */

    updateActionBarPlacement();

    setShowActionBar(true);
    setShowActionMenu(false);

    if (
      typeof window !== "undefined" &&
      window.navigator?.vibrate
    ) {
      window.navigator.vibrate(10);
    }

    clearTimeout(
      suppressClickTimerRef.current
    );

    suppressClickTimerRef.current =
      setTimeout(() => {
        suppressClickRef.current =
          false;
      }, 800);
  };

  /* =======================================================
     TOUCH START
  ======================================================== */

  const handleTouchStart = (
    event
  ) => {
    const touch =
      event.touches?.[0];

    if (!touch) {
      return;
    }

    if (selectionMode) {
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

    longPressTriggeredRef.current =
      false;

    clearTimeout(
      longPressTimerRef.current
    );

    longPressTimerRef.current =
      setTimeout(
        showActionBarForTouch,
        LONG_PRESS_DURATION
      );
  };

  /* =======================================================
     TOUCH MOVE
  ======================================================== */

  const handleTouchMove = (
    event
  ) => {
    const state =
      touchStateRef.current;

    if (!state.tracking) {
      return;
    }

    if (selectionMode) {
      clearTimeout(
        longPressTimerRef.current
      );

      return;
    }

    const touch =
      event.touches?.[0];

    if (!touch) {
      return;
    }

    const deltaX =
      touch.clientX -
      state.startX;

    const deltaY =
      touch.clientY -
      state.startY;

    if (!state.lockedAxis) {
      if (
        Math.abs(deltaX) > 8 ||
        Math.abs(deltaY) > 8
      ) {
        state.lockedAxis =
          Math.abs(deltaX) >
          Math.abs(deltaY)
            ? "x"
            : "y";
      }
    }

    if (
      state.lockedAxis === "y"
    ) {
      clearTimeout(
        longPressTimerRef.current
      );

      return;
    }

    if (
      state.lockedAxis === "x"
    ) {
      clearTimeout(
        longPressTimerRef.current
      );

      const directional = own
        ? Math.min(deltaX, 0)
        : Math.max(deltaX, 0);

      const clamped =
        Math.max(
          -SWIPE_MAX_DISTANCE,
          Math.min(
            SWIPE_MAX_DISTANCE,
            directional
          )
        );

      setIsSwiping(true);
      setSwipeOffset(clamped);
    }
  };

  /* =======================================================
     TOUCH END
  ======================================================== */

  const handleTouchEnd = (
    event
  ) => {
    clearTimeout(
      longPressTimerRef.current
    );

    if (selectionMode) {
      touchStateRef.current.tracking =
        false;

      setIsSwiping(false);
      setSwipeOffset(0);

      return;
    }

    const wasLongPress =
      longPressTriggeredRef.current;

    if (wasLongPress) {
      event?.preventDefault?.();

      touchStateRef.current.tracking =
        false;

      setIsSwiping(false);
      setSwipeOffset(0);

      return;
    }

    if (
      Math.abs(swipeOffset) >=
      SWIPE_TRIGGER_DISTANCE
    ) {
      event?.preventDefault?.();

      suppressClickRef.current =
        true;

      clearTimeout(
        suppressClickTimerRef.current
      );

      suppressClickTimerRef.current =
        setTimeout(() => {
          suppressClickRef.current =
            false;
        }, 800);

      handleReply(message);

      if (
        typeof window !== "undefined" &&
        window.navigator?.vibrate
      ) {
        window.navigator.vibrate(10);
      }
    }

    touchStateRef.current.tracking =
      false;

    setIsSwiping(false);
    setSwipeOffset(0);
  };

  /* =======================================================
     CLICK
  ======================================================== */

  const handleMessageClick = (
    event
  ) => {
    if (selectionMode) {
      handleToggleSelection(
        event
      );

      return;
    }

    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();

      suppressClickRef.current =
        false;

      clearTimeout(
        suppressClickTimerRef.current
      );
    }
  };

  /* =======================================================
     CLEANUP
  ======================================================== */

  useEffect(() => {
    return () => {
      clearTimeout(
        longPressTimerRef.current
      );

      clearTimeout(
        suppressClickTimerRef.current
      );

      clearTimeout(
        hoverTimerRef.current
      );

      clearTimeout(
        hoverCloseTimerRef.current
      );
    };
  }, []);

  /* =======================================================
     ACTION HELPERS
  ======================================================== */

  const closeActions = () => {
    clearTimeout(
      hoverTimerRef.current
    );

    clearTimeout(
      hoverCloseTimerRef.current
    );

    setShowActionBar(false);
    setShowActionMenu(false);
  };

  /* =======================================================
     REACTION HELPER
  ======================================================== */

  const hasReacted = (
    reaction
  ) => {
    return Boolean(
      reaction?.userIds?.some(
        (id) =>
          String(id) ===
          String(user?.id)
      )
    );
  };

  /* =======================================================
     REACTION
  ======================================================== */

  const handleReaction = async (
    emoji
  ) => {
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

      await toggleMessageReaction(
        messageId,
        emoji
      );

      closeActions();
    } catch (error) {
      console.error(
        "Failed to update reaction:",
        error
      );
    } finally {
      setReacting(false);
    }
  };

  /* =======================================================
     DELETE FOR ME
  ======================================================== */

  const handleDeleteForMe =
    async () => {
      if (
        !messageId ||
        deletingForMe ||
        deletingForEveryone
      ) {
        return;
      }

      try {
        setDeletingForMe(true);

        await deleteMessageForMe(
          messageId
        );

        closeActions();
      } catch (error) {
        console.error(
          "Failed to delete message for me:",
          error
        );
      } finally {
        setDeletingForMe(false);
      }
    };

  /* =======================================================
     DELETE FOR EVERYONE
  ======================================================== */

  const handleDeleteForEveryone =
    async () => {
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
        setDeletingForEveryone(
          true
        );

        await deleteMessageForEveryone(
          messageId
        );

        closeActions();
      } catch (error) {
        console.error(
          "Failed to delete message for everyone:",
          error
        );
      } finally {
        setDeletingForEveryone(
          false
        );
      }
    };

  /* =======================================================
     CONTEXT MENU
  ======================================================== */

  const handleContextMenu = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    updateActionBarPlacement();
    setShowActionBar(true);
    setShowActionMenu(false);
  };

  /* =======================================================
     OUTSIDE CLICK
  ======================================================== */

  useEffect(() => {
    if (
      !showActionBar &&
      !showActionMenu
    ) {
      return;
    }

    const handleOutsidePointer =
      (event) => {
        if (
          !messageShellRef.current?.contains(
            event.target
          )
        ) {
          closeActions();
        }
      };

    const handleEscape = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeActions();
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsidePointer
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointer
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    showActionBar,
    showActionMenu,
  ]);

  /* =======================================================
     JUMP TO ORIGINAL MESSAGE
  ======================================================== */

  const scrollToMessage = (
    targetId
  ) => {
    if (!targetId) {
      return;
    }

    const target =
      document.getElementById(
        `message-${targetId}`
      );

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target.classList.add(
      "ring-2",
      "ring-blue-400",
      "ring-offset-2"
    );

    setTimeout(() => {
      target.classList.remove(
        "ring-2",
        "ring-blue-400",
        "ring-offset-2"
      );
    }, 1200);
  };

  /* =======================================================
     RENDER
  ======================================================== */

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
          ${
            selected
              ? "bg-blue-50/75 ring-1 ring-inset ring-blue-100"
              : "bg-transparent"
          }
          ${
            own
              ? "justify-end"
              : "justify-start"
          }
        `}
      >
        <div
          ref={messageShellRef}
          onMouseEnter={
            handleMessageMouseEnter
          }
          onMouseLeave={
            handleMessageMouseLeave
          }
          onContextMenu={
            handleContextMenu
          }
          className={`
            group
            relative
            flex
            min-w-0
            w-fit
            max-w-[min(90%,520px)]
            flex-col
            ${
              own
                ? "items-end"
                : "items-start"
            }
            sm:max-w-[min(75%,520px)]
          `}
        >
          {/* =================================================
              SELECTION INDICATOR
          ================================================== */}

          {selectionMode && (
            <button
              type="button"
              onClick={
                handleToggleSelection
              }
              aria-label={
                selected
                  ? "Deselect message"
                  : "Select message"
              }
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
                ${
                  own
                    ? "-left-8"
                    : "-right-8"
                }
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-transparent hover:border-blue-400"
                }
              `}
            >
              {selected && (
                <Check size={14} />
              )}
            </button>
          )}

          {/* =================================================
              ACTION BAR
          ================================================== */}

          {!selectionMode && (
            <MessageActionBar
              own={own}
              reactions={reactions}
              userId={user?.id}
              reacting={reacting}
              mobileOpen={
                showActionBar
              }
              menuOpen={
                showActionMenu
              }
              deletingForMe={
                deletingForMe
              }
              deletingForEveryone={
                deletingForEveryone
              }
              canReact={
                !deletedForEveryone
              }
              canReply={
                !deletedForEveryone
              }
              onReaction={
                handleReaction
              }
              onReply={() => {
                handleReply(message);
              }}
              onMore={() => {
                clearTimeout(
                  hoverCloseTimerRef.current
                );

                updateActionBarPlacement();
                setShowActionBar(true);

                setShowActionMenu(
                  (current) =>
                    !current
                );
              }}
              onDeleteForMe={
                handleDeleteForMe
              }
              onDeleteForEveryone={
                handleDeleteForEveryone
              }
              onSelect={
                enterSelectionMode
              }
              onCancel={
                closeActions
              }
              placement={
                actionBarPlacement
              }
            />
          )}

          {/* =================================================
              SWIPE REPLY INDICATOR
          ================================================== */}

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
                ${
                  own
                    ? "right-0"
                    : "left-0"
                }
              `}
              style={{
                opacity: Math.min(
                  Math.abs(
                    swipeOffset
                  ) /
                    SWIPE_TRIGGER_DISTANCE,
                  1
                ),
              }}
            >
              <Reply size={15} />
            </div>
          )}

          {/* =================================================
              MESSAGE CARD
          ================================================== */}

          <div
            id={`message-${messageId}`}
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              handleTouchEnd
            }
            onTouchCancel={
              handleTouchEnd
            }
            onClick={
              handleMessageClick
            }
            style={{
              transform:
                selectionMode
                  ? "translateX(0)"
                  : `translateX(${swipeOffset}px)`,

              transition:
                isSwiping
                  ? "none"
                  : "transform 200ms ease-out",

              touchAction:
                selectionMode
                  ? "manipulation"
                  : "pan-y",
            }}
            className={`
              relative
              min-w-0
              select-none
              overflow-visible
              rounded-2xl
              border
              px-4
              py-3
              shadow-sm
              transition-all
              duration-200

              ${
                selected
                  ? `
                    border-blue-300
                    bg-gradient-to-br
                    from-blue-50
                    via-indigo-50
                    to-slate-50
                    shadow-[0_4px_18px_rgba(59,130,246,0.12)]
                    ring-1
                    ring-blue-200
                  `
                  : own
                    ? `
                      border-blue-100
                      bg-gradient-to-br
                      from-blue-50
                      via-indigo-50
                      to-white
                      text-slate-800
                    `
                    : `
                      border-slate-200
                      bg-white
                      text-slate-800
                      hover:border-slate-300
                      hover:shadow-md
                    `
              }
            `}
          >
            {/* MESSAGE HEADER */}

            <div
              className={`
                mb-2
                flex
                items-center
                gap-3
                ${
                  own
                    ? "justify-end"
                    : "justify-between"
                }
              `}
            >
              {!own && (
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-blue-500
                      to-indigo-600
                      text-[10px]
                      font-semibold
                      text-white
                    "
                  >
                    {senderInitial}
                  </div>

                  <span
                    className="
                      max-w-[180px]
                      truncate
                      text-xs
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
                  text-[10px]
                  font-medium
                  ${
                    own
                      ? "text-blue-500/80"
                      : "text-slate-400"
                  }
                `}
              >
                {time}
              </span>
            </div>

            {/* MESSAGE CONTENT */}

            {deletedForEveryone ? (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  py-1
                "
              >
                <span
                  className="
                    text-sm
                    italic
                    text-slate-400
                  "
                >
                  This message was deleted
                </span>
              </div>
            ) : (
              <>
                {/* REPLY QUOTE */}

                {repliedMessage && (
                  <div className="mb-2">
                    <MessageReplyQuote
                      repliedMessage={
                        repliedMessage
                      }
                      own={own}
                      onJump={
                        scrollToMessage
                      }
                    />
                  </div>
                )}

                {/* TEXT */}

                {hasText && (
                  <p
                    className="
                      whitespace-pre-wrap
                      break-words
                      text-sm
                      leading-6
                    "
                  >
                    {text}
                  </p>
                )}

                {/* ATTACHMENTS */}

                {hasAttachments && (
                  <div
                    className={
                      hasText
                        ? "mt-2"
                        : ""
                    }
                  >
                    <MessageAttachments
                      attachments={
                        attachments
                      }
                      hasText={
                        hasText
                      }
                      repliedMessage={
                        repliedMessage
                      }
                      onOpenImage={
                        setPreviewAttachment
                      }
                      onOpenDocument={
                        setPreviewDocument
                      }
                    />
                  </div>
                )}

                {/* EMPTY MESSAGE */}

                {!hasText &&
                  !hasAttachments && (
                    <p
                      className="
                        text-sm
                        italic
                        text-slate-400
                      "
                    >
                      Empty message
                    </p>
                  )}
              </>
            )}
          </div>

          {/* REACTIONS */}

          {!deletedForEveryone &&
            reactions.length > 0 && (
              <div
                className={`
                  mt-1.5
                  flex
                  flex-wrap
                  gap-1
                  px-1
                  ${
                    own
                      ? "justify-end"
                      : "justify-start"
                  }
                `}
              >
                {reactions.map(
                  (reaction) => {
                    const selectedReaction =
                      hasReacted(
                        reaction
                      );

                    return (
                      <button
                        key={
                          reaction.emoji
                        }
                        type="button"
                        onClick={() =>
                          handleReaction(
                            reaction.emoji
                          )
                        }
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
                        <span>
                          {
                            reaction.emoji
                          }
                        </span>

                        <span
                          className="
                            font-medium
                            text-slate-600
                          "
                        >
                          {
                            reaction
                              .userIds
                              ?.length ||
                            0
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}

          {/* REPLY / THREAD */}

          {!selectionMode && (
            <div
              className={`
                mt-1
                flex
                min-h-[28px]
                items-center
                gap-3
                px-1
                ${
                  own
                    ? "justify-end"
                    : "justify-start"
                }
              `}
            >
              {Number(
                message.replyCount || 0
              ) > 0 && (
                <span
                  className={`
                    text-xs
                    font-medium
                    ${
                      deletedForEveryone
                        ? "text-slate-400"
                        : "text-blue-600"
                    }
                  `}
                >
                  {message.replyCount}{" "}
                  {
                    Number(
                      message.replyCount
                    ) === 1
                      ? "reply"
                      : "replies"
                  }
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODALS */}

      <MessagePreviewModals
        previewAttachment={
          previewAttachment
        }
        previewDocument={
          previewDocument
        }
        onCloseImage={() =>
          setPreviewAttachment(
            null
          )
        }
        onCloseDocument={() =>
          setPreviewDocument(
            null
          )
        }
      />
    </>
  );
};

export default MessageItem;