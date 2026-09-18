import { useState } from "react";

import {
  useCommunication,
} from "../../context/CommunicationContext";

import { useAuth } from "../../hooks/useAuth";

import ConversationList from "./ConversationList";
import ConversationWindow from "./ConversationWindow";
import EmptyConversation from "./EmptyConversation";
import NewConversation from "./NewConversation";

const CommunicationLayout = () => {
  const { user } = useAuth();

  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    typingUsers,

    loadingConversations,
    loadingMessages,

    selectConversation,

    users,
    searchUsers,

    createDirectConversation,
    createGroupConversation,

    sendMessage,
    startTyping,
    stopTyping,
  } = useCommunication();

  const [
    showNewConversation,
    setShowNewConversation,
  ] = useState(false);

  const [
    loadingUsers,
    setLoadingUsers,
  ] = useState(false);

  const openNewConversation =
    async () => {
      setShowNewConversation(true);

      try {
        setLoadingUsers(true);
        await searchUsers("");
      } finally {
        setLoadingUsers(false);
      }
    };

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border bg-white shadow-sm">
      <ConversationList
        conversations={conversations}
        currentUserId={user?.id}
        activeConversationId={
          activeConversationId
        }
        onSelect={
          selectConversation
        }
        onNewConversation={
          openNewConversation
        }
        loading={
          loadingConversations
        }
      />

      {activeConversation ? (
        <ConversationWindow
          conversation={
            activeConversation
          }
          messages={messages}
          currentUserId={user?.id}
          typingUsers={typingUsers}
          loading={loadingMessages}
          onSend={sendMessage}
          onTypingStart={
            startTyping
          }
          onTypingStop={
            stopTyping
          }
        />
      ) : (
        <EmptyConversation
          onNewConversation={
            openNewConversation
          }
        />
      )}

      {showNewConversation && (
        <NewConversation
          users={users}
          loadingUsers={loadingUsers}
          onClose={() =>
            setShowNewConversation(
              false
            )
          }
          onCreateDirect={
            createDirectConversation
          }
          onCreateGroup={
            createGroupConversation
          }
        />
      )}
    </div>
  );
};

export default CommunicationLayout;