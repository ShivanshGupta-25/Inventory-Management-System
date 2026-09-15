import axios from "axios";

const API_URL = "http://localhost:5000/api";

/*
 * Get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

/*
 * GET /api/purchase-orders
 */
export const getPurchaseOrders = async (
  params = {}
) => {
  const response = await axios.get(
    `${API_URL}/purchase-orders`,
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/*
 * GET /api/purchase-orders/:id
 */
export const getPurchaseOrderById = async (
  id
) => {
  const response = await axios.get(
    `${API_URL}/purchase-orders/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/*
 * POST /api/purchase-orders
 */
export const createPurchaseOrder = async (
  data
) => {
  const response = await axios.post(
    `${API_URL}/purchase-orders`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/*
 * POST /api/purchase-orders/:id/confirm
 */
export const confirmPurchaseOrder = async (
  id
) => {
  const response = await axios.post(
    `${API_URL}/purchase-orders/${id}/confirm`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/*
 * POST /api/purchase-orders/:id/receive
 */
export const receivePurchaseOrder = async (
  id,
  data
) => {
  const response = await axios.post(
    `${API_URL}/purchase-orders/${id}/receive`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/*
 * POST /api/purchase-orders/:id/cancel
 */
export const cancelPurchaseOrder = async (
  id
) => {
  const response = await axios.post(
    `${API_URL}/purchase-orders/${id}/cancel`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

/*
 * PUT /api/purchase-orders/:id
 */
export const updatePurchaseOrder = async (
  id,
  data
) => {
  const response = await axios.put(
    `${API_URL}/purchase-orders/${id}`,
    data,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};