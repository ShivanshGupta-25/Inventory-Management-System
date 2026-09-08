const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "IN",
        "OUT",
        "ADJUSTMENT",
        "RETURN",
        "DAMAGE",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },

    newStock: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    referenceType: {
      type: String,
      enum: [
        "PURCHASE",
        "SALE",
        "MANUAL",
        "RETURN",
        "DAMAGE",
      ],
      default: "MANUAL",
    },

    referenceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StockMovement",
  stockMovementSchema
);