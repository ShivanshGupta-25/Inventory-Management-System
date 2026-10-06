const { getSystemHealth } = require("../services/systemHealthService");

// "Refresh" clicks can bypass the 3-second cache, but not more than once per
// interval. Without this, a script or a stuck button could hammer MongoDB.
const FORCE_MIN_INTERVAL_MS = 2000;
let lastForcedAt = 0;

const wantsForce = (req) => {
  const value = String(req.query?.force ?? "").toLowerCase();
  return value === "true" || value === "1";
};

const systemHealth = async (req, res) => {
  try {
    let force = false;

    if (wantsForce(req)) {
      const now = Date.now();

      if (now - lastForcedAt >= FORCE_MIN_INTERVAL_MS) {
        lastForcedAt = now;
        force = true;
      }
    }

    const health = await getSystemHealth({ force });

    // Health data is only useful when it's current. Stop browsers and proxies
    // from serving a stored copy while the dashboard polls.
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // Always 200, even when the system is "critical". The request succeeded;
    // the dashboard needs the body to show what is wrong, and a 5xx would hide it.
    return res.status(200).json({
      success: true,
      health,
    });
  } catch (error) {
    console.error("System health controller error:", error);

    res.set("Cache-Control", "no-store");

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve system health.",
    });
  }
};

module.exports = {
  systemHealth,
};