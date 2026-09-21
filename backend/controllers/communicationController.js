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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
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

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
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

module.exports = {
  getUsers,
  getConversations,
  getConversation,
  getMessages,
  createDirectConversation,
  createGroupConversation,
  sendMessage,
  markConversationRead,
};