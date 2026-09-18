
import {
  ArrowLeft,
  Circle,
  MoreVertical,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useChat } from "../../context/ChatContext";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find(
    (participant) =>
      String(participant?._id) !== String(currentUserId)
  );
};

const ChatWindow = ({ onBack }) => {
  const {
    currentUser,
    selectedConversation,
    selectedConversationId,
    messages,
    loadingMessages,
    connected,
    onlineUsers,
    typingUsers,
  } = useChat();

  const messagesEndRef = useRef(null);

  const participant = useMemo(
    () =>
      getOtherParticipant(
        selectedConversation,
        currentUser?._id
      ),
    [currentUser?._id, selectedConversation]
  );

  const participantId = String(participant?._id || "");

  const isOnline = onlineUsers.some(
    (id) => String(id) === participantId
  );

  const typingNames = Object.values(typingUsers).filter(
    Boolean
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!selectedConversationId) {
    return null;
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {(participant?.name || "U")
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900">
              {participant?.name || "Team member"}
            </h2>

            <div className="flex items-center gap-1.5">
              <Circle
                size={8}
                fill="currentColor"
                className={
                  isOnline
                    ? "text-emerald-500"
                    : "text-slate-300"
                }
              />

              <span className="text-xs text-slate-500">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi size={16} className="text-emerald-500" />
          ) : (
            <WifiOff size={16} className="text-slate-400" />
          )}

          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        {loadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                No messages yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Send the first message to start collaborating.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                currentUserId={currentUser?._id}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {typingNames.length > 0 && (
        <div className="bg-slate-50 px-5 pb-2 text-xs italic text-slate-400">
          {typingNames.join(", ")} is typing...
        </div>
      )}

      <MessageComposer />
    </section>
  );
};

export default ChatWindow;