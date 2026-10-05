const bcrypt = require("bcryptjs");

const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

/*
 * Roles that can be created by an administrator.
 *
 * Admins can create:
 * - admin
 * - manager
 * - staff
 */
const CREATABLE_ROLES = [
  "admin",
  "manager",
  "staff",
];

/*
 * Roles that can be assigned through the
 * Change Role operation.
 *
 * We intentionally DO NOT include "admin" here.
 *
 * This means:
 * - Admin can create another admin
 * - Admin cannot promote an existing manager/staff
 *   to admin through Change Role
 */
const MANAGEABLE_ROLES = [
  "manager",
  "staff",
];

const USER_STATUSES = [
  "active",
  "disabled",
];

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
    // ----------------------------------------------
    // TOTAL USERS
    // ----------------------------------------------

    User.countDocuments(),

    // ----------------------------------------------
    // ADMINISTRATORS
    // ----------------------------------------------

    User.countDocuments({
      role: "admin",
    }),

    // ----------------------------------------------
    // MANAGERS
    // ----------------------------------------------

    User.countDocuments({
      role: "manager",
    }),

    // ----------------------------------------------
    // STAFF
    // ----------------------------------------------

    User.countDocuments({
      role: "staff",
    }),

    // ----------------------------------------------
    // ACTIVE USERS
    // ----------------------------------------------

    /*
     * Users created before the status field was
     * introduced may not have a status field.
     *
     * Those users are considered active.
     */

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
        {
          status: null,
        },
      ],
    }),

    // ----------------------------------------------
    // DISABLED USERS
    // ----------------------------------------------

    User.countDocuments({
      status: "disabled",
    }),
  ]);

  // ------------------------------------------------
  // USERS CREATED DURING LAST 30 DAYS
  // ------------------------------------------------

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

  // ------------------------------------------------
  // ROLE DISTRIBUTION
  // ------------------------------------------------

  const roleDistribution =
    await User.aggregate([
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

  // ------------------------------------------------
  // RECENT USERS
  // ------------------------------------------------

  const recentUsers = await User.find()
    .select("-password")
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();

  // ------------------------------------------------
  // RECENT ADMINISTRATIVE ACTIVITY
  // ------------------------------------------------

  const recentActivity =
    await AuditLog.find()
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

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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

  // ------------------------------------------------
  // BUILD FILTER CONDITIONS
  // ------------------------------------------------

  /*
   * We use $and here instead of directly attaching
   * multiple $or conditions to the same filter.
   *
   * This allows:
   *
   * Search
   * +
   * Role
   * +
   * Status
   *
   * to work together correctly.
   */

  const conditions = [];

  // ------------------------------------------------
  // SEARCH
  // ------------------------------------------------

  if (search.trim()) {
    const searchRegex = new RegExp(
      search.trim(),
      "i"
    );

    conditions.push({
      $or: [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
      ],
    });
  }

  // ------------------------------------------------
  // ROLE FILTER
  // ------------------------------------------------

  if (role) {
    if (
      ![
        "admin",
        "manager",
        "staff",
      ].includes(role)
    ) {
      throw new Error(
        "Invalid role filter"
      );
    }

    conditions.push({
      role,
    });
  }

  // ------------------------------------------------
  // STATUS FILTER
  // ------------------------------------------------

  if (status) {
    if (!USER_STATUSES.includes(status)) {
      throw new Error(
        "Invalid status filter"
      );
    }

    /*
     * IMPORTANT:
     *
     * Legacy users may not have a status field.
     *
     * The application treats missing/null status
     * as ACTIVE, so the Active filter must include:
     *
     * status === "active"
     * OR status does not exist
     * OR status === null
     */

    if (status === "active") {
      conditions.push({
        $or: [
          {
            status: "active",
          },
          {
            status: {
              $exists: false,
            },
          },
          {
            status: null,
          },
        ],
      });
    } else {
      conditions.push({
        status,
      });
    }
  }

  // ------------------------------------------------
  // FINAL FILTER
  // ------------------------------------------------

  const filter =
    conditions.length > 0
      ? {
          $and: conditions,
        }
      : {};

  // ------------------------------------------------
  // SORT
  // ------------------------------------------------

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

  // ------------------------------------------------
  // QUERY
  // ------------------------------------------------

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

  // ------------------------------------------------
  // PAGINATION
  // ------------------------------------------------

  const totalPages = Math.ceil(
    totalUsers / parsedLimit
  );

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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
  // ------------------------------------------------
  // VALIDATION
  // ------------------------------------------------

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

  // ------------------------------------------------
  // ROLE VALIDATION
  // ------------------------------------------------

  /*
   * Admins are allowed to CREATE:
   *
   * - admin
   * - manager
   * - staff
   *
   * However, role changes remain restricted to
   * manager/staff through changeUserRole().
   */

  if (!CREATABLE_ROLES.includes(role)) {
    throw new Error(
      "Invalid user role"
    );
  }

  const normalizedEmail =
    normalizeEmail(email);

  const normalizedName =
    normalizeName(name);

  // ------------------------------------------------
  // DUPLICATE EMAIL
  // ------------------------------------------------

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  // ------------------------------------------------
  // HASH PASSWORD
  // ------------------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 10);

  // ------------------------------------------------
  // CREATE USER
  // ------------------------------------------------

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    status: "active",
  });

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

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

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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

  // ------------------------------------------------
  // NAME
  // ------------------------------------------------

  if (name !== undefined) {
    const normalizedName =
      normalizeName(name);

    if (!normalizedName) {
      throw new Error(
        "Name cannot be empty"
      );
    }

    if (
      normalizedName !== user.name
    ) {
      changes.name = {
        from: user.name,
        to: normalizedName,
      };

      user.name = normalizedName;
    }
  }

  // ------------------------------------------------
  // EMAIL
  // ------------------------------------------------

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

  // ------------------------------------------------
  // SAVE
  // ------------------------------------------------

  await user.save();

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

  await createAuditLog({
    actor: actorId,

    action: "USER_UPDATED",

    targetUser: user._id,

    description: `Updated account information for ${user.name}`,

    metadata: {
      changes,
    },
  });

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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
  // ------------------------------------------------
  // ROLE VALIDATION
  // ------------------------------------------------

  /*
   * IMPORTANT:
   *
   * "admin" is intentionally NOT allowed here.
   *
   * An administrator can create another admin,
   * but cannot promote an existing account to admin.
   */

  if (!MANAGEABLE_ROLES.includes(role)) {
    throw new Error(
      "Invalid role. Admin can assign manager or staff roles."
    );
  }

  // ------------------------------------------------
  // SELF PROTECTION
  // ------------------------------------------------

  if (
    actorId.toString() ===
    userId.toString()
  ) {
    throw new Error(
      "You cannot change your own role"
    );
  }

  // ------------------------------------------------
  // GET USER
  // ------------------------------------------------

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // ------------------------------------------------
  // ADMIN PROTECTION
  // ------------------------------------------------

  if (user.role === "admin") {
    throw new Error(
      "Admin accounts cannot be modified through user role management"
    );
  }

  // ------------------------------------------------
  // NO CHANGE
  // ------------------------------------------------

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

  // ------------------------------------------------
  // CHANGE ROLE
  // ------------------------------------------------

  const previousRole = user.role;

  user.role = role;

  await user.save();

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

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

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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
  // ------------------------------------------------
  // STATUS VALIDATION
  // ------------------------------------------------

  if (!USER_STATUSES.includes(status)) {
    throw new Error(
      "Invalid account status"
    );
  }

  // ------------------------------------------------
  // SELF PROTECTION
  // ------------------------------------------------

  if (
    actorId.toString() ===
    userId.toString()
  ) {
    throw new Error(
      "You cannot change your own account status"
    );
  }

  // ------------------------------------------------
  // GET USER
  // ------------------------------------------------

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const currentStatus =
    user.status || "active";

  // ------------------------------------------------
  // NO CHANGE
  // ------------------------------------------------

  if (currentStatus === status) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: currentStatus,
    };
  }

  // ------------------------------------------------
  // LAST ADMIN PROTECTION
  // ------------------------------------------------

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
          {
            status: null,
          },
        ],
      });

    if (activeAdminCount <= 1) {
      throw new Error(
        "The last active administrator cannot be disabled"
      );
    }

    /*
     * Even when multiple administrators exist,
     * normal user management does not allow
     * administrator accounts to be disabled.
     */

    throw new Error(
      "Admin accounts cannot be disabled through user management"
    );
  }

  // ------------------------------------------------
  // CHANGE STATUS
  // ------------------------------------------------

  user.status = status;

  await user.save();

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

  await createAuditLog({
    actor: actorId,

    action: "STATUS_CHANGED",

    targetUser: user._id,

    description: `${
      status === "active"
        ? "Enabled"
        : "Disabled"
    } ${user.name}'s account`,

    metadata: {
      previousStatus: currentStatus,
      newStatus: status,
    },
  });

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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
  // ------------------------------------------------
  // SELF PROTECTION
  // ------------------------------------------------

  if (
    actorId.toString() ===
    userId.toString()
  ) {
    throw new Error(
      "You cannot delete your own account"
    );
  }

  // ------------------------------------------------
  // GET USER
  // ------------------------------------------------

  const user =
    await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // ------------------------------------------------
  // ADMIN PROTECTION
  // ------------------------------------------------

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

    /*
     * Administrator accounts remain protected
     * even when multiple administrators exist.
     */

    throw new Error(
      "Admin accounts cannot be deleted through user management"
    );
  }

  // ------------------------------------------------
  // SNAPSHOT
  // ------------------------------------------------

  const deletedUserSnapshot = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status:
      user.status || "active",
  };

  // ------------------------------------------------
  // DELETE
  // ------------------------------------------------

  await User.deleteOne({
    _id: userId,
  });

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

  await createAuditLog({
    actor: actorId,

    action: "USER_DELETED",

    targetUser: user._id,

    description: `Deleted ${user.role} account for ${user.name}`,

    metadata: {
      deletedUser:
        deletedUserSnapshot,
    },
  });

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

  return deletedUserSnapshot;
};

