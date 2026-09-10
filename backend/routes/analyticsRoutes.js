const express = require("express");

const {
  getAnalyticsOverview,
  getSalesTrend,
  getProductPerformance,
  getCategoryPerformance,
  getInventoryAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Analytics Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/overview",
  getAnalyticsOverview
);

router.get(
  "/sales-trend",
  getSalesTrend
);

router.get(
  "/products",
  getProductPerformance
);

router.get(
  "/categories",
  getCategoryPerformance
);

router.get(
  "/inventory",
  getInventoryAnalytics
);

module.exports = router;