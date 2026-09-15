const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");
const User = require("../models/User");

dotenv.config();

/* =====================================================
   INVENTORY SEED DATA
===================================================== */

const inventoryData = [
  {
    productName: "Laptop Pro 15",
    sku: "LP-001",
    category: "Electronics",
    brand: "TechPro",
    unit: "pcs",
    purchasePrice: 45000,
    sellingPrice: 55000,
    currentStock: 45,
    reservedStock: 5,
    minStock: 10,
    maxStock: 100,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "Wireless Mouse",
    sku: "MS-002",
    category: "Accessories",
    brand: "Logitech",
    unit: "pcs",
    purchasePrice: 500,
    sellingPrice: 799,
    currentStock: 8,
    reservedStock: 2,
    minStock: 10,
    maxStock: 80,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "Mechanical Keyboard",
    sku: "KB-003",
    category: "Accessories",
    brand: "KeyMaster",
    unit: "pcs",
    purchasePrice: 1800,
    sellingPrice: 2999,
    currentStock: 0,
    reservedStock: 0,
    minStock: 10,
    maxStock: 60,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "4K Monitor",
    sku: "MN-004",
    category: "Electronics",
    brand: "ViewMax",
    unit: "pcs",
    purchasePrice: 22000,
    sellingPrice: 28999,
    currentStock: 150,
    reservedStock: 10,
    minStock: 20,
    maxStock: 100,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "USB-C Hub",
    sku: "HB-005",
    category: "Accessories",
    brand: "ConnectX",
    unit: "pcs",
    purchasePrice: 900,
    sellingPrice: 1499,
    currentStock: 35,
    reservedStock: 5,
    minStock: 10,
    maxStock: 80,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "HD Webcam",
    sku: "WC-006",
    category: "Electronics",
    brand: "VisionCam",
    unit: "pcs",
    purchasePrice: 1500,
    sellingPrice: 2499,
    currentStock: 6,
    reservedStock: 1,
    minStock: 10,
    maxStock: 50,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "LED Desk Lamp",
    sku: "DL-007",
    category: "Office",
    brand: "BrightLite",
    unit: "pcs",
    purchasePrice: 700,
    sellingPrice: 1199,
    currentStock: 75,
    reservedStock: 5,
    minStock: 10,
    maxStock: 100,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "External SSD 1TB",
    sku: "SSD-008",
    category: "Storage",
    brand: "DataDrive",
    unit: "pcs",
    purchasePrice: 5500,
    sellingPrice: 7499,
    currentStock: 12,
    reservedStock: 2,
    minStock: 10,
    maxStock: 60,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "Wireless Headphones",
    sku: "HP-009",
    category: "Audio",
    brand: "SoundMax",
    unit: "pcs",
    purchasePrice: 2200,
    sellingPrice: 3499,
    currentStock: 28,
    reservedStock: 3,
    minStock: 10,
    maxStock: 70,
    warehouse: "Main Warehouse",
    status: "Active",
  },

  {
    productName: "USB-C Charging Cable",
    sku: "CB-010",
    category: "Accessories",
    brand: "ConnectX",
    unit: "pcs",
    purchasePrice: 250,
    sellingPrice: 499,
    currentStock: 18,
    reservedStock: 2,
    minStock: 10,
    maxStock: 100,
    warehouse: "Main Warehouse",
    status: "Active",
  },
];

/* =====================================================
   FIND USER FOR STOCK MOVEMENTS
===================================================== */

const getPerformer = async () => {
  /*
    StockMovement.performedBy is required.

    Prefer a staff user because these records will
    be used for testing Staff Stock Operations.

    Fallback:
      staff → manager → admin
  */

  const performer =
    await User.findOne({
      role: "staff",
    }) ||
    await User.findOne({
      role: "manager",
    }) ||
    await User.findOne({
      role: "admin",
    });

  if (!performer) {
    throw new Error(
      "No staff, manager, or admin user found. Please seed/create a user first."
    );
  }

  console.log(
    `Using ${performer.role} "${performer.name || performer.email}" as stock movement performer`
  );

  return performer;
};

/* =====================================================
   SEED DATABASE
===================================================== */

const seedDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    /* =================================================
       FIND PERFORMER BEFORE DELETING DATA
    ================================================= */

    const performer =
      await getPerformer();

    /* =================================================
       CLEAR OLD INVENTORY + MOVEMENTS
    ================================================= */

    await StockMovement.deleteMany({});
    await Inventory.deleteMany({});

    console.log(
      "Existing inventory and stock movements cleared"
    );

    /* =================================================
       INSERT INVENTORY
    ================================================= */

    const inventory =
      await Inventory.insertMany(
        inventoryData
      );

    console.log(
      `${inventory.length} inventory items inserted`
    );

    /* =================================================
       CREATE INITIAL STOCK MOVEMENTS
    ================================================= */

    /*
      Only products with initial stock > 0 get
      an initial IN movement.

      A product with 0 stock does not need a movement
      because no stock actually entered the inventory.
    */

    const initialMovements =
      inventory
        .filter(
          (item) =>
            Number(item.currentStock) > 0
        )
        .map((item) => ({
          inventory: item._id,

          performedBy:
            performer._id,

          type: "IN",

          quantity:
            item.currentStock,

          previousStock: 0,

          newStock:
            item.currentStock,

          reason: "Initial Stock",

          referenceType: "MANUAL",
        }));

    if (initialMovements.length > 0) {
      await StockMovement.insertMany(
        initialMovements
      );
    }

    console.log(
      `${initialMovements.length} initial stock movements inserted`
    );

    /* =================================================
       SUMMARY
    ================================================= */

    const totalStock =
      inventory.reduce(
        (sum, item) =>
          sum +
          Number(
            item.currentStock || 0
          ),
        0
      );

    const lowStock =
      inventory.filter(
        (item) =>
          item.currentStock > 0 &&
          item.currentStock <=
            item.minStock
      ).length;

    const outOfStock =
      inventory.filter(
        (item) =>
          item.currentStock <= 0
      ).length;

    const overstock =
      inventory.filter(
        (item) =>
          item.maxStock &&
          item.currentStock >=
            item.maxStock
      ).length;

    console.log("");
    console.log(
      "======================================"
    );
    console.log(
      "       DATABASE SEED COMPLETE"
    );
    console.log(
      "======================================"
    );
    console.log(
      `Products:      ${inventory.length}`
    );
    console.log(
      `Total Stock:   ${totalStock}`
    );
    console.log(
      `Low Stock:     ${lowStock}`
    );
    console.log(
      `Out of Stock:  ${outOfStock}`
    );
    console.log(
      `Overstock:     ${overstock}`
    );
    console.log(
      `Movements:     ${initialMovements.length}`
    );
    console.log(
      `Performed By:  ${performer.name || performer.email}`
    );
    console.log(
      "======================================"
    );
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error(
      "Seed error:",
      error.message
    );

    process.exit(1);
  }
};

seedDatabase();