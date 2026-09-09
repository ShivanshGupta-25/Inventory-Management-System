import axios from "axios";

const API_URL =
  "http://localhost:5000/api";

export const getPurchaseOrders = async (
  params = {}
) => {
  const response = await axios.get(
    `${API_URL}/purchase-orders`,
    {
      params,
    }
  );

  return response.data;
};

export const getPurchaseOrderById =
  async (id) => {
    const response = await axios.get(
      `${API_URL}/purchase-orders/${id}`
    );

    return response.data;
  };

export const createPurchaseOrder =
  async (data) => {
    const response = await axios.post(
      `${API_URL}/purchase-orders`,
      data
    );

    return response.data;
  };

export const confirmPurchaseOrder =
  async (id) => {
    const response = await axios.post(
      `${API_URL}/purchase-orders/${id}/confirm`
    );

    return response.data;
  };

export const receivePurchaseOrder =
  async (id, data) => {
    const response = await axios.post(
      `${API_URL}/purchase-orders/${id}/receive`,
      data
    );

    return response.data;
  };

export const cancelPurchaseOrder =
  async (id) => {
    const response = await axios.post(
      `${API_URL}/purchase-orders/${id}/cancel`
    );

    return response.data;
  };

export const updatePurchaseOrder = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/purchase-orders/${id}`,
    data
  );

  return response.data;
};