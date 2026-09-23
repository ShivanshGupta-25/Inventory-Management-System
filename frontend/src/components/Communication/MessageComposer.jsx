import {
  useEffect,
  useRef,
  useState,
} from "react";

import { X } from "lucide-react";

const MessageComposer = ({
  disabled,
  onSend,
  onTypingStart,
  onTypingStop,
  replyingTo,
  onCancelReply,
}) => {
  const [text, setText] = useState("");

  const typingTimeoutRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value;

    setText(value);

    if (!value.trim()) {
      onTypingStop?.();
      return;
    }

    onTypingStart?.();

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 1000);
  };

  const submit = async (event) => {
    event.preventDefault();

    const value = text.trim();

    if (!value || disabled) {
      return;
    }

    try {
      /*
       * Normal message:
       * onSend(text, [], null)
       *
       * Reply:
       * onSend(text, [], replyingTo.id)
       */
      await onSend(
        value,
        [],
        replyingTo?.id || replyingTo?._id || null
      );

      setText("");
      onTypingStop?.();

      clearTimeout(
        typingTimeoutRef.current
      );

      /*
       * Reply mode is finished after
       * the message has successfully sent.
       */
      if (replyingTo) {
        onCancelReply?.();
      }
    } catch {
      // Parent handles/report send errors.
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(
        typingTimeoutRef.current
      );
    };
  }, []);

  const replyText =
    replyingTo?.text ||
    replyingTo?.attachments?.[0]?.name ||
    "Attachment";

  const replySender =
    replyingTo?.sender?.name ||
    "User";

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white">

      {replyingTo && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-1 shrink-0 rounded-full bg-blue-500" />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-blue-600">
                Replying to{" "}
                {replyingTo.sender?.name ||
                  replyingTo.sender?.fullName ||
                  replyingTo.senderName ||
                  "message"}
              </p>

              <p className="mt-0.5 truncate text-xs text-gray-500">
                {replyingTo.text ||
                  replyingTo.content ||
                  "Attachment"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCancelReply?.()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
              aria-label="Cancel reply"
              title="Cancel reply"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    
      <form
        onSubmit={submit}
        className="border-t border-slate-200 bg-white"
      >
        {/* =====================================================
            REPLY PREVIEW
        ===================================================== */}

        {replyingTo && (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 border-l-2 border-blue-500 pl-3">
                <p className="text-xs font-semibold text-blue-600">
                  Replying to {replySender}
                </p>

                <p className="mt-1 truncate text-sm text-slate-600">
                  {replyText}
                </p>
              </div>

              <button
                type="button"
                onClick={onCancelReply}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                aria-label="Cancel reply"
                title="Cancel reply"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            MESSAGE INPUT
        ===================================================== */}

        <div className="p-4">
          <div className="flex items-end gap-3">
            <textarea
              value={text}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  submit(event);
                }
              }}
              disabled={disabled}
              rows={1}
              maxLength={5000}
              placeholder={
                replyingTo
                  ? "Write a reply..."
                  : "Write a message..."
              }
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={
                disabled ||
                !text.trim()
              }
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;