const API_BASE_URL = "http://localhost:5000/api/analytics";

export const getAnalyticsOverview = async (period = "30d") => {
  const response = await fetch(
    `${API_BASE_URL}/overview?period=${period}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch analytics overview"
    );
  }

  return result;
};

export const getSalesTrend = async (period = "30d") => {
  const response = await fetch(
    `${API_BASE_URL}/sales-trend?period=${period}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch sales trend"
    );
  }

  return result;
};

export const getProductPerformance = async (period = "30d") => {
  const response = await fetch(
    `${API_BASE_URL}/products?period=${period}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to fetch product performance"
    );
  }

  return result;
};

export const getCategoryPerformance = async (period = "30d") => {
  const response = await fetch(
    `${API_BASE_URL}/categories?period=${period}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to fetch category performance"
    );
  }

  return result;
};

export const getInventoryAnalytics = async () => {
  const response = await fetch(
    `${API_BASE_URL}/inventory`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to fetch inventory analytics"
    );
  }

  return result;
};