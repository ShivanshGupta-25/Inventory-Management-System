const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const reactionSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      required: true,
      trim: true,
    },

    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    _id: false,
  }
);

const forwardedFromSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    text: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    // If this message is a reply,
    // this points to the parent message.
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Original message information when
    // this message was forwarded.
    forwardedFrom: {
      type: forwardedFromSchema,
      default: null,
    },

    reactions: {
      type: [reactionSchema],
      default: [],
    },

    deletedFor: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    deletedForEveryone: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Main conversation message listing
messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

// Thread/reply lookup
messageSchema.index({
  conversationId: 1,
  replyTo: 1,
  createdAt: 1,
});

// Forwarded-message lookup
messageSchema.index({
  "forwardedFrom.messageId": 1,
});

module.exports = mongoose.model(
  "Message",
  messageSchema
);