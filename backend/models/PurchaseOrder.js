const mongoose = require("mongoose");

const purchaseOrderItemSchema =
  new mongoose.Schema(
    {
      inventory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
      },

      productName: {
        type: String,
        required: true,
        trim: true,
      },

      sku: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      receivedQuantity: {
        type: Number,
        min: 0,
        default: 0,
      },

      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      totalPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: true,
    }
  );

const purchaseOrderSchema =
  new mongoose.Schema(
    {
      orderNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
      },

      supplier: {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        email: {
          type: String,
          default: "",
          trim: true,
        },

        phone: {
          type: String,
          default: "",
          trim: true,
        },
      },

      items: {
        type: [purchaseOrderItemSchema],
        validate: {
          validator: (items) =>
            items.length > 0,
          message:
            "Purchase order must contain at least one item",
        },
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      tax: {
        type: Number,
        min: 0,
        default: 0,
      },

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      expectedDate: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "Draft",
          "Pending",
          "Partially Received",
          "Received",
          "Cancelled",
        ],
        default: "Draft",
      },

      notes: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "PurchaseOrder",
  purchaseOrderSchema
);