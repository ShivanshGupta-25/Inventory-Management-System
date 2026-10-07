const mongoose = require("mongoose");

const conversationParticipantSchema =
  new mongoose.Schema(
    {
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },

      /*
       * When the user joined the conversation.
       *
       * When a user leaves and is later added again,
       * this value can be refreshed by the controller.
       */
      joinedAt: {
        type: Date,
        default: Date.now,
      },

      lastReadAt: {
        type: Date,
        default: null,
      },

      isPinned: {
        type: Boolean,
        default: false,
      },

      isMuted: {
        type: Boolean,
        default: false,
      },

      /*
       * Soft deletion from the user's
       * conversation list.
       *
       * This should NOT be used when a user
       * leaves a group.
       */
      deletedAt: {
        type: Date,
        default: null,
      },

      /*
       * Indicates that the user explicitly
       * left a group.
       *
       * This is intentionally separate from
       * deletedAt.
       *
       * leftAt = null
       *     -> user is currently a member
       *
       * leftAt = Date
       *     -> user has left the group
       */
      leftAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * One participant record per user per conversation.
 *
 * This is important because when a user leaves
 * and is later added again, we reactivate the
 * existing participant record instead of creating
 * a duplicate record.
 */
conversationParticipantSchema.index(
  {
    conversationId: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

/*
 * Useful for retrieving a user's conversations
 * ordered by recent participant activity.
 */
conversationParticipantSchema.index({
  userId: 1,
  updatedAt: -1,
});

/*
 * Useful when retrieving conversations that have
 * not been deleted from the user's conversation list.
 */
conversationParticipantSchema.index({
  userId: 1,
  deletedAt: 1,
  updatedAt: -1,
});

/*
 * Useful for checking active/left membership
 * within a conversation.
 */
conversationParticipantSchema.index({
  conversationId: 1,
  leftAt: 1,
  deletedAt: 1,
});

module.exports = mongoose.model(
  "ConversationParticipant",
  conversationParticipantSchema
);