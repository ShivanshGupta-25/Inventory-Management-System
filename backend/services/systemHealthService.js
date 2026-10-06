const mongoose = require("mongoose");
const os = require("os");


const {
  getSecurityHealth,
} = require("./securityEventService");


/*
|--------------------------------------------------------------------------
| DATABASE HEALTH
|--------------------------------------------------------------------------
*/

const getDatabaseHealth = async () => {
  let database = {
    status: "critical",
    latency: null,
    state: "disconnected",
    databaseName: null,
    collections: null,
    dataSize: null,
    storageSize: null,
  };

  try {
    if (!mongoose.connection.db) {
      return database;
    }

    const start = Date.now();

    await mongoose.connection.db.admin().ping();

    const latency = Date.now() - start;

    const stats =
      await mongoose.connection.db.stats();

    const collections = stats.collections ?? 0;
    const dataSize = stats.dataSize ?? 0;
    const storageSize = stats.storageSize ?? 0;

    let status = "healthy";

    if (latency > 500) {
      status = "warning";
    }

    if (latency > 1500) {
      status = "critical";
    }

    database = {
      status,
      latency,
      state: mongoose.connection.readyState,
      databaseName: mongoose.connection.name,
      collections,
      dataSize,
      storageSize,
    };
  } catch (error) {
    console.error(
      "System health database check failed:",
      error
    );
  }

  return database;
};

/*
|--------------------------------------------------------------------------
| SERVER / INFRASTRUCTURE HEALTH
|--------------------------------------------------------------------------
*/

const getServerHealth = () => {
  const memoryUsage = process.memoryUsage();

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const memoryPercentage =
    totalMemory > 0
      ? Number(
          ((usedMemory / totalMemory) * 100).toFixed(2)
        )
      : 0;

  const loadAverage = os.loadavg();

  /*
   * Important:
   *
   * The API server has successfully reached this function,
   * therefore the server/process itself is operational.
   *
   * Resource pressure is tracked separately.
   */

  let resourceStatus = "healthy";

  if (memoryPercentage >= 80) {
    resourceStatus = "warning";
  }

  if (memoryPercentage >= 90) {
    resourceStatus = "critical";
  }

  return {
    /*
     * API/process availability
     */
    status: "healthy",

    /*
     * Infrastructure/resource condition
     */
    resources: {
      status: resourceStatus,

      memory: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        percentage: memoryPercentage,
      },

      cpu: {
        cores: os.cpus().length,
        loadAverage: loadAverage.map(
          (value) =>
            Number(value.toFixed(2))
        ),
      },
    },

    uptime: Math.floor(
      process.uptime()
    ),

    nodeVersion: process.version,

    environment:
      process.env.NODE_ENV ||
      "development",

    platform: process.platform,

    architecture: process.arch,

    /*
     * Node.js process memory
     */
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
  };
};

/*
|--------------------------------------------------------------------------
| SYSTEM HEALTH
|--------------------------------------------------------------------------
*/

const getSystemHealth = async () => {
  const checkedAt = new Date();

  const database =
    await getDatabaseHealth();

  const server =
    getServerHealth();

  const security =
    await getSecurityHealth();

  const authentication = {
    status: process.env.JWT_SECRET
        ? "healthy"
        : "critical",

    provider: "JWT",

    secretConfigured:
        Boolean(process.env.JWT_SECRET),
  };

  const rateLimiting = {
    status: "configured",
  };

  /*
   * Overall system status
   *
   * Resource pressure is intentionally NOT treated
   * as API availability.
   */

  let overallStatus = "healthy";

    const criticalServices = [
    database.status,
    server.status,
    authentication.status,
    ];

    /*
    |--------------------------------------------------------------------------
    | Core service health
    |--------------------------------------------------------------------------
    |
    | Actual service failures are critical.
    |
    */

    if (
    criticalServices.includes("critical")
    ) {
    overallStatus = "critical";
    } else if (
    criticalServices.includes("warning")
    ) {
    overallStatus = "warning";
    }

    /*
    |--------------------------------------------------------------------------
    | Infrastructure / resource health
    |--------------------------------------------------------------------------
    |
    | High resource usage should degrade the system,
    | but should not falsely report a service as unavailable.
    |
    */

    if (
        server.resources.status === "critical"
    ) {
        overallStatus = "critical";
    } else if (
        server.resources.status === "warning" &&
        overallStatus === "healthy"
    ) {
        overallStatus = "warning";
    }

  return {
    status: overallStatus,

    checkedAt,

    server,

    database,

    authentication,

    rateLimiting,

    security,
  };
};

module.exports = {
  getSystemHealth,
};