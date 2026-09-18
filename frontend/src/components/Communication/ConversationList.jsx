import { useMemo, useState } from "react";
import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations,
  currentUserId,
  activeConversationId,
  onSelect,
  onNewConversation,
  loading,
}) => {
  const [search, setSearch] =
    useState("");

  const filteredConversations =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const groupName =
            conversation.name || "";

          const participantNames =
            conversation.participants
              ?.map(
                (participant) =>
                  `${participant.name} ${participant.email}`
              )
              .join(" ") || "";

          return `${groupName} ${participantNames}`
            .toLowerCase()
            .includes(value);
        }
      );
    }, [conversations, search]);

  return (
    <aside className="flex h-full w-full flex-col border-r bg-white md:w-80">
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Messages
          </h2>

          <button
            type="button"
            onClick={onNewConversation}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New
          </button>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search conversations..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading conversations...
          </div>
        ) : filteredConversations.length ===
          0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No conversations yet.
          </div>
        ) : (
          filteredConversations.map(
            (conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={
                  conversation
                }
                currentUserId={
                  currentUserId
                }
                active={
                  String(
                    conversation.id
                  ) ===
                  String(
                    activeConversationId
                  )
                }
                onClick={() =>
                  onSelect(
                    conversation.id
                  )
                }
              />
            )
          )
        )}
      </div>
    </aside>
  );
};

export default ConversationList;