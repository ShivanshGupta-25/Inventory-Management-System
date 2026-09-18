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
    },
    {
      timestamps: true,
    }
  );

/*
 * A user can only appear once in a conversation.
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

module.exports = mongoose.model(
  "ConversationParticipant",
  conversationParticipantSchema
);