// --------------------------------------------------
// ADMIN PROFILE
// --------------------------------------------------

const getAdminProfile = async (
  adminId
) => {
  const user =
    await User.findById(adminId)
      .select("-password")
      .lean();

  if (!user) {
    throw new Error(
      "Administrator account not found"
    );
  }

  if (user.role !== "admin") {
    throw new Error(
      "Only administrator accounts can access this profile"
    );
  }

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
// UPDATE ADMIN PROFILE
// --------------------------------------------------

const updateAdminProfile = async (
  adminId,
  updates
) => {
  // ------------------------------------------------
  // GET ADMIN
  // ------------------------------------------------

  const user =
    await User.findById(adminId);

  if (!user) {
    throw new Error(
      "Administrator account not found"
    );
  }

  // ------------------------------------------------
  // ADMIN VALIDATION
  // ------------------------------------------------

  if (user.role !== "admin") {
    throw new Error(
      "Only administrator accounts can update this profile"
    );
  }

  // ------------------------------------------------
  // ALLOWED UPDATES
  // ------------------------------------------------

  const changes = {};

  // ------------------------------------------------
  // NAME
  // ------------------------------------------------

  if (
    updates?.name !== undefined
  ) {
    if (
      typeof updates.name !== "string"
    ) {
      throw new Error(
        "Invalid name"
      );
    }

    const normalizedName =
      normalizeName(updates.name);

    if (!normalizedName) {
      throw new Error(
        "Name cannot be empty"
      );
    }

    if (normalizedName.length < 2) {
      throw new Error(
        "Name must contain at least 2 characters"
      );
    }

    if (
      normalizedName !== user.name
    ) {
      changes.name = {
        from: user.name,
        to: normalizedName,
      };

      user.name = normalizedName;
    }
  }

  // ------------------------------------------------
  // EMAIL PROTECTION
  // ------------------------------------------------

  /*
   * Email changes are intentionally not handled
   * from the profile page.
   *
   * A future security workflow can handle:
   *
   * - current password
   * - new email
   * - verification
   * - confirmation
   */

  if (
    updates?.email !== undefined
  ) {
    throw new Error(
      "Email changes must be handled through account security settings"
    );
  }

  // ------------------------------------------------
  // ROLE PROTECTION
  // ------------------------------------------------

  if (
    updates?.role !== undefined
  ) {
    throw new Error(
      "Administrator role cannot be changed from the profile page"
    );
  }

  // ------------------------------------------------
  // STATUS PROTECTION
  // ------------------------------------------------

  if (
    updates?.status !== undefined
  ) {
    throw new Error(
      "Account status cannot be changed from the profile page"
    );
  }

  // ------------------------------------------------
  // NO CHANGES
  // ------------------------------------------------

  if (
    Object.keys(changes).length === 0
  ) {
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
  }

  // ------------------------------------------------
  // SAVE
  // ------------------------------------------------

  await user.save();

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

  await createAuditLog({
    actor: adminId,

    action: "PROFILE_UPDATED",

    targetUser: user._id,

    description: `Updated administrator profile for ${user.name}`,

    metadata: {
      changes,
    },
  });

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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

  // ------------------------------------------------
  // ACTION FILTER
  // ------------------------------------------------

  if (action) {
    const allowedActions = [
      "USER_CREATED",
      "USER_UPDATED",
      "ROLE_CHANGED",
      "STATUS_CHANGED",
      "USER_DELETED",
      "PROFILE_UPDATED",
    ];

    if (
      !allowedActions.includes(action)
    ) {
      throw new Error(
        "Invalid audit action"
      );
    }

    filter.action = action;
  }

  // ------------------------------------------------
  // SEARCH
  // ------------------------------------------------

  if (search.trim()) {
    const searchRegex = new RegExp(
      search.trim(),
      "i"
    );

    const matchingUsers =
      await User.find({
        $or: [
          {
            name: searchRegex,
          },
          {
            email: searchRegex,
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
        description: searchRegex,
      },
    ];
  }

  // ------------------------------------------------
  // QUERY
  // ------------------------------------------------

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

  // ------------------------------------------------
  // PAGINATION
  // ------------------------------------------------

  const totalPages = Math.ceil(
    totalLogs / parsedLimit
  );

  // ------------------------------------------------
  // RETURN
  // ------------------------------------------------

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
// CHANGE ADMIN PASSWORD
// --------------------------------------------------

const changeAdminPassword = async ({
  adminId,
  currentPassword,
  newPassword,
}) => {
  // ------------------------------------------------
  // VALIDATION
  // ------------------------------------------------

  if (!currentPassword) {
    throw new Error("Current password is required");
  }

  if (!newPassword) {
    throw new Error("New password is required");
  }

  if (newPassword.length < 8) {
    throw new Error(
      "New password must be at least 8 characters"
    );
  }

  if (newPassword.length > 128) {
    throw new Error(
      "New password cannot exceed 128 characters"
    );
  }

  if (!/[A-Z]/.test(newPassword)) {
    throw new Error(
      "New password must contain at least one uppercase letter"
    );
  }

  if (!/[a-z]/.test(newPassword)) {
    throw new Error(
      "New password must contain at least one lowercase letter"
    );
  }

  if (!/[0-9]/.test(newPassword)) {
    throw new Error(
      "New password must contain at least one number"
    );
  }

  // ------------------------------------------------
  // GET ADMIN
  // ------------------------------------------------

  const user = await User.findById(adminId);

  if (!user) {
    throw new Error(
      "Administrator account not found"
    );
  }

  // ------------------------------------------------
  // ADMIN PROTECTION
  // ------------------------------------------------

  if (user.role !== "admin") {
    throw new Error(
      "Only administrator accounts can change this password"
    );
  }

  // ------------------------------------------------
  // VERIFY CURRENT PASSWORD
  // ------------------------------------------------

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!passwordMatches) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  // ------------------------------------------------
  // PREVENT SAME PASSWORD
  // ------------------------------------------------

  const samePassword = await bcrypt.compare(
    newPassword,
    user.password
  );

  if (samePassword) {
    throw new Error(
      "New password must be different from your current password"
    );
  }

  // ------------------------------------------------
  // HASH NEW PASSWORD
  // ------------------------------------------------

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  user.password = hashedPassword;

  await user.save();

  // ------------------------------------------------
  // AUDIT
  // ------------------------------------------------

  await createAuditLog({
    actor: adminId,
    action: "PASSWORD_CHANGED",
    targetUser: user._id,
    description:
      `Changed administrator password for ${user.name}`,
    metadata: {
      accountRole: user.role,
    },
  });

  return {
    success: true,
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

  // Admin profile
  getAdminProfile,
  updateAdminProfile,

  changeAdminPassword,
};