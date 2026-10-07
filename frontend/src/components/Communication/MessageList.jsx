import {
  useEffect,
} from "react";

import MessageItem from "./MessageItem";

const MessageList = ({
  messages,
  currentUserId,
  loading,

  // Scroll
  messagesContainerRef,
  messagesContentRef,
  onScroll,

  // Message actions
  onReply,
  onOpenThread,

  // Selection
  selectionMode,
  selectedMessageIds,
  onToggleSelect,
  onEnterSelectionMode,
  onClearSelection,

  // Message action menu
  activeMenuMessageId,
  onMenuOpenChange,
}) => {
  useEffect(() => {
    // Intentionally kept lightweight.
    // ConversationWindow owns the scroll-to-bottom
    // behavior because it coordinates search/navigation.
  }, [messages]);

  if (loading) {
    return (
      <div
        ref={
          messagesContainerRef
        }
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-3 py-4 sm:px-5"
      >
        <div className="flex h-full items-center justify-center">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
            Loading messages...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={
        messagesContainerRef
      }
      onScroll={onScroll}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-3 py-4 sm:px-5"
    >
      {messages?.length ? (
        <div
          ref={
            messagesContentRef
          }
          className="flex flex-col gap-3"
        >
          {messages.map(
            (message) => {
              const messageId =
                message?.id ||
                message?._id;

              const senderId =
                message?.sender?.id ||
                message?.sender?._id ||
                message?.senderId;

              const own =
                String(senderId) ===
                String(currentUserId);

              return (
                <div
                  key={messageId}
                  id={`message-${messageId}`}
                  className="min-w-0"
                >
                  <MessageItem
                    message={
                      message
                    }
                    own={own}
                    onReply={
                      onReply
                    }
                    onOpenThread={
                      onOpenThread
                    }
                    selectionMode={
                      selectionMode
                    }
                    selected={
                      selectedMessageIds.has(
                        String(
                          messageId
                        )
                      )
                    }
                    onToggleSelect={
                      onToggleSelect
                    }
                    onEnterSelectionMode={
                      onEnterSelectionMode
                    }
                    onClearSelection={
                      onClearSelection
                    }
                    activeMenuMessageId={
                      activeMenuMessageId
                    }
                    onMenuOpenChange={
                      onMenuOpenChange
                    }
                  />
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              No messages yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Send a message to start
              the conversation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;