import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
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

const ConversationWindow = ({
  conversation,
  messages = [],
  currentUserId,
  typingUsers = [],
  loading,
  onSend,
  onTypingStart,
  onTypingStop,
  onBack,
}) => {
  const [text, setText] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const name = useMemo(
    () =>
      getConversationName(
        conversation,
        currentUserId
      ),
    [conversation, currentUserId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const submit = async (event) => {
    event.preventDefault();

    const value = text.trim();

    if (!value) {
      return;
    }

    try {
      await onSend(value);
      setText("");
      onTypingStop?.();
    } catch {
      // Sending errors are handled by the
      // communication context.
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;

    setText(value);

    if (value.trim()) {
      onTypingStart?.();
    } else {
      onTypingStop?.();
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      submit(event);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">

        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
          {conversation.type ===
          "group" ? (
            <Users size={18} />
          ) : (
            getInitials(name)
          )}
        </div>

        <div className="min-w-0 flex-1">

          <h2 className="truncate text-sm font-semibold text-slate-900">
            {name}
          </h2>

          <div className="mt-0.5 flex items-center gap-1.5">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-xs text-slate-400">
              {conversation.type ===
              "group"
                ? "Group conversation"
                : "Direct conversation"}
            </span>
          </div>
        </div>

        {conversation.type ===
          "group" &&
          conversation.participants && (
            <div className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:flex">
              <Users size={14} />

              {
                conversation
                  .participants
                  .length
              }{" "}
              members
            </div>
          )}
      </div>

      {/* ================================================
          MESSAGES
      ================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">

        {loading ? (
          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

              <p className="mt-3 text-sm text-slate-400">
                Loading messages...
              </p>

            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Send
                  size={19}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                No messages yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Send the first message.
              </p>

            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-3">

            {messages.map(
              (message) => {
                const senderId =
                  message.sender?._id ||
                  message.sender?.id ||
                  message.senderId ||
                  message.userId;

                const own =
                  String(senderId) ===
                  String(currentUserId);

                const content =
                  message.content ||
                  message.text ||
                  "";

                const senderName =
                  message.sender?.name ||
                  message.user?.name ||
                  "User";

                return (
                  <div
                    key={
                      message.id ||
                      message._id
                    }
                    className={`flex ${
                      own
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] ${
                        own
                          ? "items-end"
                          : "items-start"
                      }`}
                    >

                      {!own && (
                        <p className="mb-1 px-1 text-[11px] font-medium text-slate-400">
                          {senderName}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                          own
                            ? "rounded-br-md bg-slate-900 text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {content}
                      </div>

                      {message.createdAt && (
                        <p
                          className={`mt-1 px-1 text-[10px] text-slate-400 ${
                            own
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {new Date(
                            message.createdAt
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ================================================
          TYPING
      ================================================= */}

      {typingUsers.length > 0 && (
        <div className="border-t border-slate-100 bg-white px-5 py-2">

          <p className="text-xs text-slate-400">
            Someone is typing...
          </p>
        </div>
      )}

      {/* ================================================
          COMPOSER
      ================================================= */}

      <form
        onSubmit={submit}
        className="border-t border-slate-200 bg-white p-3 sm:p-4"
      >
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">

          <textarea
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() =>
              onTypingStop?.()
            }
            rows={1}
            placeholder="Type a message..."
            className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>

        <p className="mt-2 px-1 text-[10px] text-slate-400">
          Press Enter to send · Shift + Enter
          for a new line
        </p>
      </form>
    </div>
  );
};

export default ConversationWindow;