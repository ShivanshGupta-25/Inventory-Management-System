const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const {
  recordFailedLogin,
  recordSecurityEvent,
} = require("./securityEventService");

const {
  createAndSendOTP,
  verifyOTP,
} = require("./twoFactorService");

const {
  createAndSendEmailVerification,
} = require("./emailVerificationService");

// --------------------------------------------------
// GENERATE JWT
// --------------------------------------------------

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// --------------------------------------------------
// REGISTER USER
// --------------------------------------------------
//
// Public registration always creates a STAFF account.
// Manager/Admin accounts must be created through
// protected administration workflows.
//

const registerUser = async ({
  name,
  email,
  password,
  role,
}) => {
  const normalizedName =
    name.trim();

  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedName) {
    throw new Error(
      "Name cannot be empty"
    );
  }

  if (!normalizedEmail) {
    throw new Error(
      "Email cannot be empty"
    );
  }

  if (!password) {
    throw new Error(
      "Password is required"
    );
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters"
    );
  }

  // Only these roles can be created
  // through public registration.
  // Admin accounts must be created
  // through the admin-controlled flow.
  const allowedRoles = [
    "manager",
    "staff",
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error(
      "Invalid registration role"
    );
  }

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  const user =
    await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,

      // Store the role selected during
      // public registration.
      role: role,

      status: "active",

      // New accounts must verify
      // their email first.
      emailVerified: false,
      emailVerifiedAt: null,

      // New accounts have 2FA
      // enabled by default.
      twoFactorEnabled: true,
      twoFactorMethod: "email",
      twoFactorRequired: false,
    });

  try {
    const verification =
      await createAndSendEmailVerification({
        user,
      });

    return {
      requiresEmailVerification: true,

      verificationId:
        verification.verificationId,

      expiresAt:
        verification.expiresAt,

      cooldownSeconds:
        verification.cooldownSeconds,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified:
          user.emailVerified,
        twoFactorEnabled:
          user.twoFactorEnabled,
      },
    };
  } catch (error) {
    // Since the verification email
    // could not be sent, don't leave
    // an unusable account behind.
    await User.deleteOne({
      _id: user._id,
    });

    throw error;
  }
};

//--------------------------------------------------
// LOGIN USER
// --------------------------------------------------

const loginUser = async ({
  email,
  password,
  ipAddress = null,
  userAgent = null,
}) => {
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  // ------------------------------------------------
  // USER NOT FOUND
  // ------------------------------------------------

  if (!user) {
    await recordFailedLogin({
      email: normalizedEmail,
      ipAddress,
      userAgent,
      reason:
        "Invalid email or password",
    });

    throw new Error(
      "Invalid email or password"
    );
  }

  // ------------------------------------------------
  // DISABLED ACCOUNT
  // ------------------------------------------------

  const userStatus =
    user.status || "active";

  if (userStatus === "disabled") {
    await recordFailedLogin({
      email: normalizedEmail,
      ipAddress,
      userAgent,
      reason:
        "Login attempted on disabled account",
    });

    throw new Error(
      "Your account has been disabled. Please contact an administrator."
    );
  }

  // ------------------------------------------------
  // PASSWORD VALIDATION
  // ------------------------------------------------

  const isPasswordValid =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordValid) {
    await recordFailedLogin({
      email: normalizedEmail,
      ipAddress,
      userAgent,
      reason:
        "Invalid email or password",
    });

    throw new Error(
      "Invalid email or password"
    );
  }

  // ------------------------------------------------
  // EMAIL VERIFICATION
  // ------------------------------------------------

  if (user.emailVerified === false) {
    throw new Error(
      "Please verify your email address before logging in."
    );
  }
  // ------------------------------------------------
  // TWO-FACTOR AUTHENTICATION
  // ------------------------------------------------

  const isTwoFactorRole =
    user.role === "admin" ||
    user.role === "manager";

  // Existing admin/manager accounts that do not yet
  // have this field should remain protected.
  const twoFactorEnabled =
    user.twoFactorEnabled !== false;

  const requiresTwoFactor =
    isTwoFactorRole &&
    twoFactorEnabled;

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: userStatus,
    emailVerified: user.emailVerified,
    twoFactorEnabled,
    twoFactorMethod: user.twoFactorMethod || "email",
    twoFactorRequired: user.twoFactorRequired || false,
  };

  // ------------------------------------------------
  // ADMIN / MANAGER
  // ------------------------------------------------

  if (requiresTwoFactor) {
    const twoFactor =
      await createAndSendOTP({
        user,
      });

    await recordSecurityEvent({
      type: "2FA_OTP_SENT",

      severity: "info",

      user: user._id,

      email: normalizedEmail,

      ipAddress,

      userAgent,

      description:
        "Two-factor authentication OTP sent",

      metadata: {
        role: user.role,
        challengeId:
          twoFactor.challengeId,
      },
    });

    return {
      requiresTwoFactor: true,

      challengeId:
        twoFactor.challengeId,

      expiresAt:
        twoFactor.expiresAt,

      cooldownSeconds:
        twoFactor.cooldownSeconds,

      user: safeUser,
    };
  }

  // ------------------------------------------------
  // STAFF — EXISTING LOGIN FLOW
  // ------------------------------------------------

  const token = generateToken(user);

  await recordSecurityEvent({
    type: "LOGIN_SUCCESS",

    severity: "info",

    user: user._id,

    email: normalizedEmail,

    ipAddress,

    userAgent,

    description:
      "Successful login",

    metadata: {
      role: user.role,
    },
  });

  return {
    requiresTwoFactor: false,

    token,

    user: safeUser,
  };
};

