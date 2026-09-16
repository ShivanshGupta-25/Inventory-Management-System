const express = require("express");

const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} = require("../controllers/purchaseOrderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Get purchase orders / purchase requests
router.get(
  "/",
  authMiddleware,
  getPurchaseOrders
);

// Get a single purchase order / purchase request
router.get(
  "/:id",
  authMiddleware,
  getPurchaseOrderById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  createPurchaseOrder
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  updatePurchaseOrder
);

router.post(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  confirmPurchaseOrder
);

router.post(
  "/:id/receive",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  receivePurchaseOrder
);

router.post(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware(
    "admin",
    "manager",
    "staff"
  ),
  cancelPurchaseOrder
);

module.exports = router;