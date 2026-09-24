import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Reply } from "lucide-react";

import {
  useCommunication,
} from "../../context/CommunicationContext";

import {
  useAuth,
} from "../../context/AuthContext";

import MessageActionBar from "./MessageActionBar";
import MessageReplyQuote from "./MessageReplyQuote";
import MessageAttachments, {
  isImageAttachment,
} from "./MessageAttachments";
import MessagePreviewModals from "./MessagePreviewModals";

/* =========================================================
   MAIN MESSAGE ITEM
========================================================= */

const MessageItem = ({
  message,
  own,
  onReply,
}) => {
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
    showActionMenu,
    setShowActionMenu,
  ] = useState(false);

  const [
    reacting,
    setReacting,
  ] = useState(false);

  const [
    deletingForMe,
    setDeletingForMe,
  ] = useState(false);

  const [
    deletingForEveryone,
    setDeletingForEveryone,
  ] = useState(false);

  const {
    toggleMessageReaction,
    deleteMessageForMe,
    deleteMessageForEveryone,
  } = useCommunication();

  const { user } = useAuth();

  /* =======================================================
     SWIPE / LONG PRESS
  ======================================================= */

  const SWIPE_TRIGGER_DISTANCE = 56;
  const SWIPE_MAX_DISTANCE = 88;
  const LONG_PRESS_DURATION = 500;

  const [swipeOffset, setSwipeOffset] =
    useState(0);

  const [isSwiping, setIsSwiping] =
    useState(false);

  const touchStateRef =
    useRef({
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

  const messageShellRef =
    useRef(null);

  const showActionBarForTouch =
    () => {
      clearTimeout(
        longPressTimerRef.current
      );

      longPressTriggeredRef.current =
        true;

      suppressClickRef.current =
        true;

      setShowActionBar(true);
      setShowActionMenu(false);

      if (
        window.navigator?.vibrate
      ) {
        window.navigator.vibrate(
          10
        );
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

  const handleTouchStart = (
    event
  ) => {
    const touch =
      event.touches?.[0];

    if (!touch) {
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

  const handleTouchMove = (
    event
  ) => {
    const state =
      touchStateRef.current;

    if (!state.tracking) {
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

    /*
     * Vertical movement means the user is
     * scrolling. Also cancel long press.
     */
    if (
      state.lockedAxis ===
      "y"
    ) {
      clearTimeout(
        longPressTimerRef.current
      );

      return;
    }

    if (
      state.lockedAxis ===
      "x"
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

  const handleTouchEnd = (
    event
  ) => {
    clearTimeout(
      longPressTimerRef.current
    );

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

      onReply?.(message);

      if (
        window.navigator?.vibrate
      ) {
        window.navigator.vibrate(
          10
        );
      }
    }

    touchStateRef.current.tracking =
      false;

    setIsSwiping(false);
    setSwipeOffset(0);
  };

  const handleMessageClickCapture = (
    event
  ) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    suppressClickRef.current =
      false;

    clearTimeout(
      suppressClickTimerRef.current
    );
  };

  useEffect(() => {
    return () => {
      clearTimeout(
        longPressTimerRef.current
      );

      clearTimeout(
        suppressClickTimerRef.current
      );
    };
  }, []);

  /* =======================================================
     DATA
  ======================================================= */

  const messageId =
    message.id ||
    message._id;

  const text =
    message.text ||
    message.content ||
    "";

  const attachments =
    Array.isArray(
      message.attachments
    )
      ? message.attachments
      : [];

  const reactions =
    Array.isArray(
      message.reactions
    )
      ? message.reactions
      : [];

  const hasText =
    Boolean(text.trim());

  const hasAttachments =
    attachments.length > 0;

  const repliedMessage =
    message.replyTo ||
    null;

  const deletedForEveryone =
    Boolean(
      message.deletedForEveryone
    );

  const time = new Date(
    message.createdAt
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  /* =======================================================
     ACTIONS
  ======================================================= */

  const closeActions = () => {
    setShowActionBar(false);
    setShowActionMenu(false);
  };

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

  const handleReaction = async (
    emoji
  ) => {
    if (
      !messageId ||
      !emoji ||
      reacting ||
      deletedForEveryone
    ) {
      return;
    }

    try {
      setReacting(true);

      await toggleMessageReaction(
        messageId,
        emoji
      );

      setShowActionMenu(false);
      setShowActionBar(false);
    } catch (error) {
      console.error(
        "Failed to update reaction:",
        error
      );
    } finally {
      setReacting(false);
    }
  };

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

  const handleDeleteForEveryone =
    async () => {
      if (
        !messageId ||
        !own ||
        deletingForMe ||
        deletingForEveryone
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

  const handleContextMenu = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setShowActionBar(true);
    setShowActionMenu(false);
  };

  /* =======================================================
     CLOSE ACTIONS ON OUTSIDE CLICK
  ======================================================= */

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
  ======================================================= */

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
  ======================================================= */

  return (
    <>
      <div
        className={`flex min-w-0 ${
          own
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          ref={messageShellRef}
          className={`group relative flex min-w-0 w-fit max-w-[min(90%,520px)] flex-col sm:max-w-[min(75%,520px)] ${
            own
              ? "items-end"
              : "items-start"
          }`}
          onContextMenu={
            handleContextMenu
          }
        >
          {!own && (
            <div className="mb-1 px-1 text-xs font-medium text-gray-600">
              {message.sender?.name ||
                "Unknown user"}
            </div>
          )}

          {/* =================================================
              ACTION BAR
          ================================================== */}

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
            onReaction={
              handleReaction
            }
            onMore={() => {
              setShowActionBar(
                true
              );
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
            onCancel={closeActions}
          />

          {/* =================================================
              SWIPE REPLY INDICATOR
          ================================================== */}

          <div
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-opacity ${
              own
                ? "right-0"
                : "left-0"
            }`}
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

          {/* =================================================
              MESSAGE BUBBLE
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
            onClickCapture={
              handleMessageClickCapture
            }
            style={{
              transform: `translateX(${swipeOffset}px)`,
              transition:
                isSwiping
                  ? "none"
                  : "transform 200ms ease-out",
              touchAction:
                "pan-y",
            }}
            className={`min-w-0 select-none rounded-2xl transition-shadow ${
              own
                ? "rounded-br-md bg-blue-600 text-white"
                : "rounded-bl-md bg-gray-100 text-gray-900"
            } ${
              hasAttachments &&
              !hasText &&
              !repliedMessage &&
              !deletedForEveryone
                ? "overflow-hidden"
                : "px-4 py-2.5"
            }`}
          >
            {/* =================================================
                DELETED MESSAGE
            ================================================== */}

            {deletedForEveryone ? (
              <p
                className={`text-sm italic ${
                  own
                    ? "text-white/70"
                    : "text-gray-400"
                }`}
              >
                This message was
                deleted
              </p>
            ) : (
              <>
                {/* REPLY QUOTE */}

                {repliedMessage && (
                  <MessageReplyQuote
                    repliedMessage={
                      repliedMessage
                    }
                    own={own}
                    onJump={
                      scrollToMessage
                    }
                  />
                )}

                {/* TEXT */}

                {hasText && (
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {text}
                  </p>
                )}

                {/* ATTACHMENTS */}

                {hasAttachments && (
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
                )}

                {!hasText &&
                  !hasAttachments && (
                    <p className="text-sm text-gray-500">
                      Empty message
                    </p>
                  )}
              </>
            )}
          </div>

          {/* =================================================
              REACTIONS
          ================================================== */}

          {!deletedForEveryone &&
            reactions.length >
              0 && (
              <div className="mt-2 flex flex-wrap gap-1 px-1">
                {reactions.map(
                  (reaction) => {
                    const selected =
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
                          deletingForEveryone
                        }
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-sm transition ${
                          selected
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          {
                            reaction.emoji
                          }
                        </span>

                        <span className="font-medium text-slate-600">
                          {reaction
                            .userIds
                            ?.length ||
                            0}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}

          {/* =================================================
              REPLY / THREAD ACTION
          ================================================== */}

          <div
            className={`mt-1 flex items-center gap-3 px-1 ${
              own
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {!deletedForEveryone && (
              <button
                type="button"
                onClick={() =>
                  onReply?.(
                    message
                  )
                }
                className="-mx-1 flex min-h-[28px] items-center gap-1 px-1 text-xs font-medium text-gray-400 opacity-100 transition hover:text-blue-600 focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Reply size={13} />

                <span>
                  Reply
                </span>
              </button>
            )}

            {Number(
              message.replyCount ||
                0
            ) > 0 &&
              (deletedForEveryone ? (
                <span className="text-xs font-medium text-gray-400">
                  {
                    message.replyCount
                  }{" "}
                  {Number(
                    message.replyCount
                  ) === 1
                    ? "reply"
                    : "replies"}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onReply?.(
                      message
                    )
                  }
                  className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                >
                  {
                    message.replyCount
                  }{" "}
                  {Number(
                    message.replyCount
                  ) === 1
                    ? "reply"
                    : "replies"}
                </button>
              ))}
          </div>

          {/* =================================================
              TIME
          ================================================== */}

          <div
            className={`mt-1 px-1 text-[11px] text-gray-400 ${
              own
                ? "text-right"
                : "text-left"
            }`}
          >
            {time}
          </div>
        </div>
      </div>

      {/* =================================================
          PREVIEW MODALS
      ================================================== */}

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