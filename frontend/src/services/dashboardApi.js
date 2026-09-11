import apiRequest from "./api";

/* =========================================================
   GET STAFF DASHBOARD
========================================================= */

export const getDashboard = async () => {
  try {
    const response = await apiRequest("/dashboard", {
      method: "GET",
    });

    if (!response.success) {
      throw new Error(
        response.message || "Failed to fetch dashboard data"
      );
    }

    return response.data;
  } catch (error) {
    console.error("Dashboard API Error:", error);
    throw error;
  }
};