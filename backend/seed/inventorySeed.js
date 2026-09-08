const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

dotenv.config();

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
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await StockMovement.deleteMany({});
    await Inventory.deleteMany({});

    const inventory =
      await Inventory.insertMany(inventoryData);

    console.log(
      `${inventory.length} inventory items inserted`
    );

    const initialMovements =
      inventory.map((item) => ({
        inventory: item._id,
        type: "ADJUSTMENT",
        quantity: item.currentStock,
        previousStock: 0,
        newStock: item.currentStock,
        reason: "Initial inventory setup",
        referenceType: "MANUAL",
      }));

    await StockMovement.insertMany(
      initialMovements
    );

    console.log(
      `${initialMovements.length} stock movements inserted`
    );

    console.log("Database seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();