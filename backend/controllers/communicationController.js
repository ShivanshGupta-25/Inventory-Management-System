const communicationService = require("../services/communicationService");

/* =====================================================
   GET USERS
===================================================== */

const getUsers = async (req, res) => {
  try {
    const users =
      await communicationService.getCommunicationUsers(
        req.user.userId,
        req.query.search || ""
      );

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(
      "Get communication users error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch users",
    });
  }
};

/* =====================================================
   GET CONVERSATIONS
===================================================== */

const getConversations = async (req, res) => {
  try {
    const conversations =
      await communicationService.getConversations(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch conversations",
    });
  }
};

/* =====================================================
   GET SINGLE CONVERSATION
===================================================== */

const getConversation = async (req, res) => {
  try {
    const conversation =
      await communicationService.getConversation(
        req.params.id,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch conversation",
    });
  }
};

/* =====================================================
   GET MESSAGES
===================================================== */

const getMessages = async (req, res) => {
  try {
    const messages =
      await communicationService.getMessages(
        req.params.id,
        req.user.userId,
        {
          limit: req.query.limit,
          before: req.query.before,
        }
      );

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error(
      "Get messages error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch messages",
    });
  }
};

/* =====================================================
   GET MESSAGE THREAD
===================================================== */

const getMessageThreadController = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
      messageId,
    } = req.params;

    const thread =
      await communicationService.getMessageThread(
        conversationId,
        messageId,
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      data: thread,
    });
  } catch (error) {
    console.error(
      "Get message thread error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to load message thread",
    });
  }
};

/* =====================================================
   CREATE DIRECT CONVERSATION
===================================================== */

const createDirectConversation = async (
  req,
  res
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID is required",
      });
    }

    const conversation =
      await communicationService.createDirectConversation(
        req.user.userId,
        userId
      );

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${userId}`).emit(
        "conversation:new",
        conversation
      );

      io.to(
        `user:${req.user.userId}`
      ).emit(
        "conversation:new",
        conversation
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Direct conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Create direct conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create direct conversation",
    });
  }
};

/* =====================================================
   CREATE GROUP
===================================================== */

const createGroupConversation = async (
  req,
  res
) => {
  try {
    const {
      name,
      participantIds,
    } = req.body;

    const conversation =
      await communicationService.createGroupConversation(
        req.user.userId,
        {
          name,
          participantIds,
        }
      );

    const io = req.app.get("io");

    if (io) {
      conversation.participants.forEach(
        (participant) => {
          io.to(
            `user:${participant.id}`
          ).emit(
            "conversation:new",
            conversation
          );
        }
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Group conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error(
      "Create group conversation error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create group conversation",
    });
  }
};

/* =====================================================
   SEND MESSAGE
===================================================== */

const sendMessage = async (
  req,
  res
) => {
  try {
    const baseUrl =
      `${req.protocol}://${req.get(
        "host"
      )}`;

    const message =
      await communicationService.sendMessage(
        req.params.id,
        req.user.userId,
        {
          text: req.body.text,
          replyTo: req.body.replyTo,
          files: req.files || [],
          baseUrl,
        }
      );

    const io = req.app.get("io");

    if (io) {
      io.to(
        `conversation:${req.params.id}`
      ).emit(
        "message:new",
        message
      );

      io.to(
        `conversation:${req.params.id}`
      ).emit(
        "conversation:updated",
        {
          conversationId:
            req.params.id,

          lastMessage:
            message,
        }
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "sendMessage error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to send message",
    });
  }
};

/* =====================================================
   MARK READ
===================================================== */

const markConversationRead = async (
  req,
  res
) => {
  try {
    const result =
      await communicationService.markConversationRead(
        req.params.id,
        req.user.userId
      );

    const io = req.app.get("io");

    if (io) {
      io.to(
        `conversation:${req.params.id}`
      ).emit("message:read", {
        conversationId:
          req.params.id,
        userId: req.user.userId,
        lastReadAt: result.lastReadAt,
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Mark conversation read error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to mark conversation as read",
    });
  }
};

/* =====================================================
   TOGGLE MESSAGE REACTION
===================================================== */

const toggleReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;

    const userId = req.user.userId;

    const message =
      await communicationService.toggleMessageReaction({
        messageId,
        userId,
        emoji,
      });

    const io = req.app.get("io");

    if (io) {
      io.to(
        `conversation:${message.conversationId}`
      ).emit("message:reaction", {
        messageId: message.id,
        conversationId:
          message.conversationId,
        reactions: message.reactions,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Reaction updated successfully",
      data: {
        messageId: message.id,
        conversationId:
          message.conversationId,
        reactions: message.reactions,
      },
    });
  } catch (error) {
    console.error(
      "Toggle reaction error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update reaction",
    });
  }
};

/* =====================================================
   DELETE MESSAGE FOR ME
===================================================== */

const deleteMessageForMe = async (req, res) => {
  try {
    const message =
      await communicationService.deleteMessageForMe({
        messageId: req.params.id,
        userId: req.user.userId,
      });

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${req.user.userId}`).emit(
        "message:deletedForMe",
        {
          messageId: message.id,
          conversationId:
            message.conversationId,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted for you",
      data: {
        messageId: message.id,
        conversationId:
          message.conversationId,
      },
    });
  } catch (error) {
    console.error(
      "Delete message for me error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete message",
    });
  }
};