// --------------------------------------------------
// VERIFY TWO-FACTOR OTP
// --------------------------------------------------

const verifyTwoFactorOTP = async ({
  challengeId,
  otp,
  ipAddress = null,
  userAgent = null,
}) => {
  const result =
    await verifyOTP({
      challengeId,
      otp,
    });

  const user =
    await User.findById(
      result.userId
    );

  if (!user) {
    throw new Error(
      "User account could not be found"
    );
  }

  const userStatus =
    user.status || "active";

  if (userStatus === "disabled") {
    throw new Error(
      "Your account has been disabled. Please contact an administrator."
    );
  }

  if (
    user.role !== "admin" &&
    user.role !== "manager"
  ) {
    throw new Error(
      "Two-factor authentication is not required for this account"
    );
  }

  if (user.twoFactorEnabled === false) {
    throw new Error(
      "Two-factor authentication is disabled for this account"
    );
  }

  const token =
    generateToken(user);

  await recordSecurityEvent({
    type: "2FA_SUCCESS",

    severity: "info",

    user: user._id,

    email: user.email,

    ipAddress,

    userAgent,

    description:
      "Two-factor authentication completed successfully",

    metadata: {
      role: user.role,
    },
  });

  return {
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: userStatus,
    },
  };
};

// --------------------------------------------------
// GET CURRENT USER
// --------------------------------------------------

const getCurrentUser = async (userId) => {
  const user = await User.findById(
    userId
  ).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// --------------------------------------------------
// UPDATE USER PROFILE
// --------------------------------------------------

const updateUserProfile = async (
  userId,
  { name, email }
) => {
  const user = await User.findById(
    userId
  );

  if (!user) {
    throw new Error("User not found");
  }

  // ----------------------------------------------
  // NAME
  // ----------------------------------------------

  if (name !== undefined) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error(
        "Name cannot be empty"
      );
    }

    user.name = trimmedName;
  }

  // ----------------------------------------------
  // EMAIL
  // ----------------------------------------------

  if (email !== undefined) {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      throw new Error(
        "Email cannot be empty"
      );
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: userId,
        },
      });

    if (existingUser) {
      throw new Error(
        "User with this email already exists"
      );
    }

    user.email = normalizedEmail;
  }

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status:
      user.status || "active",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// --------------------------------------------------
// CHANGE PASSWORD
// --------------------------------------------------

const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(
    userId
  );

  if (!user) {
    throw new Error("User not found");
  }

  const isCurrentPasswordValid =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!isCurrentPasswordValid) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  if (newPassword.length < 6) {
    throw new Error(
      "New password must be at least 6 characters"
    );
  }

  const isSamePassword =
    await bcrypt.compare(
      newPassword,
      user.password
    );

  if (isSamePassword) {
    throw new Error(
      "New password must be different from current password"
    );
  }

  user.password =
    await bcrypt.hash(
      newPassword,
      10
    );

  await user.save();
};

// --------------------------------------------------
// UPDATE TWO-FACTOR AUTHENTICATION SETTINGS
// --------------------------------------------------

const updateTwoFactorSettings = async ({
  userId,
  enabled,
}) => {
  if (typeof enabled !== "boolean") {
    throw new Error(
      "Two-factor authentication setting must be true or false"
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Only admin and manager can control 2FA.
  if (
    user.role !== "admin" &&
    user.role !== "manager"
  ) {
    throw new Error(
      "Two-factor authentication settings are only available for administrators and managers."
    );
  }

  // If 2FA has been enforced by the system,
  // the user cannot disable it.
  if (
    user.twoFactorRequired === true &&
    enabled === false
  ) {
    throw new Error(
      "Two-factor authentication is required for this account and cannot be disabled."
    );
  }

  user.twoFactorEnabled = enabled;
  user.twoFactorMethod = "email";

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || "active",

    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,

    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorMethod: user.twoFactorMethod,
    twoFactorRequired: user.twoFactorRequired || false,
  };
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  registerUser,
  loginUser,
  verifyTwoFactorOTP,
  updateTwoFactorSettings,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
};