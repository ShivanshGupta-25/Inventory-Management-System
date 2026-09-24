const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
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
} = require("../controllers/communicationController");

const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Users
router.get("/users", getUsers);

// Conversations
router.get("/conversations", getConversations);

router.post(
  "/conversations/direct",
  createDirectConversation
);

router.post(
  "/conversations/group",
  createGroupConversation
);

router.get(
  "/conversations/:id",
  getConversation
);

// Messages
router.get(
  "/conversations/:id/messages",
  getMessages
);

// Message thread
router.get(
  "/conversations/:conversationId/messages/:messageId/thread",
  getMessageThreadController
);

router.post(
  "/conversations/:id/messages",
  upload.array("files", 5),
  sendMessage
);

router.post(
  "/messages/:id/reactions",
  toggleReaction
);

router.delete(
  "/messages/:id/me", 
  deleteMessageForMe
);
router.delete(
  "/messages/:id/everyone", 
  deleteMessageForEveryone
);

router.post(
  "/conversations/:id/read",
  markConversationRead
);

module.exports = router;