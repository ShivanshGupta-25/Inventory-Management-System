require("dotenv").config();

const connectDB = require("../config/db");

const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");

const salesData = [
  {
    saleNumber: "SAL-2026-001",
    customerName: "Rahul Sharma",
    customerContact: "9876543210",

    items: [
      {
        sku: "LP-001",
        quantity: 1,
      },
      {
        sku: "MS-002",
        quantity: 2,
      },
    ],

    discount: 500,
    tax: 1250,

    paymentStatus: "Paid",
    status: "Completed",

    createdAt: "2026-09-01T10:15:00.000Z",

    notes: "Laptop purchase with accessories",
  },

  {
    saleNumber: "SAL-2026-002",
    customerName: "Priya Verma",
    customerContact: "9823456712",

    items: [
      {
        sku: "KB-003",
        quantity: 2,
      },
      {
        sku: "HB-005",
        quantity: 2,
      },
    ],

    discount: 200,
    tax: 450,

    paymentStatus: "Paid",
    status: "Completed",

    createdAt: "2026-09-02T12:30:00.000Z",

    notes: "Keyboard and USB hub purchase",
  },

  {
    saleNumber: "SAL-2026-003",
    customerName: "Amit Enterprises",
    customerContact: "9765432109",

    items: [
      {
        sku: "MN-004",
        quantity: 3,
      },
      {
        sku: "SSD-008",
        quantity: 2,
      },
    ],

    discount: 1000,
    tax: 2100,

    paymentStatus: "Partial",
    status: "Completed",

    createdAt: "2026-09-03T09:45:00.000Z",

    notes: "Business hardware order. Partial payment received.",
  },

  {
    saleNumber: "SAL-2026-004",
    customerName: "Neha Patil",
    customerContact: "9812345678",

    items: [
      {
        sku: "WC-006",
        quantity: 2,
      },
      {
        sku: "DL-007",
        quantity: 3,
      },
    ],

    discount: 100,
    tax: 250,

    paymentStatus: "Paid",
    status: "Completed",

    createdAt: "2026-09-04T14:20:00.000Z",

    notes: "Office accessories purchase",
  },

  {
    saleNumber: "SAL-2026-005",
    customerName: "Vikram Desai",
    customerContact: "9898765432",

    items: [
      {
        sku: "LP-001",
        quantity: 2,
      },
    ],

    discount: 1000,
    tax: 700,

    paymentStatus: "Paid",
    status: "Completed",

    createdAt: "2026-09-05T11:10:00.000Z",

    notes: "Two laptop purchase",
  },

  {
    saleNumber: "SAL-2026-006",
    customerName: "TechNova Solutions",
    customerContact: "9753102468",

    items: [
      {
        sku: "SSD-008",
        quantity: 5,
      },
      {
        sku: "HB-005",
        quantity: 5,
      },
      {
        sku: "MS-002",
        quantity: 5,
      },
    ],

    discount: 1500,
    tax: 2800,

    paymentStatus: "Paid",
    status: "Completed",

    createdAt: "2026-09-06T15:40:00.000Z",

    notes: "Bulk accessories and storage order",
  },

  {
    saleNumber: "SAL-2026-007",
    customerName: "Sneha Kulkarni",
    customerContact: "9867543210",

    items: [
      {
        sku: "MN-004",
        quantity: 1,
      },
      {
        sku: "KB-003",
        quantity: 1,
      },
    ],

    discount: 0,
    tax: 500,

    paymentStatus: "Pending",
    status: "Completed",

    createdAt: "2026-09-07T10:25:00.000Z",

    notes: "Payment pending from customer",
  },

  {
    saleNumber: "SAL-2026-008",
    customerName: "Rohan Mehta",
    customerContact: "9801234567",

    items: [
      {
        sku: "WC-006",
        quantity: 1,
      },
      {
        sku: "DL-007",
        quantity: 2,
      },
    ],

    discount: 0,
    tax: 250,

    paymentStatus: "Refunded",
    status: "Returned",

    createdAt: "2026-09-08T13:15:00.000Z",

    notes: "Customer returned the purchased items",
  },

  {
    saleNumber: "SAL-2026-009",
    customerName: "Global IT Services",
    customerContact: "9797979797",

    items: [
      {
        sku: "LP-001",
        quantity: 3,
      },
      {
        sku: "MN-004",
        quantity: 3,
      },
      {
        sku: "SSD-008",
        quantity: 3,
      },
    ],

    discount: 2500,
    tax: 3500,

    paymentStatus: "Partial",
    status: "Completed",

    createdAt: "2026-09-08T16:30:00.000Z",

    notes: "Corporate hardware purchase",
  },

  {
    saleNumber: "SAL-2026-010",
    customerName: "Arjun Joshi",
    customerContact: "9911223344",

    items: [
      {
        sku: "KB-003",
        quantity: 1,
      },
      {
        sku: "MS-002",
        quantity: 1,
      },
      {
        sku: "HB-005",
        quantity: 1,
      },
    ],

    discount: 150,
    tax: 300,

    paymentStatus: "Paid",
    status: "Cancelled",

    createdAt: "2026-09-09T09:20:00.000Z",

    notes: "Sale cancelled by customer",
  },
];

const seedSales = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    const salesToInsert = [];

    for (const sale of salesData) {
      const populatedItems = [];

      for (const item of sale.items) {
        const inventory = await Inventory.findOne({
          sku: item.sku,
        });

        if (!inventory) {
          throw new Error(
            `Inventory not found for SKU: ${item.sku}`
          );
        }

        const sellingPrice = inventory.sellingPrice;

        const totalPrice =
          item.quantity * sellingPrice;

        populatedItems.push({
          inventory: inventory._id,

          productName: inventory.productName,

          sku: inventory.sku,

          quantity: item.quantity,

          sellingPrice,

          totalPrice,
        });
      }

      const subtotal = populatedItems.reduce(
        (total, item) =>
          total + item.totalPrice,
        0
      );

      const totalAmount =
        subtotal -
        sale.discount +
        sale.tax;

      if (totalAmount < 0) {
        throw new Error(
          `Invalid total amount for ${sale.saleNumber}`
        );
      }

      salesToInsert.push({
        saleNumber: sale.saleNumber,

        customerName: sale.customerName,

        customerContact:
          sale.customerContact,

        items: populatedItems,

        subtotal,

        discount: sale.discount,

        tax: sale.tax,

        totalAmount,

        paymentStatus:
          sale.paymentStatus,

        status: sale.status,

        createdAt: new Date(
          sale.createdAt
        ),

        updatedAt: new Date(
          sale.createdAt
        ),
      });
    }

    /*
     * Upsert by sale number.
     * Running the seeder multiple times
     * will not create duplicate sales.
     */

    for (const sale of salesToInsert) {
      await Sale.findOneAndUpdate(
        {
          saleNumber: sale.saleNumber,
        },
        sale,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      `Successfully seeded ${salesToInsert.length} sales`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Sales seeding failed:",
      error
    );

    process.exit(1);
  }
};

seedSales();