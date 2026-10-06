const {
  getAdminReport,
} = require("../services/adminReportsService");

const getAdminReports = async (
  req,
  res
) => {
  try {
    const report =
      await getAdminReport({
        from: req.query.from,
        to: req.query.to,
      });

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(
      "Admin reports error:",
      error
    );

    return res.status(
      error.message?.includes("Report") ||
        error.message?.includes("Invalid")
        ? 400
        : 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to generate admin report.",
    });
  }
};

module.exports = {
  getAdminReports,
};