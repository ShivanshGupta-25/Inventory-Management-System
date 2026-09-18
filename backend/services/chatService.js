
const mongoose = require("mongoose");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

const ALLOWED_ROLES = ["admin", "manager", "staff"];

const CHAT_PAGE_SIZE = 30;
const MAX_MESSAGE_LENGTH = 5000;

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const getUserId = (user) => {
  if (!user) return null;

  return user._id || user.id || user.userId || null;
};

const normalizeId = (id) => id?.toString();

const getParticipantKey = (userId1, userId2) => {
  return [normalizeId(userId1), normalizeId(userId2)]
    .sort()
    .join("_");
};

const ensureValidUserId = (userId) => {
  if (!isValidObjectId(userId)) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }
};

const ensureValidConversationId = (conversationId) => {
  if (!isValidObjectId(conversationId)) {
    const error = new Error("Invalid conversation ID");
    error.statusCode = 400;
    throw error;
  }
};

const ensureValidMessageId = (messageId) => {
  if (!isValidObjectId(messageId)) {
    const error = new Error("Invalid message ID");
    error.statusCode = 400;
    throw error;
  }
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateChatUser = async (userId) => {
  ensureValidUserId(userId);

  const user = await User.findById(userId)
    .select("_id name email role isActive")
    .lean();

  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.isActive === false) {
    throw createError("User account is inactive", 403);
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    throw createError("User role is not allowed for chat", 403);
  }

  return user;
};

const getCurrentUserId = (user) => {
  const userId = getUserId(user);

  if (!userId || !isValidObjectId(userId)) {
    throw createError("Authenticated user is invalid", 401);
  }

  return userId;
};

/**
 * Determine whether the authenticated user can access
 * the conversation.
 *
 * Admin:
 *   Can access any active conversation.
 *
 * Manager:
 *   Can access conversations containing themselves.
 *   Managers may also access staff conversations as defined
 *   by the current application policy.
 *
 * Staff:
 *   Can access conversations containing themselves.
 *
 * IMPORTANT:
 * Admin-wide access should be used deliberately.
 * For non-admin roles, participant membership is required.
 */
const canAccessConversation = async (
  conversation,
  currentUser
) => {
  if (!conversation || !currentUser) return false;

  const currentUserId = normalizeId(
    getCurrentUserId(currentUser)
  );

  if (currentUser.role === "admin") {
    return true;
  }

  const participantIds = conversation.participants.map(
    (participant) => normalizeId(participant)
  );

  return participantIds.includes(currentUserId);
};

const getAccessibleConversation = async (
  conversationId,
  currentUser
) => {
  ensureValidConversationId(conversationId);

  const conversation = await Conversation.findById(
    conversationId
  );

  if (!conversation) {
    throw createError("Conversation not found", 404);
  }

  if (!conversation.isActive) {
    throw createError("Conversation is inactive", 403);
  }

  const allowed = await canAccessConversation(
    conversation,
    currentUser
  );

  if (!allowed) {
    throw createError(
      "You are not authorized to access this conversation",
      403
    );
  }

  return conversation;
};

/**
 * Create or retrieve a direct conversation.
 *
 * Direct conversations use a sorted participant key.
 * Both participants must be active and have an allowed role.
 */
const createOrGetDirectConversation = async (
  currentUser,
  recipientId
) => {
  const currentUserId = getCurrentUserId(currentUser);

  ensureValidUserId(recipientId);

  if (
    normalizeId(currentUserId) === normalizeId(recipientId)
  ) {
    throw createError(
      "You cannot create a conversation with yourself",
      400
    );
  }

  const [sender, recipient] = await Promise.all([
    validateChatUser(currentUserId),
    validateChatUser(recipientId),
  ]);

  const participantKey = getParticipantKey(
    sender._id,
    recipient._id
  );

  let conversation = await Conversation.findOne({
    participantKey,
  });

  if (conversation) {
    if (!conversation.isActive) {
      conversation.isActive = true;
      await conversation.save();
    }

    return Conversation.findById(conversation._id)
      .populate("participants", "name email role")
      .populate("lastMessage");
  }

  try {
    conversation = await Conversation.create({
      type: "direct",
      participants: [sender._id, recipient._id],
      participantKey,
      createdBy: sender._id,
      isActive: true,
    });
  } catch (error) {
    // Handles a concurrent request that creates the same
    // conversation due to the unique participantKey index.
    if (error.code === 11000) {
      conversation = await Conversation.findOne({
        participantKey,
      });

      if (!conversation) {
        throw error;
      }
    } else {
      throw error;
    }
  }

  return Conversation.findById(conversation._id)
    .populate("participants", "name email role")
    .populate("lastMessage");
};

