const express = require("express");

const {
  getStockMovements,
} = require("../controllers/stockMovementController");

const router = express.Router();

router.get(
  "/:inventoryId",
  getStockMovements
);

module.exports = router;