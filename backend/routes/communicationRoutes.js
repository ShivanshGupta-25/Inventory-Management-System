const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUsers,
  getConversations,
  getConversation,
  getMessages,
  createDirectConversation,
  createGroupConversation,
  sendMessage,
  markConversationRead,
} = require("../controllers/communicationController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All communication routes require authentication
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  getUsers
);

/*
|--------------------------------------------------------------------------
| Conversations
|--------------------------------------------------------------------------
*/

router.get(
  "/conversations",
  getConversations
);

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

/*
|--------------------------------------------------------------------------
| Messages
|--------------------------------------------------------------------------
*/

router.get(
  "/conversations/:id/messages",
  getMessages
);

router.post(
  "/conversations/:id/messages",
  sendMessage
);

router.post(
  "/conversations/:id/read",
  markConversationRead
);

module.exports = router;