import {
  useEffect,
  useRef,
  useState,
} from "react";

const MessageComposer = ({
  disabled,
  onSend,
  onTypingStart,
  onTypingStop,
}) => {
  const [text, setText] =
    useState("");

  const typingTimeoutRef =
    useRef(null);

  const handleChange = (event) => {
    const value =
      event.target.value;

    setText(value);

    if (!value.trim()) {
      onTypingStop?.();
      return;
    }

    onTypingStart?.();

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
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
      await onSend(value);

      setText("");
      onTypingStop?.();

      clearTimeout(
        typingTimeoutRef.current
      );
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

  return (
    <form
      onSubmit={submit}
      className="border-t bg-white p-4"
    >
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
          placeholder="Write a message..."
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
    </form>
  );
};

export default MessageComposer;