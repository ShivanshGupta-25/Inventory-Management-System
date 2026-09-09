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

const router = express.Router();

router.get("/", getPurchaseOrders);

router.get("/:id", getPurchaseOrderById);

router.post("/", createPurchaseOrder);

router.put("/:id", updatePurchaseOrder);

router.post("/:id/confirm", confirmPurchaseOrder);

router.post("/:id/receive", receivePurchaseOrder);

router.post("/:id/cancel", cancelPurchaseOrder);

module.exports = router;