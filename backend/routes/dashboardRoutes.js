const express = require("express");

const {
  getDashboard,
  getStaffAlerts,
  getStockHistory,
} = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Staff Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  getDashboard
);

/*
|--------------------------------------------------------------------------
| Staff Alerts
|--------------------------------------------------------------------------
*/

router.get(
  "/alerts",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  getStaffAlerts
);

/*
|--------------------------------------------------------------------------
| Staff Stock History
|--------------------------------------------------------------------------
*/

router.get(
  "/stock-history",
  authMiddleware,
  roleMiddleware("admin", "manager", "staff"),
  getStockHistory
);

module.exports = router;