const MessageItem = ({
  message,
  own,
}) => {
  const time = new Date(
    message.createdAt
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
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
          <div className="mb-1 px-1 text-xs font-medium text-gray-600">
            {message.sender?.name ||
              "Unknown user"}
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 ${
            own
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md bg-gray-100 text-gray-900"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">
            {message.text}
          </p>
        </div>

        <div
          className={`mt-1 px-1 text-[11px] text-gray-400 ${
            own
              ? "text-right"
              : "text-left"
          }`}
        >
          {time}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;