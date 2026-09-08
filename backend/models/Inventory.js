const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reservedStock: {
      type: Number,
      min: 0,
      default: 0,
    },

    minStock: {
      type: Number,
      min: 0,
      default: 10,
    },

    maxStock: {
      type: Number,
      min: 0,
      default: 100,
    },

    warehouse: {
      type: String,
      default: "Main Warehouse",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);