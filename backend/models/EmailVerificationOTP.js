const mongoose = require("mongoose");

const emailVerificationOTPSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      verificationId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      attempts: {
        type: Number,
        default: 0,
      },

      lastSentAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

// Automatically remove expired verification records.
emailVerificationOTPSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports =
  mongoose.model(
    "EmailVerificationOTP",
    emailVerificationOTPSchema
  );