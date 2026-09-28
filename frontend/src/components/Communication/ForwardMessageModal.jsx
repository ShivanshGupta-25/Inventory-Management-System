import React, { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

const getConversationId = (conversation) =>
  conversation?.id || conversation?._id || null;

const getConversationName = (conversation) => {
  if (!conversation) return "Conversation";

  if (conversation.name) {
    return conversation.name;
  }

  if (conversation.title) {
    return conversation.title;
  }

  if (conversation.type === "direct") {
    const otherUser =
      conversation.otherUser ||
      conversation.participant ||
      conversation.user;

    if (otherUser?.name) {
      return otherUser.name;
    }

    if (otherUser?.fullName) {
      return otherUser.fullName;
    }

    if (otherUser?.email) {
      return otherUser.email;
    }
  }

  if (Array.isArray(conversation.participants)) {
    const names = conversation.participants
      .map((participant) => {
        if (typeof participant === "string") {
          return participant;
        }

        return (
          participant?.name ||
          participant?.fullName ||
          participant?.email ||
          ""
        );
      })
      .filter(Boolean);

    if (names.length > 0) {
      return names.slice(0, 3).join(", ");
    }
  }

  return "Conversation";
};

const getConversationSubtitle = (conversation) => {
  if (!conversation) return "";

  if (conversation.type === "group") {
    if (Array.isArray(conversation.participants)) {
      return `${conversation.participants.length} participants`;
    }

    return "Group conversation";
  }

  const otherUser =
    conversation.otherUser ||
    conversation.participant ||
    conversation.user;

  return (
    otherUser?.email ||
    conversation.description ||
    "Direct conversation"
  );
};

const getConversationAvatar = (conversation) => {
  if (!conversation) return null;

  return (
    conversation.avatar ||
    conversation.avatarUrl ||
    conversation.image ||
    conversation.photoUrl ||
    conversation.otherUser?.avatar ||
    conversation.otherUser?.avatarUrl ||
    null
  );
};

const ForwardMessageModal = ({
  open = false,
  conversations = [],
  onClose,
  onForward,
  processing = false,
}) => {
  const [search, setSearch] = useState("");
  const [selectedConversationIds, setSelectedConversationIds] = useState(
    new Set()
  );

  const visibleConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const name = getConversationName(conversation).toLowerCase();
      const subtitle = getConversationSubtitle(conversation).toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        subtitle.includes(normalizedSearch)
      );
    });
  }, [conversations, search]);

  const selectedCount = selectedConversationIds.size;

  const allVisibleSelected =
    visibleConversations.length > 0 &&
    visibleConversations.every((conversation) => {
      const id = getConversationId(conversation);

      return id && selectedConversationIds.has(String(id));
    });

  const toggleConversation = (conversation) => {
    const conversationId = getConversationId(conversation);

    if (!conversationId || processing) {
      return;
    }

    const normalizedId = String(conversationId);

    setSelectedConversationIds((current) => {
      const next = new Set(current);

      if (next.has(normalizedId)) {
        next.delete(normalizedId);
      } else {
        next.add(normalizedId);
      }

      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (processing || visibleConversations.length === 0) {
      return;
    }

    setSelectedConversationIds((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        visibleConversations.forEach((conversation) => {
          const id = getConversationId(conversation);

          if (id) {
            next.delete(String(id));
          }
        });
      } else {
        visibleConversations.forEach((conversation) => {
          const id = getConversationId(conversation);

          if (id) {
            next.add(String(id));
          }
        });
      }

      return next;
    });
  };

  const handleForward = async () => {
    if (processing || selectedConversationIds.size === 0) {
      return;
    }

    await onForward(Array.from(selectedConversationIds));
  };

  const handleClose = () => {
    if (processing) {
      return;
    }

    setSearch("");
    setSelectedConversationIds(new Set());
    onClose?.();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/15 backdrop-blur-[2px] p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              Forward message
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {selectedCount > 0
                ? `${selectedCount} conversation${
                    selectedCount === 1 ? "" : "s"
                  } selected`
                : "Select one or more conversations"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={processing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-200 px-5 py-3">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={processing}
              placeholder="Search conversations..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Select all */}
        {visibleConversations.length > 0 && (
          <div className="border-b border-slate-200 px-5 py-2">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              disabled={processing}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50/70 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded border ${
                  allVisibleSelected
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "border-slate-300 bg-white"
                }`}
              >
                {allVisibleSelected && <Check size={14} />}
              </span>

              <span>
                {allVisibleSelected
                  ? "Deselect all visible"
                  : "Select all visible"}
              </span>
            </button>
          </div>
        )}

        {/* Conversations */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-3 py-2">
          {visibleConversations.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  No conversations found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try a different search.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {visibleConversations.map((conversation) => {
                const conversationId = getConversationId(conversation);

                if (!conversationId) {
                  return null;
                }

                const normalizedId = String(conversationId);
                const selected =
                  selectedConversationIds.has(normalizedId);

                const name = getConversationName(conversation);
                const subtitle = getConversationSubtitle(conversation);
                const avatar = getConversationAvatar(conversation);

                return (
                  <button
                    key={normalizedId}
                    type="button"
                    onClick={() => toggleConversation(conversation)}
                    disabled={processing}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      selected
                        ? "bg-blue-50/80 ring-1 ring-inset ring-blue-100"
                        : "hover:bg-blue-50/60"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {/* Avatar */}
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-sm shadow-blue-500/15">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Conversation info */}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {name}
                      </div>

                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {subtitle}
                      </div>
                    </div>

                    {/* Checkbox */}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected && <Check size={15} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={processing}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleForward}
            disabled={processing || selectedCount === 0}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing
              ? "Forwarding..."
              : `Forward${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;