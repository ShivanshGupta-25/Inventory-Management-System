require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

/*
|--------------------------------------------------------------------------
| Sales Seed Data
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Products are referenced using SKU.
| No duplicate inventory records are created.
|
| The seeder will:
| 1. Find Inventory by SKU
| 2. Calculate sale totals
| 3. Create Sale records
| 4. Deduct sold quantity from Inventory
| 5. Create StockMovement records
| 6. Avoid duplicate sales when run again
|--------------------------------------------------------------------------
*/

const salesData = [
  {
    saleNumber: "SAL-2026-001",

    customerName: "Rahul Sharma",

    customerContact: "9876543210",

    items: [
      {
        sku: "LP-001",
        quantity: 2,
      },
      {
        sku: "MS-002",
        quantity: 3,
      },
    ],

    discount: 1000,

    tax: 2000,

    paidAmount: 112000,

    paymentMethod: "UPI",

    notes:
      "Laptop and wireless mouse purchase.",
  },

  {
    saleNumber: "SAL-2026-002",

    customerName: "Priya Enterprises",

    customerContact: "9823456789",

    items: [
      {
        sku: "MN-004",
        quantity: 3,
      },
      {
        sku: "HB-005",
        quantity: 2,
      },
    ],

    discount: 500,

    tax: 1000,

    paidAmount: 87500,

    paymentMethod: "Card",

    notes:
      "Monitor and USB-C hub order for office setup.",
  },

  {
    saleNumber: "SAL-2026-003",

    customerName: "Amit Verma",

    customerContact: "9812345678",

    items: [
      {
        sku: "DL-007",
        quantity: 4,
      },
      {
        sku: "WC-006",
        quantity: 2,
      },
    ],

    discount: 200,

    tax: 500,

    paidAmount: 0,

    paymentMethod: "Cash",

    notes:
      "Office accessories sale. Payment pending.",
  },

  {
    saleNumber: "SAL-2026-004",

    customerName: "TechNova Solutions",

    customerContact: "9898765432",

    items: [
      {
        sku: "SSD-008",
        quantity: 2,
      },
      {
        sku: "HB-005",
        quantity: 3,
      },
    ],

    discount: 300,

    tax: 700,

    paidAmount: 10000,

    paymentMethod: "Bank Transfer",

    notes:
      "Partial payment received. Remaining amount due.",
  },

  {
    saleNumber: "SAL-2026-005",

    customerName: "Sneha Kulkarni",

    customerContact: "9765432109",

    items: [
      {
        sku: "MS-002",
        quantity: 2,
      },
      {
        sku: "DL-007",
        quantity: 3,
      },
    ],

    discount: 100,

    tax: 250,

    paidAmount: 0,

    paymentMethod: "Cash",

    notes:
      "Walk-in customer sale.",
  },

  {
    saleNumber: "SAL-2026-006",

    customerName: "Global IT Services",

    customerContact: "9753102468",

    items: [
      {
        sku: "LP-001",
        quantity: 1,
      },
      {
        sku: "MN-004",
        quantity: 2,
      },
      {
        sku: "SSD-008",
        quantity: 1,
      },
    ],

    discount: 2500,

    tax: 3500,

    paidAmount: 0,

    paymentMethod: "Card",

    notes:
      "Corporate hardware order. Payment pending.",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const calculatePaymentStatus = (
  paidAmount,
  totalAmount
) => {
  if (paidAmount <= 0) {
    return "Pending";
  }

  if (paidAmount >= totalAmount) {
    return "Paid";
  }

  return "Partial";
};

/*
|--------------------------------------------------------------------------
| Seed Sales
|--------------------------------------------------------------------------
*/

const seedSales = async () => {
  try {
    await connectDB();

    console.log(
      "Connected to MongoDB"
    );

    /*
     * We process every sale individually.
     */
    for (const saleData of salesData) {
      /*
       * Check whether the sale already exists.
       *
       * This makes the seeder safe to run repeatedly.
       */
      const existingSale =
        await Sale.findOne({
          saleNumber:
            saleData.saleNumber,
        });

      if (existingSale) {
        console.log(
          `Sale ${saleData.saleNumber} already exists - skipped`
        );

        continue;
      }

      /*
       * Build sale items from Inventory.
       */
      const saleItems = [];

      let subtotal = 0;

      /*
       * Track quantities by inventory ID.
       *
       * This prevents duplicate stock deduction
       * when the same SKU appears more than once.
       */
      const inventoryQuantities =
        new Map();

      /*
       * ----------------------------------------------------
       * Find Inventory Products
       * ----------------------------------------------------
       */

      for (const item of saleData.items) {
        const inventory =
          await Inventory.findOne({
            sku: item.sku,
          });

        if (!inventory) {
          throw new Error(
            `Inventory not found for SKU: ${item.sku}`
          );
        }

        if (
          inventory.status === "Inactive"
        ) {
          throw new Error(
            `Inventory item ${item.sku} is inactive`
          );
        }

        const quantity =
          Number(item.quantity);

        if (
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          throw new Error(
            `Invalid quantity for SKU: ${item.sku}`
          );
        }

        /*
         * Merge duplicate SKU entries.
         */
        const inventoryId =
          inventory._id.toString();

        const existingQuantity =
          inventoryQuantities.get(
            inventoryId
          ) || 0;

        inventoryQuantities.set(
          inventoryId,
          existingQuantity + quantity
        );
      }

      /*
       * ----------------------------------------------------
       * Validate Stock
       * ----------------------------------------------------
       */

      for (const [
        inventoryId,
        quantity,
      ] of inventoryQuantities) {
        const inventory =
          await Inventory.findById(
            inventoryId
          );

        if (!inventory) {
          throw new Error(
            `Inventory ${inventoryId} not found`
          );
        }

        const availableStock =
          inventory.currentStock -
          inventory.reservedStock;

        if (
          quantity >
          availableStock
        ) {
          throw new Error(
            `Insufficient stock for ${inventory.productName}. Available: ${availableStock}, Required: ${quantity}`
          );
        }
      }

      /*
       * ----------------------------------------------------
       * Build Sale Items
       * ----------------------------------------------------
       */

      for (const [
        inventoryId,
        quantity,
      ] of inventoryQuantities) {
        const inventory =
          await Inventory.findById(
            inventoryId
          );

        const totalPrice =
          inventory.sellingPrice *
          quantity;

        subtotal += totalPrice;

        saleItems.push({
          inventory:
            inventory._id,

          productName:
            inventory.productName,

          sku:
            inventory.sku,

          quantity,

          sellingPrice:
            inventory.sellingPrice,

          totalPrice,
        });
      }

      /*
       * ----------------------------------------------------
       * Calculate Sale Amounts
       * ----------------------------------------------------
       */

      const discount =
        Number(
          saleData.discount || 0
        );

      const tax =
        Number(
          saleData.tax || 0
        );

      const paidAmount =
        Number(
          saleData.paidAmount || 0
        );

      if (discount > subtotal) {
        throw new Error(
          `Discount for ${saleData.saleNumber} cannot exceed subtotal`
        );
      }

      const totalAmount =
        subtotal -
        discount +
        tax;

      if (paidAmount > totalAmount) {
        throw new Error(
          `Paid amount for ${saleData.saleNumber} cannot exceed total amount`
        );
      }

      const paymentStatus =
        calculatePaymentStatus(
          paidAmount,
          totalAmount
        );

      /*
       * ----------------------------------------------------
       * Create Sale
       * ----------------------------------------------------
       */

      const sale =
        await Sale.create({
          saleNumber:
            saleData.saleNumber,

          customerName:
            saleData.customerName ||
            "Walk-in Customer",

          customerContact:
            saleData.customerContact ||
            "",

          items: saleItems,

          subtotal,

          discount,

          tax,

          totalAmount,

          paidAmount,

          refundedAmount: 0,

          paymentMethod:
            saleData.paymentMethod ||
            "Cash",

          paymentStatus,

          status: "Completed",

          notes:
            saleData.notes || "",

          activityLog: [
            {
              action: "CREATED",

              message:
                `Sale ${saleData.saleNumber} created during database seeding`,

              status:
                "Completed",

              paymentStatus,

              paidAmount,
            },
          ],
        });

      /*
       * ----------------------------------------------------
       * Update Inventory
       * ----------------------------------------------------
       */

      for (const [
        inventoryId,
        quantity,
      ] of inventoryQuantities) {
        const inventory =
          await Inventory.findById(
            inventoryId
          );

        if (!inventory) {
          throw new Error(
            `Inventory ${inventoryId} not found while updating stock`
          );
        }

        const stockBefore =
          inventory.currentStock;

        const stockAfter =
          stockBefore -
          quantity;

        if (stockAfter < 0) {
          throw new Error(
            `Stock cannot become negative for ${inventory.productName}`
          );
        }

        inventory.currentStock =
          stockAfter;

        await inventory.save();

        /*
         * ------------------------------------------------
         * Create Stock Movement
         * ------------------------------------------------
         */

        await StockMovement.create({
          inventory:
            inventory._id,

          type: "OUT",

          quantity,

          previousStock:
            stockBefore,

          newStock:
            stockAfter,

          reason:
            `Sale ${sale.saleNumber}`,

          referenceType:
            "SALE",

          referenceId:
            sale._id.toString(),
        });
      }

      console.log(
        `Sale ${sale.saleNumber} created successfully - ${paymentStatus}`
      );
    }

    console.log(
      "\nSales database seeding completed successfully."
    );

    /*
     * Print final sales count.
     */
    const totalSales =
      await Sale.countDocuments();

    console.log(
      `Total sales in database: ${totalSales}`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\nSales seeding failed:"
    );

    console.error(error);

    process.exit(1);
  }
};

seedSales();