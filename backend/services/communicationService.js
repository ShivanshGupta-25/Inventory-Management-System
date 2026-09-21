const mongoose = require("mongoose");

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const ConversationParticipant =
  require("../models/ConversationParticipant");
const Message = require("../models/Message");

/* =====================================================
   HELPERS
===================================================== */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

/* =====================================================
   GET COMMUNICATION USERS
===================================================== */

const getCommunicationUsers = async (
  currentUserId,
  search = ""
) => {
  const query = {
    _id: {
      $ne: currentUserId,
    },
  };

  if (search.trim()) {
    const escapedSearch = search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    query.$or = [
      {
        name: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        email: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  const users = await User.find(query)
    .select("_id name email role")
    .sort({ name: 1 })
    .limit(50)
    .lean();

  return users.map(normalizeUser);
};

/* =====================================================
   VERIFY USER
===================================================== */

const findUserById = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(userId)
    .select("_id name email role")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/* =====================================================
   GET PARTICIPANT
===================================================== */

const getParticipant = async (
  conversationId,
  userId
) => {
  return ConversationParticipant.findOne({
    conversationId,
    userId,
  });
};

/* =====================================================
   REQUIRE PARTICIPANT
===================================================== */

const requireParticipant = async (
  conversationId,
  userId
) => {
  const participant = await getParticipant(
    conversationId,
    userId
  );

  if (!participant) {
    const error = new Error(
      "You are not a participant in this conversation"
    );

    error.statusCode = 403;

    throw error;
  }

  return participant;
};

/* =====================================================
   GET USER CONVERSATIONS
===================================================== */

const getConversations = async (userId) => {
  const participants =
    await ConversationParticipant.find({
      userId,
    })
      .populate({
        path: "conversationId",
        populate: {
          path: "lastMessage",
          populate: {
            path: "senderId",
            select: "_id name email role",
          },
        },
      })
      .sort({
        updatedAt: -1,
      })
      .lean();

  const conversations = [];

  for (const participant of participants) {
    const conversation =
      participant.conversationId;

    if (!conversation) {
      continue;
    }

    const conversationParticipants =
      await ConversationParticipant.find({
        conversationId: conversation._id,
      })
        .populate(
          "userId",
          "_id name email role"
        )
        .lean();

    conversations.push({
      id: conversation._id,
      type: conversation.type,
      name: conversation.name,
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessageAt:
        conversation.lastMessageAt,

      lastMessage: conversation.lastMessage
        ? {
            id: conversation.lastMessage._id,
            type: conversation.lastMessage.type,
            text: conversation.lastMessage.text,
            createdAt:
              conversation.lastMessage.createdAt,
            sender: normalizeUser(
              conversation.lastMessage.senderId
            ),
          }
        : null,

      participants:
        conversationParticipants
          .filter((item) => item.userId)
          .map((item) => ({
            id: item.userId._id,
            name: item.userId.name,
            email: item.userId.email,
            role: item.userId.role,
            participantRole: item.role,
            joinedAt: item.joinedAt,
            lastReadAt: item.lastReadAt,
          })),

      currentUserParticipant: {
        role: participant.role,
        joinedAt: participant.joinedAt,
        lastReadAt: participant.lastReadAt,
      },
    });
  }

  return conversations;
};

/* =====================================================
   GET CONVERSATION
===================================================== */

const getConversation = async (
  conversationId,
  userId
) => {
  if (!isValidObjectId(conversationId)) {
    const error = new Error(
      "Invalid conversation ID"
    );

    error.statusCode = 400;

    throw error;
  }

  await requireParticipant(
    conversationId,
    userId
  );

  const conversation =
    await Conversation.findById(
      conversationId
    ).lean();

  if (!conversation) {
    const error = new Error(
      "Conversation not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const participants =
    await ConversationParticipant.find({
      conversationId,
    })
      .populate(
        "userId",
        "_id name email role"
      )
      .lean();

  return {
    id: conversation._id,
    type: conversation.type,
    name: conversation.name,
    createdBy: conversation.createdBy,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt:
      conversation.lastMessageAt,

    participants: participants
      .filter((item) => item.userId)
      .map((item) => ({
        id: item.userId._id,
        name: item.userId.name,
        email: item.userId.email,
        role: item.userId.role,
        participantRole: item.role,
        joinedAt: item.joinedAt,
        lastReadAt: item.lastReadAt,
      })),
  };
};

/* =====================================================
   GET MESSAGES
===================================================== */

const getMessages = async (
  conversationId,
  userId,
  options = {}
) => {
  await requireParticipant(
    conversationId,
    userId
  );

  const limit = Math.min(
    Number(options.limit) || 50,
    100
  );

  const query = {
    conversationId,
  };

  if (
    options.before &&
    isValidObjectId(options.before)
  ) {
    const referenceMessage =
      await Message.findById(options.before)
        .select("createdAt")
        .lean();

    if (referenceMessage) {
      query.createdAt = {
        $lt: referenceMessage.createdAt,
      };
    }
  }

  const messages = await Message.find(query)
    .populate(
      "senderId",
      "_id name email role"
    )
    .populate({
      path: "replyTo",
      populate: {
        path: "senderId",
        select: "_id name email role",
      },
    })
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return messages
    .reverse()
    .map((message) => ({
      id: message._id,

      conversationId:
        message.conversationId,

      type: message.type,

      text:
        message.text || "",

      attachments:
        message.attachments || [],

      createdAt:
        message.createdAt,

      updatedAt:
        message.updatedAt,

      sender:
        normalizeUser(
          message.senderId
        ),

      replyTo:
        message.replyTo
          ? {
              id:
                message.replyTo._id,

              text:
                message.replyTo.text || "",

              createdAt:
                message.replyTo.createdAt,

              sender:
                normalizeUser(
                  message.replyTo.senderId
                ),
            }
          : null,
    }));
};

/* =====================================================
   FIND OR CREATE DIRECT CONVERSATION
===================================================== */

const createDirectConversation = async (
  currentUserId,
  targetUserId
) => {
  if (
    !isValidObjectId(targetUserId)
  ) {
    const error = new Error(
      "Invalid target user ID"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    String(currentUserId) ===
    String(targetUserId)
  ) {
    const error = new Error(
      "You cannot create a conversation with yourself"
    );

    error.statusCode = 400;

    throw error;
  }

  const targetUser =
    await findUserById(targetUserId);

  /*
   * Find a direct conversation containing
   * both users.
   */
  const currentParticipations =
    await ConversationParticipant.find({
      userId: currentUserId,
    }).select("conversationId");

  const conversationIds =
    currentParticipations.map(
      (item) => item.conversationId
    );

  let conversation = null;

  if (conversationIds.length) {
    const targetParticipation =
      await ConversationParticipant.findOne({
        userId: targetUserId,
        conversationId: {
          $in: conversationIds,
        },
      }).lean();

    if (targetParticipation) {
      const possibleConversation =
        await Conversation.findOne({
          _id:
            targetParticipation.conversationId,
          type: "direct",
        }).lean();

      if (possibleConversation) {
        const participantCount =
          await ConversationParticipant.countDocuments(
            {
              conversationId:
                possibleConversation._id,
            }
          );

        if (participantCount === 2) {
          conversation =
            possibleConversation;
        }
      }
    }
  }

  if (!conversation) {
    conversation =
      await Conversation.create({
        type: "direct",
        name: "",
        createdBy: currentUserId,
      });

    await ConversationParticipant.insertMany(
      [
        {
          conversationId:
            conversation._id,
          userId: currentUserId,
          role: "member",
        },
        {
          conversationId:
            conversation._id,
          userId: targetUser._id,
          role: "member",
        },
      ]
    );
  }

  return getConversation(
    conversation._id,
    currentUserId
  );
};

/* =====================================================
   CREATE GROUP
===================================================== */

const createGroupConversation = async (
  currentUserId,
  { name, participantIds = [] }
) => {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    const error = new Error(
      "Group name is required"
    );

    error.statusCode = 400;

    throw error;
  }

  if (trimmedName.length > 100) {
    const error = new Error(
      "Group name cannot exceed 100 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  if (!Array.isArray(participantIds)) {
    const error = new Error(
      "Participant IDs must be an array"
    );

    error.statusCode = 400;

    throw error;
  }

  const uniqueParticipantIds = [
    currentUserId,
    ...participantIds,
  ].map(String);

  const uniqueIds = [
    ...new Set(uniqueParticipantIds),
  ];

  for (const id of uniqueIds) {
    if (!isValidObjectId(id)) {
      const error = new Error(
        "One or more participant IDs are invalid"
      );

      error.statusCode = 400;

      throw error;
    }
  }

  const users = await User.find({
    _id: {
      $in: uniqueIds,
    },
  })
    .select("_id name email role")
    .lean();

  if (users.length !== uniqueIds.length) {
    const error = new Error(
      "One or more participants were not found"
    );

    error.statusCode = 400;

    throw error;
  }

  if (uniqueIds.length < 3) {
    const error = new Error(
      "A group conversation requires at least three participants"
    );

    error.statusCode = 400;

    throw error;
  }

  const conversation =
    await Conversation.create({
      type: "group",
      name: trimmedName,
      createdBy: currentUserId,
    });

  await ConversationParticipant.insertMany(
    uniqueIds.map((id) => ({
      conversationId:
        conversation._id,
      userId: id,
      role:
        String(id) === String(currentUserId)
          ? "admin"
          : "member",
    }))
  );

  return getConversation(
    conversation._id,
    currentUserId
  );
};

/* =====================================================
   SEND MESSAGE
===================================================== */

const sendMessage = async (
  conversationId,
  senderId,
  {
    text = "",
    replyTo = null,
    files = [],
    baseUrl,
  }
) => {
  await requireParticipant(
    conversationId,
    senderId
  );

  const trimmedText =
    typeof text === "string"
      ? text.trim()
      : "";

  if (trimmedText.length > 5000) {
    const error = new Error(
      "Message cannot exceed 5000 characters"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    replyTo &&
    !isValidObjectId(replyTo)
  ) {
    const error = new Error(
      "Invalid reply message ID"
    );

    error.statusCode = 400;

    throw error;
  }

  if (replyTo) {
    const repliedMessage =
      await Message.findOne({
        _id: replyTo,
        conversationId,
      }).lean();

    if (!repliedMessage) {
      const error = new Error(
        "Reply message not found in this conversation"
      );

      error.statusCode = 400;

      throw error;
    }
  }

  if (
    !trimmedText &&
    (!files || files.length === 0)
  ) {
    const error = new Error(
      "Message must contain text or an attachment"
    );

    error.statusCode = 400;

    throw error;
  }

  const attachments = (
    files || []
  ).map((file) => {
    const isImage =
      file.mimetype.startsWith("image/");

    return {
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,

      url: `${baseUrl}/uploads/${
        isImage
          ? "images"
          : "documents"
      }/${file.filename}`,

      path: file.path,
    };
  });

  let type = "text";

  if (attachments.length > 0) {
    const allImages =
      attachments.every(
        (attachment) =>
          attachment.mimeType.startsWith(
            "image/"
          )
      );

    type = allImages
      ? "image"
      : "file";
  }

  const message =
    await Message.create({
      conversationId,
      senderId,
      type,
      text: trimmedText,
      attachments,
      replyTo:
        replyTo || null,
    });

  await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        lastMessage: message._id,
        lastMessageAt:
          message.createdAt,
      },
    }
  );

  const populatedMessage =
    await Message.findById(
      message._id
    )
      .populate(
        "senderId",
        "_id name email role"
      )
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select:
            "_id name email role",
        },
      })
      .lean();

  return {
    id: populatedMessage._id,

    conversationId:
      populatedMessage.conversationId,

    type: populatedMessage.type,

    text:
      populatedMessage.text || "",

    attachments:
      populatedMessage.attachments || [],

    createdAt:
      populatedMessage.createdAt,

    updatedAt:
      populatedMessage.updatedAt,

    sender: normalizeUser(
      populatedMessage.senderId
    ),

    replyTo:
      populatedMessage.replyTo
        ? {
            id:
              populatedMessage
                .replyTo._id,

            text:
              populatedMessage
                .replyTo.text || "",

            createdAt:
              populatedMessage
                .replyTo.createdAt,

            sender:
              normalizeUser(
                populatedMessage
                  .replyTo.senderId
              ),
          }
        : null,
  };
};

/* =====================================================
   MARK CONVERSATION AS READ
===================================================== */

const markConversationRead = async (
  conversationId,
  userId
) => {
  const participant =
    await requireParticipant(
      conversationId,
      userId
    );

  participant.lastReadAt = new Date();

  await participant.save();

  return {
    conversationId,
    lastReadAt: participant.lastReadAt,
  };
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  getCommunicationUsers,
  getConversations,
  getConversation,
  getMessages,
  createDirectConversation,
  createGroupConversation,
  sendMessage,
  markConversationRead,
};