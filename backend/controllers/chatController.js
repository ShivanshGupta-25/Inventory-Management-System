const chatService = require("../services/chatService");

// Send successful response
const sendSuccess = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Send error response
const sendError = (res, error) => {
  console.error("Chat Controller Error:", error);

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message,
  });
};

/**
 * POST /api/chat/conversations
 * Create or retrieve a direct conversation.
 */
const createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "recipientId is required",
      });
    }

    const conversation =
      await chatService.createOrGetDirectConversation(
        req.user,
        recipientId
      );

    return sendSuccess(
      res,
      conversation,
      "Conversation created or retrieved successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * GET /api/chat/conversations
 * Fetch accessible conversations.
 */
const getConversations = async (req, res) => {
  try {
    const result = await chatService.getConversations(
      req.user,
      req.query
    );

    return sendSuccess(
      res,
      result,
      "Conversations fetched successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * GET /api/chat/conversations/:conversationId
 * Fetch a single conversation.
 */
const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation =
      await chatService.getConversationById(
        conversationId,
        req.user
      );

    return sendSuccess(
      res,
      conversation,
      "Conversation fetched successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Fetch messages for a conversation.
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const result = await chatService.getMessages(
      conversationId,
      req.user,
      req.query
    );

    return sendSuccess(
      res,
      result,
      "Messages fetched successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send a message.
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const message = await chatService.sendMessage(
      conversationId,
      req.user,
      req.body
    );

    const io = req.app.get("io");

    if (io) {
      const conversationRoom =
        `conversation:${conversationId}`;

      const populatedMessage =
        message && typeof message.toObject === "function"
          ? message.toObject()
          : message;

      // Broadcast new message to users
      // currently inside the conversation room.
      io.to(conversationRoom).emit("message:new", {
        conversationId,
        message: populatedMessage,
      });

      // Notify participants through their
      // personal user rooms.
      const conversation =
        await chatService.getConversationById(
          conversationId,
          req.user
        );

      if (
        conversation &&
        Array.isArray(conversation.participants)
      ) {
        for (const participant of conversation.participants) {
          const participantId =
            participant._id?.toString?.() ||
            participant.toString();

          io.to(`user:${participantId}`).emit(
            "conversation:updated",
            {
              conversationId,
              lastMessage: populatedMessage,
              lastMessageAt:
                populatedMessage.createdAt,
            }
          );
        }
      }
    }

    return sendSuccess(
      res,
      message,
      "Message sent successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * PATCH /api/chat/messages/:messageId
 * Edit a message.
 */
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const message = await chatService.editMessage(
      messageId,
      req.user,
      content
    );

    return sendSuccess(
      res,
      message,
      "Message edited successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * DELETE /api/chat/messages/:messageId
 * Delete a message.
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await chatService.deleteMessage(
      messageId,
      req.user
    );

    return sendSuccess(
      res,
      message,
      "Message deleted successfully"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

/**
 * PATCH /api/chat/conversations/:conversationId/read
 * Mark conversation messages as read.
 */
const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const result =
      await chatService.markConversationAsRead(
        conversationId,
        req.user
      );

    const io = req.app.get("io");

    if (io) {
      const userId =
        req.user._id?.toString?.() ||
        req.user.id?.toString?.();

      io.to(`conversation:${conversationId}`).emit(
        "message:read:update",
        {
          conversationId,
          userId,
          readAt: result.readAt,
        }
      );
    }

    return sendSuccess(
      res,
      result,
      "Messages marked as read"
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// Export controller methods using CommonJS
module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
};