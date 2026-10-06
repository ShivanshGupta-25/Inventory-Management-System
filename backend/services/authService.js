const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


const {
  recordFailedLogin,
  recordSecurityEvent,
} = require("./securityEventService");


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
}) => {
  const normalizedName = name.trim();
  const normalizedEmail = email
    .trim()
    .toLowerCase();

  if (!normalizedName) {
    throw new Error("Name cannot be empty");
  }

  if (!normalizedEmail) {
    throw new Error("Email cannot be empty");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters"
    );
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role: "staff",
    status: "active",
  });

  const token = generateToken(user);

  return {
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
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
  // SUCCESSFUL LOGIN
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
// EXPORTS
// --------------------------------------------------

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
};