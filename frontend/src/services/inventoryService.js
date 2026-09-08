import axios from "axios";

const API_URL =
  "http://localhost:5000/api";

export const getInventory = async (
  params = {}
) => {
  const response = await axios.get(
    `${API_URL}/inventory`,
    {
      params,
    }
  );

  return response.data;
};

export const getInventoryStats = async () => {
  const response = await axios.get(
    `${API_URL}/inventory/stats`
  );

  return response.data;
};

export const getInventoryById = async (id) => {
  const response = await axios.get(
    `${API_URL}/inventory/${id}`
  );

  return response.data;
};

export const createInventory = async (data) => {
  const response = await axios.post(
    `${API_URL}/inventory`,
    data
  );

  return response.data;
};

export const updateInventory = async (
  id,
  data
) => {
  const response = await axios.put(
    `${API_URL}/inventory/${id}`,
    data
  );

  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await axios.delete(
    `${API_URL}/inventory/${id}`
  );

  return response.data;
};

export const adjustStock = async (
  id,
  data
) => {
  const response = await axios.post(
    `${API_URL}/inventory/${id}/adjust`,
    data
  );

  return response.data;
};

export const getStockMovements = async (
  inventoryId
) => {
  const response = await axios.get(
    `${API_URL}/stock-movements/${inventoryId}`
  );

  return response.data;
};