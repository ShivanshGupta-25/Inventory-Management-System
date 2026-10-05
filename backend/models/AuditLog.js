const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // ACTOR
    // --------------------------------------------------

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --------------------------------------------------
    // ACTION
    // --------------------------------------------------

    action: {
      type: String,
      required: true,
      enum: [
        "USER_CREATED",
        "USER_UPDATED",
        "ROLE_CHANGED",
        "STATUS_CHANGED",
        "USER_DELETED",
        "PROFILE_UPDATED",
      ],
    },

    // --------------------------------------------------
    // TARGET USER
    // --------------------------------------------------

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // --------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------------------------------
    // METADATA
    // --------------------------------------------------

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ targetUser: 1 });
auditLogSchema.index({ action: 1 });

// --------------------------------------------------
// MODEL
// --------------------------------------------------

module.exports = mongoose.model(
  "AuditLog",
  auditLogSchema
);