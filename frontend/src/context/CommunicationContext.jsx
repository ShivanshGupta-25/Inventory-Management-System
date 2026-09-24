import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import communicationService from "../services/communicationService";
import useCommunicationSocket from "../hooks/useCommunicationSocket";
import { useAuth } from "../hooks/useAuth";

const CommunicationContext = createContext(null);

/* =====================================================
   MESSAGE DELETION HELPERS
====================================================== */

const getMessageId = (message) =>
  message?.id || message?._id || null;

const createDeletedForEveryoneMessage = (
  message,
  deletedAt = null
) => ({
  ...message,
  text: "",
  attachments: [],
  reactions: [],
  deletedForEveryone: true,
  deletedAt:
    deletedAt ||
    message?.deletedAt ||
    null,
});

const createDeletedForMeReply = (
  replyTo
) => ({
  ...replyTo,
  text: "",
  attachments: [],
  reactions: [],
  deletedForMe: true,
});

/* =====================================================
   PROVIDER
====================================================== */

export const CommunicationProvider = ({
  children,
}) => {
  const { user } = useAuth();

  const token = localStorage.getItem("token");

  const [conversations, setConversations] =
    useState([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState(null);

  const [messages, setMessages] = useState([]);

  const [users, setUsers] = useState([]);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [typingUsers, setTypingUsers] =
    useState([]);

  /* =====================================================
     REPLY STATE
  ====================================================== */

  const [replyingTo, setReplyingTo] =
    useState(null);

  /* =====================================================
     LOAD CONVERSATIONS
  ====================================================== */

  const loadConversations =
    useCallback(async () => {
      try {
        setLoadingConversations(true);

        const response =
          await communicationService.getConversations();

        setConversations(response.data || []);
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      } finally {
        setLoadingConversations(false);
      }
    }, []);

  /* =====================================================
     LOAD USERS
  ====================================================== */

  const searchUsers = useCallback(
    async (search = "") => {
      try {
        const response =
          await communicationService.getUsers(
            search
          );

        setUsers(response.data || []);

        return response.data || [];
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );

        return [];
      }
    },
    []
  );

  /* =====================================================
     LOAD MESSAGES
  ====================================================== */

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);

        const response =
          await communicationService.getMessages(
            conversationId
          );

        setMessages(response.data || []);

        await communicationService.markRead(
          conversationId
        );
      } catch (error) {
        console.error(
          "Failed to load messages:",
          error
        );
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  /* =====================================================
     SELECT CONVERSATION
  ====================================================== */

  const selectConversation =
    useCallback(
      async (conversationId) => {
        setTypingUsers([]);

        setReplyingTo(null);

        setConversations((current) =>
          current.map((conversation) =>
            String(conversation.id) ===
            String(conversationId)
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation
          )
        );

        setActiveConversationId(
          conversationId
        );

        await loadMessages(
          conversationId
        );
      },
      [loadMessages]
    );

  /* =====================================================
     SEND MESSAGE
  ====================================================== */

  const sendMessage = useCallback(
    async (
      text = "",
      files = [],
      replyTo = null
    ) => {
      if (!activeConversationId) {
        return null;
      }

      try {
        const response =
          await communicationService.sendMessage(
            activeConversationId,
            text,
            files,
            replyTo
          );

        const message = response.data;

        /*
         * Socket.IO also broadcasts the message.
         *
         * Do not append it here because doing so
         * would cause duplicate messages.
         */

        return message;
      } catch (error) {
        console.error(
          "Failed to send message:",
          error
        );

        throw error;
      }
    },
    [activeConversationId]
  );

  /* =====================================================
     SEND REPLY
  ====================================================== */

  const sendReply = useCallback(
    async (text) => {
      if (
        !replyingTo ||
        !activeConversationId
      ) {
        return null;
      }

      try {
        const replyToId =
          replyingTo.id ||
          replyingTo._id;

        const result = await sendMessage(
          text,
          [],
          replyToId
        );

        // Clear reply mode after successful send.
        setReplyingTo(null);

        return result;
      } catch (error) {
        console.error(
          "Failed to send reply:",
          error
        );

        throw error;
      }
    },
    [
      replyingTo,
      activeConversationId,
      sendMessage,
    ]
  );

  /* =====================================================
     TOGGLE MESSAGE REACTION
  ====================================================== */

  const toggleMessageReaction =
    useCallback(
      async (messageId, emoji) => {
        return communicationService.toggleMessageReaction(
          messageId,
          emoji
        );
      },
      []
    );

  /* =====================================================
     CREATE DIRECT
  ====================================================== */

  const createDirectConversation =
    useCallback(
      async (userId) => {
        const response =
          await communicationService.createDirectConversation(
            userId
          );

        const conversation =
          response.data;

        setConversations((current) => {
          const exists = current.some(
            (item) =>
              String(item.id) ===
              String(conversation.id)
          );

          if (exists) {
            return current;
          }

          return [
            conversation,
            ...current,
          ];
        });

        setActiveConversationId(
          conversation.id
        );

        // New conversation cannot have
        // an active reply from another conversation.
        setReplyingTo(null);

        await loadMessages(
          conversation.id
        );

        return conversation;
      },
      [loadMessages]
    );

  /* =====================================================
     REACTION SOCKET EVENT
  ====================================================== */

  const handleReaction = useCallback(
    (reactionData) => {
      if (!reactionData?.messageId) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          String(message.id) ===
          String(
            reactionData.messageId
          )
            ? {
                ...message,
                reactions:
                  reactionData.reactions ||
                  [],
              }
            : message
        )
      );

      /*
       * If the message being replied to receives
       * a reaction, keep the reply preview in sync.
       */

      setReplyingTo((current) => {
        if (
          !current ||
          String(
            getMessageId(current)
          ) !==
            String(
              reactionData.messageId
            )
        ) {
          return current;
        }

        return {
          ...current,
          reactions:
            reactionData.reactions ||
            [],
        };
      });
    },
    []
  );

  /* =====================================================
     DELETE MESSAGE FOR ME SOCKET EVENT
  ====================================================== */

  const handleMessageDeletedForMe =
    useCallback((deletionData) => {
      if (!deletionData?.messageId) {
        return;
      }

      const deletedMessageId =
        String(deletionData.messageId);

      /*
       * Remove the message from the currently
       * loaded message list.
       */
      setMessages((currentMessages) =>
        currentMessages
          .filter(
            (message) =>
              String(
                getMessageId(message)
              ) !== deletedMessageId
          )
          .map((message) => {
            /*
             * A reply to the deleted message must not
             * continue exposing the deleted message's
             * content through its reply preview.
             */
            const replyTo =
              message.replyTo;

            if (
              !replyTo ||
              String(
                getMessageId(replyTo)
              ) !== deletedMessageId
            ) {
              return message;
            }

            return {
              ...message,
              replyTo:
                createDeletedForMeReply(
                  replyTo
                ),
            };
          })
      );

      /*
       * If the deleted message was the current
       * reply target, clear reply mode.
       */
      setReplyingTo((current) => {
        if (
          !current ||
          String(
            getMessageId(current)
          ) !== deletedMessageId
        ) {
          return current;
        }

        return null;
      });
    }, []);

  /* =====================================================
     DELETE MESSAGE FOR EVERYONE SOCKET EVENT
  ====================================================== */

  const handleMessageDeleted =
    useCallback((deletionData) => {
      if (!deletionData?.messageId) {
        return;
      }

      const deletedMessageId =
        String(deletionData.messageId);

      /*
       * Replace the message with a tombstone
       * instead of removing it.
       */
      setMessages((currentMessages) =>
        currentMessages.map((message) => {
          const messageId = String(
            getMessageId(message)
          );

          if (
            messageId === deletedMessageId
          ) {
            return createDeletedForEveryoneMessage(
              message,
              deletionData.deletedAt
            );
          }

          /*
           * Replies should also stop displaying
           * the deleted parent's content.
           */
          const replyTo =
            message.replyTo;

          if (
            replyTo &&
            String(
              getMessageId(replyTo)
            ) === deletedMessageId
          ) {
            return {
              ...message,
              replyTo:
                createDeletedForEveryoneMessage(
                  replyTo,
                  deletionData.deletedAt
                ),
            };
          }

          return message;
        })
      );

      /*
       * Keep the active reply preview synchronized.
       */
      setReplyingTo((current) => {
        if (
          !current ||
          String(
            getMessageId(current)
          ) !== deletedMessageId
        ) {
          return current;
        }

        return createDeletedForEveryoneMessage(
          current,
          deletionData.deletedAt
        );
      });

      /*
       * If this deleted message is currently shown
       * as the conversation's last message, turn that
       * preview into a tombstone too.
       *
       * Delete-for-me is intentionally NOT handled here
       * because its conversation preview is user-specific
       * and will be handled separately.
       */
      setConversations((current) =>
        current.map((conversation) => {
          if (
            String(conversation.id) !==
            String(
              deletionData.conversationId
            )
          ) {
            return conversation;
          }

          const lastMessage =
            conversation.lastMessage;

          if (
            !lastMessage ||
            String(
              getMessageId(lastMessage)
            ) !== deletedMessageId
          ) {
            return conversation;
          }

          return {
            ...conversation,
            lastMessage:
              createDeletedForEveryoneMessage(
                lastMessage,
                deletionData.deletedAt
              ),
          };
        })
      );
    }, []);

  /* =====================================================
     DELETE MESSAGE FOR ME
  ====================================================== */

  const deleteMessageForMe =
    useCallback(
      async (messageId) => {
        try {
          const response =
            await communicationService.deleteMessageForMe(
              messageId
            );

          const result = response.data;

          /*
           * Update immediately for a responsive UI.
           *
           * The socket event will also arrive, but the
           * handler is idempotent, so it is safe to run
           * again.
           */
          handleMessageDeletedForMe({
            messageId:
              result?.messageId ||
              result?.id ||
              messageId,
            conversationId:
              result?.conversationId,
          });

          return result;
        } catch (error) {
          console.error(
            "Failed to delete message for me:",
            error
          );

          throw error;
        }
      },
      [handleMessageDeletedForMe]
    );

  /* =====================================================
     DELETE MESSAGE FOR EVERYONE
  ====================================================== */

  const deleteMessageForEveryone =
    useCallback(
      async (messageId) => {
        try {
          const response =
            await communicationService.deleteMessageForEveryone(
              messageId
            );

          const result = response.data;

          /*
           * Update immediately for the current user.
           *
           * The socket event will also arrive for every
           * participant, including the sender. Applying
           * the same tombstone twice is harmless.
           */
          handleMessageDeleted({
            messageId:
              result?.messageId ||
              result?.id ||
              messageId,
            conversationId:
              result?.conversationId,
            deletedForEveryone:
              result?.deletedForEveryone !==
              false,
            deletedAt:
              result?.deletedAt || null,
          });

          return result;
        } catch (error) {
          console.error(
            "Failed to delete message for everyone:",
            error
          );

          throw error;
        }
      },
      [handleMessageDeleted]
    );

  /* =====================================================
     CREATE GROUP
  ====================================================== */

  const createGroupConversation =
    useCallback(
      async (
        name,
        participantIds
      ) => {
        const response =
          await communicationService.createGroupConversation(
            name,
            participantIds
          );

        const conversation =
          response.data;

        setConversations((current) => [
          conversation,
          ...current.filter(
            (item) =>
              String(item.id) !==
              String(conversation.id)
          ),
        ]);

        setActiveConversationId(
          conversation.id
        );

        setMessages([]);

        // Clear any reply from another conversation.
        setReplyingTo(null);

        return conversation;
      },
      []
    );

  /* =====================================================
     SOCKET MESSAGE
  ====================================================== */

  const handleMessage = useCallback(
    (message) => {
      if (!message?.conversationId) {
        return;
      }

      const conversationId = String(
        message.conversationId
      );

      const isActive =
        conversationId ===
        String(activeConversationId);

      const isOwnMessage =
        String(message.sender?.id) ===
        String(user?.id);

      setMessages((current) => {
        if (isActive) {
          if (
            current.some(
              (item) =>
                String(item.id) ===
                String(message.id)
            )
          ) {
            return current;
          }

          return [
            ...current,
            message,
          ];
        }

        return current;
      });

      setConversations((current) => {
        const existing =
          current.find(
            (conversation) =>
              String(conversation.id) ===
              conversationId
          );

        if (!existing) {
          return current;
        }

        const updatedConversation = {
          ...existing,
          lastMessage: message,
          lastMessageAt:
            message.createdAt,
          updatedAt:
            message.createdAt,

          unreadCount: isActive || isOwnMessage
            ? 0
            : Number(
                existing.unreadCount || 0
              ) + 1,
        };

        return [
          updatedConversation,
          ...current.filter(
            (conversation) =>
              String(conversation.id) !==
              conversationId
          ),
        ];
      });
    },
    [
      activeConversationId,
      user?.id,
    ]
  );

  /* =====================================================
     NEW CONVERSATION
  ====================================================== */

  const handleConversationNew =
    useCallback((conversation) => {
      setConversations((current) => {
        const exists = current.some(
          (item) =>
            String(item.id) ===
            String(conversation.id)
        );

        if (exists) {
          return current;
        }

        return [
          conversation,
          ...current,
        ];
      });
    }, []);

  /* =====================================================
     CONVERSATION UPDATED
  ====================================================== */

  const handleConversationUpdated =
    useCallback((payload) => {
      if (!payload?.conversationId) {
        return;
      }

      setConversations((current) =>
        current.map(
          (conversation) =>
            String(conversation.id) ===
            String(
              payload.conversationId
            )
              ? {
                  ...conversation,
                  ...(payload.lastMessage
                    ? {
                        lastMessage:
                          payload.lastMessage,
                        lastMessageAt:
                          payload.lastMessage
                            .createdAt,
                      }
                    : {}),
                }
              : conversation
        )
      );
    }, []);

  /* =====================================================
     READ
  ====================================================== */

  const handleMessageRead =
    useCallback(() => {
      /*
       * Read state can be expanded later.
       * lastReadAt is already persisted
       * by the backend.
       */
    }, []);

  /* =====================================================
     TYPING
  ====================================================== */

  const handleTypingStart =
    useCallback(
      (payload) => {
        if (
          String(
            payload.conversationId
          ) !==
          String(activeConversationId)
        ) {
          return;
        }

        if (
          String(payload.userId) ===
          String(user?.id)
        ) {
          return;
        }

        setTypingUsers((current) => {
          if (
            current.includes(
              String(payload.userId)
            )
          ) {
            return current;
          }

          return [
            ...current,
            String(payload.userId),
          ];
        });
      },
      [
        activeConversationId,
        user?.id,
      ]
    );

  const handleTypingStop =
    useCallback((payload) => {
      setTypingUsers((current) =>
        current.filter(
          (id) =>
            String(id) !==
            String(payload.userId)
        )
      );
    }, []);

  /* =====================================================
     SOCKET
  ====================================================== */

  const socket =
    useCommunicationSocket({
      token,

      onMessage:
        handleMessage,

      onConversationNew:
        handleConversationNew,

      onConversationUpdated:
        handleConversationUpdated,

      onMessageRead:
        handleMessageRead,

      onTypingStart:
        handleTypingStart,

      onTypingStop:
        handleTypingStop,

      onReaction:
        handleReaction,

      onMessageDeleted:
        handleMessageDeleted,

      onMessageDeletedForMe:
        handleMessageDeletedForMe,
    });

  /* =====================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    loadConversations();
  }, [
    user,
    loadConversations,
  ]);

  /* =====================================================
     JOIN ACTIVE CONVERSATION
  ====================================================== */

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    socket.joinConversation(
      activeConversationId
    );

    return () => {
      socket.leaveConversation(
        activeConversationId
      );
    };
  }, [
    activeConversationId,
    socket.joinConversation,
    socket.leaveConversation,
  ]);

  /* =====================================================
     ACTIVE CONVERSATION
  ====================================================== */

  const activeConversation =
    conversations.find(
      (conversation) =>
        String(conversation.id) ===
        String(
          activeConversationId
        )
    ) || null;

  /* =====================================================
     CONTEXT VALUE
  ====================================================== */

  const value = useMemo(
    () => ({
      conversations,

      activeConversation,

      activeConversationId,

      messages,

      users,

      typingUsers,

      loadingConversations,

      loadingMessages,

      /* Reply state */
      replyingTo,

      setReplyingTo,

      connected:
        socket.connected,

      connectionStatus:
        socket.connectionStatus,

      setActiveConversationId,

      selectConversation,

      searchUsers,

      createDirectConversation,

      createGroupConversation,

      sendMessage,

      sendReply,

      toggleMessageReaction,

      deleteMessageForMe,

      deleteMessageForEveryone,

      startTyping:
        socket.startTyping,

      stopTyping:
        socket.stopTyping,

      reloadConversations:
        loadConversations,
    }),
    [
      conversations,

      activeConversation,

      activeConversationId,

      messages,

      users,

      typingUsers,

      loadingConversations,

      loadingMessages,

      /* Reply state */
      replyingTo,

      socket.connected,

      socket.connectionStatus,

      socket.startTyping,

      socket.stopTyping,

      selectConversation,

      searchUsers,

      createDirectConversation,

      createGroupConversation,

      sendMessage,

      sendReply,

      toggleMessageReaction,

      deleteMessageForMe,

      deleteMessageForEveryone,

      loadConversations,
    ]
  );

  return (
    <CommunicationContext.Provider
      value={value}
    >
      {children}
    </CommunicationContext.Provider>
  );
};

/* =====================================================
   HOOK
====================================================== */

export const useCommunication =
  () => {
    const context =
      useContext(
        CommunicationContext
      );

    if (!context) {
      throw new Error(
        "useCommunication must be used inside CommunicationProvider"
      );
    }

    return context;
  };

export default CommunicationContext;