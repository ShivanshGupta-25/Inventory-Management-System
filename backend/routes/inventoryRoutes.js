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

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Inventory Routes
|--------------------------------------------------------------------------
*/

// All inventory viewing requires authentication
router.get(
  "/",
  authMiddleware,
  getInventory
);

router.get(
  "/stats",
  authMiddleware,
  getInventoryStats
);

router.get(
  "/:id",
  authMiddleware,
  getInventoryById
);

// Only admin and manager can create products
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  createInventory
);

// Only admin and manager can edit products
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  updateInventory
);

// Only admin and manager can delete products
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  deleteInventory
);

// Staff + manager + admin can perform stock operations
router.post(
  "/:id/adjust",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  adjustStock
);

module.exports = router;