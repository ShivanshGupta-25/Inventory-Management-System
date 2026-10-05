const express = require("express");

const {
  dashboard,
  users,
  userDetails,
  create,
  update,
  updateRole,
  updateStatus,
  remove,
  auditLogs,
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// --------------------------------------------------
// ADMIN ACCESS PROTECTION
// --------------------------------------------------
//
// Every route in this file requires:
// 1. Valid JWT
// 2. Admin role
//

router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

router.get(
  "/dashboard",
  dashboard
);

// --------------------------------------------------
// USER MANAGEMENT
// --------------------------------------------------

// Get users
router.get(
  "/users",
  users
);

// Get single user
router.get(
  "/users/:id",
  userDetails
);

// Create manager/staff
router.post(
  "/users",
  create
);

// Update name/email
router.patch(
  "/users/:id",
  update
);

// Change role
router.patch(
  "/users/:id/role",
  updateRole
);

// Enable/disable account
router.patch(
  "/users/:id/status",
  updateStatus
);

// Delete user
router.delete(
  "/users/:id",
  remove
);

// --------------------------------------------------
// AUDIT LOGS
// --------------------------------------------------

router.get(
  "/audit-logs",
  auditLogs
);

// --------------------------------------------------
// ADMIN PROFILE
// --------------------------------------------------

router.get(
  "/profile",
  getAdminProfile
);

router.patch(
  "/profile",
  updateAdminProfile
);

module.exports = router;