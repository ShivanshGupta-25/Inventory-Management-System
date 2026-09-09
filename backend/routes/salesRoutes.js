const express = require("express");

const {
  getSales,
  getSaleById,
  getSalesStats,
  getSaleMovements,
  createSale,
  updateSale,
  updateSalePayment,
  cancelSale,
  returnSale,
} = require("../controllers/salesController");

const router = express.Router();

router.get("/", getSales);

router.get("/stats", getSalesStats);

router.post("/", createSale);

router.put("/:id", updateSale);

router.patch("/:id/payment", updateSalePayment);

router.patch("/:id/cancel", cancelSale);

router.patch("/:id/return", returnSale);

router.get("/:id/movements", getSaleMovements);

router.get("/:id", getSaleById);

module.exports = router;