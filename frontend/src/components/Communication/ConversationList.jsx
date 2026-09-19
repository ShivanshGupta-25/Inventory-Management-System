import { useMemo, useState } from "react";
import {
  MessageSquarePlus,
  Search,
  Users,
} from "lucide-react";

const getConversationName = (
  conversation,
  currentUserId
) => {
  if (conversation.type === "group") {
    return (
      conversation.name ||
      "Unnamed group"
    );
  }

  const participants =
    conversation.participants ||
    conversation.users ||
    [];

  const otherUser = participants.find(
    (participant) =>
      String(
        participant._id ||
          participant.id ||
          participant.userId
      ) !== String(currentUserId)
  );

  return (
    otherUser?.name ||
    otherUser?.email ||
    "Direct conversation"
  );
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join("")
    .toUpperCase();
};

const ConversationList = ({
  conversations = [],
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
          const name =
            getConversationName(
              conversation,
              currentUserId
            );

          return name
            .toLowerCase()
            .includes(value);
        }
      );
    }, [
      conversations,
      currentUserId,
      search,
    ]);

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* Header */}

      <div className="border-b border-slate-200 p-4">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Conversations
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              {conversations.length}{" "}
              conversation
              {conversations.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <button
            type="button"
            onClick={onNewConversation}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800"
            title="New conversation"
          >
            <MessageSquarePlus
              size={17}
            />
          </button>
        </div>

        {/* Search */}

        <div className="relative mt-4">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search conversations..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* List */}

      <div className="min-h-0 flex-1 overflow-y-auto">

        {loading ? (
          <div className="p-6">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="mb-3 animate-pulse"
                >
                  <div className="flex gap-3 rounded-xl p-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100" />

                    <div className="flex-1">
                      <div className="h-3 w-32 rounded bg-slate-100" />

                      <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              )
            )}

          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <MessageSquarePlus
                size={21}
                className="text-slate-400"
              />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No conversations
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Start a new conversation
              with your team.
            </p>

            <button
              type="button"
              onClick={onNewConversation}
              className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              New conversation
            </button>

          </div>
        ) : (
          <div className="p-2">

            {filteredConversations.map(
              (conversation) => {
                const name =
                  getConversationName(
                    conversation,
                    currentUserId
                  );

                const active =
                  String(
                    conversation.id ||
                      conversation._id
                  ) ===
                  String(
                    activeConversationId
                  );

                const lastMessage =
                  conversation.lastMessage;

                const preview =
                  typeof lastMessage ===
                  "string"
                    ? lastMessage
                    : lastMessage?.content ||
                      lastMessage?.text ||
                      "No messages yet";

                return (
                  <button
                    type="button"
                    key={
                      conversation.id ||
                      conversation._id
                    }
                    onClick={() =>
                      onSelect(
                        conversation.id ||
                          conversation._id
                      )
                    }
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Avatar */}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        active
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {conversation.type ===
                      "group" ? (
                        <Users size={17} />
                      ) : (
                        getInitials(name)
                      )}
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-2">

                        <p
                          className={`truncate text-sm font-medium ${
                            active
                              ? "text-blue-900"
                              : "text-slate-800"
                          }`}
                        >
                          {name}
                        </p>

                        {conversation.lastMessageAt && (
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {new Date(
                              conversation.lastMessageAt
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {preview}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;