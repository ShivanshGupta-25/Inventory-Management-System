const bcrypt = require("bcryptjs");

const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const MANAGEABLE_ROLES = ["manager", "staff"];
const USER_STATUSES = ["active", "disabled"];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

const normalizeName = (name) => {
  return name.trim();
};

// --------------------------------------------------
// AUDIT LOG HELPER
// --------------------------------------------------

const createAuditLog = async ({
  actor,
  action,
  targetUser = null,
  description,
  metadata = {},
}) => {
  return AuditLog.create({
    actor,
    action,
    targetUser,
    description,
    metadata,
  });
};

// --------------------------------------------------
// DASHBOARD STATISTICS
// --------------------------------------------------

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalAdmins,
    totalManagers,
    totalStaff,
    activeUsers,
    disabledUsers,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      role: "admin",
    }),

    User.countDocuments({
      role: "manager",
    }),

    User.countDocuments({
      role: "staff",
    }),

    User.countDocuments({
      $or: [
        {
          status: "active",
        },
        {
          status: {
            $exists: false,
          },
        },
      ],
    }),

    User.countDocuments({
      status: "disabled",
    }),
  ]);

  // Users created during the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(
    thirtyDaysAgo.getDate() - 30
  );

  const userGrowth = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: thirtyDaysAgo,
        },
      },
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  // Role distribution
  const roleDistribution = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        count: -1,
      },
    },
  ]);

  // Recent users
  const recentUsers = await User.find()
    .select("-password")
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();

  // Recent administrative activity
  const recentActivity = await AuditLog.find()
    .populate(
      "actor",
      "name email role"
    )
    .populate(
      "targetUser",
      "name email role"
    )
    .sort({
      createdAt: -1,
    })
    .limit(10)
    .lean();

  return {
    stats: {
      totalUsers,
      totalAdmins,
      totalManagers,
      totalStaff,
      activeUsers,
      disabledUsers,
    },

    userGrowth,

    roleDistribution,

    recentUsers,

    recentActivity,

    lastUpdated: new Date(),
  };
};

// --------------------------------------------------
// GET USERS
// --------------------------------------------------

const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const parsedPage = Math.max(
    Number(page) || 1,
    1
  );

  const parsedLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip =
    (parsedPage - 1) * parsedLimit;

  const filter = {};

  // ----------------------------------------------
  // SEARCH
  // ----------------------------------------------

  if (search.trim()) {
    const searchRegex = new RegExp(
      search.trim(),
      "i"
    );

    filter.$or = [
      {
        name: searchRegex,
      },
      {
        email: searchRegex,
      },
    ];
  }

  // ----------------------------------------------
  // ROLE FILTER
  // ----------------------------------------------

  if (role) {
    if (
      !["admin", "manager", "staff"].includes(role)
    ) {
      throw new Error("Invalid role filter");
    }

    filter.role = role;
  }

  // ----------------------------------------------
  // STATUS FILTER
  // ----------------------------------------------

  if (status) {
    if (!USER_STATUSES.includes(status)) {
      throw new Error(
        "Invalid status filter"
      );
    }

    filter.status = status;
  }

  // ----------------------------------------------
  // SORT
  // ----------------------------------------------

  const allowedSortFields = [
    "name",
    "email",
    "role",
    "status",
    "createdAt",
    "updatedAt",
  ];

  const safeSortBy =
    allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

  const safeSortOrder =
    sortOrder === "asc" ? 1 : -1;

  const sort = {
    [safeSortBy]: safeSortOrder,
  };

  // ----------------------------------------------
  // QUERY
  // ----------------------------------------------

  const [users, totalUsers] =
    await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),

      User.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalUsers / parsedLimit
  );

  return {
    users,

    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalUsers,
      totalPages,
      hasNextPage:
        parsedPage < totalPages,
      hasPreviousPage:
        parsedPage > 1,
    },
  };
};

// --------------------------------------------------
// GET USER BY ID
// --------------------------------------------------

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// --------------------------------------------------
// CREATE USER
// --------------------------------------------------

