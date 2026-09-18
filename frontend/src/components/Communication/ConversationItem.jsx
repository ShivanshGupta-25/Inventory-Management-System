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

  const other =
    conversation.participants?.find(
      (participant) =>
        String(participant.id) !==
        String(currentUserId)
    );

  return (
    other?.name ||
    other?.email ||
    "Unknown user"
  );
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const ConversationItem = ({
  conversation,
  currentUserId,
  active,
  onClick,
}) => {
  const name =
    getConversationName(
      conversation,
      currentUserId
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b transition ${
        active
          ? "bg-blue-50"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
          {conversation.type ===
          "group"
            ? "G"
            : getInitials(name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {name}
            </h3>

            {conversation.lastMessageAt && (
              <span className="shrink-0 text-xs text-gray-400">
                {new Date(
                  conversation.lastMessageAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-xs text-gray-500">
            {conversation.lastMessage
              ?.text ||
              "No messages yet"}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;