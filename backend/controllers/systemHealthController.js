const {
  getSystemHealth,
} = require("../services/systemHealthService");

const systemHealth = async (req, res) => {
  try {
    const health = await getSystemHealth();

    return res.status(200).json({
      success: true,
      health,
    });
  } catch (error) {
    console.error(
      "System health controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve system health.",
    });
  }
};

module.exports = {
  systemHealth,
};