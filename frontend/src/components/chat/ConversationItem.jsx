
import { MessageCircle, Circle } from "lucide-react";

const getParticipant = (conversation, currentUserId) => {
  return (
    conversation?.participants?.find(
      (participant) =>
        String(participant?._id) !== String(currentUserId)
    ) || conversation?.participants?.[0]
  );
};

const ConversationItem = ({
  conversation,
  currentUserId,
  selected = false,
  online = false,
  onClick,
}) => {
  const participant = getParticipant(
    conversation,
    currentUserId
  );

  const name = participant?.name || "Unknown user";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const lastMessage =
    conversation?.lastMessage?.content ||
    "Start a conversation";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
        selected
          ? "bg-amber-50 ring-1 ring-amber-200"
          : "hover:bg-slate-50"
      }`}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {initials || <MessageCircle size={18} />}

        {online && (
          <Circle
            size={12}
            fill="currentColor"
            className="absolute -bottom-0.5 -right-0.5 text-emerald-500"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold text-slate-900">
            {name}
          </h4>

          {conversation?.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>

        <p className="truncate text-xs text-slate-500">
          {lastMessage}
        </p>
      </div>
    </button>
  );
};

export default ConversationItem;