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

      joinedAt: {
        type: Date,
        default: Date.now,
      },

      lastReadAt: {
        type: Date,
        default: null,
      },

      /*
       * Conversation management
       */

      isPinned: {
        type: Boolean,
        default: false,
      },

      isMuted: {
        type: Boolean,
        default: false,
      },

      /*
       * User-specific conversation deletion.
       *
       * The conversation itself is NOT deleted.
       * Only this user's participation is hidden.
       */
      deletedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * A user can only appear once
 * in a conversation.
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
 * Useful when loading a user's conversations.
 */
conversationParticipantSchema.index({
  userId: 1,
  updatedAt: -1,
});

/*
 * Useful when loading only active
 * conversations for a user.
 */
conversationParticipantSchema.index({
  userId: 1,
  deletedAt: 1,
  updatedAt: -1,
});

module.exports = mongoose.model(
  "ConversationParticipant",
  conversationParticipantSchema
);