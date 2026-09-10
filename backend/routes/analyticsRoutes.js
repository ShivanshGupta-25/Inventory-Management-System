const express = require("express");

const {
  getAnalyticsOverview,
  getSalesTrend,
  getProductPerformance,
  getCategoryPerformance,
  getInventoryAnalytics,
  getDemandHistory,
  getDemandFeatures,
  getDemandForecast,
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

router.get(
  "/demand-history",
  getDemandHistory
);

router.get(
  "/demand-features",
  getDemandFeatures
);

router.get(
  "/demand-forecast",
  getDemandForecast
);

module.exports = router;