const mongoose = require("mongoose");

const getSystemHealth = async () => {
  const checkedAt = new Date();

  // ------------------------------------------------------------
  // DATABASE HEALTH
  // ------------------------------------------------------------

  let database = {
    status: "critical",
    latency: null,
    state: "disconnected",
    databaseName: null,
  };

  try {
    const start = Date.now();

    // Ping MongoDB
    await mongoose.connection.db.admin().ping();

    const latency = Date.now() - start;

    database = {
      status: "healthy",
      latency,
      state: mongoose.connection.readyState,
      databaseName: mongoose.connection.name,
    };
  } catch (error) {
    console.error(
      "System health database check failed:",
      error
    );
  }

  // ------------------------------------------------------------
  // SERVER HEALTH
  // ------------------------------------------------------------

  const memoryUsage = process.memoryUsage();

  const server = {
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    environment:
      process.env.NODE_ENV || "development",
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
  };

  // ------------------------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------------------------

  /*
   * Authentication is part of the same API process.
   *
   * A deeper authentication probe can be added later.
   * For now, the API being operational means the auth
   * service is available.
   */
  const authentication = {
    status: "healthy",
    provider: "JWT",
  };

  // ------------------------------------------------------------
  // RATE LIMITING
  // ------------------------------------------------------------

  /*
   * Your application already uses rateLimit middleware.
   *
   * At this stage we report whether the protection is
   * configured rather than inventing a request count.
   */
  const rateLimiting = {
    status: "configured",
  };

  // ------------------------------------------------------------
  // OVERALL STATUS
  // ------------------------------------------------------------

  const overallStatus =
    database.status === "critical"
      ? "critical"
      : "healthy";

  // ------------------------------------------------------------
  // RETURN HEALTH DATA
  // ------------------------------------------------------------

  return {
    status: overallStatus,

    checkedAt,

    server,

    database,

    authentication,

    rateLimiting,
  };
};

module.exports = {
  getSystemHealth,
};