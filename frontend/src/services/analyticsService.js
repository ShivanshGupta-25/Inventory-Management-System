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

export const getDemandHistory = async (
  period = "30d",
  productId = ""
) => {
  const params = new URLSearchParams();

  params.append("period", period);

  if (productId) {
    params.append("productId", productId);
  }

  const response = await fetch(
    `${API_BASE_URL}/demand-history?${params.toString()}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Failed to fetch demand history"
    );
  }

  return result;
};

export const getDemandForecast = async (
  productId,
  historyPeriod = "30d",
  forecastDays = 7
) => {
  const params = new URLSearchParams();

  params.append("productId", productId);
  params.append("historyPeriod", historyPeriod);
  params.append("forecastDays", forecastDays);

  const response = await fetch(
    `${API_BASE_URL}/demand-forecast?${params.toString()}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to fetch demand forecast"
    );
  }

  return result;
};