
import { Send, Smile, Paperclip } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useChat } from "../../context/ChatContext";

const MessageComposer = () => {
  const {
    selectedConversationId,
    sendMessage,
    sendingMessage,
    startTyping,
    stopTyping,
  } = useChat();

  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value;

    setContent(value);

    if (!selectedConversationId) return;

    startTyping(selectedConversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversationId);
    }, 1000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || sendingMessage) {
      return;
    }

    try {
      await sendMessage(trimmedContent);
      setContent("");

      if (selectedConversationId) {
        stopTyping(selectedConversationId);
      }
    } catch {
      // Error is handled by ChatContext.
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-3 md:p-4"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
        <button
          type="button"
          disabled
          title="Attachments coming soon"
          className="rounded-xl p-2 text-slate-400"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          rows={1}
          placeholder="Write a message..."
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          disabled
          title="Emoji support coming soon"
          className="rounded-xl p-2 text-slate-400"
        >
          <Smile size={18} />
        </button>

        <button
          type="submit"
          disabled={!content.trim() || sendingMessage}
          className="rounded-xl bg-amber-500 p-2.5 text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </div>

      <p className="mt-2 px-1 text-[10px] text-slate-400">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </form>
  );
};

export default MessageComposer;