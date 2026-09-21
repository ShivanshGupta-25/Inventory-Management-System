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

  const [showNewConversation, setShowNewConversation] =
    useState(false);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =====================================================
     NEW CONVERSATION
  ===================================================== */

  const openNewConversation = async () => {
    setShowNewConversation(true);

    try {
      setLoadingUsers(true);
      await searchUsers("");
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
    } finally {
      setRefreshing(false);
    }
  };

  return (
    /*
     * IMPORTANT:
     *
     * The application already has a top navbar.
     * Therefore we must NOT use 100dvh here.
     *
     * 76px = approximate application header height.
     * 16px = bottom breathing room.
     *
     * If your navbar is exactly 75px, this is ideal.
     */
    <div
      className="
        flex
        h-[calc(100dvh-92px)]
        min-h-0
        w-full
        flex-col
        overflow-hidden
      "
    >
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="shrink-0 px-4 pb-5 pt-4 sm:px-6 sm:pt-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* TITLE */}

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Messages
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Communicate with your team and manage
              conversations.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-3">
            {/* CONNECTION */}

            <div className="hidden border-r border-slate-200 pr-4 sm:block">
              <p className="text-right text-xs text-slate-400">
                Connection
              </p>

              <div className="mt-1 flex items-center justify-end gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connected
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="text-sm font-medium text-slate-600">
                  {connected
                    ? "Connected"
                    : "Offline"}
                </span>
              </div>
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

              <span>Refresh</span>
            </button>

            {/* NEW MESSAGE */}

            <button
              type="button"
              onClick={openNewConversation}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <MessageSquare size={17} />

              <span>New Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          MOBILE CONNECTION
      ================================================= */}

      <div className="shrink-0 px-4 pb-4 sm:hidden">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
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
                <Wifi
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

      {/* =================================================
          COMMUNICATION WORKSPACE

          This takes ONLY the remaining height.
      ================================================= */}

      <main
        className="
          min-h-0
          flex-1
          px-4
          pb-4
          sm:px-6
        "
      >
        <div
          className="
            h-full
            min-h-0
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* =================================================
              GRID
          ================================================= */}

          <div
            className="
              grid
              h-full
              min-h-0
              min-w-0
              grid-cols-1
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
                border-slate-200
                lg:border-r
                ${
                  activeConversation
                    ? "hidden lg:block"
                    : "block"
                }
              `}
            >
              <ConversationList
                conversations={conversations}
                currentUserId={user?.id}
                activeConversationId={
                  activeConversationId
                }
                onSelect={selectConversation}
                onNewConversation={
                  openNewConversation
                }
                loading={
                  loadingConversations
                }
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
                    user?.id
                  }
                  typingUsers={
                    typingUsers
                  }
                  loading={
                    loadingMessages
                  }
                  onSend={sendMessage}
                  onTypingStart={
                    startTyping
                  }
                  onTypingStop={
                    stopTyping
                  }
                  onBack={() =>
                    selectConversation(
                      null
                    )
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