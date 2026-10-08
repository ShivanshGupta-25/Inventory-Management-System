const express = require("express");

const {
  register,
  verifyEmail,
  resendEmailVerificationCode,
  login,
  verifyTwoFactor,
  resendTwoFactor,
  me,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);

router.post(
  "/verify-email",
  verifyEmail
);

router.post(
  "/resend-email-verification",
  resendEmailVerificationCode
);

router.post("/login", login);

router.post(
  "/verify-otp",
  verifyTwoFactor
);

router.post(
  "/resend-otp",
  resendTwoFactor
);

// Protected routes
router.get(
  "/me",
  authMiddleware,
  me
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;