import ConversationHeader from "./ConversationHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";

const ConversationWindow = ({
  conversation,
  messages,
  currentUserId,
  typingUsers,
  loading,
  onSend,
  onTypingStart,
  onTypingStop,
}) => {
  if (!conversation) {
    return null;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <ConversationHeader
        conversation={conversation}
        currentUserId={currentUserId}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        typingUsers={typingUsers}
      />

      <MessageComposer
        disabled={loading}
        onSend={onSend}
        onTypingStart={() =>
          onTypingStart(
            conversation.id
          )
        }
        onTypingStop={() =>
          onTypingStop(
            conversation.id
          )
        }
      />
    </section>
  );
};

export default ConversationWindow;