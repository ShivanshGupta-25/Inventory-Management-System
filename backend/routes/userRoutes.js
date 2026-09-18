const express = require("express");

const {
  getChatDirectory,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET /api/users/chat-directory
 * Protected route for all authenticated users.
 */
router.get(
  "/chat-directory",
  authMiddleware,
  getChatDirectory
);

module.exports = router;