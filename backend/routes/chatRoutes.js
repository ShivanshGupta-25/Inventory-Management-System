const express = require("express");

const protect = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

const router = express.Router();

// All chat routes require authentication.
router.use(protect);

// Conversations
router.get(
  "/conversations",
  chatController.getConversations
);

router.post(
  "/conversations",
  chatController.createConversation
);

router.get(
  "/conversations/:conversationId",
  chatController.getConversationById
);

// Messages
router.get(
  "/conversations/:conversationId/messages",
  chatController.getMessages
);

router.post(
  "/conversations/:conversationId/messages",
  chatController.sendMessage
);

router.patch(
  "/conversations/:conversationId/read",
  chatController.markConversationAsRead
);

// Message management
router.patch(
  "/messages/:messageId",
  chatController.editMessage
);

router.delete(
  "/messages/:messageId",
  chatController.deleteMessage
);

module.exports = router;