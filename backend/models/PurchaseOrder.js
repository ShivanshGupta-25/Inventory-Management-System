
const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestType: {
      type: String,
      enum: ["Purchase Order", "Purchase Request"],
      default: "Purchase Order",
    },

    supplier: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },
    },

    items: [
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
          trim: true,
          uppercase: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        receivedQuantity: {
          type: Number,
          default: 0,
          min: 0,
        },

        unitPrice: {
          type: Number,
          default: 0,
          min: 0,
        },

        totalPrice: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedDate: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Approved",
        "Rejected",
        "Partially Received",
        "Received",
        "Cancelled",
      ],
      default: "Draft",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
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