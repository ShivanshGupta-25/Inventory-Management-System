const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUsers,
  getConversations,
  getConversation,
  deleteConversationForMe,
  getMessages,
  getMessageThreadController,
  createDirectConversation,
  createGroupConversation,
  addGroupMembers,
  exitGroup,
  sendMessage,
  markConversationRead,
  toggleReaction,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteMessagesForMe,
  deleteMessagesForEveryone,
  forwardMessages,
} = require("../controllers/communicationController");

const {
  upload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authMiddleware);

/* =====================================================
   USERS
===================================================== */

router.get(
  "/users",
  getUsers
);

/* =====================================================
   CONVERSATIONS
===================================================== */

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

/* =====================================================
   GROUP MEMBERS
===================================================== */

/*
 * Add one or more members to a group.
 *
 * Body:
 * {
 *   "memberIds": ["userId1", "userId2"]
 * }
 */
router.post(
  "/conversations/:id/members",
  addGroupMembers
);

/*
 * Exit the current group.
 *
 * Uses DELETE because the current user is removing
 * their own active membership from the group.
 */
router.delete(
  "/conversations/:id/leave",
  exitGroup
);

/* =====================================================
   SINGLE CONVERSATION
===================================================== */

router.get(
  "/conversations/:id",
  getConversation
);

router.delete(
  "/conversations/:id",
  deleteConversationForMe
);

/* =====================================================
   MESSAGES
===================================================== */

router.get(
  "/conversations/:id/messages",
  getMessages
);

/* =====================================================
   MESSAGE THREAD
===================================================== */

router.get(
  "/conversations/:conversationId/messages/:messageId/thread",
  getMessageThreadController
);

/* =====================================================
   SEND MESSAGE
===================================================== */

router.post(
  "/conversations/:id/messages",
  upload.array("files", 5),
  sendMessage
);

/* =====================================================
   REACTIONS
===================================================== */

router.post(
  "/messages/:id/reactions",
  toggleReaction
);

/* =====================================================
   BULK MESSAGE ACTIONS
   Keep these BEFORE /messages/:id/... routes.
===================================================== */

/*
 * Delete multiple messages for the current user.
 *
 * Body:
 * {
 *   "messageIds": ["id1", "id2"]
 * }
 */
router.delete(
  "/messages/bulk/me",
  deleteMessagesForMe
);

/*
 * Delete multiple messages for everyone.
 *
 * Body:
 * {
 *   "messageIds": ["id1", "id2"]
 * }
 */
router.delete(
  "/messages/bulk/everyone",
  deleteMessagesForEveryone
);

/*
 * Forward multiple messages to one or more conversations.
 *
 * Body:
 * {
 *   "messageIds": ["id1", "id2"],
 *   "conversationIds": [
 *     "conversation1",
 *     "conversation2"
 *   ]
 * }
 */
router.post(
  "/messages/forward",
  forwardMessages
);

/* =====================================================
   SINGLE MESSAGE DELETE
===================================================== */

router.delete(
  "/messages/:id/me",
  deleteMessageForMe
);

router.delete(
  "/messages/:id/everyone",
  deleteMessageForEveryone
);

/* =====================================================
   READ STATUS
===================================================== */

router.post(
  "/conversations/:id/read",
  markConversationRead
);

module.exports = router;