const MessageReplyQuote = ({
  repliedMessage,
  own,
  onJump,
}) => {
  if (!repliedMessage) {
    return null;
  }

  const isDeleted =
    Boolean(
      repliedMessage.deletedForEveryone
    ) ||
    Boolean(
      repliedMessage.deletedForMe
    );

  const previewText = isDeleted
    ? "This message was deleted"
    : repliedMessage.text ||
      (Array.isArray(
        repliedMessage.attachments
      ) &&
      repliedMessage.attachments
        .length > 0
        ? repliedMessage
            .attachments[0]?.name
        : null) ||
      "Attachment";

  const canJump =
    !isDeleted &&
    Boolean(
      repliedMessage.id ||
        repliedMessage._id
    );

  const content = (
    <>
      <p
        className={`truncate text-xs font-semibold ${
          own
            ? "text-white/90"
            : "text-blue-600"
        }`}
      >
        {repliedMessage.sender
          ?.name || "Unknown user"}
      </p>

      <p
        className={`mt-0.5 truncate text-xs ${
          isDeleted
            ? "italic opacity-70"
            : ""
        } ${
          own
            ? "text-white/70"
            : "text-gray-500"
        }`}
      >
        {previewText}
      </p>
    </>
  );

  if (!canJump) {
    return (
      <div
        className={`mb-1.5 block w-full min-w-0 rounded-lg border-l-4 px-2.5 py-1.5 text-left ${
          own
            ? "border-white/50 bg-white/10"
            : "border-blue-500 bg-black/5"
        }`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onJump?.(
          repliedMessage.id ||
            repliedMessage._id
        )
      }
      className={`mb-1.5 block w-full min-w-0 rounded-lg border-l-4 px-2.5 py-1.5 text-left transition ${
        own
          ? "border-white/50 bg-white/10 hover:bg-white/20"
          : "border-blue-500 bg-black/5 hover:bg-black/10"
      }`}
    >
      {content}
    </button>
  );
};

export default MessageReplyQuote;