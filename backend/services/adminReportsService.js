const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const SecurityEvent = require("../models/SecurityEvent");

const MAX_REPORT_RANGE_DAYS = 366;

const ACTIVE_USER_FILTER = {
  $or: [
    { status: "active" },
    { status: { $exists: false } },
    { status: null },
  ],
};

const REPORT_ACTIONS = [
  "USER_CREATED",
  "USER_UPDATED",
  "ROLE_CHANGED",
  "STATUS_CHANGED",
  "USER_DELETED",
];

/* ============================================================
   DATE HELPERS
============================================================ */

const getDateRange = ({ from, to } = {}) => {
  const now = new Date();

  let startDate;
  let endDate;

  if (from) {
    startDate = new Date(
      `${from}T00:00:00.000Z`
    );
  } else {
    startDate = new Date(now);

    startDate.setUTCDate(
      startDate.getUTCDate() - 29
    );

    startDate.setUTCHours(0, 0, 0, 0);
  }

  if (to) {
    endDate = new Date(
      `${to}T23:59:59.999Z`
    );
  } else {
    endDate = new Date(now);
  }

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw new Error(
      "Invalid report date range"
    );
  }

  if (startDate > endDate) {
    throw new Error(
      "Report start date cannot be after end date"
    );
  }

  const rangeDays =
    Math.floor(
      (endDate.getTime() -
        startDate.getTime()) /
        86400000
    ) + 1;

  if (rangeDays > MAX_REPORT_RANGE_DAYS) {
    throw new Error(
      `Report range cannot exceed ${MAX_REPORT_RANGE_DAYS} days`
    );
  }

  return {
    startDate,
    endDate,
    rangeDays,
  };
};

const toDateKey = (date) => {
  return date.toISOString().slice(0, 10);
};

const buildDateSeries = (
  startDate,
  endDate
) => {
  const dates = [];

  const cursor = new Date(startDate);
  cursor.setUTCHours(0, 0, 0, 0);

  const last = new Date(endDate);
  last.setUTCHours(0, 0, 0, 0);

  while (cursor <= last) {
    dates.push(toDateKey(cursor));

    cursor.setUTCDate(
      cursor.getUTCDate() + 1
    );
  }

  return dates;
};

/* ============================================================
   SUMMARY
============================================================ */

const getSummary = async ({
  startDate,
  endDate,
}) => {
  const dateFilter = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  const [
    totalUsers,
    activeUsers,
    disabledUsers,
    newUsers,
    adminActions,
    securityEvents,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments(
      ACTIVE_USER_FILTER
    ),

    User.countDocuments({
      status: "disabled",
    }),

    User.countDocuments(dateFilter),

    AuditLog.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }),

    SecurityEvent.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }),
  ]);

  return {
    totalUsers,
    newUsers,
    activeUsers,
    disabledUsers,
    adminActions,
    securityEvents,
  };
};

/* ============================================================
   USER GROWTH
============================================================ */

const getUserGrowth = async ({
  startDate,
  endDate,
}) => {
  const [
    baselineUsers,
    dailyUsers,
  ] = await Promise.all([
    User.countDocuments({
      createdAt: {
        $lt: startDate,
      },
    }),

    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
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
    ]),
  ]);

  const dailyMap = new Map(
    dailyUsers.map((item) => [
      item._id,
      item.count,
    ])
  );

  const dates = buildDateSeries(
    startDate,
    endDate
  );

  let runningTotal = baselineUsers;

  return dates.map((date) => {
    runningTotal +=
      dailyMap.get(date) || 0;

    return {
      date,
      users: runningTotal,
    };
  });
};

/* ============================================================
   ROLE DISTRIBUTION
============================================================ */

