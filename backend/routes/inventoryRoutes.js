const express = require("express");

const {
  getInventory,
  getInventoryStats,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  adjustStock,
} = require("../controllers/inventoryController");

const router = express.Router();

router.get("/", getInventory);

router.get("/stats", getInventoryStats);

router.get("/:id", getInventoryById);

router.post("/", createInventory);

router.put("/:id", updateInventory);

router.delete("/:id", deleteInventory);

router.post("/:id/adjust", adjustStock);

module.exports = router;