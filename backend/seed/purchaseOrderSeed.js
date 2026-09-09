require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Inventory = require("../models/Inventory");
const PurchaseOrder = require("../models/PurchaseOrder");

const purchaseOrders = [
  {
    orderNumber: "PO-2026-001",

    supplier: {
      name: "Tech Supplies Pvt Ltd",
      email: "supplier@techsupplies.com",
      phone: "9876543211",
    },

    items: [
      {
        sku: "LP-001",
        quantity: 20,
        receivedQuantity: 20,
        unitPrice: 3200,
      },
      {
        sku: "MS-002",
        quantity: 50,
        receivedQuantity: 50,
        unitPrice: 680,
      },
    ],

    tax: 3600,

    expectedDate: "2026-08-20",

    status: "Received",

    notes:
      "Laptop and mouse stock replenishment order.",
  },

  {
    orderNumber: "PO-2026-002",

    supplier: {
      name: "Digital World India",
      email: "orders@digitalworld.in",
      phone: "9823456710",
    },

    items: [
      {
        sku: "KB-003",
        quantity: 30,
        receivedQuantity: 15,
        unitPrice: 1250,
      },
      {
        sku: "MN-004",
        quantity: 15,
        receivedQuantity: 10,
        unitPrice: 2650,
      },
    ],

    tax: 3750,

    expectedDate: "2026-09-15",

    status: "Partially Received",

    notes:
      "Partial shipment received. Remaining items expected soon.",
  },

  {
    orderNumber: "PO-2026-003",

    supplier: {
      name: "Office Hub Solutions",
      email: "sales@officehub.com",
      phone: "9812345678",
    },

    items: [
      {
        sku: "DL-007",
        quantity: 50,
        receivedQuantity: 0,
        unitPrice: 420,
      },
      {
        sku: "WC-006",
        quantity: 25,
        receivedQuantity: 0,
        unitPrice: 1100,
      },
    ],

    tax: 2100,

    expectedDate: "2026-09-20",

    status: "Pending",

    notes:
      "Office equipment order awaiting supplier confirmation.",
  },

  {
    orderNumber: "PO-2026-004",

    supplier: {
      name: "Smart Electronics Ltd",
      email: "purchase@smartelectronics.com",
      phone: "9898765432",
    },

    items: [
      {
        sku: "MN-004",
        quantity: 30,
        receivedQuantity: 0,
        unitPrice: 2800,
      },
      {
        sku: "SSD-008",
        quantity: 20,
        receivedQuantity: 0,
        unitPrice: 3400,
      },
    ],

    tax: 8400,

    expectedDate: "2026-10-05",

    status: "Draft",

    notes:
      "Draft order for upcoming hardware expansion.",
  },

  {
    orderNumber: "PO-2026-005",

    supplier: {
      name: "Prime IT Distributors",
      email: "orders@primeit.com",
      phone: "9765432109",
    },

    items: [
      {
        sku: "HB-005",
        quantity: 40,
        receivedQuantity: 40,
        unitPrice: 750,
      },
      {
        sku: "SSD-008",
        quantity: 10,
        receivedQuantity: 10,
        unitPrice: 4200,
      },
    ],

    tax: 4200,

    expectedDate: "2026-08-28",

    status: "Received",

    notes:
      "USB hubs and SSDs received successfully.",
  },

  {
    orderNumber: "PO-2026-006",

    supplier: {
      name: "Metro Office Supplies",
      email: "contact@metrooffice.com",
      phone: "9753102468",
    },

    items: [
      {
        sku: "DL-007",
        quantity: 30,
        receivedQuantity: 0,
        unitPrice: 400,
      },
    ],

    tax: 1200,

    expectedDate: "2026-08-10",

    status: "Cancelled",

    notes:
      "Order cancelled due to supplier pricing changes.",
  },
];

const seedPurchaseOrders = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    /*
     * Build Purchase Order items from existing Inventory.
     * This avoids creating duplicate product records.
     */

    const ordersToInsert = [];

    for (const order of purchaseOrders) {
      const populatedItems = [];

      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          sku: item.sku,
        });

        if (!inventory) {
          throw new Error(
            `Inventory not found for SKU: ${item.sku}`
          );
        }

        const totalPrice =
          item.quantity * item.unitPrice;

        populatedItems.push({
          inventory: inventory._id,

          productName: inventory.productName,

          sku: inventory.sku,

          quantity: item.quantity,

          receivedQuantity:
            item.receivedQuantity,

          unitPrice: item.unitPrice,

          totalPrice,
        });
      }

      const subtotal = populatedItems.reduce(
        (total, item) =>
          total + item.totalPrice,
        0
      );

      const totalAmount =
        subtotal + order.tax;

      ordersToInsert.push({
        orderNumber: order.orderNumber,

        supplier: order.supplier,

        items: populatedItems,

        subtotal,

        tax: order.tax,

        totalAmount,

        expectedDate:
          order.expectedDate,

        status: order.status,

        notes: order.notes,
      });
    }

    /*
     * Upsert orders.
     * Running the seeder multiple times will not
     * create duplicate purchase orders.
     */

    for (const order of ordersToInsert) {
      await PurchaseOrder.findOneAndUpdate(
        {
          orderNumber: order.orderNumber,
        },
        order,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      `Successfully seeded ${ordersToInsert.length} purchase orders`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Purchase order seeding failed:",
      error
    );

    process.exit(1);
  }
};

seedPurchaseOrders();