const getRoleDistribution = async () => {
  const roles = await User.aggregate([
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

  const roleMap = new Map(
    roles.map((item) => [
      item._id,
      item.count,
    ])
  );

  return [
    {
      name: "admin",
      value:
        roleMap.get("admin") || 0,
    },
    {
      name: "manager",
      value:
        roleMap.get("manager") || 0,
    },
    {
      name: "staff",
      value:
        roleMap.get("staff") || 0,
    },
  ];
};

/* ============================================================
   ACCOUNT STATUS
============================================================ */

const getAccountStatus = async () => {
  const [
    active,
    disabled,
  ] = await Promise.all([
    User.countDocuments(
      ACTIVE_USER_FILTER
    ),

    User.countDocuments({
      status: "disabled",
    }),
  ]);

  return [
    {
      name: "Active",
      value: active,
    },
    {
      name: "Disabled",
      value: disabled,
    },
  ];
};

/* ============================================================
   ADMINISTRATIVE ACTIVITY
============================================================ */

const getAdministrativeActivity = async ({
  startDate,
  endDate,
}) => {
  const rows =
    await AuditLog.aggregate([
      {
        $match: {
          action: {
            $in: REPORT_ACTIONS,
          },

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            action: "$action",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.date": 1,
        },
      },
    ]);

  const dates = buildDateSeries(
    startDate,
    endDate
  );

  const actionMap = new Map();

  for (const row of rows) {
    const key =
      `${row._id.date}:${row._id.action}`;

    actionMap.set(
      key,
      row.count
    );
  }

  return dates.map((date) => ({
    date,

    created:
      actionMap.get(
        `${date}:USER_CREATED`
      ) || 0,

    updated:
      actionMap.get(
        `${date}:USER_UPDATED`
      ) || 0,

    statusChanged:
      actionMap.get(
        `${date}:STATUS_CHANGED`
      ) || 0,

    roleChanged:
      actionMap.get(
        `${date}:ROLE_CHANGED`
      ) || 0,

    deleted:
      actionMap.get(
        `${date}:USER_DELETED`
      ) || 0,
  }));
};

/* ============================================================
   SECURITY / LOGIN ACTIVITY
============================================================ */

const getSecurityActivity = async ({
  startDate,
  endDate,
}) => {
  const rows =
    await SecurityEvent.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },

            type: "$type",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.date": 1,
        },
      },
    ]);

  const dates = buildDateSeries(
    startDate,
    endDate
  );

  const eventMap = new Map();

  for (const row of rows) {
    const key =
      `${row._id.date}:${row._id.type}`;

    eventMap.set(
      key,
      row.count
    );
  }

  return dates.map((date) => ({
    date,

    successfulLogins:
      eventMap.get(
        `${date}:LOGIN_SUCCESS`
      ) || 0,

    failedLogins:
      eventMap.get(
        `${date}:LOGIN_FAILED`
      ) || 0,

    suspiciousEvents:
      eventMap.get(
        `${date}:SUSPICIOUS_ACTIVITY`
      ) || 0,

    rateLimitTriggered:
      eventMap.get(
        `${date}:RATE_LIMIT_TRIGGERED`
      ) || 0,
  }));
};

/* ============================================================
   MAIN REPORT
============================================================ */

const getAdminReport = async ({
  from,
  to,
} = {}) => {
  const {
    startDate,
    endDate,
    rangeDays,
  } = getDateRange({
    from,
    to,
  });

  const [
    summary,
    userGrowth,
    roleDistribution,
    accountStatus,
    activityTimeline,
    securityTrend,
    securityEvents,
  ] = await Promise.all([
    getSummary({
      startDate,
      endDate,
    }),

    getUserGrowth({
      startDate,
      endDate,
    }),

    getRoleDistribution(),

    getAccountStatus(),

    getAdministrativeActivity({
      startDate,
      endDate,
    }),

    getSecurityActivity({
      startDate,
      endDate,
    }),

    getSecurityEvents({
        startDate,
        endDate,
    }),
  ]);

  return {
    period: {
      from: startDate,
      to: endDate,
      rangeDays,
    },

    summary,

    users: {
      growth: userGrowth,
      roles: roleDistribution,
      status: accountStatus,
    },

    activity: {
      timeline: activityTimeline,
    },

    security: {
      loginTrend: securityTrend,
      events: securityEvents,
    },

    system: {
      healthTrend: [],
    },

    generatedAt: new Date(),
  };
};

/* ============================================================
   DETAILED SECURITY EVENTS
============================================================ */

/* ============================================================
   DETAILED SECURITY EVENTS
============================================================ */

const getSecurityEvents = async ({
  startDate,
  endDate,
}) => {
  const events = await SecurityEvent.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({
      createdAt: -1,
    })
    .limit(100)
    .select(
      "_id type severity email ipAddress userAgent description metadata createdAt"
    )
    .lean();

  return events;
};

module.exports = {
  getAdminReport,
};