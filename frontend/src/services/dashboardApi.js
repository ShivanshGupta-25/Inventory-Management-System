const API_BASE_URL = "http://localhost:5000/api";

export const getDashboard = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to fetch dashboard data"
      );
    }

    return data.data;
  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error
    );

    throw error;
  }
};