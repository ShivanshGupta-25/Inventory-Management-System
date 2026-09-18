
import { CheckCheck, Clock3, MoreVertical } from "lucide-react";

const MessageBubble = ({ message, currentUserId }) => {
  const senderId =
    message?.sender?._id || message?.sender?.id || message?.sender;

  const isMine =
    String(senderId) === String(currentUserId);

  const isDeleted = message?.isDeleted;

  const formattedTime = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex w-full ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[70%] ${
          isMine
            ? "rounded-br-md bg-slate-900 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        {!isMine && (
          <p className="mb-1 text-xs font-semibold text-amber-600">
            {message?.sender?.name || "Team member"}
          </p>
        )}

        <p
          className={`whitespace-pre-wrap break-words text-sm leading-6 ${
            isDeleted
              ? "italic opacity-60"
              : ""
          }`}
        >
          {isDeleted
            ? "This message was deleted"
            : message?.content}
        </p>

        <div
          className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
            isMine ? "text-slate-300" : "text-slate-400"
          }`}
        >
          <span>{formattedTime}</span>

          {isMine &&
            (message?.readBy?.length > 1 ? (
              <CheckCheck size={13} />
            ) : (
              <Clock3 size={12} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;