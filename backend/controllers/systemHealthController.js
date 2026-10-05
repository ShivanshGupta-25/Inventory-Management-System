const {
  getSystemHealth,
} = require("../services/systemHealthService");

const systemHealth = async (req, res) => {
  try {
    const health = await getSystemHealth();

    const httpStatus =
      health.status === "critical"
        ? 503
        : 200;

    return res.status(httpStatus).json({
      success: health.status !== "critical",
      health,
    });
  } catch (error) {
    console.error(
      "System health controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve system health.",
    });
  }
};

module.exports = {
  systemHealth,
};