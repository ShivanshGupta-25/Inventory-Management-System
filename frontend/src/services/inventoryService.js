import axios from "axios";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const inventoryApi = axios.create({
  baseURL: `${API_URL}/inventory`,
});

/* =========================================================
   ATTACH AUTH TOKEN
========================================================= */

inventoryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   GET INVENTORY
========================================================= */

export const getInventory = async (params = {}) => {
  const response = await inventoryApi.get("/", {
    params,
  });

  return response.data;
};

/* =========================================================
   GET INVENTORY STATS
========================================================= */

export const getInventoryStats = async () => {
  const response = await inventoryApi.get("/stats");

  return response.data;
};

/* =========================================================
   GET SINGLE INVENTORY
========================================================= */

export const getInventoryById = async (id) => {
  const response = await inventoryApi.get(`/${id}`);

  return response.data;
};

/* =========================================================
   CREATE INVENTORY
   Manager/Admin operation
========================================================= */

export const createInventory = async (data) => {
  const response = await inventoryApi.post("/", data);

  return response.data;
};

/* =========================================================
   UPDATE INVENTORY
   Manager/Admin operation
========================================================= */

export const updateInventory = async (id, data) => {
  const response = await inventoryApi.put(`/${id}`, data);

  return response.data;
};

/* =========================================================
   DELETE INVENTORY
   Manager/Admin operation
========================================================= */

export const deleteInventory = async (id) => {
  const response = await inventoryApi.delete(`/${id}`);

  return response.data;
};

/* =========================================================
   GENERIC STOCK ADJUSTMENT
========================================================= */

export const adjustStock = async (id, data) => {
  const response = await inventoryApi.post(
    `/${id}/adjust`,
    data
  );

  return response.data;
};

/* =========================================================
   STOCK IN
========================================================= */

export const stockIn = async (
  id,
  quantity,
  reason
) => {
  return adjustStock(id, {
    type: "IN",
    quantity,
    reason,
  });
};

/* =========================================================
   STOCK OUT
========================================================= */

export const stockOut = async (
  id,
  quantity,
  reason
) => {
  return adjustStock(id, {
    type: "OUT",
    quantity,
    reason,
  });
};

/* =========================================================
   STOCK MOVEMENTS
========================================================= */

export const getStockMovements = async (
  inventoryId
) => {
  const response = await axios.get(
    `${API_URL}/stock-movements/${inventoryId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          "token"
        )}`,
      },
    }
  );

  return response.data;
};