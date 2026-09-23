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

export const CommunicationProvider = ({ children }) => {
  const { user } = useAuth();

  const token = localStorage.getItem("token");

  const [conversations, setConversations] = useState([]);

  const [activeConversationId, setActiveConversationId] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [users, setUsers] = useState([]);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [loadingMessages, setLoadingMessages] =
    useState(false);

  const [typingUsers, setTypingUsers] = useState([]);

  /* =====================================================
     REPLY STATE
  ===================================================== */

  const [replyingTo, setReplyingTo] = useState(null);

  /* =====================================================
     LOAD CONVERSATIONS
  ===================================================== */

  const loadConversations = useCallback(async () => {
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
  ===================================================== */

  const searchUsers = useCallback(async (search = "") => {
    try {
      const response =
        await communicationService.getUsers(search);

      setUsers(response.data || []);

      return response.data || [];
    } catch (error) {
      console.error(
        "Failed to load users:",
        error
      );

      return [];
    }
  }, []);

  /* =====================================================
     LOAD MESSAGES
  ===================================================== */

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
  ===================================================== */

  const selectConversation = useCallback(
    async (conversationId) => {
      setTypingUsers([]);

      // Clear any active reply when changing conversations.
      setReplyingTo(null);

      setActiveConversationId(conversationId);

      await loadMessages(conversationId);
    },
    [loadMessages]
  );

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

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
  ===================================================== */

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
  ===================================================== */

  const toggleMessageReaction = useCallback(
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
  ===================================================== */

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
  ===================================================== */

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
          String(current.id) !==
            String(
              reactionData.messageId
            )
        ) {
          return current;
        }

        return {
          ...current,
          reactions:
            reactionData.reactions || [],
        };
      });
    },
    []
  );

  /* =====================================================
     CREATE GROUP
  ===================================================== */

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
  ===================================================== */

  const handleMessage = useCallback(
    (message) => {
      /*
       * Add message to the active conversation
       * only if it belongs to the currently
       * selected conversation.
       */
      setMessages((current) => {
        if (
          current.some(
            (item) =>
              String(item.id) ===
              String(message.id)
          )
        ) {
          return current;
        }

        if (
          String(
            message.conversationId
          ) !==
          String(activeConversationId)
        ) {
          return current;
        }

        return [
          ...current,
          message,
        ];
      });

      /*
       * Keep the conversation preview updated.
       */
      setConversations((current) =>
        current.map((conversation) =>
          String(conversation.id) ===
          String(
            message.conversationId
          )
            ? {
                ...conversation,
                lastMessage: message,
                lastMessageAt:
                  message.createdAt,
                updatedAt:
                  message.createdAt,
              }
            : conversation
        )
      );
    },
    [activeConversationId]
  );

  /* =====================================================
     NEW CONVERSATION
  ===================================================== */

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
  ===================================================== */

  const handleConversationUpdated =
    useCallback(
      (payload) => {
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
                            payload
                              .lastMessage
                              .createdAt,
                        }
                      : {}),
                  }
                : conversation
          )
        );
      },
      []
    );

  /* =====================================================
     READ
  ===================================================== */

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
  ===================================================== */

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
    useCallback(
      (payload) => {
        setTypingUsers((current) =>
          current.filter(
            (id) =>
              String(id) !==
              String(payload.userId)
          )
        );
      },
      []
    );

  /* =====================================================
     SOCKET
  ===================================================== */

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
    });

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

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
  ===================================================== */

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
  ===================================================== */

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
  ===================================================== */

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

export const useCommunication = () => {
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