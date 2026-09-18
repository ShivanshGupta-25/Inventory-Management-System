const ConversationHeader = ({
  conversation,
  currentUserId,
}) => {
  if (!conversation) {
    return null;
  }

  let title =
    conversation.name;

  let subtitle = "";

  if (
    conversation.type === "direct"
  ) {
    const other =
      conversation.participants?.find(
        (participant) =>
          String(participant.id) !==
          String(currentUserId)
      );

    title =
      other?.name ||
      other?.email ||
      "Unknown user";

    subtitle =
      other?.role || "";
  } else {
    subtitle = `${
      conversation.participants
        ?.length || 0
    } participants`;
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-5 py-4">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-gray-900">
          {title || "Conversation"}
        </h2>

        <p className="mt-1 text-xs capitalize text-gray-500">
          {conversation.type}
          {subtitle
            ? ` · ${subtitle}`
            : ""}
        </p>
      </div>

      {conversation.type ===
        "group" && (
        <div className="text-sm text-gray-400">
          {conversation.participants
            ?.length || 0}
        </div>
      )}
    </header>
  );
};

export default ConversationHeader;