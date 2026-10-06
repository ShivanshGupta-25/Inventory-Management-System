const SecurityEvent = require("../models/SecurityEvent");

const normalizeEmail = (email) =>
  typeof email === "string"
    ? email.trim().toLowerCase()
    : null;

/*
|--------------------------------------------------------------------------
| RECORD FAILED LOGIN
|--------------------------------------------------------------------------
*/

const recordFailedLogin = async ({
  email,
  ipAddress,
  userAgent,
  reason = "Invalid credentials",
}) => {
  return SecurityEvent.create({
    type: "LOGIN_FAILED",
    severity: "warning",

    email: normalizeEmail(email),

    ipAddress:
      ipAddress ||
      null,

    userAgent:
      userAgent ||
      null,

    description:
      "Failed login attempt",

    metadata: {
      reason,
    },
  });
};

/*
|--------------------------------------------------------------------------
| RECORD SECURITY EVENT
|--------------------------------------------------------------------------
*/

const recordSecurityEvent = async ({
  type,
  severity = "info",
  user = null,
  email = null,
  ipAddress = null,
  userAgent = null,
  description,
  metadata = {},
}) => {
  return SecurityEvent.create({
    type,
    severity,
    user,
    email:
      normalizeEmail(email),
    ipAddress,
    userAgent,
    description,
    metadata,
  });
};

/*
|--------------------------------------------------------------------------
| SECURITY HEALTH
|--------------------------------------------------------------------------
*/

const getSecurityHealth = async () => {
  const now = new Date();

  const last24Hours = new Date(
    now.getTime() -
      24 * 60 * 60 * 1000
  );

  const last15Minutes = new Date(
    now.getTime() -
      15 * 60 * 1000
  );

  const [
    failedLogins,
    suspiciousIpGroups,
    recentEvents,
  ] = await Promise.all([
    /*
     * Failed login attempts during
     * the last 24 hours.
     */
    SecurityEvent.countDocuments({
      type: "LOGIN_FAILED",
      createdAt: {
        $gte: last24Hours,
      },
    }),

    /*
     * An IP producing five or more
     * failed logins within 15 minutes
     * is treated as suspicious.
     */
    SecurityEvent.aggregate([
      {
        $match: {
          type: "LOGIN_FAILED",

          createdAt: {
            $gte: last15Minutes,
          },

          ipAddress: {
            $nin: [
              null,
              "",
            ],
          },
        },
      },

      {
        $group: {
          _id: "$ipAddress",

          attempts: {
            $sum: 1,
          },
        },
      },

      {
        $match: {
          attempts: {
            $gte: 5,
          },
        },
      },
    ]),

    /*
     * Recent security events for
     * the monitoring panel.
     */
    SecurityEvent.find({
      createdAt: {
        $gte: last24Hours,
      },
    })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .select(
        "type severity email ipAddress description createdAt"
      )
      .lean(),
  ]);

  const suspiciousEvents =
    suspiciousIpGroups.length;

  let status = "healthy";

  if (failedLogins >= 10) {
    status = "warning";
  }

  if (suspiciousEvents > 0) {
    status = "warning";
  }

  if (
    failedLogins >= 25 &&
    suspiciousEvents > 0
  ) {
    status = "critical";
  }

  return {
    status,

    failedLogins,

    suspiciousEvents,

    window: {
      failedLoginWindow: "24h",
      suspiciousActivityWindow: "15m",
    },

    recentEvents,
  };
};

module.exports = {
  recordFailedLogin,
  recordSecurityEvent,
  getSecurityHealth,
};