/**
 * Fetch conversations for the current user.
 *
 * Admin:
 *   All active conversations.
 *
 * Manager / Staff:
 *   Conversations where they are participants.
 */
const getConversations = async (currentUser, options = {}) => {
  const page = Math.max(
    1,
    Number.parseInt(options.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(options.limit, 10) ||
        CHAT_PAGE_SIZE
    )
  );

  const currentUserId = getCurrentUserId(currentUser);

  const query = {
    isActive: true,
  };

  if (currentUser.role !== "admin") {
    query.participants = currentUserId;
  }

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate("participants", "name email role")
      .populate({
        path: "lastMessage",
        select: "content sender messageType createdAt isDeleted",
        populate: {
          path: "sender",
          select: "name email role",
        },
      })
      .sort({
        lastMessageAt: -1,
        updatedAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Conversation.countDocuments(query),
  ]);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
};

/**
 * Get a conversation by ID with participant access check.
 */
const getConversationById = async (
  conversationId,
  currentUser
) => {
  const conversation = await getAccessibleConversation(
    conversationId,
    currentUser
  );

  return Conversation.findById(conversation._id)
    .populate("participants", "name email role")
    .populate("lastMessage");
};

/**
 * Get paginated messages.
 */
const getMessages = async (
  conversationId,
  currentUser,
  options = {}
) => {
  const conversation = await getAccessibleConversation(
    conversationId,
    currentUser
  );

  const page = Math.max(
    1,
    Number.parseInt(options.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(options.limit, 10) ||
        CHAT_PAGE_SIZE
    )
  );

  const query = {
    conversation: conversation._id,
  };

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate("sender", "name email role")
      .populate("readBy.user", "name email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    Message.countDocuments(query),
  ]);

  return {
    messages: messages.reverse(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  };
};

/**
 * Validate and normalize message content.
 */
const validateMessageContent = (content) => {
  if (content === undefined || content === null) {
    return "";
  }

  if (typeof content !== "string") {
    throw createError(
      "Message content must be a string",
      400
    );
  }

  const trimmed = content.trim();

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw createError(
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      400
    );
  }

  return trimmed;
};

/**
 * Validate attachment metadata.
 *
 * Actual upload security and storage must be handled by
 * a dedicated upload service.
 */
const validateAttachments = (attachments) => {
  if (attachments === undefined) return [];

  if (!Array.isArray(attachments)) {
    throw createError("Attachments must be an array", 400);
  }

  if (attachments.length > 10) {
    throw createError(
      "A maximum of 10 attachments is allowed",
      400
    );
  }

  return attachments.map((attachment) => {
    if (!attachment || typeof attachment !== "object") {
      throw createError("Invalid attachment", 400);
    }

    const requiredFields = [
      "originalName",
      "storageKey",
      "mimeType",
      "size",
    ];

    for (const field of requiredFields) {
      if (
        attachment[field] === undefined ||
        attachment[field] === null ||
        attachment[field] === ""
      ) {
        throw createError(
          `Attachment ${field} is required`,
          400
        );
      }
    }

    if (
      typeof attachment.size !== "number" ||
      !Number.isFinite(attachment.size) ||
      attachment.size <= 0
    ) {
      throw createError(
        "Attachment size must be a positive number",
        400
      );
    }

    return {
      originalName: String(attachment.originalName).trim(),
      storageKey: String(attachment.storageKey).trim(),
      mimeType: String(attachment.mimeType).trim(),
      size: attachment.size,
      url: attachment.url
        ? String(attachment.url).trim()
        : null,
    };
  });
};

/**
 * Send a message.
 *
 * The message is persisted first.
 * Socket.IO notification will be handled by the controller
 * or socket integration layer.
 */
