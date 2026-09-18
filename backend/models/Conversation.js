const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    directKey: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index(
  { directKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "direct",
      directKey: {
        $type: "string",
      },
    },
  }
);

/*
 * General conversation listing.
 */
conversationSchema.index({
  type: 1,
  updatedAt: -1,
});

conversationSchema.index({
  createdBy: 1,
  updatedAt: -1,
});

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);