const createUser = async ({
  actorId,
  name,
  email,
  password,
  role = "staff",
}) => {
  // ----------------------------------------------
  // VALIDATION
  // ----------------------------------------------

  if (!name || !name.trim()) {
    throw new Error("Name is required");
  }

  if (!email || !email.trim()) {
    throw new Error("Email is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters"
    );
  }

  // Admin creation is intentionally not exposed
  // through the Admin user-management API.
  if (!MANAGEABLE_ROLES.includes(role)) {
    throw new Error(
      "Admin accounts cannot be created through this endpoint"
    );
  }

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedName =
    normalizeName(name);

  // ----------------------------------------------
  // DUPLICATE EMAIL
  // ----------------------------------------------

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  // ----------------------------------------------
  // HASH PASSWORD
  // ----------------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 10);

  // ----------------------------------------------
  // CREATE USER
  // ----------------------------------------------

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    status: "active",
  });

  // ----------------------------------------------
  // AUDIT
  // ----------------------------------------------

  await createAuditLog({
    actor: actorId,
    action: "USER_CREATED",
    targetUser: user._id,
    description: `Created ${role} account for ${user.name}`,
    metadata: {
      role,
      email: user.email,
    },
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// --------------------------------------------------
// UPDATE USER
// --------------------------------------------------

const updateUser = async ({
  actorId,
  userId,
  name,
  email,
}) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const changes = {};

  // ----------------------------------------------
  // NAME
  // ----------------------------------------------

  if (name !== undefined) {
    const normalizedName =
      normalizeName(name);

    if (!normalizedName) {
      throw new Error(
        "Name cannot be empty"
      );
    }

    if (normalizedName !== user.name) {
      changes.name = {
        from: user.name,
        to: normalizedName,
      };

      user.name = normalizedName;
    }
  }

  // ----------------------------------------------
  // EMAIL
  // ----------------------------------------------

  if (email !== undefined) {
    const normalizedEmail =
      normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error(
        "Email cannot be empty"
      );
    }

    if (
      normalizedEmail !== user.email
    ) {
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

      changes.email = {
        from: user.email,
        to: normalizedEmail,
      };

      user.email = normalizedEmail;
    }
  }

  await user.save();

  await createAuditLog({
    actor: actorId,
    action: "USER_UPDATED",
    targetUser: user._id,
    description: `Updated account information for ${user.name}`,
    metadata: {
      changes,
    },
  });

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
// CHANGE USER ROLE
// --------------------------------------------------

const changeUserRole = async ({
  actorId,
  userId,
  role,
}) => {
  if (!MANAGEABLE_ROLES.includes(role)) {
    throw new Error(
      "Invalid role. Admin can assign manager or staff roles."
    );
  }

  if (actorId.toString() === userId.toString()) {
    throw new Error(
      "You cannot change your own role"
    );
  }

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Protect existing Admin accounts
  if (user.role === "admin") {
    throw new Error(
      "Admin accounts cannot be modified through user role management"
    );
  }

  if (user.role === role) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status:
        user.status || "active",
    };
  }

  const previousRole = user.role;

  user.role = role;

  await user.save();

  await createAuditLog({
    actor: actorId,
    action: "ROLE_CHANGED",
    targetUser: user._id,
    description: `Changed ${user.name}'s role from ${previousRole} to ${role}`,
    metadata: {
      previousRole,
      newRole: role,
    },
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status:
      user.status || "active",
  };
};

// --------------------------------------------------
// CHANGE USER STATUS
// --------------------------------------------------

