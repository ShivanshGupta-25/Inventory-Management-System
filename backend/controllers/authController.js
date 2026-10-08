const {
  registerUser,
  loginUser,
  verifyTwoFactorOTP,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
} = require("../services/authService");

const {
  resendOTP,
} = require("../services/twoFactorService");

const {
  verifyEmailVerificationOTP,
  resendEmailVerification,
} = require("../services/emailVerificationService");

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and role are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // Public signup is only allowed
    // for manager and staff accounts.
    if (!["manager", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration role",
      });
    }

    const result = await registerUser({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,

      requiresEmailVerification:
        result.requiresEmailVerification,

      message:
        "Account created. A verification code has been sent to your email.",

      verificationId:
        result.verificationId,

      expiresAt:
        result.expiresAt,

      cooldownSeconds:
        result.cooldownSeconds,

      user: result.user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// VERIFY EMAIL
// --------------------------------------------------

const verifyEmail = async (req, res) => {
  try {
    const {
      verificationId,
      otp,
    } = req.body;

    if (!verificationId || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Verification ID and verification code are required",
      });
    }

    const result =
      await verifyEmailVerificationOTP({
        verificationId,
        otp,
      });

    return res.status(200).json({
      success: true,

      message:
        "Email verified successfully. You can now log in.",

      user: result.user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// RESEND EMAIL VERIFICATION
// --------------------------------------------------

const resendEmailVerificationCode =
  async (req, res) => {
    try {
      const {
        verificationId,
      } = req.body;

      if (!verificationId) {
        return res.status(400).json({
          success: false,
          message:
            "Verification ID is required",
        });
      }

      const result =
        await resendEmailVerification({
          verificationId,
        });

      return res.status(200).json({
        success: true,

        message:
          "A new email verification code has been sent.",

        verificationId:
          result.verificationId,

        expiresAt:
          result.expiresAt,

        cooldownSeconds:
          result.cooldownSeconds,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const result =
      await loginUser({
        email,
        password,

        // Security monitoring metadata
        ipAddress:
          req.ip || null,

        userAgent:
          req.get("user-agent") || null,
      });

    // Admin / Manager requiring 2FA
    if (result.requiresTwoFactor) {
      return res.status(200).json({
        success: true,

        requiresTwoFactor: true,

        message:
          "A verification code has been sent to your email.",

        challengeId:
          result.challengeId,

        expiresAt:
          result.expiresAt,

        cooldownSeconds:
          result.cooldownSeconds,

        user: result.user,
      });
    }

    // Staff login / users without 2FA
    return res.status(200).json({
      success: true,

      requiresTwoFactor: false,

      message: "Login successful",

      token: result.token,

      user: result.user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// VERIFY TWO-FACTOR OTP
// --------------------------------------------------

const verifyTwoFactor = async (
  req,
  res
) => {
  try {
    const {
      challengeId,
      otp,
    } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Challenge ID and verification code are required",
      });
    }

    const result =
      await verifyTwoFactorOTP({
        challengeId,
        otp,

        ipAddress:
          req.ip || null,

        userAgent:
          req.get("user-agent") || null,
      });

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      token: result.token,

      user: result.user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// RESEND TWO-FACTOR OTP
// --------------------------------------------------

const resendTwoFactor = async (
  req,
  res
) => {
  try {
    const {
      challengeId,
    } = req.body;

    if (!challengeId) {
      return res.status(400).json({
        success: false,
        message:
          "Challenge ID is required",
      });
    }

    const result =
      await resendOTP({
        challengeId,
      });

    return res.status(200).json({
      success: true,

      message:
        "A new verification code has been sent to your email.",

      challengeId:
        result.challengeId,

      expiresAt:
        result.expiresAt,

      cooldownSeconds:
        result.cooldownSeconds,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// GET CURRENT USER
// --------------------------------------------------

const me = async (req, res) => {
  try {
    const user =
      await getCurrentUser(
        req.user.userId
      );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// UPDATE PROFILE
// --------------------------------------------------

const updateProfile = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
    } = req.body;

    if (
      name === undefined &&
      email === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one profile field is required",
      });
    }

    const user =
      await updateUserProfile(
        req.user.userId,
        {
          name,
          email,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// CHANGE PASSWORD
// --------------------------------------------------

const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password and confirmation are required",
      });
    }

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirmation do not match",
      });
    }

    await changeUserPassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  register,
  verifyEmail,
  resendEmailVerificationCode,
  login,
  verifyTwoFactor,
  resendTwoFactor,
  me,
  updateProfile,
  changePassword,
};