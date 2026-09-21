import { useMemo, useState } from "react";
import {
  MessageSquarePlus,
  Search,
  Users,
  Paperclip,
  Image as ImageIcon,
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

/*
 * Build a useful preview for the
 * conversation sidebar.
 */
const getLastMessagePreview = (
  lastMessage
) => {
  if (!lastMessage) {
    return "No messages yet";
  }

  if (typeof lastMessage === "string") {
    return lastMessage;
  }

  const text =
    lastMessage.content ||
    lastMessage.text ||
    "";

  if (text.trim()) {
    return text;
  }

  const attachments =
    lastMessage.attachments || [];

  if (attachments.length > 0) {
    const hasImage =
      attachments.some((attachment) =>
        attachment.mimeType?.startsWith(
          "image/"
        )
      );

    if (hasImage) {
      return "📷 Photo";
    }

    return "📎 File";
  }

  if (
    lastMessage.type === "image"
  ) {
    return "📷 Photo";
  }

  if (
    lastMessage.type === "file"
  ) {
    return "📎 File";
  }

  return "No messages yet";
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {/* =================================================
          HEADER
          Fixed - never scrolls
      ================================================= */}

      <div className="shrink-0 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
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
            onClick={
              onNewConversation
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800"
            title="New conversation"
            aria-label="New conversation"
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

      {/* =================================================
          LIST
          This is the ONLY scrolling area
      ================================================= */}

      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        {loading ? (
          /* =============================================
             LOADING
          ============================================= */

          <div className="p-3">
            {[
              1,
              2,
              3,
              4,
              5,
            ].map((item) => (
              <div
                key={item}
                className="mb-1 animate-pulse"
              >
                <div className="flex min-w-0 gap-3 rounded-xl p-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />

                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-32 rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length ===
          0 ? (
          /* =============================================
             EMPTY
          ============================================= */

          <div className="flex min-h-full flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
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
              onClick={
                onNewConversation
              }
              className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              New conversation
            </button>
          </div>
        ) : (
          /* =============================================
             CONVERSATIONS
          ============================================= */

          <div className="min-w-0 p-2">
            {filteredConversations.map(
              (conversation) => {
                const name =
                  getConversationName(
                    conversation,
                    currentUserId
                  );

                const conversationId =
                  conversation.id ||
                  conversation._id;

                const active =
                  String(
                    conversationId
                  ) ===
                  String(
                    activeConversationId
                  );

                const lastMessage =
                  conversation.lastMessage;

                const preview =
                  getLastMessagePreview(
                    lastMessage
                  );

                return (
                  <button
                    type="button"
                    key={conversationId}
                    onClick={() =>
                      onSelect(
                        conversationId
                      )
                    }
                    className={`mb-1 flex min-w-0 w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* =================================
                        AVATAR
                    ================================= */}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        active
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {conversation.type ===
                      "group" ? (
                        <Users
                          size={17}
                        />
                      ) : (
                        getInitials(
                          name
                        )
                      )}
                    </div>

                    {/* =================================
                        CONTENT
                    ================================= */}

                    <div className="min-w-0 flex-1">
                      {/* Name + time */}

                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-sm font-medium ${
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

                      {/* Preview */}

                      <div className="mt-1 flex min-w-0 items-center gap-1">
                        {lastMessage?.type ===
                          "image" && (
                          <ImageIcon
                            size={12}
                            className="shrink-0 text-slate-400"
                          />
                        )}

                        {lastMessage?.type ===
                          "file" && (
                          <Paperclip
                            size={12}
                            className="shrink-0 text-slate-400"
                          />
                        )}

                        <p className="min-w-0 truncate text-xs text-slate-400">
                          {preview}
                        </p>
                      </div>
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