const changeUserStatus = async ({
  actorId,
  userId,
  status,
}) => {
  if (!USER_STATUSES.includes(status)) {
    throw new Error(
      "Invalid account status"
    );
  }

  if (actorId.toString() === userId.toString()) {
    throw new Error(
      "You cannot change your own account status"
    );
  }

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const currentStatus =
    user.status || "active";

  // ----------------------------------------------
  // NO CHANGE
  // ----------------------------------------------

  if (currentStatus === status) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: currentStatus,
    };
  }

  // ----------------------------------------------
  // LAST ADMIN PROTECTION
  // ----------------------------------------------

  if (
    user.role === "admin" &&
    status === "disabled"
  ) {
    const activeAdminCount =
      await User.countDocuments({
        role: "admin",
        $or: [
          {
            status: "active",
          },
          {
            status: {
              $exists: false,
            },
          },
        ],
      });

    if (activeAdminCount <= 1) {
      throw new Error(
        "The last active administrator cannot be disabled"
      );
    }

    throw new Error(
      "Admin accounts cannot be disabled through user management"
    );
  }

  user.status = status;

  await user.save();

  await createAuditLog({
    actor: actorId,
    action: "STATUS_CHANGED",
    targetUser: user._id,
    description: `${status === "active" ? "Enabled" : "Disabled"} ${user.name}'s account`,
    metadata: {
      previousStatus: currentStatus,
      newStatus: status,
    },
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
};

// --------------------------------------------------
// DELETE USER
// --------------------------------------------------

const deleteUser = async ({
  actorId,
  userId,
}) => {
  if (actorId.toString() === userId.toString()) {
    throw new Error(
      "You cannot delete your own account"
    );
  }

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // ----------------------------------------------
  // ADMIN PROTECTION
  // ----------------------------------------------

  if (user.role === "admin") {
    const adminCount =
      await User.countDocuments({
        role: "admin",
      });

    if (adminCount <= 1) {
      throw new Error(
        "The last administrator cannot be deleted"
      );
    }

    throw new Error(
      "Admin accounts cannot be deleted through user management"
    );
  }

  const deletedUserSnapshot = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status:
      user.status || "active",
  };

  await User.deleteOne({
    _id: userId,
  });

  await createAuditLog({
    actor: actorId,
    action: "USER_DELETED",
    targetUser: user._id,
    description: `Deleted ${user.role} account for ${user.name}`,
    metadata: {
      deletedUser: deletedUserSnapshot,
    },
  });

  return deletedUserSnapshot;
};

// --------------------------------------------------
// GET AUDIT LOGS
// --------------------------------------------------

const getAuditLogs = async ({
  page = 1,
  limit = 20,
  action = "",
  search = "",
} = {}) => {
  const parsedPage = Math.max(
    Number(page) || 1,
    1
  );

  const parsedLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip =
    (parsedPage - 1) * parsedLimit;

  const filter = {};

  // ----------------------------------------------
  // ACTION FILTER
  // ----------------------------------------------

  if (action) {
    const allowedActions = [
      "USER_CREATED",
      "USER_UPDATED",
      "ROLE_CHANGED",
      "STATUS_CHANGED",
      "USER_DELETED",
    ];

    if (!allowedActions.includes(action)) {
      throw new Error(
        "Invalid audit action"
      );
    }

    filter.action = action;
  }

  // ----------------------------------------------
  // SEARCH
  // ----------------------------------------------

  if (search.trim()) {
    const matchingUsers =
      await User.find({
        $or: [
          {
            name: new RegExp(
              search.trim(),
              "i"
            ),
          },
          {
            email: new RegExp(
              search.trim(),
              "i"
            ),
          },
        ],
      }).select("_id");

    const matchingUserIds =
      matchingUsers.map(
        (user) => user._id
      );

    filter.$or = [
      {
        actor: {
          $in: matchingUserIds,
        },
      },
      {
        targetUser: {
          $in: matchingUserIds,
        },
      },
      {
        description: new RegExp(
          search.trim(),
          "i"
        ),
      },
    ];
  }

  // ----------------------------------------------
  // QUERY
  // ----------------------------------------------

  const [logs, totalLogs] =
    await Promise.all([
      AuditLog.find(filter)
        .populate(
          "actor",
          "name email role"
        )
        .populate(
          "targetUser",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

  const totalPages = Math.ceil(
    totalLogs / parsedLimit
  );

  return {
    logs,

    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalLogs,
      totalPages,
      hasNextPage:
        parsedPage < totalPages,
      hasPreviousPage:
        parsedPage > 1,
    },
  };
};

// --------------------------------------------------
// EXPORTS
// --------------------------------------------------

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserRole,
  changeUserStatus,
  deleteUser,
  getAuditLogs,
};