const StockMovement = require("../models/StockMovement");

const getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find({
      inventory: req.params.inventoryId,
    })
      .populate(
        "inventory",
        "productName sku category"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    console.error(
      "Get stock movements error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movements",
    });
  }
};

module.exports = {
  getStockMovements,
};