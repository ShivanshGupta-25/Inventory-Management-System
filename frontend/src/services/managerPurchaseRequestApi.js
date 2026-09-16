
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthToken = () => {
  const tokenKeys = [
    "token",
    "authToken",
    "accessToken",
  ];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const request = async (
  method,
  endpoint,
  data = null,
  params = null
) => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      params,
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(
      `Manager Purchase Request API ${method} ${endpoint} failed:`,
      error
    );

    console.error(
      "Backend error response:",
      error?.response?.data
    );

    throw error;
  }
};

export const getManagerPurchaseRequests = async (
  params = {}
) => {
  return request(
    "GET",
    "/purchase-orders/manager/requests",
    null,
    params
  );
};

export const approvePurchaseRequest = async (
  id,
  managerNote = ""
) => {
  return request(
    "POST",
    `/purchase-orders/${id}/approve`,
    { managerNote }
  );
};

export const rejectPurchaseRequest = async (
  id,
  managerNote
) => {
  return request(
    "POST",
    `/purchase-orders/${id}/reject`,
    { managerNote }
  );
};

export const createPurchaseOrderFromRequest = async (
  id,
  data
) => {
  return request(
    "POST",
    `/purchase-orders/${id}/create-purchase-order`,
    data
  );
};