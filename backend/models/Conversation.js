const mongoose = require("mongoose");

const { Schema } = mongoose;

const CHAT_ROLES = ["admin", "manager", "staff"];

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["direct"],
      default: "direct",
      immutable: true,
    },

    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: [true, "Conversation participants are required"],
      validate: [
        {
          validator: function (participants) {
            return participants.length === 2;
          },
          message:
            "A direct conversation must have exactly 2 participants",
        },
        {
          validator: function (participants) {
            return (
              new Set(
                participants.map((participant) =>
                  participant.toString()
                )
              ).size === participants.length
            );
          },
          message: "Conversation participants must be unique",
        },
      ],
    },

    participantKey: {
      type: String,
      required: [true, "Participant key is required"],
      unique: true,
      immutable: true,
      trim: true,
      select: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Conversation creator is required"],
      immutable: true,
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// General conversation queries
conversationSchema.index({
  participants: 1,
  updatedAt: -1,
});

conversationSchema.index({
  lastMessageAt: -1,
});

conversationSchema.index({
  isActive: 1,
  updatedAt: -1,
});

// Generate a stable unique key for two participants.
conversationSchema.statics.generateParticipantKey = function (
  userId1,
  userId2
) {
  return [userId1.toString(), userId2.toString()]
    .sort()
    .join("_");
};

// Validate direct conversation participants.
conversationSchema.statics.validateParticipantIds =
  function (participants) {
    if (!Array.isArray(participants)) {
      throw new Error("Participants must be an array");
    }

    if (participants.length !== 2) {
      throw new Error(
        "A direct conversation requires exactly 2 participants"
      );
    }

    const ids = participants.map((id) => id.toString());

    if (new Set(ids).size !== 2) {
      throw new Error(
        "A direct conversation cannot contain duplicate participants"
      );
    }

    return true;
  };

// Prevent changing participants or participantKey through save.
conversationSchema.pre("validate", function (next) {
  if (this.type !== "direct") {
    return next(
      new Error("Only direct conversations are supported")
    );
  }

  if (
    !this.participants ||
    this.participants.length !== 2
  ) {
    return next(
      new Error(
        "A direct conversation must have exactly 2 participants"
      )
    );
  }

  const ids = this.participants.map((id) => id.toString());

  if (new Set(ids).size !== 2) {
    return next(
      new Error("Conversation participants must be unique")
    );
  }

  const expectedKey = this.constructor.generateParticipantKey(
    ids[0],
    ids[1]
  );

  if (this.isNew) {
    this.participantKey = expectedKey;
  } else if (this.isModified("participants")) {
    return next(
      new Error("Conversation participants cannot be changed")
    );
  }

  if (this.isModified("participantKey") && !this.isNew) {
    return next(
      new Error("Participant key cannot be changed")
    );
  }

  next();
});

// Ensure direct conversations contain valid users when
// participant IDs are explicitly checked by the service.
conversationSchema.statics.getAllowedRoles = function () {
  return [...CHAT_ROLES];
};

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
