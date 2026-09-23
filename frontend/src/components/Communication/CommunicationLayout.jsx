import { useState } from "react";

import {
  MessageSquare,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useCommunication } from "../../context/CommunicationContext";
import { useAuth } from "../../hooks/useAuth";

import ConversationList from "./ConversationList";
import ConversationWindow from "./ConversationWindow";
import EmptyConversation from "./EmptyConversation";
import NewConversation from "./NewConversation";

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

  const [showNewConversation, setShowNewConversation] =
    useState(false);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * Message currently being replied to.
   *
   * This is intentionally kept inside the conversation
   * workspace instead of opening a separate ThreadPanel.
   *
   * ConversationWindow receives this through onReply and
   * can display the reply preview directly above the composer.
   */
  const [replyingTo, setReplyingTo] =
    useState(null);

  /* =====================================================
     NEW CONVERSATION
  ===================================================== */

  const openNewConversation = async () => {
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

  /* =====================================================
     REFRESH
  ===================================================== */

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

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      {/* =====================================================
          COMMUNICATION HEADER
      ===================================================== */}

      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-900">
              Communication
            </h1>

            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
              Manage conversations and messages
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* CONNECTION */}

            <div className="flex items-center gap-2">
              <span
                className={`
                  h-2.5
                  w-2.5
                  rounded-full
                  ${
                    connectionStatus === "connected"
                      ? "bg-emerald-500"
                      : connectionStatus === "connecting"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }
                `}
              />

              <span className="text-sm text-slate-500">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              onClick={openNewConversation}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <MessageSquare size={17} />

              <span className="hidden sm:inline">
                New Message
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE CONNECTION BAR
      ===================================================== */}

      <div className="shrink-0 px-3 pt-3 sm:hidden">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi
                  size={16}
                  className="text-emerald-600"
                />

                <span className="text-sm font-medium text-slate-600">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff
                  size={16}
                  className="text-red-500"
                />

                <span className="text-sm font-medium text-slate-600">
                  Offline
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={openNewConversation}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          >
            New Message
          </button>
        </div>
      </div>

      {/* =====================================================
          CHAT WORKSPACE
      ===================================================== */}

      <main className="min-h-0 min-w-0 flex-1 overflow-hidden px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
        <div
          className="
            grid
            h-full
            min-h-0
            w-full
            min-w-0
            grid-cols-1
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            lg:grid-cols-[360px_minmax(0,1fr)]
          "
        >
          {/* =================================================
              CONVERSATION LIST
          ================================================= */}

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
              lg:border-r
              lg:border-slate-200
            `}
          >
            <ConversationList
              conversations={conversations}
              currentUserId={currentUserId}
              activeConversationId={
                activeConversationId
              }
              onSelect={selectConversation}
              onNewConversation={
                openNewConversation
              }
              loading={loadingConversations}
            />
          </aside>

          {/* =================================================
              CONVERSATION WINDOW
          ================================================= */}

          <section
            className={`
              min-h-0
              min-w-0
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
                messages={messages}
                currentUserId={
                  currentUserId
                }
                typingUsers={
                  typingUsers
                }
                loading={loadingMessages}
                onSend={sendMessage}
                onTypingStart={
                  startTyping
                }
                onTypingStop={
                  stopTyping
                }
                onReply={setReplyingTo}
                replyingTo={replyingTo}
                onCancelReply={() =>
                  setReplyingTo(null)
                }
                onBack={() =>
                  selectConversation(null)
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

      {/* =================================================
          NEW CONVERSATION MODAL
      ================================================= */}

      {showNewConversation && (
        <NewConversation
          users={users}
          loadingUsers={loadingUsers}
          onClose={() =>
            setShowNewConversation(false)
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