const express = require("express");

const {
  getSales,
  getSaleById,
  getSalesStats,
  createSale,
} = require("../controllers/salesController");

const router = express.Router();

router.get("/", getSales);

router.get("/stats", getSalesStats);

router.get("/:id", getSaleById);

router.post("/", createSale);

module.exports = router;