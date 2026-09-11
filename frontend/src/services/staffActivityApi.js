import apiRequest from "./api";

/* =========================================================
   ALERTS
========================================================= */

export const getStaffAlerts = async () => {
  const response = await apiRequest(
    "/dashboard/alerts",
    {
      method: "GET",
    }
  );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to fetch alerts"
    );
  }

  return response.data;
};

/* =========================================================
   STOCK HISTORY
========================================================= */

export const getStockHistory = async (
  params = {}
) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(key, value);
      }
    }
  );

  const queryString =
    query.toString();

  const response = await apiRequest(
    `/dashboard/stock-history${
      queryString
        ? `?${queryString}`
        : ""
    }`,
    {
      method: "GET",
    }
  );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Failed to fetch stock history"
    );
  }

  return response.data;
};