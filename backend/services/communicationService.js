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

const createServiceError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/* =====================================================
   NORMALIZE MESSAGE
===================================================== */

const normalizeMessage = (
  message,
  {
    includeDeletedContent = false,
  } = {}
) => {
  if (!message) {
    return null;
  }

  const deletedForEveryone =
    Boolean(message.deletedForEveryone);

  const hideContent =
    deletedForEveryone &&
    !includeDeletedContent;

  return {
    id: message._id,

    conversationId:
      message.conversationId,

    type: message.type,

    text: hideContent
      ? ""
      : message.text || "",

    attachments: hideContent
      ? []
      : message.attachments || [],

    reactions: hideContent
      ? []
      : message.reactions || [],

    createdAt: message.createdAt,

    updatedAt: message.updatedAt,

    deletedForEveryone,

    deletedAt:
      message.deletedAt || null,

    replyCount:
      message.replyCount || 0,

    sender: normalizeUser(
      message.senderId
    ),

    forwardedFrom:
      message.forwardedFrom
        ? {
            messageId:
              message.forwardedFrom
                .messageId,

            conversationId:
              message.forwardedFrom
                .conversationId,

            sender:
              normalizeUser(
                message.forwardedFrom
                  .senderId
              ),
          }
        : null,

    replyTo:
      message.replyTo
        ? {
            id:
              message.replyTo._id,

            text:
              message.replyTo
                .deletedForEveryone
                ? ""
                : message.replyTo.text ||
                  "",

            createdAt:
              message.replyTo.createdAt,

            sender:
              normalizeUser(
                message.replyTo.senderId
              ),

            deletedForEveryone:
              Boolean(
                message.replyTo
                  .deletedForEveryone
              ),

            deletedAt:
              message.replyTo.deletedAt ||
              null,
          }
        : null,
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
      .replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

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
    throw createServiceError(
      "Invalid user ID"
    );
  }

  const user = await User.findById(userId)
    .select("_id name email role")
    .lean();

  if (!user) {
    throw createServiceError(
      "User not found",
      404
    );
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
  const participant =
    await getParticipant(
      conversationId,
      userId
    );

  if (!participant) {
    throw createServiceError(
      "You are not a participant in this conversation",
      403
    );
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

    const lastVisibleMessage =
      await Message.findOne({
        conversationId:
          conversation._id,

        deletedFor: {
          $ne: userId,
        },
      })
        .populate({
          path: "senderId",
          select:
            "_id name email role",
        })
        .populate({
          path: "forwardedFrom.senderId",
          select:
            "_id name email role",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    const conversationParticipants =
      await ConversationParticipant.find({
        conversationId:
          conversation._id,
      })
        .populate(
          "userId",
          "_id name email role"
        )
        .lean();

    let lastMessage = null;

    if (lastVisibleMessage) {
      const normalized =
        normalizeMessage(
          lastVisibleMessage
        );

      lastMessage = {
        ...normalized,

        text:
          lastVisibleMessage
            .deletedForEveryone
            ? "This message was deleted"
            : normalized.text,
      };
    }

    conversations.push({
      id: conversation._id,

      type:
        conversation.type,

      name:
        conversation.name,

      createdBy:
        conversation.createdBy,

      createdAt:
        conversation.createdAt,

      updatedAt:
        conversation.updatedAt,

      lastMessageAt:
        lastVisibleMessage?.createdAt ||
        null,

      lastMessage,

      participants:
        conversationParticipants
          .filter(
            (item) => item.userId
          )
          .map((item) => ({
            id: item.userId._id,
            name: item.userId.name,
            email: item.userId.email,
            role: item.userId.role,

            participantRole:
              item.role,

            joinedAt:
              item.joinedAt,

            lastReadAt:
              item.lastReadAt,
          })),

      currentUserParticipant: {
        role:
          participant.role,

        joinedAt:
          participant.joinedAt,

        lastReadAt:
          participant.lastReadAt,
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
    throw createServiceError(
      "Invalid conversation ID"
    );
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
    throw createServiceError(
      "Conversation not found",
      404
    );
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

    type:
      conversation.type,

    name:
      conversation.name,

    createdBy:
      conversation.createdBy,

    createdAt:
      conversation.createdAt,

    updatedAt:
      conversation.updatedAt,

    lastMessageAt:
      conversation.lastMessageAt,

    participants:
      participants
        .filter(
          (item) => item.userId
        )
        .map((item) => ({
          id: item.userId._id,
          name: item.userId.name,
          email: item.userId.email,
          role: item.userId.role,

          participantRole:
            item.role,

          joinedAt:
            item.joinedAt,

          lastReadAt:
            item.lastReadAt,
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

    deletedFor: {
      $ne: userId,
    },
  };

  if (
    options.before &&
    isValidObjectId(options.before)
  ) {
    const referenceMessage =
      await Message.findById(
        options.before
      )
        .select("createdAt")
        .lean();

    if (referenceMessage) {
      query.createdAt = {
        $lt:
          referenceMessage.createdAt,
      };
    }
  }

  const messages =
    await Message.find(query)
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
      .populate({
        path:
          "forwardedFrom.senderId",

        select:
          "_id name email role",
      })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();

  const messageIds =
    messages.map(
      (message) => message._id
    );

  let replyCountMap =
    new Map();

  if (messageIds.length > 0) {
    const replyCounts =
      await Message.aggregate([
        {
          $match: {
            replyTo: {
              $in: messageIds,
            },

            deletedFor: {
              $ne: userId,
            },
          },
        },

        {
          $group: {
            _id: "$replyTo",

            count: {
              $sum: 1,
            },
          },
        },
      ]);

    replyCountMap =
      new Map(
        replyCounts.map(
          (item) => [
            String(item._id),
            item.count,
          ]
        )
      );
  }

  return messages
    .reverse()
    .map((message) => ({
      ...normalizeMessage(
        message
      ),

      replyCount:
        replyCountMap.get(
          String(message._id)
        ) || 0,
    }));
};

/* =====================================================
   FIND OR CREATE DIRECT CONVERSATION
===================================================== */

const createDirectConversation =
  async (
    currentUserId,
    targetUserId
  ) => {
    if (
      !isValidObjectId(
        targetUserId
      )
    ) {
      throw createServiceError(
        "Invalid target user ID"
      );
    }

    if (
      String(currentUserId) ===
      String(targetUserId)
    ) {
      throw createServiceError(
        "You cannot create a conversation with yourself"
      );
    }

    const targetUser =
      await findUserById(
        targetUserId
      );

    const currentParticipations =
      await ConversationParticipant.find({
        userId: currentUserId,
      }).select("conversationId");

    const conversationIds =
      currentParticipations.map(
        (item) =>
          item.conversationId
      );

    let conversation = null;

    if (conversationIds.length) {
      const targetParticipation =
        await ConversationParticipant.findOne(
          {
            userId:
              targetUserId,

            conversationId: {
              $in:
                conversationIds,
            },
          }
        ).lean();

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

          if (
            participantCount === 2
          ) {
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
          createdBy:
            currentUserId,
        });

      await ConversationParticipant.insertMany(
        [
          {
            conversationId:
              conversation._id,

            userId:
              currentUserId,

            role: "member",
          },

          {
            conversationId:
              conversation._id,

            userId:
              targetUser._id,

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

const createGroupConversation =
  async (
    currentUserId,
    {
      name,
      participantIds = [],
    }
  ) => {
    const trimmedName =
      name?.trim();

    if (!trimmedName) {
      throw createServiceError(
        "Group name is required"
      );
    }

    if (trimmedName.length > 100) {
      throw createServiceError(
        "Group name cannot exceed 100 characters"
      );
    }

    if (!Array.isArray(participantIds)) {
      throw createServiceError(
        "Participant IDs must be an array"
      );
    }

    const uniqueParticipantIds = [
      currentUserId,
      ...participantIds,
    ].map(String);

    const uniqueIds = [
      ...new Set(
        uniqueParticipantIds
      ),
    ];

    for (const id of uniqueIds) {
      if (!isValidObjectId(id)) {
        throw createServiceError(
          "One or more participant IDs are invalid"
        );
      }
    }

    const users =
      await User.find({
        _id: {
          $in: uniqueIds,
        },
      })
        .select(
          "_id name email role"
        )
        .lean();

    if (
      users.length !==
      uniqueIds.length
    ) {
      throw createServiceError(
        "One or more participants were not found"
      );
    }

    if (uniqueIds.length < 3) {
      throw createServiceError(
        "A group conversation requires at least three participants"
      );
    }

    const conversation =
      await Conversation.create({
        type: "group",
        name: trimmedName,
        createdBy:
          currentUserId,
      });

    await ConversationParticipant.insertMany(
      uniqueIds.map((id) => ({
        conversationId:
          conversation._id,

        userId: id,

        role:
          String(id) ===
          String(currentUserId)
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
    throw createServiceError(
      "Message cannot exceed 5000 characters"
    );
  }

  if (
    replyTo &&
    !isValidObjectId(replyTo)
  ) {
    throw createServiceError(
      "Invalid reply message ID"
    );
  }

  if (replyTo) {
    const repliedMessage =
      await Message.findOne({
        _id: replyTo,
        conversationId,
      }).lean();

    if (!repliedMessage) {
      throw createServiceError(
        "Reply message not found in this conversation"
      );
    }
  }

  if (
    !trimmedText &&
    (!files || files.length === 0)
  ) {
    throw createServiceError(
      "Message must contain text or an attachment"
    );
  }

  const attachments = (
    files || []
  ).map((file) => {
    const isImage =
      file.mimetype.startsWith(
        "image/"
      );

    return {
      name:
        file.originalname,

      mimeType:
        file.mimetype,

      size:
        file.size,

      url: `${baseUrl}/uploads/${
        isImage
          ? "images"
          : "documents"
      }/${file.filename}`,

      path:
        file.path,
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
        lastMessage:
          message._id,

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
      .populate({
        path:
          "forwardedFrom.senderId",

        select:
          "_id name email role",
      })
      .lean();

  const replyCount =
    await Message.countDocuments({
      replyTo: message._id,
    });

  return {
    ...normalizeMessage(
      populatedMessage
    ),

    replyCount,
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

  participant.lastReadAt =
    new Date();

  await participant.save();

  return {
    conversationId,

    lastReadAt:
      participant.lastReadAt,
  };
};

/* =====================================================
   TOGGLE MESSAGE REACTION
===================================================== */

const toggleMessageReaction =
  async ({
    messageId,
    userId,
    emoji,
  }) => {
    if (!isValidObjectId(messageId)) {
      throw createServiceError(
        "Invalid message ID"
      );
    }

    if (
      !emoji ||
      typeof emoji !== "string"
    ) {
      throw createServiceError(
        "Emoji is required"
      );
    }

    const cleanEmoji =
      emoji.trim();

    if (!cleanEmoji) {
      throw createServiceError(
        "Emoji is required"
      );
    }

    if (cleanEmoji.length > 20) {
      throw createServiceError(
        "Emoji is too long"
      );
    }

    const message =
      await Message.findById(
        messageId
      );

    if (!message) {
      throw createServiceError(
        "Message not found",
        404
      );
    }

    await requireParticipant(
      message.conversationId,
      userId
    );

    if (
      message.deletedForEveryone
    ) {
      throw createServiceError(
        "Cannot react to a deleted message"
      );
    }

    if (
      !Array.isArray(
        message.reactions
      )
    ) {
      message.reactions = [];
    }

    const currentReaction =
      message.reactions.find(
        (reaction) =>
          reaction.userIds?.some(
            (id) =>
              String(id) ===
              String(userId)
          )
      );

    if (
      currentReaction?.emoji ===
      cleanEmoji
    ) {
      currentReaction.userIds =
        currentReaction.userIds.filter(
          (id) =>
            String(id) !==
            String(userId)
        );

      if (
        currentReaction.userIds
          .length === 0
      ) {
        message.reactions =
          message.reactions.filter(
            (reaction) =>
              reaction.emoji !==
              cleanEmoji
          );
      }

      await message.save();

      return {
        id:
          message._id,

        conversationId:
          message.conversationId,

        reactions:
          message.reactions,
      };
    }

    if (currentReaction) {
      currentReaction.userIds =
        currentReaction.userIds.filter(
          (id) =>
            String(id) !==
            String(userId)
        );

      if (
        currentReaction.userIds
          .length === 0
      ) {
        message.reactions =
          message.reactions.filter(
            (reaction) =>
              reaction.emoji !==
              currentReaction.emoji
          );
      }
    }

    const newReaction =
      message.reactions.find(
        (reaction) =>
          reaction.emoji ===
          cleanEmoji
      );

    if (newReaction) {
      newReaction.userIds.push(
        userId
      );
    } else {
      message.reactions.push({
        emoji: cleanEmoji,
        userIds: [userId],
      });
    }

    await message.save();

    return {
      id:
        message._id,

      conversationId:
        message.conversationId,

      reactions:
        message.reactions,
    };
  };

/* =====================================================
   DELETE MESSAGE FOR ME
===================================================== */

const deleteMessageForMe = async ({
  messageId,
  userId,
}) => {
  if (!isValidObjectId(messageId)) {
    throw createServiceError(
      "Invalid message ID"
    );
  }

  const message =
    await Message.findById(
      messageId
    );

  if (!message) {
    throw createServiceError(
      "Message not found",
      404
    );
  }

  await requireParticipant(
    message.conversationId,
    userId
  );

  if (
    !Array.isArray(
      message.deletedFor
    )
  ) {
    message.deletedFor = [];
  }

  const alreadyDeleted =
    message.deletedFor.some(
      (id) =>
        String(id) ===
        String(userId)
    );

  if (!alreadyDeleted) {
    message.deletedFor.push(
      userId
    );

    await message.save();
  }

  return {
    id:
      message._id,

    conversationId:
      message.conversationId,
  };
};

/* =====================================================
   DELETE MESSAGE FOR EVERYONE
===================================================== */

const deleteMessageForEveryone =
  async ({
    messageId,
    userId,
  }) => {
    if (!isValidObjectId(messageId)) {
      throw createServiceError(
        "Invalid message ID"
      );
    }

    const message =
      await Message.findById(
        messageId
      );

    if (!message) {
      throw createServiceError(
        "Message not found",
        404
      );
    }

    await requireParticipant(
      message.conversationId,
      userId
    );

    if (
      String(message.senderId) !==
      String(userId)
    ) {
      throw createServiceError(
        "You can only delete your own messages for everyone",
        403
      );
    }

    if (
      !message.deletedForEveryone
    ) {
      message.deletedForEveryone =
        true;

      message.deletedAt =
        new Date();

      await message.save();
    }

    return {
      id:
        message._id,

      conversationId:
        message.conversationId,

      deletedForEveryone:
        message.deletedForEveryone,

      deletedAt:
        message.deletedAt,
    };
  };

/* =====================================================
   BULK DELETE MESSAGE FOR ME
===================================================== */

const deleteMessagesForMe =
  async ({
    messageIds,
    userId,
  }) => {
    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0
    ) {
      throw createServiceError(
        "At least one message ID is required"
      );
    }

    const uniqueMessageIds = [
      ...new Set(
        messageIds.map(String)
      ),
    ];

    if (
      uniqueMessageIds.length >
      100
    ) {
      throw createServiceError(
        "You can delete up to 100 messages at once"
      );
    }

    for (const messageId of
      uniqueMessageIds) {
      if (
        !isValidObjectId(
          messageId
        )
      ) {
        throw createServiceError(
          `Invalid message ID: ${messageId}`
        );
      }
    }

    const messages =
      await Message.find({
        _id: {
          $in: uniqueMessageIds,
        },
      }).lean();

    if (
      messages.length !==
      uniqueMessageIds.length
    ) {
      throw createServiceError(
        "One or more messages were not found",
        404
      );
    }

    const conversationIds = [
      ...new Set(
        messages.map(
          (message) =>
            String(
              message.conversationId
            )
        )
      ),
    ];

    for (const conversationId of
      conversationIds) {
      await requireParticipant(
        conversationId,
        userId
      );
    }

    const updateResult =
      await Message.updateMany(
        {
          _id: {
            $in: uniqueMessageIds,
          },

          deletedFor: {
            $ne: userId,
          },
        },

        {
          $addToSet: {
            deletedFor: userId,
          },
        }
      );

    return {
      messageIds:
        uniqueMessageIds,

      conversationIds,

      modifiedCount:
        updateResult.modifiedCount ||
        0,
    };
  };

/* =====================================================
   GET CONVERSATION LAST MESSAGE
===================================================== */

const getConversationLastMessage =
  async (conversationId) => {
    const message =
      await Message.findOne({
        conversationId,
      })
        .populate(
          "senderId",
          "_id name email role"
        )
        .populate({
          path:
            "forwardedFrom.senderId",

          select:
            "_id name email role",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    if (!message) {
      return null;
    }

    const normalized =
      normalizeMessage(message);

    if (
      message.deletedForEveryone
    ) {
      normalized.text =
        "This message was deleted";
    }

    return normalized;
  };

/* =====================================================
   BULK DELETE MESSAGE FOR EVERYONE
===================================================== */

const deleteMessagesForEveryone =
  async ({
    messageIds,
    userId,
  }) => {
    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0
    ) {
      throw createServiceError(
        "At least one message ID is required"
      );
    }

    const uniqueMessageIds = [
      ...new Set(
        messageIds.map(String)
      ),
    ];

    if (
      uniqueMessageIds.length >
      100
    ) {
      throw createServiceError(
        "You can delete up to 100 messages at once"
      );
    }

    for (const messageId of
      uniqueMessageIds) {
      if (
        !isValidObjectId(
          messageId
        )
      ) {
        throw createServiceError(
          `Invalid message ID: ${messageId}`
        );
      }
    }

    const messages =
      await Message.find({
        _id: {
          $in: uniqueMessageIds,
        },
      }).lean();

    if (
      messages.length !==
      uniqueMessageIds.length
    ) {
      throw createServiceError(
        "One or more messages were not found",
        404
      );
    }

    const conversationIds = [
      ...new Set(
        messages.map(
          (message) =>
            String(
              message.conversationId
            )
        )
      ),
    ];

    for (const conversationId of
      conversationIds) {
      await requireParticipant(
        conversationId,
        userId
      );
    }

    const unauthorizedMessage =
      messages.find(
        (message) =>
          String(message.senderId) !==
          String(userId)
      );

    if (unauthorizedMessage) {
      throw createServiceError(
        "You can only delete your own messages for everyone",
        403
      );
    }

    const now = new Date();

    await Message.updateMany(
      {
        _id: {
          $in: uniqueMessageIds,
        },

        senderId: userId,

        deletedForEveryone: {
          $ne: true,
        },
      },

      {
        $set: {
          deletedForEveryone:
            true,

          deletedAt: now,
        },
      }
    );

    const conversationUpdates =
      [];

    for (const conversationId of
      conversationIds) {
      const lastMessage =
        await getConversationLastMessage(
          conversationId
        );

      conversationUpdates.push({
        conversationId,
        lastMessage,
      });

      if (lastMessage) {
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              lastMessage:
                lastMessage.id,

              lastMessageAt:
                lastMessage.createdAt,
            },
          }
        );
      } else {
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            $set: {
              lastMessage: null,
              lastMessageAt: null,
            },
          }
        );
      }
    }

    return {
      messageIds:
        uniqueMessageIds,

      conversationIds,

      deletedAt: now,

      conversationUpdates,
    };
  };

/* =====================================================
   FORWARD MESSAGES
===================================================== */

const forwardMessages = async ({
  messageIds,
  conversationIds,
  userId,
}) => {
  if (
    !Array.isArray(messageIds) ||
    messageIds.length === 0
  ) {
    throw createServiceError(
      "At least one message ID is required"
    );
  }

  if (
    !Array.isArray(conversationIds) ||
    conversationIds.length === 0
  ) {
    throw createServiceError(
      "At least one destination conversation is required"
    );
  }

  const uniqueMessageIds = [
    ...new Set(
      messageIds.map(String)
    ),
  ];

  const uniqueConversationIds = [
    ...new Set(
      conversationIds.map(String)
    ),
  ];

  if (
    uniqueMessageIds.length >
    100
  ) {
    throw createServiceError(
      "You can forward up to 100 messages at once"
    );
  }

  if (
    uniqueConversationIds.length >
    50
  ) {
    throw createServiceError(
      "You can forward to up to 50 conversations at once"
    );
  }

  for (const messageId of
    uniqueMessageIds) {
    if (
      !isValidObjectId(
        messageId
      )
    ) {
      throw createServiceError(
        `Invalid message ID: ${messageId}`
      );
    }
  }

  for (const conversationId of
    uniqueConversationIds) {
    if (
      !isValidObjectId(
        conversationId
      )
    ) {
      throw createServiceError(
        `Invalid conversation ID: ${conversationId}`
      );
    }
  }

  const sourceMessages =
    await Message.find({
      _id: {
        $in: uniqueMessageIds,
      },

      deletedFor: {
        $ne: userId,
      },
    })
      .populate(
        "senderId",
        "_id name email role"
      )
      .sort({
        createdAt: 1,
      })
      .lean();

  if (
    sourceMessages.length !==
    uniqueMessageIds.length
  ) {
    throw createServiceError(
      "One or more selected messages are unavailable"
    );
  }

  const deletedMessage =
    sourceMessages.find(
      (message) =>
        message.deletedForEveryone
    );

  if (deletedMessage) {
    throw createServiceError(
      "Deleted messages cannot be forwarded"
    );
  }

  const sourceConversationIds = [
    ...new Set(
      sourceMessages.map(
        (message) =>
          String(
            message.conversationId
          )
      )
    ),
  ];

  for (const conversationId of
    sourceConversationIds) {
    await requireParticipant(
      conversationId,
      userId
    );
  }

  for (const conversationId of
    uniqueConversationIds) {
    await requireParticipant(
      conversationId,
      userId
    );
  }

  const createdMessages = [];
  const conversationResults = [];

  for (const conversationId of
    uniqueConversationIds) {
    const destinationMessages = [];

    for (const sourceMessage of
      sourceMessages) {
      const sourceSenderId =
        sourceMessage.senderId?._id ||
        sourceMessage.senderId;

      const forwardedMessage =
        await Message.create({
          conversationId,

          senderId:
            userId,

          type:
            sourceMessage.type,

          text:
            sourceMessage.text || "",

          attachments:
            sourceMessage.attachments ||
            [],

          replyTo: null,

          reactions: [],

          deletedFor: [],

          deletedForEveryone:
            false,

          deletedAt: null,

          forwardedFrom: {
            messageId:
              sourceMessage._id,

            conversationId:
              sourceMessage.conversationId,

            senderId:
              sourceSenderId,
          },
        });

      destinationMessages.push(
        forwardedMessage
      );
    }

    const lastCreatedMessage =
      destinationMessages[
        destinationMessages.length - 1
      ];

    if (lastCreatedMessage) {
      await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $set: {
            lastMessage:
              lastCreatedMessage._id,

            lastMessageAt:
              lastCreatedMessage.createdAt,
          },
        }
      );
    }

    const createdMessageIds =
      destinationMessages.map(
        (message) =>
          message._id
      );

    const populatedMessages =
      await Message.find({
        _id: {
          $in:
            createdMessageIds,
        },
      })
        .populate(
          "senderId",
          "_id name email role"
        )
        .populate({
          path:
            "forwardedFrom.senderId",

          select:
            "_id name email role",
        })
        .sort({
          createdAt: 1,
        })
        .lean();

    const normalizedMessages =
      populatedMessages.map(
        (message) =>
          normalizeMessage(
            message
          )
      );

    createdMessages.push(
      ...normalizedMessages
    );

    conversationResults.push({
      conversationId,

      messages:
        normalizedMessages,

      lastMessage:
        normalizedMessages[
          normalizedMessages.length - 1
        ] || null,
    });
  }

  return {
    messages:
      createdMessages,

    conversations:
      conversationResults,
  };
};

/* =====================================================
   GET MESSAGE THREAD
===================================================== */

const getMessageThread = async (
  conversationId,
  messageId,
  userId
) => {
  await requireParticipant(
    conversationId,
    userId
  );

  if (!isValidObjectId(messageId)) {
    throw createServiceError(
      "Invalid message ID"
    );
  }

  const parentMessage =
    await Message.findOne({
      _id: messageId,
      conversationId,
    })
      .populate(
        "senderId",
        "_id name email role"
      )
      .populate({
        path:
          "forwardedFrom.senderId",

        select:
          "_id name email role",
      })
      .lean();

  if (!parentMessage) {
    throw createServiceError(
      "Message not found",
      404
    );
  }

  const replies =
    await Message.find({
      conversationId,

      replyTo: messageId,

      deletedFor: {
        $ne: userId,
      },
    })
      .populate(
        "senderId",
        "_id name email role"
      )
      .populate({
        path:
          "forwardedFrom.senderId",

        select:
          "_id name email role",
      })
      .sort({
        createdAt: 1,
      })
      .lean();

  return {
    parent:
      normalizeMessage(
        parentMessage,
        {
          includeDeletedContent:
            false,
        }
      ),

    replies:
      replies.map(
        (message) =>
          normalizeMessage(
            message
          )
      ),
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
  getMessageThread,
  createDirectConversation,
  createGroupConversation,
  sendMessage,
  markConversationRead,
  toggleMessageReaction,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteMessagesForMe,
  deleteMessagesForEveryone,
  forwardMessages,
};