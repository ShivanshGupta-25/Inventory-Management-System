const express = require("express");

const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getManagerPurchaseRequests,
  approvePurchaseRequest,
  rejectPurchaseRequest,
  createPurchaseOrderFromRequest,
} = require("../controllers/purchaseOrderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 * ==========================================
 * MANAGER PURCHASE REQUEST ROUTES
 * ==========================================
 */

router.get(
  "/manager/requests",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  getManagerPurchaseRequests
);

router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  approvePurchaseRequest
);

router.post(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  rejectPurchaseRequest
);

router.post(
  "/:id/create-purchase-order",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  createPurchaseOrderFromRequest
);

/*
 * ==========================================
 * GENERAL PURCHASE ORDER ROUTES
 * ==========================================
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

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  createPurchaseOrder
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  updatePurchaseOrder
);

router.post(
  "/:id/confirm",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  confirmPurchaseOrder
);

router.post(
  "/:id/receive",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  receivePurchaseOrder
);

router.post(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  cancelPurchaseOrder
);

module.exports = router;