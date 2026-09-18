const mongoose = require("mongoose");

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    originalName: {
      type: String,
      required: [true, "Attachment name is required"],
      trim: true,
      maxlength: 255,
    },

    storageKey: {
      type: String,
      required: [true, "Attachment storage key is required"],
      trim: true,
      maxlength: 2048,
    },

    mimeType: {
      type: String,
      required: [true, "Attachment MIME type is required"],
      trim: true,
      maxlength: 100,
    },

    size: {
      type: Number,
      required: [true, "Attachment size is required"],
      min: [1, "Attachment size must be greater than 0"],
    },

    url: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2048,
    },
  },
  {
    _id: true,
    versionKey: false,
  }
);

const readBySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation is required"],
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Message sender is required"],
      immutable: true,
      index: true,
    },

    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
      default: "",
    },

    messageType: {
      type: String,
      enum: ["text", "file", "image", "system"],
      default: "text",
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
      validate: {
        validator: function (attachments) {
          return attachments.length <= 10;
        },
        message:
          "A message cannot contain more than 10 attachments",
      },
    },

    readBy: {
      type: [readBySchema],
      default: [],
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Message history queries
messageSchema.index({
  conversation: 1,
  createdAt: -1,
});

messageSchema.index({
  sender: 1,
  createdAt: -1,
});

// Validate message content and attachments.
messageSchema.pre("validate", function (next) {
  const hasContent =
    typeof this.content === "string" &&
    this.content.trim().length > 0;

  const hasAttachments =
    Array.isArray(this.attachments) &&
    this.attachments.length > 0;

  if (!hasContent && !hasAttachments) {
    return next(
      new Error(
        "A message must contain text or at least one attachment"
      )
    );
  }

  if (this.messageType === "text" && !hasContent) {
    return next(
      new Error("Text messages must contain content")
    );
  }

  if (this.messageType === "file" && !hasAttachments) {
    return next(
      new Error("File messages must contain attachments")
    );
  }

  if (this.messageType === "image" && !hasAttachments) {
    return next(
      new Error("Image messages must contain attachments")
    );
  }

  if (this.messageType === "system" && !hasContent) {
    return next(
      new Error("System messages must contain content")
    );
  }

  next();
});

const Message =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);

module.exports = Message;