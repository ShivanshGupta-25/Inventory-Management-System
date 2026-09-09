const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
} = require("../services/authService");

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

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    if (
      role &&
      !["admin", "manager", "staff"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
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
      message: "User registered successfully",
      token: result.token,
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

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
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
// GET CURRENT USER
// --------------------------------------------------

const me = async (req, res) => {
  try {
    const user = await getCurrentUser(
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

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
    } = req.body;

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "At least one profile field is required",
      });
    }

    const user = await updateUserProfile(
      req.user.userId,
      {
        name,
        email,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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

const changePassword = async (req, res) => {
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

    if (newPassword !== confirmPassword) {
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
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
};