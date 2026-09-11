const Inventory = require("../models/Inventory");
const StockMovement = require("../models/StockMovement");

const calculateStockStatus = (
  currentStock,
  minStock,
  maxStock
) => {
  if (currentStock <= 0) {
    return "Out of Stock";
  }

  if (currentStock <= minStock) {
    return "Low Stock";
  }

  if (maxStock && currentStock >= maxStock) {
    return "Overstock";
  }

  return "In Stock";
};

// GET ALL INVENTORY
const getInventory = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
    } = req.query;

    const query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        {
          productName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          sku: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const inventory = await Inventory.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate stock information
    let formattedInventory = inventory.map((item) => ({
      ...item,

      availableStock: Math.max(
        item.currentStock - item.reservedStock,
        0
      ),

      stockStatus: calculateStockStatus(
        item.currentStock,
        item.minStock,
        item.maxStock
      ),
    }));

    // Status filter
    if (status) {
      formattedInventory = formattedInventory.filter(
        (item) => item.stockStatus === status
      );
    }

    res.status(200).json({
      success: true,
      count: formattedInventory.length,
      data: formattedInventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// GET INVENTORY STATS
const getInventoryStats = async (req, res) => {
  try {
    const inventory = await Inventory.find().lean();

    const totalProducts = inventory.length;

    const totalStock = inventory.reduce(
      (total, item) => total + item.currentStock,
      0
    );

    const totalAvailableStock = inventory.reduce(
      (total, item) =>
        total +
        Math.max(
          item.currentStock - item.reservedStock,
          0
        ),
      0
    );

    const lowStock = inventory.filter(
      (item) =>
        item.currentStock > 0 &&
        item.currentStock <= item.minStock
    ).length;

    const outOfStock = inventory.filter(
      (item) => item.currentStock <= 0
    ).length;

    const overstock = inventory.filter(
      (item) =>
        item.maxStock &&
        item.currentStock >= item.maxStock
    ).length;

    const inStock = inventory.filter(
      (item) =>
        item.currentStock > item.minStock &&
        item.currentStock < item.maxStock
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        totalAvailableStock,
        lowStock,
        outOfStock,
        overstock,
        inStock,
      },
    });
  } catch (error) {
    console.error("Get inventory stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics",
    });
  }
};

// GET SINGLE INVENTORY
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(
      req.params.id
    ).lean();

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const data = {
      ...inventory,

      availableStock: Math.max(
        inventory.currentStock -
          inventory.reservedStock,
        0
      ),

      stockStatus: calculateStockStatus(
        inventory.currentStock,
        inventory.minStock,
        inventory.maxStock
      ),
    };

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get inventory item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
    });
  }
};

// CREATE INVENTORY ITEM
const createInventory = async (req, res) => {
  try {
    const {
      productName,
      sku,
      category,
      brand,
      unit,
      purchasePrice,
      sellingPrice,
      currentStock,
      minStock,
      maxStock,
      warehouse,
    } = req.body;

    // Required fields
    if (
      !productName ||
      !sku ||
      !category ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, SKU, category, purchase price and selling price are required",
      });
    }

    // Validate numeric values
    const numericPurchasePrice = Number(purchasePrice);
    const numericSellingPrice = Number(sellingPrice);
    const numericStock = Number(currentStock || 0);
    const numericMinStock = Number(minStock || 10);
    const numericMaxStock = Number(maxStock || 100);

    if (
      Number.isNaN(numericPurchasePrice) ||
      numericPurchasePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase price",
      });
    }

    if (
      Number.isNaN(numericSellingPrice) ||
      numericSellingPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid selling price",
      });
    }

    if (
      Number.isNaN(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Initial stock cannot be negative",
      });
    }

    if (
      numericMaxStock < numericMinStock
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum stock must be greater than minimum stock",
      });
    }

    // Normalize SKU
    const normalizedSKU = sku.trim().toUpperCase();

    // Check duplicate SKU
    const existingSKU = await Inventory.findOne({
      sku: normalizedSKU,
    });

    if (existingSKU) {
      return res.status(409).json({
        success: false,
        message: `SKU "${normalizedSKU}" already exists`,
      });
    }

    // Create inventory
    const inventory = await Inventory.create({
      productName: productName.trim(),
      sku: normalizedSKU,
      category: category.trim(),
      brand: brand?.trim() || "",
      unit: unit || "pcs",
      purchasePrice: numericPurchasePrice,
      sellingPrice: numericSellingPrice,
      currentStock: numericStock,
      reservedStock: 0,
      minStock: numericMinStock,
      maxStock: numericMaxStock,
      warehouse:
        warehouse?.trim() || "Main Warehouse",
    });

    // Create initial stock movement
    if (numericStock > 0) {
      await StockMovement.create({
        inventory: inventory._id,
        type: "ADJUSTMENT",
        quantity: numericStock,
        previousStock: 0,
        newStock: numericStock,
        reason: "Initial stock while creating product",
        referenceType: "MANUAL",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    // Handle duplicate SKU race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// UPDATE INVENTORY INFORMATION
const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(
      req.params.id
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const allowedFields = [
      "productName",
      "sku",
      "category",
      "brand",
      "unit",
      "purchasePrice",
      "sellingPrice",
      "minStock",
      "maxStock",
      "warehouse",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        inventory[field] = req.body[field];
      }
    });

    await inventory.save();

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
    });
  }
};

// DELETE INVENTORY
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(
      req.params.id
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    await StockMovement.deleteMany({
      inventory: inventory._id,
    });

    await inventory.deleteOne();

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
};

// ADJUST STOCK
const adjustStock = async (req, res) => {
  try {
    const { type, quantity, reason } = req.body;

    // 1. Validate stock movement type
    if (!["IN", "OUT", "ADJUSTMENT"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock movement type",
      });
    }

    // 2. STAFF RESTRICTION
    // Staff can only perform IN and OUT
    if (
      req.user.role === "staff" &&
      type === "ADJUSTMENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Staff cannot perform stock adjustments",
      });
    }

    // 3. Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // 4. Find inventory
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // 5. Store previous stock
    const previousStock = inventory.currentStock;

    // 6. Calculate new stock
    let newStock;

    if (type === "IN") {
      newStock = previousStock + quantity;
    } else if (type === "OUT") {
      newStock = previousStock - quantity;
    } else if (type === "ADJUSTMENT") {
      newStock = quantity;
    }

    // 7. Prevent negative stock
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // 8. Update inventory
    inventory.currentStock = newStock;

    await inventory.save();

    // 9. Create stock movement
    const movement = await StockMovement.create({
      inventory: inventory._id,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      referenceType: "MANUAL",
      performedBy: req.user.userId,
    });

    // 10. Response
    return res.status(200).json({
      success: true,
      message: `Stock ${type} operation completed successfully`,
      data: {
        inventory,
        movement,
      },
    });
  } catch (error) {
    console.error("Adjust stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to adjust stock",
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  getInventoryStats,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  adjustStock,
};