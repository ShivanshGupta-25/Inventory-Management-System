import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({
  messages,
  currentUserId,
  loading,
  typingUsers,
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gray-50 px-4 py-5">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="font-medium text-gray-700">
              No messages yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Send the first message.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              own={
                String(
                  message.sender?.id
                ) ===
                String(currentUserId)
              }
            />
          ))}

          {typingUsers.length > 0 && (
            <div className="px-2 text-xs italic text-gray-400">
              Someone is typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;