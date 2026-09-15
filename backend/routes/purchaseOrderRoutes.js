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

/*
 * All purchase-order routes require authentication.
 */
router.get(
  "/",
  authMiddleware,
  getPurchaseOrders
);

router.get(
  "/:id",
  authMiddleware,
  getPurchaseOrderById
);

/*
 * Creating/editing/deleting PO operations
 * are restricted to admin and manager.
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  createPurchaseOrder
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  updatePurchaseOrder
);

router.post(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  confirmPurchaseOrder
);

/*
 * Receiving stock can be performed by
 * admin, manager, or staff.
 */
router.post(
  "/:id/receive",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  receivePurchaseOrder
);

/*
 * Cancellation restricted to admin/manager.
 */
router.post(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  cancelPurchaseOrder
);

module.exports = router;