/* =====================================================
   DELETE MESSAGE FOR EVERYONE
===================================================== */

const deleteMessageForEveryone = async (
  req,
  res
) => {
  try {
    const message =
      await communicationService.deleteMessageForEveryone({
        messageId: req.params.id,
        userId: req.user.userId,
      });

    const io = req.app.get("io");

    if (io) {
      io.to(
        `conversation:${message.conversationId}`
      ).emit("message:deleted", {
        messageId: message.id,
        conversationId:
          message.conversationId,
        deletedForEveryone:
          message.deletedForEveryone,
        deletedAt: message.deletedAt,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Message deleted for everyone",
      data: message,
    });
  } catch (error) {
    console.error(
      "Delete message for everyone error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete message",
    });
  }
};

/* =====================================================
   BULK DELETE MESSAGE FOR ME
===================================================== */

const deleteMessagesForMe = async (
  req,
  res
) => {
  try {
    const { messageIds } =
      req.body;

    const result =
      await communicationService.deleteMessagesForMe({
        messageIds,
        userId: req.user.userId,
      });

    const io = req.app.get("io");

    if (io) {
      /*
       * Emit one event per affected conversation.
       *
       * This lets clients update only the
       * conversation that is currently relevant.
       */
      for (const conversationId of
        result.conversationIds) {
        const conversationMessageIds =
          result.messageIds;

        io.to(
          `user:${req.user.userId}`
        ).emit(
          "messages:deletedForMe",
          {
            messageIds:
              conversationMessageIds,
            conversationId,
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Messages deleted for you",
      data: result,
    });
  } catch (error) {
    console.error(
      "Bulk delete messages for me error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete messages",
    });
  }
};

/* =====================================================
   BULK DELETE MESSAGE FOR EVERYONE
===================================================== */

const deleteMessagesForEveryone = async (
  req,
  res
) => {
  try {
    const { messageIds } =
      req.body;

    const result =
      await communicationService.deleteMessagesForEveryone({
        messageIds,
        userId: req.user.userId,
      });

    const io = req.app.get("io");

    if (io) {
      for (const conversationId of
        result.conversationIds) {
        io.to(
          `conversation:${conversationId}`
        ).emit(
          "messages:deleted",
          {
            messageIds:
              result.messageIds,
            conversationId,
            deletedAt:
              result.deletedAt,
          }
        );
      }

      for (const update of
        result.conversationUpdates) {
        io.to(
          `conversation:${update.conversationId}`
        ).emit(
          "conversation:updated",
          {
            conversationId:
              update.conversationId,
            lastMessage:
              update.lastMessage,
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Messages deleted for everyone",
      data: result,
    });
  } catch (error) {
    console.error(
      "Bulk delete messages for everyone error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete messages for everyone",
    });
  }
};

/* =====================================================
   FORWARD MESSAGES
===================================================== */

const forwardMessages = async (
  req,
  res
) => {
  try {
    const {
      messageIds,
      conversationIds,
    } = req.body;

    const result =
      await communicationService.forwardMessages({
        messageIds,
        conversationIds,
        userId: req.user.userId,
      });

    const io = req.app.get("io");

    if (io) {
      for (const conversation of
        result.conversations) {
        const {
          conversationId,
          messages,
          lastMessage,
        } = conversation;

        for (const message of messages) {
          io.to(
            `conversation:${conversationId}`
          ).emit(
            "message:new",
            message
          );
        }

        if (lastMessage) {
          io.to(
            `conversation:${conversationId}`
          ).emit(
            "conversation:updated",
            {
              conversationId,
              lastMessage,
            }
          );
        }
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Messages forwarded successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Forward messages error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to forward messages",
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  getUsers,
  getConversations,
  getConversation,
  getMessages,
  getMessageThreadController,
  createDirectConversation,
  createGroupConversation,
  sendMessage,
  markConversationRead,
  toggleReaction,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteMessagesForMe,
  deleteMessagesForEveryone,
  forwardMessages,
};