import express from "express";

import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();


// Any authenticated user
router.get(
  "/me",
  authenticate,
  (req, res) => {

    res.json({
      success: true,
      user: req.user,
    });

  }
);


// Admin only
router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  (req, res) => {

    res.json({
      success: true,
      message: "Welcome Admin.",
      user: req.user,
    });

  }
);


// Admin + Manager
router.get(
  "/management",
  authenticate,
  authorizeRoles("admin", "manager"),
  (req, res) => {

    res.json({
      success: true,
      message: "Management resource.",
      user: req.user,
    });

  }
);

export default router;