
import { MessageCircle, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import ConversationItem from "./ConversationItem";
import { useChat } from "../../context/ChatContext";

const getOtherParticipant = (conversation, currentUserId) => {
  return conversation?.participants?.find(
    (participant) =>
      String(participant?._id) !== String(currentUserId)
  );
};

const ConversationList = () => {
  const {
    conversations,
    currentUser,
    selectedConversationId,
    selectConversation,
    loadingConversations,
    onlineUsers,
  } = useChat();

  const [search, setSearch] = useState("");

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return conversations;

    return conversations.filter((conversation) => {
      const participant = getOtherParticipant(
        conversation,
        currentUser?._id
      );

      return (
        participant?.name?.toLowerCase().includes(value) ||
        participant?.email?.toLowerCase().includes(value)
      );
    });
  }, [conversations, currentUser?._id, search]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white md:w-80">
      <div className="border-b border-slate-200 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
              Workspace
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Messages
            </h2>
          </div>

          <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
            <MessageCircle size={20} />
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loadingConversations ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center px-5 text-center">
            <Users size={30} className="text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No conversations found
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Start a conversation with a team member.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const participant = getOtherParticipant(
                conversation,
                currentUser?._id
              );

              const participantId = String(
                participant?._id || ""
              );

              return (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  currentUserId={currentUser?._id}
                  selected={
                    String(conversation._id) ===
                    String(selectedConversationId)
                  }
                  online={onlineUsers.some(
                    (id) => String(id) === participantId
                  )}
                  onClick={() =>
                    selectConversation(conversation)
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;