const sendMessage = async (
  conversationId,
  currentUser,
  data = {}
) => {
  const conversation = await getAccessibleConversation(
    conversationId,
    currentUser
  );

  const senderId = getCurrentUserId(currentUser);

  const content = validateMessageContent(data.content);
  const attachments = validateAttachments(data.attachments);

  if (!content && attachments.length === 0) {
    throw createError(
      "Message must contain text or attachments",
      400
    );
  }

  let messageType = data.messageType || "text";

  if (
    !["text", "file", "image"].includes(messageType)
  ) {
    throw createError("Invalid message type", 400);
  }

  if (messageType === "text" && attachments.length > 0) {
    throw createError(
      "Text messages cannot contain attachments",
      400
    );
  }

  if (
    ["file", "image"].includes(messageType) &&
    attachments.length === 0
  ) {
    throw createError(
      "File or image messages require attachments",
      400
    );
  }

  // Confirm sender is a participant.
  const isParticipant = conversation.participants.some(
    (participant) =>
      normalizeId(participant) === normalizeId(senderId)
  );

  if (!isParticipant) {
    throw createError(
      "Only conversation participants can send messages",
      403
    );
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content,
    messageType,
    attachments,
    readBy: [],
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;

  await conversation.save();

  return Message.findById(message._id)
    .populate("sender", "name email role")
    .populate("readBy.user", "name email role");
};

/**
 * Edit a message.
 *
 * Only the sender may edit their own message.
 */
const editMessage = async (
  messageId,
  currentUser,
  content
) => {
  ensureValidMessageId(messageId);

  const message = await Message.findById(messageId);

  if (!message) {
    throw createError("Message not found", 404);
  }

  const conversation = await getAccessibleConversation(
    message.conversation,
    currentUser
  );

  const currentUserId = getCurrentUserId(currentUser);

  if (
    normalizeId(message.sender) !==
    normalizeId(currentUserId)
  ) {
    throw createError(
      "Only the sender can edit this message",
      403
    );
  }

  if (message.isDeleted) {
    throw createError(
      "Deleted messages cannot be edited",
      400
    );
  }

  if (message.messageType !== "text") {
    throw createError(
      "Only text messages can be edited",
      400
    );
  }

  const normalizedContent = validateMessageContent(content);

  if (!normalizedContent) {
    throw createError(
      "Message content cannot be empty",
      400
    );
  }

  message.content = normalizedContent;
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();

  return Message.findById(message._id)
    .populate("sender", "name email role")
    .populate("readBy.user", "name email role");
};

/**
 * Soft-delete a message.
 *
 * Sender can delete their own message.
 * Admin can delete a message they can access.
 */
const deleteMessage = async (
  messageId,
  currentUser
) => {
  ensureValidMessageId(messageId);

  const message = await Message.findById(messageId);

  if (!message) {
    throw createError("Message not found", 404);
  }

  await getAccessibleConversation(
    message.conversation,
    currentUser
  );

  const currentUserId = getCurrentUserId(currentUser);

  const isSender =
    normalizeId(message.sender) ===
    normalizeId(currentUserId);

  const isAdmin = currentUser.role === "admin";

  if (!isSender && !isAdmin) {
    throw createError(
      "You are not authorized to delete this message",
      403
    );
  }

  if (message.isDeleted) {
    return message;
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = currentUserId;

  // Preserve the original message record, but hide its content.
  message.content = "";

  await message.save();

  return message;
};

/**
 * Mark messages as read.
 *
 * Uses atomic updates to avoid duplicate readBy entries.
 */
const markConversationAsRead = async (
  conversationId,
  currentUser
) => {
  const conversation = await getAccessibleConversation(
    conversationId,
    currentUser
  );

  const currentUserId = getCurrentUserId(currentUser);

  const now = new Date();

  const result = await Message.updateMany(
    {
      conversation: conversation._id,
      sender: { $ne: currentUserId },
      isDeleted: false,
      "readBy.user": { $ne: currentUserId },
    },
    {
      $push: {
        readBy: {
          user: currentUserId,
          readAt: now,
        },
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
    readAt: now,
  };
};

module.exports = {
  createOrGetDirectConversation,
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  canAccessConversation,
  getAccessibleConversation,
};