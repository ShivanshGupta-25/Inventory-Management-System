const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
    // ---------------------------------------------
    // EMAIL VERIFICATION
    // --------------------------------------------

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    // ---------------------------------------------
    // TWO-FACTOR AUTHENTICATION
    // --------------------------------------------

    twoFactorEnabled: {
      type: Boolean,
      default: true,
    },

    twoFactorMethod: {
      type: String,
      enum: ["email"],
      default: "email",
    },

    twoFactorRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);