const {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserRole,
  changeUserStatus,
  deleteUser,
  getAuditLogs,
} = require("../services/adminService");

// --------------------------------------------------
// ADMIN DASHBOARD
// --------------------------------------------------

const dashboard = async (req, res) => {
  try {
    const data = await getDashboardStats();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load admin dashboard",
    });
  }
};

// --------------------------------------------------
// GET USERS
// --------------------------------------------------

const users = async (req, res) => {
  try {
    const {
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      sortOrder,
    } = req.query;

    const data = await getUsers({
      page,
      limit,
      search,
      role,
      status,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Admin users error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to load users",
    });
  }
};

// --------------------------------------------------
// GET SINGLE USER
// --------------------------------------------------

const userDetails = async (req, res) => {
  try {
    const user = await getUserById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Admin user details error:",
      error
    );

    const statusCode =
      error.message === "User not found"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// CREATE USER
// --------------------------------------------------

const create = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const user = await createUser({
      actorId: req.user.userId,
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message:
        "User created successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Admin create user error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create user",
    });
  }
};

// --------------------------------------------------
// UPDATE USER
// --------------------------------------------------

const update = async (req, res) => {
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
          "At least one field is required",
      });
    }

    const user = await updateUser({
      actorId: req.user.userId,
      userId: req.params.id,
      name,
      email,
    });

    return res.status(200).json({
      success: true,
      message:
        "User updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Admin update user error:",
      error
    );

    const statusCode =
      error.message === "User not found"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// CHANGE USER ROLE
// --------------------------------------------------

const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const user = await changeUserRole({
      actorId: req.user.userId,
      userId: req.params.id,
      role,
    });

    return res.status(200).json({
      success: true,
      message:
        "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Admin change role error:",
      error
    );

    const statusCode =
      error.message === "User not found"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// CHANGE USER STATUS
// --------------------------------------------------

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const user = await changeUserStatus({
      actorId: req.user.userId,
      userId: req.params.id,
      status,
    });

    return res.status(200).json({
      success: true,
      message:
        status === "active"
          ? "User account enabled successfully"
          : "User account disabled successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Admin change status error:",
      error
    );

    const statusCode =
      error.message === "User not found"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// DELETE USER
// --------------------------------------------------

const remove = async (req, res) => {
  try {
    const user = await deleteUser({
      actorId: req.user.userId,
      userId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Admin delete user error:",
      error
    );

    const statusCode =
      error.message === "User not found"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------------
// AUDIT LOGS
// --------------------------------------------------

const auditLogs = async (req, res) => {
  try {
    const {
      page,
      limit,
      action,
      search,
    } = req.query;

    const data = await getAuditLogs({
      page,
      limit,
      action,
      search,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Admin audit logs error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to load audit logs",
    });
  }
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  dashboard,
  users,
  userDetails,
  create,
  update,
  updateRole,
  updateStatus,
  remove,
  auditLogs,
};