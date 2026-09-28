import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  Wifi,
  WifiOff,
  GripVertical,
} from "lucide-react";

import { useCommunication } from "../../context/CommunicationContext";
import { useAuth } from "../../hooks/useAuth";

import ConversationList from "./ConversationList";
import ConversationWindow from "./ConversationWindow";
import EmptyConversation from "./EmptyConversation";
import NewConversation from "./NewConversation";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_CONVERSATION_LIST_WIDTH = 320;

const MIN_CONVERSATION_LIST_WIDTH = 240;

const MAX_CONVERSATION_LIST_WIDTH = 460;

/* =========================================================
   COMPONENT
========================================================= */

const CommunicationLayout = () => {
  const { user } = useAuth();

  const {
    conversations,
    activeConversation,
    connectionStatus,
    activeConversationId,
    messages,
    typingUsers,

    loadingConversations,
    loadingMessages,

    selectConversation,

    users,
    searchUsers,

    createDirectConversation,
    createGroupConversation,

    sendMessage,

    startTyping,
    stopTyping,

    connected,
    reloadConversations,
  } = useCommunication();

  const currentUserId =
    user?.id ||
    user?._id ||
    user?.userId ||
    null;

  /* =========================================================
     NEW CONVERSATION
  ========================================================= */

  const [
    showNewConversation,
    setShowNewConversation,
  ] = useState(false);

  const [
    loadingUsers,
    setLoadingUsers,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* =========================================================
     REPLY
  ========================================================= */

  /*
   * Message currently being replied to.
   *
   * This remains inside the communication workspace.
   */

  const [
    replyingTo,
    setReplyingTo,
  ] = useState(null);

  /* =========================================================
     CONVERSATION LIST WIDTH
  ========================================================= */

  const [
    conversationListWidth,
    setConversationListWidth,
  ] = useState(
    DEFAULT_CONVERSATION_LIST_WIDTH
  );

  const isResizingRef =
    useRef(false);

  const resizeStartXRef =
    useRef(0);

  const resizeStartWidthRef =
    useRef(
      DEFAULT_CONVERSATION_LIST_WIDTH
    );

  /* =========================================================
     NEW CONVERSATION
  ========================================================= */

  const openNewConversation =
    async () => {
      setShowNewConversation(true);

      try {
        setLoadingUsers(true);

        await searchUsers("");
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );
      } finally {
        setLoadingUsers(false);
      }
    };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await reloadConversations();
    } catch (error) {
      console.error(
        "Failed to refresh conversations:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     BACK TO CONVERSATIONS
  ========================================================= */

  const handleBackToConversations = () => {
    /*
     * Clear any active reply state before
     * leaving the current conversation.
     */
    setReplyingTo(null);

    /*
     * Close the current conversation.
     * CommunicationLayout will automatically
     * reveal the conversation list.
     */
    selectConversation(null);
  };

  /* =========================================================
     RESIZE
  ========================================================= */

  const handleResizeStart = (
    event
  ) => {
    /*
     * Only allow the primary pointer button.
     */
    if (
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    isResizingRef.current = true;

    resizeStartXRef.current =
      event.clientX;

    resizeStartWidthRef.current =
      conversationListWidth;

    document.body.style.cursor =
      "col-resize";

    document.body.style.userSelect =
      "none";

    /*
     * Capture pointer when possible.
     * This makes dragging more reliable when
     * the cursor temporarily leaves the handle.
     */
    event.currentTarget?.setPointerCapture?.(
      event.pointerId
    );
  };

  /* =========================================================
     RESIZE EFFECT
  ========================================================= */

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return undefined;
    }

    const handlePointerMove = (
      event
    ) => {
      if (
        !isResizingRef.current
      ) {
        return;
      }

      const delta =
        event.clientX -
        resizeStartXRef.current;

      const nextWidth = Math.min(
        MAX_CONVERSATION_LIST_WIDTH,
        Math.max(
          MIN_CONVERSATION_LIST_WIDTH,
          resizeStartWidthRef.current +
            delta
        )
      );

      setConversationListWidth(
        nextWidth
      );
    };

    const stopResize = () => {
      if (
        !isResizingRef.current
      ) {
        return;
      }

      isResizingRef.current =
        false;

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      stopResize
    );

    window.addEventListener(
      "pointercancel",
      stopResize
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        stopResize
      );

      window.removeEventListener(
        "pointercancel",
        stopResize
      );

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";
    };
  }, []);

  /* =========================================================
     RESET WIDTH
  ========================================================= */

  const resetConversationListWidth =
    () => {
      if (
        isResizingRef.current
      ) {
        return;
      }

      setConversationListWidth(
        DEFAULT_CONVERSATION_LIST_WIDTH
      );
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        w-full
        flex-col
        overflow-hidden
        bg-slate-50
      "
    >
      {/* =====================================================
          COMMUNICATION HEADER
      ====================================================== */}

      <header
        className="
          shrink-0
          border-b
          border-slate-200
          bg-white
          px-4
          py-4
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          {/* =================================================
              HEADER TITLE + BACK BUTTON
          ================================================== */}

          <div className="flex min-w-0 items-center gap-3">
            {activeConversation && (
              <button
                type="button"
                onClick={
                  handleBackToConversations
                }
                aria-label="Back to conversations"
                title="Back to conversations"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-50
                  hover:text-slate-900
                  active:scale-95
                "
              >
                <ArrowLeft
                  size={18}
                />
              </button>
            )}

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                Communication
              </h1>

              <p
                className="
                  mt-1
                  hidden
                  text-sm
                  text-slate-500
                  sm:block
                "
              >
                Manage conversations and messages
              </p>
            </div>
          </div>

          {/* =================================================
              HEADER ACTIONS
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
            "
          >
            {/* CONNECTION */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className={`
                  h-2.5
                  w-2.5
                  rounded-full
                  ${
                    connectionStatus ===
                    "connected"
                      ? "bg-emerald-500"
                      : connectionStatus ===
                          "connecting"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }
                `}
              />

              <span
                className="
                  text-sm
                  text-slate-500
                "
              >
                {connectionStatus ===
                "connected"
                  ? "Connected"
                  : connectionStatus ===
                      "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={refreshing}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {/* NEW MESSAGE */}

            <button
              type="button"
              onClick={
                openNewConversation
              }
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                shadow-sm
                transition
                hover:bg-slate-800
              "
            >
              <MessageSquare
                size={17}
              />

              <span className="hidden sm:inline">
                New Message
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE CONNECTION BAR
      ====================================================== */}

      <div
        className="
          shrink-0
          px-3
          pt-3
          sm:hidden
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            shadow-sm
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {connected ? (
              <>
                <Wifi
                  size={16}
                  className="text-emerald-600"
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff
                  size={16}
                  className="text-red-500"
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  Offline
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={
              openNewConversation
            }
            className="
              rounded-lg
              bg-slate-900
              px-3
              py-2
              text-xs
              font-medium
              text-white
            "
          >
            New Message
          </button>
        </div>
      </div>

      {/* =====================================================
          CHAT WORKSPACE
      ====================================================== */}

      <main
        className="
          min-h-0
          min-w-0
          flex-1
          overflow-hidden
          px-3
          pb-3
          pt-3
          sm:px-4
          sm:pb-4
        "
      >
        <div
          className="
            flex
            h-full
            min-h-0
            w-full
            min-w-0
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* =================================================
              CONVERSATION LIST
          ================================================== */}

          <aside
            className={`
              min-h-0
              min-w-0
              overflow-hidden
              bg-white
              ${
                activeConversation
                  ? "hidden lg:block"
                  : "block"
              }
              lg:shrink-0
              lg:border-r
              lg:border-slate-200
            `}
            style={{
              width: `${conversationListWidth}px`,
            }}
          >
            <ConversationList
              conversations={
                conversations
              }
              currentUserId={
                currentUserId
              }
              activeConversationId={
                activeConversationId
              }
              onSelect={
                selectConversation
              }
              onNewConversation={
                openNewConversation
              }
              loading={
                loadingConversations
              }
            />
          </aside>

          {/* =================================================
              RESIZE HANDLE
          ================================================== */}

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize conversation list"
            aria-valuemin={
              MIN_CONVERSATION_LIST_WIDTH
            }
            aria-valuemax={
              MAX_CONVERSATION_LIST_WIDTH
            }
            aria-valuenow={
              Math.round(
                conversationListWidth
              )
            }
            tabIndex={0}
            onPointerDown={
              handleResizeStart
            }
            onDoubleClick={
              resetConversationListWidth
            }
            onKeyDown={(event) => {
              if (
                event.key ===
                "ArrowLeft"
              ) {
                event.preventDefault();

                setConversationListWidth(
                  (current) =>
                    Math.max(
                      MIN_CONVERSATION_LIST_WIDTH,
                      current - 20
                    )
                );
              }

              if (
                event.key ===
                "ArrowRight"
              ) {
                event.preventDefault();

                setConversationListWidth(
                  (current) =>
                    Math.min(
                      MAX_CONVERSATION_LIST_WIDTH,
                      current + 20
                    )
                );
              }

              if (
                event.key ===
                "Home"
              ) {
                event.preventDefault();

                setConversationListWidth(
                  MIN_CONVERSATION_LIST_WIDTH
                );
              }

              if (
                event.key ===
                "End"
              ) {
                event.preventDefault();

                setConversationListWidth(
                  MAX_CONVERSATION_LIST_WIDTH
                );
              }
            }}
            className="
              relative
              z-30
              hidden
              w-1
              shrink-0
              cursor-col-resize
              bg-slate-200
              transition-colors
              hover:bg-blue-400
              active:bg-blue-500
              lg:block
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                flex
                h-14
                w-4
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                group-hover:text-blue-500
              "
            >
              <GripVertical
                size={14}
              />
            </div>
          </div>

          {/* =================================================
              CONVERSATION WINDOW
          ================================================== */}

          <section
            className={`
              min-h-0
              min-w-0
              flex-1
              overflow-hidden
              bg-white
              ${
                activeConversation
                  ? "block"
                  : "hidden lg:block"
              }
            `}
          >
            {activeConversation ? (
              <ConversationWindow
                conversation={
                  activeConversation
                }
                messages={
                  messages
                }
                currentUserId={
                  currentUserId
                }
                typingUsers={
                  typingUsers
                }
                loading={
                  loadingMessages
                }
                onSend={
                  sendMessage
                }
                onTypingStart={
                  startTyping
                }
                onTypingStop={
                  stopTyping
                }
                onReply={
                  setReplyingTo
                }
                replyingTo={
                  replyingTo
                }
                onCancelReply={() =>
                  setReplyingTo(
                    null
                  )
                }
                onBack={
                  handleBackToConversations
                }
              />
            ) : (
              <EmptyConversation
                onNewConversation={
                  openNewConversation
                }
              />
            )}
          </section>
        </div>
      </main>

      {/* =====================================================
          NEW CONVERSATION MODAL
      ====================================================== */}

      {showNewConversation && (
        <NewConversation
          users={users}
          loadingUsers={
            loadingUsers
          }
          onClose={() =>
            setShowNewConversation(
              false
            )
          }
          onCreateDirect={
            createDirectConversation
          }
          onCreateGroup={
            createGroupConversation
          }
        />
      )}
    </div>
  );
};

export default CommunicationLayout;