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
   HELPERS
===================================================== */

const getMessageId = (message) =>
  message?.id ||
  message?._id ||
  null;

const getConversationId = (conversation) =>
  conversation?.id ||
  conversation?._id ||
  null;

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
===================================================== */

export const CommunicationProvider = ({
  children,
}) => {
  const { user } = useAuth();

  const token =
    localStorage.getItem("token");

  const [conversations, setConversations] =
    useState([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState(null);

  const [messages, setMessages] =
    useState([]);

  const [
    messageSearchResults,
    setMessageSearchResults,
  ] = useState([]);

  const [
    messageSearchLoading,
    setMessageSearchLoading,
  ] = useState(false);

  const [
    messageSearchError,
    setMessageSearchError,
  ] = useState("");

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

        setConversations(
          response.data || []
        );
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
    DELETE CONVERSATION FOR ME
  ===================================================== */

  const deleteConversationForMe =
    useCallback(
      async (conversationId) => {
        if (!conversationId) {
          return null;
        }

        try {
          const response =
            await communicationService.deleteConversationForMe(
              conversationId
            );

          const result =
            response.data;

          const deletedConversationId =
            String(
              result?.conversationId ||
                conversationId
            );

          /*
          * Remove the conversation immediately
          * from the local conversation list.
          */
          setConversations((current) =>
            current.filter(
              (conversation) =>
                String(
                  getConversationId(
                    conversation
                  )
                ) !==
                deletedConversationId
            )
          );

          /*
          * If the deleted conversation is currently
          * open, close it completely.
          */
          if (
            String(
              activeConversationId
            ) === deletedConversationId
          ) {
            setActiveConversationId(null);
            setMessages([]);
            setReplyingTo(null);
            setTypingUsers([]);
            setMessageSearchResults([]);
            setMessageSearchError("");
            setMessageSearchLoading(false);
          }

          return result;
        } catch (error) {
          console.error(
            "Failed to delete conversation:",
            error
          );

          throw error;
        }
      },
      [
        activeConversationId,
      ]
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

        setMessages(
          response.data || []
        );

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
     LOAD MESSAGE FROM SEARCH RESULT
  ====================================================== */

  const loadMessageFromSearchResult =
    useCallback(
      async (message) => {
        if (!message) {
          return null;
        }

        const messageConversationId =
          message?.conversationId;

        if (
          messageConversationId &&
          String(messageConversationId) !==
            String(activeConversationId)
        ) {
          return null;
        }

        const messageId =
          getMessageId(message);

        if (!messageId) {
          return null;
        }

        setMessages((current) => {
          const exists = current.some(
            (item) =>
              String(getMessageId(item)) ===
              String(messageId)
          );

          if (exists) {
            return current;
          }

          return [...current, message].sort(
            (a, b) =>
              new Date(a.createdAt || 0) -
              new Date(b.createdAt || 0)
          );
        });

        return message;
      },
      [activeConversationId]
    );

  /* =====================================================
     SEARCH MESSAGES
  ====================================================== */

  const searchMessages = useCallback(
    async (conversationId, search = "") => {
      const trimmedSearch =
        typeof search === "string"
          ? search.trim()
          : "";

      if (!conversationId || !trimmedSearch) {
        setMessageSearchResults([]);
        setMessageSearchError("");
        setMessageSearchLoading(false);
        return [];
      }

      try {
        setMessageSearchLoading(true);
        setMessageSearchError("");

        const response =
          await communicationService.getMessages(
            conversationId,
            {
              search: trimmedSearch,
              limit: 50,
            }
          );

        const results =
          response.data || [];

        setMessageSearchResults(results);

        return results;
      } catch (error) {
        console.error(
          "Failed to search messages:",
          error
        );

        setMessageSearchResults([]);
        setMessageSearchError(
          error?.message ||
            "Failed to search messages"
        );

        return [];
      } finally {
        setMessageSearchLoading(false);
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

        setMessageSearchResults([]);
        setMessageSearchError("");
        setMessageSearchLoading(false);

        setConversations((current) =>
          current.map((conversation) =>
            String(
              getConversationId(conversation)
            ) === String(conversationId)
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

        return response.data;
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

        const result =
          await sendMessage(
            text,
            [],
            replyToId
          );

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
     MESSAGE THREAD
  ====================================================== */

  const getMessageThread = useCallback(
    async (conversationId, messageId) => {
      if (!conversationId || !messageId) {
        return null;
      }

      try {
        const response =
          await communicationService.getMessageThread(
            conversationId,
            messageId
          );

        return response.data || null;
      } catch (error) {
        console.error(
          "Failed to load message thread:",
          error
        );

        throw error;
      }
    },
    []
  );

  /* =====================================================
     REACTION
  ====================================================== */

  const toggleMessageReaction =
    useCallback(
      async (
        messageId,
        emoji
      ) => {
        return communicationService.toggleMessageReaction(
          messageId,
          emoji
        );
      },
      []
    );

  const handleReaction = useCallback(
    (reactionData) => {
      if (!reactionData?.messageId) {
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          String(
            getMessageId(message)
          ) ===
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
     SINGLE DELETE FOR ME
  ====================================================== */

  const handleMessageDeletedForMe =
    useCallback((deletionData) => {
      if (!deletionData?.messageId) {
        return;
      }

      const deletedMessageId =
        String(deletionData.messageId);

      setMessages((current) =>
        current
          .filter(
            (message) =>
              String(
                getMessageId(message)
              ) !== deletedMessageId
          )
          .map((message) => {
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
     BULK DELETE FOR ME SOCKET
  ====================================================== */

  const handleMessagesDeletedForMe =
    useCallback((deletionData) => {
      const messageIds =
        Array.isArray(
          deletionData?.messageIds
        )
          ? deletionData.messageIds
          : [];

      if (!messageIds.length) {
        return;
      }

      const deletedIds =
        new Set(
          messageIds.map(String)
        );

      setMessages((current) =>
        current
          .filter(
            (message) =>
              !deletedIds.has(
                String(
                  getMessageId(message)
                )
              )
          )
          .map((message) => {
            const replyTo =
              message.replyTo;

            if (
              !replyTo ||
              !deletedIds.has(
                String(
                  getMessageId(replyTo)
                )
              )
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

      setReplyingTo((current) => {
        if (
          !current ||
          !deletedIds.has(
            String(
              getMessageId(current)
            )
          )
        ) {
          return current;
        }

        return null;
      });
    }, []);

  /* =====================================================
     SINGLE DELETE FOR EVERYONE
  ====================================================== */

  const handleMessageDeleted =
    useCallback((deletionData) => {
      if (!deletionData?.messageId) {
        return;
      }

      const deletedMessageId =
        String(deletionData.messageId);

      setMessages((current) =>
        current.map((message) => {
          if (
            String(
              getMessageId(message)
            ) === deletedMessageId
          ) {
            return createDeletedForEveryoneMessage(
              message,
              deletionData.deletedAt
            );
          }

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

      setConversations((current) =>
        current.map((conversation) => {
          if (
            String(
              getConversationId(
                conversation
              )
            ) !==
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
     BULK DELETE FOR EVERYONE SOCKET
  ====================================================== */

  const handleMessagesDeleted =
    useCallback((deletionData) => {
      const messageIds =
        Array.isArray(
          deletionData?.messageIds
        )
          ? deletionData.messageIds
          : [];

      if (!messageIds.length) {
        return;
      }

      const deletedIds =
        new Set(
          messageIds.map(String)
        );

      const deletedAt =
        deletionData?.deletedAt || null;

      setMessages((current) =>
        current.map((message) => {
          const messageId = String(
            getMessageId(message)
          );

          if (
            deletedIds.has(messageId)
          ) {
            return createDeletedForEveryoneMessage(
              message,
              deletedAt
            );
          }

          const replyTo =
            message.replyTo;

          if (
            replyTo &&
            deletedIds.has(
              String(
                getMessageId(replyTo)
              )
            )
          ) {
            return {
              ...message,
              replyTo:
                createDeletedForEveryoneMessage(
                  replyTo,
                  deletedAt
                ),
            };
          }

          return message;
        })
      );

      setReplyingTo((current) => {
        if (
          !current ||
          !deletedIds.has(
            String(
              getMessageId(current)
            )
          )
        ) {
          return current;
        }

        return createDeletedForEveryoneMessage(
          current,
          deletedAt
        );
      });

      /*
       * Backend returns recalculated conversation
       * previews after bulk deletion.
       */
      const conversationUpdates =
        Array.isArray(
          deletionData?.conversationUpdates
        )
          ? deletionData.conversationUpdates
          : [];

      if (conversationUpdates.length) {
        setConversations((current) =>
          current.map((conversation) => {
            const conversationId =
              String(
                getConversationId(
                  conversation
                )
              );

            const update =
              conversationUpdates.find(
                (item) =>
                  String(
                    item.conversationId
                  ) === conversationId
              );

            if (!update) {
              return conversation;
            }

            return {
              ...conversation,
              ...(update.lastMessage
                ? {
                    lastMessage:
                      update.lastMessage,
                  }
                : {}),
              ...(update.lastMessageAt
                ? {
                    lastMessageAt:
                      update.lastMessageAt,
                  }
                : {}),
            };
          })
        );

        return;
      }

      /*
       * Fallback for older socket payloads.
       */
      if (
        deletionData?.conversationId
      ) {
        setConversations((current) =>
          current.map((conversation) =>
            String(
              getConversationId(
                conversation
              )
            ) ===
            String(
              deletionData.conversationId
            )
              ? {
                  ...conversation,
                  ...(deletionData.lastMessage
                    ? {
                        lastMessage:
                          deletionData.lastMessage,
                        lastMessageAt:
                          deletionData.lastMessage
                            .createdAt,
                      }
                    : {}),
                }
              : conversation
          )
        );
      }
    }, []);

  /* =====================================================
     DELETE SINGLE
  ====================================================== */

  const deleteMessageForMe =
    useCallback(
      async (messageId) => {
        try {
          const response =
            await communicationService.deleteMessageForMe(
              messageId
            );

          const result =
            response.data;

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

  const deleteMessageForEveryone =
    useCallback(
      async (messageId) => {
        try {
          const response =
            await communicationService.deleteMessageForEveryone(
              messageId
            );

          const result =
            response.data;

          handleMessageDeleted({
            messageId:
              result?.messageId ||
              result?.id ||
              messageId,
            conversationId:
              result?.conversationId,
            deletedAt:
              result?.deletedAt ||
              null,
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
     BULK DELETE FOR ME
  ====================================================== */

  const deleteMessagesForMe =
    useCallback(
      async (messageIds) => {
        if (
          !Array.isArray(messageIds) ||
          !messageIds.length
        ) {
          return null;
        }

        try {
          const response =
            await communicationService.deleteMessagesForMe(
              messageIds
            );

          const result =
            response.data;

          handleMessagesDeletedForMe({
            messageIds:
              result?.messageIds ||
              messageIds,
            conversationIds:
              result?.conversationIds ||
              [],
          });

          return result;
        } catch (error) {
          console.error(
            "Failed to delete messages for me:",
            error
          );

          throw error;
        }
      },
      [handleMessagesDeletedForMe]
    );

  /* =====================================================
     BULK DELETE FOR EVERYONE
  ====================================================== */

  const deleteMessagesForEveryone =
    useCallback(
      async (messageIds) => {
        if (
          !Array.isArray(messageIds) ||
          !messageIds.length
        ) {
          return null;
        }

        try {
          const response =
            await communicationService.deleteMessagesForEveryone(
              messageIds
            );

          const result =
            response.data;

          handleMessagesDeleted({
            messageIds:
              result?.messageIds ||
              messageIds,
            conversationIds:
              result?.conversationIds ||
              [],
            deletedAt:
              result?.deletedAt ||
              null,
            conversationUpdates:
              result?.conversationUpdates ||
              [],
          });

          return result;
        } catch (error) {
          console.error(
            "Failed to delete messages for everyone:",
            error
          );

          throw error;
        }
      },
      [handleMessagesDeleted]
    );

  /* =====================================================
     FORWARD
  ====================================================== */

  const forwardMessages =
    useCallback(
      async (
        messageIds,
        conversationIds
      ) => {
        if (
          !Array.isArray(messageIds) ||
          !messageIds.length ||
          !Array.isArray(
            conversationIds
          ) ||
          !conversationIds.length
        ) {
          return null;
        }

        try {
          const response =
            await communicationService.forwardMessages(
              messageIds,
              conversationIds
            );

          return response.data;
        } catch (error) {
          console.error(
            "Failed to forward messages:",
            error
          );

          throw error;
        }
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
              String(
                getConversationId(item)
              ) ===
              String(
                getConversationId(
                  conversation
                )
              )
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

        setReplyingTo(null);

        await loadMessages(
          conversation.id
        );

        return conversation;
      },
      [loadMessages]
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
              String(
                getConversationId(item)
              ) !==
              String(
                getConversationId(
                  conversation
                )
              )
          ),
        ]);

        setActiveConversationId(
          conversation.id
        );

        setMessages([]);
        setReplyingTo(null);

        return conversation;
      },
      []
    );


  /* =====================================================
    ADD GROUP MEMBERS
  ===================================================== */

  const addGroupMembers = useCallback(
    async (
      conversationId,
      memberIds
    ) => {
      if (
        !conversationId ||
        !Array.isArray(memberIds) ||
        !memberIds.length
      ) {
        return null;
      }

      try {
        const response =
          await communicationService.addGroupMembers(
            conversationId,
            memberIds
          );

        const updatedConversation =
          response.data;

        if (updatedConversation) {
          setConversations((current) =>
            current.map((conversation) =>
              String(
                getConversationId(
                  conversation
                )
              ) ===
              String(conversationId)
                ? updatedConversation
                : conversation
            )
          );
        }

        return updatedConversation;
      } catch (error) {
        console.error(
          "Failed to add group members:",
          error
        );

        throw error;
      }
    },
    []
  );

  /* =====================================================
    EXIT GROUP
  ===================================================== */

  const exitGroup = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        return null;
      }

      try {
        const response =
          await communicationService.exitGroup(
            conversationId
          );

        const result = response.data;

        /*
        * Remove the conversation from the
        * current user's conversation list.
        */
        setConversations((current) =>
          current.filter(
            (conversation) =>
              String(
                getConversationId(
                  conversation
                )
              ) !==
              String(conversationId)
          )
        );

        /*
        * If the user was viewing this group,
        * clear the active conversation.
        */
        if (
          String(activeConversationId) ===
          String(conversationId)
        ) {
          setActiveConversationId(null);
          setMessages([]);
          setReplyingTo(null);
        }

        return result;
      } catch (error) {
        console.error(
          "Failed to exit group:",
          error
        );

        throw error;
      }
    },
    [activeConversationId]
  );


  /* =====================================================
     SOCKET MESSAGE
  ====================================================== */

  const handleMessage = useCallback(
    (message) => {
      if (!message?.conversationId) {
        return;
      }

      const conversationId =
        String(message.conversationId);

      const messageId =
        getMessageId(message);

      const isActive =
        conversationId ===
        String(activeConversationId);

      const isOwnMessage =
        String(
          message.sender?.id ||
            message.sender?._id ||
            message.senderId
        ) === String(user?.id);

      setMessages((current) => {
        if (!isActive) {
          return current;
        }

        if (
          messageId &&
          current.some(
            (item) =>
              String(
                getMessageId(item)
              ) === String(messageId)
          )
        ) {
          return current;
        }

        return [
          ...current,
          message,
        ];
      });

      setConversations((current) => {
        const existing =
          current.find(
            (conversation) =>
              String(
                getConversationId(
                  conversation
                )
              ) === conversationId
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
          unreadCount:
            isActive || isOwnMessage
              ? 0
              : Number(
                  existing.unreadCount ||
                    0
                ) + 1,
        };

        return [
          updatedConversation,
          ...current.filter(
            (conversation) =>
              String(
                getConversationId(
                  conversation
                )
              ) !== conversationId
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
      if (!conversation?.id) {
        return;
      }

      setConversations((current) => {
        const exists = current.some(
          (item) =>
            String(
              getConversationId(item)
            ) ===
            String(
              getConversationId(
                conversation
              )
            )
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
            String(
              getConversationId(
                conversation
              )
            ) ===
            String(
              payload.conversationId
            )
              ? {
                  ...conversation,
                  ...(payload.lastMessage
                    ? {
                        lastMessage:
                          payload.lastMessage,
                      }
                    : {}),
                  ...(payload.lastMessageAt
                    ? {
                        lastMessageAt:
                          payload.lastMessageAt,
                      }
                    : payload.lastMessage
                    ? {
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
    useCallback(() => {}, []);

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

      onMessagesDeleted:
        handleMessagesDeleted,

      onMessagesDeletedForMe:
        handleMessagesDeletedForMe,
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
        String(
          getConversationId(conversation)
        ) ===
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
      deleteConversationForMe,
      activeConversation,
      activeConversationId,
      messages,

      messageSearchResults,
      messageSearchLoading,
      messageSearchError,

      users,
      typingUsers,
      loadingConversations,
      loadingMessages,

      replyingTo,
      setReplyingTo,

      connected:
        socket.connected,

      connectionStatus:
        socket.connectionStatus,

      setActiveConversationId,

      selectConversation,
      searchUsers,
      searchMessages,
      loadMessageFromSearchResult,

      createDirectConversation,
      createGroupConversation,

      addGroupMembers,
      exitGroup,

      sendMessage,
      sendReply,

      getMessageThread,

      toggleMessageReaction,

      deleteMessageForMe,
      deleteMessageForEveryone,

      deleteMessagesForMe,
      deleteMessagesForEveryone,

      forwardMessages,

      startTyping:
        socket.startTyping,

      stopTyping:
        socket.stopTyping,

      reloadConversations:
        loadConversations,
    }),
    [
      conversations,
      deleteConversationForMe,
      activeConversation,
      activeConversationId,
      messages,

      messageSearchResults,
      messageSearchLoading,
      messageSearchError,

      users,
      typingUsers,
      loadingConversations,
      loadingMessages,
      replyingTo,

      socket.connected,
      socket.connectionStatus,
      socket.startTyping,
      socket.stopTyping,

      selectConversation,
      searchUsers,
      searchMessages,
      loadMessageFromSearchResult,

      createDirectConversation,
      createGroupConversation,

      addGroupMembers,
      exitGroup,

      sendMessage,
      sendReply,

      getMessageThread,

      toggleMessageReaction,

      deleteMessageForMe,
      deleteMessageForEveryone,

      deleteMessagesForMe,
      deleteMessagesForEveryone,

      forwardMessages,

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
===================================================== */

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