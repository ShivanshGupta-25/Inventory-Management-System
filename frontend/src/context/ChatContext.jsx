
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import chatService from "../services/chatService";
import useChatSocket from "../hooks/useChatSocket";

const ChatContext = createContext(null);

const extractData = (response) => {
  return response?.data ?? response;
};

const extractId = (item) => {
  if (!item) return "";

  if (typeof item === "string") {
    return item;
  }

  return String(item._id || item.id || "");
};

const getCurrentUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const normalizeMessage = (message) => {
  if (!message) return null;

  return {
    ...message,
    _id: message._id || message.id,
    sender:
      typeof message.sender === "object"
        ? message.sender
        : {
            _id: message.sender,
          },
  };
};

const ChatProvider = ({ children }) => {
  const currentUser = getCurrentUser();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] =
    useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [error, setError] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  const selectedConversationId = extractId(
    selectedConversation
  );

  const sortConversations = useCallback((items) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(
        a.lastMessageAt || a.updatedAt || 0
      ).getTime();

      const dateB = new Date(
        b.lastMessageAt || b.updatedAt || 0
      ).getTime();

      return dateB - dateA;
    });
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await chatService.getConversations({
        page: 1,
        limit: 50,
      });

      const data = extractData(response);

      const items = Array.isArray(data)
        ? data
        : data?.conversations || data?.items || [];

      setConversations(sortConversations(items));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load conversations"
      );
    } finally {
      setLoadingConversations(false);
    }
  }, [sortConversations]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    try {
      setLoadingMessages(true);
      setError("");

      const response = await chatService.getMessages(
        conversationId,
        {
          page: 1,
          limit: 50,
        }
      );

      const data = extractData(response);

      const items = Array.isArray(data)
        ? data
        : data?.messages || data?.items || [];

      setMessages(items.map(normalizeMessage));

      setHasMoreMessages(
        Boolean(data?.hasMore || data?.pagination?.hasMore)
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load messages"
      );
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectConversation = useCallback(
    async (conversation) => {
      const conversationId = extractId(conversation);

      if (!conversationId) return;

      setSelectedConversation(conversation);
      setMessages([]);
      setTypingUsers({});

      await loadMessages(conversationId);

      try {
        await chatService.markAsRead(conversationId);
      } catch {
        // Read status should not block opening a conversation.
      }

      setConversations((previous) =>
        previous.map((item) => {
          if (extractId(item) !== conversationId) {
            return item;
          }

          return {
            ...item,
            unreadCount: 0,
          };
        })
      );
    },
    [loadMessages]
  );

  const createConversation = useCallback(
    async (recipientId) => {
      const response = await chatService.createConversation(
        recipientId
      );

      const conversation = extractData(response);

      const createdConversation =
        conversation?.conversation || conversation;

      if (createdConversation) {
        setConversations((previous) => {
          const exists = previous.some(
            (item) =>
              extractId(item) === extractId(createdConversation)
          );

          if (exists) {
            return previous;
          }

          return sortConversations([
            createdConversation,
            ...previous,
          ]);
        });

        await selectConversation(createdConversation);
      }

      return createdConversation;
    },
    [selectConversation, sortConversations]
  );

  const appendMessage = useCallback((incomingMessage) => {
    const normalized = normalizeMessage(incomingMessage);

    if (!normalized?._id) return;

    setMessages((previous) => {
      const exists = previous.some(
        (item) => String(item._id) === String(normalized._id)
      );

      if (exists) {
        return previous;
      }

      return [...previous, normalized];
    });
  }, []);

  const updateConversationPreview = useCallback(
    (payload) => {
      const conversationId = String(payload.conversationId);

      setConversations((previous) => {
        const existing = previous.find(
          (item) => extractId(item) === conversationId
        );

        if (!existing) {
          loadConversations();
          return previous;
        }

        const updated = {
          ...existing,
          lastMessage: payload.lastMessage,
          lastMessageAt: payload.lastMessageAt,
          updatedAt: payload.lastMessageAt,
        };

        return sortConversations([
          updated,
          ...previous.filter(
            (item) => extractId(item) !== conversationId
          ),
        ]);
      });
    },
    [loadConversations, sortConversations]
  );

  const handleNewMessage = useCallback(
    (payload) => {
      const conversationId = String(payload.conversationId);
      const incomingMessage = payload.message;

      if (
        conversationId === String(selectedConversationId)
      ) {
        appendMessage(incomingMessage);

        if (
          String(incomingMessage?.sender?._id) !==
          String(currentUser?._id)
        ) {
          chatService
            .markAsRead(conversationId)
            .catch(() => {});
        }
      }

      updateConversationPreview({
        conversationId,
        lastMessage: incomingMessage,
        lastMessageAt: incomingMessage?.createdAt,
      });
    },
    [
      appendMessage,
      currentUser?._id,
      selectedConversationId,
      updateConversationPreview,
    ]
  );

  const handleConversationUpdated = useCallback(
    (payload) => {
      updateConversationPreview(payload);
    },
    [updateConversationPreview]
  );

  const handleTypingUpdate = useCallback(
    (payload) => {
      const conversationId = String(payload.conversationId);
      const userId = String(payload.userId);

      if (userId === String(currentUser?._id)) {
        return;
      }

      if (conversationId !== String(selectedConversationId)) {
        return;
      }

      setTypingUsers((previous) => ({
        ...previous,
        [userId]: payload.isTyping
          ? payload.userName || "Someone"
          : null,
      }));
    },
    [currentUser?._id, selectedConversationId]
  );

  const handleReadUpdate = useCallback((payload) => {
    const conversationId = String(payload.conversationId);

    if (conversationId !== String(selectedConversationId)) {
      return;
    }

    setMessages((previous) =>
      previous.map((message) => {
        const readBy = message.readBy || [];

        const alreadyRead = readBy.some(
          (entry) =>
            String(entry.user?._id || entry.user) ===
            String(payload.userId)
        );

        if (alreadyRead) {
          return message;
        }

        return {
          ...message,
          readBy: [
            ...readBy,
            {
              user: payload.userId,
              readAt: payload.readAt,
            },
          ],
        };
      })
    );
  }, [selectedConversationId]);

  const {
    connected,
    connectionError,
    onlineUsers,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  } = useChatSocket({
    onNewMessage: handleNewMessage,
    onConversationUpdated: handleConversationUpdated,
    onTypingUpdate: handleTypingUpdate,
    onReadUpdate: handleReadUpdate,
  });

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConversationId) return;

    joinConversation(selectedConversationId);

    return () => {
      leaveConversation(selectedConversationId);
    };
  }, [
    selectedConversationId,
    joinConversation,
    leaveConversation,
  ]);

  const sendMessage = useCallback(
    async (content) => {
      const conversationId = selectedConversationId;

      if (!conversationId || !content?.trim()) {
        return;
      }

      try {
        setSendingMessage(true);
        setError("");

        const response = await chatService.sendMessage(
          conversationId,
          {
            content: content.trim(),
            messageType: "text",
          }
        );

        const data = extractData(response);
        const sentMessage = data?.message || data;

        // Socket.IO also broadcasts this message.
        // appendMessage prevents duplicate message IDs.
        appendMessage(sentMessage);

        updateConversationPreview({
          conversationId,
          lastMessage: sentMessage,
          lastMessageAt: sentMessage?.createdAt,
        });

        return sentMessage;
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to send message"
        );

        throw err;
      } finally {
        setSendingMessage(false);
      }
    },
    [
      appendMessage,
      selectedConversationId,
      updateConversationPreview,
    ]
  );

  const value = useMemo(
    () => ({
      currentUser,
      conversations,
      selectedConversation,
      selectedConversationId,
      messages,
      loadingConversations,
      loadingMessages,
      sendingMessage,
      error,
      connected,
      connectionError,
      onlineUsers,
      typingUsers,
      hasMoreMessages,
      loadConversations,
      loadMessages,
      selectConversation,
      createConversation,
      sendMessage,
      startTyping,
      stopTyping,
      setError,
    }),
    [
      currentUser,
      conversations,
      selectedConversation,
      selectedConversationId,
      messages,
      loadingConversations,
      loadingMessages,
      sendingMessage,
      error,
      connected,
      connectionError,
      onlineUsers,
      typingUsers,
      hasMoreMessages,
      loadConversations,
      loadMessages,
      selectConversation,
      createConversation,
      sendMessage,
      startTyping,
      stopTyping,
    ]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChat must be used inside ChatProvider"
    );
  }

  return context;
};

export default ChatProvider;