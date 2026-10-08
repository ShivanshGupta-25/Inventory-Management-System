const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "LOGIN_FAILED",
        "LOGIN_SUCCESS",
        "2FA_OTP_SENT",
        "2FA_SUCCESS",
        "RATE_LIMIT_TRIGGERED",
        "SUSPICIOUS_ACTIVITY",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    ipAddress: {
      type: String,
      trim: true,
      default: null,
    },

    userAgent: {
      type: String,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      required: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

securityEventSchema.index({
  createdAt: -1,
});

securityEventSchema.index({
  type: 1,
  createdAt: -1,
});

securityEventSchema.index({
  ipAddress: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SecurityEvent",
  securityEventSchema
);